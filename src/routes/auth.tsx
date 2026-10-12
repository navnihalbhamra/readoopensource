"use client";

import { SignIn, SignUp, useAuth as useClerkAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import logoAsset from "@/assets/reado-lockup.png.asset.json";
import { Reveal } from "@/components/Reveal";
import { clerkAppearance } from "@/lib/clerk-config";

export function AuthPage({
  defaultMode = "signin",
  routing = "path",
}: {
  defaultMode?: "signin" | "signup";
  routing?: "path" | "hash";
} = {}) {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/review");
  }, [isLoaded, isSignedIn, router]);

  if (isLoaded && isSignedIn) return null;

  return (
    <div
      id={mode === "signin" ? "sign-in" : "sign-up"}
      className="min-h-screen bg-background px-5 py-10 text-foreground sm:py-16"
    >
      <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[0.85fr_1fr]">
        <Reveal className="mx-auto w-full max-w-sm lg:mx-0">
          <img
            src={logoAsset.url}
            alt="Reado"
            className="h-20 w-auto object-contain sm:h-24"
            width={131}
            height={140}
          />
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
            routing === "path" ? (
              <SignIn
                appearance={clerkAppearance}
                routing="path"
                path="/sign-in"
                fallbackRedirectUrl="/review"
                signUpUrl="/sign-up"
              />
            ) : (
              <SignIn
                appearance={clerkAppearance}
                routing="hash"
                fallbackRedirectUrl="/review"
                signUpUrl="/auth#sign-up"
              />
            )
          ) : routing === "path" ? (
            <SignUp
              appearance={clerkAppearance}
              routing="path"
              path="/sign-up"
              fallbackRedirectUrl="/onboarding"
              signInUrl="/sign-in"
            />
          ) : (
            <SignUp
              appearance={clerkAppearance}
              routing="hash"
              fallbackRedirectUrl="/onboarding"
              signInUrl="/auth#sign-in"
            />
          )}
          <button
            type="button"
            onClick={() => {
              const nextMode = mode === "signin" ? "signup" : "signin";
              if (routing === "path") {
                router.push(nextMode === "signin" ? "/sign-in" : "/sign-up");
              } else {
                setMode(nextMode);
              }
            }}
            className="mt-6 w-full text-center text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {mode === "signin" ? "No account yet? Create one" : "Already have an account? Sign in"}
          </button>
        </Reveal>
      </div>
    </div>
  );
}
