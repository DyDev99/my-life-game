"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/state/gameStore";
import { translations } from "@/i18n/translations";
import confetti from "canvas-confetti";
import { X, BookOpen, Users, Award, Sparkles, CheckCircle2 } from "lucide-react";

export function WorkModal() {
  const activeModal = useGameStore((state) => state.activeModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const language = useGameStore((state) => state.language);
  const performWork = useGameStore((state) => state.performWork);

  const t = translations[language];

  // Steps: 1 = Plan, 2 = Dilemma, 3 = Result
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<string>("Interactive Storytelling");
  const [selectedDilemma, setSelectedDilemma] = useState<string>("Spoke kindly with Vibol");

  if (activeModal !== "work") return null;

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      // Fire subtle celebratory confetti
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899"],
      });
    } else {
      performWork({ plan: selectedPlan, dilemma: selectedDilemma });
      setStep(1);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-blue-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl text-white relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => {
              setStep(1);
              closeModal();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full w-fit mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.teacherTitle}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-amber-300">
              {step === 1 ? t.step1Title : step === 2 ? t.step2Title : t.step3Title}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">{t.teacherSubtitle}</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-amber-400" : "bg-slate-800"
                }`}
              />
            ))}
          </div>

          {/* STEP 1: Plan */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs sm:text-sm text-slate-200 font-medium">{t.step1Prompt}</p>

              <div
                onClick={() => setSelectedPlan("Interactive Storytelling")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedPlan === "Interactive Storytelling"
                    ? "bg-blue-600/30 border-blue-400 shadow-md shadow-blue-500/20"
                    : "bg-slate-800/40 border-white/10 hover:border-white/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    ✨
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{t.planInteractive}</h4>
                    <p className="text-xs text-slate-400">+Happiness, +Student Joy</p>
                  </div>
                </div>
                {selectedPlan === "Interactive Storytelling" && (
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                )}
              </div>

              <div
                onClick={() => setSelectedPlan("Structured Textbook Drills")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedPlan === "Structured Textbook Drills"
                    ? "bg-blue-600/30 border-blue-400 shadow-md shadow-blue-500/20"
                    : "bg-slate-800/40 border-white/10 hover:border-white/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    📖
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{t.planDrill}</h4>
                    <p className="text-xs text-slate-400">+Discipline, +Exam Readiness</p>
                  </div>
                </div>
                {selectedPlan === "Structured Textbook Drills" && (
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Dilemma */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-xs sm:text-sm text-slate-200">
                <p className="font-medium">{t.dilemmaPrompt}</p>
              </div>

              <div
                onClick={() => setSelectedDilemma("Spoke kindly in private")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedDilemma === "Spoke kindly in private"
                    ? "bg-blue-600/30 border-blue-400 shadow-md shadow-blue-500/20"
                    : "bg-slate-800/40 border-white/10 hover:border-white/30"
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">{t.choiceTalkPrivate}</h4>
                  <p className="text-[11px] text-slate-400">Vibol trust ++, Empathy +</p>
                </div>
                {selectedDilemma === "Spoke kindly in private" && (
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                )}
              </div>

              <div
                onClick={() => setSelectedDilemma("Scolded for tardiness")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedDilemma === "Scolded for tardiness"
                    ? "bg-blue-600/30 border-blue-400 shadow-md shadow-blue-500/20"
                    : "bg-slate-800/40 border-white/10 hover:border-white/30"
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">{t.choiceScold}</h4>
                  <p className="text-[11px] text-slate-400">Discipline +, Stress +</p>
                </div>
                {selectedDilemma === "Scolded for tardiness" && (
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                )}
              </div>

              <div
                onClick={() => setSelectedDilemma("Continued lecturing")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedDilemma === "Continued lecturing"
                    ? "bg-blue-600/30 border-blue-400 shadow-md shadow-blue-500/20"
                    : "bg-slate-800/40 border-white/10 hover:border-white/30"
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">{t.choiceIgnore}</h4>
                  <p className="text-[11px] text-slate-400">No time cost</p>
                </div>
                {selectedDilemma === "Continued lecturing" && (
                  <CheckCircle2 className="w-5 h-5 text-amber-400" />
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Results & Feedback */}
          {step === 3 && (
            <div className="flex flex-col gap-3.5 text-center items-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl animate-bounce">
                🎉
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-amber-300">
                {language === "km" ? "ការបង្រៀនទទួលបានជោគជ័យ!" : "Class Session Successful!"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 px-4">{t.reactionSuccess}</p>

              {/* Reward Cards */}
              <div className="grid grid-cols-3 gap-2 w-full mt-2">
                <div className="bg-emerald-500/20 border border-emerald-400/30 p-2.5 rounded-xl flex flex-col items-center">
                  <span className="text-sm font-black text-emerald-400">+$12</span>
                  <span className="text-[10px] text-slate-300">Daily Wage</span>
                </div>
                <div className="bg-blue-500/20 border border-blue-400/30 p-2.5 rounded-xl flex flex-col items-center">
                  <span className="text-sm font-black text-blue-400">+1</span>
                  <span className="text-[10px] text-slate-300">Teaching Skill</span>
                </div>
                <div className="bg-amber-500/20 border border-amber-400/30 p-2.5 rounded-xl flex flex-col items-center">
                  <span className="text-sm font-black text-amber-400">+2</span>
                  <span className="text-[10px] text-slate-300">Reputation</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNextStep}
            className="w-full mt-6 py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-500/30 border border-blue-400/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            {step === 3 ? (
              <>
                <Award className="w-5 h-5 text-amber-300" />
                <span>{t.workCompleteBtn}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>{language === "km" ? "បន្តទៅមុខទៀត" : "Continue"}</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
