# AutoCrate Testing Guide

This guide covers the comprehensive testing setup for the AutoCrate application, including both traditional Jest unit tests and modern Playwright UI testing.

## Testing Framework Overview

### Jest (Unit & Integration Tests)
- **Purpose**: Unit tests, integration tests, and API tests
- **Location**: `src/**/__tests__/`
- **Configuration**: `jest.config.js`

### Playwright (E2E & Visual Tests)
- **Purpose**: End-to-end tests, visual regression tests, and component tests
- **Location**: `tests/`
- **Configuration**: `playwright.config.ts`

## Test Structure

```
tests/
├── e2e/                    # End-to-end tests
│   ├── app-navigation.spec.ts
│   ├── crate-design.spec.ts
│   └── export-functionality.spec.ts
├── visual/                 # Visual regression tests
│   ├── 3d-viewer.spec.ts
│   └── ui-components.spec.ts
├── component/              # Component tests (Playwright CT)
│   ├── crate-visualizer.spec.tsx
│   └── design-studio.spec.tsx
├── fixtures/               # Test data and configurations
│   └── test-data.ts
├── utils/                  # Test utilities and helpers
│   ├── test-helpers.ts
│   └── component-test-utils.tsx
├── global-setup.ts         # Global test setup
└── global-teardown.ts      # Global test teardown
```

## Running Tests

### Jest Tests (Unit & Integration)
```bash
# Run all Jest tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Playwright Tests (E2E & Visual)
```bash
# Run all Playwright tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run component tests only
npm run test:component

# Run visual tests only
npm run test:visual

# Run all tests (Jest + Playwright)
npm run test:all

# Show test report
npm run test:report
```

## Test Categories

### 1. Unit Tests (Jest)
- **Location**: `src/**/__tests__/`
- **Purpose**: Test individual functions, components, and utilities
- **Examples**:
  - Domain calculations
  - Validation logic
  - API route handlers
  - Store actions

### 2. Component Tests (Playwright CT)
- **Location**: `tests/component/`
- **Purpose**: Test React components in isolation
- **Features**:
  - Component rendering
  - Props handling
  - User interactions
  - Accessibility checks

### 3. End-to-End Tests (Playwright)
- **Location**: `tests/e2e/`
- **Purpose**: Test complete user workflows
- **Examples**:
  - Application navigation
  - Crate design process
  - Export functionality
  - Responsive behavior

### 4. Visual Regression Tests (Playwright)
- **Location**: `tests/visual/`
- **Purpose**: Ensure UI consistency across changes
- **Examples**:
  - 3D viewer rendering
  - UI component appearance
  - Responsive layouts
  - Loading and error states

## Test Utilities

### TestHelpers Class
Located in `tests/utils/test-helpers.ts`, provides common testing operations:

```typescript
const helpers = new TestHelpers(page);

// Navigation
await helpers.navigateToApp();
await helpers.waitFor3DViewer();

// Configuration
await helpers.fillProductDimensions(dimensions);
await helpers.selectMaterial('plywood');
await helpers.configureCrate(settings);

// Export
const download = await helpers.exportSTEP(options);

// Viewport simulation
await helpers.simulateMobile();
await helpers.simulateTablet();
await helpers.simulateDesktop();

// Screenshots
await helpers.screenshot3DViewer('test-name');

// Performance
const metrics = await helpers.getPerformanceMetrics();
```

### Test Fixtures
Located in `tests/fixtures/test-data.ts`, provides predefined test configurations:

```typescript
import { testConfigurations, testFixtures } from '../fixtures/test-data';

// Use predefined configurations
const config = testConfigurations.basic;
const dimensions = testFixtures.mediumProduct;
```

## Writing Tests

### Jest Unit Tests
```typescript
import { calculateCrateDimensions } from '../calculations';

describe('calculateCrateDimensions', () => {
  it('should calculate correct dimensions', () => {
    const result = calculateCrateDimensions(input);
    expect(result.overallWidth).toBe(expected);
  });
});
```

### Playwright E2E Tests
```typescript
import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test('should export STEP file', async ({ page }) => {
  const helpers = new TestHelpers(page);
  await helpers.navigateToApp();
  
  const download = await helpers.exportSTEP();
  expect(download.suggestedFilename()).toContain('.step');
});
```

### Playwright Component Tests
```typescript
import { test, expect } from '@playwright/experimental-ct-react';
import { CrateVisualizer } from '../../src/components/cad-viewer/CrateVisualizer';

test('renders 3D viewer', async ({ mount }) => {
  const component = await mount(
    <CrateVisualizer config={config} showPMI={false} />
  );
  
  await expect(component.locator('[data-testid="three-canvas"]')).toBeVisible();
});
```

### Visual Regression Tests
```typescript
test('should render 3D viewer correctly', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('[data-testid="three-canvas"]');
  await expect(canvas).toHaveScreenshot('3d-viewer-default.png');
});
```

## Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

### 2. Test Data
- Use fixtures for consistent test data
- Avoid hardcoded values
- Create realistic test scenarios

### 3. Selectors
- Use `data-testid` attributes for reliable element selection
- Avoid CSS selectors that might change
- Prefer semantic selectors when possible

### 4. Assertions
- Use specific assertions
- Test both positive and negative cases
- Include accessibility checks

### 5. Performance
- Keep tests fast and focused
- Use parallel execution when possible
- Clean up resources after tests

## Continuous Integration

### GitHub Actions
The testing setup is designed to work with CI/CD pipelines:

```yaml
- name: Run Jest tests
  run: npm run test:coverage

- name: Run Playwright tests
  run: npm run test:e2e

- name: Upload test results
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### Test Reports
- Jest coverage reports: `coverage/`
- Playwright HTML reports: `playwright-report/`
- Test artifacts: `test-results/`

## Debugging Tests

### Jest Debugging
```bash
# Run specific test file
npm test -- --testPathPattern=calculations.test.ts

# Run with verbose output
npm test -- --verbose

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Debugging
```bash
# Debug mode with browser
npm run test:e2e:debug

# Run specific test
npx playwright test tests/e2e/crate-design.spec.ts

# Show trace viewer
npx playwright show-trace trace.zip
```

## Performance Testing

### Metrics Collection
```typescript
const metrics = await helpers.getPerformanceMetrics();
expect(metrics.loadTime).toBeLessThan(3000);
```

### Thresholds
- Load time: < 3 seconds
- First paint: < 1.5 seconds
- First contentful paint: < 2 seconds
- DOM content loaded: < 1 second

## Accessibility Testing

### Automated Checks
```typescript
const accessibilityResults = await helpers.checkAccessibility();
expect(accessibilityResults.violations).toHaveLength(0);
```

### Manual Testing
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus management

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in test configuration
   - Check for slow operations
   - Ensure proper waiting for elements

2. **Flaky tests**
   - Use proper wait conditions
   - Avoid hardcoded delays
   - Check for race conditions

3. **Visual test failures**
   - Update screenshots when UI changes intentionally
   - Check for environment differences
   - Verify consistent test data

### Getting Help
- Check Playwright documentation: https://playwright.dev/
- Review Jest documentation: https://jestjs.io/
- Check test utilities in `tests/utils/`
- Review existing test examples

## Maintenance

### Regular Tasks
- Update test dependencies
- Review and update test data
- Clean up outdated tests
- Monitor test performance
- Update screenshots for visual tests

### Test Coverage
- Maintain high coverage for critical paths
- Focus on user-facing functionality
- Test error conditions and edge cases
- Include accessibility and performance tests

