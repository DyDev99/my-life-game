"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  useGameStore,
  formatTimeHour,
} from "@/state/gameStore";
import type { LocationKey } from "@/data/locations";
import { translations } from "@/i18n/translations";
import { useIsMobileMode } from "@/ui/hud/useIsMobileMode";
import {
  Volume2,
  VolumeX,
  Languages,
  Smartphone,
  BookOpen,
  Users,
  Compass,
  Moon,
  Sun,
  Home,
  GraduationCap,
  Store,
  Coffee,
  Sparkles,
  Camera,
  DoorOpen,
  LogOut,
  Megaphone,
  User,
  Building2,
  BedDouble,
  Bell,
  Menu,
} from "lucide-react";

export function HUD() {
  const stats = useGameStore((state) => state.stats);
  const day = useGameStore((state) => state.day);
  const timeHour = useGameStore((state) => state.timeHour);
  const language = useGameStore((state) => state.language);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const setLanguage = useGameStore((state) => state.setLanguage);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const openModal = useGameStore((state) => state.openModal);
  const moveToLocation = useGameStore((state) => state.moveToLocation);
  const enterLocation = useGameStore((state) => state.enterLocation);
  const sleepAndEndDay = useGameStore((state) => state.sleepAndEndDay);

  const player = useGameStore((state) => state.player);
  const movementState = useGameStore((state) => state.movementState);
  const currentSpeed = useGameStore((state) => state.currentSpeed);

  const ridingVehicle = useGameStore((state) => state.ridingVehicle);
  const vehicleSpeed = useGameStore((state) => state.vehicleSpeed);
  const nearVehicle = useGameStore((state) => state.nearVehicle);
  const planeAltitude = useGameStore((state) => state.planeAltitude);
  const isAfterburnerActive = useGameStore((state) => state.isAfterburnerActive);
  const missileAmmo = useGameStore((state) => state.missileAmmo);
  const maxMissileAmmo = useGameStore((state) => state.maxMissileAmmo);
  const triggerFireMissile = useGameStore((state) => state.triggerFireMissile);
  const replenishMissiles = useGameStore((state) => state.replenishMissiles);
  const damagedBuildings = useGameStore((state) => state.damagedBuildings);
  const lockedTarget = useGameStore((state) => state.lockedTarget);
  const targetingMode = useGameStore((state) => state.targetingMode);
  const cycleNextTarget = useGameStore((state) => state.cycleNextTarget);
  const clearLockedTarget = useGameStore((state) => state.clearLockedTarget);
  const toggleTargetingMode = useGameStore((state) => state.toggleTargetingMode);
  const nearLocation = useGameStore((state) => state.nearLocation);
  const mountVehicle = useGameStore((state) => state.mountVehicle);
  const dismountVehicle = useGameStore((state) => state.dismountVehicle);
  const cameraMode = useGameStore((state) => state.cameraMode);
  const toggleCameraMode = useGameStore((state) => state.toggleCameraMode);
  const isPlayerHomeDoorOpen = useGameStore((state) => state.isPlayerHomeDoorOpen);
  const togglePlayerHomeDoor = useGameStore((state) => state.togglePlayerHomeDoor);
  const ringVehicleHornOrBell = useGameStore((state) => state.ringVehicleHornOrBell);
  const targetPos = useGameStore((state) => state.targetPos);
  const goalsScored = useGameStore((state) => state.goalsScored);
  const volleyballRallies = useGameStore((state) => state.volleyballRallies);

  const distToHomeDoor = Math.hypot(targetPos[0] - (-14), targetPos[2] - (-16.6));
  const distToHomeBed = Math.hypot(targetPos[0] - (-16.2), targetPos[2] - (-21.4));
  const distToFootball = Math.hypot(targetPos[0] - (-26), targetPos[2] - 95);
  const distToVolleyball = Math.hypot(targetPos[0] - 26, targetPos[2] - 92);
  const distToLockerRoom = Math.hypot(targetPos[0] - 6, targetPos[2] - 78);
  const distToCoconut = Math.hypot(targetPos[0] - 24.5, targetPos[2] - 80.5);

  const isNearHomeDoor = !ridingVehicle && distToHomeDoor < 3.8;
  const isNearHomeBed = !ridingVehicle && distToHomeBed < 2.5;
  const isNearFootball = !ridingVehicle && distToFootball < 2.8;
  const isNearVolleyball = !ridingVehicle && distToVolleyball < 2.8;
  const isNearLockerRoom = !ridingVehicle && distToLockerRoom < 4.2;
  const isNearCoconut = !ridingVehicle && distToCoconut < 3.2;

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  // Phones get a GTA/PUBG-style HUD: minimap + vitals top-left (Minimap), money/time and
  // the menu top-right, thumbs free for the joystick and combat buttons. Everything
  // else (phone, family, journal, vehicles, settings) lives in the pause menu.
  const isMobile = useIsMobileMode();
  const setPauseScreen = useGameStore((state) => state.setPauseScreen);
  const statCard = "bg-slate-900/80 backdrop-blur-md border border-white/15 p-2 rounded-xl shadow-lg flex flex-col gap-1";

  const t = translations[language];
  const timeStr = formatTimeHour(timeHour);
  const isNight = timeHour >= 21.0;

  const locations: Array<{ key: LocationKey; nameEn: string; nameKm: string; icon: React.ReactNode }> = [
    { key: "home", nameEn: "Home", nameKm: "ផ្ទះ", icon: <Home className="w-4 h-4" /> },
    { key: "school", nameEn: "School", nameKm: "សាលា", icon: <GraduationCap className="w-4 h-4" /> },
    { key: "market", nameEn: "Market", nameKm: "ផ្សារ", icon: <Store className="w-4 h-4" /> },
    { key: "cafe", nameEn: "Riverside Cafe", nameKm: "តូបកាហ្វេ", icon: <Coffee className="w-4 h-4" /> },
    { key: "pagoda", nameEn: "Pagoda", nameKm: "វត្តអារាម", icon: <Sparkles className="w-4 h-4" /> },
    { key: "hotel", nameEn: "Grand Hotel", nameKm: "សណ្ឋាគារហ្គ្រេន", icon: <Building2 className="w-4 h-4" /> },
    { key: "stadium", nameEn: "Football Stadium", nameKm: "ពហុកីឡដ្ឋាន", icon: <span>⚽</span> },
    { key: "volleyball", nameEn: "Volleyball Court", nameKm: "តារាងបាល់ទះ", icon: <span>🏐</span> },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden z-20">
      {/* Top Header Bar */}
      {isMobile ? (
        <div className="ml-auto flex items-start gap-2 pointer-events-auto">
          <div className="flex flex-col items-end leading-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
            <span className="text-xl font-black text-emerald-400">${stats.money}</span>
            <span className="text-[11px] font-bold text-white whitespace-nowrap">
              {t.day} {day} · {timeStr}
            </span>
          </div>
          <button
            onClick={isNight ? sleepAndEndDay : () => openModal("decision")}
            aria-label={isNight ? "Sleep" : t.chooseDay}
            className="grid place-items-center w-10 h-10 rounded-full bg-black/35 backdrop-blur-sm border border-white/30 text-amber-300 active:scale-90"
          >
            {isNight ? <Moon className="w-5 h-5 text-indigo-200" /> : <Sun className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setPauseScreen("menu")}
            aria-label="Menu"
            className="grid place-items-center w-10 h-10 rounded-full bg-black/35 backdrop-blur-sm border border-white/30 text-white active:scale-90"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      ) : (
      <div className="flex flex-col w-full pointer-events-auto gap-2.5 max-w-xl mx-auto">
        <div className="flex items-center justify-between gap-2 bg-slate-900/80 backdrop-blur-md border border-white/20 shadow-xl text-white p-2.5 sm:px-4 rounded-2xl">
          {/* Day & Time */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/40 px-2.5 py-1 rounded-xl text-amber-300 font-bold text-xs sm:text-sm whitespace-nowrap">
              {isNight ? <Moon className="w-3.5 h-3.5 text-indigo-300 animate-pulse" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span>
                {t.day} {day}
              </span>
            </div>
            <div className="text-xs sm:text-sm font-semibold tracking-wide text-slate-200 whitespace-nowrap">
              {timeStr}
            </div>
          </div>

          {/* Money Counter */}
          <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 rounded-xl text-emerald-300 font-extrabold text-sm sm:text-base">
            <span className="text-emerald-400">$</span>
            <span>{stats.money}</span>
          </div>

          {/* Controls: Character Switch, Camera Mode, Audio & Language */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => openModal("character_select")}
              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow"
              title="Switch Character [C]"
            >
              <User className="w-3.5 h-3.5" />
              <span>{player.name.split(" ")[0]}</span>
              <span className="hidden sm:inline text-[10px] text-amber-400/80 font-mono">[C]</span>
            </button>
            <button
              onClick={toggleCameraMode}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                cameraMode === "chase"
                  ? "bg-amber-500/30 border-amber-400 text-amber-300"
                  : "bg-white/10 border-white/15 text-slate-300"
              }`}
              title="Toggle Camera View (Chase / Isometric)"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{cameraMode === "chase" ? "3rd Person" : "Top View"}</span>
            </button>
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
              title="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              onClick={() => setLanguage(language === "en" ? "km" : "en")}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-sky-400" />
              <span>{language === "km" ? "EN" : "ខ្មែរ"}</span>
            </button>
          </div>
        </div>

        {/* Compact Stat Cards Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
          {/* Energy */}
          <div className={statCard}>
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1 text-amber-400">⚡ {t.energy}</span>
              <span>{stats.energy}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, stats.energy))}%` }}
              />
            </div>
          </div>

          {/* Health */}
          <div className={statCard}>
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1 text-rose-400">❤️ {t.health}</span>
              <span>{stats.health}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-red-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, stats.health))}%` }}
              />
            </div>
          </div>

          {/* Happiness */}
          <div className={statCard}>
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1 text-yellow-300">😊 {t.happiness}</span>
              <span>{stats.happiness}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, stats.happiness))}%` }}
              />
            </div>
          </div>

          {/* Stress */}
          <div className={statCard}>
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1 text-purple-400">😰 {t.stress}</span>
              <span>{stats.stress}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, stats.stress))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      )}

      {/* CENTER FLOATING PROMPTS (NEAR VEHICLE OR NEAR BUILDING) */}
      <div className={`self-center flex flex-col items-center gap-2 pointer-events-auto ${isMobile ? "scale-90" : ""}`}>
        {/* Near Vehicle Prompt */}
        {!ridingVehicle && nearVehicle && (
          <motion.button
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => mountVehicle(nearVehicle)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl ${
              nearVehicle === "plane"
                ? "bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-500 border border-cyan-300 shadow-cyan-500/50"
                : nearVehicle === "supercar"
                ? "bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 border border-yellow-300 shadow-rose-600/50"
                : "bg-gradient-to-r from-rose-600 to-amber-600 border border-white/30"
            } text-white font-black text-sm shadow-2xl cursor-pointer animate-pulse`}
          >
            <span className="text-xl">
              {nearVehicle === "plane" ? "✈️" : nearVehicle === "supercar" ? "🏎️" : nearVehicle === "motorbike" ? "🏍️" : "🚲"}
            </span>
            <span>
              {nearVehicle === "plane"
                ? language === "km"
                  ? "ចុច [F] ដើម្បីឡើងជិះយន្តហោះចម្បាំង Steel Hawk"
                  : "Press [F] or Tap to Board Steel Hawk Fighter Jet"
                : nearVehicle === "supercar"
                ? language === "km"
                  ? "ចុច [F] ឬ [E] ដើម្បីបើកបរ Supercar"
                  : "Press [F] or [E] to Enter Supercar"
                : language === "km"
                ? `ចុច [F] ដើម្បីជិះ${nearVehicle === "motorbike" ? "ម៉ូតូ" : "កង់"}`
                : `Press [F] or Tap to Ride ${nearVehicle === "motorbike" ? "Motorbike" : "Bicycle"}`}
            </span>
          </motion.button>
        )}

        {/* Near House Front Door Prompt (Open / Close Door) */}
        {isNearHomeDoor && (
          <motion.button
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => togglePlayerHomeDoor()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-800 text-white font-black text-sm shadow-2xl border border-amber-400/50 cursor-pointer animate-pulse"
          >
            <DoorOpen className="w-5 h-5 text-amber-200" />
            <span>
              {language === "km"
                ? isPlayerHomeDoorOpen
                  ? "ចុច [E] ដើម្បីបិទទ្វារផ្ទះ"
                  : "ចុច [E] ដើម្បីបើកទ្វារផ្ទះ & ចូលក្នុង"
                : isPlayerHomeDoorOpen
                ? "Press [E] or Tap to Close House Door"
                : "Press [E] or Tap to Open Door & Enter House"}
            </span>
          </motion.button>
        )}

        {/* Near House Bed Interior Prompt */}
        {isNearHomeBed && (
          <motion.button
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => enterLocation("home")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-700 to-purple-800 text-white font-black text-sm shadow-2xl border border-indigo-400/50 cursor-pointer"
          >
            <BedDouble className="w-5 h-5 text-indigo-200" />
            <span>
              {language === "km"
                ? "ចុច [E] ដើម្បីសម្រាក ឬ ចូលគេង"
                : "Press [E] to Rest or Sleep in Bed"}
            </span>
          </motion.button>
        )}

        {/* Near Football Ball Prompt */}
        {isNearFootball && (
          <motion.div
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 text-white font-black text-sm shadow-2xl border border-emerald-400/50 animate-bounce"
          >
            <span className="text-lg">⚽</span>
            <span>
              {language === "km"
                ? "ចុច [E] ឬ [Space] ដើម្បីទាត់បាល់ទាត់!"
                : "Press [E] or [Space] to Kick Football!"}
            </span>
          </motion.div>
        )}

        {/* Near Volleyball Prompt */}
        {isNearVolleyball && (
          <motion.div
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-amber-600 text-white font-black text-sm shadow-2xl border border-amber-400/50 animate-bounce"
          >
            <span className="text-lg">🏐</span>
            <span>
              {language === "km"
                ? "ចុច [E] ឬ [Space] ដើម្បីប៉ះសីបាល់ទះ!"
                : "Press [E] or [Space] to Spike Volleyball!"}
            </span>
          </motion.div>
        )}

        {/* Near Sports Locker Room Prompt */}
        {isNearLockerRoom && (
          <motion.button
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => useGameStore.getState().openModal("locker_room")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-black text-sm shadow-2xl border border-blue-400/50 cursor-pointer animate-pulse"
          >
            <span className="text-lg">👕</span>
            <span>
              {language === "km"
                ? "ចុច [E] ដើម្បីចូលបន្ទប់ផ្លាស់សម្លៀកបំពាក់កីឡា"
                : "Press [E] to Enter Player Locker Room"}
            </span>
          </motion.button>
        )}

        {/* Near Coconut Drink Stall Prompt */}
        {isNearCoconut && (
          <motion.button
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => useGameStore.getState().drinkCoconutWater()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-lime-600 to-emerald-700 text-white font-black text-sm shadow-2xl border border-lime-300/50 cursor-pointer"
          >
            <span className="text-lg">🥥</span>
            <span>
              {language === "km"
                ? "ចុច [E] ញ៉ាំទឹកដូងក្រអូប ($1.50) +20 Energy"
                : "Press [E] Drink Fresh Coconut ($1.50) +20 Energy"}
            </span>
          </motion.button>
        )}

        {/* Near Landmark Prompt (Enter Hotel, Cafe, Pagoda, School, Market, Home) */}
        {!ridingVehicle && !isNearHomeDoor && !isNearHomeBed && !isNearFootball && !isNearVolleyball && !isNearLockerRoom && !isNearCoconut && nearLocation && (
          <motion.button
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => enterLocation(nearLocation)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-sm shadow-2xl border border-white/30 cursor-pointer"
          >
            <DoorOpen className="w-5 h-5 text-yellow-200" />
            <span>
              {language === "km"
                ? `ចុច [E] ដើម្បី${
                    nearLocation === "stadium"
                      ? "លេងបាល់ទាត់នៅពហុកីឡដ្ឋាន ⚽"
                      : nearLocation === "volleyball"
                      ? "លេងបាល់ទះនៅតារាង 🏐"
                      : nearLocation === "hotel"
                      ? "ចូលសណ្ឋាគារហ្គ្រេន"
                      : nearLocation === "cafe"
                      ? "ចូលតូបកាហ្វេ"
                      : nearLocation === "pagoda"
                      ? "ចូលវត្តអារាម"
                      : nearLocation === "school"
                      ? "ចូលសាលារៀន"
                      : nearLocation === "market"
                      ? "ចូលផ្សារ"
                      : "ចូលផ្ទះ"
                  }`
                : `Press [E] to ${
                    nearLocation === "stadium"
                      ? "Play Football at Stadium ⚽"
                      : nearLocation === "volleyball"
                      ? "Play Volleyball on Court 🏐"
                      : nearLocation === "hotel"
                      ? "Enter Grand Hotel"
                      : nearLocation === "cafe"
                      ? "Enter Cafe"
                      : nearLocation === "pagoda"
                      ? "Enter Pagoda"
                      : nearLocation === "school"
                      ? "Enter School"
                      : nearLocation === "market"
                      ? "Enter Market"
                      : "Enter Home"
                  }`}
            </span>
          </motion.button>
        )}

        {/* Live Sports Match Pill when in Sports City or after scoring */}
        {((targetPos[2] > 48 && targetPos[2] < 136 && targetPos[0] > -60 && targetPos[0] < 66) || goalsScored > 0 || volleyballRallies > 0) && (
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-amber-400/40 text-xs font-bold text-white shadow-xl pointer-events-auto">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
              ⚽ Goals: <span className="text-white font-black text-sm">{goalsScored}</span>
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1.5 text-amber-400 font-mono">
              🏐 Rallies: <span className="text-white font-black text-sm">{volleyballRallies}</span>
            </span>
          </div>
        )}

        {/* Damaged Targets / Building Destruction Combat Pill */}
        {Object.keys(damagedBuildings).length > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-rose-950/90 backdrop-blur-md border border-rose-500/60 text-xs font-bold text-white shadow-xl pointer-events-auto">
            <span className="text-sm">🎯</span>
            <span className="text-rose-200">
              {language === "km" ? "អគាររងការខូចខាត:" : "Targets Damaged:"}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono font-black text-xs border border-rose-400/50">
              {Object.keys(damagedBuildings).length}
            </span>
            <button
              onClick={() => useGameStore.getState().repairAllBuildings()}
              className="ml-2 px-2.5 py-1 rounded-xl bg-amber-500/30 hover:bg-amber-500/50 border border-amber-400/60 text-amber-200 text-[11px] font-black cursor-pointer transition-all flex items-center gap-1"
              title="Reconstruct all damaged buildings [K]"
            >
              <span>🛠️</span>
              <span>{language === "km" ? "ជួសជុលទីក្រុង [K]" : "Repair City [K]"}</span>
            </button>
          </div>
        )}

        {/* Tactical Target Focus HUD Card */}
        {lockedTarget && (
          <motion.div
            initial={{ scale: 0.9, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-rose-500/80 shadow-2xl shadow-rose-950/90 pointer-events-auto min-w-[280px] sm:min-w-[320px] max-w-sm"
          >
            {/* Header: Target Name & Lock Badge */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>
                <span className="text-xs sm:text-sm font-black text-white tracking-wide truncate max-w-[170px]">
                  {lockedTarget.name}
                </span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-600/30 border border-rose-400/60 text-rose-300 font-mono text-[10px] sm:text-[11px] font-black">
                <span>🔒 {language === "km" ? "ចាក់សោរ" : "LOCKED"}</span>
              </div>
            </div>

            {/* Range & Destruction Statistics */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10">
              <span className="text-amber-400 font-bold">
                RANGE: {Math.round(Math.hypot(targetPos[0] - lockedTarget.position[0], targetPos[2] - lockedTarget.position[2]))}m
              </span>
              <span className="text-rose-400 font-bold">
                HITS: {damagedBuildings[lockedTarget.id]?.hits || 0}
              </span>
            </div>

            {/* Quick Tactical Action Buttons */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <button
                onClick={() => triggerFireMissile()}
                disabled={missileAmmo <= 0}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all ${
                  missileAmmo > 0
                    ? "bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white border border-amber-300/80 animate-pulse"
                    : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                }`}
                title="Launch Guided Homing Missile at Target [J] or [Enter]"
              >
                <span>🚀</span>
                <span>{language === "km" ? "បាញ់ប្រហារ [J]" : "STRIKE [J]"}</span>
              </button>

              <button
                onClick={() => cycleNextTarget()}
                className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Cycle to Next Target [Tab]"
              >
                <span>🎯 Next [Tab]</span>
              </button>

              <button
                onClick={() => clearLockedTarget()}
                className="p-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all cursor-pointer"
                title="Unlock Target [X]"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Quick Location Fly-to Menu (if toggled) */}
      {showLocationPicker && (
        <div className="pointer-events-auto self-center bg-slate-900/90 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-2xl flex flex-wrap gap-2 max-w-sm justify-center mb-2 animate-in fade-in zoom-in-95 duration-200">
          {locations.map((loc) => (
            <button
              key={loc.key}
              onClick={() => {
                moveToLocation(loc.key);
                setShowLocationPicker(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-white text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              {loc.icon}
              <span>{language === "km" ? loc.nameKm : loc.nameEn}</span>
            </button>
          ))}
        </div>
      )}

      {/* Bottom Main Action Bar */}
      <div className={`flex flex-col items-center w-full pointer-events-auto ${isMobile ? "gap-1.5 max-w-[19rem] mx-auto pb-0.5" : "gap-2 sm:gap-3 max-w-md mx-auto pb-1 sm:pb-3"}`}>
        {/* VEHICLE & FLIGHT DASHBOARD */}
        {ridingVehicle ? (
          <div className="w-full p-3 rounded-3xl bg-slate-900/90 backdrop-blur-md border border-amber-400/50 shadow-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              {/* Flight / Drive Instruments */}
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">
                  {ridingVehicle === "plane" ? "✈️" : ridingVehicle === "supercar" ? "🏎️" : ridingVehicle === "motorbike" ? "🏍️" : "🚲"}
                </span>
                <div>
                  <div className="flex items-center gap-3">
                    <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                      {vehicleSpeed} <span className="text-xs text-slate-400 font-sans font-normal">km/h</span>
                    </div>
                    {ridingVehicle === "plane" && (
                      <div className="text-sm font-bold text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/40">
                        ALT: {Math.round(planeAltitude)} m
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider">
                    {ridingVehicle === "plane"
                      ? isAfterburnerActive
                        ? "🔥 Afterburner Boost Active"
                        : "Steel Hawk Combat Flight"
                      : ridingVehicle === "supercar"
                      ? "Supercar Sport Drive"
                      : ridingVehicle === "motorbike"
                      ? "Motorbike Riding"
                      : "Bicycle Riding"}
                  </div>
                </div>
              </div>

              {/* Vehicle Actions: Horn, Target Focus, Missile Fire & Dismount */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {ridingVehicle === "plane" && (
                  <>
                    <button
                      onClick={() => cycleNextTarget()}
                      className={`px-2.5 py-1.5 rounded-xl font-bold text-xs border flex items-center gap-1 cursor-pointer transition-all ${
                        lockedTarget
                          ? "bg-rose-600/30 border-rose-400 text-rose-300 shadow-sm"
                          : "bg-white/10 hover:bg-white/20 border-white/20 text-slate-300"
                      }`}
                      title="Cycle / Lock Attack Target [Tab]"
                    >
                      <span>🎯</span>
                      <span className="hidden sm:inline">{lockedTarget ? "Next [Tab]" : "Target [Tab]"}</span>
                    </button>
                    <button
                      onClick={() => triggerFireMissile()}
                      disabled={missileAmmo <= 0}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs border flex items-center gap-1.5 cursor-pointer shadow-lg transition-all ${
                        missileAmmo > 0
                          ? "bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white border-amber-300 shadow-rose-600/50 animate-pulse"
                          : "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60"
                      }`}
                      title={lockedTarget ? "Fire Guided Homing Missile [J]" : "Fire Air-to-Ground Missile [J]"}
                    >
                      <span className="text-sm">🚀</span>
                      <span>{language === "km" ? "បាញ់មីស៊ីល" : lockedTarget ? "Fire Guided" : "Fire Missile"}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-[10px] font-mono border border-white/20">
                        {missileAmmo}/{maxMissileAmmo}
                      </span>
                    </button>
                    {missileAmmo === 0 && (
                      <button
                        onClick={() => {
                          replenishMissiles();
                          useGameStore.getState().addStatPop(
                            language === "km" ? "ផ្ទុកគ្រាប់មីស៊ីលពេញវិញ (8/8) 🚀" : "Missiles Reloaded (8/8) 🚀",
                            "skill"
                          );
                        }}
                        className="px-2 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/50 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                        title="Reload Missiles [R]"
                      >
                        🔄 Reload
                      </button>
                    )}
                  </>
                )}
                {ridingVehicle !== "plane" && (
                  <button
                    onClick={ringVehicleHornOrBell}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-bold text-xs border border-amber-400/40 flex items-center gap-1 cursor-pointer"
                  >
                    {ridingVehicle === "bicycle" ? <Bell className="w-3.5 h-3.5" /> : <Megaphone className="w-3.5 h-3.5" />}
                    <span>{ridingVehicle === "bicycle" ? (language === "km" ? "កណ្ដឹង [B]" : "Bell [B]") : (language === "km" ? "ស៊ីផ្លេ [H]" : "Horn [H]")}</span>
                  </button>
                )}
                <button
                  onClick={() => useGameStore.getState().recoverVehicle()}
                  className="px-3 py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 text-sky-200 font-bold text-xs border border-sky-400/40 flex items-center gap-1 cursor-pointer"
                  title="Reset vehicle safely to nearest road [U]"
                >
                  <span>🔄</span>
                  <span>{language === "km" ? "សង្គ្រោះ [U]" : "Recover [U]"}</span>
                </button>
                <button
                  onClick={dismountVehicle}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-bold text-xs border border-rose-500/40 flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{ridingVehicle === "plane" ? (language === "km" ? "ចុះចត [F]" : "Land / Exit [F]") : "Exit [F]"}</span>
                </button>
              </div>
            </div>

            {/* Driving / Flying Keys Tip (desktop) */}
            <div className={`text-[10px] text-slate-300 text-center font-medium bg-black/30 py-1 rounded-lg ${isMobile ? "hidden" : ""}`}>
              {ridingVehicle === "plane" ? (
                <>
                  <kbd className="px-1 rounded bg-white/10 text-white">Tab</kbd> Target •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">J/Enter</kbd> Guided Missile •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">X</kbd> Unlock •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">R</kbd> Reload •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">W/S</kbd> Speed •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">Space</kbd> Climb •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">Q/C</kbd> Dive •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">A/D</kbd> Bank •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">Shift</kbd> Boost •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">F</kbd> Land
                </>
              ) : (
                <>
                  <kbd className="px-1 rounded bg-white/10 text-white">W</kbd> Gas •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">S</kbd> Brake •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">Space</kbd>{" "}
                  {ridingVehicle === "supercar" ? "Drift Skid" : "Brake"} •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">A/D</kbd> Steer •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">{ridingVehicle === "bicycle" ? "B" : "H"}</kbd>{" "}
                  {ridingVehicle === "bicycle" ? "Bell" : "Horn"} •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">U</kbd> Recover •{" "}
                  <kbd className="px-1 rounded bg-white/10 text-white">F/E</kbd> Exit
                </>
              )}
            </div>
          </div>
        ) : isMobile ? null : (
          <>
            {/* Quick Vehicle Ride Bar (Always Accessible) */}
            <div className="flex items-center gap-1.5 w-full justify-center">
              <button
                onClick={() => mountVehicle("plane")}
                className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 border border-cyan-300/50 text-xs font-bold text-white flex items-center justify-center gap-1 shadow-md cursor-pointer transition-all"
              >
                <span>✈️</span>
                <span>{language === "km" ? "យន្តហោះ" : "Fighter Jet"}</span>
              </button>
              <button
                onClick={() => mountVehicle("supercar")}
                className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-rose-700/80 to-amber-600/80 hover:from-rose-600 hover:to-amber-500 border border-yellow-400/40 text-xs font-bold text-white flex items-center justify-center gap-1 shadow-md cursor-pointer transition-all"
              >
                <span>🏎️</span>
                <span>Supercar</span>
              </button>
              <button
                onClick={() => mountVehicle("motorbike")}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900/80 hover:bg-rose-600/80 border border-white/20 text-xs font-bold text-white flex items-center justify-center gap-1 shadow-md cursor-pointer transition-all"
              >
                <span>🏍️</span>
                <span>{language === "km" ? "ម៉ូតូ" : "Motorbike"}</span>
              </button>
              <button
                onClick={() => mountVehicle("bicycle")}
                className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900/80 hover:bg-sky-600/80 border border-white/20 text-xs font-bold text-white flex items-center justify-center gap-1 shadow-md cursor-pointer transition-all"
              >
                <span>🚲</span>
                <span>{language === "km" ? "កង់" : "Bicycle"}</span>
              </button>
              <button
                onClick={() => cycleNextTarget()}
                className={`py-1.5 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer ${
                  lockedTarget
                    ? "bg-rose-600/40 border-rose-400 text-rose-200"
                    : "bg-slate-900/80 hover:bg-rose-950/60 border-white/20 text-slate-200"
                }`}
                title="Lock on target to attack [Tab]"
              >
                <span>🎯</span>
                <span>{lockedTarget ? (language === "km" ? "ដូរគោលដៅ" : "Target") : (language === "km" ? "ចាក់សោរ" : "Lock")}</span>
              </button>
            </div>

            {/* Desktop Keyboard Controls & Locomotion Status Pill */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 py-1 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-slate-300 shadow-md w-full">
              <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
                <span className="text-amber-400 font-bold">⌨️</span>
                <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">W</kbd><kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">A</kbd><kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">S</kbd><kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">D</kbd> Move</span>
                <span>•</span>
                <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Shift</kbd> Run</span>
                <span>•</span>
                <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Tab</kbd> Target</span>
                <span>•</span>
                <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">J</kbd> Strike</span>
                <span>•</span>
                <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">C</kbd> Switch</span>
                <span>•</span>
                <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">F</kbd> Ride</span>
                <span>•</span>
                <span><kbd className="px-1 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">E</kbd> Enter</span>
              </div>
              {/* Live Character Status Pill */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono w-full sm:w-auto justify-center sm:justify-end">
                <span className={`px-2 py-0.5 rounded-full font-bold ${
                  movementState === "sprinting"
                    ? "bg-amber-500/30 text-amber-300 border border-amber-400/50 animate-pulse"
                    : movementState === "running"
                    ? "bg-sky-500/30 text-sky-300 border border-sky-400/50"
                    : movementState === "walking"
                    ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/50"
                    : "bg-white/10 text-slate-300"
                }`}>
                  {movementState.toUpperCase()}
                </span>
                <span>{Math.round(currentSpeed * 10) / 10} m/s</span>
              </div>
            </div>

            {/* Primary Action Button: "Choose Your Day" or "Go to Sleep" */}
            {isNight ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={sleepAndEndDay}
                className="w-full py-3 sm:py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-600/40 border border-indigo-400/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Moon className="w-5 h-5 text-indigo-200 animate-pulse" />
                <span>{language === "km" ? "ចូលគេង & បញ្ចប់ថ្ងៃ (Sleep)" : "Go to Sleep & End Day"}</span>
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openModal("decision")}
                className="w-full py-3 sm:py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-orange-500/30 border border-amber-300/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sun className="w-5 h-5 text-yellow-200 animate-spin-slow" />
                <span>{t.chooseDay}</span>
                <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full font-normal">
                  {timeHour < 12 ? "Morning" : timeHour < 17 ? "Afternoon" : "Evening"}
                </span>
              </motion.button>
            )}
          </>
        )}

        {/* Secondary Utility Dock: Phone, Family, Journal, Map (desktop; phones use the action row) */}
        {!isMobile && (
        <div className="flex items-center justify-around w-full bg-slate-900/85 backdrop-blur-md border border-white/20 p-2 rounded-2xl shadow-xl">
          {/* Phone App */}
          <button
            onClick={() => openModal("phone")}
            className="flex flex-col items-center gap-1 px-3 py-1 text-slate-300 hover:text-white transition-all cursor-pointer group"
          >
            <div className="relative p-2 rounded-xl bg-white/10 group-hover:bg-sky-500 group-hover:text-white transition-all">
              <Smartphone className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <span className="text-[10px] font-bold">{t.phone}</span>
          </button>

          {/* Family & Relationships */}
          <button
            onClick={() => openModal("relationship")}
            className="flex flex-col items-center gap-1 px-3 py-1 text-slate-300 hover:text-white transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-white/10 group-hover:bg-rose-500 group-hover:text-white transition-all">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold">{t.appFamily}</span>
          </button>

          {/* Life Journal */}
          <button
            onClick={() => openModal("journal")}
            className="flex flex-col items-center gap-1 px-3 py-1 text-slate-300 hover:text-white transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-white/10 group-hover:bg-amber-500 group-hover:text-white transition-all">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold">{t.appJournal}</span>
          </button>

          {/* Map & Locations Quick Jump */}
          <button
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className={`flex flex-col items-center gap-1 px-3 py-1 text-slate-300 hover:text-white transition-all cursor-pointer group ${
              showLocationPicker ? "text-amber-400" : ""
            }`}
          >
            <div className="p-2 rounded-xl bg-white/10 group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold">Map</span>
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
