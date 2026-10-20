// Fullscreen + landscape lock helpers. Support varies a lot: Android Chrome allows both,
// iPadOS allows fullscreen only, iPhone Safari allows neither (use Add to Home Screen).
// Every call is best-effort and never throws.

type LockableOrientation = ScreenOrientation & { lock?: (o: "landscape") => Promise<void> };
type WebkitDocument = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void> };
type WebkitElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };

export function canFullscreen() {
  if (typeof document === "undefined") return false;
  const el = document.documentElement as WebkitElement;
  return Boolean(el.requestFullscreen || el.webkitRequestFullscreen);
}

export function isFullscreen() {
  if (typeof document === "undefined") return false;
  const d = document as WebkitDocument;
  return Boolean(d.fullscreenElement || d.webkitFullscreenElement);
}

/** Launched from the home screen as an installed web app. */
export function isStandaloneApp() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Enter fullscreen and try to lock landscape. Returns whether landscape got locked. */
export async function enterLandscapeFullscreen(): Promise<boolean> {
  try {
    const el = document.documentElement as WebkitElement;
    if (!isFullscreen()) {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: "hide" });
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    }
  } catch {
    // Not allowed here (e.g. iPhone); fall through to the orientation attempt
  }
  try {
    const orientation = screen.orientation as LockableOrientation | undefined;
    if (orientation?.lock) {
      await orientation.lock("landscape");
      return true;
    }
  } catch {
    // Lock needs fullscreen on most browsers, and isn't supported on iOS
  }
  return false;
}

export async function exitFullscreen() {
  try {
    const d = document as WebkitDocument;
    if (d.fullscreenElement) await document.exitFullscreen();
    else if (d.webkitFullscreenElement && d.webkitExitFullscreen) await d.webkitExitFullscreen();
  } catch {
    // ignore
  }
}

export function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
