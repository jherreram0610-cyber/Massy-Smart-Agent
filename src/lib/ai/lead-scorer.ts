import type { Lead, LeadScore } from "@/types";

export function calculateScore(lead: Partial<Lead>): LeadScore {
  let score = 0;

  if (lead.vehicleInterest && lead.vehicleInterest !== "general") score += 20;
  if (lead.paymentType === "cash") score += 25;
  if (lead.paymentType === "financing") score += 15;
  if (lead.urgency === "this_week") score += 25;
  if (lead.urgency === "this_month") score += 15;
  if (lead.urgency === "three_months") score += 5;
  if (lead.hasTradeIn !== null && lead.hasTradeIn !== undefined) score += 10;
  if (lead.name && lead.phone) score += 10;
  if (lead.budget) score += 10;

  score = Math.min(score, 100);

  const temperature =
    score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";

  return { score, temperature };
}
