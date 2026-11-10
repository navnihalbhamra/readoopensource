import type { Metadata } from "next";
import { ArticlesPage } from "@/routes/articles";

export const metadata: Metadata = {
  title: "Articles & Reading Queue — Read-It-Later with No Subscriptions | Reado",
  description:
    "Save web articles, newsletters, and essays to read in a calm typography reader. Highlight passages, sync with your spaced repetition review room, and remember what you read.",
};

export default function Page() {
  return <ArticlesPage />;
}

