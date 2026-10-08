"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/state/gameStore";

export function StatFeedback() {
  const statPops = useGameStore((state) => state.statPops);

  return (
    <div className="fixed top-24 right-4 pointer-events-none z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {statPops.map((pop) => {
          const isMoney = pop.type === "money";
          const isEnergy = pop.type === "energy";
          const isHappiness = pop.type === "happiness";
          const isStress = pop.type === "stress";
          const isSkill = pop.type === "skill";

          const bg = isMoney
            ? "bg-emerald-600 text-white shadow-emerald-500/30"
            : isEnergy
            ? "bg-amber-500 text-white shadow-amber-500/30"
            : isHappiness
            ? "bg-yellow-400 text-slate-900 shadow-yellow-500/30"
            : isStress
            ? "bg-purple-600 text-white shadow-purple-500/30"
            : "bg-blue-600 text-white shadow-blue-500/30";

          return (
            <motion.div
              key={pop.id}
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.7 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`px-3.5 py-1.5 rounded-full font-bold text-sm shadow-lg border border-white/20 flex items-center gap-1.5 backdrop-blur-md ${bg}`}
            >
              <span>
                {isMoney ? "💵" : isEnergy ? "⚡" : isHappiness ? "😊" : isStress ? "😰" : "📚"}
              </span>
              <span>{pop.text}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
