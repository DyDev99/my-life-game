# Performance Audit

Audit date: 2026-10-08. **Report only.** None of these issues have been fixed yet. Target: GDD §13.3, a 3 GB Android device at 30 fps in a mobile browser.

| # | Issue | Evidence | Impact | Suggested fix |
|---|-------|----------|--------|---------------|
| P1 | Store written every frame → React re-renders | `game/player/PlayerController.tsx` calls `setMovementState(state, currentSpeed)` at the end of `useFrame`. `currentSpeed` is subscribed in `ui/hud/HUD.tsx` and `vehicles/VehiclesAndCharacters.tsx` (`PlayerCharacter`); `vehicleSpeed` is subscribed in 5 components. | **High.** HUD and player re-render ~60×/s while moving. | Only call `set` when `movementState` changes. Expose speed via a ref, or quantise it (e.g. round to 0.5) and compare before setting. HUD speedometer can read `getState()` in a `requestAnimationFrame`/interval. |
| P2 | Night point lights toggle | `world/environment/Environment.tsx` `StreetLamp`: `{isNight && <pointLight/>}` × 17 lamps; 20 `pointLight` + 5 `spotLight` in total | **High on mobile.** Changing the light count recompiles every material (a hitch at dusk/dawn), and ~20 forward point lights are expensive. | Keep lamps emissive with a bloom-free glow sprite. Use 2–4 pooled point lights that follow the player, or fixed lights whose `intensity` changes (count stays constant). |
| P3 | No instancing | 1,026 `<mesh>` JSX elements, 0 `instancedMesh` / `<Instances>` | Medium–High: draw-call bound | `<Instances>` (drei) for trees, lamps, fences, seats, paddies |
| P4 | FBX parsed at runtime | `FBXLoader` on the main thread; `CHR_Chandy.fbx` 435 KB, `CAR_Supercar_LOD1.fbx` 743 KB | Medium: load time, main-thread stalls | Export GLB, compress with Draco/meshopt (`gltf-transform`), load with `useGLTF` |
| P5 | Texture maps dropped | `game/assets/FBXModel.tsx` `enhanceMaterial()` creates a new `MeshStandardMaterial` copying only `color`; `map`/`normalMap` are lost and the original materials aren't disposed | Medium: Supercar textures (~350 KB) downloaded for nothing, plus a GPU leak | Copy `map`, `normalMap`, `roughnessMap`, etc., and call `mat.dispose()` on the original |
| P6 | LODs unused | Only `CAR_Supercar_LOD1` loaded | Low–Medium | drei `<Detailed>` with LOD0–3 |
| P7 | Shadows | `PCFShadowMap`, 2048² directional, `castShadow` on most meshes | Medium on mobile | 1024² on mobile, disable `castShadow` on small props and ground details, consider baked/contact shadows |
| P8 | Impure render | `Math.random()` during render (ESLint errors) | Low–Medium: layout changes on re-render, worse with P1 | Generate once in `useMemo` / data |
| P9 | Unused files in `public/` | ~10 MB of not-yet-wired sprites/FBX | Deploy size only, not downloaded at runtime | Keep (asset library); revisit before release |
| P10 | Large binaries in repo | `.blend` 12 + 6 MB, kit zip 12 MB, preview PNGs ~15 MB | Repo size / clone time | Git LFS for `*.blend`, `*.zip`, `art-source/**/*.png`, `*.fbx` |

## Singletons / managers
`audio`, `collisionWorld` and the FBX `modelCache` are module singletons. That is appropriate at this scale. The concern is coupling (the store calls `audio`), not the number of singletons.

## Measuring
- Chrome DevTools → Performance (CPU 4× slowdown) while walking and driving; look for React commits per frame.
- React DevTools Profiler → "Highlight updates" to see P1.
- `renderer.info` (`gl.info.render.calls`, `.triangles`) via r3f-perf or `useThree`.
