"use client";

import React from "react";
import { useGameStore } from "@/state/gameStore";
import { CHARACTERS, type CharacterId } from "@/data/characters";
import { PUNCHES_PER_TRAINING_REWARD } from "@/state/rules/combat";
import { useIsMobileMode } from "@/ui/hud/useIsMobileMode";

// Move list + live combat state for fighter characters (CharacterDefinition.canFight).
export function FighterHud() {
  const avatar = useGameStore((s) => s.player.avatar);
  const ridingVehicle = useGameStore((s) => s.ridingVehicle);
  const language = useGameStore((s) => s.language);
  const move = useGameStore((s) => s.combat.move);
  const guarding = useGameStore((s) => s.combat.guarding);
  const crouching = useGameStore((s) => s.combat.crouching);
  const airborne = useGameStore((s) => s.combat.airborne);
  const combo = useGameStore((s) => s.combat.combo);
  const punchesThrown = useGameStore((s) => s.combat.punchesThrown);
  const isMobile = useIsMobileMode();

  // The move list shows keyboard keys, so it's hidden with touch controls
  if (!CHARACTERS[avatar as CharacterId]?.canFight || ridingVehicle || isMobile) return null;

  const km = language === "km";
  const stance = airborne
    ? km ? "លោត" : "Jumping"
    : move
    ? move.toUpperCase()
    : guarding
    ? km ? "ការពារ" : "Guard"
    : crouching
    ? km ? "អង្គុយ" : "Crouch"
    : km ? "ត្រៀម" : "Ready";

  const controls: Array<[string, string, string, boolean]> = [
    ["J", "Punch combo", "ដាល់បន្តបន្ទាប់", move === "jab" || move === "cross"],
    ["K", "Hook", "ដាល់ឆៀង", move === "hook"],
    ["Q", "Guard (hold)", "ការពារ (សង្កត់)", guarding],
    ["R", "Dodge", "គេច", move === "dodge"],
    ["Space", "Jump", "លោត", airborne],
    ["X", "Crouch", "អង្គុយ", crouching],
    ["V", "Victory", "អបអរ", move === "victory"],
  ];

  const toReward = PUNCHES_PER_TRAINING_REWARD - (punchesThrown % PUNCHES_PER_TRAINING_REWARD);

  return (
    <div className="fixed left-3 top-1/2 -translate-y-1/2 z-30 pointer-events-none select-none">
      <div className="w-44 rounded-xl bg-slate-950/75 border border-red-500/40 backdrop-blur-md shadow-lg p-2.5 text-white">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold tracking-wide text-red-300">🥊 {km ? "ប្រដាល់" : "Boxing"}</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-600/70">{stance}</span>
        </div>
        <ul className="space-y-0.5">
          {controls.map(([key, en, kh, active]) => (
            <li
              key={key}
              className={`flex items-center gap-2 text-[11px] rounded px-1 ${active ? "bg-amber-400/25 text-amber-200" : "text-slate-200"}`}
            >
              <kbd className="min-w-9 text-center text-[10px] font-mono font-bold rounded bg-slate-800 border border-slate-600 px-1">{key}</kbd>
              <span>{km ? kh : en}</span>
            </li>
          ))}
        </ul>
        <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[10px] text-slate-300 flex justify-between">
          <span>{km ? "បន្ត" : "Combo"} x{combo}</span>
          <span>
            {punchesThrown} {km ? "ដង" : "hits"} · {km ? `${toReward} ទៀត` : `${toReward} to reward`}
          </span>
        </div>
      </div>
    </div>
  );
}
