"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import logoAsset from "@/assets/reado-lockup.png.asset.json";
import { FREE_FEATURES, PRO_FEATURES, SELF_HOST_FEATURES, POLAR_FOUNDER_PRODUCT_ID, GITHUB_REPO_URL } from "@/lib/plan";
import { useCheckout } from "@/hooks/useCheckout";
import { Spinner } from "@/components/Spinner";

export function Pricing() {
  const { isSignedIn } = useAuth();
  const { handleCheckout, isLoading } = useCheckout();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-5">
          <Link href="/" className="flex items-center gap-2">
            <img src={logoAsset.url} alt="Reado" className="h-6 w-auto" />
            <span className="font-display text-lg font-semibold">Reado</span>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <span>GitHub ↗</span>
            </a>
            <Link href="/auth" className="chrome-btn">
              Sign in
            </Link>
            <Link href="/auth" className="brass-btn">
              Start free
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-16">
        <section className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
            <span>⚡ The Open-Source Readwise Alternative</span>
            <span>·</span>
            <span>No Monthly Subscriptions</span>
          </div>
          <p className="eyebrow">A calm reading sanctuary forever</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            One simple pass. No recurring bills.
          </h1>
          <p className="mt-5 max-w-xl font-body text-lg leading-relaxed text-muted-foreground">
            Why pay $100+ every year for Readwise? Reado is the open-source reading memory engine. Test 5 quotes for free, self-serve with the $49 Founder Pass, or let us hand-clean and configure your entire library with the Done-For-You Concierge.
          </p>
        </section>

        {/* 3 Pricing Cards */}
        <section className="mt-12 grid gap-6 lg:grid-cols-3">
          {/* Free Tier */}
          <article className="flex flex-col justify-between rounded-xl border border-border bg-surface/30 p-6 sm:p-7">
            <div>
              <p className="eyebrow">Test the room</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">Free Preview</h2>
              <p className="mt-2 font-body text-xs text-muted-foreground">
                5 highlights to test quotes, reader themes, and review emails.
              </p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-3xl font-semibold">$0</span>
                <span className="text-xs text-muted-foreground">/ free forever</span>
              </div>
              <ul className="mt-6 space-y-2.5 font-body text-xs">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <span className="text-accent">—</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 border-t border-border/60 pt-5">
              <Link href="/auth" className="chrome-btn w-full text-center">
                Start free preview
              </Link>
            </div>
          </article>

          {/* Founder Pass Tier (Most Popular) */}
          <article className="relative flex flex-col justify-between rounded-xl border-2 border-accent bg-accent/5 p-6 shadow-xl shadow-accent/5 ring-1 ring-accent/30 sm:p-7">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="eyebrow text-accent">Lifetime Membership</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">Founder Pass</h2>
                </div>
                <span className="rounded-full border border-accent bg-accent/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                  Most Popular
                </span>
              </div>
              <p className="mt-2 font-body text-xs text-muted-foreground">
                Your permanent personal sanctuary for quotes, books, and deliberate memory.
              </p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-semibold">$49</span>
                <span className="text-xs text-muted-foreground">once, lifetime access</span>
              </div>
              <ul className="mt-6 space-y-2.5 font-body text-xs">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <span className="text-accent font-bold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 border-t border-accent/20 pt-5">
              {isSignedIn ? (
                <button
                  onClick={() => handleCheckout(POLAR_FOUNDER_PRODUCT_ID)}
                  disabled={isLoading}
                  className="brass-btn w-full text-center py-2.5 text-xs font-semibold"
                >
                  {isLoading && <Spinner label="Loading checkout" />}
                  {isLoading ? "Opening checkout…" : "Get Founder Pass ($49)"}
                </button>
              ) : (
                <Link href="/auth" className="brass-btn w-full text-center py-2.5 text-xs font-semibold">
                  Get Founder Pass ($49)
                </Link>
              )}
              <p className="mt-2 text-[10px] text-muted-foreground text-center">
                Instant activation · Secure Polar checkout · Zero recurring fees
              </p>
            </div>
          </article>

          {/* Self-Host Tier */}
          <article className="relative flex flex-col justify-between rounded-xl border border-border bg-surface/50 p-6 shadow-sm sm:p-7">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="eyebrow text-muted-foreground">Community Edition</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">Self-Hosted</h2>
                </div>
                <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Open Source
                </span>
              </div>
              <p className="mt-2 font-body text-xs text-muted-foreground">
                Run Reado on your own server, VPS, or Docker container. 100% free and open-source.
              </p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-semibold">$0</span>
                <span className="text-xs text-muted-foreground">free forever on GitHub</span>
              </div>
              <ul className="mt-6 space-y-2.5 font-body text-xs">
                {SELF_HOST_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <span className="text-primary font-bold">✓</span>
                    <span className={feature.includes("Free") ? "font-semibold text-foreground" : ""}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 border-t border-border/60 pt-5">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="chrome-btn w-full text-center py-2.5 text-xs font-semibold"
              >
                View on GitHub ↗
              </a>
              <p className="mt-2 text-[10px] text-muted-foreground text-center">
                Clone repo · MIT/AGPL License · Docker support
              </p>
            </div>
          </article>
        </section>

        {/* ============================================================== */}
        {/* WHY SELF-HOST VS MANAGED CLOUD: WHICH IS BETTER? */}
        {/* ============================================================== */}
        <section className="mt-16 rounded-2xl border border-border bg-surface/40 p-6 sm:p-10 shadow-lg">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <span>Honest Architecture Comparison</span>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Self-Hosted vs Managed Cloud: Which is Better?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              We believe in open source and giving you real choices. Here is why you might choose each option.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {/* Why Self-Host is Better */}
            <div className="rounded-xl border border-border/80 bg-background/70 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-sm">🛠️</span>
                  <h4 className="font-display text-lg font-semibold text-foreground">
                    Why Self-Host is Better
                  </h4>
                </div>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Ideal for: Developers, homelab tinkerers & privacy purists
                </p>

                <ul className="mt-5 space-y-3 font-body text-xs text-muted-foreground leading-relaxed">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span><strong className="text-foreground">100% Free Forever:</strong> Run it on your home server, VPS, or Raspberry Pi with zero subscription or one-time fees.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span><strong className="text-foreground">Total Data Sovereignty:</strong> Your book quotes, notes, and reading habits stay entirely within your own local network.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span><strong className="text-foreground">Offline & Local-First:</strong> Read, review, and search your library without depending on an internet connection or external servers.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary">4.</span>
                    <span><strong className="text-foreground">Full Code Customization:</strong> Modify the reader typography, add custom scrapers, or connect your own local LLMs directly.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 border-t border-border/50 pt-4 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">The Trade-off:</span> You are responsible for Docker updates, Postgres database backups, and configuring your own SMTP email relay for morning digests.
              </div>
            </div>

            {/* Why Managed Cloud is Better */}
            <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-sm">⚡</span>
                  <h4 className="font-display text-lg font-semibold text-foreground">
                    Why Managed Cloud is Better
                  </h4>
                </div>
                <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-primary">
                  Ideal for: Busy readers who want a quiet, zero-friction sanctuary
                </p>

                <ul className="mt-5 space-y-3 font-body text-xs text-muted-foreground leading-relaxed">
                  <li className="flex gap-2">
                    <span className="font-bold text-accent">1.</span>
                    <span><strong className="text-foreground">Zero Setup or Server Maintenance:</strong> Start reading in 10 seconds. No Docker files, no terminal commands, and zero crashed servers.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-accent">2.</span>
                    <span><strong className="text-foreground">Guaranteed Email Delivery:</strong> Self-hosting email often lands in spam. Our managed email routine arrives crisp and on time in your inbox every morning.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-accent">3.</span>
                    <span><strong className="text-foreground">Automatic Book Matching:</strong> We handle rate limits and Open Library / Google Books metadata caching seamlessly in the cloud.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-accent">4.</span>
                    <span><strong className="text-foreground">Cheaper Than a VPS:</strong> At a one-time $49 payment for life, it costs significantly less than paying $5/month to host your own VPS for even 1 year!</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 border-t border-primary/20 pt-4 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">The Benefit:</span> Pay once, close the terminal, and enjoy lifelong reading memory without doing DevOps.
              </div>
            </div>
          </div>
        </section>

        {/* Readwise vs Reado Comparison Table */}
        <section className="mt-16 rounded-2xl border border-border bg-surface/50 p-6 sm:p-8 shadow-xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <span>Readwise Alternative</span>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
              How Reado Compares to Readwise
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Everything you need to remember what you read, without the subscription fatigue.
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
                  <td className="py-3.5 font-medium">Automatic Book Cover Matching</td>
                  <td className="py-3.5 font-semibold text-emerald-400">✓ Open Library & Google Books</td>
                  <td className="py-3.5 text-muted-foreground">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-medium">Spaced-Repetition Daily Review Room</td>
                  <td className="py-3.5 font-semibold text-emerald-400">✓ Quiet & Distraction-Free</td>
                  <td className="py-3.5 text-muted-foreground">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-3.5 font-medium">Free Kindle Clippings Cleaner</td>
                  <td className="py-3.5 font-semibold text-emerald-400">✓ Free Standalone Tool</td>
                  <td className="py-3.5 text-muted-foreground">Requires Paid Account</td>
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
        </section>
      </main>
    </div>
  );
}

