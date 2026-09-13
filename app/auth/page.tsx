import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SignIn, SignUp } from "@clerk/tanstack-react-start";
import { useAuth as useClerkAuth } from "@clerk/react";
import { useState } from "react";

import logoAsset from "@/assets/reado-lockup.png.asset.json";
import { Reveal } from "@/components/Reveal";
import { clerkAppearance } from "@/lib/clerk-config";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Reado" },
      { name: "description", content: "Sign in to Reado to read distraction-free, save highlights and get a periodic review digest." },
      { property: "og:title", content: "Sign in — Reado" },
      { property: "og:description", content: "Your quiet reading room for long-form text and book highlights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  if (isLoaded && isSignedIn) {
    navigate({ to: "/review", replace: true });
    return null;
  }

  return (
    <div id={mode === "signin" ? "sign-in" : "sign-up"} className="min-h-screen bg-background px-5 py-10 text-foreground sm:py-16">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[0.85fr_1fr]">
        <Reveal className="mx-auto w-full max-w-sm lg:mx-0">
          <img src={logoAsset.url} alt="Reado" className="h-20 w-auto object-contain sm:h-24" width={131} height={140} />
          <p className="eyebrow mt-6">A quiet room for what you read</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Keep the words that keep you thinking.
          </h1>
          <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground">
            Import highlights, read without clutter, and get a few of them back on your schedule.
          </p>
          <div className="mt-8 border-l border-accent/60 pl-4 font-body text-sm italic leading-relaxed text-muted-foreground">
            “The mind is not a vessel to be filled, but a fire to be kindled.”
          </div>
        </Reveal>

        <Reveal className="mx-auto w-full max-w-md rounded-xl border border-border bg-surface/50 p-5 shadow-2xl shadow-background/40 sm:p-8">
          {mode === "signin" ? (
            <SignIn appearance={clerkAppearance} routing="hash" fallbackRedirectUrl="/review" signUpUrl="/auth#sign-up" />
          ) : (
            <SignUp appearance={clerkAppearance} routing="hash" fallbackRedirectUrl="/onboarding" signInUrl="/auth#sign-in" />
          )}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full text-center text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {mode === "signin" ? "No account yet? Create one" : "Already have an account? Sign in"}
          </button>
        </Reveal>
      </div>
    </div>
  );
}
