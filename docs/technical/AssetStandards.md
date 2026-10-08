# Asset Standards

## Where assets live

| Folder | Contents | Served? |
|--------|----------|---------|
| `public/models/<Category>/` | Game-ready FBX loaded at runtime (`Buildings`, `Characters`, `Nature`, `Props`, `Vehicles`, `Vehicles/Supercar` + `Textures/`) | Yes, at `/models/...` |
| `public/sprites/<Category>/` | Game-ready PNG (`Characters`, `Icons`, `Inventory`, `Portraits`, `Thumbnails`, `UI`) | Yes, at `/sprites/...` |
| `art-source/blender-kit/` | `MyLife_Kit.blend`, `mylife_kit.py`, `manifest.json`, raw exports (`Models/`, `Sprites/`), `Previews/`, Unity scripts | No |
| `art-source/maiko-boxer/` | Maiko kit: `Boxer_Character.blend`, `Textures/` (2048) + `Textures/Mobile_1024/`, `Preview/`, Blender `scripts/`. The 90 MB `Export/` and 50 MB `Source/` high-poly bake file were **not** copied (originals in `~/Downloads/Boxer_Character`) | No |
| `art-source/supercar/` | `Supercar.blend`, `supercar_kit.py`, LOD FBX, `Textures/`, `Previews/`, `car_report.json` | No |
| `archive/` | Superseded material (kit v0.1 zip, old README, v0.1 render, template SVGs) | No |
| `resources/` | `art-source-<kit>.zip` + `archive.zip`: the committed form of the two folders above (they are git-ignored) | No |

Rules:
- `public/` holds only files the game can load. No `.blend` files, no preview renders, no zips.
- Keep folder names the same between the kit export and `public/` (`Models/Buildings` → `public/models/Buildings`).
- `public/models/Vehicles/Supercar/Textures/` must stay next to the Supercar FBX files: `FBXLoader` resolves the embedded texture paths relative to the FBX.

## Naming

| Prefix | Type | Example |
|--------|------|---------|
| `CHR_` | Character model | `CHR_Chandy.fbx` |
| `VEH_` | Vehicle model | `VEH_Motorbike_Red.fbx` |
| `CAR_` | Car (with `_LOD0..3`) | `CAR_Supercar_LOD1.fbx` |
| `BLD_` | Building | `BLD_Shophouse_Mint.fbx` |
| `ENV_` | Nature / ground tile | `ENV_Tile_RicePaddy.fbx` |
| `PRP_` | Prop | `PRP_IcedCoffee.fbx` |
| `T_` | Texture (`_Normal` suffix for normal maps) | `T_Carbon_Normal.png` |
| `portrait_<char>_<expr>` | Character portrait | `portrait_sokha_smile.png` |
| `inv_`, `icon_`, `btn_`, `ui_`, `char_<id>_full` | Inventory icon, stat icon, round button, 9-slice UI, full-body sprite | `inv_krama.png` |
| `<prefix>_<name>` lowercase | Thumbnails | `bld_pagoda.png` |

Variants use a suffix: `_Blue`, `_B`. Never use `_new`, `_final`, `_old`, or `_v2`. Version lives in the kit README/manifest, and git holds history.

Asset names must be unique across folders. The registry generator fails on duplicates.

## Characters with their own rig (e.g. Maiko)
- Folder: `public/models/Characters/<Name>/CHR_<Name>.fbx` + `Textures/T_<Name>_<Part>_{BaseColor,Normal,Roughness}.jpg`.
- FBX: one LOD mesh + all animation takes, **no embedded textures** (build with `scripts/art/build_web_character.py`).
- Textures: 1024² (Mobile set), JPEG (colour q85, roughness q80, normal q92). Material names must map to texture parts in `MATERIAL_TEXTURE_SET` (`ClipCharacterAvatar.tsx`).
- Clip names: `Armature|Boxer_<Clip>` → `<Clip>`; the avatar expects `Idle, Walk, Run, Jab, Cross, Hook, Guard, Dodge, Crouch, Victory` (`Defeat` is available but unused).
- Maiko: 18,854 tris (LOD1), 6.65 MB FBX + 1.4 MB textures, loaded only when selected.

## Units and transforms (from the kit)
- 1 unit = 1 metre. Characters are about 1.8 m tall.
- Pivot at the centre of the footprint, on the ground.
- Ground tiles are 10 × 10 m.

## Budgets (GDD §13.3: 3 GB Android, 30 fps)
| Group | Triangles each |
|-------|----------------|
| Characters | 3,400–4,400 (Chandy ≈ 16,000; Maiko ≈ 18,900 using LOD1, the exceptions) |
| Large buildings | ≤ 2,500 |
| Shophouse / stall | ~900 |
| Vehicles | ≤ 2,700 (Supercar uses LODs) |
| Trees / props | ≤ 1,100 |
| Textures | ≤ 1024², power of two. Sprites: icons 256², portraits/characters ≤ 512×768 |

## Wired vs available assets (2026-10-08)

**Wired** (referenced via `MODELS`/`SPRITES`): 22 of 53 models, 11 of 134 sprites.
- Models: `BLD_Bridge`, `BLD_CoffeeStall`, `BLD_MarketStall_Blue/Red`, `BLD_Pagoda`, `BLD_School`, `BLD_Shophouse_Blue`, `BLD_StiltHouse_B`, `CAR_Supercar_LOD1`, all 6 `CHR_*`, `ENV_Bush`, `ENV_CoconutPalm`, `ENV_SugarPalm`, `ENV_Tree`, `VEH_Motorbike_Blue/Red`, `VEH_Remork`.
- Sprites: 6 portraits (`*_smile`, `chandy_fierce`) and 5 inventory icons (`phone`, `motokey`, `notebook`, `krama`, `icedcoffee`).

**Available, not yet wired** (kept on purpose as the asset library): all 14 `PRP_*`, the remaining shophouse/stall colours, `BLD_StiltHouse`, ground tiles, `ENV_*_B` variants, `VEH_Bicycle` (the bicycle is currently procedural), Supercar LOD0/2/3, and the `Icons`, `Thumbnails`, `UI` and `Characters` sprite sets.

To check what's wired:
```bash
grep -rhoE "(MODELS|SPRITES)\.[A-Za-z0-9_]+" src | sort -u
```
