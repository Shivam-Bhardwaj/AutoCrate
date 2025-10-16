# AutoCrate Technical Architecture

**Version**: 14.0.0
**Last Updated**: 2025-10-16
**Purpose**: Deep technical documentation for developers

---

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [System Architecture](#system-architecture)
3. [Module Catalog](#module-catalog)
4. [Data Flow](#data-flow)
5. [Key Algorithms](#key-algorithms)
6. [Coordinate Systems](#coordinate-systems)
7. [Critical Patterns](#critical-patterns)
8. [Performance Optimization](#performance-optimization)

---

## Core Philosophy

### Two-Point Diagonal Construction

**Everything** in AutoCrate is based on defining 3D boxes using two corner points:

```typescript
point1: { x: 0, y: 0, z: 0 }              // Origin
point2: { x: width, y: length, z: height } // Opposite corner
```

**Why?**
- Simplifies CAD generation (Siemens NX parametric modeling)
- Makes 3D visualization straightforward
- Enables easy dimension calculations
- Natural for box-like shipping crate geometry

**Key Principle**: Never store explicit dimensions. Always calculate from point1→point2.

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                      │
│                       (Next.js App Router)                       │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  page.tsx    │───▶│ Components   │───▶│ 3D Visualizer│      │
│  │  (State Hub) │    │ (UI Widgets) │    │  (Three.js)  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                  ┌──────────┴──────────┐
                  │                     │
                  ▼                     ▼
     ┌────────────────────┐   ┌──────────────────┐
     │   Core Business    │   │   API Routes     │
     │   Logic (lib/)     │   │   (app/api/)     │
     │                    │   │                  │
     │  NXGenerator       │   │  /calculate-crate│
     │  STEPGenerator     │   │  /nx-export      │
     │  Calculators       │   │  /plywood-opt    │
     │  Algorithms        │   │  /cleat-place    │
     └────────────────────┘   └──────────────────┘
```

### Technology Stack

**Frontend**:
- Next.js 14 (App Router) - React framework
- React 18 - UI library
- TypeScript 5 - Type safety
- Tailwind CSS 3 - Styling
- React Three Fiber 8.15 - 3D rendering
- Three.js 0.160 - 3D graphics

**State Management**:
- React hooks (component-level state)
- Zustand 4 (global theme state)
- 500ms debouncing for inputs

**Testing**:
- Jest 30 - Unit testing
- React Testing Library 16 - Component testing
- Playwright 1.55 - E2E testing

**Development**:
- Husky 9 - Git hooks
- lint-staged 16 - Pre-commit linting
- ESLint 8 - Code linting
- Prettier 3 - Code formatting

---

## Module Catalog

### 1. Core Generator (`src/lib/nx-generator.ts`)

**Purpose**: Orchestrates entire crate generation process

**Key Responsibilities**:
- Parametric crate design calculations
- NX CAD expression generation
- Bill of Materials (BOM) creation
- Lumber cut list generation
- Component geometry definition

**Key Types**:
```typescript
interface CrateConfig {
  product: ProductDimensions;
  clearances: { side; end; top };
  materials: MaterialConfig;
  hardware?: HardwareConfig;
  geometry?: GeometryConfig;
  identifiers?: PartIdentifiers;
  markings?: MarkingConfig;
}

interface NXBox {
  name: string;
  point1: { x; y; z };
  point2: { x; y; z };
  type: BoxType;
  color?: string;
  suppressed?: boolean;
  metadata?: string;
  panelName?: string;
}
```

**Key Methods**:
- `getBoxes()` → NXBox[] (for 3D visualization)
- `getExpressions()` → Map<string, number> (for calculations)
- `exportNXExpressions()` → string (for CAD import)
- `generateBOM()` → BillOfMaterialsRow[]
- `generateCutList()` → LumberCutList

**Dependencies**:
- plywood-splicing.ts
- cleat-calculator.ts
- klimp-calculator.ts
- klimp-step-integration.ts
- lag-step-integration.ts

**Parallel Work Safety**: ⚠️ CAUTION - High-impact file, coordinate changes

---

### 2. STEP File Generator (`src/lib/step-generator.ts`)

**Purpose**: Export crate model to ISO 10303-21 STEP format (AP242)

**Key Responsibilities**:
- ISO 10303-21 AP242 compliant export
- Hierarchical assembly structure
- B-Rep geometry definitions
- PMI (Product Manufacturing Information) metadata
- Unit conversion (inches → millimeters)

**Assembly Hierarchy**:
```
AUTOCRATE CRATE ASSEMBLY (#1)
├── SHIPPING_BASE (#2)
│   ├── SKID_ASSEMBLY (#3)
│   │   └── skid_4x4_1, skid_4x4_2, ... (individual instances)
│   └── FLOORBOARD_ASSEMBLY (#4)
│       └── floorboard_2x6_1, floorboard_2x6_2, ...
├── CRATE_CAP (#5)
│   ├── FRONT_PANEL_ASSEMBLY (#6)
│   │   ├── front_panel_ply (#7)
│   │   └── front_panel_cleat_1, cleat_2, ... (#8-#N)
│   ├── BACK_PANEL_ASSEMBLY
│   ├── LEFT_PANEL_ASSEMBLY
│   ├── RIGHT_PANEL_ASSEMBLY
│   └── TOP_PANEL_ASSEMBLY
├── KLIMP_FASTENERS (#N+1)
│   └── klimp_1, klimp_2, ...
└── STENCILS (#M)
    └── marking_decals
```

**Component Naming Convention** (snake_case with nominal dimensions):
- Skids: `skid_HxW` (e.g., `skid_4x4`, `skid_6x6`)
- Floorboards: `floorboard_HxW` (e.g., `floorboard_2x6`)
- Plywood: `PANELNAME_ply` (e.g., `front_panel_ply`)
- Cleats: `PANELNAME_cleat_N` (e.g., `front_panel_cleat_1`)

**Dependencies**: None (pure function)

**Parallel Work Safety**: ⚠️ CAUTION - Complex assembly hierarchy, test thoroughly

---

### 3. Plywood Splicing (`src/lib/plywood-splicing.ts`)

**Purpose**: Optimize plywood panel layouts on 48x96" sheets

**Algorithm**:
1. Analyze panel dimensions (width × height)
2. Try different orientations (portrait/landscape)
3. Minimize waste through intelligent splicing
4. Calculate exact piece dimensions with lumber overlaps
5. Handle both top/bottom and side panels

**Key Types**:
```typescript
interface PanelSpliceLayout {
  panelName: string;
  pieces: PlywoodPiece[];
  totalSheets: number;
  wastePercentage: number;
}

interface PlywoodPiece {
  id: string;
  width: number;
  height: number;
  sheetNumber: number;
  position: { x; y };
}
```

**Optimization Strategy**:
- Prefer single-piece panels when possible
- Use 2-piece vertical splits for tall panels
- Use 3-piece layouts for very large panels
- Account for cleat overlap zones

**Dependencies**: None

**Parallel Work Safety**: ✅ SAFE - Self-contained algorithm

---

### 4. Klimp Calculator (`src/lib/klimp-calculator.ts`)

**Purpose**: Calculate klimp fastener placement positions

**Klimp Fastener System**:
- L-shaped metal fasteners securing front panel to adjacent panels
- Corner klimps for reinforcement at top corners
- Side klimps symmetrically placed on left/right edges

**Placement Rules**:
- 18"-24" spacing between klimps
- Avoid cleat interference zones (+/- 2.5" from cleats)
- Symmetric placement for structural balance
- Minimum 2 klimps per edge (corner + mid)

**Key Types**:
```typescript
interface KlimpLayout {
  cornerKlimps: KlimpPosition[];
  sideKlimps: { left: KlimpPosition[]; right: KlimpPosition[] };
  totalCount: number;
}

interface KlimpPosition {
  x: number;
  y: number;
  z: number;
  orientation: 'left' | 'right';
}
```

**Dependencies**: None

**Parallel Work Safety**: ✅ SAFE - Self-contained logic

---

### 5. Cleat Calculator (`src/lib/cleat-calculator.ts`)

**Purpose**: Calculate cleat positioning for panel reinforcement

**Cleat System**:
- Vertical/horizontal wooden cleats reinforce plywood panels
- Positioning based on panel height
- Symmetric placement on left/right panels
- Prevents panel sagging during transport

**Placement Rules**:
- Panel height < 48": 2 cleats (top/bottom)
- Panel height 48"-72": 3 cleats (top/mid/bottom)
- Panel height > 72": 4+ cleats (evenly spaced)
- Cleats positioned to avoid klimp interference

**Key Types**:
```typescript
interface PanelCleatLayout {
  panelName: string;
  cleats: Cleat[];
  count: number;
}

interface Cleat {
  position: { x; y; z };
  dimensions: { length; width; height };
  orientation: 'horizontal' | 'vertical';
}
```

**Dependencies**: None

**Parallel Work Safety**: ✅ SAFE - Independent calculation module

---

### 6. 3D Visualizer (`src/components/CrateVisualizer.tsx`)

**Purpose**: React Three Fiber 3D rendering

**Key Responsibilities**:
- Real-time 3D mesh generation from NXBox[]
- Component visibility filtering
- Material definitions (colors, opacity)
- Camera controls (OrbitControls)
- PMI (Product Manufacturing Information) overlays
- Performance optimization

**Critical Patterns**:

**1. Coordinate Conversion**:
```typescript
// NX CAD → Three.js Scene
const scale = 0.1;  // inches to scene units
X (width)  → X (left/right)
Y (length) → -Z (front/back)  // NEGATIVE!
Z (height) → Y (up/down)

// Position calculation
position: [x * scale, z * scale, -y * scale]
```

**2. PMI Reactivity** (CRITICAL):
```typescript
// MUST have key prop for reactivity
<ScenePMIOverlays
  key={`pmi-${width}-${length}-${height}`}  // Forces re-render on dimension change
  sceneBounds={sceneBounds}
  totalDimensions={totalDimensions}
  // ... other props
/>
```

Without the key prop, PMI will show stale dimensions!

**3. Visibility Filtering**:
```typescript
const visibleBoxes = boxes.filter(box => {
  if (box.type === 'skid') return displayOptions.visibility.skids;
  if (box.type === 'panel') return displayOptions.visibility[box.panelName];
  // ...
});
```

**Performance Optimizations**:
- useMemo for expensive calculations
- Visibility filtering reduces mesh count
- Debounced config updates (500ms)
- Efficient state updates

**Dependencies**: Three.js, nx-generator.ts (types)

**Parallel Work Safety**: ⚠️ CAUTION - Complex 3D logic, test thoroughly

---

### 7. Main Application (`src/app/page.tsx`)

**Purpose**: Root UI component, state management hub

**Key Responsibilities**:
- Central state management (config, visibility, PMI)
- Input handling with debouncing
- Generator lifecycle management
- Component coordination
- User interactions

**State Architecture**:
```typescript
// Immediate UI state (no delay)
const [inputValues, setInputValues] = useState<InputValues>({});

// Delayed config state (500ms debounce)
const [config, setConfig] = useState<CrateConfig>({});

// Generator instance (recreated on config change)
const [generator, setGenerator] = useState<NXGenerator | null>(null);

// Display options
const [displayOptions, setDisplayOptions] = useState<DisplayOptions>({
  visibility: { skids, floorboards, panels, ... },
  lumberSizes: new Set(['2x6', '2x8', '2x10', '2x12'])
});

// PMI visibility
const [pmiVisibility, setPmiVisibility] = useState<PMIVisibility>({
  totalDimensions: true,
  skids: false,
  cleats: false,
  // ...
});
```

**Debouncing Pattern** (Critical for performance):
```typescript
const handleInputChange = (field: string, value: string) => {
  // Update UI immediately
  setInputValues(prev => ({ ...prev, [field]: value }));

  // Clear previous timeout
  if (debounceTimeoutRef.current[field]) {
    clearTimeout(debounceTimeoutRef.current[field]);
  }

  // Delayed config update
  debounceTimeoutRef.current[field] = setTimeout(() => {
    const numValue = parseFloat(value);
    setConfig(prev => ({ ...prev, [field]: numValue }));
  }, 500);
};

const handleInputBlur = (field: string) => {
  // Immediate update on blur (user stopped typing)
  const value = inputValues[field];
  const numValue = parseFloat(value);
  setConfig(prev => ({ ...prev, [field]: numValue }));

  // Clear timeout
  if (debounceTimeoutRef.current[field]) {
    clearTimeout(debounceTimeoutRef.current[field]);
  }
};
```

**Why debouncing?**
- Prevents expensive re-renders while typing
- Generator creation is expensive (hundreds of calculations)
- 500ms feels responsive, prevents thrashing
- Blur triggers immediate update for better UX

**Dependencies**: ALL components and lib modules

**Parallel Work Safety**: ⚠️ AVOID - Central coordination point, high collision risk

---

### 8. API Routes (`src/app/api/`)

**Purpose**: Backend API endpoints

**Available Routes**:

| Route | Purpose | Method |
|-------|---------|--------|
| `/api/calculate-crate` | Crate calculations & BOM | POST |
| `/api/cleat-placement` | Cleat positioning algorithms | POST |
| `/api/last-update` | Project update banner info | GET |
| `/api/nx-export` | NX expression file generation | POST |
| `/api/plywood-optimization` | Plywood splicing calculations | POST |
| `/api/test-dashboard` | Testing dashboard & metrics | GET |

**Pattern**: Each route has co-located `route.test.ts` file

**Parallel Work Safety**: ✅ SAFE - Routes are independent

---

## Data Flow

### Primary Data Flow (User Input → 3D Visualization)

```
1. User Input
   ↓ (page.tsx)
   - handleInputChange() → setInputValues() [immediate]
   - After 500ms debounce → setConfig() [delayed]

2. Generator Creation
   ↓ (useEffect on config changes)
   - new NXGenerator(config)
   - Runs all calculations
   - Generates boxes[], expressions, BOM, cut list

3. Box Generation
   ↓ (generator.getBoxes())
   - Returns NXBox[] array
   - Each box = { name, point1, point2, type, color, ... }

4. Visibility Filtering
   ↓ (CrateVisualizer)
   - Filter boxes based on displayOptions.visibility
   - visibleBoxes = boxes.filter(...)

5. 3D Rendering
   ↓ (React Three Fiber)
   - Map visibleBoxes to <mesh> elements
   - Apply coordinate conversion (X, Y, Z → X, Y, -Z)
   - Apply scale factor (0.1)

6. PMI Overlay
   ↓ (ScenePMIOverlays)
   - Calculate dimensions from sceneBounds
   - Render measurement lines/text
   - Uses key prop for reactivity
```

### STEP Export Flow

```
1. User clicks "Download STEP"
   ↓
2. Call generator.getBoxes()
   ↓
3. Create new StepGenerator(boxes, config)
   ↓
4. Generate ISO 10303-21 content
   - Header section
   - Assembly structure
   - Component instances
   - B-Rep geometry
   - PMI metadata
   ↓
5. Convert to Blob & download
```

### NX Export Flow

```
1. User clicks "Download NX Expressions"
   ↓
2. Call generator.exportNXExpressions()
   ↓
3. Generate expression file
   - Variable definitions
   - Formulas
   - Dependencies
   ↓
4. Convert to .txt & download
```

---

## Key Algorithms

### 1. Skid Size Selection Algorithm

**Input**: Product weight, configuration
**Output**: Optimal skid lumber size

```typescript
if (weight <= 500 && allow3x4Lumber) {
  return '3x4';
} else if (weight <= 1000) {
  return '4x4';
} else if (weight <= 3000) {
  return '6x6';
} else {
  return '8x8';
}
```

**Why this matters**: Skid size affects:
- Floor height (affects total crate height)
- Structural integrity
- Material cost
- Shipping weight

### 2. Floorboard Size Selection Algorithm

**Input**: Crate dimensions, available lumber sizes
**Output**: Optimal floorboard lumber size

```typescript
const crateLength = productLength + 2 * endClearance;
const requiredSpan = crateLength - 2 * skidWidth;

// Find smallest lumber that spans the distance
for (const size of ['2x6', '2x8', '2x10', '2x12']) {
  const nominalLength = getNominalLength(size);
  if (nominalLength >= requiredSpan) {
    return size;
  }
}

// Fallback to largest available
return '2x12';
```

### 3. Klimp Placement Algorithm

**Input**: Panel dimensions, cleat positions
**Output**: Klimp positions avoiding cleats

```typescript
// Step 1: Place corner klimps (always present)
const cornerKlimps = [
  { x: 0, y: panelHeight, z: 0 },     // Top-left
  { x: panelWidth, y: panelHeight, z: 0 }  // Top-right
];

// Step 2: Calculate side klimp positions
const targetSpacing = 18; // inches
const edgeHeight = panelHeight - cornerOffset;
const numSideKlimps = Math.floor(edgeHeight / targetSpacing);

// Step 3: Avoid cleat interference zones
for (each potentialPosition) {
  const interferesWithCleat = cleats.some(cleat =>
    Math.abs(potentialPosition.y - cleat.y) < 2.5  // 2.5" buffer
  );

  if (!interferesWithCleat) {
    addKlimp(potentialPosition);
  }
}

// Step 4: Ensure symmetric placement (left/right balance)
```

### 4. Plywood Splicing Algorithm

**Input**: Panel dimensions, sheet size (48×96)
**Output**: Piece layout minimizing waste

```typescript
// Step 1: Try single-piece solution
if (panelWidth <= 48 && panelHeight <= 96) {
  return [{ width: panelWidth, height: panelHeight, sheetNumber: 1 }];
}

// Step 2: Try two-piece vertical split
if (panelHeight > 96) {
  const piece1Height = 96;
  const piece2Height = panelHeight - 96 + overlapZone;
  return [
    { width: panelWidth, height: piece1Height, sheetNumber: 1 },
    { width: panelWidth, height: piece2Height, sheetNumber: 1 }
  ];
}

// Step 3: Try three-piece layout (L-shape)
if (panelWidth > 48 && panelHeight > 96) {
  // Complex layout calculation...
}

// Calculate waste percentage
const usedArea = pieces.reduce((sum, p) => sum + p.width * p.height, 0);
const totalSheetArea = numSheets * 48 * 96;
const wastePercentage = ((totalSheetArea - usedArea) / totalSheetArea) * 100;
```

---

## Coordinate Systems

### NX CAD Coordinate System

```
         Z (height)
         ↑
         |
         |
         |________→ X (width)
        /
       /
      ↙
     Y (length)

Origin: (0, 0, 0) at center of crate floor
```

### Three.js Scene Coordinate System

```
         Y (up/down)
         ↑
         |
         |
         |________→ X (left/right)
        /
       /
      ↙
    -Z (front/back)

Scale: 0.1 × (NX coordinates)
```

### Coordinate Conversion

```typescript
// NX CAD → Three.js Scene
function nxToThreeJS(nxPoint: {x; y; z}): [number, number, number] {
  const scale = 0.1;
  return [
    nxPoint.x * scale,      // X → X
    nxPoint.z * scale,      // Z → Y
    -nxPoint.y * scale      // Y → -Z (NEGATIVE!)
  ];
}
```

**Critical**: The negative Y is intentional! Three.js Z-axis points toward camera (right-hand rule), opposite of NX Y-axis.

---

## Critical Patterns

### 1. The Scale Factor (DO NOT CHANGE)

```typescript
const scale = 0.1;  // Everywhere in the codebase
```

This converts NX inches to Three.js scene units. Changing it breaks:
- 3D visualization proportions
- Camera positioning
- PMI measurements
- Click interactions

### 2. The Key Prop Pattern (PMI Reactivity)

```typescript
// REQUIRED for PMI to update on dimension changes
<ScenePMIOverlays
  key={`pmi-${totalDimensions.overallWidth}-${totalDimensions.overallLength}-${totalDimensions.overallHeight}`}
  sceneBounds={sceneBounds}
  totalDimensions={totalDimensions}
/>
```

**Why?** React doesn't detect changes in Three.js objects. The key forces unmount/remount.

### 3. The Debounce Pattern (Performance)

```typescript
// Pattern used for ALL dimension inputs
const [inputValues, setInputValues] = useState({});  // Immediate
const [config, setConfig] = useState({});            // Delayed

handleInputChange(field, value) {
  setInputValues(prev => ({ ...prev, [field]: value }));  // UI update

  debounceTimeoutRef.current[field] = setTimeout(() => {
    setConfig(prev => ({ ...prev, [field]: numValue }));  // Expensive update
  }, 500);
}
```

**Why?** Generator creation is expensive (~200ms for complex crates). Debouncing prevents thrashing.

### 4. The Two-Point Construction Pattern

```typescript
// EVERYWHERE: Define geometry with two points
interface NXBox {
  point1: { x: 0, y: 0, z: 0 };           // Origin
  point2: { x: width, y: length, z: height };  // Opposite corner
}

// Calculate dimensions
const width = box.point2.x - box.point1.x;
const length = box.point2.y - box.point1.y;
const height = box.point2.z - box.point1.z;

// Center point
const center = {
  x: (box.point1.x + box.point2.x) / 2,
  y: (box.point1.y + box.point2.y) / 2,
  z: (box.point1.z + box.point2.z) / 2
};
```

---

## Performance Optimization

### Techniques Used

**1. Debouncing** (500ms for inputs)
- Prevents expensive re-renders while typing
- Immediate blur handling for better UX

**2. useMemo Hooks**
```typescript
const totalDimensions = useMemo(() => calculateDimensions(), [boxes, config]);
const sceneBounds = useMemo(() => calculateBounds(), [boxes]);
```

**3. Visibility Filtering**
```typescript
// Only render visible components
const visibleBoxes = boxes.filter(box => displayOptions.visibility[box.type]);
```

**4. Component Lazy Loading**
```typescript
// Load heavy 3D components only when needed
const CrateVisualizer = lazy(() => import('./CrateVisualizer'));
```

**5. Efficient State Updates**
```typescript
// Batch updates together
setConfig(prev => ({
  ...prev,
  product: { ...prev.product, width: newWidth },
  // Multiple fields at once
}));
```

### Performance Benchmarks

| Operation | Time | Notes |
|-----------|------|-------|
| Generator creation | ~200ms | For complex crate |
| 3D render (initial) | ~100ms | 50-100 meshes |
| 3D render (update) | ~50ms | Reuse geometries |
| STEP export | ~150ms | Large assembly |
| Input debounce | 500ms | Configurable |

---

## Module Dependency Graph

```
page.tsx (State Hub)
  │
  ├──▶ NXGenerator (nx-generator.ts)
  │     ├──▶ PlywoodSplicer (plywood-splicing.ts)
  │     ├──▶ CleatCalculator (cleat-calculator.ts)
  │     ├──▶ KlimpCalculator (klimp-calculator.ts)
  │     ├──▶ KlimpSTEPIntegration (klimp-step-integration.ts)
  │     └──▶ LagSTEPIntegration (lag-step-integration.ts)
  │
  ├──▶ CrateVisualizer (CrateVisualizer.tsx)
  │     └──▶ ScenePMIOverlays (internal component)
  │
  ├──▶ ScenarioSelector (ScenarioSelector.tsx)
  ├──▶ PlywoodPieceSelector (PlywoodPieceSelector.tsx)
  ├──▶ LumberCutList (LumberCutList.tsx)
  └──▶ MarkingsSection (MarkingsSection.tsx)

StepGenerator (step-generator.ts)
  ├──▶ KlimpSTEPIntegration (klimp-step-integration.ts)
  └──▶ LagSTEPIntegration (lag-step-integration.ts)
```

### Parallel Work Safety Matrix

| Module A → Module B | Safe to Work Simultaneously? |
|---------------------|------------------------------|
| Different API routes | ✅ Yes |
| Different calculators | ✅ Yes |
| Calculator + UI component | ✅ Yes |
| Different UI components | ✅ Yes (if no shared state) |
| nx-generator + step-generator | ⚠️ Coordinate |
| page.tsx + any component | ⚠️ Coordinate |
| Any module + tests | ✅ Yes |
| Any module + docs | ✅ Yes |

---

## See Also

- **docs/START_HERE.md** - Quick start guide
- **docs/AGENT_GUIDE.md** - Agent system and workflows
- **docs/TESTING_GUIDE.md** - Testing strategies
- **docs/CONTRIBUTING.md** - Development workflows
- **CHANGELOG.md** - Version history
