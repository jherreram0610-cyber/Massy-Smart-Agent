import { NextRequest, NextResponse } from "next/server";
import { syncAdvisorSlots } from "@/lib/calendar/sync";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncAdvisorSlots();
  return NextResponse.json({ success: true, ...result });
}
