import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('Application Navigation', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.navigateToApp();
  });

  test('should load the main application page', async ({ page }) => {
    await expect(page).toHaveTitle(/AutoCrate/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display the 3D viewer', async ({ page }) => {
    await helpers.waitFor3DViewer();
    await expect(page.locator('[data-testid="three-canvas"]')).toBeVisible();
  });

  test('should show design studio panel', async ({ page }) => {
    await expect(page.locator('[data-testid="design-studio"]')).toBeVisible();
  });

  test('should show configuration panel', async ({ page }) => {
    await expect(page.locator('[data-testid="configuration-panel"]')).toBeVisible();
  });

  test('should show export panel', async ({ page }) => {
    await expect(page.locator('[data-testid="export-panel"]')).toBeVisible();
  });

  test('should handle responsive layout on mobile', async ({ page }) => {
    await helpers.simulateMobile();
    await expect(page.locator('[data-testid="three-canvas"]')).toBeVisible();
    await expect(page.locator('[data-testid="design-studio"]')).toBeVisible();
  });

  test('should handle responsive layout on tablet', async ({ page }) => {
    await helpers.simulateTablet();
    await expect(page.locator('[data-testid="three-canvas"]')).toBeVisible();
    await expect(page.locator('[data-testid="design-studio"]')).toBeVisible();
  });

  test('should handle responsive layout on desktop', async ({ page }) => {
    await helpers.simulateDesktop();
    await expect(page.locator('[data-testid="three-canvas"]')).toBeVisible();
    await expect(page.locator('[data-testid="design-studio"]')).toBeVisible();
  });
});

