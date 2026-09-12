interface Props {
  className?: string;
  label?: string;
}

/** Minimal monochrome activity ring used for loading and pending states. */
export function Spinner({ className = "h-4 w-4", label = "Loading" }: Props) {
  return (
    <span role="status" aria-label={label} className={`spinner ${className}`}>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function LoadingRow({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}
