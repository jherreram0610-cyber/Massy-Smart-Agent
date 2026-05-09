export interface CRMLead {
  externalId?: string;
  name?: string;
  phone?: string;
  email?: string;
  vehicleInterest?: string;
  budget?: string;
  paymentType?: string;
  urgency?: string;
  temperature?: string;
  score?: number;
  channel?: string;
  notes?: string;
}

export interface CRMAppointment {
  leadExternalId: string;
  advisorExternalId: string;
  scheduledAt: Date;
  vehicleInterest?: string;
  notes?: string;
}

export interface CRMAdvisorSlot {
  advisorExternalId: string;
  startTime: Date;
  endTime: Date;
  sourceId?: string;
}

export interface CRMAdapter {
  createLead(lead: CRMLead): Promise<string>;
  updateLead(externalId: string, lead: Partial<CRMLead>): Promise<void>;
  createAppointment(appt: CRMAppointment): Promise<string>;
  getAdvisorSlots(advisorExternalId: string, fromDate: Date, toDate: Date): Promise<CRMAdvisorSlot[]>;
}
