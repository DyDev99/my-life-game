"use client";

import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/state/gameStore";
import { type WeaponId, WEAPON_REGISTRY } from "./weaponConfig";

/**
 * 3D Tactical Weapon Model & Muzzle Attachment
 * Poses the weapon in the character's hands and aligns with the camera's 3D aim vector.
 * Includes muzzle flash and recoil kick animation.
 */
export function WeaponModel({
  playerPos,
  playerHeading,
}: {
  playerPos: [number, number, number];
  playerHeading: number;
}) {
  const currentWeaponId = useGameStore((state) => state.currentWeaponId);
  const isAiming = useGameStore((state) => state.isAiming);
  const ridingVehicle = useGameStore((state) => state.ridingVehicle);

  const { camera } = useThree();

  const weaponGroupRef = useRef<THREE.Group>(null);
  const muzzleFlashRef = useRef<THREE.Mesh>(null);
  const recoilOffset = useRef(0);

  // Hook for external recoil kick trigger
  useFrame((_, delta) => {
    if (!weaponGroupRef.current || !currentWeaponId || ridingVehicle) return;

    // Recoil recovery
    recoilOffset.current = THREE.MathUtils.damp(recoilOffset.current, 0, 18.0, delta);

    // Muzzle flash decay
    if (muzzleFlashRef.current) {
      if (muzzleFlashRef.current.scale.x > 0.01) {
        const s = THREE.MathUtils.damp(muzzleFlashRef.current.scale.x, 0, 32.0, delta);
        muzzleFlashRef.current.scale.set(s, s, s);
      }
    }

    // Camera forward vector defines weapon aiming direction
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);

    // Compute aim yaw & pitch from camera direction
    const aimYaw = Math.atan2(camDir.x, camDir.z);
    const horizDist = Math.hypot(camDir.x, camDir.z);
    const aimPitch = -Math.atan2(camDir.y, horizDist);

    // Weapon anchor position relative to character's chest / right shoulder
    const rightX = -Math.cos(aimYaw);
    const rightZ = Math.sin(aimYaw);
    const shoulderOffset = isAiming ? 0.32 : 0.38;
    const forwardOffset = isAiming ? 0.45 : 0.40;

    const wx = playerPos[0] + rightX * shoulderOffset + Math.sin(aimYaw) * forwardOffset;
    const wy = playerPos[1] + (isAiming ? 1.28 : 1.18);
    const wz = playerPos[2] + rightZ * shoulderOffset + Math.cos(aimYaw) * forwardOffset;

    weaponGroupRef.current.position.set(wx, wy, wz);

    // Apply aim rotation + recoil kick
    weaponGroupRef.current.rotation.set(
      aimPitch - recoilOffset.current * 0.15,
      aimYaw,
      0,
      "YXZ"
    );

    // Slide back slightly on recoil
    weaponGroupRef.current.translateZ(-recoilOffset.current * 0.12);
  });

  if (!currentWeaponId || ridingVehicle) return null;

  return (
    <group ref={weaponGroupRef}>
      {currentWeaponId === "m416" && <M416Mesh />}
      {currentWeaponId === "shotgun" && <ShotgunMesh />}
      {currentWeaponId === "sniper" && <SniperMesh />}

      {/* Muzzle Flash VFX */}
      <mesh ref={muzzleFlashRef} position={[0, 0.04, 0.85]} scale={[0, 0, 0]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshBasicMaterial color="#FFB020" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// -----------------------------------------------------------------------------
// Procedural Tactical Weapon Meshes
// -----------------------------------------------------------------------------

function M416Mesh() {
  return (
    <group scale={[0.85, 0.85, 0.85]}>
      {/* Upper Receiver & Picatinny Rail */}
      <mesh position={[0, 0.05, 0.12]}>
        <boxGeometry args={[0.07, 0.09, 0.42]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Handguard Barrel Shroud */}
      <mesh position={[0, 0.04, 0.44]}>
        <boxGeometry args={[0.06, 0.07, 0.34]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Steel Barrel */}
      <mesh position={[0, 0.04, 0.7]}>
        <cylinderGeometry args={[0.016, 0.016, 0.3, 8]} />
        <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Muzzle Brake Tip */}
      <mesh position={[0, 0.04, 0.84]}>
        <cylinderGeometry args={[0.022, 0.02, 0.06, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Curved 30-Round Magazine */}
      <mesh position={[0, -0.12, 0.18]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.045, 0.18, 0.08]} />
        <meshStandardMaterial color="#0F172A" roughness={0.5} />
      </mesh>

      {/* Pistol Grip */}
      <mesh position={[0, -0.1, -0.05]} rotation={[-0.45, 0, 0]}>
        <boxGeometry args={[0.042, 0.14, 0.055]} />
        <meshStandardMaterial color="#1E293B" roughness={0.7} />
      </mesh>

      {/* Telescopic Stock */}
      <mesh position={[0, 0.03, -0.22]}>
        <boxGeometry args={[0.05, 0.11, 0.26]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>

      {/* Holographic / Red Dot Sight */}
      <mesh position={[0, 0.12, 0.1]}>
        <boxGeometry args={[0.055, 0.06, 0.12]} />
        <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Optic Glass */}
      <mesh position={[0, 0.13, 0.1]}>
        <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
        <meshBasicMaterial color="#10B981" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function ShotgunMesh() {
  return (
    <group scale={[0.85, 0.85, 0.85]}>
      {/* Heavy Steel Receiver */}
      <mesh position={[0, 0.04, 0.1]}>
        <boxGeometry args={[0.08, 0.11, 0.38]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Heavy 12-Gauge Ribbed Barrel */}
      <mesh position={[0, 0.06, 0.52]}>
        <cylinderGeometry args={[0.026, 0.026, 0.56, 10]} />
        <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Underbarrel Magazine Tube */}
      <mesh position={[0, 0.015, 0.48]}>
        <cylinderGeometry args={[0.022, 0.022, 0.48, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Ribbed Pump Slide */}
      <mesh position={[0, 0.015, 0.38]}>
        <boxGeometry args={[0.075, 0.08, 0.18]} />
        <meshStandardMaterial color="#0F172A" roughness={0.8} />
      </mesh>

      {/* Pistol Grip */}
      <mesh position={[0, -0.11, -0.06]} rotation={[-0.45, 0, 0]}>
        <boxGeometry args={[0.045, 0.15, 0.06]} />
        <meshStandardMaterial color="#1E293B" roughness={0.7} />
      </mesh>

      {/* Tactical Stock */}
      <mesh position={[0, 0.02, -0.25]}>
        <boxGeometry args={[0.05, 0.13, 0.28]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>
    </group>
  );
}

function SniperMesh() {
  return (
    <group scale={[0.85, 0.85, 0.85]}>
      {/* Olive Green Tactical Chassis Body */}
      <mesh position={[0, 0.04, 0.15]}>
        <boxGeometry args={[0.07, 0.1, 0.48]} />
        <meshStandardMaterial color="#3F6212" roughness={0.5} />
      </mesh>

      {/* Long Fluted Sniper Barrel */}
      <mesh position={[0, 0.06, 0.72]}>
        <cylinderGeometry args={[0.02, 0.018, 0.75, 10]} />
        <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Muzzle Brake */}
      <mesh position={[0, 0.06, 1.1]}>
        <boxGeometry args={[0.045, 0.045, 0.09]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} />
      </mesh>

      {/* High-Power Telescopic Scope */}
      <mesh position={[0, 0.15, 0.12]}>
        <cylinderGeometry args={[0.028, 0.024, 0.32, 12]} />
        <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Scope Objective Lens */}
      <mesh position={[0, 0.15, 0.27]}>
        <cylinderGeometry args={[0.034, 0.034, 0.06, 12]} />
        <meshStandardMaterial color="#0284C7" metalness={0.5} roughness={0.1} />
      </mesh>

      {/* Ergonomic Stock with Cheek Rest */}
      <mesh position={[0, 0.05, -0.28]}>
        <boxGeometry args={[0.055, 0.14, 0.34]} />
        <meshStandardMaterial color="#3F6212" roughness={0.5} />
      </mesh>

      {/* Folded Bipod Legs */}
      <mesh position={[0.04, -0.02, 0.55]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.22, 6]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} />
      </mesh>
      <mesh position={[-0.04, -0.02, 0.55]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.22, 6]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} />
      </mesh>
    </group>
  );
}
