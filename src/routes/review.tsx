import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@/lib/data";
import { useServerFn } from "@/lib/next-server-fn";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { HighlightSkeletons } from "@/components/Loaders";
import { BookCover } from "@/components/BookCover";
import { RequireAuth } from "@/components/RequireAuth";
import { useEffect } from "react";
import { Reveal } from "@/components/Reveal";
import { Spinner } from "@/components/Spinner";
import { useReaderPrefs } from "@/hooks/useReaderPrefs";
import { formatScheduleSummary } from "@/lib/digest-schedule";

export function Review() {
  const { prefs, update } = useReaderPrefs();
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: useServerFn("getProfile") });
  const review = useQuery({ queryKey: ["review"], queryFn: useServerFn("getReview") });
  const highlights = useQuery({ queryKey: ["highlights"], queryFn: useServerFn("listHighlights") });
  const books = useQuery({ queryKey: ["books"], queryFn: useServerFn("listBooks") });
  const bookById = new Map((books.data ?? []).map((b) => [b.id, b]));

  const claim = useMutation({
    mutationFn: useServerFn("claimFounderPass"),
    onSuccess: (res: { success?: boolean }) => {
      if (res?.success) {
        toast.success("Welcome to Founder Pass! You now have unlimited lifetime access.");
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        queryClient.invalidateQueries({ queryKey: ["highlights"] });
      }
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const checkoutId = params.get("checkout_id");
      const upgraded = params.get("upgraded");
      if (checkoutId || upgraded === "true") {
        claim.mutate({ data: { checkoutId: checkoutId || undefined } });
        const url = new URL(window.location.href);
        url.searchParams.delete("checkout_id");
        url.searchParams.delete("upgraded");
        window.history.replaceState({}, "", url.pathname);
      }
    }
  }, []);

  const removeHighlight = useMutation({
    mutationFn: useServerFn("deleteHighlight"),
    onSuccess: () => {
      toast.success("Highlight deleted");
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const total = highlights.data?.length ?? 0;
  return (
    <AppShell prefs={prefs} update={update} eyebrow="Review">
      <div className="pt-8 pb-6">
        <p className="eyebrow">Remember what you read</p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-balance">
          Today's review
        </h1>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          {total} highlights saved · a few quiet quotes surface each day to keep ideas fresh.
        </p>

        {/* Memory rhythm status banner */}
        {profile.data && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface/50 px-4 py-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-muted-foreground">Memory Routine:</span>
              <span className="font-medium text-foreground">
                {profile.data.digest_enabled !== false
                  ? formatScheduleSummary(profile.data.schedule)
                  : "Email digest is paused"}
              </span>
            </div>
            <Link
              href="/settings"
              className="text-xs text-primary underline-offset-4 hover:underline font-medium"
            >
              Change time or frequency →
            </Link>
          </div>
        )}

        {/* Free preview banner */}
        {profile.data?.entitlements && !profile.data.entitlements.isPro && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs">
            <span className="text-muted-foreground">
              Free preview: <strong className="text-foreground">{profile.data.entitlements.highlightCount} / 5</strong> quotes stored.
            </span>
            <Link href="/pricing" className="font-semibold text-primary hover:underline">
              Unlock Founder Pass ($49 lifetime) →
            </Link>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button
            className="chrome-btn"
            disabled={review.isFetching}
            onClick={() => review.refetch()}
          >
            {review.isFetching && <Spinner label="Shuffling" />}
            <span>{review.isFetching ? "Shuffling…" : "Shuffle quotes"}</span>
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
                            href={`/book/${book.id}`}
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
