"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/state/gameStore";
import { collisionWorld } from "@/game/physics/collisionSystem";
import { mobileInput } from "@/game/player/mobileInput";
import { audio } from "@/game/audio/audioManager";

// Shared recoil trigger ref callable from shooting system without store thrashing
export const cameraRecoilBridge = {
  vKick: 0,
  hKick: 0,
  applyRecoil(v: number, h: number) {
    this.vKick += v;
    this.hKick += (Math.random() - 0.5) * h * 2.0;
  },
};

// Camera facing published for DOM widgets (minimap) without per-frame store writes.
// yaw uses the same convention as playerHeading: forward = (sin yaw, cos yaw) on X/Z.
export const cameraTelemetry = { yaw: 0 };
const tmpCamDir = new THREE.Vector3();

/**
 * Advanced Third-Person Shooter Camera Controller
 * Inspired by PUBG Mobile & Free Fire:
 * - Responsive touch drag look with pitch clamping
 * - Dynamic shoulder-cam framing (Right shoulder offset for combat & ADS)
 * - Anti-clipping Camera Collision Resolver against world colliders
 * - Dynamic FOV zoom for Aim-Down-Sights (ADS)
 * - Camera recoil kick and smooth exponential recovery
 * - Integrated Jet Engine Loop audio manager bridge
 */
export function CameraController() {
  const cameraFocus = useGameStore((state) => state.cameraFocus);
  const playerHeading = useGameStore((state) => state.playerHeading);
  const cameraMode = useGameStore((state) => state.cameraMode);
  const ridingVehicle = useGameStore((state) => state.ridingVehicle);
  const movementState = useGameStore((state) => state.movementState);
  const vehicleSpeed = useGameStore((state) => state.vehicleSpeed);
  const isAfterburnerActive = useGameStore((state) => state.isAfterburnerActive);
  const currentWeaponId = useGameStore((state) => state.currentWeaponId);
  const isAiming = useGameStore((state) => state.isAiming);

  const { camera, gl } = useThree();

  const targetVec = useRef(new THREE.Vector3(...cameraFocus));
  const currentCamPos = useRef(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z));

  // User look angles (yaw relative to world, pitch from horizon)
  const orbitYaw = useRef(playerHeading || 0);
  const orbitPitch = useRef(0.22);
  const orbitDist = useRef(7.5);

  // Recoil offset accumulator
  const recoilPitch = useRef(0);
  const recoilYaw = useRef(0);

  // Jet sound state tracking
  const wasFlyingJet = useRef(false);

  // Desktop pointer dragging
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const dom = gl.domElement;

    const handlePointerLockChange = () => {
      useGameStore.getState().setIsPointerLocked(document.pointerLockElement === dom);
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Don't capture pointer if clicking on a UI control button
      if ((e.target as HTMLElement)?.closest("button, input, a, [data-touch-control]")) return;
      isDragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const sens = useGameStore.getState().cameraSensitivity;
      const currentSens = isAiming ? sens.adsLook : currentWeaponId ? sens.aimLook : sens.touchLook;

      // When Pointer Lock is active, mouse moves crosshair directly
      if (document.pointerLockElement === dom) {
        const dx = e.movementX;
        const dy = e.movementY;
        orbitYaw.current -= dx * currentSens * 0.75;
        orbitPitch.current = Math.max(-0.45, Math.min(1.25, orbitPitch.current + dy * currentSens * 0.75));
        return;
      }

      if (!isDragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };

      orbitYaw.current -= dx * currentSens;
      orbitPitch.current = Math.max(-0.45, Math.min(1.25, orbitPitch.current + dy * currentSens));
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!ridingVehicle) {
        orbitDist.current = Math.max(3.0, Math.min(16.0, orbitDist.current + e.deltaY * 0.012));
      }
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    dom.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    dom.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      dom.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      dom.removeEventListener("wheel", handleWheel);
      if (wasFlyingJet.current) {
        audio.stopJetEngine();
      }
    };
  }, [gl, isAiming, currentWeaponId, ridingVehicle]);

  useFrame((_, delta) => {
    const isCar = ridingVehicle === "supercar";
    const isPlane = ridingVehicle === "plane";

    // 1. Process Mobile Touch Drag Input
    const touchDelta = mobileInput.consumeLookDelta();
    if (touchDelta.dx !== 0 || touchDelta.dy !== 0) {
      const sens = useGameStore.getState().cameraSensitivity;
      const currentSens = isAiming ? sens.adsLook : currentWeaponId ? sens.aimLook : sens.touchLook;

      orbitYaw.current -= touchDelta.dx * currentSens;
      orbitPitch.current = Math.max(-0.45, Math.min(1.25, orbitPitch.current + touchDelta.dy * currentSens));
    }

    // 1b. Process Gamepad Right Stick Look (Computer USB / Bluetooth Controller)
    if (typeof navigator !== "undefined" && navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0] || gamepads[1];
      if (gp) {
        const deadzone = 0.15;
        const rx = Math.abs(gp.axes[2]) > deadzone ? gp.axes[2] : 0;
        const ry = Math.abs(gp.axes[3]) > deadzone ? gp.axes[3] : 0;
        if (rx !== 0 || ry !== 0) {
          const sens = useGameStore.getState().cameraSensitivity;
          const currentSens = isAiming ? sens.adsLook : currentWeaponId ? sens.aimLook : sens.touchLook;
          orbitYaw.current -= rx * currentSens * 420.0 * delta;
          orbitPitch.current = Math.max(-0.45, Math.min(1.25, orbitPitch.current + ry * currentSens * 420.0 * delta));
        }
      }
    }

    // 2. Process and Recover Weapon Recoil
    if (cameraRecoilBridge.vKick !== 0 || cameraRecoilBridge.hKick !== 0) {
      recoilPitch.current += cameraRecoilBridge.vKick;
      recoilYaw.current += cameraRecoilBridge.hKick;
      cameraRecoilBridge.vKick = 0;
      cameraRecoilBridge.hKick = 0;
    }
    // Smooth exponential recovery back to zero
    recoilPitch.current = THREE.MathUtils.damp(recoilPitch.current, 0, 10.0, delta);
    recoilYaw.current = THREE.MathUtils.damp(recoilYaw.current, 0, 12.0, delta);

    // 3. Jet Engine Audio Loop Synchronization
    if (isPlane) {
      if (!wasFlyingJet.current) {
        audio.startJetEngine();
        wasFlyingJet.current = true;
      }
      audio.updateJetEngine(vehicleSpeed || 0, isAfterburnerActive);
    } else if (wasFlyingJet.current) {
      audio.stopJetEngine();
      wasFlyingJet.current = false;
    }

    // 4. Smooth Target Position
    const desiredTargetY = cameraFocus[1] + (isPlane ? 1.8 : isCar ? 1.05 : ridingVehicle ? 1.4 : isAiming ? 1.35 : 1.25);
    const desiredTarget = new THREE.Vector3(cameraFocus[0], desiredTargetY, cameraFocus[2]);
    targetVec.current.lerp(desiredTarget, THREE.MathUtils.clamp(delta * (isAiming ? 14.0 : 7.5), 0, 1));

    if (cameraMode === "chase") {
      // 5. Dynamic Camera Distance, Height & Shoulder Offset
      let targetDist = 7.0;
      let targetHeight = 1.6;
      let targetShoulderOffset = 0.35; // Slight right-shoulder bias for third-person perspective
      let targetFov = 60;

      if (isPlane) {
        const speedPush = Math.min(10.0, (vehicleSpeed || 0) / 18.0);
        targetDist = Math.max(orbitDist.current, 19.5) + speedPush;
        targetHeight = 4.2;
        targetShoulderOffset = 0;
        targetFov = isAfterburnerActive ? 68 : 62;
      } else if (isCar) {
        const speedPush = Math.min(5.5, (vehicleSpeed || 0) / 22.0);
        targetDist = Math.max(orbitDist.current, 13.5) + speedPush;
        targetHeight = 1.6;
        targetShoulderOffset = 0;
        targetFov = 62;
      } else if (ridingVehicle) {
        targetDist = Math.max(orbitDist.current, 11.0);
        targetHeight = 1.9;
        targetShoulderOffset = 0;
      } else if (isAiming) {
        // Aim-Down-Sights (ADS Scope Mode)
        targetDist = currentWeaponId === "sniper" ? 2.0 : 2.5;
        targetHeight = 1.4;
        targetShoulderOffset = 0.75; // Close over-the-right-shoulder framing
        targetFov = currentWeaponId === "sniper" ? 26 : currentWeaponId === "m416" ? 42 : 50;
      } else if (currentWeaponId) {
        // Combat Hip-Fire Stance
        const sprintPush = movementState === "sprinting" ? 1.2 : 0;
        targetDist = 4.5 + sprintPush;
        targetHeight = 1.5;
        targetShoulderOffset = 0.82; // PUBG combat shoulder camera
        targetFov = 60;
      } else {
        // Normal Exploration Mode
        const sprintPush = movementState === "sprinting" ? 1.5 : 0;
        targetDist = orbitDist.current + sprintPush;
        targetHeight = 1.65;
        targetShoulderOffset = 0.45;
        targetFov = movementState === "sprinting" ? 64 : 60;
      }

      // Smooth FOV interpolation
      const persCam = camera as THREE.PerspectiveCamera;
      if (persCam.isPerspectiveCamera && Math.abs(persCam.fov - targetFov) > 0.05) {
        persCam.fov = THREE.MathUtils.damp(persCam.fov, targetFov, isAiming ? 14.0 : 8.0, delta);
        persCam.updateProjectionMatrix();
      }

      // Total look angles with recoil applied
      const totalYaw = (ridingVehicle ? playerHeading + orbitYaw.current : orbitYaw.current) + recoilYaw.current;
      const totalPitch = Math.max(-0.45, Math.min(1.22, orbitPitch.current + recoilPitch.current));

      // Compute camera position relative to target
      const forwardX = Math.sin(totalYaw);
      const forwardZ = Math.cos(totalYaw);
      // Perpendicular right vector for shoulder offset
      const rightX = -forwardZ;
      const rightZ = forwardX;

      const horizDist = targetDist * Math.cos(totalPitch);
      const rawCamX = targetVec.current.x - forwardX * horizDist + rightX * targetShoulderOffset;
      const rawCamY = targetVec.current.y + targetDist * Math.sin(totalPitch) + targetHeight;
      const rawCamZ = targetVec.current.z - forwardZ * horizDist + rightZ * targetShoulderOffset;

      // 6. Camera Collision Resolver (Anti-Wall-Clipping)
      // Checks line from player target to camera and slides camera in front of obstacles
      let finalCamX = rawCamX;
      let finalCamY = rawCamY;
      let finalCamZ = rawCamZ;

      if (!isPlane) {
        const resolved = collisionWorld.resolveCameraObstacle(
          targetVec.current.x,
          targetVec.current.y,
          targetVec.current.z,
          rawCamX,
          rawCamY,
          rawCamZ,
          0.38
        );
        finalCamX = resolved.x;
        finalCamY = resolved.y;
        finalCamZ = resolved.z;
      }

      const desiredCamPos = new THREE.Vector3(finalCamX, finalCamY, finalCamZ);
      const followSpeed = isAiming ? 18.0 : isPlane ? 6.5 : isCar ? 7.2 : 9.5;
      currentCamPos.current.lerp(desiredCamPos, THREE.MathUtils.clamp(delta * followSpeed, 0, 1));
      camera.position.copy(currentCamPos.current);

      // 7. Dynamic Camera Look-At Projection
      // In combat/ADS, center the crosshair perfectly along the camera aim vector
      const aimDist = isAiming ? 45.0 : currentWeaponId ? 25.0 : 8.0;
      const lookAtPoint = new THREE.Vector3(
        targetVec.current.x + forwardX * aimDist + rightX * (isAiming ? 0.35 : 0.4),
        targetVec.current.y - Math.sin(totalPitch) * aimDist * 0.45,
        targetVec.current.z + forwardZ * aimDist + rightZ * (isAiming ? 0.35 : 0.4)
      );

      camera.lookAt(lookAtPoint);
    } else {
      // Top Isometric Camera Mode
      const isoDist = 32;
      const desiredCamPos = new THREE.Vector3(
        targetVec.current.x + isoDist * 0.7,
        targetVec.current.y + 26,
        targetVec.current.z + isoDist * 0.7
      );
      currentCamPos.current.lerp(desiredCamPos, THREE.MathUtils.clamp(delta * 3.5, 0, 1));
      camera.position.copy(currentCamPos.current);
      camera.lookAt(targetVec.current);
    }

    camera.getWorldDirection(tmpCamDir);
    cameraTelemetry.yaw = Math.atan2(tmpCamDir.x, tmpCamDir.z);

    // 8. Screenshake feedback on detonations
    const currentShake = useGameStore.getState().cameraShake;
    if (currentShake > 0.005) {
      const shakeMag = currentShake * (isPlane ? 0.8 : 0.5);
      const offsetX = (Math.random() - 0.5) * shakeMag;
      const offsetY = (Math.random() - 0.5) * shakeMag;
      const offsetZ = (Math.random() - 0.5) * shakeMag;
      camera.position.add(new THREE.Vector3(offsetX, offsetY, offsetZ));
      // Decaying without setting store every frame
      useGameStore.setState({ cameraShake: Math.max(0, currentShake - delta * 3.5) });
    }
  });

  return null;
}
