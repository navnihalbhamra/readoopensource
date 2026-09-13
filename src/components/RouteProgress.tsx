import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/**
 * Global activity indicator: a thin top progress bar plus a floating pill so the
 * user always sees that navigation or data work is in flight.
 */
export function RouteProgress() {
  const routerLoading = useRouterState({ select: (s) => s.status === "pending" || s.isLoading });
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const active = routerLoading || fetching > 0 || mutating > 0;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      return;
    }
    const timer = setTimeout(() => setVisible(false), 320);
    return () => clearTimeout(timer);
  }, [active]);

  if (!visible) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] overflow-hidden">
        <div className={`route-bar ${active ? "" : "route-bar-done"}`} />
      </div>
      <div
        aria-live="polite"
        className={`pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 ${active ? "activity-pill-in" : "activity-pill-out"}`}
      >
        <span className="flex items-center gap-2 rounded-full border border-border bg-surface/90 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground shadow-lg backdrop-blur">
          <span className="spinner h-3 w-3" />
          {mutating > 0 ? "Saving" : routerLoading ? "Loading page" : "Syncing"}
        </span>
      </div>
    </>
  );
}
