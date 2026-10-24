# Builds the Popsule product models and exports them for the website.
#
#   /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup -P blender/models.py
#   npx @gltf-transform/cli@4 meshopt public/models/popsule.glb public/models/popsule.glb
#
# The second step shrinks the file about 4x; the site unpacks it on load
# (src/components/product/model.ts).
#
# Writes public/models/popsule.glb with these named meshes (all in metres-ish
# scene units, each standing on its own origin):
#   Jar_Glass, Jar_Thread, Jar_Lid, Jar_Label
#   Can_Body (open, hollow), Can_Lid, Can_Line, Can_Label
#   Capsule
# Materials are assigned in three.js so each product can recolour them; meshes
# only carry geometry and cylindrical UVs (u around, v up). glTF turns Blender's
# -Y (front) into +Z, so the front of every label is at u = 0.25.

import bpy, bmesh, math, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "models", "popsule.glb")
STEPS = 128

bpy.ops.wm.read_factory_settings(use_empty=True)


def rounded_cyl(r, h, rad, z0=0.0, steps=8, close_top=True, close_bottom=True):
    pts = [(0, z0)] if close_bottom else []
    for i in range(steps + 1):
        a = -math.pi / 2 + (math.pi / 2) * i / steps
        pts.append((r - rad + rad * math.cos(a), z0 + rad + rad * math.sin(a)))
    for i in range(steps + 1):
        a = (math.pi / 2) * i / steps
        pts.append((r - rad + rad * math.cos(a), z0 + h - rad + rad * math.sin(a)))
    if close_top:
        pts.append((0, z0 + h))
    return pts


def lathe(name, prof, steps=STEPS):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0, z)) for r, z in prof]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, axis=(0, 0, 1), cent=(0, 0, 0), angle=math.tau, steps=steps)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    for f in me.polygons:
        f.use_smooth = True
    return ob


def cylinder_uv(ob, z0, z1):
    # u wraps around the axis, v runs from z0 to z1. Faces that straddle the
    # seam get their low u values lifted by 1 so no face spans the whole texture.
    me = ob.data
    uv = me.uv_layers.new(name="UVMap")
    for poly in me.polygons:
        us = []
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            us.append((math.atan2(co.y, co.x) / math.tau + 0.5) % 1.0)
        wrap = max(us) - min(us) > 0.5
        for li, u in zip(poly.loop_indices, us):
            co = me.vertices[me.loops[li].vertex_index].co
            if wrap and u < 0.5:
                u += 1.0
            uv.data[li].uv = (u, (co.z - z0) / (z1 - z0))


def apply_solidify(ob, thickness, offset=1):
    mod = ob.modifiers.new("shell", "SOLIDIFY")
    mod.thickness = thickness
    # Open shells come out of recalc with inward normals, so +1 grows the wall
    # inward. A shell with a closed base recalcs the other way and needs -1.
    mod.offset = offset
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.modifier_apply(modifier=mod.name)
    ob.select_set(False)


# ---------- shelf jar ----------
JAR_R, JAR_H = 0.78, 1.45
glass = lathe("Jar_Glass", rounded_cyl(JAR_R, JAR_H, 0.16, close_top=False) + [(JAR_R - 0.06, JAR_H)])
apply_solidify(glass, 0.07)
cylinder_uv(glass, 0, JAR_H)

# Screw thread finish on the neck, softly visible through the frosted glass.
thread = []
for i in range(5):
    z = 1.3 + i * 0.028
    thread += [(JAR_R + 0.002, z), (JAR_R + 0.012, z + 0.01), (JAR_R + 0.002, z + 0.02)]
lathe("Jar_Thread", thread)

lid = lathe("Jar_Lid", rounded_cyl(0.82, 0.36, 0.05, z0=1.43))
cylinder_uv(lid, 1.43, 1.79)

jar_label = lathe("Jar_Label", [(JAR_R + 0.004, 0.42), (JAR_R + 0.004, 1.12)], steps=STEPS)
cylinder_uv(jar_label, 0.42, 1.12)

# ---------- refill canister ----------
CAN_R, CAN_H = 0.72, 1.35
# An open can: thin aluminium wall, inner floor and a rolled rim, so it reads
# as hollow (with capsules inside) once the lid comes off.
CAN_WALL = 0.035
def can_profile():
    rad, bead = 0.05, 0.012
    pts = [(0, 0)]
    # Rounded base corner, then the straight wall.
    pts += [(CAN_R - rad + rad * math.cos(a), rad + rad * math.sin(a)) for a in [-math.pi / 2 + (math.pi / 2) * i / 8 for i in range(9)]]
    # Rolled bead over the top edge, outside to inside.
    cx, cz = CAN_R - bead, CAN_H - bead
    pts += [(cx + bead * math.cos(a), cz + bead * math.sin(a)) for a in [(math.pi) * i / 10 for i in range(11)]]
    return pts
body = lathe("Can_Body", can_profile())
apply_solidify(body, CAN_WALL, offset=-1)
cylinder_uv(body, 0, CAN_H)
can_lid = lathe("Can_Lid", rounded_cyl(CAN_R + 0.015, 0.38, 0.05, z0=1.3))
cylinder_uv(can_lid, 1.3, 1.68)
line = lathe("Can_Line", rounded_cyl(CAN_R + 0.004, 0.022, 0.008, z0=0.42, steps=3, close_top=False, close_bottom=False))
can_label = lathe("Can_Label", [(CAN_R + 0.003, 0.55), (CAN_R + 0.003, 1.2)], steps=STEPS)
cylinder_uv(can_label, 0.55, 1.2)

# ---------- capsule ----------
r, length = 0.055, 0.16
cap = [(0, -length / 2 - r)]
cap += [(r * math.cos(a), -length / 2 + r * math.sin(a)) for a in [-math.pi / 2 + (math.pi / 2) * i / 8 for i in range(1, 9)]]
cap += [(r * math.cos(a), length / 2 + r * math.sin(a)) for a in [(math.pi / 2) * i / 8 for i in range(9)]]
cap += [(0, length / 2 + r)]
lathe("Capsule", cap, steps=24)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    export_apply=True,
    export_normals=True,
    export_texcoords=True,
    export_materials="NONE",
    export_yup=True,
)
print("Exported", OUT)
