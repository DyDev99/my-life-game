"use client";

import React from "react";
import { MovingCar } from "@/game/npc/CityTrafficSystem";

type Path = [number, number, number][];

// Ring loop: North Ring → East Connector (causeway) → South Ring → West Connector (causeway).
// Clockwise traffic keeps to one lane, counter-clockwise to the other.
const RING_CW: Path = [
  [-108, 0, -98],
  [108, 0, -98],
  [108, 0, 138],
  [-108, 0, 138],
];
const RING_CCW: Path = [
  [-112, 0, -102],
  [-112, 0, 142],
  [112, 0, 142],
  [112, 0, -102],
];
const rotate = (p: Path, n: number): Path => [...p.slice(n), ...p.slice(0, n)];

// Highway 1 north into Downtown and back
const H1_NORTH: Path = [
  [23.5, 0, -95],
  [23.5, 0, -240],
  [26.5, 0, -240],
  [26.5, 0, -95],
];

export function ExpandedTraffic() {
  return (
    <group>
      <MovingCar type="sedan" color="#2563EB" waypoints={RING_CW} speed={13} />
      <MovingCar type="sedan" color="#F8FAFC" waypoints={rotate(RING_CW, 2)} speed={12} />
      <MovingCar type="supercar" color="#DC2626" waypoints={rotate(RING_CCW, 1)} speed={17} />
      <MovingCar type="sedan" color="#0F766E" waypoints={rotate(RING_CCW, 3)} speed={11} />
      <MovingCar type="remork" waypoints={H1_NORTH} speed={7} />
      <MovingCar type="motorbike" color="#7C3AED" waypoints={rotate(H1_NORTH, 2)} speed={10} />
    </group>
  );
}
