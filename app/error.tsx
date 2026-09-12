"use client";

import { useEffect } from "react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => reportLovableError(error, { boundary: "next_root_error" }), [error]);
  return <div className="flex min-h-screen items-center justify-center bg-background px-6"><div className="max-w-md text-center"><h1 className="font-display text-2xl font-semibold">This page didn&apos;t load</h1><p className="mt-2 text-sm text-muted-foreground">{error.message || "Something went wrong on our end."}</p><button onClick={reset} className="brass-btn mt-6">Try again</button></div></div>;
}