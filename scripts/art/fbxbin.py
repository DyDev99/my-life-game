"""Minimal binary FBX (7.x) reader/writer: parse node tree, keep property bytes raw, re-serialise."""
import struct, zlib

HEADER = b"Kaydara FBX Binary  \x00\x1a\x00"


class Node:
    __slots__ = ("name", "props", "children")

    def __init__(self, name, props, children):
        self.name, self.props, self.children = name, props, children

    def find(self, name):
        return [c for c in self.children if c.name == name]


def _read_prop(buf, pos):
    t = chr(buf[pos]); pos += 1
    fixed = {"Y": 2, "C": 1, "I": 4, "F": 4, "D": 8, "L": 8}
    if t in fixed:
        n = fixed[t]
        return (t, buf[pos:pos + n]), pos + n
    if t in "fdlib":
        length, enc, clen = struct.unpack_from("<III", buf, pos)
        raw = buf[pos:pos + 12 + clen]
        return (t, raw), pos + 12 + clen
    if t in "SR":
        (length,) = struct.unpack_from("<I", buf, pos)
        return (t, buf[pos + 4:pos + 4 + length]), pos + 4 + length
    raise ValueError(f"unknown prop type {t!r} at {pos}")


def _read_node(buf, pos, wide):
    if wide:
        end, nprops, plen = struct.unpack_from("<QQQ", buf, pos); pos += 24
    else:
        end, nprops, plen = struct.unpack_from("<III", buf, pos); pos += 12
    nlen = buf[pos]; pos += 1
    if end == 0:
        return None, pos + nlen
    name = buf[pos:pos + nlen].decode("ascii", "replace"); pos += nlen
    props = []
    for _ in range(nprops):
        p, pos = _read_prop(buf, pos)
        props.append(p)
    children = []
    while pos < end:
        child, pos = _read_node(buf, pos, wide)
        if child is None:
            break
        children.append(child)
    return Node(name, props, children), end


def load(path):
    buf = open(path, "rb").read()
    assert buf[:23] == HEADER, "not a binary FBX"
    (version,) = struct.unpack_from("<I", buf, 23)
    wide = version >= 7500
    pos, nodes = 27, []
    while True:
        node, pos = _read_node(buf, pos, wide)
        if node is None:
            break
        nodes.append(node)
    footer = buf[pos:]
    return version, nodes, footer


def _prop_bytes(p):
    t, raw = p
    if t in "SR":
        return t.encode() + struct.pack("<I", len(raw)) + raw
    return t.encode() + raw


def _write_node(node, offset, wide):
    head = 25 if wide else 13
    name = node.name.encode("ascii")
    props = b"".join(_prop_bytes(p) for p in node.props)
    body = bytearray()
    child_off = offset + head + len(name) + len(props)
    for c in node.children:
        cb = _write_node(c, child_off + len(body), wide)
        body += cb
    if node.children:
        body += b"\x00" * head  # null record terminator
    end = offset + head + len(name) + len(props) + len(body)
    fmt = "<QQQ" if wide else "<III"
    return struct.pack(fmt, end, len(node.props), len(props)) + bytes([len(name)]) + name + props + bytes(body)


def save(path, version, nodes, footer):
    wide = version >= 7500
    head = 25 if wide else 13
    out = bytearray(HEADER + struct.pack("<I", version))
    for n in nodes:
        out += _write_node(n, len(out), wide)
    out += b"\x00" * head
    # footer: keep original bytes after top-level null record
    out += footer
    open(path, "wb").write(bytes(out))


def prop_value(p):
    t, raw = p
    if t == "S":
        return raw.decode("utf-8", "replace")
    if t == "I":
        return struct.unpack("<i", raw)[0]
    if t == "L":
        return struct.unpack("<q", raw)[0]
    if t == "D":
        return struct.unpack("<d", raw)[0]
    if t == "R":
        return f"<raw {len(raw)} bytes>"
    if t in "fdlib":
        n, enc, clen = struct.unpack_from("<III", raw)
        return f"<array {t}[{n}] {clen}B>"
    return raw


def size_of(node, wide=True):
    return len(_write_node(node, 0, wide))
