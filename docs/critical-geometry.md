# CRITICAL WORLD COORDINATE SYSTEM - MANDATORY

## THIS IS THE ABSOLUTE REFERENCE FOR ALL 3D GEOMETRY IN AUTOCRATE

### World Coordinate System (RIGHT-HANDED, Z-UP)
```
         Z (Blue) - HEIGHT
         |
         |
         |________ Y (Green) - DEPTH (away from viewer)
        /
       /
      X (Red) - WIDTH (sideways)
```

### CRATE POSITIONING REQUIREMENTS

#### Origin Point
- **Crate center on the floor** (NOT geometric center)
- Origin is at the CENTER of the crate's footprint
- Z=0 is the floor level
- Crate extends upward from Z=0 to Z=height

#### Coordinate Mapping
- **X-axis (Red)**: Width - horizontal, left-right when viewing from front
- **Y-axis (Green)**: Depth - horizontal, front-back (away from viewer)
- **Z-axis (Blue)**: Height - vertical, pointing upward

#### Crate Geometry
```
For a crate with dimensions: Width(W) x Depth(D) x Height(H)

Corner positions (from origin at center of floor):
- Front-Left-Bottom:  [-W/2, -D/2, 0]
- Front-Right-Bottom: [+W/2, -D/2, 0]
- Back-Left-Bottom:   [-W/2, +D/2, 0]
- Back-Right-Bottom:  [+W/2, +D/2, 0]
- Front-Left-Top:     [-W/2, -D/2, H]
- Front-Right-Top:    [+W/2, -D/2, H]
- Back-Left-Top:      [-W/2, +D/2, H]
- Back-Right-Top:     [+W/2, +D/2, H]
```

### COMPONENT POSITIONING

#### Base/Floor
- Position: [0, 0, skidHeight + floorThickness/2]
- The floor sits ON TOP of the skids

#### Skids (2 or 3 depending on weight)
- Run along the Y-axis (depth direction)
- Positioned at various X positions
- Height: from Z=0 to Z=skidHeight

#### Floorboards
- Run along the X-axis (width direction)
- Arranged along the Y-axis
- Sit on top of skids at Z=skidHeight

#### Side Panels
- Left Panel: Center at [-W/2, 0, H/2]
- Right Panel: Center at [+W/2, 0, H/2]

#### Front/Back Panels
- Front Panel: Center at [0, -D/2, H/2]
- Back Panel: Center at [0, +D/2, H/2]

#### Top/Cap
- Position: [0, 0, H - capThickness/2]

### CAMERA AND VIEWING

#### Default Camera Position
- Position: Looking at the crate from front-right-above
- The front of the crate faces negative Y
- Provides clear view of three faces

#### Coordinate Axes Display
- Should originate at world origin [0, 0, 0]
- X-axis arrow points positive (right)
- Y-axis arrow points positive (away/back)
- Z-axis arrow points positive (up)

### CRITICAL RULES

1. **NEVER** place the crate's geometric center at origin
2. **ALWAYS** place the crate's floor-center at origin
3. **ALWAYS** use Z-up convention (engineering standard)
4. **NEVER** use Y-up (this is graphics/gaming convention)
5. All measurements in the code are in inches
6. Convert to appropriate scale for 3D rendering

### VALIDATION CHECKLIST

- [ ] Crate sits on the floor (Z=0)
- [ ] Crate center (X=0, Y=0) is at the center of its footprint
- [ ] Z-axis points upward
- [ ] Coordinate axes at world origin are visible
- [ ] Floorboards run perpendicular to skids
- [ ] All panels positioned relative to floor-center origin

### 3D LABEL STYLING: VISUAL READABILITY OVER GEOMETRIC ACCURACY

#### Label Rendering Philosophy
3D labels in AutoCrate prioritize **visual readability** over strict geometric accuracy. While the underlying crate geometry maintains precise engineering coordinates, label positioning and styling are optimized for user comprehension.

#### Non-Geometric Label Enhancements
- **Canvas Stroke Rendering**: Labels use canvas stroke techniques for enhanced visibility
- **Text Shadow Effects**: Multiple shadow layers improve contrast against varying backgrounds
- **Dynamic Positioning**: Labels may be offset from exact geometric positions for better visibility
- **Visual Clarity Priority**: Label placement prioritizes readability over geometric accuracy in complex views
- **Size Scaling**: Label sizes scale based on camera distance, not geometric scale
- **Billboarding**: Labels rotate to face the camera for optimal readability

#### Label vs Geometry Distinction
```
Geometric Accuracy (Crate Structure):
├── Precise coordinate positioning
├── Exact dimensional relationships
├── Engineering measurement compliance
└── Manufacturing specification adherence

Visual Readability (Labels):
├── Enhanced contrast and visibility
├── Optimized viewing angles
├── Readable typography scaling
├── Anti-aliasing and smoothing
└── User experience prioritization
```

#### Implementation Guidelines
1. **Geometric calculations** must maintain engineering precision
2. **Label positioning** may be adjusted for visibility
3. **Label styling** uses visual enhancement techniques
4. **Performance** is balanced with readability requirements

### IMPLEMENTATION NOTES

When implementing any 3D component:
1. Start with crate center at [0, 0, 0] on the floor
2. Build upward from Z=0
3. Use half-dimensions for positioning (e.g., ±W/2, ±D/2)
4. Remember: the crate's bottom face is at Z=0, not at Z=-H/2

This coordinate system ensures:
- Compatibility with engineering CAD software (NX, SolidWorks, etc.)
- Intuitive positioning (crate "sits" on the ground)
- Easy calculation of load distribution
- Proper orientation for manufacturing drawings