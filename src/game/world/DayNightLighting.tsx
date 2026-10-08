"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { useGameStore } from "@/state/gameStore";

export function DayNightLighting() {
  const timeHour = useGameStore((state) => state.timeHour);

  // Compute lighting and sky colors based on time of day (07:00 to 22:00)
  const lightConfig = useMemo(() => {
    // 1. Morning (7:00 - 10:00 AM)
    if (timeHour < 10.5) {
      const t = (timeHour - 7.0) / 3.5;
      return {
        sunPos: [45 - t * 15, 30 + t * 25, 35 - t * 10] as [number, number, number],
        sunColor: "#FFE3B0",
        sunIntensity: 1.35,
        ambientColor: "#FFF2DC",
        ambientIntensity: 0.72,
        skyColor: "#BCE1F5",
        fogNear: 55,
        fogFar: 140,
        isNight: false,
      };
    }
    // 2. Midday (10:30 AM - 15:30 PM)
    if (timeHour < 16.0) {
      return {
        sunPos: [20, 65, 15] as [number, number, number],
        sunColor: "#FFFDF5",
        sunIntensity: 1.55,
        ambientColor: "#E0F2FE",
        ambientIntensity: 0.85,
        skyColor: "#87CEEB",
        fogNear: 60,
        fogFar: 150,
        isNight: false,
      };
    }
    // 3. Sunset / Golden Hour (16:00 - 18:30 PM)
    if (timeHour < 19.0) {
      const t = (timeHour - 16.0) / 3.0;
      return {
        sunPos: [-35 + t * 10, 26 - t * 14, 25] as [number, number, number],
        sunColor: "#FFA34D",
        sunIntensity: 1.3,
        ambientColor: "#FED7AA",
        ambientIntensity: 0.65,
        skyColor: "#D9725B",
        fogNear: 45,
        fogFar: 130,
        isNight: false,
      };
    }
    // 4. Serene Night (19:00 - 22:00 PM)
    return {
      sunPos: [-25, 45, -30] as [number, number, number],
      sunColor: "#93C5FD", // Silvery cool moonlight
      sunIntensity: 0.38,
      ambientColor: "#1E2540", // Deep twilight navy
      ambientIntensity: 0.32,
      skyColor: "#0B1021",
      fogNear: 40,
      fogFar: 120,
      isNight: true,
    };
  }, [timeHour]);

  return (
    <>
      {/* Sky & Fog sync */}
      <color attach="background" args={[lightConfig.skyColor]} />
      <fog attach="fog" args={[lightConfig.skyColor, lightConfig.fogNear, lightConfig.fogFar]} />

      {/* Ambient Fill Light */}
      <ambientLight intensity={lightConfig.ambientIntensity} color={lightConfig.ambientColor} />

      {/* Primary Directional Sun / Moon */}
      <directionalLight
        position={lightConfig.sunPos}
        intensity={lightConfig.sunIntensity}
        color={lightConfig.sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={10}
        shadow-camera-far={160}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-bias={-0.0004}
      />

      {/* Sky hemisphere bounce */}
      <directionalLight
        position={[-lightConfig.sunPos[0], lightConfig.sunPos[1] * 0.7, -lightConfig.sunPos[2]]}
        intensity={lightConfig.ambientIntensity * 0.45}
        color={lightConfig.ambientColor}
      />

      {/* Nighttime Streetlights & Pagoda Golden Lamps */}
      {lightConfig.isNight && (
        <group>
          {/* Streetlamp 1 (Near Crossroads) */}
          <pointLight position={[2, 4.5, -12]} intensity={1.8} color="#FFD580" distance={18} decay={2} />
          {/* Streetlamp 2 (Near Market) */}
          <pointLight position={[14, 4.5, -12]} intensity={1.8} color="#FFD580" distance={18} decay={2} />
          {/* Streetlamp 3 (Near School) */}
          <pointLight position={[0, 4.5, 4]} intensity={1.6} color="#FFD580" distance={16} decay={2} />
          {/* Pagoda Sacred Golden Lantern */}
          <pointLight position={[-14, 5.0, 16]} intensity={2.2} color="#FBBF24" distance={22} decay={2} />
          {/* Riverside Coffee Cart Lantern */}
          <pointLight position={[-6, 3.2, -12]} intensity={1.5} color="#FDE68A" distance={14} decay={2} />
          {/* Stilt House Warm Window Light */}
          <pointLight position={[-14, 3.8, -20]} intensity={1.6} color="#FED7AA" distance={16} decay={2} />
        </group>
      )}
    </>
  );
}
