import type Anthropic from "@anthropic-ai/sdk";

export const agentTools: Anthropic.Tool[] = [
  {
    name: "update_lead_data",
    description:
      "Actualiza los datos del lead con información recopilada durante la conversación. Úsalo cuando el cliente comparta su nombre, teléfono, interés en un vehículo, presupuesto, forma de pago o urgencia.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Nombre completo del cliente" },
        phone: { type: "string", description: "Número de teléfono del cliente" },
        email: { type: "string", description: "Correo electrónico del cliente" },
        vehicleInterest: {
          type: "string",
          enum: ["smart_1", "smart_3", "smart_3_brabus", "general"],
          description: "Vehículo de interés",
        },
        budget: {
          type: "number",
          description: "Presupuesto del cliente en pesos colombianos",
        },
        paymentType: {
          type: "string",
          enum: ["cash", "financing", "unknown"],
          description: "Forma de pago preferida",
        },
        urgency: {
          type: "string",
          enum: ["this_week", "this_month", "three_months", "exploring"],
          description: "Urgencia de compra del cliente",
        },
        hasTradeIn: {
          type: "boolean",
          description: "Si el cliente tiene un vehículo para entregar a cambio",
        },
        notes: {
          type: "string",
          description: "Notas adicionales relevantes sobre el cliente o la conversación",
        },
      },
      required: [],
    },
  },
  {
    name: "get_available_slots",
    description:
      "Obtiene los horarios disponibles para agendar un test drive. Úsalo cuando el cliente quiera ver cuándo puede venir a la concesionaria.",
    input_schema: {
      type: "object" as const,
      properties: {
        advisorId: {
          type: "string",
          description: "ID del asesor específico (opcional, si el cliente prefiere uno)",
        },
        daysAhead: {
          type: "number",
          description: "Cuántos días hacia adelante buscar disponibilidad (default: 7)",
        },
      },
      required: [],
    },
  },
  {
    name: "book_appointment",
    description:
      "Agenda un test drive para el cliente. Úsalo solo cuando el cliente haya confirmado explícitamente que quiere agendar en un horario específico.",
    input_schema: {
      type: "object" as const,
      properties: {
        slotId: {
          type: "string",
          description: "ID del slot de disponibilidad seleccionado",
        },
        vehicleSlug: {
          type: "string",
          enum: ["smart_1", "smart_3", "smart_3_brabus"],
          description: "Vehículo para el test drive",
        },
        notes: {
          type: "string",
          description: "Notas adicionales para el asesor",
        },
      },
      required: ["slotId", "vehicleSlug"],
    },
  },
  {
    name: "escalate_to_advisor",
    description:
      "Escala la conversación a un asesor humano. Úsalo cuando: el cliente lo pida explícitamente, la consulta sea muy compleja, el lead esté calificado como HOT y listo para comprar, o haya una queja o situación delicada.",
    input_schema: {
      type: "object" as const,
      properties: {
        reason: {
          type: "string",
          enum: [
            "customer_request",
            "hot_lead_ready",
            "complex_query",
            "complaint",
            "other",
          ],
          description: "Motivo de la escalación",
        },
        urgency: {
          type: "string",
          enum: ["immediate", "within_hour", "today"],
          description: "Urgencia de atención humana",
        },
        summary: {
          type: "string",
          description: "Resumen de la conversación para el asesor",
        },
      },
      required: ["reason", "summary"],
    },
  },
];
