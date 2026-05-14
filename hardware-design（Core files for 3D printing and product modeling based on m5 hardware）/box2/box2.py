import bpy
import math
from mathutils import Vector
from pathlib import Path

OUT_BLEND = '/mnt/data/m5_gps_square_box.blend'
OUT_OBJ = '/mnt/data/m5_gps_square_box.obj'
OUT_STL = '/mnt/data/m5_gps_square_box.stl'

# ---------- Clean scene ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 0.001  # 1 Blender unit = 1 mm
scene.render.engine = 'CYCLES'
scene.cycles.samples = 64
scene.render.resolution_x = 1600
scene.render.resolution_y = 1200

# ---------- Collection ----------
collection = bpy.data.collections.new('M5_GPS_Box')
scene.collection.children.link(collection)
view_layer = bpy.context.view_layer


def link_obj(obj):
    # link to our collection and unlink from master if needed
    if obj.name not in collection.objects:
        collection.objects.link(obj)
    try:
        scene.collection.objects.unlink(obj)
    except Exception:
        pass
    return obj


def make_mat(name, rgba, rough=0.45, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = rgba
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metallic
    return mat

m_case = make_mat('Case_DarkGrey', (0.18, 0.18, 0.19, 1.0), 0.5, 0.0)
m_lid = make_mat('Lid_Grey', (0.46, 0.46, 0.47, 1.0), 0.42, 0.0)
m_m5 = make_mat('M5_Black', (0.04, 0.045, 0.05, 1.0), 0.38, 0.0)
m_gps = make_mat('GPS_White', (0.92, 0.92, 0.88, 1.0), 0.35, 0.0)
m_screen = make_mat('Screen_Black', (0.01, 0.01, 0.015, 1.0), 0.08, 0.0)
m_button = make_mat('Button_White', (0.90, 0.90, 0.90, 1.0), 0.3, 0.0)
m_metal = make_mat('Metal', (0.6, 0.6, 0.63, 1.0), 0.25, 0.4)
m_cut = make_mat('Cutout_Dark', (0.02, 0.02, 0.02, 1.0), 0.7, 0.0)
m_blue = make_mat('Blue_Label', (0.1, 0.35, 0.95, 1.0), 0.35, 0.0)
m_green = make_mat('Green_Label', (0.2, 0.8, 0.2, 1.0), 0.35, 0.0)
m_white = make_mat('White_Text', (1, 1, 1, 1), 0.5, 0.0)


def apply_material(obj, mat):
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
        apply_material(obj, mat)
    if bevel > 0:
        mod = obj.modifiers.new('Bevel', 'BEVEL')
        mod.width = bevel
        mod.segments = 4
        mod.limit_method = 'ANGLE'
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
    link_obj(obj)
    return obj


def cylinder(name, loc, radius, depth, mat=None, vertices=48):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc)
    obj = bpy.context.object
    obj.name = name
    if mat:
        apply_material(obj, mat)
    link_obj(obj)
    return obj


def text_obj(name, text, loc, size=3.0, mat=None, rot=(math.radians(90), 0, 0)):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    obj = bpy.context.object
    obj.name = name
    obj.data.body = text
    obj.data.align_x = 'CENTER'
    obj.data.align_y = 'CENTER'
    obj.data.size = size
    obj.data.extrude = 0.08
    if mat:
        obj.data.materials.append(mat)
    link_obj(obj)
    return obj

# ---------- Dimensions (mm) ----------
# Concept box for M5StickC Plus + GPS module
outer_x, outer_y, outer_z = 90.0, 90.0, 30.0
wall = 3.0
floor = 3.0
inner_x, inner_y = outer_x - 2*wall, outer_y - 2*wall

# module nominal sizes (concept, easy to modify)
m5_size = (28.0, 55.0, 14.0)   # M5StickC Plus approx with clearance
m5_slot = (31.0, 58.0, 15.5)    # slot clearance footprint
gps_size = (26.0, 26.0, 12.0)
gps_slot = (29.0, 29.0, 13.5)

# ---------- Base shell ----------
base = cube('Base_Floor', (0, 0, floor/2), (outer_x, outer_y, floor), m_case, bevel=1.8)
front = cube('Front_Wall', (0, -outer_y/2 + wall/2, outer_z/2), (outer_x, wall, outer_z), m_case, bevel=0.8)
back = cube('Back_Wall', (0, outer_y/2 - wall/2, outer_z/2), (outer_x, wall, outer_z), m_case, bevel=0.8)
left = cube('Left_Wall', (-outer_x/2 + wall/2, 0, outer_z/2), (wall, inner_y, outer_z), m_case, bevel=0.8)
right = cube('Right_Wall', (outer_x/2 - wall/2, 0, outer_z/2), (wall, inner_y, outer_z), m_case, bevel=0.8)

# top inner lip to support lid
lip_h = 2.0
cube('Lip_Front', (0, -outer_y/2 + wall + 1.2, outer_z - lip_h/2 - 1.2), (outer_x - 8, 2.0, lip_h), m_lid, bevel=0.4)
cube('Lip_Back', (0, outer_y/2 - wall - 1.2, outer_z - lip_h/2 - 1.2), (outer_x - 8, 2.0, lip_h), m_lid, bevel=0.4)
cube('Lip_Left', (-outer_x/2 + wall + 1.2, 0, outer_z - lip_h/2 - 1.2), (2.0, outer_y - 8, lip_h), m_lid, bevel=0.4)
cube('Lip_Right', (outer_x/2 - wall - 1.2, 0, outer_z - lip_h/2 - 1.2), (2.0, outer_y - 8, lip_h), m_lid, bevel=0.4)

# ---------- Internal layout ----------
# Main arrangement: M5 on left, GPS on top-right, free cable area at bottom-right.
m5_center = (-18.0, 0.0)
gps_center = (20.0, 17.5)

# divider wall
cube('Main_Divider', (5.0, 4.0, floor + 5.0), (2.4, 68.0, 8.5), m_case, bevel=0.4)

# M5 slot rails
rail_t = 2.0
rail_h = 5.5
cube('M5_Rail_Left', (m5_center[0] - m5_slot[0]/2 - rail_t/2 + 0.5, m5_center[1], floor + rail_h/2 + 1.0), (rail_t, m5_slot[1] + 3.0, rail_h), m_case, bevel=0.3)
cube('M5_Rail_Right', (m5_center[0] + m5_slot[0]/2 + rail_t/2 - 0.5, m5_center[1], floor + rail_h/2 + 1.0), (rail_t, m5_slot[1] + 3.0, rail_h), m_case, bevel=0.3)
cube('M5_Stop_Top', (m5_center[0], m5_center[1] + m5_slot[1]/2 + 1.0, floor + rail_h/2 + 1.0), (m5_slot[0] + 2.0, 2.0, rail_h), m_case, bevel=0.3)
cube('M5_Stop_Bottom', (m5_center[0], m5_center[1] - m5_slot[1]/2 - 1.0, floor + rail_h/2 + 1.0), (m5_slot[0] + 2.0, 2.0, rail_h), m_case, bevel=0.3)

# GPS slot rails
cube('GPS_Rail_Left', (gps_center[0] - gps_slot[0]/2 - rail_t/2 + 0.4, gps_center[1], floor + 3.4), (rail_t, gps_slot[1] + 2.0, 4.8), m_case, bevel=0.25)
cube('GPS_Rail_Right', (gps_center[0] + gps_slot[0]/2 + rail_t/2 - 0.4, gps_center[1], floor + 3.4), (rail_t, gps_slot[1] + 2.0, 4.8), m_case, bevel=0.25)
cube('GPS_Stop_Top', (gps_center[0], gps_center[1] + gps_slot[1]/2 + 0.9, floor + 3.4), (gps_slot[0] + 2.0, 2.0, 4.8), m_case, bevel=0.25)
cube('GPS_Stop_Bottom', (gps_center[0], gps_center[1] - gps_slot[1]/2 - 0.9, floor + 3.4), (gps_slot[0] + 2.0, 2.0, 4.8), m_case, bevel=0.25)

# Cable trenches / wire management
cube('Cable_Channel_M5_to_GPS', (4.0, 14.0, floor + 0.6), (20.0, 4.0, 1.2), m_cut, bevel=0.2)
cube('Cable_Reserve_Area', (20.0, -20.0, floor + 0.55), (28.0, 20.0, 1.1), m_cut, bevel=0.2)

# ---------- Placeholder modules ----------
# M5 body
m5_body = cube('M5StickC_Plus_Placeholder', (m5_center[0], m5_center[1], floor + m5_size[2]/2 + 1.5), m5_size, m_m5, bevel=1.2)
cube('M5_Screen', (m5_center[0], m5_center[1] + 7.0, floor + m5_size[2] - 1.0 + 1.5), (20.0, 30.0, 0.8), m_screen, bevel=0.5)
for idx, xoff in enumerate((-7.5, 0.0, 7.5), 1):
    cube(f'M5_Button_{idx}', (m5_center[0] + xoff, m5_center[1] - 22.0, floor + m5_size[2] - 0.8 + 1.5), (5.0, 2.5, 0.7), m_button, bevel=0.35)

# GPS placeholder
gps_body = cube('GPS_Module_Placeholder', (gps_center[0], gps_center[1], floor + gps_size[2]/2 + 1.5), gps_size, m_gps, bevel=1.0)
text_obj('GPS_Label', 'GPS', (gps_center[0], gps_center[1], floor + gps_size[2] + 1.8), 4.0, m_blue)
text_obj('M5_Label', 'M5', (m5_center[0], m5_center[1], floor + m5_size[2] + 2.0), 4.0, m_white)

# ---------- Screw bosses ----------
for x in (-36.0, 36.0):
    for y in (-36.0, 36.0):
        cylinder(f'Screw_Boss_{x}_{y}', (x, y, floor + 8.5), 4.0, 17.0, m_case)
        cylinder(f'Screw_HoleVisual_{x}_{y}', (x, y, floor + 16.8), 1.8, 0.8, m_metal)

# extra standoffs near slots
for name, x, y in [('Standoff_M5_Top', -1.5, 30.0), ('Standoff_M5_Bottom', -1.5, -30.0), ('Standoff_GPS_1', 35.0, 32.0), ('Standoff_GPS_2', 10.0, 32.0)]:
    cylinder(name, (x, y, floor + 3.2), 2.0, 6.5, m_case, vertices=32)

# ---------- Front wall cutout placeholders ----------
# USB-C opening aligned with M5 bottom edge / conceptual
cube('USB_C_Open_Placeholder', (-18.0, -outer_y/2 - 0.2 + wall, 10.5), (10.0, 1.0, 4.0), m_cut, bevel=0.5)
# Grove / cable opening on right front
cube('Grove_Open_Placeholder', (12.0, -outer_y/2 - 0.2 + wall, 11.5), (12.0, 1.0, 6.0), m_cut, bevel=0.3)
# Vents
for i in range(4):
    cube(f'Vent_Slit_{i+1}', (28.0 + i*4.0, -outer_y/2 - 0.2 + wall, 11.0), (1.8, 1.0, 8.0), m_cut, bevel=0.1)

# ---------- Lid ----------
lid_z = 42.0
lid = cube('Top_Lid', (0, 0, lid_z), (outer_x, outer_y, 4.0), m_lid, bevel=1.8)
lip = cube('Lid_Inner_Locating_Frame', (0, 0, lid_z - 2.2), (outer_x - 10.0, outer_y - 10.0, 1.8), m_case, bevel=0.5)
for x in (-36.0, 36.0):
    for y in (-36.0, 36.0):
        cylinder(f'Lid_Screw_Recess_{x}_{y}', (x, y, lid_z + 0.9), 4.0, 0.8, m_metal)
        cylinder(f'Lid_Screw_Center_{x}_{y}', (x, y, lid_z + 1.2), 1.6, 0.8, m_cut)
text_obj('Lid_Title', 'M5 + GPS BOX', (0, 0, lid_z + 2.2), 4.8, m_white)

# latch tabs (concept)
for (x, y, sx, sy) in [(0, -outer_y/2 + 0.9, 12.0, 1.8), (0, outer_y/2 - 0.9, 12.0, 1.8), (-outer_x/2 + 0.9, 0, 1.8, 12.0), (outer_x/2 - 0.9, 0, 1.8, 12.0)]:
    cube('Latch_Tab', (x, y, outer_z - 2.0), (sx, sy, 3.0), m_lid, bevel=0.2)

# ---------- Dimension aids ----------
def dim_bar(name, loc, dims):
    return cube(name, loc, dims, m_metal, bevel=0.08)

dim_bar('Dim_X', (0, 53.0, 1.5), (90.0, 0.7, 0.7))
dim_bar('Dim_Y', (53.0, 0, 1.5), (0.7, 90.0, 0.7))
dim_bar('Dim_Z', (-53.0, -50.0, 15.0), (0.7, 0.7, 30.0))
text_obj('Dim_X_Text', '90 mm', (0, 56.0, 2.0), 2.8, m_white)
text_obj('Dim_Y_Text', '90 mm', (56.0, 0, 2.0), 2.8, m_white, rot=(math.radians(90), 0, math.radians(90)))
text_obj('Dim_Z_Text', '30 mm', (-56.0, -50.0, 15.0), 2.8, m_white, rot=(math.radians(90), 0, math.radians(90)))

# ---------- Camera & light ----------
bpy.ops.object.camera_add(location=(120, -130, 95))
camera = bpy.context.object
camera.name = 'Camera'
scene.camera = camera
track = (Vector((0, 0, 18)) - camera.location).to_track_quat('-Z', 'Y')
camera.rotation_euler = track.to_euler()
camera.data.lens = 45
link_obj(camera)

bpy.ops.object.light_add(type='AREA', location=(30, -50, 110))
light = bpy.context.object
light.name = 'Area_Light'
light.data.energy = 500
light.data.size = 90
link_obj(light)

bpy.ops.object.light_add(type='POINT', location=(-80, 60, 80))
fill = bpy.context.object
fill.name = 'Fill_Light'
fill.data.energy = 150
link_obj(fill)

# ---------- Notes/custom properties ----------
scene['Project'] = 'Square enclosure for M5StickC Plus + GPS module'
scene['Design_Notes'] = 'Concept enclosure, square box, separate slots, cable channels, screw bosses, lid, port reservations.'
scene['Dimensions'] = 'Outer 90x90x30 mm; revise after measuring real hardware.'
scene['Slots'] = 'M5 slot approx 31x58 mm; GPS slot approx 29x29 mm.'
scene['Manufacturing'] = '3D printing suggested: PETG/ABS, wall 2.5-3mm, 0.5-1.0mm clearance.'

# ---------- Save and export ----------
# Ensure all objects are visible/selectable
for obj in bpy.data.objects:
    obj.hide_viewport = False
    obj.hide_render = False

# Save blend
bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)

# Export OBJ / STL for compatibility
mesh_objects = [obj for obj in bpy.data.objects if obj.type == 'MESH']
for obj in bpy.data.objects:
    obj.select_set(False)
for obj in mesh_objects:
    obj.select_set(True)
view_layer.objects.active = mesh_objects[0] if mesh_objects else None

# Try modern OBJ exporter first, fallback to legacy operator if unavailable
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
