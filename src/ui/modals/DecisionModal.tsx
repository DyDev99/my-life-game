"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/state/gameStore";
import { translations } from "@/i18n/translations";
import { X, GraduationCap, Heart, BedDouble, Coffee, ShoppingBag } from "lucide-react";

export function DecisionModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const openModal = useGameStore((state) => state.openModal);
  const language = useGameStore((state) => state.language);
  const player = useGameStore((state) => state.player);
  const performVisitFamily = useGameStore((state) => state.performVisitFamily);
  const performRest = useGameStore((state) => state.performRest);
  const performHobby = useGameStore((state) => state.performHobby);
  const moveToLocation = useGameStore((state) => state.moveToLocation);

  const t = translations[language];

  if (activeModal !== "decision") return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl text-white overflow-hidden relative"
        >
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-5">
            <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
              Kampong Cham
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300">
              {t.morningGreeting.replace("{name}", player.name)}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">{t.decisionPrompt}</p>
          </div>

          {/* Decision Cards List */}
          <div className="flex flex-col gap-3 max-h-[62vh] overflow-y-auto pr-1">
            {/* 1. Work Card (Teacher) */}
            <motion.div
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                moveToLocation("school");
                openModal("work");
              }}
              className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 to-slate-800/60 border border-blue-500/30 hover:border-blue-400/70 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-blue-300 transition-colors">
                    {t.actWorkTitle}
                  </h3>
                  <p className="text-xs text-slate-300">{t.actWorkDesc}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                  +$12
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">+3.5 hrs</span>
              </div>
            </motion.div>

            {/* 2. Family Card (Visit Grandma) */}
            <motion.div
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={performVisitFamily}
              className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-900/40 to-slate-800/60 border border-rose-500/30 hover:border-rose-400/70 hover:shadow-lg hover:shadow-rose-500/10 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-rose-300 transition-colors">
                    {t.actFamilyTitle}
                  </h3>
                  <p className="text-xs text-slate-300">{t.actFamilyDesc}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-xs font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-md">
                  +Happy
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">+2.5 hrs</span>
              </div>
            </motion.div>

            {/* 3. Rest Card (Stay Home Hammock) */}
            <motion.div
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={performRest}
              className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-900/40 to-slate-800/60 border border-amber-500/30 hover:border-amber-400/70 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <BedDouble className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors">
                    {t.actRestTitle}
                  </h3>
                  <p className="text-xs text-slate-300">{t.actRestDesc}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-xs font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md">
                  +Energy
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">+2.0 hrs</span>
              </div>
            </motion.div>

            {/* 4. Hobby Card (Coffee & Music by Mekong) */}
            <motion.div
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={performHobby}
              className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-900/40 to-slate-800/60 border border-emerald-500/30 hover:border-emerald-400/70 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Coffee className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors">
                    {t.actHobbyTitle}
                  </h3>
                  <p className="text-xs text-slate-300">{t.actHobbyDesc}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                  -$3
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">+1.5 hrs</span>
              </div>
            </motion.div>

            {/* 5. Market Card */}
            <motion.div
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                moveToLocation("market");
                performHobby();
              }}
              className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 to-slate-800/60 border border-purple-500/30 hover:border-purple-400/70 hover:shadow-lg hover:shadow-purple-500/10 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-purple-300 transition-colors">
                    {t.actMarketTitle}
                  </h3>
                  <p className="text-xs text-slate-300">{t.actMarketDesc}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-xs font-black text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-md">
                  +Community
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">+1.5 hrs</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
