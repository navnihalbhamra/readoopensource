"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/hooks/useAuth";
import { clerkAppearance, clerkPublishableKey } from "@/lib/clerk-config";

// One shared TanStack Query client for all client pages. Server functions are
// called through the `rpc` server action, so this only manages cache state.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 15_000 },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} appearance={clerkAppearance}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
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
      </QueryClientProvider>
    </ClerkProvider>
  );
}
