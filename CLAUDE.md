# AutoCrate Project Instructions

## Project Overview
AutoCrate is a Next.js 14 application for designing shipping crates with 3D visualization and NX CAD expression generation.
Live URL: https://autocrate-5xoh6cft1-shivams-projects-1d3fe872.vercel.app

## Recent Updates (2025-09-10)
- **Mobile Experience v2**: Complete redesign with bottom sheet pattern, floating actions, and gesture controls
- **Enhanced 3D Visualization**: Improved dark mode contrast, alternating wood-tone floorboards
- **Responsive Typography**: Fluid scaling system for better readability across all devices
- **Codebase Refactoring**: Removed legacy mobile implementations and redundant files
- **Performance Optimizations**: Better material reuse and instancing for 3D models

## CRITICAL DEPLOYMENT RULES - MUST FOLLOW
**Claude will ONLY make local changes. NO automatic commits or pushes to GitHub.**

### Deployment Workflow (User Controlled):
1. **Option 1 (Local Test)**: User tests locally after Claude makes changes
2. **Option 2 (Prepare)**: User validates with all checks and tests
3. **Option 3 (Deploy)**: User pushes to GitHub ONLY when ready

**Claude is FORBIDDEN from:**
- Running `git commit` without explicit user request
- Running `git push` without explicit user request  
- Using Option 3 of autocrate.bat without user permission
- Automatically deploying or pushing code
- Making changes to files that are NOT directly related to the requested task
- Modifying configuration files, documentation, or tests unless specifically asked
- Creating new files unless absolutely necessary for the requested feature

## CRITICAL: World Coordinate System (Z-up) - SEE CRITICAL_GEOMETRY.md

**MANDATORY POSITIONING:** The crate MUST be positioned with its CENTER ON THE FLOOR at world origin.

### Quick Reference:
- **Origin [0,0,0]**: Center of crate's footprint ON THE FLOOR (not geometric center)
- **X-axis (Red)**: Width - horizontal, sideways when viewing from front
- **Y-axis (Green)**: Depth - horizontal, away from viewer
- **Z-axis (Blue)**: Height - vertical, pointing upward
- **Crate Position**: Bottom face at Z=0, extends upward to Z=height

## Folder Architecture

```
autocrate-web/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main page (desktop/mobile routing)
│   │   ├── mobile-v2.tsx       # NEW: Enhanced mobile experience
│   │   ├── globals.css         # Global styles with responsive system
│   │   └── api/                # API routes
│   │
│   ├── components/
│   │   ├── CrateViewer3D.tsx   # Main 3D viewer with dark mode support
│   │   ├── InputForms.tsx      # Configuration forms
│   │   ├── OutputSection.tsx   # NX expression output
│   │   ├── LogsSection.tsx     # System logs display
│   │   ├── three/              # 3D rendering components
│   │   │   ├── CrateModel.tsx  # Main crate model
│   │   │   ├── FloorRenderer.tsx # Alternating wood-tone floorboards
│   │   │   ├── SkidsRenderer.tsx
│   │   │   └── PanelsRenderer.tsx
│   │   ├── mobile/             # Mobile-specific components
│   │   │   └── SwipeableView.tsx # Gesture-based navigation
│   │   └── ui/                 # Radix UI components
│   │
│   ├── services/               # Business logic
│   │   ├── nx-generator.ts     # NX CAD expression generation
│   │   ├── floor-calculator.ts # Floor board calculations
│   │   ├── skid-calculations.ts
│   │   └── cog-calculator.ts   # Center of gravity
│   │
│   ├── store/                  # Zustand state management
│   │   ├── crate-store.ts      # Crate configuration
│   │   ├── theme-store.ts      # Dark/light mode
│   │   └── logs-store.ts       # System logs
│   │
│   ├── styles/
│   │   ├── responsive.css      # NEW: Fluid typography system
│   │   └── tokens.css          # Design tokens
│   │
│   ├── types/                  # TypeScript definitions
│   │   └── crate.ts            # Core types
│   │
│   └── utils/
│       ├── materials.ts        # 3D material definitions
│       ├── geometry/           # Geometry calculations
│       └── format-inches.ts    # Dimension formatting
│
├── public/                     # Static assets
├── scripts/                    # Build and development scripts
│   └── autocrate.bat          # Master control script
├── tests/                      # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                       # Documentation
└── config/                     # Configuration files
```

## Key Features
- **3D Visualization**: Three.js/React Three Fiber with optimized performance
- **Mobile Experience v2**: Bottom sheet pattern, floating actions, gesture controls
- **Dark Mode**: Full support with enhanced contrast for 3D viewer
- **NX CAD Integration**: Two-point diagonal box construction method
- **Responsive Design**: Fluid typography and touch-friendly targets
- **Real-time Updates**: Interactive configuration with immediate visual feedback
- **Automatic Calculations**: Skid sizing, floor boards, weight distribution

## Tech Stack
- Next.js 14.0.4 with App Router
- TypeScript
- Three.js for 3D rendering
- Tailwind CSS for styling
- Zustand for state management
- Radix UI components
- Vercel for hosting
- Vitest for testing
- Playwright for E2E testing

## Mobile Experience Features
- **Bottom Sheet Pattern**: Controls slide up from bottom
- **Floating Action Button**: Quick access to generate expressions
- **Quick Edit Mode**: Inline dimension adjustments
- **Haptic Feedback**: Vibration on interactions (when available)
- **Gesture Support**: Swipe, drag, and touch interactions
- **Progressive Disclosure**: Hide complexity, show essentials

## Development Workflow

### Three-Step Process:
1. **Local Development** (`.\autocrate local`)
   - Starts dev server on port 3000
   - Runs tests
   - Use for active development

2. **Prepare for Production** (`.\autocrate prepare`)
   - Runs all quality checks (lint, type-check, format)
   - Builds production bundle
   - Runs all tests
   - Ensures code is production-ready

3. **Deploy to Production** (`.\autocrate deploy`)
   - Git add, commit, and push
   - GitHub Actions automatically deploys to Vercel
   - No manual Vercel CLI needed

## GitHub Actions CI/CD
The project uses GitHub Actions for continuous integration:

### Required GitHub Secrets
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: team_64dmOmtL9E1fNYWb5uATz7UZ
- `VERCEL_PROJECT_ID`: prj_IvXRHYjfChbaj892GNXnbKfti5J3

## Master Script - autocrate.bat
Unified script for all development tasks:

### Usage
- **Interactive Menu**: `.\autocrate` (no arguments)
- **Direct Commands**: `.\autocrate [command]`

### Available Commands
- `dev` - Start development server
- `build` - Build for production
- `test` - Run tests
- `lint` - Run ESLint
- `format` - Format code with Prettier
- `typecheck` - Run TypeScript type check
- `check` - Run all checks
- `ports` - View/manage active ports
- `help` - Show help message

## Common Tasks

### Adding new features
1. Check existing patterns in the codebase
2. Use existing components from @/components/ui
3. Add appropriate logging with useLogsStore
4. Ensure dark mode support
5. Test on both desktop and mobile
6. Run tests before committing

### Mobile Testing
- Access from mobile: http://[YOUR_IP]:3000
- Automatic mobile detection and routing
- Test gestures and touch interactions
- Verify bottom sheet behavior
- Check haptic feedback (if device supports)

### Code Quality
- Run all checks: `.\autocrate check`
- Security scan: `node scripts/consistency-checkers/security-scanner.js`
- Accessibility: `node scripts/consistency-checkers/accessibility-checker.js`

## Important Notes
- GitHub is used for version control and CI testing
- Deployments go through Vercel
- Test files are excluded from production builds
- Dark mode persists across sessions using localStorage
- Logs are limited to 100 entries to prevent memory issues
- All dimensions are in inches throughout the application
- Mobile experience automatically adapts based on viewport
- Floorboards use alternating wood tones for visual distinction

## Recent Optimizations
- **3D Performance**: Material reuse and geometry instancing
- **Mobile UX**: Gesture-based interactions with haptic feedback
- **Typography**: Fluid scaling system for better readability
- **Dark Mode**: Enhanced contrast and lighting adjustments
- **Code Cleanup**: Removed legacy mobile implementations and redundant files

## Version
Current: v3.0.1 (2025-09-10)
- Enhanced mobile experience with bottom sheet pattern
- Improved 3D visualization with better contrast
- Responsive typography system
- Codebase refactoring and cleanup