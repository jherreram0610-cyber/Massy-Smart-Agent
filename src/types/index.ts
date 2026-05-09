import type {
  Advisor,
  AdvisorSlot,
  Appointment,
  Conversation,
  Lead,
  Message,
  Notification,
  Vehicle,
  FinancingPlan,
  Promotion,
  DealershipInfo,
  Channel,
  Temperature,
  AdvisorRole,
  AppointmentStatus,
  NotificationType,
  ConversationStatus,
  MessageRole,
  PaymentType,
  Urgency,
} from "@prisma/client";

export type {
  Advisor,
  AdvisorSlot,
  Appointment,
  Conversation,
  Lead,
  Message,
  Notification,
  Vehicle,
  FinancingPlan,
  Promotion,
  DealershipInfo,
  Channel,
  Temperature,
  AdvisorRole,
  AppointmentStatus,
  NotificationType,
  ConversationStatus,
  MessageRole,
  PaymentType,
  Urgency,
};

export type LeadWithConversation = Lead & {
  conversation: Conversation;
  appointments: Appointment[];
  advisor: Advisor | null;
};

export type ConversationWithMessages = Conversation & {
  messages: Message[];
  lead: Lead | null;
};

export type AppointmentWithDetails = Appointment & {
  lead: Lead;
  advisor: Advisor;
  slot: AdvisorSlot;
};

export type AdvisorWithStats = Advisor & {
  _count: {
    leads: number;
    appointments: number;
  };
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface AgentMessageRequest {
  message: string;
  channel: string;
  conversationId?: string;
  metadata?: Record<string, string>;
}

export interface AgentMessageResponse {
  message: string;
  conversationId: string;
  leadScore?: LeadScore;
  appointmentBooked: boolean;
  escalated: boolean;
}

export interface LeadScore {
  score: number;
  temperature: Temperature;
}

export interface KnowledgeBase {
  vehicles: Vehicle[];
  financingPlans: FinancingPlan[];
  promotions: Promotion[];
  dealershipInfo: Record<string, string>;
}
