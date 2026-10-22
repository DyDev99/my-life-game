"use client";

import React from "react";
import { useGameStore } from "@/state/gameStore";
import { Plane, AlertTriangle, Crosshair, Shield, Zap } from "lucide-react";

/**
 * Military Aviation Fighter Jet HUD
 * Inspired by Ace Combat, F/A-18 & Su-35 Tactical Cockpit HUDs:
 * - Dynamic pitch ladder / artificial horizon rotating with aircraft roll
 * - Airspeed tape & Mach indicator
 * - Altitude tape & vertical velocity climb/dive meter
 * - Azimuth compass tape with cardinal navigation markers
 * - Tactical target lock-on diamond & distance telemetry
 * - Afterburner & airbrake status
 * - Aircraft integrity & weapon loadout
 */
export function FlightAviationHUD() {
  const ridingVehicle = useGameStore((state) => state.ridingVehicle);
  const vehicleSpeed = useGameStore((state) => state.vehicleSpeed);
  const planeAltitude = useGameStore((state) => state.planeAltitude);
  const planeHeading = useGameStore((state) => state.planeHeading);
  const planePitch = useGameStore((state) => state.planePitch);
  const planeRoll = useGameStore((state) => state.planeRoll);
  const planeHealth = useGameStore((state) => state.planeHealth);
  const flightThrottle = useGameStore((state) => state.flightThrottle);
  const isAfterburnerActive = useGameStore((state) => state.isAfterburnerActive);
  const isAirbrakeActive = useGameStore((state) => state.isAirbrakeActive);
  const missileAmmo = useGameStore((state) => state.missileAmmo);
  const maxMissileAmmo = useGameStore((state) => state.maxMissileAmmo);
  const lockedTarget = useGameStore((state) => state.lockedTarget);
  const targetPos = useGameStore((state) => state.targetPos);
  const flightCameraMode = useGameStore((state) => state.flightCameraMode);

  // Only render when piloting the Fighter Jet
  if (ridingVehicle !== "plane") return null;

  // Pitch ladder vertical pixel offset (1 radian ~ 420px)
  const pitchPx = (planePitch || 0) * 380;
  // Roll angle in degrees for SVG / CSS rotation
  const rollDeg = ((planeRoll || 0) * 180) / Math.PI;

  // Heading in degrees (0 to 360)
  let headingDeg = Math.round((-planeHeading * 180) / Math.PI);
  while (headingDeg < 0) headingDeg += 360;
  while (headingDeg >= 360) headingDeg -= 360;

  // Mach number approximation (1 Mach ~ 1,225 km/h at sea level)
  const mach = Math.max(0, vehicleSpeed / 1225);

  // Target distance
  let targetDistance = 0;
  if (lockedTarget) {
    targetDistance = Math.round(
      Math.hypot(
        lockedTarget.position[0] - targetPos[0],
        lockedTarget.position[1] - targetPos[1],
        lockedTarget.position[2] - targetPos[2]
      )
    );
  }

  // Warnings
  const isStall = planeAltitude > 1.2 && vehicleSpeed < 85;
  const isLowTerrain = planeAltitude > 0.3 && planeAltitude < 3.2 && (targetPos[0] < 30 || targetPos[0] > 55);
  const isDamaged = planeHealth < 35;

  // Airbase Runway distance (Kampong Cham Airfield at x: 60, z: 210)
  const airbaseDistance = Math.round(Math.hypot(targetPos[0] - 60, targetPos[2] - 210));
  const isAtAirbaseRunway =
    Math.abs(targetPos[0] - 60) < 22 &&
    targetPos[2] >= 145 &&
    targetPos[2] <= 275 &&
    planeAltitude < 2.8;

  // Takeoff roll guidance
  const isTakeoffRoll = planeAltitude < 0.6 && vehicleSpeed < 140;

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-30 font-mono text-[#00F0FF] overflow-hidden">
      {/* ===================================================================== */}
      {/* 1. TOP COMPASS TAPE (Moving Azimuth Ribbon) */}
      {/* ===================================================================== */}
      <div className="absolute top-2 sm:top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
        {/* Pointer indicator */}
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#00F0FF] drop-shadow-[0_0_8px_#00F0FF]" />

        {/* Compass Card / Ribbon */}
        <div className="relative w-64 sm:w-80 h-7 overflow-hidden border-b border-[#00F0FF]/40 bg-black/25 backdrop-blur-[2px]">
          <div
            className="absolute top-0.5 flex items-center transition-transform duration-75 text-[11px] font-black tracking-widest"
            style={{
              transform: `translateX(calc(50% - ${(headingDeg / 360) * 720}px))`,
              width: "1440px",
            }}
          >
            {/* 720-degree continuous compass strip */}
            {[0, 360].map((base) => (
              <React.Fragment key={base}>
                <span className="w-10 text-center text-emerald-300">N</span>
                <span className="w-10 text-center text-[#00F0FF]/70">030</span>
                <span className="w-10 text-center text-[#00F0FF]/70">060</span>
                <span className="w-10 text-center text-emerald-300">E</span>
                <span className="w-10 text-center text-[#00F0FF]/70">120</span>
                <span className="w-10 text-center text-[#00F0FF]/70">150</span>
                <span className="w-10 text-center text-emerald-300">S</span>
                <span className="w-10 text-center text-[#00F0FF]/70">210</span>
                <span className="w-10 text-center text-[#00F0FF]/70">240</span>
                <span className="w-10 text-center text-emerald-300">W</span>
                <span className="w-10 text-center text-[#00F0FF]/70">300</span>
                <span className="w-10 text-center text-[#00F0FF]/70">330</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Numeric Heading Readout */}
        <div className="mt-1 px-2 py-0.5 rounded bg-black/50 border border-[#00F0FF]/30 text-[10px] font-bold tracking-wider">
          HDG {String(headingDeg).padStart(3, "0")}°
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. ARTIFICIAL HORIZON & PITCH LADDER (Center) */}
      {/* ===================================================================== */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Fixed Boresight / Flight Path Marker (Aircraft Reference) */}
        <div className="relative w-12 h-12 flex items-center justify-center drop-shadow-[0_0_8px_#00F0FF]">
          {/* Center tiny dot */}
          <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
          {/* Left wing tick */}
          <div className="absolute -left-3 w-4 h-[2px] bg-[#00F0FF]" />
          <div className="absolute -left-3 w-[2px] h-2 bg-[#00F0FF] top-1/2" />
          {/* Right wing tick */}
          <div className="absolute -right-3 w-4 h-[2px] bg-[#00F0FF]" />
          <div className="absolute -right-3 w-[2px] h-2 bg-[#00F0FF] top-1/2" />
          {/* Top vertical fin tick */}
          <div className="absolute -top-3 w-[2px] h-2 bg-[#00F0FF]" />
        </div>

        {/* Rotating & Translating Pitch Ladder Group */}
        <div
          className="absolute w-72 h-72 pointer-events-none transition-transform duration-75 flex items-center justify-center"
          style={{
            transform: `rotate(${rollDeg}deg) translateY(${pitchPx}px)`,
          }}
        >
          {/* Horizon Line (0 degrees) */}
          <div className="absolute w-64 flex items-center justify-between opacity-80">
            <div className="w-24 h-[2px] bg-emerald-400 shadow-[0_0_8px_#10B981]" />
            <span className="text-[9px] font-bold text-emerald-300">00</span>
            <div className="w-24 h-[2px] bg-emerald-400 shadow-[0_0_8px_#10B981]" />
          </div>

          {/* Climb Pitch Bars (+10°, +20°, +30°) */}
          {[10, 20, 30].map((deg) => (
            <div
              key={`climb-${deg}`}
              className="absolute w-44 flex items-center justify-between opacity-60 text-[9px] font-bold"
              style={{ transform: `translateY(-${(deg * 380 * Math.PI) / 180}px)` }}
            >
              <div className="flex items-center gap-1">
                <span>+{deg}</span>
                <div className="w-12 h-[2px] bg-[#00F0FF]" />
                <div className="w-[2px] h-2 bg-[#00F0FF] -mt-1" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-[2px] h-2 bg-[#00F0FF] -mt-1" />
                <div className="w-12 h-[2px] bg-[#00F0FF]" />
                <span>+{deg}</span>
              </div>
            </div>
          ))}

          {/* Dive Pitch Bars (-10°, -20°, -30° Dashed) */}
          {[-10, -20, -30].map((deg) => (
            <div
              key={`dive-${deg}`}
              className="absolute w-44 flex items-center justify-between opacity-60 text-[9px] font-bold text-cyan-300/80"
              style={{ transform: `translateY(-${(deg * 380 * Math.PI) / 180}px)` }}
            >
              <div className="flex items-center gap-1">
                <span>{deg}</span>
                <div className="w-12 h-[2px] border-b border-dashed border-[#00F0FF]" />
                <div className="w-[2px] h-2 bg-[#00F0FF] mt-1" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-[2px] h-2 bg-[#00F0FF] mt-1" />
                <div className="w-12 h-[2px] border-b border-dashed border-[#00F0FF]" />
                <span>{deg}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. AIRSPEED INSTRUMENT (Left Edge) */}
      {/* ===================================================================== */}
      <div className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {/* Speed Box */}
        <div className="flex flex-col items-start p-2 rounded-xl bg-black/45 backdrop-blur-md border border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
          <span className="text-[10px] font-bold tracking-widest text-[#00F0FF]/70">AIRSPEED</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_0_8px_#00F0FF]">
              {Math.round(vehicleSpeed)}
            </span>
            <span className="text-[10px] text-cyan-300">KM/H</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
            <span>MACH</span>
            <span>{mach.toFixed(2)}</span>
          </div>
          {/* Airbrake indicator */}
          {isAirbrakeActive && (
            <div className="mt-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/30 border border-amber-400 text-amber-300 animate-pulse">
              AIRBRAKE
            </div>
          )}
        </div>

        {/* Speed Tape Vertical Ladder Ticks */}
        <div className="hidden sm:flex flex-col justify-between h-40 w-3 border-r border-[#00F0FF]/30 py-1">
          {[-40, -20, 0, 20, 40].map((tick) => (
            <div key={`spd-${tick}`} className="flex items-center justify-end gap-1">
              <div className="w-2 h-[1px] bg-[#00F0FF]/50" />
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. ALTITUDE INSTRUMENT (Right Edge) */}
      {/* ===================================================================== */}
      <div className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {/* Altitude Tape Vertical Ladder Ticks */}
        <div className="hidden sm:flex flex-col justify-between h-40 w-3 border-l border-[#00F0FF]/30 py-1">
          {[-40, -20, 0, 20, 40].map((tick) => (
            <div key={`alt-${tick}`} className="flex items-center gap-1">
              <div className="w-2 h-[1px] bg-[#00F0FF]/50" />
            </div>
          ))}
        </div>

        {/* Altitude Box */}
        <div className="flex flex-col items-end p-2 rounded-xl bg-black/45 backdrop-blur-md border border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
          <span className="text-[10px] font-bold tracking-widest text-[#00F0FF]/70">ALTITUDE</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_0_8px_#00F0FF]">
              {Math.round(planeAltitude)}
            </span>
            <span className="text-[10px] text-cyan-300">M</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-cyan-300">
            <span>BARO</span>
            <span>1013 HPA</span>
          </div>
          <div className="mt-0.5 text-[10px] text-[#00F0FF]/70 uppercase">
            CAM: {flightCameraMode.toUpperCase()}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. TARGET LOCK-ON HUD WATERMARK (When Target is Active) */}
      {/* ===================================================================== */}
      {lockedTarget && (
        <div className="absolute top-20 right-6 sm:top-24 sm:right-16 flex items-center gap-2.5 p-2.5 rounded-2xl bg-black/55 backdrop-blur-md border border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.35)]">
          <div className="relative w-8 h-8 flex items-center justify-center border border-rose-500 rotate-45 animate-pulse">
            <Crosshair className="w-4 h-4 text-rose-400 -rotate-45" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-[10px] font-black text-rose-400 tracking-wider">
              <span>🎯 TARGET LOCKED</span>
            </div>
            <span className="text-xs font-bold text-white max-w-[130px] truncate">
              {lockedTarget.name}
            </span>
            <span className="text-[11px] font-mono font-black text-amber-300">
              RNG: {targetDistance} m
            </span>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. GUIDANCE & WARNING BANNERS */}
      {/* ===================================================================== */}
      {/* Takeoff roll instructions when sitting on runway tarmac */}
      {isTakeoffRoll && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-cyan-950/85 border border-cyan-400/60 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2.5 text-xs text-white pointer-events-auto animate-pulse">
          <span className="text-xl">🛫</span>
          <div>
            <div className="font-bold text-cyan-300 tracking-wider">RUNWAY 18 TAKEOFF ROLL</div>
            <div className="text-[10px] text-slate-300">
              Hold <kbd className="px-1.5 py-0.5 rounded bg-white/20 font-mono text-cyan-200">W</kbd> to Spool Engines • Vr: 140 km/h • Pull <kbd className="px-1.5 py-0.5 rounded bg-white/20 font-mono text-cyan-200">S</kbd> to Rotate & Climb
            </div>
          </div>
        </div>
      )}

      {/* Airbase Runway Resupply Notification */}
      {isAtAirbaseRunway && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-2">
          <span>✅</span>
          <span>AIRBASE RESUPPLY ZONE • AUTOMATIC MISSILE REARM & AIRFRAME REPAIR ACTIVE</span>
        </div>
      )}

      {/* Missile Depletion Warning */}
      {missileAmmo === 0 && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-amber-500/90 border-2 border-amber-200 text-slate-950 font-black text-xs tracking-wider shadow-[0_0_25px_#F59E0B] flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-4 h-4 text-black" />
          <span>MISSILES DEPLETED • PRESS [R] TO REARM OR RETURN TO AIRBASE ({airbaseDistance}M)</span>
        </div>
      )}

      {isStall && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-red-600/80 border-2 border-red-300 text-white font-black text-xs sm:text-sm tracking-widest animate-bounce shadow-[0_0_25px_#EF4444] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span>⚠️ STALL WARNING • NOSE DOWN / ADD POWER</span>
        </div>
      )}

      {isLowTerrain && !isStall && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-amber-600/80 border-2 border-amber-300 text-white font-black text-xs sm:text-sm tracking-widest animate-pulse shadow-[0_0_25px_#F59E0B] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-white" />
          <span>⚠️ TERRAIN • PULL UP</span>
        </div>
      )}

      {isDamaged && (
        <div className="absolute top-36 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-300 font-bold text-xs tracking-wider">
          AIRFRAME INTEGRITY COMPROMISED ({planeHealth}%)
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. BOTTOM ENGINE & WEAPON CLUSTERS */}
      {/* ===================================================================== */}
      {/* Left: Engine & Throttle Status */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-8 flex flex-col gap-1 p-2.5 rounded-2xl bg-black/45 backdrop-blur-md border border-[#00F0FF]/30 text-xs">
        <div className="flex items-center justify-between gap-3 text-[10px] font-bold">
          <span className="text-[#00F0FF]/80">POWER</span>
          <span className="font-mono text-white">{Math.round(flightThrottle * 100)}%</span>
        </div>
        {/* Segmented Throttle Bar */}
        <div className="w-32 h-2.5 rounded bg-slate-900 border border-white/20 overflow-hidden flex">
          <div
            className={`h-full transition-all duration-75 ${
              isAfterburnerActive
                ? "bg-gradient-to-r from-cyan-400 to-white shadow-[0_0_10px_#00F0FF]"
                : "bg-gradient-to-r from-emerald-500 to-cyan-400"
            }`}
            style={{ width: `${Math.round(flightThrottle * 100)}%` }}
          />
        </div>
        {/* Status badges */}
        <div className="flex items-center gap-1.5 mt-0.5">
          {isAfterburnerActive ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-500/25 border border-cyan-400 text-[9px] font-black text-cyan-200 animate-pulse">
              <Zap className="w-3 h-3 text-cyan-300" />
              AFTERBURNER
            </span>
          ) : (
            <span className="text-[9px] font-bold text-slate-400">
              {vehicleSpeed < 5 ? "ENGINE IDLE" : "MILITARY CRUISE"}
            </span>
          )}
        </div>
      </div>

      {/* Right: Weapon Systems, Airbase Navigation & Airframe Integrity */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 flex flex-col items-end gap-1.5 p-2.5 rounded-2xl bg-black/45 backdrop-blur-md border border-[#00F0FF]/30 text-xs">
        {/* Airbase Runway Resupply Navigation Beacon */}
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/40">
          <span>🛫</span>
          <span>AIRBASE: {airbaseDistance}m</span>
        </div>

        {/* Missile Ammo Counter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#00F0FF]/70">MSL (AGM)</span>
          <span className={`font-mono text-base font-black ${missileAmmo === 0 ? "text-red-400 animate-pulse" : "text-amber-300"}`}>
            {missileAmmo}/{maxMissileAmmo}
          </span>
        </div>

        {/* Interactive Quick Rearm Button */}
        {missileAmmo < maxMissileAmmo && (
          <button
            onClick={() => {
              useGameStore.getState().replenishMissiles();
              useGameStore.getState().addStatPop(
                useGameStore.getState().language === "km" ? "ផ្ទុកគ្រាប់មីស៊ីលពេញវិញ (8/8) 🚀" : "Missiles Reloaded (8/8) 🚀",
                "skill"
              );
            }}
            className="px-2.5 py-1 rounded-xl bg-amber-500/25 hover:bg-amber-500/40 border border-amber-400 text-amber-300 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer pointer-events-auto transition-all active:scale-95 shadow-md shadow-amber-500/20"
            title="Press [R] or click to instant reload missiles"
          >
            <span>🔄</span>
            <span>REARM [R]</span>
          </button>
        )}

        {/* Gun Status */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-slate-400">GUN 20MM</span>
          <span className="text-emerald-400 font-bold">READY</span>
        </div>

        {/* Airframe Integrity Bar */}
        <div className="flex items-center gap-2 mt-0.5">
          <Shield className="w-3 h-3 text-cyan-400" />
          <div className="w-24 h-2 rounded bg-slate-900 border border-white/20 overflow-hidden">
            <div
              className={`h-full transition-all duration-150 ${
                planeHealth > 60
                  ? "bg-emerald-400"
                  : planeHealth > 30
                  ? "bg-amber-400"
                  : "bg-red-500 animate-pulse"
              }`}
              style={{ width: `${planeHealth}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-white">{planeHealth}%</span>
        </div>
      </div>
    </div>
  );
}
