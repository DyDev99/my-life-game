"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/state/gameStore";
import { LOCATION_COORDINATES, type LocationKey } from "@/data/locations";
import { CHARACTERS, type CharacterId } from "@/data/characters";
import { movementFactor } from "@/state/rules/combat";

// Fighter controls are only active for characters with `canFight` (e.g. Maiko).
function canFightNow() {
  const st = useGameStore.getState();
  return !!CHARACTERS[st.player.avatar as CharacterId]?.canFight && !st.ridingVehicle && !st.activeModal;
}

function isNearSportsBall() {
  const [x, , z] = useGameStore.getState().targetPos;
  return Math.hypot(x - -26, z - 95) < 3.0 || Math.hypot(x - 26, z - 92) < 3.0;
}
import { audio } from "@/game/audio/audioManager";
import { collisionWorld } from "@/game/physics/collisionSystem";

// Static spawn coordinates of motorcycles & bicycles in Kampong Cham
const MOTORBIKE_SPAWN: [number, number, number] = [8, 0, -14.2];
const BICYCLE_SPAWN: [number, number, number] = [-3.5, 0, -12.5];

export function PlayerController() {
  const activeModal = useGameStore((state) => state.activeModal);
  const openModal = useGameStore((state) => state.openModal);
  const closeModal = useGameStore((state) => state.closeModal);
  const moveToLocation = useGameStore((state) => state.moveToLocation);
  const enterLocation = useGameStore((state) => state.enterLocation);
  const setLanguage = useGameStore((state) => state.setLanguage);
  const language = useGameStore((state) => state.language);

  const ridingVehicle = useGameStore((state) => state.ridingVehicle);
  const mountVehicle = useGameStore((state) => state.mountVehicle);
  const dismountVehicle = useGameStore((state) => state.dismountVehicle);
  const setNearVehicle = useGameStore((state) => state.setNearVehicle);
  const setNearLocation = useGameStore((state) => state.setNearLocation);
  const setVehicleSpeed = useGameStore((state) => state.setVehicleSpeed);

  const { camera } = useThree();

  const keys = useRef<{ [key: string]: boolean }>({});
  const currentHeading = useRef<number>(Math.PI); // Facing forward along road
  const currentSpeed = useRef<number>(0);
  const vehicleAngle = useRef<number>(Math.PI / 2); // Initial yaw for vehicle
  const tireScreechCooldown = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      keys.current[e.key.toLowerCase()] = true;
      keys.current[e.code] = true;

      // Fighter controls: J punch combo, K hook, Q (hold) guard, R dodge, Space jump, X crouch, V victory
      if (canFightNow()) {
        const k = e.key.toLowerCase();
        const combat = useGameStore.getState();
        const fighterKey = ["j", "k", "q", "r", "x", "v"].includes(k) || (e.key === " " && !isNearSportsBall());
        if (fighterKey) {
          e.preventDefault();
          if (e.repeat) return;
          if (k === "j") combat.performCombatMove("punch");
          else if (k === "k") combat.performCombatMove("hook");
          else if (k === "q") combat.setGuard(true);
          else if (k === "r") combat.performCombatMove("dodge");
          else if (k === "x") combat.toggleCrouch();
          else if (k === "v") combat.performCombatMove("victory");
          else if (e.key === " ") combat.performCombatMove("jump");
          return;
        }
      }

      // Handle hotkeys
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "c" || e.key === "C") {
        // Toggle Character Switcher Modal
        if (activeModal === "character_select") {
          closeModal();
        } else {
          openModal("character_select");
        }
      } else if (e.key === "f" || e.key === "F") {
        // Toggle Mount / Dismount Vehicle
        const state = useGameStore.getState();
        if (state.ridingVehicle) {
          currentHeading.current = vehicleAngle.current;
          // Step player out to the driver's side of the vehicle
          if (state.ridingVehicle === "supercar") {
            const exitX = state.targetPos[0] - Math.cos(vehicleAngle.current) * 1.6;
            const exitZ = state.targetPos[2] + Math.sin(vehicleAngle.current) * 1.6;
            useGameStore.setState({ targetPos: [exitX, 0, exitZ], cameraFocus: [exitX, 0, exitZ] });
          }
          dismountVehicle();
        } else if (state.nearVehicle) {
          vehicleAngle.current = currentHeading.current;
          mountVehicle(state.nearVehicle);
        }
      } else if (e.key === "h" || e.key === "H") {
        // Honk vehicle horn
        audio.playHorn();
      } else if (e.key === "e" || e.key === "E") {
        // Enter nearby vehicle, building or open decision
        const state = useGameStore.getState();
        const currX = state.targetPos[0];
        const currZ = state.targetPos[2];

        // 1. Check distance to player house front door at [-14, 0, -16.6]
        const distToHomeDoor = Math.hypot(currX - (-14), currZ - (-16.6));
        // 2. Check distance to player house bed inside at [-16.2, 0, -21.4]
        const distToHomeBed = Math.hypot(currX - (-16.2), currZ - (-21.4));
        // 3. Check distance to Sports Locker Room Door at [6, 0, 82]
        const distToLockerRoom = Math.hypot(currX - 6, currZ - 82);
        // 4. Check distance to Coconut Water stall at [24.5, 0, 80.5]
        const distToCoconut = Math.hypot(currX - 24.5, currZ - 80.5);
        // 5. Check distance to Sports Noodle stall at [11.5, 0, 80.5]
        const distToNoodles = Math.hypot(currX - 11.5, currZ - 80.5);
        // 6. Check distance to Football Ball at [-26, 0, 95]
        const distToFootball = Math.hypot(currX - (-26), currZ - 95);
        // 7. Check distance to Volleyball at [26, 0, 92]
        const distToVolleyball = Math.hypot(currX - 26, currZ - 92);

        if (state.ridingVehicle) {
          currentHeading.current = vehicleAngle.current;
          if (state.ridingVehicle === "supercar") {
            const exitX = state.targetPos[0] - Math.cos(vehicleAngle.current) * 1.6;
            const exitZ = state.targetPos[2] + Math.sin(vehicleAngle.current) * 1.6;
            useGameStore.setState({ targetPos: [exitX, 0, exitZ], cameraFocus: [exitX, 0, exitZ] });
          }
          dismountVehicle();
        } else if (state.nearVehicle) {
          vehicleAngle.current = currentHeading.current;
          mountVehicle(state.nearVehicle);
        } else if (distToHomeDoor < 3.8) {
          // Open or Close the House Door on [E]
          state.togglePlayerHomeDoor();
        } else if (distToHomeBed < 2.5) {
          // Rest or sleep inside home
          enterLocation("home");
        } else if (distToLockerRoom < 4.2) {
          // Enter sports locker room & clubhouse
          openModal("locker_room");
        } else if (distToCoconut < 3.2) {
          // Drink fresh coconut water
          state.drinkCoconutWater();
        } else if (distToNoodles < 3.2) {
          // Eat sports noodles
          state.eatSportsSnack();
        } else if (distToFootball < 3.0 || distToVolleyball < 3.0) {
          // Ball kicking / spiking handled by ball listeners - avoid popup
        } else if (state.nearLocation) {
          enterLocation(state.nearLocation);
        } else if (!activeModal) {
          openModal("decision");
        }
      } else if (e.key === "h" || e.key === "H" || e.key === "b" || e.key === "B") {
        const state = useGameStore.getState();
        if (state.ridingVehicle) {
          state.ringVehicleHornOrBell();
        }
      } else if (e.key === " " && !ridingVehicle) {
        // Space to kick ball if near ball, or open decision if idle
        const state = useGameStore.getState();
        const currX = state.targetPos[0];
        const currZ = state.targetPos[2];
        const distToFootball = Math.hypot(currX - (-26), currZ - 95);
        const distToVolleyball = Math.hypot(currX - 26, currZ - 92);
        if (distToFootball >= 3.0 && distToVolleyball >= 3.0 && !activeModal) {
          openModal("decision");
        }
      } else if (e.key === "p" || e.key === "P" || e.key === "m" || e.key === "M") {
        if (activeModal === "phone") {
          closeModal();
        } else {
          openModal("phone");
        }
      } else if (e.key === "1") {
        moveToLocation("home");
      } else if (e.key === "2") {
        moveToLocation("school");
      } else if (e.key === "3") {
        moveToLocation("market");
      } else if (e.key === "4") {
        moveToLocation("cafe");
      } else if (e.key === "5") {
        moveToLocation("pagoda");
      } else if (e.key === "6") {
        moveToLocation("hotel");
      } else if (e.key === "7") {
        moveToLocation("stadium");
      } else if (e.key === "8") {
        moveToLocation("volleyball");
      } else if (e.key === "l" || e.key === "L") {
        setLanguage(language === "en" ? "km" : "en");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
      keys.current[e.code] = false;
      if (e.key.toLowerCase() === "q") useGameStore.getState().setGuard(false);
    };
    // Release held guard if the window loses focus mid-press
    const handleBlur = () => useGameStore.getState().setGuard(false);
    window.addEventListener("blur", handleBlur);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    activeModal,
    closeModal,
    openModal,
    moveToLocation,
    enterLocation,
    language,
    setLanguage,
    ridingVehicle,
    mountVehicle,
    dismountVehicle,
  ]);

  // Check proximity to vehicles and landmarks
  function checkProximity(pos: [number, number, number]) {
    const state = useGameStore.getState();

    // 1. Supercar Proximity (Check proximity to driver's side door at supercarPos)
    const supercarPos = state.supercarPos;
    const distSupercar = Math.hypot(pos[0] - supercarPos[0], pos[2] - supercarPos[2]);

    // 2. Motorbike & Bicycle Proximity
    const distMoto = Math.hypot(pos[0] - MOTORBIKE_SPAWN[0], pos[2] - MOTORBIKE_SPAWN[2]);
    const distBike = Math.hypot(pos[0] - BICYCLE_SPAWN[0], pos[2] - BICYCLE_SPAWN[2]);

    if (distSupercar < 4.2) {
      setNearVehicle("supercar");
    } else if (distMoto < 4.5) {
      setNearVehicle("motorbike");
    } else if (distBike < 4.5) {
      setNearVehicle("bicycle");
    } else {
      setNearVehicle(null);
    }

    // 3. Landmark / Building Entrance Proximity
    let closestLoc: LocationKey | null = null;
    let closestDist = 7.5;

    for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
      const dist = Math.hypot(pos[0] - coords[0], pos[2] - coords[2]);
      if (dist < closestDist) {
        closestDist = dist;
        closestLoc = key as LocationKey;
      }
    }
    setNearLocation(closestLoc);
  }

  // Frame update for movement (on-foot camera-relative or vehicle driving)
  useFrame((_, delta) => {
    if (activeModal) return;

    const k = keys.current;
    const playerTarget = useGameStore.getState().targetPos;

    // =========================================================================
    // 1. VEHICLE DRIVING MODE (SUPERCAR, MOTORBIKE, BICYCLE)
    // =========================================================================
    if (ridingVehicle) {
      const isCar = ridingVehicle === "supercar";
      const isMoto = ridingVehicle === "motorbike";

      // Authentic physics tuning
      const maxForward = isCar ? 135 : isMoto ? 52 : 22; // km/h
      const maxReverse = isCar ? -24 : isMoto ? -14 : -7;
      const accelRate = isCar ? 46 : isMoto ? 32 : 16;
      const brakeRate = isCar ? 62 : isMoto ? 42 : 28;
      const turnRate = isCar ? 2.3 : isMoto ? 2.5 : 2.9;

      const throttle = k["w"] || k["arrowup"];
      const reverse = k["s"] || k["arrowdown"];
      const handbrake = k[" "];
      const steerLeft = k["a"] || k["arrowleft"];
      const steerRight = k["d"] || k["arrowright"];

      // Speed-dependent turning sensitivity (GTA V handling feel)
      const absSpeed = Math.abs(currentSpeed.current);
      const speedSteerFactor =
        absSpeed < 0.2
          ? throttle || reverse
            ? 0.75
            : 0.35
          : Math.min(1.2, 0.45 + absSpeed / (isCar ? 24.0 : 12.0));
      const turnDir = currentSpeed.current < -0.2 ? -1 : 1;
      const effectiveTurn = turnRate * speedSteerFactor * turnDir;

      if (steerLeft) {
        vehicleAngle.current -= effectiveTurn * delta;
      }
      if (steerRight) {
        vehicleAngle.current += effectiveTurn * delta;
      }

      // Acceleration / Braking
      if (handbrake) {
        currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, 0, delta * (isCar ? 14 : 12));
        if (isCar && absSpeed > 18 && performance.now() - tireScreechCooldown.current > 420) {
          audio.playTireScreech();
          tireScreechCooldown.current = performance.now();
        }
      } else if (throttle) {
        currentSpeed.current = Math.min(
          maxForward,
          currentSpeed.current + accelRate * delta
        );
      } else if (reverse) {
        currentSpeed.current = Math.max(
          maxReverse,
          currentSpeed.current - brakeRate * delta
        );
      } else {
        // Natural coasting deceleration
        currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, 0, delta * (isCar ? 1.8 : 2.8));
      }

      // Convert speed (km/h) to world displacement (meters/sec)
      const worldSpeed = (currentSpeed.current / 3.6) * delta * (isCar ? 1.6 : 1.5);
      const forwardX = Math.sin(vehicleAngle.current) * worldSpeed;
      const forwardZ = Math.cos(vehicleAngle.current) * worldSpeed;

      // Expanded open world bounds (including Sports City: X [-75, 75], Z [-58, 125])
      const rawNextX = Math.max(-75, Math.min(75, playerTarget[0] + forwardX));
      const rawNextZ = Math.max(-58, Math.min(125, playerTarget[2] + forwardZ));

      // Resolve solid collision against world buildings & obstacles
      const resolved = collisionWorld.resolveVehicle(
        playerTarget[0],
        playerTarget[2],
        rawNextX,
        rawNextZ,
        isCar ? 1.4 : 0.85
      );

      const nextX = resolved.x;
      const nextZ = resolved.z;
      if (resolved.collided) {
        currentSpeed.current *= 0.55; // absorb impact energy
      }

      useGameStore.setState({
        targetPos: [nextX, playerTarget[1], nextZ],
        cameraFocus: [nextX, playerTarget[1], nextZ],
        playerHeading: vehicleAngle.current,
        vehicleSpeed: Math.round(Math.abs(currentSpeed.current)),
      });

      // Update parked supercar location while driving
      if (isCar) {
        useGameStore.setState({
          supercarPos: [nextX, playerTarget[1], nextZ],
          supercarHeading: vehicleAngle.current,
        });
      }

      useGameStore.getState().setMovementState("riding", Math.abs(currentSpeed.current));
      checkProximity([nextX, 0, nextZ]);
      return;
    }

    // =========================================================================
    // 2. ON-FOOT 3RD-PERSON CAMERA-RELATIVE MOVEMENT (PUBG / GTA Solid Navigation)
    // =========================================================================
    const up = k["w"] || k["arrowup"];
    const down = k["s"] || k["arrowdown"];
    const left = k["a"] || k["arrowleft"];
    const right = k["d"] || k["arrowright"];
    const sprint = k["shift"] || k["shiftleft"] || k["shiftright"];

    // Compute camera's ground facing direction (XZ plane)
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);
    camDir.y = 0;
    if (camDir.lengthSq() > 0.001) {
      camDir.normalize();
    } else {
      camDir.set(0, 0, -1);
    }
    // Perpendicular right vector
    const camRight = new THREE.Vector3(-camDir.z, 0, camDir.x).normalize();

    // Input direction in camera space
    let inputForward = 0;
    let inputRight = 0;
    if (up) inputForward += 1;
    if (down) inputForward -= 1;
    if (right) inputRight += 1;
    if (left) inputRight -= 1;

    const hasInput = inputForward !== 0 || inputRight !== 0;

    const moveDir = new THREE.Vector3();
    if (hasInput) {
      moveDir.addScaledVector(camDir, inputForward);
      moveDir.addScaledVector(camRight, inputRight);
      moveDir.normalize();

      // Smoothly rotate character toward movement direction (shortest arc)
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      let angleDiff = targetAngle - currentHeading.current;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      currentHeading.current += angleDiff * Math.min(1, delta * 15.0);
    }

    // Target locomotion speed (0 for idle, 5.2 m/s for walk/jog, 11.5 m/s for sprint)
    const combat = useGameStore.getState().combat;
    const fighterFactor = movementFactor(combat.move, combat.guarding, combat.crouching);
    const targetSpeed = (hasInput ? (sprint ? 11.5 : 5.2) : 0) * fighterFactor;
    // Smooth acceleration & deceleration damping
    const accelDamp = hasInput ? 12.0 : 9.0;
    currentSpeed.current = THREE.MathUtils.damp(currentSpeed.current, targetSpeed, accelDamp, delta);

    if (currentSpeed.current > 0.05) {
      const step = currentSpeed.current * delta;
      const moveX = Math.sin(currentHeading.current) * step;
      const moveZ = Math.cos(currentHeading.current) * step;

      // Expanded world boundary limits (including Sports City: X [-75, 75], Z [-58, 125])
      const rawNextX = Math.max(-75, Math.min(75, playerTarget[0] + moveX));
      const rawNextZ = Math.max(-58, Math.min(125, playerTarget[2] + moveZ));

      // Resolve solid world collision & wall sliding!
      const resolved = collisionWorld.resolvePlayer(
        playerTarget[0],
        playerTarget[2],
        rawNextX,
        rawNextZ,
        0.45
      );

      const nextX = resolved.x;
      const nextZ = resolved.z;

      useGameStore.setState({
        targetPos: [nextX, playerTarget[1], nextZ],
        cameraFocus: [nextX, playerTarget[1], nextZ],
        playerHeading: currentHeading.current,
      });

      checkProximity([nextX, 0, nextZ]);
    } else {
      checkProximity(playerTarget);
    }

    // Determine locomotion state for animation blending
    let state: "idle" | "walking" | "running" | "sprinting" = "idle";
    if (currentSpeed.current > 7.5) {
      state = "sprinting";
    } else if (currentSpeed.current > 1.8) {
      state = "running";
    } else if (currentSpeed.current > 0.1) {
      state = "walking";
    }
    useGameStore.getState().setMovementState(state, currentSpeed.current);
  });

  return null;
}
