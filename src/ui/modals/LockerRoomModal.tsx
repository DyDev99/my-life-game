"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/state/gameStore";
import { X, Shirt, Trophy, Heart, Coffee, ShieldCheck } from "lucide-react";

export function LockerRoomModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const language = useGameStore((state) => state.language);
  const selectedJersey = useGameStore((state) => state.selectedJersey);
  const setSelectedJersey = useGameStore((state) => state.setSelectedJersey);
  const restInLockerRoom = useGameStore((state) => state.restInLockerRoom);
  const addStatPop = useGameStore((state) => state.addStatPop);
  const advanceTime = useGameStore((state) => state.advanceTime);

  if (activeModal !== "locker_room") return null;

  const isKm = language === "km";

  const jerseys = [
    {
      id: "cambodia_blue",
      nameEn: "Cambodia National Home Blue",
      nameKm: "ឈុតជម្រើសជាតិ ខៀវ (Home)",
      descEn: "Iconic royal blue national kit with Angkor crest",
      descKm: "ឈុតពណ៌ខៀវប្រពៃណីជាតិ ជាមួយរូបប្រាសាទអង្គរវត្ត",
      color: "#1E40AF",
      accent: "#DC2626",
    },
    {
      id: "cambodia_red",
      nameEn: "Cambodia National Away Red",
      nameKm: "ឈុតជម្រើសជាតិ ក្រហម (Away)",
      descEn: "Fiery crimson matchday uniform",
      descKm: "ឈុតប្រកួតពណ៌ក្រហមឆ្អៅ ស្មារតីអ្នកតស៊ូ",
      color: "#DC2626",
      accent: "#1E40AF",
    },
    {
      id: "cambodia_white",
      nameEn: "National Clean White Kit",
      nameKm: "ឈុតប្រកួតពណ៌ស (White Kit)",
      descEn: "Crisp white kit for international fixtures",
      descKm: "ឈុតពណ៌សស្អាត សម្រាប់ប្រកួតមិត្តភាពអន្តរជាតិ",
      color: "#F8FAFC",
      accent: "#2563EB",
    },
    {
      id: "sport_casual",
      nameEn: "Pro Training & Warmup Attire",
      nameKm: "ឈុតហ្វឹកហាត់ប្រចាំថ្ងៃ (Training)",
      descEn: "Breathable athletic gear for football & volleyball",
      descKm: "ឈុតកីឡាស្រាលស្រួលខ្លួន សម្រាប់ហ្វឹកហាត់បាល់ទាត់ & បាល់ទះ",
      color: "#0F172A",
      accent: "#F59E0B",
    },
  ] as const;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950/90 border border-blue-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="mb-5">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full w-fit mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{isKm ? "ពហុកីឡដ្ឋានជាតិ • បន្ទប់ផ្លាស់សម្លៀកបំពាក់" : "Sports City Clubhouse • Player Locker Room"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>{isKm ? "បន្ទប់កីឡាករ & យុទ្ធសាស្ត្រ" : "Team Dressing Room & Tactics"}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {isKm
                ? "ផ្លាស់ប្តូរសម្លៀកបំពាក់កីឡា សម្រាកស្តារថាមពល និងពិនិត្យយុទ្ធសាស្ត្រមុនពេលចុះទីលាន"
                : "Equip official national jerseys, recover stamina on player benches, and review match tactics."}
            </p>
          </div>

          {/* Section 1: Official Team Jerseys */}
          <div className="mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2.5 flex items-center gap-1.5">
              <Shirt className="w-3.5 h-3.5" />
              <span>{isKm ? "ជ្រើសរើសឈុតកីឡា (Select Jersey Kit)" : "Official Matchday Kits"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {jerseys.map((j) => {
                const isSelected = selectedJersey === j.id;
                return (
                  <motion.div
                    key={j.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedJersey(j.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? "bg-blue-600/30 border-blue-400 shadow-lg shadow-blue-500/20"
                        : "bg-slate-800/60 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border border-white/20"
                      style={{ backgroundColor: j.color, color: j.id === "cambodia_white" ? "#1E3A8A" : "#FFFFFF" }}
                    >
                      <Shirt className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{isKm ? j.nameKm : j.nameEn}</h4>
                        {isSelected && (
                          <span className="text-[10px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                            {isKm ? "ពាក់រួច" : "Active"}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{isKm ? j.descKm : j.descEn}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Facilities & Recovery */}
          <div className="flex flex-col gap-2.5">
            {/* Rest on Benches */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                restInLockerRoom();
                closeModal();
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-800/80 border border-emerald-500/30 hover:border-emerald-400/60 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">
                    {isKm ? "សម្រាកលើកៅអីកីឡាករ" : "Rest on Player Benches"}
                  </h4>
                  <p className="text-[10px] text-slate-300">+30 Energy, -20 Stress, +10 Health</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-md">
                {isKm ? "ឥតគិតថ្លៃ" : "Free"}
              </span>
            </motion.div>

            {/* Tactics & Strategy */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                addStatPop(isKm ? "+15 Technology / Tactics Skill" : "+15 Tactical Strategy Skill", "skill");
                advanceTime(0.5);
                closeModal();
              }}
              className="p-3.5 rounded-2xl bg-slate-800/50 border border-white/10 hover:border-white/30 cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">
                    {isKm ? "សិក្សាក្ដារយុទ្ធសាស្ត្រ (Tactics Chalkboard)" : "Review Team Match Tactics"}
                  </h4>
                  <p className="text-[10px] text-slate-300">+15 Strategy Skill, Boost Team Chemistry</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-md">
                30 Mins
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
