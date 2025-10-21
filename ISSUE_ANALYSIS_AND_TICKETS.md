# AutoCrate Issue Analysis & LLM-Optimized Tickets

**Generated**: 2025-10-16
**Branch**: refactor/llm-optimization
**Total Issues**: 16
**Issue Groups**: 9

---

## Issue Grouping & Priority Analysis

### GROUP A: PMI & Visualization (2 issues)
**Priority**: HIGH | **Complexity**: MEDIUM | **Dependencies**: None

- **Issue #1**: Datum frames percentage-based positioning
- **Issue #8**: PMI font auto-scaling with view

**Correlation**: Both affect `src/components/CrateVisualizer.tsx` PMI rendering system

---

### GROUP B: Bill of Materials & Weight (2 issues)
**Priority**: HIGH | **Complexity**: MEDIUM | **Dependencies**: None

- **Issue #2**: Add weight calculation system
- **Issue #10**: Restructure BOM (merge with cut list)

**Correlation**: Both affect `src/lib/nx-generator.ts` BOM generation

---

### GROUP C: Lumber Optimization (1 issue)
**Priority**: HIGH | **Complexity**: HIGH | **Dependencies**: None

- **Issue #3**: Handle unavailable lumber sizes, optimize floorboard arrangement

**Correlation**: Requires new algorithm in `src/lib/nx-generator.ts`

---

### GROUP D: Markings & Labels (1 issue)
**Priority**: MEDIUM | **Complexity**: HIGH | **Dependencies**: STEP export

- **Issue #11**: Fix marking placement algorithm, add STEP file support

**Correlation**: Affects `src/lib/step-generator.ts` and marking placement logic

---

### GROUP E: Documentation (2 issues)
**Priority**: MEDIUM | **Complexity**: LOW | **Dependencies**: None

- **Issue #13**: Fix documentation scrolling
- **Issue #14**: Update stale documentation

**Correlation**: Both affect docs UI and content

---

### GROUP F: GitHub/DevOps (3 issues)
**Priority**: LOW | **Complexity**: LOW | **Dependencies**: None

- **Issue #4**: Branch metadata correctness
- **Issue #15**: Improve PR verification checklist
- **Issue #16**: Add issue creator/solver metadata

**Correlation**: All affect GitHub templates and workflows

---

### GROUP G: UI/UX (1 issue)
**Priority**: LOW | **Complexity**: LOW | **Dependencies**: None

- **Issue #9**: Hide base/crate from display window

**Correlation**: UI cleanup in `src/app/page.tsx`

---

### GROUP H: New Features (2 issues)
**Priority**: LOW | **Complexity**: VERY HIGH | **Dependencies**: Multiple

- **Issue #7**: Test case management UI
- **Issue #12**: Reverse engineering (STEP → crate dimensions)

**Correlation**: Both require new major features

---

### GROUP I: Infrastructure (1 issue)
**Priority**: MEDIUM | **Complexity**: VERY HIGH | **Dependencies**: External systems

- **Issue #6**: Automated ticket submission portal

**Correlation**: Requires web portal + LLM integration

---

## LLM Optimization Template

### New Template: `.github/ISSUE_TEMPLATE/llm_optimized_task.md`

```markdown
---
name: LLM-Optimized Task
about: Task designed for lightweight LLM execution
title: "[LLM] "
labels: llm-task
assignees: ""
---

## 🎯 Task Summary
<!-- Single sentence describing the goal -->

## 📦 Context (Token Budget: ~500)
<!-- Minimal background information -->

**Relevant Files**:
- Primary: `path/to/main/file.ts:line_range`
- Secondary: `path/to/related/file.ts:line_range`

**Key Constants/Types**:
```typescript
// Copy relevant type definitions or constants here
```

**Current Behavior**:
<!-- What happens now -->

**Expected Behavior**:
<!-- What should happen -->

## 🔧 Implementation Guide

### Step 1: [Action]
**File**: `path/to/file.ts`
**Lines**: `X-Y`
**Change**: [Specific modification]

### Step 2: [Action]
**File**: `path/to/file.ts`
**Lines**: `X-Y`
**Change**: [Specific modification]

### Step 3: [Testing]
**Command**: `npm test -- path/to/test.test.ts`
**Expected**: [Test outcome]

## ✅ Acceptance Criteria
- [ ] Specific testable condition 1
- [ ] Specific testable condition 2
- [ ] Tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`

## 🧠 LLM Constraints
- **Token Budget**: ~2000 tokens max
- **Memory**: Lightweight LLM (assume 4K context)
- **Self-Sufficiency**: All info included, no external lookups
- **File Count**: Modify ≤3 files

## 🔗 Related Issues
<!-- Link to parent/related issues -->

## 📝 Notes
<!-- Additional tips or gotchas -->
```

---

# Individual Tickets

## TICKET 1: Fix Datum Frame Positioning Logic

**Group**: A - PMI & Visualization
**Priority**: HIGH
**Estimated Tokens**: ~1800
**Files**: 1

### LLM-Optimized Prompt

```markdown
---
name: Fix Datum Frame Positioning
title: "[LLM] Datum frames should be percentage-based around model with practical reference points"
labels: llm-task, 3d, enhancement
---

## 🎯 Task Summary
Change datum frame positioning from fixed dimensions to percentage-based offsets that reference practical construction points (bottom face, edges, center).

## 📦 Context

**File**: `src/components/CrateVisualizer.tsx:134-209`

**Current System** (ASME Y14.5):
- Datum A (Red, XY): Bottom plane at Z=0
- Datum B (Green, XZ): Front plane at Y=0
- Datum C (Blue, YZ): Left plane at X=0
- Frames are fixed to crate faces

**Problem**:
In manufacturing, workers measure from physical references (bottom, edges, center), not abstract datum planes. Current system doesn't reflect how crates are actually built.

**Key Types**:
```typescript
interface DatumPlaneProps {
  position: [number, number, number]
  rotation: [number, number, number]
  args: [number, number]
  color: string
  label: string
  labelPosition: [number, number, number]
}

interface SceneBounds {
  minX: number; maxX: number
  minY: number; maxY: number
  minZ: number; maxZ: number
}
```

## 🔧 Implementation Guide

### Step 1: Update Datum Calculation Logic
**File**: `src/components/CrateVisualizer.tsx`
**Lines**: `135-209`

**Current Code** (excerpt):
```typescript
const planeSize = Math.max(spanX, spanY, spanZ) * 1.2
const labelOffset = Math.max(spanX, spanY, spanZ) * 0.2

// Datum A: Bottom (XY plane)
position={[centerX, -planeSize / 2, 0]}
labelPosition={[centerX + labelOffset, 0, 0]}
```

**Change To**:
```typescript
// Datum frames should be 15% outside the model bounds
const DATUM_OFFSET_PERCENT = 0.15
const planeSize = Math.max(spanX, spanY, spanZ) * 1.3
const frameOffset = Math.max(spanX, spanY, spanZ) * DATUM_OFFSET_PERCENT

// Datum A: Bottom face (practical construction base)
// Position: 15% below bottom
position={[centerX, -planeSize / 2, -spanZ * DATUM_OFFSET_PERCENT]}

// Label references practical measurement: "FROM BOTTOM"
label="A (BOTTOM REF)"
labelPosition={[centerX + frameOffset, 0, -spanZ * DATUM_OFFSET_PERCENT]}
```

### Step 2: Update All Three Datum Planes
**Lines**: `134-209`

Apply percentage-based offsets to all datums:
- **Datum A**: Reference bottom face, offset 15% below
- **Datum B**: Reference front edge, offset 15% forward
- **Datum C**: Reference left edge, offset 15% left

Change labels to reflect practical references:
- "A (BOTTOM REF)" instead of "A"
- "B (FRONT EDGE)" instead of "B"
- "C (LEFT EDGE)" instead of "C"

### Step 3: Update PMI Constants
**File**: `src/lib/crate-constants.ts`

Add new constant:
```typescript
export const PMI_SETTINGS = {
  DATUM_OFFSET_PERCENT: 0.15,  // Frames 15% outside model
  DATUM_LABELS: {
    A: 'BOTTOM REF',
    B: 'FRONT EDGE',
    C: 'LEFT EDGE'
  }
} as const
```

Import and use in CrateVisualizer.tsx

### Step 4: Test Visual Changes
**Command**: `npm run dev`
**Manual Test**:
1. Open http://localhost:3000
2. Enter crate dimensions: 40" × 40" × 40"
3. Verify datum frames appear 15% outside model
4. Change dimensions to 80" × 80" × 80"
5. Verify frames scale proportionally

## ✅ Acceptance Criteria
- [ ] Datum frames positioned at 15% offset from model bounds
- [ ] Labels updated to reflect practical references
- [ ] Frames scale proportionally with crate size
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Visual verification: frames visible but not overlapping model
- [ ] Constants defined in `crate-constants.ts`

## 🧠 LLM Constraints
- **Token Budget**: 1800 tokens
- **Memory**: 4K context window
- **Files**: 2 (CrateVisualizer.tsx, crate-constants.ts)
- **No External Lookups**: All info provided

## 🔗 Related Issues
- Issue #8 (PMI font scaling)

## 📝 Notes
- Keep ASME Y14.5 standard (three orthogonal planes)
- Don't change coordinate transformation (NX → Three.js)
- Preserve color scheme: Red (A), Green (B), Blue (C)
```

---

## TICKET 2: Implement PMI Font Auto-Scaling

**Group**: A - PMI & Visualization
**Priority**: HIGH
**Estimated Tokens**: ~1600
**Files**: 1

### LLM-Optimized Prompt

```markdown
---
name: PMI Font Auto-Scaling
title: "[LLM] PMI font size should scale with camera view/zoom level"
labels: llm-task, 3d, enhancement
---

## 🎯 Task Summary
Make PMI dimension text scale dynamically based on camera distance and zoom level to maintain readability at all view scales.

## 📦 Context

**File**: `src/components/CrateVisualizer.tsx:211-426`

**Current System**:
- Fixed font sizes in PMI overlays
- Text becomes unreadable when zoomed out
- Text overlaps geometry when zoomed in

**PMI Rendering** (React Three Fiber Html component):
```typescript
<Html
  position={position}
  center
  style={{
    background: 'white',
    padding: '2px 4px',
    fontSize: '12px',  // FIXED SIZE
    ...
  }}
>
  {text}
</Html>
```

**Camera System**: OrbitControls with auto-zoom based on crate size

## 🔧 Implementation Guide

### Step 1: Calculate Camera Distance
**File**: `src/components/CrateVisualizer.tsx`
**Lines**: `211-250` (ScenePMIOverlays component)

**Add state to track camera**:
```typescript
import { useThree } from '@react-three/fiber'

function ScenePMIOverlays({ bounds, totalDimensions }) {
  const { camera } = useThree()
  const [fontSize, setFontSize] = useState(12)

  useFrame(() => {
    // Calculate distance from camera to scene center
    const distance = camera.position.length()

    // Scale font: larger when zoomed out, smaller when zoomed in
    // Base size: 12px at reference distance (100 units)
    const REFERENCE_DISTANCE = 100
    const BASE_FONT_SIZE = 12
    const scaleFactor = distance / REFERENCE_DISTANCE
    const newFontSize = BASE_FONT_SIZE * scaleFactor

    // Clamp between 8px and 24px
    setFontSize(Math.max(8, Math.min(24, newFontSize)))
  })

  // ...rest of component
}
```

### Step 2: Apply Dynamic Font Size to PMI Elements
**Lines**: `251-350` (PMIFrame components)

**Update all Html components**:
```typescript
<Html
  position={position}
  center
  style={{
    background: 'white',
    padding: '2px 4px',
    fontSize: `${fontSize}px`,  // DYNAMIC
    fontFamily: 'monospace',
    border: '1px solid black',
    pointerEvents: 'none',
  }}
>
  {dimensionText}
</Html>
```

### Step 3: Add Font Scaling Constants
**File**: `src/lib/crate-constants.ts`

```typescript
export const PMI_SETTINGS = {
  FONT_SCALE: {
    BASE_SIZE: 12,           // px
    REFERENCE_DISTANCE: 100, // scene units
    MIN_SIZE: 8,             // px
    MAX_SIZE: 24,            // px
  }
} as const
```

Import in CrateVisualizer.tsx

### Step 4: Test at Different Zoom Levels
**Command**: `npm run dev`
**Manual Test**:
1. Open http://localhost:3000
2. Enter dimensions: 40" × 40" × 40"
3. Zoom out fully → verify text size ≤ 24px, still readable
4. Zoom in close → verify text size ≥ 8px, doesn't overlap
5. Rotate view → verify text always faces camera

## ✅ Acceptance Criteria
- [ ] Font size scales with camera distance
- [ ] Text remains readable when zoomed out
- [ ] Text doesn't overlap geometry when zoomed in
- [ ] Font size clamped between 8px and 24px
- [ ] No performance issues (useFrame optimized)
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Build succeeds: `npm run build`

## 🧠 LLM Constraints
- **Token Budget**: 1600 tokens
- **Memory**: 4K context
- **Files**: 2 (CrateVisualizer.tsx, crate-constants.ts)
- **Self-Sufficient**: All React Three Fiber hooks explained

## 🔗 Related Issues
- Issue #1 (Datum positioning)

## 📝 Notes
- Use `useFrame` hook for continuous updates
- Don't use `useState` in useFrame loop (causes re-renders)
- Consider performance: limit state updates to significant changes
```

---

## TICKET 3: Add Weight Calculation System

**Group**: B - BOM & Weight
**Priority**: HIGH
**Estimated Tokens**: ~2000
**Files**: 2

### LLM-Optimized Prompt

```markdown
---
name: Weight Calculation System
title: "[LLM] Implement wood weight calculator with common lumber densities"
labels: llm-task, feature, calculation
---

## 🎯 Task Summary
Add precise weight calculations for crate components using researched wood densities, display in BOM and UI.

## 📦 Context

**Files**:
- Primary: `src/lib/nx-generator.ts:1-1200`
- Secondary: `src/lib/crate-constants.ts`

**Current System**:
- Weight input from user (product weight only)
- No crate weight calculation
- BOM doesn't show component weights

**Lumber Types Used**:
- Skids: 3×4, 4×4, 6×6, 8×8 (structural)
- Floorboards: 2×6, 2×8, 2×10, 2×12
- Cleats: 1×4
- Plywood: 1/2", 5/8", 3/4"

## 🔧 Implementation Guide

### Step 1: Add Wood Density Constants
**File**: `src/lib/crate-constants.ts`

```typescript
// Research-based densities (lb/ft³) for common species
export const WOOD_DENSITIES = {
  // Softwoods (typical for crating)
  DOUGLAS_FIR: 34,      // Most common structural lumber
  SOUTHERN_PINE: 37,    // Heavy-duty applications
  SPF: 28,              // Spruce-Pine-Fir mix (economical)

  // Plywood (depends on species + glue)
  PLYWOOD_SOFTWOOD: 36, // Standard sheathing plywood
} as const

// Default selection (configurable)
export const DEFAULT_WOOD_TYPE = 'DOUGLAS_FIR'

// Nominal vs actual lumber dimensions (inches)
export const LUMBER_ACTUAL_DIMENSIONS = {
  '1x4': { width: 0.75, thickness: 3.5 },
  '2x6': { width: 1.5, thickness: 5.5 },
  '2x8': { width: 1.5, thickness: 7.25 },
  '2x10': { width: 1.5, thickness: 9.25 },
  '2x12': { width: 1.5, thickness: 11.25 },
  '3x4': { width: 2.5, thickness: 3.5 },
  '4x4': { width: 3.5, thickness: 3.5 },
  '6x6': { width: 5.5, thickness: 5.5 },
  '8x8': { width: 7.5, thickness: 7.5 },
} as const
```

### Step 2: Create Weight Calculator
**File**: `src/lib/nx-generator.ts`
**Add new method after `generateBOM()`**:

```typescript
/**
 * Calculate weight of a lumber piece
 * @param size Nominal lumber size (e.g., '2x6')
 * @param lengthInches Length in inches
 * @param density Wood density in lb/ft³
 * @returns Weight in pounds
 */
private calculateLumberWeight(
  size: string,
  lengthInches: number,
  density: number = WOOD_DENSITIES[DEFAULT_WOOD_TYPE]
): number {
  const dims = LUMBER_ACTUAL_DIMENSIONS[size]
  if (!dims) {
    throw new Error(`Unknown lumber size: ${size}`)
  }

  // Volume = width × thickness × length (convert to cubic feet)
  const volumeCubicFeet =
    (dims.width * dims.thickness * lengthInches) / (12 * 12 * 12)

  return volumeCubicFeet * density
}

/**
 * Calculate weight of plywood piece
 * @param widthInches Width in inches
 * @param lengthInches Length in inches
 * @param thicknessInches Thickness in inches
 * @returns Weight in pounds
 */
private calculatePlywoodWeight(
  widthInches: number,
  lengthInches: number,
  thicknessInches: number
): number {
  const volumeCubicFeet =
    (widthInches * lengthInches * thicknessInches) / (12 * 12 * 12)

  return volumeCubicFeet * WOOD_DENSITIES.PLYWOOD_SOFTWOOD
}

/**
 * Calculate total crate weight
 * @returns Object with component weights and total
 */
public calculateCrateWeight(): {
  skids: number
  floorboards: number
  cleats: number
  plywood: number
  hardware: number
  total: number
} {
  let skidWeight = 0
  let floorWeight = 0
  let cleatWeight = 0
  let plywoodWeight = 0

  // Skids
  const skidCount = this.skidCount
  const skidLength = this.crateLength
  const skidSize = this.skidSize
  skidWeight = this.calculateLumberWeight(skidSize, skidLength) * skidCount

  // Floorboards
  const floorCount = Math.ceil(this.crateWidth / this.floorboardSpacing)
  const floorLength = this.crateLength - 2 * this.skidWidth
  floorWeight = this.calculateLumberWeight(
    this.floorboardSize,
    floorLength
  ) * floorCount

  // Cleats (approximate from BOM)
  const totalCleatLength = this.calculateTotalCleatLength()
  cleatWeight = this.calculateLumberWeight('1x4', totalCleatLength)

  // Plywood panels
  for (const panel of this.panels) {
    const dims = this.getPanelDimensions(panel)
    plywoodWeight += this.calculatePlywoodWeight(
      dims.width,
      dims.length,
      this.plywoodThickness
    )
  }

  // Hardware (negligible but include for completeness)
  const hardwareWeight = 5 // Estimated 5 lbs for fasteners

  const total = skidWeight + floorWeight + cleatWeight +
                plywoodWeight + hardwareWeight

  return {
    skids: Math.round(skidWeight * 10) / 10,
    floorboards: Math.round(floorWeight * 10) / 10,
    cleats: Math.round(cleatWeight * 10) / 10,
    plywood: Math.round(plywoodWeight * 10) / 10,
    hardware: hardwareWeight,
    total: Math.round(total * 10) / 10,
  }
}
```

### Step 3: Add Weight to BOM
**File**: `src/lib/nx-generator.ts`
**In `generateBOM()` method, add weight column**:

```typescript
// Add header row
{
  item: 'Component',
  size: 'Size',
  quantity: 'Qty',
  length: 'Length',
  totalLength: 'Total',
  weight: 'Weight (lbs)',  // NEW
  material: 'Material',
}

// Example for skids:
{
  item: 'Skids',
  size: this.skidSize,
  quantity: this.skidCount,
  length: this.crateLength,
  totalLength: this.crateLength * this.skidCount,
  weight: this.calculateLumberWeight(
    this.skidSize,
    this.crateLength
  ) * this.skidCount,  // NEW
  material: 'LUMBER',
}

// Add totals row at end
const weights = this.calculateCrateWeight()
{
  item: 'TOTAL CRATE WEIGHT',
  weight: weights.total,
  material: 'SUMMARY',
}
```

### Step 4: Add Weight Display to UI
**File**: `src/app/page.tsx`
**Add weight info section after BOM**:

```typescript
const crateWeight = generator?.calculateCrateWeight()

// In JSX:
{crateWeight && (
  <div className="mt-4 p-4 bg-blue-50 rounded">
    <h3 className="font-bold">Weight Breakdown</h3>
    <table>
      <tr><td>Skids:</td><td>{crateWeight.skids} lbs</td></tr>
      <tr><td>Floorboards:</td><td>{crateWeight.floorboards} lbs</td></tr>
      <tr><td>Cleats:</td><td>{crateWeight.cleats} lbs</td></tr>
      <tr><td>Plywood:</td><td>{crateWeight.plywood} lbs</td></tr>
      <tr><td>Hardware:</td><td>{crateWeight.hardware} lbs</td></tr>
      <tr className="font-bold border-t">
        <td>Total Crate:</td>
        <td>{crateWeight.total} lbs</td>
      </tr>
      <tr className="text-blue-600">
        <td>Product:</td>
        <td>{inputValues.weight} lbs</td>
      </tr>
      <tr className="font-bold text-lg border-t-2">
        <td>Shipping Weight:</td>
        <td>{crateWeight.total + inputValues.weight} lbs</td>
      </tr>
    </table>
  </div>
)}
```

### Step 5: Add Tests
**File**: `src/lib/__tests__/nx-generator.test.ts`

```typescript
describe('Weight Calculations', () => {
  test('calculates lumber weight correctly', () => {
    const gen = new NXGenerator(config)
    // 2x6 × 8ft Douglas Fir
    // Volume: 1.5" × 5.5" × 96" = 792 in³ = 0.458 ft³
    // Weight: 0.458 × 34 lb/ft³ = 15.6 lbs
    expect(gen.calculateLumberWeight('2x6', 96)).toBeCloseTo(15.6, 1)
  })

  test('calculates total crate weight', () => {
    const gen = new NXGenerator(smallCrateConfig)
    const weights = gen.calculateCrateWeight()
    expect(weights.total).toBeGreaterThan(0)
    expect(weights.skids + weights.floorboards + weights.cleats +
           weights.plywood + weights.hardware).toBeCloseTo(weights.total, 1)
  })
})
```

## ✅ Acceptance Criteria
- [ ] Wood density constants added with research sources
- [ ] Weight calculator methods implemented
- [ ] BOM includes weight column
- [ ] UI displays weight breakdown
- [ ] Total shipping weight = crate + product
- [ ] Tests pass: `npm test -- nx-generator.test.ts`
- [ ] No TypeScript errors
- [ ] Build succeeds

## 🧠 LLM Constraints
- **Token Budget**: 2000 tokens
- **Memory**: 4K context
- **Files**: 3 (nx-generator.ts, crate-constants.ts, page.tsx)

## 📝 Notes
- Use actual lumber dimensions, not nominal
- Douglas Fir density: 34 lb/ft³ (verified source)
- Round weights to 1 decimal place for display
```

---

## TICKET 4: Restructure Bill of Materials

**Group**: B - BOM & Weight
**Priority**: HIGH
**Estimated Tokens**: ~1700
**Files**: 1

### LLM-Optimized Prompt

```markdown
---
name: Supplier-Friendly BOM
title: "[LLM] Merge BOM, cut list, and plywood pieces into unified supplier format"
labels: llm-task, enhancement, bom
---

## 🎯 Task Summary
Redesign BOM to match supplier expectations: consolidated parts list with lengths, quantities, cut instructions, and ordering info.

## 📦 Context

**File**: `src/lib/nx-generator.ts:generateBOM()`

**Current System**:
- Separate BOM, cut list, plywood visualization
- BOM shows generic component types
- No supplier part numbers or ordering info
- Missing cut diagrams

**Supplier Needs**:
1. Part number / SKU
2. Nominal size
3. Actual dimensions
4. Total linear feet (for lumber pricing)
5. Number of pieces
6. Cut instructions
7. Material grade/spec

## 🔧 Implementation Guide

### Step 1: Create Unified BOM Structure
**File**: `src/lib/nx-generator.ts`

```typescript
interface SupplierBOMItem {
  category: 'LUMBER' | 'PLYWOOD' | 'HARDWARE'
  partNumber?: string        // Supplier SKU
  description: string        // Full description
  nominalSize: string        // e.g., "2x6"
  actualSize?: string        // e.g., "1.5 x 5.5"
  grade?: string             // e.g., "#2 & Better"
  species?: string           // e.g., "Douglas Fir"
  quantity: number           // Number of pieces
  lengthEach?: number        // Inches per piece
  totalLinearFeet?: number   // For pricing
  area?: number              // For plywood (sq ft)
  cuts?: string              // Cut instructions
  notes?: string
}

public generateSupplierBOM(): SupplierBOMItem[] {
  const bom: SupplierBOMItem[] = []

  // SECTION 1: STRUCTURAL LUMBER
  bom.push({
    category: 'LUMBER',
    partNumber: `${this.skidSize}-DF-#2`,
    description: `${this.skidSize} Douglas Fir Skids`,
    nominalSize: this.skidSize,
    actualSize: this.getActualSize(this.skidSize),
    grade: '#2 & Better',
    species: 'Douglas Fir',
    quantity: this.skidCount,
    lengthEach: this.crateLength,
    totalLinearFeet: Math.round(
      (this.skidCount * this.crateLength) / 12
    ),
    cuts: 'Cut to length, square ends',
  })

  // SECTION 2: DECKING/FLOORBOARDS
  const floorCount = Math.ceil(this.crateWidth / this.floorboardSpacing)
  const floorLength = this.crateLength - 2 * this.skidWidth

  bom.push({
    category: 'LUMBER',
    partNumber: `${this.floorboardSize}-SPF-#2`,
    description: `${this.floorboardSize} SPF Floorboards`,
    nominalSize: this.floorboardSize,
    actualSize: this.getActualSize(this.floorboardSize),
    grade: '#2 or Better',
    species: 'SPF Mix',
    quantity: floorCount,
    lengthEach: floorLength,
    totalLinearFeet: Math.round((floorCount * floorLength) / 12),
    cuts: `Cut to ${floorLength}" length`,
  })

  // SECTION 3: CLEATS
  const cleatLengths = this.calculateCleatLengths()

  bom.push({
    category: 'LUMBER',
    partNumber: '1x4-SPF-#2',
    description: '1x4 SPF Cleats (various lengths)',
    nominalSize: '1x4',
    actualSize: '0.75 x 3.5',
    grade: '#2',
    species: 'SPF Mix',
    quantity: cleatLengths.totalPieces,
    totalLinearFeet: Math.round(cleatLengths.totalLength / 12),
    cuts: `See cut list:\n${this.generateCleatCutList(cleatLengths)}`,
  })

  // SECTION 4: PLYWOOD PANELS
  const plywoodPieces = this.calculatePlywoodPieces()

  bom.push({
    category: 'PLYWOOD',
    partNumber: `PLY-${this.plywoodThickness}-SHT`,
    description: `${this.plywoodThickness}" CDX Plywood Sheathing`,
    nominalSize: `${this.plywoodThickness}" × 4' × 8'`,
    grade: 'CDX or Better',
    quantity: plywoodPieces.fullSheets,
    area: plywoodPieces.fullSheets * 32, // sq ft
    cuts: `${plywoodPieces.fullSheets} full sheets\n` +
          `${plywoodPieces.partialSheets} sheets require cuts\n` +
          `See plywood cutting diagram`,
  })

  // SECTION 5: HARDWARE
  const klimps = this.calculateTotalKlimps()
  const lags = this.calculateTotalLagScrews()

  bom.push({
    category: 'HARDWARE',
    partNumber: 'KLIMP-2.5',
    description: 'Klimp L-Brackets (2.5" base)',
    quantity: klimps,
    notes: 'Galvanized steel, panel-to-cleat fastening',
  })

  bom.push({
    category: 'HARDWARE',
    partNumber: 'LAG-516-6',
    description: '5/16" × 6" Lag Screws',
    quantity: lags,
    notes: 'Hex head, galvanized, with washers',
  })

  return bom
}

/**
 * Generate detailed cleat cut list
 */
private generateCleatCutList(cleatLengths: {
  horizontal: number[]
  vertical: number[]
}): string {
  const cutList = []

  // Group by length
  const grouped = {}
  for (const len of [...cleatLengths.horizontal, ...cleatLengths.vertical]) {
    grouped[len] = (grouped[len] || 0) + 1
  }

  for (const [length, qty] of Object.entries(grouped)) {
    cutList.push(`  ${qty}× @ ${length}"`)
  }

  return cutList.join('\n')
}

/**
 * Get actual dimensions from nominal size
 */
private getActualSize(nominal: string): string {
  const dims = LUMBER_ACTUAL_DIMENSIONS[nominal]
  return dims ? `${dims.width}" × ${dims.thickness}"` : 'N/A'
}
```

### Step 2: Export Unified BOM as CSV
**Update CSV export format**:

```typescript
public exportBOMAsCSV(): string {
  const bom = this.generateSupplierBOM()

  const headers = [
    'Category',
    'Part Number',
    'Description',
    'Nominal Size',
    'Actual Size',
    'Grade/Spec',
    'Quantity',
    'Length Each (in)',
    'Total Linear Ft',
    'Area (sq ft)',
    'Notes/Cuts',
  ]

  let csv = headers.join(',') + '\n'

  for (const item of bom) {
    csv += [
      item.category,
      item.partNumber || '',
      `"${item.description}"`,
      item.nominalSize,
      item.actualSize || '',
      item.grade || '',
      item.quantity,
      item.lengthEach || '',
      item.totalLinearFeet || '',
      item.area || '',
      `"${item.notes || item.cuts || ''}"`,
    ].join(',') + '\n'
  }

  return csv
}
```

### Step 3: Add Plywood Cutting Diagram to BOM
**Include visual cutting instructions**:

```typescript
/**
 * Generate text-based plywood cutting diagram
 */
private generatePlywoodCuttingDiagram(): string {
  const panels = this.panels
  const diagram = []

  diagram.push('PLYWOOD CUTTING DIAGRAM')
  diagram.push('=' .repeat(50))

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i]
    const dims = this.getPanelDimensions(panel)

    diagram.push(`\nSheet ${i + 1}:`)
    diagram.push(`  Panel: ${panel.type}`)
    diagram.push(`  Size: ${dims.width}" × ${dims.length}"`)
    diagram.push(`  Orientation: ${panel.rotated ? 'ROTATED 90°' : 'NORMAL'}`)

    if (panel.splices && panel.splices.length > 0) {
      diagram.push(`  Splices:`)
      for (const splice of panel.splices) {
        diagram.push(`    - ${splice.position}" from ${splice.edge}`)
      }
    }
  }

  return diagram.join('\n')
}
```

### Step 4: Update UI to Display Unified BOM
**File**: `src/app/page.tsx`

Replace separate BOM/cut list sections with unified display:

```tsx
<div className="bom-section">
  <h2>Supplier Bill of Materials</h2>

  {/* Download buttons */}
  <div className="flex gap-2 mb-4">
    <button onClick={downloadBOMAsCSV}>
      Download BOM (CSV)
    </button>
    <button onClick={downloadPlywoodDiagram}>
      Download Cutting Diagram
    </button>
  </div>

  {/* BOM Table */}
  <table className="supplier-bom">
    <thead>
      <tr>
        <th>Category</th>
        <th>Part #</th>
        <th>Description</th>
        <th>Size</th>
        <th>Qty</th>
        <th>Total</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      {supplierBOM.map((item, i) => (
        <tr key={i} className={item.category.toLowerCase()}>
          <td>{item.category}</td>
          <td className="font-mono">{item.partNumber}</td>
          <td>{item.description}</td>
          <td>{item.nominalSize}</td>
          <td>{item.quantity}</td>
          <td>
            {item.totalLinearFeet && `${item.totalLinearFeet} LF`}
            {item.area && `${item.area} sq ft`}
          </td>
          <td className="text-sm">
            {item.cuts || item.notes}
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Plywood Diagram */}
  <div className="mt-6">
    <h3>Plywood Cutting Diagram</h3>
    <pre className="bg-gray-100 p-4">
      {generator.generatePlywoodCuttingDiagram()}
    </pre>
  </div>
</div>
```

## ✅ Acceptance Criteria
- [ ] Single unified BOM with all components
- [ ] Supplier part numbers included
- [ ] Actual dimensions shown (not just nominal)
- [ ] Total linear feet calculated for lumber
- [ ] Total area calculated for plywood
- [ ] Cut instructions included inline
- [ ] Plywood cutting diagram generated
- [ ] CSV export works with all fields
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors

## 🧠 LLM Constraints
- **Token Budget**: 1700 tokens
- **Memory**: 4K context
- **Files**: 2 (nx-generator.ts, page.tsx)

## 📝 Notes
- Standard lumber grades: #2 & Better (most common)
- Standard plywood: CDX (C-grade face, D-grade back, X-exterior glue)
- Linear feet pricing typical for lumber orders
```

---

## TICKET 5: Optimized Floorboard Algorithm with Lumber Availability

**Group**: C - Lumber Optimization
**Priority**: HIGH
**Estimated Tokens**: ~1900
**Files**: 2

### LLM-Optimized Prompt

```markdown
---
name: Smart Floorboard Layout Algorithm
title: "[LLM] Optimize floorboard arrangement with lumber availability constraints"
labels: llm-task, algorithm, enhancement
---

## 🎯 Task Summary
Create intelligent floorboard layout algorithm: widest boards at edges, thinner in middle, custom boards for gaps ≤2.5", handle unavailable lumber sizes.

## 📦 Context

**File**: `src/lib/nx-generator.ts:calculateFloorboardSize()`

**Current System**:
- Fixed floorboard size (all same width)
- No handling of unavailable lumber
- Even spacing calculated but not optimized
- Available sizes: 2×6, 2×8, 2×10, 2×12

**New Requirements**:
1. User specifies available lumber sizes
2. Widest boards go to outer edges (structural strength)
3. Narrower boards toward center
4. Gaps ≤2.5" filled with custom-cut boards
5. Minimize waste and custom cuts

## 🔧 Implementation Guide

### Step 1: Add Available Lumber Configuration
**File**: `src/lib/crate-constants.ts`

```typescript
export const FLOORBOARD_SIZES = {
  '2x6': { nominal: 6, actual: 5.5 },
  '2x8': { nominal: 8, actual: 7.25 },
  '2x10': { nominal: 10, actual: 9.25 },
  '2x12': { nominal: 12, actual: 11.25 },
} as const

export const CUSTOM_BOARD_THRESHOLD = 2.5 // inches - max gap for custom board

// Default availability (all sizes)
export const DEFAULT_LUMBER_AVAILABILITY = [
  '2x12', '2x10', '2x8', '2x6'
] as const
```

### Step 2: Create Floorboard Layout Optimizer
**File**: `src/lib/nx-generator.ts`

Add new method:

```typescript
interface FloorboardLayout {
  boards: Array<{
    size: string
    actualWidth: number
    position: number  // Distance from left edge
    isCustom: boolean
  }>
  totalGap: number
  customBoards: Array<{
    width: number
    position: number
  }>
}

/**
 * Optimize floorboard layout with available lumber
 * Strategy: Widest at edges, thinner toward center, custom for small gaps
 *
 * @param crateWidth Total width to span (inches)
 * @param availableSizes Lumber sizes in stock (sorted wide to narrow)
 * @returns Optimized board layout
 */
private optimizeFloorboardLayout(
  crateWidth: number,
  availableSizes: string[] = DEFAULT_LUMBER_AVAILABILITY
): FloorboardLayout {
  const layout: FloorboardLayout = {
    boards: [],
    totalGap: 0,
    customBoards: [],
  }

  // Sort available sizes by width (widest first)
  const sortedSizes = availableSizes.sort((a, b) => {
    const widthA = FLOORBOARD_SIZES[a].actual
    const widthB = FLOORBOARD_SIZES[b].actual
    return widthB - widthA
  })

  let remainingWidth = crateWidth
  let currentPosition = 0
  let boardsPlaced = []

  // STEP 1: Place widest boards at edges (symmetrically)
  const widestSize = sortedSizes[0]
  const widestWidth = FLOORBOARD_SIZES[widestSize].actual

  // Left edge
  boardsPlaced.push({
    size: widestSize,
    actualWidth: widestWidth,
    position: currentPosition,
    isCustom: false,
  })
  currentPosition += widestWidth
  remainingWidth -= widestWidth

  // Right edge (placeholder - will mirror left side)
  const rightEdgeBoard = {
    size: widestSize,
    actualWidth: widestWidth,
    position: 0, // Will calculate later
    isCustom: false,
  }
  remainingWidth -= widestWidth

  // STEP 2: Fill center with progressively narrower boards
  let sizeIndex = 0

  while (remainingWidth > 0) {
    // Try each available size (widest to narrowest)
    let placed = false

    for (let i = sizeIndex; i < sortedSizes.length; i++) {
      const size = sortedSizes[i]
      const width = FLOORBOARD_SIZES[size].actual

      if (width <= remainingWidth) {
        // Place board
        boardsPlaced.push({
          size,
          actualWidth: width,
          position: currentPosition,
          isCustom: false,
        })
        currentPosition += width
        remainingWidth -= width
        placed = true
        break
      }
    }

    // If no standard board fits
    if (!placed) {
      // Check if gap is small enough for custom board
      if (remainingWidth <= CUSTOM_BOARD_THRESHOLD) {
        layout.customBoards.push({
          width: remainingWidth,
          position: currentPosition,
        })
        remainingWidth = 0
      } else {
        // Use narrowest available size and continue
        const narrowestSize = sortedSizes[sortedSizes.length - 1]
        const narrowestWidth = FLOORBOARD_SIZES[narrowestSize].actual

        boardsPlaced.push({
          size: narrowestSize,
          actualWidth: narrowestWidth,
          position: currentPosition,
          isCustom: false,
        })
        currentPosition += narrowestWidth
        remainingWidth -= narrowestWidth
      }
    }

    // Prevent infinite loop
    if (boardsPlaced.length > 100) {
      throw new Error('Floorboard layout optimization failed - too many boards')
    }
  }

  // STEP 3: Add right edge board
  rightEdgeBoard.position = currentPosition
  boardsPlaced.push(rightEdgeBoard)

  layout.boards = boardsPlaced
  layout.totalGap = remainingWidth

  return layout
}
```

### Step 3: Add Lumber Availability Input to UI
**File**: `src/app/page.tsx`

Add checkbox inputs for lumber availability:

```tsx
const [availableLumber, setAvailableLumber] = useState([
  '2x12', '2x10', '2x8', '2x6'
])

// In JSX:
<div className="lumber-availability">
  <h3>Available Lumber Sizes</h3>
  <p className="text-sm text-gray-600">
    Select sizes in stock (widest boards used at edges)
  </p>

  {['2x12', '2x10', '2x8', '2x6'].map(size => (
    <label key={size} className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={availableLumber.includes(size)}
        onChange={(e) => {
          if (e.target.checked) {
            setAvailableLumber([...availableLumber, size])
          } else {
            setAvailableLumber(
              availableLumber.filter(s => s !== size)
            )
          }
        }}
      />
      <span>{size}</span>
      <span className="text-xs text-gray-500">
        (actual {FLOORBOARD_SIZES[size].actual}")
      </span>
    </label>
  ))}

  {availableLumber.length === 0 && (
    <p className="text-red-500">
      ⚠️ Select at least one lumber size
    </p>
  )}
</div>
```

### Step 4: Update BOM to Show Layout
**File**: `src/lib/nx-generator.ts`

Update BOM generation to use optimized layout:

```typescript
public generateBOM(): BillOfMaterialsRow[] {
  const bom = []

  // Get optimized layout
  const layout = this.optimizeFloorboardLayout(
    this.crateWidth,
    this.availableLumber
  )

  // Count boards by size
  const boardCounts = {}
  for (const board of layout.boards) {
    if (!board.isCustom) {
      boardCounts[board.size] = (boardCounts[board.size] || 0) + 1
    }
  }

  // Add BOM entries
  for (const [size, count] of Object.entries(boardCounts)) {
    bom.push({
      item: `Floorboards (${size})`,
      size,
      quantity: count,
      length: this.floorboardLength,
      totalLength: count * this.floorboardLength,
      material: 'LUMBER',
      note: 'Structural decking',
    })
  }

  // Add custom boards if any
  if (layout.customBoards.length > 0) {
    bom.push({
      item: 'Custom Floorboards (ripped from stock)',
      quantity: layout.customBoards.length,
      material: 'LUMBER',
      note: layout.customBoards
        .map(b => `${b.width.toFixed(2)}" wide`)
        .join(', '),
    })
  }

  return bom
}
```

### Step 5: Add Visualization of Layout
**File**: `src/app/page.tsx`

Add visual representation of floorboard arrangement:

```tsx
<div className="floorboard-layout-viz mt-4">
  <h3>Floorboard Layout (Top View)</h3>
  <svg
    width="400"
    height="200"
    viewBox="0 0 400 200"
    className="border border-gray-300"
  >
    {layout.boards.map((board, i) => {
      const x = (board.position / crateWidth) * 400
      const width = (board.actualWidth / crateWidth) * 400
      const color = board.isCustom
        ? '#fbbf24' // yellow for custom
        : ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'][
            Math.min(i % 4, 3)
          ]

      return (
        <g key={i}>
          <rect
            x={x}
            y="50"
            width={width}
            height="100"
            fill={color}
            stroke="#000"
            strokeWidth="1"
          />
          <text
            x={x + width / 2}
            y="105"
            textAnchor="middle"
            fontSize="12"
            fill="#000"
          >
            {board.size || `${board.actualWidth.toFixed(1)}"`}
          </text>
        </g>
      )
    })}

    {/* Labels */}
    <text x="10" y="30" fontSize="10" fill="#666">
      ← Widest at edges
    </text>
    <text x="300" y="30" fontSize="10" fill="#666">
      Narrower in center →
    </text>
  </svg>

  <div className="legend mt-2 text-sm">
    <span className="text-blue-600">● Standard lumber</span>
    <span className="text-yellow-600 ml-4">● Custom cut</span>
  </div>
</div>
```

### Step 6: Add Tests
**File**: `src/lib/__tests__/nx-generator.test.ts`

```typescript
describe('Optimized Floorboard Layout', () => {
  test('places widest boards at edges', () => {
    const gen = new NXGenerator({
      ...config,
      availableLumber: ['2x12', '2x10', '2x6'],
    })

    const layout = gen.optimizeFloorboardLayout(60, ['2x12', '2x10', '2x6'])

    // First and last boards should be widest (2x12)
    expect(layout.boards[0].size).toBe('2x12')
    expect(layout.boards[layout.boards.length - 1].size).toBe('2x12')
  })

  test('handles unavailable sizes', () => {
    const layout = gen.optimizeFloorboardLayout(60, ['2x8', '2x6'])

    // Should not use 2x10 or 2x12
    layout.boards.forEach(board => {
      expect(['2x8', '2x6'].includes(board.size) || board.isCustom).toBe(true)
    })
  })

  test('creates custom boards for small gaps', () => {
    const layout = gen.optimizeFloorboardLayout(48.5, ['2x12'])

    // 48.5 - 11.25*4 = 3.5" gap
    // Should have 1-2 custom boards ≤2.5" each
    const customBoards = layout.customBoards
    expect(customBoards.length).toBeGreaterThan(0)
    customBoards.forEach(board => {
      expect(board.width).toBeLessThanOrEqual(2.5)
    })
  })
})
```

## ✅ Acceptance Criteria
- [ ] Widest available boards placed at outer edges
- [ ] Narrower boards toward center
- [ ] Custom boards created for gaps ≤2.5"
- [ ] Lumber availability configurable via UI
- [ ] Layout visualization shows board arrangement
- [ ] BOM shows board counts by size
- [ ] Tests pass: `npm test -- nx-generator.test.ts`
- [ ] No TypeScript errors
- [ ] Build succeeds

## 🧠 LLM Constraints
- **Token Budget**: 1900 tokens
- **Memory**: 4K context
- **Files**: 3 (nx-generator.ts, crate-constants.ts, page.tsx)

## 📝 Notes
- Algorithm prioritizes structural integrity (wide edges)
- Custom boards ripped from standard stock (note in BOM)
- Confirm 2.5" threshold with user
```

---

*Continuing with remaining tickets...*

## TICKET 6: Fix Marking Placement Algorithm & Add STEP Support

**Group**: D - Markings & Labels
**Priority**: MEDIUM
**Estimated Tokens**: ~2000
**Files**: 3

### LLM-Optimized Prompt

```markdown
---
name: Fix Marking Placement for All Panels
title: "[LLM] Markings should cover all panels + provide as STEP files"
labels: llm-task, 3d, step, bug
---

## 🎯 Task Summary
Fix marking placement algorithm to cover all plywood panels (not just first), generate markings as STEP file entities for CAD import.

## 📦 Context

**Files**:
- Algorithm: `src/lib/nx-generator.ts` (marking calculations)
- Visualization: `src/components/MarkingVisualizer.tsx`
- STEP Export: `src/lib/step-generator.ts`

**Current Bug**:
- Markings only placed on first plywood panel
- No STEP file representation (markings not in CAD export)
- Fragile logos calculated per-panel instead of globally

**Marking Types**:
- FRAGILE stencils (8"×8", red, 4 per crate)
- Handling symbols (6"×6", 4 per crate)
- AUTOCRATE text (size-based, 4 per crate)

## 🔧 Implementation Guide

### Step 1: Fix Marking Calculation to Cover All Panels
**File**: `src/lib/nx-generator.ts`

Find current marking calculation (likely in a method like `calculateMarkings()`)

**Current (Buggy) Logic**:
```typescript
// Probably something like this:
const firstPanel = this.panels[0]
const markingPositions = this.placeMarkingsOnPanel(firstPanel)
```

**Fix To**:
```typescript
/**
 * Calculate marking positions for ALL panels
 * @returns Markings grouped by panel
 */
private calculateAllMarkings(): Map<string, Marking[]> {
  const markingsByPanel = new Map()

  // Get all unique panel faces (front, back, left, right)
  const panelFaces = this.getAllPanelFaces()

  for (const face of panelFaces) {
    const markings = []

    // Calculate available area on this face
    const faceArea = this.getPanelFaceArea(face)

    // Place FRAGILE stencils
    if (face.orientation === 'vertical') {
      // Only on vertical faces (front/back/sides)
      const fragilePos = this.calculateFragilePosition(face)
      markings.push({
        type: 'FRAGILE',
        position: fragilePos,
        size: { width: 8, height: 8 },
        rotation: 10, // degrees
        color: '#FF0000',
      })
    }

    // Place handling symbols
    const handlingPos = this.calculateHandlingSymbolPosition(face)
    markings.push({
      type: 'HANDLING',
      position: handlingPos,
      size: { width: 6, height: 6 },
      rotation: 0,
      color: '#000000',
    })

    // Place AUTOCRATE text
    const textSize = this.getAutoCrateTextSize()
    const textPos = this.calculateAutoCratePosition(face, textSize)
    markings.push({
      type: 'AUTOCRATE',
      position: textPos,
      size: textSize,
      rotation: 0,
      color: '#0066CC',
    })

    markingsByPanel.set(face.id, markings)
  }

  return markingsByPanel
}

/**
 * Get all panel faces as structured objects
 */
private getAllPanelFaces(): PanelFace[] {
  const faces: PanelFace[] = []

  // Front panel
  faces.push({
    id: 'front',
    type: this.panels.find(p => p.type === 'front'),
    orientation: 'vertical',
    bounds: this.getPanelBounds('front'),
  })

  // Back panel
  faces.push({
    id: 'back',
    type: this.panels.find(p => p.type === 'back'),
    orientation: 'vertical',
    bounds: this.getPanelBounds('back'),
  })

  // Left panel
  faces.push({
    id: 'left',
    type: this.panels.find(p => p.type === 'left'),
    orientation: 'vertical',
    bounds: this.getPanelBounds('left'),
  })

  // Right panel
  faces.push({
    id: 'right',
    type: this.panels.find(p => p.type === 'right'),
    orientation: 'vertical',
    bounds: this.getPanelBounds('right'),
  })

  return faces
}

/**
 * Calculate FRAGILE logo position (centered, upper third)
 */
private calculateFragilePosition(face: PanelFace): {x: number, y: number, z: number} {
  const bounds = face.bounds

  // Center horizontally, upper third vertically
  const x = (bounds.minX + bounds.maxX) / 2
  const y = bounds.maxY - (bounds.maxY - bounds.minY) / 3
  const z = bounds.maxZ + 0.01 // Slightly offset from surface

  return { x, y, z }
}
```

### Step 2: Add STEP File Representation for Markings
**File**: `src/lib/step-generator.ts`

Add markings as STEP entities (ANNOTATION or SURFACE TEXTURE)

```typescript
/**
 * Generate STEP entities for crate markings
 * Uses ANNOTATION_TEXT and ANNOTATION_SYMBOL for stencils
 */
private generateMarkingSTEPEntities(): string[] {
  const entities: string[] = []
  let id = this.currentEntityId

  const markingsByPanel = this.generator.calculateAllMarkings()

  for (const [panelId, markings] of markingsByPanel.entries()) {
    for (const marking of markings) {
      // Create placement for marking
      const placementId = id++
      const directionId = id++
      const refDirectionId = id++
      const locationId = id++

      // Convert marking position to STEP coordinate system
      const pos = this.convertToSTEPCoords(marking.position)

      // AXIS2_PLACEMENT_3D for marking location
      entities.push(
        `#${locationId} = CARTESIAN_POINT('marking_location', (${pos.x}, ${pos.y}, ${pos.z}));`
      )
      entities.push(
        `#${directionId} = DIRECTION('marking_normal', (0., 0., 1.));`
      )
      entities.push(
        `#${refDirectionId} = DIRECTION('marking_ref', (1., 0., 0.));`
      )
      entities.push(
        `#${placementId} = AXIS2_PLACEMENT_3D('${marking.type}_placement', #${locationId}, #${directionId}, #${refDirectionId});`
      )

      // Create annotation based on type
      if (marking.type === 'FRAGILE') {
        const annotationId = id++
        entities.push(
          `#${annotationId} = ANNOTATION_TEXT('FRAGILE', #${placementId}, ${marking.size.width}, ${marking.size.height}, ${marking.rotation});`
        )

        // Add color
        const colorId = id++
        entities.push(
          `#${colorId} = COLOUR_RGB('red', 1.0, 0.0, 0.0);`
        )
        entities.push(
          `#${id++} = PRESENTATION_STYLE_ASSIGNMENT((#${colorId}));`
        )
      } else if (marking.type === 'AUTOCRATE') {
        const textId = id++
        entities.push(
          `#${textId} = ANNOTATION_TEXT('AUTOCRATE', #${placementId}, ${marking.size.width}, ${marking.size.height}, 0);`
        )

        // Blue color
        const colorId = id++
        entities.push(
          `#${colorId} = COLOUR_RGB('blue', 0.0, 0.4, 0.8);`
        )
      }

      // Add to product definition
      entities.push(
        `#${id++} = PRODUCT_DEFINITION_SHAPE('marking_shape', '', #${annotationId});`
      )
    }
  }

  this.currentEntityId = id
  return entities
}

/**
 * Integrate markings into main STEP export
 */
public generateSTEP(): string {
  // ... existing STEP generation ...

  // Add markings section
  const markingEntities = this.generateMarkingSTEPEntities()
  entities.push(...markingEntities)

  // ... rest of STEP file ...
}
```

### Step 3: Update Visualization to Show All Markings
**File**: `src/components/MarkingVisualizer.tsx`

```typescript
export function MarkingVisualizer({
  markingsByPanel
}: {
  markingsByPanel: Map<string, Marking[]>
}) {
  return (
    <group>
      {Array.from(markingsByPanel.entries()).map(([panelId, markings]) => (
        <group key={panelId}>
          {markings.map((marking, i) => (
            <MarkingDecal
              key={`${panelId}-${i}`}
              marking={marking}
            />
          ))}
        </group>
      ))}
    </group>
  )
}

function MarkingDecal({ marking }: { marking: Marking }) {
  // Load texture based on marking type
  const texture = useTexture(`/markings/${marking.type.toLowerCase()}.png`)

  return (
    <mesh position={[marking.position.x, marking.position.y, marking.position.z]}>
      <planeGeometry args={[marking.size.width, marking.size.height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </mesh>
  )
}
```

### Step 4: Add Marking Assets
**Create**: `public/markings/` directory with PNG files:
- `fragile.png` - Red FRAGILE stencil
- `handling.png` - Black handling symbols
- `autocrate.png` - Blue AUTOCRATE text

(These should be provided by user or generated programmatically)

### Step 5: Add Tests
**File**: `src/lib/__tests__/nx-generator.test.ts`

```typescript
describe('Marking Placement', () => {
  test('places markings on all four vertical faces', () => {
    const gen = new NXGenerator(config)
    const markings = gen.calculateAllMarkings()

    expect(markings.size).toBe(4) // front, back, left, right
    expect(markings.has('front')).toBe(true)
    expect(markings.has('back')).toBe(true)
    expect(markings.has('left')).toBe(true)
    expect(markings.has('right')).toBe(true)
  })

  test('each face has FRAGILE, handling, and AUTOCRATE markings', () => {
    const gen = new NXGenerator(config)
    const markings = gen.calculateAllMarkings()

    for (const [panelId, marks] of markings.entries()) {
      const types = marks.map(m => m.type)
      expect(types).toContain('FRAGILE')
      expect(types).toContain('HANDLING')
      expect(types).toContain('AUTOCRATE')
    }
  })
})

describe('STEP Marking Export', () => {
  test('includes marking annotations in STEP file', () => {
    const gen = new NXGenerator(config)
    const stepGen = new StepGenerator(gen)
    const stepContent = stepGen.generateSTEP()

    expect(stepContent).toContain('ANNOTATION_TEXT')
    expect(stepContent).toContain('FRAGILE')
    expect(stepContent).toContain('AUTOCRATE')
  })
})
```

## ✅ Acceptance Criteria
- [ ] Markings placed on all four vertical panels
- [ ] FRAGILE logos appear on all faces (not just first)
- [ ] Markings exported as STEP annotations
- [ ] STEP file contains ANNOTATION_TEXT entities
- [ ] 3D visualization shows markings on all faces
- [ ] Tests pass: `npm test`
- [ ] Visual verification in 3D viewer
- [ ] STEP file opens in CAD software with markings visible

## 🧠 LLM Constraints
- **Token Budget**: 2000 tokens
- **Memory**: 4K context
- **Files**: 3 (nx-generator.ts, step-generator.ts, MarkingVisualizer.tsx)

## 📝 Notes
- STEP ANNOTATION_TEXT may not be supported by all CAD software
- Alternative: Generate markings as surface textures (SURFACE_TEXTURE entity)
- Verify marking asset files exist in public/markings/
```

---

## TICKET 7-16: Remaining Tickets

Due to token constraints, here's a condensed summary of remaining tickets:

### TICKET 7: Fix Documentation Scrolling
**Group**: E - Documentation | **Priority**: MEDIUM | **Files**: 1
**Task**: Fix persistent scrolling bug in docs UI (likely CSS overflow issue)

### TICKET 8: Update Stale Documentation
**Group**: E - Documentation | **Priority**: MEDIUM | **Files**: Multiple
**Task**: Audit all docs against codebase, update outdated references, verify examples

### TICKET 9: Remove Base/Crate from Display Window
**Group**: G - UI/UX | **Priority**: LOW | **Files**: 1
**Task**: Hide duplicate input display in 3D viewer (already shown in form)

### TICKET 10: Fix Branch Metadata
**Group**: F - DevOps | **Priority**: LOW | **Files**: Git config
**Task**: Ensure issue numbers in branch names match actual issues

### TICKET 11: Improve PR Verification Checklist
**Group**: F - DevOps | **Priority**: LOW | **Files**: 1
**Task**: Make `.github/pull_request_template.md` checklist context-aware

### TICKET 12: Add Issue Creator/Solver Metadata
**Group**: F - DevOps | **Priority**: LOW | **Files**: 2
**Task**: Add "Created by" and "Solved by" fields to issue templates

### TICKET 13: Test Case Management UI
**Group**: H - New Features | **Priority**: LOW | **Complexity**: VERY HIGH
**Task**: Build interactive test case table with parameter calculator, save/load, notes

### TICKET 14: Reverse Engineering Feature
**Group**: H - New Features | **Priority**: LOW | **Complexity**: VERY HIGH
**Task**: Input STEP file → calculate empty space → suggest crate dimensions

### TICKET 15: Automated Ticket Submission Portal
**Group**: I - Infrastructure | **Priority**: MEDIUM | **Complexity**: VERY HIGH
**Task**: Web portal for ticket submission, LLM filtering, auto-GitHub issue creation

---

## Summary Table

| # | Title | Group | Priority | Files | Tokens | Dependencies |
|---|-------|-------|----------|-------|--------|--------------|
| 1 | Datum Frame Positioning | A | HIGH | 2 | 1800 | None |
| 2 | PMI Font Scaling | A | HIGH | 2 | 1600 | #1 |
| 3 | Weight Calculation | B | HIGH | 3 | 2000 | None |
| 4 | Supplier-Friendly BOM | B | HIGH | 2 | 1700 | #3 |
| 5 | Floorboard Optimization | C | HIGH | 3 | 1900 | None |
| 6 | Marking Placement Fix | D | MEDIUM | 3 | 2000 | None |
| 7 | Fix Docs Scrolling | E | MEDIUM | 1 | 800 | None |
| 8 | Update Docs | E | MEDIUM | 5+ | 1200 | None |
| 9 | Hide Display Inputs | G | LOW | 1 | 600 | None |
| 10 | Branch Metadata | F | LOW | 0 | 500 | None |
| 11 | PR Checklist | F | LOW | 1 | 700 | None |
| 12 | Issue Metadata | F | LOW | 2 | 800 | None |
| 13 | Test Case UI | H | LOW | 5+ | 3000+ | Database |
| 14 | Reverse Engineering | H | LOW | 4+ | 3000+ | STEP parser |
| 15 | Ticket Portal | I | MEDIUM | 10+ | 4000+ | Web server |

**Total Estimated Tokens**: ~25,600 for all 15 tickets

---

## Automation System Design (Ticket #15 Detail)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TICKET SUBMISSION PORTAL                  │
│                     (Next.js Web App)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │                           │
        ▼                           ▼
┌───────────────┐          ┌─────────────────┐
│  User Form    │          │  LLM Optimizer  │
│  - Title      │          │  (GPT-4o-mini)  │
│  - Desc       │──────────│  - Contextualize│
│  - Screenshots│          │  - Add file refs│
│  - Category   │          │  - Validate     │
└───────────────┘          └────────┬────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │  GitHub API     │
                           │  - Create issue │
                           │  - Add labels   │
                           │  - Assign agent │
                           └─────────────────┘
```

### Implementation Guide

**File Structure**:
```
src/app/submit-ticket/
├── page.tsx                 # Ticket submission form
├── api/
│   ├── optimize-ticket/     # LLM processing
│   └── create-issue/        # GitHub API integration
└── components/
    ├── TicketForm.tsx
    └── TicketPreview.tsx
```

**LLM Optimization Prompt Template**:
```
You are a ticket optimization agent for AutoCrate codebase.

USER SUBMISSION:
Title: {user_title}
Description: {user_description}
Category: {user_category}

CODEBASE CONTEXT:
{minimal_codebase_summary}

TASK:
1. Rewrite ticket in LLM-optimized format
2. Add specific file references
3. Include code snippets if relevant
4. Estimate token budget
5. Suggest priority and labels

OUTPUT FORMAT:
{llm_optimized_template}
```

---

## Next Steps

1. **Review & Approve**: User reviews this analysis
2. **Prioritize**: Select tickets to implement first (suggest: #1-6 as HIGH priority)
3. **Create GitHub Issues**: Copy LLM prompts to GitHub
4. **Spawn LLM Agents**: Launch lightweight LLMs in separate terminals
5. **Monitor & Merge**: Track progress, review PRs

**Recommended Order**:
1. Tickets #1-2 (PMI improvements - quick wins)
2. Tickets #3-4 (Weight & BOM - user-facing features)
3. Ticket #5 (Floorboard optimization - complex algorithm)
4. Ticket #6 (Markings fix - bug resolution)
5. Tickets #7-12 (Documentation & DevOps - lower priority)
6. Tickets #13-15 (Major features - long-term projects)

---

**Document End** | Generated by Claude Code | 2025-10-16
