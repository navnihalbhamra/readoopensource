import { createFileRoute, Link } from "@/lib/next-router-compat";
import { useCheckout } from "@/hooks/useCheckout";

import logoAsset from "@/assets/reado-lockup.png.asset.json";
import { PRICES, FREE_FEATURES, PRO_FEATURES } from "@/lib/plan";

// Map price IDs to Polar product IDs
const POLAR_PRODUCT_IDS: Record<string, string> = {
  monthly: process.env["VITE_POLAR_PRODUCT_MONTHLY"] || "",
  yearly: process.env["VITE_POLAR_PRODUCT_YEARLY"] || "",
  lifetime: process.env["VITE_POLAR_PRODUCT_LIFETIME"] || "",
};

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Simple pricing — Reado" },
      { name: "description", content: "Start free with Reado, or unlock unlimited highlights, book metadata and flexible email reviews with Pro." },
      { property: "og:title", content: "Simple pricing — Reado" },
      { property: "og:description", content: "A calm reading archive with a generous free plan and a founder-friendly lifetime option." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const { handleCheckout, isLoading, isAuthenticated } = useCheckout();

  const handlePricingCheckout = (priceId: string) => {
    const productId = POLAR_PRODUCT_IDS[priceId];
    if (!productId) {
      console.error(`No Polar product ID configured for ${priceId}`);
      return;
    }
    handleCheckout(productId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-5">
          <Link to="/" className="flex items-center gap-2"><img src={logoAsset.url} alt="Reado" className="h-6 w-auto" /><span className="font-display text-lg font-semibold">Reado</span></Link>
          <div className="flex items-center gap-2"><Link to="/auth" className="chrome-btn">Sign in</Link><Link to="/auth" className="brass-btn">Start free</Link></div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 pb-20 pt-16">
        <section className="max-w-2xl">
          <p className="eyebrow">A sustainable reading room</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">Pay for the parts that make remembering effortless.</h1>
          <p className="mt-5 max-w-xl font-body text-lg leading-relaxed text-muted-foreground">Reado stays useful at zero cost. When your library grows, a small subscription keeps the service healthy and unlocks the deeper memory tools.</p>
        </section>
        <section className="mt-12 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <article className="rounded-xl border border-border p-6 sm:p-8">
            <p className="eyebrow">Start here</p>
            <h2 className="mt-3 font-display text-2xl font-semibold">Free</h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">A generous home for your first hundred highlights.</p>
            <ul className="mt-6 space-y-3 font-body text-sm">{FREE_FEATURES.map((feature) => <li key={feature} className="flex gap-3"><span className="text-accent">—</span>{feature}</li>)}</ul>
            <Link to="/auth" className="chrome-btn mt-8">Create your free room</Link>
          </article>
          <article className="rounded-xl border border-foreground/40 bg-surface/60 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">For serious readers</p><h2 className="mt-3 font-display text-2xl font-semibold">Pro</h2></div><span className="rounded-full border border-accent/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-accent">Unlimited memory</span></div>
            <p className="mt-2 max-w-lg font-body text-sm text-muted-foreground">Every highlight, every book, and the inbox you actually want to read from.</p>
            <ul className="mt-6 grid gap-3 font-body text-sm sm:grid-cols-2">{PRO_FEATURES.map((feature) => <li key={feature} className="flex gap-3"><span className="text-accent">—</span>{feature}</li>)}</ul>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">{PRICES.map((price) => <div key={price.id} className="rounded-lg border border-border bg-background/60 p-4"><div className="flex min-h-9 items-start justify-between gap-2"><p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{price.name.replace("Pro ", "")}</p>{price.badge && <span className="text-right text-[10px] text-accent">{price.badge}</span>}</div><p className="mt-4 font-display text-3xl font-semibold">{price.price}</p><p className="mt-1 text-[11px] text-muted-foreground">{price.cadence}</p><p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">{price.note}</p><button disabled={isLoading || !POLAR_PRODUCT_IDS[price.id] || !isAuthenticated} onClick={() => handlePricingCheckout(price.id)} className="brass-btn mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed" title={!isAuthenticated ? "Sign in to checkout" : ""}>{isLoading ? "Processing..." : "Checkout"}</button></div>)}</div>
            <p className="mt-3 text-[11px] text-muted-foreground">Secure checkout powered by Polar. {isAuthenticated ? "Your free room is ready now." : "Sign in to proceed with checkout."}</p>
          </article>
        </section>
      </main>
    </div>
  );
}

export { Pricing };
