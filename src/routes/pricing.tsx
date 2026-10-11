import Link from "next/link";

import logoAsset from "@/assets/reado-lockup.png.asset.json";
import { PRICES, FREE_FEATURES, PRO_FEATURES } from "@/lib/plan";

export function Pricing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-5">
          <Link href="/" className="flex items-center gap-2">
            <img src={logoAsset.url} alt="Reado" className="h-6 w-auto" />
            <span className="font-display text-lg font-semibold">Reado</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth" className="chrome-btn">
              Sign in
            </Link>
            <Link href="/auth" className="brass-btn">
              Start free
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-16">
        <section className="max-w-2xl">
          <p className="eyebrow">A sustainable reading room</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Pay for the parts that make remembering effortless.
          </h1>
          <p className="mt-5 max-w-xl font-body text-lg leading-relaxed text-muted-foreground">
            Reado stays useful at zero cost. When your library grows, a small subscription keeps the
            service healthy and unlocks the deeper memory tools.
          </p>
        </section>
        <section className="mt-12 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-xl border border-border p-6 sm:p-8">
            <p className="eyebrow">Start here</p>
            <h2 className="mt-3 font-display text-2xl font-semibold">Free</h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              A generous home for your first hundred highlights.
            </p>
            <ul className="mt-6 space-y-3 font-body text-sm">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span className="text-accent">—</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link href="/auth" className="chrome-btn mt-8">
              Create your free room
            </Link>
          </article>
          <article className="rounded-xl border border-foreground/40 bg-surface/60 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">For serious readers</p>
                <h2 className="mt-3 font-display text-2xl font-semibold">Pro</h2>
              </div>
              <span className="rounded-full border border-accent/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-accent">
                Unlimited memory
              </span>
            </div>
            <p className="mt-2 max-w-lg font-body text-sm text-muted-foreground">
              Every highlight, every book, and the inbox you actually want to read from.
            </p>
            <ul className="mt-6 grid gap-3 font-body text-sm sm:grid-cols-2">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span className="text-accent">—</span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {PRICES.map((price) => {
                const isLifetime = price.id === "lifetime";
                return (
                  <div
                    key={price.id}
                    className={`rounded-lg p-4 transition-all ${
                      isLifetime
                        ? "border-2 border-accent bg-accent/5 ring-1 ring-accent/30 shadow-lg shadow-accent/5"
                        : "border border-border bg-background/60"
                    }`}
                  >
                    <div className="flex min-h-9 items-start justify-between gap-2">
                      <p
                        className={`text-[11px] uppercase tracking-[0.12em] font-semibold ${
                          isLifetime ? "text-accent" : "text-muted-foreground"
                        }`}
                      >
                        {price.name.replace("Pro ", "")}
                      </p>
                      {price.badge && (
                        <span
                          className={`rounded px-1.5 py-0.5 text-right text-[10px] uppercase tracking-wider font-semibold ${
                            isLifetime
                              ? "bg-accent text-background font-bold"
                              : "text-accent border border-accent/40"
                          }`}
                        >
                          {price.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-4 font-display text-3xl font-semibold">{price.price}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{price.cadence}</p>
                    <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                      {price.note}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 rounded-lg border border-accent/30 bg-surface/80 p-4">
              <div className="flex items-center gap-2">
                <span className="text-accent text-xs font-semibold uppercase tracking-wider">
                  Readwise Switcher Guarantee
                </span>
              </div>
              <p className="mt-1 font-body text-xs leading-relaxed text-muted-foreground">
                Tired of paying $96 every year for Readwise? Export your CSV or Kindle clippings and
                bring everything over in one click. Our $99 Lifetime Pass gives you unmetered archive,
                Kindle/CSV sync, and daily digests with zero recurring charges.
              </p>
            </div>
            <Link href="/auth" className="brass-btn mt-6 w-full text-center sm:w-auto">
              Get Lifetime Access ($99)
            </Link>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Instant activation with your account.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
