import bpy
import math
from mathutils import Vector

OUT_BLEND = '/mnt/data/m5_gps_hatheartrate_real_box.blend'
OUT_OBJ = '/mnt/data/m5_gps_hatheartrate_real_box.obj'
OUT_STL = '/mnt/data/m5_gps_hatheartrate_real_box.stl'

# ---------- Reset scene ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 0.001  # 1 BU = 1 mm
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

m_case = make_mat('Case_Grey', (0.80, 0.80, 0.80, 1), 0.46)
m_lid = make_mat('Lid_Grey', (0.88, 0.88, 0.88, 1), 0.42)
m_m5 = make_mat('M5_Orange', (0.96, 0.39, 0.16, 1), 0.42)
m_gps = make_mat('GPS_White', (0.94, 0.94, 0.94, 1), 0.36)
m_hat = make_mat('HatHeart_White', (0.97, 0.97, 0.97, 1), 0.36)
m_screen = make_mat('Screen_Black', (0.01, 0.01, 0.015, 1), 0.08)
m_black = make_mat('Black', (0.03, 0.03, 0.03, 1), 0.42)
m_blue = make_mat('Blue', (0.12, 0.62, 0.92, 1), 0.35)
m_dark = make_mat('Dark_Cut', (0.03, 0.03, 0.03, 1), 0.70)
m_metal = make_mat('Metal', (0.62, 0.62, 0.64, 1), 0.24, 0.35)
m_wire_r = make_mat('Wire_Red', (0.85, 0.16, 0.14, 1), 0.30)
m_wire_y = make_mat('Wire_Yellow', (0.93, 0.80, 0.10, 1), 0.30)
m_wire_b = make_mat('Wire_Black', (0.10, 0.10, 0.10, 1), 0.30)
m_wire_w = make_mat('Wire_White', (0.95, 0.95, 0.95, 1), 0.30)
m_wire_g = make_mat('Wire_Green', (0.10, 0.60, 0.18, 1), 0.30)
m_white_text = make_mat('White_Text', (1, 1, 1, 1), 0.5)
m_black_text = make_mat('Black_Text', (0.02, 0.02, 0.02, 1), 0.5)

# ---------- Helper functions ----------
def apply_mat(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


def cube(name, loc, dims, mat=None, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        apply_mat(obj, mat)
    if bevel > 0:
        mod = obj.modifiers.new('Bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 4
        mod.limit_method = 'ANGLE'
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
    if bevel > 0:
        mod = obj.modifiers.new('Bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.modifier_apply(modifier=mod.name)
        obj.select_set(False)
    return obj


def text_obj(name, text, loc, size=3.0, mat=None, rot=(math.radians(90), 0, 0)):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.data.body = text
    obj.data.align_x = 'CENTER'
    obj.data.align_y = 'CENTER'
    obj.data.size = size
    obj.data.extrude = 0.06
    if mat:
        obj.data.materials.append(mat)
    return obj

# ---------- Design parameters ----------
# Based on the latest concept: M5 main module on upper-left, GPS below, Hat Heart Rate on right side of M5.
outer_x, outer_y, outer_z = 100.0, 100.0, 34.0
wall = 3.0
floor = 3.0
inner_x, inner_y = outer_x - 2 * wall, outer_y - 2 * wall

# Real/approx reference dimensions (mm)
# M5StickC Plus from user image: 48.2 x 25.5 x 13.7 mm
m5_mod = (48.2, 25.5, 13.7)
# GPS module based on shown product render / installation photo (approx)
gps_mod = (42.0, 26.0, 12.0)
# Hat Heart Rate MAX30102 style unit (approx, about half M5 area)
hat_mod = (20.0, 16.0, 10.0)

# Slot clearances and layout positions
m5_slot = (52.0, 29.5, 15.5)
gps_slot = (46.0, 30.0, 13.5)
hat_slot = (24.5, 20.0, 12.0)

# Module center positions (top view). Front side is -Y.
m5_center = (-5.0, 21.0)
hat_center = (31.5, 21.0)
gps_center = (-6.0, -12.0)

# ---------- Lower shell ----------
cube('LowerShell_Floor', (0, 0, floor/2), (outer_x, outer_y, floor), m_case, bevel=2.1)
cube('Front_Wall', (0, -outer_y/2 + wall/2, outer_z/2), (outer_x, wall, outer_z), m_case, bevel=1.0)
cube('Back_Wall', (0, outer_y/2 - wall/2, outer_z/2), (outer_x, wall, outer_z), m_case, bevel=1.0)
cube('Left_Wall', (-outer_x/2 + wall/2, 0, outer_z/2), (wall, inner_y, outer_z), m_case, bevel=1.0)
cube('Right_Wall', (outer_x/2 - wall/2, 0, outer_z/2), (wall, inner_y, outer_z), m_case, bevel=1.0)

# Lid support lips
cube('Lip_Front', (0, -outer_y/2 + 5.2, outer_z - 2.8), (outer_x - 9.0, 2.0, 2.2), m_lid, bevel=0.35)
cube('Lip_Back', (0, outer_y/2 - 5.2, outer_z - 2.8), (outer_x - 9.0, 2.0, 2.2), m_lid, bevel=0.35)
cube('Lip_Left', (-outer_x/2 + 5.2, 0, outer_z - 2.8), (2.0, outer_y - 9.0, 2.2), m_lid, bevel=0.35)
cube('Lip_Right', (outer_x/2 - 5.2, 0, outer_z - 2.8), (2.0, outer_y - 9.0, 2.2), m_lid, bevel=0.35)

# ---------- Slot footprints ----------
cube('M5_Slot_Footprint', (m5_center[0], m5_center[1], floor + 0.45), (m5_slot[0], m5_slot[1], 0.9), m_blue, bevel=0.45)
cube('HatHeart_Slot_Footprint', (hat_center[0], hat_center[1], floor + 0.45), (hat_slot[0], hat_slot[1], 0.9), m_lid, bevel=0.35)
cube('GPS_Slot_Footprint', (gps_center[0], gps_center[1], floor + 0.45), (gps_slot[0], gps_slot[1], 0.9), m_blue, bevel=0.45)

# Divider ribs
cube('Divider_M5_to_GPS', (-6.0, 4.0, floor + 4.0), (58.0, 2.2, 7.0), m_case, bevel=0.2)
cube('Divider_M5_to_Hat', (15.0, 21.0, floor + 4.0), (2.2, 34.0, 7.0), m_case, bevel=0.2)

# ---------- Rails / guides ----------
def slot_rails(prefix, cx, cy, sw, sh, color=None):
    rail_t = 1.8
    rail_h = 5.0
    cube(f'{prefix}_Rail_Left', (cx - sw/2 - rail_t/2 + 0.8, cy, floor + 3.3), (rail_t, sh + 3.0, rail_h), m_case, bevel=0.12)
    cube(f'{prefix}_Rail_Right', (cx + sw/2 + rail_t/2 - 0.8, cy, floor + 3.3), (rail_t, sh + 3.0, rail_h), m_case, bevel=0.12)
    cube(f'{prefix}_Rail_Top', (cx, cy + sh/2 + rail_t/2 - 0.45, floor + 3.3), (sw + 1.6, rail_t, rail_h), m_case, bevel=0.12)
    cube(f'{prefix}_Rail_Bottom', (cx, cy - sh/2 - rail_t/2 + 0.45, floor + 3.3), (sw + 1.6, rail_t, rail_h), m_case, bevel=0.12)
    if color:
        cube(f'{prefix}_Guide_Left', (cx - sw/2 + 0.9, cy, floor + 5.85), (0.55, sh + 1.8, 0.4), color, bevel=0.05)
        cube(f'{prefix}_Guide_Right', (cx + sw/2 - 0.9, cy, floor + 5.85), (0.55, sh + 1.8, 0.4), color, bevel=0.05)

slot_rails('M5', m5_center[0], m5_center[1], m5_slot[0], m5_slot[1], m_blue)
slot_rails('GPS', gps_center[0], gps_center[1], gps_slot[0], gps_slot[1], m_blue)
slot_rails('Hat', hat_center[0], hat_center[1], hat_slot[0], hat_slot[1], None)

# GPS corner locating posts
for xoff, yoff in [(-gps_slot[0]/2 + 4, -gps_slot[1]/2 + 4), (gps_slot[0]/2 - 4, -gps_slot[1]/2 + 4), (-gps_slot[0]/2 + 4, gps_slot[1]/2 - 4), (gps_slot[0]/2 - 4, gps_slot[1]/2 - 4)]:
    cyl('GPS_Locating_Post', (gps_center[0] + xoff, gps_center[1] + yoff, floor + 3.0), 1.8, 6.0, m_case, vertices=24, bevel=0.08)

# ---------- Cable channels ----------
cube('Top_Cable_Channel', (0.0, 41.0, floor + 1.1), (76.0, 3.4, 1.2), m_dark, bevel=0.12)
cube('Right_Cable_Channel', (35.0, 4.0, floor + 1.1), (3.2, 62.0, 1.2), m_dark, bevel=0.12)
cube('M5_to_GPS_Channel', (-6.0, 4.0, floor + 1.1), (18.0, 3.0, 1.2), m_dark, bevel=0.12)
cube('GPS_to_Right_Channel', (19.5, -12.0, floor + 1.1), (8.0, 3.0, 1.2), m_dark, bevel=0.12)

# Cable clips
for x, y in [(-8, 41.0), (20, 41.0), (35.0, 20.0), (35.0, -2.0), (35.0, -22.0)]:
    cube('Cable_Clip', (x, y, floor + 6.8), (4.0, 2.2, 4.5), m_case, bevel=0.15)

# ---------- Module placeholders ----------
# M5 main module
cube('M5_Module', (m5_center[0], m5_center[1], floor + m5_mod[2]/2 + 1.5), m5_mod, m_m5, bevel=1.0)
cube('M5_Screen', (m5_center[0] - 4.5, m5_center[1], floor + m5_mod[2] + 1.65), (26.0, 18.0, 0.55), m_screen, bevel=0.12)
text_obj('M5_Emboss', 'M5', (m5_center[0] + 15.8, m5_center[1], floor + m5_mod[2] + 1.85), 4.5, m_m5)
# USB-C placeholder at front/left end visually
cube('M5_USB_C_Plug', (m5_center[0] - m5_mod[0]/2 + 1.0, m5_center[1], floor + 7.5), (2.2, 6.0, 4.4), m_metal, bevel=0.10)

# GPS module
cube('GPS_Module', (gps_center[0], gps_center[1], floor + gps_mod[2]/2 + 1.5), gps_mod, m_gps, bevel=0.8)
text_obj('GPS_Label', 'GPS', (gps_center[0], gps_center[1] + 2.5, floor + gps_mod[2] + 1.8), 4.4, m_blue)
text_obj('GPS_Sub', 'V1.2', (gps_center[0], gps_center[1] - 3.6, floor + gps_mod[2] + 1.75), 2.1, m_black_text)
cyl('GPS_Hole_1', (gps_center[0] - 17.0, gps_center[1] + 9.5, floor + gps_mod[2] + 1.6), 1.5, 0.35, m_metal, vertices=24, bevel=0.03)
cyl('GPS_Hole_2', (gps_center[0] + 17.0, gps_center[1] - 9.5, floor + gps_mod[2] + 1.6), 1.5, 0.35, m_metal, vertices=24, bevel=0.03)
# blue grove connector look
cube('GPS_Grove_Connector', (gps_center[0] + gps_mod[0]/2 - 3.0, gps_center[1], floor + gps_mod[2] + 1.45), (6.0, 8.5, 1.2), m_blue, bevel=0.08)

# Hat Heart Rate module (side-mounted)
cube('HatHeart_Module', (hat_center[0], hat_center[1], floor + hat_mod[2]/2 + 1.5), hat_mod, m_hat, bevel=0.6)
# sensor window on top
cube('HatHeart_Sensor_Window', (hat_center[0], hat_center[1] + 2.0, floor + hat_mod[2] + 1.25), (4.8, 4.8, 0.45), m_screen, bevel=0.05)
# bottom pins
for i in range(6):
    cube(f'Hat_Pin_{i+1}', (hat_center[0] - 5.5 + i*2.2, hat_center[1] - 7.0, floor + 2.2), (0.9, 4.0, 2.0), m_metal, bevel=0.03)

# ---------- Wiring ----------
wire_specs = [
    ('TopWire_Red', 0.0, 41.0, 10.8, 76.0, 1.0, 1.0, m_wire_r),
    ('TopWire_Yellow', 0.0, 39.0, 10.6, 76.0, 1.0, 1.0, m_wire_y),
    ('TopWire_Black', 0.0, 37.0, 10.4, 76.0, 1.0, 1.0, m_wire_b),
    ('TopWire_White', 0.0, 35.0, 10.2, 76.0, 1.0, 1.0, m_wire_w),
    ('RightWire_Red', 35.0, 10.0, 10.8, 1.0, 60.0, 1.0, m_wire_r),
    ('RightWire_Yellow', 33.2, 10.0, 10.6, 1.0, 60.0, 1.0, m_wire_y),
    ('RightWire_Black', 31.4, 10.0, 10.4, 1.0, 60.0, 1.0, m_wire_b),
    ('RightWire_White', 29.6, 10.0, 10.2, 1.0, 60.0, 1.0, m_wire_w),
    ('GPSWire_Red', 18.0, -8.0, 9.4, 1.0, 12.0, 1.0, m_wire_r),
    ('GPSWire_Yellow', 19.5, -8.0, 9.2, 1.0, 12.0, 1.0, m_wire_y),
    ('GPSWire_Black', 21.0, -8.0, 9.0, 1.0, 12.0, 1.0, m_wire_b),
    ('GPSWire_Green', 22.5, -8.0, 8.8, 1.0, 12.0, 1.0, m_wire_g),
]
for name, x, y, z, dx, dy, dz, mat in wire_specs:
    cube(name, (x, y, z), (dx, dy, dz), mat, bevel=0.10)

# ---------- Screw bosses / posts ----------
for x in (-39.0, 39.0):
    for y in (-39.0, 39.0):
        cyl(f'ScrewBoss_{x}_{y}', (x, y, floor + 9.0), 4.4, 18.0, m_case, vertices=56, bevel=0.16)
        cyl(f'ScrewHole_{x}_{y}', (x, y, floor + 18.0), 1.8, 0.8, m_metal, vertices=48, bevel=0.04)

# Extra standoffs
for x, y in [(-41, 21), (41, 21), (-41, -12), (41, -12), (14, 39), (14, -39), (-24, 6), (26, 5)]:
    cyl('Small_Standoff', (x, y, floor + 3.5), 1.9, 7.0, m_case, vertices=28, bevel=0.08)

# ---------- Front openings ----------
# USB-C opening aligned to M5 end
cube('USB_C_Opening', (-27.0, -outer_y/2 + wall - 0.2, 11.0), (12.0, 1.2, 4.8), m_dark, bevel=0.18)
# Reserved expansion connector
cube('Expansion_Opening', (0.0, -outer_y/2 + wall - 0.2, 11.3), (14.0, 1.2, 6.0), m_dark, bevel=0.14)
# Vent slots
for i in range(6):
    cube(f'Vent_{i+1}', (23.0 + i*3.0, -outer_y/2 + wall - 0.2, 12.0), (1.3, 1.2, 8.0), m_dark, bevel=0.04)

# ---------- Lid ----------
lid_z = 46.0
cube('Top_Lid', (0, 0, lid_z), (outer_x, outer_y, 4.2), m_lid, bevel=2.0)
# internal locating frame / lip
cube('Lid_Inner_Frame', (0, 0, lid_z - 2.6), (outer_x - 10.0, outer_y - 10.0, 1.8), m_case, bevel=0.35)
# lid vents
for i in range(4):
    for j in range(4):
        cube('Lid_Vent', (-6 + i*4, 0 + j*2.3, lid_z + 0.6), (2.1, 0.8, 0.6), m_dark, bevel=0.02)
for x in (-39.0, 39.0):
    for y in (-39.0, 39.0):
        cyl('Lid_Screw_Recess', (x, y, lid_z + 1.0), 4.4, 0.8, m_metal, vertices=56, bevel=0.04)
        cyl('Lid_Screw_Center', (x, y, lid_z + 1.3), 1.8, 0.9, m_dark, vertices=48, bevel=0.03)

# Snap-fit tabs
cube('Tab_Front', (0, -outer_y/2 + 0.5, outer_z - 2.0), (14.0, 1.6, 3.2), m_lid, bevel=0.12)
cube('Tab_Back', (0, outer_y/2 - 0.5, outer_z - 2.0), (14.0, 1.6, 3.2), m_lid, bevel=0.12)
cube('Tab_Left', (-outer_x/2 + 0.5, 0, outer_z - 2.0), (1.6, 14.0, 3.2), m_lid, bevel=0.12)
cube('Tab_Right', (outer_x/2 - 0.5, 0, outer_z - 2.0), (1.6, 14.0, 3.2), m_lid, bevel=0.12)

# ---------- Reference texts / dimensions ----------
text_obj('Lid_Title', 'M5 + GPS + Hat Heart Rate', (0, 0, lid_z + 2.2), 3.6, m_black_text)

cube('Dim_X', (0, 56.0, 1.4), (100.0, 0.7, 0.7), m_metal, bevel=0.04)
cube('Dim_Y', (56.0, 0, 1.4), (0.7, 100.0, 0.7), m_metal, bevel=0.04)
cube('Dim_Z', (-56.0, -54.0, 17.0), (0.7, 0.7, 34.0), m_metal, bevel=0.04)
text_obj('Dim_X_Text', '100 mm', (0, 59.0, 2.0), 2.8, m_black_text)
text_obj('Dim_Y_Text', '100 mm', (59.0, 0, 2.0), 2.8, m_black_text, rot=(math.radians(90), 0, math.radians(90)))
text_obj('Dim_Z_Text', '34 mm', (-59.0, -54.0, 17.0), 2.8, m_black_text, rot=(math.radians(90), 0, math.radians(90)))

# ---------- Camera & lights ----------
bpy.ops.object.camera_add(location=(132, -142, 108))
cam = bpy.context.object
cam.name = 'Camera'
scene.camera = cam
track = (Vector((0, 0, 18)) - cam.location).to_track_quat('-Z', 'Y')
cam.rotation_euler = track.to_euler()
cam.data.lens = 45

bpy.ops.object.light_add(type='AREA', location=(35, -66, 122))
light = bpy.context.object
light.name = 'AreaLight'
light.data.energy = 700
light.data.size = 92

bpy.ops.object.light_add(type='POINT', location=(-92, 76, 85))
fill = bpy.context.object
fill.name = 'FillLight'
fill.data.energy = 145

# ---------- Metadata ----------
scene['Project'] = 'M5 + GPS + Hat Heart Rate enclosure (based on latest real-size concept)'
scene['Design_Summary'] = 'Square enclosure with M5 as main module at upper-left, Hat Heart Rate side-mounted on the right, GPS below, cable channels, front USB-C / expansion openings, vent slots, lid with snap-fit + screws.'
scene['Outer_Size'] = '100 x 100 x 34 mm'
scene['Inner_Useable_Size'] = 'Approx. 94 x 94 x 28 mm'
scene['M5_Size_Reference'] = '48.2 x 25.5 x 13.7 mm'
scene['Tolerance_Suggestion'] = '3D printing tolerance suggestion: +/- 0.3 mm, adjust after measuring real hardware.'

# ---------- Save / export ----------
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
