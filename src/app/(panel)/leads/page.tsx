import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LeadsTable } from "@/components/leads/LeadsTable";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const leads = await db.lead.findMany({
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
    take: 50,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--white)" }}>
          Leads
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {leads.length} prospectos · ordenados por score IA
        </p>
      </div>
      <LeadsTable leads={leads} />
    </div>
  );
}
