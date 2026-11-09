import type { Metadata } from "next";
import { KindleCleaner } from "@/routes/kindle-cleaner";

export const metadata: Metadata = {
  title: "Free Kindle Clippings Cleaner — Convert My Clippings.txt to Markdown",
  description:
    "Clean, format, and deduplicate your messy Amazon Kindle 'My Clippings.txt' file into beautiful Markdown notes for Obsidian, Notion, Logseq, or your personal archive. 100% free & runs privately in your browser.",
  alternates: {
    canonical: "/kindle-clippings-cleaner",
  },
  keywords: [
    "kindle clippings cleaner",
    "my clippings txt to markdown",
    "convert kindle clippings to markdown",
    "kindle highlights to obsidian",
    "kindle highlights to notion",
    "clean kindle clippings",
    "kindle highlights parser",
    "readwise alternative",
    "export kindle highlights free without readwise",
    "kindle highlights without subscription",
    "reado kindle tool",
  ],
  openGraph: {
    title: "Free Kindle Clippings Cleaner — Convert My Clippings.txt to Markdown",
    description:
      "Turn messy Kindle clippings into clean, organized Markdown notes in seconds. 100% free, private, and runs in your browser.",
    url: "https://reado.lol/kindle-clippings-cleaner",
  },
};

export default function KindleCleanerPage() {
  return <KindleCleaner />;
}

