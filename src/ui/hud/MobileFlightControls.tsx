"use client";

import React, { useState, useRef, useCallback } from "react";
import { useGameStore } from "@/state/gameStore";
import { flightInput } from "@/game/flight/FlightInputSystem";
import { useIsMobileMode } from "@/ui/hud/useIsMobileMode";
import {
  Flame,
  Pause,
  Menu,
  Camera,
  Crosshair,
  HelpCircle,
  X,
  RotateCcw,
  Zap,
  Sliders,
  LogOut,
} from "lucide-react";

/**
 * Mobile Touch Flight Controls
 * Features:
 * - Virtual Flight Joystick (Bottom-Left) for Pitch & Roll/Turn steering
 * - Vertical Engine Throttle Slider (Bottom-Right)
 * - Large Boost / Afterburner Button
 * - Airbrake / Decelerate Button
 * - Guided Missile Launch Action Button
 * - Target Lock Cycle Button
 * - Camera View Switch Button (Cockpit / Chase / Close)
 * - Quick Flight Tutorial overlay
 * - Multitouch isolated listeners with haptic & visual pressed states
 */
export function MobileFlightControls() {
  const ridingVehicle = useGameStore((state) => state.ridingVehicle);
  const missileAmmo = useGameStore((state) => state.missileAmmo);
  const triggerFireMissile = useGameStore((state) => state.triggerFireMissile);
  const cycleNextTarget = useGameStore((state) => state.cycleNextTarget);
  const cycleFlightCameraMode = useGameStore((state) => state.cycleFlightCameraMode);
  const flightCameraMode = useGameStore((state) => state.flightCameraMode);
  const setPauseScreen = useGameStore((state) => state.setPauseScreen);
  const dismountVehicle = useGameStore((state) => state.dismountVehicle);
  const isAfterburnerActive = useGameStore((state) => state.isAfterburnerActive);
  const isAirbrakeActive = useGameStore((state) => state.isAirbrakeActive);

  const isMobile = useIsMobileMode();

  // Virtual Joystick State (Bottom Left)
  const [joystickActive, setJoystickActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [joystickCenter, setJoystickCenter] = useState({ x: 0, y: 0 });
  const joystickTouchId = useRef<number | null>(null);

  // Throttle Slider Touch State
  const [throttleVal, setThrottleVal] = useState(0.65);
  const throttleTouchId = useRef<number | null>(null);

  // Tutorial overlay
  const [showFlightGuide, setShowFlightGuide] = useState(false);

  // Only render on mobile touch when riding the fighter jet
  if (!isMobile || ridingVehicle !== "plane") return null;

  // --- VIRTUAL JOYSTICK HANDLERS ---
  const handleJoystickStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (joystickTouchId.current === null) {
        joystickTouchId.current = touch.identifier;
        const rect = e.currentTarget.getBoundingClientRect();
        const startX = touch.clientX - rect.left;
        const startY = touch.clientY - rect.top;
        setJoystickCenter({ x: startX, y: startY });
        setKnobPos({ x: 0, y: 0 });
        setJoystickActive(true);
        break;
      }
    }
  };

  const handleJoystickMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (joystickTouchId.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        const rect = e.currentTarget.getBoundingClientRect();
        const curX = touch.clientX - rect.left;
        const curY = touch.clientY - rect.top;

        const maxRadius = 48;
        const dx = curX - joystickCenter.x;
        const dy = curY - joystickCenter.y;
        const dist = Math.hypot(dx, dy);

        let clampedX = dx;
        let clampedY = dy;
        if (dist > maxRadius) {
          clampedX = (dx / dist) * maxRadius;
          clampedY = (dy / dist) * maxRadius;
        }

        setKnobPos({ x: clampedX, y: clampedY });
        // Normalized: X is roll (-1 to 1), Y is pitch (inverted: pulling stick back = pitch up)
        const normRoll = clampedX / maxRadius;
        const normPitch = -clampedY / maxRadius;
        flightInput.setTouchStick(normRoll, normPitch);
        break;
      }
    }
  };

  const handleJoystickEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        setJoystickActive(false);
        setKnobPos({ x: 0, y: 0 });
        flightInput.setTouchStick(0, 0);
        break;
      }
    }
  };

  // --- THROTTLE SLIDER HANDLERS ---
  const handleThrottleTouch = (clientY: number, rect: DOMRect) => {
    // Top of slider = 1.0 (full military thrust), bottom = 0.0 (idle)
    const relativeY = clientY - rect.top;
    const progress = 1.0 - Math.max(0, Math.min(1, relativeY / rect.height));
    setThrottleVal(progress);
    flightInput.setTouchThrottle(progress);
    useGameStore.getState().setFlightThrottle(progress);
  };

  const onThrottleStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const touch = e.changedTouches[0];
    if (throttleTouchId.current === null) {
      throttleTouchId.current = touch.identifier;
      handleThrottleTouch(touch.clientY, e.currentTarget.getBoundingClientRect());
    }
  };

  const onThrottleMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === throttleTouchId.current) {
        handleThrottleTouch(touch.clientY, e.currentTarget.getBoundingClientRect());
        break;
      }
    }
  };

  const onThrottleEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === throttleTouchId.current) {
        throttleTouchId.current = null;
        break;
      }
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-40 font-sans">
      {/* ===================================================================== */}
      {/* 1. TOP SYSTEM BAR (Menu / Pause, Tutorial & Camera View) - offset past 108px Minimap */}
      <div className="absolute top-3 left-[7.5rem] sm:top-5 sm:left-[8.5rem] flex items-center gap-2 pointer-events-auto z-50">
        {/* Menu / Pause Button */}
        <button
          onClick={() => setPauseScreen("menu")}
          aria-label="Pause Menu"
          className="w-11 h-11 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl active:scale-90 cursor-pointer touch-manipulation hover:bg-slate-800"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* Flight Tutorial / Help Button */}
        <button
          onClick={() => setShowFlightGuide(!showFlightGuide)}
          aria-label="Flight Controls Guide"
          className={`w-11 h-11 rounded-2xl backdrop-blur-md border flex items-center justify-center shadow-xl active:scale-90 cursor-pointer ${
            showFlightGuide
              ? "bg-amber-500/40 border-amber-300 text-amber-200"
              : "bg-slate-900/85 border-white/20 text-slate-300"
          }`}
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Camera View Switch Button */}
        <button
          onClick={() => cycleFlightCameraMode()}
          aria-label="Cycle Camera View"
          className="h-11 px-3 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-xs font-bold text-sky-300 shadow-xl active:scale-90 cursor-pointer"
        >
          <Camera className="w-4 h-4 text-sky-400" />
          <span className="uppercase text-[11px] font-mono">{flightCameraMode}</span>
        </button>

        {/* Land / Exit Jet Button */}
        <button
          onClick={dismountVehicle}
          aria-label="Land / Exit Jet"
          className="h-11 px-3 rounded-2xl bg-rose-900/70 hover:bg-rose-800 backdrop-blur-md border border-rose-500/40 flex items-center gap-1 text-xs font-bold text-rose-200 shadow-xl active:scale-90 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Land [F]</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 2. VIRTUAL FLIGHT JOYSTICK (Bottom-Left) */}
      {/* ===================================================================== */}
      <div
        className="absolute bottom-4 left-4 w-44 h-44 pointer-events-auto touch-none flex items-center justify-center"
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
      >
        {/* Outer Ring */}
        <div
          className={`w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-100 ${
            joystickActive
              ? "border-[#00F0FF]/80 bg-[#00F0FF]/15 shadow-[0_0_25px_rgba(0,240,255,0.4)]"
              : "border-white/25 bg-black/35 backdrop-blur-sm"
          }`}
        >
          {/* Axis Crosshairs */}
          <div className="absolute w-28 h-[1px] bg-white/20" />
          <div className="absolute h-28 w-[1px] bg-white/20" />

          {/* Inner Joystick Knob */}
          <div
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform ${
              joystickActive
                ? "border-cyan-200 bg-cyan-400/60 shadow-[0_0_15px_#00F0FF]"
                : "border-white/40 bg-white/25"
            }`}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white/70" />
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. TACTICAL FLIGHT CLUSTER (Bottom-Right) */}
      {/* ===================================================================== */}
      <div className="absolute bottom-4 right-4 flex items-end gap-3 pointer-events-auto">
        {/* Vertical Throttle Slider Bar */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-mono font-bold text-cyan-300">
            {Math.round(throttleVal * 100)}%
          </span>
          <div
            className="relative w-12 h-44 rounded-2xl bg-black/55 backdrop-blur-md border border-white/25 overflow-hidden touch-none flex flex-col justify-end p-1 shadow-2xl cursor-pointer"
            onTouchStart={onThrottleStart}
            onTouchMove={onThrottleMove}
            onTouchEnd={onThrottleEnd}
            onTouchCancel={onThrottleEnd}
          >
            {/* Filled level bar */}
            <div
              className="w-full rounded-xl bg-gradient-to-t from-emerald-500 via-cyan-400 to-amber-400 transition-all duration-75 shadow-[0_0_12px_#00F0FF]"
              style={{ height: `${Math.round(throttleVal * 100)}%` }}
            />
            {/* Grip line */}
            <div className="absolute inset-x-2 top-2 h-[2px] bg-white/30 rounded" />
            <div className="absolute inset-x-2 top-1/2 h-[2px] bg-white/30 rounded" />
            <span className="absolute bottom-2 inset-x-0 text-center font-mono font-black text-[9px] text-black">
              THR
            </span>
          </div>
        </div>

        {/* Action Buttons Arc */}
        <div className="flex flex-col gap-2.5 items-end">
          {/* Top row: Target Lock Cycle & Airbrake */}
          <div className="flex items-center gap-2.5">
            {/* Target Lock Cycle */}
            <button
              onClick={() => cycleNextTarget()}
              aria-label="Cycle Target"
              className="w-12 h-12 rounded-2xl bg-slate-900/85 backdrop-blur-sm border border-white/25 flex flex-col items-center justify-center text-rose-300 shadow-xl active:scale-90"
            >
              <Crosshair className="w-5 h-5 text-rose-400" />
              <span className="text-[9px] font-bold">TGT</span>
            </button>

            {/* Airbrake / Decelerate Button (Hold to brake) */}
            <button
              onPointerDown={() => flightInput.setTouchAirbrake(true)}
              onPointerUp={() => flightInput.setTouchAirbrake(false)}
              onPointerCancel={() => flightInput.setTouchAirbrake(false)}
              aria-label="Airbrake"
              className={`w-12 h-12 rounded-2xl backdrop-blur-sm border flex flex-col items-center justify-center text-white shadow-xl active:scale-90 ${
                isAirbrakeActive
                  ? "bg-amber-500/60 border-amber-300 shadow-[0_0_15px_#F59E0B]"
                  : "bg-slate-900/85 border-white/25 text-amber-300"
              }`}
            >
              <span className="text-base font-black">🛑</span>
              <span className="text-[9px] font-bold">BRAKE</span>
            </button>
          </div>

          {/* Bottom row: Boost (Afterburner) & Fire Missile */}
          <div className="flex items-center gap-2.5">
            {/* Boost / Afterburner Button (Hold to boost) */}
            <button
              onPointerDown={() => flightInput.setTouchBoost(true)}
              onPointerUp={() => flightInput.setTouchBoost(false)}
              onPointerCancel={() => flightInput.setTouchBoost(false)}
              aria-label="Boost Afterburner"
              className={`w-14 h-14 rounded-2xl backdrop-blur-sm border-2 flex flex-col items-center justify-center text-white shadow-2xl active:scale-90 ${
                isAfterburnerActive
                  ? "bg-cyan-500/80 border-cyan-200 shadow-[0_0_25px_#00F0FF] scale-105"
                  : "bg-cyan-950/70 border-cyan-400/50 text-cyan-300"
              }`}
            >
              <Flame className={`w-6 h-6 ${isAfterburnerActive ? "animate-pulse text-white" : "text-cyan-400"}`} />
              <span className="text-[10px] font-black tracking-wide">BOOST</span>
            </button>

            {/* Primary Action / Fire Missile or Reload Button */}
            <button
              onClick={() => {
                if (missileAmmo > 0) {
                  triggerFireMissile();
                  flightInput.triggerTouchFire();
                } else {
                  useGameStore.getState().replenishMissiles();
                  useGameStore.getState().addStatPop(
                    useGameStore.getState().language === "km" ? "ផ្ទុកគ្រាប់មីស៊ីលពេញវិញ (8/8) 🚀" : "Missiles Reloaded (8/8) 🚀",
                    "skill"
                  );
                }
              }}
              aria-label={missileAmmo > 0 ? "Fire Missile" : "Reload Missiles"}
              className={`w-16 h-16 rounded-full backdrop-blur-sm border-2 flex flex-col items-center justify-center text-white shadow-2xl active:scale-90 transition-all ${
                missileAmmo > 0
                  ? "bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 border-amber-300 shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse"
                  : "bg-gradient-to-tr from-amber-600 via-yellow-600 to-amber-500 border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.7)] animate-bounce"
              }`}
            >
              <span className="text-xl">{missileAmmo > 0 ? "🚀" : "🔄"}</span>
              <span className="text-[10px] font-mono font-black text-amber-200">
                {missileAmmo > 0 ? `${missileAmmo}/8` : "REARM"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. FLIGHT TUTORIAL OVERLAY GUIDE (When Toggled) */}
      {/* ===================================================================== */}
      {showFlightGuide && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md p-6 flex flex-col justify-between pointer-events-auto text-white"
          onClick={() => setShowFlightGuide(false)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✈️</span>
              <h2 className="text-xl font-black text-[#00F0FF] tracking-wide">
                FLIGHT CONTROLS GUIDE
              </h2>
            </div>
            <button
              onClick={() => setShowFlightGuide(false)}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Graphical diagram of touch zones */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto my-auto w-full">
            {/* Takeoff Guide */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/50 border border-cyan-400/50 flex flex-col gap-1.5">
              <div className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                <span>🛫</span>
                <span>HOW TO TAKE OFF</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1">
                <li>1. Slide <strong>THR</strong> up (or hold <strong>BOOST</strong>) to roll down runway.</li>
                <li>2. Accelerate past <strong>140 km/h</strong>.</li>
                <li>3. Pull left joystick <strong>DOWN</strong> (pitch up) to lift off and climb into the sky!</li>
              </ul>
            </div>

            {/* In-Flight & Combat */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/20 flex flex-col gap-1.5">
              <div className="text-xs font-black text-[#00F0FF] flex items-center gap-1.5">
                <span>🕹️</span>
                <span>FLIGHT & COMBAT</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1">
                <li>• <strong>Left Stick</strong>: Bank left/right, climb/dive.</li>
                <li>• <strong>BOOST</strong>: Supersonic afterburner (520 km/h).</li>
                <li>• <strong>ROCKET (🚀)</strong>: Launch missile at target.</li>
                <li>• <strong>REARM (🔄)</strong>: Instant missile reload when empty.</li>
              </ul>
            </div>

            {/* Landing Guide */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-400/50 flex flex-col gap-1.5">
              <div className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                <span>🛬</span>
                <span>HOW TO LAND</span>
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1">
                <li>1. Follow <strong>AIRBASE</strong> HUD badge to runway.</li>
                <li>2. Pull <strong>THR</strong> down & hold <strong>BRAKE</strong> to slow below 160 km/h.</li>
                <li>3. Touch down softly on tarmac; hold <strong>BRAKE</strong> to stop.</li>
                <li>4. Resupply restores missiles & armor. Tap <strong>EXIT</strong> to dismount!</li>
              </ul>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400">
            Tap anywhere to dismiss tutorial and resume flight
          </div>
        </div>
      )}
    </div>
  );
}
