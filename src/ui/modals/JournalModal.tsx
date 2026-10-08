"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/state/gameStore";
import { translations } from "@/i18n/translations";
import { X, BookOpen, Calendar } from "lucide-react";

export function JournalModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const language = useGameStore((state) => state.language);
  const journal = useGameStore((state) => state.journal);

  const t = translations[language];

  if (activeModal !== "journal") return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative overflow-hidden"
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
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/20 border border-amber-400/30 px-3 py-1 rounded-full w-fit mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.journalTitle}</span>
            </div>
            <h2 className="text-xl font-black text-amber-300">
              {language === "km" ? "កំណត់ត្រាដំណើរជីវិត" : "Chronicle of Life Decisions"}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">{t.journalSub}</p>
          </div>

          {/* Journal Entries List */}
          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {journal.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-amber-400/40 transition-all flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {t.day} {entry.day} • {entry.timeStr}
                    </span>
                  </div>
                  {entry.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold">
                      {entry.badge}
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-sm sm:text-base text-slate-100">
                  {language === "km" ? entry.titleKm : entry.titleEn}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === "km" ? entry.descKm : entry.descEn}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
