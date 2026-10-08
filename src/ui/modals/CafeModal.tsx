"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/state/gameStore";
import { translations } from "@/i18n/translations";
import { X, Coffee, Users, Eye, Sparkles } from "lucide-react";

export function CafeModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const language = useGameStore((state) => state.language);
  const stats = useGameStore((state) => state.stats);
  const performCafeDrink = useGameStore((state) => state.performCafeDrink);
  const addStatPop = useGameStore((state) => state.addStatPop);
  const advanceTime = useGameStore((state) => state.advanceTime);

  const t = translations[language];

  if (activeModal !== "cafe") return null;

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
              <Coffee className="w-3.5 h-3.5" />
              <span>{language === "km" ? "តូបកាហ្វេមាត់ទន្លេ" : "Riverside Coffee Cart"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300">
              {language === "km" ? "កាហ្វេទឹកដោះគោទឹកកកមាត់ទន្លេ" : "Iced Milk Coffee by the Mekong"}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {language === "km"
                ? "អង្គុយលើកៅអីជ័រក្រហម ស្រូបខ្យល់ទន្លេត្រជាក់ និងជជែកលេងជាមួយអ្នកភូមិ"
                : "Sit on a red plastic stool, enjoy the cool Mekong river breeze, and chat with locals."}
            </p>
          </div>

          {/* Cafe Options */}
          <div className="flex flex-col gap-3">
            {/* 1. Order Iced Coffee */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={performCafeDrink}
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-900/40 to-slate-800/60 border border-amber-500/30 hover:border-amber-400/70 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl">
                  🥤
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {language === "km" ? "កាហ្វេទឹកដោះគោទឹកកក" : "Order Iced Milk Coffee"}
                  </h4>
                  <p className="text-xs text-slate-300">+16 Happiness, -15 Stress</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-md">
                -$1.50
              </span>
            </motion.div>

            {/* 2. Chat with Locals */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                addStatPop("+6 Happiness", "happiness");
                addStatPop("+1 Reputation", "skill");
                advanceTime(0.5);
                closeModal();
              }}
              className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 to-slate-800/60 border border-blue-500/30 hover:border-blue-400/70 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
                  💬
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {language === "km" ? "ជជែកសំណេះសំណាលជាមួយអ្នកភូមិ" : "Chat with Village Neighbors"}
                  </h4>
                  <p className="text-xs text-slate-300">Hear local Kampong Cham stories & gossip</p>
                </div>
              </div>
              <span className="text-xs font-black text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-md">
                +Social
              </span>
            </motion.div>

            {/* 3. Watch River Boats */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                addStatPop("-18 Stress", "stress");
                advanceTime(1.0);
                closeModal();
              }}
              className="p-4 rounded-2xl bg-gradient-to-r from-teal-900/40 to-slate-800/60 border border-teal-500/30 hover:border-teal-400/70 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center text-2xl">
                  ⛵
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {language === "km" ? "គយគន់ទិដ្ឋភាពដងទន្លេមេគង្គ" : "Watch Mekong Riverboats Pass"}
                  </h4>
                  <p className="text-xs text-slate-300">Calm river breezes and gentle reflection</p>
                </div>
              </div>
              <span className="text-xs font-black text-teal-400 bg-teal-500/20 px-2.5 py-1 rounded-md">
                -Stress
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
