import { useCallback, useEffect, useState } from "react";

export type ReaderTheme = "velvet" | "sepia" | "light";

export interface ReaderPrefs {
  theme: ReaderTheme;
  fontSize: number; // px
  lineHeight: number; // unitless multiplier
  measure: number; // max content width in ch
  focus: boolean; // hides all chrome
  colorCovers: boolean; // false → grayscale book covers
}

const DEFAULTS: ReaderPrefs = {
  theme: "velvet",
  fontSize: 17,
  lineHeight: 1.7,
  measure: 56,
  focus: false,
  colorCovers: false,
};

const STORAGE_KEY = "focusreader.prefs";

/**
 * Typography + theme preferences, persisted locally.
 *
 * Read after mount only: touching localStorage during render would mismatch
 * the server-rendered markup.
 */
export function useReaderPrefs() {
  const [prefs, setPrefs] = useState<ReaderPrefs>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    document.documentElement.setAttribute("data-theme", prefs.theme);
  }, [prefs, hydrated]);

  const update = useCallback((patch: Partial<ReaderPrefs>) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleFocus = useCallback(() => {
    setPrefs((prev) => ({ ...prev, focus: !prev.focus }));
  }, []);

  return { prefs, update, toggleFocus, hydrated };
}
