"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/state/gameStore";
import { X, Sparkles, Building2, Coffee, BedDouble } from "lucide-react";

export function HotelModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const language = useGameStore((state) => state.language);
  const performHotelStay = useGameStore((state) => state.performHotelStay);
  const addStatPop = useGameStore((state) => state.addStatPop);
  const advanceTime = useGameStore((state) => state.advanceTime);

  if (activeModal !== "hotel") return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-indigo-950/90 to-slate-950 border border-amber-400/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative overflow-hidden"
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-400/30 px-3 py-1 rounded-full w-fit mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>{language === "km" ? "សណ្ឋាគារមេគង្គ ហ្គ្រេន" : "Mekong Grand Hotel & Suites"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300">
              {language === "km" ? "ការស្នាក់នៅលំដាប់ប្រណីត" : "Luxury Riverside Stay & Lounge"}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {language === "km"
                ? "ទេសភាពដងទន្លេមេគង្គ កន្លែងចតរថយន្ត Supercar VIP និងបន្ទប់ស្នាក់នៅដ៏ប្រណីត"
                : "Spectacular Mekong riverfront views, VIP Supercar plaza, and luxury suites."}
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {/* 1. Executive Suite Stay */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={performHotelStay}
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-900/30 to-slate-800/80 border border-amber-400/30 hover:border-amber-400/70 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                  <BedDouble className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {language === "km" ? "សម្រាកនៅបន្ទប់ប្រណីត VIP" : "Rest in Executive VIP Suite"}
                  </h4>
                  <p className="text-xs text-slate-300">+40 Energy, +30 Happiness, -35 Stress</p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-md">
                -$25.00
              </span>
            </motion.div>

            {/* 2. Rooftop Cafe & View */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                addStatPop("+15 Happiness", "happiness");
                addStatPop("-10 Stress", "stress");
                advanceTime(1.0);
                closeModal();
              }}
              className="p-4 rounded-2xl bg-slate-800/50 border border-white/10 hover:border-white/30 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-300">
                  <Coffee className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {language === "km" ? "ទស្សនាទេសភាពពីលើដំបូល" : "Rooftop Terrace & Sightseeing"}
                  </h4>
                  <p className="text-xs text-slate-300">+15 Happiness, -10 Stress</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-300 bg-white/10 px-2 py-1 rounded-md">
                {language === "km" ? "ឥតគិតថ្លៃ" : "Free"}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
