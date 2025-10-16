# E2E Tests for AutoCrate

## Overview

This directory contains end-to-end (E2E) tests for the AutoCrate NX Generator application using Playwright.

## Test Files

### `crate-generator.spec.ts`
General functionality tests for the crate generator including:
- Input controls and form validation
- Scenario presets
- Tab navigation
- File downloads (NX expressions, BOM, STEP files)
- Mobile menu toggle

### `scrolling-responsive.spec.ts`
**Comprehensive scrolling and responsive design tests** (Issue #76)

Tests scrolling behavior across multiple device types and viewports:

#### Mobile Phone Tests (iPhone Safari simulation)
- Sidebar scrolling when inputs menu is open
- NX Expressions tab vertical scrolling
- BOM table horizontal scrolling on narrow screens
- Cut List tab vertical scrolling
- Plywood Pieces tab scrolling
- Tab navigation horizontal scrolling
- Touch scrolling properties verification

#### Tablet Tests (iPad simulation)
- Sidebar visibility and scrollability
- All tabs scrollable on tablet viewport
- Table horizontal scroll when needed

#### Desktop Tests
- Sidebar visibility and scrolling
- All tab content scrolling
- No unwanted horizontal scroll on main page
- Cut List tables fully visible on wide screens

#### Small Mobile Tests (iPhone SE)
- Content accessibility via scroll on small screens
- NX expressions text wrapping and scrolling

#### Landscape Mobile Tests
- Landscape orientation scrolling handling
- Tab content scrolling in landscape mode

#### Cross-browser Mobile Tests
- Android Chrome scrolling verification

#### Accessibility & UX Tests
- Custom scrollbar styling verification
- Overflow containers not clipping content

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run only scrolling tests
```bash
npx playwright test tests/e2e/scrolling-responsive.spec.ts
```

### Run on specific device/browser
```bash
# Desktop Chrome
npx playwright test --project=chromium

# Mobile Safari (iPhone 12)
npx playwright test --project="Mobile Safari"

# iPad
npx playwright test --project=iPad

# Mobile Chrome (Pixel 5)
npx playwright test --project="Mobile Chrome"
```

### Run with UI mode (visual debugging)
```bash
npx playwright test --ui
```

### Run specific test
```bash
npx playwright test -g "sidebar should scroll on mobile"
```

## Test Configuration

Configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Test Directory**: `./tests/e2e`
- **Screenshots**: Only on failure
- **Videos**: Retained on failure
- **Trace**: On first retry

### Configured Devices
- Desktop Chrome (1920x1080)
- Mobile Chrome - Pixel 5 (393x851)
- Mobile Safari - iPhone 12 (390x844)
- Mobile Safari Small - iPhone SE (375x667)
- iPad Pro (1024x1366)

## Writing New Tests

### Helper Functions Available

#### `openInputsIfMobile(page, isMobile)`
Opens the mobile inputs menu if on mobile device.

#### `isScrollable(page, selector)`
Checks if an element is scrollable (vertical or horizontal).

#### `getScrollPosition(page, selector)`
Gets current scroll position of an element.

#### `scrollElement(page, selector, deltaY, deltaX)`
Scrolls an element by specified amount.

### Example Test
```typescript
test('new scrolling feature', async ({ page }) => {
  await page.goto('/')

  // Check scrollability
  const scrollable = await isScrollable(page, '.my-container')
  expect(scrollable).toBe(true)

  // Scroll and verify
  await scrollElement(page, '.my-container', 100)
  const pos = await getScrollPosition(page, '.my-container')
  expect(pos.top).toBeGreaterThan(0)
})
```

## CI/CD Integration

Tests run automatically in CI with:
- 2 retries on failure
- Sequential execution (non-parallel)
- HTML, JSON, and JUnit reports generated
- Test results saved to `test-results/`

## Debugging

### View test report
```bash
npx playwright show-report
```

### Debug mode
```bash
npx playwright test --debug
```

### View traces for failed tests
```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

## Coverage

The scrolling tests cover:
- ✅ 6 different viewport sizes
- ✅ Multiple device types (phone, tablet, desktop)
- ✅ Both portrait and landscape orientations
- ✅ Cross-browser compatibility
- ✅ Touch scrolling properties
- ✅ Accessibility considerations
- ✅ All main tabs and content areas
- ✅ Horizontal and vertical scrolling
- ✅ Text wrapping in constrained spaces

## Related Issues

- **Issue #76**: [BUG] unable to scroll - Fixed with comprehensive responsive design and touch scrolling support

## Maintenance

When adding new scrollable areas or changing responsive breakpoints:
1. Add corresponding tests to `scrolling-responsive.spec.ts`
2. Update viewport configurations in `playwright.config.ts` if needed
3. Run full test suite to ensure no regressions
4. Update this README with new test coverage

## Performance

Typical test execution times:
- Single device: ~30-60 seconds
- All devices: ~3-5 minutes
- Full suite (all E2E tests): ~5-10 minutes

## Troubleshooting

### Tests timing out
- Increase timeout in test or config
- Check if dev server started properly
- Verify network connectivity

### Element not found
- Add `await page.waitForTimeout()` or better, use `waitForSelector`
- Check if element is rendered conditionally
- Verify selector is correct

### Scrolling not working in test
- Ensure element has `overflow` CSS property set
- Check that element has sufficient content to scroll
- Verify parent containers don't have `overflow: hidden`
