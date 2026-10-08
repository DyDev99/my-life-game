# Architecture

## Overview

```text
Browser
└── src/app/page.tsx  (client page: screen router + modal host)
    ├── ui/screens/      MainMenu, CharacterCreation          (screen = "main_menu" | "character_creation")
    ├── game/GameCanvas  (next/dynamic, ssr:false)            (screen = "game_world")
    │   ├── camera/CameraController
    │   ├── player/PlayerController   input → movement, collisions, proximity, vehicles
    │   └── world/GameWorld           composes the scene
    │       ├── world/DayNightLighting
    │       ├── world/buildings/*  world/environment/*  world/sports-city/*
    │       ├── vehicles/*  (incl. PlayerCharacter)
    │       └── npc/NPCSystem, npc/CityTrafficSystem
    └── ui/hud/HUD, ui/hud/StatFeedback, ui/modals/*   (DOM overlay on top of the canvas)

state/gameStore.ts  ◄── read/written by nearly everything (Zustand)
data/*              ◄── static definitions (characters, locations)
game/assets/*       ◄── FBX loader + asset URL registry
i18n/translations   ◄── en/km strings
game/audio, game/physics  ◄── module singletons (`audio`, `collisionWorld`)
```

## Layers and allowed dependencies

| Layer | Folder | May import | Must not import |
|-------|--------|-----------|-----------------|
| Routes | `src/app` | everything | n/a |
| UI (DOM) | `src/ui` | `state`, `data`, `i18n`, `game/audio`, `game/assets` (for previews) | `game/world`, `game/player` |
| 3D game | `src/game` | `state`, `data`, `game/*` | `src/ui`, `src/app` |
| State | `src/state` | `data`, `i18n` (types), `game/audio` (legacy, see below) | any React component |
| Data | `src/data` | `game/assets/assetPaths`, types from `state` | components, store instance |
| i18n | `src/i18n` | n/a | anything |

## State

- One Zustand store, `useGameStore`, in `src/state/gameStore.ts`. Always subscribe with a selector.
- Transient per-frame values (positions, speeds, headings) should live in refs inside `useFrame`. Write them to the store only when a discrete state changes (see [PerformanceAudit P1](../technical/PerformanceAudit.md)).
- There's no persistence yet. A save system should persist a serialisable subset (player, stats, day/time, relationships, inventory, journal), not UI or transient movement state.

## Characters and combat

- The roster is in `src/data/characters.ts`. Each character has a `rig`:
  - `"procedural"`: kit skeleton (`Hips`, `UpperArmL`…) posed in code by `PlayerCharacter` (`game/vehicles/VehiclesAndCharacters.tsx`).
  - `"clips"`: own skeleton with baked animation clips, rendered by `game/player/ClipCharacterAvatar.tsx` (AnimationMixer, cross-fades, textured materials). Used by **Maiko**. The switcher modal uses the same component in `mode="preview"`.
- `canFight` unlocks combat. Flow (all event-driven, nothing per frame):
  `PlayerController` key → `performCombatMove` / `setGuard` / `toggleCrouch` (store) → `combat` state → `ClipCharacterAvatar` plays the clip and calls `finishCombatMove(moveId)` / `land()` → `FighterHud` shows state.
- Combat rules (combo chain, energy costs, movement slow-down, training reward) are pure functions in `src/state/rules/combat.ts`.

## Assets

- Runtime files live in `public/` and are referenced via `MODELS`/`SPRITES` (`src/game/assets/assetPaths.ts`, generated).
- `loadFBX(url)` caches parsed models; `FBXModel` clones per instance with `SkeletonUtils.clone`. Materials are replaced with `MeshStandardMaterial` by name heuristics (`enhanceMaterial`).
- Every FBX use has a procedural fallback mesh, so a missing file shows the fallback instead of crashing. Check the Network tab for 404s.

## Known structural debt

| Item | Where | Direction |
|------|-------|-----------|
| God store (1.1k lines) | `state/gameStore.ts` | Split into slices (session, player, time, movement, vehicle, activity, sports) behind the same `useGameStore` API; move rules into pure `state/rules/*` |
| Store calls `audio` | `state/gameStore.ts` | Move sound triggers to the UI/game layer |
| Large multi-component files | `vehicles/VehiclesAndCharacters.tsx`, `world/buildings/Buildings.tsx`, `world/sports-city/SportsCity.tsx` | One component per file inside the same folder |
| Hard-coded coordinates | world components + `physics/collisionSystem.ts` | Derive colliders and positions from `data/locations.ts` / a layout data file |
| Extended character bios | `ui/modals/CharacterSwitcherModal.tsx` | Merge into `data/characters.ts` |

## Next steps

1. Fix [PerformanceAudit](../technical/PerformanceAudit.md) P1 (per-frame store writes).
2. Split the store into slices + pure rules; add Vitest unit tests for `state/rules` and `game/physics`.
3. Split the three large component files.
4. Fix the 24 ESLint errors (refs and `Math.random()` during render).
