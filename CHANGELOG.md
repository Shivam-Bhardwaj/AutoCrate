# Changelog

All notable changes to AutoCrate NX Generator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

#### Tutorial Overlay

- **Text Overlap** - Fixed overlapping text in tutorial overlay between expressions section and tips section by adding proper spacing (mb-4 on expressions container, mt-3 on tips list)

#### 3D Visualization

- **Datum Plane Scaling** - Datum planes now scale proportionally (40% of max dimension) to model size, preventing oversized planes on small crates
- **Datum B Position** - Moved Datum B to ground level (Z=0) for accurate reference positioning
- **Datum C Position** - Moved Datum C to outer face of skid (-spanX/2) for proper edge reference
- **Component Visibility** - Fixed visibility toggles to properly filter boxes (skids, floorboards, panels, cleats now correctly show/hide)

#### Panel Stops

- **Panel Stop Positioning** - Fixed Y position to be on inner surface instead of outer, preventing interference with front panel plywood

### Changed

#### Testing

- **Test Fixtures** - Updated test data to include required `description` field in LumberCutList
- **Environment Variables** - Fixed NODE_ENV assignments in tests using Object.defineProperty
- **Test Expectations** - Updated panel-stop-calculator tests to reflect corrected inner surface positioning

## [13.1.0] - 2025-10-08

### Added

#### LLM Workflow System

- **Complete LLM Workflow Documentation** - Added `.claude/workflows/` with comprehensive guides
  - `MAKING_CHANGES.md` - Step-by-step workflow for every commit
  - `VERSION_BUMPING.md` - Detailed version management guide
  - `DEPLOYMENT.md` - Deployment procedures and verification
  - `REVERTING.md` - Emergency rollback procedures
- **Version Configuration** - `.claude/version-config.json` with version rules and metadata
- **Project Status Tracking** - `.claude/project-status.json` for current state snapshot
- **Version Sync Script** - Automated version synchronization across all files
- **NPM Version Scripts** - Added `version:patch`, `version:minor`, `version:major`, `version:sync`
- **Git Tag Support** - Automatic tagging for easy rollback to any version

#### Comprehensive Metadata Banner

- **Rich Project Metadata** - Banner displays version, TI number, branch, commit, maintainer
- **Full Commit Messages** - Shows complete last change description
- **No Hardcoded Values** - All metadata sourced from package.json and git
- **Mobile Responsive** - Stacks appropriately on small screens
- **Theme Compatible** - Works on both light and dark modes

### Changed

#### Version Numbering

- **New Versioning Scheme**: OVERALL.CURRENT.CHANGE (was 1.x.x, now 13.1.0)
  - 13 = Overall major version (milestones)
  - 1 = Current iteration (features)
  - 0 = Change number (patches)
- **Updated CLAUDE.md** - Added LLM Quick Start Workflow section
- **Every Commit Requires Version Bump** - Enforced through documentation

#### Metadata System

- **package.json** - Added `tiNumber` and `maintainer` fields
- **API Enhancement** - `/api/last-update` returns 7-field `ProjectMetadata` interface
- **Banner Redesign** - Subtle gray styling, two-row layout, professional appearance

### Technical

- Regression test that verifies the new floorboard layout behaviour (widest boards at the edges, mirrored narrowing, single custom infill)
- Playwright STEP-download assertions that read the generated file from the run artifacts directory and check for BREP entities
- Jest safeguards for lag hardware placement across side and back panels
- Contributor guide (AGENTS.md) refreshed with current structure, workflows, and deployment expectations
- Floorboard layout algorithm now places widest lumber at the edges, steps inward with narrower stock, and only produces a quarter-inch custom strip when required
- Chromium Playwright flows now rely on test IDs for BOM tables, exterior dimensions, and the 3x4 toggle to reduce selector brittleness
- Documentation index added under `docs/` for easier navigation

## [1.4.0] - 2025-09-18

### Added

#### STEP File Export

- **Download STEP Files** - Export 3D models as STEP files for CAD software compatibility
- **ISO 10303-21 Compliance** - Generates standard STEP AP203 format files
- **Automatic Unit Conversion** - Converts dimensions from inches to millimeters
- **Component Support** - Exports all crate components (skids, floorboards, panels, cleats)
- **Visibility Respect** - Only exports visible components based on UI settings
- **Purple Download Button** - Added distinctive purple button in header for STEP export

#### Comprehensive Testing Architecture

- **Jest Unit Testing** - Full unit test coverage for STEP generator and core components
- **Playwright E2E Testing** - End-to-end tests for user workflows and file downloads
- **Keploy Integration** - Docker-based API testing with record/replay capabilities
- **Pre-commit Hooks** - Husky + lint-staged for automated validation before commits
- **Test Runner Script** - Comprehensive test suite runner with reporting
- **Coverage Tracking** - Test coverage metrics and reporting

#### Error Handling

- **Global Error Boundary** - Application-wide error catching and recovery
- **3D Visualization Error Boundary** - Specialized error handling for Three.js components
- **User-Friendly Messages** - Graceful error recovery with clear instructions
- **Development Mode Details** - Detailed error information in development environment

### Changed

- Export buttons relocated to header for better accessibility and consistency
- Test coverage thresholds configured for progressive improvement
- Build process now includes comprehensive validation steps

### Fixed

- STEP file generator syntax errors that could cause parsing failures
- Build-time validation now catches errors before production deployment
- TypeScript strict checking integrated into pre-commit workflow

### Developer Experience

- Added TESTING.md with comprehensive testing documentation
- Multiple test scripts for different testing scenarios (unit, e2e, all)
- Docker configuration for Keploy testing environment
- Automated security vulnerability scanning in test pipeline
- TypeScript strict mode enforcement

## [1.3.0] - 2025-09-17

### Added

#### Plywood Splicing System

- **Individual Plywood Pieces** - Panels now composed of up to 6 individual plywood pieces instead of single panels
- **48x96 Sheet Optimization** - Automatic calculation of optimal splicing for standard 48" x 96" plywood sheets
- **Splice Positioning Rules** - Vertical splices on right side, horizontal splices on bottom for consistent assembly
- **7-Parameter System** - Each plywood piece exports with 7 NX parameters (X, Y, Z, Width, Length, Height, Thickness)
- **Individual Piece Selection** - New "Plywood Pieces" tab for toggling individual pieces on/off
- **Visual Differentiation** - Different colors for each plywood piece showing splice boundaries in 3D view
- **Automatic Suppression** - Unused plywood slots automatically suppressed in NX expressions
- **130" Panel Support** - System handles panels up to 130" using 6 plywood pieces maximum

### Changed

- Panels now render as multiple plywood pieces with visible splice lines in 3D visualization
- Removed separate "Plywood Splicing" visualization tab - splicing now evident in main 3D model
- BOM updated to show individual plywood sheet requirements and efficiency metrics
- NX expressions now export individual plywood pieces with full parameter sets

### Fixed

- Panel visibility initialization to show plywood pieces by default
- Splice layout calculation order to ensure proper panel generation
- Horizontal splice positioning to correctly place partial sheets at bottom

## [1.2.0] - 2025-09-17

### Added

#### UI/UX Improvements

- **Full-Screen Layout** - Revamped UI to utilize entire viewport without scrolling
- **Maximized 3D View** - 3D visualization now uses ~80% of screen width
- **Compact Sidebar** - Reduced sidebar to 256px for maximum visualization space
- **Mobile Responsive** - Added hamburger menu for mobile devices
- **Lumber Format Display** - Skid sizes now shown as lumber format (e.g., "6x6 lumber" instead of "5.5")
- **Quick Export Access** - Export buttons moved to header for immediate access

### Changed

- Optimized spacing throughout with reduced padding and margins
- Header height minimized to maximize content area
- Input fields reorganized in compact grid layouts
- Display options condensed with smaller checkboxes
- Fixed Three.js canvas to properly fill container with CSS rules

### Fixed

- Canvas container now properly expands to full available width
- Removed viewport width restrictions for proper full-screen usage
- Ensured proper overflow handling for no-scroll design

## [1.1.0] - 2025-09-17

### Added

#### Enhanced Skid and Floorboard System

- **Proper Skid Sizing** - Implemented weight-based skid sizing according to Table 5-3 standards
- **Skid Spacing Calculations** - Added precise skid spacing based on Table 5-4 requirements
- **Single Skid Component** - Unified skid generation with pattern parameters for NX CAD
- **Individual Floorboard Components** - 20 separate floorboard components with suppression capability
- **Optimized Floorboard Layout** - Large boards on outside, narrow boards in center for material efficiency

#### UI and Control Improvements

- **Lumber Size Selection** - Interactive UI for selecting lumber dimensions (2x4, 2x6, 2x8, 2x10, 2x12)
- **Component Visibility Toggles** - Individual controls for showing/hiding skids, floorboards, and panels
- **Hover Tooltips** - Enhanced 3D visualization with interactive tooltips for components
- **Default Dimensions** - Set to 135" cube for maximum shipping size demonstration

#### Technical Enhancements

- **Fixed Panel Positioning** - Panels now properly positioned relative to skid height
- **Component Organization** - Improved structure for better NX CAD integration
- **Enhanced Documentation** - Updated inline comments and component descriptions

### Changed

- Updated default crate dimensions to 135x135x135 inches for maximum size example
- Improved floorboard arrangement algorithm for better material utilization
- Enhanced 3D rendering performance with optimized component visibility

### Fixed

- Panel positioning now accounts for skid height offset
- Floorboard suppression logic for proper NX CAD pattern generation
- Component naming consistency across all generated elements

## [1.0.0] - 2025-09-17

### Added

#### Core Features

- **NX Expression Generator** - Generates parametric expressions for NX CAD using Two Diagonal Points method
- **3D Visualization** - Real-time 3D preview of crate design using Three.js
- **Web Interface** - Clean, responsive UI built with Next.js 14 and Tailwind CSS
- **BOM Calculator** - Automatic Bill of Materials generation with CSV export
- **Expression Export** - Download NX-compatible .exp files for direct import

#### Technical Implementation

- **Coordinate System** - Proper NX-compatible coordinate system (X=width, Y=length, Z=height)
- **Component Structure** - SHIPPING_BASE (skids + floorboard) and CRATE_CAP (5 panels)
- **Smart Sizing** - Automatic skid sizing based on product weight
- **Two-Point Method** - All components defined using two diagonal points (6 values)
- **Real-time Updates** - Instant visualization updates as dimensions change

#### Components Generated

- Skids (2-4 based on weight)
- Floorboard
- Front Panel
- Back Panel
- Left End Panel
- Right End Panel
- Top Panel
- Cleats (reinforcement)

### Features

- Input validation for dimensions
- Real-time 3D preview with orbit controls
- Tabbed interface (3D View, NX Expressions, BOM)
- Download functionality for expressions and BOM
- Responsive design for desktop and tablet
- Grid floor reference for visualization
- Coordinate axis indicators

### Technical Stack

- Next.js 14.0.4
- TypeScript 5
- Three.js + React Three Fiber for 3D
- Tailwind CSS for styling
- Client-side only (no backend required)

### Documentation

- Comprehensive inline documentation
- NX integration instructions
- Coordinate system reference

## Design Decisions

### Why Client-Side Only?

- All calculations are deterministic math
- No need for data persistence
- Instant performance with no network latency
- Enhanced privacy - no data leaves user's machine
- Simplified deployment and maintenance

### Why Two Diagonal Points Method?

- Standard NX CAD approach for box creation
- Minimal parameters (6 values per component)
- Unambiguous geometry definition
- Easy validation and debugging

### Coordinate System

- Matches NX CAD conventions
- Z=0 at floor level
- Symmetric about Z-Y plane (X=0 centerline)
- Right-handed coordinate system

## Known Limitations

- STEP file export not yet implemented
- Advanced materials selection pending
- Multi-crate configurations not supported
- No collaboration features (by design)

## Future Enhancements

- STEP AP242 export with PMI
- Material optimization algorithms
- Cost estimation
- Weight distribution analysis
- Forklift pocket positioning
- Custom template support

---

## Development Notes

### Setup

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
npm start
```

### Key Files

- `/src/lib/nx-generator.ts` - Core NX expression generation logic
- `/src/components/CrateVisualizer.tsx` - 3D visualization component
- `/src/app/page.tsx` - Main application interface

### Testing Dimensions

- Small crate: 20x15x25 inches, 200 lbs
- Medium crate: 40x30x50 inches, 800 lbs
- Large crate: 60x48x72 inches, 2000 lbs
