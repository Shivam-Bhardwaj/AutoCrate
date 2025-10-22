# AutoCrate Codebase Structure - Issue #119 Analysis

## Quick Summary

**AutoCrate** is a Next.js 14 web application that generates shipping crate designs with 3D visualization and CAD export. It uses a "Two-Point Diagonal Box" construction method to parametrically model crates.

**Application Type**: Full-stack Next.js web application (React 18 + Three.js for 3D)

---

## 1. Where Klimps, Stencils, and Decals Are Handled

### Klimps (L-shaped fasteners)

**Main Files:**
- **`/home/curious/workspace/src/lib/klimp-calculator.ts`** - Core placement algorithm
  - Calculates strategic positions for L-shaped fasteners
  - Places klimps on top edge (2+ at corners and between vertical cleats)
  - Places klimps on side edges (left/right) with 18"-24" spacing
  - Returns `KlimpLayout` with array of `Klimp` objects containing position (x,y,z) and edge info

- **`/home/curious/workspace/src/lib/klimp-step-integration.ts`** - STEP file integration
  - Manages actual Klimp 4 STEP file from `/CAD FILES/Klimp 4.stp`
  - Handles orientation transformations (rotations for different edges)
  - Generates 20 maximum klimp instances (active/suppressed)
  - **Physical geometry**: 4" longer side, 3" shorter side, 1/8" thickness, 1" width
  - Creates transformation matrices for STEP assembly references

- **`/home/curious/workspace/src/components/KlimpModel.tsx`** - 3D visualization
  - React component using `@react-three/drei` GLB model loader
  - Loads `/models/klimp.glb` if available, else renders symbolic L-shape
  - Applies rotation based on edge type (top/left/right)
  - Color: Bronze/metal (0x8b7355)

- **`/home/curious/workspace/src/lib/__tests__/klimp-step-integration.test.ts`** - Tests
  - Validates instance generation and STEP references

### Stencils & Decals (Marking system)

**Main Files:**
- **`/home/curious/workspace/src/components/MarkingsSection.tsx`** - UI configuration
  - Toggles for: FRAGILE stencil, handling symbols, AUTOCRATE text

- **`/home/curious/workspace/src/components/MarkingVisualizer.tsx`** - Visual rendering
  - Renders stencil positions on 3D panels
  - Shows measurement lines and labels
  - FRAGILE stencils: 8"×8", red color, 4 per crate
  - Handling symbols and "AUTOCRATE" text

- **`/home/curious/workspace/src/lib/nx-generator.ts`** (lines 26-31)
  - `MarkingConfig` interface:
    - `fragileStencil: boolean` - Red FRAGILE markings (4 per crate)
    - `handlingSymbols: boolean` - Glass/umbrella/up arrows (up to 4)
    - `autocrateText: boolean` - "AUTOCRATE" text on panels

- **`/home/curious/workspace/src/lib/step-generator.ts`** - STEP export
  - Includes STENCIL assembly in hierarchy:
    - Uses `ANNOTATION_TEXT` and `ANNOTATION_SYMBOL` for stencils
    - References `fragile.png` as marking decal

---

## 2. Existing 3D Model Handling & Orientation Logic

### Coordinate System
- **Origin**: Center of crate floor (0, 0, 0)
- **X-axis**: Width (left/right)
- **Y-axis**: Length (front/back)  
- **Z-axis**: Height (vertical)
- **Symmetry**: Crate is symmetric about Z-Y plane

### 3D Visualization Pipeline
**`/home/curious/workspace/src/components/CrateVisualizer.tsx`** (main file)
- Uses React Three Fiber (R3F) + Three.js for rendering
- Component visibility toggles: skids, floorboards, front/back/left/right panels, cleats, etc.
- Real-time position/rotation updates (lines 80-96)
- Mesh generation with material colors
- OrbitControls for camera manipulation

**Orientation Handling Pattern** (from code):
```typescript
// Position with scaling
position={[centerX * scale, centerZ * scale, -centerY * scale]}
// Rotation for different faces (Euler angles)
rotation={[Math.PI / 2, 0, 0]}  // Rotate around X-axis
```

### NXBox Structure
**`/home/curious/workspace/src/lib/nx-generator.ts`** (lines 75-85)
```typescript
interface NXBox {
  name: string
  point1: Point3D     // Lower corner
  point2: Point3D     // Upper corner  
  color?: string
  type?: 'skid' | 'floor' | 'panel' | 'cleat' | 'plywood' | 'klimp' | 'hardware'
  suppressed?: boolean
  metadata?: string   // Additional info (e.g., "left edge")
  plywoodPieceIndex?: number
  panelName?: string
}
```

---

## 3. Main Application Structure

### Architecture Pattern: Next.js 14 Full-Stack

**Frontend (Client-side)**:
- React 18 with hooks
- React Three Fiber for 3D visualization
- Tailwind CSS for styling
- Component-based UI in `/src/components`

**Backend (Server-side)**:
- Next.js API routes in `/src/app/api/`
- Serverless functions for calculations
- Rate limiting on computationally expensive operations

**Main Page**: `/home/curious/workspace/src/app/page.tsx`
- 1500+ lines managing state for dimensions, materials, visibility, markings
- Real-time 3D preview with configuration controls
- Export functionality for STEP files and NX expressions

**API Routes**:
- `/api/calculate-crate` - Main crate generation
- `/api/nx-export` - NX expression file download  
- `/api/cleat-placement` - Cleat positioning
- `/api/plywood-optimization` - Sheet cutting optimization
- `/api/test-dashboard` - Testing metrics

---

## 4. Existing File Upload Functionality

### Current State: NO STEP FILE UPLOAD EXISTS YET

**Export-only functionality exists:**
- **STEP Export**: `/api/nx-export` route generates downloadable files
- **File Download**: Files are generated on-demand and sent to browser
- No file upload mechanism for STEP files
- No STEP file parsing/import logic

**Related Files**:
- `/home/curious/workspace/src/lib/step-generator.ts` - Generates STEP files
- `/home/curious/workspace/src/app/api/nx-export/route.ts` - Export API

**What would be needed for Issue #119**:
1. New API endpoint `/api/upload-step` to handle STEP file uploads
2. STEP file parser (possibly `three.js` STEPLoader or similar)
3. UI component for file selection/drag-drop
4. Logic to extract geometry and orientation from uploaded STEP
5. Klimp/stencil/decal extraction from STEP assembly metadata

---

## 5. How Models Are Currently Displayed/Positioned

### Model Generation Flow

1. **Dimension Input** → User sets product dimensions, weight, clearances
2. **NX Generator** (`nx-generator.ts`) → Calculates all box geometry
   - Generates array of `NXBox` objects
   - Each box has point1 (lower corner) and point2 (upper corner)
3. **CrateVisualizer** → Renders boxes as 3D meshes
4. **Positioning Logic**:
   ```typescript
   // Position calculation
   centerX = (box.point1.x + box.point2.x) / 2
   centerY = (box.point1.y + box.point2.y) / 2
   centerZ = (box.point1.z + box.point2.z) / 2
   
   // Render with scale and coordinate transform
   position={[centerX * scale, centerZ * scale, -centerY * scale]}
   ```

### Component Display Strategy

**Visibility Toggles** (in main page state):
```typescript
visibility: {
  skids: true,
  floorboards: true,
  frontPanel: true,
  backPanel: true,
  leftPanel: true,
  rightPanel: true,
  topPanel: true,
  cleats: true
}
```

**PMI Visualization** (Product Manufacturing Information):
- Datum planes (ASME Y14.5 standard)
- Dimension labels and measurement lines
- Assembly hierarchy visualization

### Hardware Visualization

**Klimps** (KlimpModel.tsx):
- Loads GLB model or renders symbolic L-shape
- Automatic rotation based on edge assignment
- Positioned at calculated klimp coordinates

**Lag Screws** (referenced in lag-step-integration.ts):
- STEP file reference: `/CAD FILES/LAG SCREW_0.38 X 3.00.stp`
- Applied to panel-frame connections
- Positioned across multiple panels

---

## Key Files Summary for Issue #119

### Must Read (in order):

1. **`/home/curious/workspace/src/lib/klimp-calculator.ts`** (242 lines)
   - How klimps are currently positioned
   - Edge-based placement logic
   - Position calculation algorithm

2. **`/home/curious/workspace/src/lib/klimp-step-integration.ts`** (219 lines)
   - How klimps are exported to STEP
   - Orientation/rotation handling
   - STEP file path and geometry metadata

3. **`/home/curious/workspace/src/components/MarkingVisualizer.tsx`** (up to 200 lines)
   - How stencils/decals are rendered
   - Position calculation for markings
   - Visual properties

4. **`/home/curious/workspace/src/lib/step-generator.ts`** (partial, 100+ lines)
   - STEP file format and assembly structure
   - How components are referenced
   - Assembly hierarchy

5. **`/home/curious/workspace/src/components/CrateVisualizer.tsx`** (400+ lines)
   - 3D rendering with orientation
   - Coordinate system transformation
   - Component positioning logic

### Support Files:

- `/home/curious/workspace/src/lib/nx-generator.ts` - Core model generation
- `/home/curious/workspace/src/app/page.tsx` - Main UI state
- `/home/curious/workspace/src/lib/crate-constants.ts` - Configuration values
- `/home/curious/workspace/docs/START_HERE.md` - Architecture overview

---

## Issue #119 Context: STEP File Upload for Klimps/Stencils/Decals

Based on the codebase structure, Issue #119 likely requires:

1. **STEP File Upload Endpoint**
   - Accept `.stp` or `.step` file upload
   - Parse STEP file format to extract assemblies
   - Identify klimp instances, stencil positions, decal orientations

2. **Orientation Handling for Uploaded Models**
   - Extract transformation matrices from STEP
   - Convert STEP coordinates to internal coordinate system
   - Apply rotations correctly for edge-based components

3. **Integration with Existing Systems**
   - Map uploaded klimps to internal `KlimpLayout` format
   - Extract stencil positions and sizes
   - Import decal metadata (colors, text, placement)

4. **3D Visualization Update**
   - Display uploaded models alongside generated components
   - Show orientation indicators
   - Validate placement against existing structures

The infrastructure is mostly in place—you need to add the **upload/import** direction to the existing export functionality.

