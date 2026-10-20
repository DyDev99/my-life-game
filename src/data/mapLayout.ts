// Top-down layout used by the minimap and world map.
// Rectangles are world-space centre (x, z) + size (w along X, d along Z), in metres.
// The original town's entries match the meshes in game/world/environment/Environment.tsx and
// sports-city/SportsCity.tsx (keep in sync when they move); the expanded districts come
// straight from data/cityLayout.ts.

import { LOCATION_COORDINATES, type LocationKey } from "@/data/locations";
import {
  ARENA,
  CITY_DISTRICTS,
  CITY_ROADS,
  CITY_ZONES,
  HILL_PAGODA,
  LAKE,
  RIVER,
  WORLD_BOUNDS,
  districtContaining,
} from "@/data/cityLayout";

export { WORLD_BOUNDS };

export interface MapRect {
  x: number;
  z: number;
  w: number;
  d: number;
}

const fromRect = (r: { x0: number; x1: number; z0: number; z1: number }): MapRect => ({
  x: (r.x0 + r.x1) / 2,
  z: (r.z0 + r.z1) / 2,
  w: r.x1 - r.x0,
  d: r.z1 - r.z0,
});

const ORIGINAL_ROADS: Array<MapRect & { kind: "highway" | "road" | "lane" | "path" }> = [
  { x: 25, z: 0, w: 6.8, d: 180, kind: "highway" }, // Highway 1 (incl. bridge deck)
  { x: -22.5, z: -15, w: 95, d: 5, kind: "road" }, // Heritage laterite road
  { x: -16, z: 16, w: 82, d: 6.2, kind: "road" }, // Temple Boulevard
  { x: -10, z: -38, w: 85, d: 4.2, kind: "lane" }, // North village lane
  { x: -17.5, z: 24.5, w: 85, d: 3.8, kind: "path" }, // Riverside promenade
  { x: 0, z: -7, w: 16, d: 3.8, kind: "path" }, // School courtyard path
  { x: 25, z: 64, w: 28, d: 18, kind: "road" }, // Sports City parking plaza
];

export const MAP_ROADS = [...ORIGINAL_ROADS, ...CITY_ROADS];

export const MAP_WATER: MapRect[] = [fromRect(RIVER), fromRect(LAKE)]; // Mekong River, lake

export type MapZoneKind = "rice" | "pitch" | "court" | "temple" | "plaza" | "industrial" | "runway" | "parking" | "track" | "dirt";

const ORIGINAL_ZONES: Array<MapRect & { kind: MapZoneKind }> = [
  { x: -42, z: 18, w: 18, d: 18, kind: "rice" },
  { x: -48, z: 4, w: 18, d: 18, kind: "rice" },
  { x: -24, z: 18, w: 26, d: 17, kind: "temple" },
  { x: -26, z: 95, w: 42, d: 60, kind: "pitch" },
  { x: 26, z: 92, w: 14, d: 24, kind: "court" },
  { x: 54, z: 92, w: 14, d: 22, kind: "pitch" },
  { x: 26, z: 114, w: 14, d: 12, kind: "court" },
];

const GROUND_ZONE: Record<string, MapZoneKind | undefined> = { plaza: "plaza", asphalt: "industrial", dirt: "dirt" };

// District grounds first, then the details drawn on top of them
export const MAP_ZONES: Array<MapRect & { kind: MapZoneKind }> = [
  ...CITY_DISTRICTS.flatMap((d) => {
    const kind = GROUND_ZONE[d.ground];
    return kind ? [{ ...fromRect(d), kind }] : [];
  }),
  ...CITY_ZONES.filter((z) => z.kind !== "plaza" && z.kind !== "industrial"),
  { x: HILL_PAGODA.x, z: HILL_PAGODA.z, w: 40, d: 32, kind: "temple" },
  ...ORIGINAL_ZONES,
];

export interface MapPoi {
  id: string;
  icon: string;
  nameEn: string;
  nameKm: string;
  x: number;
  z: number;
  /** Original story location (fast travel uses moveToLocation); otherwise a plain teleport. */
  location?: LocationKey;
}

const fromLocation = (location: LocationKey, icon: string, nameEn: string, nameKm: string): MapPoi => {
  const [x, , z] = LOCATION_COORDINATES[location];
  return { id: location, icon, nameEn, nameKm, x, z, location };
};

// Fast-travel points for new places sit on roads, clear of colliders
export const MAP_POIS: MapPoi[] = [
  fromLocation("home", "🏠", "Home", "ផ្ទះ"),
  fromLocation("school", "🎓", "School", "សាលា"),
  fromLocation("market", "🛒", "Market", "ផ្សារ"),
  fromLocation("cafe", "☕", "Riverside Cafe", "តូបកាហ្វេ"),
  fromLocation("pagoda", "🛕", "Pagoda", "វត្តអារាម"),
  fromLocation("ricefield", "🌾", "Rice Fields", "វាលស្រែ"),
  fromLocation("hotel", "🏨", "Grand Hotel", "សណ្ឋាគារ"),
  fromLocation("townhall", "🏛️", "Town Hall", "សាលាខេត្ត"),
  fromLocation("stadium", "⚽", "Football Stadium", "ពហុកីឡដ្ឋាន"),
  fromLocation("volleyball", "🏐", "Volleyball Court", "តារាងបាល់ទះ"),
  { id: "downtown", icon: "🏙️", nameEn: "Downtown", nameKm: "កណ្តាលក្រុងថ្មី", x: 110, z: -175 },
  { id: "hill_pagoda", icon: "🛕", nameEn: HILL_PAGODA.nameEn, nameKm: HILL_PAGODA.nameKm, x: HILL_PAGODA.x, z: HILL_PAGODA.z + 13 },
  { id: "north_residential", icon: "🏘️", nameEn: "North Residential", nameKm: "តំបន់លំនៅដ្ឋានខាងជើង", x: -110, z: -175 },
  { id: "industrial", icon: "🏭", nameEn: "Industrial Zone", nameKm: "តំបន់ឧស្សាហកម្ម", x: 110, z: -40 },
  { id: "farmland", icon: "🌾", nameEn: "West Farmland", nameKm: "វាលស្រែខាងលិច", x: -110, z: -40 },
  { id: "orchards", icon: "🥭", nameEn: "Mango Orchards", nameKm: "ចម្ការស្វាយ", x: -110, z: 95 },
  { id: "port", icon: "⚓", nameEn: "River Port", nameKm: "កំពង់ផែ", x: 110, z: 95 },
  { id: "lakeside", icon: "🏡", nameEn: "Lakeside Villas", nameKm: "វីឡាមាត់បឹង", x: -160, z: 140 },
  { id: "market_town", icon: "🛍️", nameEn: "South Market Town", nameKm: "ផ្សារខាងត្បូង", x: -17, z: 140 },
  { id: "airfield", icon: "🛫", nameEn: "Airfield", nameKm: "អាកាសយានដ្ឋាន", x: 60, z: 150 },
  { id: "arena", icon: "🏟️", nameEn: ARENA.nameEn, nameKm: ARENA.nameKm, x: ARENA.x, z: 140 },
];

/** Named area the point is in, for the minimap caption. */
export function districtAt(x: number, z: number): { en: string; km: string } {
  const d = districtContaining(x, z);
  if (d) return { en: d.nameEn, km: d.nameKm };
  if (z > RIVER.z0 && z < RIVER.z1) return { en: "Mekong River", km: "ទន្លេមេគង្គ" };
  if (z >= RIVER.z1 && z < 136 && x > -60 && x < 66) return { en: "Sports City", km: "ក្រុងកីឡា" };
  if (z < -28 && z > -92 && x > -106 && x < 40) return { en: "North Village", km: "ភូមិខាងជើង" };
  if (x > 8 && x < 106 && z > -92 && z < RIVER.z0) return { en: "Old Downtown", km: "កណ្តាលក្រុងចាស់" };
  if (x < -32 && x > -106 && z > -92 && z < RIVER.z0) return { en: "Countryside", km: "ជនបទ" };
  if (x > -106 && x < 106 && z > -92 && z < RIVER.z0) return { en: "Old Town", km: "ទីក្រុងចាស់" };
  return { en: "Kampong Cham", km: "កំពង់ចាម" };
}
