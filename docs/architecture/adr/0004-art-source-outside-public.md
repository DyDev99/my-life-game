# ADR-0004: Art source lives in art-source/, runtime assets in public/

- Status: Accepted
- Date: 2026-10-08

## Context
Blender kits (`.blend`, generator scripts, previews, Unity scripts) sat at the repo root next to a zip of an older version, and preview renders had been copied into `public/` (which is deployed).

## Decision
- `art-source/`: Blender sources, generators, raw exports, previews. Not served or bundled.
- `public/models`, `public/sprites`: only files the game loads, with URL paths unchanged.
- `archive/`: superseded material kept for reference.
- Asset URLs are referenced through the generated `src/game/assets/assetPaths.ts`.

## Consequences
Updating art is an explicit copy step (see docs/art/ArtPipeline.md). Large binaries should use Git LFS.
