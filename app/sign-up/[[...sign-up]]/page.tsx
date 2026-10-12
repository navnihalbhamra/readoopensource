"use client";

import { AuthPage } from "@/routes/auth";

export default function SignUpPage() {
  return <AuthPage defaultMode="signup" routing="path" />;
}

