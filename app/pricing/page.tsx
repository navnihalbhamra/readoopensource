import type { Metadata } from "next";
import { Pricing } from "@/routes/pricing";

export const metadata: Metadata = {
  title: "Pricing & Founder Pass — Open-Source Readwise Alternative | Self-Host or Cloud",
  description:
    "Why pay $100+ every year for Readwise? Self-host Reado for free on GitHub or get the $49 lifetime Founder Pass for managed cloud. Open source, Kindle & CSV import, web articles, and morning email digests. No monthly subscriptions.",
  alternates: {
    canonical: "/pricing",
  },
  keywords: [
    "readwise alternative",
    "open source readwise alternative",
    "self host readwise alternative",
    "readwise pricing",
    "readwise lifetime deal",
    "readwise alternative no subscription",
    "self hosted highlight digest",
    "readwise one time payment",
    "readwise vs reado pricing",
    "lifetime reading memory pass",
  ],
  openGraph: {
    title: "Reado Pricing — Open-Source Readwise Alternative with No Subscriptions",
    description:
      "A calm reading sanctuary forever. Self-host for free on GitHub, or get the $49 lifetime Founder Pass for automated morning emails and cloud sync.",
    url: "https://reado.lol/pricing",
  },
};

export default function PricingPage() {
  return <Pricing />;
}
