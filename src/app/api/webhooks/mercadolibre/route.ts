import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/ai/agent";
import { getMercadoLibreMessage, sendMercadoLibreMessage } from "@/lib/channels/mercadolibre";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ML sends notifications for different topics; we only care about messages
    if (body.topic !== "messages" || !body.resource) {
      return NextResponse.json({ status: "ignored" });
    }

    const parsed = await getMercadoLibreMessage(body.resource as string);
    if (!parsed || !parsed.text.trim()) {
      return NextResponse.json({ status: "ignored" });
    }

    const existing = await db.conversation.findUnique({
      where: {
        channel_channelId: {
          channel: "mercadolibre",
          channelId: parsed.packId,
        },
      },
    });

    const result = await processMessage({
      message: parsed.text,
      channel: "mercadolibre",
      conversationId: existing?.id,
      metadata: {
        channelId: parsed.packId,
        name: parsed.buyerName,
      },
    });

    if (result.message) {
      await sendMercadoLibreMessage(parsed.packId, result.message);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[mercadolibre webhook] Error:", error);
    return NextResponse.json({ status: "ok" });
  }
}
