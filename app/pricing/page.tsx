import type { Metadata } from "next";
import { Pricing } from "@/routes/pricing";

export const metadata: Metadata = {
  title: "Founder Pass & Pricing — $49 Lifetime Reading Memory",
  description:
    "Test Reado with up to 5 highlights and live review emails for free. Unlock unlimited Kindle & book highlight memory forever with the one-time $49 Founder Pass. No monthly subscriptions.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Reado Pricing — One-Time $49 Lifetime Pass",
    description:
      "A calm reading room forever. No recurring subscriptions. Import your Kindle clippings and get custom email reviews.",
    url: "https://reado.lol/pricing",
  },
};

export default function PricingPage() {
  return <Pricing />;
}
