"use client";

import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/state/gameStore";
import { audio } from "@/game/audio/audioManager";
import { FBXModel } from "@/game/assets/FBXModel";
import { MODELS } from "@/game/assets/assetPaths";

// =============================================================================
// 1. INTERACTIVE SOCCER BALL (បាល់ទាត់លេងបាន)
// =============================================================================
export function InteractiveFootball({ pitchCenter = [-26, 0, 95] }: { pitchCenter?: [number, number, number] }) {
  const [cx, cy, cz] = pitchCenter;
  const ballPos = useRef(new THREE.Vector3(cx, 0.22, cz));
  const ballVel = useRef(new THREE.Vector3(0, 0, 0));
  const ballMeshRef = useRef<THREE.Group>(null);
  const targetPos = useGameStore((state) => state.targetPos);
  const scoreFootballGoal = useGameStore((state) => state.scoreFootballGoal);
  const ridingVehicle = useGameStore((state) => state.ridingVehicle);
  const [goalFlash, setGoalFlash] = useState(false);
  const [kickPrompt, setKickPrompt] = useState(false);
  const lastKickTime = useRef(0);

  // Keyboard kick trigger on Space or E when on foot near ball
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (ridingVehicle) return; // When driving, car controls take precedence
      if (e.key === "e" || e.key === "E" || e.key === " ") {
        const p = ballPos.current;
        const dist = Math.hypot(targetPos[0] - p.x, targetPos[2] - p.z);
        if (dist < 2.8 && performance.now() - lastKickTime.current > 320) {
          lastKickTime.current = performance.now();
          // Aim toward nearest goal (North goal is cz-24, South is cz+24)
          const aimZ = p.z > cz ? cz + 24 : cz - 24;
          const dirZ = aimZ > p.z ? 1 : -1;
          const kickDir = new THREE.Vector3(
            (cx - p.x) * 0.35 + (Math.random() - 0.5) * 4.5,
            4.2 + Math.random() * 2.2,
            dirZ * (24 + Math.random() * 7)
          );
          ballVel.current.copy(kickDir);
          audio.playBallKick();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [targetPos, ridingVehicle, cx, cz]);

  useFrame((_, delta) => {
    const p = ballPos.current;
    const v = ballVel.current;
    const dt = Math.min(0.05, delta);

    // 1. Gravity and velocity update
    v.y -= 9.8 * dt * 2.0;
    p.addScaledVector(v, dt);

    // 2. Ground bounce & rolling friction
    if (p.y <= 0.22) {
      p.y = 0.22;
      if (Math.abs(v.y) > 0.8) {
        v.y = -v.y * 0.6; // bounce
        audio.playBallKick();
      } else {
        v.y = 0;
      }
      // Ground friction
      v.x *= Math.pow(0.86, dt * 60);
      v.z *= Math.pow(0.86, dt * 60);
    }

    // 3. Player Dribbling Collision (Push ball if player runs into it)
    const playerDist = Math.hypot(targetPos[0] - p.x, targetPos[2] - p.z);
    setKickPrompt(playerDist < 2.8 && !ridingVehicle);

    if (playerDist < 1.15 && !ridingVehicle) {
      const pushX = (p.x - targetPos[0]) / Math.max(0.1, playerDist);
      const pushZ = (p.z - targetPos[2]) / Math.max(0.1, playerDist);
      v.x += pushX * 13.0 * dt;
      v.z += pushZ * 13.0 * dt;
      if (v.lengthSq() > 0.6 && Math.random() < 0.12) {
        audio.playBallKick();
      }
    }

    // 4. Ball Mesh Rotation (Rolls proportionally to ground speed)
    if (ballMeshRef.current) {
      ballMeshRef.current.position.copy(p);
      const hSpeed = Math.hypot(v.x, v.z);
      if (hSpeed > 0.1) {
        ballMeshRef.current.rotation.x += v.z * dt * 4.2;
        ballMeshRef.current.rotation.z -= v.x * dt * 4.2;
      }
    }

    // 5. GOAL DETECTION (North Goal: z <= cz-24, South Goal: z >= cz+24 between x=cx-2.2 and cx+2.2)
    const inGoalX = p.x >= cx - 2.2 && p.x <= cx + 2.2 && p.y <= 2.2;
    if ((p.z <= cz - 23.8 || p.z >= cz + 23.8) && inGoalX && !goalFlash) {
      setGoalFlash(true);
      scoreFootballGoal();
      // Respawn ball at center circle after celebration
      setTimeout(() => {
        ballPos.current.set(cx, 0.22, cz);
        ballVel.current.set(0, 0, 0);
        setGoalFlash(false);
      }, 2500);
    }

    // 6. Pitch Boundary Rebound (Perimeter Advertising Boards)
    const minX = cx - 16;
    const maxX = cx + 16;
    const minZ = cz - 26;
    const maxZ = cz + 26;
    if (p.x < minX + 0.5) { p.x = minX + 0.5; v.x = Math.abs(v.x) * 0.7; }
    if (p.x > maxX - 0.5) { p.x = maxX - 0.5; v.x = -Math.abs(v.x) * 0.7; }
    if (p.z < minZ + 0.5 && !inGoalX) { p.z = minZ + 0.5; v.z = Math.abs(v.z) * 0.7; }
    if (p.z > maxZ - 0.5 && !inGoalX) { p.z = maxZ - 0.5; v.z = -Math.abs(v.z) * 0.7; }
  });

  return (
    <group>
      {/* 3D Soccer Ball with Classic Geometric Patches */}
      <group
        ref={ballMeshRef}
        onClick={(e) => {
          e.stopPropagation();
          ballVel.current.set((Math.random() - 0.5) * 8, 5.5, 20);
          audio.playBallKick();
        }}
      >
        <mesh castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.35} />
        </mesh>
        {/* Black Pentagon patches */}
        {[-0.15, 0, 0.15].map((x, i) =>
          [-0.15, 0, 0.15].map((z, j) => (
            <mesh key={`patch-${i}-${j}`} position={[x, (i + j) % 2 === 0 ? 0.15 : -0.15, z]}>
              <boxGeometry args={[0.07, 0.02, 0.07]} />
              <meshStandardMaterial color="#0F172A" roughness={0.5} />
            </mesh>
          ))
        )}
      </group>

      {/* Floating Kick Indicator */}
      {kickPrompt && (
        <group position={[ballPos.current.x, ballPos.current.y + 0.65, ballPos.current.z]}>
          <mesh>
            <octahedronGeometry args={[0.13, 0]} />
            <meshStandardMaterial color="#22C55E" emissive="#16A34A" emissiveIntensity={1.5} />
          </mesh>
          <pointLight color="#22C55E" intensity={1.8} distance={3.2} />
        </group>
      )}

      {/* GOAL Celebration Confetti Flash */}
      {goalFlash && (
        <group position={[cx, 4.0, ballPos.current.z > cz ? cz + 24 : cz - 24]}>
          <pointLight color="#F59E0B" intensity={6.5} distance={28} />
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh
              key={`confetti-${i}`}
              position={[
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
              ]}
            >
              <boxGeometry args={[0.22, 0.22, 0.06]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? "#EF4444" : i % 3 === 1 ? "#3B82F6" : "#FBBF24"}
                emissive="#FBBF24"
                emissiveIntensity={1.6}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

// =============================================================================
// 2. INTERACTIVE VOLLEYBALL (បាល់ទះលេងបាន)
// =============================================================================
export function InteractiveVolleyball({ courtCenter = [26, 0, 92] }: { courtCenter?: [number, number, number] }) {
  const [cx, cy, cz] = courtCenter;
  const ballPos = useRef(new THREE.Vector3(cx, 0.22, cz - 4));
  const ballVel = useRef(new THREE.Vector3(0, 0, 0));
  const ballMeshRef = useRef<THREE.Group>(null);
  const targetPos = useGameStore((state) => state.targetPos);
  const playVolleyballRally = useGameStore((state) => state.playVolleyballRally);
  const ridingVehicle = useGameStore((state) => state.ridingVehicle);
  const [spikePrompt, setSpikePrompt] = useState(false);
  const lastHitTime = useRef(0);

  // Key trigger [E] or [Space] near volleyball
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (ridingVehicle) return;
      if (e.key === "e" || e.key === "E" || e.key === " ") {
        const p = ballPos.current;
        const dist = Math.hypot(targetPos[0] - p.x, targetPos[2] - p.z);
        if (dist < 3.0 && performance.now() - lastHitTime.current > 380) {
          lastHitTime.current = performance.now();
          // Arc high over the net (net is at cz, height 2.43m)
          const side = p.z > cz ? -1 : 1;
          ballVel.current.set(
            (Math.random() - 0.5) * 3.5,
            6.8 + Math.random() * 1.5,
            side * (12.5 + Math.random() * 3.0)
          );
          playVolleyballRally();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [targetPos, playVolleyballRally, ridingVehicle, cz]);

  useFrame((_, delta) => {
    const p = ballPos.current;
    const v = ballVel.current;
    const dt = Math.min(0.05, delta);

    // Gravity & position
    v.y -= 9.8 * dt * 1.6;
    p.addScaledVector(v, dt);

    // Ground bounce
    if (p.y <= 0.22) {
      p.y = 0.22;
      if (Math.abs(v.y) > 0.8) {
        v.y = -v.y * 0.72; // energetic volleyball bounce
        audio.playVolleyHit();
      } else {
        v.y = 0;
      }
      v.x *= 0.89;
      v.z *= 0.89;
    }

    // Proximity check
    const dist = Math.hypot(targetPos[0] - p.x, targetPos[2] - p.z);
    setSpikePrompt(dist < 3.0 && !ridingVehicle);

    // Rolling & rotation
    if (ballMeshRef.current) {
      ballMeshRef.current.position.copy(p);
      ballMeshRef.current.rotation.x += v.z * dt * 5.2;
      ballMeshRef.current.rotation.z -= v.x * dt * 5.2;
    }

    // Court boundaries (X: cx-5 to cx+5, Z: cz-10 to cz+10)
    if (p.x < cx - 4.8) { p.x = cx - 4.8; v.x = Math.abs(v.x) * 0.65; }
    if (p.x > cx + 4.8) { p.x = cx + 4.8; v.x = -Math.abs(v.x) * 0.65; }
    if (p.z < cz - 9.5) { p.z = cz - 9.5; v.z = Math.abs(v.z) * 0.65; }
    if (p.z > cz + 9.5) { p.z = cz + 9.5; v.z = -Math.abs(v.z) * 0.65; }
  });

  return (
    <group>
      {/* 3D Volleyball (Yellow, Blue, White Tricolor Panels) */}
      <group
        ref={ballMeshRef}
        onClick={(e) => {
          e.stopPropagation();
          const side = ballPos.current.z > cz ? -1 : 1;
          ballVel.current.set((Math.random() - 0.5) * 3, 6.8, side * 13);
          playVolleyballRally();
        }}
      >
        <mesh castShadow>
          <sphereGeometry args={[0.21, 16, 16]} />
          <meshStandardMaterial color="#3B82F6" roughness={0.35} />
        </mesh>
        {/* Yellow swirls */}
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <torusGeometry args={[0.18, 0.04, 8, 16]} />
          <meshStandardMaterial color="#FBBF24" roughness={0.35} />
        </mesh>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.18, 0.04, 8, 16]} />
          <meshStandardMaterial color="#FAF8F2" roughness={0.35} />
        </mesh>
      </group>

      {/* Spike Interaction Indicator */}
      {spikePrompt && (
        <group position={[ballPos.current.x, ballPos.current.y + 0.65, ballPos.current.z]}>
          <mesh>
            <octahedronGeometry args={[0.13, 0]} />
            <meshStandardMaterial color="#F59E0B" emissive="#D97706" emissiveIntensity={1.5} />
          </mesh>
          <pointLight color="#F59E0B" intensity={1.8} distance={3.2} />
        </group>
      )}
    </group>
  );
}

// =============================================================================
// 3. FULL OLYMPIC FOOTBALL STADIUM (ពហុកីឡដ្ឋានបាល់ទាត់ជាតិ)
// =============================================================================
export function FootballStadium({ position = [-26, 0, 95] }: { position?: [number, number, number] }) {
  const goalsScored = useGameStore((state) => state.goalsScored);
  const timeHour = useGameStore((state) => state.timeHour);
  const isNight = timeHour < 5.5 || timeHour >= 18.0;

  return (
    <group position={position}>
      {/* 1. Terracotta Athletic Running Track (Surrounding pitch: 58m x 42m) */}
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[42, 0.06, 60]} />
        <meshStandardMaterial color="#C25438" roughness={0.9} />
      </mesh>
      {/* White Running Lane Lines */}
      {[-19.5, -18.2, 18.2, 19.5].map((x, i) => (
        <mesh key={`lane-x-${i}`} position={[x, 0.01, 0]}>
          <boxGeometry args={[0.08, 0.01, 58]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>
      ))}

      {/* 2. Lush Grass Football Pitch (32m wide, 48m long) with Mown Stripes */}
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[32, 0.07, 48]} />
        <meshStandardMaterial color="#2E8B57" roughness={0.8} />
      </mesh>
      {/* Alternating Mown Grass Stripes */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`mow-stripe-${i}`} position={[0, 0.026, -22 + i * 4]} receiveShadow>
          <boxGeometry args={[31.8, 0.005, 2.0]} />
          <meshStandardMaterial color="#3CB371" roughness={0.8} />
        </mesh>
      ))}

      {/* 3. Official Pitch Markings (Crisp White Lines) */}
      {/* Touchlines (East & West) */}
      <mesh position={[-15, 0.03, 0]}>
        <boxGeometry args={[0.16, 0.008, 48]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      <mesh position={[15, 0.03, 0]}>
        <boxGeometry args={[0.16, 0.008, 48]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      {/* Goal lines (North & South) */}
      <mesh position={[0, 0.03, -24]}>
        <boxGeometry args={[30, 0.008, 0.16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.03, 24]}>
        <boxGeometry args={[30, 0.008, 0.16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      {/* Halfway line & Center Spot */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[30, 0.008, 0.16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      {/* Center Circle (Radius 4.5m) */}
      <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4.5, 0.08, 6, 32]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.032, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.01, 12]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Penalty Boxes (North: z=-24 to -15, South: z=15 to 24) */}
      {[-24, 24].map((zPos, idx) => {
        const sign = zPos > 0 ? -1 : 1;
        return (
          <group key={`penalty-box-${idx}`} position={[0, 0.03, zPos]}>
            <mesh position={[-8, 0, sign * 4.5]}>
              <boxGeometry args={[0.14, 0.008, 9.0]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[8, 0, sign * 4.5]}>
              <boxGeometry args={[0.14, 0.008, 9.0]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0, 0, sign * 9.0]}>
              <boxGeometry args={[16.14, 0.008, 0.14]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
            <mesh position={[0, 0.002, sign * 5.5]}>
              <cylinderGeometry args={[0.18, 0.18, 0.01, 12]} />
              <meshStandardMaterial color="#FFFFFF" />
            </mesh>
          </group>
        );
      })}

      {/* 4. Regulation Goalposts with 3D Depth Nets */}
      {[-24, 24].map((zPos, idx) => {
        const rot = zPos > 0 ? 0 : Math.PI;
        return (
          <group key={`goalpost-${idx}`} position={[0, 0, zPos]} rotation={[0, rot, 0]}>
            {/* White tubular metal posts (4m wide, 2.2m high) */}
            {[-2.0, 2.0].map((gx, gi) => (
              <mesh key={`post-${gi}`} position={[gx, 1.1, 0]} castShadow>
                <cylinderGeometry args={[0.07, 0.07, 2.2, 8]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.3} metalness={0.7} />
              </mesh>
            ))}
            {/* Crossbar */}
            <mesh position={[0, 2.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 4.14, 8]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Goal Net Depth Box */}
            <mesh position={[0, 1.1, 0.9]}>
              <boxGeometry args={[4.0, 2.15, 1.7]} />
              <meshStandardMaterial
                color="#F1F5F9"
                wireframe={true}
                transparent={true}
                opacity={0.45}
              />
            </mesh>
          </group>
        );
      })}

      {/* 5. Team Dugouts & Player Benches along West Touchline */}
      <group position={[-17.5, 0, 0]}>
        {[-6, 6].map((dz, di) => (
          <group key={`dugout-${di}`} position={[0, 0, dz]}>
            {/* Curved Perspex Canopy */}
            <mesh position={[0, 1.2, 0]} castShadow>
              <boxGeometry args={[1.8, 2.2, 4.2]} />
              <meshStandardMaterial color="#3B82F6" transparent opacity={0.4} />
            </mesh>
            {/* Blue Bucket Player Seats */}
            {[-1.2, -0.4, 0.4, 1.2].map((sz, si) => (
              <mesh key={`seat-${si}`} position={[-0.2, 0.45, sz]} castShadow>
                <boxGeometry args={[0.45, 0.45, 0.45]} />
                <meshStandardMaterial color="#1E40AF" roughness={0.6} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* 6. Tiered Grandstands / Bleachers (West & East Wings) */}
      {/* West Wing Grandstand with Stadium Canopy Roof */}
      <group position={[-23, 0, 0]}>
        {[0, 1, 2, 3].map((tier) => (
          <group key={`tier-w-${tier}`} position={[-tier * 1.4, tier * 0.9, 0]}>
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.4, 0.9, 46]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.8} />
            </mesh>
            {/* Red & Blue Stadium Seats */}
            {Array.from({ length: 22 }).map((_, si) => (
              <mesh
                key={`seat-w-${tier}-${si}`}
                position={[0.2, 0.98, -21 + si * 2.0]}
                castShadow
              >
                <boxGeometry args={[0.5, 0.25, 0.55]} />
                <meshStandardMaterial
                  color={si % 2 === 0 ? "#2563EB" : "#DC2626"}
                  roughness={0.6}
                />
              </mesh>
            ))}
          </group>
        ))}
        {/* Grandstand Stadium Canopy Roof */}
        <mesh position={[-2.5, 5.8, 0]} rotation={[0, 0, 0.15]} castShadow>
          <boxGeometry args={[8.0, 0.25, 48]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.4} />
        </mesh>
      </group>

      {/* East Wing Grandstand with VIP Player Entrance Tunnel in Center */}
      <group position={[23, 0, 0]}>
        {[0, 1, 2, 3].map((tier) => (
          <group key={`tier-e-${tier}`} position={[tier * 1.4, tier * 0.9, 0]}>
            <mesh position={[0, 0.45, -14]} castShadow receiveShadow>
              <boxGeometry args={[1.4, 0.9, 18]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.45, 14]} castShadow receiveShadow>
              <boxGeometry args={[1.4, 0.9, 18]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.8} />
            </mesh>
          </group>
        ))}
        {/* Canopy Roof */}
        <mesh position={[2.5, 5.8, 0]} rotation={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[8.0, 0.25, 48]} />
          <meshStandardMaterial color="#1E293B" roughness={0.5} metalness={0.4} />
        </mesh>
        {/* Player Entrance Tunnel Archway at z=0 */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 1.8, 0]} castShadow>
            <boxGeometry args={[4.2, 3.6, 6.0]} />
            <meshStandardMaterial color="#0F172A" metalness={0.7} />
          </mesh>
          {/* Tunnel Red Carpet */}
          <mesh position={[-1.2, 0.05, 0]}>
            <boxGeometry args={[4.0, 0.02, 2.4]} />
            <meshStandardMaterial color="#DC2626" />
          </mesh>
        </group>
      </group>

      {/* 7. Four High-Mast Stadium Floodlight Towers (Night Illumination) */}
      {[
        [-20, -28],
        [20, -28],
        [-20, 28],
        [20, 28],
      ].map(([fx, fz], fi) => (
        <group key={`floodlight-${fi}`} position={[fx, 0, fz]}>
          <mesh position={[0, 8.0, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.65, 16, 6]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 16.0, 0]} castShadow>
            <boxGeometry args={[3.2, 0.8, 0.4]} />
            <meshStandardMaterial color="#0F172A" metalness={0.8} />
          </mesh>
          {[-1.2, -0.4, 0.4, 1.2].map((bx, bi) => (
            <mesh key={`bulb-${bi}`} position={[bx, 15.9, 0.25]}>
              <sphereGeometry args={[0.22, 10, 10]} />
              <meshStandardMaterial
                color={isNight ? "#FFFFFF" : "#CBD5E1"}
                emissive={isNight ? "#E0F2FE" : "#000000"}
                emissiveIntensity={isNight ? 3.0 : 0}
              />
            </mesh>
          ))}
          {isNight && (
            <spotLight
              position={[0, 16.0, 0]}
              target-position={[0, 0, 0]}
              color="#E0F2FE"
              intensity={4.5}
              distance={65}
              angle={0.65}
              penumbra={0.4}
            />
          )}
        </group>
      ))}

      {/* 8. Electronic Digital Scoreboard (North end at z=-28) */}
      <group position={[0, 7.5, -28]}>
        <mesh position={[0, -2.5, 0]}>
          <boxGeometry args={[0.4, 5.0, 0.4]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} />
        </mesh>
        <mesh castShadow>
          <boxGeometry args={[9.5, 3.2, 0.35]} />
          <meshStandardMaterial color="#090D16" roughness={0.3} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.2]}>
          <planeGeometry args={[9.0, 2.8]} />
          <meshStandardMaterial
            color="#050811"
            emissive="#0284C7"
            emissiveIntensity={0.25}
          />
        </mesh>
        <group position={[0, 0.4, 0.22]}>
          {/* Cambodia Home Badge */}
          <mesh position={[-2.2, 0, 0]}>
            <boxGeometry args={[2.8, 0.9, 0.05]} />
            <meshStandardMaterial color="#1E3A8A" emissive="#3B82F6" emissiveIntensity={0.8} />
          </mesh>
          {/* Visitors Badge */}
          <mesh position={[2.2, 0, 0]}>
            <boxGeometry args={[2.8, 0.9, 0.05]} />
            <meshStandardMaterial color="#881337" emissive="#F43F5E" emissiveIntensity={0.8} />
          </mesh>
          {/* Live Score Display */}
          <mesh position={[0, -0.6, 0]}>
            <boxGeometry args={[3.2, 0.8, 0.05]} />
            <meshStandardMaterial color="#111827" emissive="#FBBF24" emissiveIntensity={1.2} />
          </mesh>
        </group>
      </group>

      {/* 9. Perimeter Advertising Boards around pitch */}
      {[-16.5, 16.5].map((bx, bi) => (
        <group key={`ad-board-${bi}`} position={[bx, 0.45, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.9, 44]} />
            <meshStandardMaterial color={bi === 0 ? "#1E40AF" : "#DC2626"} metalness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// =============================================================================
// 4. REGIONAL VOLLEYBALL COURT (តារាងបាល់ទះស្តង់ដារ)
// =============================================================================
export function VolleyballCourt({ position = [26, 0, 92] }: { position?: [number, number, number] }) {
  const timeHour = useGameStore((state) => state.timeHour);
  const isNight = timeHour < 5.5 || timeHour >= 18.0;

  return (
    <group position={position}>
      {/* 1. Surrounding Concrete Apron */}
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[14, 0.05, 24]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.9} />
      </mesh>

      {/* 2. Blue / Terracotta Professional Sport Court (9m wide, 18m long) */}
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[9, 0.06, 18]} />
        <meshStandardMaterial color="#2563EB" roughness={0.7} />
      </mesh>

      {/* 3m Attack Zones (Terracotta color) */}
      {[-4.5, 4.5].map((az, ai) => (
        <mesh key={`attack-${ai}`} position={[0, 0.022, az]} receiveShadow>
          <boxGeometry args={[8.8, 0.005, 6.0]} />
          <meshStandardMaterial color="#EA580C" roughness={0.7} />
        </mesh>
      ))}

      {/* 3. Crisp White Court Boundary Lines */}
      {[-4.5, 4.5].map((sx, si) => (
        <mesh key={`sline-${si}`} position={[sx, 0.026, 0]}>
          <boxGeometry args={[0.1, 0.005, 18]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      ))}
      {[-9, 9].map((ez, ei) => (
        <mesh key={`eline-${ei}`} position={[0, 0.026, ez]}>
          <boxGeometry args={[9.1, 0.005, 0.1]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      ))}
      {/* Center Line under Net */}
      <mesh position={[0, 0.026, 0]}>
        <boxGeometry args={[9.1, 0.005, 0.1]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      {/* 3m Attack Lines */}
      {[-3, 3].map((alz, ali) => (
        <mesh key={`aline-${ali}`} position={[0, 0.026, alz]}>
          <boxGeometry args={[9.1, 0.005, 0.1]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      ))}

      {/* 4. High Volleyball Net (Height: 2.43m, Width: 9.5m) */}
      <group position={[0, 0, 0]}>
        {[-5.0, 5.0].map((px, pi) => (
          <mesh key={`vpost-${pi}`} position={[px, 1.4, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 2.8, 10]} />
            <meshStandardMaterial color="#FBBF24" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* Net Mesh Fabric */}
        <mesh position={[0, 1.9, 0]}>
          <boxGeometry args={[9.6, 1.0, 0.04]} />
          <meshStandardMaterial
            color="#FFFFFF"
            wireframe={true}
            transparent={true}
            opacity={0.65}
          />
        </mesh>
        {/* White Top Net Band Cable */}
        <mesh position={[0, 2.43, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 9.8, 8]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        {/* Red & White Antennas */}
        {[-4.5, 4.5].map((ax, ai) => (
          <mesh key={`antenna-${ai}`} position={[ax, 2.6, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 1.0, 6]} />
            <meshStandardMaterial color="#EF4444" />
          </mesh>
        ))}
      </group>

      {/* 5. Elevated Umpire / Referee Chair */}
      <group position={[-5.4, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 2.4, 6]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 2.3, 0]} castShadow>
          <boxGeometry args={[0.55, 0.45, 0.55]} />
          <meshStandardMaterial color="#1E40AF" />
        </mesh>
      </group>

      {/* 6. Iconic Cambodian Blue & Red Plastic Stools for Spectators */}
      {[-6.0, 6.0].map((sideX, si) => (
        <group key={`stools-side-${si}`} position={[sideX, 0, 0]}>
          {[-6, -4, -2, 2, 4, 6].map((sz, szi) => (
            <mesh key={`stool-${szi}`} position={[0, 0.22, sz]} castShadow>
              <cylinderGeometry args={[0.2, 0.24, 0.44, 8]} />
              <meshStandardMaterial
                color={szi % 2 === 0 ? "#2563EB" : "#DC2626"}
                roughness={0.6}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* 7. Court Floodlights */}
      {[-6.5, 6.5].map((lx, li) => (
        <group key={`vlamp-${li}`} position={[lx, 0, 0]}>
          <mesh position={[0, 3.8, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 7.6, 8]} />
            <meshStandardMaterial color="#1E293B" metalness={0.7} />
          </mesh>
          <mesh position={[0, 7.6, 0]}>
            <boxGeometry args={[1.2, 0.35, 0.6]} />
            <meshStandardMaterial color="#0F172A" />
          </mesh>
          {isNight && (
            <spotLight
              position={[0, 7.5, 0]}
              target-position={[0, 0, 0]}
              color="#FFF7ED"
              intensity={2.8}
              distance={28}
              angle={0.75}
            />
          )}
        </group>
      ))}
    </group>
  );
}

// =============================================================================
// 5. OUTDOOR FOOTBALL TRAINING PITCH (ទីលានហ្វឹកហាត់បាល់ទាត់)
// =============================================================================
export function TrainingPitch({ position = [54, 0, 92] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 1. Practice Turf (22m x 14m) */}
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[14, 0.05, 22]} />
        <meshStandardMaterial color="#15803D" roughness={0.8} />
      </mesh>
      {/* Border White Line */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[13.6, 0.005, 21.6]} />
        <meshStandardMaterial color="#FFFFFF" wireframe={true} />
      </mesh>

      {/* 2. Mini Training Goals at both ends */}
      {[-10, 10].map((gz, gi) => (
        <group key={`mini-goal-${gi}`} position={[0, 0, gz]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <boxGeometry args={[2.4, 1.2, 0.8]} />
            <meshStandardMaterial color="#FFFFFF" wireframe={true} />
          </mesh>
        </group>
      ))}

      {/* 3. Fluorescent Orange Agility Cones for Slalom Drills */}
      {[-4, -2, 0, 2, 4].map((cz, ci) => (
        <mesh key={`cone-${ci}`} position={[(ci % 2 === 0 ? 0.6 : -0.6), 0.18, cz]} castShadow>
          <coneGeometry args={[0.14, 0.36, 8]} />
          <meshStandardMaterial color="#F97316" emissive="#EA580C" emissiveIntensity={0.6} />
        </mesh>
      ))}

      {/* 4. Spare Training Soccer Ball */}
      <mesh position={[1.5, 0.22, 2.0]} castShadow>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}

// =============================================================================
// 6. RECREATIONAL SPORTS COURT (SEPAK TAKRAW / BADMINTON)
// =============================================================================
export function RecreationalCourt({ position = [26, 0, 114] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Green Acrylic Surface (14m x 7m) */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[7, 0.05, 14]} />
        <meshStandardMaterial color="#059669" roughness={0.7} />
      </mesh>
      {/* Net & Posts */}
      <mesh position={[-3.6, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[3.6, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[7.2, 0.7, 0.03]} />
        <meshStandardMaterial color="#FFFFFF" wireframe={true} opacity={0.6} transparent />
      </mesh>
    </group>
  );
}

// =============================================================================
// 7. SPORTS CLUBHOUSE & PLAYER LOCKER ROOM (បន្ទប់កីឡាករ & ក្លឹបកីឡា)
// =============================================================================
export function LockerRoomBuilding({ position = [6, 0, 78] }: { position?: [number, number, number] }) {
  const openModal = useGameStore((state) => state.openModal);
  const targetPos = useGameStore((state) => state.targetPos);
  const [hovered, setHovered] = useState(false);
  const dist = Math.hypot(targetPos[0] - position[0], targetPos[2] - position[2]);
  const isNear = dist < 4.5;

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        openModal("locker_room");
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Clubhouse Main Structure (10m wide, 4.5m tall, 8m deep) */}
      <mesh position={[0, 2.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 4.5, 8]} />
        <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Front Entrance Glass Facade & Doors */}
      <mesh position={[0, 1.8, 4.02]}>
        <boxGeometry args={[4.2, 3.2, 0.08]} />
        <meshStandardMaterial color="#38BDF8" transparent opacity={0.65} metalness={0.8} />
      </mesh>

      {/* Gold Signboard: SPORTS CLUB & LOCKER ROOM */}
      <mesh position={[0, 4.0, 4.08]} castShadow>
        <boxGeometry args={[8.5, 0.9, 0.15]} />
        <meshStandardMaterial color="#0F172A" metalness={0.8} />
      </mesh>
      <mesh position={[0, 4.0, 4.18]}>
        <planeGeometry args={[8.0, 0.65]} />
        <meshStandardMaterial color="#1E3A8A" emissive="#3B82F6" emissiveIntensity={0.6} />
      </mesh>

      {/* Exterior Overhang Roof */}
      <mesh position={[0, 4.6, 0.5]} castShadow>
        <boxGeometry args={[10.6, 0.3, 9.2]} />
        <meshStandardMaterial color="#090D16" />
      </mesh>

      {/* Door Proximity Floating Marker */}
      {isNear && (
        <group position={[0, 2.5, 4.8]}>
          <mesh>
            <octahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color="#38BDF8" emissive="#0284C7" emissiveIntensity={1.5} />
          </mesh>
          <pointLight color="#38BDF8" intensity={2} distance={4} />
        </group>
      )}
    </group>
  );
}

// =============================================================================
// 8. SPORTS RETAIL SHOP & FRESH REFRESHMENT STALLS (ហាងកីឡា & តូបទឹកដូង)
// =============================================================================
export function SportsRetailAndFood({ position = [18, 0, 78] }: { position?: [number, number, number] }) {
  const drinkCoconutWater = useGameStore((state) => state.drinkCoconutWater);
  const eatSportsSnack = useGameStore((state) => state.eatSportsSnack);

  return (
    <group position={position}>
      {/* 1. Sports Merchandise Shop (Shophouse Blue) */}
      <group position={[0, 0, 0]}>
        <FBXModel
          url={MODELS.BLD_Shophouse_Blue}
          scale={1.05}
          fallback={
            <mesh position={[0, 3.5, 0]} castShadow>
              <boxGeometry args={[6.5, 7.0, 7.5]} />
              <meshStandardMaterial color="#2563EB" />
            </mesh>
          }
        />
        {/* Sports Shop Overhead Sign */}
        <mesh position={[0, 3.8, 3.9]}>
          <boxGeometry args={[4.8, 0.8, 0.1]} />
          <meshStandardMaterial color="#0F172A" emissive="#2563EB" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* 2. Fresh Coconut Drink Stall */}
      <group
        position={[6.5, 0, 2.5]}
        onClick={(e) => {
          e.stopPropagation();
          drinkCoconutWater();
        }}
      >
        <FBXModel
          url={MODELS.BLD_CoffeeStall}
          scale={1.1}
          fallback={
            <mesh position={[0, 1.2, 0]} castShadow>
              <boxGeometry args={[2.6, 2.2, 2.2]} />
              <meshStandardMaterial color="#D97706" />
            </mesh>
          }
        />
        {/* Fresh Coconuts Stacked on counter */}
        {[-0.6, -0.2, 0.2, 0.6].map((cx, ci) => (
          <mesh key={`coconut-${ci}`} position={[cx, 1.05, 0.5]} castShadow>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#22C55E" roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* 3. Cambodian Sports Noodle / Snack Stall */}
      <group
        position={[-6.5, 0, 2.5]}
        onClick={(e) => {
          e.stopPropagation();
          eatSportsSnack();
        }}
      >
        <FBXModel
          url={MODELS.BLD_MarketStall_Red}
          scale={1.1}
          fallback={
            <mesh position={[0, 1.2, 0]} castShadow>
              <boxGeometry args={[2.8, 2.2, 2.2]} />
              <meshStandardMaterial color="#DC2626" />
            </mesh>
          }
        />
      </group>

      {/* 4. Outdoor Cafe Table & Umbrella */}
      <group position={[0, 0, 4.5]}>
        {/* Table */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.9, 0.9, 0.08, 16]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.75, 8]} />
          <meshStandardMaterial color="#1E293B" />
        </mesh>
        {/* Sun Umbrella */}
        <mesh position={[0, 2.2, 0]} castShadow>
          <coneGeometry args={[1.8, 0.7, 8]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.5, 6]} />
          <meshStandardMaterial color="#E2E8F0" />
        </mesh>
        {/* Chairs */}
        {[-1.2, 1.2].map((cx, ci) => (
          <mesh key={`uchair-${ci}`} position={[cx, 0.45, 0]} castShadow>
            <boxGeometry args={[0.45, 0.45, 0.45]} />
            <meshStandardMaterial color="#1E40AF" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// =============================================================================
// 9. GRAND PARKING PLAZA (ចំណតរថយន្ត & ម៉ូតូកីឡា)
// =============================================================================
export function GrandParkingPlaza({ position = [25, 0, 64] }: { position?: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Asphalt Surface (28m wide, 18m deep) */}
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[28, 0.08, 18]} />
        <meshStandardMaterial color="#33373E" roughness={0.8} />
      </mesh>

      {/* White Parking Bay Lines */}
      {[-10, -6, -2, 2, 6, 10].map((px, pi) => (
        <group key={`p-bay-${pi}`} position={[px, 0.01, 0]}>
          <mesh>
            <boxGeometry args={[0.15, 0.01, 6.5]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, 0, 3.25]}>
            <boxGeometry args={[3.85, 0.01, 0.15]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ))}

      {/* Gold VIP Parking Bay for Supercar at [px = 0, z = 0] */}
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[3.6, 0.005, 6.2]} />
        <meshStandardMaterial color="#F59E0B" emissive="#D97706" emissiveIntensity={0.25} />
      </mesh>

      {/* Parked Sports Team Bus / Remork Tuk-Tuk Transport */}
      <group position={[-11, 0, -3.5]} rotation={[0, Math.PI / 2, 0]}>
        <FBXModel
          url={MODELS.VEH_Remork}
          scale={0.95}
          fallback={
            <mesh position={[0, 1.2, 0]} castShadow>
              <boxGeometry args={[2.2, 1.8, 4.0]} />
              <meshStandardMaterial color="#2563EB" />
            </mesh>
          }
        />
      </group>

      {/* Parked Motorbikes in bays */}
      <group position={[4, 0, -2.5]} rotation={[0, 0.3, 0]}>
        <FBXModel
          url={MODELS.VEH_Motorbike_Red}
          scale={0.9}
          fallback={
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[0.6, 0.9, 1.8]} />
              <meshStandardMaterial color="#DC2626" />
            </mesh>
          }
        />
      </group>
      <group position={[8, 0, -2.5]} rotation={[0, -0.2, 0]}>
        <FBXModel
          url={MODELS.VEH_Motorbike_Blue}
          scale={0.9}
          fallback={
            <mesh position={[0, 0.5, 0]}>
              <boxGeometry args={[0.6, 0.9, 1.8]} />
              <meshStandardMaterial color="#2563EB" />
            </mesh>
          }
        />
      </group>

      {/* Parking Lot Perimeter Curbs */}
      <mesh position={[-14.1, 0.05, 0]}>
        <boxGeometry args={[0.25, 0.12, 18]} />
        <meshStandardMaterial color="#94A3B8" />
      </mesh>
      <mesh position={[14.1, 0.05, 0]}>
        <boxGeometry args={[0.25, 0.12, 18]} />
        <meshStandardMaterial color="#94A3B8" />
      </mesh>
    </group>
  );
}

// =============================================================================
// 10. SPORTS BOULEVARD, WELCOME ARCH & LANDSCAPING (ទីក្រុងកីឡា)
// =============================================================================
export function SportsCityPlaza() {
  return (
    <group position={[0, 0, 0]}>
      {/* Grand Olympic Entrance Archway at bridge exit [x = 25, z = 52] */}
      <group position={[25, 0, 52]}>
        {/* Left Column */}
        <mesh position={[-6.2, 3.5, 0]} castShadow>
          <boxGeometry args={[1.2, 7.0, 1.2]} />
          <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Right Column */}
        <mesh position={[6.2, 3.5, 0]} castShadow>
          <boxGeometry args={[1.2, 7.0, 1.2]} />
          <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Archway Crossbeam */}
        <mesh position={[0, 7.2, 0]} castShadow>
          <boxGeometry args={[14.2, 1.4, 1.6]} />
          <meshStandardMaterial color="#2563EB" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Golden Inscription Sign */}
        <mesh position={[0, 7.2, 0.85]}>
          <boxGeometry args={[11.5, 0.9, 0.1]} />
          <meshStandardMaterial color="#F59E0B" emissive="#D97706" emissiveIntensity={0.6} metalness={0.8} />
        </mesh>
        {/* Olympic Ring Accents */}
        {[-3, -1.5, 0, 1.5, 3].map((rx, ri) => (
          <mesh key={`oring-${ri}`} position={[rx, 8.4, 0]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.6, 0.07, 6, 24]} />
            <meshStandardMaterial
              color={ri === 0 ? "#2563EB" : ri === 1 ? "#F59E0B" : ri === 2 ? "#0F172A" : ri === 3 ? "#16A34A" : "#DC2626"}
            />
          </mesh>
        ))}
      </group>

      {/* Main Access Highway from bridge exit into parking and sports venues */}
      <group position={[25, 0, 64]}>
        <mesh position={[0, -0.04, 0]} receiveShadow>
          <boxGeometry args={[8.4, 0.08, 24]} />
          <meshStandardMaterial color="#33373E" roughness={0.7} />
        </mesh>
        {/* Yellow Dashed Center Line */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={`dash-sb-${i}`} position={[0, 0.01, -10 + i * 4.0]}>
            <boxGeometry args={[0.2, 0.01, 2.0]} />
            <meshStandardMaterial color="#FDE047" />
          </mesh>
        ))}
      </group>

      {/* Paved Walkway connecting parking to football stadium at [-26, 0, 95] */}
      <group position={[0, 0, 75]}>
        <mesh position={[0, -0.035, 0]} receiveShadow>
          <boxGeometry args={[46, 0.07, 4.0]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.9} />
        </mesh>
      </group>

      {/* Palm Trees & Street Lamps */}
      {[-1, 1].map((side, si) =>
        [56, 70, 84, 98].map((zPos, zi) => (
          <group key={`sp-palm-${si}-${zi}`} position={[25 + side * 15, 0, zPos]}>
            <mesh position={[0, 3.5, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.26, 7.0, 8]} />
              <meshStandardMaterial color="#5C4D3C" roughness={0.9} />
            </mesh>
            <mesh position={[0, 7.0, 0]} castShadow>
              <sphereGeometry args={[1.5, 8, 8]} />
              <meshStandardMaterial color="#15803D" roughness={0.8} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

// =============================================================================
// 11. SPORTS CITY LIVELY NPCS (កីឡាករ & អាជ្ញាកណ្តាល)
// =============================================================================
export function SportsCityNPCs() {
  const timeRef = useRef(0);
  const player1Ref = useRef<THREE.Group>(null);
  const player2Ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    timeRef.current += delta;
    // Animate training players running / passing
    if (player1Ref.current) {
      player1Ref.current.position.x = 52 + Math.sin(timeRef.current * 1.5) * 1.8;
      player1Ref.current.rotation.y = Math.cos(timeRef.current * 1.5) > 0 ? 0 : Math.PI;
    }
    if (player2Ref.current) {
      player2Ref.current.position.x = 56 - Math.sin(timeRef.current * 1.5) * 1.8;
      player2Ref.current.rotation.y = Math.cos(timeRef.current * 1.5) > 0 ? Math.PI : 0;
    }
  });

  return (
    <group>
      {/* 1. Football Players Drills on Training Pitch [54, 0, 92] */}
      <group ref={player1Ref} position={[52, 0, 92]}>
        {/* Blue Training Kit Player */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.8, 8]} />
          <meshStandardMaterial color="#2563EB" />
        </mesh>
        <mesh position={[0, 1.45, 0]} castShadow>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial color="#E2A76F" />
        </mesh>
      </group>

      <group ref={player2Ref} position={[56, 0, 92]}>
        {/* Red Training Kit Player */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.18, 0.8, 8]} />
          <meshStandardMaterial color="#DC2626" />
        </mesh>
        <mesh position={[0, 1.45, 0]} castShadow>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial color="#E2A76F" />
        </mesh>
      </group>

      {/* 2. Coach with Clipboard on Touchline */}
      <group position={[48, 0, 92]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.2, 0.85, 8]} />
          <meshStandardMaterial color="#0F172A" />
        </mesh>
        <mesh position={[0, 1.48, 0]} castShadow>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial color="#E2A76F" />
        </mesh>
        {/* Clipboard */}
        <mesh position={[0.2, 0.95, 0.15]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.25, 0.35, 0.04]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* 3. Security Guard at Stadium Player Tunnel [-3, 0, 95] */}
      <group position={[-3, 0, 95]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.2, 0.85, 8]} />
          <meshStandardMaterial color="#1E293B" />
        </mesh>
        <mesh position={[0, 1.48, 0]} castShadow>
          <sphereGeometry args={[0.16, 8, 8]} />
          <meshStandardMaterial color="#E2A76F" />
        </mesh>
      </group>
    </group>
  );
}

// =============================================================================
// 12. MAIN EXPORTED SPORTS CITY DISTRICT (ក្រុងកីឡា)
// =============================================================================
export function SportsCity() {
  return (
    <group>
      {/* 1. Highway, Boulevard, Plaza & Welcome Arch */}
      <SportsCityPlaza />

      {/* 2. Grand Parking Plaza for Supercar, Bikes & Buses */}
      <GrandParkingPlaza position={[25, 0, 64]} />

      {/* 3. Full Olympic Football Stadium */}
      <FootballStadium position={[-26, 0, 95]} />

      {/* 4. Interactive Soccer Ball with Kicking Physics & Goal Detection */}
      <InteractiveFootball pitchCenter={[-26, 0, 95]} />

      {/* 5. Professional Volleyball Court */}
      <VolleyballCourt position={[26, 0, 92]} />

      {/* 6. Interactive Volleyball with Arc Physics */}
      <InteractiveVolleyball courtCenter={[26, 0, 92]} />

      {/* 7. Outdoor Football Training Pitch */}
      <TrainingPitch position={[54, 0, 92]} />

      {/* 8. Recreational Sports Court */}
      <RecreationalCourt position={[26, 0, 114]} />

      {/* 9. Sports Clubhouse & Locker Room Facility */}
      <LockerRoomBuilding position={[6, 0, 78]} />

      {/* 10. Sports Merchandise Shop & Refreshment Stalls */}
      <SportsRetailAndFood position={[18, 0, 78]} />

      {/* 11. Animated Sports NPCs */}
      <SportsCityNPCs />
    </group>
  );
}
