"use client";

import Link from "next/link";
import { getChannelEmoji, getChannelLabel, formatCOP, timeAgo } from "@/lib/utils";

interface LeadRow {
  id: string;
  name: string | null;
  phone: string | null;
  vehicleInterest: string | null;
  score: number;
  temperature: string;
  budget: string | null;
  createdAt: Date;
  conversation: { channel: string; status: string } | null;
  advisor: { name: string } | null;
  appointments: Array<{ scheduledAt: Date }>;
}

interface LeadsTableProps {
  leads: LeadRow[];
}

const tempStyle: Record<string, { bg: string; color: string; label: string }> = {
  hot: { bg: "rgba(255,59,92,0.15)", color: "var(--hot)", label: "HOT" },
  warm: { bg: "rgba(255,214,0,0.15)", color: "var(--warm)", label: "WARM" },
  cold: { bg: "rgba(107,127,163,0.15)", color: "var(--cold)", label: "COLD" },
};

export function LeadsTable({ leads }: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "var(--muted)" }}>
        No hay leads aún. Los prospectos aparecerán aquí cuando interactúen con el agente.
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["Prospecto", "Canal", "Vehículo", "Score", "Presupuesto", "Cita", "Asesor", "Hace"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left font-medium"
                style={{ color: "var(--muted)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => {
            const temp = tempStyle[lead.temperature] ?? tempStyle.cold;
            const nextAppt = lead.appointments[0];
            return (
              <tr
                key={lead.id}
                style={{
                  borderBottom: i < leads.length - 1 ? "1px solid var(--border)" : undefined,
                  transition: "background 0.15s",
                }}
                className="hover:bg-white/[0.02] cursor-pointer"
              >
                <td className="px-4 py-3">
                  <Link href={`/leads/${lead.id}`} className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{ background: temp.bg, color: temp.color }}
                    >
                      {temp.label}
                    </span>
                    <span style={{ color: "var(--white)" }}>{lead.name ?? "Anónimo"}</span>
                    {lead.phone && (
                      <span style={{ color: "var(--muted)" }} className="text-xs">
                        {lead.phone}
                      </span>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3" style={{ color: "var(--muted)" }}>
                  {lead.conversation
                    ? `${getChannelEmoji(lead.conversation.channel)} ${getChannelLabel(lead.conversation.channel)}`
                    : "—"}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--white)" }}>
                  {lead.vehicleInterest
                    ? lead.vehicleInterest.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <ScoreBar score={lead.score} color={temp.color} />
                </td>
                <td className="px-4 py-3" style={{ color: "var(--muted)" }}>
                  {lead.budget ? formatCOP(Number(lead.budget)) : "—"}
                </td>
                <td className="px-4 py-3" style={{ color: nextAppt ? "var(--primary)" : "var(--muted)" }}>
                  {nextAppt
                    ? new Date(nextAppt.scheduledAt).toLocaleDateString("es-CO", { day: "numeric", month: "short" })
                    : "—"}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--muted)" }}>
                  {lead.advisor?.name ?? "Sin asignar"}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                  {timeAgo(lead.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ width: "60px", background: "var(--surface-2)" }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono" style={{ color }}>
        {score}
      </span>
    </div>
  );
}
