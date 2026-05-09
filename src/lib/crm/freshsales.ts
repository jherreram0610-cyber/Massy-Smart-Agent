import axios from "axios";
import type { CRMAdapter, CRMLead, CRMAppointment, CRMAdvisorSlot } from "./adapter";

function freshsalesClient() {
  const subdomain = process.env.FRESHSALES_SUBDOMAIN!;
  const apiKey = process.env.FRESHSALES_API_KEY!;

  return axios.create({
    baseURL: `https://${subdomain}.myfreshworks.com/crm/sales/api`,
    headers: {
      Authorization: `Token token=${apiKey}`,
      "Content-Type": "application/json",
    },
  });
}

export const freshsalesAdapter: CRMAdapter = {
  async createLead(lead: CRMLead): Promise<string> {
    const client = freshsalesClient();
    const res = await client.post("/leads", {
      lead: {
        first_name: lead.name?.split(" ")[0] ?? "Sin",
        last_name: lead.name?.split(" ").slice(1).join(" ") || "Nombre",
        mobile_number: lead.phone,
        email: lead.email,
        lead_source_id: mapChannelToSourceId(lead.channel),
        custom_field: {
          cf_vehicle_interest: lead.vehicleInterest,
          cf_budget: lead.budget,
          cf_ai_score: lead.score,
          cf_temperature: lead.temperature,
          cf_payment_type: lead.paymentType,
        },
        note: lead.notes,
      },
    });
    return String(res.data.lead.id);
  },

  async updateLead(externalId: string, lead: Partial<CRMLead>): Promise<void> {
    const client = freshsalesClient();
    await client.put(`/leads/${externalId}`, {
      lead: {
        ...(lead.phone ? { mobile_number: lead.phone } : {}),
        ...(lead.email ? { email: lead.email } : {}),
        custom_field: {
          ...(lead.vehicleInterest ? { cf_vehicle_interest: lead.vehicleInterest } : {}),
          ...(lead.score != null ? { cf_ai_score: lead.score } : {}),
          ...(lead.temperature ? { cf_temperature: lead.temperature } : {}),
        },
      },
    });
  },

  async createAppointment(appt: CRMAppointment): Promise<string> {
    const client = freshsalesClient();
    const res = await client.post("/appointments", {
      appointment: {
        title: `Test Drive – ${appt.vehicleInterest ?? "Smart"}`,
        from_date: appt.scheduledAt.toISOString(),
        end_date: new Date(appt.scheduledAt.getTime() + 60 * 60 * 1000).toISOString(),
        description: appt.notes,
        targetable_id: appt.leadExternalId,
        targetable_type: "Lead",
        creater_id: appt.advisorExternalId,
      },
    });
    return String(res.data.appointment.id);
  },

  async getAdvisorSlots(advisorExternalId: string, fromDate: Date, toDate: Date): Promise<CRMAdvisorSlot[]> {
    const client = freshsalesClient();
    const res = await client.get("/appointments", {
      params: {
        filter: "upcoming",
        user_id: advisorExternalId,
        from_date: fromDate.toISOString().split("T")[0],
        end_date: toDate.toISOString().split("T")[0],
      },
    });

    const appointments = res.data.appointments ?? [];
    return appointments.map((a: { id: string; from_date: string; end_date: string }) => ({
      advisorExternalId,
      startTime: new Date(a.from_date),
      endTime: new Date(a.end_date),
      sourceId: String(a.id),
    }));
  },
};

function mapChannelToSourceId(channel?: string): number {
  const map: Record<string, number> = {
    web: 1,
    whatsapp: 2,
    facebook: 3,
    instagram: 4,
    mercadolibre: 5,
  };
  return map[channel ?? "web"] ?? 1;
}
