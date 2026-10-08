# ADR-0001: Web runtime (Next.js + React Three Fiber) instead of Unity

- Status: Accepted (records existing state)
- Date: 2026-10-08

## Context
GDD v0.1 §2 specifies Unity (LTS), and the Blender asset kits export for Unity (`Unity/*.cs`, import settings). The playable game was built as a browser app instead: Next.js 16, React 19, three.js via @react-three/fiber, and Zustand.

## Decision
The web stack is the game runtime. The Unity scripts in `art-source/*/Unity/` stay as kit outputs for reference and are not part of the build.

## Consequences
- Assets are loaded at runtime from `public/` (FBX via `FBXLoader`), so there is no import pipeline and no editor-time asset settings.
- Performance targets in GDD §13 (3 GB Android, 30 fps) apply to mobile browsers, so draw calls, lights and shader compiles matter more.
- The GDD's technical section should be updated to match.
