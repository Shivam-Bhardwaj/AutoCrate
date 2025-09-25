# Repository Guidelines

## Project Structure & Module Organization

- Keep all Next.js routes, layouts, and API handlers under `src/app`; colocate shared UI primitives in `src/components` and utilities (e.g., step generators) in `src/lib`.
- Store acceptance docs inside `docs/`, ship public assets from `public/`, and stage heavy CAD payloads in `publicmodels/` or `CAD FILES/` to avoid inflating the client bundle.
- Jest unit specs live beside their sources or under `test/`, while Playwright flows stay in `tests/e2e/`. Never touch generated coverage inside `coverage/`.

## Build, Test, and Development Commands

- `npm install`: refresh dependencies whenever `package-lock.json` changes.
- `npm run dev`: launch the hot-reload Next.js server.
- `npm run build && npm run start`: validate production output locally.
- `npm run lint`, `npm run type-check`, `npm run test`: enforce code quality gates; reach for `npm run test:coverage` and `npm run test:e2e` before shipping UI changes.

## Coding Style & Naming Conventions

- Author application code in TypeScript with 2-space indentation, trailing commas, and camelCase locals; export React or Three components in PascalCase.
- Favor functional React components and hooks, lean on Tailwind utilities from `tailwind.config.js`, and reserve CSS modules for gaps.
- eslint-config-next and Prettier (via lint-staged) manage formatting; do not bypass lint fixes.

## Testing Guidelines

- Write unit specs as `.test.ts(x)` files positioned beside features; use React Testing Library for component flows.
- Keep Playwright specs in `tests/e2e/*.spec.ts`, stubbing remote calls when feasible.
- Maintain ≥80% coverage; call out intentional dips in PRs and rerun `npm run test:coverage` on every feature branch.

## Commit & Pull Request Guidelines

- Follow Conventional Commits (`feat:`, `fix:`, `chore:`) with focused scope; stage related changes together.
- PR descriptions should summarize the change set, link issues, list the checks you ran, and share before/after screenshots for UI updates.
- Ensure linting, type checks, unit, and relevant Playwright suites pass locally before requesting review.

## Deployment Prep Checklist

- Update `CHANGELOG.md`, run `npm run build`, and confirm geometry updates by executing `npm run test` plus `npm run test:e2e`.
