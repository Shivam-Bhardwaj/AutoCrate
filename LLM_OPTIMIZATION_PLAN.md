# LLM Development Optimization - Master Plan

**Branch**: `refactor/llm-optimization`
**Started**: 2025-10-16
**Status**: IN PROGRESS
**Goal**: Maximize LLM development efficiency through documentation consolidation, test coverage, and agent specialization

---

## 🎯 SUCCESS METRICS

### Documentation Efficiency
- [ ] Reduce 25 MD files → 8 focused files (75% reduction)
- [ ] Initial context load: 5K tokens (currently ~15K)
- [ ] Zero stale line number references
- [ ] All docs have section anchors for precise loading

### Test Coverage
- [ ] 85%+ coverage on `src/lib/`
- [ ] 75%+ coverage on `src/components/`
- [ ] 100% of modules have tests (6 files currently missing)
- [ ] Test suite runs in < 30 seconds

### Token Efficiency
- [ ] Bug fixes: 10K-30K tokens (currently 20K-50K)
- [ ] Features: 40K-100K tokens (currently 50K-150K)
- [ ] Agent finds exact files in < 2 queries
- [ ] Zero redundant file reads per session

### Development Speed
- [ ] Issue → Fix → PR: < 30 minutes
- [ ] Support 3+ agents working in parallel
- [ ] Agent auto-routing from issue labels
- [ ] Smart context preloading

---

## PHASE 1: DOCUMENTATION CONSOLIDATION ⏳

### 1.1 Create New Tiered Structure
- [x] Create `LLM_OPTIMIZATION_PLAN.md` - Master TODO tracking
- [ ] Create `docs/START_HERE.md` (300 lines) - Session entry point
- [ ] Create `docs/AGENT_GUIDE.md` (600 lines) - Agent specialization matrix
- [ ] Create `docs/ARCHITECTURE.md` (800 lines) - Deep technical details
- [ ] Create `docs/TESTING_GUIDE.md` (400 lines) - Complete testing strategy
- [ ] Create `docs/CONTRIBUTING.md` (300 lines) - Development workflows
- [ ] Create `QUICK_REFERENCE.md` (100 lines) - Command cheatsheet

### 1.2 Consolidate Existing Documentation
**Merge Operations**:
- [ ] CLAUDE.md + PROJECT_DNA.md + MODULES.md → `docs/ARCHITECTURE.md`
- [ ] AGENTS.md + CLAUDE_AGENTS_GUIDE.md → `docs/AGENT_GUIDE.md`
- [ ] TESTING.md → `docs/TESTING_GUIDE.md` (enhance)
- [ ] PARALLEL_WORKFLOW.md + QUICKSTART_PARALLEL.md → `docs/CONTRIBUTING.md`
- [ ] DEPLOYMENT.md + COMMIT_GUIDELINES.md → `docs/CONTRIBUTING.md` (workflows section)

**Archive Obsolete**:
- [ ] Create `docs/archive/` directory
- [ ] Move: RPI5_SETUP.md, RPI5_CLAUDE_PROMPTS.md
- [ ] Move: MOBILE_WORKFLOW.md, KEELYN_GUIDE.md
- [ ] Move: PORTABILITY_GUIDE.md, SETUP_COLLABORATOR.md
- [ ] Move: UNIVERSAL_SETUP_PROMPT.md, QUICK_START.md
- [ ] Move: lag_screw_todo.md, PR_COMMANDS.md

**Update Root README**:
- [ ] Streamline README.md (user-facing, 200 lines max)
- [ ] Add clear links to docs/ structure

---

## PHASE 2: TEST COVERAGE - QUICK WINS ⏳

### 2.1 Add 6 Missing Test Files
- [ ] `src/lib/__tests__/input-validation.test.ts`
- [ ] `src/lib/__tests__/rate-limiter.test.ts`
- [ ] `src/components/__tests__/ThemeToggle.test.tsx`
- [ ] `src/components/__tests__/LumberCutList.test.tsx`
- [ ] `src/components/__tests__/KlimpModel.test.tsx`
- [ ] `src/components/__tests__/ChangeTracker.test.tsx`

### 2.2 Configure Coverage Thresholds
- [ ] Update `jest.config.js` with 85% target for src/lib/
- [ ] Add coverage reporting to CI
- [ ] Generate coverage badge

---

## PHASE 3: AGENT REGISTRY SYSTEM ⏳

### 3.1 Core Registry
- [ ] Create `.claude/agents/` directory
- [ ] Create `.claude/agents/registry.json` - Agent definitions
- [ ] Create `.claude/agents/README.md` - Agent documentation

### 3.2 Agent Definitions (18 total)
Map each agent with:
- Triggers (keywords/labels)
- Context files to load
- Token budget
- Specialization area

Agents:
- [ ] geometry, 3d-viz, cad-export, ui, testing
- [ ] nx, step, lumber, hardware, scenario
- [ ] constants, deployment, review, issue, pr
- [ ] quick-fix, feature, verify, build

### 3.3 Smart Commands
- [ ] Create `/ui` command for React/frontend
- [ ] Create `/testing` command for test development
- [ ] Create `/constants` command for crate-constants.ts
- [ ] Update existing commands with token budgets

---

## PHASE 4: MODULE MAPS & ANALYSIS ⏳

### 4.1 Create Analysis Scripts
- [ ] `scripts/generate-module-map.ts` - Dependency analysis
- [ ] `scripts/find-untested-code.ts` - Coverage gaps
- [ ] `scripts/analyze-imports.ts` - Import graph

### 4.2 Generate Maps
- [ ] `.claude/maps/module-map.json`
- [ ] `.claude/maps/api-map.json`
- [ ] `.claude/maps/component-map.json`
- [ ] `.claude/maps/type-map.json`

---

## SESSION 1 FOCUS (Next 60 minutes)

**Priority Tasks**:
1. [x] Create branch
2. [x] Create LLM_OPTIMIZATION_PLAN.md
3. [ ] Create docs/ directory + START_HERE.md
4. [ ] Add 4-6 missing test files
5. [ ] Create agent registry
6. [ ] Initial commit and push

**Estimated**: 40-50 commits total across all sessions
**This Session**: 8-12 commits
**Token Budget**: Working within efficient limits

---

## 📊 PROGRESS: 2/150 tasks (1%)