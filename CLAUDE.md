# AutoCrate Project Instructions

## Project Overview
AutoCrate is a Next.js 14 application for designing shipping crates with 3D visualization and NX CAD expression generation.
Live URL: https://autocrate-5xoh6cft1-shivams-projects-1d3fe872.vercel.app

## Deployment Process
ALWAYS use Vercel CLI for deployments, NOT GitHub Actions:
- Build locally: `npm run build`
- Deploy to production: `npm run deploy`
- Deploy preview: `npm run deploy:preview`
- Quick deploy: `npm run deploy:build` (builds and deploys)

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

## Common Tasks

### Adding new features
1. Always check existing patterns in the codebase
2. Use existing components from @/components/ui
3. Add appropriate logging with useLogsStore
4. Ensure dark mode support is included
5. Run tests before committing: `npm run test:all`

### Fixing issues
1. Test locally with `npm run dev`
2. Build test with `npm run build`
3. Run linting: `npm run lint`
4. Fix formatting: `npm run format`
5. Deploy only after successful build

### Updating changelog
1. Update CHANGELOG.md in Unreleased section
2. Generate email update: `npm run email:generate`
3. Follow conventional commit format

### Code quality checks (manual)
- Security: `node scripts/consistency-checkers/security-scanner.js`
- Accessibility: `node scripts/consistency-checkers/accessibility-checker.js`
- Linting: `npm run lint`
- Type checking: `npm run type-check`
- Formatting: `npm run format:check`

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