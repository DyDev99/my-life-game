# Art Pipeline

```text
art-source/blender-kit/mylife_kit.py ─┐
art-source/blender-kit/MyLife_Kit.blend ┤ Blender 3.6+ (tested 4.2)
                                      ▼
            art-source/blender-kit/Models/<Cat>/*.fbx, Sprites/<Cat>/*.png   (raw exports)
                                      │  copy the files you need
                                      ▼
            public/models/<Cat>/*.fbx, public/sprites/<Cat>/*.png          (game-ready, served)
                                      │  node scripts/generate-asset-paths.mjs
                                      ▼
            src/game/assets/assetPaths.ts  →  MODELS.X / SPRITES.X in code
```

## Source vs game-ready
- **Source** (`art-source/`): `.blend`, generator scripts, manifests, previews, raw exports. Never served.
- **Game-ready** (`public/`): only the exported FBX/PNG the game loads.

## Regenerating assets
In Blender: install `mylife_kit.py` as an add-on, then use the 3D view sidebar (N) → **My Life** → Build / Render 2D sprites / Export.

Headless:
```bash
blender -b -P art-source/blender-kit/mylife_kit.py -- --render --preview --export --out ./tmp-export
```
The Supercar works the same way with `art-source/supercar/supercar_kit.py` (see its README).

## Bringing an asset into the game
1. Copy the export into the matching `public/models/<Category>/` or `public/sprites/<Category>/` folder, keeping the file name.
   - Supercar: keep `Textures/` next to the FBX files.
2. Run `node scripts/generate-asset-paths.mjs`.
3. Use it: `<FBXModel url={MODELS.PRP_Helmet} fallback={...} />` or `loadFBX(MODELS.X)`.
4. Run `npx tsc --noEmit`, then `npm run dev` and check the Network tab for 404s. A missing model silently shows its procedural fallback.

## Maiko (boxer kit) → game
The kit's FBX exports embed 2048² textures (20–26 MB each), which is too heavy for the web. The web build:

```bash
# mesh from LOD1 + all 11 clips from the Unity FBX, embedded textures stripped
python3 -I scripts/art/build_web_character.py \
  ~/Downloads/Boxer_Character/Export/Boxer_LOD1.fbx \
  ~/Downloads/Boxer_Character/Export/Boxer_Character_Unity.fbx \
  public/models/Characters/Maiko/CHR_Maiko.fbx

# textures: Mobile_1024 set → JPEG, renamed T_Boxer_* → T_Maiko_*
for p in Skin Gloves Hair Boots Shorts Headband Eyes; do
  sips -s format jpeg -s formatOptions 85 art-source/maiko-boxer/Textures/Mobile_1024/T_Boxer_${p}_BaseColor.png --out public/models/Characters/Maiko/Textures/T_Maiko_${p}_BaseColor.jpg
  # Roughness q80, Normal q92 likewise (Eyes has BaseColor only)
done
node scripts/generate-asset-paths.mjs
```

`build_web_character.py` works on any binary FBX 7.x pair that shares a skeleton (bones are matched by name). It needs no Blender; it uses `scripts/art/fbxbin.py`.

Portrait: `public/sprites/Portraits/portrait_maiko_neutral.png` was cropped from `Preview/Boxer_Headshot.png` (520² crop at 50,75 → 256²).

## ⚠️ Current version drift (decision pending)
`public/` was populated from **kit v0.1** (now `archive/blender-kit-v0.1/`). Only Chandy (model, portraits, full sprite) and the Supercar came from v0.2.

| Asset group | v0.1 (in game) vs v0.2 (`art-source/blender-kit`) |
|-------------|----------------------------------------------------|
| Buildings, props, nature, vehicles FBX | Differ by ~50–150 bytes: most likely only export metadata |
| `CHR_Sokha`, `CHR_Sokunthea`, `CHR_Sreyneath`, `CHR_Taing`, `CHR_Vuth` | **Real changes** (~125 KB of differing bytes) |
| 126 sprites | Re-rendered (~6 KB larger each, same dimensions) |

Before syncing v0.2 into `public/`, check the characters in-game (scale, rig orientation, blendshapes, materials picked up by `enhanceMaterial`) and compare the sprites visually.

## Large files in git
`art-source/` and `archive/` are git-ignored and committed only as zips in `resources/`:
`scripts/pack-resources.sh` before committing (it rebuilds a zip only when its folder changed, so git doesn't store a new copy every time), and `scripts/unpack-resources.sh` after cloning. Each zip is ≤ 34 MB, under GitHub's 100 MB file limit. If the zips grow or change often, move `resources/*.zip` to Git LFS (`git lfs track "resources/*.zip"`).
