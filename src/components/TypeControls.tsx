import type { ReactNode } from "react";

import type { ReaderPrefs, ReaderTheme } from "@/hooks/useReaderPrefs";

const THEMES: { id: ReaderTheme; label: string }[] = [
  { id: "velvet", label: "Black" },
  { id: "sepia", label: "Graphite" },
  { id: "light", label: "White" },
];

interface Props {
  prefs: ReaderPrefs;
  update: (patch: Partial<ReaderPrefs>) => void;
}

function Row({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
        <span className="text-[11px] text-muted-foreground/80 tabular-nums">{value}</span>
      </div>
      {children}
    </div>
  );
}

/** Compact typography popover — no sidebar, per the reading-first layout. */
export function TypeControls({ prefs, update }: Props) {
  return (
    <div className="w-64 space-y-5 rounded-xl bg-surface p-4 shadow-lg ring-1 ring-border">
      <Row label="Font size" value={`${prefs.fontSize}px`}>
        <input
          type="range"
          min={14}
          max={26}
          step={1}
          value={prefs.fontSize}
          onChange={(e) => update({ fontSize: Number(e.target.value) })}
          className="w-full accent-primary"
          aria-label="Font size"
        />
      </Row>

      <Row label="Line height" value={prefs.lineHeight.toFixed(2)}>
        <input
          type="range"
          min={1.3}
          max={2.2}
          step={0.05}
          value={prefs.lineHeight}
          onChange={(e) => update({ lineHeight: Number(e.target.value) })}
          className="w-full accent-primary"
          aria-label="Line height"
        />
      </Row>

      <Row label="Content width" value={`${prefs.measure}ch`}>
        <input
          type="range"
          min={40}
          max={86}
          step={2}
          value={prefs.measure}
          onChange={(e) => update({ measure: Number(e.target.value) })}
          className="w-full accent-primary"
          aria-label="Content width"
        />
      </Row>

      <div>
        <span className="mb-2 block text-[11px] font-medium text-muted-foreground">Theme</span>
        <div className="flex gap-1.5">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => update({ theme: theme.id })}
              className={
                prefs.theme === theme.id
                  ? "brass-btn flex-1 justify-center"
                  : "chrome-btn flex-1 justify-center"
              }
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
