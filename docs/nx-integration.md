# NX CAD Integration Guide

AutoCrate generates parametric expressions compatible with Siemens NX 2022+ for professional CAD workflows.

## Overview

The NX integration enables:
- Parametric crate modeling in NX
- JT file export/import
- ASME Y14.5-2009 compliant drawings
- Applied Materials standards compliance
- Bill of Materials generation

## Coordinate System

AutoCrate uses NX-compatible coordinate system:

**Z-Up Orientation (Critical)**
- **X-axis (Red)**: Crate width direction
- **Y-axis (Green)**: Crate depth direction  
- **Z-axis (Blue)**: Crate height direction (vertical)

**Origin Positioning**
- Origin [0,0,0] at center of crate footprint
- Base sits ON the floor (Z=0 is floor level)
- Crate extends upward in +Z direction

## Expression Generation Workflow

### 1. Configure Crate in AutoCrate
- Set dimensions, materials, and specifications
- Verify 3D visualization shows correct geometry
- Enable required features (ventilation, vinyl, etc.)

### 2. Generate NX Expression
```
Click "Generate NX Expression" button
Review parameter definitions
Validate coordinate system references
Check Applied Materials compliance
```

### 3. Expression Structure
```
$ AutoCrate NX Expression v3.0
$ Part Number: 0205-12345
$ TC Number: TC2-1234567

$ Main Dimensions
p0 = 48    $ Crate Length (inches)
p1 = 32    $ Crate Width (inches)
p2 = 24    $ Crate Height (inches)

$ Base Configuration  
p10 = 3    $ Skid Count
p11 = 4    $ Skid Width (inches)
p12 = 5    $ Skid Height (inches)
p13 = 0.75 $ Floorboard Thickness (inches)

$ Panel Configuration
p20 = 0.75 $ Top Panel Thickness
p21 = 0.5  $ Front Panel Thickness
p22 = 0.5  $ Back Panel Thickness
p23 = 0.5  $ Left Panel Thickness  
p24 = 0.5  $ Right Panel Thickness

$ Features
BLOCK/CREATE_BASE
BLOCK/CREATE_FRONT_PANEL
BLOCK/CREATE_BACK_PANEL
BLOCK/CREATE_LEFT_PANEL
BLOCK/CREATE_RIGHT_PANEL
BLOCK/CREATE_TOP_PANEL
```

## NX Implementation Steps

### 1. Open NX 2022
- Launch NX application
- Create new part file
- Set units to inches
- Configure coordinate system (Z-up)

### 2. Create Expressions
```
File → Utilities → Expression
Import AutoCrate expression text
Verify parameter values
Check for conflicts with existing parameters
```

### 3. Build Base Geometry
```
Insert → Design Feature → Block
Use two-point diagonal method:
  Point 1: (-p1/2, -p0/2, 0)
  Point 2: (p1/2, p0/2, p12)
Apply material: Oak or Pine lumber
```

### 4. Create Panels
```
For each panel:
  Insert → Design Feature → Block
  Reference base geometry for positioning
  Apply thickness parameter
  Set material: APA Plywood
```

### 5. Add Features
```
Ventilation holes:
  Insert → Design Feature → Hole
  Pattern as required
  
Fastener locations:
  Insert → Design Feature → Point Set
  Pattern per specification
  
Vinyl wrap:
  Insert → Surface → Thicken
  Apply to outer surfaces
```

### 6. Assembly Constraints
```
Insert → Assembly Constraints → Mate
Apply standard woodworking joints:
  - Butt joints for panels to base
  - Overlap joints for corners
  - Fastener hole alignment
```

## JT File Export

### Export Process
```
File → Export → JT
Version: 10.5 or later
Options:
  - Include PMI data
  - Include materials
  - Compress geometry
  - Validate on export
```

### Import to AutoCrate
- Use JT import functionality
- Verify geometry integrity
- Check material assignments
- Validate coordinate system

## Drawing Generation

AutoCrate generates ASME Y14.5-2009 compliant drawings:

### Sheet Formats
- **Size A**: 11" x 8.5" (simple crates)
- **Size B**: 17" x 11" (standard crates)  
- **Size C**: 22" x 17" (complex assemblies)
- **Size D**: 34" x 22" (large industrial crates)

### Standard Views
- **Front View**: Shows length and height
- **Top View**: Shows length and width
- **Right Side View**: Shows width and height
- **Section Views**: Internal structure details
- **Detail Views**: Fastener and joint details

### Dimensions
- Overall crate dimensions
- Panel thicknesses
- Skid spacing and sizes
- Hole locations and sizes
- Material callouts

### Title Block Information
```
Part Number: 0205-XXXXX
TC Number: TC2-XXXXXXX  
Material: Per specification
Scale: As noted
Drawn By: [Engineer name]
Checked By: [Checker name]
Approved By: [Approver name]
Date: MM/DD/YYYY
Revision: A
```

## Performance Guidelines

### Expression Limits
- Parameters: 500 maximum
- Features: 100 maximum
- Assembly components: 50 maximum

### File Size Targets
- NX part files: <50MB
- JT exports: <10MB
- Drawing files: <5MB

### Generation Time
- Expression creation: <3 seconds
- Drawing generation: <2 seconds per sheet
- JT export: <3 seconds

## Validation Checklist

Before using NX expressions:

**Geometry Validation**
- [ ] Coordinate system is Z-up
- [ ] Origin at floor center
- [ ] No negative Z coordinates for base
- [ ] Panel dimensions match specifications

**Standards Compliance**
- [ ] Part number format: 0205-XXXXX
- [ ] TC number format: TC2-XXXXXXX
- [ ] ASME Y14.5-2009 dimensioning
- [ ] Applied Materials material specs

**Feature Validation**
- [ ] Skid count and spacing correct
- [ ] Panel thicknesses per specification
- [ ] Ventilation holes properly located
- [ ] Fastener patterns complete

**Performance Check**
- [ ] Expression loads without errors
- [ ] Features regenerate successfully
- [ ] Assembly constraints function
- [ ] Drawing views update automatically

## Troubleshooting

### Common Issues

**Expression Errors**
- Verify parameter syntax
- Check for conflicting names
- Validate numeric values
- Ensure proper units

**Geometry Failures**
- Check coordinate references
- Verify dimension relationships
- Validate feature dependencies
- Review constraint logic

**Performance Issues**
- Simplify complex features
- Optimize parameter relationships
- Check for circular references
- Monitor memory usage

### Support Resources

- NX Online Help
- Applied Materials CAD Standards
- AutoCrate Documentation
- Technical Support Portal

---

**Compatible NX Versions**: NX 2022, NX 2023, NX 2024+  
**JT Format**: Version 10.5 and later  
**Last Updated**: January 2025