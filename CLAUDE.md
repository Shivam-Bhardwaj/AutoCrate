# AutoCrate Project Instructions

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

**STRICT RULES:**
- Only modify files that are DIRECTLY relevant to the user's request
- Do NOT change unrelated files, configs, or documentation
- Do NOT proactively update or "improve" code that wasn't mentioned
- All changes remain LOCAL until user explicitly approves deployment

## Project Overview
AutoCrate is a Next.js 14 application for designing shipping crates with 3D visualization and NX CAD expression generation.
Live URL: https://autocrate-5xoh6cft1-shivams-projects-1d3fe872.vercel.app

## CRITICAL: World Coordinate System (Z-up) - SEE CRITICAL_GEOMETRY.md

**MANDATORY POSITIONING:** The crate MUST be positioned with its CENTER ON THE FLOOR at world origin.

### Quick Reference (Full details in CRITICAL_GEOMETRY.md):
- **Origin [0,0,0]**: Center of crate's footprint ON THE FLOOR (not geometric center)
- **X-axis (Red)**: Width - horizontal, sideways when viewing from front
- **Y-axis (Green)**: Depth - horizontal, away from viewer
- **Z-axis (Blue)**: Height - vertical, pointing upward
- **Crate Position**: Bottom face at Z=0, extends upward to Z=height

### Key Rules:
1. NEVER place crate's geometric center at origin
2. ALWAYS place crate's floor-center at origin [0,0,0]
3. Crate sits ON the floor (Z=0 is floor level)
4. All components positioned relative to floor-center origin

This convention ensures compatibility with NX CAD and standard engineering practices.

## Simplified Deployment Workflow

### Three-Step Process:
1. **Local Development** (`.\\autocrate local` or Option 1)
   - Starts dev server
   - Runs tests
   - Use for active development

2. **Prepare for Production** (`.\\autocrate prepare` or Option 2)
   - Runs all quality checks (lint, type-check, format)
   - Builds production bundle
   - Runs all tests
   - Ensures code is production-ready

3. **Deploy to Production** (`.\\autocrate deploy` or Option 3)
   - Git add, commit, and push
   - GitHub Actions automatically deploys to Vercel
   - No manual Vercel CLI needed

### Why This Workflow?
- GitHub push triggers automatic deployment
- Single source of truth (GitHub)
- Version control integrated with deployment
- Simplified process: develop → prepare → deploy

## GitHub Actions CI/CD
The project uses GitHub Actions for continuous integration (NOT for deployment):

### Workflows
1. **CI/CD Pipeline** (`.github/workflows/ci.yml`)
   - Triggers on push/PR to main/develop branches
   - Runs: Linting, Type checking, Unit tests, Integration tests, E2E tests
   - Consistency checks for accessibility and security
   - Build verification

2. **Release Workflow** (`.github/workflows/release.yml`)
   - For creating releases and changelogs

### Required GitHub Secrets
Configure these in Settings → Secrets → Actions:
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: team_64dmOmtL9E1fNYWb5uATz7UZ
- `VERCEL_PROJECT_ID`: prj_IvXRHYjfChbaj892GNXnbKfti5J3
- `CODECOV_TOKEN`: Optional, for coverage reports

### Test Scripts
All test commands are configured in package.json:
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:coverage` - Generate coverage report
- `npm run e2e` - Run Playwright E2E tests
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm run format` - Format with Prettier

## Key Features
- 3D crate visualization using Three.js/React Three Fiber
- NX CAD expression generator with detailed implementation instructions
- Two-point diagonal box construction method for minimal parameters
- Interactive visual guides for NX CAD workflow
- Dark/Light mode toggle with persistent preferences
- System logs tracking all user actions
- Real-time configuration updates
- Bill of Materials generation with cost estimates
- Mobile-responsive design with separate mobile layout
- Automatic skid sizing based on weight requirements

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

## File Management Policy

### Clean Codebase Principles
- **ONE SCRIPT RULE**: Use `autocrate.bat` for all operations (no duplicate scripts)
- **NO TEMPORARY FILES**: Don't create scripts that won't be reused
- **NO PLATFORM DUPLICATES**: No .sh/.bat/.ps1 versions of the same script
- **ESSENTIAL ONLY**: Only keep files necessary for production

### Files to Keep
- `autocrate.bat` - Master control script
- Configuration files (package.json, tsconfig.json, etc.)
- Source code in /src
- Tests in /tests
- Essential configs (next.config.js, tailwind.config.js)

### Files to Avoid
- Automation scripts (use a.bat instead)
- Multiple script versions
- Temporary or backup files
- Log files in repo
- Unused dependencies or configs

## Important Notes
- GitHub is used ONLY for version control and CI testing
- All deployments must go through Vercel CLI
- Test files are excluded from production builds (`tsconfig.json` excludes tests)
- No placeholder/non-functional buttons should exist
- Dark mode persists across sessions using localStorage
- Logs are limited to 100 entries to prevent memory issues
- All dimensions are in inches throughout the application
- NX expressions use two-point diagonal construction for simplicity
- Hydration-safe timestamp rendering in LogsSection (client-only)

## Configuration Management
### Dynamic Values
- Tech stack versions are read dynamically from `package.json` via `src/utils/tech-stack.ts`
- Project version is imported from `src/utils/version.ts` (generated from package.json)
- No hardcoded URLs or API endpoints in the codebase

### Default Port Configuration
- Development server runs on port 3000 by default
- If port 3000 is busy, Next.js automatically tries 3001, 3002, etc.
- Use `.\\autocrate ports` to view/manage active ports

### Environment Variables
- Vercel deployment credentials are stored as GitHub secrets (see above)
- No `.env` file is required for basic functionality
- All configuration is derived from package.json when possible

## Master Script - a.bat
A unified script for all development tasks is available (named 'a.bat' for quick tab completion):

### Usage
- **Interactive Menu**: `.\\autocrate` or `.\\autocrate.bat` (no arguments)
- **Direct Commands**: `.\\autocrate [command]`

### Available Commands
- `dev` - Start development server
- `build` - Build for production
- `deploy` - Deploy to Vercel (builds first)
- `test` - Run tests
- `lint` - Run ESLint
- `format` - Format code with Prettier
- `typecheck` - Run TypeScript type check
- `check` - Run all checks (lint + type + format)
- `help` - Show help message

### Examples
```cmd
.\a dev        # Start dev server
.\a deploy     # Build and deploy to Vercel
.\a check      # Run all code quality checks
.\a            # Opens interactive menu
```

## Common Tasks

### Adding new features
1. Always check existing patterns in the codebase
2. Use existing components from @/components/ui
3. Add appropriate logging with useLogsStore
4. Ensure dark mode support is included
5. Run tests before committing: `.\\autocrate test`

### Fixing issues
1. Test locally with `.\\autocrate dev`
2. Build test with `.\\autocrate build`
3. Run linting: `.\\autocrate lint`
4. Fix formatting: `.\\autocrate format`
5. Deploy only after successful build: `.\\autocrate deploy`

### Updating changelog
1. Update CHANGELOG.md in Unreleased section
2. Generate email update: `npm run email:generate`
3. Follow conventional commit format

### Code quality checks
- Quick check all: `.\\autocrate check`
- Security: `node scripts/consistency-checkers/security-scanner.js`
- Accessibility: `node scripts/consistency-checkers/accessibility-checker.js`
- Individual checks:
  - Linting: `.\\autocrate lint`
  - Type checking: `.\\autocrate typecheck`
  - Formatting: `.\\autocrate format`

## File Structure
- `/src/app` - Next.js app router pages
- `/src/components` - React components
  - `NXInstructions.tsx` - Step-by-step NX implementation guide
  - `NXVisualGuide.tsx` - Visual coordinate system and construction guide
  - `OutputSection.tsx` - Expression output with Instructions and Visual Guide tabs
- `/src/store` - Zustand stores (crate, theme, logs)
- `/src/services` - Business logic (NX generator with enhanced documentation)
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions (format-inches for dimension display)
- `/scripts` - Build and utility scripts
- `/tests` - Test files (excluded from build)
  - `/tests/unit` - Unit tests
  - `/tests/integration` - Integration tests
  - `/tests/e2e` - Playwright E2E tests

## Git Workflow
1. Create feature branch from develop
2. Make changes and test locally
3. Run `npm run lint` and `npm run format`
4. Commit with conventional commit messages
5. Push and create PR
6. GitHub Actions will run CI checks
7. Merge to main after approval
8. Deploy using Vercel CLI (NOT GitHub Actions)