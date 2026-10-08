"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/state/gameStore";
import { translations } from "@/i18n/translations";
import { X, Sparkles, Heart } from "lucide-react";

export function PagodaModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const language = useGameStore((state) => state.language);
  const performPagodaMerit = useGameStore((state) => state.performPagodaMerit);
  const addStatPop = useGameStore((state) => state.addStatPop);
  const advanceTime = useGameStore((state) => state.advanceTime);

  const t = translations[language];

  if (activeModal !== "pagoda") return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="w-full max-w-lg bg-gradient-to-b from-amber-950/90 via-slate-900 to-slate-950 border border-yellow-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative overflow-hidden"
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 bg-yellow-500/20 border border-yellow-400/30 px-3 py-1 rounded-full w-fit mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "km" ? "វត្តអារាមកំពង់ចាម" : "Wat Kampong Cham"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300">
              {language === "km" ? "វត្តអារាម និងសេចក្តីស្ងប់ក្នុងចិត្ត" : "Peace & Spiritual Tranquility"}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {language === "km"
                ? "ដំបូលក្បឿងពណ៌លឿងទុំ ផ្កាឈូកស្រស់ និងសូរសំឡេងជួងវត្តដ៏ពីរោះរណ្តំ"
                : "Golden tiered pagoda roofs, fragrant lotus blossoms, and quiet peaceful atmosphere."}
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {/* 1. Lotus & Incense Offering */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={performPagodaMerit}
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-900/40 to-slate-800/60 border border-yellow-500/30 hover:border-yellow-400/70 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-2xl">
                  🪷
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {language === "km" ? "ថ្វាយផ្កាឈូក និងអុជធូបបួងសួង" : "Offer Lotus Flowers & Incense"}
                  </h4>
                  <p className="text-xs text-slate-300">+20 Happiness, -25 Stress, +3 Reputation</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-md">
                -$2.00
              </span>
            </motion.div>

            {/* 2. Peaceful Meditation */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                addStatPop("-30 Stress", "stress");
                addStatPop("+15 Energy", "energy");
                advanceTime(1.0);
                closeModal();
              }}
              className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-slate-800/60 border border-indigo-500/30 hover:border-indigo-400/70 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl">
                  🧘
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {language === "km" ? "អង្គុយស្មឹងស្មាធិ៍ក្នុងព្រះវិហារ" : "Silent Meditation in the Hall"}
                  </h4>
                  <p className="text-xs text-slate-300">-30 Stress, +15 Energy recharge</p>
                </div>
              </div>
              <span className="text-xs font-black text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-md">
                Free
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
