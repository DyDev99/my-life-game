"""Build a web-ready character FBX from a Blender export:

  * mesh + skeleton from a (lighter) LOD file,
  * every animation take grafted in from a second FBX with the same skeleton,
  * embedded textures (Video/Texture objects) removed — textures are shipped as
    separate files and applied in code.

Usage:
  python3 -I scripts/art/build_web_character.py <mesh.fbx> <anim.fbx> <out.fbx>

Example (Maiko):
  python3 -I scripts/art/build_web_character.py \
      ~/Downloads/Boxer_Character/Export/Boxer_LOD1.fbx \
      ~/Downloads/Boxer_Character/Export/Boxer_Character_Unity.fbx \
      public/models/Characters/Maiko/CHR_Maiko.fbx
"""
import os
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fbxbin  # noqa: E402

ANIM_TYPES = {"AnimationStack", "AnimationLayer", "AnimationCurveNode", "AnimationCurve"}
TEXTURE_TYPES = {"Video", "Texture"}


def obj_id(node):
    return struct.unpack("<q", node.props[0][1])[0]


def obj_name(node):
    return node.props[1][1].split(b"\x00")[0].decode("utf-8", "replace")


def set_id(node, new_id):
    t, _ = node.props[0]
    node.props[0] = (t, struct.pack("<q", new_id))


def conn_ids(c):
    return struct.unpack("<q", c.props[1][1])[0], struct.unpack("<q", c.props[2][1])[0]


def set_conn_ids(c, child, parent):
    c.props[1] = ("L", struct.pack("<q", child))
    c.props[2] = ("L", struct.pack("<q", parent))


def section(nodes, name):
    return next(n for n in nodes if n.name == name)


def main(mesh_path, anim_path, out_path):
    version, mesh_nodes, footer = fbxbin.load(mesh_path)
    _, anim_nodes, _ = fbxbin.load(anim_path)

    mesh_objs = section(mesh_nodes, "Objects")
    mesh_conns = section(mesh_nodes, "Connections")
    anim_objs = section(anim_nodes, "Objects")
    anim_conns = section(anim_nodes, "Connections")

    # 1. Strip embedded textures from the mesh file.
    removed = {obj_id(o) for o in mesh_objs.children if o.name in TEXTURE_TYPES}
    mesh_objs.children = [o for o in mesh_objs.children if o.name not in TEXTURE_TYPES]
    mesh_conns.children = [c for c in mesh_conns.children if not (set(conn_ids(c)) & removed)]
    # Drop any animation already in the mesh file (we replace it wholesale).
    old_anim = {obj_id(o) for o in mesh_objs.children if o.name in ANIM_TYPES}
    mesh_objs.children = [o for o in mesh_objs.children if o.name not in ANIM_TYPES]
    mesh_conns.children = [c for c in mesh_conns.children if not (set(conn_ids(c)) & old_anim)]

    # 2. Map skeleton/model ids by name: anim file -> mesh file.
    mesh_models = {obj_name(o): obj_id(o) for o in mesh_objs.children if o.name == "Model"}
    anim_models = {obj_id(o): obj_name(o) for o in anim_objs.children if o.name == "Model"}
    model_map = {}
    for aid, name in anim_models.items():
        if name in mesh_models:
            model_map[aid] = mesh_models[name]

    # 3. Copy animation objects with fresh ids.
    next_id = max(obj_id(o) for o in mesh_objs.children) + 1000
    anim_map = {}
    for o in anim_objs.children:
        if o.name in ANIM_TYPES:
            anim_map[obj_id(o)] = next_id
            set_id(o, next_id)
            next_id += 1
            mesh_objs.children.append(o)

    # 4. Copy connections that involve animation objects, remapping both ends.
    copied, skipped = 0, 0
    for c in anim_conns.children:
        child, parent = conn_ids(c)
        if child not in anim_map and parent not in anim_map:
            continue
        new_child = anim_map.get(child, model_map.get(child))
        new_parent = anim_map.get(parent, model_map.get(parent, 0 if parent == 0 else None))
        if new_child is None or new_parent is None:
            skipped += 1
            continue
        set_conn_ids(c, new_child, new_parent)
        mesh_conns.children.append(c)
        copied += 1

    # 5. Takes (clip list) from the animation file.
    takes = [n for n in anim_nodes if n.name == "Takes"]
    mesh_nodes = [n for n in mesh_nodes if n.name != "Takes"] + takes

    fbxbin.save(out_path, version, mesh_nodes, footer)
    stacks = [obj_name(o) for o in mesh_objs.children if o.name == "AnimationStack"]
    print(f"textures removed: {len(removed)} objects")
    print(f"animation objects grafted: {len(anim_map)}, connections: {copied} (skipped {skipped})")
    print(f"takes: {', '.join(stacks)}")
    print(f"wrote {out_path} ({os.path.getsize(out_path) / 1e6:.2f} MB)")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    main(*sys.argv[1:])
