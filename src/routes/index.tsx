"use client";

import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import logoAsset from "@/assets/reado-lockup.png.asset.json";
import { Reveal } from "@/components/Reveal";
import { useAuth } from "@/hooks/useAuth";
import { GITHUB_REPO_URL } from "@/lib/plan";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Save what you read",
    desc: "Import Kindle My Clippings, Omnivore exports, CSV files, or save online essays with one click. Reado automatically formats, bifurcates long text, and matches cover art.",
  },
  {
    step: "02",
    title: "Set your email routine",
    desc: "Choose the exact time of day (morning coffee at 8:00 AM, midday quiet break, or custom days) and frequency that fits your natural cadence. Zero spam, just calm reflection.",
  },
  {
    step: "03",
    title: "Remember it forever",
    desc: "A quiet dose of 3 to 10 quotes surfaces in your inbox and daily review room. Read it once; retain the wisdom and ideas for life.",
  },
];

const VALUES = [
  {
    title: "Open-source & transparent",
    desc: "100% data ownership with zero proprietary lock-in. Your highlights and notes belong to you. Export to Markdown, Obsidian, and Notion in 1 click.",
  },
  {
    title: "No recurring subscriptions (Readwise Alternative)",
    desc: "Why pay $100+ every single year? Test 5 quotes for free, then unlock unlimited reading memory forever with our one-time $49 Founder Pass.",
  },
  {
    title: "Read-it-later & web articles (Omnivore Engine)",
    desc: "Save online essays and newsletters with zero clutter. Read in a calm typography reader, take notes on highlights, and listen with built-in text-to-speech audio.",
  },
  {
    title: "Custom delivery time & frequency",
    desc: "Receive your review emails when your mind is receptive — morning coffee at 8:00 AM, midday quiet break, or custom days of the week.",
  },
  {
    title: "Zero distractions & zero ads",
    desc: "No feeds, no badges, no social noise. Just pure typography and the ideas that shaped your thinking. We never sell your reading data.",
  },
  {
    title: "Platform-independent",
    desc: "Switch from Kindle clippings, Omnivore exports, Apple Books, or CSV archives without friction. All deduplicated automatically.",
  },
];

export function Landing() {
  const { session } = useAuth();

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
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <span>GitHub ↗</span>
            </a>
            <Link
              href="/kindle-clippings-cleaner"
              className="hidden md:inline-flex text-xs text-muted-foreground hover:text-foreground"
            >
              Free Kindle Cleaner
            </Link>
            <Link href="/pricing" className="chrome-btn text-xs">
              Founder Pass
            </Link>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="chrome-btn text-xs">Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="brass-btn text-xs">Start free preview</button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link href="/review" className="brass-btn text-xs">
                Open review room
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <Reveal>
          <section className="mx-auto max-w-3xl px-5 pb-16 pt-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
              <span>⚡ The Open-Source Readwise Alternative</span>
              <span>·</span>
              <span>$49 Lifetime Pass</span>
            </div>
            <p className="eyebrow">The open reading memory engine</p>
            <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-6xl">
              Remember what you read. Without the subscription.
            </h1>
            <p className="mx-auto mt-5 max-w-xl font-body text-lg leading-relaxed text-muted-foreground">
              You spend hours reading books, essays, and articles — only to forget almost all of it.
              Reado is the open-source reading memory engine that turns your Kindle clippings and web
              articles into lifelong wisdom through calm morning email digests and spaced repetition.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <button className="brass-btn px-6 py-3 text-[13px]">
                    Start free preview (5 quotes)
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link href="/review" className="brass-btn px-6 py-3 text-[13px]">
                  Open your review room
                </Link>
              </Show>
              <Link href="/pricing" className="chrome-btn px-5 py-3 text-[13px]">
                Founder Pass · $49 lifetime
              </Link>
              <a
                href="#self-host"
                className="chrome-btn px-4 py-3 text-[13px] border-primary/30 text-primary"
              >
                Self-Host vs Cloud ↓
              </a>
            </div>

            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80">
              Open Source · 100% Data Ownership · No recurring bills · Kindle, Web & Omnivore import
            </p>

            {/* Visual Routine Showcase */}
            <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-surface/80 p-6 text-left shadow-xl sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Custom Memory Routine
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span className="rounded-md border border-border bg-background px-2.5 py-1 text-foreground">
                    ⏰ 8:00 AM (Morning)
                  </span>
                  <span className="rounded-md border border-border bg-background px-2.5 py-1 text-foreground">
                    📬 Weekdays (5x / wk)
                  </span>
                  <span className="rounded-md border border-border bg-background px-2.5 py-1 text-foreground">
                    📖 5 quotes / email
                  </span>
                </div>
              </div>

              <blockquote className="mt-6 font-body text-xl italic leading-relaxed text-foreground/90">
                “Attention is the rarest and purest form of generosity.”
              </blockquote>
              <figcaption className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span>The Lantern Room · Marguerite Halloway · p. 88</span>
                <span className="text-emerald-500 font-mono">Delivered to your inbox</span>
              </figcaption>
            </div>
          </section>
        </Reveal>

        {/* 3 Simple Steps */}
        <Reveal>
          <section className="mx-auto max-w-5xl px-5 py-16">
            <div className="text-center">
              <p className="eyebrow">Simplicity by design</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                How Reado keeps ideas alive
              </h2>
            </div>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              {HOW_IT_WORKS.map((item) => (
                <li
                  key={item.step}
                  className="rounded-xl border border-border bg-surface/50 p-6 transition-all hover:border-foreground/20"
                >
                  <p className="eyebrow text-primary">{item.step}</p>
                  <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        {/* Core Values / Features */}
        <Reveal>
          <section className="mx-auto max-w-5xl px-5 py-16">
            <div className="text-center">
              <p className="eyebrow">Made for readers</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                Everything to remember. Nothing to distract.
              </h2>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {VALUES.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-border bg-surface/30 p-6 transition-all hover:border-foreground/20"
                >
                  <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-body text-xs leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* ============================================================== */}
        {/* SELF-HOSTED VS MANAGED CLOUD: WHICH IS BETTER? */}
        {/* ============================================================== */}
        <Reveal>
          <section id="self-host" className="mx-auto max-w-5xl px-5 py-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <span>Open Source & Transparent</span>
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Self-Hosted vs. Managed Cloud
              </h2>
              <p className="mt-3 font-body text-sm text-muted-foreground leading-relaxed">
                Reado is open-source. You can self-host for free on your own hardware, or let us host your reading sanctuary forever with the $49 Founder Pass. Here is why each option is better.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Card 1: Self-Hosted */}
              <div className="rounded-2xl border border-border bg-surface/50 p-7 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-mono font-semibold uppercase text-muted-foreground">
                      Free & Open Source
                    </span>
                    <span className="font-display text-2xl font-bold text-foreground">$0</span>
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-semibold text-foreground">
                    Self-Hosted Community Edition
                  </h3>
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    For developers, homelab enthusiasts, and privacy purists who want full sovereignty.
                  </p>

                  <div className="mt-6 space-y-3 font-body text-xs text-muted-foreground leading-relaxed">
                    <div className="flex gap-2.5">
                      <span className="font-bold text-primary">1.</span>
                      <span><strong className="text-foreground">100% Free Forever:</strong> Run it on your home server, local Docker, or Raspberry Pi with zero subscription or licensing fees.</span>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="font-bold text-primary">2.</span>
                      <span><strong className="text-foreground">Complete Data Sovereignty:</strong> Your personal quotes, books, and thoughts never leave your private network.</span>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="font-bold text-primary">3.</span>
                      <span><strong className="text-foreground">Local-First & Offline:</strong> Read, search, and review without depending on an internet connection or external server.</span>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="font-bold text-primary">4.</span>
                      <span><strong className="text-foreground">Full Code Extensibility:</strong> Hack the UI, write custom sync plugins, or connect to your local Ollama/LLMs.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-border/60 pt-5">
                  <a
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="chrome-btn w-full text-center py-2.5 text-xs font-semibold"
                  >
                    View Source on GitHub ↗
                  </a>
                  <p className="mt-2 text-[11px] text-muted-foreground text-center">
                    Trade-off: You maintain your own Docker, DB backups & SMTP relays
                  </p>
                </div>
              </div>

              {/* Card 2: Managed Cloud */}
              <div className="relative rounded-2xl border-2 border-accent bg-accent/5 p-7 sm:p-8 flex flex-col justify-between shadow-xl ring-1 ring-accent/30">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent/20 px-3 py-1 text-xs font-semibold uppercase text-accent">
                      Managed Cloud · Zero DevOps
                    </span>
                    <span className="font-display text-2xl font-bold text-foreground">$49 <span className="text-xs font-normal text-muted-foreground">lifetime</span></span>
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-semibold text-foreground">
                    Founder Pass (Managed Cloud)
                  </h3>
                  <p className="mt-1 font-body text-xs text-muted-foreground">
                    For avid readers who want a peaceful, zero-maintenance sanctuary that just works.
                  </p>

                  <div className="mt-6 space-y-3 font-body text-xs text-muted-foreground leading-relaxed">
                    <div className="flex gap-2.5">
                      <span className="font-bold text-accent">1.</span>
                      <span><strong className="text-foreground">Zero Maintenance or DevOps:</strong> Ready in 10 seconds. No terminal commands, no server crashes, and no Docker updates.</span>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="font-bold text-accent">2.</span>
                      <span><strong className="text-foreground">Guaranteed Email Delivery:</strong> Self-hosting email often gets flagged as spam. Our cloud digest arrives reliably in your inbox every morning.</span>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="font-bold text-accent">3.</span>
                      <span><strong className="text-foreground">Automatic Book Cover Matching:</strong> We handle Open Library and Google Books API caching and cover art enrichment automatically.</span>
                    </div>
                    <div className="flex gap-2.5">
                      <span className="font-bold text-accent">4.</span>
                      <span><strong className="text-foreground">Cheaper Than a VPS:</strong> At $49 one-time for life, it costs less than running a basic $5/month cloud server for even 1 year!</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-accent/20 pt-5">
                  <Link
                    href="/pricing"
                    className="brass-btn w-full text-center py-2.5 text-xs font-semibold shadow-md"
                  >
                    Get Founder Pass ($49 Lifetime) →
                  </Link>
                  <p className="mt-2 text-[11px] text-muted-foreground text-center">
                    Pay once · Unlimited highlights & articles · No recurring bills
                  </p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Readwise vs Reado Comparison Table */}
        <Reveal>
          <section className="mx-auto max-w-5xl px-5 py-16">
            <div className="rounded-2xl border border-border bg-surface/50 p-6 sm:p-8 shadow-xl">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  <span>Readwise Alternative</span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
                  How Reado Compares to Readwise
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                  Everything you need to remember what you read, without the recurring subscription.
                </p>
              </div>

              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/80 text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="pb-3 font-semibold">Feature</th>
                      <th className="pb-3 font-semibold text-foreground">Reado (Founder Pass)</th>
                      <th className="pb-3 font-semibold text-muted-foreground">Readwise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="py-3.5 font-medium">Pricing Model</td>
                      <td className="py-3.5 font-semibold text-emerald-400">One-time $49 (Lifetime)</td>
                      <td className="py-3.5 text-muted-foreground">$96 – $120+ / year (Recurring)</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-medium">Codebase & Data Ownership</td>
                      <td className="py-3.5 font-semibold text-emerald-400">✓ Open-Source & 100% Data Ownership</td>
                      <td className="py-3.5 text-muted-foreground">Proprietary Closed Silo</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-medium">Kindle "My Clippings.txt" Import</td>
                      <td className="py-3.5 font-semibold text-emerald-400">✓ Instant 1-Click</td>
                      <td className="py-3.5 text-muted-foreground">✓ Included</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-medium">Daily Email Review Digest</td>
                      <td className="py-3.5 font-semibold text-emerald-400">✓ Custom Time & Frequency</td>
                      <td className="py-3.5 text-muted-foreground">✓ Included</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-medium">Read-It-Later Web Articles (Omnivore alternative)</td>
                      <td className="py-3.5 font-semibold text-emerald-400">✓ Clean reader, in-reader notes & audio TTS</td>
                      <td className="py-3.5 text-muted-foreground">Requires Readwise Reader ($108+/yr)</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-medium">Omnivore Archive Import</td>
                      <td className="py-3.5 font-semibold text-emerald-400">✓ 1-Click JSON, CSV & Markdown</td>
                      <td className="py-3.5 text-muted-foreground">Complex manual setup</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-medium">Self-Host Option (Free & Open Source)</td>
                      <td className="py-3.5 font-semibold text-emerald-400">✓ 100% Free on GitHub</td>
                      <td className="py-3.5 text-muted-foreground">No (Proprietary Closed SaaS)</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-medium">5-Year Total Cost</td>
                      <td className="py-3.5 font-bold text-emerald-400">$49 total</td>
                      <td className="py-3.5 text-destructive font-semibold">$480 – $600+</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Bottom CTA */}
        <Reveal>
          <section className="mx-auto max-w-3xl px-5 pb-24 pt-12 text-center">
            <div className="rounded-2xl border border-border bg-surface/60 p-8 sm:p-12">
              <h2 className="font-display text-3xl font-semibold tracking-tight">
                Stop losing what you read.
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground leading-relaxed">
                Test with 5 free quotes and sample your personalized email routine. Unlock unlimited
                reading memory for life with the $49 Founder Pass, or let us do it for you.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Show when="signed-out">
                  <SignUpButton mode="modal">
                    <button className="brass-btn px-6 py-3 text-[13px]">
                      Start free preview
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <Link href="/review" className="brass-btn px-6 py-3 text-[13px]">
                    Open your review room
                  </Link>
                </Show>
                <Link href="/pricing" className="chrome-btn px-5 py-3 text-[13px]">
                  View Founder Pass ($49)
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>Reado · Open-source reading memory engine</span>
          <div className="flex gap-4">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
            <Link href="/kindle-clippings-cleaner" className="hover:text-foreground">
              Kindle Cleaner
            </Link>
            <Link href="/pricing" className="hover:text-foreground">
              Founder Pass & Self-Host
            </Link>
            <Link href="/auth" className="hover:text-foreground">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
