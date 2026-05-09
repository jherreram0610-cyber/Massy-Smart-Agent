import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      conversation: {
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      },
      advisor: { select: { id: true, name: true, email: true } },
      appointments: {
        include: { advisor: { select: { name: true } } },
        orderBy: { scheduledAt: "desc" },
      },
    },
  });

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json<ApiResponse>({ success: true, data: lead });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updated = await db.lead.update({
    where: { id },
    data: {
      advisorId: body.advisorId,
      aiSummary: body.notes,
    },
  });

  return NextResponse.json<ApiResponse>({ success: true, data: updated });
}
