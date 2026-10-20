"use client";

import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, PracticeTarget } from "@/state/gameStore";

interface FloatingText {
  id: string;
  pos: [number, number, number];
  text: string;
  isHeadshot: boolean;
  age: number;
}

/**
 * 3D Interactive Shooting Practice Targets
 * Positioned in open practice ground with real-time health bars,
 * physical hit wobble reaction, and floating damage numbers.
 */
export function PracticeTargets() {
  const targets = useGameStore((state) => state.practiceTargets);
  const lastHit = useGameStore((state) => state.lastHitInfo);

  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Spawn floating damage text on hit
  useEffect(() => {
    if (!lastHit) return;
    const newText: FloatingText = {
      id: `dmg-${Date.now()}-${Math.random()}`,
      pos: [lastHit.hitPoint[0], lastHit.hitPoint[1] + 0.4, lastHit.hitPoint[2]],
      text: lastHit.isHeadshot ? `💥 ${lastHit.damage} HEADSHOT!` : `-${lastHit.damage}`,
      isHeadshot: lastHit.isHeadshot,
      age: 0,
    };
    setFloatingTexts((prev) => [...prev.slice(-6), newText]);
  }, [lastHit]);

  useFrame((_, delta) => {
    if (floatingTexts.length > 0) {
      setFloatingTexts((prev) =>
        prev
          .map((ft) => ({
            ...ft,
            age: ft.age + delta,
            pos: [ft.pos[0], ft.pos[1] + delta * 1.8, ft.pos[2]] as [number, number, number],
          }))
          .filter((ft) => ft.age < 1.1)
      );
    }
  });

  return (
    <group>
      {Object.values(targets).map((target) => (
        <SinglePracticeTarget key={target.id} target={target} />
      ))}

      {/* Floating Damage Numbers in 3D Space */}
      {floatingTexts.map((ft) => (
        <group key={ft.id} position={ft.pos}>
          {/* Glowing damage billboard disc */}
          <mesh scale={[1 - ft.age * 0.7, 1 - ft.age * 0.7, 1]}>
            <circleGeometry args={[0.35, 12]} />
            <meshBasicMaterial
              color={ft.isHeadshot ? "#EF4444" : "#F59E0B"}
              transparent
              opacity={Math.max(0, 1 - ft.age / 1.1)}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SinglePracticeTarget({ target }: { target: PracticeTarget }) {
  const groupRef = useRef<THREE.Group>(null);
  const wobbleAngle = useRef(0);
  const prevHealth = useRef(target.health);

  // Trigger wobble on health change
  useEffect(() => {
    if (target.health < prevHealth.current) {
      wobbleAngle.current = 0.35;
    }
    prevHealth.current = target.health;
  }, [target.health]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (target.destroyed) {
      // Fall down flat on ground when destroyed
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, -Math.PI / 2, 8.0, delta);
    } else {
      // Physical wobble recovery
      wobbleAngle.current = THREE.MathUtils.damp(wobbleAngle.current, 0, 12.0, delta);
      groupRef.current.rotation.x = wobbleAngle.current * Math.sin(Date.now() * 0.02);
    }
  });

  const healthPct = Math.max(0, target.health / target.maxHealth);
  const healthColor = healthPct > 0.5 ? "#22C55E" : healthPct > 0.25 ? "#F59E0B" : "#EF4444";

  return (
    <group position={target.position}>
      {/* Target Base / Support Frame on Ground */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.8]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.9} />
      </mesh>

      {/* Target Body (Swings / wobbles on hit) */}
      <group ref={groupRef} position={[0, 0.9, 0]}>
        {/* Steel Silhouette Plate */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.65, 1.1, 0.04]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.5} metalness={0.7} />
        </mesh>

        {/* Bullseye Scoring Rings */}
        <mesh position={[0, 0.6, 0.025]}>
          <circleGeometry args={[0.26, 24]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
        <mesh position={[0, 0.6, 0.027]}>
          <circleGeometry args={[0.18, 24]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 0.6, 0.029]}>
          <circleGeometry args={[0.09, 24]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>

        {/* Head Zone (Higher headshot damage hitbox) */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <boxGeometry args={[0.34, 0.35, 0.04]} />
          <meshStandardMaterial color="#DC2626" roughness={0.4} />
        </mesh>

        {/* Overhead 3D Health Bar */}
        {!target.destroyed && (
          <group position={[0, 1.7, 0]}>
            {/* Background Frame */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.04, 0.14, 0.02]} />
              <meshBasicMaterial color="#0F172A" />
            </mesh>
            {/* Dynamic Health Fill */}
            <mesh position={[(healthPct - 1) * 0.5, 0, 0.01]}>
              <planeGeometry args={[Math.max(0.01, healthPct * 1.0), 0.1]} />
              <meshBasicMaterial color={healthColor} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
