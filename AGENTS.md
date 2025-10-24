# Repository Guidelines

## Project Structure & Module Organization

- `src/app` is the Next.js App Router; API handlers live in `src/app/api/*`.
- `src/components` handles UI, while `src/lib` holds crate math, CAD exporters, and security helpers.
- Jest specs mirror modules under `src/**/__tests__`; Playwright journeys sit in `tests/e2e`.
- Assets live in `public/`; design tokens in `config/tokens.json`; automation scripts (tests, deploy, tmux) in `scripts/`.

## Build, Test, and Development Commands

- `npm install` syncs dependencies; rerun after lockfile updates.
- `npm run dev` (or `make dev`) serves the app at `http://localhost:3000`.
- `npm run build` creates the production bundle; keep it green before merging.
- `npm test` runs Jest; add `npm run test:coverage` when logic shifts.
- `npm run test:e2e` executes Playwright suites; `npm run test:all` chains the full gauntlet.
- `npm run lint` and `npm run type-check` mirror CI gates.

## Coding Style & Naming Conventions

- TypeScript-first; favour function components and extracted hooks for shared logic.
- Prettier defaults (2-space indent, single quotes) run via lint-staged pre-commit.
- Use PascalCase component files, kebab-case modules in `src/lib`, camelCase exports.
- Tailwind utilities stay inline; shared scales live in `config/tokens.json` and `tailwind.config.js`.
- Keep side effects in route handlers while exporting pure helpers from `src/lib`.

## Testing Guidelines

- Match module names in `__tests__` folders and reuse mocks from `test/__mocks__`.
- Cover validation branches for each API route with `route.test.ts` companions.
- Refresh Playwright specs when flows or breakpoints change; traces live in `test-results/`.
- Run `npm run test:all` before PRs, stabilising flakes instead of skipping.
- Track coverage with `npm run test:coverage`; avoid regressions without sign-off.

## Commit & Pull Request Guidelines

- Follow Conventional Commit patterns (`fix:`, `test:`, `chore:`) with ≤50 char subjects plus issue tags (e.g., `fix: align panel stops #123`).
- Husky enforces lint, type-check, and targeted Jest on commit; keep hooks enabled.
- PRs must link the tracked issue, summarise behaviour changes, list verification commands, and attach UI evidence for visual work.
- Ping the owner in `.claude/agents/registry.json` when touching 3D viz, CAD export, or security code.
- Request review only after `npm run build` and `npm run test:e2e` succeed locally.

## Security & Configuration Tips

- Base local secrets on `.env.example` and keep `.env.local` untracked.
- Avoid Node-specific APIs in middleware to preserve Edge compatibility.
- Rely on `SECURITY.md` for auth, rate limiting, and headers; rerun `npm run security:scan` after related changes.
