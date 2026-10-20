export type WeaponId = "m416" | "shotgun" | "sniper";

export interface WeaponDef {
  id: WeaponId;
  name: string;
  category: "AR" | "SG" | "SR";
  fireMode: "auto" | "semi" | "bolt";
  damage: number;
  headshotMultiplier: number;
  maxRange: number;
  fireRate: number; // rounds per second
  magCapacity: number;
  defaultReserve: number;
  reloadDuration: number; // in seconds
  hipSpread: number; // base spread angle in degrees
  adsSpread: number; // ADS scoped spread angle in degrees
  recoilVertical: number; // pitch kick per shot in degrees
  recoilHorizontal: number; // random yaw kick per shot in degrees
  recoilRecoveryRate: number; // return rate per second
  pellets: number; // 1 for rifle/sniper, 8 for shotgun
  tracerSpeed: number; // m/s
  color: string;
  accentColor: string;
  description: string;
}

export const WEAPON_REGISTRY: Record<WeaponId, WeaponDef> = {
  m416: {
    id: "m416",
    name: "M416 Tactical",
    category: "AR",
    fireMode: "auto",
    damage: 34,
    headshotMultiplier: 2.2,
    maxRange: 160,
    fireRate: 11.2, // ~670 RPM
    magCapacity: 30,
    defaultReserve: 120,
    reloadDuration: 2.1,
    hipSpread: 2.4,
    adsSpread: 0.35,
    recoilVertical: 0.024,
    recoilHorizontal: 0.012,
    recoilRecoveryRate: 0.08,
    pellets: 1,
    tracerSpeed: 380,
    color: "#22C55E", // Emerald Green
    accentColor: "#10B981",
    description: "Versatile 5.56mm assault rifle with smooth automatic fire and fast handling.",
  },
  shotgun: {
    id: "shotgun",
    name: "S12K Tactical",
    category: "SG",
    fireMode: "semi",
    damage: 18, // per pellet (8 pellets = 144 max point-blank damage)
    headshotMultiplier: 1.5,
    maxRange: 45,
    fireRate: 2.6,
    magCapacity: 5,
    defaultReserve: 30,
    reloadDuration: 2.5,
    hipSpread: 5.8,
    adsSpread: 3.2,
    recoilVertical: 0.075,
    recoilHorizontal: 0.035,
    recoilRecoveryRate: 0.12,
    pellets: 8,
    tracerSpeed: 240,
    color: "#F59E0B", // Amber Gold
    accentColor: "#D97706",
    description: "Devastating 12-gauge close-quarters shotgun firing 8 high-velocity pellets.",
  },
  sniper: {
    id: "sniper",
    name: "AWM Magnum",
    category: "SR",
    fireMode: "bolt",
    damage: 115, // instant takedown
    headshotMultiplier: 2.5,
    maxRange: 280,
    fireRate: 0.95,
    magCapacity: 5,
    defaultReserve: 20,
    reloadDuration: 3.2,
    hipSpread: 6.5,
    adsSpread: 0.08, // laser precision in ADS
    recoilVertical: 0.11,
    recoilHorizontal: 0.025,
    recoilRecoveryRate: 0.07,
    pellets: 1,
    tracerSpeed: 520,
    color: "#EF4444", // Crimson Red
    accentColor: "#DC2626",
    description: "Extreme-range bolt-action rifle with devastating kinetic penetration.",
  },
};
