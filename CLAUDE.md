@AGENTS.md

# Project map (My Life — web life-sim)

- Read `README.md` and `docs/architecture/Architecture.md` first.
- `src/app/` routes only · `src/game/<feature>/` 3D (inside Canvas) · `src/ui/{screens,hud,modals}/` DOM overlay · `src/state/gameStore.ts` Zustand store · `src/data/` characters, locations · `src/i18n/` en/km strings.
- Asset URLs: use `MODELS.X` / `SPRITES.X` from `@/game/assets/assetPaths` (generated — run `node scripts/generate-asset-paths.mjs` after changing `public/`). Never hard-code `"/models/..."`.
- `art-source/` = Blender sources (not served); `archive/` = superseded; don't import from either. Both are git-ignored and committed as `resources/*.zip` (run `scripts/pack-resources.sh` before committing; `scripts/unpack-resources.sh` after cloning).
- Never call store setters every frame in `useFrame`; select store state with a selector.
- Characters: roster in `src/data/characters.ts`. `rig: "clips"` (Maiko) renders via `game/player/ClipCharacterAvatar.tsx`; combat rules in `src/state/rules/combat.ts`, state in `gameStore.combat`.
- Verify: `npx tsc --noEmit`, `npm run lint` (24 pre-existing errors — add none), `npm run build`.
