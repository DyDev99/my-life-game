"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore, CareerType, PlayerProfile } from "@/state/gameStore";
import { translations } from "@/i18n/translations";
import {
  ArrowLeft,
  GraduationCap,
  Laptop,
  Wheat,
  Store,
  Sparkles,
  Check,
  Coins,
  Smartphone,
  Bike,
  Flame,
} from "lucide-react";
import { CHARACTER_LIST, type CharacterId } from "@/data/characters";

export function CharacterCreation() {
  const setScreen = useGameStore((state) => state.setScreen);
  const startNewGame = useGameStore((state) => state.startNewGame);
  const language = useGameStore((state) => state.language);

  const t = translations[language];

  const [name, setName] = useState("Sokha");
  const [avatar, setAvatar] = useState<CharacterId>("sokha");
  const [career, setCareer] = useState<CareerType>("Teacher");
  const [selectedTraits, setSelectedTraits] = useState<string[]>(["Hardworking", "Friendly"]);

  const avatarsList = CHARACTER_LIST;

  const selectAvatar = (av: CharacterId) => {
    setAvatar(av);
    const item = avatarsList.find((a) => a.id === av);
    if (item) {
      setName(item.nameEn);
      setCareer(item.defaultCareer);
    }
  };

  const handleStart = () => {
    const profile: PlayerProfile = {
      name: name.trim() || "Sokha",
      age: 24,
      hometown: "Kampong Cham",
      career,
      personality: selectedTraits,
      education: "University Graduate",
      avatar,
    };
    startNewGame(profile);
  };

  const careerOptions: Array<{ type: CareerType; nameEn: string; nameKm: string; descEn: string; descKm: string; icon: React.ReactNode }> = [
    {
      type: "Teacher",
      nameEn: t.careerTeacher,
      nameKm: t.careerTeacher,
      descEn: t.careerTeacherDesc,
      descKm: t.careerTeacherDesc,
      icon: <GraduationCap className="w-5 h-5 text-blue-400" />,
    },
    {
      type: "Developer",
      nameEn: t.careerDeveloper,
      nameKm: t.careerDeveloper,
      descEn: t.careerDeveloperDesc,
      descKm: t.careerDeveloperDesc,
      icon: <Laptop className="w-5 h-5 text-purple-400" />,
    },
    {
      type: "Farmer",
      nameEn: t.careerFarmer,
      nameKm: t.careerFarmer,
      descEn: t.careerFarmerDesc,
      descKm: t.careerFarmerDesc,
      icon: <Wheat className="w-5 h-5 text-emerald-400" />,
    },
    {
      type: "ShopOwner",
      nameEn: t.careerShopOwner,
      nameKm: t.careerShopOwner,
      descEn: t.careerShopOwnerDesc,
      descKm: t.careerShopOwnerDesc,
      icon: <Store className="w-5 h-5 text-amber-400" />,
    },
    {
      type: "Kickboxer",
      nameEn: t.careerKickboxer,
      nameKm: t.careerKickboxer,
      descEn: t.careerKickboxerDesc,
      descKm: t.careerKickboxerDesc,
      icon: <Flame className="w-5 h-5 text-orange-400" />,
    },
  ];

  const traitOptions = [
    { key: "Hardworking", labelEn: t.traitHardworking, labelKm: t.traitHardworking },
    { key: "Friendly", labelEn: t.traitFriendly, labelKm: t.traitFriendly },
    { key: "Creative", labelEn: t.traitCreative, labelKm: t.traitCreative },
    { key: "Ambitious", labelEn: t.traitAmbitious, labelKm: t.traitAmbitious },
    { key: "Calm", labelEn: t.traitCalm, labelKm: t.traitCalm },
    { key: "Social", labelEn: t.traitSocial, labelKm: t.traitSocial },
  ];

  const toggleTrait = (traitKey: string) => {
    if (selectedTraits.includes(traitKey)) {
      if (selectedTraits.length > 1) {
        setSelectedTraits(selectedTraits.filter((t) => t !== traitKey));
      }
    } else {
      if (selectedTraits.length < 2) {
        setSelectedTraits([...selectedTraits, traitKey]);
      } else {
        setSelectedTraits([selectedTraits[1], traitKey]);
      }
    }
  };


  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md select-none overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-white/20 rounded-3xl p-5 sm:p-7 shadow-2xl text-white relative my-auto"
      >
        {/* Back Button */}
        <button
          onClick={() => setScreen("main_menu")}
          className="absolute top-5 left-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Title */}
        <div className="text-center mt-6 sm:mt-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.characterSetupSub}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-300">
            {t.characterSetupTitle}
          </h2>
        </div>

        <div className="flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-1">
          {/* Avatar Character Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              {language === "km" ? "ជ្រើសរើសតួអង្គ (Select Avatar)" : "Choose Playable Avatar"}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {avatarsList.map((av) => {
                const isSelected = avatar === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => selectAvatar(av.id)}
                    className={`p-2 rounded-2xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/25 border-amber-400 shadow-lg shadow-amber-500/20 scale-105"
                        : "bg-slate-800/50 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900/60 border border-white/10 flex items-center justify-center relative">
                      <img
                        src={av.portrait}
                        alt={av.nameEn}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide broken image, show emoji
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <span className="absolute text-lg pointer-events-none opacity-0 only:opacity-100">{av.icon}</span>
                    </div>
                    <span className="text-[11px] font-extrabold text-white truncate w-full text-center">
                      {language === "km" ? av.nameKm : av.nameEn}
                    </span>
                    {isSelected && (
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              {t.characterNameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-white/20 focus:border-amber-400 focus:outline-none text-white font-bold text-base transition-colors"
              placeholder="e.g. Dara"
              maxLength={20}
            />
          </div>

          {/* Career Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
              {t.career}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {careerOptions.map((c) => (
                <div
                  key={c.type}
                  onClick={() => setCareer(c.type)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    career === c.type
                      ? "bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/10"
                      : "bg-slate-800/50 border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white/10 mt-0.5">{c.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">
                        {language === "km" ? c.nameKm : c.nameEn}
                      </h4>
                      {career === c.type && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                      {language === "km" ? c.descKm : c.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personality Traits (Pick 2) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {t.personality}
              </label>
              <span className="text-[11px] text-amber-300 font-semibold">
                {selectedTraits.length}/2
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {traitOptions.map((trait) => {
                const active = selectedTraits.includes(trait.key);
                return (
                  <button
                    key={trait.key}
                    type="button"
                    onClick={() => toggleTrait(trait.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      active
                        ? "bg-amber-500 text-white border-amber-300 shadow-md shadow-amber-500/20 scale-105"
                        : "bg-slate-800/60 text-slate-300 border-white/10 hover:border-white/30"
                    }`}
                  >
                    {language === "km" ? trait.labelKm : trait.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Starting Starter Assets Overview */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">Starting Savings: $150</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" /> Phone
              </span>
              <span className="flex items-center gap-1">
                <Bike className="w-3.5 h-3.5 text-rose-400" /> Motorbike
              </span>
            </div>
          </div>
        </div>

        {/* Start Game Action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className="w-full mt-6 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-extrabold text-base shadow-xl shadow-orange-500/30 border border-amber-300/40 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-yellow-200" />
          <span>{t.startAdventure}</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
