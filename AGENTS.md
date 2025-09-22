# Repository Guidelines

## Project Structure & Module Organization
Core Next.js app lives in src/app, with route layout, shared CSS, and API handlers. Reusable React/Three components are under src/components; shared utilities like NXGenerator and StepGenerator are in src/lib. Browser-exposed assets live in public and large STEP or GLB payloads belong in publicmodels and CAD FILES. Acceptance docs and diagrams sit in docs. Playwright specs and supporting fixtures live under 	ests/e2e, while unit tests belong alongside code or in 	ests/ (see klimp-calculator.test.ts). Generated coverage snapshots should stay in coverage/ and not be edited manually.

## Build, Test, and Development Commands
Run 
pm install once to pull dependencies. 
pm run dev starts the Next.js dev server with hot reload. 
pm run build compiles production assets; follow with 
pm run start to smoke-test the build. Use 
pm run lint for ESLint, 
pm run type-check for 	sc --noEmit, and 
pm run test for Jest unit suites. 
pm run test:coverage reports coverage; 
pm run test:e2e executes Playwright headless, while 
pm run test:e2e:ui is helpful for debugging. End-to-end and unit suites can be orchestrated via 
pm run test:all. For Keploy snapshots, use 
pm run keploy:record and 
pm run keploy:test.

## Coding Style & Naming Conventions
TypeScript is required for application code; prefer function components and hooks. Use two-space indentation, trailing commas, and descriptive camelCase for variables. Components exported from src/components should remain PascalCase and exported as defaults when they map to one file. Leverage Tailwind utility classes defined in 	ailwind.config.js and keep styles in CSS modules only when utilities fall short. ESLint (eslint-config-next) enforces formatting; Prettier runs via lint-staged for JSON, Markdown, and YAML.

## Testing Guidelines
Keep unit tests colocated with the code they cover or inside 	ests/ with a .test.tsx or .test.ts suffix. Align component tests with realistic user flows using React Testing Library. For Playwright specs, follow the 	ests/e2e/*.spec.ts pattern and stub network calls when possible. Target 80%+ coverage, and update baseline metrics intentionally—failing to justify drops may block PRs. Always run 
pm run test:coverage and, when UI changes occur, 
pm run test:e2e.

## Commit & Pull Request Guidelines
Adopt concise subject lines using conventional prefixes (eat:, ix:, chore:), mirroring recent history. Bundle related changes per commit and describe the technical intent. PRs must include a summary, before/after context or screenshots for UI tweaks, linked issues or tickets, and a checklist of tests executed. Ensure CI passes locally prior to requesting review.
