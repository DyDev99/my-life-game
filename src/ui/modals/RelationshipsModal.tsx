"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/state/gameStore";
import { translations } from "@/i18n/translations";
import { X, Heart, PhoneCall, Gift, Users } from "lucide-react";

export function RelationshipsModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const language = useGameStore((state) => state.language);
  const relationships = useGameStore((state) => state.relationships);
  const performCallFamily = useGameStore((state) => state.performCallFamily);
  const performVisitFamily = useGameStore((state) => state.performVisitFamily);

  const t = translations[language];

  if (activeModal !== "relationship") return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-rose-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 bg-rose-500/20 border border-rose-400/30 px-3 py-1 rounded-full w-fit mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>{t.relationshipsTitle}</span>
            </div>
            <h2 className="text-xl font-black text-rose-300">
              {language === "km" ? "គ្រួសារ និងសហគមន៍" : "Family & Community Bonds"}
            </h2>
          </div>

          {/* Character Profiles */}
          <div className="flex flex-col gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
            {/* 1. Grandma */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-rose-500/30 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
                    👵
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-rose-300">{t.grandmaName}</h4>
                    <span className="text-xs text-slate-400">{t.grandmaRole}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-rose-400">{relationships.grandma}%</span>
                  <p className="text-[10px] text-slate-400">Deep Bond</p>
                </div>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${relationships.grandma}%` }}
                />
              </div>

              <p className="text-xs italic text-slate-300 bg-black/20 p-2.5 rounded-xl border border-white/5">
                &ldquo;{t.grandmaQuote}&rdquo;
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => performCallFamily("grandma")}
                  className="flex-1 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t.callBtn}</span>
                </button>
                <button
                  onClick={performVisitFamily}
                  className="flex-1 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>{t.visitBtn}</span>
                </button>
              </div>
            </div>

            {/* 2. Mother */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-xl font-bold">
                    👩
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-sky-200">{t.motherName}</h4>
                    <span className="text-xs text-slate-400">{t.motherRole}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-sky-400">{relationships.mother}%</span>
                  <p className="text-[10px] text-slate-400">Warm</p>
                </div>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-600 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${relationships.mother}%` }}
                />
              </div>

              <p className="text-xs italic text-slate-300 bg-black/20 p-2.5 rounded-xl border border-white/5">
                &ldquo;{t.motherQuote}&rdquo;
              </p>

              <button
                onClick={() => performCallFamily("mother")}
                className="w-full py-2 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{t.callBtn}</span>
              </button>
            </div>

            {/* 3. Student Vibol */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">
                    👦
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-emerald-200">{t.vibolName}</h4>
                    <span className="text-xs text-slate-400">{t.vibolRole}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400">{relationships.vibol}%</span>
                  <p className="text-[10px] text-slate-400">Respectful</p>
                </div>
              </div>

              <p className="text-xs italic text-slate-300 bg-black/20 p-2.5 rounded-xl border border-white/5">
                &ldquo;{t.vibolQuote}&rdquo;
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
