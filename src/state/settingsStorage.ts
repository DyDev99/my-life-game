// Per-device player settings, kept in localStorage.
// Every access is guarded: storage can be missing (SSR) or throw (private mode, blocked site data).

export type GraphicsQuality = "low" | "medium" | "high";

export interface SavedSettings {
  quality: GraphicsQuality;
  shadows: boolean;
  lookScale: number;
}

const KEY = "mylife.settings.v1";

export function loadSettings(): SavedSettings | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<SavedSettings>;
    const quality: GraphicsQuality = v.quality === "low" || v.quality === "high" ? v.quality : "medium";
    const lookScale = typeof v.lookScale === "number" ? Math.min(2, Math.max(0.2, v.lookScale)) : 1;
    return { quality, shadows: v.shadows !== false, lookScale };
  } catch {
    return null;
  }
}

export function saveSettings(settings: SavedSettings) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Settings simply won't persist
  }
}
