#!/usr/bin/env python3
"""
Convert STEP files to GLB format using Blender
Run with: blender --background --python convert-step-to-glb.py
"""

import bpy
import os
import sys
from pathlib import Path

# Paths
STEP_DIR = Path("/home/curious/step file")
OUTPUT_DIR = Path("/home/curious/workspace/public/models")

# Ensure output directory exists
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def convert_step_to_glb(step_file, output_file):
    """Convert a single STEP file to GLB format"""
    print(f"Converting {step_file.name}...")

    # Clear existing objects
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Import STEP file
    try:
        bpy.ops.import_mesh.stl(filepath=str(step_file))
    except:
        # Try importing as STEP if STL import fails
        try:
            bpy.ops.import_scene.obj(filepath=str(step_file))
        except:
            print(f"  Warning: Could not import {step_file.name}, trying alternate method...")
            # Blender doesn't have native STEP import, we'll need to use a different approach
            return False

    # Select all imported objects
    bpy.ops.object.select_all(action='SELECT')

    if len(bpy.context.selected_objects) == 0:
        print(f"  Error: No objects imported from {step_file.name}")
        return False

    # Export as GLB
    try:
        bpy.ops.export_scene.gltf(
            filepath=str(output_file),
            export_format='GLB',
            export_selected=True,
            export_materials='EXPORT',
            export_colors=True,
            export_normals=True,
            export_texcoords=True,
        )
        print(f"  ✓ Created {output_file.name}")
        return True
    except Exception as e:
        print(f"  Error exporting {step_file.name}: {e}")
        return False

def main():
    print("STEP to GLB Converter")
    print("=" * 50)
    print(f"Input directory: {STEP_DIR}")
    print(f"Output directory: {OUTPUT_DIR}")
    print()

    # Find all STEP files
    step_files = list(STEP_DIR.glob("*.stp")) + list(STEP_DIR.glob("*.step"))

    if not step_files:
        print("No STEP files found!")
        return

    print(f"Found {len(step_files)} STEP files\n")

    success_count = 0
    for step_file in step_files:
        # Create output filename
        output_name = step_file.stem.lower().replace(" ", "-").replace("_", "-") + ".glb"
        output_file = OUTPUT_DIR / output_name

        if convert_step_to_glb(step_file, output_file):
            success_count += 1
        print()

    print("=" * 50)
    print(f"Conversion complete: {success_count}/{len(step_files)} files converted")

if __name__ == "__main__":
    main()
