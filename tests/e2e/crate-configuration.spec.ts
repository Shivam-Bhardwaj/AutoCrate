import { test, expect } from '@playwright/test';

test.describe('Crate Configuration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load
    await page.waitForSelector('h1:has-text("AutoCrate")');
  });

  test('should load the application', async ({ page }) => {
    // Check that main elements are visible
    await expect(page.locator('h1:has-text("AutoCrate")')).toBeVisible();

    // Check main sections exist
    await expect(page.locator('text=Input Section')).toBeVisible();
    await expect(page.locator('text=3D Rendering')).toBeVisible();
    await expect(page.locator('text=Output Section')).toBeVisible();
  });

  test('should have 3D canvas visible', async ({ page }) => {
    // Check that 3D preview canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should have dimension inputs', async ({ page }) => {
    // Check that dimension inputs exist
    const inputs = page.locator('input[type="number"]');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('text=AutoCrate')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('canvas')).toBeVisible();
  });
});
