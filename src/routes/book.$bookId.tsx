import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { BookCover } from "@/components/BookCover";
import { RequireAuth } from "@/components/RequireAuth";
import { useReaderPrefs } from "@/hooks/useReaderPrefs";
import { deleteBook, deleteHighlight, enrichBooks, getBook, updateBook } from "@/lib/focus.functions";

export const Route = createFileRoute("/book/$bookId")({
  head: () => ({
    meta: [
      { title: "Book — Reado" },
      {
        name: "description",
        content:
          "Cover art, author details and every passage you've highlighted from this book, in one quiet page.",
      },
      { property: "og:title", content: "Book — Reado" },
      {
        property: "og:description",
        content: "All your highlights from a single book, with its cover and author info.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <BookPage />
    </RequireAuth>
  ),
});

function BookPage() {
  const { bookId } = useParams({ from: "/book/$bookId" });
  const { prefs, update } = useReaderPrefs();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fetchBook = useServerFn(getBook);
  const book = useQuery({
    queryKey: ["book", bookId],
    queryFn: () => fetchBook({ data: { id: bookId } }),
  });

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["book", bookId] });
    queryClient.invalidateQueries({ queryKey: ["books"] });
    queryClient.invalidateQueries({ queryKey: ["highlights"] });
    queryClient.invalidateQueries({ queryKey: ["review"] });
  };

  const relookup = useMutation({
    mutationFn: useServerFn(enrichBooks),
    onSuccess: () => {
      toast.success("Looked the book up again");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const save = useMutation({
    mutationFn: useServerFn(updateBook),
    onSuccess: () => {
      toast.success("Book details saved");
      setEditing(false);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeBook = useMutation({
    mutationFn: useServerFn(deleteBook),
    onSuccess: () => {
      toast.success("Book deleted");
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
      navigate({ to: "/books", replace: true });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeHighlight = useMutation({
    mutationFn: useServerFn(deleteHighlight),
    onSuccess: () => {
      toast.success("Highlight deleted");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const record = book.data?.book;
  const highlights = book.data?.highlights ?? [];

  return (
    <AppShell prefs={prefs} update={update} eyebrow="Book">
      {book.isLoading && <p className="pt-8 text-[12px] text-muted-foreground">Loading…</p>}
      {book.error && (
        <p className="pt-8 text-[12px] text-destructive">{(book.error as Error).message}</p>
      )}

      {record && (
        <>
          <div className="flex gap-5 pt-8 pb-6">
            <BookCover
              title={record.title}
              author={record.author}
              coverUrl={record.cover_url}
              className="w-24"
              mono={!prefs.colorCovers}
            />
            <div className="min-w-0">
              <p className="eyebrow">Book</p>
              <h1 className="mt-2 font-display text-2xl font-semibold leading-tight tracking-tight text-balance">
                {record.title}
              </h1>
              <p className="mt-1.5 font-body text-[13px] text-muted-foreground">
                {[record.author, record.published_year, `${highlights.length} highlight${highlights.length === 1 ? "" : "s"}`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="chrome-btn"
                  disabled={relookup.isPending}
                  onClick={() => relookup.mutate({ data: { force_book_id: record.id } })}
                >
                  {relookup.isPending ? "Searching…" : "Find book"}
                </button>
                <button
                  className="chrome-btn"
                  onClick={() => {
                    setTitle(record.title);
                    setAuthor(record.author ?? "");
                    setCoverUrl(record.cover_url ?? "");
                    setEditing((open) => !open);
                  }}
                >
                  Edit details
                </button>
                <button
                  className="chrome-btn hover:text-destructive"
                  disabled={removeBook.isPending}
                  onClick={() => {
                    const keep =
                      highlights.length > 0
                        ? !window.confirm(
                            `Delete "${record.title}" and its ${highlights.length} highlight${highlights.length === 1 ? "" : "s"}?\n\nOK = delete everything · Cancel = remove the book but keep the highlights.`,
                          )
                        : false;
                    removeBook.mutate({ data: { id: record.id, keep_highlights: keep } });
                  }}
                >
                  {removeBook.isPending ? "Deleting…" : "Delete book"}
                </button>
              </div>
            </div>
          </div>

          {editing && (
            <section className="mb-6 rounded-xl border border-border bg-surface/60 p-4">
              <div className="grid gap-2.5">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full rounded-lg bg-surface px-3 py-2 text-[13px] ring-1 ring-border outline-none focus:ring-primary"
                />
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Author"
                  className="w-full rounded-lg bg-surface px-3 py-2 text-[13px] ring-1 ring-border outline-none focus:ring-primary"
                />
                <input
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="Cover image URL (https://…)"
                  className="w-full rounded-lg bg-surface px-3 py-2 font-mono text-[12px] ring-1 ring-border outline-none focus:ring-primary"
                />
              </div>
              <button
                className="brass-btn mt-3"
                disabled={save.isPending || !title.trim()}
                onClick={() =>
                  save.mutate({
                    data: {
                      id: record.id,
                      title: title.trim(),
                      author: author.trim() || null,
                      cover_url: coverUrl.trim() || null,
                    },
                  })
                }
              >
                {save.isPending ? "Saving…" : "Save details"}
              </button>
            </section>
          )}

          {record.description && (
            <p className="mb-8 font-body text-[13px] leading-relaxed text-muted-foreground">
              {record.description}
            </p>
          )}

          <ul className="space-y-6 pb-16">
            {highlights.map((h) => (
              <li key={h.id} className="group border-l-2 border-primary/50 pl-4">
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
                    Delete
                  </button>
                </div>
                {h.note && (
                  <p className="mt-1.5 font-body text-[13px] text-muted-foreground">{h.note}</p>
                )}
                {h.location && (
                  <p className="mt-1.5 text-[11px] text-muted-foreground/80">{h.location}</p>
                )}
              </li>
            ))}
          </ul>

          {highlights.length === 0 && (
            <p className="pb-16 font-body text-sm text-muted-foreground">
              No highlights filed under this book yet. <Link to="/import">Import some</Link>.
            </p>
          )}
        </>
      )}
    </AppShell>
  );
}
