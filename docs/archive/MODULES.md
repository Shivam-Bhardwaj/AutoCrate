# Module Architecture & Boundaries

This document defines clear boundaries between modules to enable safe parallel development.

## Module Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface Layer                    │
│                      (src/app/page.tsx)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐            ┌──────────────────┐
│  UI Components   │            │   API Routes     │
│  (src/components)│            │  (src/app/api)   │
└────────┬─────────┘            └────────┬─────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │      Core Business Logic      │
         │         (src/lib/)            │
         ├───────────────────────────────┤
         │  ┌─────────────────────────┐  │
         │  │   nx-generator.ts       │  │
         │  │   (Orchestrator)        │  │
         │  └──────────┬──────────────┘  │
         │             │                  │
         │  ┌──────────┴──────────────┐  │
         │  │                         │  │
         │  ▼                         ▼  │
         │  step-generator.ts    Calculator│
         │  plywood-splicing.ts  Modules  │
         │  klimp-calculator.ts           │
         │  cleat-calculator.ts           │
         │  lag-step-integration.ts       │
         │  klimp-step-integration.ts     │
         └────────────────────────────────┘
```

## Module Catalog

### 1. Core Generator (`src/lib/nx-generator.ts`)

**Purpose**: Orchestrates entire crate generation process

**Dependencies**:

- `plywood-splicing.ts`
- `cleat-calculator.ts`
- `klimp-calculator.ts`
- `klimp-step-integration.ts`
- `lag-step-integration.ts`

**Exports**:

- `NXGenerator` class
- `CrateConfig` interface
- `ProductDimensions` interface
- `NXBox` interface
- `BillOfMaterialsRow` interface
- `LumberCutItem` interface

**Parallel Work Safety**: [WARNING] CAUTION

- High-impact file, many dependents
- Coordinate major changes
- Safe to add new methods if isolated

**Common Changes**:

- Adding new lumber sizes
- Adjusting crate sizing logic
- BOM generation updates

---

### 2. STEP File Generator (`src/lib/step-generator.ts`)

**Purpose**: Exports crate model to ISO 10303-21 STEP format

**Dependencies**: None (pure function)

**Exports**:

- `StepGenerator` class

**Parallel Work Safety**: [WARNING] CAUTION

- Complex assembly hierarchy
- Order-dependent entity generation
- Test thoroughly after changes

**Common Changes**:

- Adding new component types to assembly
- Improving PMI metadata
- Fixing STEP compliance issues

**Module Boundaries**:

- Input: Array of `NXBox[]`
- Output: ISO 10303-21 compliant string
- No external state dependencies

---

### 3. Plywood Splicing (`src/lib/plywood-splicing.ts`)

**Purpose**: Optimizes plywood panel layouts on 48x96" sheets

**Dependencies**: None

**Exports**:

- `PlywoodSplicer` class
- `PanelSpliceLayout` interface
- `PlywoodPiece` interface

**Parallel Work Safety**: [DONE] SAFE

- Self-contained algorithm
- No shared state
- Well-tested

**Common Changes**:

- Optimization algorithm improvements
- Support for different sheet sizes
- Waste reduction strategies

**Module Boundaries**:

- Input: Panel dimensions, available sheets
- Output: Optimized piece layout
- Pure function, no side effects

---

### 4. Klimp Fastener Calculator (`src/lib/klimp-calculator.ts`)

**Purpose**: Calculates klimp fastener placement positions

**Dependencies**: None

**Exports**:

- `KlimpCalculator` class
- `KlimpLayout` interface
- `CleatInfo` interface

**Parallel Work Safety**: [DONE] SAFE

- Self-contained logic
- No external dependencies
- Independent of other hardware

**Common Changes**:

- Spacing rule adjustments
- Placement algorithm improvements
- Interference avoidance logic

---

### 5. Klimp STEP Integration (`src/lib/klimp-step-integration.ts`)

**Purpose**: Generates STEP entities for klimp fasteners

**Dependencies**:

- `klimp-calculator.ts`

**Exports**:

- `KlimpSTEPIntegration` class
- `KlimpInstance` interface

**Parallel Work Safety**: [DONE] SAFE

- Isolated hardware integration
- Can be modified independently

---

### 6. Lag Screw Integration (`src/lib/lag-step-integration.ts`)

**Purpose**: Provides lag screw metadata and STEP import instructions

**Dependencies**: None

**Exports**:

- `LagSTEPIntegration` class

**Parallel Work Safety**: [DONE] SAFE

- Reference data only
- No computation logic

---

### 7. Cleat Calculator (`src/lib/cleat-calculator.ts`)

**Purpose**: Calculates cleat positioning for panel reinforcement

**Dependencies**: None

**Exports**:

- `CleatCalculator` class
- `PanelCleatLayout` interface
- `Cleat` interface

**Parallel Work Safety**: [DONE] SAFE

- Independent calculation module
- Well-isolated

---

### 8. Main Application (`src/app/page.tsx`)

**Purpose**: Root UI component, state management hub

**Dependencies**: ALL components and lib modules

**Exports**: Default React component

**Parallel Work Safety**: [AVOID] AVOID

- Central coordination point
- State management hub
- High collision risk

**Common Changes**:

- Adding new UI controls
- State management updates
- New feature integration

**Coordination Required**:

- Always work in feature branches
- Communicate state changes
- Test thoroughly before merging

---

### 9. 3D Visualizer (`src/components/CrateVisualizer.tsx`)

**Purpose**: React Three Fiber 3D rendering

**Dependencies**:

- Three.js
- `nx-generator.ts` (types)

**Exports**: React component

**Parallel Work Safety**: [WARNING] CAUTION

- Complex 3D rendering logic
- Performance-sensitive
- Test in multiple scenarios

**Common Changes**:

- Material/color adjustments
- New component visualization
- Performance improvements

---

### 10. Scenario Selector (`src/components/ScenarioSelector.tsx`)

**Purpose**: Preset crate configurations

**Dependencies**: None

**Exports**:

- `ScenarioSelector` component
- `ScenarioPreset` interface

**Parallel Work Safety**: [DONE] SAFE

- Simple configuration data
- No complex logic

**Common Changes**:

- Adding new scenarios
- Updating preset values

---

### 11. API Routes (`src/app/api/*/route.ts`)

**Purpose**: Backend API endpoints

**Dependencies**: Varies by route

**Parallel Work Safety**: [DONE] SAFE (between routes)

- Each route is independent
- Can work on different routes simultaneously
- Coordinate if changing shared types

**Routes**:

- `/api/calculate-crate` - Crate calculations
- `/api/cleat-placement` - Cleat positioning
- `/api/nx-export` - NX expression generation
- `/api/plywood-optimization` - Plywood optimization
- `/api/test-dashboard` - Testing metrics
- `/api/last-update` - Project metadata

---

## Parallel Work Matrix

| Module A → Module B                       | Can Work Simultaneously?        |
| ----------------------------------------- | ------------------------------- |
| Different API routes                      | [DONE] Yes                      |
| Different calculators (klimp, cleat, lag) | [DONE] Yes                      |
| Different UI components                   | [DONE] Yes (if no shared state) |
| Calculator + UI component                 | [DONE] Yes                      |
| nx-generator + step-generator             | [WARNING] Coordinate            |
| page.tsx + any component                  | [WARNING] Coordinate            |
| Any module + tests                        | [DONE] Yes                      |
| Any module + docs                         | [DONE] Yes                      |

## Adding New Modules

### Checklist for New Modules

1. **Create in appropriate directory**:
   - Core logic → `src/lib/`
   - UI → `src/components/`
   - API → `src/app/api/`

2. **Define clear interface**:
   - Export TypeScript types
   - Document inputs/outputs
   - No hidden dependencies

3. **Add tests**:
   - Unit tests in `__tests__/` directory
   - Test file naming: `[module-name].test.ts`
   - Cover edge cases

4. **Update documentation**:
   - Add entry to this file (MODULES.md)
   - Update CLAUDE.md if architecturally significant
   - Update PROJECT_STATUS.md

5. **Register dependencies**:
   - Document in this file
   - Update dependency graph if needed

## Module Communication Patterns

### Pattern 1: Direct Import (Preferred)

```typescript
// Good: Direct, type-safe import
import { PlywoodSplicer } from "./plywood-splicing";
const splicer = new PlywoodSplicer(config);
```

### Pattern 2: Dependency Injection

```typescript
// Good for testing, flexibility
class NXGenerator {
  constructor(
    private config: CrateConfig,
    private splicer: PlywoodSplicer = new PlywoodSplicer(),
  ) {}
}
```

### Pattern 3: Props (React Components)

```typescript
// Good: Clear data flow
interface Props {
  boxes: NXBox[];
  generator: NXGenerator;
}

export function CrateVisualizer({ boxes, generator }: Props) {
  // ...
}
```

### [X] Avoid: Shared Mutable State

```typescript
// Bad: Global state, hard to test
let globalConfig: CrateConfig;
export function updateConfig(config: CrateConfig) {
  globalConfig = config; // AVOID THIS
}
```

## Module Ownership (Optional)

If working with a team, you can assign module ownership:

| Module              | Primary Owner | Backup |
| ------------------- | ------------- | ------ |
| nx-generator.ts     | TBD           | TBD    |
| step-generator.ts   | TBD           | TBD    |
| plywood-splicing.ts | TBD           | TBD    |
| CrateVisualizer.tsx | TBD           | TBD    |

Owners are responsible for:

- Reviewing changes to their modules
- Maintaining documentation
- Ensuring test coverage
- Breaking ties on design decisions

## Conflict Resolution

If two workers modify the same module:

1. **Communicate**: Discuss in PROJECT_STATUS.md or version control
2. **Branch**: Work in separate git branches
3. **Merge early, merge often**: Don't let branches diverge
4. **Tests**: Ensure tests pass before merging
5. **Review**: Code review for conflicting changes

## Module Health Metrics

Track these metrics per module:

- **Test Coverage**: Aim for >80% on core modules
- **Complexity**: Keep functions small and focused
- **Dependencies**: Minimize coupling
- **Last Modified**: Track in PROJECT_STATUS.md
- **Open Issues**: Track bugs/improvements
