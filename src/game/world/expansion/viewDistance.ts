import type { GraphicsQuality } from "@/state/settingsStorage";

// Fog range per graphics preset. Districts beyond the fog are hidden (see ExpandedCity),
// so draw distance and rendering cost scale together.
export const FOG_BY_QUALITY: Record<GraphicsQuality, [near: number, far: number]> = {
  low: [45, 130],
  medium: [60, 175],
  high: [75, 240],
};

/** Districts closer than this (to their edge) stay visible. */
export function districtViewDistance(quality: GraphicsQuality) {
  return FOG_BY_QUALITY[quality][1] + 30;
}
