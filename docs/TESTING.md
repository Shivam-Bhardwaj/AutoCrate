# AutoCrate Testing Documentation

## Overview

AutoCrate implements a comprehensive multi-layered testing strategy to ensure code quality, reliability, and maintainability. The testing architecture covers unit tests, integration tests, component tests, and end-to-end tests.

## Testing Stack

- **Vitest**: Fast unit and integration testing framework
- **React Testing Library**: Component testing with user-centric approach
- **Playwright**: Cross-browser end-to-end testing
- **MSW (Mock Service Worker)**: API mocking for consistent test environments
- **Coverage**: Comprehensive code coverage reporting with c8

## Test Structure

```
tests/
├── unit/                 # Unit tests for services and utilities
│   ├── nx-generator.test.ts
│   └── crate-store.test.ts
├── integration/          # Integration tests for components
│   └── components/
│       └── InputForms.test.tsx
├── e2e/                  # End-to-end tests
│   └── crate-configuration.spec.ts
├── fixtures/             # Test data and fixtures
├── mocks/                # API mocks and handlers
│   ├── handlers.ts
│   └── server.ts
├── utils/                # Testing utilities
│   ├── test-utils.tsx
│   └── three-helpers.ts
└── setup.ts              # Test environment setup
```

## Running Tests

### Quick Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Open Vitest UI
npm run test:ui

# Run E2E tests
npm run e2e

# Run E2E tests with browser visible
npm run e2e:headed

# Debug E2E tests
npm run e2e:debug

# View E2E test report
npm run e2e:report
```

### Test Coverage

Generate and view test coverage reports:

```bash
npm run test:coverage
```

Coverage thresholds are configured at:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## Writing Tests

### Unit Tests

Unit tests focus on individual functions and services in isolation.

```typescript
// tests/unit/nx-generator.test.ts
import { describe, it, expect } from 'vitest';
import { NXExpressionGenerator } from '@/services/nx-generator';

describe('NXExpressionGenerator', () => {
  it('should generate valid NX expression', () => {
    const generator = new NXExpressionGenerator(mockConfig);
    const expression = generator.generateExpression();
    
    expect(expression).toContain('# NX Expression File');
    expect(expression).toContain('crate_length = 1200');
  });
});
```

### Component Tests

Component tests verify React components render correctly and handle user interactions.

```typescript
// tests/integration/components/Button.test.tsx
import { render, screen, fireEvent } from '@/tests/utils/test-utils';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### E2E Tests

End-to-end tests verify complete user workflows.

```typescript
// tests/e2e/crate-configuration.spec.ts
import { test, expect } from '@playwright/test';

test('should configure and generate NX expression', async ({ page }) => {
  await page.goto('/');
  
  // Configure dimensions
  await page.fill('[aria-label="Length"]', '1500');
  await page.fill('[aria-label="Width"]', '1000');
  
  // Generate expression
  await page.click('text=NX Expression');
  await expect(page.locator('text=crate_length = 1500')).toBeVisible();
});
```

## Testing Three.js Components

Special utilities are provided for testing Three.js components:

```typescript
import { createTestScene, expectMeshDimensions } from '@/tests/utils/three-helpers';

describe('3D Crate Rendering', () => {
  it('should create crate with correct dimensions', () => {
    const { scene } = createTestScene();
    const crate = createCrateMesh({ length: 10, width: 8, height: 6 });
    
    scene.add(crate);
    expectMeshDimensions(crate, { length: 10, width: 8, height: 6 });
  });
});
```

## API Mocking

Use MSW for consistent API responses in tests:

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/crate/save', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'crate-123',
      ...body,
    });
  }),
];
```

## Test Utilities

### Custom Render

Use the custom render function for components that need providers:

```typescript
import { renderWithProviders } from '@/tests/utils/test-utils';

test('renders with store provider', () => {
  renderWithProviders(<MyComponent />);
});
```

### Mock Data Generators

Create consistent test data:

```typescript
import { createMockCrateConfiguration } from '@/tests/utils/test-utils';

const mockConfig = createMockCrateConfiguration();
// Customize specific fields
const customConfig = createPartialCrateConfiguration({
  dimensions: { length: 2000, width: 1500, height: 1000, unit: 'mm' }
});
```

## CI/CD Integration

Tests run automatically in GitHub Actions:

1. **On Pull Requests**: All tests run to verify changes
2. **On Main Branch**: Tests run with coverage reporting
3. **Matrix Testing**: Tests run on Node.js 18.x and 20.x

### CI Pipeline Stages

1. **Linting & Type Checking**
2. **Unit Tests**
3. **Integration Tests**
4. **Coverage Generation**
5. **Build Verification**
6. **E2E Tests**

## Best Practices

### 1. Test Organization

- Keep tests close to the code they test
- Use descriptive test names
- Group related tests using `describe` blocks
- Follow AAA pattern: Arrange, Act, Assert

### 2. Test Data

- Use factories for creating test data
- Keep test data minimal and focused
- Avoid hardcoding values when possible

### 3. Async Testing

- Always await async operations
- Use `waitFor` for elements that appear asynchronously
- Set appropriate timeouts for long-running operations

### 4. Mocking

- Mock external dependencies
- Keep mocks simple and focused
- Update mocks when APIs change

### 5. E2E Testing

- Test critical user paths
- Use data-testid attributes for reliable element selection
- Run E2E tests against production builds

## Debugging Tests

### Vitest Debugging

```bash
# Run tests with Node inspector
node --inspect-brk ./node_modules/.bin/vitest run

# Use Vitest UI for visual debugging
npm run test:ui
```

### Playwright Debugging

```bash
# Debug mode with Playwright Inspector
npm run e2e:debug

# Generate trace for failed tests
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### VS Code Integration

Add this configuration to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Performance Testing

### Benchmarking

Monitor test performance to identify slow tests:

```typescript
import { bench, describe } from 'vitest';

describe('Performance', () => {
  bench('NX generation', () => {
    const generator = new NXExpressionGenerator(config);
    generator.generateExpression();
  });
});
```

### Load Testing

For E2E performance testing:

```typescript
test('should handle rapid dimension changes', async ({ page }) => {
  await page.goto('/');
  
  // Rapidly update dimensions
  for (let i = 0; i < 10; i++) {
    await page.fill('[aria-label="Length"]', String(1000 + i * 100));
  }
  
  // Verify application remains responsive
  await expect(page.locator('canvas')).toBeVisible();
});
```

## Troubleshooting

### Common Issues

1. **WebGL Context in Tests**
   - Solution: Mock WebGL context is automatically provided in setup.ts

2. **Async State Updates**
   - Solution: Use `waitFor` or `act` for state updates

3. **File Downloads in E2E**
   - Solution: Configure download handling in Playwright config

4. **Flaky Tests**
   - Solution: Increase timeouts, add proper wait conditions

### Getting Help

- Check test output for detailed error messages
- Review test logs in CI/CD pipeline
- Use `--reporter=verbose` for detailed test output
- Enable debug logging with `DEBUG=*` environment variable

## Contributing

When adding new features:

1. Write tests before implementing features (TDD)
2. Ensure all tests pass locally
3. Add integration tests for new components
4. Add E2E tests for new user workflows
5. Maintain or improve code coverage
6. Update this documentation for new testing patterns

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Three.js Applications](https://threejs.org/docs/#manual/en/introduction/Testing)

---

## Bundle Analysis & Performance Budgets

Maintain bundle size discipline to preserve performance.

### Enabling Analyzer
1. Install: `npm i -D @next/bundle-analyzer`
2. `next.config.js`:
```js
const withAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });
module.exports = withAnalyzer({});
```
3. Run (PowerShell): `set ANALYZE=true; npm run build`

### Proposed Size Budgets
| Asset | Budget (gzip) |
|-------|---------------|
| First Load JS (main route) | < 180 kB |
| Largest dynamic chunk | < 120 kB |
| Duplicate vendor modules | < 10% overlap |

Add CI script to parse `.next` stats and fail if exceeded.

## Visual Regression Testing

Use Playwright screenshot comparisons for key states.

Example:
```ts
import { test, expect } from '@playwright/test';
test('crate exploded view visual', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Explode View').click();
  expect(await page.screenshot()).toMatchSnapshot('crate-exploded.png');
});
```
Commit baseline images under `tests/e2e/__screenshots__`.

## Accessibility (A11y) Testing

Comprehensive accessibility testing ensures AutoCrate meets WCAG 2.1 AA standards and provides an inclusive user experience.

### Automated Accessibility Testing

#### Axe Core Integration
```ts
import AxeBuilder from '@axe-core/playwright';

// Basic accessibility scan
test('should pass accessibility checks', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

// Targeted component testing
test('3D viewer accessibility', async ({ page }) => {
  await page.goto('/');
  const viewer = page.locator('[data-testid="crate-viewer"]');
  const results = await new AxeBuilder({ page })
    .include(viewer)
    .analyze();
  expect(results.violations).toEqual([]);
});
```

#### Contrast Ratio Validation
```ts
import { getContrastRatio } from '@/tests/utils/contrast';

test('color contrast compliance', async () => {
  const textColor = '#212121'; // Primary text
  const backgroundColor = '#FFFFFF'; // Light background
  const ratio = getContrastRatio(textColor, backgroundColor);

  expect(ratio).toBeGreaterThanOrEqual(4.5); // WCAG AA requirement
});
```

### Manual Accessibility Testing Steps

#### 1. Keyboard Navigation Testing
- [ ] Tab through all interactive elements
- [ ] Verify focus indicators are visible
- [ ] Test Enter/Space activation of buttons
- [ ] Check Escape key closes modals
- [ ] Verify logical tab order
- [ ] Test keyboard-only form completion

#### 2. Screen Reader Testing
- [ ] Enable NVDA/JAWS/VoiceOver
- [ ] Verify all headings are announced
- [ ] Check form labels are associated
- [ ] Test 3D element descriptions
- [ ] Verify error messages are announced
- [ ] Check dynamic content updates

#### 3. Color and Contrast Testing
- [ ] Test with high contrast mode
- [ ] Verify color-blind friendly palettes
- [ ] Check focus indicators in all themes
- [ ] Test 3D label visibility in both themes
- [ ] Verify icon accessibility

#### 4. Zoom and Scaling Testing
- [ ] Test 200% browser zoom
- [ ] Verify fluid typography scaling
- [ ] Check layout doesn't break at high zoom
- [ ] Test touch targets remain accessible

#### 5. Mobile Accessibility Testing
- [ ] Test with screen readers on mobile
- [ ] Verify touch target sizes (44px minimum)
- [ ] Check swipe gestures work
- [ ] Test orientation changes

### 3D-Specific Accessibility Testing

#### Label and Annotation Testing
- [ ] Verify 3D labels have sufficient contrast
- [ ] Test label readability at different distances
- [ ] Check label positioning doesn't obstruct content
- [ ] Verify labels work with screen magnification

#### Interactive 3D Element Testing
- [ ] Test keyboard navigation in 3D space
- [ ] Verify mouse/touch alternatives exist
- [ ] Check 3D controls have accessible names
- [ ] Test with assistive technologies

### Accessibility Testing Tools

#### Browser Extensions
- axe DevTools (Chrome/Firefox)
- WAVE Evaluation Tool
- Accessibility Insights
- Color Contrast Analyzer

#### Screen Readers
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

#### Automated Testing Scripts
```bash
# Run accessibility tests
npm run test:a11y

# Generate accessibility report
npm run test:a11y:report

# Test specific pages
npm run test:a11y -- --page=/nx-demo
```

### Accessibility Checklist for New Features

- [ ] Semantic HTML elements used
- [ ] ARIA labels provided where needed
- [ ] Color contrast ratios validated
- [ ] Keyboard navigation supported
- [ ] Screen reader announcements tested
- [ ] Focus management implemented
- [ ] Touch targets meet size requirements
- [ ] Error states are accessible
- [ ] Dynamic content updates announced

### Continuous Accessibility Monitoring

#### CI/CD Integration
- Automated accessibility tests in pipeline
- Contrast ratio validation on color changes
- HTML semantic validation
- ARIA usage checking

#### Regular Audits
- Quarterly accessibility reviews
- User testing with assistive technologies
- Cross-browser accessibility testing
- Mobile accessibility validation

## 3D Testing Guidelines

| Layer | Focus | Example |
|-------|-------|---------|
| Unit | Math & conversion | inch->mm->m accuracy |
| Component | UI state | explode factor slider updates blocks |
| Visual | Rendering differences | screenshot baseline vs new |
| Perf | Frame budget | log warnings if FPS < 45 |
| A11y | Discoverability | button names, legend text |
- [ ] 3D label contrast meets WCAG 2.1 AA (4.5:1 minimum)
- [ ] Interactive 3D elements accessible via keyboard
- [ ] 3D viewer provides alternative text descriptions
- [ ] Camera controls have accessible labels

## Adding New Test Types Checklist
1. Define acceptance criteria.
2. Select test layer(s).
3. Add factory/fixtures.
4. Write failing test (TDD ideal).
5. Implement feature/fix.
6. Ensure coverage thresholds maintained.
7. Update docs + site page.

---