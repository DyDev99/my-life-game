# Project Cleanup Report

Date: 2026-10-08. **Not committed to git** (the repo has no commits yet, per the owner's request).
Full pre-change backup: `~/Documents/games/my-life-game-backup-2026-10-08` (everything except `node_modules`, `.next`).

## Summary
- Root reduced to `src/`, `public/`, `docs/`, `art-source/`, `archive/`, `scripts/` + config files.
- Source code reorganised by feature (`src/game/*`, `src/ui/*`, `src/state`, `src/data`, `src/i18n`).
- Asset URLs centralised in a generated registry, and the character roster and locations put in single data modules.
- New game README, architecture docs, 4 ADRs, coding/asset standards, performance audit, third-party list, art pipeline.
- No gameplay logic changed. Type-check, lint (unchanged) and build verified, and all asset URLs serve 200.

## Structure: old → new

```text
OLD                                              NEW
README.md (Blender kit v0.1 README)          →   archive/blender-kit-v0.1/README-v0.1.md
(none)                                       →   README.md (game README)
ជីវិតខ្ញុំ (My Life) — Game Design Document.md →   docs/game-design/GameDesignDocument.md
ជីវិតខ្ញុំ (My Life) —Features.md             →   docs/game-design/Features.md
3D-improvment.md                             →   docs/specs/3d-asset-quality-spec.md
action-charector.md                          →   docs/specs/character-controller-spec.md
PROJECT_STRUCTURE_REPORT.md / _PLAN.md       →   docs/project/
MyLife_Blender_Kit_new_charector/            →   art-source/blender-kit/
MyLife_Blender_Kit_new_charector/Supercar_Asset/ → art-source/supercar/
MyLife_Blender_Kit.zip                       →   archive/blender-kit-v0.1/MyLife_Blender_Kit.zip
kampong_cham_scene.png                       →   archive/blender-kit-v0.1/kampong_cham_scene-v0.1.png
public/{file,globe,next,vercel,window}.svg   →   archive/public-unused/

src/store/gameStore.ts                       →   src/state/gameStore.ts
src/lib/localization/translations.ts         →   src/i18n/translations.ts
src/lib/sound/audioManager.ts                →   src/game/audio/audioManager.ts
src/lib/game/collisionSystem.ts              →   src/game/physics/collisionSystem.ts
src/components/game/GameCanvas.tsx           →   src/game/GameCanvas.tsx
src/components/game/GameWorld.tsx            →   src/game/world/GameWorld.tsx
src/components/game/DayNightLighting.tsx     →   src/game/world/DayNightLighting.tsx
src/components/game/Buildings.tsx            →   src/game/world/buildings/Buildings.tsx
src/components/game/Environment.tsx          →   src/game/world/environment/Environment.tsx
src/components/game/SportsCity.tsx           →   src/game/world/sports-city/SportsCity.tsx
src/components/game/3DAssetLoader.tsx        →   src/game/assets/FBXModel.tsx
src/components/game/KeyboardController.tsx   →   src/game/player/PlayerController.tsx  (component renamed too)
src/components/game/CameraController.tsx     →   src/game/camera/CameraController.tsx
src/components/game/VehiclesAndCharacters.tsx →  src/game/vehicles/VehiclesAndCharacters.tsx
src/components/game/{NPCSystem,CityTrafficSystem}.tsx → src/game/npc/
src/components/screens/*                     →   src/ui/screens/*
src/components/ui/{HUD,StatFeedback}.tsx     →   src/ui/hud/
src/components/ui/*Modal.tsx (13)            →   src/ui/modals/
```

Kit internals (`Models/`, `Sprites/`, `Previews/`, `Unity/`) were kept as-is so the kit's own README, manifest and generator paths stay valid. The plan's `exports/` subfolder idea was dropped.

## Files removed (confirmed exact duplicates; another copy survives)
| Removed | Verified identical to |
|---------|----------------------|
| `mylife_kit.py` (root) | `mylife_kit.py` inside `archive/blender-kit-v0.1/MyLife_Blender_Kit.zip` |
| `public/kampong_cham_scene.png` | `archive/blender-kit-v0.1/kampong_cham_scene-v0.1.png` |
| `public/sprites/chandy_closeup.png` | `art-source/blender-kit/Previews/chandy_closeup.png` |
| `public/sprites/chandy_turnaround.png` | `art-source/blender-kit/Previews/chandy_turnaround.png` |

None of these were referenced by code.

## Files archived
`archive/blender-kit-v0.1/` (zip with the only v0.1 `.blend`, v0.1 README, v0.1 scene render) and `archive/public-unused/` (5 create-next-app SVGs).

## Code refactoring
| Change | Files |
|--------|-------|
| All imports switched to `@/` alias; no cross-folder relative imports | all |
| `KeyboardController` → `PlayerController` (file + component) | `game/player/PlayerController.tsx`, `game/GameCanvas.tsx` |
| **Asset registry** `MODELS` / `SPRITES` generated from `public/` by `scripts/generate-asset-paths.mjs`; replaced all 43 `"/models/…"` / `"/sprites/…"` literals | `game/assets/assetPaths.ts` + 7 consumers |
| **Character roster** single source `CHARACTERS`, `CHARACTER_LIST`, `CharacterId`; removed 2 duplicate FBX maps, 1 duplicate roster array, 5 repeated union types | `data/characters.ts`, `ui/screens/CharacterCreation.tsx`, `ui/modals/CharacterSwitcherModal.tsx`, `game/vehicles/VehiclesAndCharacters.tsx`, `state/gameStore.ts` |
| **Locations** `LocationKey` + `LOCATION_COORDINATES` moved out of the store | `data/locations.ts`, `state/gameStore.ts`, `game/player/PlayerController.tsx`, `game/world/buildings/Buildings.tsx`, `ui/hud/HUD.tsx` |
| Project map for AI agents | `CLAUDE.md` (appended; `AGENTS.md` untouched because it is regenerated by `next dev`) |

Not changed: `package.json`, lockfile, `next.config.ts`, `tsconfig.json`, ESLint/PostCSS config, `.gitignore`, `.npmrc`, any `public/models` or `public/sprites/<Category>` file.

## Verification
| Check | Before | After |
|-------|--------|-------|
| `npx tsc --noEmit` | ✅ | ✅ |
| `npx eslint .` | 24 errors / 40 warnings | 24 errors / 40 warnings (identical, all pre-existing) |
| `next build` | ✅ static `/` | ✅ static `/` |
| `next start` + `curl` of all 187 registry URLs + a Supercar texture | n/a | 188/188 HTTP 200; page 200 |
| Manual in-browser smoke test | n/a | **Not done.** Please play through the smoke-test path in README.md |

## Asset findings
- `public/` mixes kit v0.1 and v0.2 (5 characters and 126 sprites differ). See [ArtPipeline § version drift](../art/ArtPipeline.md).
- 22 of 53 models and 11 of 134 sprites are wired; the rest are kept as the asset library ([AssetStandards](../technical/AssetStandards.md)).
- Correction to the audit report: `public/models` has **53** FBX (+5 textures = 58 files), not 58 FBX.
- `art-source/blender-kit/manifest.json` reports `kit_version: 0.1.0` although the README says v0.2.

## Performance findings
See [PerformanceAudit.md](../technical/PerformanceAudit.md). Top items: P1 per-frame store writes re-rendering the HUD, P2 17 toggling night point lights, P3 no instancing, P5 texture maps discarded by `enhanceMaterial`.

## Remaining problems (need manual attention)
1. **Git:** create the first commit, ideally with Git LFS for `*.blend`, `*.zip`, `*.fbx` and art-source PNGs, then delete the backup folder once you're satisfied.
2. Play the smoke-test path in a browser.
3. Decide on syncing kit v0.2 into `public/`.
4. `three-stdlib` is not declared in `package.json`.
5. 24 ESLint errors (refs/`Math.random()` during render).
6. GDD §2 still says Unity; update it or reference ADR-0001.

## Recommendations (next steps, in order)
1. Fix P1 (biggest runtime win, small change).
2. Split `gameStore.ts` into slices + pure `state/rules/*`; add Vitest tests for rules and `collisionSystem`.
3. Split `VehiclesAndCharacters.tsx`, `Buildings.tsx` and `SportsCity.tsx` into one component per file.
4. P2/P3/P5 rendering fixes, then FBX → GLB (P4).
5. Add a save system (Zustand `persist` on a serialisable subset).
6. Add CI (type-check, lint, build) once the repo is committed.
