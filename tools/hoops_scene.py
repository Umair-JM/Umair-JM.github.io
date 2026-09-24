"""
Blender scene for the hoops game art.

Run headless, for example:
  blender -b -P tools/hoops_scene.py -- --out public/hoops --job all

The camera here is the same pinhole the game draws with. In game units the
camera sits at x 0, y 1.5, z -8 looking down +z, and a point (x, y, z) lands at
  sx = W/2 + x * f / (z + 8)
  sy = HORIZON * H - (y - 1.5) * f / (z + 8),  f = 3.1 * W
so the render and the physics agree pixel for pixel at any canvas width.

Everything is modelled and shaded procedurally: no external textures.
"""

import argparse
import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

# ---------------------------------------------------------------- game units
CAM = (0.0, 1.5, -8.0)      # x, y up, z depth, in game units
FOCAL_W = 3.1               # focal length as a multiple of canvas width
HORIZON = 0.40              # principal point, as a fraction of canvas height
ASPECT = 1.4                # canvas height / width, fixed so one render fits all

BALL_R = 0.3
HOOP = dict(y=3.05, z=8.0, r=0.65)
BOARD = dict(z=9.0, half_w=1.5, y0=2.6, y1=4.15)
WALL_Z = 15.6          # back wall, behind the stands
BOARD_FRONT = 11.0     # advertising board along the baseline
ROWS = [               # (depth, riser height) for the three tiers of seats
    (11.75, 0.00),
    (12.75, 0.42),
    (13.75, 0.84),
]
SEAT_H = 0.45          # seat above its own riser
BASELINE = 9.2
FT_Z = 5.2
THREE_R = 2.9


def g2b(x, y, z):
    """Game (x right, y up, z into screen) to Blender (x right, y depth, z up)."""
    return Vector((x, z, y))


# ------------------------------------------------------------------ utilities
_MAT_CACHE = {}


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    # The cached materials belong to the scene that was just thrown away.
    _MAT_CACHE.clear()


def mat(name, base, rough=0.6, metal=0.0, bump=None, emit=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*base, 1)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if emit:
        bsdf.inputs["Emission Color"].default_value = (*emit, 1)
        bsdf.inputs["Emission Strength"].default_value = 1.0
    if bump:
        scale, strength = bump
        tex = nt.nodes.new("ShaderNodeTexNoise")
        tex.inputs["Scale"].default_value = scale
        tex.inputs["Detail"].default_value = 6
        bmp = nt.nodes.new("ShaderNodeBump")
        bmp.inputs["Strength"].default_value = strength
        nt.links.new(tex.outputs["Fac"], bmp.inputs["Height"])
        nt.links.new(bmp.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def put(obj, loc, rot=(0, 0, 0), material=None, collection=None):
    obj.location = loc
    obj.rotation_euler = rot
    if material:
        obj.data.materials.append(material)
    return obj


def torus(major, minor, segs=64, rings=16):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
                                     major_segments=segs, minor_segments=rings)
    return bpy.context.object


def cylinder(r, depth, verts=48):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, vertices=verts)
    return bpy.context.object


def cube(size=2):
    """Size 2 spans +/-1, so every scale value below is a half extent."""
    bpy.ops.mesh.primitive_cube_add(size=size)
    return bpy.context.object


def smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


# -------------------------------------------------------------------- camera
def add_camera(width_px):
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.sensor_fit = "HORIZONTAL"
    cam_data.sensor_width = 36.0
    cam_data.lens = 36.0 * FOCAL_W          # f_px = FOCAL_W * W  =>  mm on a 36mm sensor
    # The game's principal point sits HORIZON down the frame, not at its middle.
    # Blender shifts in units of the sensor fit dimension, which is the width,
    # and a positive shift pushes the picture down, so this one is negative.
    # Verified against the game's own projection by the calibrate job.
    cam_data.shift_y = -(0.5 - HORIZON) * ASPECT
    cam = bpy.data.objects.new("Cam", cam_data)
    cam.location = g2b(*CAM)
    cam.rotation_euler = (math.pi / 2, 0, 0)   # look down +Y (game +z)
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    return cam


def project(x, y, z, width_px):
    """The game's own projection, in render pixels."""
    f = FOCAL_W * width_px
    s = f / (z - CAM[2])
    return (width_px / 2 + x * s, HORIZON * (width_px * ASPECT) - (y - CAM[1]) * s)


# --------------------------------------------------------------------- scene
def court():
    # Floorboards: bands across the width, with grain noise on top and a
    # varnish sheen that catches the lights.
    wood = mat("wood", (0.44, 0.27, 0.13), rough=0.22, bump=(60, 0.10))
    nt = wood.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    coord = nt.nodes.new("ShaderNodeTexCoord")
    boards = nt.nodes.new("ShaderNodeTexWave")
    boards.wave_type = "BANDS"
    boards.bands_direction = "X"
    boards.wave_profile = "SAW"
    boards.inputs["Scale"].default_value = 9.0
    boards.inputs["Distortion"].default_value = 0.0
    grain = nt.nodes.new("ShaderNodeTexNoise")
    grain.inputs["Scale"].default_value = 3.0
    grain.inputs["Detail"].default_value = 8
    grain.noise_dimensions = "3D"
    stretch = nt.nodes.new("ShaderNodeMapping")
    stretch.inputs["Scale"].default_value = (30.0, 0.8, 1.0)
    nt.links.new(coord.outputs["Object"], stretch.inputs["Vector"])
    nt.links.new(stretch.outputs["Vector"], grain.inputs["Vector"])
    nt.links.new(coord.outputs["Object"], boards.inputs["Vector"])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs["Factor"].default_value = 0.55
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.30, 0.17, 0.07, 1)
    ramp.color_ramp.elements[1].color = (0.62, 0.40, 0.20, 1)
    nt.links.new(boards.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], mix.inputs[6])
    ramp2 = nt.nodes.new("ShaderNodeValToRGB")
    ramp2.color_ramp.elements[0].color = (0.34, 0.19, 0.08, 1)
    ramp2.color_ramp.elements[1].color = (0.58, 0.37, 0.18, 1)
    nt.links.new(grain.outputs["Fac"], ramp2.inputs["Fac"])
    nt.links.new(ramp2.outputs["Color"], mix.inputs[7])
    nt.links.new(mix.outputs[2], bsdf.inputs["Base Color"])

    bpy.ops.mesh.primitive_plane_add(size=44)
    floor = put(bpy.context.object, g2b(0, 0, 4), material=wood)
    floor.name = "floor"

    # Back wall of the arena, dark so the court and the crowd read against it.
    wall = mat("wall", (0.030, 0.034, 0.045), rough=0.9)
    bpy.ops.mesh.primitive_plane_add(size=60)
    put(bpy.context.object, g2b(0, 8, WALL_Z), rot=(math.pi / 2, 0, 0), material=wall)

    concrete = mat("concrete", (0.032, 0.035, 0.042), rough=0.95)
    seatmat = mat("seat", (0.045, 0.055, 0.105), rough=0.7)

    # Three tiers of seating behind the baseline: a riser, then a row of seats.
    for depth, lift in ROWS:
        riser = cube()
        riser.scale = (6.2, 0.45, (lift + 0.24) / 2 if lift else 0.12)
        put(riser, g2b(0, (lift + 0.24) / 2 if lift else 0.12, depth), material=concrete)
        bench = cube()
        bench.scale = (6.0, 0.30, 0.05)
        put(bench, g2b(0, lift + SEAT_H, depth - 0.06), material=seatmat)
        backrest = cube()
        backrest.scale = (6.0, 0.03, 0.17)
        put(backrest, g2b(0, lift + SEAT_H + 0.20, depth + 0.24), material=seatmat)

    # Championship banners high on the back wall, clear of the backboard.
    # The banner trim moved out with the courtside layer, so it is local now.
    stripe = mat("bannertrim", (0.86, 0.88, 0.92), rough=0.35, emit=(0.30, 0.31, 0.34))
    bannerA = mat("bannerA", (0.30, 0.06, 0.09), rough=0.85, emit=(0.30, 0.07, 0.09))
    bannerB = mat("bannerB", (0.07, 0.11, 0.32), rough=0.85, emit=(0.07, 0.12, 0.34))
    for i, bx in enumerate((-3.4, -2.35, 2.35, 3.4)):
        b = cube()
        b.scale = (0.40, 0.68, 0.02)
        put(b, g2b(bx, 4.70, WALL_Z - 0.25), material=bannerA if i % 2 else bannerB)
        trim = cube()
        trim.scale = (0.40, 0.05, 0.015)
        put(trim, g2b(bx, 4.15, WALL_Z - 0.28), material=stripe)
        rod = cylinder(0.02, 0.8, verts=10)
        put(rod, g2b(bx, 5.33, WALL_Z - 0.25), rot=(0, math.pi / 2, 0), material=stripe)

    paint = mat("paint", (0.95, 0.95, 0.93), rough=0.3)
    key_paint = mat("key", (0.13, 0.22, 0.45), rough=0.35)
    line_w = 0.07

    def strip(x0, z0, x1, z1, m=paint, w=line_w, lift=0.004):
        dx, dz = x1 - x0, z1 - z0
        length = math.hypot(dx, dz)
        bpy.ops.mesh.primitive_plane_add(size=2)
        o = bpy.context.object
        o.scale = (length / 2, w / 2, 1)
        rot = (0, 0, -math.atan2(dz, dx))
        put(o, g2b((x0 + x1) / 2, lift, (z0 + z1) / 2), rot=rot, material=m)

    def arc(cx, cz, r, a0, a1, n=64, m=paint):
        pts = [(cx + math.sin(a0 + (a1 - a0) * i / n) * r,
                cz - math.cos(a0 + (a1 - a0) * i / n) * r) for i in range(n + 1)]
        for (x0, z0), (x1, z1) in zip(pts, pts[1:]):
            strip(x0, z0, x1, z1, m=m, w=line_w * 1.1)

    # The key is painted, as it is on a real court.
    bpy.ops.mesh.primitive_plane_add(size=2)
    keyfill = bpy.context.object
    keyfill.scale = (0.9, (BASELINE - FT_Z) / 2, 1)
    put(keyfill, g2b(0, 0.002, (FT_Z + BASELINE) / 2), material=key_paint)

    strip(-3.6, BASELINE, 3.6, BASELINE)
    strip(-0.9, FT_Z, 0.9, FT_Z)
    strip(-0.9, FT_Z, -0.9, BASELINE)
    strip(0.9, FT_Z, 0.9, BASELINE)
    arc(0, FT_Z, 0.9, -math.pi, math.pi)
    arc(0, HOOP["z"], THREE_R, -math.pi / 2, math.pi / 2)


def hoop_assembly(net_state=0.0):
    """Backboard, rim, net and the arms that carry it back to the wall."""
    glass = mat("board", (0.86, 0.90, 0.92), rough=0.12)
    glass.node_tree.nodes["Principled BSDF"].inputs["Specular IOR Level"].default_value = 0.8
    dark = mat("trim", (0.09, 0.09, 0.11), rough=0.45, metal=0.3)
    steel = mat("steel", (0.86, 0.26, 0.07), rough=0.3, metal=0.85)
    cord = mat("cord", (0.95, 0.95, 0.93), rough=0.85)

    w, h = BOARD["half_w"] * 2, BOARD["y1"] - BOARD["y0"]
    cy = (BOARD["y0"] + BOARD["y1"]) / 2

    panel = cube()
    panel.scale = (w / 2, 0.025, h / 2)
    put(panel, g2b(0, cy, BOARD["z"]), material=glass)

    # Padded frame around the glass.
    for (sx, sz, px, py) in [
        (w / 2 + 0.05, 0.05, 0.0, BOARD["y1"] + 0.03),
        (w / 2 + 0.05, 0.05, 0.0, BOARD["y0"] - 0.03),
        (0.05, h / 2 + 0.05, -(BOARD["half_w"] + 0.03), cy),
        (0.05, h / 2 + 0.05, BOARD["half_w"] + 0.03, cy),
    ]:
        bar = cube()
        bar.scale = (sx, 0.05, sz)
        put(bar, g2b(px, py, BOARD["z"]), material=dark)

    # The shooter's square.
    sq_w, sq_h = 0.62, 0.46
    for (sx, sz, px, py) in [
        (sq_w, 0.022, 0.0, HOOP["y"] + sq_h),
        (sq_w, 0.022, 0.0, HOOP["y"] + 0.01),
        (0.022, sq_h / 2, -sq_w, HOOP["y"] + sq_h / 2),
        (0.022, sq_h / 2, sq_w, HOOP["y"] + sq_h / 2),
    ]:
        bar = cube()
        bar.scale = (sx, 0.012, sz)
        put(bar, g2b(px, py, BOARD["z"] - 0.03), material=dark)

    ring = smooth(torus(HOOP["r"], 0.035, segs=96, rings=12))
    put(ring, g2b(0, HOOP["y"], HOOP["z"]), material=steel)
    plate = cube()
    plate.scale = (0.12, (BOARD["z"] - HOOP["z"] + HOOP["r"]) / 2, 0.055)
    put(plate, g2b(0, HOOP["y"], (HOOP["z"] + HOOP["r"] + BOARD["z"]) / 2), material=steel)

    # Net: strands drawn in to the throat, then flaring out again.
    strands = 16
    drop = 0.66 + net_state * 0.40
    throat = 0.60 - net_state * 0.10
    for i in range(strands):
        a = 2 * math.pi * i / strands
        top = Vector((math.sin(a) * HOOP["r"], math.cos(a) * HOOP["r"]))
        pts = [
            g2b(top.x, HOOP["y"], HOOP["z"] + top.y),
            g2b(top.x * 0.86, HOOP["y"] - drop * 0.3, HOOP["z"] + top.y * 0.86),
            g2b(top.x * (throat + 0.06), HOOP["y"] - drop * 0.68, HOOP["z"] + top.y * (throat + 0.06)),
            g2b(top.x * throat, HOOP["y"] - drop, HOOP["z"] + top.y * throat),
        ]
        curve = bpy.data.curves.new(f"cord{i}", "CURVE")
        curve.dimensions = "3D"
        curve.bevel_depth = 0.011
        curve.resolution_u = 4
        spline = curve.splines.new("NURBS")
        spline.points.add(len(pts) - 1)
        for j, p in enumerate(pts):
            spline.points[j].co = (p.x, p.y, p.z, 1)
        spline.use_endpoint_u = True
        obj = bpy.data.objects.new(f"cord{i}", curve)
        obj.data.materials.append(cord)
        bpy.context.collection.objects.link(obj)

    for depth, scale in ((drop * 0.32, 0.88), (drop * 0.68, throat + 0.06), (drop, throat)):
        r = HOOP["r"] * scale
        ring2 = smooth(torus(r, 0.007, segs=64, rings=8))
        put(ring2, g2b(0, HOOP["y"] - depth, HOOP["z"]), material=cord)

    # The stanchion: a padded base behind the baseline carrying the backboard.
    STANCH_Z = 10.95
    padding = mat("stanchpad", (0.10, 0.11, 0.145), rough=0.9)
    padstripe = mat("stanchstripe", (0.10, 0.24, 0.52), rough=0.5, emit=(0.05, 0.12, 0.28))
    steel2 = mat("stanchsteel", (0.13, 0.14, 0.17), rough=0.45, metal=0.6)
    base = cube()
    base.scale = (0.70, 0.42, 0.50)
    put(base, g2b(0, 0.42, STANCH_Z), material=padding)
    band = cube()
    band.scale = (0.705, 0.07, 0.505)
    put(band, g2b(0, 0.56, STANCH_Z), material=padstripe)
    column = cube()
    column.scale = (0.13, 1.55, 0.13)
    put(column, g2b(0, 2.38, STANCH_Z), material=steel2)
    boom = cube()
    boom.scale = (0.11, 0.115, (STANCH_Z - BOARD["z"]) / 2 + 0.08)
    put(boom, g2b(0, 3.95, (BOARD["z"] + STANCH_Z) / 2), material=steel2)
    for side in (-1, 1):
        stay = cube()
        stay.scale = (0.045, 0.045, 0.66)
        put(stay, g2b(side * 0.40, 3.28, 9.85), rot=(math.radians(32), 0, 0), material=steel2)


# The stands are two stops down on the court, as they are in an arena.
STAND_DIM = 0.85
BENCH_DIM = 0.72
SKINS = [(0.42, 0.27, 0.18), (0.62, 0.44, 0.31), (0.30, 0.18, 0.11),
         (0.76, 0.58, 0.44), (0.22, 0.13, 0.08), (0.52, 0.35, 0.23)]
SHIRTS = [(0.55, 0.09, 0.11), (0.08, 0.16, 0.45), (0.85, 0.72, 0.18),
          (0.10, 0.36, 0.22), (0.72, 0.72, 0.76), (0.34, 0.10, 0.42),
          (0.90, 0.42, 0.08), (0.06, 0.08, 0.12)]
LEGWEAR = [(0.10, 0.12, 0.18), (0.16, 0.16, 0.19), (0.07, 0.09, 0.14), (0.30, 0.30, 0.34)]
HAIRS = [(0.04, 0.03, 0.03), (0.16, 0.10, 0.05), (0.32, 0.24, 0.12), (0.05, 0.05, 0.06)]


def flat(rgb, rough=0.75, dim=1.0):
    """One material per colour, so a crowd does not create hundreds."""
    rgb = tuple(c * dim for c in rgb)
    key = (round(rgb[0], 3), round(rgb[1], 3), round(rgb[2], 3), rough)
    if key not in _MAT_CACHE:
        _MAT_CACHE[key] = mat(f"c{len(_MAT_CACHE)}", rgb, rough=rough)
    return _MAT_CACHE[key]


def limb(p0, p1, r, material, parts):
    """A capsule from p0 to p1, both in game coordinates."""
    a, b = g2b(*p0), g2b(*p1)
    d = b - a
    length = d.length
    if length < 1e-4:
        return
    o = smooth(cylinder(r, length, verts=12))
    o.location = (a + b) / 2
    o.rotation_mode = "QUATERNION"
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d)
    o.data.materials.append(material)
    parts.append(o)


def blob(at, r, material, parts, squash=1.0):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, segments=14, ring_count=8)
    o = smooth(bpy.context.object)
    o.location = g2b(*at)
    o.scale = (1, 1, squash)
    o.data.materials.append(material)
    parts.append(o)


def person(x, z, h, pose, seed, base_y=0.0, dim=1.0):
    """A spectator. Pose is sit, stand or cheer; cheer throws the arms up.

    Built from capsules between named joints, so the limbs bend at the elbow
    and the knee instead of being one stiff stick.
    """
    import random
    rng = random.Random(seed)
    skin = flat(SKINS[rng.randrange(len(SKINS))], 0.62, dim)
    shirt = flat(SHIRTS[rng.randrange(len(SHIRTS))], 0.75, dim)
    legs = flat(LEGWEAR[rng.randrange(len(LEGWEAR))], 0.75, dim)
    hair = flat(HAIRS[rng.randrange(len(HAIRS))], 0.85, dim)
    parts = []
    turn = rng.uniform(-0.12, 0.12)          # a little sideways lean
    zz = z + rng.uniform(-0.05, 0.05)

    def P(dx, dy, dz=0.0):
        return (x + dx + turn * dy * 0.2, base_y + dy, zz + dz)

    seated = pose == "sit"
    hip_y = SEAT_H if seated else h * 0.50
    shoulder_y = hip_y + h * (0.30 if seated else 0.32)
    head_y = shoulder_y + h * 0.13
    half_sh = h * 0.115

    # legs
    for side in (-1, 1):
        hip = P(side * h * 0.055, hip_y)
        if seated:
            knee = P(side * h * 0.075, hip_y - 0.02, -h * 0.25)
            ankle = P(side * h * 0.075, base_y + 0.02 - hip_y + hip_y - h * 0.26, -h * 0.22)
            ankle = (knee[0], base_y + 0.05, knee[2] - h * 0.02)
        else:
            knee = P(side * h * 0.06, hip_y - h * 0.24)
            ankle = P(side * h * 0.06, base_y + 0.04)
        limb(hip, knee, h * 0.052, legs, parts)
        limb(knee, ankle, h * 0.042, legs, parts)

    # torso, shoulders, head
    hips_mid, sh_mid = P(0, hip_y), P(0, shoulder_y)
    limb(hips_mid, sh_mid, h * 0.105, shirt, parts)
    limb(P(-half_sh, shoulder_y), P(half_sh, shoulder_y), h * 0.062, shirt, parts)
    limb(P(0, shoulder_y), P(0, head_y - h * 0.045), h * 0.035, skin, parts)
    blob(P(0, head_y), h * 0.072, skin, parts, squash=1.12)
    blob((P(0, head_y + h * 0.02)[0], P(0, head_y + h * 0.02)[1], zz + h * 0.012),
         h * 0.074, hair, parts, squash=0.78)

    # arms: down when watching, up when cheering
    for side in (-1, 1):
        sh = P(side * half_sh, shoulder_y)
        if pose == "cheer":
            elbow = P(side * (half_sh + h * 0.07), shoulder_y + h * 0.14)
            hand = P(side * (half_sh + h * 0.10 + rng.uniform(0, 0.04)),
                     shoulder_y + h * (0.30 + rng.uniform(0, 0.05)))
        elif seated:
            elbow = P(side * (half_sh + h * 0.02), shoulder_y - h * 0.15)
            hand = P(side * (half_sh + h * 0.01), shoulder_y - h * 0.22, -h * 0.12)
        else:
            elbow = P(side * (half_sh + h * 0.015), shoulder_y - h * 0.16)
            hand = P(side * (half_sh + h * 0.03), shoulder_y - h * 0.30)
        limb(sh, elbow, h * 0.040, skin if pose == "cheer" else shirt, parts)
        limb(elbow, hand, h * 0.034, skin, parts)

    return parts


def crowd(pose):
    """The public in the stands, plus the two team benches courtside.

    Pose 0 is watching. Poses 1 and 2 are the crowd up and cheering, with the
    figures out of step so the swap between them reads as movement.
    """
    import random
    rng = random.Random(7)
    cheering = pose > 0

    for row, (depth, lift) in enumerate(ROWS):
        n = 13 + row
        for i in range(n):
            x = -3.45 + (6.9 * i) / (n - 1) + rng.uniform(-0.06, 0.06)
            seed = row * 100 + i
            h = rng.uniform(1.52, 1.86) if rng.random() > 0.22 else rng.uniform(1.15, 1.35)
            if cheering:
                # Not everyone is on their feet at the same instant.
                up = (i + row + pose) % 3 != 0
                hop = 0.0
                if up:
                    hop = (0.07 if (i + pose) % 2 else 0.02) * (1.3 if pose == 2 else 0.7)
                person(x, depth, h, "cheer" if up else "stand", seed, base_y=lift + hop, dim=STAND_DIM)
            else:
                person(x, depth, h, "sit", seed, base_y=lift, dim=STAND_DIM)

    # Bench players: taller, seated, in team colours, standing when it goes in.
    for side in (-1, 1):
        for k in range(3):
            x = side * 2.75 + (k - 1) * 0.78
            seed = 900 + side * 10 + k
            h = rng.uniform(1.80, 1.96)
            if cheering and (k + pose) % 2 == 0:
                person(x, 10.1, h, "cheer", seed, base_y=0.06, dim=BENCH_DIM)
            else:
                person(x, 10.15, h, "sit", seed, base_y=0.0, dim=BENCH_DIM)



def courtside():
    """Things that stand between the crowd and the court: the advertising
    board along the baseline and the two team benches. They never move, so
    they are their own still layer drawn over the crowd."""
    bench_mat = mat("teambench", (0.09, 0.10, 0.13), rough=0.6)
    stripe = mat("adstripe", (0.86, 0.88, 0.92), rough=0.35)
    adtrim = mat("adtrim", (0.5, 0.52, 0.56), rough=0.4, emit=(0.5, 0.52, 0.58))
    board_face = mat("adboard", (0.06, 0.13, 0.30), rough=0.35, emit=(0.09, 0.22, 0.55))

    # Team benches at courtside, either side of the basket.
    for side in (-1, 1):
        seat = cube()
        seat.scale = (0.95, 0.04, 0.24)
        put(seat, g2b(side * 2.75, 0.45, 10.1), material=bench_mat)
        for dx in (-0.8, 0.0, 0.8):
            leg = cube()
            leg.scale = (0.04, 0.225, 0.04)
            put(leg, g2b(side * 2.75 + dx, 0.225, 10.1), material=bench_mat)

    # The advertising board along the baseline, in front of the first row.
    ad = cube()
    ad.scale = (6.0, 0.52, 0.06)
    put(ad, g2b(0, 0.52, BOARD_FRONT), material=board_face)
    for py, hy in ((0.86, 0.035), (0.20, 0.02)):
        s = cube()
        s.scale = (5.98, hy, 0.01)
        put(s, g2b(0, py, BOARD_FRONT - 0.07), material=adtrim)



def ball_object():
    bpy.ops.mesh.primitive_uv_sphere_add(radius=BALL_R, segments=64, ring_count=32)
    ball = smooth(bpy.context.object)
    skin = mat("leather", (0.72, 0.26, 0.05), rough=0.55, bump=(520, 0.32))
    ball.data.materials.append(skin)

    seam = mat("seam", (0.05, 0.03, 0.02), rough=0.7)
    # Two great circles and two latitude lines: the classic eight panel look.
    seams = []
    # One ring around the equator and one meridian. A ring rotated about X
    # would sit edge on to the camera and vanish into the silhouette, so the
    # meridian turns about Y instead.
    for rot in ((0, 0, 0), (0, math.pi / 2, 0)):
        t = smooth(torus(BALL_R, 0.009, segs=96, rings=8))
        put(t, (0, 0, 0), rot=rot, material=seam)
        seams.append(t)
    for lat in (0.52, -0.52):
        r = BALL_R * math.cos(lat)
        t = smooth(torus(r, 0.009, segs=96, rings=8))
        put(t, (0, 0, BALL_R * math.sin(lat)), material=seam)
        seams.append(t)

    ball["seams"] = len(seams)
    for s in seams:
        s.parent = ball
    return ball


def lighting(dim=False):
    k = 0.45 if dim else 1.0
    key = bpy.data.lights.new("key", "AREA")
    key.energy = 520 * k
    key.size = 5
    o = bpy.data.objects.new("key", key)
    o.location = g2b(-3.0, 8.0, 3.2)
    o.rotation_euler = (math.radians(52), 0, math.radians(-38))
    bpy.context.collection.objects.link(o)

    fill = bpy.data.lights.new("fill", "AREA")
    fill.energy = 190 * k
    fill.size = 9
    o2 = bpy.data.objects.new("fill", fill)
    o2.location = g2b(4.0, 6.5, 1.0)
    o2.rotation_euler = (math.radians(62), 0, math.radians(46))
    bpy.context.collection.objects.link(o2)

    back = bpy.data.lights.new("back", "AREA")
    back.energy = 150 * k
    back.size = 6
    o3 = bpy.data.objects.new("back", back)
    o3.location = g2b(0, 5.5, 10.2)
    o3.rotation_euler = (math.radians(-120), 0, 0)
    bpy.context.collection.objects.link(o3)

    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.04, 0.05, 0.07, 1)
    bg.inputs["Strength"].default_value = (0.35 if not dim else 0.15)
    bpy.context.scene.world = world


def render_setup(width, transparent, samples=64):
    sc = bpy.context.scene
    try:
        sc.render.engine = "BLENDER_EEVEE_NEXT"
    except TypeError:
        sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x = width
    sc.render.resolution_y = int(round(width * ASPECT))
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = transparent
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA" if transparent else "RGB"
    sc.view_settings.view_transform = "AgX"
    try:
        sc.view_settings.look = "AgX - Punchy"
    except TypeError:
        pass
    sc.view_settings.exposure = 0.2
    try:
        sc.eevee.taa_render_samples = samples
    except AttributeError:
        pass
    try:
        sc.eevee.use_raytracing = True       # floor sheen and soft shadows
        sc.eevee.use_shadows = True
    except AttributeError:
        pass


def render_to(path):
    bpy.context.scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)
    print("wrote", path)


# ---------------------------------------------------------------------- jobs
def job_calibrate(out, width):
    """Markers at known world points, to prove the camera matches the game."""
    clear()
    add_camera(width)
    lighting()
    glow = mat("marker", (1, 1, 1), rough=0.1, emit=(4, 4, 4))
    pts = [(0, 0, 0), (0, HOOP["y"], HOOP["z"]), (1.0, 1.0, 4.0), (-1.0, 2.0, 2.0)]
    for p in pts:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.06, segments=16, ring_count=8)
        put(smooth(bpy.context.object), g2b(*p), material=glow)
    render_setup(width, transparent=False, samples=16)
    render_to(out / "calibrate.png")
    expect = [project(*p, width) for p in pts]
    print("EXPECT", [(round(u, 1), round(v, 1)) for u, v in expect])


def job_court(out, width):
    clear()
    add_camera(width)
    lighting()
    court()
    render_setup(width, transparent=False, samples=96)
    render_to(out / "court.png")


def job_front(out, width):
    """The still courtside layer, drawn over the crowd."""
    clear()
    add_camera(width)
    lighting()
    courtside()
    render_setup(width, transparent=True, samples=96)
    render_to(out / "front.png")


def job_hoop(out, width):
    for i, state in enumerate((0.0, 0.5, 1.0)):
        clear()
        add_camera(width)
        lighting()
        hoop_assembly(net_state=state)
        render_setup(width, transparent=True, samples=96)
        render_to(out / f"hoop{i}.png")


def job_ball(out, frames, size):
    """The ball on its own, lit like the court, seen down the game's axis.

    An orthographic camera keeps the sprite the same size in every frame, so
    the game can scale it to whatever the projection asks for.
    """
    clear()
    cam_data = bpy.data.cameras.new("BallCam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = BALL_R * 2 * 1.12       # a little air around the ball
    cam = bpy.data.objects.new("BallCam", cam_data)
    cam.location = g2b(0, 0, -4)
    cam.rotation_euler = (math.pi / 2, 0, 0)
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam

    # Three point rig in the same directions as the court lights.
    for name, loc, energy, radius in [
        ("key", (-1.6, 1.8, -1.4), 260, 1.6),
        ("fill", (1.8, 0.4, -1.2), 90, 2.2),
        ("rim", (0.6, 1.4, 1.8), 140, 1.4),
    ]:
        lamp = bpy.data.lights.new(name, "POINT")
        lamp.energy = energy
        lamp.shadow_soft_size = radius
        o = bpy.data.objects.new(name, lamp)
        o.location = g2b(*loc)
        bpy.context.collection.objects.link(o)

    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    bgn = world.node_tree.nodes["Background"]
    bgn.inputs["Color"].default_value = (0.20, 0.22, 0.26, 1)
    bgn.inputs["Strength"].default_value = 0.55
    bpy.context.scene.world = world

    ball = ball_object()
    parts = [ball] + list(ball.children)
    for o in parts:
        o.parent = None
    bpy.context.view_layer.update()
    # Each seam has its own orientation and offset, so spin the whole ball by
    # composing the turn with each part's own transform.
    base = {o.name: o.matrix_world.copy() for o in parts}

    render_setup(size, transparent=True, samples=64)
    sc = bpy.context.scene
    sc.render.resolution_y = size
    for f in range(frames):
        # Backspin: the ball turns about the screen horizontal axis.
        spin = Matrix.Rotation(2 * math.pi * f / frames, 4, "X")
        for o in parts:
            o.matrix_world = spin @ base[o.name]
        render_to(out / f"ball_{f:02d}.png")



def job_kids(out, width):
    """Three crowd layers: watching, cheering, cheering harder."""
    for pose in (0, 1, 2):
        clear()
        add_camera(width)
        lighting()
        # House lights over the stands: enough to read faces and colours,
        # well under the court, the way an arena is lit.
        house = bpy.data.lights.new("house", "AREA")
        house.energy = 900
        house.size = 10
        ho = bpy.data.objects.new("house", house)
        ho.location = g2b(0, 7.5, 12.6)
        ho.rotation_euler = (math.radians(38), 0, 0)
        bpy.context.collection.objects.link(ho)
        # And a low one behind them to put an edge on the silhouettes.
        rim = bpy.data.lights.new("crowdrim", "AREA")
        rim.energy = 160
        rim.size = 7
        ro = bpy.data.objects.new("crowdrim", rim)
        ro.location = g2b(0, 2.6, 15.0)
        ro.rotation_euler = (math.radians(-100), 0, 0)
        bpy.context.collection.objects.link(ro)
        crowd(pose)
        render_setup(width, transparent=True, samples=64)
        render_to(out / f"crowd{pose}.png")


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--job", default="all")
    ap.add_argument("--width", type=int, default=720)
    ap.add_argument("--ball-size", type=int, default=192)
    ap.add_argument("--ball-frames", type=int, default=24)
    a = ap.parse_args(argv)
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)

    if a.job in ("calibrate",):
        job_calibrate(out, a.width)
    if a.job in ("court", "all"):
        job_court(out, a.width)
    if a.job in ("front", "all"):
        job_front(out, a.width)
    if a.job in ("hoop", "all"):
        job_hoop(out, a.width)
    if a.job in ("kids", "all"):
        job_kids(out, a.width)
    if a.job in ("ball", "all"):
        job_ball(out, a.ball_frames, a.ball_size)


main()
