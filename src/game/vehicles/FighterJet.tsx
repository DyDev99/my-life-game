"use client";

import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { loadGLTF } from "@/game/assets/FBXModel";
import { MODELS } from "@/game/assets/assetPaths";

export interface FighterJetProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  speed?: number;
  altitude?: number;
  pitchAngle?: number;
  rollAngle?: number;
  isAfterburner?: boolean;
}

/**
 * Procedural low-poly blockout for the Steel Hawk Fighter
 * Used as a fallback while the full 3D GLB model loads.
 */
function ProceduralJetFallback({ isAfterburner = false, speed = 0 }: { isAfterburner?: boolean; speed?: number }) {
  const isCruising = speed > 15;
  const flameLength = isAfterburner ? 5.5 : isCruising ? 2.5 : 0.8;

  return (
    <group scale={[0.85, 0.85, 0.85]}>
      {/* Fuselage Main Body */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.2, 14.5]} />
        <meshStandardMaterial color="#4A5568" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Aerodynamic Nose Cone */}
      <mesh position={[0, 0.1, 7.8]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[1.05, 3.8, 16]} />
        <meshStandardMaterial color="#2D3748" roughness={0.35} metalness={0.8} />
      </mesh>

      {/* Cockpit Canopy Glass */}
      <mesh position={[0, 0.95, 3.2]} rotation={[0.2, 0, 0]}>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshPhysicalMaterial
          color="#63B3ED"
          transparent
          opacity={0.45}
          roughness={0.05}
          transmission={0.8}
        />
      </mesh>

      {/* Main Swept Wings */}
      <mesh position={[0, 0.15, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[11.5, 0.18, 4.2]} />
        <meshStandardMaterial color="#4A5568" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Twin Canted Vertical Fins / Rudders */}
      <mesh position={[-1.4, 1.8, -4.8]} rotation={[0, 0, -0.22]} castShadow>
        <boxGeometry args={[0.15, 2.8, 2.5]} />
        <meshStandardMaterial color="#2D3748" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[1.4, 1.8, -4.8]} rotation={[0, 0, 0.22]} castShadow>
        <boxGeometry args={[0.15, 2.8, 2.5]} />
        <meshStandardMaterial color="#2D3748" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Twin Horizontal Stabilizers */}
      <mesh position={[-2.4, 0.15, -5.8]} castShadow>
        <boxGeometry args={[2.8, 0.12, 2.2]} />
        <meshStandardMaterial color="#4A5568" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[2.4, 0.15, -5.8]} castShadow>
        <boxGeometry args={[2.8, 0.12, 2.2]} />
        <meshStandardMaterial color="#4A5568" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Twin Jet Engines */}
      <mesh position={[-1.2, 0.05, -6.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.75, 2.5, 16]} />
        <meshStandardMaterial color="#1A202C" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[1.2, 0.05, -6.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.7, 0.75, 2.5, 16]} />
        <meshStandardMaterial color="#1A202C" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Afterburner Flames */}
      {isCruising && (
        <group position={[0, 0.05, -8.0 - flameLength * 0.5]}>
          <mesh position={[-1.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.55, flameLength, 12]} />
            <meshBasicMaterial color={isAfterburner ? "#00E5FF" : "#FF6B00"} transparent opacity={0.88} />
          </mesh>
          <mesh position={[1.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.55, flameLength, 12]} />
            <meshBasicMaterial color={isAfterburner ? "#00E5FF" : "#FF6B00"} transparent opacity={0.88} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * Steel Hawk Fighter Jet 3D Component
 * Renders the full 3D GLB aircraft with animated stabilizers, gear, and dynamic afterburners.
 */
export function FighterJet({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  speed = 0,
  altitude = 0,
  pitchAngle = 0,
  rollAngle = 0,
  isAfterburner = false,
}: FighterJetProps) {
  const [model, setModel] = useState<THREE.Group | null>(null);

  // Cached parts for animation
  const partsRef = useRef<{
    stabilizerLeft: THREE.Object3D | null;
    stabilizerRight: THREE.Object3D | null;
    gearGroup: THREE.Object3D | null;
  }>({
    stabilizerLeft: null,
    stabilizerRight: null,
    gearGroup: null,
  });

  const flameRefL = useRef<THREE.Mesh>(null);
  const flameRefR = useRef<THREE.Mesh>(null);
  const flameLightRef = useRef<THREE.PointLight>(null);
  const gearProgress = useRef(1.0); // 1 = down, 0 = retracted

  useEffect(() => {
    let active = true;
    loadGLTF(MODELS.SteelHawk_Fighter)
      .then((loaded) => {
        if (!active) return;
        const clone = SkeletonUtils.clone(loaded) as THREE.Group;
        // Scale to match web world proportions (~14m length)
        clone.scale.set(0.82, 0.82, 0.82);

        // Find animated control surfaces and landing gear
        let stabL: THREE.Object3D | null = null;
        let stabR: THREE.Object3D | null = null;
        let gear: THREE.Object3D | null = null;

        clone.traverse((child) => {
          if (child.name === "HorizontalStabilizer_Left") stabL = child;
          else if (child.name === "HorizontalStabilizer_Right") stabR = child;
          else if (child.name === "Landing_Gear") gear = child;
        });

        partsRef.current = {
          stabilizerLeft: stabL,
          stabilizerRight: stabR,
          gearGroup: gear,
        };

        setModel(clone);
      })
      .catch((err) => {
        console.warn("Failed to load SteelHawk_Fighter.glb, using fallback:", err);
      });

    return () => {
      active = false;
    };
  }, []);

  useFrame((state, delta) => {
    // 1. Landing Gear Retraction (Retracts smoothly when airborne)
    const targetGear = altitude > 1.8 ? 0.0 : 1.0;
    gearProgress.current = THREE.MathUtils.lerp(gearProgress.current, targetGear, delta * 3.5);

    if (partsRef.current.gearGroup) {
      partsRef.current.gearGroup.visible = gearProgress.current > 0.05;
      partsRef.current.gearGroup.position.y = (1.0 - gearProgress.current) * 0.8;
    }

    // 2. All-Moving Horizontal Stabilizer Deflection
    if (partsRef.current.stabilizerLeft) {
      partsRef.current.stabilizerLeft.rotation.x = -pitchAngle * 0.45 + rollAngle * 0.25;
    }
    if (partsRef.current.stabilizerRight) {
      partsRef.current.stabilizerRight.rotation.x = -pitchAngle * 0.45 - rollAngle * 0.25;
    }

    // 3. Dynamic Afterburner Flames Pulse
    const isMoving = speed > 10;
    const pulse = 1.0 + Math.sin(state.clock.elapsedTime * 32.0) * 0.12;
    const baseLength = isAfterburner ? 5.2 : isMoving ? 2.4 : 0.0;
    const targetScaleZ = baseLength * pulse;

    if (flameRefL.current) {
      flameRefL.current.visible = isMoving;
      flameRefL.current.scale.set(1.0, 1.0, Math.max(0.01, targetScaleZ));
    }
    if (flameRefR.current) {
      flameRefR.current.visible = isMoving;
      flameRefR.current.scale.set(1.0, 1.0, Math.max(0.01, targetScaleZ));
    }
    if (flameLightRef.current) {
      flameLightRef.current.intensity = isAfterburner ? 3.8 : isMoving ? 1.6 : 0;
      flameLightRef.current.color.set(isAfterburner ? "#00E5FF" : "#FF6B00");
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {model ? (
        <group>
          <primitive object={model} />

          {/* Afterburner VFX Plumes behind exhaust nozzles (-6.2m Z) */}
          <group position={[0, -0.12, -6.2]}>
            {/* Left Exhaust Flame */}
            <mesh ref={flameRefL} position={[-1.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.42, 1.0, 16]} />
              <meshBasicMaterial
                color={isAfterburner ? "#00E5FF" : "#FF6B00"}
                transparent
                opacity={0.85}
              />
            </mesh>

            {/* Right Exhaust Flame */}
            <mesh ref={flameRefR} position={[1.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.42, 1.0, 16]} />
              <meshBasicMaterial
                color={isAfterburner ? "#00E5FF" : "#FF6B00"}
                transparent
                opacity={0.85}
              />
            </mesh>

            {/* Jet Engine Glow Light */}
            <pointLight ref={flameLightRef} distance={18} decay={2} position={[0, 0, -1.5]} />
          </group>
        </group>
      ) : (
        <ProceduralJetFallback isAfterburner={isAfterburner} speed={speed} />
      )}
    </group>
  );
}
