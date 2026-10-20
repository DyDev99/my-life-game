"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, type DamagedBuildingState } from "@/state/gameStore";
import {
  ARENA,
  CAUSEWAYS,
  CITY_BUILDINGS,
  CITY_DISTRICTS,
  CITY_LAMPS,
  CITY_ROADS,
  CITY_TREES,
  CITY_ZONES,
  HILL_PAGODA,
  LAKE,
  ORIGINAL_TOWN,
  RIVER,
  WORLD_BOUNDS,
  distanceToRect,
  type CityBuilding,
  type CityDistrict,
  type CityRoad,
  type CityTree,
  type CityZone,
  type GroundKind,
  type Rect,
} from "@/data/cityLayout";
import { BuddhistStupa } from "@/game/world/buildings/Buildings";
import { makeWindowMaterial, nightUniform } from "@/game/world/expansion/cityMaterials";
import { districtViewDistance } from "@/game/world/expansion/viewDistance";
import { ExpandedTraffic } from "@/game/world/expansion/ExpandedTraffic";

// ---------------------------------------------------------------------------
// Shared geometry & materials (one instance each for the whole city)
// ---------------------------------------------------------------------------
const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0); // base at y = 0
const CENTRED_BOX = new THREE.BoxGeometry(1, 1, 1);
const PYRAMID = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1).rotateY(Math.PI / 4).translate(0, 0.5, 0);
const TRUNK = new THREE.CylinderGeometry(0.12, 0.2, 1, 6).translate(0, 0.5, 0);
const PALM_CROWN = new THREE.ConeGeometry(1, 0.7, 8).rotateX(Math.PI).translate(0, 0.1, 0);
const LEAF_CROWN = new THREE.IcosahedronGeometry(1, 0);
const LAMP_POLE = new THREE.CylinderGeometry(0.09, 0.14, 1, 6).translate(0, 0.5, 0);

const MAT = {
  windowsTower: makeWindowMaterial(2.6, 3.4, 0.45),
  windowsMidrise: makeWindowMaterial(2.4, 3.0, 0.75),
  plain: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.85 }),
  roof: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.8 }),
  ground: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.95 }),
  road: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9 }),
  dash: new THREE.MeshStandardMaterial({ color: "#f5f5f0", roughness: 0.6 }),
  trunk: new THREE.MeshStandardMaterial({ color: "#7a5a3a", roughness: 0.95 }),
  foliage: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.9, flatShading: true }),
  lampPole: new THREE.MeshStandardMaterial({ color: "#40434d", roughness: 0.7 }),
  lampHead: new THREE.MeshStandardMaterial({ color: "#fff4d6", emissive: "#ffd580", emissiveIntensity: 0 }),
};

const GRASS = "#76A84C";
const GROUND_COLORS: Record<Exclude<GroundKind, "grass">, string> = { plaza: "#b9b5ab", asphalt: "#6e7378", dirt: "#a77f55" };
const ZONE_COLORS: Partial<Record<CityZone["kind"], string>> = { rice: "#8db255", runway: "#3a3f45", parking: "#4f555c" };
const ROAD_STYLE: Record<CityRoad["kind"], { color: string; lift: number }> = {
  path: { color: "#8c8f93", lift: 0 },
  lane: { color: "#5d6166", lift: 0.002 },
  road: { color: "#4a4e53", lift: 0.006 },
  highway: { color: "#3c4045", lift: 0.01 },
};
const ROAD_TOP = 0; // matches the original town's asphalt (y -0.04, height 0.08)

const tmpObj = new THREE.Object3D();
const tmpColor = new THREE.Color();

// ---------------------------------------------------------------------------
// Generic instanced layer
// ---------------------------------------------------------------------------
type Writer<T> = (item: T, o: THREE.Object3D, c: THREE.Color) => void;

function Instances<T>({
  items,
  geometry,
  material,
  write,
  version = 0,
  castShadow = false,
  receiveShadow = true,
}: {
  items: T[];
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  write: Writer<T>;
  /** Bump to rewrite matrices/colours (e.g. damage changed) */
  version?: number | string;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    items.forEach((item, i) => {
      tmpObj.position.set(0, 0, 0);
      tmpObj.rotation.set(0, 0, 0);
      tmpObj.scale.set(1, 1, 1);
      tmpColor.set("#ffffff");
      write(item, tmpObj, tmpColor);
      tmpObj.updateMatrix();
      mesh.setMatrixAt(i, tmpObj.matrix);
      mesh.setColorAt(i, tmpColor);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere(); // per-district culling
  }, [items, write, version]);

  if (!items.length) return null;
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow={castShadow} receiveShadow={receiveShadow} />;
}

const rectBox = (r: Rect, y: number, h: number): Writer<unknown> => (_, o) => {
  o.position.set((r.x0 + r.x1) / 2, y, (r.z0 + r.z1) / 2);
  o.scale.set(r.x1 - r.x0, h, r.z1 - r.z0);
};

// ---------------------------------------------------------------------------
// Ground, river extension, lake, causeways
// ---------------------------------------------------------------------------
const B = WORLD_BOUNDS;
const T = ORIGINAL_TOWN;
// Grass tiles around the original ground plane, leaving the river band open
const GROUND_TILES: Rect[] = [
  { x0: B.minX, x1: B.maxX, z0: B.minZ, z1: T.z0 },
  { x0: B.minX, x1: B.maxX, z0: T.z1, z1: B.maxZ },
  { x0: B.minX, x1: T.x0, z0: T.z0, z1: RIVER.z0 },
  { x0: B.minX, x1: T.x0, z0: RIVER.z1, z1: T.z1 },
  { x0: T.x1, x1: B.maxX, z0: T.z0, z1: RIVER.z0 },
  { x0: T.x1, x1: B.maxX, z0: RIVER.z1, z1: T.z1 },
];
const RIVER_SPANS: Rect[] = [
  { ...RIVER, x1: T.x0 },
  { ...RIVER, x0: T.x1 },
];

const writeGroundTile: Writer<Rect> = (r, o, c) => {
  rectBox(r, -0.15, 0.2)(r, o, c);
  c.set(GRASS);
};
const DISTRICT_GROUNDS = CITY_DISTRICTS.filter((d) => d.ground !== "grass");
const writeDistrictGround: Writer<CityDistrict> = (d, o, c) => {
  rectBox(d, -0.03, 0.03)(d, o, c);
  c.set(GROUND_COLORS[d.ground as Exclude<GroundKind, "grass">]);
};
const FLAT_ZONES = CITY_ZONES.filter((z) => ZONE_COLORS[z.kind]);
const writeZone: Writer<CityZone> = (z, o, c) => {
  o.position.set(z.x, -0.012, z.z);
  o.scale.set(z.w, 0.02, z.d);
  c.set(ZONE_COLORS[z.kind]!);
};

function Terrain() {
  return (
    <group>
      <Instances items={GROUND_TILES} geometry={CENTRED_BOX} material={MAT.ground} write={writeGroundTile} />
      <Instances items={DISTRICT_GROUNDS} geometry={CENTRED_BOX} material={MAT.ground} write={writeDistrictGround} />
      <Instances items={FLAT_ZONES} geometry={CENTRED_BOX} material={MAT.ground} write={writeZone} />

      {/* Mekong River continues east and west of the original town */}
      {RIVER_SPANS.map((r, i) => {
        const cx = (r.x0 + r.x1) / 2;
        const cz = (r.z0 + r.z1) / 2;
        const w = r.x1 - r.x0;
        return (
          <group key={i} position={[cx, 0, cz]}>
            <mesh position={[0, -1.2, 0]} receiveShadow>
              <boxGeometry args={[w, 0.4, 28]} />
              <meshStandardMaterial color="#2F6C92" roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.25, 0]} receiveShadow>
              <boxGeometry args={[w, 0.1, 26]} />
              <meshStandardMaterial color="#3F82A8" roughness={0.15} metalness={0.3} transparent opacity={0.92} />
            </mesh>
            {[-13.5, 13.5].map((dz) => (
              <mesh key={dz} position={[0, -0.05, dz]} rotation={[dz < 0 ? 0.2 : -0.2, 0, 0]}>
                <boxGeometry args={[w, 0.6, 3.2]} />
                <meshStandardMaterial color="#C98E5A" roughness={0.9} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Lakeside Villas lake */}
      <mesh position={[(LAKE.x0 + LAKE.x1) / 2, -0.035, (LAKE.z0 + LAKE.z1) / 2]} receiveShadow>
        <boxGeometry args={[LAKE.x1 - LAKE.x0 + 6, 0.03, LAKE.z1 - LAKE.z0 + 6]} />
        <meshStandardMaterial color="#d8c08a" roughness={0.95} />
      </mesh>
      <mesh position={[(LAKE.x0 + LAKE.x1) / 2, -0.012, (LAKE.z0 + LAKE.z1) / 2]}>
        <boxGeometry args={[LAKE.x1 - LAKE.x0, 0.03, LAKE.z1 - LAKE.z0]} />
        <meshStandardMaterial color="#3F82A8" roughness={0.12} metalness={0.3} />
      </mesh>

      {/* Causeway decks, rails and piers for the connectors */}
      {CAUSEWAYS.map((c) => (
        <group key={c.x} position={[c.x, 0, (RIVER.z0 + RIVER.z1) / 2]}>
          <mesh position={[0, -0.2, 0]} receiveShadow castShadow>
            <boxGeometry args={[c.w, 0.3, RIVER.z1 - RIVER.z0 + 4]} />
            <meshStandardMaterial color="#a9adb1" roughness={0.85} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * (c.w / 2 - 0.3), 0.45, 0]} castShadow>
              <boxGeometry args={[0.35, 0.9, RIVER.z1 - RIVER.z0 + 4]} />
              <meshStandardMaterial color="#d9dcdf" roughness={0.6} />
            </mesh>
          ))}
          {[-10, 0, 10].map((dz) => (
            <mesh key={dz} position={[0, -0.9, dz]}>
              <cylinderGeometry args={[0.7, 0.7, 1.4, 10]} />
              <meshStandardMaterial color="#8d9196" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Roads, centre dashes, street lamps
// ---------------------------------------------------------------------------
const writeRoad: Writer<CityRoad> = (r, o, c) => {
  const s = ROAD_STYLE[r.kind];
  o.position.set(r.x, ROAD_TOP - 0.04 + s.lift, r.z);
  o.scale.set(r.w, 0.08, r.d);
  c.set(s.color);
};

const DASHES = CITY_ROADS.filter((r) => r.dashed).flatMap((r) => {
  const alongX = r.w > r.d;
  const len = alongX ? r.w : r.d;
  const top = ROAD_TOP + ROAD_STYLE[r.kind].lift + 0.006;
  const out: Array<{ x: number; z: number; y: number; alongX: boolean }> = [];
  for (let s = -len / 2 + 3; s < len / 2 - 3; s += 6) {
    out.push({ x: alongX ? r.x + s : r.x, z: alongX ? r.z : r.z + s, y: top, alongX });
  }
  return out;
});
const writeDash: Writer<(typeof DASHES)[number]> = (d, o) => {
  o.position.set(d.x, d.y, d.z);
  o.scale.set(d.alongX ? 2.4 : 0.18, 0.01, d.alongX ? 0.18 : 2.4);
};

const writeLampPole: Writer<{ x: number; z: number }> = (l, o) => {
  o.position.set(l.x, 0, l.z);
  o.scale.set(1, 6, 1);
};
const writeLampHead: Writer<{ x: number; z: number }> = (l, o) => {
  o.position.set(l.x, 6.1, l.z);
  o.scale.set(0.7, 0.25, 0.7);
};

function Roads() {
  return (
    <group>
      <Instances items={CITY_ROADS} geometry={CENTRED_BOX} material={MAT.road} write={writeRoad} />
      <Instances items={DASHES} geometry={CENTRED_BOX} material={MAT.dash} write={writeDash} receiveShadow={false} />
      <Instances items={CITY_LAMPS} geometry={LAMP_POLE} material={MAT.lampPole} write={writeLampPole} castShadow />
      <Instances items={CITY_LAMPS} geometry={CENTRED_BOX} material={MAT.lampHead} write={writeLampHead} receiveShadow={false} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Districts (buildings + trees), streamed by distance
// ---------------------------------------------------------------------------
type DamageMap = Record<string, DamagedBuildingState["stage"]>;

const ROOF_COLORS = ["#b5452f", "#c1693c", "#8e3b2a", "#a0522d"];
const RUBBLE = "#8a8178";

function buildingWriter(damage: DamageMap): Writer<CityBuilding> {
  return (b, o, c) => {
    const stage = damage[b.id];
    o.position.set(b.x, 0, b.z);
    if (stage === "collapsed") {
      o.scale.set(b.w, 0.85, b.d);
      c.set(RUBBLE);
      return;
    }
    o.scale.set(b.w, b.h, b.d);
    c.set(b.color);
    if (stage === "heavy") c.multiplyScalar(0.45);
    else if (stage === "minor") c.multiplyScalar(0.75);
  };
}

function roofWriter(damage: DamageMap): Writer<CityBuilding> {
  return (b, o, c) => {
    o.position.set(b.x, b.h, b.z);
    if (damage[b.id] === "collapsed") {
      o.scale.set(0, 0, 0);
      return;
    }
    const pitched = b.style === "house" || b.style === "farmhouse";
    o.scale.set(b.w * (pitched ? 1.2 : 0.35), pitched ? Math.max(2, b.w * 0.35) : 2.2, b.d * (pitched ? 1.2 : 0.35));
    c.set(pitched ? ROOF_COLORS[Math.abs(Math.round(b.x * 7 + b.z * 13)) % ROOF_COLORS.length] : "#9aa1a8");
  };
}

const writeTrunk: Writer<CityTree> = (t, o) => {
  o.position.set(t.x, 0, t.z);
  const h = (t.kind === "palm" ? 7 : 3.2) * t.scale;
  o.scale.set(t.scale, h, t.scale);
};
const writeCrown: Writer<CityTree> = (t, o, c) => {
  if (t.kind === "palm") {
    o.position.set(t.x, 7 * t.scale, t.z);
    o.scale.set(2.6 * t.scale, 1.4 * t.scale, 2.6 * t.scale);
    c.set("#3f8f3a");
  } else {
    o.position.set(t.x, 3.6 * t.scale, t.z);
    o.scale.set(2.2 * t.scale, 1.9 * t.scale, 2.2 * t.scale);
    c.set(t.x % 2 > 1 ? "#4c8b3a" : "#5c9c3f");
  }
};

/** Stable string of damage stages for one district's buildings (store selector). */
function damageKey(damaged: Record<string, DamagedBuildingState>, prefix: string) {
  let key = "";
  for (const id in damaged) {
    if (id.startsWith(prefix) && damaged[id].stage !== "intact") key += `${id}=${damaged[id].stage};`;
  }
  return key;
}

function District({ district, groupRef }: { district: CityDistrict; groupRef: (g: THREE.Group | null) => void }) {
  const prefix = `city_${district.id}_`;
  const key = useGameStore((s) => damageKey(s.damagedBuildings, prefix));
  const damage = useMemo<DamageMap>(
    () => Object.fromEntries(key.split(";").filter(Boolean).map((kv) => kv.split("=") as [string, DamagedBuildingState["stage"]])),
    [key]
  );

  const parts = useMemo(() => {
    const mine = CITY_BUILDINGS.filter((b) => b.district === district.id && !b.hidden);
    const trees = CITY_TREES.filter((t) => t.district === district.id);
    return {
      towers: mine.filter((b) => b.style === "tower"),
      midrise: mine.filter((b) => b.style === "midrise" || b.style === "civic"),
      plain: mine.filter((b) => b.style === "house" || b.style === "farmhouse" || b.style === "warehouse" || b.style === "hangar"),
      roofs: mine.filter((b) => b.style === "house" || b.style === "farmhouse" || b.style === "tower"),
      palms: trees.filter((t) => t.kind === "palm"),
      broadleaf: trees.filter((t) => t.kind === "broadleaf"),
    };
  }, [district.id]);

  const writeBuilding = useMemo(() => buildingWriter(damage), [damage]);
  const writeRoof = useMemo(() => roofWriter(damage), [damage]);

  return (
    <group ref={groupRef}>
      <Instances items={parts.towers} geometry={UNIT_BOX} material={MAT.windowsTower} write={writeBuilding} version={key} castShadow />
      <Instances items={parts.midrise} geometry={UNIT_BOX} material={MAT.windowsMidrise} write={writeBuilding} version={key} castShadow />
      <Instances items={parts.plain} geometry={UNIT_BOX} material={MAT.plain} write={writeBuilding} version={key} castShadow />
      <Instances items={parts.roofs} geometry={PYRAMID} material={MAT.roof} write={writeRoof} version={key} castShadow />
      <Instances items={[...parts.palms, ...parts.broadleaf]} geometry={TRUNK} material={MAT.trunk} write={writeTrunk} castShadow />
      <Instances items={parts.palms} geometry={PALM_CROWN} material={MAT.foliage} write={writeCrown} castShadow />
      <Instances items={parts.broadleaf} geometry={LEAF_CROWN} material={MAT.foliage} write={writeCrown} castShadow />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Landmarks
// ---------------------------------------------------------------------------
function OlympicArena() {
  const r = ARENA.radius;
  return (
    <group position={[ARENA.x, 0, ARENA.z]}>
      <mesh position={[0, 0.005, 0]} receiveShadow>
        <cylinderGeometry args={[r + 4, r + 4, 0.02, 48]} />
        <meshStandardMaterial color="#b85a3c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[r - 13, r - 13, 0.02, 48]} />
        <meshStandardMaterial color="#3f8f46" roughness={0.9} />
      </mesh>
      {/* Seating bowl */}
      <mesh position={[0, 7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r - 1, r - 12, 14, 48, 1, true]} />
        <meshStandardMaterial color="#c0392b" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Outer facade */}
      <mesh position={[0, 8, 0]} castShadow>
        <cylinderGeometry args={[r, r, 16, 48, 1, true]} />
        <meshStandardMaterial color="#eef1f3" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Roof ring */}
      <mesh position={[0, 16.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r - 9, r + 1.5, 48]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function HillPagoda() {
  const tiers: Array<[w: number, h: number, d: number, y: number, color: string]> = [
    [17, 3, 12, 6.2, "#b0342b"],
    [12, 2.6, 8.5, 8.4, "#c9862b"],
    [7.5, 2.4, 5.5, 10.4, "#b0342b"],
  ];
  return (
    <group position={[HILL_PAGODA.x, 0, HILL_PAGODA.z]}>
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[40, 0.04, 32]} />
        <meshStandardMaterial color="#e2d6bd" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[19, 1.2, 14]} />
        <meshStandardMaterial color="#e8dcc0" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.2 + 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[13, 5, 9]} />
        <meshStandardMaterial color="#f3ead7" roughness={0.8} />
      </mesh>
      {tiers.map(([w, h, d, y, color], i) => (
        <mesh key={i} position={[0, y, 0]} scale={[w, h, d]} geometry={PYRAMID} castShadow>
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 15.3, 0]} castShadow>
        <coneGeometry args={[0.45, 5, 8]} />
        <meshStandardMaterial color="#e1b12c" metalness={0.6} roughness={0.3} />
      </mesh>
      <BuddhistStupa position={[12, 0, -6]} scale={1.1} isGold />
      <BuddhistStupa position={[12, 0, 6]} scale={1.1} isGold />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------
const STREAM_INTERVAL = 0.3; // seconds between visibility checks

export function ExpandedCity() {
  const groups = useRef<Record<string, THREE.Group | null>>({});
  const sinceCheck = useRef(STREAM_INTERVAL);
  const timeHour = useGameStore((s) => s.timeHour);

  // Night factor for lit windows and lamp heads (matches StreetLamp's 18:00–05:30)
  useEffect(() => {
    const night = timeHour >= 18 || timeHour < 5.5 ? 1 : timeHour >= 17 ? timeHour - 17 : 0;
    nightUniform.value = night;
    MAT.lampHead.emissiveIntensity = night * 1.8;
  }, [timeHour]);

  // Hide districts beyond the fog; checked a few times a second, no store writes
  useFrame((_, delta) => {
    sinceCheck.current += delta;
    if (sinceCheck.current < STREAM_INTERVAL) return;
    sinceCheck.current = 0;
    const s = useGameStore.getState();
    const [px, , pz] = s.targetPos;
    const range = districtViewDistance(s.graphicsQuality);
    for (const d of CITY_DISTRICTS) {
      const g = groups.current[d.id];
      if (g) g.visible = distanceToRect(d, px, pz) < range;
    }
  });

  const refs = useMemo(
    () => Object.fromEntries(CITY_DISTRICTS.map((d) => [d.id, (g: THREE.Group | null) => (groups.current[d.id] = g)])),
    []
  );

  return (
    <group>
      <Terrain />
      <Roads />
      {CITY_DISTRICTS.map((d) => (
        <District key={d.id} district={d} groupRef={refs[d.id]} />
      ))}
      <OlympicArena />
      <HillPagoda />
      <ExpandedTraffic />
    </group>
  );
}
