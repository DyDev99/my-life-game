"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/state/gameStore";
import { translations } from "@/i18n/translations";
import { X, Store, ShoppingBag } from "lucide-react";

export function MarketModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const language = useGameStore((state) => state.language);
  const performMarketBuy = useGameStore((state) => state.performMarketBuy);

  const t = translations[language];

  if (activeModal !== "market") return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="w-full max-w-lg bg-gradient-to-b from-purple-950/90 via-slate-900 to-slate-950 border border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative overflow-hidden"
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-400 bg-purple-500/20 border border-purple-400/30 px-3 py-1 rounded-full w-fit mb-2">
              <Store className="w-3.5 h-3.5" />
              <span>{language === "km" ? "ផ្សារកំពង់ចាម" : "Kampong Cham Market"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300">
              {language === "km" ? "តូបលក់ផ្លែឈើ និងម្ហូបអាហារ" : "Market Stalls & Street Snacks"}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {language === "km"
                ? "តូបផ្លែឈើស្រស់ៗ នំបញ្ចុកទឹកសម្លការី និងការសន្ទនារាក់ទាក់របស់អ្នកស្រុក"
                : "Browse fresh fruits, steaming Num Banh Chok noodles, and friendly shopkeepers."}
            </p>
          </div>

          {/* Market Items */}
          <div className="flex flex-col gap-3">
            {/* 1. Fresh Tropical Fruit Basket */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => performMarketBuy(3.0, "Fresh Fruit Basket", "កន្ត្រកផ្លែឈើស្រស់")}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-900/40 to-slate-800/60 border border-orange-500/30 hover:border-orange-400/70 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl">
                  🍉
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {language === "km" ? "កន្ត្រកផ្លែឈើស្រស់ (ស្វាយ, ខ្នុរ)" : "Fresh Tropical Fruit (Mango & Jackfruit)"}
                  </h4>
                  <p className="text-xs text-slate-300">+15 Happiness, +10 Energy</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-md">
                -$3.00
              </span>
            </motion.div>

            {/* 2. Num Banh Chok Bowl */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => performMarketBuy(2.0, "Num Banh Chok Noodles", "នំបញ្ចុកសម្លប្រហើរ")}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900/40 to-slate-800/60 border border-emerald-500/30 hover:border-emerald-400/70 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl">
                  🍜
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {language === "km" ? "នំបញ្ចុកសម្លប្រហើរ" : "Traditional Num Banh Chok Noodles"}
                  </h4>
                  <p className="text-xs text-slate-300">+25 Energy, +12 Happiness</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-md">
                -$2.00
              </span>
            </motion.div>

            {/* 3. Handwoven Krama Scarf */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => performMarketBuy(4.0, "Handwoven Krama", "ក្រមាខ្មែរត្បាញដៃ")}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-900/40 to-slate-800/60 border border-rose-500/30 hover:border-rose-400/70 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-2xl">
                  🧣
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {language === "km" ? "ក្រមាខ្មែរត្បាញដៃ" : "Handwoven Khmer Krama"}
                  </h4>
                  <p className="text-xs text-slate-300">+3 Reputation, Authentic keepsake</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-md">
                -$4.00
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
