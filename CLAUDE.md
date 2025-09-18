# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoCrate NX Generator is a Next.js web application that generates parametric NX CAD expressions for shipping crate design. It provides real-time 3D visualization using Three.js and creates expressions compatible with NX CAD software.

## Commands

### Development
```bash
npm install    # Install dependencies (required before first run)
npm run dev    # Start development server on http://localhost:3000
```

### Production
```bash
npm run build  # Build for production
npm start      # Start production server
```

## Architecture

### Core Logic (`src/lib/`)
- **nx-generator.ts**: Main NX expression generation engine
  - Handles crate dimension calculations based on product weight/size
  - Generates parametric expressions using Two Diagonal Points method
  - Manages skid sizing, panel layouts, and cleat placement

- **plywood-splicing.ts**: Plywood panel optimization
  - Calculates optimal plywood piece layouts for panels
  - Handles splice patterns for large panels

- **cleat-calculator.ts**: Cleat placement and sizing
  - Determines reinforcement cleat positions
  - Calculates cleat dimensions based on panel sizes

### UI Components (`src/components/`)
- **CrateVisualizer.tsx**: 3D visualization using React Three Fiber
- **PlywoodPieceSelector.tsx**: Interactive plywood piece selection
- **PlywoodSpliceVisualization.tsx**: 2D panel layout visualization

### Coordinate System
- Origin: Center of crate at floor level (Z=0)
- X-axis: Width (left/right)
- Y-axis: Length (front/back)
- Z-axis: Height (vertical)
- Crate is symmetric about Z-Y plane (X=0)

## Key Technical Details

- TypeScript strict mode enabled
- No linting or testing setup currently configured
- Path alias: `@/*` maps to `./src/*`
- Uses Tailwind CSS for styling
- State management with React hooks (no external state library for main app)
- Zustand available as dependency but not currently utilized