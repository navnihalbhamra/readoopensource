import type { Metadata } from "next";
import { Landing } from "@/routes/index";

export const metadata: Metadata = {
  title: "Reado — The Open-Source Readwise Alternative | No Subscriptions",
  description:
    "The #1 open-source Readwise alternative with no recurring subscriptions. Reado resurfaces your Kindle book highlights & saved web articles directly to your inbox on your schedule. Self-host for free or get the $49 lifetime Founder Pass.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "readwise alternative",
    "open source readwise alternative",
    "self host readwise alternative",
    "readwise alternative lifetime",
    "readwise alternative no subscription",
    "omnivore alternative",
    "self hosted reading app",
    "readwise one time payment",
    "readwise lifetime deal",
    "readwise vs reado",
    "kindle highlights without subscription",
    "remember what you read",
    "kindle email digest",
  ],
  openGraph: {
    title: "Reado — The Open-Source Readwise Alternative with No Subscriptions",
    description:
      "Tired of paying $100+ a year for Readwise? Reado is the open-source $49 lifetime pass to remember what you read with daily email reviews, Kindle imports, and web articles.",
    url: "https://reado.lol",
  },
};

export default function HomePage() {
  return <Landing />;
}
