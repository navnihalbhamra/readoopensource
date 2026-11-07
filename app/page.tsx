import type { Metadata } from "next";
import { Landing } from "@/routes/index";

export const metadata: Metadata = {
  title: "Reado — The Reading Memory Engine | Remember What You Read",
  description:
    "You spend hours reading books — only to forget almost all of it weeks later. Reado resurfaces your best highlights directly to your inbox on your schedule, so ideas actually stick. Kindle clippings & CSV import.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <Landing />;
}
