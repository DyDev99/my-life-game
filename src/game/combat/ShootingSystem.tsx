"use client";

import React, { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/state/gameStore";
import { WEAPON_REGISTRY, WeaponId } from "./weaponConfig";
import { collisionWorld } from "@/game/physics/collisionSystem";
import { BUILDING_REGISTRY, calculateBulletDamage } from "@/game/physics/buildingDestruction";
import { mobileInput } from "@/game/player/mobileInput";
import { audio } from "@/game/audio/audioManager";
import { cameraRecoilBridge } from "@/game/camera/CameraController";

interface ActiveBulletTracer {
  start: THREE.Vector3;
  end: THREE.Vector3;
  current: THREE.Vector3;
  vel: THREE.Vector3;
  age: number;
  maxAge: number;
  color: string;
}

interface ActiveImpactSpark {
  pos: THREE.Vector3;
  normal: THREE.Vector3;
  age: number;
  maxAge: number;
  color: string;
}

/**
 * High-Performance Two-Stage Mobile Shooting & Hit Detection System
 * Inspired by PUBG Mobile & Free Fire:
 * - Stage 1: Camera crosshair raycast to determine desired 3D aim target point
 * - Stage 2: Muzzle raycast with obstacle occlusion verification (prevents wall clipping)
 * - Object-pooled bullet tracers & impact spark VFX (Zero React state thrashing)
 * - Automatic & semi-automatic fire loop with recoil kickback
 */
export function ShootingSystem() {
  const currentWeaponId = useGameStore((state) => state.currentWeaponId);
  const ridingVehicle = useGameStore((state) => state.ridingVehicle);
  const targetPos = useGameStore((state) => state.targetPos);
  const isAiming = useGameStore((state) => state.isAiming);
  const isReloading = useGameStore((state) => state.isReloading);

  const { camera, scene } = useThree();

  const lastShotTime = useRef<number>(0);
  const tracersRef = useRef<ActiveBulletTracer[]>([]);
  const impactsRef = useRef<ActiveImpactSpark[]>([]);

  // Instanced / Line visual groups
  const tracersGroupRef = useRef<THREE.Group>(null);
  const impactsGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // 1. UPDATE EXISTING BULLET TRACERS
    if (tracersRef.current.length > 0) {
      tracersRef.current = tracersRef.current.filter((t) => {
        t.age += delta;
        t.current.addScaledVector(t.vel, delta);
        return t.age < t.maxAge;
      });

      // Update 3D tracer lines in scene
      if (tracersGroupRef.current) {
        // Clear old children
        while (tracersGroupRef.current.children.length > 0) {
          const child = tracersGroupRef.current.children[0];
          tracersGroupRef.current.remove(child);
        }

        tracersRef.current.forEach((t) => {
          const points = [
            t.current.clone(),
            t.current.clone().sub(t.vel.clone().multiplyScalar(0.04)),
          ];
          const geom = new THREE.BufferGeometry().setFromPoints(points);
          const mat = new THREE.LineBasicMaterial({
            color: t.color,
            linewidth: 2,
            transparent: true,
            opacity: Math.max(0.2, 1 - t.age / t.maxAge),
          });
          const line = new THREE.Line(geom, mat);
          tracersGroupRef.current?.add(line);
        });
      }
    }

    // 2. UPDATE IMPACT SPARKS
    if (impactsRef.current.length > 0) {
      impactsRef.current = impactsRef.current.filter((imp) => {
        imp.age += delta;
        return imp.age < imp.maxAge;
      });

      if (impactsGroupRef.current) {
        while (impactsGroupRef.current.children.length > 0) {
          const child = impactsGroupRef.current.children[0];
          impactsGroupRef.current.remove(child);
        }

        impactsRef.current.forEach((imp) => {
          const progress = imp.age / imp.maxAge;
          const scale = (1 - progress) * 0.28;
          const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(scale, 6, 6),
            new THREE.MeshBasicMaterial({
              color: imp.color,
              transparent: true,
              opacity: 1 - progress,
            })
          );
          mesh.position.copy(imp.pos);
          impactsGroupRef.current?.add(mesh);
        });
      }
    }

    // 3. SHOOTING INPUT & FIRE RATE CHECK
    if (!currentWeaponId || ridingVehicle || isReloading) return;

    const def = WEAPON_REGISTRY[currentWeaponId];
    if (!def) return;

    const now = performance.now();
    const intervalMs = 1000 / def.fireRate;
    const isTriggerPressed = mobileInput.isFiring || mobileInput.shootOnce;

    if (isTriggerPressed && now - lastShotTime.current >= intervalMs) {
      // Check ammo
      const store = useGameStore.getState();
      const currentAmmo = store.weaponAmmo[currentWeaponId];

      if (currentAmmo.inMag <= 0) {
        // Out of ammo: trigger reload or dry-fire click
        if (currentAmmo.reserve > 0) {
          store.startReload();
        } else {
          audio.playClick();
        }
        mobileInput.shootOnce = false;
        lastShotTime.current = now;
        return;
      }

      // Consume 1 round
      store.consumeAmmo(currentWeaponId, 1);
      mobileInput.shootOnce = false;
      lastShotTime.current = now;

      // Play audio
      audio.playGunshot(currentWeaponId);

      // Apply camera recoil kick
      cameraRecoilBridge.applyRecoil(def.recoilVertical, def.recoilHorizontal);

      // Perform Two-Stage Target Calculation & Shooting
      fireWeaponShot(def, store, camera, targetPos, isAiming, tracersRef, impactsRef);
    }
  });

  return (
    <group>
      {/* 3D Bullet Tracer Group */}
      <group ref={tracersGroupRef} />

      {/* 3D Impact Sparks Group */}
      <group ref={impactsGroupRef} />
    </group>
  );
}

/**
 * Executes a two-stage weapon shot:
 * Stage 1: Camera crosshair raycast to determine target point in 3D world.
 * Stage 2: Muzzle raycast to check for intervening obstacle occlusion.
 */
function fireWeaponShot(
  def: (typeof WEAPON_REGISTRY)[WeaponId],
  store: ReturnType<typeof useGameStore.getState>,
  camera: THREE.Camera,
  playerPos: [number, number, number],
  isAiming: boolean,
  tracersRef: React.MutableRefObject<ActiveBulletTracer[]>,
  impactsRef: React.MutableRefObject<ActiveImpactSpark[]>
) {
  const camDir = new THREE.Vector3();
  camera.getWorldDirection(camDir);

  const pelletsCount = def.pellets;
  const spreadAngle = isAiming ? def.adsSpread : def.hipSpread;

  // Approximate weapon muzzle world position (from character's right shoulder/chest)
  const aimYaw = Math.atan2(camDir.x, camDir.z);
  const rightX = -Math.cos(aimYaw);
  const rightZ = Math.sin(aimYaw);
  const muzzleOrigin = new THREE.Vector3(
    playerPos[0] + rightX * (isAiming ? 0.32 : 0.38) + Math.sin(aimYaw) * 0.75,
    playerPos[1] + (isAiming ? 1.3 : 1.2),
    playerPos[2] + rightZ * (isAiming ? 0.32 : 0.38) + Math.cos(aimYaw) * 0.75
  );

  for (let p = 0; p < pelletsCount; p++) {
    // Apply accuracy spread cone (Gaussian-like distribution)
    const spreadRad = (spreadAngle * Math.PI) / 180;
    const randomSpreadX = (Math.random() - 0.5) * spreadRad;
    const randomSpreadY = (Math.random() - 0.5) * spreadRad;

    const spreadDir = camDir.clone();
    spreadDir.x += randomSpreadX;
    spreadDir.y += randomSpreadY;
    spreadDir.normalize();

    // =========================================================================
    // STAGE 1: CAMERA RAYCAST TARGET POINT ACQUISITION
    // =========================================================================
    let targetPoint = camera.position.clone().addScaledVector(spreadDir, def.maxRange);
    let hitObstacleNormal = new THREE.Vector3(0, 1, 0);
    let hitTargetId: string | null = null;
    let isHeadshot = false;

    // 1. Raycast against World Building Obstacles
    const worldHit = collisionWorld.raycast(
      camera.position.x,
      camera.position.y,
      camera.position.z,
      spreadDir.x,
      spreadDir.y,
      spreadDir.z,
      def.maxRange
    );

    let closestDist = def.maxRange;
    if (worldHit && worldHit.distance < closestDist) {
      closestDist = worldHit.distance;
      targetPoint.set(...worldHit.point);
      hitObstacleNormal.set(...worldHit.normal);
    }

    // 2. Raycast against Ground Plane (Y = 0)
    if (spreadDir.y < -0.001) {
      const groundT = (0 - camera.position.y) / spreadDir.y;
      if (groundT > 0 && groundT < closestDist) {
        closestDist = groundT;
        targetPoint.set(
          camera.position.x + spreadDir.x * groundT,
          0.05,
          camera.position.z + spreadDir.z * groundT
        );
        hitObstacleNormal.set(0, 1, 0);
      }
    }

    // 3. Raycast against Practice Targets
    const targets = store.practiceTargets;
    for (const tgt of Object.values(targets)) {
      if (tgt.destroyed) continue;

      // Target bounding cylinder/box test (width 0.7m, height 1.8m)
      const dx = tgt.position[0] - camera.position.x;
      const dz = tgt.position[2] - camera.position.z;
      const projDist = dx * spreadDir.x + dz * spreadDir.z;

      if (projDist > 0 && projDist < closestDist) {
        const perpX = camera.position.x + spreadDir.x * projDist - tgt.position[0];
        const perpZ = camera.position.z + spreadDir.z * projDist - tgt.position[2];
        const distFromCenter = Math.hypot(perpX, perpZ);

        if (distFromCenter < 0.55) {
          const hitY = camera.position.y + spreadDir.y * projDist;
          if (hitY >= tgt.position[1] + 0.1 && hitY <= tgt.position[1] + 2.1) {
            closestDist = projDist;
            targetPoint.set(
              camera.position.x + spreadDir.x * projDist,
              hitY,
              camera.position.z + spreadDir.z * projDist
            );
            hitTargetId = tgt.id;
            // Check for headshot (top portion of target, y > 1.8m)
            isHeadshot = hitY > tgt.position[1] + 1.65;
            hitObstacleNormal.set(-spreadDir.x, 0, -spreadDir.z).normalize();
          }
        }
      }
    }

    // =========================================================================
    // STAGE 2: MUZZLE RAYCAST & OBSTACLE OCCLUSION CHECK
    // =========================================================================
    // Ensure the bullet path from the weapon muzzle to the target point is not blocked by a wall
    const muzzleToTarget = targetPoint.clone().sub(muzzleOrigin);
    const distToTarget = muzzleToTarget.length();
    const muzzleDir = muzzleToTarget.clone().normalize();

    // Check if an obstacle is right in front of the muzzle
    const muzzleObstacleHit = collisionWorld.raycast(
      muzzleOrigin.x,
      muzzleOrigin.y,
      muzzleOrigin.z,
      muzzleDir.x,
      muzzleDir.y,
      muzzleDir.z,
      distToTarget - 0.1
    );

    let finalImpactPoint = targetPoint.clone();
    let finalNormal = hitObstacleNormal.clone();
    let validTargetHit = hitTargetId;

    if (muzzleObstacleHit && muzzleObstacleHit.distance < distToTarget - 0.2) {
      // Wall blocked the shot between muzzle and target point!
      finalImpactPoint.set(...muzzleObstacleHit.point);
      finalNormal.set(...muzzleObstacleHit.normal);
      validTargetHit = null; // Target hit cancelled due to intervening cover
    }

    // Apply Damage if a valid practice target was struck
    if (validTargetHit) {
      const dmg = Math.round(def.damage * (isHeadshot ? def.headshotMultiplier : 1.0));
      store.damagePracticeTarget(validTargetHit, dmg, [finalImpactPoint.x, finalImpactPoint.y, finalImpactPoint.z], isHeadshot);
    } else {
      const hitObstacleId = muzzleObstacleHit?.boxId || (worldHit && worldHit.boxId);
      if (hitObstacleId && BUILDING_REGISTRY[hitObstacleId]) {
        const bConfig = BUILDING_REGISTRY[hitObstacleId];
        const dmg = calculateBulletDamage(def.id, bConfig.category);
        store.damageBuildingWithAmount(
          hitObstacleId,
          dmg,
          [finalImpactPoint.x, finalImpactPoint.y, finalImpactPoint.z],
          bConfig.nameEn,
          "bullet"
        );
      }
    }

    // Spawn High-Speed Visual Bullet Tracer Line
    const tracerVel = muzzleDir.clone().multiplyScalar(def.tracerSpeed);
    const flightTime = Math.min(0.65, finalImpactPoint.clone().sub(muzzleOrigin).length() / def.tracerSpeed);

    tracersRef.current.push({
      start: muzzleOrigin.clone(),
      end: finalImpactPoint.clone(),
      current: muzzleOrigin.clone(),
      vel: tracerVel,
      age: 0,
      maxAge: flightTime + 0.05,
      color: def.id === "sniper" ? "#EF4444" : def.id === "shotgun" ? "#F59E0B" : "#FBBF24",
    });

    // Spawn Impact Spark & Dust Burst at hit location
    impactsRef.current.push({
      pos: finalImpactPoint.clone().addScaledVector(finalNormal, 0.04),
      normal: finalNormal,
      age: 0,
      maxAge: 0.25,
      color: validTargetHit ? (isHeadshot ? "#EF4444" : "#F59E0B") : "#E2E8F0",
    });
  }
}
