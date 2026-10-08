"use client";

import React from "react";
import {
  SchoolBuilding,
  PagodaBuilding,
  PagodaEntranceGate,
  PagodaPerimeterWalls,
  BuddhistStupa,
  PagodaBellTower,
  PagodaIncenseAltar,
  GrandHotelBuilding,
  TownHallBuilding,
  StiltHouseBuilding,
  ShophouseBlock,
  MarketStall,
  CoffeeStall,
  Bridge,
} from "@/game/world/buildings/Buildings";
import {
  SugarPalmTree,
  CoconutPalmTree,
  TropicalTree,
  TropicalBush,
  RicePaddyGrid,
  RiverWater,
  GroundEnvironment,
} from "@/game/world/environment/Environment";
import { Motorbike, RemorkTukTuk, Bicycle, Supercar, PlayerCharacter } from "@/game/vehicles/VehiclesAndCharacters";

import { useGameStore } from "@/state/gameStore";

import { DayNightLighting } from "@/game/world/DayNightLighting";
import { NPCSystem } from "@/game/npc/NPCSystem";
import { SportsCity } from "@/game/world/sports-city/SportsCity";
import { CityTrafficSystem } from "@/game/npc/CityTrafficSystem";

export function GameWorld() {
  const ridingVehicle = useGameStore((state) => state.ridingVehicle);
  const supercarPos = useGameStore((state) => state.supercarPos);
  const supercarHeading = useGameStore((state) => state.supercarHeading);

  return (
    <group>
      {/* Dynamic 24h Day/Night Lighting with Sun, Moon, Atmospheric Fog, and Night City Lights */}
      <DayNightLighting />

      {/* Expanded Terrain & Roads Network (240m x 180m) */}
      <GroundEnvironment />

      {/* Mekong River & Bridge */}
      <RiverWater position={[0, 0, 38]} />
      <Bridge position={[25, 0, 38]} />

      {/* ===================================================================== */}
      {/* OLYMPIC SPORTS CITY (FOOTBALL STADIUM & VOLLEYBALL DISTRICT) */}
      {/* ===================================================================== */}
      <SportsCity />

      {/* ===================================================================== */}
      {/* 1. PUBLIC INSTITUTIONS & RESIDENTIAL */}
      {/* ===================================================================== */}
      {/* 1. School (Work & Education) */}
      <SchoolBuilding position={[0, 0, -2]} />

      {/* 2. Provincial Town Hall & Library */}
      <TownHallBuilding position={[-42, 0, -15]} />

      {/* 3. Traditional Khmer Village Neighborhood (Stilt Houses) */}
      {/* Player Home */}
      <StiltHouseBuilding position={[-14, 0, -20]} isPlayerHome={true} />
      {/* Village Neighbors */}
      <StiltHouseBuilding position={[4, 0, -25]} isPlayerHome={false} />
      <StiltHouseBuilding position={[-30, 0, -36]} isPlayerHome={false} />
      <StiltHouseBuilding position={[-12, 0, -42]} isPlayerHome={false} />
      <StiltHouseBuilding position={[32, 0, -42]} isPlayerHome={false} />

      {/* ===================================================================== */}
      {/* 2. GRAND PAGODA COMPLEX (វត្តអារាមកំពង់ចាម) */}
      {/* ===================================================================== */}
      {/* Enclosing Perimeter Walls with central entrance opening at x = -11, z = 18 */}
      <PagodaPerimeterWalls />

      {/* Grand Khmer Entrance Gate (ក្លោងទ្វារវត្ត) */}
      <PagodaEntranceGate position={[-11, 0, 18]} />

      {/* Main Temple Vihara Sanctuary (ព្រះវិហារ) */}
      <PagodaBuilding position={[-24, 0, 18]} />

      {/* Sacred Buddhist Stupas / Chedey (ចេតិយ) */}
      <BuddhistStupa position={[-13.5, 0, 13]} scale={1.0} isGold={true} />
      <BuddhistStupa position={[-13.5, 0, 23]} scale={1.0} isGold={true} />
      <BuddhistStupa position={[-34.5, 0, 18]} scale={1.4} isGold={true} />

      {/* Pagoda Bell Tower / Hor Keng (ហោជួង) */}
      <PagodaBellTower position={[-32, 0, 11]} />

      {/* Incense Altar & Lotus Flower Shrine (ជើងធូប) */}
      <PagodaIncenseAltar position={[-18, 0, 18]} />

      {/* Sacred Temple Palms & Frangipani Trees */}
      <SugarPalmTree position={[-15, 0, 11]} height={9.5} />
      <SugarPalmTree position={[-15, 0, 25]} height={9.5} />
      <CoconutPalmTree position={[-21, 0, 12]} height={7.5} />
      <CoconutPalmTree position={[-21, 0, 24]} height={7.5} />

      {/* ===================================================================== */}
      {/* 3. MEKONG RIVERSIDE GRAND HOTEL & VIP SUPERCAR PLAZA */}
      {/* ===================================================================== */}
      <GrandHotelBuilding position={[18, 0, -30]} />

      {/* ===================================================================== */}
      {/* 4. COMMERCIAL DISTRICT & MARKETS */}
      {/* ===================================================================== */}
      {/* Shophouses Blocks */}
      <ShophouseBlock position={[16.5, 0, -4]} />
      <ShophouseBlock position={[16.5, 0, 7]} />

      {/* Market Stalls */}
      <MarketStall position={[11, 0, -10]} tarpColor="#D9443A" />
      <MarketStall position={[15, 0, -10]} tarpColor="#2E86C1" />
      <MarketStall position={[11, 0, -14]} tarpColor="#EAB308" />
      <MarketStall position={[15, 0, -14]} tarpColor="#10B981" />

      {/* Riverside Coffee Cart with stools */}
      <CoffeeStall position={[-6, 0, -12]} />

      {/* Rice Paddy Plots */}
      <RicePaddyGrid position={[-42, 0, 18]} />
      <RicePaddyGrid position={[-48, 0, 4]} />

      {/* ===================================================================== */}
      {/* 5. TROPICAL VEGETATION & PROVINCIAL NATURE */}
      {/* ===================================================================== */}
      {/* Iconic Sugar Palms (ដើមត្នោត) */}
      <SugarPalmTree position={[-52, 0, -6]} height={10.5} />
      <SugarPalmTree position={[-46, 0, -10]} height={9.0} />
      <SugarPalmTree position={[-32, 0, -6]} height={10.0} />
      <SugarPalmTree position={[-28, 0, -10]} height={8.5} />
      <SugarPalmTree position={[-6, 0, 24]} height={9.0} />
      <SugarPalmTree position={[8, 0, 24]} height={9.5} />
      <SugarPalmTree position={[34, 0, 14]} height={9.0} />
      <SugarPalmTree position={[36, 0, -8]} height={8.5} />
      <SugarPalmTree position={[-54, 0, 24]} height={10.5} />
      <SugarPalmTree position={[44, 0, 24]} height={10.0} />

      {/* Coconut Palms & Tropical Trees */}
      <CoconutPalmTree position={[-8, 0, 20]} height={7.5} />
      <CoconutPalmTree position={[18, 0, 24]} height={8.0} />
      <CoconutPalmTree position={[-36, 0, -32]} height={8.0} />
      <CoconutPalmTree position={[14, 0, -42]} height={7.8} />

      <TropicalTree position={[-22, 0, -26]} height={4.8} scale={1.1} />
      <TropicalTree position={[12, 0, -27]} height={4.2} scale={1.0} />
      <TropicalTree position={[-34, 0, 2]} height={4.5} scale={1.0} />
      <TropicalTree position={[30, 0, -22]} height={4.4} scale={0.9} />
      <TropicalTree position={[-48, 0, -28]} height={5.0} scale={1.1} />

      {/* Bushes & Flower Clumps */}
      <TropicalBush position={[-10, 0, -9]} />
      <TropicalBush position={[9, 0, -11]} />
      <TropicalBush position={[-4, 0, -27]} />
      <TropicalBush position={[22, 0, 16]} />
      <TropicalBush position={[-25, 0, -2]} />
      <TropicalBush position={[-11, 0, 15]} />
      <TropicalBush position={[-11, 0, 21]} />

      {/* ===================================================================== */}
      {/* 6. VEHICLES (SUPERCAR, MOTORBIKES, TUK-TUK, BICYCLE) */}
      {/* ===================================================================== */}
      {/* 1. Supercar (Parked at Hotel VIP Plaza when not being driven) */}
      {ridingVehicle !== "supercar" && (
        <Supercar
          position={supercarPos}
          rotation={[0, supercarHeading, 0]}
          color="#D92228"
          headlights={false}
        />
      )}

      {/* 2. Motorbike */}
      {ridingVehicle !== "motorbike" && (
        <Motorbike position={[8, 0, -14.2]} rotation={[0, Math.PI / 2, 0]} color="#B3262E" />
      )}
      <Motorbike position={[-18, 0, -16.0]} rotation={[0, -Math.PI / 2, 0]} color="#2E5FA8" />

      {/* 3. Remork Tuk-Tuk */}
      <RemorkTukTuk position={[25, 0, -2]} rotation={[0, Math.PI, 0]} />

      {/* 4. Bicycle */}
      {ridingVehicle !== "bicycle" && (
        <Bicycle position={[-3.5, 0, -12.5]} rotation={[0, 0.35, 0]} />
      )}

      {/* ===================================================================== */}
      {/* 7. ACTIVE ANIMATED PLAYER CHARACTER & NPCS */}
      {/* ===================================================================== */}
      {/* Active Animated Player Character */}
      <PlayerCharacter />

      {/* Living Cambodian Town NPCs (Monk, Students, Grandmothers, Vendors) */}
      <NPCSystem />

      {/* Dynamic City Traffic & Fleet of Vehicles (Supercars, Sedans, Tuk-Tuks, Motorbikes) */}
      <CityTrafficSystem />
    </group>
  );
}
