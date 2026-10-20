/**
 * Realistic Building Health, Destruction, and Structural Collapse System
 * Implements realistic physical damage thresholds, visual states, and collision updates.
 */

export type BuildingCategory = "concrete" | "wood" | "commercial" | "stall";
export type DamageStage = "intact" | "minor" | "heavy" | "collapsed";

export interface BuildingHealthConfig {
  id: string;
  nameEn: string;
  nameKm: string;
  maxHp: number;
  category: BuildingCategory;
  debrisColor: string;
  position: [number, number, number];
  rubbleSize: [number, number, number]; // width, height, depth
}

export const BUILDING_REGISTRY: Record<string, BuildingHealthConfig> = {
  // Public Institutions & Commercial Concrete
  school_main: {
    id: "school_main",
    nameEn: "Kampong Cham High School",
    nameKm: "វិទ្យាល័យកំពង់ចាម",
    maxHp: 500,
    category: "concrete",
    debrisColor: "#FAF8F2",
    position: [0, 0, -2],
    rubbleSize: [18.2, 0.9, 8.4],
  },
  town_hall: {
    id: "town_hall",
    nameEn: "Provincial Town Hall",
    nameKm: "សាលាខេត្តកំពង់ចាម",
    maxHp: 500,
    category: "concrete",
    debrisColor: "#E2E8F0",
    position: [-42, 0, -15],
    rubbleSize: [16.0, 0.9, 10.0],
  },
  hotel_main: {
    id: "hotel_main",
    nameEn: "Mekong Grand Hotel",
    nameKm: "សណ្ឋាគារមេគង្គ ហ្គ្រេន",
    maxHp: 650,
    category: "concrete",
    debrisColor: "#FAF8F2",
    position: [18, 0, -30],
    rubbleSize: [22.0, 1.2, 11.0],
  },
  hotel_wing_l: {
    id: "hotel_wing_l",
    nameEn: "Hotel West Wing",
    nameKm: "អគារស្លាបខាងលិចសណ្ឋាគារ",
    maxHp: 350,
    category: "concrete",
    debrisColor: "#FAF8F2",
    position: [6, 0, -34],
    rubbleSize: [6.0, 0.8, 10.0],
  },
  pagoda_sanctuary: {
    id: "pagoda_sanctuary",
    nameEn: "Wat Kampong Cham Sanctuary",
    nameKm: "ព្រះវិហារវត្តកំពង់ចាម",
    maxHp: 550,
    category: "concrete",
    debrisColor: "#F4E5BE",
    position: [-24, 0, 18],
    rubbleSize: [15.0, 1.1, 11.0],
  },
  pagoda_bell_tower: {
    id: "pagoda_bell_tower",
    nameEn: "Pagoda Bell Tower",
    nameKm: "ហោជួង",
    maxHp: 250,
    category: "concrete",
    debrisColor: "#D97706",
    position: [-32, 0, 11],
    rubbleSize: [4.0, 0.7, 4.0],
  },

  // Commercial Shophouses
  shophouse_block_a: {
    id: "shophouse_block_a",
    nameEn: "Central Shophouses A",
    nameKm: "ផ្ទះល្វែងពាណិជ្ជកម្ម A",
    maxHp: 380,
    category: "commercial",
    debrisColor: "#F1F5F9",
    position: [16.5, 0, -4],
    rubbleSize: [18.0, 0.85, 9.0],
  },
  shophouse_block_b: {
    id: "shophouse_block_b",
    nameEn: "Central Shophouses B",
    nameKm: "ផ្ទះល្វែងពាណិជ្ជកម្ម B",
    maxHp: 380,
    category: "commercial",
    debrisColor: "#F1F5F9",
    position: [16.5, 0, 7],
    rubbleSize: [18.0, 0.85, 9.0],
  },

  // Traditional Khmer Stilt Houses
  player_home_wall_n: {
    id: "player_home_wall_n",
    nameEn: "Player Home (North Wall)",
    nameKm: "ផ្ទះផ្ទាល់ខ្លួន",
    maxHp: 180,
    category: "wood",
    debrisColor: "#8C5B36",
    position: [-14, 0, -20],
    rubbleSize: [8.8, 0.7, 6.8],
  },
  stilt_house_neighbor_a: {
    id: "stilt_house_neighbor_a",
    nameEn: "Neighbor House A",
    nameKm: "ផ្ទះអ្នកជិតខាង A",
    maxHp: 180,
    category: "wood",
    debrisColor: "#8C5B36",
    position: [4, 0, -25],
    rubbleSize: [8.8, 0.7, 6.8],
  },
  stilt_house_neighbor_b: {
    id: "stilt_house_neighbor_b",
    nameEn: "Neighbor House B",
    nameKm: "ផ្ទះអ្នកជិតខាង B",
    maxHp: 180,
    category: "wood",
    debrisColor: "#8C5B36",
    position: [-30, 0, -36],
    rubbleSize: [8.8, 0.7, 6.8],
  },
  stilt_house_neighbor_c: {
    id: "stilt_house_neighbor_c",
    nameEn: "Neighbor House C",
    nameKm: "ផ្ទះអ្នកជិតខាង C",
    maxHp: 180,
    category: "wood",
    debrisColor: "#8C5B36",
    position: [-12, 0, -42],
    rubbleSize: [8.8, 0.7, 6.8],
  },
  stilt_house_neighbor_d: {
    id: "stilt_house_neighbor_d",
    nameEn: "Neighbor House D",
    nameKm: "ផ្ទះអ្នកជិតខាង D",
    maxHp: 180,
    category: "wood",
    debrisColor: "#8C5B36",
    position: [32, 0, -42],
    rubbleSize: [8.8, 0.7, 6.8],
  },

  // Market Stalls & Refreshment Carts
  market_stall_1: {
    id: "market_stall_1",
    nameEn: "Fruit Market Stall",
    nameKm: "តូបលក់ផ្លែឈើ",
    maxHp: 60,
    category: "stall",
    debrisColor: "#D9443A",
    position: [11, 0, -10],
    rubbleSize: [3.4, 0.45, 2.2],
  },
  market_stall_2: {
    id: "market_stall_2",
    nameEn: "Drinks Market Stall",
    nameKm: "តូបលក់ភេសជ្ជៈ",
    maxHp: 60,
    category: "stall",
    debrisColor: "#2E86C1",
    position: [15, 0, -10],
    rubbleSize: [3.4, 0.45, 2.2],
  },
  market_stall_3: {
    id: "market_stall_3",
    nameEn: "Noodle Market Stall",
    nameKm: "តូបលក់មីកូឡា",
    maxHp: 60,
    category: "stall",
    debrisColor: "#EAB308",
    position: [11, 0, -14],
    rubbleSize: [3.4, 0.45, 2.2],
  },
  market_stall_4: {
    id: "market_stall_4",
    nameEn: "Souvenir Market Stall",
    nameKm: "តូបលក់វត្ថុអនុស្សាវរីយ៍",
    maxHp: 60,
    category: "stall",
    debrisColor: "#10B981",
    position: [15, 0, -14],
    rubbleSize: [3.4, 0.45, 2.2],
  },
  coffee_stall: {
    id: "coffee_stall",
    nameEn: "Riverside Coffee Cart",
    nameKm: "រទេះកាហ្វេមាត់ទន្លេ",
    maxHp: 50,
    category: "stall",
    debrisColor: "#78350F",
    position: [-6, 0, -12],
    rubbleSize: [2.4, 0.4, 1.8],
  },

  // Sports District
  sports_clubhouse: {
    id: "sports_clubhouse",
    nameEn: "Sports Clubhouse & Lockers",
    nameKm: "ក្លឹបកីឡា",
    maxHp: 380,
    category: "commercial",
    debrisColor: "#2563EB",
    position: [6.0, 0, 78],
    rubbleSize: [10.2, 0.8, 8.2],
  },
  sports_shop_main: {
    id: "sports_shop_main",
    nameEn: "Sports Merchandise Store",
    nameKm: "ហាងលក់សម្ភារៈកីឡា",
    maxHp: 280,
    category: "commercial",
    debrisColor: "#1E293B",
    position: [18.0, 0, 78],
    rubbleSize: [6.6, 0.7, 7.6],
  },
};

/**
 * Determines damage state from HP ratio
 */
export function getBuildingDamageStage(currentHp: number, maxHp: number): DamageStage {
  if (currentHp <= 0) return "collapsed";
  const ratio = currentHp / maxHp;
  if (ratio <= 0.45) return "heavy";
  if (ratio <= 0.8) return "minor";
  return "intact";
}

/**
 * Calculate damage inflicted by vehicle ramming into a building/wall.
 * Low speed (<18 km/h) yields 0 damage (preventing minor parking taps from destroying buildings).
 */
export function calculateVehicleImpactDamage(
  vehicleType: "supercar" | "motorbike" | "bicycle" | "plane",
  speedKmh: number,
  category: BuildingCategory
): number {
  const absSpeed = Math.abs(speedKmh);
  if (absSpeed < 18) return 0; // Gentle contact threshold

  let baseDmg = 0;
  if (vehicleType === "supercar") {
    // 1400 kg car momentum: quadratic damage scaling
    baseDmg = (absSpeed / 100) ** 2 * 140;
  } else if (vehicleType === "plane") {
    // Jet plane ground impact
    baseDmg = (absSpeed / 80) ** 2 * 220;
  } else if (vehicleType === "motorbike") {
    // Motorcycle: 180 kg mass
    baseDmg = (absSpeed / 60) * 35;
  } else if (vehicleType === "bicycle") {
    // Bicycle: human momentum only
    baseDmg = (absSpeed / 25) * 15;
  }

  // Material resistance modifiers
  switch (category) {
    case "concrete":
      // Concrete resists light impacts
      if (vehicleType === "bicycle" || (vehicleType === "motorbike" && absSpeed < 35)) return 0;
      return Math.round(baseDmg * 0.75);
    case "commercial":
      if (vehicleType === "bicycle") return Math.round(baseDmg * 0.2);
      return Math.round(baseDmg * 0.9);
    case "wood":
      return Math.round(baseDmg * 1.25);
    case "stall":
      return Math.round(baseDmg * 1.8);
    default:
      return Math.round(baseDmg);
  }
}

/**
 * Calculate damage inflicted by bullet impact on building
 */
export function calculateBulletDamage(weaponId: string, category: BuildingCategory): number {
  let base = 6;
  if (weaponId === "sniper") base = 35;
  else if (weaponId === "shotgun") base = 24;
  else if (weaponId === "rifle") base = 12;
  else if (weaponId === "smg") base = 6;
  else if (weaponId === "pistol") base = 4;

  if (category === "concrete") return Math.max(1, Math.round(base * 0.5));
  if (category === "wood") return Math.round(base * 1.2);
  if (category === "stall") return Math.round(base * 1.8);
  return base;
}
