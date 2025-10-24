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
- [x] Create `docs/START_HERE.md` (300 lines) - Session entry point
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

- [x] Create `docs/archive/` directory
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

- [x] `src/lib/__tests__/input-validation.test.ts` (already exists)
- [x] `src/lib/__tests__/rate-limiter.test.ts` (already exists)
- [x] `src/components/__tests__/ThemeToggle.test.tsx` (already exists)
- [x] `src/components/__tests__/LumberCutList.test.tsx` (already exists)
- [x] `src/components/__tests__/KlimpModel.test.tsx` (already exists)
- [x] `src/components/__tests__/ChangeTracker.test.tsx` (already exists)

### 2.2 Configure Coverage Thresholds

- [ ] Update `jest.config.js` with 85% target for src/lib/
- [ ] Add coverage reporting to CI
- [ ] Generate coverage badge

---

## PHASE 3: AGENT REGISTRY SYSTEM ⏳

### 3.1 Core Registry

- [x] Create `.claude/agents/` directory
- [x] Create `.claude/agents/registry.json` - Agent definitions
- [x] Create `.claude/agents/README.md` - Agent documentation
- [x] Create `.claude/agents/schema.json` - JSON schema for validation

### 3.2 Agent Definitions (19 total)

Map each agent with:

- Triggers (keywords/labels)
- Context files to load
- Token budget
- Specialization area

Agents:

- [x] geometry, 3d-viz, cad-export, ui, testing
- [x] nx, step, lumber, hardware, scenario
- [x] constants, deployment, review, issue, pr
- [x] quick-fix, feature, verify, build

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
3. [x] Create docs/ directory + START_HERE.md
4. [x] Add 4-6 missing test files (already existed)
5. [x] Create agent registry (19 agents defined)
6. [ ] Initial commit and push

**Estimated**: 40-50 commits total across all sessions
**This Session**: 8-12 commits
**Token Budget**: Working within efficient limits

---

## 📊 PROGRESS: PHASE 1 COMPLETE - 35/150 tasks (23%)

**Latest Session (2025-10-16) - LLM-ONLY OPTIMIZATION**:

- ✅ Created docs/START_HERE.md (5K token entry point)
- ✅ Created QUICK_REFERENCE.md (2K token ultra-condensed guide)
- ✅ Created docs/AGENT_GUIDE.md (full automation workflows)
- ✅ Created docs/ARCHITECTURE.md (technical deep dive)
- ✅ Created docs/TESTING_GUIDE.md (testing automation)
- ✅ Created docs/CONTRIBUTING.md (development workflows)
- ✅ Created agent registry system (19 specialized agents)
- ✅ Verified all test files exist
- ✅ Set up directory structure (.claude/agents/, docs/archive/)
- ✅ Archived 20+ old documentation files
- ✅ Optimized for LLM-ONLY consumption (zero human readability needed)

**NEW STRATEGY**: Documentation optimized for lightweight LLMs

- Any LLM can take just an issue link and know exactly what to do
- Machine-readable JSON metadata in all docs
- Total entry context: ~7K tokens (START_HERE + QUICK_REFERENCE)
- Full automation from issue → deployment

**Remaining Core Documentation (ACTIVE)**:

1. README.md (user-facing)
2. QUICK_REFERENCE.md (2K tokens - LLM entry)
3. LLM_OPTIMIZATION_PLAN.md (progress tracking)
4. CHANGELOG.md (version history)
5. SECURITY.md (security policy)
6. docs/START_HERE.md (5K tokens - main entry)
7. docs/AGENT_GUIDE.md (automation details)
8. docs/ARCHITECTURE.md (technical)
9. docs/TESTING_GUIDE.md (testing)
10. docs/CONTRIBUTING.md (workflows)

**Archived Documentation (docs/archive/)**: 20+ files

**Next Steps**:

- Create smart slash commands
- Add automation manifest
- Implement agent auto-routing based on issue labels
