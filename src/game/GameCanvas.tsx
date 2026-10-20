"use client";

import React, { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CameraController } from "@/game/camera/CameraController";
import { PlayerController } from "@/game/player/PlayerController";
import { GameWorld } from "@/game/world/GameWorld";
import { useGameStore } from "@/state/gameStore";
import type { GraphicsQuality } from "@/state/settingsStorage";
import { FOG_BY_QUALITY } from "@/game/world/expansion/viewDistance";

// Pixel-ratio range per preset; R3F clamps to the device ratio inside this range.
const DPR: Record<GraphicsQuality, [number, number]> = {
  low: [0.6, 0.85],
  medium: [1, 1.5],
  high: [1, 2],
};
const SHADOWS = { type: THREE.PCFShadowMap };

// Materials compiled with shadow sampling must recompile when shadows toggle.
function ShadowMaterialRefresh({ enabled }: { enabled: boolean }) {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.traverse((obj) => {
      const mat = (obj as THREE.Mesh).material;
      if (!mat) return;
      for (const m of Array.isArray(mat) ? mat : [mat]) m.needsUpdate = true;
    });
  }, [enabled, scene]);
  return null;
}

export function GameCanvas() {
  const paused = useGameStore((s) => s.pauseScreen !== null);
  const quality = useGameStore((s) => s.graphicsQuality);
  const shadowsOn = useGameStore((s) => s.shadowsEnabled && s.graphicsQuality !== "low");

  return (
    <div className="absolute inset-0 w-full h-full bg-[#87CEEB] overflow-hidden">
      <Canvas
        shadows={shadowsOn ? SHADOWS : false}
        camera={{ position: [30, 26, 30], fov: 42 }}
        dpr={DPR[quality]}
        // Paused: stop simulating; the last frame stays on screen behind the menu
        frameloop={paused ? "never" : "always"}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#BCE1F5"]} />
        <fog attach="fog" args={["#BCE1F5", ...FOG_BY_QUALITY[quality]]} />
        <ShadowMaterialRefresh enabled={shadowsOn} />
        <Suspense fallback={null}>
          <CameraController />
          <PlayerController />
          <GameWorld />
        </Suspense>
      </Canvas>
    </div>
  );
}
