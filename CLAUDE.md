# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoCrate Codex is a Next.js 14 application for designing shipping crates with 3D visualization and NX CAD expression generation. It uses a "Two Diagonal Points" construction method for parametric crate modeling with real-time 3D preview.

## 🤖 For LLMs: Quick Start Workflow

**IMPORTANT**: Before making ANY code changes, read these files:

1. **`.claude/workflows/MAKING_CHANGES.md`** - Step-by-step workflow for every commit
2. **`.claude/workflows/VERSION_BUMPING.md`** - When and how to bump versions
3. **`.claude/version-config.json`** - Current version and versioning rules
4. **`.claude/project-status.json`** - Current project state and known issues

### Every Commit Must:

1. Bump version (`npm run version:patch` / `minor` / `major`)
2. Sync version (`npm run version:sync`)
3. Update `CHANGELOG.md`
4. Include version in commit message

### Version Format: `OVERALL.CURRENT.CHANGE`

- **Current version**: 13.1.0
- Bug fix → `version:patch` (13.1.0 → 13.1.1)
- New feature → `version:minor` (13.1.0 → 13.2.0)
- Breaking change → `version:major` (13.1.0 → 14.0.0)

### Quick Rollback

If deployment breaks: See `.claude/workflows/REVERTING.md`

```bash
git revert HEAD
git push origin main
```

## Essential Commands

### Version Management

```bash
npm run version:patch    # Bug fix: 13.1.0 → 13.1.1
npm run version:minor    # Feature: 13.1.0 → 13.2.0
npm run version:major    # Breaking: 13.1.0 → 14.0.0
npm run version:sync     # Sync version across all files
```

### Development

```bash
npm run dev              # Start development server on http://localhost:3000
npm run build            # Production build
npm run start            # Start production server
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

### Code Quality

```bash
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

### API Testing (Keploy)

```bash
npm run keploy:record    # Record API test cases with Keploy
npm run keploy:test      # Replay recorded API test cases
```

## Architecture Overview

### Core Design Pattern: Two-Point Diagonal Construction

The entire application revolves around defining crates using two diagonal corner points:

- **Point 1**: Origin (0,0,0)
- **Point 2**: (Width, Length, Height)

This minimalist approach simplifies both the CAD generation and 3D visualization logic.

### State Management Architecture

State management uses React hooks and component-level state:

- **Crate Configuration**: Dimensional and material parameters managed in page.tsx
- **Component Visibility**: Toggle states for skids, floorboards, panels, and individual plywood pieces
- **Scenario Selection**: Predefined crate configurations for common use cases

Key pattern: Debounced input handling (500ms) for real-time updates without performance issues.

### 3D Rendering Pipeline

1. **CrateVisualizer.tsx**: Main 3D component using React Three Fiber
2. Real-time mesh generation based on configuration changes
3. Component visibility filtering for performance
4. Color-coded materials (lumber types, plywood, foam)

### NX CAD Expression Generation

The `nx-generator.ts` implements a sophisticated parametric model:

- Generates NX expressions for parametric modeling
- Handles all lumber sizes (2x4, 2x6, 2x8)
- Automatic skid sizing based on weight requirements
- Coordinate system: X=width, Y=length, Z=height

### STEP File Export Architecture

The `step-generator.ts` provides ISO 10303-21 compliant export:

- Converts inch-based dimensions to millimeters
- Generates complete assembly structure
- Handles complex B-Rep geometry definitions
- Supports both AP203 and AP214 formats

### Hardware Systems

#### Klimp Fastener System

Located in `klimp-calculator.ts` and `klimp-step-integration.ts`:

- **L-shaped fasteners** that secure front panel to adjacent panels
- Strategic placement algorithm using 18"-24" spacing rules
- Corner klimps for reinforcement at top corners
- Side klimps symmetrically placed on left/right edges
- Automatic avoidance of cleat interference zones
- 3D visualization with `KlimpModel.tsx` component
- Integration with STEP export for CAD assembly

#### Lag Screw Integration

Located in `lag-step-integration.ts`:

- **3/8" x 3.00" lag hardware** for panel-to-frame attachment
- References external STEP file: `/CAD FILES/LAG SCREW_0.38 X 3.00.stp`
- Provides standardized geometry metadata (shank diameter, head dimensions)
- NX import instructions for consistent hardware placement
- Positioned across side, front, and back panels
- Coordinated with klimp placement to avoid conflicts

### API Routes Architecture

The application includes several API routes for backend processing:

- **`/api/calculate-crate`**: Crate calculations and BOM generation
- **`/api/cleat-placement`**: Cleat positioning algorithms
- **`/api/last-update`**: Project update banner information
- **`/api/nx-export`**: NX expression file generation
- **`/api/plywood-optimization`**: Plywood splicing calculations
- **`/api/test-dashboard`**: Testing dashboard and metrics

Each API route includes comprehensive unit tests (`.test.ts` files).

## Critical Implementation Details

### Plywood Optimization Algorithm

Located in `plywood-splicing.ts`, uses a sophisticated algorithm to:

- Optimize panel layouts on 48x96 inch sheets
- Handle both top/bottom and side panels
- Minimize waste through intelligent splicing
- Calculate exact piece dimensions with lumber overlaps

### Component Hierarchy

```
Main Application (page.tsx)
├── ThemeProvider & ThemeToggle
│   └── Dark/light mode switching
├── ScenarioSelector
│   └── Predefined crate configurations
├── Configuration Panel
│   ├── Dimension inputs with debouncing
│   ├── Material selectors
│   ├── Component visibility toggles
│   └── Export controls
├── 3D Visualization (CrateVisualizer)
│   ├── Frame components (skids, floorboards)
│   ├── Panel components (with plywood splicing)
│   ├── Hardware components (klimps via KlimpModel)
│   └── Interactive controls (OrbitControls)
├── PlywoodPieceSelector
│   └── Individual plywood piece toggles
├── LumberCutList
│   └── Material cutting requirements
├── MarkingsSection & MarkingVisualizer
│   └── Panel marking instructions
├── PlywoodSpliceVisualization
│   └── 2D plywood layout visualization
└── Output Section
    ├── NX Expressions
    ├── STEP File Export
    ├── Instructions
    └── BOM/Cut Lists
```

### Error Handling Strategy

- Global ErrorBoundary wraps entire application
- Specialized VisualizationErrorBoundary for 3D components
- Comprehensive try-catch in STEP generation
- Type-safe error propagation through Result types

## Testing Strategy

### Testing Infrastructure

The project includes comprehensive testing across multiple layers:

1. **Unit Tests (Jest)**
   - STEP file generation accuracy
   - Plywood optimization algorithms
   - Cleat positioning calculations
   - Klimp placement algorithms
   - Lag screw integration
   - NX expression generation
   - API route handlers

2. **E2E Tests (Playwright)**
   - Full user workflows
   - File download verification
   - 3D visualization interaction
   - STEP file generation validation

3. **API Tests (Keploy)**
   - Record/replay API test cases
   - Docker-based testing environment
   - Automatic test case generation

4. **Pre-commit Validation (Husky)**
   - TypeScript type checking on changed files
   - Jest tests for related files
   - Prettier formatting for JSON/MD/YAML
   - ESLint validation

### Unit Testing Focus Areas

- STEP file generation accuracy (comprehensive test suite in `__tests__/step-generator.test.ts`)
- Plywood optimization algorithms (`__tests__/plywood-splicing.test.ts`)
- Cleat positioning calculations (`__tests__/cleat-calculator.test.ts`)
- Klimp calculator logic (`__tests__/klimp-calculator.test.ts`)
- STEP integration tests (`__tests__/step-integration.test.ts`, `__tests__/klimp-step-integration.test.ts`)
- NX expression generation (`__tests__/nx-generator.test.ts`)
- Component rendering (component `__tests__` directories)

### Running Specific Tests

```bash
npm test -- --testNamePattern="should generate valid STEP header"
npm test:coverage                    # Generate coverage report
npm test -- step-generator.test.ts   # Run specific test file
npm test:e2e                         # Run Playwright E2E tests
npm test:e2e:ui                      # Interactive Playwright UI
npm run test:all                     # Run complete test suite
```

### Test File Organization

- `src/lib/__tests__/` - Core library unit tests
- `src/components/__tests__/` - Component unit tests
- `src/app/api/*/route.test.ts` - API route tests
- `tests/e2e/` - Playwright E2E tests
- `tests/` - Additional test utilities

## Performance Considerations

### Debouncing Pattern

All dimension inputs use 500ms debouncing with immediate blur handling to prevent excessive re-renders while maintaining responsiveness.

### 3D Optimization

- Component visibility filtering reduces mesh count
- Efficient state updates minimize re-renders
- OrbitControls with reasonable limits

## Deployment Notes

The application is configured for Vercel deployment with:

- Next.js 14 App Router optimization
- Static page generation where possible
- Proper environment variable handling
- Optimized production builds

## Key Files to Understand

### Core Libraries (src/lib/)

1. **nx-generator.ts**: Core CAD expression logic - two-point construction method
2. **step-generator.ts**: STEP file format implementation (ISO 10303-21)
3. **plywood-splicing.ts**: Optimization algorithms for 48x96" sheet layouts
4. **klimp-calculator.ts**: L-shaped fastener placement algorithm with 18"-24" spacing
5. **klimp-step-integration.ts**: Klimp hardware STEP export integration
6. **lag-step-integration.ts**: Lag screw hardware integration and metadata
7. **cleat-calculator.ts**: Cleat positioning calculations

### Main Components (src/components/)

8. **CrateVisualizer.tsx**: 3D rendering with React Three Fiber
9. **KlimpModel.tsx**: 3D klimp hardware visualization
10. **ScenarioSelector.tsx**: Predefined crate configuration selection
11. **MarkingsSection.tsx & MarkingVisualizer.tsx**: Panel marking visualization
12. **LumberCutList.tsx**: Material cutting requirements display
13. **PlywoodPieceSelector.tsx**: Individual plywood piece toggles
14. **PlywoodSpliceVisualization.tsx**: 2D plywood layout diagrams
15. **ThemeProvider.tsx & ThemeToggle.tsx**: Dark/light mode theming

### Application & API

16. **src/app/page.tsx**: Main application logic and state coordination
17. **src/app/api/\*/route.ts**: API endpoints for calculations and exports

### Configuration & Documentation

18. **CLAUDE.md**: This file - development guidance
19. **TESTING.md**: Comprehensive testing documentation
20. **CHANGELOG.md**: Version history and feature additions
21. **AGENTS.md**: Contributor guide and workflow documentation

## Common Development Tasks

### Adding New Lumber Sizes

1. Update types in lumber configuration
2. Modify `nx-generator.ts` to handle new dimensions
3. Update 3D visualization in `CrateVisualizer.tsx`
4. Update `LumberCutList.tsx` for display
5. Add corresponding tests

### Modifying 3D Visualization

1. Edit `CrateVisualizer.tsx` for component changes
2. Adjust material definitions for appearance
3. Update visibility controls if adding new components
4. Test with different scenarios using `ScenarioSelector`

### Enhancing STEP Export

1. Modify `step-generator.ts` for new geometry types
2. Ensure ISO 10303-21 compliance
3. Add comprehensive tests in `__tests__/step-generator.test.ts`
4. Update Playwright E2E tests for file downloads

### Adding New Hardware Types

1. Create calculator in `src/lib/` (e.g., `new-hardware-calculator.ts`)
2. Implement placement algorithm with spacing rules
3. Add STEP integration file for CAD import
4. Create 3D component in `src/components/` for visualization
5. Add unit tests in `src/lib/__tests__/`
6. Update STEP generator to include new hardware

### Creating New API Endpoints

1. Add route in `src/app/api/[endpoint-name]/route.ts`
2. Implement GET/POST handlers with TypeScript types
3. Add unit tests in `route.test.ts` alongside the route
4. Update API documentation in this file
5. Consider Keploy test recording for integration testing

### Modifying Plywood Splicing

1. Update algorithm in `plywood-splicing.ts`
2. Adjust visualization in `PlywoodSpliceVisualization.tsx`
3. Update tests in `__tests__/plywood-splicing.test.ts`
4. Verify changes in 3D view with `PlywoodPieceSelector`

### Adding New Scenarios

1. Edit `ScenarioSelector.tsx` to add new configuration
2. Define dimensions, weight, and material specifications
3. Test scenario loads properly in main application
4. Update documentation with new scenario use case

## Type System Guidelines

The project uses strict TypeScript with:

- No implicit any
- Strict null checks
- Comprehensive interface definitions
- Type-safe state management

Always maintain type safety when making changes.

## Development Workflow

### Pre-commit Hooks (Husky)

The project uses Husky with lint-staged for automated pre-commit validation:

- **TypeScript validation**: Runs `tsc` on changed `.ts/.tsx` files
- **Related tests**: Runs Jest on files related to your changes
- **Formatting**: Runs Prettier on `.json/.md/.yml/.yaml` files
- **Linting**: ESLint validation

Configuration in `.husky/` directory and `lint-staged` section of `package.json`.

### Code Formatting

Uses Prettier for consistent code formatting:

- JSON, Markdown, YAML files automatically formatted on commit
- Configuration in standard Prettier config files

### Continuous Testing

- Jest runs in watch mode during development: `npm test:watch`
- Playwright UI for interactive E2E debugging: `npm test:e2e:ui`
- Coverage tracking: `npm test:coverage`
- Full suite before major commits: `npm run test:all`

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

### API Testing

- **Keploy** - Docker-based API test recording/replay

## Documentation Resources

- **CLAUDE.md** (this file) - Development guidance for AI assistants
- **TESTING.md** - Comprehensive testing strategies and commands
- **CHANGELOG.md** - Detailed version history and feature tracking
- **AGENTS.md** - Contributor workflow and deployment guide
- **README.md** - User-facing project documentation
- **docs/** - Additional technical documentation
  - **STEP_TO_WEB_CONVERSION.md** - Guide for CAD to web conversions
  - **web-stack-overview.html** - Interactive web technology primer
