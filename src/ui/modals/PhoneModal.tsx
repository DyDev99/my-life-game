"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, formatTimeHour } from "@/state/gameStore";
import { translations } from "@/i18n/translations";
import {
  X,
  Briefcase,
  Users,
  Wallet,
  BookOpen,
  UserCheck,
  Package,
  ArrowLeft,
  PhoneCall,
  Heart,
  Sparkles,
  Wifi,
  Battery,
} from "lucide-react";

export function PhoneModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const language = useGameStore((state) => state.language);
  const timeHour = useGameStore((state) => state.timeHour);
  const player = useGameStore((state) => state.player);
  const stats = useGameStore((state) => state.stats);
  const relationships = useGameStore((state) => state.relationships);
  const journal = useGameStore((state) => state.journal);
  const inventory = useGameStore((state) => state.inventory);
  const performCallFamily = useGameStore((state) => state.performCallFamily);
  const performVisitFamily = useGameStore((state) => state.performVisitFamily);

  const [activeApp, setActiveApp] = useState<
    "grid" | "career" | "family" | "budget" | "journal" | "status" | "inventory"
  >("grid");

  const t = translations[language];
  const timeStr = formatTimeHour(timeHour);

  if (activeModal !== "phone") return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm">
        <motion.div
          initial={{ y: "100%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="w-full sm:max-w-sm h-[92vh] sm:h-[720px] bg-slate-950 rounded-t-[40px] sm:rounded-[44px] border-[6px] border-slate-800 shadow-2xl flex flex-col overflow-hidden text-white relative shadow-black/80"
        >
          {/* Phone Top Notch & Status Bar */}
          <div className="pt-3 px-6 pb-2 flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-white/10 select-none">
            <span>{timeStr}</span>
            <div className="w-20 h-4 bg-black rounded-full mx-auto" />
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Phone Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            {activeApp !== "grid" ? (
              <button
                onClick={() => setActiveApp("grid")}
                className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === "km" ? "ត្រឡប់" : "Back"}</span>
              </button>
            ) : (
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                {t.phoneTitle}
              </span>
            )}
            <button
              onClick={closeModal}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Phone Screen Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* APP GRID (HOME) */}
            {activeApp === "grid" && (
              <div className="flex flex-col gap-6">
                {/* Wallpaper Greeting Banner */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-600/30 via-orange-600/20 to-indigo-900/40 border border-amber-500/30 text-center">
                  <div className="text-2xl mb-1">🇰🇭</div>
                  <h3 className="font-extrabold text-sm text-amber-300">{player.name}&apos;s Phone</h3>
                  <p className="text-[11px] text-slate-300">Kampong Cham Province</p>
                </div>

                {/* 6 Grid Icons */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Career */}
                  <button
                    onClick={() => setActiveApp("career")}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-blue-400 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-200">{t.appWork}</span>
                  </button>

                  {/* Family */}
                  <button
                    onClick={() => setActiveApp("family")}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-rose-400 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-200">{t.appFamily}</span>
                  </button>

                  {/* Budget */}
                  <button
                    onClick={() => setActiveApp("budget")}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-emerald-400 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-200">{t.appBudget}</span>
                  </button>

                  {/* Journal */}
                  <button
                    onClick={() => setActiveApp("journal")}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-amber-400 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-200">{t.appJournal}</span>
                  </button>

                  {/* Status / Skills */}
                  <button
                    onClick={() => setActiveApp("status")}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-indigo-400 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-200">{t.appStatus}</span>
                  </button>

                  {/* Inventory */}
                  <button
                    onClick={() => setActiveApp("inventory")}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-white/10 hover:border-purple-400 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-200">{t.appInventory}</span>
                  </button>
                </div>
              </div>
            )}

            {/* APP: CAREER */}
            {activeApp === "career" && (
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-2xl bg-blue-900/30 border border-blue-500/30">
                  <h3 className="font-extrabold text-base text-blue-300">{t.careerTeacher}</h3>
                  <p className="text-xs text-slate-300 mt-1">{t.careerTeacherDesc}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex justify-between items-center text-xs">
                  <span className="text-slate-400">{t.monthlySalary}</span>
                  <span className="font-bold text-emerald-400">$250 / mo</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Daily Class Wage</span>
                  <span className="font-bold text-emerald-400">$12 / shift</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Teaching Skill Level</span>
                  <span className="font-bold text-amber-400">Lvl {stats.teachingSkill}</span>
                </div>
              </div>
            )}

            {/* APP: FAMILY & RELATIONSHIPS */}
            {activeApp === "family" && (
              <div className="flex flex-col gap-3">
                {/* Grandma */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-rose-500/30 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-rose-300">{t.grandmaName}</h4>
                      <p className="text-[11px] text-slate-400">{t.grandmaRole}</p>
                    </div>
                    <span className="text-xs font-bold text-rose-400">{relationships.grandma}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${relationships.grandma}%` }} />
                  </div>
                  <p className="text-xs italic text-slate-300">&ldquo;{t.grandmaQuote}&rdquo;</p>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => performCallFamily("grandma")}
                      className="flex-1 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{t.callBtn}</span>
                    </button>
                    <button
                      onClick={performVisitFamily}
                      className="flex-1 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>{t.visitBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Mother */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-200">{t.motherName}</h4>
                      <p className="text-[11px] text-slate-400">{t.motherRole}</p>
                    </div>
                    <span className="text-xs font-bold text-sky-400">{relationships.mother}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${relationships.mother}%` }} />
                  </div>
                  <button
                    onClick={() => performCallFamily("mother")}
                    className="w-full py-1.5 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{t.callBtn}</span>
                  </button>
                </div>
              </div>
            )}

            {/* APP: BUDGET */}
            {activeApp === "budget" && (
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/30 flex justify-between font-bold">
                  <span>{t.monthlySalary}</span>
                  <span className="text-emerald-400">+$250</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex justify-between">
                  <span className="text-slate-400">{t.rentExpense}</span>
                  <span className="text-rose-400">-$80</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex justify-between">
                  <span className="text-slate-400">{t.foodExpense}</span>
                  <span className="text-rose-400">-$100</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex justify-between">
                  <span className="text-slate-400">{t.familyRemittance}</span>
                  <span className="text-rose-400">-$30</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex justify-between">
                  <span className="text-slate-400">{t.fuelExpense}</span>
                  <span className="text-rose-400">-$20</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-900/30 border border-blue-500/30 flex justify-between font-extrabold text-sm mt-1">
                  <span>{t.netSavings}</span>
                  <span className="text-emerald-400">+$20 / mo</span>
                </div>
              </div>
            )}

            {/* APP: JOURNAL */}
            {activeApp === "journal" && (
              <div className="flex flex-col gap-2.5">
                {journal.map((item) => (
                  <div key={item.id} className="p-3 rounded-2xl bg-slate-900 border border-white/10 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-amber-400">Day {item.day} • {item.timeStr}</span>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-slate-100">{language === "km" ? item.titleKm : item.titleEn}</h5>
                    <p className="text-slate-300 text-[11px] mt-1">{language === "km" ? item.descKm : item.descEn}</p>
                  </div>
                ))}
              </div>
            )}

            {/* APP: STATUS & SKILLS */}
            {activeApp === "status" && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
                    👨‍🏫
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{player.name}</h4>
                    <p className="text-slate-400">Age {player.age} • {player.career}</p>
                    <p className="text-[11px] text-amber-300">{player.education}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex flex-col gap-2">
                  <h5 className="font-bold text-slate-200">Skills</h5>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Teaching</span>
                    <span className="font-bold text-blue-400">Level {stats.teachingSkill}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reputation</span>
                    <span className="font-bold text-amber-400">{stats.reputation}/100</span>
                  </div>
                </div>
              </div>
            )}

            {/* APP: INVENTORY */}
            {activeApp === "inventory" && (
              <div className="grid grid-cols-2 gap-2.5">
                {inventory.map((item) => (
                  <div key={item.id} className="p-3 rounded-2xl bg-slate-900 border border-white/10 flex flex-col items-center text-center gap-1.5">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.icon} alt={item.nameEn} className="w-10 h-10 object-contain" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">{language === "km" ? item.nameKm : item.nameEn}</span>
                    <span className="text-[10px] text-slate-400">x{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Phone Gesture Bar */}
          <div
            onClick={() => {
              if (activeApp !== "grid") setActiveApp("grid");
              else closeModal();
            }}
            className="py-3 flex justify-center cursor-pointer hover:bg-white/5 transition-colors border-t border-white/5"
          >
            <div className="w-32 h-1 bg-white/40 rounded-full" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
