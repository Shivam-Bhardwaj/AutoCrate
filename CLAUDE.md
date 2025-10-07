# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoCrate Codex is a Next.js 14 application for designing shipping crates with 3D visualization and NX CAD expression generation. It uses a "Two Diagonal Points" construction method for parametric crate modeling with real-time 3D preview.

## Essential Commands

### Development
```bash
npm run dev              # Start development server on http://localhost:3000
npm run build            # Production build
npm run start            # Start production server
```

### Testing
```bash
npm test                 # Run all Jest unit tests
npm test -- --watch      # Run tests in watch mode
npm test -- step-generator.test.ts  # Run specific test file
npm run test:e2e         # Run Playwright E2E tests
npm run test:all         # Run complete test suite (unit + E2E)
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

## Architecture Overview

### Core Design Pattern: Two-Point Diagonal Construction
The entire application revolves around defining crates using two diagonal corner points:
- **Point 1**: Origin (0,0,0)
- **Point 2**: (Width, Length, Height)

This minimalist approach simplifies both the CAD generation and 3D visualization logic.

### State Management Architecture
Uses Zustand with three main stores:
- **Crate Configuration**: All dimensional and material parameters
- **Theme**: Dark/light mode with persistence
- **Logs**: System activity tracking

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
├── Configuration Panel
│   ├── Dimension inputs with debouncing
│   ├── Material selectors
│   └── Export controls
├── 3D Visualization (CrateVisualizer)
│   ├── Frame components
│   ├── Panel components
│   └── Interactive controls
└── Output Section
    ├── NX Expressions
    ├── Instructions
    └── Visual Guide
```

### Error Handling Strategy
- Global ErrorBoundary wraps entire application
- Specialized VisualizationErrorBoundary for 3D components
- Comprehensive try-catch in STEP generation
- Type-safe error propagation through Result types

## Testing Strategy

### Unit Testing Focus Areas
- STEP file generation accuracy (comprehensive test suite)
- Plywood optimization algorithms
- Cleat positioning calculations
- NX expression generation

### Running Specific Tests
```bash
npm test -- --testNamePattern="should generate valid STEP header"
npm test -- --coverage  # Generate coverage report
```

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

1. **src/lib/nx-generator.ts**: Core CAD expression logic - understand the two-point construction method
2. **src/lib/step-generator.ts**: STEP file format implementation - complex but well-documented
3. **src/components/CrateVisualizer.tsx**: 3D rendering logic - React Three Fiber patterns
4. **src/lib/plywood-splicing.ts**: Optimization algorithms for material usage
5. **src/app/page.tsx**: Main application logic and state coordination

## Common Development Tasks

### Adding New Lumber Sizes
1. Update types in lumber configuration
2. Modify `nx-generator.ts` to handle new dimensions
3. Update 3D visualization in `CrateVisualizer.tsx`
4. Add corresponding tests

### Modifying 3D Visualization
1. Edit `CrateVisualizer.tsx` for component changes
2. Adjust material definitions for appearance
3. Update visibility controls if adding new components

### Enhancing STEP Export
1. Modify `step-generator.ts` for new geometry types
2. Ensure ISO 10303-21 compliance
3. Add comprehensive tests for new features

## Type System Guidelines

The project uses strict TypeScript with:
- No implicit any
- Strict null checks
- Comprehensive interface definitions
- Type-safe state management

Always maintain type safety when making changes.
