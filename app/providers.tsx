"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { type ReactNode } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/hooks/useAuth";
import { clerkAppearance, clerkPublishableKey } from "@/lib/clerk-config";

const toaster = (
  <Toaster
    position="bottom-center"
    toastOptions={{
      style: {
        background: "var(--surface)",
        color: "var(--foreground)",
        border: "1px solid var(--border)",
        fontFamily: "var(--font-ui)",
        fontSize: "13px",
      },
    }}
  />
);

// Shown instead of booting Clerk when no publishable key is configured.
// Without this, Clerk fails with the cryptic "failed_to_load_clerk_js".
function AuthSetupNotice() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6 py-16 font-body text-foreground">
      <div className="w-full max-w-xl rounded-xl border border-border bg-surface/60 p-8 shadow-2xl">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Auth not configured</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          No Clerk publishable key was found. The previous Clerk instance is no longer reachable, so
          fresh keys are required.
        </p>
        <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Create an app at{" "}
            <a
              href="https://dashboard.clerk.com"
              className="text-foreground underline underline-offset-2 hover:text-accent"
            >
              dashboard.clerk.com
            </a>
            .
          </li>
          <li>Copy the development-instance keys (pk_test_… / sk_test_…).</li>
          <li>
            Put them in <code className="text-foreground">.env</code> as{" "}
            <code className="text-foreground">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{" "}
            <code className="text-foreground">CLERK_SECRET_KEY</code>.
          </li>
          <li>
            Restart <code className="text-foreground">npm run dev</code>.
          </li>
        </ol>
      </div>
    </div>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  if (!clerkPublishableKey) {
    return (
      <>
        <AuthSetupNotice />
        {toaster}
      </>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} appearance={clerkAppearance}>
      <AuthProvider>{children}</AuthProvider>
      {toaster}
    </ClerkProvider>
  );
}
