import { createFileRoute, Link } from "@/lib/next-router-compat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/lib/next-server-fn";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { BookCover } from "@/components/BookCover";
import { BookSkeletons } from "@/components/Loaders";
import { RequireAuth } from "@/components/RequireAuth";
import { Spinner } from "@/components/Spinner";
import { useReaderPrefs } from "@/hooks/useReaderPrefs";
import { deleteBook, enrichBooks, listBooks } from "@/lib/focus.functions";

export const Route = createFileRoute("/books")({
  head: () => ({
    meta: [
      { title: "Your books — Reado" },
      {
        name: "description",
        content:
          "Every book you've highlighted, matched automatically to its cover art, author and publication year.",
      },
      { property: "og:title", content: "Your books — Reado" },
      {
        property: "og:description",
        content: "Covers and author details for every book in your highlight library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Books />
    </RequireAuth>
  ),
});

function Books() {
  const { prefs, update } = useReaderPrefs();
  const queryClient = useQueryClient();
  const books = useQuery({ queryKey: ["books"], queryFn: useServerFn(listBooks) });

  const enrich = useMutation({
    mutationFn: useServerFn(enrichBooks),
    onSuccess: (result: { matched: number; attempted: number; books: number }) => {
      toast.success(
        `Matched ${result.matched} of ${result.attempted} books · ${result.books} in library`,
      );
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
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
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = books.data ?? [];

  return (
    <AppShell prefs={prefs} update={update} eyebrow="Books">
      <div className="pt-8 pb-6">
        <p className="eyebrow">Library</p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-balance">
          Your books
        </h1>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          {rows.length} books · covers and author details are matched from Open Library and Google
          Books.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="brass-btn"
            disabled={enrich.isPending}
            onClick={() => enrich.mutate({ data: {} })}
          >
            {enrich.isPending && <Spinner label="Finding covers and authors" />}
            {enrich.isPending ? "Looking up books…" : "Find covers & authors"}
          </button>
          <button
            className="chrome-btn"
            onClick={() => update({ colorCovers: !prefs.colorCovers })}
          >
            {prefs.colorCovers ? "Grayscale covers" : "Colour covers"}
          </button>
        </div>
      </div>

      {books.isLoading && <BookSkeletons count={6} />}

      <ul className="grid grid-cols-2 gap-5 pb-16 sm:grid-cols-3">
        {rows.map((book, index) => (
          <li key={book.id} className="group relative book-item" style={{ animationDelay: `${index * 55}ms` }}>
            <Link to="/book/$bookId" params={{ bookId: book.id }} className="block">
              <BookCover
                title={book.title}
                author={book.author}
                coverUrl={book.cover_url}
                className="w-full transition-transform duration-500 group-hover:-translate-y-1 group-hover:shadow-xl"
                mono={!prefs.colorCovers}
              />
              <p className="mt-2 font-display text-[13px] font-semibold leading-snug tracking-tight group-hover:text-primary">
                {book.title}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {[book.author, `${book.highlight_count} highlight${book.highlight_count === 1 ? "" : "s"}`].filter(Boolean).join(" · ")}
              </p>
            </Link>
            <button
              aria-label={`Delete ${book.title}`}
              disabled={removeBook.isPending}
              onClick={() => {
                const keep = book.highlight_count > 0
                  ? !window.confirm(
                      `Delete "${book.title}" and its ${book.highlight_count} highlight${book.highlight_count === 1 ? "" : "s"}?\n\nOK = delete everything · Cancel = remove the book but keep the highlights.`,
                    )
                  : false;
                removeBook.mutate({ data: { id: book.id, keep_highlights: keep } });
              }}
              className="absolute right-1.5 top-1.5 rounded-md bg-background/85 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-destructive focus:opacity-100 group-hover:opacity-100"
            >
              {removeBook.isPending ? <Spinner label="Deleting book" /> : "Delete"}
            </button>
          </li>
        ))}
      </ul>

      {!books.isLoading && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-5">
          <p className="font-body text-sm text-muted-foreground">
            No books yet — import a clippings file and they'll appear here with cover art.
          </p>
          <Link to="/import" className="brass-btn mt-4">
            Import highlights
          </Link>
        </div>
      )}
    </AppShell>
  );
}

export { Books };
