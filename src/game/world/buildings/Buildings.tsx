"use client";

import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/state/gameStore";
import type { LocationKey } from "@/data/locations";
import { FBXModel } from "@/game/assets/FBXModel";
import { collisionWorld } from "@/game/physics/collisionSystem";
import { audio } from "@/game/audio/audioManager";
import { MODELS } from "@/game/assets/assetPaths";

// Reusable Interactive building wrapper with hover glow & floating badge
export function InteractiveBuilding({
  locationKey,
  titleEn,
  titleKm,
  badgeIcon,
  position,
  children,
}: {
  locationKey: LocationKey;
  titleEn: string;
  titleKm: string;
  badgeIcon: string;
  position: [number, number, number];
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const moveToLocation = useGameStore((state) => state.moveToLocation);
  const openModal = useGameStore((state) => state.openModal);
  const currentLocation = useGameStore((state) => state.currentLocation);
  const language = useGameStore((state) => state.language);
  const isCurrent = currentLocation === locationKey;

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      if (hovered) {
        groupRef.current.scale.lerp(new THREE.Vector3(1.025, 1.025, 1.025), 0.15);
      } else {
        groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.15);
      }
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    moveToLocation(locationKey);
    if (locationKey === "school") {
      openModal("work");
    } else if (locationKey === "home") {
      openModal("home");
    } else if (locationKey === "market") {
      openModal("market");
    } else if (locationKey === "cafe") {
      openModal("cafe");
    } else if (locationKey === "pagoda") {
      openModal("pagoda");
    } else if (locationKey === "hotel") {
      openModal("hotel");
    } else {
      openModal("decision");
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (typeof document !== "undefined") document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        if (typeof document !== "undefined") document.body.style.cursor = "auto";
      }}
    >
      {children}

      {/* Floating 3D Animated Landmark Beacon */}
      <group position={[0, 8.2, 0]}>
        <mesh castShadow>
          <octahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial
            color={isCurrent ? "#F59E0B" : hovered ? "#FBBF24" : "#FFFFFF"}
            emissive={isCurrent ? "#D97706" : hovered ? "#F59E0B" : "#475569"}
            emissiveIntensity={isCurrent ? 0.9 : 0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Soft ground beacon light when active or hovered */}
        {(isCurrent || hovered) && (
          <pointLight color="#F59E0B" intensity={1.2} distance={8} />
        )}
      </group>
    </group>
  );
}

// 1. School (សាលារៀនកំពង់ចាម) - 2 Storey provincial building with flag & gate
export function SchoolBuilding({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <InteractiveBuilding
      locationKey="school"
      titleEn="School (Work)"
      titleKm="សាលារៀន (កន្លែងធ្វើការ)"
      badgeIcon="🏫"
      position={position}
    >
      <FBXModel
        url={MODELS.BLD_School}
        scale={0.92}
        position={[0, 0, 0]}
        fallback={
          <group>
            {/* Foundation & Steps */}
            <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
              <boxGeometry args={[18.6, 0.5, 9.2]} />
              <meshStandardMaterial color="#B9B5AD" roughness={0.9} />
            </mesh>

            {/* Ground Floor */}
            <mesh position={[0, 1.85, 0.8]} castShadow receiveShadow>
              <boxGeometry args={[18, 2.8, 6.5]} />
              <meshStandardMaterial color="#F0E3C4" />
            </mesh>

      {/* First Floor Balcony Slab */}
      <mesh position={[0, 3.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[18.4, 0.25, 9.0]} />
        <meshStandardMaterial color="#FAF8F2" />
      </mesh>

      {/* Second Floor */}
      <mesh position={[0, 4.85, 0.8]} castShadow receiveShadow>
        <boxGeometry args={[18, 2.8, 6.5]} />
        <meshStandardMaterial color="#F0E3C4" />
      </mesh>

      {/* Second Floor Balcony Rail */}
      <mesh position={[0, 4.0, -3.8]} castShadow>
        <boxGeometry args={[18, 0.8, 0.15]} />
        <meshStandardMaterial color="#FAF8F2" />
      </mesh>

      {/* Classroom Windows Ground & Upper */}
      {[-6.5, -3.5, -0.5, 2.5, 5.5].map((x, i) => (
        <group key={`win-${i}`}>
          <mesh position={[x, 1.9, -2.46]}>
            <boxGeometry args={[1.4, 1.4, 0.1]} />
            <meshStandardMaterial color="#4F7EA3" roughness={0.2} />
          </mesh>
          <mesh position={[x, 4.9, -2.46]}>
            <boxGeometry args={[1.4, 1.4, 0.1]} />
            <meshStandardMaterial color="#4F7EA3" roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Front Pillars */}
      {[-8.5, -5.1, -1.7, 1.7, 5.1, 8.5].map((x, i) => (
        <group key={`col-${i}`}>
          <mesh position={[x, 1.85, -3.8]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 2.8, 8]} />
            <meshStandardMaterial color="#FAF8F2" />
          </mesh>
          <mesh position={[x, 4.85, -3.8]} castShadow>
            <cylinderGeometry args={[0.18, 0.18, 2.8, 8]} />
            <meshStandardMaterial color="#FAF8F2" />
          </mesh>
        </group>
      ))}

      {/* Red Terracotta Hip Roof */}
      <mesh position={[0, 7.1, 0.4]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[11.5, 2.4, 4]} />
        <meshStandardMaterial color="#B9452F" roughness={0.7} />
      </mesh>
          </group>
        }
      />

      {/* Flagpole & Cambodian Flag */}
      <group position={[0, 0, -6.5]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.4, 8]} />
          <meshStandardMaterial color="#B9B5AD" />
        </mesh>
        <mesh position={[0, 4.2, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 8.0, 8]} />
          <meshStandardMaterial color="#BCC1C7" metalness={0.6} />
        </mesh>
        {/* Cambodian Flag (Blue - Red - Blue) */}
        <mesh position={[0.8, 7.4, 0]}>
          <boxGeometry args={[1.5, 0.26, 0.02]} />
          <meshStandardMaterial color="#2B5FA6" />
        </mesh>
        <mesh position={[0.8, 7.05, 0]}>
          <boxGeometry args={[1.5, 0.46, 0.02]} />
          <meshStandardMaterial color="#C8312C" />
        </mesh>
        <mesh position={[0.8, 6.7, 0]}>
          <boxGeometry args={[1.5, 0.26, 0.02]} />
          <meshStandardMaterial color="#2B5FA6" />
        </mesh>
      </group>
    </InteractiveBuilding>
  );
}

// 2. Pagoda / Wat Hall (វត្តអារាម) - Saffron tiered roofs & gold spire
export function PagodaBuilding({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <InteractiveBuilding
      locationKey="pagoda"
      titleEn="Pagoda (Peace)"
      titleKm="វត្តអារាម (សេចក្តីស្ងប់)"
      badgeIcon="🛕"
      position={position}
    >
      <FBXModel
        url={MODELS.BLD_Pagoda}
        scale={0.88}
        position={[0, 0, 0]}
        fallback={
          <group>
            {/* Tiered White Plinth */}
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
              <boxGeometry args={[14, 0.8, 10]} />
              <meshStandardMaterial color="#FAF8F2" />
            </mesh>
            <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
              <boxGeometry args={[12, 0.6, 8.2]} />
              <meshStandardMaterial color="#FAF8F2" />
            </mesh>

            {/* Main Temple Hall */}
            <mesh position={[0, 2.9, 0]} castShadow receiveShadow>
              <boxGeometry args={[10, 3.0, 6.4]} />
              <meshStandardMaterial color="#F0E3C4" />
            </mesh>

            {/* Colonnade Pillars */}
            {[-4.8, -2.4, 0, 2.4, 4.8].map((x, i) => (
              <React.Fragment key={`pag-col-${i}`}>
                <mesh position={[x, 2.7, -3.8]} castShadow>
                  <cylinderGeometry args={[0.22, 0.22, 3.0, 8]} />
                  <meshStandardMaterial color="#FAF8F2" />
                </mesh>
                <mesh position={[x, 2.7, 3.8]} castShadow>
                  <cylinderGeometry args={[0.22, 0.22, 3.0, 8]} />
                  <meshStandardMaterial color="#FAF8F2" />
                </mesh>
              </React.Fragment>
            ))}

            {/* Tier 1 Saffron Roof */}
            <mesh position={[0, 4.6, 0]} castShadow>
              <coneGeometry args={[7.8, 1.8, 4]} />
              <meshStandardMaterial color="#E2931E" roughness={0.6} />
            </mesh>

            {/* Tier 2 Higher Saffron Roof */}
            <mesh position={[0, 5.8, 0]} castShadow>
              <coneGeometry args={[5.8, 1.6, 4]} />
              <meshStandardMaterial color="#B9452F" roughness={0.6} />
            </mesh>

            {/* Golden Ridge & Chovear Spire */}
            <mesh position={[0, 7.3, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.35, 2.0, 8]} />
              <meshStandardMaterial color="#D6A838" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Golden Naga Horns on Roof Edges */}
            {[-4.5, 4.5].map((x, i) => (
              <mesh key={`naga-${i}`} position={[x, 5.2, 0]} rotation={[0, 0, x > 0 ? -0.4 : 0.4]}>
                <coneGeometry args={[0.15, 0.9, 6]} />
                <meshStandardMaterial color="#D6A838" metalness={0.8} />
              </mesh>
            ))}
          </group>
        }
      />
    </InteractiveBuilding>
  );
}

// 3. Traditional Khmer Stilt House (ផ្ទះឈើអ្នកលេង & ផ្ទះអ្នកភូមិ)
export function PlayerEnterableStiltHome({ position = [-14, 0, -20] }: { position?: [number, number, number] }) {
  const isDoorOpen = useGameStore((state) => state.isPlayerHomeDoorOpen);
  const toggleDoor = useGameStore((state) => state.togglePlayerHomeDoor);
  const targetPos = useGameStore((state) => state.targetPos);
  const openModal = useGameStore((state) => state.openModal);
  const doorHingeRef = useRef<THREE.Group>(null);
  const fanRef = useRef<THREE.Group>(null);
  const hammockRef = useRef<THREE.Group>(null);

  // Sync collision world with door state
  useEffect(() => {
    collisionWorld.setHomeDoorOpen(isDoorOpen);
  }, [isDoorOpen]);

  useFrame((state, delta) => {
    if (doorHingeRef.current) {
      // Swings inward by 95 degrees
      const targetAngle = isDoorOpen ? -1.65 : 0;
      doorHingeRef.current.rotation.y = THREE.MathUtils.lerp(
        doorHingeRef.current.rotation.y,
        targetAngle,
        delta * 7.0
      );
    }
    if (fanRef.current) {
      fanRef.current.rotation.y += delta * 4.0;
    }
    if (hammockRef.current) {
      hammockRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
    }
  });

  // Calculate distance to front door [position[0], 0, position[2] + 3.4]
  const doorWorldX = position[0];
  const doorWorldZ = position[2] + 3.4;
  const distToDoor = Math.hypot(targetPos[0] - doorWorldX, targetPos[2] - doorWorldZ);
  const nearDoor = distToDoor < 3.8;

  // Inside house bed proximity
  const distToBed = Math.hypot(targetPos[0] - (position[0] - 2.2), targetPos[2] - (position[2] - 1.2));
  const nearBed = distToBed < 2.4;

  return (
    <group position={position}>
      {/* 1. Stilt Support Pillars (Elevating house with shaded undercroft) */}
      {[-3.6, -1.2, 1.2, 3.6].map((x, i) =>
        [-2.4, 0, 2.4].map((z, j) => (
          <group key={`stilt-${i}-${j}`} position={[x, 0, z]}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.22, 0.25, 0.3, 8]} />
              <meshStandardMaterial color="#B0ABA2" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1.2, 0]} castShadow>
              <cylinderGeometry args={[0.13, 0.13, 2.1, 8]} />
              <meshStandardMaterial color="#5C3B22" roughness={0.8} />
            </mesh>
          </group>
        ))
      )}

      {/* 2. Undercroft Ground Amenities (Hammock, Clay Water Jars, Benches) */}
      <group position={[0, 0.9, 0]} ref={hammockRef}>
        <mesh rotation={[0, 0, 0.1]}>
          <torusGeometry args={[1.3, 0.2, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#2563EB" roughness={0.7} />
        </mesh>
      </group>
      <mesh position={[-3.0, 0.5, 2.6]} castShadow>
        <sphereGeometry args={[0.48, 14, 14]} />
        <meshStandardMaterial color="#A65A3A" roughness={0.9} />
      </mesh>
      <mesh position={[-3.0, 0.9, 2.6]}>
        <cylinderGeometry args={[0.3, 0.25, 0.1, 12]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* 3. Entrance Staircase & Veranda (Wide wooden steps allowing walk-up access) */}
      <group position={[0, 0, 3.4]}>
        {/* Step 1 */}
        <mesh position={[0, 0.12, 1.2]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.24, 0.8]} />
          <meshStandardMaterial color="#6E4423" roughness={0.85} />
        </mesh>
        {/* Step 2 */}
        <mesh position={[0, 0.28, 0.6]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.32, 0.8]} />
          <meshStandardMaterial color="#6E4423" roughness={0.85} />
        </mesh>
        {/* Veranda Porch Floor */}
        <mesh position={[0, 0.42, -0.4]} castShadow receiveShadow>
          <boxGeometry args={[8.4, 0.18, 1.8]} />
          <meshStandardMaterial color="#7A4C27" roughness={0.8} />
        </mesh>
        {/* Veranda Balustrade Railings */}
        <mesh position={[-2.6, 0.88, 0.4]}>
          <boxGeometry args={[3.0, 0.75, 0.08]} />
          <meshStandardMaterial color="#5C3B22" />
        </mesh>
        <mesh position={[2.6, 0.88, 0.4]}>
          <boxGeometry args={[3.0, 0.75, 0.08]} />
          <meshStandardMaterial color="#5C3B22" />
        </mesh>
      </group>

      {/* 4. REAL 3D HINGED FRONT DOOR & ENTRANCE FRAME */}
      <group position={[0, 0.42, 3.4]}>
        {/* Heavy Teak Door Frame */}
        <mesh position={[-0.88, 1.25, 0]} castShadow>
          <boxGeometry args={[0.16, 2.45, 0.2]} />
          <meshStandardMaterial color="#4A2E1B" roughness={0.7} />
        </mesh>
        <mesh position={[0.88, 1.25, 0]} castShadow>
          <boxGeometry args={[0.16, 2.45, 0.2]} />
          <meshStandardMaterial color="#4A2E1B" roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.45, 0]} castShadow>
          <boxGeometry args={[1.92, 0.18, 0.2]} />
          <meshStandardMaterial color="#4A2E1B" roughness={0.7} />
        </mesh>

        {/* Ornate Khmer Lotus Arch Lintel above door */}
        <mesh position={[0, 2.7, 0]}>
          <boxGeometry args={[2.1, 0.3, 0.1]} />
          <meshStandardMaterial color="#D97706" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* The Animated Hinged Door Panel */}
        <group position={[-0.8, 0, 0]} ref={doorHingeRef}>
          <group position={[0.76, 1.22, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.52, 2.34, 0.08]} />
              <meshStandardMaterial color="#784723" roughness={0.75} />
            </mesh>
            <mesh position={[0, 0.4, 0.045]}>
              <boxGeometry args={[1.2, 0.9, 0.02]} />
              <meshStandardMaterial color="#5E3518" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.45, 0.045]}>
              <boxGeometry args={[1.2, 0.75, 0.02]} />
              <meshStandardMaterial color="#5E3518" roughness={0.8} />
            </mesh>
            {/* Brass Door Handle & Latch */}
            <mesh position={[0.62, 0, 0.06]}>
              <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
              <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh position={[0.62, 0, -0.06]}>
              <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} />
              <meshStandardMaterial color="#FBBF24" metalness={0.9} roughness={0.15} />
            </mesh>
          </group>
        </group>

        {/* 3D Floating Door Interaction Indicator */}
        {nearDoor && (
          <group
            position={[0, 2.9, 0.2]}
            onClick={(e) => {
              e.stopPropagation();
              toggleDoor();
            }}
          >
            <mesh>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshStandardMaterial
                color={isDoorOpen ? "#10B981" : "#F59E0B"}
                emissive={isDoorOpen ? "#059669" : "#D97706"}
                emissiveIntensity={1.2}
              />
            </mesh>
            <pointLight color={isDoorOpen ? "#10B981" : "#F59E0B"} intensity={1.5} distance={4} />
          </group>
        )}
      </group>

      {/* 5. WALKABLE 3D INTERIOR (Main Living & Sleeping Room) */}
      <group position={[0, 0.42, 0]}>
        {/* Main Timber Floor */}
        <mesh position={[0, 0, -0.5]} castShadow receiveShadow>
          <boxGeometry args={[8.0, 0.16, 6.0]} />
          <meshStandardMaterial color="#5C381E" roughness={0.7} metalness={0.1} />
        </mesh>

        {/* Walls with Room Openings (Walkable doorway between x=-0.9 and 0.9) */}
        {/* North Wall (Back) */}
        <mesh position={[0, 1.6, -3.4]} castShadow receiveShadow>
          <boxGeometry args={[8.0, 3.2, 0.2]} />
          <meshStandardMaterial color="#8C5B36" roughness={0.85} />
        </mesh>
        {/* West Wall (Left) */}
        <mesh position={[-3.9, 1.6, -0.5]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 3.2, 6.0]} />
          <meshStandardMaterial color="#8C5B36" roughness={0.85} />
        </mesh>
        {/* East Wall (Right) */}
        <mesh position={[3.9, 1.6, -0.5]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 3.2, 6.0]} />
          <meshStandardMaterial color="#8C5B36" roughness={0.85} />
        </mesh>
        {/* South Wall Left of Door */}
        <mesh position={[-2.45, 1.6, 2.4]} castShadow receiveShadow>
          <boxGeometry args={[2.9, 3.2, 0.2]} />
          <meshStandardMaterial color="#8C5B36" roughness={0.85} />
        </mesh>
        {/* South Wall Right of Door */}
        <mesh position={[2.45, 1.6, 2.4]} castShadow receiveShadow>
          <boxGeometry args={[2.9, 3.2, 0.2]} />
          <meshStandardMaterial color="#8C5B36" roughness={0.85} />
        </mesh>

        {/* Windows with Open Shutters */}
        <group position={[-3.9, 1.8, -1.0]}>
          <mesh position={[0, 0, -0.45]} rotation={[0, 0.9, 0]}>
            <boxGeometry args={[0.04, 1.1, 0.45]} />
            <meshStandardMaterial color="#5E3518" />
          </mesh>
          <mesh position={[0, 0, 0.45]} rotation={[0, -0.9, 0]}>
            <boxGeometry args={[0.04, 1.1, 0.45]} />
            <meshStandardMaterial color="#5E3518" />
          </mesh>
        </group>

        {/* 6. COZY INTERIOR FURNITURE & AMENITIES */}
        {/* A. Traditional Woven Bamboo Sleeping Mat (Kantêl) & Mattress */}
        <group position={[-2.2, 0.1, -1.4]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <boxGeometry args={[2.4, 0.25, 2.0]} />
            <meshStandardMaterial color="#4A2E1B" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[2.2, 0.2, 1.8]} />
            <meshStandardMaterial color="#FAF5EE" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.46, 0]}>
            <boxGeometry args={[2.1, 0.02, 1.7]} />
            <meshStandardMaterial color="#C89D66" roughness={0.95} />
          </mesh>
          <mesh position={[0.4, 0.48, 0]}>
            <boxGeometry args={[1.0, 0.04, 1.6]} />
            <meshStandardMaterial color="#B91C1C" roughness={0.9} />
          </mesh>
          <mesh position={[-0.7, 0.52, -0.4]}>
            <boxGeometry args={[0.45, 0.12, 0.6]} />
            <meshStandardMaterial color="#FEF3C7" />
          </mesh>
          <mesh position={[-0.7, 0.52, 0.4]}>
            <boxGeometry args={[0.45, 0.12, 0.6]} />
            <meshStandardMaterial color="#FEF3C7" />
          </mesh>
          {nearBed && (
            <group
              position={[0, 1.1, 0]}
              onClick={(e) => {
                e.stopPropagation();
                openModal("home");
              }}
            >
              <mesh>
                <octahedronGeometry args={[0.2, 0]} />
                <meshStandardMaterial color="#F59E0B" emissive="#D97706" emissiveIntensity={1.2} />
              </mesh>
              <pointLight color="#F59E0B" intensity={1.8} distance={3} />
            </group>
          )}
        </group>

        {/* B. Wooden Tea Table, Ceramic Tea Set & Bananas */}
        <group position={[0.2, 0.1, -1.2]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[1.4, 0.35, 1.0]} />
            <meshStandardMaterial color="#5C3B22" roughness={0.7} />
          </mesh>
          <mesh position={[-0.25, 0.48, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.15, 10]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.2} roughness={0.2} />
          </mesh>
          <mesh position={[0.05, 0.46, -0.15]}>
            <cylinderGeometry args={[0.05, 0.04, 0.08, 8]} />
            <meshStandardMaterial color="#E2E8F0" />
          </mesh>
          <mesh position={[0.05, 0.46, 0.15]}>
            <cylinderGeometry args={[0.05, 0.04, 0.08, 8]} />
            <meshStandardMaterial color="#E2E8F0" />
          </mesh>
          <mesh position={[0.35, 0.48, 0]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial color="#FBBF24" />
          </mesh>
          <mesh position={[-0.35, 0.52, -0.28]}>
            <boxGeometry args={[0.24, 0.14, 0.1]} />
            <meshStandardMaterial color="#78350F" metalness={0.3} />
          </mesh>
        </group>

        {/* C. Rotating Ceiling Fan & Warm Hanging Lantern */}
        <group position={[0, 3.1, -0.6]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          <group ref={fanRef}>
            <mesh>
              <cylinderGeometry args={[0.14, 0.14, 0.08, 12]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            {[0, 1, 2].map((i) => (
              <mesh
                key={`fan-blade-${i}`}
                position={[
                  Math.cos((i * Math.PI * 2) / 3) * 0.7,
                  0,
                  Math.sin((i * Math.PI * 2) / 3) * 0.7,
                ]}
                rotation={[0, (i * Math.PI * 2) / 3, 0.1]}
              >
                <boxGeometry args={[1.1, 0.02, 0.2]} />
                <meshStandardMaterial color="#78350F" roughness={0.6} />
              </mesh>
            ))}
          </group>
          <pointLight position={[0, -0.4, 0]} color="#FEF3C7" intensity={2.0} distance={10} decay={1.5} />
        </group>

        {/* D. Wall Art (Angkor Wat Sunrise & Family Memories) */}
        <mesh position={[0, 2.0, -3.28]}>
          <boxGeometry args={[2.0, 1.2, 0.04]} />
          <meshStandardMaterial color="#D97706" roughness={0.4} />
        </mesh>
        <mesh position={[2.5, 2.0, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[1.4, 0.9, 0.04]} />
          <meshStandardMaterial color="#92400E" roughness={0.4} />
        </mesh>
      </group>

      {/* 7. Traditional Terracotta Gable Roof */}
      <mesh position={[0, 5.2, 0]} castShadow>
        <coneGeometry args={[6.2, 2.6, 4]} />
        <meshStandardMaterial color="#C45E3A" roughness={0.7} />
      </mesh>
      <mesh position={[0, 6.6, 0]}>
        <cylinderGeometry args={[0.08, 0.2, 0.9, 6]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function StiltHouseBuilding({
  position = [0, 0, 0],
  isPlayerHome = true,
}: {
  position?: [number, number, number];
  isPlayerHome?: boolean;
}) {
  if (isPlayerHome) {
    return <PlayerEnterableStiltHome position={position} />;
  }

  return (
    <InteractiveBuilding
      locationKey="home"
      titleEn="Village Home"
      titleKm="ផ្ទះអ្នកភូមិ"
      badgeIcon="🏡"
      position={position}
    >
      <FBXModel
        url={MODELS.BLD_StiltHouse_B}
        scale={0.95}
        position={[0, 0, 0]}
        fallback={
          <group>
            {/* Stilts (Wooden Columns) */}
            {[-3.2, -1.1, 1.1, 3.2].map((x, i) =>
              [-2.0, 0, 2.0].map((z, j) => (
                <group key={`post-${i}-${j}`} position={[x, 1.2, z]}>
                  <mesh position={[0, -1.1, 0]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.2, 6]} />
                    <meshStandardMaterial color="#B9B5AD" />
                  </mesh>
                  <mesh castShadow>
                    <cylinderGeometry args={[0.11, 0.11, 2.3, 8]} />
                    <meshStandardMaterial color="#5C3B22" roughness={0.9} />
                  </mesh>
                </group>
              ))
            )}

            {/* Wooden House Floor & Balcony */}
            <mesh position={[0, 2.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[8.4, 0.2, 5.8]} />
              <meshStandardMaterial color="#5C3B22" />
            </mesh>

            {/* House Walls */}
            <mesh position={[0, 3.8, 0]} castShadow receiveShadow>
              <boxGeometry args={[7.8, 2.5, 5.2]} />
              <meshStandardMaterial color="#8C5B36" roughness={0.8} />
            </mesh>

            {/* Open Windows with Shutters */}
            {[-2.2, 2.2].map((x, i) => (
              <group key={`shutter-${i}`} position={[x, 3.9, -2.62]}>
                <mesh>
                  <boxGeometry args={[0.9, 1.0, 0.05]} />
                  <meshStandardMaterial color="#3A2826" />
                </mesh>
                <mesh position={[-0.5, 0, 0.1]} rotation={[0, -0.6, 0]}>
                  <boxGeometry args={[0.45, 1.0, 0.04]} />
                  <meshStandardMaterial color="#B88A5A" />
                </mesh>
                <mesh position={[0.5, 0, 0.1]} rotation={[0, 0.6, 0]}>
                  <boxGeometry args={[0.45, 1.0, 0.04]} />
                  <meshStandardMaterial color="#B88A5A" />
                </mesh>
              </group>
            ))}

            {/* Terracotta Gable Roof */}
            <mesh position={[0, 5.8, 0]} castShadow>
              <coneGeometry args={[5.6, 2.2, 4]} />
              <meshStandardMaterial color="#C45E3A" roughness={0.7} />
            </mesh>

            {/* Wooden Staircase to Veranda */}
            <group position={[3.2, 1.15, -3.2]} rotation={[0.4, 0, 0]}>
              <mesh castShadow>
                <boxGeometry args={[1.2, 2.8, 0.15]} />
                <meshStandardMaterial color="#B88A5A" />
              </mesh>
            </group>

            {/* Hammock Underneath House */}
            <mesh position={[0, 0.8, 0]} rotation={[0, 0, 0.1]}>
              <torusGeometry args={[1.2, 0.18, 8, 16, Math.PI]} />
              <meshStandardMaterial color="#2E86C1" />
            </mesh>

            {/* Clay Water Jar (ពាងទឹក) */}
            <mesh position={[-2.8, 0.5, -2.2]} castShadow>
              <sphereGeometry args={[0.45, 12, 12]} />
              <meshStandardMaterial color="#A65A3A" roughness={0.9} />
            </mesh>
          </group>
        }
      />
    </InteractiveBuilding>
  );
}

// 4. Shophouse Block (ផ្ទះល្វែង)
export function ShophouseBlock({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const colors = ["#A9D8C2", "#EFCB6E", "#F2B793", "#9CC3E0"];
  return (
    <group position={position}>
      {colors.map((col, idx) => {
        const xOffset = (idx - 1.5) * 4.4;
        return (
          <group key={`shop-${idx}`} position={[xOffset, 0, 0]}>
            {/* 3 Floors */}
            <mesh position={[0, 4.8, 0]} castShadow receiveShadow>
              <boxGeometry args={[4.2, 9.6, 8.5]} />
              <meshStandardMaterial color={col} />
            </mesh>

            {/* Balcony Railings */}
            <mesh position={[0, 3.4, -4.3]}>
              <boxGeometry args={[3.8, 0.8, 0.1]} />
              <meshStandardMaterial color="#FAF8F2" />
            </mesh>
            <mesh position={[0, 6.6, -4.3]}>
              <boxGeometry args={[3.8, 0.8, 0.1]} />
              <meshStandardMaterial color="#FAF8F2" />
            </mesh>

            {/* Roller Shutter at Ground Level */}
            <mesh position={[0, 1.4, -4.26]}>
              <boxGeometry args={[3.6, 2.6, 0.05]} />
              <meshStandardMaterial color="#A7ABAF" metalness={0.4} />
            </mesh>

            {/* Canopy / Awning */}
            <mesh position={[0, 2.8, -4.8]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[3.8, 0.1, 1.2]} />
              <meshStandardMaterial color="#2E86C1" />
            </mesh>

            {/* Rooftop Trim & Water Tank */}
            <mesh position={[1.0, 10.1, 2.0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.9, 10]} />
              <meshStandardMaterial color="#FAF8F2" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// 5. Market Stall (តូបផ្សារ)
export function MarketStall({
  position = [0, 0, 0],
  tarpColor = "#D9443A",
}: {
  position?: [number, number, number];
  tarpColor?: string;
}) {
  return (
    <InteractiveBuilding
      locationKey="market"
      titleEn="Market (Snacks)"
      titleKm="ផ្សារ (ទិញម្ហូប)"
      badgeIcon="🍉"
      position={position}
    >
      <FBXModel
        url={tarpColor === "#2E86C1" ? MODELS.BLD_MarketStall_Blue : MODELS.BLD_MarketStall_Red}
        scale={1.1}
        position={[0, 0, 0]}
        fallback={
          <group>
            {/* Wooden Table */}
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.8, 0.1, 1.6]} />
              <meshStandardMaterial color="#B88A5A" />
            </mesh>
            {[-1.3, 1.3].map((x, i) =>
              [-0.7, 0.7].map((z, j) => (
                <mesh key={`tbl-leg-${i}-${j}`} position={[x, 0.38, z]}>
                  <cylinderGeometry args={[0.04, 0.04, 0.75, 6]} />
                  <meshStandardMaterial color="#5C3B22" />
                </mesh>
              ))
            )}

            {/* Fruit Baskets */}
            {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
              <group key={`bsk-${i}`} position={[x, 0.9, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.26, 0.2, 0.2, 10]} />
                  <meshStandardMaterial color="#D8B26A" />
                </mesh>
                <mesh position={[0, 0.14, 0]}>
                  <sphereGeometry args={[0.18, 8, 8]} />
                  <meshStandardMaterial
                    color={i === 0 ? "#F08A24" : i === 1 ? "#7DB83A" : i === 2 ? "#C8312C" : "#F3D23B"}
                  />
                </mesh>
              </group>
            ))}

            {/* Poles & Sloped Tarp Canopy */}
            {[-1.4, 1.4].map((x, i) => (
              <React.Fragment key={`pole-${i}`}>
                <mesh position={[x, 1.25, -0.9]}>
                  <cylinderGeometry args={[0.03, 0.03, 2.5, 6]} />
                  <meshStandardMaterial color="#5E6268" />
                </mesh>
                <mesh position={[x, 1.15, 0.9]}>
                  <cylinderGeometry args={[0.03, 0.03, 2.3, 6]} />
                  <meshStandardMaterial color="#5E6268" />
                </mesh>
              </React.Fragment>
            ))}
            <mesh position={[0, 2.35, 0]} rotation={[0.1, 0, 0]} castShadow>
              <boxGeometry args={[3.2, 0.06, 2.2]} />
              <meshStandardMaterial color={tarpColor} />
            </mesh>
          </group>
        }
      />
    </InteractiveBuilding>
  );
}

// 6. Coffee Stall Cart (តូបកាហ្វេ)
export function CoffeeStall({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <InteractiveBuilding
      locationKey="cafe"
      titleEn="Riverside Cafe"
      titleKm="តូបកាហ្វេមាត់ទន្លេ"
      badgeIcon="☕"
      position={position}
    >
      <FBXModel
        url={MODELS.BLD_CoffeeStall}
        scale={1.1}
        position={[0, 0, 0]}
        fallback={
          <group>
            {/* Mobile Cart Counter */}
            <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.6, 0.9, 0.9]} />
              <meshStandardMaterial color="#FAF8F2" />
            </mesh>
            <mesh position={[0, 1.12, 0]} castShadow>
              <boxGeometry args={[1.7, 0.06, 1.0]} />
              <meshStandardMaterial color="#BCC1C7" metalness={0.7} />
            </mesh>

            {/* Coffee Maker & Milk Cans & Cups */}
            <mesh position={[-0.4, 1.26, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.22, 10]} />
              <meshStandardMaterial color="#6B3E26" />
            </mesh>
            <mesh position={[0, 1.26, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.22, 10]} />
              <meshStandardMaterial color="#DDEEF5" roughness={0.1} />
            </mesh>
            <mesh position={[0.4, 1.26, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.22, 10]} />
              <meshStandardMaterial color="#C99A6B" />
            </mesh>

            {/* Big Yellow/Red Umbrella */}
            <group position={[0.7, 0, 0.3]}>
              <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 3.0, 6]} />
                <meshStandardMaterial color="#5E6268" />
              </mesh>
              <mesh position={[0, 2.9, 0]} castShadow>
                <coneGeometry args={[1.6, 0.6, 12]} />
                <meshStandardMaterial color="#F2C14E" />
              </mesh>
            </group>

            {/* Red and Blue Plastic Stools */}
            {[-0.8, 0.3, 1.1].map((x, i) => (
              <mesh key={`stool-${i}`} position={[x, 0.22, -1.2]} castShadow>
                <cylinderGeometry args={[0.22, 0.24, 0.44, 10]} />
                <meshStandardMaterial color={i % 2 === 0 ? "#D8352F" : "#2F6DB5"} />
              </mesh>
            ))}
          </group>
        }
      />
    </InteractiveBuilding>
  );
}

// 7. Mekong River Bridge (ស្ពានទន្លេមេគង្គ)
export function Bridge({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      <FBXModel
        url={MODELS.BLD_Bridge}
        scale={[1.15, 1.0, 3.2]}
        position={[0, 0, 0]}
        fallback={
          <group>
            {/* Road Deck */}
            <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[7.0, 0.5, 12.0]} />
              <meshStandardMaterial color="#B9B5AD" />
            </mesh>
            <mesh position={[0, 1.48, 0]} receiveShadow>
              <boxGeometry args={[5.8, 0.06, 12.0]} />
              <meshStandardMaterial color="#4B4D52" />
            </mesh>

            {/* White Guardrails */}
            {[-3.4, 3.4].map((x, i) => (
              <mesh key={`rail-${i}`} position={[x, 2.0, 0]}>
                <boxGeometry args={[0.2, 0.9, 12.0]} />
                <meshStandardMaterial color="#FAF8F2" />
              </mesh>
            ))}

            {/* Concrete Support Piers down to River Bed */}
            {[-2.2, 2.2].map((x, i) =>
              [-3.5, 3.5].map((z, j) => (
                <mesh key={`pier-${i}-${j}`} position={[x, -0.4, z]}>
                  <boxGeometry args={[1.4, 3.2, 1.4]} />
                  <meshStandardMaterial color="#8E8A83" />
                </mesh>
              ))
            )}

            {/* Streetlights on Bridge */}
            {[-3.4, 3.4].map((x, i) =>
              [-4, 0, 4].map((z, j) => (
                <group key={`light-${i}-${j}`} position={[x, 2.5, z]}>
                  <mesh>
                    <cylinderGeometry args={[0.04, 0.04, 1.2, 6]} />
                    <meshStandardMaterial color="#BCC1C7" />
                  </mesh>
                  <mesh position={[0, 0.65, 0]}>
                    <sphereGeometry args={[0.12, 8, 8]} />
                    <meshStandardMaterial color="#FFF3C8" emissive="#FFF3C8" emissiveIntensity={0.6} />
                  </mesh>
                </group>
              ))
            )}
          </group>
        }
      />
    </group>
  );
}

// -----------------------------------------------------------------------------
// 8. Pagoda Grand Entrance Gate (ក្លោងទ្វារវត្ត)
// -----------------------------------------------------------------------------
export function PagodaEntranceGate({ position = [-11, 0, 18] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Ornate Gate Columns Left & Right (gap = 5.2m between them) */}
      {[-2.6, 2.6].map((z, i) => (
        <group key={`gate-col-${i}`} position={[0, 0, z]}>
          {/* Base pedestal */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[1.3, 0.8, 1.3]} />
            <meshStandardMaterial color="#FAF8F2" roughness={0.8} />
          </mesh>
          {/* Main Pillar */}
          <mesh position={[0, 2.4, 0]} castShadow>
            <boxGeometry args={[0.9, 3.2, 0.9]} />
            <meshStandardMaterial color="#E8D5B0" roughness={0.8} />
          </mesh>
          {/* Pillar Capital & Lotus Moulding */}
          <mesh position={[0, 4.15, 0]} castShadow>
            <boxGeometry args={[1.2, 0.3, 1.2]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Night Lantern Lamp on each pillar */}
          <mesh position={[0, 4.5, 0]}>
            <sphereGeometry args={[0.2, 10, 10]} />
            <meshStandardMaterial color="#FFF1B8" emissive="#FFE58F" emissiveIntensity={1.2} />
          </mesh>
          <pointLight position={[0, 4.5, 0]} color="#FFE58F" intensity={0.9} distance={8} />
        </group>
      ))}

      {/* Cross Arch / Lintel Beam */}
      <mesh position={[0, 4.3, 0]} castShadow>
        <boxGeometry args={[1.1, 0.6, 6.4]} />
        <meshStandardMaterial color="#FAF8F2" roughness={0.7} />
      </mesh>

      {/* Multi-tiered Gable Temple Roof Arch */}
      <mesh position={[0, 5.2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <coneGeometry args={[3.8, 1.4, 4]} />
        <meshStandardMaterial color="#E2931E" roughness={0.6} />
      </mesh>
      <mesh position={[0, 6.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <coneGeometry args={[2.4, 1.2, 4]} />
        <meshStandardMaterial color="#B9452F" roughness={0.6} />
      </mesh>

      {/* Central Golden Peak Spire */}
      <mesh position={[0, 7.2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.2, 1.6, 8]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Khmer Inscription Plaque (វត្តអារាមកំពង់ចាម) */}
      <mesh position={[0.56, 4.3, 0]}>
        <boxGeometry args={[0.04, 0.42, 3.2]} />
        <meshStandardMaterial color="#8C1D18" />
      </mesh>
    </group>
  );
}

// -----------------------------------------------------------------------------
// 9. Pagoda Boundary Walls (កំពែងវត្ត)
// -----------------------------------------------------------------------------
export function PagodaPerimeterWalls() {
  return (
    <group>
      {/* North Enclosing Wall (z = 9.5, length = 26m, x from -37 to -11) */}
      <mesh position={[-24, 1.0, 9.5]} castShadow receiveShadow>
        <boxGeometry args={[26, 2.0, 0.45]} />
        <meshStandardMaterial color="#FAF8F2" roughness={0.8} />
      </mesh>
      {/* North Wall Terracotta Coping Tiles */}
      <mesh position={[-24, 2.05, 9.5]}>
        <boxGeometry args={[26.4, 0.15, 0.65]} />
        <meshStandardMaterial color="#B9452F" roughness={0.7} />
      </mesh>

      {/* South Enclosing Wall (z = 26.5, length = 26m, x from -37 to -11) */}
      <mesh position={[-24, 1.0, 26.5]} castShadow receiveShadow>
        <boxGeometry args={[26, 2.0, 0.45]} />
        <meshStandardMaterial color="#FAF8F2" roughness={0.8} />
      </mesh>
      <mesh position={[-24, 2.05, 26.5]}>
        <boxGeometry args={[26.4, 0.15, 0.65]} />
        <meshStandardMaterial color="#B9452F" roughness={0.7} />
      </mesh>

      {/* West Enclosing Wall (x = -37, length = 17m, z from 9.5 to 26.5) */}
      <mesh position={[-37, 1.0, 18]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 2.0, 17.0]} />
        <meshStandardMaterial color="#FAF8F2" roughness={0.8} />
      </mesh>
      <mesh position={[-37, 2.05, 18]}>
        <boxGeometry args={[0.65, 0.15, 17.4]} />
        <meshStandardMaterial color="#B9452F" roughness={0.7} />
      </mesh>

      {/* East Enclosing Wall (North segment: z = 10 to 15.4) */}
      <mesh position={[-11, 1.0, 12.5]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 2.0, 6.0]} />
        <meshStandardMaterial color="#FAF8F2" roughness={0.8} />
      </mesh>
      <mesh position={[-11, 2.05, 12.5]}>
        <boxGeometry args={[0.65, 0.15, 6.2]} />
        <meshStandardMaterial color="#B9452F" roughness={0.7} />
      </mesh>

      {/* East Enclosing Wall (South segment: z = 20.6 to 26.5) */}
      <mesh position={[-11, 1.0, 23.5]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 2.0, 6.0]} />
        <meshStandardMaterial color="#FAF8F2" roughness={0.8} />
      </mesh>
      <mesh position={[-11, 2.05, 23.5]}>
        <boxGeometry args={[0.65, 0.15, 6.2]} />
        <meshStandardMaterial color="#B9452F" roughness={0.7} />
      </mesh>

      {/* Decorative Wall Pillars with Lotus Ornaments every 6m */}
      {[-37, -31, -25, -19, -13].map((x, i) => (
        <React.Fragment key={`wall-pil-${i}`}>
          <mesh position={[x, 1.15, 9.5]} castShadow>
            <boxGeometry args={[0.6, 2.3, 0.6]} />
            <meshStandardMaterial color="#E8D5B0" roughness={0.8} />
          </mesh>
          <mesh position={[x, 2.4, 9.5]} castShadow>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.7} />
          </mesh>

          <mesh position={[x, 1.15, 26.5]} castShadow>
            <boxGeometry args={[0.6, 2.3, 0.6]} />
            <meshStandardMaterial color="#E8D5B0" roughness={0.8} />
          </mesh>
          <mesh position={[x, 2.4, 26.5]} castShadow>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.7} />
          </mesh>
        </React.Fragment>
      ))}
    </group>
  );
}

// -----------------------------------------------------------------------------
// 10. Sacred Buddhist Stupa / Chedey (ចេតិយ)
// -----------------------------------------------------------------------------
export function BuddhistStupa({
  position = [0, 0, 0],
  scale = 1.0,
  isGold = true,
}: {
  position?: [number, number, number];
  scale?: number;
  isGold?: boolean;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Plinth Base (3 stepped squares) */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 0.5, 3.0]} />
        <meshStandardMaterial color="#FAF8F2" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.4, 2.5]} />
        <meshStandardMaterial color="#FAF8F2" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.4, 2.0]} />
        <meshStandardMaterial color="#E8D5B0" roughness={0.7} />
      </mesh>

      {/* Bell Dome (Garba) */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <cylinderGeometry args={[0.7, 1.1, 1.4, 16]} />
        <meshStandardMaterial
          color={isGold ? "#D4AF37" : "#FAF8F2"}
          metalness={isGold ? 0.75 : 0.1}
          roughness={isGold ? 0.3 : 0.8}
        />
      </mesh>

      {/* Reliquary Box (Harmika) */}
      <mesh position={[0, 2.85, 0]} castShadow>
        <boxGeometry args={[0.7, 0.35, 0.7]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Tiered Ring Spire (Chhatra Rings) */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={`ring-${i}`} position={[0, 3.2 + i * 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.32 - i * 0.045, 0.36 - i * 0.045, 0.18, 12]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}

      {/* Final Golden Lotus Spire Tip */}
      <mesh position={[0, 5.2, 0]} castShadow>
        <coneGeometry args={[0.08, 0.8, 8]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  );
}

// -----------------------------------------------------------------------------
// 11. Pagoda Bell Tower / Hor Keng (ហោជួង)
// -----------------------------------------------------------------------------
export function PagodaBellTower({ position = [-32, 0, 11] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Square White Base */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.8, 4.2]} />
        <meshStandardMaterial color="#FAF8F2" roughness={0.8} />
      </mesh>

      {/* 4 Wooden Columns */}
      {[-1.5, 1.5].map((x, i) =>
        [-1.5, 1.5].map((z, j) => (
          <mesh key={`bt-col-${i}-${j}`} position={[x, 2.6, z]} castShadow>
            <cylinderGeometry args={[0.16, 0.18, 3.6, 8]} />
            <meshStandardMaterial color="#5C3B22" roughness={0.85} />
          </mesh>
        ))
      )}

      {/* Mid Platform & Balustrade */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <boxGeometry args={[4.0, 0.2, 4.0]} />
        <meshStandardMaterial color="#8C5B36" />
      </mesh>

      {/* Suspended Large Bronze Temple Bell */}
      <group position={[0, 3.6, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.3, 0.65, 1.2, 12]} />
          <meshStandardMaterial color="#8C6239" metalness={0.8} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <torusGeometry args={[0.15, 0.04, 6, 12]} />
          <meshStandardMaterial color="#4A3425" metalness={0.8} />
        </mesh>
      </group>

      {/* Tiered Temple Roof */}
      <mesh position={[0, 5.0, 0]} castShadow>
        <coneGeometry args={[3.2, 1.4, 4]} />
        <meshStandardMaterial color="#E2931E" roughness={0.6} />
      </mesh>
      <mesh position={[0, 6.0, 0]} castShadow>
        <coneGeometry args={[1.8, 1.0, 4]} />
        <meshStandardMaterial color="#B9452F" roughness={0.6} />
      </mesh>
      <mesh position={[0, 6.8, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.14, 1.0, 8]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.85} />
      </mesh>
    </group>
  );
}

// -----------------------------------------------------------------------------
// 12. Incense Altar & Lotus Shrine (ជើងធូប)
// -----------------------------------------------------------------------------
export function PagodaIncenseAltar({ position = [-18, 0, 18] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Stone Altar Table */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.0, 1.2]} />
        <meshStandardMaterial color="#FAF8F2" roughness={0.8} />
      </mesh>
      {/* Golden Table Trim */}
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[2.3, 0.06, 1.3]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.7} />
      </mesh>

      {/* Bronze Incense Burner Urn */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.22, 0.5, 12]} />
        <meshStandardMaterial color="#8C6239" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Incense Sticks */}
      {[-0.05, 0, 0.05].map((x, i) => (
        <mesh key={`incense-${i}`} position={[x, 1.75, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.45, 4]} />
          <meshStandardMaterial color="#D9381E" emissive="#D9381E" emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* Lotus Blossom Bowls on sides */}
      {[-0.7, 0.7].map((x, i) => (
        <group key={`lotus-${i}`} position={[x, 1.15, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.12, 0.16, 10]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color="#FF69B4" roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// -----------------------------------------------------------------------------
// 13. Mekong Riverside Grand Hotel & VIP Supercar Plaza
// -----------------------------------------------------------------------------
export function GrandHotelBuilding({ position = [18, 0, -30] }: { position?: [number, number, number] }) {
  return (
    <InteractiveBuilding
      locationKey="hotel"
      titleEn="Mekong Grand Hotel"
      titleKm="សណ្ឋាគារមេគង្គ ហ្គ្រេន"
      badgeIcon="🏨"
      position={position}
    >
      <group>
        {/* Main Hotel Tower (4 Storeys: Height = 14m, Width = 22m, Depth = 11m) */}
        <mesh position={[0, 7.0, 0]} castShadow receiveShadow>
          <boxGeometry args={[22.0, 14.0, 11.0]} />
          <meshStandardMaterial color="#FAF8F2" roughness={0.65} />
        </mesh>

        {/* Lower Ground Floor (Dark Modern Stone Facade) */}
        <mesh position={[0, 2.0, 0.1]} castShadow receiveShadow>
          <boxGeometry args={[22.2, 4.0, 11.2]} />
          <meshStandardMaterial color="#2C323D" roughness={0.6} />
        </mesh>

        {/* Grand Glass Lobby Windows & Doors */}
        <mesh position={[0, 2.0, 5.75]}>
          <boxGeometry args={[12.0, 3.2, 0.2]} />
          <meshStandardMaterial color="#6AA8D9" metalness={0.8} roughness={0.1} transparent opacity={0.85} />
        </mesh>

        {/* Porte-Cochère Entrance Canopy (Drive-Through for Supercars) */}
        <mesh position={[0, 4.2, 8.5]} castShadow>
          <boxGeometry args={[14.0, 0.35, 5.8]} />
          <meshStandardMaterial color="#1E232B" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Canopy Support Pillars */}
        {[-6.2, 6.2].map((x, i) => (
          <mesh key={`canopy-col-${i}`} position={[x, 2.0, 11.0]} castShadow>
            <cylinderGeometry args={[0.28, 0.28, 4.0, 12]} />
            <meshStandardMaterial color="#B0B5BF" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}

        {/* Golden Hotel Sign: "MEKONG GRAND HOTEL" */}
        <mesh position={[0, 4.6, 11.2]}>
          <boxGeometry args={[9.5, 0.6, 0.15]} />
          <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} emissive="#D4AF37" emissiveIntensity={0.4} />
        </mesh>

        {/* Balconies on Upper Floors */}
        {[6.0, 9.5, 12.8].map((y, row) => (
          <React.Fragment key={`balc-row-${row}`}>
            {[-8, -4, 0, 4, 8].map((x, col) => (
              <group key={`balc-${row}-${col}`} position={[x, y, 5.7]}>
                {/* Balcony Glass Panel */}
                <mesh position={[0, 0.45, 0.3]}>
                  <boxGeometry args={[2.8, 0.9, 0.1]} />
                  <meshStandardMaterial color="#4A8ABF" metalness={0.7} roughness={0.2} transparent opacity={0.75} />
                </mesh>
                {/* French Window Doors */}
                <mesh position={[0, 0.9, 0]}>
                  <boxGeometry args={[2.2, 1.8, 0.1]} />
                  <meshStandardMaterial color="#2A384A" roughness={0.3} />
                </mesh>
              </group>
            ))}
          </React.Fragment>
        ))}

        {/* Rooftop Parapet, Terrace & Flags */}
        <mesh position={[0, 14.3, 0]} castShadow>
          <boxGeometry args={[22.4, 0.6, 11.4]} />
          <meshStandardMaterial color="#303640" />
        </mesh>
        {/* Rooftop Flags */}
        {[-7, 7].map((x, i) => (
          <group key={`rt-flag-${i}`} position={[x, 14.6, 4.5]}>
            <mesh position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 3.0, 6]} />
              <meshStandardMaterial color="#BCC1C7" metalness={0.8} />
            </mesh>
            <mesh position={[0.45, 2.5, 0]}>
              <boxGeometry args={[0.9, 0.6, 0.02]} />
              <meshStandardMaterial color={i === 0 ? "#2B5FA6" : "#C8312C"} />
            </mesh>
          </group>
        ))}

        {/* Warm Entrance Chandelier Lights under Canopy */}
        <pointLight position={[0, 3.8, 8.5]} color="#FFE5A3" intensity={2.2} distance={14} />

        {/* ----------------- VIP Supercar Parking Bay ----------------- */}
        <group position={[0, 0.02, 8.5]}>
          {/* Parking Asphalt Pad */}
          <mesh position={[0, -0.01, 0]} receiveShadow>
            <boxGeometry args={[16.0, 0.04, 8.0]} />
            <meshStandardMaterial color="#2B2D33" roughness={0.8} />
          </mesh>

          {/* Yellow VIP Parking Box Markings for Supercar */}
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[5.0, 0.01, 0.12]} />
            <meshStandardMaterial color="#FBBF24" />
          </mesh>
          <mesh position={[-2.5, 0.01, -1.8]}>
            <boxGeometry args={[0.12, 0.01, 3.6]} />
            <meshStandardMaterial color="#FBBF24" />
          </mesh>
          <mesh position={[2.5, 0.01, -1.8]}>
            <boxGeometry args={[0.12, 0.01, 3.6]} />
            <meshStandardMaterial color="#FBBF24" />
          </mesh>

          {/* "VIP SUPERCAR" Parking Sign Post */}
          <group position={[2.9, 0, 0]}>
            <mesh position={[0, 0.8, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 1.6, 6]} />
              <meshStandardMaterial color="#BCC1C7" metalness={0.7} />
            </mesh>
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[0.8, 0.5, 0.05]} />
              <meshStandardMaterial color="#D97706" />
            </mesh>
          </group>
        </group>
      </group>
    </InteractiveBuilding>
  );
}

// -----------------------------------------------------------------------------
// 14. Provincial Town Hall & Public Library (សាលាខេត្ត / បណ្ណាល័យ)
// -----------------------------------------------------------------------------
export function TownHallBuilding({ position = [-42, 0, -15] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Foundation & Steps */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[16.4, 0.8, 10.4]} />
        <meshStandardMaterial color="#B9B5AD" roughness={0.9} />
      </mesh>

      {/* Main Heritage 2-Storey Hall */}
      <mesh position={[0, 3.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[16.0, 6.0, 10.0]} />
        <meshStandardMaterial color="#E8C87A" roughness={0.8} />
      </mesh>

      {/* Classical Arched Front Portico */}
      {[-6.0, -3.0, 0, 3.0, 6.0].map((x, i) => (
        <group key={`th-col-${i}`} position={[x, 3.4, 5.4]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.25, 0.28, 5.2, 10]} />
            <meshStandardMaterial color="#FAF8F2" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Upper Pediment & Clock */}
      <mesh position={[0, 7.8, 0]} castShadow>
        <boxGeometry args={[16.4, 1.8, 10.4]} />
        <meshStandardMaterial color="#B9452F" roughness={0.7} />
      </mesh>
      <mesh position={[0, 8.2, 5.25]}>
        <circleGeometry args={[0.65, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>

      {/* Entrance Door */}
      <mesh position={[0, 1.8, 5.06]}>
        <boxGeometry args={[2.2, 2.6, 0.1]} />
        <meshStandardMaterial color="#4A2E1B" roughness={0.7} />
      </mesh>
    </group>
  );
}

