# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

AutoCrate is a Next.js 14 parametric shipping crate design tool with real-time 3D visualization and CAD export.

**Before working on anything, read PROJECT_DNA.md** - it contains critical code locations, common issues/solutions, and token-saving strategies that will save you 50-100K tokens per session.

## Essential Commands

### Development

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run type-check       # TypeScript validation
npm run lint             # ESLint
```

### Testing

```bash
npm test                 # Run Jest unit tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # Playwright E2E tests
npm run test:all         # Complete test suite

# Run specific test
npm test -- step-generator.test.ts
npm test -- --testNamePattern="should generate"
```

### Version Management

```bash
npm run version:patch    # Bug fix: x.x.N
npm run version:minor    # Feature: x.N.0
npm run version:major    # Breaking: N.0.0
npm run version:sync     # Sync version across files
```

### Git Workflow

```bash
gh issue list            # View open issues
gh issue view <number>   # View issue details
git checkout -b feature/issue-N-description
# ... make changes ...
git add . && git commit -m "..."
gh pr create             # Create PR (auto-closes issue)
```

## Slash Commands

This project includes 12+ custom slash commands for common workflows:

- `/test` - Run complete test suite
- `/build` - Production build verification
- `/verify` - Full health check
- `/feature` - Add new feature workflow
- `/quick-fix` - Rapid bug fix workflow
- `/step` - Work with STEP files
- `/nx` - Work with NX expressions
- `/3d` - Work with 3D visualization
- `/lumber` - Modify lumber sizes
- `/hardware` - Add/modify hardware
- `/scenario` - Add/modify scenarios

See `.claude/README.md` for full documentation.

## Core Architecture

### Two-Point Diagonal Construction

Everything in AutoCrate is defined by two corner points:

```typescript
point1: { x: 0, y: 0, z: 0 }      // Origin
point2: { x: width, y: length, z: height }  // Opposite corner
```

This pattern simplifies both CAD generation and 3D visualization. **Never store explicit dimensions** - always calculate from point1→point2.

### Coordinate System

```
Origin: (0,0,0) at center of crate floor
X-axis: Width (left/right)
Y-axis: Length (front/back)
Z-axis: Height (vertical)
Units: Inches
```

### NX CAD → Three.js Conversion

```typescript
const scale = 0.1;  // DON'T CHANGE THIS
X (width)  → X (left/right)
Y (length) → -Z (front/back)  // NOTE THE NEGATIVE
Z (height) → Y (up/down)

position: [x * scale, z * scale, -y * scale]
```

### Data Flow

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

## Critical File Locations

### Core Business Logic (src/lib/)

- **nx-generator.ts** - Main orchestrator, all calculations
- **step-generator.ts** - ISO 10303-21 STEP export
- **klimp-calculator.ts** - L-shaped fastener placement
- **cleat-calculator.ts** - Panel reinforcement
- **plywood-splicing.ts** - Material optimization
- **lag-step-integration.ts** - Lag screw integration

### UI Components (src/components/)

- **CrateVisualizer.tsx** - Main 3D component (React Three Fiber)
- **KlimpModel.tsx** - Hardware 3D models
- **MarkingVisualizer.tsx** - Panel markings

### Main Application

- **src/app/page.tsx** - Root component, state management

## Critical Patterns

### 1. PMI Reactivity (REQUIRED)

PMI overlays must have a key prop to update on dimension changes:

```typescript
<ScenePMIOverlays
  key={`pmi-${width}-${length}-${height}`}  // REQUIRED
  sceneBounds={sceneBounds}
  totalDimensions={totalDimensions}
/>
```

Location: `CrateVisualizer.tsx:1156-1166`

### 2. Debounced Input

All dimension inputs use 500ms debounce to prevent expensive re-renders:

```typescript
handleInputChange(field, value) {
  setInputValues(prev => ({ ...prev, [field]: value }))  // Immediate

  setTimeout(() => {
    setConfig(prev => ({ ...prev, [field]: numValue }))  // After 500ms
  }, 500)
}
```

Location: `page.tsx:256-308`

### 3. Visibility Filtering

Only render visible components for performance:

```typescript
const visibleBoxes = boxes.filter((box) => displayOptions.visibility[box.type]);
```

## Testing Requirements

### Pre-Commit Hooks (Automated via Husky)

Every commit automatically runs:

- TypeScript type checking
- Jest tests for changed files
- Prettier formatting
- ESLint validation

### Coverage Targets

- Core logic (src/lib/): 90%+
- Components: 80%+
- API routes: 85%+

### Known Test Failures (IGNORE)

- `src/lib/__tests__/security.test.ts` (5 failures - rate limiting)
- `src/app/api/nx-export/route.test.ts` (4 failures - headers mocking)
- `src/app/api/calculate-crate/route.test.ts` (3 failures - headers mocking)

### Critical Tests (MUST PASS)

- `step-generator.test.ts`
- `nx-generator.test.ts`
- `CrateVisualizer.test.tsx`
- `plywood-splicing.test.ts`

## Common Development Tasks

### Adding New Lumber Size

1. Update types in `nx-generator.ts`
2. Modify skid/floorboard selection logic
3. Update 3D visualization in `CrateVisualizer.tsx`
4. Update `LumberCutList.tsx` display
5. Add unit tests

### Modifying STEP Export

1. Read `step-generator.test.ts` first
2. Edit `step-generator.ts`
3. Verify ISO 10303-21 AP242 compliance
4. Test with Playwright E2E
5. Run `npm test -- step-generator.test.ts`

### Fixing 3D Visualization

1. Edit `CrateVisualizer.tsx`
2. Check coordinate transformations (scale = 0.1, negative Y)
3. Verify PMI key prop exists
4. Test with different scenarios

### Adding New Hardware

1. Create calculator: `src/lib/new-hardware-calculator.ts`
2. Create STEP integration: `src/lib/new-hardware-step-integration.ts`
3. Create 3D model: `src/components/NewHardwareModel.tsx`
4. Add tests: `src/lib/__tests__/new-hardware-calculator.test.ts`
5. Update STEP generator assembly

## Commit Guidelines

**Format:**

```
type: Brief description (max 50 chars)

Closes #issue-number
```

**Types:** feat, fix, chore, docs, test, refactor, style, perf

**Branch naming:**

- `feature/issue-N-description`
- `fix/issue-N-description`

See COMMIT_GUIDELINES.md for details.

## Key Data Structures

### NXBox (Universal Primitive)

```typescript
interface NXBox {
  name: string;
  point1: { x; y; z };
  point2: { x; y; z };
  type: "skid" | "floor" | "panel" | "cleat" | "plywood" | "klimp";
  color?: string;
  suppressed?: boolean;
}
```

### CrateConfig (Input)

```typescript
interface CrateConfig {
  product: { length; width; height; weight };
  clearances: { side; end; top };
  materials: {
    skidSize: "3x4" | "4x4" | "6x6" | "8x8";
    plywoodThickness: 0.25;
    allow3x4Lumber: boolean;
  };
}
```

## STEP Assembly Hierarchy

```
AUTOCRATE CRATE ASSEMBLY
├── SHIPPING_BASE
│   ├── SKID_ASSEMBLY
│   └── FLOORBOARD_ASSEMBLY
├── CRATE_CAP
│   ├── FRONT_PANEL_ASSEMBLY (plywood + cleats)
│   ├── BACK_PANEL_ASSEMBLY
│   ├── LEFT_PANEL_ASSEMBLY
│   ├── RIGHT_PANEL_ASSEMBLY
│   └── TOP_PANEL_ASSEMBLY
├── KLIMP_FASTENERS
└── STENCILS (markings)
```

## Critical Reminders

### Always Do ✅

- Read PROJECT_DNA.md before starting work
- Run `npm test` before committing
- Work from GitHub issues
- Use issue numbers in branch names
- Follow commit message format

### Never Do ❌

- Change the scale factor (0.1)
- Remove the negative Y in coordinate conversion
- Remove PMI key prop
- Skip pre-commit hooks
- Create files unnecessarily (edit existing)

### Performance Tips

- Generator creation is expensive (~200ms) - debounce inputs
- Use visibility filtering to reduce mesh count
- Use useMemo for expensive calculations
- Batch state updates

## Project Structure

```
src/
├── lib/                 # Core business logic
│   ├── nx-generator.ts
│   ├── step-generator.ts
│   ├── klimp-calculator.ts
│   ├── cleat-calculator.ts
│   ├── plywood-splicing.ts
│   └── __tests__/
├── components/          # React components
│   ├── CrateVisualizer.tsx
│   ├── KlimpModel.tsx
│   └── __tests__/
├── app/
│   ├── page.tsx        # Main UI
│   └── api/            # API routes
tests/e2e/              # Playwright tests
```

## Documentation Resources

- **PROJECT_DNA.md** - Critical patterns, gotchas, token-saving strategies (READ THIS FIRST)
- **MODULES.md** - Module boundaries, parallel work safety
- **TESTING.md** - Comprehensive testing guide
- **COMMIT_GUIDELINES.md** - Commit message standards
- **.claude/README.md** - Slash commands documentation
- **README.md** - User-facing documentation

## Token-Saving Tips

### Before Reading Files

1. Check PROJECT_DNA.md first (contains critical line numbers)
2. Use grep to find exact locations
3. Read only needed sections with offset/limit

### Use These Commands First

```bash
grep -n "ComponentName" src/components/
grep -n "calculation" src/lib/nx-generator.ts
grep -rn "import.*Component" src/
```

### Avoid

- Reading entire large files (use offset/limit)
- Running full test suite repeatedly (use specific tests)
- Re-reading same files (keep notes)

## Quick Reference

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript 5, Three.js, React Three Fiber, Jest, Playwright

**Package Manager:** npm

**Current Version:** See package.json

**Main Entry Point:** src/app/page.tsx

**Test Entry Point:** jest.config.js

**Build Output:** .next/

**Deployment:** Vercel (see vercel.json)

---

**Remember:** Reading PROJECT_DNA.md (8K tokens) saves 50-100K tokens of codebase exploration. Always start there!
