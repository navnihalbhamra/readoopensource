import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@/lib/data";
import { useServerFn } from "@/lib/next-server-fn";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { HighlightSkeletons } from "@/components/Loaders";
import { BookCover } from "@/components/BookCover";
import { RequireAuth } from "@/components/RequireAuth";
import { Reveal } from "@/components/Reveal";
import { Spinner } from "@/components/Spinner";
import { useReaderPrefs } from "@/hooks/useReaderPrefs";
import { toast } from "sonner";

export function Highlights() {
  const { prefs, update } = useReaderPrefs();
  const [query, setQuery] = useState("");
  const highlights = useQuery({ queryKey: ["highlights"], queryFn: useServerFn("listHighlights") });
  const books = useQuery({ queryKey: ["books"], queryFn: useServerFn("listBooks") });
  const bookById = new Map((books.data ?? []).map((b) => [b.id, b]));
  const queryClient = useQueryClient();
  const removeHighlight = useMutation({
    mutationFn: useServerFn("deleteHighlight"),
    onSuccess: () => {
      toast.success("Highlight deleted");
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const grouped = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = (highlights.data ?? []).filter((h) =>
      needle ? `${h.text} ${h.book_title} ${h.author ?? ""}`.toLowerCase().includes(needle) : true,
    );
    const map = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = row.book_title;
      map.set(key, [...(map.get(key) ?? []), row]);
    }
    return [...map.entries()];
  }, [highlights.data, query]);

  return (
    <AppShell prefs={prefs} update={update} eyebrow="Highlights">
      <div className="pt-8 pb-6">
        <p className="eyebrow">Archive</p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-balance">
          Highlights
        </h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search passages, books, authors"
          className="mt-5 w-full rounded-lg bg-surface px-3.5 py-2.5 text-[13px] ring-1 ring-border outline-none placeholder:text-muted-foreground/70 focus:ring-primary"
        />
      </div>

      {highlights.isLoading && <HighlightSkeletons count={3} />}

      <div className="space-y-10 pb-16">
        {grouped.map(([book, rows]) => {
          const firstRow = rows[0];
          const meta = firstRow?.book_id ? bookById.get(firstRow.book_id) : undefined;
          return (
            <section key={book}>
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <BookCover
                  title={book}
                  coverUrl={meta?.cover_url}
                  className="w-11"
                  mono={!prefs.colorCovers}
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-lg font-semibold tracking-tight">
                    {meta ? (
                      <Link href={`/book/${meta.id}`} className="hover:text-primary">
                        {book}
                      </Link>
                    ) : (
                      book
                    )}
                  </h2>
                  <p className="mt-0.5 truncate text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {[rows[0]?.author, `${rows.length} highlight${rows.length === 1 ? "" : "s"}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-5">
                {rows.map((h, index) => (
                  <Reveal key={h.id} delay={index * 45}>
                    <li className="group border-l-2 border-primary/50 pl-3.5 transition-transform duration-300 hover:translate-x-1">
                      <div className="flex items-start gap-3">
                        <p className="flex-1 font-body text-[15px] italic leading-snug text-foreground/90">
                          {h.text}
                        </p>
                        <button
                          aria-label="Delete highlight"
                          disabled={removeHighlight.isPending}
                          onClick={() => removeHighlight.mutate({ data: { id: h.id } })}
                          className="shrink-0 rounded-md px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground/70 opacity-0 transition-opacity hover:text-destructive focus:opacity-100 group-hover:opacity-100"
                        >
                          {removeHighlight.isPending ? <Spinner label="Deleting" /> : "Delete"}
                        </button>
                      </div>
                      {h.note && (
                        <p className="mt-1.5 font-body text-[13px] text-muted-foreground">
                          {h.note}
                        </p>
                      )}
                      <p className="mt-1.5 text-[11px] text-muted-foreground/80">
                        {[h.author, h.location].filter(Boolean).join(" · ")}
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {grouped.length === 0 && !highlights.isLoading && (
        <p className="pb-16 font-body text-sm text-muted-foreground">
          No highlights match yet — import a clippings file or highlight while reading.
        </p>
      )}
    </AppShell>
  );
}
