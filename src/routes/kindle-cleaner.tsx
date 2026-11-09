"use client";

import * as React from "react";
import Link from "next/link";
import { useState, useRef } from "react";
import { toast } from "sonner";
import logoAsset from "@/assets/reado-lockup.png.asset.json";
import {
  cleanKindleClippings,
  highlightsToMarkdown,
  SAMPLE_CLIPPINGS,
  BookGroup,
} from "@/lib/kindle-cleaner";

export function KindleCleaner() {
  const [rawText, setRawText] = useState<string>("");
  const [cleanedBooks, setCleanedBooks] = useState<BookGroup[] | null>(null);
  const [stats, setStats] = useState<{
    totalQuotes: number;
    totalBooks: number;
    duplicatesRemoved: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process text into clean highlights
  const handleProcessText = (text: string) => {
    if (!text.trim()) {
      toast.error("Please provide your Kindle My Clippings.txt content.");
      return;
    }

    try {
      const result = cleanKindleClippings(text);
      if (result.highlights.length === 0) {
        toast.error(
          "Could not detect any Kindle clippings in that text. Make sure it contains Kindle entries separated by '=========='."
        );
        return;
      }

      setCleanedBooks(result.books);
      setStats({
        totalQuotes: result.highlights.length,
        totalBooks: result.books.length,
        duplicatesRemoved: result.duplicatesRemoved,
      });

      // Stash into localStorage so the user can import directly into Reado if they sign up!
      try {
        localStorage.setItem("reado_pending_clippings", text.slice(0, 50000));
      } catch {
        // quota exceeded fallback
      }

      toast.success(
        `Cleaned ${result.highlights.length} quotes from ${result.books.length} books!`
      );
    } catch (err) {
      toast.error("An error occurred while parsing the clippings file.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      handleProcessText(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      handleProcessText(content);
    };
    reader.readAsText(file);
  };

  const handleUseSample = () => {
    setRawText(SAMPLE_CLIPPINGS);
    handleProcessText(SAMPLE_CLIPPINGS);
  };

  const handleDownloadMarkdown = () => {
    if (!cleanedBooks || cleanedBooks.length === 0) return;
    const md = highlightsToMarkdown(cleanedBooks);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Kindle-Highlights-Cleaned-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded clean Markdown file!");
  };

  const handleDownloadJson = () => {
    if (!cleanedBooks) return;
    const jsonStr = JSON.stringify(cleanedBooks, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kindle-highlights-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded clean JSON file!");
  };

  const handleCopyMarkdown = () => {
    if (!cleanedBooks) return;
    const md = highlightsToMarkdown(cleanedBooks);
    navigator.clipboard.writeText(md);
    setIsCopied(true);
    toast.success("Copied clean Markdown to clipboard!");
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleReset = () => {
    setCleanedBooks(null);
    setStats(null);
    setRawText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-6 px-5">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <img src={logoAsset.url} alt="Reado" className="h-6 w-auto object-contain" />
            <span className="font-display text-lg font-semibold tracking-tight">Reado</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/pricing" className="chrome-btn text-xs">
              Founder Pass
            </Link>
            <Link href="/sign-up" className="brass-btn text-xs">
              Start Free Preview
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-12">
        {/* Tool Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
            <span>✨ Free Standalone Tool</span>
            <span>·</span>
            <span>100% Private (Runs in Browser)</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Kindle Clippings Cleaner
          </h1>
          <p className="mx-auto mt-3 max-w-2xl font-body text-base text-muted-foreground sm:text-lg">
            Turn your messy Amazon <code className="rounded bg-surface px-1.5 py-0.5 text-xs text-foreground font-mono">My Clippings.txt</code> into clean, organized Markdown notes.
            Ready for Obsidian, Notion, Logseq, or your personal notes.
          </p>

          <div className="mt-4 flex justify-center">
            <button
              onClick={handleUseSample}
              className="text-xs text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              ⚡ Don't have your Kindle right now? Load sample clippings to test
            </button>
          </div>
        </div>

        {/* Input Card */}
        {!cleanedBooks && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface/50 p-6 shadow-xl sm:p-8">
            <div className="flex border-b border-border/80 pb-4 gap-4">
              <button
                onClick={() => setActiveTab("upload")}
                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
                  activeTab === "upload"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Upload File (.txt)
              </button>
              <button
                onClick={() => setActiveTab("paste")}
                className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${
                  activeTab === "paste"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Paste Clippings Text
              </button>
            </div>

            {activeTab === "upload" ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-12 text-center transition-colors hover:border-primary/60 cursor-pointer bg-background/40"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-border text-2xl shadow-inner">
                  📄
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  Drop your "My Clippings.txt" file here
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  or <span className="text-primary font-medium underline">browse from your computer</span>
                </p>
                <p className="mt-4 text-xs text-muted-foreground/80">
                  Plug in your Kindle via USB → open <code className="font-mono text-foreground">Kindle &gt; documents &gt; My Clippings.txt</code>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste the contents of your Kindle My Clippings.txt here..."
                  rows={10}
                  className="w-full rounded-xl border border-border bg-background/70 p-4 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  onClick={() => handleProcessText(rawText)}
                  className="brass-btn w-full py-3 text-sm font-semibold"
                >
                  Clean & Format Clippings
                </button>
              </div>
            )}
          </div>
        )}

        {/* Output / Cleaned Results */}
        {cleanedBooks && stats && (
          <div className="mt-10 space-y-8 animate-fade-in">
            {/* Stats Bar & Export Buttons */}
            <div className="rounded-2xl border border-border bg-surface/70 p-6 shadow-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-display text-lg font-semibold text-foreground">
                      Cleaned Highlights Ready
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <strong className="text-foreground">{stats.totalQuotes} quotes</strong> parsed from{" "}
                    <strong className="text-foreground">{stats.totalBooks} books</strong>
                    {stats.duplicatesRemoved > 0 && (
                      <span> · {stats.duplicatesRemoved} duplicate clippings removed</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadMarkdown}
                    className="brass-btn px-4 py-2 text-xs font-semibold"
                  >
                    📥 Download Markdown (.md)
                  </button>
                  <button
                    onClick={handleCopyMarkdown}
                    className="chrome-btn px-3 py-2 text-xs"
                  >
                    {isCopied ? "✓ Copied" : "📋 Copy Markdown"}
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="chrome-btn px-3 py-2 text-xs"
                  >
                    JSON
                  </button>
                  <button
                    onClick={handleReset}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1"
                  >
                    Upload Another
                  </button>
                </div>
              </div>

              {/* Book Highlights Preview List */}
              <div className="mt-6 space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {cleanedBooks.map((book, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/60 bg-background/50 p-5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-3">
                      <div>
                        <h4 className="font-display text-base font-semibold text-foreground">
                          {book.title}
                        </h4>
                        {book.author && (
                          <p className="text-xs text-muted-foreground">
                            by {book.author}
                          </p>
                        )}
                      </div>
                      <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground border border-border">
                        {book.quotes.length} {book.quotes.length === 1 ? "quote" : "quotes"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {book.quotes.map((q) => (
                        <div
                          key={q.id}
                          className="border-l-2 border-primary/50 pl-4 py-1 text-sm font-body italic text-foreground/90 leading-relaxed"
                        >
                          <p>"{q.text}"</p>
                          {q.location && (
                            <span className="mt-1 block not-italic text-[11px] text-muted-foreground">
                              {q.location}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ============================================================== */}
            {/* THE LEAD MAGNET / SEAMLESS READO.LOL BRIDGE */}
            {/* ============================================================== */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-surface to-surface/90 p-8 shadow-2xl">
              <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <span>💡 The Next Step For Your Reading</span>
                </div>

                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Want us to automatically email you 3 of these clean quotes every morning?
                </h3>

                <p className="mt-3 max-w-2xl font-body text-base text-muted-foreground leading-relaxed">
                  Don’t let these quotes sit forgotten in another markdown file on your hard drive.
                  <strong className="text-foreground"> Reado</strong> resurfaces your best highlights directly to your inbox on your schedule (like your morning coffee break), so the wisdom actually sticks.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/sign-up"
                    className="brass-btn px-6 py-3 text-sm font-semibold shadow-lg"
                  >
                    Start Free Preview (5 Quotes) →
                  </Link>

                  <Link
                    href="/pricing"
                    className="chrome-btn px-5 py-3 text-sm"
                  >
                    Founder Pass · $49 Lifetime (No Subscriptions)
                  </Link>
                </div>

                <p className="mt-4 text-[11px] uppercase tracking-wider text-muted-foreground/80">
                  ✓ Free to test · Zero spam · Calm reflection · Works with Kindle & CSV
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Explanatory / SEO FAQ Section */}
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="font-display text-2xl font-semibold text-foreground text-center">
            Frequently Asked Questions
          </h2>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-border/80 bg-surface/30 p-5">
              <h4 className="font-display text-base font-semibold text-foreground">
                Where do I find "My Clippings.txt" on Kindle?
              </h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Connect your Kindle e-reader to your computer with a USB cable. Open the Kindle drive, go into the <code className="font-mono text-xs text-foreground">documents</code> folder, and look for <code className="font-mono text-xs text-foreground">My Clippings.txt</code>.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-surface/30 p-5">
              <h4 className="font-display text-base font-semibold text-foreground">
                Is my reading data uploaded to a server?
              </h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                No. This cleaner tool runs 100% locally in your web browser. Your notes and book clippings never leave your computer until you explicitly choose to create an account on Reado.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-surface/30 p-5">
              <h4 className="font-display text-base font-semibold text-foreground">
                Can I import the Markdown into Obsidian or Notion?
              </h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Yes! The downloaded <code className="font-mono text-xs text-foreground">.md</code> file uses universal Markdown syntax with book headings and quote blockquotes that render natively in Obsidian, Notion, Logseq, and Bear.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-surface/30 p-5">
              <h4 className="font-display text-base font-semibold text-foreground">
                How does this connect to Reado?
              </h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Reado is the reading memory engine. While this tool cleans your files into Markdown, Reado actively resurfaces those quotes in a daily spaced-repetition review room and morning email digests.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-surface/30 p-5">
              <h4 className="font-display text-base font-semibold text-foreground">
                Is Reado a Readwise alternative?
              </h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Yes! Reado is the premier lifetime Readwise alternative for readers tired of recurring monthly or annual subscriptions. While Readwise costs $96 to $120+ every year, Reado offers a single $49 Founder Pass for lifetime access with no ongoing subscriptions, including daily morning email digests, spaced repetition review, Kindle clippings imports, and calm offline reading.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-surface/30 p-5">
              <h4 className="font-display text-base font-semibold text-foreground">
                Why choose a lifetime pass over monthly subscriptions?
              </h4>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Reading and reflecting on books is a lifelong habit. Paying a forever subscription to access your own notes and highlights can cost over $500–$600 over 5 years. With Reado, you pay once ($49) and own your spaced repetition digest system forever.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>
          Reado — The Reading Memory Engine. Clean Kindle Clippings Tool.
        </p>
      </footer>
    </div>
  );
}

