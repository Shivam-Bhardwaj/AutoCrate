# Agent System Guide - AutoCrate

**Version**: 1.0.0
**Purpose**: Automated development workflows from issue to deployment

---

## 🎯 Core Principle: Fully Automated Workflow

**The Standard Workflow:**
```
1. Open terminal
2. Provide issue link: "work on https://github.com/Shivam-Bhardwaj/AutoCrate/issues/123"
3. Everything else is automated
```

The system handles:
- ✅ Fetching issue details from GitHub
- ✅ Creating feature branch with proper naming
- ✅ Implementing changes with tests
- ✅ Running full test suite
- ✅ Committing with proper message format
- ✅ Pushing to remote branch
- ✅ Creating PR that closes the issue
- ✅ All ready for review

**You only provide the issue link. The rest is automatic.**

---

## 📋 19 Specialized Agents

Each agent is pre-configured for specific tasks with optimized context loading:

### Core Development Agents

**1. geometry** (30K token budget)
- Triggers: geometry, coordinates, dimensions, measurements
- Context: nx-generator.ts, crate-constants.ts
- Use for: Dimensional calculations, coordinate transformations

**2. 3d-viz** (40K token budget)
- Triggers: 3d, visualization, three.js, r3f, render
- Context: CrateVisualizer.tsx, KlimpModel.tsx, MarkingVisualizer.tsx
- Use for: 3D rendering issues, visual components

**3. cad-export** (50K token budget)
- Triggers: step, export, cad, nx, iso 10303
- Context: step-generator.ts, nx-generator.ts, *-step-integration.ts
- Use for: CAD file generation, STEP/NX export

**4. ui** (40K token budget)
- Triggers: ui, frontend, react, component, state
- Context: app/page.tsx, components/, tailwind.config.js
- Use for: UI changes, React components, state management

**5. testing** (35K token budget)
- Triggers: test, jest, playwright, e2e, coverage
- Context: __tests__/, jest.config.js, playwright.config.ts
- Use for: Writing tests, fixing test failures, coverage

### Specialized Technical Agents

**6. nx** (25K token budget)
- Triggers: nx expression, parametric, nx cad
- Context: nx-generator.ts, crate-constants.ts
- Use for: NX CAD expressions, parametric modeling

**7. step** (40K token budget)
- Triggers: step file, iso 10303, assembly
- Context: step-generator.ts, step tests
- Use for: STEP file format, assembly hierarchy

**8. lumber** (25K token budget)
- Triggers: lumber, material, bom, cut list, wood
- Context: crate-constants.ts, LumberCutList.tsx
- Use for: Lumber sizes, materials, BOM calculations

**9. hardware** (30K token budget)
- Triggers: hardware, klimp, fastener, cleat, screw
- Context: klimp-calculator.ts, cleat-calculator.ts, *-step-integration.ts
- Use for: Hardware placement, fastener calculations

**10. scenario** (20K token budget)
- Triggers: scenario, preset, configuration
- Context: ScenarioSelector.tsx
- Use for: Predefined configurations, scenario management

**11. constants** (15K token budget)
- Triggers: constants, specifications, hardcoded
- Context: crate-constants.ts
- Use for: Hardcoded values, specifications

### Workflow & Process Agents

**12. deployment** (25K token budget)
- Triggers: deploy, build, ci, production, vercel
- Context: package.json, next.config.js, vercel.json, workflows
- Use for: Build, deployment, CI/CD configuration

**13. review** (40K token budget)
- Triggers: review, quality, refactor, architecture
- Context: START_HERE.md, MODULES.md, PROJECT_STATUS.md
- Use for: Code review, architectural decisions

**14. issue** (20K token budget)
- Triggers: issue, bug report, feature request
- Context: START_HERE.md workflow section, COMMIT_GUIDELINES.md
- Use for: Issue analysis, requirement extraction

**15. pr** (25K token budget)
- Triggers: pull request, pr, merge
- Context: COMMIT_GUIDELINES.md, workflow docs
- Use for: PR creation, description generation

### Task-Specific Agents

**16. quick-fix** (20K token budget)
- Triggers: quick fix, hotfix, small bug
- Context: START_HERE.md common tasks
- Use for: Rapid bug fixes, small improvements

**17. feature** (80K token budget)
- Triggers: feature, enhancement, new functionality
- Context: START_HERE.md, MODULES.md, PROJECT_STATUS.md
- Use for: New feature implementation

**18. verify** (20K token budget)
- Triggers: verify, validate, check
- Context: Testing requirements
- Use for: Verification, validation checks

**19. build** (25K token budget)
- Triggers: build, compile, bundle
- Context: next.config.js, package.json, tsconfig.json
- Use for: Build process, compilation issues

---

## 🚀 Slash Commands (12 Available)

Quick access to common workflows:

### Primary Commands

**`/test`** - Run complete test suite
```bash
# What it does:
- TypeScript type checking
- Jest unit tests with coverage
- Production build verification
- Security audit
- Reports results with fix suggestions

# When to use:
- Before committing
- After modifying core logic
- Before creating PR
```

**`/verify`** - Full health check
```bash
# Checks:
- Git status (uncommitted changes)
- TypeScript compilation
- ESLint validation
- Unit tests
- Production build
- Security audit
- Outdated dependencies
- Version consistency

# When to use:
- Before creating PR
- Before deploying
- After major refactoring
- Weekly health checks
```

**`/build`** - Production build verification
```bash
# What it does:
- Creates production build
- Checks errors/warnings
- Verifies build size
- Tests production server

# When to use:
- Before deploying
- After dependency updates
- After build config changes
```

**`/deploy`** - Version bump and deploy
```bash
# Workflow:
1. Asks for version type (patch/minor/major)
2. Runs full test suite
3. Executes deploy script
4. Verifies version bump
5. Pushes to GitHub (triggers Vercel)

# Won't deploy if tests fail
# Bug fixes → patch
# New features → minor
# Breaking changes → major
```

### Development Workflow Commands

**`/feature`** - Guided feature development
```bash
# Workflow:
1. Describe the feature
2. Create implementation plan
3. Review plan with user
4. Implement step-by-step
5. Write tests
6. Run test suite
7. Update documentation
8. Create git commit
9. Optionally create PR/deploy

# Use for: New features, major enhancements, multi-file changes
```

**`/quick-fix`** - Rapid bug fixes
```bash
# Workflow:
1. Describe the bug
2. Identify relevant files
3. Propose fix
4. Implement fix
5. Run related tests
6. Create commit
7. Optionally push/deploy

# Use for: Small bugs, single-file changes, hotfixes
```

### Domain-Specific Commands

**`/step`** - STEP file work
```bash
# Context loaded:
- step-generator.ts
- klimp-step-integration.ts
- lag-step-integration.ts
- step tests

# Use for: STEP export bugs, CAD integration, assembly issues
```

**`/nx`** - NX expression work
```bash
# Context loaded:
- nx-generator.ts
- crate-constants.ts
- NX tests
- API routes

# Use for: Parametric modeling, lumber size support, formulas
```

**`/3d`** - 3D visualization work
```bash
# Context loaded:
- CrateVisualizer.tsx
- KlimpModel.tsx
- 3D components

# Use for: 3D rendering, materials, lighting, performance
```

**`/lumber`** - Lumber configuration
```bash
# Context loaded:
- crate-constants.ts
- nx-generator.ts
- CrateVisualizer.tsx
- LumberCutList.tsx

# Use for: Adding lumber sizes, modifying dimensions
```

**`/hardware`** - Hardware systems
```bash
# Context loaded:
- klimp-calculator.ts
- lag-step-integration.ts
- KlimpModel.tsx

# Use for: Adding fasteners, placement logic, new hardware
```

**`/scenario`** - Crate scenarios
```bash
# Context loaded:
- ScenarioSelector.tsx

# Use for: Adding presets, industry configs, common use cases
```

---

## 🔄 Automated Workflow Examples

### Example 1: Bug Fix from Issue

**You provide:**
```
work on https://github.com/Shivam-Bhardwaj/AutoCrate/issues/95
```

**System automatically:**
1. Fetches issue #95 details via `gh issue view 95`
2. Analyzes issue (e.g., "Klimp placement off by 1 inch")
3. Creates branch: `fix/issue-95-klimp-placement`
4. Loads hardware agent context (klimp-calculator.ts)
5. Identifies bug in calculation
6. Fixes the issue
7. Runs tests: `npm test`
8. Commits: "fix: correct klimp placement calculation\n\nCloses #95"
9. Pushes: `git push -u origin fix/issue-95-klimp-placement`
10. Creates PR with description
11. Done - ready for review

**You only provided the issue link.**

### Example 2: Feature from Issue

**You provide:**
```
work on issue 87
```

**System automatically:**
1. Fetches issue #87: "Add panel stops feature"
2. Analyzes requirements
3. Creates: `feature/issue-87-panel-stops`
4. Plans implementation:
   - Create panel-stop-calculator.ts
   - Update STEP generator
   - Add 3D visualization
   - Write tests
5. Implements each step
6. Runs: `npm test && npm run build`
7. Commits: "feat: add panel stops to prevent panel collapse\n\nCloses #87"
8. Pushes to remote
9. Creates PR
10. Done

**Fully automated from issue link.**

### Example 3: Using Slash Commands

**You provide:**
```
/feature
> Add PDF export for crate specifications
```

**System automatically:**
1. Creates implementation plan
2. Reviews with you
3. Creates files:
   - src/lib/pdf-generator.ts
   - src/app/api/pdf-export/route.ts
   - UI button in main page
4. Writes tests
5. Updates docs
6. Asks: "Ready to commit?"
7. Creates commit
8. Asks: "Create PR?"
9. Done

---

## 🎨 Repository Structure & Best Practices

### File Organization

```
src/
├── app/                    # Next.js routes, layouts, server actions
│   ├── page.tsx           # Main UI + state management
│   └── api/               # API routes with co-located tests
├── components/            # Reusable UI components
│   └── __tests__/        # Component tests
└── lib/                   # Domain utilities, hooks, stores
    └── __tests__/        # Library tests

docs/                      # Acceptance documentation
scripts/                   # Automation helpers
public/                    # Public assets
CAD FILES/                 # Large geometry (not in bundle)
tests/e2e/                # Playwright E2E tests
```

### Code Style

- **TypeScript**: 2-space indentation, trailing commas
- **Naming**: camelCase locals, PascalCase components
- **React**: Functional components with hooks
- **CSS**: Tailwind utilities (CSS modules for gaps)
- **Linting**: eslint-config-next, Prettier, lint-staged Husky hooks

### Testing Guidelines

- **Unit tests**: `.test.ts` or `.test.tsx` beside feature or in `tests/`
- **E2E tests**: `tests/e2e/*.spec.ts`
- **Coverage**: Run `npm run test:coverage` after UI/state changes
- **Target**: ≥85% for lib/, ≥75% for components/

### Commit & PR Guidelines

- **Format**: Conventional Commits (feat:, fix:, docs:, etc.)
- **Scope**: One concern per commit
- **PR Description**: Impact summary, linked issues, executed checks
- **Screenshots**: Include for UI work
- **Blocking**: PR blocked until lint, type-check, Jest, Playwright pass

---

## 🔍 Agent Selection Logic

### Automatic Agent Routing (Current Implementation)

When you provide an issue link, the system:

1. **Fetches issue metadata** (title, labels, body)
2. **Analyzes keywords**:
   - "STEP", "export" → cad-export agent
   - "3D", "visualization" → 3d-viz agent
   - "UI", "button", "form" → ui agent
   - "test", "coverage" → testing agent
   - etc.
3. **Checks labels**:
   - `bug` + small scope → quick-fix agent
   - `bug` + large scope → feature agent
   - `enhancement` → feature agent
   - `3d` → 3d-viz agent
4. **Loads optimal context** for selected agent
5. **Executes workflow** with minimal tokens

### Manual Agent Selection

You can also specify:
```
Use the hardware agent to work on issue 95
/hardware
> Fix klimp placement
```

### Context Loading Strategy

**Before (naive approach):**
- Load entire codebase: 50-100K tokens
- Explore to find relevant files: 15-20 files read
- Total: 45K-60K tokens, 15-20 minutes

**After (agent system):**
- Load agent-specific context: 4-6 files
- Direct to relevant code
- Total: 12K-18K tokens, 5-10 minutes
- **Token savings: 70%**

---

## 🔧 Development Commands

### Daily Commands

```bash
# Health check
npm run type-check        # TypeScript validation
npm test                  # Jest unit tests
npm run build            # Production build
npm run security:scan    # Security audit

# Testing
npm run test:coverage    # Coverage report (≥80%)
npm run test:e2e         # Playwright E2E
npm run test:e2e:ui      # E2E with UI
npm run test:e2e:debug   # Debug E2E
npm run test:all         # All checks

# Development
npm install              # Refresh dependencies
npm run dev              # Hot-reload server
npm run lint             # ESLint
```

### Version Management

```bash
npm run version:patch    # Bug fix: 13.1.0 → 13.1.1
npm run version:minor    # Feature: 13.1.0 → 13.2.0
npm run version:major    # Breaking: 13.1.0 → 14.0.0
npm run version:sync     # Sync version across files
```

---

## 💡 Workflow Patterns

### Pattern 1: Issue → Fix → Deploy

```bash
# You
work on issue 123

# System does everything:
# - Fetch issue
# - Create branch
# - Implement fix
# - Test
# - Commit
# - Push
# - Create PR

# Done automatically
```

### Pattern 2: Feature Development

```bash
# You
/feature
> Add temperature marking system

# System:
# - Creates plan
# - Implements
# - Tests
# - Documents
# - Commits
# - Creates PR
```

### Pattern 3: Quick Hotfix

```bash
# You
/quick-fix
> Klimp placement off by 1 inch

# System:
# - Analyzes
# - Fixes
# - Tests
# - Commits
# - Pushes
```

### Pattern 4: Pre-Deployment Check

```bash
# You
/verify

# System checks:
# - Git status
# - TypeScript
# - Tests
# - Build
# - Security
# - Dependencies
# - Reports readiness
```

### Pattern 5: Complete Release

```bash
# You
/deploy

# System:
# - Runs tests
# - Bumps version
# - Commits
# - Pushes
# - Triggers Vercel
# - Done
```

---

## 🎯 Best Practices

### Do's ✅

1. **Always provide issue links** - Let automation handle the rest
2. **Use domain-specific commands** - `/step`, `/3d`, `/nx` etc.
3. **Run `/verify` before `/deploy`** - Catch issues early
4. **Let agents load context** - They know what files to read
5. **Chain commands** - `/feature` → `/test` → `/verify` → `/deploy`

### Don'ts ❌

1. **Don't manually explore** - Use agents for focused context
2. **Don't skip tests** - `/deploy` won't work without passing tests
3. **Don't force push to main** - System prevents this
4. **Don't bypass automation** - The workflow is optimized
5. **Don't commit without tests** - Pre-commit hooks enforce quality

---

## 📊 Performance Metrics

### Token Efficiency

| Task Type | Before Agents | After Agents | Savings |
|-----------|--------------|--------------|---------|
| Bug fix | 20K-50K | 10K-30K | 50-60% |
| Feature | 50K-150K | 40K-100K | 20-33% |
| Review | 30K-80K | 15K-40K | 50% |

### Time Efficiency

| Workflow | Manual | Automated | Savings |
|----------|--------|-----------|---------|
| Issue → Fix → PR | 30-60 min | 15-30 min | 50% |
| Feature → Deploy | 2-4 hours | 1-2 hours | 50% |
| Quick fix | 15-30 min | 5-10 min | 67% |

### Command Speed

| Command | Typical Time |
|---------|-------------|
| `/test` | 30 seconds |
| `/build` | 25 seconds |
| `/verify` | 60 seconds |
| `/deploy` | 90 seconds |

---

## 🆘 Troubleshooting

### Issue Workflow Not Working

**Check:**
```bash
# Verify gh CLI installed
gh --version

# Test issue fetch
gh issue view 123

# Check branch creation
git branch --show-current
```

### Agent Not Loading Correct Context

**Specify manually:**
```bash
Use the 3d-viz agent
/3d
```

### Tests Failing

**Debug:**
```bash
/test
# Review failures
# Fix issues
/test  # Run again
```

### Deploy Blocked

**Fix:**
```bash
/verify
# Address issues
/test
/verify
/deploy
```

---

## 📚 See Also

- **docs/START_HERE.md** - Primary entry point
- **docs/ARCHITECTURE.md** - Technical architecture
- **docs/TESTING_GUIDE.md** - Testing strategies
- **docs/CONTRIBUTING.md** - Development workflows
- **.claude/agents/registry.json** - Agent definitions
- **.claude/agents/README.md** - Agent documentation

---

## Quick Reference Card

**Standard Workflow:**
```
1. Open terminal
2. Provide: "work on issue #123"
3. Everything automated
4. Review PR when ready
```

**Commands:**
- `/test` - Before commit
- `/verify` - Before deploy
- `/deploy` - Ship it
- `/feature` - New functionality
- `/quick-fix` - Fast fixes

**Domain Commands:**
- `/step` - STEP files
- `/nx` - NX expressions
- `/3d` - 3D visualization
- `/lumber` - Lumber config
- `/hardware` - Hardware systems
- `/scenario` - Presets

**Remember:** Provide the issue link. The system handles the rest.
