import type { Metadata } from "next";
import { Landing } from "@/routes/index";

export const metadata: Metadata = {
  title: "Reado — The Readwise Alternative with No Subscriptions | Lifetime Access",
  description:
    "The #1 Readwise alternative with no recurring subscriptions. Reado resurfaces your Kindle book highlights directly to your inbox on your schedule, so ideas actually stick. One-time $49 lifetime pass.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "readwise alternative",
    "readwise alternative lifetime",
    "readwise alternative no subscription",
    "readwise one time payment",
    "readwise lifetime deal",
    "readwise vs reado",
    "kindle highlights without subscription",
    "remember what you read",
    "kindle email digest",
  ],
  openGraph: {
    title: "Reado — The Readwise Alternative with No Subscriptions",
    description:
      "Tired of paying $100+ a year for Readwise? Reado is the one-time $49 lifetime pass to remember what you read with daily email reviews and Kindle imports.",
    url: "https://reado.lol",
  },
};

export default function HomePage() {
  return <Landing />;
}
