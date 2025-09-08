import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Readability E2E Tests', () => {
  test('verifies readability across themes and devices', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for the page to load completely
    await page.waitForSelector('[data-testid="app-title"]');

    // Capture screenshot in light theme
    await page.screenshot({ path: 'tests/screenshots/light-theme-panels.png' });

    // Toggle to dark theme
    await page.click('[data-testid="theme-toggle"]');

    // Wait for theme transition
    await page.waitForTimeout(500);

    // Capture screenshot in dark theme
    await page.screenshot({ path: 'tests/screenshots/dark-theme-panels.png' });

    // Run accessibility scan with axe-core
    const axeResults = await new AxeBuilder({ page }).analyze();
    const colorContrastViolations = axeResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );

    // Expect no color-contrast violations
    expect(colorContrastViolations).toHaveLength(0);

    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 812 });

    // Wait for responsive layout
    await page.waitForTimeout(500);

    // Assert no horizontal scroll
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(375);

    // Assert all text remains readable (>=12px)
    const fontSizes = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const sizes: number[] = [];
      elements.forEach(el => {
        const fontSize = parseFloat(getComputedStyle(el).fontSize);
        if (!isNaN(fontSize) && fontSize > 0) {
          sizes.push(fontSize);
        }
      });
      return sizes;
    });

    const minFontSize = Math.min(...fontSizes);
    expect(minFontSize).toBeGreaterThanOrEqual(12);

    // Verify 3D labels are visible
    const frontLabel = page.locator('text=FRONT');
    await expect(frontLabel).toBeVisible();

    const boundingBox = await frontLabel.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(0);
    expect(boundingBox?.height).toBeGreaterThan(0);

    // Additional 3D label checks
    const skidLabel = page.locator('text=Skids');
    await expect(skidLabel).toBeVisible();

    const floorLabel = page.locator('text=Floor');
    await expect(floorLabel).toBeVisible();

    // Optional: Performance check (FPS measurement)
    // This is a basic implementation - in a real scenario, you'd want more sophisticated monitoring
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();

        const countFrames = () => {
          frameCount++;
          if (performance.now() - startTime >= 2000) { // Measure over 2 seconds
            resolve(frameCount / 2); // FPS
          } else {
            requestAnimationFrame(countFrames);
          }
        };

        requestAnimationFrame(countFrames);
      });
    });

    // Expect reasonable FPS (adjust baseline as needed)
    expect(fps).toBeGreaterThan(30);
  });

  test('verifies label visibility on dark floor grid', async ({ page }) => {
    await page.goto('/');

    // Toggle to dark theme
    await page.click('[data-testid="theme-toggle"]');
    await page.waitForTimeout(500);

    // Check that grid is rendered
    const grid = page.locator('[data-testid="grid"]');
    await expect(grid).toBeVisible();

    // Verify labels are still visible against dark grid
    const labels = ['FRONT', 'Skids', 'Floor', 'Panels', 'Cleats'];
    for (const label of labels) {
      const labelElement = page.locator(`text=${label}`);
      await expect(labelElement).toBeVisible();

      // Check that label has sufficient contrast (basic check)
      const labelColor = await labelElement.evaluate(el =>
        getComputedStyle(el).color
      );
      expect(labelColor).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
    }
  });
});