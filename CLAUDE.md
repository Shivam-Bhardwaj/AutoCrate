# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoCrate Codex is a Next.js 14 application for designing shipping crates with 3D visualization and NX CAD expression generation. It uses a "Two Diagonal Points" construction method for parametric crate modeling with real-time 3D preview and STEP file export.

## Development Environment

This project is part of an Antimony Workspace with Docker-based development:

```bash
# From workspace root
cd projects/AutoCrate/container
docker compose up --build

# Access at http://localhost:3000
```

For local development without Docker:

```bash
npm install
npm run dev
```

## Issue-Driven Development Workflow

This project follows an **issue-first workflow** optimized for returning to development after any amount of time with minimal setup.

### Quick Start (Returning to Project)

```bash
# 1. Navigate to project
cd /home/curious/AutoCrate  # or your AutoCrate location

# 2. Get latest changes
git pull origin main

# 3. See open issues
gh issue list

# 4. Pick an issue and tell Claude Code
# Example: "work on issue 49"
```

**That's it!** No npm install, no docker setup needed for code changes.

### What Happens When You Say "Work on Issue X"

Claude Code will automatically:

1. [DONE] Fetch issue details from GitHub (`gh issue view X`)
2. [DONE] Create feature branch (`feature/issue-X-description`)
3. [DONE] Implement the changes with tests
4. [DONE] Run full test suite to verify
5. [DONE] Commit with proper messages
6. [DONE] Push to remote branch
7. [DONE] Create PR that references and closes the issue
8. [DONE] All ready for your review

### You Review and Merge

**Via GitHub Web UI:**

- Review the auto-generated PR
- Check test results in PR checks
- Merge when satisfied
- Issue closes automatically

**Via CLI:**

```bash
gh pr view X              # Review changes
gh pr review X --approve  # Approve
gh pr merge X             # Merge and close issue
```

### Best Practices for Issues

**When creating issues:**

- [DONE] Clear title describing the feature/bug
- [DONE] Acceptance criteria in description
- [DONE] Label appropriately (bug, feature, enhancement)
- [DONE] Reference related issues if applicable

**Example good issue:**

```
Title: Add centered AUTOCRATE text to all panels

Description:
Need "AUTOCRATE" text displayed in the center of all crate panels.

Acceptance Criteria:
- Text should be centered on front, back, left, right panels
- Size should scale based on crate dimensions
- Should be included in 3D visualization
- Must appear in STEP export
```

### Workflow Benefits

- **Zero context switching** - Issues describe what to do
- **Minimal setup** - Just git pull and pick an issue
- **Automatic documentation** - PRs link to issues
- **Clean history** - Each issue = one branch = one PR
- **Reproducible** - Works the same way every time

## Essential Commands

### Development

```bash
npm run dev              # Start development server on http://localhost:3000
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

### Testing

```bash
npm test                 # Run all Jest unit tests
npm test:watch           # Run tests in watch mode
npm test:coverage        # Generate test coverage report
npm test:e2e             # Run Playwright E2E tests
npm test:e2e:ui          # Run Playwright tests with UI
npm test:e2e:debug       # Debug Playwright tests
npm run test:all         # Run complete test suite (unit + E2E)
npm run test:all:e2e     # Run complete test suite with E2E focus
```

### Running Specific Tests

```bash
npm test -- --testNamePattern="should generate valid STEP header"
npm test -- step-generator.test.ts   # Run specific test file
```

### Version Management

```bash
npm run version:patch    # Bug fix: 13.1.0 → 13.1.1
npm run version:minor    # Feature: 13.1.0 → 13.2.0
npm run version:major    # Breaking: 13.1.0 → 14.0.0
npm run version:sync     # Sync version across all files
```

## Architecture Overview

### Core Design Pattern: Two-Point Diagonal Construction

The entire application revolves around defining crates using two diagonal corner points:

- **Point 1**: Origin (0,0,0)
- **Point 2**: (Width, Length, Height)

This minimalist approach simplifies both the CAD generation and 3D visualization logic.

### Key Architectural Components

**State Management**

- React hooks and component-level state
- Dimensional and material parameters managed in `src/app/page.tsx`
- Component visibility toggles for skids, floorboards, panels, and individual plywood pieces
- 500ms debounced input handling for real-time updates without performance issues

**3D Rendering Pipeline**

1. `CrateVisualizer.tsx` - Main 3D component using React Three Fiber
2. Real-time mesh generation based on configuration changes
3. Component visibility filtering for performance
4. Color-coded materials (lumber types, plywood, foam)

**NX CAD Expression Generation** (`nx-generator.ts`)

- Generates NX expressions for parametric modeling
- Handles all lumber sizes (2x4, 2x6, 2x8, 2x10, 2x12, 3x3, 4x4, 4x6, 6x6, 8x8)
- Automatic skid sizing based on weight requirements
- Coordinate system: X=width, Y=length, Z=height

**STEP File Export** (`step-generator.ts`)

- ISO 10303-21 AP242 compliant export
- Converts inch-based dimensions to millimeters
- Complete assembly structure with hierarchical organization:
  - SHIPPING_BASE → SKID_ASSEMBLY, FLOORBOARD_ASSEMBLY
  - CRATE_CAP → Panel assemblies (FRONT, BACK, LEFT, RIGHT, TOP)
  - KLIMP_FASTENERS → Hardware components
  - STENCILS → Marking decals
- Handles complex B-Rep geometry definitions
- Includes PMI (Product Manufacturing Information) metadata

**Hardware Systems**

_Klimp Fastener System_ (`klimp-calculator.ts`, `klimp-step-integration.ts`)

- L-shaped fasteners securing front panel to adjacent panels
- Strategic placement algorithm using 18"-24" spacing rules
- Corner klimps for reinforcement at top corners
- Side klimps symmetrically placed on left/right edges
- Automatic avoidance of cleat interference zones
- 3D visualization with `KlimpModel.tsx` component
- Integration with STEP export for CAD assembly

_Lag Screw Integration_ (`lag-step-integration.ts`)

- 3/8" x 3.00" lag hardware for panel-to-frame attachment
- References external STEP file: `/CAD FILES/LAG SCREW_0.38 X 3.00.stp`
- Provides standardized geometry metadata (shank diameter, head dimensions)
- NX import instructions for consistent hardware placement
- Positioned across side, front, and back panels
- Coordinated with klimp placement to avoid conflicts

**Plywood Optimization Algorithm** (`plywood-splicing.ts`)

- Optimize panel layouts on 48x96 inch sheets
- Handle both top/bottom and side panels
- Minimize waste through intelligent splicing
- Calculate exact piece dimensions with lumber overlaps

### API Routes

The application includes several Next.js API routes for backend processing:

- `/api/calculate-crate` - Crate calculations and BOM generation
- `/api/cleat-placement` - Cleat positioning algorithms
- `/api/last-update` - Project update banner information
- `/api/nx-export` - NX expression file generation
- `/api/plywood-optimization` - Plywood splicing calculations
- `/api/test-dashboard` - Testing dashboard and metrics

Each API route includes comprehensive unit tests (`.test.ts` files).

## File Structure

```
src/
├── app/                          # Next.js app router
│   ├── page.tsx                  # Main application interface
│   ├── layout.tsx                # Root layout with error boundaries
│   ├── console/page.tsx          # Developer console
│   ├── docs/page.tsx             # Documentation page
│   ├── terminal/page.tsx         # Terminal interface
│   └── api/                      # API routes
│       ├── calculate-crate/
│       ├── cleat-placement/
│       ├── last-update/
│       ├── nx-export/
│       ├── plywood-optimization/
│       └── test-dashboard/
├── lib/                          # Core business logic
│   ├── nx-generator.ts           # NX expression generation (two-point construction)
│   ├── step-generator.ts         # STEP file generation (ISO 10303-21 AP242)
│   ├── plywood-splicing.ts       # Plywood optimization algorithm
│   ├── klimp-calculator.ts       # Klimp fastener placement
│   ├── klimp-step-integration.ts # Klimp STEP export
│   ├── lag-step-integration.ts   # Lag screw integration
│   ├── cleat-calculator.ts       # Cleat positioning
│   └── __tests__/                # Unit tests for lib
└── components/                   # React components
    ├── CrateVisualizer.tsx       # 3D rendering (React Three Fiber)
    ├── KlimpModel.tsx            # 3D klimp hardware visualization
    ├── ScenarioSelector.tsx      # Predefined crate configurations
    ├── MarkingsSection.tsx       # Marking configuration
    ├── MarkingVisualizer.tsx     # Panel marking visualization
    ├── LumberCutList.tsx         # Material cutting requirements
    ├── PlywoodPieceSelector.tsx  # Individual plywood piece toggles
    ├── PlywoodSpliceVisualization.tsx # 2D plywood layout
    ├── ThemeProvider.tsx         # Dark/light mode theming
    ├── ThemeToggle.tsx           # Theme toggle button
    ├── ErrorBoundary.tsx         # Error boundary components
    └── __tests__/                # Component unit tests
```

## Testing Strategy

### Testing Infrastructure

1. **Unit Tests (Jest + React Testing Library)**
   - STEP file generation accuracy
   - Plywood optimization algorithms
   - Cleat positioning calculations
   - Klimp placement algorithms
   - Lag screw integration
   - NX expression generation
   - API route handlers
   - Component rendering

2. **E2E Tests (Playwright)**
   - Full user workflows
   - File download verification
   - 3D visualization interaction
   - STEP file generation validation

3. **Pre-commit Validation (Husky + lint-staged)**
   - TypeScript type checking on changed files
   - Jest tests for related files
   - Prettier formatting for JSON/MD/YAML
   - ESLint validation

### Test File Organization

- `src/lib/__tests__/` - Core library unit tests
- `src/components/__tests__/` - Component unit tests
- `src/app/api/*/route.test.ts` - API route tests
- `tests/e2e/` - Playwright E2E tests
- `tests/` - Additional test utilities

See `TESTING.md` for comprehensive testing documentation.

## Common Development Tasks

### Adding New Lumber Sizes

1. Update types in lumber configuration (`nx-generator.ts`)
2. Modify skid/floorboard selection logic
3. Update 3D visualization in `CrateVisualizer.tsx`
4. Update `LumberCutList.tsx` for display
5. Add corresponding tests

### Modifying 3D Visualization

1. Edit `CrateVisualizer.tsx` for component changes
2. Adjust material definitions for appearance (color, opacity)
3. Update visibility controls if adding new components
4. Test with different scenarios using `ScenarioSelector`

### Enhancing STEP Export

1. Modify `step-generator.ts` for new geometry types
2. Ensure ISO 10303-21 AP242 compliance
3. Add comprehensive tests in `src/lib/__tests__/step-generator.test.ts`
4. Update Playwright E2E tests for file downloads in `tests/e2e/`

### Adding New Hardware Types

1. Create calculator in `src/lib/` (e.g., `new-hardware-calculator.ts`)
2. Implement placement algorithm with spacing rules
3. Add STEP integration file for CAD import (e.g., `new-hardware-step-integration.ts`)
4. Create 3D component in `src/components/` for visualization
5. Add unit tests in `src/lib/__tests__/`
6. Update STEP generator to include new hardware in assembly structure

### Creating New API Endpoints

1. Add route in `src/app/api/[endpoint-name]/route.ts`
2. Implement GET/POST handlers with TypeScript types
3. Add comprehensive unit tests in `route.test.ts` alongside the route
4. Add E2E tests in Playwright if user-facing
5. Update API documentation in this file

### Modifying Plywood Splicing

1. Update algorithm in `plywood-splicing.ts`
2. Adjust visualization in `PlywoodSpliceVisualization.tsx`
3. Update tests in `src/lib/__tests__/plywood-splicing.test.ts`
4. Verify changes in 3D view with `PlywoodPieceSelector`

### Adding New Scenarios

1. Edit `ScenarioSelector.tsx` to add new configuration to `SCENARIO_PRESETS`
2. Define dimensions, weight, material specifications, and lumber size restrictions
3. Test scenario loads properly in main application
4. Update documentation with new scenario use case

## Type System Guidelines

The project uses strict TypeScript with:

- No implicit any
- Strict null checks
- Comprehensive interface definitions
- Type-safe state management

Key type definitions are in `nx-generator.ts`:

- `CrateConfig` - Main configuration interface
- `ProductDimensions` - Product dimensional specs
- `NXBox` - Box primitive for 3D geometry
- `BillOfMaterialsRow` - BOM structure
- `LumberCutItem` - Cut list items

Always maintain type safety when making changes.

## Development Workflow

### Pre-commit Hooks (Husky)

The project uses Husky with lint-staged for automated pre-commit validation:

- **TypeScript validation**: Runs `tsc` on changed `.ts/.tsx` files
- **Related tests**: Runs Jest on files related to your changes
- **Formatting**: Runs Prettier on `.json/.md/.yml/.yaml` files
- **Linting**: ESLint validation

Configuration in `.husky/` directory and `lint-staged` section of `package.json`.

### Error Handling Strategy

- Global `ErrorBoundary` wraps entire application (`src/app/layout.tsx`)
- Specialized `VisualizationErrorBoundary` for 3D components
- Comprehensive try-catch in STEP generation
- Type-safe error propagation through Result types

### Performance Optimization

**Debouncing Pattern**

- All dimension inputs use 500ms debouncing
- Immediate blur handling prevents excessive re-renders
- Maintains responsiveness while reducing computation

**3D Optimization**

- Component visibility filtering reduces mesh count
- Efficient state updates minimize re-renders
- OrbitControls with reasonable limits
- Memoization for expensive calculations

## Deployment Notes

The application is configured for multiple deployment targets:

**Development (Docker)**

```bash
cd projects/AutoCrate/container
docker compose up --build
```

**Production Build**

```bash
npm run build
npm run start
```

**Vercel Deployment**

- Next.js 14 App Router optimization
- Static page generation where possible
- Proper environment variable handling
- Optimized production builds
- Configuration in `vercel.json`

## Project Dependencies

### Core Framework

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript 5** - Type safety

### 3D Visualization

- **Three.js 0.160** - 3D graphics library
- **@react-three/fiber 8.15** - React renderer for Three.js
- **@react-three/drei 9.92** - Useful helpers for R3F

### State & Styling

- **Tailwind CSS 3** - Utility-first CSS
- **PostCSS & Autoprefixer** - CSS processing
- **Zustand 4** - State management

### Testing

- **Jest 30** - Unit testing framework
- **@testing-library/react 16** - React component testing
- **Playwright 1.55** - E2E testing
- **ts-jest 29** - TypeScript support for Jest

### Development Tools

- **Husky 9** - Git hooks
- **lint-staged 16** - Run linters on staged files
- **Prettier 3** - Code formatting
- **ESLint 8** - JavaScript/TypeScript linting
- **TypeScript ESLint 7** - TypeScript-specific linting rules

## Documentation Resources

- **CLAUDE.md** (this file) - Development guidance for AI assistants
- **PROJECT_STATUS.md** - Real-time project status, active work tracking, module health
- **MODULES.md** - Module architecture, boundaries, and parallel work safety
- **WORK_LOG.md** - Detailed work history and session tracking
- **README.md** - User-facing project documentation
- **TESTING.md** - Comprehensive testing strategies and commands
- **AGENTS.md** - Repository guidelines and workflow documentation
- **CHANGELOG.md** - Detailed version history and feature tracking
- **docs/** - Additional technical documentation
  - **STEP_TO_WEB_CONVERSION.md** - Guide for CAD to web conversions
  - **web-stack-overview.html** - Interactive web technology primer

## Project Memory System

For LLMs working on this project:

1. **Before starting work**:
   - Read PROJECT_STATUS.md to see active work streams
   - Check MODULES.md to understand module boundaries
   - Review WORK_LOG.md for recent changes

2. **While working**:
   - Update PROJECT_STATUS.md if claiming a module
   - Follow parallel work guidelines in MODULES.md
   - Make atomic commits with clear messages

3. **After completing work**:
   - Add entry to WORK_LOG.md
   - Update PROJECT_STATUS.md (move to completed)
   - Update CHANGELOG.md if user-facing
   - Bump version if appropriate

This system enables multiple AI agents to work on different parts of the codebase simultaneously without conflicts.

## Critical Implementation Notes

### Coordinate System

- **Origin**: (0, 0, 0) at the center of crate floor level
- **X-axis**: Width (left/right)
- **Y-axis**: Length (front/back)
- **Z-axis**: Height (vertical)
- **Symmetry**: Crate is symmetric about Z-Y plane (X=0)

### STEP File Assembly Hierarchy

```
AUTOCRATE CRATE ASSEMBLY
├── SHIPPING_BASE
│   ├── SKID_ASSEMBLY
│   │   └── Individual skid instances
│   └── FLOORBOARD_ASSEMBLY
│       └── Floorboard instances
├── CRATE_CAP
│   ├── FRONT_PANEL_ASSEMBLY
│   ├── BACK_PANEL_ASSEMBLY
│   ├── LEFT_PANEL_ASSEMBLY
│   ├── RIGHT_PANEL_ASSEMBLY
│   └── TOP_PANEL_ASSEMBLY
├── KLIMP_FASTENERS
│   └── Klimp instances
└── STENCILS
    └── Marking decals
```

### Component Naming Conventions

In STEP files, components are named using snake_case with nominal dimensions:

- Skids: `skid_HxW` (e.g., `skid_4x4`, `skid_6x6`)
- Floorboards: `floorboard_HxW` (e.g., `floorboard_2x6`)
- Plywood: `PANELNAME_ply` (e.g., `front_panel_ply`)
- Cleats: `PANELNAME_cleat` (e.g., `front_panel_cleat`)

### Version Management Guidelines

**Current version**: See package.json (single source of truth)

Version format: `OVERALL.CURRENT.CHANGE`

- Bug fix → `npm run version:patch` or `./scripts/deploy.sh patch`
- New feature → `npm run version:minor` or `./scripts/deploy.sh minor`
- Breaking change → `npm run version:major` or `./scripts/deploy.sh major`

Always run `npm run version:sync` after version changes to update all version references.
