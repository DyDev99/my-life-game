"use client";

import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, AttackTarget, DamagedBuildingState } from "@/state/gameStore";
import { collisionWorld } from "@/game/physics/collisionSystem";
import { audio } from "@/game/audio/audioManager";

interface ActiveMissile {
  id: string;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  heading: number;
  pitch: number;
  life: number;
  targetPos?: THREE.Vector3;
}

interface ActiveExplosion {
  id: string;
  pos: THREE.Vector3;
  age: number;
  maxAge: number;
  scale: number;
}

/**
 * High-Performance 3D Air-to-Ground Missile Combat System
 * Optimized:
 * - Direct scene mesh updates (Zero React re-render thrashing inside useFrame)
 * - Proportional navigation guidance with proximity burst (No endless circling/orbiting)
 * - Dynamic swept raycast collision detection
 * - GPU-friendly emissive materials without heavy dynamic point light overload
 */
export function MissileSystem() {
  const fireTrigger = useGameStore((state) => state.fireMissileTrigger);
  const damagedBuildings = useGameStore((state) => state.damagedBuildings);
  const damageBuilding = useGameStore((state) => state.damageBuilding);
  const lockedTarget = useGameStore((state) => state.lockedTarget);
  const targetPos = useGameStore((state) => state.targetPos);

  const missilesRef = useRef<ActiveMissile[]>([]);
  const explosionsRef = useRef<ActiveExplosion[]>([]);

  const missileGroupRef = useRef<THREE.Group>(null);
  const explosionGroupRef = useRef<THREE.Group>(null);

  const lastTriggerRef = useRef(fireTrigger);
  const pylonToggleRef = useRef(false);

  // Keyboard shortcuts: Tab (cycle), T (targeting), X (unlock), J / Enter (missile fire), R (reload)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Tab") {
        e.preventDefault();
        useGameStore.getState().cycleNextTarget();
      } else if (e.key === "t" || e.key === "T") {
        useGameStore.getState().toggleTargetingMode();
      } else if (e.key === "x" || e.key === "X") {
        useGameStore.getState().clearLockedTarget();
      } else if (e.key === "j" || e.key === "J" || e.key === "Enter") {
        const state = useGameStore.getState();
        if (state.ridingVehicle === "plane" || state.lockedTarget) {
          state.triggerFireMissile();
        }
      } else if (e.key === "r" || e.key === "R") {
        if (useGameStore.getState().ridingVehicle === "plane") {
          useGameStore.getState().replenishMissiles();
          useGameStore.getState().addStatPop(
            useGameStore.getState().language === "km" ? "ផ្ទុកគ្រាប់មីស៊ីលពេញវិញ (8/8) 🚀" : "Missiles Reloaded (8/8) 🚀",
            "skill"
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Listen to fireMissileTrigger changes
  useEffect(() => {
    if (fireTrigger === lastTriggerRef.current) return;
    lastTriggerRef.current = fireTrigger;

    const state = useGameStore.getState();
    const planePos = state.targetPos;
    const heading = state.playerHeading;
    const target = state.lockedTarget;
    const isPlane = state.ridingVehicle === "plane";

    let spawnX = planePos[0];
    let spawnY = planePos[1] + 1.2;
    let spawnZ = planePos[2];

    if (isPlane) {
      pylonToggleRef.current = !pylonToggleRef.current;
      const side = pylonToggleRef.current ? 3.2 : -3.2;
      spawnX = planePos[0] + Math.cos(heading) * side + Math.sin(heading) * 1.8;
      spawnY = Math.max(1.2, planePos[1] + 0.4);
      spawnZ = planePos[2] - Math.sin(heading) * side + Math.cos(heading) * 1.8;
    } else if (target) {
      spawnX = target.position[0] - Math.sin(heading) * 35;
      spawnY = 45;
      spawnZ = target.position[2] - Math.cos(heading) * 35;
    }

    // Ejection speed accounts for aircraft velocity so missile rapidly pulls ahead
    const jetForwardSpeed = isPlane ? (state.vehicleSpeed / 3.6) : 0;
    const speed = isPlane ? Math.max(160.0, jetForwardSpeed + 65.0) : 110.0;
    const launchPitch = isPlane ? (state.planePitch || 0) : -0.25;
    const vx = Math.sin(heading) * Math.cos(launchPitch) * speed;
    const vy = -Math.sin(launchPitch) * speed;
    const vz = Math.cos(heading) * Math.cos(launchPitch) * speed;

    const newMissile: ActiveMissile = {
      id: `msl-${Date.now()}-${Math.random()}`,
      pos: new THREE.Vector3(spawnX, spawnY, spawnZ),
      vel: new THREE.Vector3(vx, vy, vz),
      heading,
      pitch: launchPitch,
      life: 0,
      targetPos: target
        ? new THREE.Vector3(target.position[0], target.position[1] + 1.2, target.position[2])
        : undefined,
    };

    missilesRef.current.push(newMissile);
  }, [fireTrigger]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // 1. UPDATE ACTIVE MISSILES WITH SWEPT COLLISION & PROPORTIONAL GUIDANCE
    if (missilesRef.current.length > 0) {
      const boxes = collisionWorld.getBoxes();
      const nextMissiles: ActiveMissile[] = [];
      const subSteps = 3;
      const subDt = dt / subSteps;

      for (const m of missilesRef.current) {
        m.life += dt;
        if (m.life > 5.0) continue; // Despawn after 5 seconds

        let collided = false;
        let hitPoint = m.pos.clone();
        let hitBuildingId: string | null = null;
        let hitBuildingName = "Building";

        for (let s = 0; s < subSteps; s++) {
          // Guided Homing Logic
          if (m.targetPos && m.pos.y > 0.3) {
            const dx = m.targetPos.x - m.pos.x;
            const dy = m.targetPos.y - m.pos.y;
            const dz = m.targetPos.z - m.pos.z;
            const totalDist = Math.hypot(dx, dy, dz);

            // Proximity Detonation Trigger (generous 3.6m blast radius so missile never gets trapped orbiting)
            if (totalDist < 3.6) {
              collided = true;
              hitPoint = m.targetPos.clone();
              break;
            }

            const horizDist = Math.hypot(dx, dz);
            if (horizDist > 0.2) {
              const desiredHeading = Math.atan2(dx, dz);
              const desiredPitch = -Math.atan2(dy, horizDist);

              // Proportional navigation turn rate increases as target gets closer
              const dynamicRate = Math.min(22.0, 12.0 + (30.0 / Math.max(2.0, totalDist)));
              const steerRate = (dynamicRate / subSteps) * dt;

              let diffH = desiredHeading - m.heading;
              while (diffH > Math.PI) diffH -= Math.PI * 2;
              while (diffH < -Math.PI) diffH += Math.PI * 2;
              m.heading += Math.max(-steerRate, Math.min(steerRate, diffH));

              const diffP = desiredPitch - m.pitch;
              m.pitch += Math.max(-steerRate, Math.min(steerRate, diffP));

              const curSpeed = m.vel.length();
              m.vel.x = Math.sin(m.heading) * Math.cos(m.pitch) * curSpeed;
              m.vel.y = -Math.sin(m.pitch) * curSpeed;
              m.vel.z = Math.cos(m.heading) * Math.cos(m.pitch) * curSpeed;
            }
          }

          // Accelerate rocket motor forward along current orientation vector
          const motorAccel = (55.0 / subSteps) * dt;
          m.vel.x += Math.sin(m.heading) * Math.cos(m.pitch) * motorAccel;
          m.vel.y += -Math.sin(m.pitch) * motorAccel;
          m.vel.z += Math.cos(m.heading) * Math.cos(m.pitch) * motorAccel;

          // Advance position
          m.pos.x += m.vel.x * subDt;
          m.pos.y += m.vel.y * subDt;
          m.pos.z += m.vel.z * subDt;

          // Ground impact check (armed after 0.2s of launch clearance)
          if (m.life > 0.2 && m.pos.y <= 0.15) {
            collided = true;
            hitPoint = m.pos.clone();
            hitPoint.y = 0.1;
            break;
          }

          // AABB Collision check against world obstacles (armed after 0.2s of launch clearance)
          if (m.life > 0.2) {
            for (const box of boxes) {
              const isLow = box.id.includes("wall") || box.id.includes("rail") || box.id.includes("edge");
              const boxH = isLow ? 2.5 : 18.0;

              if (
                m.pos.x >= box.minX - 0.4 &&
                m.pos.x <= box.maxX + 0.4 &&
                m.pos.z >= box.minZ - 0.4 &&
                m.pos.z <= box.maxZ + 0.4 &&
                m.pos.y <= boxH
              ) {
                collided = true;
                hitPoint = m.pos.clone();
                hitBuildingId = box.id;
                hitBuildingName = box.name || "Building";
                break;
              }
            }
          }
          if (collided) break;
        }

        if (collided) {
          // Splash damage check
          if (!hitBuildingId) {
            for (const box of boxes) {
              const clampedX = Math.max(box.minX, Math.min(box.maxX, hitPoint.x));
              const clampedZ = Math.max(box.minZ, Math.min(box.maxZ, hitPoint.z));
              const distSq = (hitPoint.x - clampedX) ** 2 + (hitPoint.z - clampedZ) ** 2;
              if (distSq < 36.0) {
                hitBuildingId = box.id;
                hitBuildingName = box.name || "Building";
                break;
              }
            }
          }

          // Spawn explosion VFX in pool
          explosionsRef.current.push({
            id: `exp-${Date.now()}-${Math.random()}`,
            pos: hitPoint,
            age: 0,
            maxAge: 0.85,
            scale: 1.0,
          });

          // Play authentic missile detonation sound effect
          audio.playMissileExplosion();
          useGameStore.getState().triggerCameraShake(0.65);

          if (hitBuildingId) {
            damageBuilding(hitBuildingId, [hitPoint.x, hitPoint.y, hitPoint.z], hitBuildingName);
          }
        } else {
          nextMissiles.push(m);
        }
      }

      missilesRef.current = nextMissiles;
    }

    // 2. UPDATE EXPLOSIONS
    if (explosionsRef.current.length > 0) {
      explosionsRef.current = explosionsRef.current
        .map((e) => ({
          ...e,
          age: e.age + dt,
          scale: THREE.MathUtils.lerp(e.scale, 5.5, dt * 14.0),
        }))
        .filter((e) => e.age < e.maxAge);
    }

    // 3. SYNCHRONIZE 3D MESH VISUALS DIRECTLY IN THREE.JS SCENE GRAPH (NO REACT RE-RENDERS)
    if (missileGroupRef.current) {
      while (missileGroupRef.current.children.length > 0) {
        const c = missileGroupRef.current.children[0];
        missileGroupRef.current.remove(c);
      }

      missilesRef.current.forEach((m) => {
        const group = new THREE.Group();
        group.position.copy(m.pos);
        group.rotation.set(m.pitch, m.heading, 0);

        // Body
        const bodyGeom = new THREE.CylinderGeometry(0.16, 0.16, 1.8, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: "#E2E8F0", metalness: 0.7, roughness: 0.3 });
        const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
        bodyMesh.rotation.x = Math.PI / 2;
        group.add(bodyMesh);

        // Radome Cone
        const noseGeom = new THREE.ConeGeometry(0.16, 0.5, 8);
        const noseMat = new THREE.MeshStandardMaterial({ color: "#EAB308", metalness: 0.5 });
        const noseMesh = new THREE.Mesh(noseGeom, noseMat);
        noseMesh.position.z = 1.05;
        noseMesh.rotation.x = -Math.PI / 2;
        group.add(noseMesh);

        // Glowing Rocket Motor Plume
        const plumeGeom = new THREE.CylinderGeometry(0.08, 0.28, 1.2, 8);
        const plumeMat = new THREE.MeshBasicMaterial({ color: "#FF5722", transparent: true, opacity: 0.9 });
        const plumeMesh = new THREE.Mesh(plumeGeom, plumeMat);
        plumeMesh.position.z = -1.2;
        plumeMesh.rotation.x = Math.PI / 2;
        group.add(plumeMesh);

        missileGroupRef.current?.add(group);
      });
    }

    if (explosionGroupRef.current) {
      while (explosionGroupRef.current.children.length > 0) {
        const c = explosionGroupRef.current.children[0];
        explosionGroupRef.current.remove(c);
      }

      explosionsRef.current.forEach((e) => {
        const progress = e.age / e.maxAge;
        const opacity = Math.max(0, 1.0 - progress);
        const coreScale = e.scale * (1.0 - progress * 0.3);

        const expGroup = new THREE.Group();
        expGroup.position.copy(e.pos);

        // Expanding Fireball
        const fireGeom = new THREE.SphereGeometry(0.8, 10, 10);
        const fireMat = new THREE.MeshBasicMaterial({
          color: progress < 0.35 ? "#FFF176" : "#FF5722",
          transparent: true,
          opacity,
        });
        const fireMesh = new THREE.Mesh(fireGeom, fireMat);
        fireMesh.scale.set(coreScale, coreScale, coreScale);
        expGroup.add(fireMesh);

        // Shockwave smoke
        const smokeGeom = new THREE.SphereGeometry(0.85, 8, 8);
        const smokeMat = new THREE.MeshStandardMaterial({
          color: "#212121",
          roughness: 0.9,
          transparent: true,
          opacity: opacity * 0.75,
        });
        const smokeMesh = new THREE.Mesh(smokeGeom, smokeMat);
        const outerScale = coreScale * 1.45;
        smokeMesh.scale.set(outerScale, outerScale, outerScale);
        expGroup.add(smokeMesh);

        explosionGroupRef.current?.add(expGroup);
      });
    }
  });

  return (
    <group>
      {/* 1. Flying Missiles Direct Scene Group */}
      <group ref={missileGroupRef} />

      {/* 2. Blast Explosions Direct Scene Group */}
      <group ref={explosionGroupRef} />

      {/* 3. Damaged Buildings Persistent Scorch and Smoke */}
      {Object.values(damagedBuildings).map((b) => (
        <DamagedBuildingEffect key={b.id} b={b} />
      ))}

      {/* 4. Target Focus Visuals */}
      {lockedTarget && (
        <TargetFocusVisuals target={lockedTarget} playerPos={targetPos} />
      )}
    </group>
  );
}

function DamagedBuildingEffect({ b }: { b: DamagedBuildingState }) {
  const fireRef1 = useRef<THREE.Mesh>(null);
  const smokeRef = useRef<THREE.Group>(null);
  const isCollapsed = b.stage === "collapsed";
  const isHeavy = b.stage === "heavy";

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 3.5;
    if (fireRef1.current) {
      fireRef1.current.scale.y = 1.0 + Math.sin(t * 2.8) * 0.25;
      fireRef1.current.rotation.y = t * 0.8;
    }
    if (smokeRef.current) {
      smokeRef.current.position.y = (isCollapsed ? 1.8 : 2.4) + Math.sin(t * 0.4) * 0.15;
      smokeRef.current.rotation.y = t * 0.12;
    }
  });

  return (
    <group position={[b.lastHitPos[0], b.lastHitPos[1], b.lastHitPos[2]]}>
      {/* Scorched Impact Crater Rim */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[isCollapsed ? 4.5 : isHeavy ? 3.0 : 1.6, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.95} metalness={0.1} />
      </mesh>

      {/* Scattered Structural Debris */}
      <mesh position={[0.9, 0.15, 0.6]} rotation={[0.2, 0.4, 0.1]}>
        <boxGeometry args={[isCollapsed ? 1.4 : 0.6, 0.35, isCollapsed ? 1.1 : 0.45]} />
        <meshStandardMaterial color={b.debrisColor || "#334155"} roughness={0.9} />
      </mesh>
      <mesh position={[-0.8, 0.15, -0.7]} rotation={[-0.3, 0.6, -0.2]}>
        <boxGeometry args={[isCollapsed ? 1.2 : 0.5, 0.3, isCollapsed ? 0.9 : 0.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* Heavy / Collapsed Twisted Rebars */}
      {(isHeavy || isCollapsed) && (
        <mesh position={[0.4, 0.3, -0.4]} rotation={[0.5, 0.8, 0.2]}>
          <cylinderGeometry args={[0.03, 0.03, 1.8, 6]} />
          <meshStandardMaterial color="#92400E" metalness={0.8} />
        </mesh>
      )}

      {/* Billowing Smoke Column */}
      <group ref={smokeRef} position={[0, isCollapsed ? 1.8 : 2.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry
            args={[isCollapsed ? 2.8 : isHeavy ? 1.8 : 0.8, isCollapsed ? 1.4 : 0.7, isCollapsed ? 6.8 : 4.5, 8]}
          />
          <meshStandardMaterial
            color="#1e293b"
            transparent
            opacity={isCollapsed ? 0.75 : isHeavy ? 0.6 : 0.35}
            roughness={1.0}
          />
        </mesh>
      </group>

      {/* Active Flames for Heavy Damage */}
      {isHeavy && (
        <group position={[0, 0.8, 0]}>
          <mesh ref={fireRef1} position={[0, 0, 0]}>
            <coneGeometry args={[0.7, 2.0, 8]} />
            <meshBasicMaterial color="#ff4500" transparent opacity={0.9} />
          </mesh>
          <pointLight color="#ff4500" intensity={2.0} distance={5} />
        </group>
      )}

      {/* Smoldering Glowing Embers for Collapsed State */}
      {isCollapsed && (
        <group position={[0, 0.2, 0]}>
          <mesh position={[0.3, 0.1, 0.2]}>
            <boxGeometry args={[0.8, 0.2, 0.6]} />
            <meshStandardMaterial
              color="#DC2626"
              emissive="#EA580C"
              emissiveIntensity={1.8}
              roughness={0.8}
            />
          </mesh>
          <pointLight color="#EA580C" intensity={1.5} distance={4} />
        </group>
      )}
    </group>
  );
}

function TargetFocusVisuals({
  target,
  playerPos,
}: {
  target: AttackTarget;
  playerPos: [number, number, number];
}) {
  const ringRef = useRef<THREE.Group>(null);
  const laserRef = useRef<THREE.Mesh>(null);

  const tgtVec = React.useMemo(
    () => new THREE.Vector3(target.position[0], target.position[1], target.position[2]),
    [target.position]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 3.0;
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.7;
    }

    if (laserRef.current) {
      const state = useGameStore.getState();
      const p = new THREE.Vector3(...state.targetPos);
      p.y += state.ridingVehicle === "plane" ? 0.6 : 1.2;

      const mid = new THREE.Vector3().addVectors(p, tgtVec).multiplyScalar(0.5);
      laserRef.current.position.copy(mid);

      const dir = new THREE.Vector3().subVectors(tgtVec, p);
      const len = dir.length();
      laserRef.current.scale.set(1, len, 1);
      laserRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    }
  });

  return (
    <group>
      {/* Tactical Targeting Laser */}
      <mesh ref={laserRef}>
        <cylinderGeometry args={[0.04, 0.04, 1, 6]} />
        <meshBasicMaterial color="#EF4444" transparent opacity={0.6} />
      </mesh>

      {/* Target Focus Hologram */}
      <group position={[target.position[0], target.position[1], target.position[2]]}>
        <mesh position={[0, 16, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 32, 8]} />
          <meshBasicMaterial color="#EF4444" transparent opacity={0.4} />
        </mesh>

        <group ref={ringRef} position={[0, 0.8, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.8, 3.1, 24]} />
            <meshBasicMaterial color="#EF4444" side={THREE.DoubleSide} transparent opacity={0.85} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
