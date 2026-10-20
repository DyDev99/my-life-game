// Shared 2D map renderer for the minimap and the full world map.
// Screen x follows world +X, screen y follows world +Z (north = -Z is up when rotation = 0).

import { MAP_POIS, MAP_ROADS, MAP_WATER, MAP_ZONES, WORLD_BOUNDS } from "@/data/mapLayout";
import type { AABBCollider } from "@/game/physics/collisionSystem";

export interface MapView {
  cx: number; // world point at the canvas centre
  cz: number;
  scale: number; // CSS px per metre
  rotation: number; // radians, applied around the centre
  width: number; // CSS px
  height: number;
}

export interface MapMarkers {
  player: { x: number; z: number; heading: number };
  waypoint: { x: number; z: number } | null;
  vehicles: Array<{ x: number; z: number; icon: string }>;
  buildings: readonly AABBCollider[];
  language: "en" | "km";
  showLabels: boolean;
  /** Clamp waypoint to this screen radius (minimap edge); omit for the full map. */
  edgeRadius?: number;
}

export const MAP_COLORS = {
  void: "#0f1714",
  land: "#22312a",
  rice: "#3b4f2b",
  temple: "#4d3e24",
  pitch: "#2e5a36",
  court: "#5b4631",
  plaza: "#39403f",
  industrial: "#30363a",
  dirt: "#3d3424",
  runway: "#4a5057",
  parking: "#3a4045",
  track: "#6b3b2c",
  water: "#1f4f78",
  highway: "#cfd5da",
  road: "#9aa5ae",
  lane: "#7d8891",
  path: "#5e6a73",
  building: "#3f4c58",
  buildingEdge: "#6b7b88",
  collapsed: "#7c3a32",
  player: "#5ee7ff",
  waypoint: "#c24dff",
};

export function worldToScreen(v: MapView, x: number, z: number): [number, number] {
  const dx = x - v.cx;
  const dz = z - v.cz;
  const c = Math.cos(v.rotation);
  const s = Math.sin(v.rotation);
  return [v.width / 2 + (dx * c - dz * s) * v.scale, v.height / 2 + (dx * s + dz * c) * v.scale];
}

export function screenToWorld(v: MapView, sx: number, sy: number): [number, number] {
  const rx = (sx - v.width / 2) / v.scale;
  const ry = (sy - v.height / 2) / v.scale;
  const c = Math.cos(v.rotation);
  const s = Math.sin(v.rotation);
  return [v.cx + rx * c + ry * s, v.cz - rx * s + ry * c];
}

/** Rotation that puts a world heading (forward = sin h, cos h) at the top of the map. */
export function headingUpRotation(heading: number) {
  return heading - Math.PI;
}

export function drawMap(ctx: CanvasRenderingContext2D, v: MapView, m: MapMarkers) {
  ctx.save();
  ctx.fillStyle = MAP_COLORS.void;
  ctx.fillRect(0, 0, v.width, v.height);

  // World-space layers
  ctx.save();
  ctx.translate(v.width / 2, v.height / 2);
  ctx.rotate(v.rotation);
  ctx.scale(v.scale, v.scale);
  ctx.translate(-v.cx, -v.cz);

  const rect = (r: { x: number; z: number; w: number; d: number }) =>
    ctx.fillRect(r.x - r.w / 2, r.z - r.d / 2, r.w, r.d);

  ctx.fillStyle = MAP_COLORS.land;
  const b = WORLD_BOUNDS;
  ctx.fillRect(b.minX, b.minZ, b.maxX - b.minX, b.maxZ - b.minZ);

  for (const z of MAP_ZONES) {
    ctx.fillStyle = MAP_COLORS[z.kind];
    rect(z);
  }
  ctx.fillStyle = MAP_COLORS.water;
  MAP_WATER.forEach(rect);

  // Paths and lanes first so main roads draw on top at junctions
  const order = { path: 0, lane: 1, road: 2, highway: 3 } as const;
  for (const r of [...MAP_ROADS].sort((a, c) => order[a.kind] - order[c.kind])) {
    ctx.fillStyle = MAP_COLORS[r.kind];
    rect(r);
  }

  ctx.lineWidth = 1 / v.scale;
  for (const box of m.buildings) {
    // Skip low walls, rails and riverbank barriers; keep real structures
    if ((box.maxY ?? 0) < 3.5) continue;
    ctx.fillStyle = box.isCollapsed ? MAP_COLORS.collapsed : MAP_COLORS.building;
    ctx.strokeStyle = MAP_COLORS.buildingEdge;
    ctx.fillRect(box.minX, box.minZ, box.maxX - box.minX, box.maxZ - box.minZ);
    ctx.strokeRect(box.minX, box.minZ, box.maxX - box.minX, box.maxZ - box.minZ);
  }

  // GPS line
  if (m.waypoint) {
    ctx.strokeStyle = MAP_COLORS.waypoint;
    ctx.lineWidth = 3 / v.scale;
    ctx.setLineDash([6 / v.scale, 5 / v.scale]);
    ctx.beginPath();
    ctx.moveTo(m.player.x, m.player.z);
    ctx.lineTo(m.waypoint.x, m.waypoint.z);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();

  // Screen-space markers (stay upright regardless of map rotation)
  const iconSize = m.showLabels ? 18 : 13;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const poi of MAP_POIS) {
    const [sx, sy] = worldToScreen(v, poi.x, poi.z);
    if (sx < -20 || sy < -20 || sx > v.width + 20 || sy > v.height + 20) continue;
    ctx.fillStyle = "rgba(10,16,22,0.85)";
    ctx.beginPath();
    ctx.arc(sx, sy, iconSize * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `${iconSize}px system-ui, sans-serif`;
    ctx.fillText(poi.icon, sx, sy + 1);
    if (m.showLabels) {
      const label = m.language === "km" ? poi.nameKm : poi.nameEn;
      ctx.font = "600 12px system-ui, sans-serif";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(5,10,14,0.9)";
      ctx.strokeText(label, sx, sy + iconSize + 4);
      ctx.fillStyle = "#e8eef3";
      ctx.fillText(label, sx, sy + iconSize + 4);
    }
  }

  for (const veh of m.vehicles) {
    const [sx, sy] = worldToScreen(v, veh.x, veh.z);
    ctx.font = `${iconSize - 2}px system-ui, sans-serif`;
    ctx.fillText(veh.icon, sx, sy);
  }

  if (m.waypoint) {
    let [sx, sy] = worldToScreen(v, m.waypoint.x, m.waypoint.z);
    if (m.edgeRadius) {
      const dx = sx - v.width / 2;
      const dy = sy - v.height / 2;
      const d = Math.hypot(dx, dy);
      if (d > m.edgeRadius) {
        sx = v.width / 2 + (dx / d) * m.edgeRadius;
        sy = v.height / 2 + (dy / d) * m.edgeRadius;
      }
    }
    drawPin(ctx, sx, sy, m.showLabels ? 1.3 : 1);
  }

  // Player arrow, pointing along heading in screen space
  const [px, py] = worldToScreen(v, m.player.x, m.player.z);
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(v.rotation + Math.PI - m.player.heading);
  const s = m.showLabels ? 1.4 : 1;
  ctx.fillStyle = MAP_COLORS.player;
  ctx.strokeStyle = "#06222a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -9 * s);
  ctx.lineTo(6.5 * s, 7 * s);
  ctx.lineTo(0, 3.5 * s);
  ctx.lineTo(-6.5 * s, 7 * s);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawPin(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = MAP_COLORS.waypoint;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-7, -9, -7, -17, 0, -17);
  ctx.bezierCurveTo(7, -17, 7, -9, 0, 0);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, -11.5, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Resize a canvas backing store to its CSS size × device pixel ratio; returns the 2D context. */
export function prepareCanvas(canvas: HTMLCanvasElement, cssW: number, cssH: number) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.round(cssW * dpr);
  const h = Math.round(cssH * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d");
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
