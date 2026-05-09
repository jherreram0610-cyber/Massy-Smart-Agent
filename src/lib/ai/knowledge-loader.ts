import { db } from "@/lib/db";
import { formatCOP } from "@/lib/utils";
import type { KnowledgeBase } from "@/types";

export async function loadKnowledgeBase(): Promise<KnowledgeBase> {
  const [vehicles, financingPlans, promotions, dealershipRows] =
    await Promise.all([
      db.vehicle.findMany({ where: { isActive: true }, orderBy: { priceFrom: "asc" } }),
      db.financingPlan.findMany({ where: { isActive: true } }),
      db.promotion.findMany({
        where: {
          isActive: true,
          OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
        },
      }),
      db.dealershipInfo.findMany(),
    ]);

  const dealershipInfo = Object.fromEntries(
    dealershipRows.map((r) => [r.key, r.value])
  );

  return { vehicles, financingPlans, promotions, dealershipInfo };
}

export function formatKnowledgeBaseForPrompt(kb: KnowledgeBase): string {
  const sections: string[] = [];

  // Vehicles
  const vehicleLines = kb.vehicles.map((v) => {
    const specs = v.specs as Record<string, string>;
    const features = v.features as string[];
    const colors = v.colors as string[];
    return [
      `### ${v.name} (slug: ${v.slug})`,
      `Descripción: ${v.description}`,
      `Precio: ${formatCOP(v.priceFrom)}${v.priceTo ? ` – ${formatCOP(v.priceTo)}` : ""}`,
      `Autonomía: ${specs.autonomia ?? "N/A"}`,
      `Potencia: ${specs.potencia ?? "N/A"}`,
      `Aceleración: ${specs.aceleracion ?? "N/A"}`,
      `Colores disponibles: ${colors.join(", ")}`,
      `Características destacadas: ${features.slice(0, 5).join(" | ")}`,
    ].join("\n");
  });
  sections.push(`## CATÁLOGO SMART DISPONIBLE\n${vehicleLines.join("\n\n")}`);

  // Financing
  const finLines = kb.financingPlans.map((f) => {
    const vehicleNote = f.vehicleSlug ? ` (solo para ${f.vehicleSlug})` : "";
    return `- ${f.bankName}${vehicleNote}: ${f.minRate}% – ${f.maxRate}% EM, plazo ${f.minTerm}–${f.maxTerm} meses, cuota inicial mínima ${f.minDownPayment}%. ${f.notes ?? ""}`;
  });
  sections.push(`## FINANCIACIÓN DISPONIBLE\n${finLines.join("\n")}`);

  // Promotions
  if (kb.promotions.length > 0) {
    const promoLines = kb.promotions.map(
      (p) => `- ${p.title}: ${p.description}${p.validUntil ? ` (válido hasta ${new Date(p.validUntil).toLocaleDateString("es-CO")})` : ""}`
    );
    sections.push(`## PROMOCIONES ACTIVAS\n${promoLines.join("\n")}`);
  }

  // Dealership
  const d = kb.dealershipInfo;
  sections.push(
    `## CONCESIONARIO\nNombre: ${d.name ?? "Massy Motors Smart"}\nDirección: ${d.address ?? "Cali, Colombia"}\nHorario: ${d.hours ?? "Lunes a Sábado"}\nTeléfono: ${d.phone ?? "N/A"}`
  );

  return sections.join("\n\n");
}
