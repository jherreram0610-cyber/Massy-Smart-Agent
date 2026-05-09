import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FinancingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const plans = await db.financingPlan.findMany({ orderBy: { bankName: "asc" } });
  const promotions = await db.promotion.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--white)" }}>
          Financiación y Promociones
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {plans.length} planes · {promotions.length} promociones
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--muted)" }}>PLANES DE FINANCIACIÓN</h2>
        <div className="space-y-2">
          {plans.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border px-4 py-3 flex items-center justify-between"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--white)" }}>{p.bankName}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                  {p.vehicleSlug ? `Solo para ${p.vehicleSlug.replace(/_/g, " ")}` : "Todos los modelos"} ·{" "}
                  Plazo {p.minTerm}–{p.maxTerm} meses · Cuota inicial mín. {p.minDownPayment}%
                </p>
                {p.notes && <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{p.notes}</p>}
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-bold" style={{ color: "var(--primary)" }}>
                  {p.minRate}% – {p.maxRate}% EM
                </p>
                <span
                  className="text-xs"
                  style={{ color: p.isActive ? "var(--success)" : "var(--muted)" }}
                >
                  {p.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--muted)" }}>PROMOCIONES</h2>
        <div className="space-y-2">
          {promotions.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border px-4 py-3"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--white)" }}>{p.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{p.description}</p>
                  {p.vehicleSlug && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--primary)" }}>
                      {p.vehicleSlug.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-4">
                  {p.validUntil && (
                    <p className="text-xs" style={{ color: "var(--warm)" }}>
                      Hasta {new Date(p.validUntil).toLocaleDateString("es-CO")}
                    </p>
                  )}
                  <span
                    className="text-xs"
                    style={{ color: p.isActive ? "var(--success)" : "var(--muted)" }}
                  >
                    {p.isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {promotions.length === 0 && (
            <p className="text-sm" style={{ color: "var(--muted)" }}>Sin promociones activas</p>
          )}
        </div>
      </section>
    </div>
  );
}
