"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair, LocateFixed, MapPin, Minus, Navigation, Plus, X } from "lucide-react";
import { useGameStore } from "@/state/gameStore";
import { collisionWorld } from "@/game/physics/collisionSystem";
import { MAP_POIS, WORLD_BOUNDS, type MapPoi } from "@/data/mapLayout";
import { MAP_COLORS, drawMap, prepareCanvas, screenToWorld, type MapView } from "@/ui/map/drawMap";
import { parkedVehicleMarkers } from "@/ui/hud/Minimap";

const MIN_SCALE = 1.5;
const MAX_SCALE = 14;
const CLICK_SLOP_PX = 5; // pointer travel below this is a click (set waypoint), above is a pan

// Full-screen north-up world map (M). Game is paused while it's open.
export function WorldMap() {
  const open = useGameStore((s) => s.pauseScreen === "map");
  // Mounted only while open, so pan/zoom resets each time the map opens
  return open ? <WorldMapPanel /> : null;
}

function WorldMapPanel() {
  const language = useGameStore((s) => s.language);
  const waypoint = useGameStore((s) => s.waypoint);
  const ridingVehicle = useGameStore((s) => s.ridingVehicle);
  const setWaypoint = useGameStore((s) => s.setWaypoint);
  const setPauseScreen = useGameStore((s) => s.setPauseScreen);
  const moveToLocation = useGameStore((s) => s.moveToLocation);
  const teleportTo = useGameStore((s) => s.teleportTo);

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<{ cx: number; cz: number; scale: number } | null>(null);
  const drag = useRef<{ x: number; y: number; cx: number; cz: number; moved: boolean } | null>(null);
  const km = language === "km";

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = e.contentRect.width;
      const h = e.contentRect.height;
      setBox({ w, h });
      // First layout: the whole world in view
      const b = WORLD_BOUNDS;
      const fit = Math.min(w / (b.maxX - b.minX), h / (b.maxZ - b.minZ));
      setView((v) => v ?? { cx: (b.minX + b.maxX) / 2, cz: (b.minZ + b.maxZ) / 2, scale: Math.max(MIN_SCALE, fit) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mapView = useCallback(
    (): MapView | null => (view && box.w ? { ...view, rotation: 0, width: box.w, height: box.h } : null),
    [view, box]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const v = mapView();
    if (!canvas || !v) return;
    const ctx = prepareCanvas(canvas, v.width, v.height);
    if (!ctx) return;
    const s = useGameStore.getState();
    drawMap(ctx, v, {
      player: { x: s.targetPos[0], z: s.targetPos[2], heading: s.playerHeading },
      waypoint,
      vehicles: parkedVehicleMarkers(),
      buildings: collisionWorld.getBoxes(),
      language,
      showLabels: true,
    });
  }, [mapView, waypoint, language]);

  const zoom = (factor: number, sx?: number, sy?: number) => {
    const v = mapView();
    if (!v) return;
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
    // Keep the point under the cursor fixed while zooming
    const [wx, wz] = screenToWorld(v, sx ?? v.width / 2, sy ?? v.height / 2);
    const k = v.scale / scale;
    setView({ scale, cx: wx + (v.cx - wx) * k, cz: wz + (v.cz - wz) * k });
  };

  const localPoint = (e: React.PointerEvent | React.WheelEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };

  const markAt = (sx: number, sy: number) => {
    const v = mapView();
    if (!v) return;
    const [x, z] = screenToWorld(v, sx, sy);
    // Snap to a nearby landmark so the waypoint gets a useful name
    const near = MAP_POIS.map((p) => ({ p, d: Math.hypot(p.x - x, p.z - z) })).sort(
      (a, b) => a.d - b.d
    )[0];
    if (near && near.d * v.scale < 22) {
      selectPoi(near.p);
      return;
    }
    setWaypoint({ x, z, label: km ? "ទីតាំងដែលបានសម្គាល់" : "Marked location" });
  };

  const selectPoi = (poi: MapPoi) => {
    setWaypoint({ x: poi.x, z: poi.z, label: km ? poi.nameKm : poi.nameEn });
  };

  const travel = (poi: MapPoi) => {
    if (poi.location) moveToLocation(poi.location);
    else teleportTo(poi.x, poi.z);
    setWaypoint(null);
    setPauseScreen(null);
  };

  const centreOnPlayer = () => {
    const [px, , pz] = useGameStore.getState().targetPos;
    setView((v) => (v ? { ...v, cx: px, cz: pz } : v));
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950/90 backdrop-blur-sm text-white pointer-events-auto">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-cyan-300" />
          <h1 className={`text-lg font-black ${km ? "" : "tracking-[0.12em]"}`}>{km ? "ផែនទីពិភពលោក" : "WORLD MAP"}</h1>
          <span className="hidden sm:inline text-xs text-slate-400">
            {km ? "ចុចលើផែនទីដើម្បីដាក់ចំណុចដៅ · អូសដើម្បីរំកិល · កង់កណ្ដុរដើម្បីពង្រីក" : "Click to set a waypoint · drag to pan · scroll to zoom"}
          </span>
        </div>
        <button
          onClick={() => setPauseScreen(null)}
          className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-slate-800/80 px-3 py-1.5 text-sm font-bold hover:bg-slate-700"
        >
          <X className="w-4 h-4" />
          {km ? "ត្រឡប់ទៅលេង" : "Back to game"}
          <kbd className="hidden sm:inline font-mono text-[10px] text-slate-400">M</kbd>
        </button>
      </header>

      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        <div ref={wrapRef} className="relative flex-1 min-h-[45vh]">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
            onPointerDown={(e) => {
              if (!view) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, y: e.clientY, cx: view.cx, cz: view.cz, moved: false };
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d || !view) return;
              const dx = e.clientX - d.x;
              const dy = e.clientY - d.y;
              if (Math.hypot(dx, dy) > CLICK_SLOP_PX) d.moved = true;
              if (d.moved) setView({ ...view, cx: d.cx - dx / view.scale, cz: d.cz - dy / view.scale });
            }}
            onPointerUp={(e) => {
              const d = drag.current;
              drag.current = null;
              if (d && !d.moved) markAt(...localPoint(e));
            }}
            onWheel={(e) => zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, ...localPoint(e))}
          />
          <div className="absolute right-3 bottom-3 flex flex-col gap-1.5">
            {[
              { icon: <Plus className="w-4 h-4" />, label: km ? "ពង្រីក" : "Zoom in", on: () => zoom(1.3) },
              { icon: <Minus className="w-4 h-4" />, label: km ? "បង្រួម" : "Zoom out", on: () => zoom(1 / 1.3) },
              { icon: <LocateFixed className="w-4 h-4" />, label: km ? "ទីតាំងខ្ញុំ" : "Centre on me", on: centreOnPlayer },
            ].map((b) => (
              <button
                key={b.label}
                onClick={b.on}
                aria-label={b.label}
                title={b.label}
                className="grid place-items-center w-9 h-9 rounded-lg border border-white/15 bg-slate-900/90 hover:bg-slate-700"
              >
                {b.icon}
              </button>
            ))}
          </div>
        </div>

        <aside className="md:w-80 max-h-[40vh] md:max-h-none overflow-y-auto border-t md:border-t-0 md:border-l border-white/10 p-4 flex flex-col gap-4">
          <section>
            <h2 className={`text-[11px] font-bold text-slate-400 ${km ? "" : "tracking-widest"} mb-2`}>{km ? "ចំណុចដៅ GPS" : "GPS WAYPOINT"}</h2>
            {waypoint ? (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-2">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin className="w-4 h-4 text-fuchsia-300" />
                  {waypoint.label}
                </span>
                <button onClick={() => setWaypoint(null)} className="text-xs text-slate-300 hover:text-white underline">
                  {km ? "លុប" : "Clear"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-400">{km ? "មិនទាន់មានចំណុចដៅទេ" : "No waypoint set"}</p>
            )}
          </section>

          <section>
            <h2 className={`text-[11px] font-bold text-slate-400 ${km ? "" : "tracking-widest"} mb-2`}>{km ? "ទីកន្លែង" : "PLACES"}</h2>
            <ul className="flex flex-col gap-1.5">
              {MAP_POIS.map((p) => (
                <li key={p.id} className="flex items-center gap-2 rounded-xl bg-slate-900/80 border border-white/10 px-2.5 py-1.5">
                  <span className="text-base w-6 text-center">{p.icon}</span>
                  <span className="flex-1 text-sm font-medium truncate">{km ? p.nameKm : p.nameEn}</span>
                  <button
                    onClick={() => selectPoi(p)}
                    title={km ? "ដាក់ចំណុចដៅ" : "Set waypoint"}
                    aria-label={km ? "ដាក់ចំណុចដៅ" : "Set waypoint"}
                    className="grid place-items-center w-7 h-7 rounded-lg bg-fuchsia-600/30 border border-fuchsia-400/40 hover:bg-fuchsia-600/50"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => travel(p)}
                    disabled={Boolean(ridingVehicle)}
                    title={ridingVehicle ? (km ? "ចុះពីយានជាមុនសិន" : "Get off your vehicle first") : km ? "ធ្វើដំណើរ" : "Fast travel"}
                    className="rounded-lg px-2 h-7 text-xs font-bold bg-cyan-600/30 border border-cyan-400/40 hover:bg-cyan-600/50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {km ? "ទៅ" : "Go"}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-slate-300">
            <h2 className={`col-span-2 text-[11px] font-bold text-slate-400 ${km ? "" : "tracking-widest"}`}>{km ? "សញ្ញា" : "LEGEND"}</h2>
            {[
              [MAP_COLORS.player, km ? "អ្នក" : "You"],
              [MAP_COLORS.waypoint, km ? "ចំណុចដៅ" : "Waypoint"],
              [MAP_COLORS.highway, km ? "ផ្លូវជាតិ" : "Highway"],
              [MAP_COLORS.road, km ? "ផ្លូវ" : "Road"],
              [MAP_COLORS.water, km ? "ទន្លេ" : "River"],
              [MAP_COLORS.building, km ? "អគារ" : "Building"],
              [MAP_COLORS.collapsed, km ? "អគារខូច" : "Damaged"],
              [MAP_COLORS.pitch, km ? "ទីលានកីឡា" : "Sports"],
            ].map(([c, label]) => (
              <span key={label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm border border-white/20" style={{ background: c }} />
                {label}
              </span>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
}
