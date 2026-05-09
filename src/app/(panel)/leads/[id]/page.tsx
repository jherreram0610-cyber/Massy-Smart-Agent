import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { formatCOP, getChannelLabel, getChannelEmoji, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      conversation: {
        include: { messages: { orderBy: { createdAt: "asc" } } },
      },
      advisor: true,
      appointments: {
        include: { advisor: { select: { name: true } } },
        orderBy: { scheduledAt: "desc" },
      },
    },
  });

  if (!lead) notFound();

  const tempColors: Record<string, string> = { hot: "var(--hot)", warm: "var(--warm)", cold: "var(--cold)" };
  const tempColor = tempColors[lead.temperature] ?? "var(--cold)";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--white)" }}>
              {lead.name ?? "Prospecto anónimo"}
            </h1>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: `${tempColor}22`, color: tempColor }}
            >
              {lead.temperature.toUpperCase()} · {lead.score} pts
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {lead.phone ?? "Sin teléfono"} ·{" "}
            {lead.conversation
              ? `${getChannelEmoji(lead.conversation.channel)} ${getChannelLabel(lead.conversation.channel)}`
              : "Canal desconocido"}{" "}
            · Llegó {timeAgo(lead.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Lead info */}
        <div
          className="col-span-1 rounded-xl p-4 border space-y-3"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--muted)" }}>INFORMACIÓN</h2>
          <InfoRow label="Email" value={lead.email} />
          <InfoRow label="Vehículo" value={lead.vehicleInterest?.replace(/_/g, " ")} />
          <InfoRow label="Presupuesto" value={lead.budget ? formatCOP(Number(lead.budget)) : undefined} />
          <InfoRow label="Forma de pago" value={lead.paymentType} />
          <InfoRow label="Urgencia" value={lead.urgency?.replace(/_/g, " ")} />
          <InfoRow label="Trade-in" value={lead.hasTradeIn === true ? "Sí" : lead.hasTradeIn === false ? "No" : undefined} />
          <InfoRow label="Asesor" value={lead.advisor?.name} />

          {lead.appointments.length > 0 && (
            <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted)" }}>CITAS</p>
              {lead.appointments.map((a) => (
                <div key={a.id} className="text-xs mb-1" style={{ color: "var(--white)" }}>
                  {new Date(a.scheduledAt).toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  {" · "}<span style={{ color: "var(--muted)" }}>{a.advisor.name}</span>
                </div>
              ))}
            </div>
          )}

          {lead.aiSummary && (
            <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted)" }}>NOTAS IA</p>
              <p className="text-xs" style={{ color: "var(--white)" }}>{lead.aiSummary}</p>
            </div>
          )}
        </div>

        {/* Conversation */}
        <div
          className="col-span-2 rounded-xl border flex flex-col"
          style={{ background: "var(--surface)", borderColor: "var(--border)", maxHeight: "600px" }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
              CONVERSACIÓN · {lead.conversation?.messages.length ?? 0} mensajes
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {lead.conversation?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[80%] px-3 py-2 rounded-xl text-sm"
                  style={{
                    background: msg.role === "user" ? "rgba(0,212,255,0.12)" : "rgba(255,255,255,0.05)",
                    color: "var(--white)",
                    borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                  }}
                >
                  <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    {timeAgo(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            {(!lead.conversation || lead.conversation.messages.length === 0) && (
              <p className="text-center text-sm py-8" style={{ color: "var(--muted)" }}>
                Sin mensajes aún
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs" style={{ color: "var(--muted)" }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: "var(--white)" }}>{value}</p>
    </div>
  );
}
