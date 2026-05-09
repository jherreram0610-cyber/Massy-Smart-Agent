import type { CRMAdapter } from "./adapter";
import { salesforceAdapter } from "./salesforce";
import { freshsalesAdapter } from "./freshsales";

export function getCRMAdapter(): CRMAdapter | null {
  if (process.env.SALESFORCE_CLIENT_ID && process.env.SALESFORCE_USERNAME) {
    return salesforceAdapter;
  }
  if (process.env.FRESHSALES_API_KEY && process.env.FRESHSALES_SUBDOMAIN) {
    return freshsalesAdapter;
  }
  return null;
}

export type { CRMAdapter, CRMLead, CRMAppointment, CRMAdvisorSlot } from "./adapter";
