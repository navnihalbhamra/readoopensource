/** Reado's public plans and the entitlements enforced by the backend. */

export type Plan = "free" | "founder" | "lifetime" | "pro";
export const FREE_HIGHLIGHT_LIMIT = 5;
export const MAX_WORDS_PER_HIGHLIGHT = 50;
export const POLAR_FOUNDER_PRODUCT_ID = "94af6917-db05-46d6-b84a-c6c6e8744ea6";

export interface PriceOption {
  id: "lifetime";
  name: string;
  price: string;
  cadence: string;
  note: string;
  badge?: string;
}

export const PRICES: PriceOption[] = [
  {
    id: "lifetime",
    name: "Founder Pass",
    price: "$49",
    cadence: "once, forever",
    note: "Pay once. Unlimited highlights, book covers, daily reviews, and digests forever.",
    badge: "Lifetime Access",
  },
];

export const FREE_FEATURES = [
  `Up to ${FREE_HIGHLIGHT_LIMIT} highlights to test the room`,
  "Test out email digests to your inbox",
  "Distraction-free reader and themes",
  "Daily in-app review",
];

export const PRO_FEATURES = [
  "Unlimited highlights and books forever",
  "Daily email digest, on your schedule",
  "Automatic covers, authors and book pages",
  "Kindle My Clippings & CSV archive imports",
  "Choose which inbox your digest lands in",
  "Zero recurring subscriptions forever",
];

export const FOUNDER_FEATURES = PRO_FEATURES;

export interface Entitlements {
  plan: Plan;
  isPro: boolean;
  highlightLimit: number | null;
  highlightCount: number;
  remaining: number | null;
  canUseDailyDigest: boolean;
  canEnrichBooks: boolean;
}

export function entitlementsFor(
  plan: string | null | undefined,
  highlightCount: number,
): Entitlements {
  const resolved: Plan =
    plan === "pro" || plan === "lifetime" || plan === "founder" ? "lifetime" : "free";
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
  if (plan === "lifetime" || plan === "founder" || plan === "pro") return "Founder Pass";
  return "Free Preview";
}

