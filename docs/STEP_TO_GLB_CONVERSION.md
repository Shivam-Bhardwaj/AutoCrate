# STEP to GLB Conversion Guide

## Overview

To display actual 3D models in the web application, STEP files need to be converted to GLB (GL Transmission Format Binary) which is optimized for web rendering with Three.js.

## Method 1: Using Siemens NX (Recommended)

If you have access to NX (where the STEP files were created):

1. Open the STEP file in NX
2. File → Export → 3D Model
3. Select **glTF 2.0** format
4. Choose **Binary (.glb)** option
5. Export settings:
   - Include materials: Yes
   - Include normals: Yes
   - Y-up orientation: Yes
6. Save to `workspace/public/models/`

## Method 2: Using Blender (Free)

### Installation

```bash
# Ubuntu/Debian
sudo apt-get install blender

# macOS
brew install --cask blender

# Windows
# Download from https://www.blender.org/download/
```

### Conversion Process

1. Install CAD Exchanger or FreeCAD add-on for STEP import:
   ```bash
   # Install FreeCAD for intermediate conversion
   sudo apt-get install freecad
   ```

2. Convert STEP → OBJ using FreeCAD:
   ```python
   # freecad_convert.py
   import FreeCAD
   import Mesh

   doc = FreeCAD.open("/path/to/file.stp")
   Mesh.export(doc.Objects, "/path/to/file.obj")
   ```

3. Import OBJ into Blender and export as GLB:
   ```bash
   blender --background --python batch_convert.py
   ```

## Method 3: Using Online Converters

Several online tools can convert STEP to GLB:

1. **CAD Exchanger Cloud**: https://cadexchanger.com/
2. **AnyConv**: https://anyconv.com/step-to-glb-converter/
3. **Aspose**: https://products.aspose.app/3d/conversion/step-to-glb

**Steps:**
1. Upload STEP file
2. Select GLB as output format
3. Download converted file
4. Place in `workspace/public/models/`

## Method 4: Automated Script (Requires FreeCAD)

```python
#!/usr/bin/env python3
"""
Batch convert STEP files to GLB using FreeCAD + Blender pipeline
"""

import FreeCAD
import Mesh
import Import
import os
from pathlib import Path

STEP_DIR = Path("/home/curious/step file")
TEMP_DIR = Path("/tmp/step_conversion")
OUTPUT_DIR = Path("/home/curious/workspace/public/models")

TEMP_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def convert_step_to_obj(step_file):
    """Convert STEP to OBJ using FreeCAD"""
    print(f"Converting {step_file.name} to OBJ...")

    # Import STEP
    doc = FreeCAD.newDocument("temp")
    Import.insert(str(step_file), "temp")

    # Export to OBJ
    obj_file = TEMP_DIR / (step_file.stem + ".obj")
    Mesh.export(doc.Objects, str(obj_file))

    FreeCAD.closeDocument("temp")
    return obj_file

def convert_obj_to_glb(obj_file, glb_file):
    """Convert OBJ to GLB using Blender"""
    blender_script = f"""
import bpy
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.obj(filepath='{obj_file}')
bpy.ops.export_scene.gltf(filepath='{glb_file}', export_format='GLB')
"""

    script_file = TEMP_DIR / "convert.py"
    script_file.write_text(blender_script)

    os.system(f"blender --background --python {script_file}")

# Process all STEP files
for step_file in STEP_DIR.glob("*.stp"):
    obj_file = convert_step_to_obj(step_file)

    glb_name = step_file.stem.lower().replace(" ", "-").replace("_", "-") + ".glb"
    glb_file = OUTPUT_DIR / glb_name

    convert_obj_to_glb(obj_file, glb_file)
    print(f"✓ Created {glb_file.name}")
```

## Required Output Files

Place GLB files in `workspace/public/models/` with these names:

### Hardware
- `klimp-4.glb` - Klimp fastener
- `lag-screw-0-38-x-2-50.glb` - 2.5" lag screw
- `lag-screw-0-38-x-3-00.glb` - 3.0" lag screw
- `flat-washer-0-38-inch.glb` - Flat washer

### Stencils
- `stencil-fragile.glb` - Fragile stencil
- `stencil-vertical-handling.glb` - Vertical handling symbol
- `stencil-horizontal-handling.glb` - Horizontal handling symbol
- `stencil-cg.glb` - Center of gravity marker
- `stencil-do-not-stack.glb` - Do not stack warning
- `stencil-applied-impact-a.glb` - Applied Impact-A marking

## File Naming Convention

STEP file → GLB file mapping:
```
KLIMP_#4.stp → klimp-4.glb
LAG SCREW_0.38 X 2.50.stp → lag-screw-0-38-x-2-50.glb
STENCIL - FRAGILE.stp → stencil-fragile.glb
```

**Rules:**
- Lowercase
- Spaces → hyphens
- Underscores → hyphens
- Remove special characters (#, ., etc.)
- Keep descriptive numbers

## Verification

After conversion, verify GLB files:

```javascript
// Test in browser console
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();
loader.load('/models/klimp-4.glb', (gltf) => {
  console.log('Klimp loaded:', gltf.scene);
  console.log('Bounding box:', new THREE.Box3().setFromObject(gltf.scene));
});
```

## Optimization

For web performance, optimize GLB files:

```bash
# Install gltf-pipeline
npm install -g gltf-pipeline

# Optimize GLB
gltf-pipeline -i input.glb -o output.glb --draco.compressionLevel=10
```

## Quick Start (Manual Method)

1. Open each STEP file in your preferred CAD software
2. Export as **GLB** or **glTF Binary**
3. Save to `workspace/public/models/` with lowercase-hyphenated names
4. Refresh the web application
5. Components will automatically load GLB files if available

## Troubleshooting

**Model appears blank/invisible:**
- Check if materials were exported
- Verify normals are included
- Try different export settings (Y-up vs Z-up)

**Model is too large/small:**
- Check units in export (should be inches or millimeters)
- Adjust scale in component if needed

**Model is rotated incorrectly:**
- Verify coordinate system in export (Y-up recommended)
- Adjust orientation in NX before export
- Use rotation props in React component

## Next Steps

Once GLB files are in `/public/models/`:

1. Components will automatically detect and load them
2. Fallback to bounding boxes if GLB files not found
3. Orientation and positioning will use the same logic
4. Performance will be better with optimized GLB files
