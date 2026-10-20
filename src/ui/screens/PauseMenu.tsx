"use client";

import React, { useEffect } from "react";
import { ArrowLeft, Home, Languages, Map as MapIcon, Play, Settings, Volume2, VolumeX } from "lucide-react";
import { useGameStore } from "@/state/gameStore";
import type { GraphicsQuality } from "@/state/settingsStorage";

/**
 * Esc pauses / steps back, M toggles the world map. Modals keep priority:
 * PlayerController closes an open modal on Esc and marks the event handled.
 */
export function usePauseHotkeys() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.repeat ||
        e.defaultPrevented ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      const s = useGameStore.getState();
      if (s.screen !== "game_world" || s.activeModal) return;

      if (e.key === "Escape") {
        s.setPauseScreen(s.pauseScreen === "settings" ? "menu" : s.pauseScreen ? null : "menu");
      } else if (e.key === "m" || e.key === "M") {
        s.setPauseScreen(s.pauseScreen === "map" ? null : "map");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

const QUALITY_OPTIONS: Array<{ id: GraphicsQuality; en: string; km: string; hintEn: string; hintKm: string }> = [
  { id: "low", en: "Performance", km: "ល្បឿន", hintEn: "Lower resolution, no shadows", hintKm: "គុណភាពទាប គ្មានស្រមោល" },
  { id: "medium", en: "Balanced", km: "មធ្យម", hintEn: "Recommended", hintKm: "ណែនាំ" },
  { id: "high", en: "High", km: "ខ្ពស់", hintEn: "Sharpest image on high-DPI screens", hintKm: "រូបភាពច្បាស់បំផុត" },
];

export function PauseMenu() {
  usePauseHotkeys();
  const pauseScreen = useGameStore((s) => s.pauseScreen);
  const language = useGameStore((s) => s.language);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const graphicsQuality = useGameStore((s) => s.graphicsQuality);
  const shadowsEnabled = useGameStore((s) => s.shadowsEnabled);
  const lookScale = useGameStore((s) => s.lookSensitivityScale);
  const day = useGameStore((s) => s.day);
  const playerName = useGameStore((s) => s.player.name);
  const setPauseScreen = useGameStore((s) => s.setPauseScreen);
  const setScreen = useGameStore((s) => s.setScreen);
  const setLanguage = useGameStore((s) => s.setLanguage);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const setGraphicsQuality = useGameStore((s) => s.setGraphicsQuality);
  const setShadowsEnabled = useGameStore((s) => s.setShadowsEnabled);
  const setLookSensitivityScale = useGameStore((s) => s.setLookSensitivityScale);

  if (pauseScreen !== "menu" && pauseScreen !== "settings") return null;
  const km = language === "km";

  const buttonBase = "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left font-bold transition-colors";
  const menuButton = `${buttonBase} border-white/10 bg-slate-800/70 hover:bg-slate-700/80 hover:border-white/25`;
  // Letter-spacing splits Khmer glyph clusters, so only track Latin headings
  const tracking = km ? "" : "tracking-[0.1em]";

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/75 backdrop-blur-sm p-4 text-white pointer-events-auto"
      onClick={(e) => e.target === e.currentTarget && setPauseScreen(null)}
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-slate-900/95 p-5 shadow-2xl">
        {pauseScreen === "menu" ? (
          <>
            <p className={`text-[11px] font-bold text-amber-300 ${km ? "" : "tracking-[0.25em]"}`}>{km ? "ជីវិតខ្ញុំ" : "MY LIFE"}</p>
            <h1 className={`mt-1 text-3xl font-black ${tracking}`}>{km ? "ផ្អាក" : "PAUSED"}</h1>
            <p className="mt-1 mb-5 text-sm text-slate-400">
              {playerName} · {km ? `ថ្ងៃទី ${day}` : `Day ${day}`}
            </p>
            <div className="flex flex-col gap-2">
              <button autoFocus className={`${buttonBase} bg-amber-500/90 border-amber-300 text-slate-950 hover:bg-amber-400`} onClick={() => setPauseScreen(null)}>
                <Play className="w-4 h-4" />
                {km ? "បន្តលេង" : "Resume"}
                <kbd className="ml-auto font-mono text-[10px] opacity-60">Esc</kbd>
              </button>
              <button className={menuButton} onClick={() => setPauseScreen("map")}>
                <MapIcon className="w-4 h-4" />
                {km ? "ផែនទីពិភពលោក" : "World Map"}
                <kbd className="ml-auto font-mono text-[10px] text-slate-400">M</kbd>
              </button>
              <button className={menuButton} onClick={() => setPauseScreen("settings")}>
                <Settings className="w-4 h-4" />
                {km ? "ការកំណត់" : "Settings"}
              </button>
              <button className={menuButton} onClick={() => setScreen("main_menu")}>
                <Home className="w-4 h-4" />
                {km ? "ម៉ឺនុយដើម" : "Main Menu"}
                <span className="ml-auto text-[10px] font-medium text-slate-400">{km ? "អាចបន្តវិញបាន" : "Continue resumes"}</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={() => setPauseScreen("menu")}
                aria-label={km ? "ត្រឡប់" : "Back"}
                className="grid place-items-center w-8 h-8 rounded-lg border border-white/15 bg-slate-800 hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className={`text-xl font-black ${tracking}`}>{km ? "ការកំណត់" : "SETTINGS"}</h1>
            </div>

            <fieldset className="mb-4">
              <legend className={`mb-2 text-[11px] font-bold text-slate-400 ${km ? "" : "tracking-widest"}`}>{km ? "គុណភាពក្រាហ្វិក" : "GRAPHICS QUALITY"}</legend>
              <div className="grid grid-cols-3 gap-1.5">
                {QUALITY_OPTIONS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setGraphicsQuality(q.id)}
                    aria-pressed={graphicsQuality === q.id}
                    className={`rounded-lg border px-2 py-2 text-sm font-bold ${
                      graphicsQuality === q.id ? "border-amber-300 bg-amber-500/25 text-amber-100" : "border-white/10 bg-slate-800 hover:bg-slate-700"
                    }`}
                  >
                    {km ? q.km : q.en}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                {(() => {
                  const q = QUALITY_OPTIONS.find((o) => o.id === graphicsQuality)!;
                  return km ? q.hintKm : q.hintEn;
                })()}
              </p>
            </fieldset>

            <label className={`mb-4 flex items-center justify-between gap-3 ${graphicsQuality === "low" ? "opacity-50" : ""}`}>
              <span className="text-sm font-semibold">{km ? "ស្រមោល" : "Shadows"}</span>
              <input
                type="checkbox"
                className="w-5 h-5 accent-amber-400"
                checked={shadowsEnabled && graphicsQuality !== "low"}
                disabled={graphicsQuality === "low"}
                onChange={(e) => setShadowsEnabled(e.target.checked)}
              />
            </label>

            <label className="mb-4 block">
              <span className="flex items-center justify-between text-sm font-semibold">
                {km ? "ភាពរហ័សនៃការមើល" : "Look sensitivity"}
                <span className="font-mono text-xs text-slate-400">{lookScale.toFixed(1)}×</span>
              </span>
              <input
                type="range"
                min={0.2}
                max={2}
                step={0.1}
                value={lookScale}
                onChange={(e) => setLookSensitivityScale(Number(e.target.value))}
                className="mt-2 w-full accent-amber-400"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button className={menuButton} onClick={toggleSound}>
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {km ? (soundEnabled ? "សំឡេង បើក" : "សំឡេង បិទ") : soundEnabled ? "Sound on" : "Sound off"}
              </button>
              <button className={menuButton} onClick={() => setLanguage(km ? "en" : "km")}>
                <Languages className="w-4 h-4" />
                {km ? "English" : "ខ្មែរ"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
