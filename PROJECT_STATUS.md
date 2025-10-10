# Project Status & Memory

**Last Updated**: 2025-10-08
**Current Version**: 13.1.0
**Project Phase**: Production - Active Development

## Current Work Streams

### 🔄 Active Work (In Progress)

_No active work streams currently - update this section when starting new work_

**How to claim a work stream:**

1. Add entry below with your identifier and timestamp
2. Commit the change before starting work
3. Update status as you progress
4. Remove entry when complete

**Format:**

```
- **[MODULE_NAME]** - [DESCRIPTION]
  - Worker: [Your identifier]
  - Started: [Timestamp]
  - Status: [Brief status]
  - Expected completion: [Timestamp]
```

### ✅ Recently Completed (Last 7 days)

- **CLAUDE.md Update** - Improved documentation for AI assistants
  - Completed: 2025-10-08
  - Changes: Enhanced architecture docs, added Docker setup, removed non-existent references

### 📋 Planned Work (Queued)

_Add planned features/fixes here to avoid duplicate work_

- None currently queued

## Module Status & Ownership

### Core Modules

| Module                      | Status    | Last Modified | Safe for Parallel Work? | Notes                                    |
| --------------------------- | --------- | ------------- | ----------------------- | ---------------------------------------- |
| `nx-generator.ts`           | ✅ Stable | 2025-10-08    | ⚠️ Caution              | Core crate generation logic              |
| `step-generator.ts`         | ✅ Stable | 2025-10-08    | ⚠️ Caution              | STEP export - complex assembly structure |
| `plywood-splicing.ts`       | ✅ Stable | 2025-10-08    | ✅ Yes                  | Self-contained optimization algorithm    |
| `klimp-calculator.ts`       | ✅ Stable | 2025-10-08    | ✅ Yes                  | Klimp placement logic                    |
| `klimp-step-integration.ts` | ✅ Stable | 2025-10-08    | ✅ Yes                  | Klimp STEP export                        |
| `lag-step-integration.ts`   | ✅ Stable | 2025-10-08    | ✅ Yes                  | Lag screw integration                    |
| `cleat-calculator.ts`       | ✅ Stable | 2025-10-08    | ✅ Yes                  | Cleat positioning                        |

### UI Components

| Component                  | Status    | Last Modified | Safe for Parallel Work? | Notes                       |
| -------------------------- | --------- | ------------- | ----------------------- | --------------------------- |
| `page.tsx`                 | ✅ Stable | 2025-10-08    | ⚠️ Caution              | Main application state      |
| `CrateVisualizer.tsx`      | ✅ Stable | 2025-10-08    | ⚠️ Caution              | 3D rendering core           |
| `ScenarioSelector.tsx`     | ✅ Stable | 2025-10-08    | ✅ Yes                  | Preset configurations       |
| `PlywoodPieceSelector.tsx` | ✅ Stable | 2025-10-08    | ✅ Yes                  | Plywood visibility controls |
| `LumberCutList.tsx`        | ✅ Stable | 2025-10-08    | ✅ Yes                  | Cut list display            |
| `MarkingsSection.tsx`      | ✅ Stable | 2025-10-08    | ✅ Yes                  | Marking configuration       |
| `KlimpModel.tsx`           | ✅ Stable | 2025-10-08    | ✅ Yes                  | 3D klimp visualization      |

### API Routes

| Route                       | Status    | Last Modified | Safe for Parallel Work? | Notes                |
| --------------------------- | --------- | ------------- | ----------------------- | -------------------- |
| `/api/calculate-crate`      | ✅ Stable | 2025-10-08    | ✅ Yes                  | Crate calculations   |
| `/api/cleat-placement`      | ✅ Stable | 2025-10-08    | ✅ Yes                  | Cleat positioning    |
| `/api/nx-export`            | ✅ Stable | 2025-10-08    | ✅ Yes                  | NX expression export |
| `/api/plywood-optimization` | ✅ Stable | 2025-10-08    | ✅ Yes                  | Plywood optimization |
| `/api/test-dashboard`       | ✅ Stable | 2025-10-08    | ✅ Yes                  | Testing metrics      |
| `/api/last-update`          | ✅ Stable | 2025-10-08    | ✅ Yes                  | Project metadata     |

## Known Issues & Tech Debt

### Critical Issues

_None currently_

### Non-Critical Issues

_None currently_

### Tech Debt

- Test coverage could be improved (current coverage baseline TBD)
- Performance optimization opportunities in 3D rendering for very large crates

## Integration Points (High Collision Risk)

These are areas where multiple workers are likely to conflict:

### 1. Main State Management (`src/app/page.tsx`)

- **Risk Level**: 🔴 HIGH
- **Why**: Central state hub for entire application
- **Coordination**: Discuss changes in advance, work in branches

### 2. NX Generator Core (`src/lib/nx-generator.ts`)

- **Risk Level**: 🔴 HIGH
- **Why**: Core business logic, many dependencies
- **Coordination**: Break changes into small, atomic commits

### 3. STEP Generator (`src/lib/step-generator.ts`)

- **Risk Level**: 🟡 MEDIUM
- **Why**: Complex assembly structure, order matters
- **Coordination**: Coordinate assembly hierarchy changes

### 4. Type Definitions

- **Risk Level**: 🟡 MEDIUM
- **Why**: Shared across entire codebase
- **Coordination**: Update types first, then implementations

## Parallel Work Guidelines

### ✅ Safe Parallel Patterns

1. **New Feature Modules**
   - Create new files in `src/lib/` for new calculators
   - Create new components in `src/components/`
   - Create new API routes in `src/app/api/`
   - Add tests in corresponding `__tests__/` directories

2. **Independent Components**
   - UI components with minimal state dependencies
   - API routes (no shared state)
   - Test files (generally safe)
   - Documentation files

3. **Bug Fixes**
   - Fixes in isolated functions
   - Test additions
   - Documentation improvements

### ⚠️ Coordination Required

1. **State Changes**
   - Modifications to `page.tsx` state
   - Changes to shared configuration interfaces
   - Updates to `CrateConfig` type

2. **Core Logic Changes**
   - `nx-generator.ts` modifications
   - `step-generator.ts` assembly structure
   - Coordinate system changes

3. **Breaking Changes**
   - Type definition updates
   - API contract changes
   - Major refactoring

### 🔴 Avoid Conflicts

1. **Never work simultaneously on**:
   - The same file
   - Parent and child components
   - Tightly coupled modules

2. **Always coordinate**:
   - Database schema changes (if added)
   - Major architectural changes
   - Version bumps

## Version Control Strategy

### Branch Naming

- `feature/[module]-[description]` - New features
- `fix/[module]-[description]` - Bug fixes
- `refactor/[module]-[description]` - Code improvements
- `test/[module]-[description]` - Test additions

### Commit Strategy

- Atomic commits (one logical change)
- Descriptive messages
- Include module name in commit message
- Run tests before committing

### Version Bumping

- **Patch** (13.1.0 → 13.1.1): Bug fixes, no new features
- **Minor** (13.1.0 → 13.2.0): New features, backward compatible
- **Major** (13.1.0 → 14.0.0): Breaking changes

**Commands**:

```bash
npm run version:patch  # Bug fix
npm run version:minor  # New feature
npm run version:major  # Breaking change
npm run version:sync   # Sync version across files
```

## Communication Protocol

### Before Starting Work

1. Check "Active Work" section
2. Check if module is marked "Safe for Parallel Work"
3. If high collision risk, add entry to "Active Work"
4. Pull latest changes: `git pull origin main`

### While Working

1. Make frequent, small commits
2. Update PROJECT_STATUS.md if adding new features
3. Run tests: `npm test`
4. Keep work focused on single module/feature

### Before Completing

1. Run full test suite: `npm run test:all`
2. Update CHANGELOG.md
3. Bump version if appropriate
4. Update PROJECT_STATUS.md (move from Active to Completed)
5. Remove entry from "Active Work" section

## Quick Status Check

```bash
# Get current project state
git status
git log --oneline -n 5

# Check what's being worked on
cat PROJECT_STATUS.md | grep "Active Work" -A 20

# See recent changes
git log --since="7 days ago" --oneline

# Check version
cat package.json | grep version
```

## Emergency Rollback

If deployment breaks:

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or rollback to specific commit
git revert <commit-hash>
git push origin main
```

## Notes

- This file should be updated at the start and end of each work session
- If you find this file is stale (>1 week old in Active Work), assume work is abandoned
- Use git branches for experimental work
- Keep main branch stable and deployable
