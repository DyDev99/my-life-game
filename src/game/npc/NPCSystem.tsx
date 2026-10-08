"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/state/gameStore";
import { audio } from "@/game/audio/audioManager";

interface NPCConfig {
  id: string;
  nameEn: string;
  nameKm: string;
  roleEn: string;
  roleKm: string;
  pos: [number, number, number];
  heading: number;
  waypoints?: [number, number, number][];
  speed?: number;
  skinColor: string;
  topColor: string;
  bottomColor: string;
  hairColor: string;
  isMonk?: boolean;
  isSeated?: boolean;
  hasHat?: boolean;
  dialogueEn: string;
  dialogueKm: string;
}

const NPCS: NPCConfig[] = [
  // 1. Buddhist Monk at Wat / Pagoda
  {
    id: "monk_sophal",
    nameEn: "Ven. Sophal",
    nameKm: "ព្រះសង្ឃ សុផល",
    roleEn: "Buddhist Monk",
    roleKm: "ព្រះសង្ឃ",
    pos: [-14, 0, 15.5],
    heading: 0,
    waypoints: [
      [-14, 0, 15.5],
      [-11.5, 0, 14.0],
      [-14, 0, 17.5],
    ],
    speed: 1.2,
    skinColor: "#CF946A",
    topColor: "#EA580C", // Saffron orange robe
    bottomColor: "#C2410C",
    hairColor: "#A855F7", // Shaved head
    isMonk: true,
    dialogueEn: "May peace and good health be with your family in Kampong Cham. Keep a calm and virtuous heart.",
    dialogueKm: "សូមឱ្យអ្នកនិងក្រុមគ្រួសារបានសុខសាន្ត និងមានសេចក្តីស្ងប់ក្នុងចិត្ត។",
  },
  // 2. High School Student near School
  {
    id: "student_bopha",
    nameEn: "Bopha",
    nameKm: "បុប្ផា",
    roleEn: "High School Student",
    roleKm: "សិស្សវិទ្យាល័យ",
    pos: [1.5, 0, 3.5],
    heading: Math.PI,
    waypoints: [
      [1.5, 0, 3.5],
      [-2.0, 0, 1.0],
      [1.5, 0, -1.5],
    ],
    speed: 1.8,
    skinColor: "#E9B996",
    topColor: "#ECEEF1", // Clean white school shirt
    bottomColor: "#1F2A44", // Pleated navy skirt
    hairColor: "#1C1714",
    dialogueEn: "Good morning teacher! We are preparing for the national high school exams this semester.",
    dialogueKm: "ជម្រាបសួរលោកគ្រូ! ពួកយើងកំពុងខិតខំរៀនសូត្រត្រៀមប្រឡងបាក់ឌុប។",
  },
  // 3. Grandmother resting under Stilt House
  {
    id: "yeay_mao",
    nameEn: "Lok Yeay Mao",
    nameKm: "លោកយាយ ម៉ៅ",
    roleEn: "Village Grandmother",
    roleKm: "លោកយាយក្នុងភូមិ",
    pos: [-12.8, 0, -18.8],
    heading: -Math.PI / 3,
    skinColor: "#C2855E",
    topColor: "#FAF5FF", // White linen blouse
    bottomColor: "#4C1D95", // Traditional purple sarong
    hairColor: "#E2E8F0", // Silver gray bun
    isSeated: true,
    dialogueEn: "Have you eaten breakfast yet, grandchild? Drink plenty of coconut water on hot days.",
    dialogueKm: "ញ៉ាំបាយហើយឬនៅចៅ? កុំភ្លេចហូបទឹកដូងឱ្យបានច្រើនក្នុងថ្ងៃក្តៅណា។",
  },
  // 4. Uncle Heng at Market Stalls
  {
    id: "uncle_heng",
    nameEn: "Uncle Heng",
    nameKm: "ពូ ហេង",
    roleEn: "Market Fruit Vendor",
    roleKm: "អ្នកលក់ផ្លែឈើ",
    pos: [12.8, 0, -9.5],
    heading: Math.PI / 2,
    skinColor: "#AD744E",
    topColor: "#991B1B", // Plaid krama red
    bottomColor: "#1E293B",
    hairColor: "#1C1714",
    hasHat: true,
    dialogueEn: "Fresh sweet Kampong Cham pomelo and ripe mangoes just picked this morning!",
    dialogueKm: "ក្រូចថ្លុងកំពង់ចាមផ្អែមឆ្ងាញ់ និងស្វាយទុំទើបតែបេះព្រឹកមិញនេះទេ!",
  },
  // 5. Ming Sothea at Riverside Coffee Cart
  {
    id: "ming_sothea",
    nameEn: "Ming Sothea",
    nameKm: "មីង សុធា",
    roleEn: "Riverside Coffee Seller",
    roleKm: "អ្នកឆុងកាហ្វេ",
    pos: [-5.2, 0, -11.5],
    heading: -Math.PI / 2,
    skinColor: "#CF946A",
    topColor: "#FFFBEB", // Floral blouse
    bottomColor: "#92400E", // Coffee apron
    hairColor: "#292524",
    dialogueEn: "Welcome! Come have a glass of cold iced milk coffee by the Mekong breeze.",
    dialogueKm: "សូមស្វាគមន៍! មកញ៉ាំកាហ្វេទឹកដោះគោទឹកកកមាត់ទន្លេមេគង្គឱ្យត្រជាក់ចិត្ត។",
  },
  // 6. Chhay listening to music near Motorbike
  {
    id: "youth_chhay",
    nameEn: "Chhay",
    nameKm: "ឆាយ",
    roleEn: "Local Youth",
    roleKm: "យុវជនក្នុងភូមិ",
    pos: [7.2, 0, -13.5],
    heading: -Math.PI / 4,
    skinColor: "#E9B996",
    topColor: "#0F172A", // Dark tee
    bottomColor: "#334155",
    hairColor: "#1C1714",
    dialogueEn: "Hey! Beautiful day for a ride across the Kizuna bridge, isn't it?",
    dialogueKm: "សួស្តីបង! ថ្ងៃនេះមេឃស្រឡះល្អ ជិះម៉ូតូឆ្លងស្ពានគីហ្សូណាពិតជាត្រជាក់ស្រួលណាស់។",
  },
];

function SingleNPC({ npc }: { npc: NPCConfig }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);

  const [currentPos, setCurrentPos] = useState<[number, number, number]>(npc.pos);
  const waypointIdx = useRef(0);
  const cycle = useRef(Math.random() * 10);
  const isWalking = useRef(false);

  const targetPos = useGameStore((state) => state.targetPos);
  const language = useGameStore((state) => state.language);
  const addStatPop = useGameStore((state) => state.addStatPop);

  // Check proximity to player
  const distToPlayer = Math.hypot(currentPos[0] - targetPos[0], currentPos[2] - targetPos[2]);
  const isNearby = distToPlayer < 3.2;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    cycle.current += delta;
    const t = cycle.current;

    // 1. Waypoint Walking if configured
    if (npc.waypoints && npc.waypoints.length > 1 && !isNearby) {
      const targetWaypoint = npc.waypoints[waypointIdx.current];
      const targetVec = new THREE.Vector3(...targetWaypoint);
      const curVec = new THREE.Vector3(...currentPos);
      const distToWaypoint = curVec.distanceTo(targetVec);

      if (distToWaypoint < 0.2) {
        waypointIdx.current = (waypointIdx.current + 1) % npc.waypoints.length;
        isWalking.current = false;
      } else {
        isWalking.current = true;
        const moveDir = targetVec.clone().sub(curVec).normalize();
        const nextPosVec = curVec.addScaledVector(moveDir, (npc.speed || 1.5) * delta);
        setCurrentPos([nextPosVec.x, nextPosVec.y, nextPosVec.z]);

        // Smooth rotation to waypoint
        const targetAngle = Math.atan2(moveDir.x, moveDir.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetAngle, 0.1);
      }
    } else {
      isWalking.current = false;
    }

    // 2. Head look-at player when nearby
    if (isNearby && headRef.current) {
      const dirToPlayer = new THREE.Vector2(targetPos[0] - currentPos[0], targetPos[2] - currentPos[2]).normalize();
      const angle = Math.atan2(dirToPlayer.x, dirToPlayer.y) - groupRef.current.rotation.y;
      headRef.current.rotation.y = THREE.MathUtils.clamp(angle, -0.6, 0.6);
    } else if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.7) * 0.12;
    }

    // 3. Animation: Walk vs Idle
    if (isWalking.current) {
      const walkCadence = (npc.speed || 1.5) * 4.5;
      const swing = Math.sin(t * walkCadence);
      if (legLRef.current) legLRef.current.rotation.x = swing * 0.45;
      if (legRRef.current) legRRef.current.rotation.x = -swing * 0.45;
      if (armLRef.current) armLRef.current.rotation.x = -swing * 0.4;
      if (armRRef.current) armRRef.current.rotation.x = swing * 0.4;
      groupRef.current.position.y = currentPos[1] + Math.abs(swing) * 0.04;
    } else {
      // Natural idle breathing
      const breath = Math.sin(t * 2.0);
      groupRef.current.position.y = currentPos[1] + breath * 0.015;
      if (armLRef.current) armLRef.current.rotation.x = Math.sin(t * 1.2) * 0.04;
      if (armRRef.current) armRRef.current.rotation.x = -Math.sin(t * 1.2) * 0.04;
      if (legLRef.current) legLRef.current.rotation.x = 0;
      if (legRRef.current) legRRef.current.rotation.x = 0;
    }
  });

  const handleInteract = () => {
    audio.playHeart();
    const text = language === "km" ? npc.dialogueKm : npc.dialogueEn;
    addStatPop(`💬 ${npc.nameEn}: "${text}"`, "happiness");
  };

  return (
    <group ref={groupRef} position={currentPos} rotation={[0, npc.heading, 0]}>
      {/* Interactive Floating Speech Bubble when Player is Nearby */}
      {isNearby && (
        <group position={[0, 2.2, 0]} onClick={handleInteract}>
          <mesh>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color="#F59E0B" emissive="#D97706" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}

      {/* Seated bench for Lok Yeay */}
      {npc.isSeated && (
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.7, 0.42, 0.4]} />
          <meshStandardMaterial color="#5C3B22" roughness={0.8} />
        </mesh>
      )}

      {/* Pelvis / Hips */}
      <mesh position={[0, npc.isSeated ? 0.48 : 0.72, 0]} castShadow>
        <boxGeometry args={[0.36, 0.14, 0.24]} />
        <meshStandardMaterial color={npc.bottomColor} />
      </mesh>

      {/* Torso / Robe */}
      <mesh position={[0, npc.isSeated ? 0.78 : 1.02, 0]} castShadow>
        <boxGeometry args={[0.4, 0.46, 0.25]} />
        <meshStandardMaterial color={npc.topColor} roughness={0.7} />
      </mesh>

      {/* Head Group */}
      <group ref={headRef} position={[0, npc.isSeated ? 1.08 : 1.32, 0]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <sphereGeometry args={[0.19, 12, 12]} />
          <meshStandardMaterial color={npc.skinColor} roughness={0.7} />
        </mesh>
        {/* Hair */}
        {!npc.isMonk && (
          <mesh position={[0, 0.28, 0.02]} castShadow>
            <sphereGeometry args={[0.2, 10, 10]} />
            <meshStandardMaterial color={npc.hairColor} roughness={0.9} />
          </mesh>
        )}
        {/* Hat if applicable */}
        {npc.hasHat && (
          <mesh position={[0, 0.35, 0]} castShadow>
            <coneGeometry args={[0.38, 0.14, 12]} />
            <meshStandardMaterial color="#D8B26A" roughness={0.95} />
          </mesh>
        )}
      </group>

      {/* Arms */}
      <group ref={armLRef} position={[-0.24, npc.isSeated ? 0.98 : 1.22, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.09, 0.42, 0.1]} />
          <meshStandardMaterial color={npc.topColor} />
        </mesh>
      </group>
      <group ref={armRRef} position={[0.24, npc.isSeated ? 0.98 : 1.22, 0]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <boxGeometry args={[0.09, 0.42, 0.1]} />
          <meshStandardMaterial color={npc.topColor} />
        </mesh>
      </group>

      {/* Legs */}
      <group ref={legLRef} position={[-0.11, npc.isSeated ? 0.45 : 0.65, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.12, 0.6, 0.13]} />
          <meshStandardMaterial color={npc.bottomColor} />
        </mesh>
      </group>
      <group ref={legRRef} position={[0.11, npc.isSeated ? 0.45 : 0.65, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.12, 0.6, 0.13]} />
          <meshStandardMaterial color={npc.bottomColor} />
        </mesh>
      </group>
    </group>
  );
}

export function NPCSystem() {
  return (
    <group>
      {NPCS.map((npc) => (
        <SingleNPC key={npc.id} npc={npc} />
      ))}
    </group>
  );
}
