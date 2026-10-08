"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/state/gameStore";
import { translations } from "@/i18n/translations";
import { Moon, Sun, ArrowRight, DollarSign, Zap, Smile, BookOpen } from "lucide-react";

export function DailySummaryModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const language = useGameStore((state) => state.language);
  const player = useGameStore((state) => state.player);
  const day = useGameStore((state) => state.day);
  const lastDaySummary = useGameStore((state) => state.lastDaySummary);
  const startNextDay = useGameStore((state) => state.startNextDay);

  const t = translations[language];

  if (activeModal !== "summary") return null;

  const earned = lastDaySummary?.earned || 0;
  const spent = lastDaySummary?.spent || 0;
  const energyDelta = lastDaySummary?.energyDelta || 0;
  const happinessDelta = lastDaySummary?.happinessDelta || 0;
  const skillDelta = lastDaySummary?.skillDelta || 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-lg bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden text-center"
        >
          {/* Subtle decorative stars */}
          <div className="absolute top-6 left-8 text-indigo-300/40 text-lg animate-pulse">✦</div>
          <div className="absolute top-12 right-12 text-indigo-300/30 text-sm animate-pulse delay-200">✧</div>
          <div className="absolute bottom-16 left-10 text-indigo-300/30 text-base animate-pulse delay-500">✦</div>

          {/* Moon Icon */}
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 mx-auto mb-3 shadow-lg shadow-indigo-500/20">
            <Moon className="w-8 h-8 animate-pulse" />
          </div>

          {/* Header */}
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold mb-2">
            {t.dayComplete.replace("{day}", day.toString())}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-300 mb-1">
            {t.goodNight.replace("{name}", player.name)}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mb-6">
            {language === "km" ? lastDaySummary?.highlightKm : lastDaySummary?.highlightEn}
          </p>

          {/* Stat Changes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 text-left">
            {/* Money */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                {t.money}
              </span>
              <span className="text-sm font-black text-emerald-400">
                {earned > 0 ? `+$${earned}` : "$0"}
                {spent > 0 && <span className="text-xs text-rose-400 font-normal ml-1">(-${spent})</span>}
              </span>
            </div>

            {/* Energy */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold">
                <Zap className="w-3 h-3 text-amber-400" />
                {t.energy}
              </span>
              <span className={`text-sm font-black ${energyDelta >= 0 ? "text-amber-400" : "text-slate-300"}`}>
                {energyDelta > 0 ? `+${energyDelta}` : `${energyDelta}`}
              </span>
            </div>

            {/* Happiness */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold">
                <Smile className="w-3 h-3 text-yellow-300" />
                {t.happiness}
              </span>
              <span className="text-sm font-black text-yellow-300">
                +{happinessDelta}
              </span>
            </div>

            {/* Skill */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex flex-col gap-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold">
                <BookOpen className="w-3 h-3 text-blue-400" />
                {t.skill}
              </span>
              <span className="text-sm font-black text-blue-400">
                +{skillDelta}
              </span>
            </div>
          </div>

          {/* Action Button: Continue to Tomorrow */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startNextDay}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-base shadow-xl shadow-orange-500/30 border border-amber-300/40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sun className="w-5 h-5 text-yellow-200" />
            <span>{t.nextDayBtn}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
