import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import logoAsset from "@/assets/reado-lockup.png.asset.json";
import { FREE_FEATURES, PRO_FEATURES, POLAR_FOUNDER_PRODUCT_ID } from "@/lib/plan";
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
          <p className="eyebrow">A calm reading room forever</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            One simple pass. No recurring subscriptions.
          </h1>
          <p className="mt-5 max-w-xl font-body text-lg leading-relaxed text-muted-foreground">
            Test Reado with up to 5 highlights and live email digests for free. When you're ready,
            unlock unlimited highlights and your full reading archive with the Founder Pass.
          </p>
        </section>
        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Free Tier */}
          <article className="flex flex-col justify-between rounded-xl border border-border bg-surface/30 p-6 sm:p-8">
            <div>
              <p className="eyebrow">Test the room</p>
              <h2 className="mt-3 font-display text-3xl font-semibold">Free Preview</h2>
              <p className="mt-2 font-body text-sm text-muted-foreground">
                5 highlights to test quotes, reader themes, and review emails.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold">$0</span>
                <span className="text-xs text-muted-foreground">/ free forever</span>
              </div>
              <ul className="mt-6 space-y-3 font-body text-sm">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="text-accent">—</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 border-t border-border/60 pt-6">
              <Link href="/auth" className="chrome-btn w-full text-center sm:w-auto">
                Start free preview
              </Link>
            </div>
          </article>

          {/* Founder Pass Tier */}
          <article className="relative flex flex-col justify-between rounded-xl border-2 border-accent bg-accent/5 p-6 shadow-xl shadow-accent/5 ring-1 ring-accent/30 sm:p-8">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-accent">Lifetime Membership</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold">Founder Pass</h2>
                </div>
                <span className="rounded-full border border-accent bg-accent/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
                  One-time payment
                </span>
              </div>
              <p className="mt-2 max-w-lg font-body text-sm text-muted-foreground">
                Your permanent personal sanctuary for quotes, books, and deliberate memory.
              </p>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-semibold">$49</span>
                <span className="text-xs text-muted-foreground">once, lifetime access</span>
              </div>
              <ul className="mt-6 space-y-3 font-body text-sm">
                {PRO_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="text-accent">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 border-t border-accent/20 pt-6">
              <div className="mb-4 rounded-lg border border-accent/30 bg-surface/70 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[11px] font-semibold uppercase tracking-wider text-accent">
                    Platform Switcher Guarantee
                  </span>
                </div>
                <p className="mt-1 font-body text-xs leading-relaxed text-muted-foreground">
                  Tired of paying $96+ every year on other platforms just to keep your own highlights?
                  Export your Kindle clippings or CSV archives and bring everything over in one click.
                  Zero recurring charges forever.
                </p>
              </div>

              {isSignedIn ? (
                <button
                  onClick={() => handleCheckout(POLAR_FOUNDER_PRODUCT_ID)}
                  disabled={isLoading}
                  className="brass-btn w-full text-center sm:w-auto"
                >
                  {isLoading && <Spinner label="Loading checkout" />}
                  {isLoading ? "Opening checkout…" : "Get Founder Pass ($49 lifetime)"}
                </button>
              ) : (
                <Link href="/auth" className="brass-btn w-full text-center sm:w-auto">
                  Get Founder Pass ($49 lifetime)
                </Link>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground">
                Instant activation on your account via secure Polar checkout.
              </p>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

