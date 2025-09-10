# Geometry Source of Truth - AutoCrate 3D Coordinate System

## Critical: Z-Up Coordinate System (Matches NX CAD)

This document defines the authoritative coordinate system and geometry construction rules for AutoCrate. All components MUST follow these conventions to ensure consistency with NX CAD.

## Coordinate System Definition

### World Origin [0, 0, 0]
- **Location**: Center of crate's footprint ON THE FLOOR
- **NOT** the geometric center of the crate
- The crate sits ON the floor plane (Z=0)

### Axes
- **X-axis (Red)**: Width - horizontal, left-right when viewing from front
  - Positive X = Right
  - Negative X = Left
- **Y-axis (Green)**: Depth/Length - horizontal, front-back
  - Positive Y = Front
  - Negative Y = Back  
- **Z-axis (Blue)**: Height - vertical, pointing upward
  - Positive Z = Up
  - Z=0 = Floor level

## Crate Component Positioning

### Base/Skids
- **Position**: Bottom at Z=0, extends to Z=skidHeight
- **Center**: At [0, 0, skidHeight/2]
- **Dimensions**: [skidWidth, crateLength, skidHeight]

### Floor
- **Position**: Bottom at Z=skidHeight, extends to Z=(skidHeight + floorThickness)
- **Center**: At [0, 0, skidHeight + floorThickness/2]
- **Dimensions**: [crateWidth, crateLength, floorThickness]

### Vertical Panels (Walls)

#### Front Panel (Positive Y face)
- **Position**: Center at [0, crateLength/2, crateHeight/2]
- **Dimensions**: [crateWidth, panelThickness, crateHeight]
- **Normal**: Points in +Y direction

#### Back Panel (Negative Y face)
- **Position**: Center at [0, -crateLength/2, crateHeight/2]
- **Dimensions**: [crateWidth, panelThickness, crateHeight]
- **Normal**: Points in -Y direction

#### Left Panel (Negative X face)
- **Position**: Center at [-crateWidth/2, 0, crateHeight/2]
- **Dimensions**: [panelThickness, crateLength, crateHeight]
- **Normal**: Points in -X direction

#### Right Panel (Positive X face)
- **Position**: Center at [crateWidth/2, 0, crateHeight/2]
- **Dimensions**: [panelThickness, crateLength, crateHeight]
- **Normal**: Points in +X direction

### Top Panel (Horizontal)
- **Position**: Center at [0, 0, crateHeight]
- **Dimensions**: [crateWidth, crateLength, panelThickness]
- **Normal**: Points in +Z direction

## Panel Block Generation Rules

When generating panel blocks for plywood layout:

1. **2D Layout Calculation**: Calculate optimal plywood sheet layout in 2D
2. **3D Transformation**: Transform 2D blocks to 3D based on panel face:
   - Front/Back: Rotate around X-axis, translate along Y
   - Left/Right: Rotate around Y-axis, translate along X
   - Top: No rotation, translate along Z

## Example Transformation

For a 48" x 40" x 36" crate:

```javascript
// Front Panel (48" wide x 36" tall)
// 2D blocks from calculatePanelBlocks(48, 36)
// Transform each block:
{
  position: [
    block2D.x,                    // X position stays same
    40/2,                         // Y = half crate depth (at front)
    block2D.y + 36/2             // Z = 2D Y becomes 3D Z, centered
  ],
  dimensions: [
    block2D.width,                // Width stays same
    0.75,                        // Thickness in Y direction
    block2D.height               // Height becomes Z dimension
  ]
}
```

## Validation Checks

1. All skids must have Z position starting at 0
2. Floor must be at Z = skidHeight
3. All vertical panels must have their bottom edge at Z = 0
4. Top panel must be at Z = crateHeight
5. Crate center of mass should be within the footprint for stability

## Common Errors to Avoid

1. **Wrong Origin**: Placing crate's geometric center at origin instead of floor-center
2. **Y-up Confusion**: Using Y as vertical (this is wrong - Z is always up)
3. **Panel Orientation**: Panels lying flat instead of standing vertical
4. **Dimension Mapping**: Incorrect mapping of 2D panel dimensions to 3D space

## NX CAD Expression Mapping

When generating NX expressions:
- Use Two-Point Diagonal construction
- Point 1: Origin [0, 0, 0] (floor center)
- Point 2: [Width, Length, Height]
- All components defined relative to these anchor points

## Testing Verification

To verify correct implementation:
1. Skids should appear at floor level
2. Panels should stand vertically as walls
3. Top panel should be horizontal at top of crate
4. Coordinate axes should show Z pointing up (blue arrow)
5. Measurements should align with actual crate dimensions