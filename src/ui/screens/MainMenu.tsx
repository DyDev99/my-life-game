"use client";

import React from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/state/gameStore";
import { translations } from "@/i18n/translations";
import { Play, RotateCcw, Languages, Volume2, VolumeX, Sparkles, MapPin } from "lucide-react";

export function MainMenu() {
  const setScreen = useGameStore((state) => state.setScreen);
  const startNewGame = useGameStore((state) => state.startNewGame);
  const player = useGameStore((state) => state.player);
  const language = useGameStore((state) => state.language);
  const soundEnabled = useGameStore((state) => state.soundEnabled);
  const setLanguage = useGameStore((state) => state.setLanguage);
  const toggleSound = useGameStore((state) => state.toggleSound);

  const t = translations[language];

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 sm:p-12 pointer-events-none select-none">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-slate-200 text-xs font-semibold shadow-lg">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.cambodianSetting}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/20 hover:bg-slate-800 text-slate-200 shadow-lg cursor-pointer transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
          <button
            onClick={() => setLanguage(language === "en" ? "km" : "en")}
            className="px-3.5 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/20 hover:bg-slate-800 text-slate-200 font-bold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Languages className="w-4 h-4 text-sky-400" />
            <span>{language === "km" ? "English" : "ភាសាខ្មែរ"}</span>
          </button>
        </div>
      </div>

      {/* Center Branding & Action Buttons */}
      <div className="flex flex-col items-center text-center max-w-md mx-auto pointer-events-auto my-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold shadow-lg mb-3 backdrop-blur-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.tagline}</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
        >
          <span className="block text-amber-400 font-extrabold">{t.gameTitleKm}</span>
          <span className="text-2xl sm:text-3xl text-slate-100 font-bold tracking-widest uppercase">
            {t.gameTitle}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs sm:text-sm text-slate-200/90 max-w-sm mt-3 mb-8 drop-shadow font-medium leading-relaxed"
        >
          {t.subtitle}
        </motion.p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {/* New Life */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setScreen("character_creation")}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-extrabold text-base shadow-xl shadow-orange-500/30 border border-amber-300/40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{t.newLife}</span>
          </motion.button>

          {/* Continue Life */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => startNewGame(player)}
            className="w-full py-3 px-6 rounded-2xl bg-slate-900/85 backdrop-blur-md hover:bg-slate-850 text-slate-100 font-bold text-sm shadow-xl border border-white/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>{t.continueLife} ({player.name})</span>
          </motion.button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="text-center text-[11px] text-slate-300/80 drop-shadow">
        <span>ជីវិតខ្ញុំ • Cambodian Life Simulation • Version 0.1</span>
      </div>
    </div>
  );
}
