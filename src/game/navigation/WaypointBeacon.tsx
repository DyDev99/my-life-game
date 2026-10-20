"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/state/gameStore";

// Tall translucent light column + pulsing ground ring at the GPS waypoint.
export function WaypointBeacon() {
  const waypoint = useGameStore((s) => s.waypoint);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const ring = ringRef.current;
    if (!ring) return;
    const t = (state.clock.elapsedTime * 0.8) % 1;
    ring.scale.setScalar(1 + t * 1.5);
    (ring.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - t);
  });

  if (!waypoint) return null;

  return (
    <group position={[waypoint.x, 0, waypoint.z]}>
      <mesh position={[0, 20, 0]} renderOrder={2}>
        <cylinderGeometry args={[0.7, 0.7, 40, 16, 1, true]} />
        <meshBasicMaterial color="#c24dff" transparent opacity={0.28} depthWrite={false} side={THREE.DoubleSide} fog={false} />
      </mesh>
      <mesh ref={ringRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <ringGeometry args={[1.4, 1.9, 40]} />
        <meshBasicMaterial color="#e3a8ff" transparent opacity={0.7} depthWrite={false} />
      </mesh>
    </group>
  );
}
