"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/hooks/useAuth";
import { clerkAppearance } from "@/lib/clerk-config";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <AuthProvider>{children}</AuthProvider>
      <Toaster position="bottom-center" />
    </ClerkProvider>
  );
}
