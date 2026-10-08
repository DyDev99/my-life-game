"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { CameraController } from "@/game/camera/CameraController";
import { PlayerController } from "@/game/player/PlayerController";
import { GameWorld } from "@/game/world/GameWorld";

export function GameCanvas() {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#87CEEB] overflow-hidden">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ position: [30, 26, 30], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#BCE1F5"]} />
        <fog attach="fog" args={["#BCE1F5", 60, 140]} />
        <Suspense fallback={null}>
          <CameraController />
          <PlayerController />
          <GameWorld />
        </Suspense>
      </Canvas>
    </div>
  );
}
