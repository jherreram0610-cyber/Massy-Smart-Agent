export interface CRMLeadData {
  name?: string;
  phone?: string;
  email?: string;
  vehicleInterest?: string;
  temperature?: string;
  score?: number;
  channel?: string;
  notes?: string;
}

export interface CRMAppointmentData {
  leadName?: string;
  leadPhone?: string;
  advisorName?: string;
  vehicleInterest?: string;
  startsAt: Date;
  endsAt: Date;
  notes?: string;
}

export interface CRMSlotData {
  sourceId: string;
  startsAt: Date;
  endsAt: Date;
}

export interface CRMAdapter {
  createLead(data: CRMLeadData): Promise<string>;
  updateLead(crmId: string, data: Partial<CRMLeadData>): Promise<void>;
  createAppointment(data: CRMAppointmentData): Promise<string>;
  getAdvisorSlots(advisorCrmId: string, from: Date, to: Date): Promise<CRMSlotData[]>;
}
