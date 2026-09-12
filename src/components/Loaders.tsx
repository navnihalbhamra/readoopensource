import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder cards that mirror the highlight card layout while data loads. */
export function HighlightSkeletons({ count = 3 }: { count?: number }) {
  return (
    <ul className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <li
          key={index}
          className="skeleton-in rounded-xl border border-border bg-surface/40 p-5"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <div className="flex gap-4">
            <Skeleton className="h-20 w-14 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-4 w-[92%]" />
              <Skeleton className="h-4 w-[78%]" />
              <Skeleton className="h-4 w-[54%]" />
              <Skeleton className="mt-4 h-3 w-40" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Placeholder grid that mirrors the book cover grid while data loads. */
export function BookSkeletons({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-5 pb-16 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="skeleton-in" style={{ animationDelay: `${index * 60}ms` }}>
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <Skeleton className="mt-2 h-3.5 w-4/5" />
          <Skeleton className="mt-1.5 h-3 w-2/5" />
        </li>
      ))}
    </ul>
  );
}
