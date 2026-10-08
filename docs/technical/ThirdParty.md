# Third-Party Dependencies and External Assets

No third-party source code is vendored or modified in this repo. Everything comes from npm or from the in-house Blender kits.

## npm runtime dependencies (installed versions, 2026-10-08)

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| next | 16.3.8 | Framework, routing, build | Breaking changes vs older Next.js; read `node_modules/next/dist/docs/` |
| react / react-dom | 19.2.8 | UI | |
| three | 0.186.1 | 3D engine | |
| @react-three/fiber | 9.8.1 | React renderer for three | |
| @react-three/drei | 10.7.9 | r3f helpers | |
| three-stdlib | 2.36.1 | `FBXLoader`, `SkeletonUtils` | ⚠️ **Imported directly but not declared in `package.json`**; it only arrives via drei. Add it as a direct dependency. |
| zustand | 5.0.15 | Game state store | |
| framer-motion | 14.0.0 | UI animation | |
| lucide-react | 1.52.0 | UI icons | |
| canvas-confetti | 1.9.4 | Celebration effect | `@types/canvas-confetti` is in `dependencies`; could be a devDependency |
| @types/three | ^0.186.0 | Types | In `dependencies`; could be a devDependency |

Dev: typescript 5.9.3, eslint 9.39.5 + eslint-config-next 16.3.8, tailwindcss 4.3.3 + @tailwindcss/postcss.

`.npmrc` sets `legacy-peer-deps=true`. The peer conflict it hides is not documented; check with `npm install --legacy-peer-deps=false` before upgrades.

**Upgrade notes:** upgrade `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei` and `three-stdlib` together, since FBXLoader and SkeletonUtils come from three-stdlib and must match `three`.

## In-house asset kits (generated, not third-party)

| Kit | Location | Version | Source | Modifications |
|-----|----------|---------|--------|---------------|
| My Life Blender Asset Kit | `art-source/blender-kit/` | v0.2 (README; `manifest.json` still says `0.1.0`) | `mylife_kit.py` procedural generator | None. `public/` currently ships v0.1 exports for 5 characters and all non-Chandy assets (see ArtPipeline) |
| My Life Blender Asset Kit | `archive/blender-kit-v0.1/MyLife_Blender_Kit.zip` | v0.1 | same | Superseded; contains the only v0.1 `.blend` |
| Maiko (Khmer Boxer) | `art-source/maiko-boxer/` | Blender 5.0.1 build | `scripts/` pipeline (anatomy → retopo → bake → rig → anim → LOD export) | Web build strips embedded textures and grafts the Unity FBX's 11 clips onto LOD1 (see ArtPipeline) |
| Supercar | `art-source/supercar/` | v1.0 | `supercar_kit.py` | None |

The kits include Unity scripts (`Unity/*.cs`) that this web game doesn't use (see ADR-0001).
