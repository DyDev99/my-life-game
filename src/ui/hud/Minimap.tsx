"use client";

import React, { useEffect, useRef, useState } from "react";
import { Map as MapIcon, Pause } from "lucide-react";
import { useGameStore } from "@/state/gameStore";
import { collisionWorld } from "@/game/physics/collisionSystem";
import { cameraTelemetry } from "@/game/camera/CameraController";
import { audio } from "@/game/audio/audioManager";
import { districtAt } from "@/data/mapLayout";
import { drawMap, headingUpRotation, prepareCanvas, type MapMarkers } from "@/ui/map/drawMap";
import { useIsMobileMode } from "@/ui/hud/useIsMobileMode";

const REFRESH_MS = 80; // ~12 Hz is plenty for a minimap and keeps it off the render loop
const ARRIVE_RADIUS = 8;

/** Vehicle markers for parked vehicles (the one being ridden is the player arrow). */
export function parkedVehicleMarkers(): MapMarkers["vehicles"] {
  const s = useGameStore.getState();
  const out: MapMarkers["vehicles"] = [];
  if (s.ridingVehicle !== "supercar") out.push({ x: s.supercarPos[0], z: s.supercarPos[2], icon: "🏎️" });
  if (s.ridingVehicle !== "plane") {
    out.push({ x: s.planePos[0], z: s.planePos[2], icon: "✈️" });
  } else {
    // When flying, prominently mark the Airbase Runway Resupply & Rearm station
    out.push({ x: 60, z: 210, icon: "🛫" });
  }
  return out;
}

// Rotating, player-centred GTA-style minimap. Reads state on a timer, never re-renders per frame.
export function Minimap() {
  const isMobile = useIsMobileMode();
  const language = useGameStore((s) => s.language);
  const waypoint = useGameStore((s) => s.waypoint);
  const setPauseScreen = useGameStore((s) => s.setPauseScreen);
  const health = useGameStore((s) => s.stats.health);
  const energy = useGameStore((s) => s.stats.energy);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const radiusRef = useRef(55);
  const [caption, setCaption] = useState({ district: "", distance: -1 });

  const size = isMobile ? 108 : 184;
  const km = language === "km";

  useEffect(() => {
    const tick = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const s = useGameStore.getState();
      const [px, , pz] = s.targetPos;

      // Zoom out with speed: on foot ~55 m radius, flying ~150 m
      const wantRadius = s.ridingVehicle === "plane" ? 150 : s.ridingVehicle ? 95 : 55;
      radiusRef.current += (wantRadius - radiusRef.current) * 0.15;

      const ctx = prepareCanvas(canvas, size, size);
      if (!ctx) return;
      drawMap(
        ctx,
        {
          cx: px,
          cz: pz,
          scale: size / 2 / radiusRef.current,
          rotation: headingUpRotation(cameraTelemetry.yaw),
          width: size,
          height: size,
        },
        {
          player: { x: px, z: pz, heading: s.playerHeading },
          waypoint: s.waypoint,
          vehicles: parkedVehicleMarkers(),
          buildings: collisionWorld.getBoxes(),
          language: s.language,
          showLabels: false,
          edgeRadius: size / 2 - 12,
        }
      );

      let distance = -1;
      if (s.waypoint) {
        distance = Math.hypot(s.waypoint.x - px, s.waypoint.z - pz);
        if (distance < ARRIVE_RADIUS) {
          s.setWaypoint(null);
          s.addStatPop(s.language === "km" ? "📍 មកដល់ហើយ" : "📍 Destination reached", "skill");
          audio.playSuccess();
          distance = -1;
        }
      }
      const d = districtAt(px, pz);
      const district = s.language === "km" ? d.km : d.en;
      const rounded = distance < 0 ? -1 : Math.round(distance / 5) * 5;
      setCaption((prev) => (prev.district === district && prev.distance === rounded ? prev : { district, distance: rounded }));
    };
    tick();
    const id = window.setInterval(tick, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [size]);

  return (
    <div
      // data-touch-control keeps clicks here from firing the equipped weapon
      data-touch-control
      className="fixed z-40 flex flex-col items-center gap-1.5 select-none"
      style={
        isMobile
          ? { top: "calc(env(safe-area-inset-top) + 0.75rem)", left: "calc(env(safe-area-inset-left) + 0.75rem)" }
          : { bottom: "calc(env(safe-area-inset-bottom) + 1rem)", left: "calc(env(safe-area-inset-left) + 1rem)" }
      }
    >
      <div className="relative" style={{ width: size, height: size }}>
        <canvas
          ref={canvasRef}
          onClick={() => setPauseScreen("map")}
          className="rounded-full border-2 border-white/70 shadow-[0_6px_24px_rgba(0,0,0,0.45)] cursor-pointer pointer-events-auto"
          style={{ width: size, height: size }}
          aria-label={km ? "ផែនទីតូច — ចុចដើម្បីបើកផែនទី" : "Minimap — click to open world map"}
        />
        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/80 pointer-events-none">
          ▲
        </span>
      </div>

      {isMobile ? (
        // GTA-style vitals under the minimap
        <div className="flex flex-col gap-1 pointer-events-none" style={{ width: size }}>
          {[
            [health, "bg-emerald-400"],
            [energy, "bg-sky-400"],
          ].map(([v, color], i) => (
            <div key={i} className="h-1.5 w-full rounded-full bg-black/50 overflow-hidden">
              <div className={`h-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, Number(v)))}%` }} />
            </div>
          ))}
          <span className="truncate text-center text-[10px] font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
            {caption.district}
            {waypoint && caption.distance >= 0 && <span className="text-fuchsia-300"> · {caption.distance} m</span>}
          </span>
        </div>
      ) : (
      <div className="flex items-center gap-1.5 pointer-events-auto">
        <span className="max-w-[9rem] truncate rounded-md bg-slate-950/75 border border-white/15 px-2 py-0.5 text-[11px] font-semibold text-slate-100">
          {caption.district}
          {waypoint && caption.distance >= 0 && (
            <span className="text-fuchsia-300"> · {caption.distance} m</span>
          )}
        </span>
        <button
          onClick={() => setPauseScreen("map")}
          className="flex items-center gap-1 rounded-md bg-slate-950/75 border border-white/15 px-1.5 py-0.5 text-[11px] font-bold text-slate-100 hover:bg-slate-800"
          aria-label={km ? "ផែនទី" : "World map"}
        >
          <MapIcon className="w-3 h-3" />
          <kbd className="font-mono text-[10px] text-slate-400">M</kbd>
        </button>
        <button
          onClick={() => setPauseScreen("menu")}
          className="flex items-center gap-1 rounded-md bg-slate-950/75 border border-white/15 px-1.5 py-0.5 text-[11px] font-bold text-slate-100 hover:bg-slate-800"
          aria-label={km ? "ផ្អាក" : "Pause"}
        >
          <Pause className="w-3 h-3" />
          <kbd className="font-mono text-[10px] text-slate-400">Esc</kbd>
        </button>
      </div>
      )}
    </div>
  );
}
