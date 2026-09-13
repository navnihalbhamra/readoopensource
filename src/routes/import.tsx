import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@/lib/next-server-fn";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Spinner } from "@/components/Spinner";
import { useReaderPrefs } from "@/hooks/useReaderPrefs";

export function ImportPage() {
  const { prefs, update } = useReaderPrefs();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pasted, setPasted] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");

  const runEnrich = useServerFn("enrichBooks");

  const runImport = useMutation({
    mutationFn: useServerFn("importHighlights"),
    onSuccess: async (result: { parsed: number; imported: number; skipped: number }) => {
      if (result.parsed === 0) {
        toast.error("Nothing recognisable in that text — try one quote per paragraph.");
        return;
      }
      toast.success(
        `Imported ${result.imported} of ${result.parsed} highlights (${result.skipped} already saved)`,
      );
      setPasted("");
      if (fileRef.current) fileRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });

      // Automatically match the new titles to covers/authors, then refresh.
      try {
        const matched = await runEnrich({ data: {} });
        if (matched.matched > 0) toast.success(`Found covers for ${matched.matched} books`);
      } catch {
        /* enrichment is best-effort; the Books page has a manual retry */
      }
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const addOne = useMutation({
    mutationFn: useServerFn("saveHighlight"),
    onSuccess: async () => {
      toast.success("Highlight saved");
      setText("");
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
      queryClient.invalidateQueries({ queryKey: ["review"] });
      try {
        await runEnrich({ data: {} });
      } catch {
        /* best effort */
      }
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const content = await file.text();
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
          Kindle <code className="text-foreground/80">My Clippings.txt</code> and CSV exports are
          parsed and de-duplicated automatically.
        </p>
      </div>

      <section className="pb-16">
        <label className="group block cursor-pointer rounded-xl border border-dashed border-border bg-surface/60 p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-surface">
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.csv,text/plain,text/csv"
            onChange={onFile}
            className="hidden"
          />
          <span className="flex items-center justify-center gap-2 font-display text-[15px] font-semibold">
            {runImport.isPending && <Spinner label="Parsing file" />}
            {runImport.isPending ? "Parsing…" : "Choose a clippings or CSV file"}
          </span>
          <span className="mt-1 block font-body text-[12px] text-muted-foreground">
            .txt or .csv · nothing leaves your account
          </span>
        </label>

        <div className="mt-6">
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            Or paste the file contents
          </p>
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
            Type a passage and it lands straight in your archive and review rotation.
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
