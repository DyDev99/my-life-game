# ជីវិតខ្ញុំ (My Life)

A single-player life simulation set in modern Cambodia. You build an ordinary life in Kampong Cham through a career, money, family and community. There is no enemy to defeat. The game asks *"What kind of life do you want to build?"*

The game runs in the browser as a 3D world (React Three Fiber) with a DOM UI on top (HUD, phone, modals). It supports Khmer and English.

> The design document still lists Unity as the engine. The project actually ships on the web stack below; see [ADR-0001](docs/architecture/adr/0001-web-runtime-nextjs-r3f.md).

## Tech stack

| | |
|---|---|
| Framework | Next.js **16.3** (App Router, Turbopack). It has breaking changes from older Next.js, so read `node_modules/next/dist/docs/` before changing framework code (see [AGENTS.md](AGENTS.md)) |
| UI | React 19, Tailwind CSS 4, framer-motion, lucide-react |
| 3D | three 0.186, @react-three/fiber 9, @react-three/drei 10, three-stdlib (FBXLoader) |
| State | Zustand 5 (one store) |
| Audio | Procedural Web Audio (no audio files) |
| Art | Procedural Blender add-on → FBX + PNG (see [Art pipeline](docs/art/ArtPipeline.md)) |

## Running

Requires Node 20+.

```bash
npm install          # .npmrc sets legacy-peer-deps=true
npm run dev          # http://localhost:3000
npm run build        # production build (also type-checks)
npm run start        # serve the production build
npm run lint         # ESLint (currently 24 known errors, see PerformanceAudit/Cleanup report)
npx tsc --noEmit     # type-check only
```

Controls (see `src/game/player/PlayerController.tsx`):

| Key | Action |
|-----|--------|
| WASD / arrows | Move (on foot) · throttle/steer (vehicle) |
| Shift | Sprint |
| Space | Kick ball / open decision (on foot) · handbrake (vehicle) |
| E | Interact: door, bed, locker room, food stalls |
| F | Mount / dismount nearby vehicle |
| H / B | Horn / bell |
| C | Character switcher |
| P | Phone |
| M | World map (click to set a GPS waypoint, Go = fast travel) |
| Esc | Close modal · otherwise pause menu (resume, map, settings, main menu) |
| 1–8 | Travel: home, school, market, cafe, pagoda, hotel, stadium, volleyball |
| L | Toggle Khmer / English |
| Mouse click on ground | Walk to point |

**Fighter controls** (characters with `canFight`, currently **Maiko** 🥊):

| Key | Action |
|-----|--------|
| J | Punch combo: jab → cross → hook (press again within 1.2 s to chain) |
| K | Hook (power punch) |
| Q (hold) | Guard / block (move at 35% speed) |
| R | Dodge |
| Space | Jump (still kicks the ball when standing next to it) |
| X | Crouch (toggle) |
| V | Victory celebration |

Each move costs a little energy. Below 5 energy you're too tired to fight. Every 10 punches counts as training: stress −2, happiness +1.

## Project structure

```text
my-life-game/
├── src/                      game source (see docs/architecture/Architecture.md)
│   ├── app/                  Next.js routes only (layout, page = screen + modal router)
│   ├── data/                 static game data: characters, locations
│   ├── game/                 everything rendered inside the 3D <Canvas>
│   │   ├── assets/           FBX loading/caching + generated asset path registry
│   │   ├── audio/  camera/  npc/  physics/  player/  vehicles/
│   │   └── world/            GameWorld, lighting, buildings/, environment/, sports-city/, expansion/ (new districts)
│   ├── i18n/                 en/km translations
│   ├── state/                Zustand game store
│   └── ui/                   DOM overlay: screens/, hud/, modals/
├── public/                   runtime assets served at /  (models/, sprites/)
├── art-source/               Blender source + generators (NOT served or bundled)
│   ├── blender-kit/          My Life asset kit v0.2 (.blend, mylife_kit.py, exports)
│   ├── maiko-boxer/          Maiko (Khmer boxer) kit: .blend, 2048/1024 textures, scripts, previews
│   └── supercar/             Supercar asset kit (.blend, generator, LODs, textures)
├── archive/                  superseded material kept for reference (kit v0.1)
├── resources/                art-source/ + archive/ as zips: the only form committed to git
├── docs/                     design, architecture, standards, art pipeline
└── scripts/                  dev tooling (generate-asset-paths.mjs, pack/unpack-resources.sh, art/)
```

## Development workflow

1. Find the feature folder (`src/game/<feature>`, `src/ui/<area>`); everything for a feature lives together.
2. Read and write game state through `useGameStore` with a **selector** (`useGameStore((s) => s.x)`). Never write to the store every frame (see [CodingStandards](docs/technical/CodingStandards.md)).
3. Reference assets through `MODELS` / `SPRITES` from `@/game/assets/assetPaths`, never as string literals.
4. Before you're done, run `npx tsc --noEmit`, `npm run lint` (no *new* errors), and `npm run build`, then play the smoke-test path below.

**Smoke test:** main menu → character creation → walk around → enter home/school/cafe/market/pagoda → open phone and every modal → ride the motorbike and supercar → switch character → sleep/end day.

## Naming conventions

- Components: `PascalCase.tsx`, one main component per file. Modules: `camelCase.ts`. Folders: `kebab-case` or single lowercase words.
- Assets: `CHR_` character, `VEH_` vehicle, `CAR_` car, `BLD_` building, `ENV_` nature/tile, `PRP_` prop, `T_` texture. Sprites: `portrait_`, `inv_`, `icon_`, `btn_`, `ui_`, `char_`, thumbnails in lowercase.

Details: [CodingStandards](docs/technical/CodingStandards.md) · [AssetStandards](docs/technical/AssetStandards.md)

## Asset workflow

Blender kit (`art-source/`) → export FBX/PNG → copy into `public/models|sprites/<Category>/` → `node scripts/generate-asset-paths.mjs` → reference via `MODELS.X` / `SPRITES.X`. Full steps: [ArtPipeline](docs/art/ArtPipeline.md).

**Source art goes to git as zips.** `art-source/` and `archive/` are git-ignored; `resources/*.zip` is committed instead:

```bash
scripts/pack-resources.sh     # before committing: re-zips only folders that changed
scripts/unpack-resources.sh   # after cloning: restores art-source/ and archive/
```

`public/` (models and sprites the game loads) and `docs/` stay unzipped.

## Testing

There are no automated tests yet. The plan is Vitest for pure logic (game rules, time, collisions); see [Architecture § Next steps](docs/architecture/Architecture.md#next-steps). Until then, use the smoke-test path above.

## Documentation

See [docs/README.md](docs/README.md).

## Contribution rules

- Keep `src/app/` for routes only, keep game code in `src/game/` and UI in `src/ui/`.
- Don't put source art (`.blend`, previews) in `public/`. Everything in `public/` is deployed.
- Don't edit `src/game/assets/assetPaths.ts` by hand; regenerate it.
- Record significant architecture decisions as an ADR in `docs/architecture/adr/`.
- Make small, focused commits; keep pure moves separate from logic changes.
