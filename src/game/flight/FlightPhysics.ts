import * as THREE from "three";
import { FlightInputState } from "./FlightInputSystem";
import { collisionWorld } from "@/game/physics/collisionSystem";
import { BUILDING_REGISTRY, calculateVehicleImpactDamage } from "@/game/physics/buildingDestruction";
import { useGameStore } from "@/state/gameStore";
import { audio } from "@/game/audio/audioManager";

export interface FlightPhysicsState {
  x: number;
  y: number;
  z: number;
  heading: number;     // Yaw angle (radians)
  pitch: number;       // Pitch angle (radians, positive = nose up)
  roll: number;        // Roll angle (radians, positive = bank right)
  speed: number;       // Airspeed in km/h
  altitude: number;    // Altitude in meters
  climbRate: number;   // m/s
  isStalling: boolean;
  isAfterburner: boolean;
  isAirbrake: boolean;
}

export class FlightPhysicsModel {
  // Current internal state
  public x: number = 42;
  public y: number = 0;
  public z: number = 22;
  public heading: number = Math.PI;
  public pitch: number = 0;
  public roll: number = 0;
  public speed: number = 0;

  // Smoothing rates
  private rollVelocity: number = 0;
  private pitchVelocity: number = 0;
  private yawVelocity: number = 0;

  // Cooldowns
  private crashCooldown: number = 0;

  public setState(x: number, y: number, z: number, heading: number, speed: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.heading = heading;
    this.pitch = 0;
    this.roll = 0;
    this.speed = speed;
    this.rollVelocity = 0;
    this.pitchVelocity = 0;
    this.yawVelocity = 0;
  }

  public update(
    delta: number,
    input: FlightInputState,
    options: {
      flightAssist: boolean;
      flightSensitivity: number;
    }
  ): FlightPhysicsState {
    const dt = Math.min(0.1, Math.max(0.001, delta));
    const now = performance.now();

    // 1. Ground vs Airborne Detection
    const isGround = this.y <= 0.35;
    const isBoost = input.boost;
    const isAirbrake = input.airbrake;

    // 2. Throttle, Target Speed & Speed Envelope
    let targetSpeed = 0;
    if (isGround) {
      // On the runway/ground: default is 0 km/h (idle/brakes) until player applies throttle
      if (isBoost) {
        targetSpeed = 480;
      } else if (input.throttle > 0.05) {
        targetSpeed = 80 + input.throttle * 240; // 80 - 320 km/h takeoff roll
      } else if (isAirbrake) {
        targetSpeed = 0; // Wheel brakes applied
      } else {
        targetSpeed = 0; // Coasting to standstill
      }
    } else {
      // Airborne cruise speed envelope
      if (isBoost) {
        targetSpeed = 520; // Full military afterburner
      } else if (isAirbrake) {
        targetSpeed = 110; // Airbrake deceleration
      } else {
        // Smooth cruise governed by throttle (160 to 420 km/h)
        targetSpeed = 160 + input.throttle * 260;
      }
      // Gravity pitch effect: diving accelerates; climbing bleeds speed
      targetSpeed += -Math.sin(this.pitch) * 65.0;
    }

    // Acceleration & Braking rates
    const accelRate = isBoost ? 140 : isAirbrake ? 160 : isGround ? (input.throttle > 0.05 ? 70 : 90) : 75;
    this.speed = THREE.MathUtils.damp(this.speed, targetSpeed, accelRate * 0.05, dt);
    this.speed = Math.max(0, Math.min(540, this.speed));

    // 3. Stall Physics
    const isStalling = !isGround && this.speed < 85;

    // 4. Roll / Banking Aerodynamics
    if (isGround) {
      // On runway landing gear: wings stay level
      this.roll = THREE.MathUtils.damp(this.roll, 0, 16.0, dt);
      this.rollVelocity = 0;
    } else {
      const maxRollRate = 3.2 * options.flightSensitivity;
      const targetRollVel = input.roll * maxRollRate;
      this.rollVelocity = THREE.MathUtils.damp(this.rollVelocity, targetRollVel, 14.0, dt);
      this.roll += this.rollVelocity * dt;

      // Auto-leveling wings (Flight Assist) when roll input is released
      if (options.flightAssist && Math.abs(input.roll) < 0.08) {
        this.roll = THREE.MathUtils.damp(this.roll, 0, 4.2, dt);
      }
      this.roll = Math.max(-1.45, Math.min(1.45, this.roll));
    }

    // 5. Pitch Dynamics (Nose up / down)
    const maxPitchRate = 2.4 * options.flightSensitivity;
    let targetPitchVel = input.pitch * maxPitchRate;

    if (isGround) {
      // On ground: cannot pitch nose down into tarmac
      if (input.pitch < 0) targetPitchVel = 0;
      // Nose rotation (takeoff pull) requires minimum airspeed (Vr ~ 110 km/h)
      if (this.speed < 110 && input.pitch > 0) {
        targetPitchVel = 0;
      }
    } else if (isStalling) {
      targetPitchVel = -0.55;
    }

    this.pitchVelocity = THREE.MathUtils.damp(this.pitchVelocity, targetPitchVel, 12.0, dt);
    this.pitch += this.pitchVelocity * dt;
    if (isGround) {
      this.pitch = Math.max(0, Math.min(0.42, this.pitch));
    } else {
      this.pitch = Math.max(-1.13, Math.min(1.13, this.pitch));
    }

    // 6. Heading & Ground Steering
    if (isGround) {
      // On ground: rudder / stick steers front nose wheel
      const groundSteer = (input.yaw !== 0 ? input.yaw : input.roll) * 1.5;
      const rollFactor = Math.min(1.0, this.speed / 35.0);
      this.heading += groundSteer * rollFactor * dt;
      this.yawVelocity = 0;
    } else {
      const speedFactor = Math.min(1.4, Math.max(0.3, this.speed / 200.0));
      const bankTurnRate = -Math.sin(this.roll) * 1.85 * speedFactor;
      const rudderRate = input.yaw * 1.15;
      const totalYawRate = bankTurnRate + rudderRate;
      this.yawVelocity = THREE.MathUtils.damp(this.yawVelocity, totalYawRate, 14.0, dt);
      this.heading += this.yawVelocity * dt;
    }

    // Normalize heading to [-PI, PI]
    while (this.heading > Math.PI) this.heading -= Math.PI * 2;
    while (this.heading < -Math.PI) this.heading += Math.PI * 2;

    // 7. 3D Velocity & Position Updates
    const worldSpeed = (this.speed / 3.6);
    const horizSpeed = worldSpeed * Math.cos(this.pitch);
    const forwardX = Math.sin(this.heading) * horizSpeed * dt * 1.6;
    const forwardZ = Math.cos(this.heading) * horizSpeed * dt * 1.6;

    // Vertical climb/dive velocity
    let climbRate = 0;
    if (isGround) {
      // Requires speed > 130 km/h AND nose pitch up to lift off
      if (this.speed > 130 && this.pitch > 0.06) {
        climbRate = Math.sin(this.pitch) * worldSpeed * 0.85;
      } else {
        climbRate = 0;
      }
    } else {
      climbRate = Math.sin(this.pitch) * worldSpeed * 0.72;
      if (isStalling) {
        climbRate -= 6.5; // Stall sinking
      }
    }

    let nextY = this.y + climbRate * dt;
    if (nextY <= 0.15) {
      nextY = 0.15;
      this.pitch = Math.max(0, this.pitch);
    }
    nextY = Math.min(125.0, nextY);

    // Airspace boundaries (wide perimeter around city & Mekong river)
    const MIN_X = -135;
    const MAX_X = 135;
    const MIN_Z = -135;
    const MAX_Z = 295; // Allow full southern airfield airspace

    let nextX = THREE.MathUtils.clamp(this.x + forwardX, MIN_X, MAX_X);
    let nextZ = THREE.MathUtils.clamp(this.z + forwardZ, MIN_Z, MAX_Z);

    // 7. Low-Altitude Collision Solver
    if (nextY <= 24.0) {
      const sweep = collisionWorld.resolveVehicle(
        this.x,
        this.z,
        nextX,
        nextZ,
        2.4 // Wingspan radius
      );
      nextX = sweep.x;
      nextZ = sweep.z;

      if (sweep.collided && now - this.crashCooldown > 450) {
        this.crashCooldown = now;
        const impactSpeed = this.speed;

        // Damage hit building
        if (sweep.hitObstacleId && impactSpeed > 60) {
          const bConfig = BUILDING_REGISTRY[sweep.hitObstacleId];
          const category = bConfig?.category || "concrete";
          const dmg = calculateVehicleImpactDamage("plane", impactSpeed, category);
          if (dmg > 0) {
            useGameStore.getState().damageBuildingWithAmount(
              sweep.hitObstacleId,
              dmg,
              [nextX, nextY, nextZ],
              sweep.hitObstacleName,
              "vehicle"
            );
          }
        }

        // Damage aircraft & trigger crash audio and camera shake
        audio.playCarCrash(Math.min(1.0, impactSpeed / 200));
        useGameStore.getState().damagePlane(Math.min(45, Math.round(impactSpeed * 0.12)));
        useGameStore.getState().triggerCameraShake(0.85);

        // Momentum loss & bounce
        this.speed *= 0.45;
        this.pitch = Math.max(0.1, this.pitch); // Bounce nose up
      }
    }

    this.x = nextX;
    this.y = nextY;
    this.z = nextZ;

    return {
      x: this.x,
      y: this.y,
      z: this.z,
      heading: this.heading,
      pitch: this.pitch,
      roll: this.roll,
      speed: this.speed,
      altitude: this.y,
      climbRate,
      isStalling,
      isAfterburner: isBoost && this.speed > 80,
      isAirbrake,
    };
  }
}

export const flightPhysics = new FlightPhysicsModel();
