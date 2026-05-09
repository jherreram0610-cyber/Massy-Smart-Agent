import * as jsforce from "jsforce";
import type { CRMAdapter, CRMLead, CRMAppointment, CRMAdvisorSlot } from "./adapter";

let sfConn: InstanceType<typeof jsforce.Connection> | null = null;

async function getConnection(): Promise<InstanceType<typeof jsforce.Connection>> {
  if (sfConn) return sfConn;

  sfConn = new jsforce.Connection({
    oauth2: {
      clientId: process.env.SALESFORCE_CLIENT_ID!,
      clientSecret: process.env.SALESFORCE_CLIENT_SECRET!,
      loginUrl: process.env.SALESFORCE_INSTANCE_URL ?? "https://login.salesforce.com",
    },
  });

  await sfConn.login(
    process.env.SALESFORCE_USERNAME!,
    process.env.SALESFORCE_PASSWORD! + (process.env.SALESFORCE_SECURITY_TOKEN ?? "")
  );

  return sfConn;
}

export const salesforceAdapter: CRMAdapter = {
  async createLead(lead: CRMLead): Promise<string> {
    const conn = await getConnection();
    const result = await conn.sobject("Lead").create({
      LastName: lead.name ?? "Sin nombre",
      FirstName: "",
      Phone: lead.phone,
      Email: lead.email,
      Company: "Prospecto Massy Motors Smart",
      LeadSource: lead.channel ?? "Web",
      Description: lead.notes,
      Status: "Open - Not Contacted",
      Rating: mapTemperatureToRating(lead.temperature),
      Smart_Vehicle_Interest__c: lead.vehicleInterest,
      Smart_Budget__c: lead.budget,
      Smart_Score__c: lead.score,
    });
    return (result as { id: string }).id;
  },

  async updateLead(externalId: string, lead: Partial<CRMLead>): Promise<void> {
    const conn = await getConnection();
    await conn.sobject("Lead").update({
      Id: externalId,
      ...(lead.name ? { LastName: lead.name } : {}),
      ...(lead.phone ? { Phone: lead.phone } : {}),
      ...(lead.email ? { Email: lead.email } : {}),
      ...(lead.temperature ? { Rating: mapTemperatureToRating(lead.temperature) } : {}),
      ...(lead.score != null ? { Smart_Score__c: lead.score } : {}),
      ...(lead.vehicleInterest ? { Smart_Vehicle_Interest__c: lead.vehicleInterest } : {}),
    });
  },

  async createAppointment(appt: CRMAppointment): Promise<string> {
    const conn = await getConnection();
    const result = await conn.sobject("Event").create({
      Subject: `Test Drive – ${appt.vehicleInterest ?? "Smart"}`,
      ActivityDateTime: appt.scheduledAt.toISOString(),
      DurationInMinutes: 60,
      Description: appt.notes,
      WhoId: appt.leadExternalId,
      OwnerId: appt.advisorExternalId,
    });
    return (result as { id: string }).id;
  },

  async getAdvisorSlots(advisorExternalId: string, fromDate: Date, toDate: Date): Promise<CRMAdvisorSlot[]> {
    const conn = await getConnection();
    const result = await conn.query<{
      Id: string;
      OwnerId: string;
      ActivityDateTime: string;
      DurationInMinutes: number;
    }>(
      `SELECT Id, OwnerId, ActivityDateTime, DurationInMinutes
       FROM Event
       WHERE OwnerId = '${advisorExternalId}'
       AND ActivityDateTime >= ${fromDate.toISOString()}
       AND ActivityDateTime <= ${toDate.toISOString()}
       AND IsAllDayEvent = false`
    );

    return result.records.map((r: { Id: string; OwnerId: string; ActivityDateTime: string; DurationInMinutes: number }) => {
      const start = new Date(r.ActivityDateTime);
      const end = new Date(start.getTime() + r.DurationInMinutes * 60000);
      return {
        advisorExternalId: r.OwnerId,
        startTime: start,
        endTime: end,
        sourceId: r.Id,
      };
    });
  },
};

function mapTemperatureToRating(temp?: string): string {
  if (temp === "hot") return "Hot";
  if (temp === "warm") return "Warm";
  return "Cold";
}
