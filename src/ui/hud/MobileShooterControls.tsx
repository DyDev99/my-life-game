"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/state/gameStore";
import { WEAPON_REGISTRY, WeaponId } from "@/game/combat/weaponConfig";
import { mobileInput } from "@/game/player/mobileInput";
import { useIsMobileMode } from "@/ui/hud/useIsMobileMode";
import {
  Crosshair,
  RotateCw,
  Eye,
  Sliders,
  Shield,
  ChevronsUp,
  MousePointer,
  Gamepad2,
  Monitor,
  Smartphone,
  HelpCircle,
  Check,
} from "lucide-react";

/**
 * Adaptive Game Controller & Shooter HUD
 *
 * 1. COMPUTER MODE (PC / Mac):
 *    - Clean, uncluttered screen (no giant touch joystick or touch buttons).
 *    - Native Left-Click to Shoot (continuous auto-fire on hold, single shot on tap).
 *    - Right-Click to Aim Down Sights (ADS scope toggle).
 *    - Pointer Lock "Mouse Aim" mode for standard PC shooter camera control.
 *    - Mechanical Keyboard Controller Dock with live real-time keypress illumination.
 *    - USB / Bluetooth Gamepad controller support (Xbox / PlayStation).
 *
 * 2. MOBILE MODE (Touch Screen):
 *    - Demarcated Touch Control Zones showing exactly where to touch:
 *      * Movement Zone (Bottom-Left)
 *      * Aim & Look Swipe Zone (Right 55% of screen)
 *      * Combat Actions Cluster (Bottom-Right)
 *      * Left-Thumb Secondary Fire Trigger
 *      * Tactical Weapon Selector & Ammo Dock
 *    - Interactive "Touch Zones Guide" overlay explaining finger positions.
 *    - Dynamic Virtual Joystick & High-Precision Touch Aiming.
 */
// Round, translucent thumb buttons (PUBG / GTA mobile style)
const TOUCH_BTN =
  "absolute pointer-events-auto touch-none grid place-items-center rounded-full bg-black/35 backdrop-blur-sm border border-white/30 text-white shadow-lg active:scale-90 active:bg-white/25";

export function MobileShooterControls() {
  const currentWeaponId = useGameStore((state) => state.currentWeaponId);
  const weaponAmmo = useGameStore((state) => state.weaponAmmo);
  const isAiming = useGameStore((state) => state.isAiming);
  const isReloading = useGameStore((state) => state.isReloading);
  const setAiming = useGameStore((state) => state.setAiming);
  const startReload = useGameStore((state) => state.startReload);
  const equipWeapon = useGameStore((state) => state.equipWeapon);
  const ridingVehicle = useGameStore((state) => state.ridingVehicle);
  const lastHit = useGameStore((state) => state.lastHitInfo);
  const movementState = useGameStore((state) => state.movementState);
  const currentSpeed = useGameStore((state) => state.currentSpeed);

  // Device & Control Mode
  const setDeviceControlMode = useGameStore((state) => state.setDeviceControlMode);
  const showTouchZoneGuide = useGameStore((state) => state.showTouchZoneGuide);
  const toggleTouchZoneGuide = useGameStore((state) => state.toggleTouchZoneGuide);
  const isPointerLocked = useGameStore((state) => state.isPointerLocked);
  const setIsPointerLocked = useGameStore((state) => state.setIsPointerLocked);

  const isMobileMode = useIsMobileMode();

  // Real-time Keypress Feedback for Computer Controller Dock
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({});

  // Connected Gamepad tracking
  const [gamepadConnected, setGamepadConnected] = useState<string | null>(null);

  // Virtual Joystick State (Mobile)
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const joystickTouchId = useRef<number | null>(null);

  // Right-screen Look Drag State (Mobile)
  const lookTouchId = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Hit Marker Flash State
  const [showHitMarker, setShowHitMarker] = useState(false);
  const prevHitTime = useRef<number>(0);

  // Settings & Sensitivity modal
  const [showSettings, setShowSettings] = useState(false);
  const cameraSensitivity = useGameStore((state) => state.cameraSensitivity);
  const setCameraSensitivity = useGameStore((state) => state.setCameraSensitivity);

  // Auto-expire hit marker after 240ms without synchronous render setState
  useEffect(() => {
    if (!lastHit || lastHit.time === prevHitTime.current) return;
    prevHitTime.current = lastHit.time;

    const rafId = requestAnimationFrame(() => {
      setShowHitMarker(true);
    });

    const timer = setTimeout(() => {
      setShowHitMarker(false);
    }, 240);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [lastHit]);

  const hitIsHeadshot = Boolean(lastHit?.isHeadshot);
  const hitDamage = lastHit?.damage ?? null;

  // ---------------------------------------------------------------------------
  // DESKTOP COMPUTER CONTROLS: Mouse Shooting, ADS Scoping, Keyboard Hotkeys
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (useGameStore.getState().pauseScreen) return;

      const k = e.key.toLowerCase();
      setActiveKeys((prev) => ({ ...prev, [k]: true, [e.code.toLowerCase()]: true }));

      if (e.key === "1") equipWeapon("m416");
      else if (e.key === "2") equipWeapon("shotgun");
      else if (e.key === "3") equipWeapon("sniper");
      else if (e.key === "4" || k === "h") equipWeapon(null);
      else if (k === "r") startReload();
      else if (k === "v") setAiming(!useGameStore.getState().isAiming);
      else if (k === "l") {
        // 'L' toggles pointer lock mouse aim
        const canvas = document.querySelector("canvas");
        if (canvas) {
          if (document.pointerLockElement === canvas) {
            document.exitPointerLock();
          } else {
            canvas.requestPointerLock();
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      setActiveKeys((prev) => {
        const next = { ...prev };
        delete next[k];
        delete next[e.code.toLowerCase()];
        return next;
      });
    };

    // Desktop Left-Click Shooting & Right-Click Scoping
    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest("button, input, a, [data-touch-control]")) return;
      if (useGameStore.getState().pauseScreen) return;

      if (e.button === 0) {
        // Left-Click: Fire weapon if equipped
        const armed = Boolean(useGameStore.getState().currentWeaponId);
        const inVehicle = Boolean(useGameStore.getState().ridingVehicle);
        if (armed && !inVehicle) {
          mobileInput.isFiring = true;
          mobileInput.shootOnce = true;
          setActiveKeys((prev) => ({ ...prev, mouse0: true }));
        }
      } else if (e.button === 2) {
        // Right-Click: Toggle ADS Scope
        e.preventDefault();
        setAiming(!useGameStore.getState().isAiming);
        setActiveKeys((prev) => ({ ...prev, mouse2: true }));
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        mobileInput.isFiring = false;
        setActiveKeys((prev) => {
          const next = { ...prev };
          delete next["mouse0"];
          return next;
        });
      } else if (e.button === 2) {
        setActiveKeys((prev) => {
          const next = { ...prev };
          delete next["mouse2"];
          return next;
        });
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (!ridingVehicle && currentWeaponId) {
        e.preventDefault();
      }
    };

    const handlePointerLockChange = () => {
      const isLocked = Boolean(document.pointerLockElement);
      setIsPointerLocked(isLocked);
    };

    // Physical Gamepad connection listener
    const handleGamepadConnect = (e: GamepadEvent) => {
      setGamepadConnected(e.gamepad.id);
    };
    const handleGamepadDisconnect = () => {
      setGamepadConnected(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    window.addEventListener("gamepadconnected", handleGamepadConnect);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnect);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      window.removeEventListener("gamepadconnected", handleGamepadConnect);
      window.removeEventListener("gamepaddisconnected", handleGamepadDisconnect);
      mobileInput.isFiring = false;
    };
  }, [equipWeapon, startReload, setAiming, currentWeaponId, ridingVehicle, setIsPointerLocked]);

  // Request Pointer Lock (Mouse Aim)
  const togglePointerLock = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    if (document.pointerLockElement === canvas) {
      document.exitPointerLock();
    } else {
      canvas.requestPointerLock();
    }
  };

  // ---------------------------------------------------------------------------
  // Touch Handlers for Virtual Joystick (Bottom Left)
  // ---------------------------------------------------------------------------
  const handleJoystickStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (joystickTouchId.current === null) {
        joystickTouchId.current = touch.identifier;
        const rect = e.currentTarget.getBoundingClientRect();
        const startX = touch.clientX - rect.left;
        const startY = touch.clientY - rect.top;
        setJoystickPos({ x: startX, y: startY });
        setKnobPos({ x: 0, y: 0 });
        setJoystickActive(true);
        break;
      }
    }
  }, []);

  const handleJoystickMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (joystickTouchId.current === null) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === joystickTouchId.current) {
          const rect = e.currentTarget.getBoundingClientRect();
          const currentX = touch.clientX - rect.left;
          const currentY = touch.clientY - rect.top;

          const maxRadius = 48;
          const dx = currentX - joystickPos.x;
          const dy = currentY - joystickPos.y;
          const dist = Math.hypot(dx, dy);

          let clampedX = dx;
          let clampedY = dy;
          if (dist > maxRadius) {
            clampedX = (dx / dist) * maxRadius;
            clampedY = (dy / dist) * maxRadius;
          }

          setKnobPos({ x: clampedX, y: clampedY });
          // Normalize joystick vector (-1 to 1), with Y inverted for forward = positive
          mobileInput.setJoystick(clampedX / maxRadius, -clampedY / maxRadius);
          break;
        }
      }
    },
    [joystickPos]
  );

  const handleJoystickEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        setJoystickActive(false);
        setKnobPos({ x: 0, y: 0 });
        mobileInput.setJoystick(0, 0);
        break;
      }
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Touch Handlers for Right Screen Camera Look Drag
  // ---------------------------------------------------------------------------
  const handleLookStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement)?.closest("button, input, a, [data-touch-control]")) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (lookTouchId.current === null) {
        lookTouchId.current = touch.identifier;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };
        break;
      }
    }
  }, []);

  const handleLookMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (lookTouchId.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchId.current) {
        const dx = touch.clientX - lastLookPos.current.x;
        const dy = touch.clientY - lastLookPos.current.y;
        lastLookPos.current = { x: touch.clientX, y: touch.clientY };

        mobileInput.addLookDelta(dx, dy);
        break;
      }
    }
  }, []);

  const handleLookEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === lookTouchId.current) {
        lookTouchId.current = null;
        break;
      }
    }
  }, []);

  const currentAmmo = currentWeaponId ? weaponAmmo[currentWeaponId] : null;
  const currentDef = currentWeaponId ? WEAPON_REGISTRY[currentWeaponId] : null;

  // Dynamic crosshair spread calculation
  const isMoving =
    currentSpeed > 0.5 || movementState === "walking" || movementState === "sprinting";
  const spreadOffset = isAiming
    ? 4
    : isMoving
    ? movementState === "sprinting"
      ? 26
      : 18
    : 10;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 overflow-hidden font-sans">
      {/* ===================================================================== */}
      {/* 0. TOP CONTROLLER MODE SWITCHER & TOUCH ZONE GUIDE BUTTON */}
      {/* ===================================================================== */}
      <div className={`absolute top-3 right-3 sm:top-5 sm:right-5 items-center gap-2 pointer-events-auto z-40 ${isMobileMode ? "hidden" : "flex"}`}>
        {/* Device Mode Switcher (PC Controller vs Mobile Touch) */}
        <button
          onClick={() => {
            setDeviceControlMode(isMobileMode ? "computer" : "mobile");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-white/20 text-xs font-bold text-slate-200 shadow-xl cursor-pointer transition-all active:scale-95"
          title="Toggle between PC Computer Controller and Mobile Touch Controls"
        >
          {isMobileMode ? (
            <>
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              {/* Icon-only on phones to keep the top edge clear */}
              <span className="text-emerald-300 hidden">📱 Mobile Mode</span>
            </>
          ) : (
            <>
              <Monitor className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-sky-300">💻 PC Controller</span>
            </>
          )}
        </button>

        {/* Touch Zones Visual Guide Button (Mobile or Preview) */}
        {isMobileMode && (
          <button
            onClick={toggleTouchZoneGuide}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xl cursor-pointer active:scale-95 ${
              showTouchZoneGuide
                ? "bg-amber-500/30 border-amber-400 text-amber-200 shadow-amber-500/30"
                : "bg-slate-900/85 border-white/20 text-slate-300 hover:text-white"
            }`}
            title="Show / Hide Mobile Touch Control Areas Guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            {!isMobileMode && <span>Control Zones Guide</span>}
          </button>
        )}

        {/* Pointer Lock Mouse Aim Button (PC Mode) */}
        {!isMobileMode && (
          <button
            onClick={togglePointerLock}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xl cursor-pointer active:scale-95 ${
              isPointerLocked
                ? "bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-emerald-500/40 animate-pulse"
                : "bg-slate-900/85 border-white/20 text-slate-300 hover:text-white"
            }`}
            title="Lock Mouse Aim for PC Shooter controls [L]"
          >
            <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isPointerLocked ? "🎯 Aim Locked [ESC]" : "Lock Mouse Aim [L]"}</span>
          </button>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 1. MOBILE TOUCH LOOK / AIM DRAG REGION (Only on Mobile when on foot, clear of top menu) */}
      {/* ===================================================================== */}
      {isMobileMode && !ridingVehicle && (
        <div
          className="absolute top-16 right-0 w-[55%] bottom-0 pointer-events-auto touch-none"
          onTouchStart={handleLookStart}
          onTouchMove={handleLookMove}
          onTouchEnd={handleLookEnd}
          onTouchCancel={handleLookEnd}
        />
      )}

      {/* ===================================================================== */}
      {/* 2. MOBILE DEMARCATED TOUCH CONTROL ZONES (Shows where to touch) */}
      {/* Only while the Guide is on, so they don't cover the game */}
      {/* ===================================================================== */}
      {isMobileMode && showTouchZoneGuide && (
        <>
          {/* A. MOVEMENT ZONE (Bottom-Left Quadrant) */}
          <div
            className={`absolute bottom-4 left-4 w-52 h-52 rounded-3xl border pointer-events-none transition-all duration-300 flex flex-col justify-between p-3 ${
              showTouchZoneGuide
                ? "border-emerald-400 bg-emerald-950/40 shadow-[0_0_30px_rgba(16,185,129,0.35)]"
                : "border-emerald-500/20 bg-emerald-950/10"
            }`}
          >
            {/* Tactical Corner Markers */}
            <div className="flex justify-between items-center text-emerald-400">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-900/60 border border-emerald-500/40 text-[10px] font-mono font-black tracking-wider">
                <span>🕹️</span>
                <span>MOVEMENT ZONE</span>
              </div>
              <span className="font-mono text-[9px] text-emerald-400/70 font-bold">LEFT THUMB</span>
            </div>

            {/* Subtle Helper Subtext */}
            <div className="text-center font-mono text-[9px] text-emerald-300/80 font-medium bg-black/40 py-1 px-2 rounded-xl backdrop-blur-sm border border-emerald-500/20">
              Drag anywhere here to walk & sprint
            </div>
          </div>

          {/* B. RIGHT-SCREEN AIM & LOOK SWIPE ZONE (Right 55% of screen) */}
          <div
            className={`absolute top-16 right-4 w-[50%] h-[72%] rounded-3xl border pointer-events-none transition-all duration-300 flex flex-col justify-between p-4 ${
              showTouchZoneGuide
                ? "border-sky-400 bg-sky-950/35 shadow-[0_0_35px_rgba(56,189,248,0.3)]"
                : "border-sky-500/15 bg-sky-950/5"
            }`}
          >
            <div className="flex justify-between items-center text-sky-400">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-sky-900/60 border border-sky-500/40 text-[10px] font-mono font-black tracking-wider">
                <span>🎯</span>
                <span>AIM & LOOK ZONE</span>
              </div>
              <span className="font-mono text-[9px] text-sky-400/70 font-bold">RIGHT THUMB</span>
            </div>

            {/* Central Aim Watermark */}
            <div className="self-center flex flex-col items-center gap-1 text-sky-400/40 font-mono text-xs">
              <Crosshair className="w-8 h-8 opacity-40 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Swipe to Aim</span>
            </div>

            <div className="text-center font-mono text-[9px] text-sky-300/80 font-medium bg-black/40 py-1 px-2 rounded-xl backdrop-blur-sm border border-sky-500/20">
              Drag across right screen to rotate camera & align crosshair
            </div>
          </div>

          {/* C. COMBAT ACTION CLUSTER ZONE (Bottom-Right) */}
          {!ridingVehicle && (
            <div
              className={`absolute bottom-4 right-4 w-76 h-52 rounded-3xl border pointer-events-none transition-all duration-300 flex flex-col justify-between p-2.5 ${
                showTouchZoneGuide
                  ? "border-rose-400 bg-rose-950/35 shadow-[0_0_30px_rgba(244,63,94,0.3)]"
                  : "border-rose-500/15 bg-transparent"
              }`}
            >
              <div className="flex justify-between items-center text-rose-400 px-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-900/60 border border-rose-500/40 text-[10px] font-mono font-black tracking-wider">
                  <span>💥</span>
                  <span>COMBAT ACTIONS</span>
                </div>
                <span className="font-mono text-[9px] text-rose-400/70 font-bold">FIRE & SCOPE</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ===================================================================== */}
      {/* 3. CENTER RETICLE / CROSSHAIR & HIT MARKER (Computer & Mobile) */}
      {/* ===================================================================== */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Normal / Hip-Fire Crosshair (4 dynamic blooming ticks) */}
        {!isAiming && currentWeaponId && (
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Center dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />

            {/* Top tick */}
            <div
              className="absolute w-[2px] h-3 bg-white/90 rounded-full transition-all duration-75 shadow-sm"
              style={{ transform: `translateY(-${spreadOffset}px)` }}
            />
            {/* Bottom tick */}
            <div
              className="absolute w-[2px] h-3 bg-white/90 rounded-full transition-all duration-75 shadow-sm"
              style={{ transform: `translateY(${spreadOffset}px)` }}
            />
            {/* Left tick */}
            <div
              className="absolute h-[2px] w-3 bg-white/90 rounded-full transition-all duration-75 shadow-sm"
              style={{ transform: `translateX(-${spreadOffset}px)` }}
            />
            {/* Right tick */}
            <div
              className="absolute h-[2px] w-3 bg-white/90 rounded-full transition-all duration-75 shadow-sm"
              style={{ transform: `translateX(${spreadOffset}px)` }}
            />
          </div>
        )}

        {/* Aim-Down-Sights (ADS) High-Precision Scopes */}
        {isAiming && currentWeaponId && (
          <div className="relative flex items-center justify-center">
            {currentWeaponId === "sniper" ? (
              // Tactical Mil-Dot AWM Sniper Reticle
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center border border-red-500/50 rounded-full bg-black/35 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-[1px]">
                {/* Thin crosshairs spanning scope */}
                <div className="absolute w-full h-[1px] bg-red-500/80" />
                <div className="absolute h-full w-[1px] bg-red-500/80" />
                {/* Center illuminated red dot */}
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_12px_#EF4444]" />
                {/* Mil-dot stadia markers */}
                {[-40, -20, 20, 40].map((offset) => (
                  <div
                    key={`mil-x-${offset}`}
                    className="absolute w-[1px] h-2 bg-red-400"
                    style={{ transform: `translateX(${offset}px)` }}
                  />
                ))}
                {[-40, -20, 20, 40, 60].map((offset) => (
                  <div
                    key={`mil-y-${offset}`}
                    className="absolute h-[1px] w-2 bg-red-400"
                    style={{ transform: `translateY(${offset}px)` }}
                  />
                ))}
                <span className="absolute bottom-6 font-mono text-[10px] text-red-400/80 tracking-widest font-black">
                  AWM • 8X MAGNUM
                </span>
              </div>
            ) : (
              // Holographic Red-Dot Reticle (M416 / Shotgun)
              <div className="relative w-16 h-16 flex items-center justify-center border-2 border-emerald-400/80 rounded-full bg-emerald-950/20 shadow-[0_0_14px_rgba(16,185,129,0.4)]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981]" />
                <div className="absolute top-0 w-[2px] h-2 bg-emerald-400" />
                <div className="absolute bottom-0 w-[2px] h-2 bg-emerald-400" />
                <div className="absolute left-0 h-[2px] w-2 bg-emerald-400" />
                <div className="absolute right-0 h-[2px] w-2 bg-emerald-400" />
              </div>
            )}
          </div>
        )}

        {/* Dynamic Hit Marker (Cross Ticks `\ /` `X`) */}
        <AnimatePresence>
          {showHitMarker && (
            <motion.div
              initial={{ scale: 0.7, opacity: 1 }}
              animate={{ scale: 1.15, opacity: 1 }}
              exit={{ scale: 1.35, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute pointer-events-none flex items-center justify-center"
            >
              <div
                className={`relative w-8 h-8 ${hitIsHeadshot ? "text-red-500" : "text-amber-400"}`}
              >
                <div className="absolute top-0 left-0 w-2.5 h-[2px] rotate-45 bg-current shadow-[0_0_8px_currentColor]" />
                <div className="absolute top-0 right-0 w-2.5 h-[2px] -rotate-45 bg-current shadow-[0_0_8px_currentColor]" />
                <div className="absolute bottom-0 left-0 w-2.5 h-[2px] -rotate-45 bg-current shadow-[0_0_8px_currentColor]" />
                <div className="absolute bottom-0 right-0 w-2.5 h-[2px] rotate-45 bg-current shadow-[0_0_8px_currentColor]" />
              </div>
              {/* Floating Hit Damage Readout */}
              {hitDamage && (
                <div
                  className={`absolute -top-7 font-black font-mono text-sm tracking-wider drop-shadow-md ${
                    hitIsHeadshot ? "text-red-400 font-extrabold scale-110" : "text-amber-300"
                  }`}
                >
                  {hitIsHeadshot ? `HEADSHOT ${hitDamage}` : `-${hitDamage}`}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===================================================================== */}
      {/* 4. MOBILE VIRTUAL JOYSTICK (Only rendered on Mobile Mode when on foot) */}
      {/* ===================================================================== */}
      {isMobileMode && !ridingVehicle && (
        <div
          className="absolute bottom-3 left-3 w-40 h-40 pointer-events-auto touch-none flex items-center justify-center"
          data-touch-control="joystick"
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
        >
          {/* Outer Ring */}
          <div
            className={`w-28 h-28 rounded-full border flex items-center justify-center transition-all ${
              joystickActive ? "border-white/50 bg-white/10" : "border-white/25 bg-black/15"
            }`}
          >
            {/* Inner Joystick Knob */}
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-lg transition-transform ${
                joystickActive ? "border-white/80 bg-white/45" : "border-white/40 bg-white/20"
              }`}
              style={{
                transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              }}
            >
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. MOBILE COMBAT ACTION BUTTONS (Only rendered on Mobile Mode) */}
      {/* ===================================================================== */}
      {isMobileMode && !ridingVehicle && (
        // PUBG-style thumb cluster: big fire button, small icon buttons in an arc around it
        <div className="absolute bottom-3 right-3 w-[13rem] h-[11.5rem] pointer-events-none">
          <button
            data-touch-control="jump"
            aria-label="Jump"
            onClick={() => {
              mobileInput.triggerJump();
              useGameStore.getState().performCombatMove("jump");
            }}
            className={`${TOUCH_BTN} w-12 h-12 right-6 bottom-[6.5rem]`}
          >
            <ChevronsUp className="w-5 h-5" />
          </button>
          <button
            data-touch-control="crouch"
            aria-label="Crouch"
            onClick={() => {
              mobileInput.toggleCrouch();
              useGameStore.getState().toggleCrouch();
            }}
            className={`${TOUCH_BTN} w-12 h-12 right-[9.5rem] bottom-2 ${mobileInput.isCrouching ? "!bg-amber-500/50 !border-amber-300" : ""}`}
          >
            <Shield className="w-5 h-5" />
          </button>
          {currentWeaponId && (
            <>
              <button
                data-touch-control="ads"
                aria-label="Aim"
                onClick={() => setAiming(!isAiming)}
                className={`${TOUCH_BTN} w-12 h-12 right-[5.75rem] bottom-2 ${isAiming ? "!bg-emerald-500/50 !border-emerald-300" : ""}`}
              >
                <Eye className="w-5 h-5" />
              </button>
              {currentAmmo && (
                <button
                  data-touch-control="reload"
                  aria-label="Reload"
                  onClick={startReload}
                  disabled={isReloading || currentAmmo.inMag >= (currentDef?.magCapacity || 30)}
                  className={`${TOUCH_BTN} w-11 h-11 right-[5.25rem] bottom-[4.5rem] disabled:opacity-50`}
                >
                  <RotateCw className={`w-4 h-4 ${isReloading ? "animate-spin text-amber-300" : ""}`} />
                </button>
              )}
              <button
                data-touch-control="primary-fire"
                aria-label="Fire"
                className="absolute right-1 bottom-1 w-[4.75rem] h-[4.75rem] rounded-full pointer-events-auto touch-none grid place-items-center bg-red-600/55 backdrop-blur-sm border-2 border-white/50 active:scale-90 active:bg-red-500/80 text-white shadow-lg"
                onPointerDown={() => {
                  mobileInput.isFiring = true;
                  mobileInput.shootOnce = true;
                }}
                onPointerUp={() => {
                  mobileInput.isFiring = false;
                }}
                onPointerCancel={() => {
                  mobileInput.isFiring = false;
                }}
              >
                <Crosshair className="w-8 h-8" />
              </button>
            </>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. COMPUTER CONTROLLER DOCK (Only rendered in Computer Mode when on foot) */}
      {/* ===================================================================== */}
      {!isMobileMode && !ridingVehicle && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-auto">
          {/* Tactical Computer Gamepad & Hotkey Bar */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/20 shadow-2xl text-xs text-slate-300">
            {/* Movement Keys Cluster */}
            <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10">
              <span className="text-amber-400 font-bold mr-1">MOVE:</span>
              {(["w", "a", "s", "d"] as const).map((k) => {
                const isPressed = Boolean(activeKeys[k]);
                return (
                  <kbd
                    key={k}
                    className={`w-6 h-6 flex items-center justify-center rounded-lg font-mono font-bold text-[11px] uppercase transition-all ${
                      isPressed
                        ? "bg-amber-500 text-slate-950 font-black shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-110"
                        : "bg-white/10 text-white border border-white/15"
                    }`}
                  >
                    {k}
                  </kbd>
                );
              })}
              <kbd
                className={`px-2 py-0.5 rounded-lg font-mono text-[10px] transition-all ml-1 ${
                  activeKeys["shift"] || activeKeys["shiftleft"] || activeKeys["shiftright"]
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "bg-white/10 text-slate-300 border border-white/10"
                }`}
              >
                Shift
              </kbd>
            </div>

            {/* Mouse Combat Actions */}
            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10 font-mono text-[11px]">
              <span
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                  activeKeys["mouse0"] || mobileInput.isFiring
                    ? "bg-rose-500 text-white font-black shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                    : "bg-white/10 text-rose-300"
                }`}
              >
                L-Click: Fire
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                  isAiming || activeKeys["mouse2"]
                    ? "bg-emerald-500 text-slate-950 font-black shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                    : "bg-white/10 text-emerald-300"
                }`}
              >
                R-Click: ADS
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                  activeKeys["r"] || isReloading
                    ? "bg-amber-500 text-slate-950 font-black"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                R: Reload
              </span>
            </div>

            {/* Stance Keys */}
            <div className="hidden md:flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10 text-[11px] font-mono">
              <span
                className={`px-1.5 py-0.5 rounded-lg font-bold ${
                  activeKeys[" "] ? "bg-amber-500 text-slate-950 font-black" : "bg-white/10 text-slate-300"
                }`}
              >
                Space: Jump
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-lg font-bold ${
                  activeKeys["c"] ? "bg-amber-500 text-slate-950 font-black" : "bg-white/10 text-slate-300"
                }`}
              >
                C: Crouch
              </span>
            </div>

            {/* Gamepad Status Badge (if connected) */}
            {gamepadConnected && (
              <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/50 px-2 py-1 rounded-xl text-emerald-300 text-[10px] font-mono font-bold animate-pulse">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Gamepad Active</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. WEAPON SELECTOR DOCK & AMMO STATUS (Bottom Center) */}
      {/* ===================================================================== */}
      {isMobileMode && !ridingVehicle && (
        <button
          data-touch-control="weapon-cycle"
          onClick={() => {
            const order: Array<WeaponId | null> = [null, "m416", "shotgun", "sniper"];
            equipWeapon(order[(order.indexOf(currentWeaponId) + 1) % order.length]);
          }}
          className="absolute right-3 bottom-[12.25rem] pointer-events-auto flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/25 px-3 py-1.5 text-white shadow-lg active:scale-95"
          aria-label="Switch weapon"
        >
          {currentDef && currentAmmo ? (
            <>
              <span className="text-[11px] font-black" style={{ color: currentDef.color }}>
                {currentDef.category}
              </span>
              <span className="text-xs font-bold">{currentDef.name.split(" ")[0]}</span>
              <span className="font-mono text-xs font-black">
                {currentAmmo.inMag}
                <span className="text-white/50">/{currentAmmo.reserve}</span>
              </span>
            </>
          ) : (
            <span className="text-xs font-bold">🎒 {useGameStore.getState().language === "km" ? "ដៃទទេ" : "Unarmed"}</span>
          )}
          <RotateCw className="w-3 h-3 text-white/60" />
        </button>
      )}
      {!isMobileMode && !ridingVehicle && (
      <div className="absolute flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl pointer-events-auto transition-all bottom-18 left-1/2 -translate-x-1/2">
        {(["m416", "shotgun", "sniper"] as WeaponId[]).map((wId, idx) => {
          const w = WEAPON_REGISTRY[wId];
          const ammo = weaponAmmo[wId];
          const isSelected = currentWeaponId === wId;

          return (
            <button
              key={wId}
              data-touch-control={`weapon-${wId}`}
              onClick={() => equipWeapon(isSelected ? null : wId)}
              className={`px-3 py-1.5 rounded-xl border flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                isSelected
                  ? "bg-gradient-to-b from-white/20 to-white/5 border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.4)] text-white"
                  : "bg-black/30 border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-1">
                {!isMobileMode && (
                  <kbd className="px-1 rounded bg-white/20 text-[10px] font-mono font-bold text-amber-300">
                    {idx + 1}
                  </kbd>
                )}
                <span className="text-xs font-black" style={{ color: w.color }}>
                  {w.category}
                </span>
                <span className="text-xs font-bold text-slate-200">{w.name.split(" ")[0]}</span>
              </div>
              <div className="font-mono text-[11px] font-black tracking-tight">
                <span className={isSelected ? "text-amber-300" : "text-slate-300"}>
                  {ammo.inMag}
                </span>
                <span className="text-slate-500">/{ammo.reserve}</span>
              </div>
            </button>
          );
        })}

        {/* Holster Button */}
        <button
          onClick={() => equipWeapon(null)}
          className={`p-2 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
            currentWeaponId === null
              ? "bg-amber-500/30 border-amber-400 text-amber-300 shadow-md"
              : "bg-black/30 border-white/10 text-slate-400 hover:text-white"
          }`}
          title="Holster Weapons [H / 4]"
        >
          <span className="text-xs font-bold">🎒</span>
          {!isMobileMode && (
            <kbd className="ml-1 px-1 rounded bg-white/20 text-[10px] font-mono font-bold text-slate-300">
              H
            </kbd>
          )}
        </button>

        {/* Sensitivity & Touch Settings Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-xs flex items-center justify-center cursor-pointer"
          title="Aim Sensitivity Settings"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>
      )}

      {/* ===================================================================== */}
      {/* 9. INTERACTIVE TOUCH ZONES GUIDE OVERLAY (Full Guide on Mobile) */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {showTouchZoneGuide && isMobileMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-50 pointer-events-auto flex flex-col items-center justify-between p-6 text-white font-sans overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-300">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-wide">
                    MOBILE TOUCH CONTROLS GUIDE
                  </h2>
                  <p className="text-xs text-slate-400">
                    Learn where to place your thumbs and touch the screen to play
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTouchZoneGuide}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                Got It! Play
              </button>
            </div>

            {/* Visual Screen Layout Diagram */}
            <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
              {/* Left Screen Guide Card */}
              <div className="p-4 rounded-3xl bg-emerald-950/40 border-2 border-emerald-500/60 shadow-xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                  <span>🕹️</span>
                  <span>1. LEFT THUMB: MOVEMENT</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Touch and drag anywhere in the <strong>bottom-left quadrant</strong> to move.
                  Push further outward to sprint forward!
                </p>
                <div className="mt-2 p-2.5 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                  <span className="text-lg">🔥</span>
                  <span>
                    <strong>Left Fire Button:</strong> Tap the red button above joystick to shoot
                    while aiming with your right thumb.
                  </span>
                </div>
              </div>

              {/* Right Screen Guide Card */}
              <div className="p-4 rounded-3xl bg-sky-950/40 border-2 border-sky-500/60 shadow-xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sky-400 font-black text-sm">
                  <span>🎯</span>
                  <span>2. RIGHT THUMB: AIM & LOOK</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Swipe anywhere on the <strong>right side of your screen</strong> to turn your
                  character and rotate camera view.
                </p>
                <div className="mt-2 p-2.5 rounded-2xl bg-black/40 border border-sky-500/30 flex items-center gap-2 text-xs text-sky-300">
                  <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>ADS Scope:</strong> Tap the eye icon to zoom in with precision scope
                    (8X AWM sniper or holographic red-dot).
                  </span>
                </div>
              </div>

              {/* Combat Buttons Card */}
              <div className="p-4 rounded-3xl bg-rose-950/40 border-2 border-rose-500/60 shadow-xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-rose-400 font-black text-sm">
                  <span>💥</span>
                  <span>3. RIGHT THUMB: COMBAT ACTIONS</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <strong className="text-rose-400 block">Large FIRE Button:</strong>
                    Hold down to spray automatic fire.
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <strong className="text-amber-400 block">Reload [🔄]:</strong>
                    Replenishes your weapon magazine.
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <strong className="text-yellow-400 block">Jump [⬆️]:</strong>
                    Hurdle obstacles and evade incoming shots.
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <strong className="text-slate-300 block">Crouch [🛡️]:</strong>
                    Lower profile and stabilize weapon spray recoil.
                  </div>
                </div>
              </div>

              {/* Weapon Switcher Card */}
              <div className="p-4 rounded-3xl bg-amber-950/40 border-2 border-amber-500/60 shadow-xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <span>🔫</span>
                  <span>4. BOTTOM DOCK: WEAPONS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tap any weapon in the bottom center bar to switch between <strong>M416 (AR)</strong>,{" "}
                  <strong>S12K (Shotgun)</strong>, and <strong>AWM (Sniper)</strong>.
                </p>
                <div className="mt-2 p-2 rounded-2xl bg-black/40 border border-amber-500/30 text-xs text-amber-200">
                  Tap 🎒 to holster weapons for peaceful walking and conversation in town!
                </div>
              </div>
            </div>

            {/* Bottom Dismiss Button */}
            <button
              onClick={toggleTouchZoneGuide}
              className="w-full max-w-sm py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>I Understand • Start Playing</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* 10. AIM SENSITIVITY CONFIGURATION MODAL */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-5 rounded-3xl bg-slate-900/95 border border-white/20 shadow-2xl backdrop-blur-xl pointer-events-auto text-white z-50 font-sans"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm tracking-wide">AIM SENSITIVITY</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold hover:bg-white/20 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Camera Look (Hip-Fire)</span>
                  <span className="font-mono text-amber-400">
                    {Math.round(cameraSensitivity.touchLook * 10000)}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={cameraSensitivity.touchLook * 10000}
                  onChange={(e) =>
                    setCameraSensitivity({ touchLook: Number(e.target.value) / 10000 })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Combat Aim Sensitivity</span>
                  <span className="font-mono text-emerald-400">
                    {Math.round(cameraSensitivity.aimLook * 10000)}
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  value={cameraSensitivity.aimLook * 10000}
                  onChange={(e) =>
                    setCameraSensitivity({ aimLook: Number(e.target.value) / 10000 })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300">Scope / ADS Sensitivity</span>
                  <span className="font-mono text-rose-400">
                    {Math.round(cameraSensitivity.adsLook * 10000)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={cameraSensitivity.adsLook * 10000}
                  onChange={(e) =>
                    setCameraSensitivity({ adsLook: Number(e.target.value) / 10000 })
                  }
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-between gap-2">
                <button
                  onClick={() =>
                    setCameraSensitivity({
                      touchLook: 0.0055,
                      aimLook: 0.0038,
                      adsLook: 0.0022,
                    })
                  }
                  className="flex-1 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-[11px] cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] cursor-pointer"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
