import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { loadKnowledgeBase } from "./knowledge-loader";
import { buildSystemPrompt } from "./system-prompt";
import { agentTools } from "./tools";
import { calculateScore } from "./lead-scorer";
import type { AgentMessageRequest, AgentMessageResponse } from "@/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function processMessage(
  req: AgentMessageRequest
): Promise<AgentMessageResponse> {
  const { conversationId, message, channel, metadata } = req;

  // Load or create conversation + lead
  const conversation = await getOrCreateConversation(conversationId, channel, metadata);
  const lead = await db.lead.findUnique({ where: { conversationId: conversation.id } });

  // Persist incoming user message
  await db.message.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: message,
    },
  });

  // Load knowledge base fresh on each turn
  const kb = await loadKnowledgeBase();
  const systemPrompt = buildSystemPrompt(kb, channel);

  // Fetch full message history for context
  const history = await db.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
  });

  const messages: Anthropic.MessageParam[] = history.map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Agentic loop with tool use
  let response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    tools: agentTools,
    messages,
  });

  let assistantText = "";
  let appointmentBooked = false;
  let escalated = false;

  // Loop until no more tool calls
  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );
    const textBlocks = response.content.filter(
      (b): b is Anthropic.TextBlock => b.type === "text"
    );

    if (textBlocks.length > 0) {
      assistantText += textBlocks.map((b) => b.text).join("");
    }

    // Build tool results
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const toolUse of toolUseBlocks) {
      const result = await executeTool(
        toolUse.name,
        toolUse.input as Record<string, unknown>,
        conversation.id,
        lead?.id ?? null
      );

      if (toolUse.name === "book_appointment") appointmentBooked = !!result.success;
      if (toolUse.name === "escalate_to_advisor") escalated = true;

      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }

    // Continue conversation with tool results
    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });

    response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      tools: agentTools,
      messages,
    });
  }

  // Extract final text response
  const finalTextBlocks = response.content.filter(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  assistantText += finalTextBlocks.map((b) => b.text).join("");

  // Persist assistant response
  await db.message.create({
    data: {
      conversationId: conversation.id,
      role: "assistant",
      content: assistantText,
    },
  });

  // Re-score lead after tool updates
  const updatedLead = await db.lead.findUnique({ where: { conversationId: conversation.id } });
  let leadScore;

  if (updatedLead) {
    leadScore = calculateScore(updatedLead);
    await db.lead.update({
      where: { id: updatedLead.id },
      data: {
        score: leadScore.score,
        temperature: leadScore.temperature,
      },
    });

    // Notify advisors if HOT lead
    if (leadScore.temperature === "hot") {
      await createHotLeadNotification(updatedLead.id);
    }
  }

  return {
    message: assistantText,
    conversationId: conversation.id,
    leadScore,
    appointmentBooked,
    escalated,
  };
}

async function getOrCreateConversation(
  conversationId: string | undefined,
  channel: string,
  metadata?: Record<string, string>
) {
  if (conversationId) {
    const existing = await db.conversation.findUnique({ where: { id: conversationId } });
    if (existing) return existing;
  }

  const channelId = metadata?.channelId ?? `${channel}_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Try to find existing by channel+channelId
  const existing = await db.conversation.findUnique({
    where: { channel_channelId: { channel: channel as never, channelId } },
  });
  if (existing) return existing;

  // Create conversation then lead (lead has FK to conversation)
  const conversation = await db.conversation.create({
    data: {
      channel: channel as never,
      channelId,
      status: "active",
    },
  });

  await db.lead.create({
    data: {
      conversationId: conversation.id,
      score: 0,
      temperature: "cold",
    },
  });

  return conversation;
}

async function executeTool(
  toolName: string,
  input: Record<string, unknown>,
  conversationId: string,
  leadId: string | null
): Promise<Record<string, unknown>> {
  switch (toolName) {
    case "update_lead_data": {
      if (!leadId) return { success: false, error: "No lead found" };
      await db.lead.update({
        where: { id: leadId },
        data: {
          name: (input.name as string) ?? undefined,
          phone: (input.phone as string) ?? undefined,
          email: (input.email as string) ?? undefined,
          vehicleInterest: (input.vehicleInterest as string) ?? undefined,
          budget: input.budget != null ? String(input.budget) : undefined,
          paymentType: (input.paymentType as never) ?? undefined,
          urgency: (input.urgency as never) ?? undefined,
          hasTradeIn: (input.hasTradeIn as boolean) ?? undefined,
          aiSummary: (input.notes as string) ?? undefined,
        },
      });
      return { success: true };
    }

    case "get_available_slots": {
      const daysAhead = (input.daysAhead as number) ?? 7;
      const fromDate = new Date();
      const toDate = new Date();
      toDate.setDate(toDate.getDate() + daysAhead);

      const slots = await db.advisorSlot.findMany({
        where: {
          isAvailable: true,
          startsAt: { gte: fromDate, lte: toDate },
          ...(input.advisorId ? { advisorId: input.advisorId as string } : {}),
        },
        include: { advisor: { select: { name: true } } },
        orderBy: { startsAt: "asc" },
        take: 10,
      });

      const formatted = slots.map((s) => ({
        id: s.id,
        date: s.startsAt.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }),
        time: s.startsAt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
        advisor: s.advisor.name,
      }));

      return { success: true, slots: formatted, count: formatted.length };
    }

    case "book_appointment": {
      if (!leadId) return { success: false, error: "No lead found" };

      const slot = await db.advisorSlot.findUnique({ where: { id: input.slotId as string } });
      if (!slot?.isAvailable) return { success: false, error: "Slot no disponible" };

      const lead = await db.lead.findUnique({ where: { id: leadId } });
      if (!lead) return { success: false, error: "Lead no encontrado" };

      await db.$transaction([
        db.appointment.create({
          data: {
            leadId,
            advisorId: slot.advisorId,
            slotId: slot.id,
            scheduledAt: slot.startsAt,
            vehicleInterest: (input.vehicleSlug as string) ?? lead.vehicleInterest ?? "general",
            status: "pending",
            notes: (input.notes as string) ?? undefined,
          },
        }),
        db.advisorSlot.update({
          where: { id: slot.id },
          data: { isAvailable: false },
        }),
        db.lead.update({
          where: { id: leadId },
          data: { urgency: "this_week" },
        }),
      ]);

      return {
        success: true,
        date: slot.startsAt.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }),
        time: slot.startsAt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
      };
    }

    case "escalate_to_advisor": {
      await db.conversation.update({
        where: { id: conversationId },
        data: { status: "handed_off" },
      });

      if (leadId) {
        const advisors = await db.advisor.findMany({ where: { isActive: true } });
        await db.notification.createMany({
          data: advisors.map((a) => ({
            advisorId: a.id,
            type: "hot_lead" as const,
            leadId,
            payload: {
              reason: String(input.reason ?? ""),
              urgency: String(input.urgency ?? ""),
              summary: String(input.summary ?? ""),
            } as Record<string, string>,
          })),
        });
      }

      return { success: true, message: "Asesor notificado. Te atenderá pronto." };
    }

    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}

async function createHotLeadNotification(leadId: string) {
  const existing = await db.notification.findFirst({
    where: { leadId, type: "hot_lead", read: false },
  });
  if (existing) return;

  const advisors = await db.advisor.findMany({ where: { isActive: true } });
  await db.notification.createMany({
    data: advisors.map((a) => ({
      advisorId: a.id,
      type: "hot_lead" as const,
      leadId,
      payload: { message: "Lead calificado como HOT — atención prioritaria." },
    })),
  });
}
