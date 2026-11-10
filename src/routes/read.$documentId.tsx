"use client";

import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@/lib/data";
import { useServerFn } from "@/lib/next-server-fn";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { useReaderPrefs } from "@/hooks/useReaderPrefs";

/** Split a paragraph so already-saved passages render with the ink wash. */
function renderParagraph(text: string, saved: string[]) {
  const matches = saved
    .map((s) => ({ s, index: text.indexOf(s) }))
    .filter((m) => m.index !== -1 && m.s.length > 3)
    .sort((a, b) => a.index - b.index);

  if (matches.length === 0) return text;

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  matches.forEach((match, i) => {
    if (match.index < cursor) return;
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(
      <mark key={i} className="ink-wash text-foreground">
        {match.s}
      </mark>,
    );
    cursor = match.index + match.s.length;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

export function Reader({ documentId }: { documentId: string }) {
  const { prefs, update, toggleFocus } = useReaderPrefs();
  const queryClient = useQueryClient();
  const articleRef = useRef<HTMLElement>(null);

  const fetchDoc = useServerFn("getDocument");
  const doc = useQuery({
    queryKey: ["document", documentId],
    queryFn: () => fetchDoc({ data: { id: documentId } }),
  });

  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Web Speech API / TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  const save = useMutation({
    mutationFn: useServerFn("saveHighlight"),
    onSuccess: () => {
      toast.success("Highlight saved to library & review room");
      setSelection(null);
      setShowNoteInput(false);
      setNoteText("");
      window.getSelection()?.removeAllRanges();
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        action: error.message.includes("Founder Pass")
          ? {
              label: "Get Pass",
              onClick: () => {
                window.location.href = "/pricing";
              },
            }
          : undefined,
      });
    },
  });

  const deleteHighlight = useMutation({
    mutationFn: useServerFn("deleteHighlight"),
    onSuccess: () => {
      toast.success("Highlight removed");
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const persistProgress = useServerFn("saveProgress");

  /* [ and ] toggle focus mode, matching the reader shortcut convention. */
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      if (event.key === "[" || event.key === "]") {
        event.preventDefault();
        toggleFocus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleFocus]);

  /* Track scroll depth and persist it, throttled to whole percents. */
  useEffect(() => {
    let last = -1;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function onScroll() {
      const max = document.body.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
      if (pct === last) return;
      last = pct;
      clearTimeout(timer);
      timer = setTimeout(() => {
        persistProgress({ data: { id: documentId, progress: pct } }).catch(() => {});
      }, 1200);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [documentId, persistProgress]);

  /* Stop speech if component unmounts */
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* Text selection inside the article surfaces the save action. */
  const onSelect = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? "";
    if (!sel || sel.rangeCount === 0 || text.length < 4) {
      if (!showNoteInput) setSelection(null);
      return;
    }
    if (!articleRef.current?.contains(sel.anchorNode)) {
      if (!showNoteInput) setSelection(null);
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    setSelection({ text, x: rect.left + rect.width / 2, y: rect.top });
  }, [showNoteInput]);

  useEffect(() => {
    document.addEventListener("selectionchange", onSelect);
    return () => document.removeEventListener("selectionchange", onSelect);
  }, [onSelect]);

  const paragraphs = useMemo(
    () => (doc.data?.document.content ?? "").split(/\n\s*\n/).filter(Boolean),
    [doc.data],
  );
  const highlights = useMemo(() => doc.data?.highlights ?? [], [doc.data]);
  const savedTexts = useMemo(() => highlights.map((h) => h.text), [highlights]);

  const words = useMemo(() => {
    return (doc.data?.document.content ?? "").trim().split(/\s+/).filter(Boolean).length;
  }, [doc.data]);

  const readingTime = useMemo(() => Math.max(1, Math.round(words / 220)), [words]);

  // Audio / Speech Synthesis controls
  const handleStartAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported by your browser.");
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    window.speechSynthesis.cancel();
    const content = doc.data?.document.content || "";
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = speechRate;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handlePauseAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  // Export highlights to Obsidian/Markdown
  const handleExportMarkdown = () => {
    if (!doc.data) return;
    const { document: d } = doc.data;
    const lines = [
      `# ${d.title}`,
      d.author ? `**Author:** ${d.author}` : null,
      d.source ? `**Source:** [Original Article](${d.source})` : null,
      `**Exported:** ${new Date().toLocaleDateString()}`,
      `**Highlights:** ${highlights.length}`,
      "",
      "---",
      "",
      "## Highlights & Notes",
      "",
      ...highlights.map((h) => {
        const quoteBlock = `> ${h.text}`;
        const noteBlock = h.note ? `\n\n*Note: ${h.note}*` : "";
        return `${quoteBlock}${noteBlock}\n`;
      }),
    ].filter(Boolean);

    const md = lines.join("\n");
    navigator.clipboard.writeText(md).then(
      () => toast.success("Copied article highlights & notes as Markdown!"),
      () => toast.error("Could not copy to clipboard.")
    );
  };

  if (doc.isLoading) {
    return (
      <AppShell prefs={prefs} update={update}>
        <p className="pt-10 text-[12px] text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }
  if (doc.error || !doc.data) {
    return (
      <AppShell prefs={prefs} update={update}>
        <div className="pt-10">
          <p className="text-[13px] text-destructive">
            {(doc.error as Error)?.message ?? "Document not found"}
          </p>
          <Link href="/articles" className="chrome-btn mt-4">
            Back to articles
          </Link>
        </div>
      </AppShell>
    );
  }

  const { document: item } = doc.data;
  const isFinished = (item.progress ?? 0) >= 100;
  const isExternalUrl = item.source?.startsWith("http");

  return (
    <AppShell prefs={prefs} update={update} focus={prefs.focus} eyebrow="Reader">
      {/* Article Top Navigation Bar */}
      <div className="pt-8 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 text-xs text-muted-foreground">
          <Link href="/articles" className="inline-flex items-center gap-1.5 hover:text-foreground">
            ← Reading Queue
          </Link>

          <div className="flex items-center gap-3">
            {isExternalUrl && (
              <a
                href={item.source}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <span>Original ↗</span>
              </a>
            )}

            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                highlights.length > 0
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-surface text-muted-foreground"
              }`}
            >
              ⚡ {highlights.length} highlight{highlights.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>

        <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
          {item.title}
        </h1>

        <div className="mt-2.5 flex flex-wrap items-center gap-3 font-body text-xs text-muted-foreground">
          <span>{item.author ?? "Unknown author"}</span>
          <span>·</span>
          <span>📖 {readingTime} min read</span>
          <span>·</span>
          <span>{words.toLocaleString()} words</span>
        </div>

        {/* Text-to-Speech Audio Player */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-surface/40 p-2.5">
          <span className="text-[11px] font-mono text-muted-foreground ml-1">Audio:</span>
          {!isSpeaking ? (
            <button
              onClick={handleStartAudio}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground hover:border-primary/50"
            >
              <span>▶ Listen to article</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={isPaused ? handleStartAudio : handlePauseAudio}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground hover:border-primary/50"
              >
                <span>{isPaused ? "▶ Resume" : "⏸ Pause"}</span>
              </button>
              <button
                onClick={handleStopAudio}
                className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                ⏹ Stop
              </button>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>Speed:</span>
            {[1, 1.25, 1.5].map((speed) => (
              <button
                key={speed}
                onClick={() => setSpeechRate(speed)}
                className={`rounded px-1.5 py-0.5 font-mono ${
                  speechRate === speed ? "bg-primary text-primary-foreground font-bold" : "hover:text-foreground"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Progress</span>
            <span className="tabular-nums font-mono">{Math.round(Number(item.progress))}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-inkwash">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFinished ? "bg-emerald-500" : "bg-primary/70"
              }`}
              style={{ width: `${Math.min(100, Number(item.progress))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Reading Typography Container */}
      <article
        ref={articleRef}
        className="pb-24 pt-4"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: `${prefs.fontSize}px`,
          lineHeight: prefs.lineHeight,
        }}
      >
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="mt-5 text-pretty text-foreground/90 first:mt-0">
            {renderParagraph(paragraph, savedTexts)}
          </p>
        ))}
      </article>

      {/* End of Article Footer */}
      <div className="border-t border-border/80 pt-8 pb-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-display text-base font-semibold text-foreground">
              {isFinished ? "Article Completed" : "Finished reading?"}
            </h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {highlights.length > 0
                ? `${highlights.length} quotes have been added to your daily review room and email routine.`
                : "Highlight any sentence above to save it to your daily review."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                persistProgress({ data: { id: item.id, progress: 100 } })
                  .then(() => {
                    toast.success("Marked as finished!");
                    queryClient.invalidateQueries({ queryKey: ["document", documentId] });
                    queryClient.invalidateQueries({ queryKey: ["documents"] });
                  })
                  .catch(() => {});
              }}
              className="brass-btn text-xs font-semibold px-4 py-2"
            >
              ✓ Mark as Finished
            </button>
            <Link href="/articles" className="chrome-btn text-xs px-4 py-2">
              Next in Queue →
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Selection Popup with Note support */}
      {selection && (
        <div
          className="fixed z-40 -translate-x-1/2 -translate-y-full pb-3"
          style={{ left: selection.x, top: selection.y }}
        >
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-2 shadow-2xl backdrop-blur-md">
            {!showNoteInput ? (
              <div className="flex items-center gap-1.5">
                <button
                  className="brass-btn px-3 py-1.5 text-xs font-semibold shadow-sm"
                  disabled={save.isPending}
                  onClick={() =>
                    save.mutate({
                      data: {
                        document_id: item.id,
                        book_title: item.title,
                        author: item.author,
                        text: selection.text,
                      },
                    })
                  }
                >
                  {save.isPending ? "Saving…" : "⚡ Highlight"}
                </button>

                <button
                  onClick={() => setShowNoteInput(true)}
                  className="chrome-btn px-2.5 py-1.5 text-xs"
                >
                  + Note
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selection.text);
                    toast.success("Copied quote to clipboard");
                    setSelection(null);
                  }}
                  className="rounded-lg p-1.5 text-xs text-muted-foreground hover:text-foreground"
                  title="Copy quote"
                >
                  📋
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-72">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a personal thought, reflection, or note…"
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background p-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowNoteInput(false)}
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    className="brass-btn px-3 py-1 text-xs font-semibold"
                    disabled={save.isPending}
                    onClick={() =>
                      save.mutate({
                        data: {
                          document_id: item.id,
                          book_title: item.title,
                          author: item.author,
                          text: selection.text,
                          note: noteText.trim() || undefined,
                        },
                      })
                    }
                  >
                    {save.isPending ? "Saving…" : "Save Quote & Note"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Highlights & Notes Slide-out Drawer */}
      {drawerOpen && (
        <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-border bg-surface/95 p-6 shadow-2xl backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">
                Article Highlights ({highlights.length})
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Synced with daily spaced repetition
              </p>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg p-1 text-sm text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {highlights.length === 0 ? (
              <p className="text-center py-10 font-body text-xs text-muted-foreground">
                No highlights in this article yet. Select any sentence to save it!
              </p>
            ) : (
              highlights.map((h) => (
                <div
                  key={h.id}
                  className="rounded-xl border border-border/70 bg-background/70 p-3.5 text-left text-xs"
                >
                  <blockquote className="font-body italic text-foreground/90 border-l-2 border-primary/50 pl-2.5">
                    “{h.text}”
                  </blockquote>
                  {h.note && (
                    <div className="mt-2 rounded bg-surface/80 p-2 font-body text-[11px] text-muted-foreground border border-border/50">
                      <span className="font-semibold text-accent">Note:</span> {h.note}
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>
                      {h.highlighted_at ? new Date(h.highlighted_at).toLocaleDateString() : ""}
                    </span>
                    <button
                      onClick={() => deleteHighlight.mutate({ data: { id: h.id } })}
                      className="text-destructive/70 hover:text-destructive"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {highlights.length > 0 && (
            <div className="border-t border-border/80 pt-4">
              <button
                onClick={handleExportMarkdown}
                className="brass-btn w-full text-center text-xs py-2.5 font-semibold"
              >
                Copy Markdown for Obsidian / Notion
              </button>
            </div>
          )}
        </aside>
      )}

      {/* Focus mode switch & Drawer toggle pills */}
      <div className="fixed bottom-5 right-5 z-30 flex items-center gap-2">
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="rounded-full bg-surface px-3.5 py-2 text-[11px] font-medium text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
        >
          <span>⚡ Highlights ({highlights.length})</span>
        </button>

        <button
          onClick={toggleFocus}
          className="rounded-full bg-surface px-3.5 py-2 text-[11px] font-medium text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
        >
          {prefs.focus ? "Show chrome" : "Focus mode"}
          <span className="ml-1.5 text-muted-foreground/60">[ ]</span>
        </button>
      </div>
    </AppShell>
  );
}
