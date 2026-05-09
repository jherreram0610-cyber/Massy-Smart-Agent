import { db } from "@/lib/db";
import { getCRMAdapter } from "@/lib/crm";

export async function syncAdvisorSlots(): Promise<{ synced: number; errors: number }> {
  const crm = getCRMAdapter();
  if (!crm) return { synced: 0, errors: 0 };

  const advisors = await db.advisor.findMany({
    where: { isActive: true, crmSalesforceId: { not: null } },
    select: { id: true, crmSalesforceId: true, crmFreshsalesId: true },
  });

  const fromDate = new Date();
  const toDate = new Date();
  toDate.setDate(toDate.getDate() + 14); // Sync next 14 days

  let synced = 0;
  let errors = 0;

  for (const advisor of advisors) {
    const externalId = advisor.crmSalesforceId ?? advisor.crmFreshsalesId;
    if (!externalId) continue;

    try {
      const slots = await crm.getAdvisorSlots(externalId, fromDate, toDate);

      for (const slot of slots) {
        if (!slot.sourceId) continue;

        // Upsert based on sourceId to avoid duplicates
        await db.advisorSlot.upsert({
          where: {
            // We need a unique constraint on sourceId — use findFirst + create/update pattern
            id: await findSlotIdBySourceId(slot.sourceId) ?? "non-existent-id",
          },
          create: {
            advisorId: advisor.id,
            startsAt: slot.startTime,
            endsAt: slot.endTime,
            isAvailable: true,
            sourceType: "crm",
            sourceId: slot.sourceId,
          },
          update: {
            startsAt: slot.startTime,
            endsAt: slot.endTime,
          },
        });
        synced++;
      }
    } catch (err) {
      console.error(`[calendar sync] Error syncing advisor ${advisor.id}:`, err);
      errors++;
    }
  }

  return { synced, errors };
}

async function findSlotIdBySourceId(sourceId: string): Promise<string | null> {
  const slot = await db.advisorSlot.findFirst({ where: { sourceId } });
  return slot?.id ?? null;
}

export async function pushAppointmentToCRM(appointmentId: string): Promise<void> {
  const crm = getCRMAdapter();
  if (!crm) return;

  const appt = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      lead: true,
      advisor: true,
    },
  });

  if (!appt) return;

  const leadExternalId = appt.lead.crmSalesforceId ?? appt.lead.crmFreshsalesId;
  const advisorExternalId = appt.advisor.crmSalesforceId ?? appt.advisor.crmFreshsalesId;

  if (!leadExternalId || !advisorExternalId) return;

  try {
    const crmApptId = await crm.createAppointment({
      leadExternalId,
      advisorExternalId,
      scheduledAt: appt.scheduledAt,
      vehicleInterest: appt.vehicleInterest ?? undefined,
      notes: appt.notes ?? undefined,
    });

    await db.appointment.update({
      where: { id: appointmentId },
      data: { crmAppointmentId: crmApptId },
    });
  } catch (err) {
    console.error(`[calendar sync] Error pushing appointment ${appointmentId} to CRM:`, err);
  }
}

export async function pushLeadToCRM(leadId: string): Promise<void> {
  const crm = getCRMAdapter();
  if (!crm) return;

  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;

  // Already synced
  if (lead.crmSalesforceId || lead.crmFreshsalesId) {
    await crm.updateLead(lead.crmSalesforceId ?? lead.crmFreshsalesId!, {
      name: lead.name ?? undefined,
      phone: lead.phone ?? undefined,
      email: lead.email ?? undefined,
      vehicleInterest: lead.vehicleInterest ?? undefined,
      budget: lead.budget ?? undefined,
      paymentType: lead.paymentType ?? undefined,
      urgency: lead.urgency ?? undefined,
      temperature: lead.temperature,
      score: lead.score,
    });
    return;
  }

  try {
    const conversation = await db.conversation.findUnique({ where: { id: lead.conversationId } });
    const crmId = await crm.createLead({
      name: lead.name ?? undefined,
      phone: lead.phone ?? undefined,
      email: lead.email ?? undefined,
      vehicleInterest: lead.vehicleInterest ?? undefined,
      budget: lead.budget ?? undefined,
      paymentType: lead.paymentType ?? undefined,
      urgency: lead.urgency ?? undefined,
      temperature: lead.temperature,
      score: lead.score,
      channel: conversation?.channel,
      notes: lead.aiSummary ?? undefined,
    });

    // Store CRM ID on lead (use salesforce field as default)
    await db.lead.update({
      where: { id: leadId },
      data: { crmSalesforceId: crmId },
    });
  } catch (err) {
    console.error(`[calendar sync] Error pushing lead ${leadId} to CRM:`, err);
  }
}
