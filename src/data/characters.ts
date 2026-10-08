import { MODELS, SPRITES } from "@/game/assets/assetPaths";
import type { CareerType } from "@/state/gameStore";

// Single source of truth for the playable character roster.
// Ids are persisted in player.avatar — never rename an existing id.
export const CHARACTER_IDS = ["sokha", "sreyneath", "vuth", "taing", "sokunthea", "chandy", "maiko"] as const;
export type CharacterId = (typeof CHARACTER_IDS)[number];

export interface CharacterDefinition {
  id: CharacterId;
  nameEn: string;
  nameKm: string;
  icon: string;
  /** Portrait shown in character creation / switcher. */
  portrait: string;
  /** Rigged FBX model used in the world and the switcher preview. */
  model: string;
  defaultCareer: CareerType;
  /**
   * "procedural": kit rig (Hips/Spine/UpperArmL…) posed in code by PlayerCharacter.
   * "clips": own skeleton + baked animation clips, rendered by a dedicated avatar component.
   */
  rig: "procedural" | "clips";
  /** For rig "clips": texture name prefix in TEXTURES (T_<prefix>_Skin_BaseColor…). */
  texturePrefix?: string;
  /** Unlocks combat controls (punch combo, guard, dodge, jump, crouch, victory). */
  canFight?: boolean;
}

export const CHARACTERS: Record<CharacterId, CharacterDefinition> = {
  sokha: { id: "sokha", nameEn: "Sokha", nameKm: "សុខា", icon: "👨‍🏫", portrait: SPRITES.portrait_sokha_smile, model: MODELS.CHR_Sokha, defaultCareer: "Teacher", rig: "procedural" },
  sreyneath: { id: "sreyneath", nameEn: "Sreyneath", nameKm: "ស្រីនាថ", icon: "👩‍🎓", portrait: SPRITES.portrait_sreyneath_smile, model: MODELS.CHR_Sreyneath, defaultCareer: "Developer", rig: "procedural" },
  vuth: { id: "vuth", nameEn: "Vuth", nameKm: "វុធ", icon: "💻", portrait: SPRITES.portrait_vuth_smile, model: MODELS.CHR_Vuth, defaultCareer: "Developer", rig: "procedural" },
  taing: { id: "taing", nameEn: "Taing", nameKm: "តាំង", icon: "🌾", portrait: SPRITES.portrait_taing_smile, model: MODELS.CHR_Taing, defaultCareer: "Farmer", rig: "procedural" },
  sokunthea: { id: "sokunthea", nameEn: "Sokunthea", nameKm: "សុគន្ធា", icon: "🏪", portrait: SPRITES.portrait_sokunthea_smile, model: MODELS.CHR_Sokunthea, defaultCareer: "ShopOwner", rig: "procedural" },
  chandy: { id: "chandy", nameEn: "Chandy", nameKm: "ចាន់ឌី", icon: "🥊", portrait: SPRITES.portrait_chandy_fierce, model: MODELS.CHR_Chandy, defaultCareer: "Kickboxer", rig: "procedural" },
  maiko: { id: "maiko", nameEn: "Maiko", nameKm: "ម៉ៃកូ", icon: "🥊", portrait: SPRITES.portrait_maiko_neutral, model: MODELS.CHR_Maiko, defaultCareer: "Kickboxer", rig: "clips", texturePrefix: "Maiko", canFight: true },
};

export const CHARACTER_LIST: CharacterDefinition[] = CHARACTER_IDS.map((id) => CHARACTERS[id]);
