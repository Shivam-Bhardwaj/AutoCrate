# Repository Guidelines

## Project Structure & Module Organization

- Group all Next.js routes, layouts, server actions, and metadata inside `src/app`, keeping per-route components and loaders nearby.
- Share reusable UI and form primitives from `src/components`; place domain utilities, hooks, and stores in `src/lib`.
- Store acceptance docs in `docs/`, automation helpers in `scripts/`, and public assets in `public/`. Large geometry belongs in `CAD FILES/` (or `publicmodels/` when present) to avoid bloating bundles.
- Co-locate unit specs with their features or use `tests/` for shared coverage; maintain mocks under `test/__mocks__/` and browser flows under `tests/e2e/`.

## Build, Test, and Development Commands

- `npm install` refreshes dependencies when `package-lock.json` changes.
- `npm run dev` starts the hot-reload Next.js server; `npm run build && npm run start` rehearses production.
- `npm run lint`, `npm run type-check`, and `npm run test` form the daily quality gate.
- Use `npm run test:coverage` to confirm ≥80% coverage and `npm run test:e2e` (or `test:e2e:ui`/`test:e2e:debug`) for Playwright suites.
- `npm run test:all` aggregates the primary checks when you need a single command.
- `npm run security:scan` runs the repository secret/binary policy audit before sharing code.

## Coding Style & Naming Conventions

- Author TypeScript with 2-space indentation, trailing commas, and camelCase locals; export React or Three components in PascalCase.
- Prefer functional components and hooks, pulling Tailwind utilities from `tailwind.config.js`; reserve CSS modules for gaps Tailwind cannot cover.
- Rely on `eslint-config-next`, Prettier, and lint-staged Husky hooks—never commit with lint or format warnings unresolved.

## Testing Guidelines

- Name Jest specs `.test.ts` or `.test.tsx` beside the feature or in `tests/`; use React Testing Library for UI assertions.
- Keep Playwright specs in `tests/e2e/*.spec.ts`, stubbing remote services where possible.
- Run `npm run test:coverage` after meaningful UI or state changes and call out any intentional coverage dips in PRs.

## Commit & Pull Request Guidelines

- Follow Conventional Commits (e.g., `feat: add viewport controls`) and keep each commit scoped to a single concern.
- PR descriptions should summarize impact, link issues, list executed checks, and include before/after screenshots for UI work.
- Block PR submission until lint, type-check, Jest, and relevant Playwright runs pass locally; update `CHANGELOG.md` for notable releases.

## Tooling & Operational Notes

- Husky runs lint-staged on each commit; fix reported issues before retrying.
- Use `npm run keploy:record` and `npm run keploy:test` when capturing or replaying API scenarios.
- Document new environment variables in `.env.example` (add the file if needed) and never commit secrets.
