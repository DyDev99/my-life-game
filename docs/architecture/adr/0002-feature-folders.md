# ADR-0002: Feature folders under src/game and src/ui

- Status: Accepted
- Date: 2026-10-08

## Context
Code was grouped by kind (`components/game`, `components/ui`, `lib/*`, `store/`), and a few files held many unrelated components.

## Decision
- `src/app`: Next.js routes only.
- `src/game/<feature>`: everything rendered inside the Canvas (world, player, camera, vehicles, npc, physics, audio, assets).
- `src/ui/<area>`: DOM overlay (screens, hud, modals).
- `src/state`, `src/data`, `src/i18n`: shared state, static data, strings.
- All imports use the `@/` alias, with no relative `./` imports across folders.

## Consequences
To change a feature, open one folder. New features get a new folder rather than a new file in a catch-all directory.
