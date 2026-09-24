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
WALL_Z = 10.6
BASELINE = 9.2
FT_Z = 5.2
THREE_R = 2.9


def g2b(x, y, z):
    """Game (x right, y up, z into screen) to Blender (x right, y depth, z up)."""
    return Vector((x, z, y))


# ------------------------------------------------------------------ utilities
def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


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

    # Back wall of the gym, with a dark pad behind the hoop.
    wall = mat("wall", (0.035, 0.040, 0.052), rough=0.9)
    bpy.ops.mesh.primitive_plane_add(size=44)
    put(bpy.context.object, g2b(0, 7, WALL_Z), rot=(math.pi / 2, 0, 0), material=wall)
    pad = mat("pad", (0.05, 0.06, 0.09), rough=0.95)
    padw = cube()
    padw.scale = (2.6, 0.05, 0.62)
    put(padw, g2b(0, 0.75, WALL_Z - 0.12), material=pad)

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

    # Two arms carrying the board back to the wall, so nothing crosses the shot.
    for side in (-1, 1):
        arm = cube()
        length = (WALL_Z - BOARD["z"]) / 2
        arm.scale = (0.05, length, 0.05)
        put(arm, g2b(side * (BOARD["half_w"] - 0.25), cy + 0.35, (BOARD["z"] + WALL_Z) / 2), material=dark)



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
    if a.job in ("hoop", "all"):
        job_hoop(out, a.width)
    if a.job in ("ball", "all"):
        job_ball(out, a.ball_frames, a.ball_size)


main()
