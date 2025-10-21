# STEP File Integration - Issue #119

This document describes the STEP file integration feature that enables intelligent orientation detection and visualization of klimps, stencils, and other hardware using actual CAD model dimensions.

## Overview

The STEP file integration system replaces mock 3D models with accurate bounding boxes based on parsed STEP files. This ensures that:
1. **Correct dimensions** - All components use actual CAD dimensions from NX STEP exports
2. **Intelligent orientation** - Components are oriented correctly based on their geometry and placement context
3. **Visualization** - Dark bounding boxes provide clear visualization before full 3D models are implemented

## Components

### 1. STEP File Parser (`src/lib/step-parser.ts`)

Parses ISO-10303-21 STEP files to extract:
- **Bounding box dimensions** (min/max coordinates)
- **Product name** and metadata
- **Component type** detection (klimp, stencil, fastener)
- **Orientation analysis** (primary axis, flat vs 3D)

**Key Functions:**
```typescript
StepParser.parseBoundingBox(stepContent: string): StepBoundingBox
StepParser.parseStepFile(stepContent: string, fileName: string): StepFileInfo
StepParser.isFlatStencil(info: StepFileInfo): boolean
StepParser.isLShaped(info: StepFileInfo): boolean
```

### 2. STEP File Catalog (`src/lib/step-file-catalog.json`)

Auto-generated catalog containing parsed dimensions for all STEP files:
- **KLIMP_#4.stp**: 4.92" × 3.92" × 1.15"
- **STENCIL - FRAGILE.stp**: 12.59" × 5.48" × 0"
- **STENCIL - VERTICAL HANDLING.stp**: 13.97" × 2.99" × 0"
- **STENCIL - HORIZONTAL HANDLING.stp**: 10.97" × 3.99" × 0"
- **STENCIL - CG.stp**: 3.00" × 2.63" × 0"
- **STENCIL - DO NOT STACK.stp**: 6.50" × 3.00" × 0"
- **STENCIL - APPLIED IMPACT-A.stp**: 3.35" × 2.56" × 0"

To regenerate the catalog after adding new STEP files:
```bash
npx tsx scripts/parse-step-files.ts
```

### 3. Orientation Detector (`src/lib/orientation-detector.ts`)

Intelligently calculates rotation and positioning based on:
- **Placement context** (edge: top, left, right, front, back)
- **Component geometry** (flat stencils vs 3D klimps)
- **Surface normals** (which way the component should face)

**Key Functions:**
```typescript
OrientationDetector.getKlimpOrientation(context: PlacementContext): OrientationInfo
OrientationDetector.getStencilOrientation(fileName: string, context: PlacementContext): OrientationInfo
OrientationDetector.getDimensions(stepFileName: string)
OrientationDetector.getAvailableStencils()
```

### 4. Bounding Box Components (`src/components/StepBoundingBox.tsx`)

React Three Fiber components for rendering bounding boxes:
- `<StepBoundingBox />` - Generic component for any STEP file
- `<KlimpBoundingBox />` - Specialized for klimps
- `<StencilBoundingBox />` - Specialized for stencils

**Usage:**
```tsx
// Render a klimp bounding box
<KlimpBoundingBox
  position={[x, y, z]}
  rotation={[rx, ry, rz]}
  scale={0.1}
  visible={true}
/>

// Render a stencil bounding box
<StencilBoundingBox
  stencilType="fragile"
  position={[x, y, z]}
  rotation={[rx, ry, rz]}
  scale={0.1}
/>
```

## Updated Components

### KlimpModel (`src/components/KlimpModel.tsx`)

**New prop:** `useBoundingBox?: boolean` (default: `true`)

When `useBoundingBox={true}`:
- Renders dark gray bounding box using actual STEP dimensions
- Uses `OrientationDetector` for correct rotation based on edge placement
- Falls back to bounding box if GLB model fails to load

When `useBoundingBox={false}`:
- Attempts to load `/models/klimp.glb`
- Falls back to bounding box on error

### MarkingVisualizer (`src/components/MarkingVisualizer.tsx`)

**New prop:** `useBoundingBox?: boolean` (default: `true`)

When `useBoundingBox={true}`:
- Renders dark bounding boxes for stencils using actual STEP dimensions
- Automatically selects correct stencil type (FRAGILE, HANDLING, etc.)
- Applies correct orientation based on panel placement

When `useBoundingBox={false}`:
- Renders traditional white planes with text

## Workflow

### Adding New STEP Files

1. **Place STEP files** in `/step file/` directory
2. **Run parser** to update catalog:
   ```bash
   cd workspace
   npx tsx scripts/parse-step-files.ts
   ```
3. **Verify catalog** at `src/lib/step-file-catalog.json`
4. **Update components** to use new STEP files if needed

### Replacing Bounding Boxes with Full Models

To transition from bounding boxes to full 3D models:

1. **Convert STEP to GLB**:
   - Use Blender or CAD software to convert `.stp` → `.glb`
   - Place GLB files in `public/models/`

2. **Update component props**:
   ```tsx
   // Switch from bounding box to GLB model
   <KlimpModel box={box} useBoundingBox={false} />
   <MarkingVisualizer boxes={boxes} generator={generator} useBoundingBox={false} />
   ```

3. **Gradual transition**:
   - Keep `useBoundingBox={true}` during development
   - Switch to `false` when full models are ready
   - Both modes use the same dimensions and orientation logic

## Orientation Logic

### Klimps (L-shaped brackets)

Klimps have asymmetric geometry and must be oriented correctly:

| Edge Placement | Rotation | Description |
|----------------|----------|-------------|
| Top | (0, 0, 0) | Longer leg vertical, shorter leg horizontal |
| Left | (0, π/2, π/2) | Rotated 90° around Z, then Y |
| Right | (0, -π/2, -π/2) | Rotated -90° around Z, then Y |

**Dimensions (from STEP file):**
- Longer leg: 4.92" (vertical when mounted)
- Shorter leg: 3.92" (horizontal reach)
- Thickness: 1.15"

### Stencils (Flat decals)

Stencils are flat (depth ≈ 0) and face outward from panels:

| Panel | Rotation | Surface Normal |
|-------|----------|----------------|
| Front | (0, 0, 0) | -Y direction |
| Back | (0, π, 0) | +Y direction |
| Left | (0, -π/2, 0) | -X direction |
| Right | (0, π/2, 0) | +X direction |
| Top | (π/2, 0, 0) | +Z direction |

**Available Stencils:**
- FRAGILE: 12.59" × 5.48"
- VERTICAL HANDLING: 13.97" × 2.99"
- HORIZONTAL HANDLING: 10.97" × 3.99"
- CG: 3.00" × 2.63"
- DO NOT STACK: 6.50" × 3.00"
- APPLIED IMPACT-A: 3.35" × 2.56"

## Coordinate System

**NX Coordinates (STEP files):**
- X-axis: Width
- Y-axis: Length (depth)
- Z-axis: Height
- Origin: Center of crate floor (0, 0, 0)

**Three.js Coordinates (visualization):**
- X-axis: Width (same as NX)
- Y-axis: Height (NX Z-axis)
- Z-axis: Depth (NX -Y-axis, inverted)

**Conversion formula:**
```typescript
threeJsPos = [nxX * scale, nxZ * scale, -nxY * scale]
```

## Color Scheme

Dark bounding boxes for visualization:
- **Klimps**: `#2a2a2a` (very dark gray)
- **Stencils**: `#1a1a1a` (nearly black)
- **Fasteners**: `#404040` (medium dark gray)

Material properties:
- Metalness: 0.3
- Roughness: 0.7
- Opacity: 0.9 (slight transparency)

## Testing

To verify the integration:

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Check visualization**:
   - Klimps should appear as dark gray boxes at correct positions
   - Stencils should appear as thin dark boxes on panel surfaces
   - All components should use actual STEP dimensions

4. **Verify orientation**:
   - Top klimps should be vertical
   - Side klimps should be rotated 90°
   - Stencils should face outward from panels

## Future Enhancements

1. **Full 3D Models**: Replace bounding boxes with detailed GLB models
2. **More Stencils**: Add remaining stencil types from catalog
3. **Hardware**: Add lag screws and washers visualization
4. **Interactive Placement**: Allow manual adjustment of orientation
5. **STEP Export**: Generate complete STEP assembly with all components

## Troubleshooting

**Problem**: Bounding boxes not appearing
- **Solution**: Check that `step-file-catalog.json` exists and contains entries
- Run `npx tsx scripts/parse-step-files.ts` to regenerate

**Problem**: Wrong orientation
- **Solution**: Verify edge type in component metadata
- Check `OrientationDetector` logic for specific edge cases

**Problem**: Build errors
- **Solution**: Ensure all imports are correct
- Check that TypeScript types match between components

**Problem**: STEP files not parsing
- **Solution**: Verify STEP files are valid ISO-10303-21 format
- Check for CARTESIAN_POINT entities in the file
- Ensure files are from NX (not other CAD systems)

## References

- **Issue**: [#119 - STEP file upload](https://github.com/Shivam-Bhardwaj/AutoCrate/issues/119)
- **STEP Format**: ISO 10303-21 (STEP-File)
- **NX Documentation**: Siemens NX STEP Export
- **Three.js**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber/
