import type { Metadata } from "next";
import { Pricing } from "@/routes/pricing";

export const metadata: Metadata = {
  title: "Pricing & Founder Pass — Readwise Alternative with $49 Lifetime Access",
  description:
    "Why pay $100+ every year for Readwise? Reado is the one-time $49 lifetime pass to remember what you read. Kindle & CSV import, daily spaced-repetition review room, and morning email digests. No monthly subscriptions.",
  alternates: {
    canonical: "/pricing",
  },
  keywords: [
    "readwise alternative",
    "readwise pricing",
    "readwise lifetime deal",
    "readwise alternative no subscription",
    "readwise one time payment",
    "readwise vs reado pricing",
    "lifetime reading memory pass",
  ],
  openGraph: {
    title: "Reado Pricing — The $49 Lifetime Readwise Alternative",
    description:
      "A calm reading room forever with no recurring subscriptions. Test 5 quotes for free, or unlock unlimited reading memory for life for $49.",
    url: "https://reado.lol/pricing",
  },
};

export default function PricingPage() {
  return <Pricing />;
}
