import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@/lib/data";
import { useServerFn } from "@/lib/next-server-fn";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Spinner } from "@/components/Spinner";
import { useReaderPrefs } from "@/hooks/useReaderPrefs";

import { parseHighlightFile } from "@/lib/parse-highlights";
import { MAX_WORDS_PER_HIGHLIGHT } from "@/lib/plan";

export function ImportPage() {
  const { prefs, update } = useReaderPrefs();
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: useServerFn("getProfile") });
  const entitlements = profile.data?.entitlements;
  const isFree = entitlements?.highlightLimit !== null;
  const isAtLimit = isFree && (entitlements?.remaining ?? 0) <= 0;

  const fileRef = useRef<HTMLInputElement>(null);
  const [pasted, setPasted] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  React.useEffect(() => {
    try {
      const pending = localStorage.getItem("reado_pending_clippings");
      if (pending && !pasted) {
        setPasted(pending);
        localStorage.removeItem("reado_pending_clippings");
        toast.info("Pre-filled your clippings from the Kindle Cleaner tool!");
      }
    } catch {
      // ignore
    }
  }, []);

  const runEnrich = useServerFn("enrichBooks");

  const runImport = useMutation({
    mutationFn: useServerFn("importHighlights"),
    onSuccess: async (result: {
      parsed: number;
      imported: number;
      skipped: number;
      limit_reached?: boolean;
    }) => {
      setStatusMsg(null);
      if (result.parsed === 0) {
        toast.error(
          "Nothing recognisable in that text — try one quote per paragraph or upload a Kindle clippings or CSV export.",
        );
        return;
      }
      toast.success(
        `Imported ${result.imported} of ${result.parsed} highlights (${result.skipped} already saved or past limit)`,
      );
      if (result.limit_reached) {
        toast.warning(
          "Free preview limit reached (5 highlights). Unlock the Founder Pass ($49 lifetime) for unlimited highlights!",
        );
      }
      setPasted("");
      if (fileRef.current) fileRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });

      // Run book enrichment asynchronously in background without blocking import completion
      void runEnrich({ data: {} })
        .then((matched) => {
          if (matched && matched.matched > 0) {
            toast.success(`Found covers for ${matched.matched} books`);
            queryClient.invalidateQueries({ queryKey: ["books"] });
          }
        })
        .catch(() => {});
    },
    onError: (error: Error) => {
      setStatusMsg(null);
      toast.error(error.message);
    },
  });

  const addOne = useMutation({
    mutationFn: useServerFn("saveHighlight"),
    onSuccess: async () => {
      toast.success("Highlight saved");
      setText("");
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
      void runEnrich({ data: {} })
        .then(() => queryClient.invalidateQueries({ queryKey: ["books"] }))
        .catch(() => {});
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    // Instant client-side parse feedback
    try {
      const parsedItems = parseHighlightFile(file.name, content);
      if (parsedItems.length > 0) {
        setStatusMsg(`Parsed ${parsedItems.length} highlights. Saving to your library…`);
      }
    } catch {
      // fallback
    }
    runImport.mutate({ data: { filename: file.name, contents: content } });
  }

  return (
    <AppShell prefs={prefs} update={update} eyebrow="Import">
      <div className="pt-8 pb-6">
        <p className="eyebrow">Intake</p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-balance">
          Import highlights
        </h1>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          Kindle <code className="text-foreground/80">My Clippings.txt</code> and CSV exports from other platforms are
          parsed, split into clean quotes, and de-duplicated automatically at high speed.
        </p>
      </div>

      {/* Free tier usage and paywall banner */}
      {isFree && (
        <div className={`mb-6 rounded-xl border p-5 transition-all ${
          isAtLimit
            ? "border-2 border-accent bg-accent/10 ring-1 ring-accent/30"
            : "border-border bg-surface/60"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xs font-semibold uppercase tracking-wider text-accent">
                  {isAtLimit ? "Free Preview Limit Reached" : "Free Preview Allowance"}
                </span>
                <span className="rounded bg-accent/20 px-2 py-0.5 text-[11px] font-semibold text-accent">
                  {entitlements?.highlightCount ?? 0} / {entitlements?.highlightLimit ?? 5} highlights used
                </span>
              </div>
              <p className="mt-1.5 font-body text-xs text-muted-foreground">
                {isAtLimit
                  ? "You've saved all 5 free preview highlights. Unlock the Founder Pass ($49 lifetime) for unlimited highlights forever."
                  : "Free preview includes up to 5 highlights (max 50 words each) to test your room and email digests."}
              </p>
            </div>
            <Link href="/pricing" className="brass-btn shrink-0">
              Get Founder Pass ($49)
            </Link>
          </div>
        </div>
      )}

      <section className="pb-16">
        {statusMsg && (
          <div className="mb-4 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-xs text-accent animate-pulse font-medium">
            ⚡ {statusMsg}
          </div>
        )}

        <label className="group block cursor-pointer rounded-xl border border-dashed border-border bg-surface/60 p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-surface">
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.csv,text/plain,text/csv"
            onChange={onFile}
            className="hidden"
          />
          <span className="flex items-center justify-center gap-2 font-display text-[15px] font-semibold">
            {runImport.isPending && <Spinner label="Processing highlights" />}
            {runImport.isPending ? "Processing highlights at full speed…" : "Choose a clippings or CSV file"}
          </span>
          <span className="mt-1 block font-body text-[12px] text-muted-foreground">
            Kindle (.txt), platform export (.csv), Goodreads (.csv) · instant parsing
          </span>
        </label>

        <div className="mt-4 rounded-xl border border-border/70 bg-surface/40 p-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-xs font-semibold uppercase tracking-wider text-accent">
              Switching from another platform?
            </span>
          </div>
          <p className="mt-1 font-body text-xs text-muted-foreground leading-relaxed">
            Export your highlights as a CSV from your current highlight app or service. Drop the exported CSV right here.
            All your books, quotes, notes, and dates are preserved and deduplicated automatically.
          </p>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground">
              Or paste the file contents
            </p>
            <span className="text-[11px] text-muted-foreground/80">
              Paragraphs are automatically bifurcated into quotes (≤{MAX_WORDS_PER_HIGHLIGHT} words)
            </span>
          </div>
          <textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            rows={6}
            placeholder={
              "Paste anything: a Kindle clippings file, a CSV export, or plain quotes —\none per paragraph, with an optional attribution line:\n\nThe city is a discourse.\n— Invisible Cities, Italo Calvino"
            }
            className="w-full rounded-lg bg-surface px-3.5 py-3 font-mono text-[12px] ring-1 ring-border outline-none placeholder:text-muted-foreground/60 focus:ring-primary"
          />
          <button
            className="brass-btn mt-3"
            disabled={!pasted.trim() || runImport.isPending}
            onClick={() => runImport.mutate({ data: { filename: "pasted.txt", contents: pasted } })}
          >
            {runImport.isPending && <Spinner label="Importing highlights" />}
            {runImport.isPending ? "Importing…" : "Import pasted text"}
          </button>
        </div>

        <div className="mt-10 border-t border-border pt-7">
          <h2 className="font-display text-xl font-semibold tracking-tight">Add one by hand</h2>
          <p className="mt-1.5 font-body text-[13px] text-muted-foreground">
            Type a passage and it lands straight in your archive and review rotation. Longer paragraphs
            are automatically bifurcated into little quotes under {MAX_WORDS_PER_HIGHLIGHT} words.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Book title"
              className="w-full rounded-lg bg-surface px-3.5 py-2.5 font-body text-[13px] ring-1 ring-border outline-none placeholder:text-muted-foreground/60 focus:ring-primary"
            />
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author (optional)"
              className="w-full rounded-lg bg-surface px-3.5 py-2.5 font-body text-[13px] ring-1 ring-border outline-none placeholder:text-muted-foreground/60 focus:ring-primary"
            />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="The passage you want to remember…"
            className="mt-2 w-full rounded-lg bg-surface px-3.5 py-3 font-body text-[14px] leading-relaxed ring-1 ring-border outline-none placeholder:text-muted-foreground/60 focus:ring-primary"
          />
          <button
            className="brass-btn mt-3"
            disabled={!text.trim() || addOne.isPending}
            onClick={() =>
              addOne.mutate({
                data: {
                  book_title: title.trim() || "Pasted highlights",
                  author: author.trim() || null,
                  text: text.trim(),
                },
              })
            }
          >
            {addOne.isPending && <Spinner label="Saving highlight" />}
            {addOne.isPending ? "Saving…" : "Save highlight"}
          </button>
        </div>
      </section>
    </AppShell>
  );
}

