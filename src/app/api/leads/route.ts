import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ApiResponse } from "@/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const temperature = searchParams.get("temperature");
  const channel = searchParams.get("channel");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = 20;

  const where = {
    ...(temperature ? { temperature: temperature as never } : {}),
    ...(channel ? { conversation: { channel: channel as never } } : {}),
  };

  const [total, leads] = await Promise.all([
    db.lead.count({ where }),
    db.lead.findMany({
      where,
      include: {
        conversation: { select: { channel: true, status: true } },
        advisor: { select: { name: true } },
        appointments: {
          where: { status: { in: ["pending", "confirmed"] } },
          orderBy: { scheduledAt: "asc" },
          take: 1,
        },
      },
      orderBy: { score: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json<ApiResponse>({
    success: true,
    data: leads,
    meta: { page, pageSize, total },
  });
}
