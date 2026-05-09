import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Flame, Users, CalendarCheck, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const [
    totalLeads,
    hotLeads,
    warmLeads,
    coldLeads,
    newLeadsThisWeek,
    appointmentsThisMonth,
    appointmentsUpcoming,
    channelBreakdown,
    recentLeads,
  ] = await Promise.all([
    db.lead.count(),
    db.lead.count({ where: { temperature: "hot" } }),
    db.lead.count({ where: { temperature: "warm" } }),
    db.lead.count({ where: { temperature: "cold" } }),
    db.lead.count({ where: { createdAt: { gte: startOfWeek } } }),
    db.appointment.count({ where: { createdAt: { gte: startOfMonth } } }),
    db.appointment.count({ where: { scheduledAt: { gte: now }, status: "pending" } }),
    db.conversation.groupBy({ by: ["channel"], _count: { channel: true } }),
    db.lead.findMany({
      include: { conversation: { select: { channel: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const kpis = [
    { label: "Leads HOT", value: hotLeads, icon: Flame, color: "var(--hot)", change: `${totalLeads} total` },
    { label: "Leads esta semana", value: newLeadsThisWeek, icon: Users, color: "var(--primary)", change: `${warmLeads} WARM` },
    { label: "Citas próximas", value: appointmentsUpcoming, icon: CalendarCheck, color: "var(--warm)", change: `${appointmentsThisMonth} este mes` },
    { label: "Score promedio", value: Math.round((hotLeads * 80 + warmLeads * 50 + coldLeads * 20) / Math.max(totalLeads, 1)), icon: TrendingUp, color: "var(--success)", change: `de 100 pts` },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--white)" }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Resumen del agente de ventas Smart
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-4 border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>{kpi.label}</p>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${kpi.color}22` }}
              >
                <kpi.icon size={16} style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)", color: kpi.color }}>
              {kpi.value}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{kpi.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Lead temperature breakdown */}
        <div
          className="rounded-xl p-4 border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--muted)" }}>LEADS POR TEMPERATURA</h2>
          <div className="space-y-3">
            {[
              { label: "HOT", count: hotLeads, color: "var(--hot)" },
              { label: "WARM", count: warmLeads, color: "var(--warm)" },
              { label: "COLD", count: coldLeads, color: "var(--cold)" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs font-bold w-10" style={{ color }}>{label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: totalLeads ? `${(count / totalLeads) * 100}%` : "0%", background: color }}
                  />
                </div>
                <span className="text-xs w-8 text-right" style={{ color: "var(--muted)" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Channel breakdown */}
        <div
          className="rounded-xl p-4 border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--muted)" }}>CANALES DE ORIGEN</h2>
          <div className="space-y-2">
            {channelBreakdown.map((c) => (
              <div key={c.channel} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--white)" }}>
                  {c.channel === "whatsapp" ? "💬" : c.channel === "web" ? "🌐" : c.channel === "facebook" ? "📘" : c.channel === "instagram" ? "📸" : "🛒"}{" "}
                  {c.channel.charAt(0).toUpperCase() + c.channel.slice(1)}
                </span>
                <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>{c._count.channel}</span>
              </div>
            ))}
            {channelBreakdown.length === 0 && (
              <p className="text-sm" style={{ color: "var(--muted)" }}>Sin datos aún</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent leads */}
      <div
        className="rounded-xl p-4 border mt-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--muted)" }}>LEADS RECIENTES</h2>
        {recentLeads.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>Sin leads aún</p>
        ) : (
          <div className="space-y-2">
            {recentLeads.map((lead) => {
              const tempColors: Record<string, string> = { hot: "var(--hot)", warm: "var(--warm)", cold: "var(--cold)" };
              const color = tempColors[lead.temperature] ?? "var(--cold)";
              return (
                <div key={lead.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-sm" style={{ color: "var(--white)" }}>{lead.name ?? "Anónimo"}</span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      {lead.vehicleInterest?.replace(/_/g, " ") ?? "General"}
                    </span>
                  </div>
                  <span className="text-xs font-bold" style={{ color }}>{lead.score} pts</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
