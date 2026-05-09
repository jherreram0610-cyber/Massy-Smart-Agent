import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const advisorId = (session.user as { id?: string }).id;
  if (!advisorId) return NextResponse.json({ error: "No advisor id" }, { status: 400 });

  const notifications = await db.notification.findMany({
    where: { advisorId },
    include: { lead: { select: { name: true, temperature: true, score: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return NextResponse.json({ success: true, data: notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const advisorId = (session.user as { id?: string }).id;
  if (!advisorId) return NextResponse.json({ error: "No advisor id" }, { status: 400 });

  await db.notification.updateMany({
    where: { advisorId, read: false },
    data: { read: true },
  });

  return NextResponse.json({ success: true });
}
