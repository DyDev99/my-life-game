"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { loadFBX } from "@/game/assets/FBXModel";
import { TEXTURES } from "@/game/assets/assetPaths";
import { useGameStore } from "@/state/gameStore";

// =============================================================================
// Avatar for characters that ship their own skeleton + animation clips
// (CharacterDefinition.rig === "clips"), e.g. Maiko the boxer.
//
// Clips in CHR_Maiko.fbx (30 fps, in place): Idle, Walk, Run, Jab, Cross, Hook,
// Guard, Dodge, Crouch, Victory, Defeat. Jump has no clip: it is a procedural
// arc on top of the Guard pose.
// =============================================================================

type ClipName = "Idle" | "Walk" | "Run" | "Jab" | "Cross" | "Hook" | "Guard" | "Dodge" | "Crouch" | "Victory" | "Defeat";

const ONE_SHOT_CLIP: Record<string, ClipName> = {
  jab: "Jab",
  cross: "Cross",
  hook: "Hook",
  dodge: "Dodge",
  victory: "Victory",
};

const JUMP_VELOCITY = 5.4; // m/s → ~0.8 m apex
const GRAVITY = 18; // m/s², a bit floatier than real for game feel
// Clamp the animation step so a long frame (tab switch, shader compile) can't skip a whole punch.
const MAX_STEP_S = 0.05;

// --- Materials ---------------------------------------------------------------
// FBX material name → texture set prefix (T_Maiko_<Set>_BaseColor|Normal|Roughness)
const MATERIAL_TEXTURE_SET: Record<string, string> = {
  MAT_Skin: "Skin",
  MAT_BoxingGloves: "Gloves",
  MAT_Hair: "Hair",
  MAT_Boots: "Boots",
  MAT_Shorts: "Shorts",
  MAT_Headband: "Headband",
  MAT_Eyes: "Eyes",
};

const materialCache = new Map<string, THREE.MeshStandardMaterial>();
const textureLoader = new THREE.TextureLoader();

function loadTexture(name: string, color: boolean): THREE.Texture | null {
  const url = (TEXTURES as Record<string, string>)[name];
  if (!url) return null;
  const tex = textureLoader.load(url);
  if (color) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function texturedMaterial(prefix: string, fbxMaterialName: string): THREE.MeshStandardMaterial {
  const key = `${prefix}:${fbxMaterialName}`;
  const cached = materialCache.get(key);
  if (cached) return cached;
  const set = MATERIAL_TEXTURE_SET[fbxMaterialName];
  const mat = new THREE.MeshStandardMaterial({ name: fbxMaterialName, roughness: 0.75, metalness: 0 });
  if (set) {
    mat.map = loadTexture(`T_${prefix}_${set}_BaseColor`, true);
    mat.normalMap = loadTexture(`T_${prefix}_${set}_Normal`, false);
    mat.roughnessMap = loadTexture(`T_${prefix}_${set}_Roughness`, false);
    if (mat.roughnessMap) mat.roughness = 1;
  }
  if (fbxMaterialName === "MAT_Eyes") mat.roughness = 0.2;
  materialCache.set(key, mat);
  return mat;
}

// --- Component ---------------------------------------------------------------
export function ClipCharacterAvatar({
  modelUrl,
  texturePrefix,
  mode = "world",
}: {
  modelUrl: string;
  /** Texture name prefix in TEXTURES, e.g. "Maiko" → T_Maiko_Skin_BaseColor. */
  texturePrefix: string;
  /** "world" follows game/combat state; "preview" loops a showcase for menus. */
  mode?: "world" | "preview";
}) {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const mixer = useRef<THREE.AnimationMixer | null>(null);
  const actions = useRef<Partial<Record<ClipName, THREE.AnimationAction>>>({});
  const current = useRef<THREE.AnimationAction | null>(null);
  const oneShot = useRef<{ action: THREE.AnimationAction; moveId: number } | null>(null);
  const jumpGroup = useRef<THREE.Group>(null);
  const jump = useRef({ active: false, y: 0, vy: 0 });
  const previewStep = useRef({ index: 0, timer: 0 });

  const moveId = useGameStore((s) => s.combat.moveId);
  const move = useGameStore((s) => s.combat.move);
  const ridingVehicle = useGameStore((s) => (mode === "world" ? s.ridingVehicle : null));

  // Load, clone, texture, and bind clips.
  useEffect(() => {
    let alive = true;
    loadFBX(modelUrl)
      .then((loaded) => {
        if (!alive) return;
        const clone = SkeletonUtils.clone(loaded) as THREE.Group;
        clone.traverse((o) => {
          const mesh = o as THREE.SkinnedMesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.frustumCulled = false; // bind-pose bounds don't cover jumps/punches
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const replaced = mats.map((m) => texturedMaterial(texturePrefix, m.name));
          mesh.material = Array.isArray(mesh.material) ? replaced : replaced[0];
        });

        const mx = new THREE.AnimationMixer(clone);
        const map: Partial<Record<ClipName, THREE.AnimationAction>> = {};
        for (const clip of loaded.animations) {
          const name = clip.name.replace(/^.*\|/, "").replace(/^Boxer_/, "") as ClipName;
          map[name] = mx.clipAction(clip);
        }
        mixer.current = mx;
        actions.current = map;
        current.current = null;
        setModel(clone);
      })
      .catch((err) => console.warn("Failed to load clip character:", modelUrl, err));

    return () => {
      alive = false;
      mixer.current?.stopAllAction();
      mixer.current = null;
    };
  }, [modelUrl, texturePrefix]);

  // Report one-shot completion back to the store.
  useEffect(() => {
    const mx = mixer.current;
    if (!mx || mode !== "world") return;
    const onFinished = (e: { action: THREE.AnimationAction }) => {
      if (oneShot.current && e.action === oneShot.current.action) {
        const id = oneShot.current.moveId;
        oneShot.current = null;
        useGameStore.getState().finishCombatMove(id);
      }
    };
    mx.addEventListener("finished", onFinished);
    return () => mx.removeEventListener("finished", onFinished);
  }, [model, mode]);

  // Start one-shot moves (punch combo, dodge, victory) when the store emits them.
  useEffect(() => {
    if (mode !== "world" || !move || !model) return;
    const clipName = ONE_SHOT_CLIP[move];
    const action = clipName && actions.current[clipName];
    if (!action) {
      useGameStore.getState().finishCombatMove(moveId);
      return;
    }
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.timeScale = move === "victory" ? 1 : 1.25; // snappier punches
    oneShot.current = { action, moveId };
    fadeTo(action, 0.08);
  }, [moveId, move, model, mode]);

  function fadeTo(next: THREE.AnimationAction, duration: number) {
    const prev = current.current;
    if (prev === next) return;
    next.enabled = true;
    next.setEffectiveWeight(1);
    next.play();
    if (prev) next.crossFadeFrom(prev, duration, false);
    current.current = next;
  }

  // Seat offset when riding (no sitting clip: crouch pose lowered onto the seat).
  const seatOffset = useMemo<[number, number, number]>(() => {
    if (ridingVehicle === "supercar") return [-0.38, -0.55, 0];
    if (ridingVehicle) return [0, -0.3, -0.1];
    return [0, 0, 0];
  }, [ridingVehicle]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_STEP_S);
    const mx = mixer.current;
    if (!mx || !model) return;
    const a = actions.current;

    if (mode === "preview") {
      const showcase: Array<[ClipName, number]> = [["Idle", 2.5], ["Guard", 1.6], ["Jab", 0.6], ["Cross", 0.7], ["Hook", 0.8], ["Dodge", 0.8], ["Victory", 2.2]];
      const step = previewStep.current;
      step.timer -= delta;
      if (step.timer <= 0) {
        const [name, seconds] = showcase[step.index % showcase.length];
        const action = a[name];
        if (action) {
          action.reset();
          action.setLoop(THREE.LoopRepeat, Infinity);
          fadeTo(action, 0.2);
        }
        step.timer = seconds;
        step.index++;
      }
      mx.update(delta);
      return;
    }

    const state = useGameStore.getState();
    const c = state.combat;

    // Jump arc (store sets airborne; we integrate and report landing).
    if (c.airborne && !jump.current.active) {
      jump.current = { active: true, y: 0, vy: JUMP_VELOCITY };
    }
    if (jump.current.active) {
      jump.current.vy -= GRAVITY * delta;
      jump.current.y += jump.current.vy * delta;
      if (jump.current.y <= 0 && jump.current.vy < 0) {
        jump.current = { active: false, y: 0, vy: 0 };
        state.land();
      }
    }
    if (jumpGroup.current) jumpGroup.current.position.y = jump.current.y;

    // Choose the looping base pose unless a one-shot is playing.
    if (!oneShot.current) {
      let next: ClipName;
      if (state.ridingVehicle) next = "Crouch";
      else if (jump.current.active) next = "Guard";
      else if (c.crouching) next = "Crouch";
      else if (c.guarding) next = "Guard";
      else if (state.movementState === "walking") next = "Walk";
      else if (state.movementState === "running" || state.movementState === "sprinting") next = "Run";
      else next = "Idle";

      const action = a[next];
      if (action) {
        if (current.current !== action) {
          action.reset();
          action.setLoop(THREE.LoopRepeat, Infinity);
          fadeTo(action, 0.18);
        }
        // Match run cadence to ground speed (5.2 m/s jog → 1×, 11.5 m/s sprint → ~1.6×).
        action.timeScale = next === "Run" ? THREE.MathUtils.clamp(state.currentSpeed / 5.2, 0.8, 1.7) : 1;
      }
    }

    mx.update(delta);
  });

  if (!model) return null;

  return (
    <group position={seatOffset}>
      <group ref={jumpGroup}>
        <primitive object={model} />
      </group>
    </group>
  );
}
