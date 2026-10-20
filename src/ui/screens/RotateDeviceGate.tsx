"use client";

import React, { useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Maximize2, Smartphone } from "lucide-react";
import { useGameStore } from "@/state/gameStore";
import { canFullscreen, enterLandscapeFullscreen, isIOS, isStandaloneApp } from "@/ui/screens/fullscreen";

const DISMISS_KEY = "mylife.portraitDismissed";

function subscribeOrientation(onChange: () => void) {
  const mq = window.matchMedia("(orientation: portrait)");
  mq.addEventListener("change", onChange);
  window.addEventListener("resize", onChange);
  return () => {
    mq.removeEventListener("change", onChange);
    window.removeEventListener("resize", onChange);
  };
}

const isTouchPortrait = () =>
  window.matchMedia("(orientation: portrait)").matches &&
  (navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches);

function readDismissed() {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Asks phone players to turn the device sideways (landscape) while in the game world,
 * and offers fullscreen + landscape lock where the browser supports it.
 */
export function RotateDeviceGate() {
  const screenName = useGameStore((s) => s.screen);
  const language = useGameStore((s) => s.language);
  const portrait = useSyncExternalStore(subscribeOrientation, isTouchPortrait, () => false);
  const [dismissed, setDismissed] = useState(readDismissed);
  const [lockFailed, setLockFailed] = useState(false);

  if (screenName !== "game_world" || !portrait || dismissed) return null;

  const km = language === "km";
  const ios = isIOS();
  const offerFullscreen = canFullscreen() && !isStandaloneApp();

  const playLandscape = async () => {
    const locked = await enterLandscapeFullscreen();
    if (!locked) setLockFailed(true);
  };

  const dismiss = () => {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Still dismissed for this page view
    }
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-slate-950/95 backdrop-blur-md px-8 text-center text-white pointer-events-auto">
      <motion.div
        animate={{ rotate: [0, 0, -90, -90, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, times: [0, 0.2, 0.5, 0.8, 1], ease: "easeInOut" }}
        className="grid place-items-center w-24 h-24 rounded-3xl border border-amber-300/40 bg-amber-500/15"
      >
        <Smartphone className="w-12 h-12 text-amber-300" />
      </motion.div>

      <div className="flex flex-col gap-2 max-w-xs">
        <h1 className="text-2xl font-black">{km ? "សូមបង្វិលទូរស័ព្ទផ្ដេក" : "Turn your phone sideways"}</h1>
        <p className="text-sm text-slate-300">
          {km
            ? "ហ្គេមនេះលេងបានល្អបំផុតក្នុងទម្រង់ផ្ដេក (ដូច GTA) — ម្រាមដៃឆ្វេងដើរ ម្រាមដៃស្ដាំមើល និងបាញ់។"
            : "The game plays best in landscape, like GTA: left thumb to move, right thumb to look and shoot."}
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2.5">
        {offerFullscreen && (
          <button
            onClick={playLandscape}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3.5 font-extrabold text-slate-950 shadow-lg shadow-orange-500/30"
          >
            <Maximize2 className="w-5 h-5" />
            {km ? "លេងពេញអេក្រង់ផ្ដេក" : "Play fullscreen landscape"}
          </button>
        )}

        {(ios || lockFailed) && (
          <p className="rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2.5 text-xs leading-relaxed text-slate-300">
            {ios
              ? km
                ? "iPhone៖ បិទ «សោទិសបញ្ឈរ» នៅ Control Center រួចបង្វិលទូរស័ព្ទ។ សម្រាប់ពេញអេក្រង់ ចុច Share → Add to Home Screen។"
                : "iPhone: turn off Portrait Orientation Lock in Control Center, then rotate. For fullscreen, tap Share → Add to Home Screen."
              : km
              ? "កម្មវិធីរុករកនេះមិនអាចបង្វិលដោយស្វ័យប្រវត្តិទេ — សូមបង្វិលទូរស័ព្ទដោយដៃ។"
              : "This browser can't rotate automatically. Please turn your phone by hand."}
          </p>
        )}

        <button onClick={dismiss} className="py-2 text-sm font-semibold text-slate-400 underline underline-offset-4">
          {km ? "បន្តលេងបញ្ឈរ" : "Continue in portrait"}
        </button>
      </div>
    </div>
  );
}
