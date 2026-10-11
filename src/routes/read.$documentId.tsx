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

  const save = useMutation({
    mutationFn: useServerFn("saveHighlight"),
    onSuccess: () => {
      toast.success("Highlight saved");
      setSelection(null);
      window.getSelection()?.removeAllRanges();
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
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

  /* Text selection inside the article surfaces the save action. */
  const onSelect = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? "";
    if (!sel || sel.rangeCount === 0 || text.length < 4) {
      setSelection(null);
      return;
    }
    if (!articleRef.current?.contains(sel.anchorNode)) {
      setSelection(null);
      return;
    }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    setSelection({ text, x: rect.left + rect.width / 2, y: rect.top });
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", onSelect);
    return () => document.removeEventListener("selectionchange", onSelect);
  }, [onSelect]);

  const paragraphs = useMemo(
    () => (doc.data?.document.content ?? "").split(/\n\s*\n/).filter(Boolean),
    [doc.data],
  );
  const savedTexts = useMemo(() => (doc.data?.highlights ?? []).map((h) => h.text), [doc.data]);

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
          <Link href="/" className="chrome-btn mt-4">
            Back to library
          </Link>
        </div>
      </AppShell>
    );
  }

  const { document: item } = doc.data;

  return (
    <AppShell prefs={prefs} update={update} focus={prefs.focus} eyebrow="Reader">
      <div className="pt-8 pb-5">
        <p className="eyebrow">Reading now</p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-balance">
          {item.title}
        </h1>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          {item.author ?? "Unknown author"}
        </p>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{savedTexts.length} highlights</span>
            <span className="tabular-nums">{Math.round(Number(item.progress))}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-inkwash">
            <div
              className="h-full rounded-full bg-primary/70"
              style={{ width: `${Math.min(100, Number(item.progress))}%` }}
            />
          </div>
        </div>
      </div>

      <article
        ref={articleRef}
        className="pb-24"
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

      {selection && (
        <div
          className="fixed z-40 -translate-x-1/2 -translate-y-full pb-2"
          style={{ left: selection.x, top: selection.y }}
        >
          <button
            className="brass-btn shadow-lg"
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
            {save.isPending ? "Saving…" : "Save highlight"}
          </button>
        </div>
      )}

      <button
        onClick={toggleFocus}
        className="fixed bottom-5 right-5 z-30 rounded-full bg-surface px-3.5 py-2 text-[11px] font-medium text-muted-foreground ring-1 ring-border transition-colors hover:text-foreground"
      >
        {prefs.focus ? "Show chrome" : "Focus mode"}
        <span className="ml-1.5 text-muted-foreground/60">[ ]</span>
      </button>
    </AppShell>
  );
}
