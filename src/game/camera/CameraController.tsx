"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/state/gameStore";

export function CameraController() {
  const cameraFocus = useGameStore((state) => state.cameraFocus);
  const playerHeading = useGameStore((state) => state.playerHeading);
  const cameraMode = useGameStore((state) => state.cameraMode);
  const ridingVehicle = useGameStore((state) => state.ridingVehicle);
  const movementState = useGameStore((state) => state.movementState);

  const { camera, gl } = useThree();

  const vehicleSpeed = useGameStore((state) => state.vehicleSpeed);

  const targetVec = useRef(new THREE.Vector3(...cameraFocus));
  const currentCamPos = useRef(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z));

  // User mouse look offsets
  const orbitYaw = useRef(0);
  const orbitPitch = useRef(0.25);
  const orbitDist = useRef(ridingVehicle === "supercar" ? 13.5 : ridingVehicle ? 12 : 8.5);
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const dom = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      // Don't capture if clicking a UI button
      if ((e.target as HTMLElement)?.closest("button, input, a")) return;
      isDragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };

      orbitYaw.current -= dx * 0.005;
      orbitPitch.current = Math.max(0.08, Math.min(1.2, orbitPitch.current + dy * 0.004));
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      orbitDist.current = Math.max(4.0, Math.min(32.0, orbitDist.current + e.deltaY * 0.015));
    };

    dom.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    dom.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      dom.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      dom.removeEventListener("wheel", handleWheel);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const isCar = ridingVehicle === "supercar";
    // Target position at player's chest/cockpit level
    const desiredTarget = new THREE.Vector3(
      cameraFocus[0],
      cameraFocus[1] + (isCar ? 1.05 : ridingVehicle ? 1.4 : 1.2),
      cameraFocus[2]
    );
    targetVec.current.lerp(desiredTarget, THREE.MathUtils.clamp(delta * 4.8, 0, 1));

    if (cameraMode === "chase") {
      // GTA V / PUBG Dynamic Third-Person Chase Camera:
      const totalYaw = playerHeading + orbitYaw.current;
      const sprintPush = movementState === "sprinting" ? 1.6 : 0;
      const speedPush = isCar ? Math.min(5.2, (vehicleSpeed || 0) / 22.0) : 0;
      const baseDist = isCar
        ? Math.max(orbitDist.current, 13.5)
        : ridingVehicle
        ? Math.max(orbitDist.current, 11.5)
        : orbitDist.current;
      const dist = baseDist + sprintPush + speedPush;
      const pitch = orbitPitch.current;

      // Position camera behind character/vehicle look direction
      const camX = targetVec.current.x - Math.sin(totalYaw) * (dist * Math.cos(pitch));
      const camY = targetVec.current.y + dist * Math.sin(pitch) + (isCar ? 1.4 : ridingVehicle ? 1.8 : 1.2);
      const camZ = targetVec.current.z - Math.cos(totalYaw) * (dist * Math.cos(pitch));

      const desiredCamPos = new THREE.Vector3(camX, camY, camZ);
      currentCamPos.current.lerp(desiredCamPos, THREE.MathUtils.clamp(delta * (isCar ? 5.2 : 4.2), 0, 1));
      camera.position.copy(currentCamPos.current);

      // Look ahead of vehicle with dynamic speed projection
      const lookAheadDist = isCar ? 3.0 + (vehicleSpeed / 28.0) : 1.5;
      const lookAhead = new THREE.Vector3(
        targetVec.current.x + Math.sin(totalYaw) * lookAheadDist,
        targetVec.current.y + 0.3,
        targetVec.current.z + Math.cos(totalYaw) * lookAheadDist
      );
      camera.lookAt(lookAhead);
    } else {
      // Top Isometric Camera
      const isoDist = 32;
      const desiredCamPos = new THREE.Vector3(
        targetVec.current.x + isoDist * 0.7,
        targetVec.current.y + 26,
        targetVec.current.z + isoDist * 0.7
      );
      currentCamPos.current.lerp(desiredCamPos, THREE.MathUtils.clamp(delta * 3.0, 0, 1));
      camera.position.copy(currentCamPos.current);
      camera.lookAt(targetVec.current);
    }
  });

  return null;
}
