import bpy
import math
from mathutils import Vector

OUT_BLEND = '/mnt/data/m5_gps_hatheart_box.blend'
OUT_OBJ = '/mnt/data/m5_gps_hatheart_box.obj'
OUT_STL = '/mnt/data/m5_gps_hatheart_box.stl'

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

m_case = make_mat('Case_DarkGrey', (0.18, 0.18, 0.19, 1), 0.55)
m_lid = make_mat('Lid_Grey', (0.48, 0.48, 0.47, 1), 0.46)
m_m5 = make_mat('M5_Black', (0.035, 0.037, 0.04, 1), 0.42)
m_gps = make_mat('GPS_White', (0.92, 0.92, 0.88, 1), 0.36)
m_hat = make_mat('HatHeart_DarkGrey', (0.14, 0.14, 0.15, 1), 0.4)
m_screen = make_mat('Screen_Black', (0.01, 0.01, 0.015, 1), 0.08)
m_button = make_mat('Button_White', (0.9, 0.9, 0.86, 1), 0.32)
m_blue = make_mat('Blue_Label', (0.04, 0.30, 0.95, 1), 0.35)
m_green = make_mat('Green_Label', (0.22, 0.75, 0.18, 1), 0.35)
m_red = make_mat('Red_Label', (0.88, 0.18, 0.22, 1), 0.35)
m_cut = make_mat('Dark_Cut', (0.012, 0.012, 0.012, 1), 0.65)
m_metal = make_mat('Metal', (0.62, 0.62, 0.64, 1), 0.25, 0.35)
m_white = make_mat('White_Text', (1, 1, 1, 1), 0.5)
m_black_text = make_mat('Black_Text', (0.02, 0.02, 0.02, 1), 0.5)

# ---------- Helpers ----------
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
    obj.data.extrude = 0.07
    if mat:
        obj.data.materials.append(mat)
    return obj

# ---------- Design parameters ----------
# Concept enclosure for 3 modules: Hat Heart mounted at the front end of M5, GPS below.
outer_x, outer_y, outer_z = 100.0, 100.0, 34.0
wall = 3.0
floor = 3.0
inner_x, inner_y = outer_x - 2 * wall, outer_y - 2 * wall

# Layout positions (Y axis top -> bottom)
hat_y = 30.0      # Hat Heart at the front/top end of M5
m5_y = 8.0        # M5 in the middle-upper area
gps_y = -26.0     # GPS in the lower area

# Slot sizes
m5_slot_w, m5_slot_h = 72.0, 28.0
gps_slot_w, gps_slot_h = 72.0, 28.0
hat_slot_w, hat_slot_h = 28.0, 16.0

# Module placeholder sizes
m5_mod_w, m5_mod_h, m5_mod_z = 66.0, 22.0, 8.0
gps_mod_w, gps_mod_h, gps_mod_z = 66.0, 22.0, 8.0
hat_mod_w, hat_mod_h, hat_mod_z = 22.0, 12.0, 5.0

rail_t, rail_z = 2.0, 5.0

# ---------- Main shell ----------
cube('LowerShell_Floor', (0, 0, floor/2), (outer_x, outer_y, floor), m_case, bevel=2.0)
cube('Front_Wall', (0, -outer_y/2 + wall/2, outer_z/2), (outer_x, wall, outer_z), m_case, bevel=1.0)
cube('Back_Wall', (0, outer_y/2 - wall/2, outer_z/2), (outer_x, wall, outer_z), m_case, bevel=1.0)
cube('Left_Wall', (-outer_x/2 + wall/2, 0, outer_z/2), (wall, inner_y, outer_z), m_case, bevel=1.0)
cube('Right_Wall', (outer_x/2 - wall/2, 0, outer_z/2), (wall, inner_y, outer_z), m_case, bevel=1.0)

# Support lip for lid
cube('Lip_Front', (0, -outer_y/2 + 5.2, outer_z - 2.8), (outer_x - 9, 2.0, 2.2), m_lid, bevel=0.4)
cube('Lip_Back', (0, outer_y/2 - 5.2, outer_z - 2.8), (outer_x - 9, 2.0, 2.2), m_lid, bevel=0.4)
cube('Lip_Left', (-outer_x/2 + 5.2, 0, outer_z - 2.8), (2.0, outer_y - 9, 2.2), m_lid, bevel=0.4)
cube('Lip_Right', (outer_x/2 - 5.2, 0, outer_z - 2.8), (2.0, outer_y - 9, 2.2), m_lid, bevel=0.4)

# ---------- Slot footprints ----------
cube('HatHeart_Slot_Footprint', (0, hat_y, floor + 0.45), (hat_slot_w, hat_slot_h, 0.9), m_red, bevel=0.5)
cube('M5_Slot_Footprint', (0, m5_y, floor + 0.45), (m5_slot_w, m5_slot_h, 0.9), m_blue, bevel=0.6)
cube('GPS_Slot_Footprint', (0, gps_y, floor + 0.45), (gps_slot_w, gps_slot_h, 0.9), m_green, bevel=0.6)

# Structural divider ribs
cube('Divider_Hat_to_M5', (0, 20.0, floor + 4.0), (m5_slot_w + 4, 2.2, 7.0), m_case, bevel=0.35)
cube('Divider_M5_to_GPS', (0, -9.0, floor + 4.0), (m5_slot_w + 4, 2.2, 7.0), m_case, bevel=0.35)

# ---------- Rails ----------
def build_slot_rails(prefix, center_y, slot_w, slot_h, color):
    cube(f'{prefix}_Rail_Left', (-slot_w/2 - rail_t/2 + 1.0, center_y, floor + 3.4), (rail_t, slot_h + 4.0, rail_z), m_case, bevel=0.25)
    cube(f'{prefix}_Rail_Right', (slot_w/2 + rail_t/2 - 1.0, center_y, floor + 3.4), (rail_t, slot_h + 4.0, rail_z), m_case, bevel=0.25)
    cube(f'{prefix}_Rail_Top', (0, center_y + slot_h/2 + rail_t/2 - 0.5, floor + 3.4), (slot_w + 2.0, rail_t, rail_z), m_case, bevel=0.25)
    cube(f'{prefix}_Rail_Bottom', (0, center_y - slot_h/2 - rail_t/2 + 0.5, floor + 3.4), (slot_w + 2.0, rail_t, rail_z), m_case, bevel=0.25)
    cube(f'{prefix}_Guide_Left', (-slot_w/2 + 1.2, center_y, floor + 5.9), (0.6, slot_h + 2.0, 0.45), color, bevel=0.1)
    cube(f'{prefix}_Guide_Right', (slot_w/2 - 1.2, center_y, floor + 5.9), (0.6, slot_h + 2.0, 0.45), color, bevel=0.1)

build_slot_rails('HatHeart', hat_y, hat_slot_w, hat_slot_h, m_red)
build_slot_rails('M5', m5_y, m5_slot_w, m5_slot_h, m_blue)
build_slot_rails('GPS', gps_y, gps_slot_w, gps_slot_h, m_green)

# ---------- Cable routing ----------
cube('CableChannel_Hat_to_M5', (0, 19.0, floor + 1.1), (18.0, 3.0, 1.2), m_cut, bevel=0.2)
cube('CableChannel_M5_to_GPS', (0, -9.0, floor + 1.1), (24.0, 3.0, 1.2), m_cut, bevel=0.2)
cube('CableChannel_RightSide', (42.0, 0.0, floor + 1.1), (3.2, 74.0, 1.2), m_cut, bevel=0.2)

# ---------- Module placeholders ----------
# Hat Heart installed at the front end of M5
hat = cube('HatHeart_Module', (0, hat_y, floor + hat_mod_z/2 + 1.5), (hat_mod_w, hat_mod_h, hat_mod_z), m_hat, bevel=0.8)
# sensor window / heart icon area
cube('HatHeart_Sensor_Window', (0, hat_y, floor + hat_mod_z + 1.7), (10.0, 6.0, 0.5), m_cut, bevel=0.15)
text_obj('HatHeart_Text', 'Hat\nHeart', (0, hat_y, floor + hat_mod_z + 2.2), 2.3, m_white)

m5 = cube('M5_Module', (0, m5_y, floor + m5_mod_z/2 + 1.5), (m5_mod_w, m5_mod_h, m5_mod_z), m_m5, bevel=1.1)
cube('M5_Screen', (-8.0, m5_y, floor + m5_mod_z + 1.85), (38.0, 16.0, 0.65), m_screen, bevel=0.25)
for i, yoff in enumerate([-7.0, 0.0, 7.0], start=1):
    cube(f'M5_Button_{i}', (27.0, m5_y + yoff, floor + m5_mod_z + 1.95), (4.2, 3.6, 0.7), m_button, bevel=0.2)
cube('M5_Blue_Label', (0, m5_y, floor + m5_mod_z + 2.25), (12.0, 8.0, 0.35), m_blue, bevel=0.25)
text_obj('M5_Text', 'M5', (0, m5_y, floor + m5_mod_z + 2.6), 3.0, m_white)

# indicate Hat Heart is mounted at M5 front end with a small connector bridge
cube('HatHeart_to_M5_Bridge', (0, 19.0, floor + 6.2), (8.0, 3.0, 2.0), m_metal, bevel=0.2)

gps = cube('GPS_Module', (0, gps_y, floor + gps_mod_z/2 + 1.5), (gps_mod_w, gps_mod_h, gps_mod_z), m_gps, bevel=1.1)
text_obj('GPS_Text', 'GPS\n模块', (0, gps_y, floor + gps_mod_z + 2.15), 3.6, m_black_text)
cyl('GPS_Indicator', (-27.0, gps_y + 6.0, floor + gps_mod_z + 2.0), 2.0, 0.35, m_metal, vertices=32, bevel=0.08)

# ---------- Screw bosses ----------
for x in (-39.0, 39.0):
    for y in (-39.0, 39.0):
        cyl(f'ScrewBoss_{x}_{y}', (x, y, floor + 9.0), 4.2, 18.0, m_case, vertices=56, bevel=0.25)
        cyl(f'ScrewHoleVisual_{x}_{y}', (x, y, floor + 18.0), 1.8, 0.8, m_metal, vertices=48, bevel=0.08)

# Additional small standoffs
for x, y in [(-41, 20), (41, 20), (-41, -9), (41, -9), (-18, 39), (18, 39)]:
    cyl('Small_Standoff', (x, y, floor + 3.5), 1.8, 7.0, m_case, vertices=32, bevel=0.15)

# ---------- Front openings ----------
cube('USB-C_Opening', (-25.0, -outer_y/2 + wall - 0.2, 11.0), (12.0, 1.2, 4.6), m_cut, bevel=0.35)
cube('Grove_Expansion_Opening', (2.0, -outer_y/2 + wall - 0.2, 11.5), (14.0, 1.2, 6.0), m_cut, bevel=0.25)
for i in range(5):
    cube(f'Vent_{i+1}', (27.0 + i*3.2, -outer_y/2 + wall - 0.2, 12.0), (1.4, 1.2, 8.0), m_cut, bevel=0.08)

# ---------- Lid ----------
lid_z = 46.0
cube('Top_Lid', (0, 0, lid_z), (outer_x, outer_y, 4.2), m_lid, bevel=2.0)
cube('Lid_Inner_Frame', (0, 0, lid_z - 2.6), (outer_x - 10.0, outer_y - 10.0, 1.8), m_case, bevel=0.45)
for x in (-39.0, 39.0):
    for y in (-39.0, 39.0):
        cyl('Lid_Screw_Recess', (x, y, lid_z + 1.0), 4.2, 0.8, m_metal, vertices=56, bevel=0.08)
        cyl('Lid_Screw_Center', (x, y, lid_z + 1.35), 1.8, 0.9, m_cut, vertices=48, bevel=0.06)
text_obj('Lid_Title', 'M5 + GPS + Hat Heart', (0, 0, lid_z + 2.2), 3.8, m_white)

# Snap-fit tabs
cube('Tab_Front', (0, -outer_y/2 + 0.5, outer_z - 2.0), (14.0, 1.6, 3.2), m_lid, bevel=0.18)
cube('Tab_Back', (0, outer_y/2 - 0.5, outer_z - 2.0), (14.0, 1.6, 3.2), m_lid, bevel=0.18)
cube('Tab_Left', (-outer_x/2 + 0.5, 0, outer_z - 2.0), (1.6, 14.0, 3.2), m_lid, bevel=0.18)
cube('Tab_Right', (outer_x/2 - 0.5, 0, outer_z - 2.0), (1.6, 14.0, 3.2), m_lid, bevel=0.18)

# ---------- Dimension bars ----------
cube('Dim_X', (0, 56.0, 1.4), (100.0, 0.7, 0.7), m_metal, bevel=0.08)
cube('Dim_Y', (56.0, 0, 1.4), (0.7, 100.0, 0.7), m_metal, bevel=0.08)
cube('Dim_Z', (-56.0, -54.0, 17.0), (0.7, 0.7, 34.0), m_metal, bevel=0.08)
text_obj('Dim_X_Text', '100 mm', (0, 59.0, 2.0), 2.8, m_white)
text_obj('Dim_Y_Text', '100 mm', (59.0, 0, 2.0), 2.8, m_white, rot=(math.radians(90), 0, math.radians(90)))
text_obj('Dim_Z_Text', '34 mm', (-59.0, -54.0, 17.0), 2.8, m_white, rot=(math.radians(90), 0, math.radians(90)))

# ---------- Camera / lights ----------
bpy.ops.object.camera_add(location=(130, -138, 105))
cam = bpy.context.object
cam.name = 'Camera'
scene.camera = cam
track = (Vector((0, 0, 18)) - cam.location).to_track_quat('-Z', 'Y')
cam.rotation_euler = track.to_euler()
cam.data.lens = 45

bpy.ops.object.light_add(type='AREA', location=(35, -65, 120))
light = bpy.context.object
light.name = 'AreaLight'
light.data.energy = 650
light.data.size = 90

bpy.ops.object.light_add(type='POINT', location=(-90, 70, 85))
fill = bpy.context.object
fill.name = 'FillLight'
fill.data.energy = 140

# ---------- Metadata ----------
scene['Project'] = 'Enclosure for M5 + GPS + Hat Heart'
scene['Design_Summary'] = 'One box for three modules. Hat Heart mounted at the front end of M5. GPS mounted below M5. Includes lid, rails, cable channels, screw bosses and front interface openings.'
scene['Outer_Size'] = '100 x 100 x 34 mm concept size'
scene['M5_Slot'] = '72 x 28 mm footprint'
scene['GPS_Slot'] = '72 x 28 mm footprint'
scene['HatHeart_Slot'] = '28 x 16 mm footprint located at M5 front end'
scene['Manufacturing'] = '3D print friendly concept; verify actual hardware dimensions before fabrication.'

# ---------- Save & export ----------
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
