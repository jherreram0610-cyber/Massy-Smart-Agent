import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/ai/agent";
import {
  sendWhatsAppMessage,
  sendFacebookMessage,
  sendInstagramMessage,
  extractWhatsAppMessage,
  extractFbOrIgMessage,
  type MetaWebhookEntry,
  type MetaMessagingEvent,
} from "@/lib/channels/meta";
import { db } from "@/lib/db";

// Webhook verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Incoming messages (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry as MetaWebhookEntry[]) {
        const parsed = extractWhatsAppMessage(entry);
        if (!parsed) continue;

        const reply = await handleIncoming(parsed.from, parsed.text, "whatsapp", {
          name: parsed.name,
          channelId: parsed.from,
        });

        if (reply) {
          await sendWhatsAppMessage(parsed.from, reply);
        }
      }
    } else if (body.object === "page") {
      for (const entry of body.entry as MetaWebhookEntry[]) {
        for (const messaging of (entry.messaging ?? []) as MetaMessagingEvent[]) {
          const parsed = extractFbOrIgMessage(messaging);
          if (!parsed) continue;

          const reply = await handleIncoming(parsed.senderId, parsed.text, "facebook", {
            channelId: parsed.senderId,
          });

          if (reply) {
            await sendFacebookMessage(parsed.senderId, reply);
          }
        }
      }
    } else if (body.object === "instagram") {
      for (const entry of body.entry as MetaWebhookEntry[]) {
        for (const messaging of (entry.messaging ?? []) as MetaMessagingEvent[]) {
          const parsed = extractFbOrIgMessage(messaging);
          if (!parsed) continue;

          const reply = await handleIncoming(parsed.senderId, parsed.text, "instagram", {
            channelId: parsed.senderId,
          });

          if (reply) {
            await sendInstagramMessage(parsed.senderId, reply);
          }
        }
      }
    }

    // Always return 200 to Meta to acknowledge receipt
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[meta webhook] Error:", error);
    // Still return 200 so Meta doesn't retry
    return NextResponse.json({ status: "ok" });
  }
}

async function handleIncoming(
  channelUserId: string,
  text: string,
  channel: string,
  metadata: Record<string, string>
): Promise<string | null> {
  // Find existing conversation by channelId
  const existing = await db.conversation.findUnique({
    where: {
      channel_channelId: {
        channel: channel as never,
        channelId: channelUserId,
      },
    },
  });

  const result = await processMessage({
    message: text,
    channel,
    conversationId: existing?.id,
    metadata: { ...metadata, channelId: channelUserId },
  });

  return result.message;
}
