// Expanded Kampong Cham: new districts around the original town (which is unchanged).
// Single source of truth for the 3D city (game/world/expansion), colliders
// (physics/collisionSystem), the minimap/world map (data/mapLayout) and movement bounds.
// Everything is generated deterministically from fixed seeds, so it is identical on
// every load and safe to compute at module scope.
//
// World: X [-270, 270] × Z [-250, 280] = 540 × 530 m ≈ 5.2× the original 240 × 230 m.

export interface Rect {
  x0: number;
  x1: number;
  z0: number;
  z1: number;
}

export type DistrictStyle =
  | "downtown"
  | "residential"
  | "industrial"
  | "farmland"
  | "orchard"
  | "lakeside"
  | "market"
  | "airfield"
  | "olympic"
  | "port"
  | "park";

export type GroundKind = "grass" | "plaza" | "asphalt" | "dirt";

export interface CityDistrict extends Rect {
  id: string;
  nameEn: string;
  nameKm: string;
  style: DistrictStyle;
  ground: GroundKind;
  /** Internal street grid spacing in metres; omit for no internal streets. */
  streetSpacing?: number;
}

export type BuildingStyle = "tower" | "midrise" | "house" | "warehouse" | "farmhouse" | "hangar" | "civic";

export interface CityBuilding {
  id: string;
  district: string;
  name: string;
  x: number; // footprint centre
  z: number;
  w: number; // along X
  d: number; // along Z
  h: number;
  color: string;
  style: BuildingStyle;
  /** Collider only; drawn by a dedicated landmark mesh instead of the instanced city. */
  hidden?: boolean;
}

export interface CityTree {
  district: string;
  x: number;
  z: number;
  scale: number;
  kind: "palm" | "broadleaf";
}

export type RoadKind = "highway" | "road" | "lane" | "path";

export interface CityRoad {
  x: number; // centre
  z: number;
  w: number; // along X
  d: number; // along Z
  kind: RoadKind;
  /** Draw dashed centre line */
  dashed?: boolean;
}

export type ZoneKind = "rice" | "pitch" | "court" | "temple" | "plaza" | "industrial" | "runway" | "parking" | "track";

export interface CityZone {
  x: number;
  z: number;
  w: number;
  d: number;
  kind: ZoneKind;
  district?: string;
}

export const WORLD_BOUNDS = { minX: -270, maxX: 270, minZ: -250, maxZ: 280 };

/** The original hand-built town (Environment.tsx ground plane). */
export const ORIGINAL_TOWN: Rect = { x0: -120, x1: 120, z0: -85, z1: 145 };

/** Mekong River band (water surface), spanning the full world width. */
export const RIVER: Rect = { x0: WORLD_BOUNDS.minX, x1: WORLD_BOUNDS.maxX, z0: 24, z1: 52 };

/** Low causeway bridges carrying the east/west connectors over the river. */
export const CAUSEWAYS = [
  { x: -110, w: 10 },
  { x: 110, w: 10 },
];

// ---------------------------------------------------------------------------
// Arterial roads (connect the new districts to the original road network)
// ---------------------------------------------------------------------------
const rectRoad = (x0: number, x1: number, z0: number, z1: number, kind: RoadKind, dashed = false): CityRoad => ({
  x: (x0 + x1) / 2,
  z: (z0 + z1) / 2,
  w: x1 - x0,
  d: z1 - z0,
  kind,
  dashed,
});

const ARTERIALS: CityRoad[] = [
  rectRoad(21.6, 28.4, -250, -90, "highway", true), // Highway 1 north extension
  rectRoad(21.6, 28.4, 136, 280, "highway", true), // Highway 1 south to the airfield
  rectRoad(-266, 266, -104, -96, "highway", true), // North Ring Avenue
  rectRoad(-266, 266, 136, 144, "highway", true), // South Ring Avenue
  rectRoad(106.5, 113.5, -250, 280, "road", true), // East Connector (causeway over the river)
  rectRoad(-113.5, -106.5, -250, 280, "road", true), // West Connector (causeway over the river)
  rectRoad(28.4, 106.5, -18, -12, "road"), // Heritage road east to the East Connector
  rectRoad(-106.5, -70, -17.5, -12.5, "road"), // Heritage road west to the West Connector
  rectRoad(-106.5, -57, 12.9, 19.1, "road"), // Temple Boulevard west
  rectRoad(37, 43, 73, 136, "road"), // Sports City south gate to the South Ring
];

// ---------------------------------------------------------------------------
// Districts
// ---------------------------------------------------------------------------
export const CITY_DISTRICTS: CityDistrict[] = [
  { id: "downtown", nameEn: "Downtown", nameKm: "កណ្តាលក្រុងថ្មី", style: "downtown", ground: "plaza", streetSpacing: 44, x0: 30, x1: 262, z0: -246, z1: -106 },
  { id: "north_residential", nameEn: "North Residential", nameKm: "តំបន់លំនៅដ្ឋានខាងជើង", style: "residential", ground: "grass", streetSpacing: 36, x0: -262, x1: 18, z0: -246, z1: -106 },
  { id: "industrial", nameEn: "Industrial Zone", nameKm: "តំបន់ឧស្សាហកម្ម", style: "industrial", ground: "asphalt", streetSpacing: 56, x0: 118, x1: 262, z0: -92, z1: 20 },
  { id: "mekong_park", nameEn: "Mekong Park", nameKm: "សួនមេគង្គ", style: "park", ground: "grass", x0: 40, x1: 104, z0: -92, z1: -50 },
  { id: "farmland", nameEn: "West Farmland", nameKm: "វាលស្រែខាងលិច", style: "farmland", ground: "grass", x0: -262, x1: -118, z0: -92, z1: 20 },
  { id: "orchards", nameEn: "Mango Orchards", nameKm: "ចម្ការស្វាយ", style: "orchard", ground: "dirt", x0: -262, x1: -118, z0: 58, z1: 132 },
  { id: "port", nameEn: "River Port", nameKm: "កំពង់ផែ", style: "port", ground: "asphalt", streetSpacing: 60, x0: 66, x1: 262, z0: 58, z1: 132 },
  { id: "lakeside", nameEn: "Lakeside Villas", nameKm: "វីឡាមាត់បឹង", style: "lakeside", ground: "grass", streetSpacing: 40, x0: -262, x1: -60, z0: 148, z1: 274 },
  { id: "market_town", nameEn: "South Market Town", nameKm: "ផ្សារខាងត្បូង", style: "market", ground: "plaza", streetSpacing: 34, x0: -54, x1: 19, z0: 148, z1: 274 },
  { id: "airfield", nameEn: "Kampong Cham Airfield", nameKm: "អាកាសយានដ្ឋាន", style: "airfield", ground: "grass", x0: 31, x1: 104, z0: 148, z1: 274 },
  { id: "olympic", nameEn: "Olympic Park", nameKm: "សួនអូឡាំពិក", style: "olympic", ground: "plaza", x0: 118, x1: 262, z0: 148, z1: 274 },
];

// Hand-placed landmarks (areas kept free of generated buildings)
export const HILL_PAGODA = { x: -70, z: -176, nameEn: "Wat Nokor Bachey", nameKm: "វត្តនគរបាជ័យ" };
export const ARENA = { x: 196, z: 214, radius: 36, nameEn: "Olympic Arena", nameKm: "កីឡដ្ឋានអូឡាំពិក" };
export const LAKE: Rect = { x0: -205, x1: -120, z0: 182, z1: 240 };
export const RUNWAY = { x: 60, z: 210, w: 24, d: 116 };

const RESERVED: Rect[] = [
  { x0: HILL_PAGODA.x - 22, x1: HILL_PAGODA.x + 22, z0: HILL_PAGODA.z - 18, z1: HILL_PAGODA.z + 18 },
  { x0: ARENA.x - ARENA.radius - 6, x1: ARENA.x + ARENA.radius + 6, z0: ARENA.z - ARENA.radius - 6, z1: ARENA.z + ARENA.radius + 6 },
  { x0: LAKE.x0 - 4, x1: LAKE.x1 + 4, z0: LAKE.z0 - 4, z1: LAKE.z1 + 4 },
  { x0: RUNWAY.x - RUNWAY.w / 2 - 6, x1: RUNWAY.x + RUNWAY.w / 2 + 6, z0: RUNWAY.z - RUNWAY.d / 2 - 4, z1: RUNWAY.z + RUNWAY.d / 2 + 4 },
];

// ---------------------------------------------------------------------------
// Generation helpers
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const roadRect = (r: CityRoad, pad = 0): Rect => ({
  x0: r.x - r.w / 2 - pad,
  x1: r.x + r.w / 2 + pad,
  z0: r.z - r.d / 2 - pad,
  z1: r.z + r.d / 2 + pad,
});

const overlaps = (a: Rect, b: Rect) => a.x0 < b.x1 && a.x1 > b.x0 && a.z0 < b.z1 && a.z1 > b.z0;

const PALETTES: Record<BuildingStyle, string[]> = {
  tower: ["#5b7a99", "#7f93a8", "#a7b4c2", "#3d5a73", "#8aa3b5", "#c3ccd4"],
  midrise: ["#e3d5b8", "#d9c7a7", "#c98f6b", "#b7c4a0", "#e8c39e", "#a9c2c9", "#f0e2c8"],
  house: ["#f2d7a6", "#e8b4a0", "#cfe0c3", "#f5e6c8", "#b9d3e0", "#efc88b"],
  warehouse: ["#8d99a6", "#a3aab3", "#6f7d8c", "#b5653f", "#9aa47c", "#c2c6cb"],
  farmhouse: ["#8b5a2b", "#a0693a", "#7a4b23"],
  hangar: ["#9aa3ab", "#b8bec4"],
  civic: ["#d8c9a3", "#e6dcc4"],
};

// ---------------------------------------------------------------------------
// Generate streets, buildings, trees and zones
// ---------------------------------------------------------------------------
function generate() {
  const roads: CityRoad[] = [...ARTERIALS];
  const buildings: CityBuilding[] = [];
  const trees: CityTree[] = [];
  const zones: CityZone[] = [];

  const STREET_W = 5;
  const SIDEWALK = 2.5;
  // Street centre lines per district, used to cut the district into blocks
  const cuts = new Map<string, { xs: number[]; zs: number[] }>();

  for (const dist of CITY_DISTRICTS) {
    const c = { xs: [] as number[], zs: [] as number[] };
    cuts.set(dist.id, c);
    if (!dist.streetSpacing) continue;
    const s = dist.streetSpacing;
    for (let x = dist.x0 + s; x < dist.x1 - s / 2; x += s) {
      const street = rectRoad(x - STREET_W / 2, x + STREET_W / 2, dist.z0, dist.z1, "lane");
      if (!RESERVED.some((r) => overlaps(roadRect(street), r))) roads.push(street);
      c.xs.push(x); // blocks still split here even if the street was dropped
    }
    for (let z = dist.z0 + s; z < dist.z1 - s / 2; z += s) {
      const street = rectRoad(dist.x0, dist.x1, z - STREET_W / 2, z + STREET_W / 2, "lane");
      if (!RESERVED.some((r) => overlaps(roadRect(street), r))) roads.push(street);
      c.zs.push(z);
    }
  }

  /** [start, end] intervals between district edges and street cuts. */
  const intervals = (lo: number, hi: number, cutsAt: number[]) => {
    const out: Array<[number, number]> = [];
    let start = lo;
    for (const c of cutsAt) {
      out.push([start, c - STREET_W / 2 - SIDEWALK]);
      start = c + STREET_W / 2 + SIDEWALK;
    }
    out.push([start, hi]);
    return out.filter(([a, b]) => b - a > 4);
  };

  /** Evenly fit lots of roughly `lot` metres (separated by `gap`) into [a, b]. */
  const fitLots = (a: number, b: number, lot: number, gap: number) => {
    const len = b - a;
    const n = Math.max(1, Math.round((len + gap) / (lot + gap)));
    const size = (len - (n - 1) * gap) / n;
    return Array.from({ length: n }, (_, i) => ({ c: a + size / 2 + i * (size + gap), size }));
  };

  const blocked = (r: Rect) =>
    RESERVED.some((x) => overlaps(r, x)) || roads.some((road) => overlaps(r, roadRect(road, 2.5)));

  const place = (
    dist: CityDistrict,
    rand: () => number,
    lot: number,
    gap: number,
    make: (cx: number, cz: number, lotSize: number) => Omit<CityBuilding, "id" | "district" | "name"> | "tree" | null
  ) => {
    const c = cuts.get(dist.id)!;
    const lots: Array<{ cx: number; cz: number; size: number }> = [];
    for (const [xa, xb] of intervals(dist.x0 + gap, dist.x1 - gap, c.xs))
      for (const [za, zb] of intervals(dist.z0 + gap, dist.z1 - gap, c.zs))
        for (const lx of fitLots(xa, xb, lot, gap))
          for (const lz of fitLots(za, zb, lot, gap)) lots.push({ cx: lx.c, cz: lz.c, size: Math.min(lx.size, lz.size) });

    for (const { cx, cz, size } of lots) {
      {
        const made = make(cx, cz, size);
        if (!made) continue;
        if (made === "tree") {
          const r: Rect = { x0: cx - 2, x1: cx + 2, z0: cz - 2, z1: cz + 2 };
          if (!blocked(r)) trees.push({ district: dist.id, x: cx, z: cz, scale: 0.8 + rand() * 0.6, kind: rand() < 0.5 ? "palm" : "broadleaf" });
          continue;
        }
        const r: Rect = { x0: made.x - made.w / 2, x1: made.x + made.w / 2, z0: made.z - made.d / 2, z1: made.z + made.d / 2 };
        if (blocked(r)) continue;
        buildings.push({ ...made, id: `city_${dist.id}_${buildings.length}`, district: dist.id, name: `${dist.nameEn} building` });
      }
    }
  };

  const pick = <T,>(rand: () => number, arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const jitter = (rand: () => number, amount: number) => (rand() - 0.5) * 2 * amount;

  for (const dist of CITY_DISTRICTS) {
    const rand = mulberry32(hashString(dist.id));
    const cx = (dist.x0 + dist.x1) / 2;
    const cz = (dist.z0 + dist.z1) / 2;
    const halfDiag = Math.hypot(dist.x1 - dist.x0, dist.z1 - dist.z0) / 2;

    switch (dist.style) {
      case "downtown":
        zones.push({ x: cx, z: cz, w: dist.x1 - dist.x0, d: dist.z1 - dist.z0, kind: "plaza", district: dist.id });
        place(dist, rand, 17, 4, (x, z, lot) => {
          // Taller towards the centre of downtown
          const centrality = 1 - Math.min(1, Math.hypot(x - cx, z - cz) / halfDiag);
          const tower = rand() < 0.35 + centrality * 0.5;
          const w = lot * (0.7 + rand() * 0.3);
          const d = lot * (0.7 + rand() * 0.3);
          return tower
            ? { x: x + jitter(rand, 1), z: z + jitter(rand, 1), w, d, h: 22 + centrality * 48 * (0.5 + rand() * 0.5), color: pick(rand, PALETTES.tower), style: "tower" }
            : { x, z, w, d, h: 9 + rand() * 12, color: pick(rand, PALETTES.midrise), style: "midrise" };
        });
        break;

      case "market":
        place(dist, rand, 8, 2, (x, z, lot) =>
          rand() < 0.08 ? "tree" : { x, z, w: lot, d: lot * (0.8 + rand() * 0.2), h: 7 + rand() * 8, color: pick(rand, PALETTES.midrise), style: "midrise" }
        );
        break;

      case "residential":
      case "lakeside":
        place(dist, rand, 8, 3, (x, z, lot) => {
          const roll = rand();
          if (roll < 0.22) return "tree";
          if (roll < 0.3) return null; // garden lot
          const w = lot * (0.75 + rand() * 0.2);
          return { x: x + jitter(rand, 0.8), z: z + jitter(rand, 0.8), w, d: w * (0.8 + rand() * 0.3), h: 4 + rand() * (dist.style === "lakeside" ? 4 : 2.5), color: pick(rand, PALETTES.house), style: "house" };
        });
        break;

      case "industrial":
      case "port":
        zones.push({ x: cx, z: cz, w: dist.x1 - dist.x0, d: dist.z1 - dist.z0, kind: "industrial", district: dist.id });
        place(dist, rand, 22, 6, (x, z, lot) =>
          rand() < 0.15
            ? null
            : { x, z, w: lot * (0.75 + rand() * 0.25), d: lot * (0.55 + rand() * 0.35), h: 7 + rand() * 6, color: pick(rand, PALETTES.warehouse), style: "warehouse" }
        );
        break;

      case "farmland":
        place(dist, rand, 18, 4, (x, z, lot) => {
          const roll = rand();
          if (roll < 0.62) {
            zones.push({ x, z, w: lot, d: lot, kind: "rice", district: dist.id });
            return null;
          }
          if (roll < 0.74) return { x, z, w: 6, d: 5, h: 5, color: pick(rand, PALETTES.farmhouse), style: "farmhouse" };
          return "tree";
        });
        break;

      case "orchard":
        place(dist, rand, 6, 3, () => (rand() < 0.85 ? "tree" : null));
        break;

      case "park":
        place(dist, rand, 7, 4, () => (rand() < 0.45 ? "tree" : null));
        break;

      case "airfield": {
        zones.push({ ...RUNWAY, kind: "runway", district: dist.id });
        const hangars = [165, 195, 225, 255];
        hangars.forEach((z, i) =>
          buildings.push({ id: `city_airfield_hangar_${i}`, district: dist.id, name: "Airfield Hangar", x: 92, z, w: 16, d: 22, h: 9, color: pick(rand, PALETTES.hangar), style: "hangar" })
        );
        buildings.push({ id: "city_airfield_tower", district: dist.id, name: "Control Tower", x: 38, z: 160, w: 6, d: 6, h: 18, color: "#e6e9ec", style: "civic" });
        buildings.push({ id: "city_airfield_terminal", district: dist.id, name: "Airfield Terminal", x: 38, z: 190, w: 9, d: 30, h: 7, color: "#d7dde2", style: "civic" });
        break;
      }

      case "olympic": {
        zones.push({ x: cx, z: cz, w: dist.x1 - dist.x0, d: dist.z1 - dist.z0, kind: "plaza", district: dist.id });
        zones.push({ x: ARENA.x, z: ARENA.z, w: ARENA.radius * 2 + 8, d: ARENA.radius * 2 + 8, kind: "track", district: dist.id });
        zones.push({ x: 140, z: 250, w: 36, d: 34, kind: "parking", district: dist.id });
        buildings.push({ id: "city_olympic_aquatics", district: dist.id, name: "Aquatics Centre", x: 150, z: 168, w: 40, d: 26, h: 12, color: "#cfe3ee", style: "civic" });
        buildings.push({ id: "city_olympic_gym", district: dist.id, name: "Indoor Sports Hall", x: 242, z: 168, w: 28, d: 22, h: 14, color: "#d8c9a3", style: "civic" });
        // Arena bowl collider approximated by four boxes around the oval (entrances at the axes)
        const r = ARENA.radius;
        const t = 8;
        buildings.push({ id: "city_olympic_arena_n", district: dist.id, name: ARENA.nameEn, x: ARENA.x, z: ARENA.z - r + t / 2, w: r * 1.4, d: t, h: 16, color: "#e8e8e8", style: "civic", hidden: true });
        buildings.push({ id: "city_olympic_arena_s", district: dist.id, name: ARENA.nameEn, x: ARENA.x, z: ARENA.z + r - t / 2, w: r * 1.4, d: t, h: 16, color: "#e8e8e8", style: "civic", hidden: true });
        buildings.push({ id: "city_olympic_arena_w", district: dist.id, name: ARENA.nameEn, x: ARENA.x - r + t / 2, z: ARENA.z, w: t, d: r * 1.4, h: 16, color: "#e8e8e8", style: "civic", hidden: true });
        buildings.push({ id: "city_olympic_arena_e", district: dist.id, name: ARENA.nameEn, x: ARENA.x + r - t / 2, z: ARENA.z, w: t, d: r * 1.4, h: 16, color: "#e8e8e8", style: "civic", hidden: true });
        for (let i = 0; i < 26; i++) {
          const x = dist.x0 + 6 + rand() * (dist.x1 - dist.x0 - 12);
          const z = dist.z0 + 6 + rand() * (dist.z1 - dist.z0 - 12);
          if (!blocked({ x0: x - 2, x1: x + 2, z0: z - 2, z1: z + 2 }) && !buildings.some((b) => Math.abs(b.x - x) < b.w / 2 + 3 && Math.abs(b.z - z) < b.d / 2 + 3))
            trees.push({ district: dist.id, x, z, scale: 0.9 + rand() * 0.4, kind: "palm" });
        }
        break;
      }
    }
  }

  // Hill pagoda (rendered with the original PagodaBuilding / BuddhistStupa components)
  const hp = HILL_PAGODA;
  buildings.push({ id: "city_hill_pagoda", district: "north_residential", name: hp.nameEn, x: hp.x, z: hp.z, w: 15, d: 11, h: 16, color: "#d4a017", style: "civic", hidden: true });
  [-6, 6].forEach((dz, i) =>
    buildings.push({ id: `city_hill_pagoda_stupa_${i}`, district: "north_residential", name: "Golden Stupa", x: hp.x + 12, z: hp.z + dz, w: 3, d: 3, h: 12, color: "#d4a017", style: "civic", hidden: true })
  );

  // Street lamps along the arterial avenues (one side, every 32 m)
  const lamps: Array<{ x: number; z: number }> = [];
  for (const r of ARTERIALS.filter((a) => a.kind === "highway")) {
    const alongX = r.w > r.d;
    const len = alongX ? r.w : r.d;
    for (let s = -len / 2 + 8; s < len / 2 - 8; s += 32) {
      const x = alongX ? r.x + s : r.x + r.w / 2 + 1.6;
      const z = alongX ? r.z + r.d / 2 + 1.6 : r.z + s;
      if (overlaps({ x0: x - 1, x1: x + 1, z0: z - 1, z1: z + 1 }, ORIGINAL_TOWN)) continue;
      if (z > RIVER.z0 - 2 && z < RIVER.z1 + 2) continue;
      if (roads.some((road) => road !== r && overlaps({ x0: x - 0.5, x1: x + 0.5, z0: z - 0.5, z1: z + 0.5 }, roadRect(road)))) continue;
      lamps.push({ x, z });
    }
  }

  return { roads, buildings, trees, zones, lamps };
}

const GENERATED = generate();

/** New roads only (the original town's roads live in data/mapLayout.ts). */
export const CITY_ROADS: CityRoad[] = GENERATED.roads;
export const CITY_BUILDINGS: CityBuilding[] = GENERATED.buildings;
export const CITY_TREES: CityTree[] = GENERATED.trees;
export const CITY_ZONES: CityZone[] = GENERATED.zones;
export const CITY_LAMPS = GENERATED.lamps;

/** Districts within `radius` metres of (x, z), measured to the district's edge. */
export function distanceToRect(r: Rect, x: number, z: number) {
  const dx = Math.max(r.x0 - x, 0, x - r.x1);
  const dz = Math.max(r.z0 - z, 0, z - r.z1);
  return Math.hypot(dx, dz);
}

export function districtContaining(x: number, z: number): CityDistrict | null {
  return CITY_DISTRICTS.find((d) => x >= d.x0 && x <= d.x1 && z >= d.z0 && z <= d.z1) ?? null;
}
