# PROJECT DNA - AutoCrate Essential Knowledge

**READ THIS FIRST** in every new session. This saves 50-100K tokens of exploration.

Last updated: 2025-10-15
Purpose: Instant context for any LLM working on AutoCrate

---

## 🎯 Quick Start (30 seconds)

```bash
# What is this?
A Next.js 14 app that generates parametric shipping crate designs
Input: Product dimensions → Output: 3D visualization + CAD files + BOM

# Tech stack
Next.js 14 (App Router) + React Three Fiber + TypeScript + Jest + Playwright

# Dev server (already running in background - check /bashes)
npm run dev  # http://localhost:3000

# File you'll edit 90% of the time
src/components/CrateVisualizer.tsx  # 3D visualization + PMI
src/lib/nx-generator.ts              # Core calculation engine
src/app/page.tsx                     # Main UI and state management
```

---

## 🧬 Core Architecture (The DNA)

### The Design Philosophy: "Two Diagonal Points"

**Everything** in this app is based on defining 3D boxes using two corner points:

```typescript
point1: { x: 0, y: 0, z: 0 }      // Origin
point2: { x: width, y: length, z: height }  // Opposite corner
```

This simplifies both CAD generation and 3D visualization. All geometry flows from this.

### The Data Flow (Critical Path)

```
User Input (page.tsx)
    ↓ [500ms debounce]
NXGenerator (nx-generator.ts)
    ↓ [calculations]
Boxes Array (NXBox[])
    ↓ [filtering]
CrateVisualizer (3D rendering)
    ↓
PMI Overlays (measurements)
```

**Key Insight**: The generator creates boxes, the visualizer just displays them. Don't try to do calculations in the visualizer!

---

## 📍 Critical Code Locations

### Most Important Files (Read These First)

```typescript
// THE BIG THREE - 80% of work happens here
src/lib/nx-generator.ts:1-2200           // Brain: All calculations
src/components/CrateVisualizer.tsx:1-1331 // Eyes: 3D view + PMI
src/app/page.tsx:1-506                   // UI: Input handling + state

// PMI System (Product Manufacturing Information)
src/components/CrateVisualizer.tsx:205-426  // ScenePMIOverlays component
src/components/CrateVisualizer.tsx:827-889  // useMemo hooks for dimensions
src/components/CrateVisualizer.tsx:1156-1166 // PMI rendering (has KEY prop!)

// Hardware Systems
src/lib/klimp-calculator.ts               // L-shaped fastener placement
src/lib/cleat-calculator.ts               // Vertical/horizontal cleats
src/lib/plywood-splicing.ts               // Panel optimization

// STEP Export (CAD files)
src/lib/step-generator.ts:1-1000          // ISO 10303-21 AP242 export
```

### Quick File Navigation Patterns

```bash
# Finding component definitions
grep -n "^function ComponentName" src/components/

# Finding where generator is used
grep -n "new NXGenerator" src/

# Finding state updates
grep -n "setConfig\|setState" src/app/page.tsx

# Finding PMI-related code
grep -rn "pmi\|PMI" src/components/CrateVisualizer.tsx
```

---

## 🔥 Common Issues & Solutions (Save 30+ minutes)

### Issue #1: PMI Not Updating When Dimensions Change

**Symptoms**: PMI lines visible but show old dimensions
**Root Cause**: React not detecting changes in Three.js components
**Solution**: ScenePMIOverlays MUST have a key prop at line 1158:

```typescript
// ✅ CORRECT (line 1156-1166)
{sceneBounds && totalDimensions && (
  <ScenePMIOverlays
    key={`pmi-${totalDimensions.overallWidth}-${totalDimensions.overallLength}-${totalDimensions.overallHeight}`}
    // ... props
  />
)}

// ❌ WRONG - will show stale data
{sceneBounds && (
  <ScenePMIOverlays /* no key prop */ />
)}
```

**Files to check**: `CrateVisualizer.tsx:1156-1166`
**Related PR**: #73

### Issue #2: Coordinate System Confusion

**The Coordinate Mapping**:

```typescript
// NX CAD System → Three.js Scene
X (width)     → X (left/right)
Y (length)    → -Z (front/back) // NOTE THE NEGATIVE!
Z (height)    → Y (up/down)

// The conversion (used everywhere)
const scale = 0.1  // inches to scene units
position: [x * scale, z * scale, -y * scale]
```

**Critical**: The `-y` is intentional! Don't "fix" it.

**Files to check**: `CrateVisualizer.tsx:710`, `nx-generator.ts:anywhere coordinates are used`

### Issue #3: Generator Not Updating

**Symptoms**: UI inputs change but 3D model doesn't
**Root Cause**: Generator is created in useEffect, check dependencies
**Solution**: Verify useEffect dependencies at `page.tsx:225-254`

```typescript
// Must include ALL config changes
useEffect(() => {
  setGenerator(
    new NXGenerator({
      ...config,
      materials: { ...config.materials, allow3x4Lumber },
      // etc
    }),
  );
}, [config, allow3x4Lumber, displayOptions.lumberSizes /* ... */]);
```

### Issue #4: Tests Failing (Security/API tests)

**Expected failures** (pre-existing, not your problem):

- `src/lib/__tests__/security.test.ts` - 5 failures (rate limiting, bcrypt)
- `src/app/api/nx-export/route.test.ts` - 4 failures (headers mocking)
- `src/app/api/calculate-crate/route.test.ts` - 3 failures (headers mocking)

**Tests that MUST pass**:

- `src/lib/__tests__/step-generator.test.ts`
- `src/lib/__tests__/nx-generator.test.ts`
- `src/components/__tests__/CrateVisualizer.test.tsx`

**Quick check**: `npm test CrateVisualizer` (runs in ~10 seconds)

---

## 🎨 State Management Patterns

### The Debouncing Pattern (page.tsx)

```typescript
// ALL dimension inputs use 500ms debounce
handleInputChange(field, value) {
  setInputValues(prev => ({ ...prev, [field]: value }))  // Immediate

  debounceTimeoutRef.current[field] = setTimeout(() => {
    setConfig(prev => ({ ...prev, [field]: numValue }))  // Delayed
  }, 500)
}

handleInputBlur(field) {
  setConfig(/* ... */)  // Immediate on blur
}
```

**Why**: Prevents expensive re-renders while typing
**Files**: `page.tsx:256-308`

### The Visibility System

```typescript
// Component visibility (page.tsx:104-124)
displayOptions: {
  visibility: { skids, floorboards, frontPanel, ... },
  lumberSizes: { '2x6', '2x8', '2x10', '2x12' }
}

// PMI visibility (page.tsx:95-101)
pmiVisibility: {
  totalDimensions: true,
  skids: false,
  cleats: false,
  floor: false,
  datumPlanes: true
}
```

**Pattern**: Toggles are controlled by parent, component just displays
**Files**: `page.tsx:104-124`, `CrateVisualizer.tsx:770-787`

---

## 🔧 Development Workflows

### Workflow 1: Fixing a UI Bug

```bash
1. grep -n "issue keyword" src/components/
2. Read CrateVisualizer.tsx (offset: [line from grep], limit: 50)
3. Edit the specific section
4. Check dev server at localhost:3000
5. npm test CrateVisualizer  # Quick validation
6. git add . && git commit -m "fix: description"
```

**Estimated time**: 5-10 minutes
**Token usage**: 15-25K

### Workflow 2: Modifying Calculations

```bash
1. grep -n "calculation name" src/lib/nx-generator.ts
2. Read nx-generator.ts (offset: [line], limit: 100)
3. Find related test in src/lib/__tests__/
4. Edit calculation
5. npm test nx-generator.test.ts
6. Commit
```

**Estimated time**: 10-15 minutes
**Token usage**: 20-30K

### Workflow 3: Adding New Hardware

```bash
1. Review klimp-calculator.ts or cleat-calculator.ts as template
2. Create new calculator in src/lib/
3. Create STEP integration file
4. Add 3D visualization component
5. Update generator to use new calculator
6. Add tests
7. Update CrateVisualizer to render
```

**Estimated time**: 30-60 minutes
**Token usage**: 80-120K

---

## 📦 Key Data Structures

### NXBox - The Universal Primitive

```typescript
interface NXBox {
  name: string; // e.g., "FRONT_PANEL", "skid_4x4_1"
  point1: { x; y; z }; // Origin corner (usually 0,0,0)
  point2: { x; y; z }; // Opposite corner
  type: "skid" | "floor" | "panel" | "cleat" | "plywood" | "klimp" | "hardware";
  color?: string; // Hex color for visualization
  suppressed?: boolean; // Hide from visualization
  metadata?: string; // Extra info for tooltips
  panelName?: string; // For plywood pieces: which panel
}
```

**Everything is an NXBox**. Skids, panels, cleats, hardware - all boxes.

### CrateConfig - The Input

```typescript
interface CrateConfig {
  product: { length; width; height; weight };
  clearances: { side; end; top };
  materials: {
    skidSize: "3x4" | "4x4" | "6x6" | "8x8";
    plywoodThickness: 0.25;
    panelThickness: 1;
    cleatSize: "1x4";
    allow3x4Lumber: boolean;
    availableLumber?: ("2x6" | "2x8" | "2x10" | "2x12")[];
  };
  hardware?: { lagScrewSpacing: number };
  geometry?: { sidePanelGroundClearance: number };
  identifiers?: { basePartNumber; cratePartNumber; capPartNumber };
  markings?: MarkingConfig;
}
```

### Generator Output Methods

```typescript
const generator = new NXGenerator(config);

generator.getBoxes(); // → NXBox[] (for 3D)
generator.getExpressions(); // → Map<string, number> (for calculations)
generator.exportNXExpressions(); // → string (for CAD)
generator.generateBOM(); // → BillOfMaterialsRow[]
generator.getPanelCleatLayouts(); // → CleatLayout[]
generator.generateCutList(); // → LumberCutList
```

---

## 🎯 Token-Saving Tips for This Project

### Before Reading ANY File

```bash
# 1. Check if info is in THIS file (PROJECT_DNA.md)
# 2. Use grep to find exact location
grep -n "SearchTerm" src/path/to/file.tsx
# 3. Read only needed section
Read: file.tsx (offset: [line-20], limit: 40)
```

### Use These Commands First

```bash
# Find component definitions
grep -n "^function ComponentName\|^const ComponentName" src/

# Find where something is imported
grep -rn "import.*ComponentName" src/

# Find state updates
grep -n "set[A-Z]" src/app/page.tsx

# Find all uses of a variable
grep -n "variableName" src/path/file.tsx
```

### Avoid These Token Wasters

```bash
# ❌ Reading entire large files
Read: CrateVisualizer.tsx  # 1,331 lines = ~25K tokens

# ❌ Running full test suite
npm test  # ~30K tokens of output

# ❌ Reading files multiple times
Read: file.tsx
# ... later ...
Read: file.tsx  # Same file again!

# ✅ Instead
Read: CrateVisualizer.tsx (offset: 200, limit: 50)  # ~1K tokens
npm test CrateVisualizer  # ~3K tokens
# Keep notes so you don't re-read
```

---

## 🗺️ File Dependency Map

```
page.tsx
  ├─ calls → NXGenerator (nx-generator.ts)
  ├─ renders → CrateVisualizer (CrateVisualizer.tsx)
  ├─ uses → ScenarioSelector, PlywoodPieceSelector, LumberCutList
  └─ manages → All state (config, visibility, PMI)

NXGenerator
  ├─ uses → cleat-calculator.ts
  ├─ uses → klimp-calculator.ts
  ├─ uses → plywood-splicing.ts
  ├─ outputs → NXBox[]
  └─ outputs → Expressions Map

CrateVisualizer
  ├─ receives → boxes: NXBox[]
  ├─ receives → generator: NXGenerator
  ├─ calculates → totalDimensions (useMemo)
  ├─ calculates → sceneBounds (useMemo)
  ├─ renders → ScenePMIOverlays (KEY PROP REQUIRED!)
  └─ renders → MarkingVisualizer

StepGenerator
  ├─ receives → NXBox[]
  ├─ uses → klimp-step-integration.ts
  ├─ uses → lag-step-integration.ts
  └─ outputs → ISO 10303-21 AP242 STEP file
```

---

## 🚨 Critical Gotchas

### 1. The Scale Factor

```typescript
const scale = 0.1; // EVERYWHERE - don't change this!
```

Changing this breaks everything. It converts NX inches to Three.js scene units.

### 2. The Negative Y

```typescript
position: [x * scale, z * scale, -y * scale]
                                 ↑ MUST BE NEGATIVE
```

Three.js Z-axis is opposite of NX Y-axis.

### 3. The Key Prop

```typescript
<ScenePMIOverlays
  key={`pmi-${width}-${length}-${height}`}  // REQUIRED for reactivity
/>
```

Without this, PMI won't update on dimension changes.

### 4. The Debounce

```typescript
// Inputs have 500ms debounce
// Don't expect instant updates while typing
// Blur triggers immediate update
```

### 5. Pre-commit Hooks

```bash
# Husky runs on every commit:
- TypeScript check (fast)
- Related tests (fast)
- Prettier (fast)

# Don't commit if:
- TS errors exist
- Related tests fail
```

---

## 📊 Performance Benchmarks

### Fast Operations (< 5s)

- Single component edit + save
- Grep search across codebase
- Git commit
- Run single test file
- Dev server hot reload

### Medium Operations (5-15s)

- npm test (full suite)
- npm run build
- Multiple file edits
- Complex grep with context

### Slow Operations (15s+)

- npm test:e2e
- First npm install
- Reading 5+ large files

---

## 🎓 Learning Resources (Ordered by Priority)

### For Understanding the Codebase

1. **Start here**: This file (PROJECT_DNA.md)
2. **Architecture**: CLAUDE.md lines 1-150
3. **Code examples**:
   - `src/lib/__tests__/step-generator.test.ts` (see how generator works)
   - `src/lib/__tests__/nx-generator.test.ts` (see calculations)
4. **API docs**: CLAUDE.md lines 300-400

### For Understanding the Domain

1. **Two-point construction**: CLAUDE.md lines 50-80
2. **Coordinate system**: CLAUDE.md lines 420-450
3. **STEP file format**: Look at test output in `step-generator.test.ts`
4. **PMI system**: See `CrateVisualizer.tsx:205-426` comments

---

## 🔮 Common Request Decision Tree

```
Request: "Fix bug in visualization"
├─ Is it PMI-related?
│  ├─ YES → Check CrateVisualizer.tsx:205-426, 1156-1166
│  └─ NO → Check CrateVisualizer.tsx:1120-1145 (rendering)
│
Request: "Calculation is wrong"
├─ Grep for calculation name in nx-generator.ts
├─ Read that section + 50 lines
└─ Check related test in __tests__/
│
Request: "Add new feature"
├─ Find similar feature
├─ Copy pattern
└─ Add tests first (TDD)
│
Request: "Tests failing"
├─ Check "Expected failures" section above
├─ If not expected → Read test file
└─ Run specific test: npm test [testname]
```

---

## 💡 Pro Tips

### Tip 1: Use /compact Early

After ~100K tokens, run `/compact` to summarize conversation.

### Tip 2: Check Background Processes

```bash
# Before starting work
/bashes  # See what's already running
# Dev server (9e4404) might already be running!
```

### Tip 3: Test Incrementally

```bash
# ❌ Don't do this
npm test  # All tests every time

# ✅ Do this
npm test CrateVisualizer  # Specific file
npm test -- --testNamePattern="should generate"  # Specific test
```

### Tip 4: Git Workflow

```bash
# PRs auto-deploy to Vercel
# Check PR comments for Vercel preview link
# Test on Vercel before merging
```

### Tip 5: When Stuck

```bash
# 1. Check this file first
# 2. Check CLAUDE.md
# 3. grep for similar code
# 4. Read tests (they're documentation!)
# 5. Ask specific questions
```

---

## 📝 Session Checklist

### Start of Every Session (30 seconds)

- [ ] Read PROJECT_DNA.md (this file)
- [ ] Check `/bashes` for running processes
- [ ] Read specific issue/task description
- [ ] Grep to find relevant code locations
- [ ] Read ONLY the sections you need

### Before Making Changes (1 minute)

- [ ] Understand the data flow for this component
- [ ] Check for similar patterns in codebase
- [ ] Read related tests
- [ ] Make note of critical gotchas

### Before Committing (2 minutes)

- [ ] Run specific test file
- [ ] Check TypeScript (auto-runs in pre-commit)
- [ ] Verify in browser at localhost:3000
- [ ] Write clear commit message

### Token Budget Estimation

- Simple edit: 10-20K tokens
- Bug fix: 20-50K tokens
- New feature: 50-150K tokens
- Major refactor: 150-300K tokens

---

## 🎯 Success Metrics

**You're doing well if**:

- Session uses < 100K tokens for bug fixes
- You find code in < 2 grep commands
- You read < 500 lines of code total
- Tests pass on first try
- Commit happens < 20 minutes after starting

**You might be inefficient if**:

- Reading entire files without offset/limit
- Running full test suite multiple times
- Re-reading same code
- Exploring without specific goal

---

## 🔄 Keep This File Updated

When you discover something important:

```bash
# Add to this file immediately
Edit: PROJECT_DNA.md
# Add under appropriate section

# Patterns that save time = worth documenting
# Gotchas that waste time = MUST document
# Common questions = add to FAQ section
```

---

## Version History

- **2025-10-15**: Initial creation
  - Added PMI reactivity gotcha (#67)
  - Added coordinate system mapping
  - Added token-saving strategies

---

**END OF PROJECT_DNA.md**

Remember: Reading this file (8K tokens) saves you from reading 50-100K tokens of source code every session. Update it whenever you learn something valuable! 🧬
