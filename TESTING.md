# AutoCrate Testing Architecture

## Overview

This project implements a comprehensive testing strategy to ensure code quality and prevent errors from reaching production.

## Testing Stack

- **Unit Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright
- **API Testing**: Keploy (via Docker)
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

## Keploy Integration (Docker)

### Record API Tests

```bash
npm run keploy:record
```

### Replay API Tests

```bash
npm run keploy:test
```

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

Current coverage targets:

- Branches: 0% (to be increased)
- Functions: 0% (to be increased)
- Lines: 0% (to be increased)
- Statements: 0% (to be increased)

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

1. **Write tests before fixing bugs** - Ensure the bug doesn't resurface
2. **Test user behavior, not implementation** - Focus on what users do
3. **Keep tests isolated** - Each test should be independent
4. **Use descriptive test names** - Should explain what is being tested
5. **Mock external dependencies** - Tests should be fast and reliable
6. **Test edge cases** - Empty arrays, null values, large datasets
7. **Maintain test coverage** - Aim for >80% coverage on critical paths

## Known Issues & Solutions

### Issue: STEP file syntax errors

**Solution**: Unit tests now validate STEP file structure before deployment

### Issue: 3D visualization crashes

**Solution**: Error boundary catches and displays fallback UI

### Issue: Build failures

**Solution**: Pre-commit hooks prevent broken code from being committed

## Future Improvements

1. Increase test coverage to 80%+
2. Add visual regression testing
3. Implement load testing
4. Add mutation testing
5. Set up continuous monitoring
6. Implement A/B testing framework
