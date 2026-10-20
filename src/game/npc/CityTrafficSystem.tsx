"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/state/gameStore";
import { Supercar, Motorbike, RemorkTukTuk } from "@/game/vehicles/VehiclesAndCharacters";
import { getSurfaceElevation } from "@/game/physics/collisionSystem";

// =============================================================================
// PROCEDURAL MODERN EXECUTIVE SEDAN & CITY CAR (ឡានទំនើបក្នុងក្រុង)
// =============================================================================
export function CitySedan({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = "#1E293B",
  wheelSpin = 0,
  headlights = true,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  wheelSpin?: number;
  headlights?: boolean;
}) {
  const timeHour = useGameStore((state) => state.timeHour);
  const isNight = timeHour < 5.5 || timeHour >= 18.0;

  return (
    <group position={position} rotation={rotation}>
      {/* Lower Chassis */}
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.28, 4.4]} />
        <meshStandardMaterial color="#1E2024" roughness={0.8} />
      </mesh>

      {/* Main Body (Sleek aerodynamic curves) */}
      <mesh position={[0, 0.54, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.88, 0.46, 4.3]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.85}
          roughness={0.2}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Hood & Front Grille */}
      <mesh position={[0, 0.52, 1.55]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[1.82, 0.34, 1.3]} />
        <meshPhysicalMaterial color={color} metalness={0.85} roughness={0.2} clearcoat={1.0} />
      </mesh>
      {/* Chrome Front Grille */}
      <mesh position={[0, 0.42, 2.22]} castShadow>
        <boxGeometry args={[1.1, 0.22, 0.05]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Cabin & Passenger Cockpit */}
      <mesh position={[0, 0.96, -0.1]} castShadow>
        <boxGeometry args={[1.5, 0.52, 2.3]} />
        <meshStandardMaterial color="#111827" roughness={0.3} />
      </mesh>

      {/* Tinted Windshield */}
      <mesh position={[0, 0.95, 0.88]} rotation={[-0.55, 0, 0]}>
        <boxGeometry args={[1.44, 0.05, 0.85]} />
        <meshPhysicalMaterial color="#93C5FD" transparent opacity={0.5} roughness={0.05} />
      </mesh>
      {/* Rear Window */}
      <mesh position={[0, 0.95, -1.08]} rotation={[0.55, 0, 0]}>
        <boxGeometry args={[1.44, 0.05, 0.85]} />
        <meshPhysicalMaterial color="#93C5FD" transparent opacity={0.5} roughness={0.05} />
      </mesh>
      {/* Side Windows */}
      {[-0.76, 0.76].map((x, i) => (
        <mesh key={`sd-win-${i}`} position={[x, 0.96, -0.1]}>
          <boxGeometry args={[0.02, 0.44, 1.8]} />
          <meshPhysicalMaterial color="#93C5FD" transparent opacity={0.5} roughness={0.05} />
        </mesh>
      ))}

      {/* Side Mirrors */}
      {[-0.98, 0.98].map((x, i) => (
        <mesh key={`mirror-${i}`} position={[x, 0.72, 0.75]} castShadow>
          <boxGeometry args={[0.16, 0.1, 0.18]} />
          <meshPhysicalMaterial color={color} metalness={0.85} roughness={0.2} />
        </mesh>
      ))}

      {/* Headlights */}
      {[-0.7, 0.7].map((x, i) => (
        <group key={`hl-${i}`} position={[x, 0.52, 2.18]}>
          <mesh>
            <boxGeometry args={[0.3, 0.12, 0.06]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive={isNight || headlights ? "#E0F2FE" : "#000000"}
              emissiveIntensity={isNight || headlights ? 3.0 : 0}
            />
          </mesh>
          {(isNight || headlights) && (
            <spotLight
              position={[0, 0, 0.2]}
              target-position={[0, -0.3, 16]}
              color="#E0F2FE"
              intensity={2.5}
              distance={26}
              angle={0.55}
              penumbra={0.4}
            />
          )}
        </group>
      ))}

      {/* Red Taillights */}
      {[-0.7, 0.7].map((x, i) => (
        <mesh key={`tl-${i}`} position={[x, 0.58, -2.18]}>
          <boxGeometry args={[0.32, 0.1, 0.06]} />
          <meshStandardMaterial
            color="#DC2626"
            emissive={isNight || headlights ? "#EF4444" : "#991B1B"}
            emissiveIntensity={isNight || headlights ? 2.5 : 0.4}
          />
        </mesh>
      ))}

      {/* 4 Wheels */}
      {[-0.92, 0.92].map((x, xi) =>
        [-1.35, 1.35].map((z, zi) => (
          <group key={`wheel-${xi}-${zi}`} position={[x, 0.34, z]} rotation={[wheelSpin, 0, 0]}>
            <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
              <torusGeometry args={[0.32, 0.11, 8, 20]} />
              <meshStandardMaterial color="#1E2024" roughness={0.9} />
            </mesh>
            {/* Alloy Rim */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.24, 0.24, 0.22, 14]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.85} roughness={0.25} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

// =============================================================================
// DYNAMIC MOVING TRAFFIC VEHICLE (ឡានបើកបរតាមផ្លូវ)
// =============================================================================
export function MovingCar({
  type = "sedan",
  color = "#2563EB",
  waypoints,
  speed = 9.5, // m/s (approx 34 km/h)
}: {
  type?: "supercar" | "sedan" | "remork" | "motorbike";
  color?: string;
  waypoints: [number, number, number][];
  speed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentWaypoint = useRef(0);
  const wheelSpin = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || waypoints.length < 2) return;

    const target = waypoints[currentWaypoint.current];
    const pos = groupRef.current.position;

    const dx = target[0] - pos.x;
    const dz = target[2] - pos.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 1.2) {
      currentWaypoint.current = (currentWaypoint.current + 1) % waypoints.length;
    } else {
      const angle = Math.atan2(dx, dz);
      // Smooth heading rotation
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        angle,
        delta * 6.0
      );

      // Move forward
      const moveStep = Math.min(dist, speed * delta);
      pos.x += Math.sin(angle) * moveStep;
      pos.z += Math.cos(angle) * moveStep;

      // Realistic 3D bridge deck and ramp elevation tracking
      const surfaceElev = getSurfaceElevation(pos.x, pos.z);
      pos.y = THREE.MathUtils.damp(pos.y, surfaceElev, 14.0, delta);

      // Pitch tilt when ascending/descending bridge ramps
      const isAscendingNorthRamp = pos.z >= 18 && pos.z <= 26 && pos.x >= 21 && pos.x <= 29;
      const isDescendingSouthRamp = pos.z >= 50 && pos.z <= 56 && pos.x >= 21 && pos.x <= 29;
      const targetPitch = isAscendingNorthRamp
        ? (angle > -Math.PI / 2 && angle < Math.PI / 2 ? 0.185 : -0.185)
        : isDescendingSouthRamp
        ? (angle > -Math.PI / 2 && angle < Math.PI / 2 ? -0.245 : 0.245)
        : 0;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetPitch, delta * 6.0);

      // Spin wheels
      wheelSpin.current += (moveStep / 0.34) * 1.5;
    }
  });

  const startPos = waypoints[0];

  return (
    <group ref={groupRef} position={[startPos[0], 0, startPos[2]]}>
      {type === "supercar" && (
        <Supercar
          color={color}
          wheelSpin={wheelSpin.current}
          speed={Math.round(speed * 3.6)}
          headlights={true}
        />
      )}
      {type === "sedan" && (
        <CitySedan
          color={color}
          wheelSpin={wheelSpin.current}
          headlights={true}
        />
      )}
      {type === "remork" && (
        <RemorkTukTuk />
      )}
      {type === "motorbike" && (
        <Motorbike color={color} wheelSpin={wheelSpin.current} />
      )}
    </group>
  );
}

// =============================================================================
// MAIN EXPORTED CITY TRAFFIC & FLEET SYSTEM (ចរាចរណ៍ & យានយន្តក្នុងទីក្រុង)
// =============================================================================
export function CityTrafficSystem() {
  return (
    <group>
      {/* ===================================================================== */}
      {/* 1. DYNAMIC MOVING TRAFFIC CRUISING THE ROADS & HIGHWAYS */}
      {/* ===================================================================== */}

      {/* Route 1: Highway & Mekong Bridge Intercity Cruiser (White Supercar) */}
      {/* Cruises from Kampong Cham across the bridge into Sports City and back */}
      <MovingCar
        type="supercar"
        color="#F8FAFC"
        speed={14.0} // ~50 km/h highway speed
        waypoints={[
          [26.5, 0, 10],   // Bridge north approach
          [26.5, 0, 50],   // Bridge exit
          [26.5, 0, 72],   // Sports City Grand Entrance
          [26.5, 0, 108],  // Sports Boulevard south
          [23.5, 0, 108],  // Turn around lane
          [23.5, 0, 72],   // Head back north
          [23.5, 0, 50],   // Cross bridge north lane
          [23.5, 0, 10],   // Reach Kampong Cham town
        ]}
      />

      {/* Route 2: Town Ring Road Cruiser (Metallic Blue City Sedan) */}
      {/* Drives through Kampong Cham town: Hotel -> Market -> School -> Town Hall */}
      <MovingCar
        type="sedan"
        color="#2563EB"
        speed={8.5} // ~30 km/h city speed
        waypoints={[
          [22.5, 0, -18], // Hotel plaza driveway (unobstructed)
          [22.5, 0, -4],  // Shophouses east lane
          [22.5, 0, 8],   // South intersection
          [-10, 0, 16],   // Temple Boulevard west lane
          [-38, 0, 16],   // West intersection
          [-38, 0, -15],  // Town Hall avenue
          [-22, 0, -15],  // West avenue
          [0, 0, -15],    // School front Heritage Laterite road
          [22.5, 0, -15], // Market avenue
        ]}
      />

      {/* Route 3: Sports City Boulevard Cruiser (Sunburst Yellow Sportscar) */}
      {/* Loops around Sports City entrance, parking plaza, and stadium road */}
      <MovingCar
        type="supercar"
        color="#F59E0B"
        speed={11.0}
        waypoints={[
          [24, 0, 58],   // Arch entrance
          [24, 0, 78],   // Clubhouse road
          [10, 0, 78],   // Stadium east approach
          [10, 0, 62],   // Parking west road
          [24, 0, 62],   // Loop back
        ]}
      />

      {/* Route 4: Riverside Scenic Promenade Passenger Remork Tuk-Tuk */}
      <MovingCar
        type="remork"
        speed={6.0}
        waypoints={[
          [18, 0, 24.0],  // Hotel riverside promenade
          [2, 0, 24.0],   // Central riverside promenade
          [-18, 0, 24.0], // West riverside promenade
          [-32, 0, 24.0], // West riverbank turnaround
          [-32, 0, 24.5],
          [-18, 0, 24.5], // Return east along promenade
          [2, 0, 24.5],
          [18, 0, 24.5],
        ]}
      />

      {/* Route 5: Provincial Commuter Motorbike */}
      <MovingCar
        type="motorbike"
        color="#DC2626"
        speed={8.0}
        waypoints={[
          [-40, 0, -15], // Heritage Laterite road in front of Town Hall
          [-15, 0, -15], // Laterite road in front of village
          [0, 0, -15],   // In front of School main gate
          [18, 0, -15],  // In front of Market
          [18, 0, -13.5],
          [0, 0, -13.5], // Return west lane
          [-15, 0, -13.5],
          [-40, 0, -13.5],
        ]}
      />

      {/* ===================================================================== */}
      {/* 2. PARKED VEHICLES THROUGHOUT THE WORLD */}
      {/* ===================================================================== */}

      {/* A. Mekong Grand Hotel VIP Parking Plaza [18, 0, -22 to -32] */}
      {/* VIP Bay 1: Pearlescent White Supercar */}
      <Supercar
        position={[24, 0, -24]}
        rotation={[0, -Math.PI / 2, 0]}
        color="#F8FAFC"
        headlights={false}
      />
      {/* VIP Bay 2: Obsidian Black Executive Sedan */}
      <CitySedan
        position={[24, 0, -28]}
        rotation={[0, -Math.PI / 2, 0]}
        color="#0F172A"
        headlights={false}
      />
      {/* VIP Bay 3: Metallic Silver Sedan */}
      <CitySedan
        position={[24, 0, -32]}
        rotation={[0, -Math.PI / 2, 0]}
        color="#94A3B8"
        headlights={false}
      />

      {/* B. Sports City Grand Parking Plaza [25, 0, 64] */}
      {/* Bay 1: Electric Blue Supercar */}
      <Supercar
        position={[17, 0, 64]}
        rotation={[0, 0, 0]}
        color="#0284C7"
        headlights={false}
      />
      {/* Bay 2: Sunset Orange Sedan */}
      <CitySedan
        position={[21, 0, 64]}
        rotation={[0, 0, 0]}
        color="#EA580C"
        headlights={false}
      />
      {/* Bay 3: Emerald Green City Car */}
      <CitySedan
        position={[29, 0, 64]}
        rotation={[0, Math.PI, 0]}
        color="#15803D"
        headlights={false}
      />

      {/* C. Provincial Town Hall & Library Parking [-42, 0, -8] */}
      <CitySedan
        position={[-36, 0, -10]}
        rotation={[0, Math.PI / 2, 0]}
        color="#334155"
        headlights={false}
      />

      {/* D. Commercial Shophouse Curb Parking [14, 0, 2] */}
      <CitySedan
        position={[14, 0, 2]}
        rotation={[0, 0, 0]}
        color="#475569"
        headlights={false}
      />
    </group>
  );
}
