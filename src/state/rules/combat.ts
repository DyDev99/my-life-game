// Pure combat / boxing rules — no React, no Zustand, no audio. Unit-testable.

export type CombatMove = "jab" | "cross" | "hook" | "dodge" | "jump" | "victory";
// "jump" is not a one-shot clip: it sets combat.airborne until the avatar lands.
export type PunchMove = Extract<CombatMove, "jab" | "cross" | "hook">;

/** Seconds between punches that still count as the same combo. */
export const COMBO_WINDOW_S = 1.2;

/** Punches thrown per training reward (stress relief + happiness). */
export const PUNCHES_PER_TRAINING_REWARD = 10;

/** Minimum energy needed to throw a move; below it the fighter is too tired. */
export const MIN_ENERGY_TO_FIGHT = 5;

export const MOVE_ENERGY_COST: Record<CombatMove, number> = {
  jab: 0.5,
  cross: 0.75,
  hook: 1,
  dodge: 1,
  jump: 1,
  victory: 0,
};

/** Relative punch power (used for sound/feedback). */
export const PUNCH_POWER: Record<PunchMove, number> = { jab: 1, cross: 1.2, hook: 1.4 };

/**
 * Movement speed multiplier while a move or stance is active.
 * Punching plants the feet; guarding shuffles; jumping and dodging keep momentum.
 */
export function movementFactor(move: CombatMove | null, guarding: boolean, crouching: boolean): number {
  if (move === "jab" || move === "cross" || move === "hook" || move === "victory") return 0.2;
  if (guarding) return 0.35;
  if (crouching) return 0.45;
  return 1;
}

export function isPunch(move: CombatMove): move is PunchMove {
  return move === "jab" || move === "cross" || move === "hook";
}

/** 1-2-3 chain: combo hit 1 → jab, 2 → cross, 3 → hook, then repeats. */
export function comboPunch(comboCount: number): PunchMove {
  const chain: PunchMove[] = ["jab", "cross", "hook"];
  return chain[(Math.max(1, comboCount) - 1) % chain.length];
}

/** Combo count after a punch thrown at `now` (seconds). */
export function nextCombo(previousCombo: number, lastPunchAt: number, now: number): number {
  return now - lastPunchAt <= COMBO_WINDOW_S ? previousCombo + 1 : 1;
}

export function canPerform(move: CombatMove, energy: number): boolean {
  return MOVE_ENERGY_COST[move] === 0 || energy >= MIN_ENERGY_TO_FIGHT;
}

/** Stat changes earned when `punchesThrown` crosses a training milestone. */
export function trainingReward(punchesThrown: number): { stress: number; happiness: number } | null {
  if (punchesThrown > 0 && punchesThrown % PUNCHES_PER_TRAINING_REWARD === 0) {
    return { stress: -2, happiness: 1 };
  }
  return null;
}
