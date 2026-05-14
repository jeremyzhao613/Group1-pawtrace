# Blender Python script for a square enclosure with two equal-size slots:
# upper M5 module slot + lower GPS module slot.
# Units: millimeters.

import bpy
import math
from mathutils import Vector

OUT_BLEND = '/mnt/data/m5_gps_equal_slots_box.blend'
OUT_OBJ = '/mnt/data/m5_gps_equal_slots_box.obj'
OUT_STL = '/mnt/data/m5_gps_equal_slots_box.stl'

# ---------- Clean scene ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 0.001  # 1 Blender unit = 1 mm
scene.render.engine = 'CYCLES'
scene.cycles.samples = 96
scene.render.resolution_x = 1600
scene.render.resolution_y = 1200

# ---------- Materials ----------
def make_mat(name, rgba, rough=0.45, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = rgba
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metallic
    return mat

m_case = make_mat('Case dark grey plastic', (0.18, 0.18, 0.19, 1), 0.55)
m_lid = make_mat('Lid grey plastic', (0.48, 0.48, 0.47, 1), 0.46)
m_m5 = make_mat('M5 black placeholder', (0.035, 0.037, 0.04, 1), 0.4)
m_gps = make_mat('GPS white placeholder', (0.92, 0.92, 0.88, 1), 0.36)
m_screen = make_mat('Screen glossy black', (0.005, 0.005, 0.008, 1), 0.08)
m_button = make_mat('Light button plastic', (0.9, 0.9, 0.86, 1), 0.32)
m_blue = make_mat('M5 blue label / guide', (0.04, 0.30, 0.95, 1), 0.35)
m_green = make_mat('GPS green guide', (0.22, 0.75, 0.18, 1), 0.35)
m_cut = make_mat('Dark port and cable channel', (0.012, 0.012, 0.012, 1), 0.65)
m_metal = make_mat('Screw metal', (0.62, 0.62, 0.64, 1), 0.25, 0.35)
m_white = make_mat('White text', (1, 1, 1, 1), 0.5)
m_black_text = make_mat('Black text', (0.02, 0.02, 0.02, 1), 0.5)

# ---------- Helpers ----------
def apply_mat(obj, mat):
    obj.data.materials.append(mat)

def cube(name, loc, dims, mat=None, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        apply_mat(obj, mat)
    if bevel:
        mod = obj.modifiers.new('Rounded / bevelled edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 5
        mod.affect = 'EDGES'
        obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.modifier_apply(modifier=mod.name)
        obj.select_set(False)
    return obj

def cyl(name, loc, radius, depth, mat=None, vertices=48, bevel=0.0):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc)
    obj = bpy.context.object
    obj.name = name
    if mat:
        apply_mat(obj, mat)
    if bevel:
        mod = obj.modifiers.new('Cylinder edge bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        obj.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.modifier_apply(modifier=mod.name)
        obj.select_set(False)
    return obj

def text_obj(name, body, loc, size=3.0, mat=None, rot=(math.radians(90), 0, 0)):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.data.body = body
    obj.data.align_x = 'CENTER'
    obj.data.align_y = 'CENTER'
    obj.data.size = size
    obj.data.extrude = 0.07
    if mat:
        obj.data.materials.append(mat)
    return obj

# ---------- Design parameters ----------
# Equal-size upper/lower modules; square enclosure.
outer_x, outer_y, outer_z = 90.0, 90.0, 30.0
wall = 3.0
floor = 3.0
inner_x, inner_y = outer_x - 2 * wall, outer_y - 2 * wall

slot_w, slot_h = 72.0, 28.0       # equal footprint for both slots
module_w, module_h = 66.0, 22.0   # equal module footprint inside slots
module_z = 8.0
rail_t, rail_z = 2.2, 5.0
m5_y = 18.0
gps_y = -18.0
slot_x = 0.0

# ---------- Lower square shell ----------
cube('Lower shell floor - square enclosure 90x90mm', (0, 0, floor/2), (outer_x, outer_y, floor), m_case, bevel=2.0)
cube('Front wall with interface openings', (0, -outer_y/2 + wall/2, outer_z/2), (outer_x, wall, outer_z), m_case, bevel=1.1)
cube('Back wall', (0, outer_y/2 - wall/2, outer_z/2), (outer_x, wall, outer_z), m_case, bevel=1.1)
cube('Left wall', (-outer_x/2 + wall/2, 0, outer_z/2), (wall, inner_y, outer_z), m_case, bevel=1.1)
cube('Right wall', (outer_x/2 - wall/2, 0, outer_z/2), (wall, inner_y, outer_z), m_case, bevel=1.1)

# Inner lid support lip
cube('Inner lid support lip - front', (0, -outer_y/2 + 5.0, outer_z - 2.6), (outer_x - 9, 2.0, 2.2), m_lid, bevel=0.45)
cube('Inner lid support lip - back', (0, outer_y/2 - 5.0, outer_z - 2.6), (outer_x - 9, 2.0, 2.2), m_lid, bevel=0.45)
cube('Inner lid support lip - left', (-outer_x/2 + 5.0, 0, outer_z - 2.6), (2.0, outer_y - 9, 2.2), m_lid, bevel=0.45)
cube('Inner lid support lip - right', (outer_x/2 - 5.0, 0, outer_z - 2.6), (2.0, outer_y - 9, 2.2), m_lid, bevel=0.45)

# ---------- Equal slot bases / visual footprints ----------
cube('M5 upper equal-size slot footprint 72x28mm', (slot_x, m5_y, floor + 0.45), (slot_w, slot_h, 0.9), m_blue, bevel=0.7)
cube('GPS lower equal-size slot footprint 72x28mm', (slot_x, gps_y, floor + 0.45), (slot_w, slot_h, 0.9), m_green, bevel=0.7)

# Divider between upper and lower equal slots
cube('Horizontal divider between M5 and GPS equal slots', (0, 0, floor + 4.1), (slot_w + 5, 2.4, 7.0), m_case, bevel=0.5)

# Slot rails: upper M5 and lower GPS are equal in length/width
for label, cy, color in [('M5', m5_y, m_blue), ('GPS', gps_y, m_green)]:
    cube(f'{label} left guide rail', (-slot_w/2 - rail_t/2 + 1, cy, floor + 3.3), (rail_t, slot_h + 4, rail_z), m_case, bevel=0.35)
    cube(f'{label} right guide rail', (slot_w/2 + rail_t/2 - 1, cy, floor + 3.3), (rail_t, slot_h + 4, rail_z), m_case, bevel=0.35)
    cube(f'{label} top stop rail', (0, cy + slot_h/2 + rail_t/2 - 0.5, floor + 3.3), (slot_w + 2, rail_t, rail_z), m_case, bevel=0.35)
    cube(f'{label} bottom stop rail', (0, cy - slot_h/2 - rail_t/2 + 0.5, floor + 3.3), (slot_w + 2, rail_t, rail_z), m_case, bevel=0.35)
    cube(f'{label} colored guide border left', (-slot_w/2 + 1.2, cy, floor + 6.0), (0.65, slot_h + 2, 0.45), color, bevel=0.12)
    cube(f'{label} colored guide border right', (slot_w/2 - 1.2, cy, floor + 6.0), (0.65, slot_h + 2, 0.45), color, bevel=0.12)

# ---------- Cable routing: no reserved area ----------
cube('Central cable channel between M5 and GPS slots', (0, 0, floor + 1.15), (52, 4, 1.2), m_cut, bevel=0.25)
cube('Right-side vertical cable channel', (39.0, 0, floor + 1.15), (3.2, 60, 1.2), m_cut, bevel=0.25)

# ---------- Equal-size module placeholders ----------
m5_body = cube('M5 module placeholder - upper equal size', (0, m5_y, floor + module_z/2 + 1.5), (module_w, module_h, module_z), m_m5, bevel=1.2)
gps_body = cube('GPS module placeholder - lower equal size', (0, gps_y, floor + module_z/2 + 1.5), (module_w, module_h, module_z), m_gps, bevel=1.2)

# M5 screen and buttons on equal-size body
cube('M5 screen area', (-8, m5_y, floor + module_z + 1.85), (38, 16, 0.65), m_screen, bevel=0.35)
for i, yoff in enumerate([-7, 0, 7], start=1):
    cube(f'M5 side button {i}', (27.0, m5_y + yoff, floor + module_z + 1.95), (4.2, 3.6, 0.7), m_button, bevel=0.28)

# Labels on modules
cube('M5 blue label plaque', (0, m5_y, floor + module_z + 2.3), (12, 8, 0.35), m_blue, bevel=0.4)
text_obj('M5 label text', 'M5', (0, m5_y, floor + module_z + 2.65), 3.2, m_white)
text_obj('GPS label text', 'GPS\n模块', (0, gps_y, floor + module_z + 2.2), 3.8, m_black_text)

# Small GPS indicator icon
cyl('GPS small indicator icon', (-27, gps_y + 6, floor + module_z + 2.2), 2.0, 0.35, m_metal, vertices=32, bevel=0.08)

# ---------- Screw bosses and structural posts ----------
for x in (-37, 37):
    for y in (-37, 37):
        cyl('Corner screw boss / lid fixing post', (x, y, floor + 8.5), 4.2, 17.0, m_case, vertices=56, bevel=0.25)
        cyl('Visible screw hole insert', (x, y, floor + 17.2), 1.75, 0.8, m_metal, vertices=48, bevel=0.08)

# Additional small standoffs along rails
for x, y in [(-39, 0), (39, 0), (-39, 18), (39, 18), (-39, -18), (39, -18)]:
    cyl('Internal small fixing standoff', (x, y, floor + 3.5), 1.8, 7.0, m_case, vertices=32, bevel=0.18)

# Interior ribs for strength, without creating any reserved compartment
for x in [-28, -14, 14, 28]:
    cube('Short wall stiffening rib', (x, outer_y/2 - wall - 4, floor + 5.0), (2.0, 7.0, 8.0), m_case, bevel=0.25)
    cube('Short front stiffening rib', (x, -outer_y/2 + wall + 4, floor + 5.0), (2.0, 7.0, 8.0), m_case, bevel=0.25)

# ---------- Side/front port placeholders ----------
cube('USB-C opening placeholder', (-25, -outer_y/2 + wall - 0.2, 11), (12, 1.2, 4.6), m_cut, bevel=0.45)
cube('Expansion/Grove opening placeholder', (2, -outer_y/2 + wall - 0.2, 11.5), (14, 1.2, 6.0), m_cut, bevel=0.35)
for i in range(5):
    cube(f'Vent slit {i+1}', (25 + i*3.5, -outer_y/2 + wall - 0.2, 12), (1.4, 1.2, 8.5), m_cut, bevel=0.12)

# ---------- Floating top lid ----------
lid_z = 43.0
cube('Floating top lid with four screw recesses', (0, 0, lid_z), (outer_x, outer_y, 4.2), m_lid, bevel=2.0)
cube('Lid inner locating lip', (0, 0, lid_z - 2.6), (outer_x - 10, outer_y - 10, 1.8), m_case, bevel=0.65)
for x in (-37, 37):
    for y in (-37, 37):
        cyl('Lid screw recess', (x, y, lid_z + 1.0), 4.2, 0.8, m_metal, vertices=56, bevel=0.1)
        cyl('Lid screw center hole', (x, y, lid_z + 1.35), 1.7, 0.9, m_cut, vertices=48, bevel=0.08)
text_obj('Lid title text', 'M5 + GPS', (0, 0, lid_z + 2.25), 4.6, m_white)

# Snap-fit tabs on lid/body edges
cube('Snap-fit tab front', (0, -outer_y/2 + 0.5, outer_z - 2.0), (14, 1.6, 3.2), m_lid, bevel=0.25)
cube('Snap-fit tab back', (0, outer_y/2 - 0.5, outer_z - 2.0), (14, 1.6, 3.2), m_lid, bevel=0.25)
cube('Snap-fit tab left', (-outer_x/2 + 0.5, 0, outer_z - 2.0), (1.6, 14, 3.2), m_lid, bevel=0.25)
cube('Snap-fit tab right', (outer_x/2 - 0.5, 0, outer_z - 2.0), (1.6, 14, 3.2), m_lid, bevel=0.25)

# ---------- Dimension markers ----------
cube('Dimension bar X 90mm', (0, 53, 1.4), (90, 0.7, 0.7), m_metal, bevel=0.08)
cube('Dimension bar Y 90mm', (53, 0, 1.4), (0.7, 90, 0.7), m_metal, bevel=0.08)
cube('Dimension bar Z 30mm', (-53, -50, 15), (0.7, 0.7, 30), m_metal, bevel=0.08)
text_obj('Dimension X text', '90 mm', (0, 56, 2.1), 2.8, m_white)
text_obj('Dimension Y text', '90 mm', (56, 0, 2.1), 2.8, m_white, rot=(math.radians(90), 0, math.radians(90)))
text_obj('Dimension Z text', '30 mm', (-56, -50, 15), 2.8, m_white, rot=(math.radians(90), 0, math.radians(90)))

# ---------- Camera and lighting ----------
bpy.ops.object.light_add(type='AREA', location=(30, -60, 120))
light = bpy.context.object
light.name = 'Large softbox light'
light.data.energy = 620
light.data.size = 90

bpy.ops.object.light_add(type='POINT', location=(-90, 60, 70))
fill = bpy.context.object
fill.name = 'Soft fill light'
fill.data.energy = 140

bpy.ops.object.camera_add(location=(118, -130, 95))
cam = bpy.context.object
cam.name = 'Camera - isometric concept view'
scene.camera = cam
track_quat = (Vector((0, 0, 18)) - cam.location).to_track_quat('-Z', 'Y')
cam.rotation_euler = track_quat.to_euler()
cam.data.lens = 45
cam.data.dof.use_dof = True
cam.data.dof.focus_distance = 170
cam.data.dof.aperture_fstop = 8

# ---------- Metadata ----------
scene['Project'] = 'M5 + GPS equal-size stacked square enclosure'
scene['Design summary'] = 'Square enclosure, no reserved area, two equal-size slots stacked vertically: M5 upper, GPS lower.'
scene['Outer dimensions'] = '90 x 90 x 30 mm concept size'
scene['Slot dimensions'] = 'Two equal slots: 72 x 28 mm footprint; module placeholders: 66 x 22 mm footprint'
scene['Manufacturing suggestion'] = '3D printing: 2.5-3 mm wall, M2.5 screws, 0.5-1.0 mm clearance per side after measuring real hardware.'

# ---------- Save/export ----------
bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)

mesh_objects = [obj for obj in bpy.data.objects if obj.type == 'MESH']
for obj in bpy.data.objects:
    obj.select_set(False)
for obj in mesh_objects:
    obj.select_set(True)
if mesh_objects:
    bpy.context.view_layer.objects.active = mesh_objects[0]

try:
    bpy.ops.wm.obj_export(filepath=OUT_OBJ, export_selected_objects=True)
except Exception:
    try:
        bpy.ops.export_scene.obj(filepath=OUT_OBJ, use_selection=True)
    except Exception as e:
        print('OBJ export failed:', e)

try:
    bpy.ops.wm.stl_export(filepath=OUT_STL, export_selected_objects=True)
except Exception:
    try:
        bpy.ops.export_mesh.stl(filepath=OUT_STL, use_selection=True)
    except Exception as e:
        print('STL export failed:', e)

print('Generated:', OUT_BLEND)
print('Generated:', OUT_OBJ)
print('Generated:', OUT_STL)
