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

- [ ] Move to `docs/archive/`: RPI5_SETUP.md, RPI5_CLAUDE_PROMPTS.md
- [ ] Move to `docs/archive/`: MOBILE_WORKFLOW.md, KEELYN_GUIDE.md
- [ ] Move to `docs/archive/`: PORTABILITY_GUIDE.md, SETUP_COLLABORATOR.md
- [ ] Move to `docs/archive/`: UNIVERSAL_SETUP_PROMPT.md
- [ ] Move to `docs/archive/`: lag_screw_todo.md, PR_COMMANDS.md

**Update Root README**:

- [ ] Streamline README.md (user-facing, 200 lines max)
- [ ] Add clear links to docs/ structure
- [ ] Remove developer-specific content

**Token Savings**: 10,813 lines → ~2,700 lines (75% reduction)

---

## PHASE 2: AGENT SPECIALIZATION SYSTEM ⏳

### 2.1 Agent Registry & Routing

- [ ] Create `.claude/agents/registry.json` - Central agent definitions
- [ ] Create `.claude/agents/README.md` - Agent documentation
- [ ] Define 18 agents with triggers, context files, token budgets
- [ ] Map issue labels → agents (geometry, 3d-viz, cad-export, etc.)

### 2.2 Smart Agent Commands

- [ ] Update `/geometry` with context budget limits
- [ ] Update `/3d` with focused file list
- [ ] Update `/step` with STEP-specific context
- [ ] Update `/nx` with calculation-focused context
- [ ] Create `/ui` for React/frontend work
- [ ] Create `/testing` for test development
- [ ] Create `/constants` for crate-constants.ts work

### 2.3 Auto-Router System

- [ ] Create `.claude/commands/route-issue.md` - Auto-detect agent from issue
- [ ] Create `.claude/commands/smart-branch.md` - Suggest branch names
- [ ] Create `.claude/commands/impact.md` - Change impact analysis
- [ ] Update `/start-work` to use smart routing

---

## PHASE 3: TEST COVERAGE MAXIMIZATION ⏳

### 3.1 Add Missing Tests (6 files currently untested)

- [ ] Create `src/lib/__tests__/input-validation.test.ts`
- [ ] Create `src/lib/__tests__/rate-limiter.test.ts`
- [ ] Create `src/components/__tests__/ThemeToggle.test.tsx`
- [ ] Create `src/components/__tests__/LumberCutList.test.tsx`
- [ ] Create `src/components/__tests__/KlimpModel.test.tsx`
- [ ] Create `src/components/__tests__/ChangeTracker.test.tsx`

### 3.2 Enhance Existing Tests

- [ ] Add edge cases to `nx-generator.test.ts`
- [ ] Add integration tests for full workflow paths
- [ ] Add performance benchmarks for calculators
- [ ] Add snapshot tests for 3D components
- [ ] Add E2E tests for critical user journeys

### 3.3 Modernize Test Infrastructure

- [ ] Configure Jest coverage thresholds (85% target)
- [ ] Add Vitest for fast unit testing (optional parallel)
- [ ] Configure test parallelization
- [ ] Add visual regression testing with Playwright CT
- [ ] Add mutation testing with Stryker (optional)

### 3.4 Test Documentation

- [ ] Update `docs/TESTING_GUIDE.md` with all patterns
- [ ] Document test data factories
- [ ] Add testing best practices
- [ ] Create test template files

---

## PHASE 4: MODULE ISOLATION & BOUNDARIES ⏳

### 4.1 Micro-Module Refactoring

**Target**: `src/lib/nx-generator.ts` (2200 lines → split into modules)

- [ ] Analyze nx-generator.ts structure
- [ ] Create `src/lib/generators/` directory
- [ ] Split: `core-generator.ts` (orchestration, 400 lines)
- [ ] Split: `skid-generator.ts` (skid calculations, 300 lines)
- [ ] Split: `panel-generator.ts` (panel calculations, 400 lines)
- [ ] Split: `cleat-generator.ts` (cleat logic, 250 lines)
- [ ] Split: `floorboard-generator.ts` (floor logic, 250 lines)
- [ ] Split: `dimension-calculator.ts` (clearances, sizing, 300 lines)
- [ ] Create `src/lib/generators/index.ts` (facade pattern)
- [ ] Update all imports across codebase
- [ ] Verify all tests still pass

### 4.2 Module Contracts

- [ ] Create `src/lib/contracts/` directory
- [ ] Define `IGeometryModule` interface
- [ ] Define `ICalculatorModule` interface
- [ ] Define `IExportModule` interface
- [ ] Update modules to implement contracts
- [ ] Add contract compliance tests

### 4.3 Dependency Injection

- [ ] Refactor constructors to accept interfaces
- [ ] Create module factory pattern
- [ ] Update tests to use mocks via DI
- [ ] Document DI patterns in ARCHITECTURE.md

### 4.4 Module Mapping

- [ ] Create `.claude/maps/` directory
- [ ] Generate `module-map.json` (dependencies, tokens, safety)
- [ ] Generate `api-map.json` (all API endpoints)
- [ ] Generate `component-map.json` (all React components)
- [ ] Generate `type-map.json` (all TypeScript interfaces)
- [ ] Create script to auto-update maps

---

## PHASE 5: TOKEN OPTIMIZATION STRATEGIES ⏳

### 5.1 Smart Context Loading

- [ ] Create `.claude/context-loader.ts`
- [ ] Implement task→context mapper
- [ ] Create context presets for common tasks
- [ ] Add section anchor navigation
- [ ] Cache frequently used contexts

### 5.2 Documentation Sectioning

- [ ] Add table of contents to all docs
- [ ] Add section IDs: `## Section {#anchor-name}`
- [ ] Test anchor navigation
- [ ] Update commands to use anchors
- [ ] Remove line number references

### 5.3 Reading Pattern Guide

- [ ] Create `.claude/reading-patterns.md`
- [ ] Document function-level reading
- [ ] Document test-driven exploration
- [ ] Document progressive disclosure pattern
- [ ] Add token cost examples

### 5.4 File Discovery Optimization

- [ ] Create grep cheatsheet for common queries
- [ ] Add file naming conventions guide
- [ ] Create quick reference for file locations
- [ ] Document when to use Glob vs Grep vs Read

---

## PHASE 6: AUTOMATED AGENT ROUTING ⏳

### 6.1 GitHub Issue Automation

- [ ] Create `.github/workflows/issue-router.yml`
- [ ] Auto-comment agent recommendations on issues
- [ ] Auto-label issues based on content
- [ ] Suggest relevant files to check
- [ ] Add test requirement checklist

### 6.2 PR Automation Enhancements

- [ ] Auto-comment required tests on PRs
- [ ] Block merge if coverage drops
- [ ] Suggest reviewing agents based on files changed
- [ ] Add performance impact analysis

### 6.3 Branch Automation

- [ ] Update `/start-work` with smart branch naming
- [ ] Auto-create issue tracking comment
- [ ] Pre-load relevant context files
- [ ] Set estimated token budget

---

## PHASE 7: DEVELOPMENT TOOLING ⏳

### 7.1 Code Generation Tools

- [ ] Create test generator: `scripts/generate-test.ts`
- [ ] Create component generator: `scripts/generate-component.ts`
- [ ] Create calculator generator: `scripts/generate-calculator.ts`
- [ ] Add templates for common patterns

### 7.2 Analysis Tools

- [ ] Create `scripts/analyze-token-usage.ts`
- [ ] Create `scripts/generate-dep-graph.ts`
- [ ] Create `scripts/find-untested-code.ts`
- [ ] Create `scripts/check-doc-freshness.ts`

### 7.3 Automation Scripts

- [ ] Create `scripts/update-module-maps.ts`
- [ ] Add pre-commit hook for map updates
- [ ] Create `scripts/validate-docs.ts`
- [ ] Add CI job for documentation validation

---

## PHASE 8: CONSTANT EXTRACTION ⏳

### 8.1 Audit Remaining Magic Numbers

- [ ] Search for hardcoded values in src/lib/
- [ ] Search for hardcoded values in src/components/
- [ ] Identify all remaining magic numbers
- [ ] Categorize by domain (UI, geometry, materials, etc.)

### 8.2 Add to crate-constants.ts

- [ ] Add 3D rendering constants (positions, scales)
- [ ] Add API timing constants
- [ ] Add validation thresholds
- [ ] Add UI spacing/sizing constants
- [ ] Document each constant thoroughly

### 8.3 Refactor to Use Constants

- [ ] Update all files to import from crate-constants
- [ ] Remove inline magic numbers
- [ ] Verify tests still pass
- [ ] Update documentation

---

## PHASE 9: CONTINUOUS INTEGRATION ⏳

### 9.1 Enhanced Pre-commit Hooks

- [ ] Add module map validation
- [ ] Add documentation freshness check
- [ ] Add test coverage check
- [ ] Add unused import detection

### 9.2 CI/CD Optimizations

- [ ] Parallel test execution in CI
- [ ] Cache test results
- [ ] Smart test selection (only affected tests)
- [ ] Performance regression detection

---

## 📊 PROGRESS TRACKING

**Overall Progress**: 0/150 tasks completed

**By Phase**:

- Phase 1 (Documentation): 0/18 ✅
- Phase 2 (Agents): 0/11 ✅
- Phase 3 (Testing): 0/14 ✅
- Phase 4 (Modules): 0/21 ✅
- Phase 5 (Tokens): 0/14 ✅
- Phase 6 (Automation): 0/9 ✅
- Phase 7 (Tooling): 0/11 ✅
- Phase 8 (Constants): 0/9 ✅
- Phase 9 (CI/CD): 0/7 ✅

---

## 🚀 EXECUTION STRATEGY

### Session 1 (Current - 1 hour)

Focus on quick wins and foundation:

1. Create branch + this TODO file
2. Create docs/ structure
3. Add 6 missing test files
4. Create agent registry
5. Consolidate top-priority docs

### Session 2

1. Complete documentation consolidation
2. Module splitting (nx-generator.ts)
3. Update all cross-references

### Session 3

1. Automation systems
2. Token optimization
3. Final testing and validation

**Can pause and resume at any phase - all work is atomic and tested**
