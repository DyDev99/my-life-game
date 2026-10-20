import { useSyncExternalStore } from "react";
import { useGameStore } from "@/state/gameStore";

// True when touch controls are active: forced "mobile", or "auto" on touch hardware.
export function useIsMobileMode() {
  const deviceControlMode = useGameStore((state) => state.deviceControlMode);

  // Auto-detect hardware touch support via useSyncExternalStore (React 19 compliant)
  const isTouchHardware = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("resize", onStoreChange);
      return () => window.removeEventListener("resize", onStoreChange);
    },
    () =>
      typeof window !== "undefined" &&
      ("ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches),
    () => false
  );

  return deviceControlMode === "mobile" || (deviceControlMode === "auto" && isTouchHardware);
}
