# Converting STEP Files for Web 3D Visualization

## Why STEP Files Can't Be Used Directly in Web Browsers

STEP files (ISO 10303) are CAD exchange formats designed for engineering applications, not web rendering:

1. **No Browser Support**: Web browsers don't have native STEP parsers
2. **Complex Format**: STEP uses text-based B-Rep (Boundary Representation) which requires complex parsing
3. **Performance**: STEP files aren't optimized for real-time rendering
4. **Library Limitations**: Three.js/React Three Fiber only supports web-friendly formats (GLTF, OBJ, FBX, etc.)

## Solution: Convert STEP to GLTF/GLB

### Option 1: Using FreeCAD (Free, Open Source)
```bash
# Install FreeCAD
# Open FreeCAD Python console:
import FreeCAD
import Mesh
import importWebGL

# Load STEP file
doc = FreeCAD.open("Klimp 4.stp")

# Export as GLTF
Mesh.export([doc.Objects[0]], "klimp.glb")
```

### Option 2: Using CAD Assistant (Free)
1. Download CAD Assistant from Open Cascade
2. Open "Klimp 4.stp"
3. File -> Export -> GLTF/GLB
4. Save as "klimp.glb" in `/public/models/`

### Option 3: Using Online Converters
- [CAD Exchanger](https://cadexchanger.com/online-converter)
- [AnyConv](https://anyconv.com/step-to-glb-converter/)
- Upload "Klimp 4.stp" and download as GLB

### Option 4: Using Blender (Free)
1. Install Blender
2. Install STEP importer addon
3. Import STEP file
4. Export as GLTF 2.0

## Implementation in AutoCrate

Once you have `klimp.glb`:

1. Place it in `/public/models/klimp.glb`
2. The KlimpModel component will automatically load it
3. Falls back to symbolic representation if not found

## Current Workaround

We use symbolic L-shaped boxes that accurately represent:
- Klimp dimensions (2" x 1.5" x 1" x 0.125")
- Proper orientation per edge
- Bronze/metallic appearance
- Instance positioning from STEP integration

This provides a functional visualization while maintaining the actual STEP file reference for CAD export.