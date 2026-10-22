"use client";

import React, { useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  HelpCircle,
  Home,
  Languages,
  Map as MapIcon,
  Monitor,
  Moon,
  Play,
  Settings,
  Smartphone,
  Sun,
  User,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useGameStore } from "@/state/gameStore";
import type { GraphicsQuality } from "@/state/settingsStorage";
import { translations } from "@/i18n/translations";
import { useIsMobileMode } from "@/ui/hud/useIsMobileMode";

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
  const flightSensitivity = useGameStore((s) => s.flightSensitivity);
  const invertFlightPitch = useGameStore((s) => s.invertFlightPitch);
  const flightAssist = useGameStore((s) => s.flightAssist);
  const mouseFlightEnabled = useGameStore((s) => s.mouseFlightEnabled);
  const setFlightSensitivity = useGameStore((s) => s.setFlightSensitivity);
  const setInvertFlightPitch = useGameStore((s) => s.setInvertFlightPitch);
  const setFlightAssist = useGameStore((s) => s.setFlightAssist);
  const setMouseFlightEnabled = useGameStore((s) => s.setMouseFlightEnabled);
  const launchFireJetMode = useGameStore((s) => s.launchFireJetMode);

  const [settingsTab, setSettingsTab] = React.useState<"general" | "flight" | "controls">("general");

  const day = useGameStore((s) => s.day);
  const playerName = useGameStore((s) => s.player.name);
  const setPauseScreen = useGameStore((s) => s.setPauseScreen);
  const setScreen = useGameStore((s) => s.setScreen);
  const setLanguage = useGameStore((s) => s.setLanguage);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const setGraphicsQuality = useGameStore((s) => s.setGraphicsQuality);
  const setShadowsEnabled = useGameStore((s) => s.setShadowsEnabled);
  const setLookSensitivityScale = useGameStore((s) => s.setLookSensitivityScale);
  const timeHour = useGameStore((s) => s.timeHour);
  const ridingVehicle = useGameStore((s) => s.ridingVehicle);
  const isMobile = useIsMobileMode();

  if (pauseScreen !== "menu" && pauseScreen !== "settings") return null;
  const km = language === "km";
  const t = translations[language];

  // Phone HUD keeps the screen clear, so these live here instead (each closes the menu first)
  const quick = (fn: () => void) => () => {
    setPauseScreen(null);
    fn();
  };
  const st = useGameStore.getState;
  const isNight = timeHour >= 21.0;
  const tile =
    "flex flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/70 py-2.5 px-1 text-[11px] font-bold hover:bg-slate-700/80 active:scale-95 touch-manipulation cursor-pointer";
  const quickActions = [
    {
      icon: isNight ? <Moon className="w-5 h-5 text-indigo-300" /> : <Sun className="w-5 h-5 text-amber-300" />,
      label: isNight ? (km ? "ចូលគេង" : "Sleep") : t.chooseDay,
      on: quick(() => (isNight ? st().sleepAndEndDay() : st().openModal("decision"))),
    },
    { icon: <Smartphone className="w-5 h-5 text-sky-300" />, label: t.phone, on: quick(() => st().openModal("phone")) },
    { icon: <Users className="w-5 h-5 text-rose-300" />, label: t.appFamily, on: quick(() => st().openModal("relationship")) },
    { icon: <BookOpen className="w-5 h-5 text-amber-300" />, label: t.appJournal, on: quick(() => st().openModal("journal")) },
    { icon: <User className="w-5 h-5 text-amber-300" />, label: km ? "តួអង្គ" : "Character", on: quick(() => st().openModal("character_select")) },
    { icon: <Camera className="w-5 h-5 text-slate-200" />, label: km ? "មុំកាមេរ៉ា" : "Camera view", on: quick(() => st().toggleCameraMode()) },
  ];
  const vehicles = [
    ["plane", "✈️", km ? "យន្តហោះ" : "Jet"],
    ["supercar", "🏎️", "Supercar"],
    ["motorbike", "🏍️", km ? "ម៉ូតូ" : "Motorbike"],
    ["bicycle", "🚲", km ? "កង់" : "Bicycle"],
  ] as const;

  const buttonBase = "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left font-bold transition-colors touch-manipulation cursor-pointer";
  const menuButton = `${buttonBase} border-white/10 bg-slate-800/70 hover:bg-slate-700/80 hover:border-white/25`;
  // Letter-spacing splits Khmer glyph clusters, so only track Latin headings
  const tracking = km ? "" : "tracking-[0.1em]";

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/75 backdrop-blur-sm p-4 text-white pointer-events-auto select-none"
      onClick={(e) => e.target === e.currentTarget && setPauseScreen(null)}
    >
      <div
        className={`w-full max-h-[92dvh] overflow-y-auto rounded-2xl border border-white/15 bg-slate-900/95 shadow-2xl ${
          isMobile && pauseScreen === "menu" ? "max-w-2xl p-4" : "max-w-sm p-5"
        }`}
      >
        {pauseScreen === "menu" && isMobile ? (
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.35fr] gap-3.5 sm:gap-4">
            <div className="flex flex-col gap-2">
              <h1 className={`text-2xl font-black ${tracking}`}>{km ? "ម៉ឺនុយ" : "MENU"}</h1>
              <p className="-mt-1 mb-1 text-xs text-slate-400">
                {playerName} · {km ? `ថ្ងៃទី ${day}` : `Day ${day}`}
              </p>
              <button className={`${buttonBase} py-2.5 bg-amber-500/90 border-amber-300 text-slate-950`} onClick={() => setPauseScreen(null)}>
                <Play className="w-4 h-4" />
                {km ? "បន្តលេង" : "Resume"}
              </button>
              <button className={`${menuButton} py-2.5`} onClick={() => setPauseScreen("map")}>
                <MapIcon className="w-4 h-4" />
                {km ? "ផែនទី" : "Map"}
              </button>
              <button className={`${menuButton} py-2.5`} onClick={() => setPauseScreen("settings")}>
                <Settings className="w-4 h-4" />
                {km ? "ការកំណត់" : "Settings"}
              </button>
              <button className={`${menuButton} py-2.5`} onClick={() => setScreen("main_menu")}>
                <Home className="w-4 h-4" />
                {km ? "ម៉ឺនុយដើម" : "Main Menu"}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-1.5">
                {quickActions.map((a) => (
                  <button key={a.label} className={tile} onClick={a.on}>
                    {a.icon}
                    <span className="truncate max-w-full px-1">{a.label}</span>
                  </button>
                ))}
              </div>

              {!ridingVehicle && (
                <div>
                  <p className="mb-1.5 text-[11px] font-bold text-slate-400">{km ? "យានយន្ត" : "VEHICLES"}</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {vehicles.map(([v, icon, label]) => (
                      <button key={v} className={tile} onClick={quick(() => st().mountVehicle(v))}>
                        <span className="text-lg leading-none">{icon}</span>
                        <span className="truncate max-w-full px-1">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                <button className={tile} onClick={quick(() => st().setShowTouchZoneGuide(true))}>
                  <HelpCircle className="w-5 h-5 text-amber-300" />
                  {km ? "របៀបលេង" : "Controls guide"}
                </button>
                <button className={tile} onClick={quick(() => st().setDeviceControlMode("computer"))}>
                  <Monitor className="w-5 h-5 text-sky-300" />
                  {km ? "ប្ដូរទៅ PC" : "PC controls"}
                </button>
              </div>
            </div>
          </div>
        ) : pauseScreen === "menu" ? (
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

              {ridingVehicle !== "plane" && (
                <button
                  className={`${buttonBase} bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 border-cyan-300 text-white shadow-lg shadow-cyan-600/30`}
                  onClick={quick(() => launchFireJetMode())}
                >
                  <span className="text-lg">✈️</span>
                  <span>{km ? "ហោះហើរ: យន្តហោះ FireJet" : "Take Flight: Steel Hawk Jet"}</span>
                  <span className="ml-auto text-[10px] font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded">Launch</span>
                </button>
              )}

              <button
                className={menuButton}
                onClick={() => {
                  setSettingsTab("controls");
                  setPauseScreen("settings");
                }}
              >
                <HelpCircle className="w-4 h-4 text-cyan-300" />
                {km ? "របៀបបញ្ជាយន្តហោះ & គ្រាប់ចុច" : "Controls & Keybindings"}
              </button>

              <button className={menuButton} onClick={() => setPauseScreen("map")}>
                <MapIcon className="w-4 h-4" />
                {km ? "ផែនទីពិភពលោក" : "World Map"}
                <kbd className="ml-auto font-mono text-[10px] text-slate-400">M</kbd>
              </button>

              <button
                className={menuButton}
                onClick={() => {
                  setSettingsTab("general");
                  setPauseScreen("settings");
                }}
              >
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
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPauseScreen("menu")}
                  aria-label={km ? "ត្រឡប់" : "Back"}
                  className="grid place-items-center w-8 h-8 rounded-lg border border-white/15 bg-slate-800 hover:bg-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className={`text-xl font-black ${tracking}`}>{km ? "ការកំណត់ & របៀបលេង" : "SETTINGS & CONTROLS"}</h1>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 p-1 mb-4 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold">
              <button
                onClick={() => setSettingsTab("general")}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  settingsTab === "general"
                    ? "bg-amber-500 text-slate-950 font-black shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                ⚙️ {km ? "ទូទៅ" : "General"}
              </button>
              <button
                onClick={() => setSettingsTab("flight")}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  settingsTab === "flight"
                    ? "bg-cyan-500 text-slate-950 font-black shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                ✈️ {km ? "យន្តហោះ" : "Flight"}
              </button>
              <button
                onClick={() => setSettingsTab("controls")}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  settingsTab === "controls"
                    ? "bg-sky-500 text-slate-950 font-black shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                🎮 {km ? "គ្រាប់ចុច" : "Controls"}
              </button>
            </div>

            {/* TAB 1: GENERAL SETTINGS */}
            {settingsTab === "general" && (
              <>
                <fieldset className="mb-4">
                  <legend className={`mb-2 text-[11px] font-bold text-slate-400 ${km ? "" : "tracking-widest"}`}>{km ? "គុណភាពក្រាហ្វិក" : "GRAPHICS QUALITY"}</legend>
                  <div className="grid grid-cols-3 gap-1.5">
                    {QUALITY_OPTIONS.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => setGraphicsQuality(q.id)}
                        aria-pressed={graphicsQuality === q.id}
                        className={`rounded-lg border px-2 py-2 text-sm font-bold cursor-pointer ${
                          graphicsQuality === q.id ? "border-amber-300 bg-amber-500/25 text-amber-100" : "border-white/10 bg-slate-800 hover:bg-slate-700"
                        }`}
                      >
                        {km ? q.km : q.en}
                      </button>
                    ))}
                  </div>
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
                    {km ? "ភាពរហ័សនៃការមើល (កាមេរ៉ា)" : "Look sensitivity"}
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
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    {km ? (soundEnabled ? "សំឡេង បើក" : "សំឡេង បិទ") : soundEnabled ? "Sound on" : "Sound off"}
                  </button>
                  <button className={menuButton} onClick={() => setLanguage(km ? "en" : "km")}>
                    <Languages className="w-4 h-4 text-sky-400" />
                    {km ? "English" : "ខ្មែរ"}
                  </button>
                </div>
              </>
            )}

            {/* TAB 2: FLIGHT PHYSICS & MECHANICS SETTINGS */}
            {settingsTab === "flight" && (
              <div className="space-y-4">
                <label className="block">
                  <span className="flex items-center justify-between text-sm font-semibold">
                    <span>{km ? "ភាពរហ័សនៃការបញ្ជាហោះហើរ" : "Flight Steering Sensitivity"}</span>
                    <span className="font-mono text-xs text-cyan-300">{flightSensitivity.toFixed(1)}×</span>
                  </span>
                  <input
                    type="range"
                    min={0.4}
                    max={2.5}
                    step={0.1}
                    value={flightSensitivity}
                    onChange={(e) => setFlightSensitivity(Number(e.target.value))}
                    className="mt-2 w-full accent-cyan-400"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    {km ? "កម្រិតឆ្លើយតបនៃ Pitch (ងើយ/មុជ) និង Roll (ផ្អៀង)" : "Controls responsiveness of pitch and roll maneuvers"}
                  </p>
                </label>

                <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-white/10 cursor-pointer">
                  <div>
                    <div className="text-sm font-semibold text-white">{km ? "ត្រឡប់ទិស Pitch (Invert-Y)" : "Invert Pitch (Flight Stick)"}</div>
                    <div className="text-[11px] text-slate-400">
                      {invertFlightPitch
                        ? (km ? "W = មុជចុះក្រោម, S = ងើយឡើងលើ (Flight Sim)" : "W/Up = Pitch Down, S/Down = Pitch Up")
                        : (km ? "W = ងើយឡើងលើ, S = មុជចុះក្រោម (ស្តង់ដារ)" : "W/Up = Pitch Up, S/Down = Pitch Down")}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-cyan-400"
                    checked={invertFlightPitch}
                    onChange={(e) => setInvertFlightPitch(e.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-white/10 cursor-pointer">
                  <div>
                    <div className="text-sm font-semibold text-white">{km ? "ជំនួយការហោះហើរ (Flight Assist)" : "Flight Assist (Auto-Level Wings)"}</div>
                    <div className="text-[11px] text-slate-400">
                      {km ? "ធ្វើឱ្យស្លាបយន្តហោះត្រឡប់មកស្មើវិញដោយស្វ័យប្រវត្តិនៅពេលលែងដៃ" : "Automatically rights wings when steering stick is centered"}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-cyan-400"
                    checked={flightAssist}
                    onChange={(e) => setFlightAssist(e.target.checked)}
                  />
                </label>

                <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/60 border border-white/10 cursor-pointer">
                  <div>
                    <div className="text-sm font-semibold text-white">{km ? "បញ្ជាហោះហើរតាមកណ្ដុរ (Mouse Flight Steering)" : "Mouse Flight Steering Mode"}</div>
                    <div className="text-[11px] text-slate-400">
                      {km ? "រំកិលកណ្ដុរដើម្បីតម្រង់ទិសយន្តហោះផ្ទាល់" : "Move mouse to steer pitch & roll directly"}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-cyan-400"
                    checked={mouseFlightEnabled}
                    onChange={(e) => setMouseFlightEnabled(e.target.checked)}
                  />
                </label>
              </div>
            )}

            {/* TAB 3: CONTROLS & KEYBINDINGS GUIDE */}
            {settingsTab === "controls" && (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <div className="p-3 rounded-xl bg-slate-800/70 border border-white/10">
                  <div className="text-xs font-bold text-cyan-300 uppercase mb-2 flex items-center gap-1.5">
                    <span>✈️</span>
                    <span>{km ? "គ្រាប់ចុចយន្តហោះ (PC / Mac)" : "Fighter Jet Controls (Desktop)"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className="flex items-center justify-between p-1.5 rounded bg-black/30">
                      <span className="text-slate-300">{km ? "ហ្គាស / មុជចុះក្រោម" : "Throttle / Push Nose Down"}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold text-amber-300">W / ↑</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-black/30">
                      <span className="text-slate-300">{km ? "ទាញងើយឡើង / Takeoff" : "Pull Stick Back / Climb"}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold text-amber-300">S / ↓</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-black/30">
                      <span className="text-slate-300">{km ? "ផ្អៀងឆ្វេង" : "Roll / Turn Left"}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold text-amber-300">A / ←</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-black/30">
                      <span className="text-slate-300">{km ? "ផ្អៀងស្ដាំ" : "Roll / Turn Right"}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold text-amber-300">D / →</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-black/30">
                      <span className="text-slate-300">{km ? "កាច់កន្ទុយឆ្វេង/ស្ដាំ" : "Yaw Rudder"}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold text-amber-300">Q / E</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-black/30">
                      <span className="text-slate-300">{km ? "បង្កើនល្បឿន Boost" : "Afterburner Boost"}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold text-cyan-300">Shift</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-black/30">
                      <span className="text-slate-300">{km ? "ហ្វ្រាំងខ្យល់ Airbrake" : "Airbrake / Brakes"}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold text-cyan-300">Ctrl</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-black/30">
                      <span className="text-slate-300">{km ? "បាញ់មីស៊ីល" : "Fire Missile"}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold text-red-300">Space / J</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-black/30">
                      <span className="text-slate-300">{km ? "ផ្ទុកគ្រាប់មីស៊ីល" : "Reload Missiles (8/8)"}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold text-amber-300">R</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-black/30">
                      <span className="text-slate-300">{km ? "ចុះចត / ចុះពីយន្តហោះ" : "Land / Exit Jet"}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold text-rose-300">F</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-black/30">
                      <span className="text-slate-300">{km ? "ចាក់សោរគោលដៅ" : "Cycle Target"}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold text-white">Tab</kbd>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-black/30">
                      <span className="text-slate-300">{km ? "ប្ដូរមុំកាមេរ៉ា" : "Camera View Mode"}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold text-white">C</kbd>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/70 border border-white/10">
                  <div className="text-xs font-bold text-amber-300 uppercase mb-2 flex items-center gap-1.5">
                    <span>📱</span>
                    <span>{km ? "ការបញ្ជាលើទូរស័ព្ទ / Tablet (Mobile Touch)" : "Mobile Touchscreen Controls"}</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    <li>• <strong>Virtual Joystick (ឆ្វេង)</strong>: អូសឡើងលើ/ចុះក្រោមដើម្បី Pitch និងឆ្វេង/ស្ដាំដើម្បី Roll បត់</li>
                    <li>• <strong>Throttle Bar (ស្ដាំ)</strong>: អូសរបារដើម្បីកំណត់កម្រិតកម្លាំងម៉ាស៊ីន (0% - 100%)</li>
                    <li>• <strong>Boost 🔥 (សង្កត់)</strong>: បើក Afterburner បង្កើនល្បឿនអតិបរិមា</li>
                    <li>• <strong>Brake 🛑 (សង្កត់)</strong>: បើកហ្វ្រាំងខ្យល់ដើម្បីបត់មុតស្រួច ឬចុះចត</li>
                    <li>• <strong>Rocket 🚀 (ចុច)</strong>: បាញ់គ្រាប់មីស៊ីលតម្រង់គោលដៅ</li>
                    <li>• <strong>Camera 🎥 (ចុច)</strong>: ប្ដូររវាង Chase View, Cockpit View និង Close View</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
