import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCOP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const vehicles = await db.vehicle.findMany({ orderBy: { priceFrom: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--white)" }}>
            Catálogo de Vehículos
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {vehicles.length} modelos Smart disponibles
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => {
          const specs = v.specs as Record<string, string>;
          const features = v.features as string[];
          const colors = v.colors as string[];

          return (
            <div
              key={v.id}
              className="rounded-xl border p-5"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-bold text-base" style={{ color: "var(--white)", fontFamily: "var(--font-heading)" }}>
                  {v.name}
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: v.isActive ? "rgba(0,212,255,0.15)" : "rgba(107,127,163,0.15)",
                    color: v.isActive ? "var(--primary)" : "var(--muted)",
                  }}
                >
                  {v.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>

              <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>{v.description}</p>

              <div className="space-y-1.5 text-sm mb-3">
                <div className="flex justify-between">
                  <span style={{ color: "var(--muted)" }}>Precio desde</span>
                  <span className="font-bold" style={{ color: "var(--primary)" }}>{formatCOP(v.priceFrom)}</span>
                </div>
                {v.priceTo && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--muted)" }}>Hasta</span>
                    <span style={{ color: "var(--white)" }}>{formatCOP(v.priceTo)}</span>
                  </div>
                )}
                {specs.autonomia && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--muted)" }}>Autonomía</span>
                    <span style={{ color: "var(--white)" }}>{specs.autonomia}</span>
                  </div>
                )}
                {specs.potencia && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--muted)" }}>Potencia</span>
                    <span style={{ color: "var(--white)" }}>{specs.potencia}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {colors.map((c: string) => (
                  <span key={c} className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--muted)" }}>
                    {c}
                  </span>
                ))}
              </div>

              <div className="border-t pt-2 mt-2" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {features.slice(0, 3).join(" · ")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
