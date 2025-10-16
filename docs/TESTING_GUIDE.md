# Testing Guide - LLM Optimized

**MACHINE_READABLE_METADATA**:
```json
{
  "purpose": "Complete testing automation for LLM-driven development",
  "target_audience": "LLM_ONLY",
  "automation_level": "FULL",
  "human_intervention": "NONE",
  "last_updated": "2025-10-16"
}
```

---

## Testing Workflow: FULLY AUTOMATED

**Command Pattern**: All testing automated via pre-commit hooks and slash commands

### Automated Test Execution Points

```json
{
  "pre_commit_hook": {
    "trigger": "git commit",
    "runs": ["tsc --noEmit", "jest --related", "prettier"],
    "blocks_commit_if": "any_failure",
    "file": ".husky/pre-commit"
  },
  "pre_push_validation": {
    "trigger": "git push",
    "runs": ["npm test", "npm run build"],
    "blocks_push_if": "any_failure",
    "manual_override": false
  },
  "issue_workflow": {
    "trigger": "work on issue #N",
    "auto_runs": ["npm test", "npm run build"],
    "before": "commit",
    "blocks_pr_if": "any_failure"
  }
}
```

---

## Test File Locations - EXACT PATHS

### Unit Tests (Jest)

```json
{
  "lib_tests": {
    "path": "src/lib/__tests__/",
    "files": [
      "cleat-calculator.test.ts",
      "input-validation.test.ts",
      "klimp-calculator.test.ts",
      "klimp-step-integration.test.ts",
      "nx-generator.test.ts",
      "panel-stop-calculator.test.ts",
      "plywood-splicing.test.ts",
      "rate-limiter.test.ts",
      "security.test.ts",
      "step-generator.test.ts",
      "step-integration.test.ts"
    ],
    "coverage_target": "85%",
    "must_pass": true
  },
  "component_tests": {
    "path": "src/components/__tests__/",
    "files": [
      "ChangeTracker.test.tsx",
      "CrateVisualizer.test.tsx",
      "ErrorBoundary.test.tsx",
      "KlimpModel.test.tsx",
      "LumberCutList.test.tsx",
      "MarkingVisualizer.test.tsx",
      "MarkingsSection.test.tsx",
      "PlywoodPieceSelector.test.tsx",
      "PlywoodSpliceVisualization.test.tsx",
      "ScenarioSelector.test.tsx",
      "ThemeProvider.test.tsx",
      "ThemeToggle.test.tsx"
    ],
    "coverage_target": "75%",
    "must_pass": true
  },
  "api_tests": {
    "pattern": "src/app/api/*/route.test.ts",
    "must_pass": true
  }
}
```

### E2E Tests (Playwright)

```json
{
  "e2e_tests": {
    "path": "tests/e2e/",
    "pattern": "*.spec.ts",
    "browsers": ["chromium", "firefox", "webkit"],
    "run_on": "feature_branches_only",
    "must_pass_before": "merge_to_main"
  }
}
```

---

## Test Execution Commands - EXACT SYNTAX

### Primary Commands

```bash
# Unit tests (automated in pre-commit)
npm test                          # All Jest tests
npm test -- --coverage           # With coverage report
npm test -- step-generator.test.ts  # Specific file
npm test -- --testNamePattern="should generate valid STEP"  # Specific test

# E2E tests (automated in feature workflow)
npm run test:e2e                 # All E2E tests
npm run test:e2e:ui              # Playwright UI mode
npm run test:e2e:debug           # Debug mode

# Type checking (automated in pre-commit)
npm run type-check               # TypeScript validation

# Build validation (automated pre-push)
npm run build                    # Production build

# Complete suite (automated in /verify command)
npm run test:all                 # All checks
```

### Automation Integration

```json
{
  "pre_commit": {
    "command": "npm run type-check && npm test -- --related",
    "timeout": 30000,
    "blocking": true
  },
  "pre_push": {
    "command": "npm test && npm run build",
    "timeout": 120000,
    "blocking": true
  },
  "pre_pr": {
    "command": "npm run test:all",
    "timeout": 180000,
    "blocking": true
  }
}
```

---

## Coverage Targets - MACHINE ENFORCEABLE

### File-Level Targets

```json
{
  "coverage_thresholds": {
    "src/lib/": {
      "statements": 85,
      "branches": 80,
      "functions": 85,
      "lines": 85,
      "enforce": true
    },
    "src/components/": {
      "statements": 75,
      "branches": 70,
      "functions": 75,
      "lines": 75,
      "enforce": true
    },
    "src/app/api/": {
      "statements": 85,
      "branches": 80,
      "functions": 85,
      "lines": 85,
      "enforce": true
    },
    "overall": {
      "statements": 80,
      "branches": 75,
      "functions": 80,
      "lines": 80,
      "enforce": true
    }
  }
}
```

### Expected Test Failures (PRE-EXISTING - IGNORE)

```json
{
  "known_failures": {
    "src/lib/__tests__/security.test.ts": {
      "failures": 5,
      "reason": "rate_limiting_bcrypt_mocking_issues",
      "ignore": true,
      "blocks_commit": false
    },
    "src/app/api/nx-export/route.test.ts": {
      "failures": 4,
      "reason": "headers_mocking_issues",
      "ignore": true,
      "blocks_commit": false
    },
    "src/app/api/calculate-crate/route.test.ts": {
      "failures": 3,
      "reason": "headers_mocking_issues",
      "ignore": true,
      "blocks_commit": false
    }
  }
}
```

---

## Test Patterns - LLM REFERENCE

### Unit Test Structure (Jest)

```typescript
// PATTERN: Unit test structure
describe('ModuleName', () => {
  describe('functionName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      const input = setupInput();

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });
});
```

**File naming**: `[module-name].test.ts` or `[module-name].test.tsx`
**Location**: Co-located with module or in `__tests__/` directory

### E2E Test Structure (Playwright)

```typescript
// PATTERN: E2E test structure
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should complete user workflow', async ({ page }) => {
    // Navigate
    await page.goto('http://localhost:3000');

    // Interact
    await page.fill('[data-testid="input"]', 'value');
    await page.click('[data-testid="button"]');

    // Assert
    await expect(page.locator('[data-testid="result"]')).toHaveText('expected');
  });
});
```

**File naming**: `[feature-name].spec.ts`
**Location**: `tests/e2e/`

---

## Automated Test Workflow - DECISION TREE

```json
{
  "workflow": {
    "on_file_change": {
      "step_1": "Identify changed files",
      "step_2": "Find related test files",
      "step_3": "Run related tests only",
      "step_4_if_fail": "Block commit, show errors",
      "step_4_if_pass": "Allow commit"
    },
    "on_commit": {
      "step_1": "Run TypeScript type checking",
      "step_2": "Run related Jest tests",
      "step_3": "Run Prettier on staged files",
      "step_4_if_fail": "Abort commit, show errors",
      "step_4_if_pass": "Complete commit"
    },
    "on_push": {
      "step_1": "Run full test suite",
      "step_2": "Run production build",
      "step_3_if_fail": "Abort push, show errors",
      "step_3_if_pass": "Allow push"
    },
    "on_pr_create": {
      "step_1": "Run npm run test:all",
      "step_2": "Run E2E tests",
      "step_3": "Generate coverage report",
      "step_4_if_fail": "Block PR merge",
      "step_4_if_pass": "Allow PR merge"
    }
  }
}
```

---

## Test Configuration - EXACT FILES

### Jest Configuration

```json
{
  "config_file": "jest.config.js",
  "setup_file": "jest.setup.js",
  "key_settings": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    },
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/__tests__/**"
    ],
    "coverageThresholds": "see_coverage_targets_above"
  }
}
```

### Playwright Configuration

```json
{
  "config_file": "playwright.config.ts",
  "key_settings": {
    "testDir": "./tests/e2e",
    "timeout": 30000,
    "retries": 2,
    "workers": 4,
    "use": {
      "baseURL": "http://localhost:3000",
      "screenshot": "only-on-failure",
      "video": "retain-on-failure"
    },
    "projects": [
      { "name": "chromium" },
      { "name": "firefox" },
      { "name": "webkit" }
    ]
  }
}
```

---

## Test Automation Hooks - EXACT FILES

### Pre-commit Hook

```bash
# FILE: .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# TypeScript type checking on changed files
npm run type-check

# Run related tests
npm test -- --related --passWithNoTests

# Prettier formatting
npx lint-staged
```

### Lint-staged Configuration

```json
{
  "config_file": "package.json",
  "key": "lint-staged",
  "rules": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "jest --bail --findRelatedTests --passWithNoTests"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

---

## Critical Test Files - MUST PASS

### Core Business Logic (BLOCKING)

```json
{
  "critical_tests": [
    {
      "file": "src/lib/__tests__/step-generator.test.ts",
      "purpose": "STEP file format validation",
      "blocks": "all_commits",
      "failure_impact": "CAD_export_broken"
    },
    {
      "file": "src/lib/__tests__/nx-generator.test.ts",
      "purpose": "Core calculation engine",
      "blocks": "all_commits",
      "failure_impact": "crate_design_broken"
    },
    {
      "file": "src/lib/__tests__/plywood-splicing.test.ts",
      "purpose": "Material optimization",
      "blocks": "all_commits",
      "failure_impact": "BOM_incorrect"
    },
    {
      "file": "src/lib/__tests__/klimp-calculator.test.ts",
      "purpose": "Hardware placement",
      "blocks": "all_commits",
      "failure_impact": "assembly_invalid"
    },
    {
      "file": "src/components/__tests__/CrateVisualizer.test.tsx",
      "purpose": "3D rendering",
      "blocks": "UI_changes",
      "failure_impact": "visualization_broken"
    }
  ]
}
```

---

## Test Execution Context - FOR LLM

### When to Run Which Tests

```json
{
  "test_execution_matrix": {
    "file_change_in_src/lib/": {
      "run": ["related_unit_tests", "type_check"],
      "skip": ["e2e_tests", "unrelated_component_tests"]
    },
    "file_change_in_src/components/": {
      "run": ["component_tests", "related_integration_tests", "type_check"],
      "skip": ["e2e_tests", "lib_tests"]
    },
    "file_change_in_src/app/": {
      "run": ["all_tests"],
      "skip": []
    },
    "before_commit": {
      "run": ["type_check", "related_unit_tests", "lint"],
      "skip": ["e2e_tests", "coverage"]
    },
    "before_push": {
      "run": ["all_unit_tests", "type_check", "build"],
      "skip": ["e2e_tests"]
    },
    "before_pr": {
      "run": ["all_tests", "e2e_tests", "coverage"],
      "skip": []
    }
  }
}
```

---

## Debugging Failed Tests - AUTOMATION STEPS

```json
{
  "debug_workflow": {
    "step_1_identify": {
      "command": "npm test",
      "parse_output": "extract_failed_test_names"
    },
    "step_2_isolate": {
      "command": "npm test -- [failed-test-file].test.ts",
      "parse_output": "extract_error_message"
    },
    "step_3_analyze": {
      "check": [
        "is_test_in_known_failures_list",
        "is_mock_outdated",
        "is_snapshot_stale",
        "is_dependency_changed"
      ]
    },
    "step_4_fix": {
      "if_known_failure": "ignore",
      "if_snapshot_stale": "npm test -- -u",
      "if_mock_outdated": "update_mock_in_jest.setup.js",
      "if_dependency_changed": "update_test_assertions"
    },
    "step_5_verify": {
      "command": "npm test -- [fixed-test-file].test.ts",
      "expect": "all_pass"
    }
  }
}
```

---

## Coverage Report - AUTOMATION

### Generate Coverage

```bash
# Command
npm run test:coverage

# Output location
coverage/lcov-report/index.html

# Machine-readable output
coverage/lcov.info
coverage/coverage-final.json
```

### Parse Coverage Data

```json
{
  "coverage_automation": {
    "parse_file": "coverage/coverage-final.json",
    "extract_metrics": [
      "total.statements.pct",
      "total.branches.pct",
      "total.functions.pct",
      "total.lines.pct"
    ],
    "compare_against": "coverage_thresholds",
    "if_below_threshold": {
      "action": "block_pr",
      "message": "Coverage below threshold. Required: X%, Actual: Y%"
    }
  }
}
```

---

## Test Data Patterns - FOR MOCKING

### Mock Data Locations

```json
{
  "mock_data": {
    "jest_mocks": "test/__mocks__/",
    "jest_setup": "jest.setup.js",
    "playwright_fixtures": "tests/e2e/fixtures/",
    "sample_configs": "test/fixtures/sample-configs.json"
  }
}
```

### Common Mocks

```typescript
// PATTERN: Mock Three.js (jest.setup.js)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// PATTERN: Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// PATTERN: Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);
```

---

## Continuous Testing Strategy - LLM WORKFLOW

```json
{
  "continuous_testing": {
    "on_issue_assignment": {
      "step_1": "Fetch issue details",
      "step_2": "Identify affected modules",
      "step_3": "Read relevant test files",
      "step_4": "Understand expected behavior from tests",
      "step_5": "Implement fix",
      "step_6": "Run related tests",
      "step_7_if_pass": "Commit and push",
      "step_7_if_fail": "Revise implementation, goto step_6"
    },
    "test_first_approach": {
      "for_bug_fix": {
        "step_1": "Write failing test reproducing bug",
        "step_2": "Verify test fails",
        "step_3": "Fix bug",
        "step_4": "Verify test passes",
        "step_5": "Run full test suite",
        "step_6": "Commit"
      },
      "for_feature": {
        "step_1": "Write tests for new feature",
        "step_2": "Verify tests fail (no implementation)",
        "step_3": "Implement feature",
        "step_4": "Verify tests pass",
        "step_5": "Run full test suite",
        "step_6": "Commit"
      }
    }
  }
}
```

---

## Quick Reference - EXACT COMMANDS

```json
{
  "commands": {
    "run_all_tests": "npm test",
    "run_with_coverage": "npm run test:coverage",
    "run_specific_file": "npm test -- [filename].test.ts",
    "run_specific_test": "npm test -- --testNamePattern='test name'",
    "update_snapshots": "npm test -- -u",
    "clear_cache": "npx jest --clearCache",
    "run_e2e": "npm run test:e2e",
    "run_e2e_ui": "npm run test:e2e:ui",
    "run_e2e_debug": "npm run test:e2e:debug",
    "type_check": "npm run type-check",
    "build": "npm run build",
    "verify_all": "npm run test:all"
  }
}
```

---

## Automation Manifest - COMPLETE TESTING PIPELINE

```json
{
  "testing_pipeline": {
    "trigger": "git_commit",
    "stages": [
      {
        "name": "pre_commit_validation",
        "runs": ["tsc --noEmit", "jest --related", "prettier"],
        "blocking": true,
        "timeout": 30000
      },
      {
        "name": "commit",
        "condition": "pre_commit_validation_passed"
      },
      {
        "name": "pre_push_validation",
        "trigger": "git_push",
        "runs": ["npm test", "npm run build"],
        "blocking": true,
        "timeout": 120000
      },
      {
        "name": "push",
        "condition": "pre_push_validation_passed"
      },
      {
        "name": "pr_validation",
        "trigger": "pr_create",
        "runs": ["npm run test:all", "npm run test:e2e"],
        "blocking": true,
        "timeout": 300000
      },
      {
        "name": "merge",
        "condition": "pr_validation_passed"
      },
      {
        "name": "deployment",
        "trigger": "merge_to_main",
        "runs": ["npm run build"],
        "deploy_to": "vercel",
        "auto": true
      }
    ]
  }
}
```

---

## See Also

- **docs/START_HERE.md** - LLM entry point
- **docs/ARCHITECTURE.md** - Technical architecture
- **docs/AGENT_GUIDE.md** - Automation workflows
- **docs/CONTRIBUTING.md** - Development automation
- **jest.config.js** - Jest configuration
- **playwright.config.ts** - Playwright configuration
- **.husky/pre-commit** - Pre-commit hook
