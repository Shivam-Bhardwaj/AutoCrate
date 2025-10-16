# START HERE - AutoCrate LLM Development Guide

**Version**: 14.0.0
**Last Updated**: 2025-10-16
**Read Time**: 5 minutes
**Token Budget**: ~5K tokens

---

## 🚀 QUICK START (30 seconds)

```bash
# 1. Check your location
pwd  # Should be: /home/curious/workspace (or AutoCrate root)

# 2. See what branch you're on
git branch --show-current

# 3. Check for active work
cat PROJECT_STATUS.md | head -20

# 4. Start working
# Either: "work on issue #123"
# Or: "continue with feature/xyz branch"
```

---

## 📋 PROJECT ESSENTIALS

### What is AutoCrate?
A Next.js 14 application for designing shipping crates with:
- **3D visualization** using React Three Fiber
- **NX CAD expression** generation for parametric modeling
- **STEP file export** (ISO 10303-21 AP242 compliant)
- **Two-point diagonal construction** method (origin + dimensions)

### Core Technology Stack
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript 5 + Tailwind CSS
- **3D**: Three.js + React Three Fiber + Drei
- **Testing**: Jest 30 (unit) + Playwright 1.55 (E2E)
- **Development**: Husky 9 (git hooks) + lint-staged

### Key Coordinates & Conventions
```
Origin: (0,0,0) at center of crate floor
X-axis: Width (left/right)
Y-axis: Length (front/back)
Z-axis: Height (vertical)
Units: Inches (converted to mm for STEP export)
```

---

## 🎯 DEVELOPMENT WORKFLOW

### Issue-Driven Development (Primary)
```bash
# Standard flow
gh issue list                    # See open issues
gh issue view <number>           # Review details
git checkout -b feature/issue-<N>-brief-description
# ... make changes ...
npm test                         # Run tests
npm run build                    # Verify build
git add . && git commit -m "..."
git push -u origin HEAD
gh pr create                     # Auto-creates PR
```

### Branch Naming Convention
- Features: `feature/issue-N-description` or `feature/description`
- Bugs: `fix/issue-N-description` or `fix/description`
- Refactors: `refactor/description`
- Docs: `docs/description`

### Commit Message Format
```
type: Brief description (max 50 chars)

[Optional body with more details]

Closes #<issue-number>
```

**Types**: feat, fix, refactor, test, docs, chore, perf, style

---

## 📁 CRITICAL FILE LOCATIONS

### Primary Configuration
| File | Purpose | When to Read |
|------|---------|--------------|
| `src/lib/nx-generator.ts` | NX CAD generation, type definitions | Working with dimensions/geometry |
| `src/lib/step-generator.ts` | STEP file export | Working with CAD export |
| `src/lib/crate-constants.ts` | Hardcoded dimensions, material specs | Changing lumber sizes, materials |
| `src/app/page.tsx` | Main UI, state management | UI changes, component visibility |

### 3D Visualization
| File | Purpose |
|------|---------|
| `src/components/CrateVisualizer.tsx` | Main 3D component (R3F) |
| `src/components/KlimpModel.tsx` | Klimp fastener 3D models |
| `src/components/MarkingVisualizer.tsx` | Panel markings/stencils |

### Hardware & Calculations
| File | Purpose |
|------|---------|
| `src/lib/klimp-calculator.ts` | Klimp fastener placement algorithm |
| `src/lib/cleat-calculator.ts` | Cleat positioning logic |
| `src/lib/plywood-splicing.ts` | Plywood sheet optimization |

### Testing
| Location | Contents |
|----------|----------|
| `src/lib/__tests__/` | Core library unit tests |
| `src/components/__tests__/` | Component unit tests |
| `src/app/api/*/route.test.ts` | API route tests |
| `tests/e2e/` | Playwright E2E tests |

---

## 🧪 TESTING REQUIREMENTS

### Pre-Commit Checklist (Automated via Husky)
- ✅ TypeScript type checking on changed files
- ✅ Jest tests for related modules
- ✅ Prettier formatting (JSON/MD/YAML)
- ✅ ESLint validation

### Manual Testing Commands
```bash
npm test                    # All Jest tests
npm run test:coverage       # Coverage report
npm test:e2e               # Playwright E2E tests
npm run build              # Production build
npm run type-check         # TypeScript validation
```

### Coverage Targets (Current Goals)
- **src/lib/**: 85%+ coverage
- **src/components/**: 75%+ coverage
- **All modules**: Must have test files

---

## 🏗️ ARCHITECTURE PATTERNS

### State Management
- Component-level React state (hooks)
- Zustand for global theme state
- 500ms debounced inputs for real-time updates

### Coordinate System (Two-Point Construction)
```typescript
Point1: (0, 0, 0)              // Origin
Point2: (width, length, height) // Far corner

// All geometry derives from these two points
```

### STEP Assembly Hierarchy
```
AUTOCRATE CRATE ASSEMBLY
├── SHIPPING_BASE
│   ├── SKID_ASSEMBLY (4x4, 6x6, 8x8)
│   └── FLOORBOARD_ASSEMBLY (2x6, 2x8, etc.)
├── CRATE_CAP
│   ├── FRONT_PANEL_ASSEMBLY (plywood + cleats)
│   ├── BACK_PANEL_ASSEMBLY
│   ├── LEFT_PANEL_ASSEMBLY
│   ├── RIGHT_PANEL_ASSEMBLY
│   └── TOP_PANEL_ASSEMBLY
├── KLIMP_FASTENERS (L-shaped hardware)
└── STENCILS (markings/decals)
```

### Hardware Placement Rules
**Klimp Fasteners**:
- 18"-24" spacing between klimps
- Corner klimps at top panel edges
- Avoid cleat interference zones (+/- 2.5" from cleats)

**Cleats**:
- Based on panel height (taller panels = more cleats)
- Symmetric placement on left/right panels
- Vertical spacing prevents sagging

---

## 🔍 COMMON TASKS

### Add New Lumber Size
1. Update types in `src/lib/nx-generator.ts`
2. Modify skid/floorboard selection logic
3. Update 3D visualization meshes
4. Update `LumberCutList.tsx` display
5. Add unit tests

### Fix STEP Export Issue
1. Read `src/lib/__tests__/step-generator.test.ts` first
2. Check assembly hierarchy in `step-generator.ts`
3. Verify coordinate transformations (inches → mm)
4. Test with Playwright E2E test
5. Validate with CAD software if possible

### Modify 3D Visualization
1. Edit `src/components/CrateVisualizer.tsx`
2. Update material definitions (colors, opacity)
3. Adjust camera/lighting if needed
4. Test with different scenarios (`ScenarioSelector`)

### Add New Hardware Type
1. Create calculator: `src/lib/new-hardware-calculator.ts`
2. Create STEP integration: `src/lib/new-hardware-step-integration.ts`
3. Create 3D model: `src/components/NewHardwareModel.tsx`
4. Add tests: `src/lib/__tests__/new-hardware-calculator.test.ts`
5. Update STEP generator assembly structure

---

## 📚 EXTENDED DOCUMENTATION

### Deep Dives (read when needed)
- **ARCHITECTURE.md** - Complete technical architecture (800 lines)
- **TESTING_GUIDE.md** - Comprehensive testing strategy (400 lines)
- **AGENT_GUIDE.md** - Agent specialization matrix (600 lines)
- **CONTRIBUTING.md** - Development workflows & deployment (300 lines)

### Quick References
- **QUICK_REFERENCE.md** - Command cheatsheet (100 lines)
- **MODULES.md** - Module boundaries for parallel work
- **PROJECT_STATUS.md** - Active work tracking
- **WORK_LOG.md** - Session history

### Archives (rarely needed)
- `docs/archive/` - Platform-specific setup guides (RPI5, mobile, etc.)

---

## ⚡ TOKEN EFFICIENCY TIPS

### Smart File Reading
1. **Always check** PROJECT_STATUS.md first (shows what's active)
2. **Use Grep** before reading full files
3. **Read tests first** when fixing bugs (shows expected behavior)
4. **Avoid redundant reads** - context persists in session

### Context Loading Strategy
```
Bug fix workflow:
1. Read issue description (GitHub)
2. Read relevant test file
3. Grep for error/function name
4. Read only the specific file(s)
Total: 10K-30K tokens (vs 50K+ without strategy)

Feature workflow:
1. Read START_HERE.md (this file)
2. Check MODULES.md for boundaries
3. Read affected module files
4. Read related tests
Total: 40K-100K tokens (vs 150K+ unoptimized)
```

### Agent Specialization (Future)
- Geometry/CAD agent: Loads STEP/NX docs only
- UI agent: Loads component files + theme
- Testing agent: Loads test files + coverage
- Constants agent: Loads crate-constants.ts only

---

## 🚨 CRITICAL REMINDERS

### Always Do This ✅
- Read PROJECT_DNA.md if available (saves 30+ minutes)
- Run `npm test` before committing
- Run `npm run build` before pushing
- Use `gh` CLI for GitHub operations
- Follow commit message format
- Update version on user-facing changes

### Never Do This ❌
- Don't commit without tests passing
- Don't create new files unnecessarily (edit existing)
- Don't use line number references in docs (they go stale)
- Don't skip type checking
- Don't modify `.claude/settings.local.json` in commits
- Don't force push to main/master

### Emergency Recovery
```bash
# Stash conflicts
git stash

# Reset to remote
git fetch origin
git reset --hard origin/<branch>

# Check status
git status
npm test
```

---

## 🎯 SESSION CHECKLIST

Before you start coding:
- [ ] Read this file (START_HERE.md)
- [ ] Check git branch (`git branch --show-current`)
- [ ] Review PROJECT_STATUS.md for active work
- [ ] Understand the issue/task requirements
- [ ] Plan your approach (update todo list if complex)

Before you commit:
- [ ] Run `npm test` (all tests pass)
- [ ] Run `npm run build` (build succeeds)
- [ ] Run `npm run type-check` (no TS errors)
- [ ] Review changes (`git diff`)
- [ ] Write clear commit message

Before you push:
- [ ] Verify branch name follows convention
- [ ] Ensure tests are included for changes
- [ ] Check commit message format
- [ ] Run final `npm run build`
- [ ] Push and create PR (`gh pr create`)

---

## 📞 NEED HELP?

1. **GitHub Issues**: Check existing issues first
2. **Documentation**: Search docs/ directory
3. **Tests**: Read test files for expected behavior
4. **Code Search**: Use `grep -r "pattern" src/`
5. **Git History**: `git log --oneline --grep="keyword"`

---

**Next Steps**: Choose your task (issue or continuation), read relevant docs, start coding!
