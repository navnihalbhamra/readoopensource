/** Reado's public plans and the entitlements enforced by the backend. */

export type Plan = "free" | "pro" | "lifetime";
export const FREE_HIGHLIGHT_LIMIT = 100;

export interface PriceOption {
  id: "monthly" | "yearly" | "lifetime";
  name: string;
  price: string;
  cadence: string;
  note: string;
  badge?: string;
}

export const PRICES: PriceOption[] = [
  { id: "monthly", name: "Pro monthly", price: "$5", cadence: "per month", note: "Cancel whenever you like." },
  { id: "yearly", name: "Pro yearly", price: "$39", cadence: "per year", note: "The calmest way to stay current.", badge: "Best value" },
  { id: "lifetime", name: "Lifetime", price: "$49", cadence: "once", note: "Founding-reader price while it lasts.", badge: "Founding reader" },
];

export const FREE_FEATURES = [
  `Up to ${FREE_HIGHLIGHT_LIMIT} highlights`,
  "Distraction-free reader and themes",
  "Daily in-app review",
  "Weekly email digest",
];

export const PRO_FEATURES = [
  "Unlimited highlights and books",
  "Daily email digest, on your schedule",
  "Automatic covers, authors and book pages",
  "Personal highlight API + bulk imports",
  "Choose which inbox your digest lands in",
];

export interface Entitlements {
  plan: Plan;
  isPro: boolean;
  highlightLimit: number | null;
  highlightCount: number;
  remaining: number | null;
  canUseDailyDigest: boolean;
  canEnrichBooks: boolean;
}

export function entitlementsFor(plan: string | null | undefined, highlightCount: number): Entitlements {
  const resolved: Plan = plan === "pro" || plan === "lifetime" ? plan : "free";
  const isPro = resolved !== "free";
  return {
    plan: resolved,
    isPro,
    highlightLimit: isPro ? null : FREE_HIGHLIGHT_LIMIT,
    highlightCount,
    remaining: isPro ? null : Math.max(0, FREE_HIGHLIGHT_LIMIT - highlightCount),
    canUseDailyDigest: isPro,
    canEnrichBooks: isPro,
  };
}

export function planLabel(plan: string | null | undefined): string {
  if (plan === "lifetime") return "Lifetime";
  if (plan === "pro") return "Pro";
  return "Free";
}
