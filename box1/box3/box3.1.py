import bpy
import math
from mathutils import Vector

OUT_BLEND = '/mnt/data/m5_gps_hatheart_side_box.blend'
OUT_OBJ = '/mnt/data/m5_gps_hatheart_side_box.obj'
OUT_STL = '/mnt/data/m5_gps_hatheart_side_box.stl'

# ---------- Reset ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 0.001  # 1 unit = 1 mm
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
m_hat = make_mat('HatHeart_BlackBoard', (0.06, 0.06, 0.07, 1), 0.42)
m_screen = make_mat('Screen_Black', (0.01, 0.01, 0.015, 1), 0.08)
m_button = make_mat('Button_White', (0.92, 0.92, 0.90, 1), 0.32)
m_blue = make_mat('Guide_Blue', (0.04, 0.30, 0.95, 1), 0.35)
m_green = make_mat('Guide_Green', (0.22, 0.75, 0.18, 1), 0.35)
m_red = make_mat('Guide_Red', (0.88, 0.18, 0.22, 1), 0.35)
m_cut = make_mat('Cutout_Dark', (0.012, 0.012, 0.012, 1), 0.65)
m_metal = make_mat('Metal', (0.62, 0.62, 0.64, 1), 0.25, 0.35)
m_white = make_mat('White_Text', (1, 1, 1, 1), 0.5)
m_black = make_mat('Black_Text', (0.02, 0.02, 0.02, 1), 0.5)
m_wire_r = make_mat('Wire_Red', (0.82,0.15,0.12,1), 0.35)
m_wire_y = make_mat('Wire_Yellow', (0.90,0.78,0.08,1), 0.35)
m_wire_g = make_mat('Wire_Green', (0.10,0.62,0.18,1), 0.35)

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

# ---------- Parameters ----------
outer_x, outer_y, outer_z = 100.0, 100.0, 34.0
wall = 3.0
floor = 3.0
inner_x, inner_y = outer_x - 2*wall, outer_y - 2*wall

# Layout: M5 top-left, Hat Heart to its right (about half-size), GPS below M5.
m5_center = (-11.0, 18.0)
hat_center = (30.0, 18.0)
gps_center = (-11.0, -21.0)

m5_slot = (60.0, 30.0)
gps_slot = (60.0, 28.0)
hat_slot = (26.0, 30.0)

m5_mod = (54.0, 24.0, 9.0)
gps_mod = (54.0, 22.0, 8.0)
hat_mod = (20.0, 16.0, 5.0)

# ---------- Lower shell ----------
cube('LowerShell_Floor', (0, 0, floor/2), (outer_x, outer_y, floor), m_case, bevel=2.0)
cube('Front_Wall', (0, -outer_y/2 + wall/2, outer_z/2), (outer_x, wall, outer_z), m_case, bevel=1.0)
cube('Back_Wall', (0, outer_y/2 - wall/2, outer_z/2), (outer_x, wall, outer_z), m_case, bevel=1.0)
cube('Left_Wall', (-outer_x/2 + wall/2, 0, outer_z/2), (wall, inner_y, outer_z), m_case, bevel=1.0)
cube('Right_Wall', (outer_x/2 - wall/2, 0, outer_z/2), (wall, inner_y, outer_z), m_case, bevel=1.0)

# Lid support lip
cube('Lip_Front', (0, -outer_y/2 + 5.2, outer_z - 2.8), (outer_x - 9, 2.0, 2.2), m_lid, bevel=0.4)
cube('Lip_Back', (0, outer_y/2 - 5.2, outer_z - 2.8), (outer_x - 9, 2.0, 2.2), m_lid, bevel=0.4)
cube('Lip_Left', (-outer_x/2 + 5.2, 0, outer_z - 2.8), (2.0, outer_y - 9, 2.2), m_lid, bevel=0.4)
cube('Lip_Right', (outer_x/2 - 5.2, 0, outer_z - 2.8), (2.0, outer_y - 9, 2.2), m_lid, bevel=0.4)

# ---------- Slot footprints ----------
cube('M5_Slot_Footprint', (m5_center[0], m5_center[1], floor + 0.45), (m5_slot[0], m5_slot[1], 0.9), m_blue, bevel=0.6)
cube('HatHeart_Slot_Footprint', (hat_center[0], hat_center[1], floor + 0.45), (hat_slot[0], hat_slot[1], 0.9), m_red, bevel=0.5)
cube('GPS_Slot_Footprint', (gps_center[0], gps_center[1], floor + 0.45), (gps_slot[0], gps_slot[1], 0.9), m_green, bevel=0.6)

# Divider ribs
cube('Divider_M5_to_GPS', (-11.0, -1.0, floor + 4.0), (66.0, 2.2, 7.0), m_case, bevel=0.3)
cube('Divider_M5_to_HatHeart', (13.0, 18.0, floor + 4.0), (2.2, 34.0, 7.0), m_case, bevel=0.3)

# ---------- Slot rails ----------
def slot_rails(prefix, cx, cy, sw, sh, guide_color):
    rail_t = 2.0
    rail_h = 5.0
    cube(f'{prefix}_Rail_Left', (cx - sw/2 - rail_t/2 + 0.9, cy, floor + 3.4), (rail_t, sh + 4.0, rail_h), m_case, bevel=0.2)
    cube(f'{prefix}_Rail_Right', (cx + sw/2 + rail_t/2 - 0.9, cy, floor + 3.4), (rail_t, sh + 4.0, rail_h), m_case, bevel=0.2)
    cube(f'{prefix}_Rail_Top', (cx, cy + sh/2 + rail_t/2 - 0.5, floor + 3.4), (sw + 2.0, rail_t, rail_h), m_case, bevel=0.2)
    cube(f'{prefix}_Rail_Bottom', (cx, cy - sh/2 - rail_t/2 + 0.5, floor + 3.4), (sw + 2.0, rail_t, rail_h), m_case, bevel=0.2)
    cube(f'{prefix}_Guide_Left', (cx - sw/2 + 1.1, cy, floor + 5.9), (0.6, sh + 2.0, 0.45), guide_color, bevel=0.08)
    cube(f'{prefix}_Guide_Right', (cx + sw/2 - 1.1, cy, floor + 5.9), (0.6, sh + 2.0, 0.45), guide_color, bevel=0.08)

slot_rails('M5', m5_center[0], m5_center[1], m5_slot[0], m5_slot[1], m_blue)
slot_rails('HatHeart', hat_center[0], hat_center[1], hat_slot[0], hat_slot[1], m_red)
slot_rails('GPS', gps_center[0], gps_center[1], gps_slot[0], gps_slot[1], m_green)

# ---------- Cable channels ----------
cube('Cable_Channel_Hat_to_M5', (18.0, 18.0, floor + 1.1), (10.0, 3.0, 1.2), m_cut, bevel=0.15)
cube('Cable_Channel_M5_to_GPS', (-11.0, -1.0, floor + 1.1), (18.0, 3.0, 1.2), m_cut, bevel=0.15)
cube('Cable_Channel_Right', (40.0, 0.0, floor + 1.1), (3.0, 74.0, 1.2), m_cut, bevel=0.15)

# ---------- Module placeholders ----------
# M5
cube('M5_Module', (m5_center[0], m5_center[1], floor + m5_mod[2]/2 + 1.5), m5_mod, m_m5, bevel=1.0)
cube('M5_Screen', (m5_center[0] - 5.0, m5_center[1], floor + m5_mod[2] + 1.8), (26.0, 15.0, 0.6), m_screen, bevel=0.2)
for i, yoff in enumerate([-7.0, 0.0, 7.0], start=1):
    cube(f'M5_Button_{i}', (m5_center[0] + 19.0, m5_center[1] + yoff, floor + m5_mod[2] + 1.95), (3.8, 3.4, 0.7), m_button, bevel=0.15)
text_obj('M5_Emboss', 'M5', (m5_center[0] - 24.0, m5_center[1], floor + m5_mod[2] + 2.1), 4.2, m_black)

# Hat Heart - side of M5, about half size
cube('HatHeart_Module', (hat_center[0], hat_center[1], floor + hat_mod[2]/2 + 1.5), hat_mod, m_hat, bevel=0.6)
# Connector and two small sensor pads
cube('HatHeart_Connector', (hat_center[0], hat_center[1] - 5.2, floor + hat_mod[2] + 1.4), (10.0, 2.6, 0.6), m_metal, bevel=0.08)
cyl('HatHeart_Sensor_1', (hat_center[0]-5.0, hat_center[1]+5.0, floor + hat_mod[2] + 1.45), 1.6, 0.45, m_metal, vertices=24, bevel=0.04)
cyl('HatHeart_Sensor_2', (hat_center[0]+5.0, hat_center[1]+5.0, floor + hat_mod[2] + 1.45), 1.6, 0.45, m_metal, vertices=24, bevel=0.04)
text_obj('HatHeart_Text', 'HAT\nHEART', (hat_center[0], hat_center[1], floor + hat_mod[2] + 1.9), 2.5, m_white)

# GPS
cube('GPS_Module', (gps_center[0], gps_center[1], floor + gps_mod[2]/2 + 1.5), gps_mod, m_gps, bevel=1.0)
text_obj('GPS_Label', 'GPS', (gps_center[0], gps_center[1] + 3.5, floor + gps_mod[2] + 2.0), 5.0, m_black)
text_obj('GPS_Sub', 'u-blox\nNEO-6M', (gps_center[0], gps_center[1] - 3.5, floor + gps_mod[2] + 1.9), 2.2, m_black)

# Wires between GPS and right/front edge
for name, x, z, mat in [('WireRed', 16.0, 8.4, m_wire_r), ('WireYellow', 17.7, 8.6, m_wire_y), ('WireGreen', 19.4, 8.2, m_wire_g)]:
    cube(name, (x, -13.0, z), (1.1, 11.0, 1.1), mat, bevel=0.15)
    bpy.context.object.rotation_euler[0] = math.radians(90)

# Small wire bridge Hat -> M5
for name, x, mat in [('HatWireRed', 20.0, m_wire_r), ('HatWireYellow', 21.5, m_wire_y), ('HatWireGreen', 23.0, m_wire_g)]:
    cube(name, (x, 18.0, 10.2), (1.0, 10.0, 1.0), mat, bevel=0.12)
    bpy.context.object.rotation_euler[1] = math.radians(90)

# ---------- Screw bosses ----------
for x in (-39.0, 39.0):
    for y in (-39.0, 39.0):
        cyl(f'ScrewBoss_{x}_{y}', (x, y, floor + 9.0), 4.2, 18.0, m_case, vertices=56, bevel=0.18)
        cyl(f'ScrewHole_{x}_{y}', (x, y, floor + 18.0), 1.8, 0.8, m_metal, vertices=48, bevel=0.05)

# Additional standoffs
for x, y in [(-41, 18), (41, 18), (-41, -1), (41, -1), (18, 39), (18, -39)]:
    cyl('Small_Standoff', (x, y, floor + 3.5), 1.8, 7.0, m_case, vertices=32, bevel=0.1)

# ---------- Front openings ----------
cube('USB_C_Opening', (-25.0, -outer_y/2 + wall - 0.2, 11.0), (12.0, 1.2, 4.6), m_cut, bevel=0.3)
cube('Expansion_Opening', (2.0, -outer_y/2 + wall - 0.2, 11.5), (14.0, 1.2, 6.0), m_cut, bevel=0.25)
for i in range(5):
    cube(f'Vent_{i+1}', (27.0 + i*3.2, -outer_y/2 + wall - 0.2, 12.0), (1.4, 1.2, 8.0), m_cut, bevel=0.06)

# ---------- Lid ----------
lid_z = 46.0
cube('Top_Lid', (0, 0, lid_z), (outer_x, outer_y, 4.2), m_lid, bevel=2.0)
cube('Lid_Inner_Frame', (0, 0, lid_z - 2.6), (outer_x - 10.0, outer_y - 10.0, 1.8), m_case, bevel=0.4)
for x in (-39.0, 39.0):
    for y in (-39.0, 39.0):
        cyl('Lid_Screw_Recess', (x, y, lid_z + 1.0), 4.2, 0.8, m_metal, vertices=56, bevel=0.05)
        cyl('Lid_Screw_Center', (x, y, lid_z + 1.35), 1.8, 0.9, m_cut, vertices=48, bevel=0.04)
text_obj('Lid_Title', 'M5 + GPS + Hat Heart', (0, 0, lid_z + 2.2), 3.8, m_white)

cube('Tab_Front', (0, -outer_y/2 + 0.5, outer_z - 2.0), (14.0, 1.6, 3.2), m_lid, bevel=0.14)
cube('Tab_Back', (0, outer_y/2 - 0.5, outer_z - 2.0), (14.0, 1.6, 3.2), m_lid, bevel=0.14)
cube('Tab_Left', (-outer_x/2 + 0.5, 0, outer_z - 2.0), (1.6, 14.0, 3.2), m_lid, bevel=0.14)
cube('Tab_Right', (outer_x/2 - 0.5, 0, outer_z - 2.0), (1.6, 14.0, 3.2), m_lid, bevel=0.14)

# ---------- Dimension markers ----------
cube('Dim_X', (0, 56.0, 1.4), (100.0, 0.7, 0.7), m_metal, bevel=0.06)
cube('Dim_Y', (56.0, 0, 1.4), (0.7, 100.0, 0.7), m_metal, bevel=0.06)
cube('Dim_Z', (-56.0, -54.0, 17.0), (0.7, 0.7, 34.0), m_metal, bevel=0.06)
text_obj('Dim_X_Text', '100 mm', (0, 59.0, 2.0), 2.8, m_white)
text_obj('Dim_Y_Text', '100 mm', (59.0, 0, 2.0), 2.8, m_white, rot=(math.radians(90), 0, math.radians(90)))
text_obj('Dim_Z_Text', '34 mm', (-59.0, -54.0, 17.0), 2.8, m_white, rot=(math.radians(90), 0, math.radians(90)))

# ---------- Camera & lights ----------
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
scene['Project'] = 'Enclosure for M5 + GPS + side-mounted Hat Heart'
scene['Design_Summary'] = 'Square enclosure. M5 in main slot, GPS below, Hat Heart on the side of M5. Hat Heart is about half the size of M5.'
scene['Outer_Size'] = '100 x 100 x 34 mm concept size'
scene['M5_Slot'] = '60 x 30 mm footprint'
scene['GPS_Slot'] = '60 x 28 mm footprint'
scene['HatHeart_Slot'] = '26 x 30 mm footprint, side-mounted next to M5'
scene['Manufacturing'] = 'Concept for 3D printing. Verify real hardware dimensions before fabrication.'

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
