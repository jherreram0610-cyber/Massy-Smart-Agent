import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "var(--warm)" },
  confirmed: { label: "Confirmada", color: "var(--primary)" },
  completed: { label: "Completada", color: "var(--success)" },
  cancelled: { label: "Cancelada", color: "var(--muted)" },
  no_show: { label: "No asistió", color: "var(--hot)" },
};

export default async function AppointmentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const appointments = await db.appointment.findMany({
    include: {
      lead: { select: { name: true, phone: true, vehicleInterest: true } },
      advisor: { select: { name: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take: 100,
  });

  const upcoming = appointments.filter((a) => new Date(a.scheduledAt) >= new Date() && a.status !== "cancelled");
  const past = appointments.filter((a) => new Date(a.scheduledAt) < new Date() || a.status === "cancelled");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--white)" }}>
          Citas
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {upcoming.length} próximas · {past.length} pasadas
        </p>
      </div>

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--muted)" }}>PRÓXIMAS CITAS</h2>
          <AppointmentList appointments={upcoming} />
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--muted)" }}>HISTORIAL</h2>
          <AppointmentList appointments={past} />
        </section>
      )}

      {appointments.length === 0 && (
        <div className="text-center py-16" style={{ color: "var(--muted)" }}>
          No hay citas programadas aún.
        </div>
      )}
    </div>
  );
}

function AppointmentList({ appointments }: {
  appointments: Array<{
    id: string;
    scheduledAt: Date;
    status: string;
    vehicleInterest: string | null;
    notes: string | null;
    lead: { name: string | null; phone: string | null; vehicleInterest: string | null };
    advisor: { name: string };
  }>
}) {
  return (
    <div className="space-y-2">
      {appointments.map((a) => {
        const st = statusLabel[a.status] ?? statusLabel.pending;
        return (
          <div
            key={a.id}
            className="flex items-center gap-4 px-4 py-3 rounded-xl border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {/* Date */}
            <div className="shrink-0 text-center w-14">
              <div className="text-lg font-bold" style={{ color: "var(--primary)", fontFamily: "var(--font-heading)" }}>
                {new Date(a.scheduledAt).getDate()}
              </div>
              <div className="text-xs uppercase" style={{ color: "var(--muted)" }}>
                {new Date(a.scheduledAt).toLocaleDateString("es-CO", { month: "short" })}
              </div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                {new Date(a.scheduledAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm" style={{ color: "var(--white)" }}>
                {a.lead.name ?? "Prospecto"} · {a.vehicleInterest?.replace(/_/g, " ") ?? "Smart"}
              </p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                {a.lead.phone ?? ""} · Asesor: {a.advisor.name}
              </p>
              {a.notes && <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>{a.notes}</p>}
            </div>

            <span
              className="shrink-0 px-2 py-1 rounded text-xs font-medium"
              style={{ background: `${st.color}22`, color: st.color }}
            >
              {st.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
