# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoCrate is a parametric shipping crate design tool that generates:
- **3D Visualizations** using Three.js/React Three Fiber
- **NX CAD Expressions** for parametric CAD import (.exp files)
- **STEP Files** (ISO 10303-21 AP242) with BREP solids and PMI
- **Bill of Materials** (BOM) with cut lists and hardware

The application takes product dimensions (length, width, height, weight) and generates a complete crate design including structural calculations for skids, floorboards, panels, cleats, klimp fasteners, lag screws, and panel stops.

## Development Commands

### Core Development
```bash
npm run dev              # Start dev server at http://localhost:3000
npm run build            # Production build
npm start                # Run production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking without emitting files
```

### Testing
```bash
npm test                 # Run all unit tests (Jest)
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run Playwright end-to-end tests
npm run test:e2e:ui      # Run Playwright with UI mode
npm run test:e2e:debug   # Run Playwright in debug mode
npm run test:all         # Run unit tests + type check + lint
npm run test:all:e2e     # Run all tests including e2e
```

### Single Test Execution
```bash
# Run a specific unit test file
npm test -- src/lib/__tests__/nx-generator.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="cleat calculator"

# Run a specific e2e test
npm run test:e2e -- tests/e2e/crate-visualization.spec.ts
```

### Version Management & Deployment
```bash
npm run version:patch    # Bump patch version (x.y.Z)
npm run version:minor    # Bump minor version (x.Y.0)
npm run version:major    # Bump major version (X.0.0)
npm run version:sync     # Sync version across files (run after manual edits)

# Deploy to Vercel (runs version bump + deployment)
npm run deploy           # Patch version bump + deploy
npm run deploy:minor     # Minor version bump + deploy
npm run deploy:major     # Major version bump + deploy
# OR use the script directly:
./scripts/deploy.sh patch|minor|major
```

### Security
```bash
npm run security:scan    # Scan for secrets in commits (pre-commit hook)
```

## Architecture

### Coordinate System
- **Origin**: Center of crate at floor level (Z=0)
- **X-axis**: Width (left/right) - crate is symmetric about X=0
- **Y-axis**: Length (front/back) - front panel at negative Y
- **Z-axis**: Height (vertical) - ground at Z=0

### Core Data Flow

1. **Input** → `page.tsx` collects user inputs (dimensions, clearances, markings)
2. **Calculation** → `nx-generator.ts` performs all structural calculations
3. **Output** → Multiple export formats:
   - NX expressions via `nx-generator.ts`
   - STEP files via `step-generator.ts`
   - 3D visualization via `CrateVisualizer.tsx`

### Key Libraries (`src/lib/`)

**Central Configuration:**
- `crate-constants.ts` - Single source of truth for all constants, standards, dimensions
  - Material standards (plywood, lumber)
  - Structural requirements (skids, cleats, fasteners)
  - Geometry standards (clearances, tolerances)
  - Validation rules
  - UI constants

**Core Generators:**
- `nx-generator.ts` - Main calculation engine (90KB+)
  - Generates NX parametric expressions
  - Calculates all component dimensions and positions
  - Produces BOM and cut lists
  - Central coordinator for all structural calculations

- `step-generator.ts` - STEP file export (37KB)
  - ISO 10303-21 AP242 format
  - BREP solid geometry
  - Hierarchical assembly structure (SHIPPING_BASE, CRATE_CAP, etc.)
  - PMI (Product Manufacturing Information)

**Structural Calculators:**
- `cleat-calculator.ts` - Panel reinforcement cleats
  - Perimeter, intermediate, and splice cleats
  - Different rules for front/back vs side panels
  - Maximum 24" spacing between vertical cleats

- `klimp-calculator.ts` - Klimp fastener placement
  - L-shaped fasteners connecting front panel to adjacent panels
  - Corner klimps, edge klimps between cleats
  - 18-24" spacing requirements

- `panel-stop-calculator.ts` - Panel stop positioning
  - Prevents panels from collapsing inward during packing
  - Positioned on front panel sides and top panel front edge

- `plywood-splicing.ts` - Plywood sheet optimization
  - Determines when to rotate panels (48" vs 96" orientation)
  - Calculates splice positions when panels exceed sheet dimensions
  - Minimizes material waste

**Integration:**
- `klimp-step-integration.ts` - Klimp 3D model integration (GLB format)
- `lag-step-integration.ts` - Lag screw STEP file integration
- `input-validation.ts` - User input validation with detailed error messages
- `rate-limiter.ts` - API rate limiting (Edge Runtime compatible)

### Component Structure (`src/components/`)

**3D Visualization:**
- `CrateVisualizer.tsx` - Main Three.js visualization component
- `KlimpModel.tsx` - Klimp fastener 3D models
- `MarkingVisualizer.tsx` - Stencils and markings visualization
- `ErrorBoundary.tsx` - Error handling for visualization

**UI Components:**
- `PlywoodPieceSelector.tsx` - Plywood sheet selection interface
- `PlywoodSpliceVisualization.tsx` - Visual splice representation
- `LumberCutList.tsx` - Cut list display
- `MarkingsSection.tsx` - Markings configuration interface
- `ScenarioSelector.tsx` - Pre-configured test scenarios
- `ThemeToggle.tsx` / `ThemeProvider.tsx` - Dark/light mode
- `ChangeTracker.tsx` - Track changes with GitHub issue linking
- `VisualChecklist.tsx` - Development workflow checklist

### API Routes (`src/app/api/`)

All API routes are Edge Runtime compatible:
- `calculate-crate/route.ts` - Main crate calculation endpoint
- `nx-export/route.ts` - NX expression file generation
- `plywood-optimization/route.ts` - Plywood layout optimization
- `cleat-placement/route.ts` - Cleat calculation API
- `auth/login/route.ts`, `auth/logout/route.ts`, `auth/verify/route.ts` - Authentication
- `last-update/route.ts` - Version information
- `test-dashboard/route.ts` - Test results dashboard

### Test Structure

**Unit Tests:**
- Located in `__tests__/` subdirectories next to source files
- Run with Jest in jsdom environment
- Coverage configured but thresholds set to 0 (no enforcement)

**E2E Tests:**
- Located in `tests/e2e/`
- Run with Playwright
- Test user workflows and visual rendering

### Version Management

**IMPORTANT**: Version number is **ONLY** stored in `package.json`. Never hardcode version elsewhere.

- Frontend: Use `/api/last-update` endpoint
- Backend: Use `require('./package.json').version`
- After manual package.json edits: Run `npm run version:sync`

### Custom Slash Commands

AutoCrate includes 12+ custom slash commands in `.claude/commands/`:
- `/test` - Run complete test suite
- `/build` - Production build verification
- `/deploy` - Version bump and deploy
- `/verify` - Full health check
- `/feature` - Add new feature workflow
- `/quick-fix` - Rapid bug fix workflow
- `/step` - Work with STEP files
- `/nx` - Work with NX expressions
- `/3d` - Work with 3D visualization
- `/lumber` - Modify lumber sizes
- `/hardware` - Add/modify hardware
- `/scenario` - Add/modify test scenarios

See `.claude/commands/*.md` for details on each command.

## Important Patterns & Conventions

### Constants Management
- **ALL** hardcoded values must be in `crate-constants.ts`
- Import constants rather than using magic numbers
- Use exported utility functions for common calculations
- Constants organized by category with clear JSDoc comments

### Assembly Hierarchy (STEP Export)
The STEP generator creates a 4-level assembly structure:
1. **Root**: AUTOCRATE CRATE ASSEMBLY
2. **Top-level assemblies**: SHIPPING_BASE, CRATE_CAP, KLIMP_FASTENERS, STENCILS
3. **Sub-assemblies**: SKID_ASSEMBLY, FLOORBOARD_ASSEMBLY, panel assemblies
4. **Parts**: Individual components with geometry

Parts are grouped by geometry - identical components share one definition with multiple placements.

### Structural Calculation Order
When modifying calculations in `nx-generator.ts`:
1. Base dimensions (skids, floorboard, ground clearance)
2. Panel dimensions (calculate all 5 panels)
3. Plywood layout and splicing
4. Cleat placement (uses splice data)
5. Klimp placement (uses cleat data)
6. Panel stops (uses cleat data)
7. Lag screws (front panel attachment)
8. Markings and stencils

### Edge Runtime Compatibility
Middleware and API routes must be Edge Runtime compatible:
- No Node.js-specific APIs (fs, path, crypto.subtle exceptions)
- Use Web Crypto API instead of Node crypto
- Keep dependencies minimal
- Test with `next build` to verify

### Lint-Staged Pre-commit Hooks
Pre-commit runs on staged files:
- TypeScript type checking via `scripts/run-tsc.js`
- Jest tests for related files (with `--findRelatedTests`)
- Prettier for JSON/MD/YAML files

## Common Development Tasks

### Adding a New Lumber Size
1. Add to `LUMBER_DIMENSIONS` in `crate-constants.ts`
2. Update `LUMBER_CATEGORIES` if it's for a specific use (skid, floorboard, cleat)
3. Update UI if the size should appear in selectors
4. Add tests for new size calculations

### Modifying Structural Calculations
1. Check if constant should be in `crate-constants.ts`
2. Update main calculation in `nx-generator.ts`
3. Update corresponding calculator file if it exists (`cleat-calculator.ts`, etc.)
4. Update STEP generator if geometry changes (`step-generator.ts`)
5. Add/update unit tests
6. Test with multiple scenarios using `ScenarioSelector`

### Adding a New Scenario Preset
1. Add to `SCENARIO_PRESETS` array in `page.tsx`
2. Include: id, name, description, product dimensions, clearances, allow3x4, lumberSizes, note
3. Test scenario loads correctly and generates valid output

### Debugging 3D Visualization Issues
1. Check browser console for Three.js errors
2. Verify box coordinates are in inches (not mm)
3. Check `CrateVisualizer.tsx` scale factor (0.1 for scene units)
4. Use datum planes to verify coordinate system
5. Inspect NXBox data structure in component props

### Working with Git
- Main branch: `main`
- Commit messages: Follow conventional commits style
- Pre-commit hooks: Will run type check and related tests automatically
- Don't commit secrets or `.env.local` files
- Run `npm run security:scan` before pushing

## Multi-LLM Development with Worktrees

This repository supports **parallel development by multiple LLMs** using git worktrees. Each issue gets its own isolated workspace.

### Quick Start for New Issues

When invoked with an issue number or URL, use the automated workflow:

```bash
# Method 1: Use the slash command (recommended)
/issue 124

# Method 2: Run manually
./scripts/worktree-issue.sh 124
cd issues/124
```

This creates an isolated worktree in `issues/124/` on branch `sbl-124`.

### Why Worktrees?

- **Parallel Work**: Multiple LLMs (Claude Code, Codex, etc.) can work simultaneously on different issues
- **No Conflicts**: Each issue has its own directory and branch
- **Shared History**: All worktrees share the same git repository
- **Easy Cleanup**: `git worktree remove issues/124` when done

### Workflow

1. **Setup**: `./scripts/worktree-issue.sh <issue-number>`
2. **Work**: Make changes in `issues/<number>/`
3. **Test**: Run `npm test` and `npm run build`
4. **Commit**: Use conventional commit format
5. **PR**: Create from the issue's branch
6. **Cleanup**: `git worktree remove issues/<number>` after merge

### Important Notes

- **Always work in worktrees** when multiple LLMs are active
- **Never modify files in the main repo** when another LLM is working
- **Each worktree is completely isolated** - changes don't affect others
- See [WORKTREE_WORKFLOW.md](WORKTREE_WORKFLOW.md) for complete documentation

## Support & Documentation

- **Project Maintainer**: Shivam Bhardwaj (shivam@designviz.com)
- **Documentation**: See `docs/` directory and `docs/README.md`
- **Issue Templates**: Available at GitHub issues page with Bug Report, Feature Request, Enhancement templates
- **Web Stack Overview**: See `docs/web-stack-overview.html`
- **Worktree Workflow**: See [WORKTREE_WORKFLOW.md](WORKTREE_WORKFLOW.md)
