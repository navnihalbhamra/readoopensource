/**
 * Book cover with a typographic fallback.
 *
 * Covers are hot-linked from Open Library / Google Books (no storage bucket)
 * and lazy-loaded. By default they're rendered in grayscale so they sit inside
 * the monochrome theme; Settings can switch them back to full colour.
 */
import { useState } from "react";

interface Props {
  title: string;
  author?: string | null | undefined;
  coverUrl?: string | null | undefined;
  /** Tailwind sizing classes for the frame. */
  className?: string | undefined;
  /** false → full colour covers. */
  mono?: boolean | undefined;
}

function initials(title: string) {
  return title
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

export function BookCover({ title, author, coverUrl, className = "w-10", mono = true }: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(coverUrl) && !failed;

  return (
    <div
      className={`${className} aspect-[2/3] shrink-0 overflow-hidden rounded-sm bg-surface ring-1 ring-border`}
      title={[title, author].filter(Boolean).join(" — ")}
    >
      {showImage ? (
        <img
          src={coverUrl!}
          alt={`Cover of ${title}`}
          loading="lazy"
          onError={() => setFailed(true)}
          onLoad={(event) => {
            // Open Library answers 200 with a 1px placeholder for missing art.
            const img = event.currentTarget;
            if (img.naturalWidth < 20 || img.naturalHeight < 20) setFailed(true);
          }}
          className={`size-full object-cover ${mono ? "grayscale contrast-125" : ""}`}
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <span className="font-display text-[11px] font-semibold tracking-[0.1em] text-muted-foreground">
            {initials(title) || "??"}
          </span>
        </div>
      )}
    </div>
  );
}
