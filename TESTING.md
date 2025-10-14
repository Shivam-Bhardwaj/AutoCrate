# AutoCrate Testing Architecture

## Overview

This project implements a comprehensive testing strategy to ensure code quality and prevent errors from reaching production.

## Testing Stack

- **Unit Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright
- **Pre-commit Hooks**: Husky + lint-staged
- **Type Checking**: TypeScript
- **Build Validation**: Next.js production build

## Quick Start

### Run All Tests

```bash
npm run test:all
```

### Run Specific Test Types

#### Unit Tests

```bash
npm test                # Run once
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage
```

#### E2E Tests

```bash
npm run test:e2e        # Run E2E tests
npm run test:e2e:ui     # Open Playwright UI
npm run test:e2e:debug  # Debug mode
```

#### Type Checking

```bash
npm run type-check
```

## Test Structure

### Unit Tests (`/src/**/__tests__`)

- Component tests
- Library function tests
- Utility tests
- STEP file generator tests

### E2E Tests (`/tests/e2e`)

- User workflow tests
- File download verification
- Cross-browser testing
- Mobile responsiveness
- Accessibility tests
- Performance tests

## Error Handling

### Error Boundaries

- Global error boundary in layout
- Specialized 3D visualization error boundary
- Graceful error recovery with user-friendly messages

### Pre-commit Validation

Automatically runs before every commit:

1. TypeScript type checking
2. Related unit tests
3. Code formatting

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:all
      - run: npm run test:e2e
```

## Test Coverage

Professional software standards require comprehensive test coverage. Our targets:

### Core Business Logic (Critical)

- **Target**: 90%+ coverage
- **Modules**:
  - `src/lib/nx-generator.ts`
  - `src/lib/step-generator.ts`
  - `src/lib/plywood-splicing.ts`
  - `src/lib/cleat-calculator.ts`
  - `src/lib/klimp-calculator.ts`
- **Status**: [DONE] Achieved (90%+ coverage)

### API Routes (High Priority)

- **Target**: 85%+ coverage
- **Modules**: All files in `src/app/api/*/route.ts`
- **Status**: [DONE] Achieved (85%+ coverage)

### Components (Medium Priority)

- **Target**: 80%+ coverage
- **Modules**: All files in `src/components/`
- **Status**: [WARNING] In Progress (currently ~75%)

### Overall Project

- **Target**: 80%+ overall coverage
- **Current**: ~78% (up from 75%)
- **Goal**: Achieve 85%+ for professional-grade reliability

### Coverage Breakdown

- **Statements**: 78%+ (Target: 85%)
- **Branches**: 60%+ (Target: 75%)
- **Functions**: 65%+ (Target: 80%)
- **Lines**: 78%+ (Target: 85%)

### How to Check Coverage

```bash
npm run test:coverage
```

This generates a detailed report in `coverage/lcov-report/index.html`

## Common Testing Commands

### Fix Test Issues

```bash
# Update snapshots
npm test -- -u

# Clear Jest cache
npx jest --clearCache

# Install Playwright browsers
npx playwright install

# Run specific test file
npm test -- step-generator.test.ts
```

## Testing Best Practices

### 1. Test-Driven Development (TDD)

- Write tests before fixing bugs to ensure regressions don't occur
- Start with failing test, implement feature, verify test passes
- Red → Green → Refactor workflow

### 2. Focus on User Behavior

- Test what users do, not internal implementation details
- Use data-testid sparingly; prefer testing by text content or role
- Avoid testing private methods or internal state

### 3. Test Isolation

- Each test should be completely independent
- Clean up after tests (localStorage, mocks, DOM state)
- Use beforeEach/afterEach for setup and teardown

### 4. Descriptive Test Names

- Use "should [expected behavior] when [condition]" format
- Example: "should display error message when API call fails"
- Make test failures self-documenting

### 5. Mock External Dependencies

- Mock API calls, timers, and browser APIs
- Tests should be fast (<1s per test) and reliable
- Use jest.fn() and jest.mock() appropriately

### 6. Test Edge Cases

- Empty arrays and null/undefined values
- Very large datasets and boundary conditions
- Error states and loading states
- Accessibility edge cases (keyboard navigation, screen readers)

### 7. Maintain Coverage Standards

- **Critical paths**: 95%+ coverage (payment, data export, calculations)
- **Core business logic**: 90%+ coverage
- **UI components**: 80%+ coverage
- **Utility functions**: 100% coverage (these are easy to test)

### 8. Continuous Integration

- All tests must pass before merge
- Pre-commit hooks catch issues early
- Coverage reports tracked over time

## Known Issues & Solutions

### Issue: STEP file syntax errors

**Solution**: Unit tests now validate STEP file structure before deployment

### Issue: 3D visualization crashes

**Solution**: Error boundary catches and displays fallback UI

### Issue: Build failures

**Solution**: Pre-commit hooks prevent broken code from being committed

## Professional Testing Standards

### Why Professional-Grade Testing Matters

1. **Prevents Regressions**: Ensures new features don't break existing functionality
2. **Enables Confident Refactoring**: Code can be improved without fear
3. **Documents Behavior**: Tests serve as executable documentation
4. **Reduces Debugging Time**: Issues caught early are easier and cheaper to fix
5. **Improves Code Design**: Testable code is usually better-designed code

### Current Test Suite Stats

- **Total Tests**: 80+ unit tests, 5+ E2E tests
- **Test Execution Time**: <15 seconds (unit), <2 minutes (E2E)
- **Flakiness**: <1% (target: 0%)
- **Coverage**: 78%+ overall

### Testing Pyramid

```
      /\
     /  \    E2E Tests (5%)
    /    \   - Full user workflows
   /------\  - Critical paths only
  /        \
 /  Integration (15%)
/__________\ - API route tests
            \ - Component integration
             \
              \ Unit Tests (80%)
               - Pure functions
               - Business logic
               - Component units
```

### What Gets Tested

#### [DONE] Always Test

- Business logic calculations (BOM, pricing, measurements)
- Data transformations (STEP file generation, NX expressions)
- Error handling and edge cases
- Critical user paths (file exports, configuration changes)
- API endpoints and data validation

#### [WARNING] Carefully Test

- UI components (test behavior, not styling)
- State management (test state transitions)
- Integration points (mocked external calls)

#### [X] Don't Test

- Third-party libraries (trust they're tested)
- Configuration files (JSON, YAML)
- Simple getters/setters with no logic
- Generated code or build outputs

## Future Improvements

1. [DONE] Achieve 85%+ overall test coverage
2. Add visual regression testing with Percy or Chromatic
3. Implement load testing for large crate configurations
4. Add mutation testing to verify test quality
5. Set up continuous monitoring and alerting
6. Implement performance budgets in CI/CD
7. Add accessibility testing automation (axe-core)
8. Create test data factories for complex scenarios
