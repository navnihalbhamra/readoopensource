"use client";

import { AuthPage } from "@/routes/auth";

export default function SignInPage() {
  return <AuthPage defaultMode="signin" routing="path" />;
}

