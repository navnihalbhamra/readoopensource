import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@/lib/data";
import { useServerFn } from "@/lib/next-server-fn";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { HighlightSkeletons } from "@/components/Loaders";
import { BookCover } from "@/components/BookCover";
import { RequireAuth } from "@/components/RequireAuth";
import { Reveal } from "@/components/Reveal";
import { Spinner } from "@/components/Spinner";
import { useReaderPrefs } from "@/hooks/useReaderPrefs";

export function Review() {
  const { prefs, update } = useReaderPrefs();
  const review = useQuery({ queryKey: ["review"], queryFn: useServerFn("getReview") });
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
  const total = highlights.data?.length ?? 0;
  return (
    <AppShell prefs={prefs} update={update} eyebrow="Review">
      <div className="pt-8 pb-6">
        <p className="eyebrow">Daily review</p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-balance">
          Today's highlights
        </h1>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          {total} highlights saved · a few surface here each visit.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            className="chrome-btn"
            disabled={review.isFetching}
            onClick={() => review.refetch()}
          >
            {review.isFetching && <Spinner label="Shuffling" />}
            <span>{review.isFetching ? "Shuffling…" : "Shuffle"}</span>
          </button>
          <Link href="/import" className="brass-btn">
            Import highlights
          </Link>
        </div>
      </div>
      <section className="pb-16">
        {review.isLoading && <HighlightSkeletons count={3} />}
        {review.error && (
          <p className="text-[12px] text-destructive">{(review.error as Error).message}</p>
        )}
        <ul className="space-y-4">
          {review.data?.map((h, index) => {
            const book = h.book_id ? bookById.get(h.book_id) : undefined;
            const meta = [h.book_title, h.author].filter(Boolean).join(" · ");
            return (
              <Reveal key={h.id} delay={index * 65}>
                <li className="group rounded-xl border border-border bg-surface/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-lg hover:shadow-background/20">
                  <div className="flex gap-4">
                    <BookCover
                      title={h.book_title}
                      author={h.author}
                      coverUrl={book?.cover_url}
                      className="w-14"
                      mono={!prefs.colorCovers}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-[17px] italic leading-relaxed text-foreground/90">
                        {h.text}
                      </p>
                      {h.note && (
                        <p className="mt-2 font-body text-[13px] text-muted-foreground">{h.note}</p>
                      )}
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                        {book ? (
                          <Link
                            href={`/book/book.id`}
                            className="min-w-0 truncate text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
                          >
                            {meta}
                            {h.location ? ` · ${h.location}` : ""}
                          </Link>
                        ) : (
                          <p className="min-w-0 truncate text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                            {meta}
                            {h.location ? ` · ${h.location}` : ""}
                          </p>
                        )}
                        <button
                          aria-label="Delete highlight"
                          disabled={removeHighlight.isPending}
                          onClick={() => removeHighlight.mutate({ data: { id: h.id } })}
                          className="shrink-0 rounded-md text-[11px] uppercase tracking-[0.12em] text-muted-foreground/60 transition-colors hover:text-destructive md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                        >
                          {removeHighlight.isPending ? <Spinner label="Deleting" /> : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              </Reveal>
            );
          })}
        </ul>
        {!review.isLoading && (review.data?.length ?? 0) === 0 && (
          <div className="rounded-xl border border-dashed border-border p-5">
            <p className="font-body text-sm text-muted-foreground">
              No highlights yet. Import a Kindle clippings file or a CSV export to start reviewing.
            </p>
            <Link href="/import" className="brass-btn mt-4">
              Import highlights
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}
