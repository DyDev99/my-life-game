"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { loadFBX } from "@/game/assets/FBXModel";
import { useGameStore } from "@/state/gameStore";
import { MODELS } from "@/game/assets/assetPaths";
import { CHARACTERS, type CharacterId } from "@/data/characters";
import { ClipCharacterAvatar } from "@/game/player/ClipCharacterAvatar";

// =============================================================================
// 1. MOTORBIKE (ម៉ូតូ) — High-Detail 3D Motorcycle with Spinning Wheels & Chrome
// =============================================================================
export function Motorbike({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = "#B3262E",
  wheelSpin,
  steerRef,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  wheelSpin?: number;
  steerRef?: React.RefObject<THREE.Group | null>;
}) {
  const frontWheelRef = useRef<THREE.Group>(null);
  const rearWheelRef = useRef<THREE.Group>(null);
  const spinRef = useRef(0);
  const vehicleSpeed = useGameStore((state) => state.vehicleSpeed);

  useFrame((_, delta) => {
    if (wheelSpin !== undefined) {
      if (frontWheelRef.current) frontWheelRef.current.rotation.x = wheelSpin;
      if (rearWheelRef.current) rearWheelRef.current.rotation.x = wheelSpin;
    } else {
      const spd = Math.max(0, vehicleSpeed || 0);
      if (spd > 0) {
        spinRef.current += (spd / 3.6) * delta * 7.0;
        if (frontWheelRef.current) frontWheelRef.current.rotation.x = spinRef.current;
        if (rearWheelRef.current) rearWheelRef.current.rotation.x = spinRef.current;
      }
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Bike oriented facing +Z (matching world driving direction & FBX humanoid facing) */}
      <group rotation={[0, Math.PI, 0]}>
        {/* Dynamic Front Steering Assembly (Turns with handlebars when cornering) */}
        <group ref={steerRef} position={[0, 0, -0.42]}>
          <group position={[0, 0, 0.42]}>
            {/* Front Wheel with Spokes & Disc Brake */}
            <group ref={frontWheelRef} position={[0, 0.32, -0.56]}>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[0.26, 0.065, 8, 20]} />
                <meshStandardMaterial color="#19191C" roughness={0.9} />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.13, 0.13, 0.04, 12]} />
                <meshStandardMaterial color="#8E939B" metalness={0.8} roughness={0.3} />
              </mesh>
            </group>

            {/* Front Fork Suspension (Chrome angled up to handlebars) */}
            <mesh position={[-0.07, 0.62, -0.40]} rotation={[0.38, 0, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.68, 8]} />
              <meshStandardMaterial color="#D0D4DC" metalness={0.85} roughness={0.2} />
            </mesh>
            <mesh position={[0.07, 0.62, -0.40]} rotation={[0.38, 0, 0]}>
              <cylinderGeometry args={[0.016, 0.016, 0.68, 8]} />
              <meshStandardMaterial color="#D0D4DC" metalness={0.85} roughness={0.2} />
            </mesh>

            {/* Handlebars with Grips & Side Mirrors (Swept naturally to rider reach) */}
            <mesh position={[0, 1.02, -0.26]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.018, 0.018, 0.56, 8]} />
              <meshStandardMaterial color="#B0B4BC" metalness={0.8} />
            </mesh>
            {/* Left & Right Grip */}
            <mesh position={[-0.24, 1.02, -0.26]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.024, 0.024, 0.08, 8]} />
              <meshStandardMaterial color="#1A1A1D" />
            </mesh>
            <mesh position={[0.24, 1.02, -0.26]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.024, 0.024, 0.08, 8]} />
              <meshStandardMaterial color="#1A1A1D" />
            </mesh>
            {/* Rearview Side Mirrors */}
            <mesh position={[-0.28, 1.12, -0.25]} rotation={[-0.15, 0.2, 0]}>
              <circleGeometry args={[0.045, 12]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0.28, 1.12, -0.25]} rotation={[-0.15, -0.2, 0]}>
              <circleGeometry args={[0.045, 12]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
            </mesh>

            {/* Front Headlight (Bright Warm Glow) */}
            <mesh position={[0, 0.88, -0.48]}>
              <sphereGeometry args={[0.08, 10, 10]} />
              <meshStandardMaterial color="#FFFBEA" emissive="#FFF2A8" emissiveIntensity={0.8} />
            </mesh>
          </group>
        </group>

        {/* Rear Wheel with Chain Sprocket */}
        <group ref={rearWheelRef} position={[0, 0.32, 0.58]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.26, 0.065, 8, 20]} />
            <meshStandardMaterial color="#19191C" roughness={0.9} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.05, 12]} />
            <meshStandardMaterial color="#8E939B" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>

        {/* Engine & Transmission Block */}
        <mesh position={[0, 0.38, 0.06]} castShadow>
          <boxGeometry args={[0.24, 0.3, 0.50]} />
          <meshStandardMaterial color="#4A4E54" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Chrome Exhaust Pipe */}
        <mesh position={[0.15, 0.3, 0.34]} rotation={[0.1, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.58, 8]} />
          <meshStandardMaterial color="#C8CCD4" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Main Body Fairing & Fuel Tank */}
        <mesh position={[0, 0.68, -0.12]} castShadow>
          <boxGeometry args={[0.28, 0.36, 0.48]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0.78, -0.38]} rotation={[0.28, 0, 0]} castShadow>
          <boxGeometry args={[0.3, 0.40, 0.14]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>

        {/* Two-Seater Contoured Leather Saddle */}
        <mesh position={[0, 0.74, 0.18]} castShadow>
          <boxGeometry args={[0.26, 0.12, 0.56]} />
          <meshStandardMaterial color="#1E1E22" roughness={0.85} />
        </mesh>

        {/* Rear Taillight */}
        <mesh position={[0, 0.68, 0.54]}>
          <boxGeometry args={[0.1, 0.06, 0.04]} />
          <meshStandardMaterial color="#E11D48" emissive="#E11D48" emissiveIntensity={0.6} />
        </mesh>

        {/* Footpegs for rider */}
        <mesh position={[0, 0.32, 0.10]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.44, 6]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      </group>
    </group>
  );
}

// =============================================================================
// 2. BICYCLE (កង់) — Cambodian Roadster Bicycle with Wicker Basket & Pedals
// =============================================================================
export function Bicycle({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  wheelSpin,
  steerRef,
  crankRef,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  wheelSpin?: number;
  steerRef?: React.RefObject<THREE.Group | null>;
  crankRef?: React.RefObject<THREE.Group | null>;
}) {
  const frontWheelRef = useRef<THREE.Group>(null);
  const rearWheelRef = useRef<THREE.Group>(null);
  const spinRef = useRef(0);
  const vehicleSpeed = useGameStore((state) => state.vehicleSpeed);

  useFrame((_, delta) => {
    if (wheelSpin !== undefined) {
      if (frontWheelRef.current) frontWheelRef.current.rotation.x = wheelSpin;
      if (rearWheelRef.current) rearWheelRef.current.rotation.x = wheelSpin;
    } else {
      const spd = Math.max(0, vehicleSpeed || 0);
      if (spd > 0) {
        spinRef.current += (spd / 15) * delta * 5.5;
        if (frontWheelRef.current) frontWheelRef.current.rotation.x = spinRef.current;
        if (rearWheelRef.current) rearWheelRef.current.rotation.x = spinRef.current;
      }
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Bicycle oriented facing +Z */}
      <group rotation={[0, Math.PI, 0]}>
        {/* Dynamic Front Steering Assembly (Turns with handlebars when cornering) */}
        <group ref={steerRef} position={[0, 0, -0.40]}>
          <group position={[0, 0, 0.40]}>
            {/* Front Wheel */}
            <group ref={frontWheelRef} position={[0, 0.32, -0.52]}>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[0.28, 0.028, 6, 20]} />
                <meshStandardMaterial color="#1E1E21" />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.04, 0.04, 0.05, 8]} />
                <meshStandardMaterial color="#9AA0A6" metalness={0.7} />
              </mesh>
            </group>

            {/* Front Fork */}
            <mesh position={[-0.04, 0.60, -0.38]} rotation={[0.35, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.64, 8]} />
              <meshStandardMaterial color="#2563EB" metalness={0.3} />
            </mesh>
            <mesh position={[0.04, 0.60, -0.38]} rotation={[0.35, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.64, 8]} />
              <meshStandardMaterial color="#2563EB" metalness={0.3} />
            </mesh>

            {/* Front Basket (Traditional Woven Cane Basket) */}
            <mesh position={[0, 0.72, -0.50]} castShadow>
              <boxGeometry args={[0.3, 0.2, 0.22]} />
              <meshStandardMaterial color="#C89D66" roughness={0.9} />
            </mesh>

            {/* Roadster Handlebars (Curved ergonomically towards rider) */}
            <mesh position={[0, 0.96, -0.26]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.54, 8]} />
              <meshStandardMaterial color="#C0C4CC" metalness={0.85} />
            </mesh>
            {/* Left & Right Grip */}
            <mesh position={[-0.24, 0.96, -0.26]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
              <meshStandardMaterial color="#222" />
            </mesh>
            <mesh position={[0.24, 0.96, -0.26]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          </group>
        </group>

        {/* Rear Wheel */}
        <group ref={rearWheelRef} position={[0, 0.32, 0.52]}>
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.28, 0.028, 6, 20]} />
            <meshStandardMaterial color="#1E1E21" />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 0.05, 8]} />
            <meshStandardMaterial color="#9AA0A6" metalness={0.7} />
          </mesh>
        </group>

        {/* Blue Roadster Steel Frame Tubes */}
        <mesh position={[0, 0.56, 0.02]} rotation={[0.42, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 1.0, 8]} />
          <meshStandardMaterial color="#2563EB" metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.62, -0.16]} rotation={[-0.45, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.70, 8]} />
          <meshStandardMaterial color="#2563EB" metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.44, 0.25]} rotation={[-0.38, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.62, 8]} />
          <meshStandardMaterial color="#2563EB" metalness={0.3} />
        </mesh>

        {/* Seat Post & Saddle */}
        <mesh position={[0, 0.68, 0.12]}>
          <cylinderGeometry args={[0.014, 0.014, 0.28, 8]} />
          <meshStandardMaterial color="#888" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.81, 0.10]} castShadow>
          <boxGeometry args={[0.18, 0.06, 0.24]} />
          <meshStandardMaterial color="#1E1E22" roughness={0.9} />
        </mesh>

        {/* Rotating Crank & Pedals */}
        <group ref={crankRef} position={[0, 0.32, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Left Pedal */}
          <mesh position={[-0.12, 0.12, 0]}>
            <boxGeometry args={[0.06, 0.02, 0.08]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          {/* Right Pedal */}
          <mesh position={[0.12, -0.12, 0]}>
            <boxGeometry args={[0.06, 0.02, 0.08]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// =============================================================================
// 3. REMORK TUK-TUK (រ៉ឺម៉កកង់បី)
// =============================================================================
export function RemorkTukTuk({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Front Pulling Motorbike */}
      <Motorbike position={[0, 0, 1.3]} color="#25262A" />

      {/* Carriage Chassis */}
      <mesh position={[0, 0.55, -0.8]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.15, 2.0]} />
        <meshStandardMaterial color="#E8D9B0" />
      </mesh>

      {/* Carriage Big Wheels */}
      {[-0.85, 0.85].map((x, i) => (
        <mesh key={`remork-wh-${i}`} position={[x, 0.38, -0.8]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.32, 0.07, 8, 16]} />
          <meshStandardMaterial color="#1E1E21" />
        </mesh>
      ))}

      {/* Passenger Seats Facing Each Other */}
      <mesh position={[0, 0.85, -0.3]} castShadow>
        <boxGeometry args={[1.4, 0.45, 0.4]} />
        <meshStandardMaterial color="#202124" />
      </mesh>
      <mesh position={[0, 0.85, -1.3]} castShadow>
        <boxGeometry args={[1.4, 0.45, 0.4]} />
        <meshStandardMaterial color="#202124" />
      </mesh>

      {/* Canopy Pillars */}
      {[-0.72, 0.72].map((x, i) =>
        [0.0, -1.6].map((z, j) => (
          <mesh key={`remork-pil-${i}-${j}`} position={[x, 1.45, z]}>
            <cylinderGeometry args={[0.025, 0.025, 1.65, 6]} />
            <meshStandardMaterial color="#BCC1C7" metalness={0.7} />
          </mesh>
        ))
      )}

      {/* Green Curved Canopy Roof */}
      <mesh position={[0, 2.25, -0.8]} castShadow>
        <boxGeometry args={[1.7, 0.08, 2.2]} />
        <meshStandardMaterial color="#2E7D5B" roughness={0.6} />
      </mesh>

      {/* Tow Hitch Bar */}
      <mesh position={[0, 0.55, 0.2]} rotation={[-0.2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 1.2, 6]} />
        <meshStandardMaterial color="#25262A" metalness={0.7} />
      </mesh>
    </group>
  );
}

// -----------------------------------------------------------------------------
// Procedural Supercar Fallback Mesh (Matches CAR_Supercar_LOD0.fbx dimensions: 4.6m x 2.0m x 1.15m)
// -----------------------------------------------------------------------------
function ProceduralSupercarFallback({
  color = "#D92228",
  steerAngle = 0,
  wheelSpin = 0,
  doorLeft = 0,
  isBraking = false,
  headlights = true,
}: {
  color?: string;
  steerAngle?: number;
  wheelSpin?: number;
  doorLeft?: number;
  isBraking?: boolean;
  headlights?: boolean;
}) {
  return (
    <group>
      {/* Lower Chassis / Underbody */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.96, 0.28, 4.55]} />
        <meshStandardMaterial color="#191B1F" roughness={0.7} />
      </mesh>

      {/* Main Wedge Supercar Body */}
      <mesh position={[0, 0.52, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.92, 0.42, 3.8]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.85}
          roughness={0.16}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Slanted Hood & Front Bumper */}
      <mesh position={[0, 0.45, 1.7]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[1.86, 0.28, 1.1]} />
        <meshPhysicalMaterial color={color} metalness={0.85} roughness={0.16} clearcoat={1.0} />
      </mesh>

      {/* Carbon Fiber Front Splitter */}
      <mesh position={[0, 0.15, 2.22]} castShadow>
        <boxGeometry args={[1.94, 0.06, 0.35]} />
        <meshStandardMaterial color="#18181B" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Aerodynamic Cockpit & Roof (Carbon Roof) */}
      <mesh position={[0, 0.88, -0.22]} castShadow>
        <boxGeometry args={[1.38, 0.45, 1.95]} />
        <meshStandardMaterial color="#1E2024" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Tinted Front Windshield */}
      <mesh position={[0, 0.85, 0.62]} rotation={[-0.55, 0, 0]}>
        <boxGeometry args={[1.34, 0.06, 0.95]} />
        <meshPhysicalMaterial color="#7CB5EC" roughness={0.08} metalness={0.3} transparent opacity={0.55} />
      </mesh>

      {/* Tinted Rear Glass / Engine Cover */}
      <mesh position={[0, 0.78, -1.05]} rotation={[0.42, 0, 0]}>
        <boxGeometry args={[1.28, 0.05, 1.05]} />
        <meshPhysicalMaterial color="#7CB5EC" roughness={0.08} metalness={0.3} transparent opacity={0.55} />
      </mesh>

      {/* Driver Scissor Door (Opens upward around front hinge) */}
      <group position={[-0.95, 0.52, 0.1]} rotation={[-doorLeft * 1.15, doorLeft * 0.22, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.08, 0.48, 1.35]} />
          <meshPhysicalMaterial color={color} metalness={0.85} roughness={0.16} clearcoat={1.0} />
        </mesh>
      </group>

      {/* Passenger Door */}
      <mesh position={[0.95, 0.52, 0.1]} castShadow>
        <boxGeometry args={[0.08, 0.48, 1.35]} />
        <meshPhysicalMaterial color={color} metalness={0.85} roughness={0.16} clearcoat={1.0} />
      </mesh>

      {/* Side Air Intakes */}
      {[-0.94, 0.94].map((x, i) => (
        <mesh key={`intake-${i}`} position={[x, 0.5, -0.75]}>
          <boxGeometry args={[0.08, 0.25, 0.5]} />
          <meshStandardMaterial color="#0F1012" roughness={0.5} />
        </mesh>
      ))}

      {/* Rear Carbon Diffuser & Dual Titanium Exhaust Tips */}
      <mesh position={[0, 0.22, -2.18]} castShadow>
        <boxGeometry args={[1.7, 0.18, 0.22]} />
        <meshStandardMaterial color="#18181B" roughness={0.5} metalness={0.3} />
      </mesh>
      {[-0.32, 0.32].map((x, i) => (
        <mesh key={`exh-${i}`} position={[x, 0.28, -2.28]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.18, 12]} />
          <meshStandardMaterial color="#8E939D" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* Active Rear Wing / Spoiler */}
      <group position={[0, 0.92, -2.0]}>
        <mesh castShadow>
          <boxGeometry args={[1.85, 0.05, 0.38]} />
          <meshStandardMaterial color="#18181B" roughness={0.3} metalness={0.4} />
        </mesh>
        {[-0.6, 0.6].map((x, i) => (
          <mesh key={`sp-mount-${i}`} position={[x, -0.15, 0]}>
            <boxGeometry args={[0.04, 0.28, 0.15]} />
            <meshStandardMaterial color="#18181B" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Front LED Projector Headlights */}
      {[-0.72, 0.72].map((x, i) => (
        <mesh key={`headlight-${i}`} position={[x, 0.52, 2.15]}>
          <boxGeometry args={[0.32, 0.1, 0.12]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive="#E0F2FE"
            emissiveIntensity={headlights ? 2.5 : 0.2}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* Rear LED Brake Light Bar */}
      <mesh position={[0, 0.62, -2.22]}>
        <boxGeometry args={[1.74, 0.08, 0.08]} />
        <meshStandardMaterial
          color="#DC2626"
          emissive="#EF4444"
          emissiveIntensity={isBraking ? 4.5 : 1.2}
          roughness={0.2}
        />
      </mesh>

      {/* 4 Supercar Wheels (Wheelbase = 2.68m, Track = 1.76m) */}
      {/* Front Wheels (Turn with steerAngle & spin with wheelSpin) */}
      {[-0.88, 0.88].map((x, i) => (
        <group key={`front-wheel-${i}`} position={[x, 0.35, 1.34]} rotation={[0, steerAngle, 0]}>
          <group rotation={[wheelSpin, 0, 0]}>
            {/* Rubber Tire */}
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.32, 0.11, 8, 20]} />
              <meshStandardMaterial color="#1E2024" roughness={0.9} />
            </mesh>
            {/* Gloss Black Rim */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.24, 0.24, 0.22, 16]} />
              <meshStandardMaterial color="#121316" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Brake Disc Rotor */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.23, 16]} />
              <meshStandardMaterial color="#B0B5C0" metalness={0.85} roughness={0.25} />
            </mesh>
          </group>
          {/* Red Brake Caliper */}
          <mesh position={[0, 0.14, 0.08]}>
            <boxGeometry args={[0.12, 0.12, 0.16]} />
            <meshStandardMaterial color="#DC2626" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Rear Wheels (Spin with wheelSpin) */}
      {[-0.90, 0.90].map((x, i) => (
        <group key={`rear-wheel-${i}`} position={[x, 0.35, -1.34]}>
          <group rotation={[wheelSpin, 0, 0]}>
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.33, 0.12, 8, 20]} />
              <meshStandardMaterial color="#1E2024" roughness={0.9} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.25, 0.25, 0.26, 16]} />
              <meshStandardMaterial color="#121316" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.27, 16]} />
              <meshStandardMaterial color="#B0B5C0" metalness={0.85} roughness={0.25} />
            </mesh>
          </group>
          <mesh position={[0, 0.14, 0.08]}>
            <boxGeometry args={[0.12, 0.12, 0.16]} />
            <meshStandardMaterial color="#DC2626" roughness={0.3} metalness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// =============================================================================
// 3. SUPERCAR (ឡានស្ព័រ) — Interactive Driveable Vehicle Component
//    Loads CAR_Supercar_LOD0.fbx with working scissor doors, steering, and wheels
// =============================================================================
export function Supercar({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = "#D92228",
  steerAngle = 0,
  wheelSpin = 0,
  doorLeft = 0,
  doorRight = 0,
  isBraking = false,
  speed = 0,
  headlights = true,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  steerAngle?: number;
  wheelSpin?: number;
  doorLeft?: number;
  doorRight?: number;
  isBraking?: boolean;
  speed?: number;
  headlights?: boolean;
}) {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const partsRef = useRef<{
    wheelFL: THREE.Object3D | null;
    wheelFR: THREE.Object3D | null;
    wheelRL: THREE.Object3D | null;
    wheelRR: THREE.Object3D | null;
    caliperFL: THREE.Object3D | null;
    caliperFR: THREE.Object3D | null;
    brakeLightMaterials: THREE.MeshStandardMaterial[];
  }>({
    wheelFL: null,
    wheelFR: null,
    wheelRL: null,
    wheelRR: null,
    caliperFL: null,
    caliperFR: null,
    brakeLightMaterials: [],
  });

  const internalSpin = useRef(0);

  useEffect(() => {
    let active = true;
    loadFBX(MODELS.CAR_Supercar_LOD1)
      .then((loaded) => {
        if (!active) return;
        const clone = SkeletonUtils.clone(loaded) as THREE.Group;
        clone.scale.set(1.0, 1.0, 1.0);

        let wheelFL: THREE.Object3D | null = null;
        let wheelFR: THREE.Object3D | null = null;
        let wheelRL: THREE.Object3D | null = null;
        let wheelRR: THREE.Object3D | null = null;
        let caliperFL: THREE.Object3D | null = null;
        let caliperFR: THREE.Object3D | null = null;
        const brakeLightMaterials: THREE.MeshStandardMaterial[] = [];

        const paintMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(color),
          metalness: 0.88,
          roughness: 0.16,
          clearcoat: 1.0,
          clearcoatRoughness: 0.08,
          reflectivity: 0.95,
        });

        const glassMat = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color("#7FAACF"),
          metalness: 0.15,
          roughness: 0.05,
          transparent: true,
          opacity: 0.45,
          transmission: 0.65,
        });

        const carbonMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#18191C"),
          roughness: 0.45,
          metalness: 0.4,
        });

        const rimMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#111317"),
          metalness: 0.95,
          roughness: 0.18,
        });

        const tireMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#1E2124"),
          roughness: 0.92,
          metalness: 0.05,
        });

        const brakeDiscMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#B0B5C0"),
          metalness: 0.88,
          roughness: 0.25,
        });

        const caliperMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#DC2626"),
          metalness: 0.6,
          roughness: 0.3,
        });

        const headlampMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#FFFFFF"),
          emissive: new THREE.Color("#E0F2FE"),
          emissiveIntensity: headlights ? 3.5 : 0.2,
          roughness: 0.1,
        });

        const brakeLightMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#DC2626"),
          emissive: new THREE.Color("#EF4444"),
          emissiveIntensity: isBraking ? 5.5 : 1.2,
          roughness: 0.2,
        });
        brakeLightMaterials.push(brakeLightMat);

        clone.traverse((child) => {
          const name = child.name;
          if (name.includes("Wheel_FL")) wheelFL = child;
          if (name.includes("Wheel_FR")) wheelFR = child;
          if (name.includes("Wheel_RL")) wheelRL = child;
          if (name.includes("Wheel_RR")) wheelRR = child;
          if (name.includes("Caliper_FL")) caliperFL = child;
          if (name.includes("Caliper_FR")) caliperFR = child;

          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (Array.isArray(mesh.material)) {
              mesh.material = mesh.material.map((m) => {
                const mn = m?.name || "";
                if (mn.includes("CarPaint")) return paintMat;
                if (mn.includes("Glass")) return glassMat;
                if (mn.includes("Carbon")) return carbonMat;
                if (mn.includes("RimBlack")) return rimMat;
                if (mn.includes("Rubber")) return tireMat;
                if (mn.includes("BrakeDisc")) return brakeDiscMat;
                if (mn.includes("Caliper")) return caliperMat;
                if (mn.includes("LED_Head")) return headlampMat;
                if (mn.includes("Light_Brake") || mn.includes("Light_Tail")) return brakeLightMat;
                return m;
              });
            } else if (mesh.material) {
              const mn = (mesh.material as THREE.Material).name || "";
              if (mn.includes("CarPaint")) mesh.material = paintMat;
              else if (mn.includes("Glass")) mesh.material = glassMat;
              else if (mn.includes("Caliper")) mesh.material = caliperMat;
              else if (mn.includes("RimBlack")) mesh.material = rimMat;
              else if (mn.includes("Rubber")) mesh.material = tireMat;
            }
          }
        });

        partsRef.current = {
          wheelFL,
          wheelFR,
          wheelRL,
          wheelRR,
          caliperFL,
          caliperFR,
          brakeLightMaterials,
        };

        setModel(clone);
      })
      .catch((err) => {
        console.warn("Could not load Supercar FBX, fallback active", err);
      });

    return () => {
      active = false;
    };
  }, [color, headlights, isBraking]);

  useFrame((_, delta) => {
    const parts = partsRef.current;
    if (!parts) return;

    // Wheel spin (around X axis of wheel axle)
    let spin = wheelSpin;
    if (spin === 0 && Math.abs(speed) > 0) {
      internalSpin.current += (speed / 3.6 / 0.345) * delta;
      spin = internalSpin.current;
    }

    // Front wheels steer around Y and spin around X
    if (parts.wheelFL) {
      parts.wheelFL.rotation.x = spin;
      parts.wheelFL.rotation.y = steerAngle;
    }
    if (parts.wheelFR) {
      parts.wheelFR.rotation.x = spin;
      parts.wheelFR.rotation.y = steerAngle;
    }
    if (parts.caliperFL) {
      parts.caliperFL.rotation.y = steerAngle;
    }
    if (parts.caliperFR) {
      parts.caliperFR.rotation.y = steerAngle;
    }

    // Rear wheels spin around X
    if (parts.wheelRL) {
      parts.wheelRL.rotation.x = spin;
    }
    if (parts.wheelRR) {
      parts.wheelRR.rotation.x = spin;
    }

    // Update brake light emissive glow
    parts.brakeLightMaterials.forEach((m) => {
      m.emissiveIntensity = isBraking ? 5.5 : 1.2;
    });
  });

  return (
    <group position={position} rotation={rotation}>
      {model ? (
        <primitive object={model} />
      ) : (
        <ProceduralSupercarFallback
          color={color}
          steerAngle={steerAngle}
          wheelSpin={wheelSpin || internalSpin.current}
          doorLeft={doorLeft}
          isBraking={isBraking}
          headlights={headlights}
        />
      )}

      {/* Dynamic Headlight Cones / Spotlights */}
      {headlights && (
        <group position={[0, 0.45, 2.2]}>
          <pointLight color="#E0F2FE" intensity={1.8} distance={18} decay={1.5} />
          <spotLight
            position={[-0.7, 0, 0]}
            target-position={[-0.7, -0.3, 20]}
            color="#E0F2FE"
            intensity={4.0}
            distance={35}
            angle={0.45}
            penumbra={0.3}
          />
          <spotLight
            position={[0.7, 0, 0]}
            target-position={[0.7, -0.3, 20]}
            color="#E0F2FE"
            intensity={4.0}
            distance={35}
            angle={0.45}
            penumbra={0.3}
          />
        </group>
      )}

      {/* Rear Brake Light Glow */}
      {isBraking && (
        <group position={[0, 0.6, -2.25]}>
          <pointLight color="#EF4444" intensity={3.5} distance={6} />
        </group>
      )}
    </group>
  );
}

// =============================================================================
// 4. PLAYER CHARACTER CONTROLLER & SKELETAL LOCOMOTION ANIMATOR
//    (Smooth Walk, Run/Sprint, Bicycle Pedaling, Moto Lean, Human Breathing)
// =============================================================================
export function PlayerCharacter() {
  const rootGroupRef = useRef<THREE.Group>(null);
  const glowRingRef = useRef<THREE.Mesh>(null);
  const hipsRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  // Left & Right Arm Pivots (Pivoted at shoulders)
  const leftShoulderRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightShoulderRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);

  // Left & Right Leg Pivots (Pivoted at hips)
  const leftHipRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightHipRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);

  const targetPos = useGameStore((state) => state.targetPos);
  const player = useGameStore((state) => state.player);
  const ridingVehicle = useGameStore((state) => state.ridingVehicle);
  const vehicleSpeed = useGameStore((state) => state.vehicleSpeed);
  const movementState = useGameStore((state) => state.movementState);
  const currentSpeed = useGameStore((state) => state.currentSpeed);
  const playerHeading = useGameStore((state) => state.playerHeading);
  const enterVehicleAnimation = useGameStore((state) => state.enterVehicleAnimation);

  // Smooth position, rotation, and animation phase variables
  const currentPos = useRef(new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2]));
  const currentYaw = useRef<number>(playerHeading || 0);
  const rollBanking = useRef<number>(0);
  const steerAngle = useRef<number>(0);
  const crankAngle = useRef<number>(0);
  const footDownTransition = useRef<number>(1.0);
  const gaitCycle = useRef<number>(0);
  const switchGlow = useRef<number>(0);
  const lastAvatar = useRef(player.avatar);

  // Vehicle steering and crank animation refs
  const vehicleSteerRef = useRef<THREE.Group>(null);
  const bicycleCrankRef = useRef<THREE.Group>(null);

  // Real 3D FBX Model & Bone Extraction
  const [fbxModel, setFbxModel] = useState<THREE.Group | null>(null);
  const fbxBones = useRef<Record<string, THREE.Bone>>({});
  const restRotations = useRef<Record<string, THREE.Euler>>({});
  const restHipsZ = useRef<number>(0.9);
  const restHipsY = useRef<number>(0.0);

  // Avatar-specific color palettes & features
  const avatarId = player.avatar || "sokha";
  const characterDef = CHARACTERS[avatarId as CharacterId] ?? CHARACTERS.sokha;
  const usesClipRig = characterDef.rig === "clips";
  const isFemale = avatarId === "sreyneath" || avatarId === "sokunthea";

  // When avatar switches, trigger golden spark glow
  useEffect(() => {
    switchGlow.current = 1.0;
  }, [player.avatar]);

  useEffect(() => {
    let active = true;
    // Clip-rigged characters (e.g. Maiko) are rendered by ClipCharacterAvatar instead.
    // The render branch prefers the clip avatar; clearing the bone map stops procedural posing.
    if (usesClipRig) {
      fbxBones.current = {};
      restRotations.current = {};
      return;
    }
    const url = characterDef.model;

    loadFBX(url)
      .then((loaded) => {
        if (!active) return;
        const clone = SkeletonUtils.clone(loaded) as THREE.Group;
        clone.position.set(0, 0, 0);
        clone.rotation.set(0, 0, 0);
        clone.scale.set(1.0, 1.0, 1.0);

        const bMap: Record<string, THREE.Bone> = {};
        const rMap: Record<string, THREE.Euler> = {};
        clone.traverse((child) => {
          if ((child as THREE.Bone).isBone) {
            const bone = child as THREE.Bone;
            const name = bone.name;
            bMap[name] = bone;
            rMap[name] = bone.rotation.clone();
            // Store stripped aliases so both "UpperArm.L" and "UpperArmL" match reliably
            const clean = name.replace(/[\._]/g, "");
            bMap[clean] = bone;
            rMap[clean] = bone.rotation.clone();

            if (name.toLowerCase().includes("hips")) {
              restHipsZ.current = bone.position.z ?? 0.9;
              restHipsY.current = bone.position.y ?? 0.0;
            }
          }
        });
        fbxBones.current = bMap;
        restRotations.current = rMap;
        setFbxModel(clone);
      })
      .catch((err) => {
        console.warn("Failed to load FBX player character:", url, err);
        if (active) setFbxModel(null);
      });

    return () => {
      active = false;
    };
  }, [avatarId, usesClipRig, characterDef.model]);

  const skinColor = useMemo(() => {
    switch (avatarId) {
      case "taing":
        return "#AD744E"; // Bronze sun-kissed
      case "chandy":
        return "#D4946A"; // Kun Khmer fighter warm tan
      case "sreyneath":
      case "vuth":
        return "#E9B996"; // Fair/light tan
      case "sokunthea":
      case "sokha":
      default:
        return "#CF946A"; // Classic Cambodian golden tan
    }
  }, [avatarId]);

  const hairColor = useMemo(() => {
    if (avatarId === "chandy") return "#F2691C";
    return avatarId === "sokunthea" ? "#33241B" : "#1C1714";
  }, [avatarId]);

  const topColor = useMemo(() => {
    switch (avatarId) {
      case "chandy":
        return "#1C1D21"; // Fighter compression / shirtless piping
      case "vuth":
        return "#1A1B1F"; // Tech black hoodie
      case "taing":
        return "#6E3B35"; // Cambodian krama plaid red
      case "sokunthea":
        return "#FAF8F2"; // White floral blouse
      case "sreyneath":
        return "#ECEEF1"; // Student white shirt
      case "sokha":
      default:
        return "#ECEEF1"; // Teacher clean white blouse
    }
  }, [avatarId]);

  const bottomColor = useMemo(() => {
    switch (avatarId) {
      case "chandy":
        return "#2E5DB2"; // Kun Khmer fighter royal blue shorts
      case "vuth":
        return "#2C2E34"; // Charcoal pants
      case "taing":
        return "#3F5C84"; // Countryside denim
      case "sokunthea":
        return "#2A3A4F"; // Navy sarong
      case "sreyneath":
        return "#1F2A44"; // Pleated navy skirt
      case "sokha":
      default:
        return "#1F2A44"; // Navy teacher trousers
    }
  }, [avatarId]);

  useFrame((state, delta) => {
    if (!rootGroupRef.current) return;

    // Decay character switch glow
    if (switchGlow.current > 0) {
      switchGlow.current = Math.max(0, switchGlow.current - delta * 2.2);
    }

    // Smooth position interpolation
    const dest = new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2]);
    currentPos.current.lerp(dest, Math.min(1, delta * 12.0));
    rootGroupRef.current.position.copy(currentPos.current);

    // Smooth heading rotation
    let angleDiff = playerHeading - currentYaw.current;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    currentYaw.current += angleDiff * Math.min(1, delta * 14.0);
    rootGroupRef.current.rotation.y = currentYaw.current;

    // =========================================================================
    // 1. VEHICLE RIDING ANIMATIONS (MOTORBIKE & BICYCLE)
    // =========================================================================
    if (ridingVehicle) {
      const spd = Math.max(0, vehicleSpeed || currentSpeed || 0);
      const isMoto = ridingVehicle === "motorbike";

      // 1. Dynamic steering angle of front fork & handlebars
      const targetSteer = THREE.MathUtils.clamp(-angleDiff * 3.2, -0.40, 0.40);
      steerAngle.current = THREE.MathUtils.lerp(steerAngle.current, targetSteer, delta * 14.0);

      // Rotate front steering assembly directly
      if (vehicleSteerRef.current) {
        vehicleSteerRef.current.rotation.y = -steerAngle.current;
      }

      // 2. Foot-down transition: plants left foot on ground when stopped, tucks onto peg when moving
      const targetFootDown = spd < 1.2 ? 1.0 : 0.0;
      footDownTransition.current = THREE.MathUtils.lerp(
        footDownTransition.current,
        targetFootDown,
        delta * (spd < 1.2 ? 5.0 : 8.0)
      );
      const footDown = footDownTransition.current;

      // 3. Bicycle crank & pedaling phase
      if (!isMoto && spd > 0.4) {
        crankAngle.current += delta * (spd / 12.0) * 5.5;
      }
      if (bicycleCrankRef.current) {
        bicycleCrankRef.current.rotation.x = crankAngle.current;
      }

      // 4. Turning lean / roll banking
      if (ridingVehicle === "supercar") {
        const speedFactor = Math.min(1.0, spd / 50.0);
        const dynamicRoll = THREE.MathUtils.clamp(angleDiff * 1.5 * speedFactor, -0.06, 0.06);
        rollBanking.current = THREE.MathUtils.lerp(rollBanking.current, dynamicRoll, delta * 8.0);
      } else if (isMoto) {
        // Deep countersteering lean (up to 26 degrees)
        const speedFactor = Math.min(1.0, spd / 18.0);
        const dynamicRoll = THREE.MathUtils.clamp(-angleDiff * 6.2 * speedFactor, -0.45, 0.45);
        const idleRestTilt = 0.055 * footDown;
        const targetRoll = dynamicRoll * (1.0 - footDown * 0.7) + idleRestTilt;
        rollBanking.current = THREE.MathUtils.lerp(rollBanking.current, targetRoll, delta * 8.5);
      } else {
        // Bicycle lean
        const speedFactor = Math.min(1.0, spd / 12.0);
        const dynamicRoll = THREE.MathUtils.clamp(-angleDiff * 4.6 * speedFactor, -0.32, 0.32);
        const idleRestTilt = 0.04 * footDown;
        const targetRoll = dynamicRoll * (1.0 - footDown * 0.7) + idleRestTilt;
        rollBanking.current = THREE.MathUtils.lerp(rollBanking.current, targetRoll, delta * 7.5);
      }
      rootGroupRef.current.rotation.z = rollBanking.current;

      // 5. Authentic mechanical engine vibration & road suspension feel (smooth harmonic sine, NO white noise)
      const engineFreq = isMoto ? 24.0 : 12.0;
      const roadFeel = spd > 0.5
        ? Math.sin(state.clock.elapsedTime * engineFreq) * 0.003
        : (isMoto ? Math.sin(state.clock.elapsedTime * 10.0) * 0.0018 : 0);
      rootGroupRef.current.position.y = targetPos[1] + roadFeel;

      // 6. REAL FBX SKELETAL RIG VEHICLE POSING
      if (fbxModel) {
        const b = fbxBones.current;
        const r = restRotations.current;
        const hz = restHipsZ.current;

        if (ridingVehicle === "supercar") {
          // --- SUPERCAR DRIVER FBX POSE (Seated in sports bucket seat, steering wheel grip) ---
          if (b.Hips && r.Hips) {
            b.Hips.position.z = hz - 0.28;
            b.Hips.position.y = 0.38; // Seated inside low-slung bucket seat
            b.Hips.position.x = -0.38; // Left-hand drive side
          }
          if (b.Spine && r.Spine) {
            b.Spine.rotation.x = r.Spine.x + 0.25;
            b.Spine.rotation.y = r.Spine.y - 0.05;
          }
          // Arms reaching forward to steering wheel
          if (b.UpperArmL && r.UpperArmL) {
            b.UpperArmL.rotation.x = r.UpperArmL.x - 0.85;
            b.UpperArmL.rotation.y = r.UpperArmL.y + 0.20;
            b.UpperArmL.rotation.z = r.UpperArmL.z + 0.35;
          }
          if (b.LowerArmL && r.LowerArmL) {
            b.LowerArmL.rotation.x = r.LowerArmL.x - 0.65;
          }
          if (b.UpperArmR && r.UpperArmR) {
            b.UpperArmR.rotation.x = r.UpperArmR.x - 0.85;
            b.UpperArmR.rotation.y = r.UpperArmR.y - 0.20;
            b.UpperArmR.rotation.z = r.UpperArmR.z - 0.35;
          }
          if (b.LowerArmR && r.LowerArmR) {
            b.LowerArmR.rotation.x = r.LowerArmR.x - 0.65;
          }
          // Legs forward into pedal footwell
          if (b.UpperLegL && r.UpperLegL) {
            b.UpperLegL.rotation.x = r.UpperLegL.x - 1.35;
            b.UpperLegL.rotation.z = r.UpperLegL.z - 0.15;
          }
          if (b.LowerLegL && r.LowerLegL) {
            b.LowerLegL.rotation.x = r.LowerLegL.x + 1.45;
          }
          if (b.UpperLegR && r.UpperLegR) {
            b.UpperLegR.rotation.x = r.UpperLegR.x - 1.35;
            b.UpperLegR.rotation.z = r.UpperLegR.z + 0.15;
          }
          if (b.LowerLegR && r.LowerLegR) {
            b.LowerLegR.rotation.x = r.LowerLegR.x + 1.45;
          }
        } else if (isMoto) {
          // --- MOTORCYCLE FBX POSE ---
          if (b.Hips && r.Hips) {
            b.Hips.position.z = THREE.MathUtils.lerp(hz - 0.24, hz - 0.20, footDown); // Lowered directly onto saddle
            b.Hips.position.y = 0.08; // Firmly seated on motorcycle saddle
            b.Hips.position.x = 0;
          }

          // Left Leg (Planted on road when stopped, firmly on footpeg when driving)
          if (b.UpperLegL && r.UpperLegL) {
            b.UpperLegL.rotation.x = THREE.MathUtils.lerp(r.UpperLegL.x - 0.60, r.UpperLegL.x - 0.70, footDown);
            b.UpperLegL.rotation.z = THREE.MathUtils.lerp(r.UpperLegL.z - 0.30, r.UpperLegL.z - 0.30, footDown);
          }
          if (b.LowerLegL && r.LowerLegL) {
            b.LowerLegL.rotation.x = THREE.MathUtils.lerp(r.LowerLegL.x + 1.50, r.LowerLegL.x + 1.20, footDown);
          }

          // Right Leg (Rests firmly on right footpeg & rear brake)
          if (b.UpperLegR && r.UpperLegR) {
            b.UpperLegR.rotation.x = r.UpperLegR.x - 0.60;
            b.UpperLegR.rotation.z = r.UpperLegR.z + 0.30;
          }
          if (b.LowerLegR && r.LowerLegR) {
            b.LowerLegR.rotation.x = r.LowerLegR.x + 1.50;
          }

          // Arms gripping handlebars (hands follow steering turns)
          if (b.UpperArmL && r.UpperArmL) {
            b.UpperArmL.rotation.x = r.UpperArmL.x - 1.00;
            b.UpperArmL.rotation.y = r.UpperArmL.y + 0.90 - steerAngle.current * 0.40;
            b.UpperArmL.rotation.z = r.UpperArmL.z - 1.30;
          }
          if (b.LowerArmL && r.LowerArmL) {
            b.LowerArmL.rotation.x = r.LowerArmL.x + 0.50;
          }

          if (b.UpperArmR && r.UpperArmR) {
            b.UpperArmR.rotation.x = r.UpperArmR.x - 1.00;
            b.UpperArmR.rotation.y = r.UpperArmR.y - 0.90 - steerAngle.current * 0.40;
            b.UpperArmR.rotation.z = r.UpperArmR.z + 1.30;
          }
          if (b.LowerArmR && r.LowerArmR) {
            b.LowerArmR.rotation.x = r.LowerArmR.x + 0.50;
          }

          // Torso leans forward with speed + into corners
          const forwardLean = THREE.MathUtils.lerp(0.14, 0.30, Math.min(1, spd / 35.0));
          if (b.Spine && r.Spine) {
            b.Spine.rotation.x = r.Spine.x - forwardLean;
            b.Spine.rotation.z = r.Spine.z + rollBanking.current * 0.45;
          }
          // Head stays up and tracks through turn apex
          if (b.Head && r.Head) {
            b.Head.rotation.x = r.Head.x + forwardLean * 0.75;
            b.Head.rotation.y = r.Head.y - steerAngle.current * 0.50;
          }
        } else {
          // --- BICYCLE FBX POSE ---
          if (b.Hips && r.Hips) {
            b.Hips.position.z = hz - 0.18; // Lowered onto bicycle saddle
            b.Hips.position.y = 0.04;     // Saddle offset
            b.Hips.position.x = 0;
          }

          if (spd > 0.8) {
            // Alternating natural cycling motion
            const sinL = Math.sin(crankAngle.current);
            const cosL = Math.cos(crankAngle.current);
            const sinR = Math.sin(crankAngle.current + Math.PI);
            const cosR = Math.cos(crankAngle.current + Math.PI);

            if (b.UpperLegL && r.UpperLegL) {
              b.UpperLegL.rotation.x = r.UpperLegL.x - 0.70 - sinL * 0.20;
              b.UpperLegL.rotation.z = r.UpperLegL.z - 0.15;
            }
            if (b.LowerLegL && r.LowerLegL) {
              b.LowerLegL.rotation.x = r.LowerLegL.x + 1.35 + cosL * 0.35;
            }

            if (b.UpperLegR && r.UpperLegR) {
              b.UpperLegR.rotation.x = r.UpperLegR.x - 0.70 - sinR * 0.20;
              b.UpperLegR.rotation.z = r.UpperLegR.z + 0.15;
            }
            if (b.LowerLegR && r.LowerLegR) {
              b.LowerLegR.rotation.x = r.LowerLegR.x + 1.35 + cosR * 0.35;
            }
          } else {
            // Stopped: Left foot rests on road, right stays on pedal
            if (b.UpperLegL && r.UpperLegL) {
              b.UpperLegL.rotation.x = THREE.MathUtils.lerp(r.UpperLegL.x - 0.70, r.UpperLegL.x - 0.65, footDown);
              b.UpperLegL.rotation.z = THREE.MathUtils.lerp(r.UpperLegL.z - 0.15, r.UpperLegL.z - 0.28, footDown);
            }
            if (b.LowerLegL && r.LowerLegL) {
              b.LowerLegL.rotation.x = THREE.MathUtils.lerp(r.LowerLegL.x + 1.35, r.LowerLegL.x + 0.95, footDown);
            }
            if (b.UpperLegR && r.UpperLegR) {
              b.UpperLegR.rotation.x = r.UpperLegR.x - 0.70;
              b.UpperLegR.rotation.z = r.UpperLegR.z + 0.15;
            }
            if (b.LowerLegR && r.LowerLegR) {
              b.LowerLegR.rotation.x = r.LowerLegR.x + 1.35;
            }
          }

          // Arms holding roadster bicycle handlebars
          if (b.UpperArmL && r.UpperArmL) {
            b.UpperArmL.rotation.x = r.UpperArmL.x - 0.95;
            b.UpperArmL.rotation.y = r.UpperArmL.y + 0.85 - steerAngle.current * 0.35;
            b.UpperArmL.rotation.z = r.UpperArmL.z - 1.25;
          }
          if (b.LowerArmL && r.LowerArmL) {
            b.LowerArmL.rotation.x = r.LowerArmL.x + 0.45;
          }

          if (b.UpperArmR && r.UpperArmR) {
            b.UpperArmR.rotation.x = r.UpperArmR.x - 0.95;
            b.UpperArmR.rotation.y = r.UpperArmR.y - 0.85 - steerAngle.current * 0.35;
            b.UpperArmR.rotation.z = r.UpperArmR.z + 1.25;
          }
          if (b.LowerArmR && r.LowerArmR) {
            b.LowerArmR.rotation.x = r.LowerArmR.x + 0.45;
          }

          // Torso with rhythmic pedaling sway & cornering
          if (b.Spine && r.Spine) {
            b.Spine.rotation.x = r.Spine.x - 0.18;
            b.Spine.rotation.z = r.Spine.z + (spd > 0.8 ? Math.sin(crankAngle.current) * 0.05 : 0) + rollBanking.current * 0.35;
          }
          if (b.Head && r.Head) {
            b.Head.rotation.x = r.Head.x + 0.16;
            b.Head.rotation.y = r.Head.y - steerAngle.current * 0.40;
          }
        }
      }

      // 7. PROCEDURAL FALLBACK POSTURE
      if (hipsRef.current) {
        hipsRef.current.position.y = 0.52;
        hipsRef.current.position.z = 0.04;
      }

      if (isMoto) {
        // Motorcycle fallback
        if (leftHipRef.current) {
          leftHipRef.current.rotation.x = THREE.MathUtils.lerp(0.65, 0.12, footDown);
          leftHipRef.current.rotation.z = THREE.MathUtils.lerp(-0.15, -0.32, footDown);
        }
        if (leftKneeRef.current) leftKneeRef.current.rotation.x = THREE.MathUtils.lerp(0.85, 0.30, footDown);

        if (rightHipRef.current) {
          rightHipRef.current.rotation.x = 0.65;
          rightHipRef.current.rotation.z = 0.15;
        }
        if (rightKneeRef.current) rightKneeRef.current.rotation.x = 0.85;

        const forwardLean = THREE.MathUtils.lerp(0.14, 0.30, Math.min(1, spd / 30.0));
        if (torsoRef.current) {
          torsoRef.current.rotation.x = -forwardLean;
          torsoRef.current.rotation.z = -rollBanking.current * 0.5;
        }
        if (headRef.current) {
          headRef.current.rotation.x = forwardLean * 0.65;
          headRef.current.rotation.y = -steerAngle.current * 0.45;
        }

        if (leftShoulderRef.current) {
          leftShoulderRef.current.rotation.x = 0.68;
          leftShoulderRef.current.rotation.y = -steerAngle.current * 0.35;
        }
        if (leftForearmRef.current) leftForearmRef.current.rotation.x = 0.35;
        if (rightShoulderRef.current) {
          rightShoulderRef.current.rotation.x = 0.68;
          rightShoulderRef.current.rotation.y = -steerAngle.current * 0.35;
        }
        if (rightForearmRef.current) rightForearmRef.current.rotation.x = 0.35;
      } else {
        // Bicycle fallback
        if (spd > 0.8) {
          const leftCrank = Math.sin(crankAngle.current);
          const rightCrank = Math.sin(crankAngle.current + Math.PI);
          if (leftHipRef.current) leftHipRef.current.rotation.x = 0.45 + leftCrank * 0.35;
          if (leftKneeRef.current) leftKneeRef.current.rotation.x = 0.65 + Math.cos(crankAngle.current) * 0.35;
          if (rightHipRef.current) rightHipRef.current.rotation.x = 0.45 + rightCrank * 0.35;
          if (rightKneeRef.current) rightKneeRef.current.rotation.x = 0.65 + Math.cos(crankAngle.current + Math.PI) * 0.35;
        } else {
          if (leftHipRef.current) {
            leftHipRef.current.rotation.x = THREE.MathUtils.lerp(0.45, 0.12, footDown);
            leftHipRef.current.rotation.z = THREE.MathUtils.lerp(0, -0.28, footDown);
          }
          if (leftKneeRef.current) leftKneeRef.current.rotation.x = THREE.MathUtils.lerp(0.65, 0.28, footDown);
          if (rightHipRef.current) rightHipRef.current.rotation.x = 0.45;
          if (rightKneeRef.current) rightKneeRef.current.rotation.x = 0.65;
        }

        if (leftShoulderRef.current) leftShoulderRef.current.rotation.x = 0.62;
        if (leftForearmRef.current) leftForearmRef.current.rotation.x = 0.32;
        if (rightShoulderRef.current) rightShoulderRef.current.rotation.x = 0.62;
        if (rightForearmRef.current) rightForearmRef.current.rotation.x = 0.32;

        if (torsoRef.current) {
          torsoRef.current.rotation.x = -0.22;
          torsoRef.current.rotation.z = Math.sin(crankAngle.current) * 0.04;
        }
        if (headRef.current) {
          headRef.current.rotation.x = 0.18;
          headRef.current.rotation.y = -steerAngle.current * 0.35;
        }
      }

      return;
    }

    // =========================================================================
    // 2. ON-FOOT LOCOMOTION ANIMATIONS (IDLE, WALK, RUN, SPRINT)
    // =========================================================================
    // Reset roll banking when on foot
    rollBanking.current = THREE.MathUtils.lerp(rollBanking.current, 0, delta * 10.0);
    rootGroupRef.current.rotation.z = 0;

    // Reset hips base position
    if (hipsRef.current) {
      hipsRef.current.position.y = 0.72;
      hipsRef.current.position.z = 0;
    }

    const isMoving = movementState !== "idle" && currentSpeed > 0.15;
    const isSprinting = movementState === "sprinting" || currentSpeed > 7.5;
    const isRunning = movementState === "running" || currentSpeed > 2.0;

    if (isMoving) {
      // Locomotion cadence: walk ~8Hz, run ~11Hz, sprint ~14Hz
      const cadence = isSprinting ? 14.0 : isRunning ? 11.0 : 7.8;
      gaitCycle.current += delta * cadence;

      const legSwingAmp = isSprinting ? 0.82 : isRunning ? 0.62 : 0.42;
      const armSwingAmp = isSprinting ? 0.78 : isRunning ? 0.58 : 0.38;

      const swing = Math.sin(gaitCycle.current);
      const cosSwing = Math.cos(gaitCycle.current);

      // Real FBX Skeleton Gait Animation
      if (fbxModel) {
        const b = fbxBones.current;
        const r = restRotations.current;
        if (b.Hips && r.Hips) {
          b.Hips.position.z = restHipsZ.current - Math.abs(swing) * 0.02;
          b.Hips.position.y = restHipsY.current;
        }
        if (b.UpperLegL && r.UpperLegL) b.UpperLegL.rotation.x = r.UpperLegL.x - swing * legSwingAmp;
        if (b.LowerLegL && r.LowerLegL) b.LowerLegL.rotation.x = r.LowerLegL.x + (swing > 0 ? Math.abs(swing) * (isSprinting ? 1.15 : 0.7) : 0.05);
        if (b.UpperLegR && r.UpperLegR) b.UpperLegR.rotation.x = r.UpperLegR.x + swing * legSwingAmp;
        if (b.LowerLegR && r.LowerLegR) b.LowerLegR.rotation.x = r.LowerLegR.x + (swing < 0 ? Math.abs(swing) * (isSprinting ? 1.15 : 0.7) : 0.05);
        if (b.UpperArmL && r.UpperArmL) b.UpperArmL.rotation.z = r.UpperArmL.z - swing * armSwingAmp;
        if (b.UpperArmR && r.UpperArmR) b.UpperArmR.rotation.z = r.UpperArmR.z + swing * armSwingAmp;
        if (b.Spine && r.Spine) {
          const forwardLean = isSprinting ? 0.32 : isRunning ? 0.18 : 0.07;
          b.Spine.rotation.x = r.Spine.x - forwardLean;
          b.Spine.rotation.y = r.Spine.y - swing * 0.08;
        }
        if (b.Head && r.Head) {
          const forwardLean = isSprinting ? 0.32 : isRunning ? 0.18 : 0.07;
          b.Head.rotation.x = r.Head.x + forwardLean * 0.7;
          b.Head.rotation.y = r.Head.y + swing * 0.04;
        }
      }

      // --- LEGS ---
      // Left leg: Hip swing + Knee flexion on backward swing
      if (leftHipRef.current) {
        leftHipRef.current.rotation.x = swing * legSwingAmp;
      }
      if (leftKneeRef.current) {
        // Knee bends back when leg recovers forward to avoid ground clipping
        leftKneeRef.current.rotation.x = swing < 0 ? Math.abs(swing) * (isSprinting ? 1.15 : 0.7) : 0.05;
      }

      // Right leg: Opposite phase
      if (rightHipRef.current) {
        rightHipRef.current.rotation.x = -swing * legSwingAmp;
      }
      if (rightKneeRef.current) {
        rightKneeRef.current.rotation.x = swing > 0 ? Math.abs(swing) * (isSprinting ? 1.15 : 0.7) : 0.05;
      }

      // --- ARMS ---
      // Arms swing in counter-phase to legs with natural athletic elbow bend
      const elbowBend = isSprinting ? 1.1 : isRunning ? 0.65 : 0.35;
      if (leftShoulderRef.current) {
        leftShoulderRef.current.rotation.x = -swing * armSwingAmp;
      }
      if (leftForearmRef.current) {
        leftForearmRef.current.rotation.x = elbowBend;
      }

      if (rightShoulderRef.current) {
        rightShoulderRef.current.rotation.x = swing * armSwingAmp;
      }
      if (rightForearmRef.current) {
        rightForearmRef.current.rotation.x = elbowBend;
      }

      // --- TORSO & PELVIS BOUNCE ---
      // Inverted pendulum human gait: Pelvis bobs twice per stride
      const bounceHeight = isSprinting ? 0.12 : isRunning ? 0.08 : 0.045;
      const verticalBob = Math.abs(cosSwing) * bounceHeight;
      rootGroupRef.current.position.y = targetPos[1] + verticalBob;

      // Torso leans forward with speed (athletic posture) and gentle counter-twist
      const forwardLean = isSprinting ? 0.32 : isRunning ? 0.18 : 0.07;
      if (torsoRef.current) {
        torsoRef.current.rotation.x = forwardLean;
        torsoRef.current.rotation.y = -swing * 0.08; // Torso counter-twist
      }
      if (headRef.current) {
        headRef.current.rotation.x = -forwardLean * 0.7; // Keep gaze forward
        headRef.current.rotation.y = swing * 0.04;
      }
    } else {
      // --- IDLE STATE (Human Breathing, Weight Shift, Looking Around) ---
      const idleTime = Date.now() * 0.0018;

      // Respiration (Chest expansion & gentle vertical rise)
      const breath = Math.sin(idleTime * 2.2);
      rootGroupRef.current.position.y = targetPos[1] + breath * 0.02;

      // Real FBX Skeleton Idle Animation
      if (fbxModel) {
        const b = fbxBones.current;
        const r = restRotations.current;
        if (b.Hips && r.Hips) {
          b.Hips.position.z = restHipsZ.current + breath * 0.008;
          b.Hips.position.y = restHipsY.current;
          b.Hips.rotation.z = r.Hips.z + Math.sin(idleTime * 0.8) * 0.025;
        }
        if (b.UpperLegL && r.UpperLegL) b.UpperLegL.rotation.copy(r.UpperLegL);
        if (b.UpperLegR && r.UpperLegR) b.UpperLegR.rotation.copy(r.UpperLegR);
        if (b.LowerLegL && r.LowerLegL) b.LowerLegL.rotation.copy(r.LowerLegL);
        if (b.LowerLegR && r.LowerLegR) b.LowerLegR.rotation.copy(r.LowerLegR);
        if (b.UpperArmL && r.UpperArmL) b.UpperArmL.rotation.x = r.UpperArmL.x + Math.sin(idleTime * 1.5) * 0.05;
        if (b.UpperArmR && r.UpperArmR) b.UpperArmR.rotation.x = r.UpperArmR.x - Math.sin(idleTime * 1.5) * 0.05;
        if (b.Spine && r.Spine) b.Spine.rotation.copy(r.Spine);
        if (b.Head && r.Head) b.Head.rotation.y = r.Head.y + Math.sin(idleTime * 0.5) * 0.12;
      }

      // Natural subtle weight shift between left and right foot
      const sway = Math.sin(idleTime * 0.8) * 0.035;
      if (hipsRef.current) {
        hipsRef.current.rotation.z = sway;
      }

      // Relaxed arms hanging by hips with gentle subtle sway
      if (leftShoulderRef.current) {
        leftShoulderRef.current.rotation.x = Math.sin(idleTime * 1.5) * 0.05;
        leftShoulderRef.current.rotation.z = 0.08;
      }
      if (leftForearmRef.current) leftForearmRef.current.rotation.x = 0.1;

      if (rightShoulderRef.current) {
        rightShoulderRef.current.rotation.x = -Math.sin(idleTime * 1.5) * 0.05;
        rightShoulderRef.current.rotation.z = -0.08;
      }
      if (rightForearmRef.current) rightForearmRef.current.rotation.x = 0.1;

      // Legs in natural rest stance
      if (leftHipRef.current) leftHipRef.current.rotation.x = 0;
      if (leftKneeRef.current) leftKneeRef.current.rotation.x = 0.04;
      if (rightHipRef.current) rightHipRef.current.rotation.x = 0;
      if (rightKneeRef.current) rightKneeRef.current.rotation.x = 0.04;

      // Torso & Head looking around occasionally
      if (torsoRef.current) {
        torsoRef.current.rotation.x = 0;
        torsoRef.current.rotation.y = 0;
        torsoRef.current.rotation.z = -sway * 0.5;
      }
      if (headRef.current) {
        headRef.current.rotation.x = 0;
        headRef.current.rotation.y = Math.sin(idleTime * 0.5) * 0.12; // gentle looking around
      }
    }
  });

  return (
    <group ref={rootGroupRef} position={[targetPos[0], targetPos[1], targetPos[2]]}>
      {/* Mounted Motorbike or Bicycle underneath player */}
      {/* Mounted Supercar, Motorbike or Bicycle underneath player */}
      {ridingVehicle === "supercar" && (
        <group position={[0, -0.05, 0]}>
          <Supercar
            steerAngle={-steerAngle.current}
            wheelSpin={crankAngle.current}
            speed={vehicleSpeed}
            doorLeft={enterVehicleAnimation ? 1.0 : 0}
            isBraking={vehicleSpeed < 0 || currentSpeed < 0}
          />
        </group>
      )}
      {ridingVehicle === "motorbike" && (
        <group position={[0, -0.25, 0]}>
          <Motorbike color="#B3262E" steerRef={vehicleSteerRef} />
        </group>
      )}
      {ridingVehicle === "bicycle" && (
        <group position={[0, -0.2, 0]}>
          <Bicycle steerRef={vehicleSteerRef} crankRef={bicycleCrankRef} />
        </group>
      )}

      {/* 3D Player Overhead Indicator (Glowing Golden Diamond) */}
      <mesh position={[0, ridingVehicle ? 2.45 : 2.2, 0]} castShadow>
        <octahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial
          color="#F59E0B"
          emissive="#D97706"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Character Switch Magic Glow Ring */}
      <mesh ref={glowRingRef} position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.6, 1.2, 24]} />
        <meshBasicMaterial
          color="#FBBF24"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* REAL FBX 3D CHARACTER WITH PROCEDURAL FALLBACK */}
      {usesClipRig ? (
        <ClipCharacterAvatar modelUrl={characterDef.model} texturePrefix={characterDef.texturePrefix ?? characterDef.nameEn} />
      ) : fbxModel ? (
        <primitive object={fbxModel} />
      ) : (
        /* =====================================================================
            HUMAN SKELETAL RIG & MESH HIERARCHY (PROCEDURAL FALLBACK - FACING +Z)
            ===================================================================== */
        <group rotation={[0, Math.PI, 0]}>
          {/* 1. HIPS / PELVIS ROOT */}
          <group ref={hipsRef} position={[0, 0.72, 0]}>
            {/* Pelvis Belt / Waist */}
            <mesh position={[0, 0.02, 0]} castShadow>
              <boxGeometry args={[0.38, 0.14, 0.24]} />
              <meshStandardMaterial color={bottomColor} />
            </mesh>

            {/* Gold championship belt for Chandy */}
            {avatarId === "chandy" && (
              <mesh position={[0, 0.06, 0]} castShadow>
                <boxGeometry args={[0.4, 0.06, 0.26]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.8} roughness={0.25} />
              </mesh>
            )}

            {/* Skirt for Sreyneath */}
            {avatarId === "sreyneath" && (
              <mesh position={[0, -0.16, 0]} castShadow>
                <cylinderGeometry args={[0.22, 0.34, 0.36, 12]} />
                <meshStandardMaterial color={bottomColor} />
              </mesh>
            )}

            {/* 2. TORSO / SPINE (Pivots from hips) */}
            <group ref={torsoRef} position={[0, 0.08, 0]}>
              {/* Main Upper Torso (Chest / Shirt / Blouse) */}
              <mesh position={[0, 0.24, 0]} castShadow>
                <boxGeometry args={[0.42, 0.46, 0.25]} />
                <meshStandardMaterial color={topColor} roughness={0.7} />
              </mesh>

          {/* Apron for Sokunthea the shopkeeper */}
          {avatarId === "sokunthea" && (
            <mesh position={[0, 0.18, -0.13]} castShadow>
              <boxGeometry args={[0.34, 0.42, 0.02]} />
              <meshStandardMaterial color="#B5642F" roughness={0.9} />
            </mesh>
          )}

          {/* Backpack for Sokha the teacher */}
          {avatarId === "sokha" && (
            <group position={[0, 0.25, 0.18]}>
              <mesh castShadow>
                <boxGeometry args={[0.3, 0.38, 0.14]} />
                <meshStandardMaterial color="#232529" roughness={0.8} />
              </mesh>
              {/* Backpack Straps */}
              <mesh position={[-0.11, 0.02, -0.16]}>
                <boxGeometry args={[0.04, 0.36, 0.04]} />
                <meshStandardMaterial color="#4E3020" />
              </mesh>
              <mesh position={[0.11, 0.02, -0.16]}>
                <boxGeometry args={[0.04, 0.36, 0.04]} />
                <meshStandardMaterial color="#4E3020" />
              </mesh>
            </group>
          )}

          {/* Cambodian Krama Scarf around Taing's neck */}
          {avatarId === "taing" && (
            <mesh position={[0, 0.44, 0]}>
              <torusGeometry args={[0.14, 0.045, 6, 12]} />
              <meshStandardMaterial color="#8E3436" roughness={0.9} />
            </mesh>
          )}

          {/* 3. HEAD & NECK */}
          <group ref={headRef} position={[0, 0.52, 0]}>
            {/* Neck */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.07, 0.08, 0.1, 8]} />
              <meshStandardMaterial color={skinColor} />
            </mesh>

            {/* Head Sphere */}
            <mesh position={[0, 0.22, 0]} castShadow>
              <sphereGeometry args={[0.2, 12, 12]} />
              <meshStandardMaterial color={skinColor} roughness={0.7} />
            </mesh>

            {/* Eyes */}
            <mesh position={[-0.065, 0.24, -0.18]}>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshStandardMaterial color="#151113" />
            </mesh>
            <mesh position={[0.065, 0.24, -0.18]}>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshStandardMaterial color="#151113" />
            </mesh>

            {/* Blush for Female Characters */}
            {isFemale && (
              <>
                <mesh position={[-0.13, 0.19, -0.14]}>
                  <sphereGeometry args={[0.038, 6, 6]} />
                  <meshStandardMaterial color="#E79A8C" roughness={0.9} />
                </mesh>
                <mesh position={[0.13, 0.19, -0.14]}>
                  <sphereGeometry args={[0.038, 6, 6]} />
                  <meshStandardMaterial color="#E79A8C" roughness={0.9} />
                </mesh>
              </>
            )}

            {/* Hair Mesh */}
            <mesh position={[0, 0.32, 0.02]} castShadow>
              <sphereGeometry args={[0.21, 10, 10]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>
            {(avatarId === "sreyneath" || avatarId === "sokunthea") && (
              <mesh position={[0, 0.14, 0.18]} castShadow>
                <boxGeometry args={[0.2, 0.42, 0.08]} />
                <meshStandardMaterial color={hairColor} roughness={0.9} />
              </mesh>
            )}

            {/* Farmer Straw Hat (មួកស្លឹកត្នោត) for Taing */}
            {avatarId === "taing" && (
              <group position={[0, 0.38, 0]}>
                <mesh castShadow>
                  <coneGeometry args={[0.42, 0.16, 16]} />
                  <meshStandardMaterial color="#D8B26A" roughness={0.95} />
                </mesh>
              </group>
            )}

            {/* Headphones for Vuth */}
            {avatarId === "vuth" && (
              <group position={[0, 0.22, 0]}>
                <mesh>
                  <torusGeometry args={[0.23, 0.035, 6, 12, Math.PI]} />
                  <meshStandardMaterial color="#2C2E34" metalness={0.7} />
                </mesh>
                <mesh position={[-0.22, 0.02, 0]}>
                  <cylinderGeometry args={[0.05, 0.05, 0.04, 8]} />
                  <meshStandardMaterial color="#E11D48" />
                </mesh>
                <mesh position={[0.22, 0.02, 0]}>
                  <cylinderGeometry args={[0.05, 0.05, 0.04, 8]} />
                  <meshStandardMaterial color="#E11D48" />
                </mesh>
              </group>
            )}
          </group>

          {/* 4. LEFT ARM (Pivoted at shoulder) */}
          <group ref={leftShoulderRef} position={[-0.26, 0.4, 0]}>
            {/* Upper Arm */}
            <mesh position={[0, -0.14, 0]} castShadow>
              <boxGeometry args={[0.1, 0.26, 0.11]} />
              <meshStandardMaterial color={topColor} />
            </mesh>
            {/* Left Forearm & Hand */}
            <group ref={leftForearmRef} position={[0, -0.27, 0]}>
              <mesh position={[0, -0.13, 0]} castShadow>
                <boxGeometry args={[0.09, 0.24, 0.1]} />
                <meshStandardMaterial color={skinColor} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.26, 0]}>
                <sphereGeometry args={[0.05, 6, 6]} />
                <meshStandardMaterial color={skinColor} />
              </mesh>
            </group>
          </group>

          {/* 5. RIGHT ARM (Pivoted at shoulder) */}
          <group ref={rightShoulderRef} position={[0.26, 0.4, 0]}>
            {/* Upper Arm */}
            <mesh position={[0, -0.14, 0]} castShadow>
              <boxGeometry args={[0.1, 0.26, 0.11]} />
              <meshStandardMaterial color={topColor} />
            </mesh>
            {/* Right Forearm & Hand */}
            <group ref={rightForearmRef} position={[0, -0.27, 0]}>
              <mesh position={[0, -0.13, 0]} castShadow>
                <boxGeometry args={[0.09, 0.24, 0.1]} />
                <meshStandardMaterial color={skinColor} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -0.26, 0]}>
                <sphereGeometry args={[0.05, 6, 6]} />
                <meshStandardMaterial color={skinColor} />
              </mesh>

              {/* Teaching Teal Book for Sokha */}
              {avatarId === "sokha" && !ridingVehicle && (
                <mesh position={[0.06, -0.2, 0.08]} rotation={[0.4, 0, 0]}>
                  <boxGeometry args={[0.04, 0.22, 0.16]} />
                  <meshStandardMaterial color="#5F9C97" />
                </mesh>
              )}
            </group>
          </group>
        </group>

        {/* 6. LEFT LEG (Pivoted at hip joint) */}
        <group ref={leftHipRef} position={[-0.12, -0.04, 0]}>
          {/* Upper Leg / Thigh */}
          <mesh position={[0, -0.17, 0]} castShadow>
            <boxGeometry args={[0.13, 0.32, 0.14]} />
            <meshStandardMaterial color={bottomColor} />
          </mesh>
          {/* Knee & Lower Leg / Shin */}
          <group ref={leftKneeRef} position={[0, -0.33, 0]}>
            <mesh position={[0, -0.16, 0]} castShadow>
              <boxGeometry args={[0.12, 0.32, 0.13]} />
              <meshStandardMaterial color={bottomColor} />
            </mesh>
            {/* Foot & Shoe (Facing forward with toes) */}
            <mesh position={[0, -0.32, -0.05]} castShadow>
              <boxGeometry args={[0.13, 0.09, 0.22]} />
              <meshStandardMaterial color="#4A2E1B" />
            </mesh>
          </group>
        </group>

        {/* 7. RIGHT LEG (Pivoted at hip joint) */}
        <group ref={rightHipRef} position={[0.12, -0.04, 0]}>
          {/* Upper Leg / Thigh */}
          <mesh position={[0, -0.17, 0]} castShadow>
            <boxGeometry args={[0.13, 0.32, 0.14]} />
            <meshStandardMaterial color={bottomColor} />
          </mesh>
          {/* Knee & Lower Leg / Shin */}
          <group ref={rightKneeRef} position={[0, -0.33, 0]}>
            <mesh position={[0, -0.16, 0]} castShadow>
              <boxGeometry args={[0.12, 0.32, 0.13]} />
              <meshStandardMaterial color={bottomColor} />
            </mesh>
            {/* Foot & Shoe (Facing forward with toes) */}
            <mesh position={[0, -0.32, -0.05]} castShadow>
              <boxGeometry args={[0.13, 0.09, 0.22]} />
              <meshStandardMaterial color="#4A2E1B" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )}
</group>
);
}
