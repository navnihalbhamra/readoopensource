"use client";

import * as React from "react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@/lib/data";
import { useServerFn } from "@/lib/next-server-fn";
import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Spinner } from "@/components/Spinner";
import { useReaderPrefs } from "@/hooks/useReaderPrefs";

interface DocumentItem {
  id: string;
  title: string;
  author: string | null;
  source: string;
  progress: number;
  created_at: string;
  word_count?: number;
  reading_time_minutes?: number;
  highlight_count?: number;
}

const SAMPLE_ESSAY = {
  url: "https://paulgraham.com/lesson.html",
  title: "The Lesson to Unlearn",
  author: "Paul Graham",
  content: `The most damaging thing you learned in school is that life is a game you can win by hacking the test.

In school, almost everything you do is evaluated by tests. And tests in school are almost all artificially constrained. There is an authority figure who knows the right answer, and your job is to guess what they want.

In the real world, problems are not cleanly defined. No authority figure has the answer key. What matters is not whether you can convince a teacher that you did your homework, but whether you actually made something that works.

When you start working on open-ended problems, you have to unlearn the instinct to game the system. Instead of asking 'What does the teacher want?', you have to ask 'What is actually true?'.`,
};

export function ArticlesPage() {
  const { prefs, update } = useReaderPrefs();
  const queryClient = useQueryClient();

  const [urlInput, setUrlInput] = useState("");
  const [filterTab, setFilterTab] = useState<"reading" | "finished" | "all">("reading");
  const [searchQuery, setSearchQuery] = useState("");

  const listDocs = useServerFn("listDocuments");
  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: () => listDocs({ data: {} }),
  });

  const saveUrl = useMutation({
    mutationFn: useServerFn("saveArticleUrl"),
    onSuccess: (result: { id: string; title: string }) => {
      toast.success(`Saved "${result.title}" to your reading queue!`, {
        action: {
          label: "Read now →",
          onClick: () => {
            window.location.href = `/read/${result.id}`;
          },
        },
      });
      setUrlInput("");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not save article. Please verify the URL.");
    },
  });

  const createDoc = useMutation({
    mutationFn: useServerFn("createDocument"),
    onSuccess: (result: { id: string }) => {
      toast.success("Sample article added to your library!");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateProgress = useMutation({
    mutationFn: useServerFn("saveProgress"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeDoc = useMutation({
    mutationFn: useServerFn("deleteDocument"),
    onSuccess: () => {
      toast.success("Article removed from library");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlInput.trim();
    if (!url) {
      toast.error("Please enter an article URL.");
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      toast.error("Please enter a valid URL starting with https:// or http://");
      return;
    }
    saveUrl.mutate({ data: { url } });
  };

  const handleAddSample = () => {
    createDoc.mutate({
      data: {
        title: SAMPLE_ESSAY.title,
        author: SAMPLE_ESSAY.author,
        content: SAMPLE_ESSAY.content,
      },
    });
  };

  const allItems: DocumentItem[] = documentsQuery.data ?? [];

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Tab filter
      const isFinished = (item.progress ?? 0) >= 100;
      if (filterTab === "reading" && isFinished) return false;
      if (filterTab === "finished" && !isFinished) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title?.toLowerCase().includes(q);
        const inAuthor = item.author?.toLowerCase().includes(q);
        const inSource = item.source?.toLowerCase().includes(q);
        if (!inTitle && !inAuthor && !inSource) return false;
      }

      return true;
    });
  }, [allItems, filterTab, searchQuery]);

  const readingCount = allItems.filter((d) => (d.progress ?? 0) < 100).length;
  const finishedCount = allItems.filter((d) => (d.progress ?? 0) >= 100).length;

  const getDomainFromSource = (source: string) => {
    try {
      if (source.startsWith("http")) {
        return new URL(source).hostname.replace(/^www\./, "");
      }
    } catch {
      // fallback
    }
    return source || "article";
  };

  return (
    <RequireAuth>
      <AppShell prefs={prefs} update={update} eyebrow="Articles">
        <div className="pt-8 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Read-It-Later · Omnivore Engine</p>
              <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                Articles & Reading Queue
              </h1>
              <p className="mt-1.5 font-body text-sm text-muted-foreground">
                Save web articles, essays, and newsletters. Read in a calm typography reader, highlight passages, and retain ideas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/import" className="chrome-btn text-xs">
                Import from Omnivore
              </Link>
            </div>
          </div>

          {/* Quick Save URL Input Box */}
          <form
            onSubmit={handleSaveUrl}
            className="mt-6 rounded-2xl border border-border bg-surface/70 p-4 shadow-sm backdrop-blur-sm sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste article URL to save (e.g. https://paulgraham.com/lesson.html)"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={saveUrl.isPending}
                />
              </div>
              <button
                type="submit"
                disabled={saveUrl.isPending || !urlInput.trim()}
                className="brass-btn px-6 py-3 text-sm font-semibold whitespace-nowrap shadow-sm disabled:opacity-50"
              >
                {saveUrl.isPending && <Spinner label="Scraping article" />}
                {saveUrl.isPending ? "Extracting Article…" : "Save Article"}
              </button>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Supports Substack, Medium, blogs, news, and personal essays.</span>
              <button
                type="button"
                onClick={() => setUrlInput(SAMPLE_ESSAY.url)}
                className="underline hover:text-foreground"
              >
                Insert sample URL
              </button>
            </div>
          </form>

          {/* Controls: Tabs & Search */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterTab("reading")}
                className={`rounded-lg px-3 py-1.5 font-display text-xs font-semibold transition-all ${
                  filterTab === "reading"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Reading Queue ({readingCount})
              </button>
              <button
                onClick={() => setFilterTab("finished")}
                className={`rounded-lg px-3 py-1.5 font-display text-xs font-semibold transition-all ${
                  filterTab === "finished"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Finished ({finishedCount})
              </button>
              <button
                onClick={() => setFilterTab("all")}
                className={`rounded-lg px-3 py-1.5 font-display text-xs font-semibold transition-all ${
                  filterTab === "all"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({allItems.length})
              </button>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search saved articles…"
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        {documentsQuery.isLoading ? (
          <div className="py-16 text-center">
            <Spinner label="Loading articles" />
            <p className="mt-3 font-body text-xs text-muted-foreground">Opening your reading queue…</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border/80 bg-surface/30 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl text-primary">
              📖
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              {filterTab === "finished" ? "No finished articles yet" : "Your reading queue is empty"}
            </h3>
            <p className="mx-auto mt-2 max-w-md font-body text-xs text-muted-foreground leading-relaxed">
              Paste any article link in the box above to save it for distraction-free reading, or import your saved articles from Omnivore.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleAddSample}
                disabled={createDoc.isPending}
                className="brass-btn text-xs"
              >
                {createDoc.isPending ? "Adding…" : "Add sample essay to test"}
              </button>
              <Link href="/import" className="chrome-btn text-xs">
                Import from Omnivore
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-20">
            {filteredItems.map((doc) => {
              const isFinished = (doc.progress ?? 0) >= 100;
              const domain = getDomainFromSource(doc.source);

              return (
                <article
                  key={doc.id}
                  className="group relative rounded-2xl border border-border/80 bg-surface/40 p-5 transition-all duration-200 hover:border-primary/40 hover:bg-surface/70 hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      {/* Meta Pill Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-border/80 bg-background/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {domain}
                        </span>
                        {doc.reading_time_minutes ? (
                          <span className="text-[11px] text-muted-foreground">
                            📖 {doc.reading_time_minutes} min read
                          </span>
                        ) : null}
                        {doc.word_count ? (
                          <span className="text-[11px] text-muted-foreground/80">
                            · {doc.word_count.toLocaleString()} words
                          </span>
                        ) : null}
                        {doc.highlight_count && doc.highlight_count > 0 ? (
                          <span className="rounded-full bg-accent/10 px-2 py-0.2 text-[10px] font-semibold text-accent">
                            ⚡ {doc.highlight_count} highlight{doc.highlight_count === 1 ? "" : "s"}
                          </span>
                        ) : null}
                      </div>

                      {/* Title */}
                      <h2 className="mt-2 font-display text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-xl">
                        <Link href={`/read/${doc.id}`}>{doc.title}</Link>
                      </h2>

                      {/* Author */}
                      <p className="mt-1 font-body text-xs text-muted-foreground">
                        {doc.author ? `By ${doc.author}` : "Web Article"}
                      </p>

                      {/* Progress bar */}
                      <div className="mt-4 flex max-w-md items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-inkwash">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFinished ? "bg-emerald-500" : "bg-primary"
                            }`}
                            style={{ width: `${Math.min(100, Number(doc.progress))}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                          {Math.round(Number(doc.progress))}%
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex shrink-0 items-center gap-2 border-t border-border/40 pt-3 sm:border-0 sm:pt-0">
                      <Link
                        href={`/read/${doc.id}`}
                        className="brass-btn text-xs font-semibold px-4 py-2"
                      >
                        {isFinished ? "Re-read" : doc.progress > 0 ? "Resume" : "Read"} →
                      </Link>

                      <button
                        title={isFinished ? "Mark as unread" : "Mark as finished"}
                        onClick={() =>
                          updateProgress.mutate({
                            data: { id: doc.id, progress: isFinished ? 0 : 100 },
                          })
                        }
                        className="chrome-btn text-xs px-2.5 py-2"
                      >
                        {isFinished ? "↺ Unread" : "✓ Finished"}
                      </button>

                      <button
                        title="Delete article"
                        onClick={() => {
                          if (confirm(`Remove "${doc.title}" from your library?`)) {
                            removeDoc.mutate({ data: { id: doc.id } });
                          }
                        }}
                        className="rounded-lg p-2 text-xs text-muted-foreground/60 transition-colors hover:text-destructive hover:bg-destructive/10"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </AppShell>
    </RequireAuth>
  );
}

