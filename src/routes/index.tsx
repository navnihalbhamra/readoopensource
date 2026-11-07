"use client";

import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import logoAsset from "@/assets/reado-lockup.png.asset.json";
import { Reveal } from "@/components/Reveal";
import { useAuth } from "@/hooks/useAuth";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Save what you read",
    desc: "Drop in Kindle My Clippings, CSV exports, or paste quotes directly. Reado automatically formats and bifurcates long paragraphs into bite-sized quotes.",
  },
  {
    step: "02",
    title: "Set your email routine",
    desc: "Choose the exact time of day (morning, midday, evening, or custom) and number of emails per week that fits your life. No spam, just calm reflection.",
  },
  {
    step: "03",
    title: "Remember it forever",
    desc: "A small, quiet dose of 3 to 10 quotes surfaces in your inbox and daily review room. Read it once; retain the wisdom for life.",
  },
];

const VALUES = [
  {
    title: "Custom delivery time & frequency",
    desc: "Receive your review emails when your mind is receptive — morning coffee at 8:00 AM, midday quiet break, or custom days of the week.",
  },
  {
    title: "One-time $49 lifetime pass",
    desc: "No monthly subscriptions or recurring bills. Test 5 quotes for free, then unlock unlimited reading memory forever with the Founder Pass.",
  },
  {
    title: "Zero distractions",
    desc: "No feeds, no badges, no social noise. Just pure typography and the ideas that shaped your thinking.",
  },
  {
    title: "Platform-independent",
    desc: "Switch from Kindle clippings or CSV exports without friction. Your highlights belong to you, forever.",
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
          <div className="flex items-center gap-2">
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
            <p className="eyebrow">The reading memory engine</p>
            <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-6xl">
              Remember what you read.
            </h1>
            <p className="mx-auto mt-5 max-w-xl font-body text-lg leading-relaxed text-muted-foreground">
              You spend hours reading books and essays — only to forget almost all of it weeks later.
              Reado resurfaces your best highlights directly to your inbox on your schedule, so ideas
              actually stick.
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
            </div>

            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80">
              5 free quotes to test · No recurring subscription · Kindle & CSV import
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
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {VALUES.map((item) => (
                <li
                  key={item.title}
                  className="rounded-xl border border-border bg-surface/30 p-6 transition-all hover:border-foreground/20"
                >
                  <h3 className="font-display text-base font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </li>
              ))}
            </ul>
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
                memory for life with a single $49 Founder Pass.
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
          <span>Reado · Remember what you read</span>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-foreground">
              Founder Pass
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
