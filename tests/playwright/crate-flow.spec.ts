import { test, expect } from '@playwright/test';

test.describe('Crate main flow', () => {
  test('loads and shows sections', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('app-title').waitFor();
    await expect(page.getByTestId('section-product-config')).toBeVisible();
    await expect(page.getByTestId('section-crate-visualization')).toBeVisible();
    await expect(page.getByTestId('section-system-logs')).toBeVisible();
  });

  test('renders 3D canvas', async ({ page }) => {
    await page.goto('/');
    const viewer = page.getByTestId('crate-viewer-container');
    await viewer.waitFor();
    // Wait for a canvas to appear inside viewer
    await page.waitForSelector('[data-testid="crate-viewer-container"] canvas');
    const canvasCount = await page.locator('[data-testid="crate-viewer-container"] canvas').count();
    expect(canvasCount).toBeGreaterThan(0);
  });

  test('updates dimension input', async ({ page }) => {
    await page.goto('/');
    // Find first number input
    const numberInputs = page.locator('input[type="number"]');
    await expect(numberInputs.first()).toBeVisible();
    await numberInputs.first().fill('123');
    await expect(numberInputs.first()).toHaveValue('123');
  });
});
