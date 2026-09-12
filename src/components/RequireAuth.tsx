import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/hooks/useAuth";

/** Client-side gate for authenticated screens. Server functions enforce the same boundary. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) router.replace("/auth");
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="eyebrow animate-pulse">Reado</p>
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Spinner />
          <span>{loading ? "Checking your session…" : "Taking you to sign in…"}</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
