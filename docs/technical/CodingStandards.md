# Coding Standards

## Language and tooling
- TypeScript `strict`. `npx tsc --noEmit` must pass.
- ESLint (`eslint-config-next` core-web-vitals + typescript, which includes React Compiler rules). Don't add new errors; the 24 existing errors are tracked debt.
- Imports use the `@/` alias (`@/state/gameStore`, `@/game/assets/assetPaths`), not `../`.

## Files and naming
| Kind | Convention | Example |
|------|-----------|---------|
| React component file | `PascalCase.tsx`, named export | `CameraController.tsx` → `export function CameraController` |
| Non-component module | `camelCase.ts` | `collisionSystem.ts`, `audioManager.ts` |
| Folder | lowercase, `kebab-case` if multi-word | `sports-city/` |
| Types / interfaces | `PascalCase` | `PlayerStats`, `LocationKey` |
| Constants (module-level data) | `UPPER_SNAKE_CASE` | `LOCATION_COORDINATES`, `CHARACTERS` |
| Store actions | verb-first camelCase | `performWork`, `mountVehicle`, `setNearLocation` |

- Aim for one main component per file and under ~400 lines. When a file grows past that, split it inside its feature folder.
- Name files after what they *are* (`PlayerController`), not how they are triggered (`KeyboardController`).

## Where code goes
| If it… | Put it in |
|--------|-----------|
| renders inside the `<Canvas>` | `src/game/<feature>/` |
| renders DOM UI | `src/ui/<screens|hud|modals>/` |
| is static definitions (rosters, locations, items, tuning numbers) | `src/data/` |
| holds game state / actions | `src/state/` |
| is user-facing text | `src/i18n/translations.ts` (en + km) |
| is a route | `src/app/` (nothing else) |

## State (Zustand)
- Subscribe with a selector: `useGameStore((s) => s.stats.money)`. Never call `useGameStore()` without one.
- **Don't call store setters every frame inside `useFrame`.** Keep continuous values (position, speed, heading) in refs. Only write to the store when a discrete value changes, e.g. `idle → walking`, or speed crossing a threshold.
- Read the latest state inside callbacks/frames with `useGameStore.getState()`.
- Keep game rules (stat deltas, costs) as pure functions where possible, so they can be unit-tested.

## React Three Fiber
- No allocation in `useFrame`: reuse `THREE.Vector3`/`Quaternion` from refs.
- No `Math.random()` during render. Generate randomness once in `useMemo`/`useState` initialisers or in data files.
- Don't read `ref.current` during render; read it in effects or `useFrame`.
- Repeated identical objects (trees, lamps, seats) should use instancing (`<Instances>` / `instancedMesh`).
- Load models only through `FBXModel` / `loadFBX` from `@/game/assets/FBXModel`, with a procedural `fallback`.

## Assets in code
- Use `MODELS.X` / `SPRITES.X` from `@/game/assets/assetPaths`. Never write `"/models/..."` literals.
- After adding/renaming files in `public/`, run `node scripts/generate-asset-paths.mjs`.

## Localisation
- Every visible string needs `en` and `km`. Data objects use the `nameEn` / `nameKm` (or `titleEn` / `titleKm`) pair pattern.
