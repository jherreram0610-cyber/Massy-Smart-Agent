import { NextRequest, NextResponse } from "next/server";
import { processMessage } from "@/lib/ai/agent";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ApiResponse, AgentMessageResponse } from "@/types";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: "RATE_LIMITED", message: "Demasiados mensajes. Intenta en un minuto." } },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const body = await req.json();
    const { message, conversationId, metadata } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: "INVALID_INPUT", message: "Message is required" } },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: { code: "MESSAGE_TOO_LONG", message: "Message exceeds 2000 characters" } },
        { status: 400 }
      );
    }

    const result = await processMessage({
      message: message.trim(),
      channel: "web",
      conversationId,
      metadata,
    });

    return NextResponse.json<ApiResponse<AgentMessageResponse>>(
      { success: true, data: result },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (error) {
    console.error("[agent/message] Error:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Error procesando el mensaje" } },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
