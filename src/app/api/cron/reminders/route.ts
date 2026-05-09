import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAppointmentReminder } from "@/lib/notifications/email";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find appointments in the next 24h that haven't received reminder1
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const appointments = await db.appointment.findMany({
    where: {
      status: { in: ["pending", "confirmed"] },
      scheduledAt: { gte: in24h, lte: in25h },
      reminder1SentAt: null,
    },
    include: {
      lead: { select: { email: true, name: true } },
    },
  });

  let sent = 0;
  for (const appt of appointments) {
    if (!appt.lead.email) continue;

    try {
      await sendAppointmentReminder({
        to: appt.lead.email,
        clientName: appt.lead.name ?? "Cliente",
        vehicleInterest: appt.vehicleInterest ?? "Smart",
        scheduledAt: appt.scheduledAt,
        hoursUntil: 24,
      });

      await db.appointment.update({
        where: { id: appt.id },
        data: { reminder1SentAt: now },
      });
      sent++;
    } catch (err) {
      console.error(`[reminders] Failed to send reminder for appt ${appt.id}:`, err);
    }
  }

  return NextResponse.json({ success: true, sent });
}
