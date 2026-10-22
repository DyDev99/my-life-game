import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Kampong Cham Airfield Military Runway & Rearming Station Visuals
 * Located at x: 60, z: 210 (Width: 24m, Length: 116m from z: 152 to z: 268)
 * Provides authentic military runway tarmac markings, edge/threshold lights,
 * and a glowing tactical Rearming & Repair Helipad/Pad.
 */
export function AirbaseRunwayVisuals() {
  const beaconRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (beaconRef.current) {
      beaconRef.current.rotation.y = t * 1.5;
    }
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.55 + Math.sin(t * 3.5) * 0.25;
      }
    }
  });

  // Runway dimensions: Center [60, 0, 210], Width 24, Length 116 (z: 152 to 268)
  const runwayX = 60;
  const runwayZ = 210;
  const runwayW = 24;
  const runwayL = 116;

  // Centerline stripes along Z
  const stripes = [-45, -30, -15, 0, 15, 30, 45];

  // Edge lights positions
  const edgeLightZ = [-54, -36, -18, 0, 18, 36, 54];

  return (
    <group position={[runwayX, 0, runwayZ]}>
      {/* 1. Heavy Asphalt Runway Surface */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[runwayW, runwayL]} />
        <meshStandardMaterial color="#272b30" roughness={0.92} metalness={0.1} />
      </mesh>

      {/* 2. White Threshold Piano Keys (North Threshold z = -52) */}
      {[-8, -5, -2, 2, 5, 8].map((xOffset) => (
        <mesh key={`thresh-n-${xOffset}`} position={[xOffset, 0.03, -52]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* 3. White Threshold Piano Keys (South Threshold z = 52) */}
      {[-8, -5, -2, 2, 5, 8].map((xOffset) => (
        <mesh key={`thresh-s-${xOffset}`} position={[xOffset, 0.03, 52]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}

      {/* 4. Dashed Centerline Stripes */}
      {stripes.map((zOffset) => (
        <mesh key={`stripe-${zOffset}`} position={[0, 0.03, zOffset]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 7]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
      ))}

      {/* 5. Runway Edge Lights */}
      {edgeLightZ.map((zOffset) => (
        <React.Fragment key={`lights-${zOffset}`}>
          {/* Left Edge Light (Amber) */}
          <group position={[-runwayW / 2 + 0.6, 0.15, zOffset]}>
            <mesh>
              <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[0, 0.18, 0]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
          </group>

          {/* Right Edge Light (Amber) */}
          <group position={[runwayW / 2 - 0.6, 0.15, zOffset]}>
            <mesh>
              <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh position={[0, 0.18, 0]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshBasicMaterial color="#fef08a" />
            </mesh>
          </group>
        </React.Fragment>
      ))}

      {/* Green Threshold Lights (North Runway Entrance z = -55) */}
      {[-10, -6, -2, 2, 6, 10].map((x) => (
        <mesh key={`green-n-${x}`} position={[x, 0.12, -56]}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      ))}

      {/* Red End Lights (South Runway End z = 56) */}
      {[-10, -6, -2, 2, 6, 10].map((x) => (
        <mesh key={`red-s-${x}`} position={[x, 0.12, 56]}>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      ))}

      {/* ===================================================================== */}
      {/* 6. TACTICAL REARMING & REPAIR STATION PAD (At z = -50, North Apron) */}
      {/* ===================================================================== */}
      <group position={[0, 0.04, -50]}>
        {/* Tactical Octagonal Rearm Pad Surface */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[7.5, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>

        {/* Pulsing Outer Tactical Ring */}
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[6.8, 7.4, 32]} />
          <meshBasicMaterial color="#00F0FF" side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>

        {/* Tactical Resupply Crosshair */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <planeGeometry args={[11, 0.8]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.02, 0]}>
          <planeGeometry args={[11, 0.8]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>

        {/* Center Helipad Inner Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[2.5, 3.2, 24]} />
          <meshBasicMaterial color="#f8fafc" side={THREE.DoubleSide} />
        </mesh>

        {/* Rotating Holographic Beacon */}
        <group ref={beaconRef} position={[0, 2.2, 0]}>
          <mesh position={[0, 0, 0]}>
            <octahedronGeometry args={[0.6]} />
            <meshBasicMaterial color="#00F0FF" wireframe />
          </mesh>
          <pointLight color="#00F0FF" intensity={1.8} distance={15} />
        </group>
      </group>

      {/* 7. Military Rearm Munitions Pallets (Staged alongside runway taxiway) */}
      <group position={[15, 0, -42]}>
        {/* Ammo Pallet 1 */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[2.2, 0.5, 1.6]} />
          <meshStandardMaterial color="#475569" metalness={0.6} />
        </mesh>
        {/* Missile Tubes Staged for Loading */}
        {[-0.6, 0, 0.6].map((x, idx) => (
          <mesh key={`tube-${idx}`} position={[x, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 2.0, 10]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
