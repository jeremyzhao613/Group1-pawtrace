import bpy, math
from mathutils import Vector

# clean
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# units: mm via scale 0.001 m
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 0.001

# materials
def mat(name, color, rough=0.55, metallic=0):
    m=bpy.data.materials.new(name); m.use_nodes=True
    bsdf=m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value=color
    bsdf.inputs['Roughness'].default_value=rough
    bsdf.inputs['Metallic'].default_value=metallic
    return m
case=mat('matte dark grey printable plastic', (0.18,0.18,0.17,1))
lidmat=mat('lighter grey lid plastic', (0.44,0.44,0.42,1))
blue=mat('blue M5Stack slot highlight', (0.02,0.26,0.9,1))
green=mat('green GPS slot highlight', (0.15,0.70,0.12,1))
orange=mat('orange NPC slot highlight', (1.0,0.42,0.04,1))
black=mat('black module plastic', (0.02,0.02,0.025,1))
white=mat('white GPS module plastic', (0.93,0.92,0.86,1))
screenmat=mat('glossy black screen', (0,0,0,1),0.12)
buttonmat=mat('light grey buttons', (0.86,0.86,0.82,1))
metal=mat('brushed screw metal', (0.62,0.62,0.60,1),0.25,0.3)
cutmat=mat('dark port openings', (0.005,0.005,0.005,1))
textmat=mat('white label text', (1,1,1,1))

# helper funcs
def cube(name, loc, dim, material, bevel=0, display_type='TEXTURED'):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o=bpy.context.object; o.name=name; o.dimensions=dim; bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    o.display_type=display_type
    if bevel:
        be=o.modifiers.new('rounded/beveled edges', 'BEVEL'); be.width=bevel; be.segments=5
        o.modifiers.new('weighted normals','WEIGHTED_NORMAL')
    return o

def cyl(name, loc, radius, depth, material, vertices=48, bevel=0.2):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc)
    o=bpy.context.object; o.name=name; o.data.materials.append(material)
    if bevel:
        be=o.modifiers.new('beveled cylinder edge','BEVEL'); be.width=bevel; be.segments=3
        o.modifiers.new('weighted normals','WEIGHTED_NORMAL')
    return o

def text(name, body, loc, size, material, rot=(math.radians(90),0,0)):
    bpy.ops.object.text_add(location=loc, rotation=rot)
    o=bpy.context.object; o.name=name; o.data.body=body; o.data.size=size; o.data.align_x='CENTER'; o.data.align_y='CENTER'; o.data.extrude=0.05
    o.data.materials.append(material)
    return o

# dimensions
OX,OY,OZ = 100,100,32
wall=3; floor=3

# collections
main_col=bpy.data.collections.new('M5Stack_GPS_NPC_square_enclosure_design')
bpy.context.scene.collection.children.link(main_col)
def add_to_col(o):
    for c in o.users_collection: c.objects.unlink(o)
    main_col.objects.link(o); return o

# lower shell made as printable wall/floor pieces (open top)
for o in [
    cube('bottom floor plate: 100 x 100 x 3 mm', (0,0,1.5), (OX,OY,floor), case, 2.0),
    cube('front wall: 100 x 3 x 32 mm with visual port cutouts', (0,-OY/2+wall/2,OZ/2), (OX,wall,OZ), case,1.2),
    cube('back wall: 100 x 3 x 32 mm', (0,OY/2-wall/2,OZ/2), (OX,wall,OZ), case,1.2),
    cube('left wall: 3 x 94 x 32 mm', (-OX/2+wall/2,0,OZ/2), (wall,OY-2*wall,OZ), case,1.2),
    cube('right wall: 3 x 94 x 32 mm', (OX/2-wall/2,0,OZ/2), (wall,OY-2*wall,OZ), case,1.2)]: add_to_col(o)

# internal lid lip/rim
for o in [
    cube('front inner lid support lip', (0,-44,OZ-3.5), (88,2,2.2), lidmat,0.4),
    cube('back inner lid support lip', (0,44,OZ-3.5), (88,2,2.2), lidmat,0.4),
    cube('left inner lid support lip', (-44,0,OZ-3.5), (2,88,2.2), lidmat,0.4),
    cube('right inner lid support lip', (44,0,OZ-3.5), (2,88,2.2), lidmat,0.4)]: add_to_col(o)

# slot floors
slot_specs=[
    ('M5Stack main slot floor / clearance area 44 x 64 mm',(-22,1,3.55),(44,64,1.1),blue),
    ('GPS module slot floor / clearance area 27 x 27 mm',(27,22,3.65),(27,27,1.3),green),
    ('NPC module slot floor / clearance area 32 x 27 mm',(27,-19,3.65),(32,27,1.3),orange)]
for n,l,d,m in slot_specs: add_to_col(cube(n,l,d,m,0.7))

# retaining rails and dividers
rail_data=[
('M5Stack left guide rail',(-45,1,6.4),(2,66,5.4)),('M5Stack right guide rail',(1,1,6.4),(2,66,5.4)),('M5Stack rear stop rail',(-22,34,6.4),(44,2,5.4)),('M5Stack front stop rail',(-22,-32,6.4),(44,2,5.4)),
('GPS left guide rail',(12,22,6.2),(2,29,5)),('GPS right guide rail',(42,22,6.2),(2,29,5)),('GPS rear stop rail',(27,37,6.2),(29,2,5)),('GPS front stop rail',(27,7,6.2),(29,2,5)),
('NPC left guide rail',(10,-19,6.2),(2,29,5)),('NPC right guide rail',(44,-19,6.2),(2,29,5)),('NPC rear stop rail',(27,-4,6.2),(32,2,5)),('NPC front stop rail',(27,-34,6.2),(32,2,5)),
('vertical divider rib between main slot and side modules',(5,1,8),(2.5,72,8)),('horizontal divider rib between GPS and NPC slots',(27,2,7.8),(36,2.5,7.5))]
for n,l,d in rail_data: add_to_col(cube(n,l,d,case,0.6))

# placeholder modules
add_to_col(cube('placeholder M5Stack / M5StickC Plus body 38 x 58 x 8.5 mm', (-22,1,10.3), (38,58,8.5), black,1.7))
add_to_col(cube('M5Stack screen placeholder', (-22,8,15.0), (31,38,0.55), screenmat,0.8))
for i,x in enumerate([-33,-22,-11],1): add_to_col(cube(f'M5Stack front button {i}', (x,-24.5,15.2), (7,3,0.7), buttonmat,0.5))
add_to_col(cube('placeholder GPS module 21 x 21 x 7 mm', (27,22,11), (21,21,7), white,1.3))
add_to_col(cube('placeholder NPC module 25 x 20 x 7 mm', (27,-19,11), (25,20,7), black,1.3))

# cable channels as dark visual trenches
for n,l,d in [('cable channel M5Stack to GPS',(6,22,4.2),(13,5,1.2)),('cable channel M5Stack to NPC',(6,-19,4.2),(13,5,1.2)),('front cable management trench',(7,-42,4.2),(58,4,1.2))]: add_to_col(cube(n,l,d,cutmat,0.4))

# screw bosses and standoffs
for x in [-41,41]:
  for y in [-41,41]:
    add_to_col(cyl('M2.5 internal screw boss / lid fixing post', (x,y,12), 4.5,18,case,56,0.25))
    add_to_col(cyl('M2.5 screw hole visual insert', (x,y,21.3), 1.7,0.7,cutmat,48,0.1))
for x,y in [(-1,34),(-1,-32),(43,37),(43,-34),(10,37),(10,-34)]: add_to_col(cyl('small PCB/module fixing standoff', (x,y,7.5), 2.2,8,case,36,0.2))

# visual ports/vents on front face
for n,l,d in [('USB-C opening placeholder',(-35,-50.9,13),(12,0.8,5)),('Grove/extension opening placeholder',(-3,-50.9,13),(15,0.8,7))]: add_to_col(cube(n,l,d,cutmat,0.5))
for i in range(5): add_to_col(cube(f'vent slit {i+1}', (28+i*4,-50.95,13), (1.6,0.8,10), cutmat,0.15))

# removable lid floating above
add_to_col(cube('floating removable lid 100 x 100 x 4.5 mm', (0,0,46), (100,100,4.5), lidmat,2.2))
add_to_col(cube('lid inner locating lip inset frame', (0,0,42.5), (88,88,2), case,1.0))
for x in [-41,41]:
  for y in [-41,41]:
    add_to_col(cyl('lid screw recess visual', (x,y,48.5), 4.6,0.8,metal,56,0.15))
    add_to_col(cyl('lid screw center hole visual', (x,y,49.0), 1.7,0.9,cutmat,48,0.1))

# latch tabs
for l,d in [((0,-50,30),(12,1.5,4)),((0,50,30),(12,1.5,4)),((-50,0,30),(1.5,12,4)),((50,0,30),(1.5,12,4))]: add_to_col(cube('snap-fit latch tab on lid/body edge', l,d,lidmat,0.3))

# labels
for args in [('label M5Stack','M5Stack',(-22,8,15.8),5,textmat),('label GPS','GPS',(27,22,15.0),3.7,blue),('label NPC','NPC',(27,-19,15.0),4,textmat),('lid title text','M5 / GPS / NPC BOX',(0,0,49.2),4.4,textmat)]: add_to_col(text(*args))
# side annotation texts
add_to_col(text('design note text 1','Outer 100 x 100 x 32 mm',(-4,-66,20),3.2,textmat,(math.radians(75),0,0)))
add_to_col(text('design note text 2','Slots + rails + screw bosses + port reserves',(-4,-66,14),2.7,textmat,(math.radians(75),0,0)))
add_to_col(text('design note text 3','Verify real module dimensions before printing',(-4,-66,9),2.5,textmat,(math.radians(75),0,0)))

# dimension bars
add_to_col(cube('dimension bar X 100 mm',(0,58,2),(100,0.8,0.8),metal,0.1))
add_to_col(cube('dimension bar Y 100 mm',(58,0,2),(0.8,100,0.8),metal,0.1))
add_to_col(cube('dimension bar Z 32 mm',(-58,-52,16),(0.8,0.8,32),metal,0.1))

# lighting/camera
bpy.ops.object.light_add(type='AREA', location=(30,-60,120)); light=bpy.context.object; light.name='large softbox area light'; light.data.energy=600; light.data.size=80
bpy.ops.object.camera_add(location=(125,-145,105)); cam=bpy.context.object
track=(Vector((0,0,20))-cam.location).to_track_quat('-Z','Y'); cam.rotation_euler=track.to_euler(); cam.data.lens=45; bpy.context.scene.camera=cam

# metadata notes
bpy.context.scene['design_dimensions_mm']='outer 100x100x32; wall 3; floor 3; M5 slot 44x64; GPS slot 27x27; NPC slot 32x27'
bpy.context.scene['design_notes']='Concept model for a square electronics enclosure with independent slots for M5Stack/M5StickC Plus, GPS module, and NPC module. Includes rails, standoffs, cable channels, ports, vents, screw/lid features.'
bpy.context.scene['printing_notes']='Recommended PETG/ABS, 0.5-1.0 mm clearance per side, verify actual module dimensions before printing.'

# render settings
bpy.context.scene.render.engine='CYCLES'
bpy.context.scene.cycles.samples=64
bpy.context.scene.render.resolution_x=1600; bpy.context.scene.render.resolution_y=1200

# save
bpy.ops.wm.save_as_mainfile(filepath='/mnt/data/m5stack_gps_npc_square_box.blend')
# also export backup STL/OBJ for compatibility
bpy.ops.wm.obj_export(filepath='/mnt/data/m5stack_gps_npc_square_box.obj')
bpy.ops.wm.stl_export(filepath='/mnt/data/m5stack_gps_npc_square_box.stl')
