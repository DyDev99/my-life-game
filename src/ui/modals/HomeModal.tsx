"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/state/gameStore";
import { translations } from "@/i18n/translations";
import { X, Home, Moon, BedDouble, PhoneCall } from "lucide-react";

export function HomeModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const language = useGameStore((state) => state.language);
  const performRest = useGameStore((state) => state.performRest);
  const sleepAndEndDay = useGameStore((state) => state.sleepAndEndDay);
  const openModal = useGameStore((state) => state.openModal);

  const t = translations[language];

  if (activeModal !== "home") return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="w-full max-w-lg bg-gradient-to-b from-amber-950/90 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative overflow-hidden"
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/20 border border-amber-400/30 px-3 py-1 rounded-full w-fit mb-2">
              <Home className="w-3.5 h-3.5" />
              <span>{language === "km" ? "ផ្ទះឈើខ្ញុំ" : "My Stilt House"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300">
              {language === "km" ? "ផ្ទះឈើបុរាណបែបខ្មែរ" : "Traditional Khmer Wooden Home"}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {language === "km"
                ? "អង្រឹងយោលក្រោមផ្ទះត្រជាក់ស្រួល ពាងទឹកដីឥដ្ឋ និងសេចក្តីកក់ក្តៅ"
                : "Hammock under the wooden stilts, cool clay water jar, and peaceful home sanctuary."}
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {/* 1. Rest in Hammock */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={performRest}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-900/40 to-slate-800/60 border border-amber-500/30 hover:border-amber-400/70 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl">
                  🌴
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {language === "km" ? "ដេកអង្រឹងសម្រាកលំហែ" : "Nap in Shaded Hammock"}
                  </h4>
                  <p className="text-xs text-slate-300">+25 Energy, -15 Stress</p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-md">
                +Energy
              </span>
            </motion.div>

            {/* 2. Call Family */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openModal("relationship")}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-900/40 to-slate-800/60 border border-rose-500/30 hover:border-rose-400/70 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-2xl">
                  👵
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {language === "km" ? "ខលទូរស័ព្ទទៅគ្រួសារ & យាយ" : "Call Family & Grandma"}
                  </h4>
                  <p className="text-xs text-slate-300">Strengthen loving bonds from home</p>
                </div>
              </div>
              <span className="text-xs font-black text-rose-400 bg-rose-500/20 px-2.5 py-1 rounded-md">
                Family
              </span>
            </motion.div>

            {/* 3. Sleep & End Day */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={sleepAndEndDay}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-slate-800/60 border border-indigo-500/30 hover:border-indigo-400/70 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl">
                  🌙
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {language === "km" ? "ចូលគេង & បញ្ចប់ថ្ងៃ" : "Sleep & Complete Day"}
                  </h4>
                  <p className="text-xs text-slate-300">Save progress and view Day summary</p>
                </div>
              </div>
              <span className="text-xs font-black text-indigo-400 bg-indigo-500/20 px-2.5 py-1 rounded-md">
                Sleep
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
