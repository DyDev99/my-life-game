"use client";

import React, { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { FBXModel } from "@/game/assets/FBXModel";
import { useGameStore } from "@/state/gameStore";
import { MODELS } from "@/game/assets/assetPaths";

// ----------------------------------------------------
// 1. Sugar Palm Tree (ដើមត្នោត) - Iconic National Palm
// ----------------------------------------------------
function ProceduralSugarPalm({ height = 9.0, scale = 1.0 }: { height?: number; scale?: number }) {
  const frondCount = 14;
  return (
    <group scale={[scale, scale, scale]}>
      {/* Tall slender trunk with subtle rings */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.32, height, 8]} />
        <meshStandardMaterial color="#585049" roughness={0.9} />
      </mesh>

      {/* Trunk rings */}
      {[2, 4, 6, 8].map((y, i) => (
        <mesh key={`ring-${i}`} position={[0, y, 0]}>
          <torusGeometry args={[0.26 - (y / height) * 0.08, 0.03, 6, 8]} />
          <meshStandardMaterial color="#443E38" />
        </mesh>
      ))}

      {/* Dry brown fronds under crown */}
      <mesh position={[0, height - 0.4, 0]}>
        <sphereGeometry args={[0.7, 6, 6]} />
        <meshStandardMaterial color="#9C7A42" roughness={0.9} />
      </mesh>

      {/* Fan-shaped circular crown of palm fronds */}
      {Array.from({ length: frondCount }).map((_, i) => {
        const angle = (i / frondCount) * Math.PI * 2;
        const elevation = (i % 2 === 0 ? 0.35 : 0.65) * 0.5;
        const xDir = Math.cos(angle);
        const zDir = Math.sin(angle);
        return (
          <group
            key={`frond-${i}`}
            position={[0, height, 0]}
            rotation={[xDir * elevation, angle, zDir * elevation]}
          >
            <mesh position={[0, 0.7, 0]} castShadow>
              <cylinderGeometry args={[0.03, 0.05, 1.4, 4]} />
              <meshStandardMaterial color="#6E9E3E" />
            </mesh>
            <mesh position={[0, 1.6, 0]} rotation={[0.4, 0, 0]} castShadow>
              <coneGeometry args={[1.1, 0.1, 6]} />
              <meshStandardMaterial color="#5C9C44" roughness={0.7} />
            </mesh>
          </group>
        );
      })}

      {/* Sugar Palm Fruit Bunch */}
      <mesh position={[0.2, height - 0.8, 0.2]}>
        <sphereGeometry args={[0.28, 6, 6]} />
        <meshStandardMaterial color="#3A2826" />
      </mesh>
    </group>
  );
}

export function SugarPalmTree({
  position = [0, 0, 0],
  height = 9.0,
  scale = 1.0,
}: {
  position?: [number, number, number];
  height?: number;
  scale?: number;
}) {
  return (
    <FBXModel
      url={MODELS.ENV_SugarPalm}
      position={position}
      scale={0.95 * scale}
      fallback={<ProceduralSugarPalm height={height} scale={scale} />}
    />
  );
}

// ----------------------------------------------------
// 2. Leaning Coconut Palm Tree (ដើមដូង)
// ----------------------------------------------------
function ProceduralCoconutPalm({ height = 7.5, lean = 0.25 }: { height?: number; lean?: number }) {
  return (
    <group rotation={[lean, 0, 0]}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, height, 8]} />
        <meshStandardMaterial color="#6B5646" roughness={0.9} />
      </mesh>

      {/* Arching green palm fronds */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <group key={`coco-${i}`} position={[0, height, 0]} rotation={[0.6, a, 0]}>
            <mesh position={[0, 1.4, 0]} rotation={[0.3, 0, 0]} castShadow>
              <boxGeometry args={[0.6, 2.6, 0.05]} />
              <meshStandardMaterial color="#6E9E3E" roughness={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* Green Coconuts */}
      <mesh position={[0, height - 0.3, 0.1]}>
        <sphereGeometry args={[0.3, 6, 6]} />
        <meshStandardMaterial color="#7DB83A" />
      </mesh>
    </group>
  );
}

export function CoconutPalmTree({
  position = [0, 0, 0],
  height = 7.5,
  lean = 0.25,
}: {
  position?: [number, number, number];
  height?: number;
  lean?: number;
}) {
  return (
    <FBXModel
      url={MODELS.ENV_CoconutPalm}
      position={position}
      rotation={[lean, 0, 0]}
      scale={0.95}
      fallback={<ProceduralCoconutPalm height={height} lean={lean} />}
    />
  );
}

// ----------------------------------------------------
// 3. Lush Tropical Tree (ដើមឈើត្រូពិច)
// ----------------------------------------------------
function ProceduralTropicalTree({ height = 4.5, scale = 1.0 }: { height?: number; scale?: number }) {
  return (
    <group scale={[scale, scale, scale]}>
      <mesh position={[0, height * 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, height * 0.7, 7]} />
        <meshStandardMaterial color="#6B5646" roughness={0.9} />
      </mesh>
      <mesh position={[0, height * 0.85, 0]} castShadow>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial color="#5C9C44" roughness={0.8} />
      </mesh>
      <mesh position={[-0.8, height * 0.75, 0.4]} castShadow>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial color="#3E7838" roughness={0.8} />
      </mesh>
      <mesh position={[0.7, height * 0.78, -0.5]} castShadow>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial color="#76A84C" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function TropicalTree({
  position = [0, 0, 0],
  height = 4.5,
  scale = 1.0,
}: {
  position?: [number, number, number];
  height?: number;
  scale?: number;
}) {
  return (
    <FBXModel
      url={MODELS.ENV_Tree}
      position={position}
      scale={0.95 * scale}
      fallback={<ProceduralTropicalTree height={height} scale={scale} />}
    />
  );
}

// ----------------------------------------------------
// 4. Flowering Tropical Bush (គុម្ពោតព្រៃ)
// ----------------------------------------------------
function ProceduralTropicalBush({ hasFlowers = true }: { hasFlowers?: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow>
        <sphereGeometry args={[0.55, 6, 6]} />
        <meshStandardMaterial color="#3E7838" roughness={0.9} />
      </mesh>
      <mesh position={[0.3, 0.35, 0.2]} castShadow>
        <sphereGeometry args={[0.42, 6, 6]} />
        <meshStandardMaterial color="#5C9C44" roughness={0.9} />
      </mesh>
      {hasFlowers && (
        <>
          <mesh position={[0.1, 0.7, 0.3]}>
            <sphereGeometry args={[0.08, 4, 4]} />
            <meshStandardMaterial color="#E86A9A" />
          </mesh>
          <mesh position={[-0.2, 0.65, -0.2]}>
            <sphereGeometry args={[0.08, 4, 4]} />
            <meshStandardMaterial color="#F4C443" />
          </mesh>
        </>
      )}
    </group>
  );
}

export function TropicalBush({
  position = [0, 0, 0],
  hasFlowers = true,
}: {
  position?: [number, number, number];
  hasFlowers?: boolean;
}) {
  return (
    <FBXModel
      url={MODELS.ENV_Bush}
      position={position}
      scale={0.85}
      fallback={<ProceduralTropicalBush hasFlowers={hasFlowers} />}
    />
  );
}

// ----------------------------------------------------
// 5. Rice Paddy Plots (វាលស្រែ)
// ----------------------------------------------------
export function RicePaddyGrid({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Water reflection basin */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[18, 0.1, 18]} />
        <meshStandardMaterial color="#7FA893" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Red Laterite Earthen Dykes dividing paddy into plots */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[18.4, 0.25, 0.7]} />
        <meshStandardMaterial color="#B95A32" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.25, 18.4]} />
        <meshStandardMaterial color="#B95A32" roughness={0.9} />
      </mesh>

      {/* Outer Dyke Borders */}
      {[-9.0, 9.0].map((x, i) => (
        <mesh key={`dyke-x-${i}`} position={[x, 0.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.25, 18.4]} />
          <meshStandardMaterial color="#B95A32" roughness={0.9} />
        </mesh>
      ))}
      {[-9.0, 9.0].map((z, i) => (
        <mesh key={`dyke-z-${i}`} position={[0, 0.1, z]} castShadow receiveShadow>
          <boxGeometry args={[18.4, 0.25, 0.7]} />
          <meshStandardMaterial color="#B95A32" roughness={0.9} />
        </mesh>
      ))}

      {/* Green Rice Seedling Rows */}
      {[-7.2, -5.4, -3.6, -1.8, 1.8, 3.6, 5.4, 7.2].map((x, i) => (
        <mesh key={`row-${i}`} position={[x, 0.22, 0]}>
          <boxGeometry args={[0.35, 0.35, 16.5]} />
          <meshStandardMaterial color="#93C653" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ----------------------------------------------------
// 6. Mekong River (ទន្លេមេគង្គ) with dynamic water flow
// ----------------------------------------------------
export function RiverWater({ position = [0, 0, 38] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      meshRef.current.position.y = -0.25 + Math.sin(t * 1.5) * 0.03;
    }
  });

  return (
    <group position={position}>
      {/* Deep Riverbed spanning 240m */}
      <mesh position={[0, -1.2, 0]} receiveShadow>
        <boxGeometry args={[240, 0.4, 28]} />
        <meshStandardMaterial color="#2F6C92" roughness={0.5} />
      </mesh>

      {/* River Surface with Shimmer spanning 240m */}
      <mesh ref={meshRef} position={[0, -0.25, 0]} receiveShadow>
        <boxGeometry args={[240, 0.1, 26]} />
        <meshStandardMaterial
          color="#3F82A8"
          roughness={0.15}
          metalness={0.3}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Sandy/Dirt Riverbank slopes */}
      <mesh position={[0, -0.05, -13.5]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[240, 0.6, 3.2]} />
        <meshStandardMaterial color="#C98E5A" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.05, 13.5]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[240, 0.6, 3.2]} />
        <meshStandardMaterial color="#C98E5A" roughness={0.9} />
      </mesh>
    </group>
  );
}

// ----------------------------------------------------
// 7. Street Lamp with Night Illumination
// ----------------------------------------------------
export function StreetLamp({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const timeHour = useGameStore((state) => state.timeHour);
  const isNight = timeHour < 5.5 || timeHour >= 18.0;

  return (
    <group position={position} rotation={rotation}>
      {/* Concrete Base */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.4, 8]} />
        <meshStandardMaterial color="#40434D" roughness={0.8} />
      </mesh>
      {/* Metal Pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 4.6, 8]} />
        <meshStandardMaterial color="#2C323B" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Curved Arm */}
      <mesh position={[0.45, 4.8, 0]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 1.2, 8]} />
        <meshStandardMaterial color="#2C323B" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Lamp Head Fixture */}
      <mesh position={[0.9, 5.0, 0]} castShadow>
        <boxGeometry args={[0.6, 0.16, 0.32]} />
        <meshStandardMaterial color="#1E222A" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Emissive Lamp Glass */}
      <mesh position={[0.9, 4.9, 0]}>
        <boxGeometry args={[0.45, 0.05, 0.24]} />
        <meshStandardMaterial
          color={isNight ? "#FFF3C4" : "#D4D8DC"}
          emissive={isNight ? "#FFE082" : "#000000"}
          emissiveIntensity={isNight ? 2.5 : 0}
          roughness={0.2}
        />
      </mesh>
      {/* Warm Night Point Light */}
      {isNight && (
        <pointLight
          position={[0.9, 4.7, 0]}
          color="#FFEBB0"
          intensity={1.6}
          distance={15}
          decay={2}
        />
      )}
    </group>
  );
}

// ----------------------------------------------------
// 8. Ground Terrain, Roads & Infrastructure
// ----------------------------------------------------
export function GroundEnvironment() {
  const setTargetPosition = useGameStore((state) => state.setTargetPosition);
  const activeModal = useGameStore((state) => state.activeModal);

  const handleGroundClick = (e: ThreeEvent<MouseEvent>) => {
    if (activeModal) return;
    e.stopPropagation();
    if (e.delta > 5) return;

    const state = useGameStore.getState();
    if (state.targetingMode || state.ridingVehicle === "plane" || e.shiftKey || e.altKey) {
      state.pointAndSetTarget([e.point.x, 0.4, e.point.z], "Ground Coordinates");
      return;
    }

    setTargetPosition([e.point.x, 0, e.point.z]);
  };

  return (
    <group onClick={handleGroundClick}>
      {/* Base Lush Tropical Grass Plane (Expanded to 240m x 230m to include Sports City) */}
      <mesh position={[0, -0.15, 30]} receiveShadow>
        <boxGeometry args={[240, 0.2, 230]} />
        <meshStandardMaterial color="#76A84C" roughness={0.95} />
      </mesh>

      {/* ----------------- 1. North-South Asphalt Highway (x = 25) ----------------- */}
      <group position={[25, 0, 0]}>
        {/* Asphalt Surface spanning 180m */}
        <mesh position={[0, -0.04, 0]} receiveShadow>
          <boxGeometry args={[6.8, 0.08, 180]} />
          <meshStandardMaterial color="#3D4046" roughness={0.75} />
        </mesh>

        {/* White Dashed Center Line */}
        {Array.from({ length: 36 }).map((_, i) => (
          <mesh key={`dash-${i}`} position={[0, 0.01, -85 + i * 5]}>
            <boxGeometry args={[0.18, 0.01, 2.2]} />
            <meshStandardMaterial color="#F4EBC9" />
          </mesh>
        ))}

        {/* Concrete Curbs */}
        <mesh position={[-3.45, 0.04, 0]} receiveShadow>
          <boxGeometry args={[0.2, 0.12, 180]} />
          <meshStandardMaterial color="#888E99" roughness={0.8} />
        </mesh>
        <mesh position={[3.45, 0.04, 0]} receiveShadow>
          <boxGeometry args={[0.2, 0.12, 180]} />
          <meshStandardMaterial color="#888E99" roughness={0.8} />
        </mesh>

        {/* Laterite Road Shoulders */}
        <mesh position={[-4.2, -0.05, 0]} receiveShadow>
          <boxGeometry args={[1.3, 0.06, 180]} />
          <meshStandardMaterial color="#B95A32" roughness={0.95} />
        </mesh>
        <mesh position={[4.2, -0.05, 0]} receiveShadow>
          <boxGeometry args={[1.3, 0.06, 180]} />
          <meshStandardMaterial color="#B95A32" roughness={0.95} />
        </mesh>

        {/* Pedestrian Zebra Crosswalk at laterite junction (z = -15) */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`crosswalk-hw-1-${i}`} position={[-2.4 + i * 0.7, 0.01, -15]}>
            <boxGeometry args={[0.45, 0.01, 3.5]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
        ))}

        {/* Pedestrian Zebra Crosswalk at Temple Boulevard junction (z = 16) */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`crosswalk-hw-2-${i}`} position={[-2.4 + i * 0.7, 0.01, 16]}>
            <boxGeometry args={[0.45, 0.01, 3.5]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
        ))}

        {/* Highway Streetlights along East side */}
        {[-65, -45, -25, -5, 15, 35, 55].map((z, i) => (
          <StreetLamp key={`hw-lamp-${i}`} position={[4.0, 0, z]} rotation={[0, -Math.PI / 2, 0]} />
        ))}
      </group>

      {/* ----------------- 2. Central Heritage Laterite Road (z = -15) ----------------- */}
      <group position={[0, 0, -15]}>
        {/* Main Laterite compacted soil road spanning 95m (from x = -70 to x = 25) */}
        <mesh position={[-22.5, -0.04, 0]} receiveShadow>
          <boxGeometry args={[95, 0.07, 5.0]} />
          <meshStandardMaterial color="#B95A32" roughness={0.95} />
        </mesh>

        {/* Dual Wheel / Tire Tracks */}
        <mesh position={[-22.5, -0.02, -1.2]} receiveShadow>
          <boxGeometry args={[95, 0.04, 0.7]} />
          <meshStandardMaterial color="#C98E5A" roughness={0.95} />
        </mesh>
        <mesh position={[-22.5, -0.02, 1.2]} receiveShadow>
          <boxGeometry args={[95, 0.04, 0.7]} />
          <meshStandardMaterial color="#C98E5A" roughness={0.95} />
        </mesh>

        {/* Heritage Street Lantern Posts */}
        {[-48, -32, -16, 0, 14].map((x, i) => (
          <StreetLamp key={`v-lamp-${i}`} position={[x, 0, -2.9]} rotation={[0, 0, 0]} />
        ))}
      </group>

      {/* ----------------- 3. Temple Boulevard (East-West at z = 16) ----------------- */}
      <group position={[0, 0, 16]}>
        {/* Paved Asphalt Temple Avenue connecting Highway (x = 25) to Pagoda Complex & Ricefields */}
        <mesh position={[-16, -0.04, 0]} receiveShadow>
          <boxGeometry args={[82, 0.08, 6.2]} />
          <meshStandardMaterial color="#3E4249" roughness={0.75} />
        </mesh>

        {/* White Center Dashes */}
        {Array.from({ length: 16 }).map((_, i) => (
          <mesh key={`tb-dash-${i}`} position={[-52 + i * 5, 0.01, 0]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.18, 0.01, 2.2]} />
            <meshStandardMaterial color="#F4EBC9" />
          </mesh>
        ))}

        {/* Concrete Curbs */}
        <mesh position={[-16, 0.04, -3.15]} receiveShadow>
          <boxGeometry args={[82, 0.12, 0.2]} />
          <meshStandardMaterial color="#888E99" roughness={0.8} />
        </mesh>
        <mesh position={[-16, 0.04, 3.15]} receiveShadow>
          <boxGeometry args={[82, 0.12, 0.2]} />
          <meshStandardMaterial color="#888E99" roughness={0.8} />
        </mesh>

        {/* Pedestrian Sidewalk Pavers on North side of Temple Avenue */}
        <mesh position={[-16, 0.02, -4.15]} receiveShadow>
          <boxGeometry args={[82, 0.05, 1.8]} />
          <meshStandardMaterial color="#C7BBAA" roughness={0.85} />
        </mesh>

        {/* Zebra Crossing in front of Grand Pagoda Entrance Gate (at x = -11) */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={`crosswalk-pagoda-${i}`} position={[-11, 0.01, -2.0 + i * 0.8]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.45, 0.01, 3.0]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
        ))}

        {/* Street Lamps along Temple Boulevard */}
        {[-44, -28, -12, 4, 18].map((x, i) => (
          <StreetLamp key={`tb-lamp-${i}`} position={[x, 0, 3.6]} rotation={[0, Math.PI, 0]} />
        ))}
      </group>

      {/* ----------------- 4. North Residential Village Lane (z = -38) ----------------- */}
      <group position={[0, 0, -38]}>
        <mesh position={[-10, -0.04, 0]} receiveShadow>
          <boxGeometry args={[85, 0.06, 4.2]} />
          <meshStandardMaterial color="#B95A32" roughness={0.95} />
        </mesh>
        <mesh position={[-10, -0.02, -1.0]} receiveShadow>
          <boxGeometry args={[85, 0.03, 0.6]} />
          <meshStandardMaterial color="#C98E5A" roughness={0.95} />
        </mesh>
        <mesh position={[-10, -0.02, 1.0]} receiveShadow>
          <boxGeometry args={[85, 0.03, 0.6]} />
          <meshStandardMaterial color="#C98E5A" roughness={0.95} />
        </mesh>
      </group>

      {/* ----------------- 5. Riverside Scenic Promenade (z = 24.5) ----------------- */}
      <group position={[0, 0, 24.5]}>
        {/* Paved stone promenade walkway alongside the Mekong River */}
        <mesh position={[-17.5, 0.02, 0]} receiveShadow>
          <boxGeometry args={[85, 0.06, 3.8]} />
          <meshStandardMaterial color="#D1C7B7" roughness={0.85} />
        </mesh>

        {/* Stone Balustrade / Railing separating promenade from river slope */}
        <mesh position={[-17.5, 0.5, 1.8]} castShadow>
          <boxGeometry args={[85, 0.8, 0.2]} />
          <meshStandardMaterial color="#FAF8F2" roughness={0.7} />
        </mesh>

        {/* Decorative balustrade posts every 5m */}
        {Array.from({ length: 18 }).map((_, i) => (
          <mesh key={`balustrade-post-${i}`} position={[-58 + i * 4.8, 0.55, 1.8]} castShadow>
            <boxGeometry args={[0.3, 0.95, 0.3]} />
            <meshStandardMaterial color="#FAF8F2" roughness={0.7} />
          </mesh>
        ))}

        {/* Riverside wooden resting benches */}
        {[-48, -32, -16, 0, 14].map((x, i) => (
          <group key={`river-bench-${i}`} position={[x, 0, 0.8]} rotation={[0, Math.PI, 0]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[1.8, 0.08, 0.5]} />
              <meshStandardMaterial color="#6B3E26" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.8, -0.22]} castShadow>
              <boxGeometry args={[1.8, 0.6, 0.08]} />
              <meshStandardMaterial color="#6B3E26" roughness={0.8} />
            </mesh>
            {[-0.8, 0.8].map((bx, j) => (
              <mesh key={`bench-leg-${j}`} position={[bx, 0.22, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 0.45, 6]} />
                <meshStandardMaterial color="#2B2D33" metalness={0.7} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* ----------------- 6. School Courtyard Path & Walkway (z = -7) ----------------- */}
      <group position={[0, 0, -7]}>
        <mesh position={[0, -0.04, 0]} receiveShadow>
          <boxGeometry args={[16, 0.05, 3.8]} />
          <meshStandardMaterial color="#D1B898" roughness={0.85} />
        </mesh>
        {/* Zebra pedestrian stripes connecting school to village road */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={`school-cross-${i}`} position={[-2.0 + i * 1.0, 0.01, -3.8]}>
            <boxGeometry args={[0.5, 0.01, 2.2]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
