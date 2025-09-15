import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';

test.describe('UI Components Visual Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.navigateToApp();
  });

  test('should render design studio panel', async ({ page }) => {
    const designStudio = page.locator('[data-testid="design-studio"]');
    await expect(designStudio).toBeVisible();
    await expect(designStudio).toHaveScreenshot('design-studio-panel.png');
  });

  test('should render configuration panel', async ({ page }) => {
    const configPanel = page.locator('[data-testid="configuration-panel"]');
    await expect(configPanel).toBeVisible();
    await expect(configPanel).toHaveScreenshot('configuration-panel.png');
  });

  test('should render export panel', async ({ page }) => {
    const exportPanel = page.locator('[data-testid="export-panel"]');
    await expect(exportPanel).toBeVisible();
    await expect(exportPanel).toHaveScreenshot('export-panel.png');
  });

  test('should render material optimizer', async ({ page }) => {
    const materialOptimizer = page.locator('[data-testid="material-optimizer"]');
    await expect(materialOptimizer).toBeVisible();
    await expect(materialOptimizer).toHaveScreenshot('material-optimizer.png');
  });

  test('should render validation panel', async ({ page }) => {
    const validationPanel = page.locator('[data-testid="validation-panel"]');
    await expect(validationPanel).toBeVisible();
    await expect(validationPanel).toHaveScreenshot('validation-panel.png');
  });

  test('should render full application layout on desktop', async ({ page }) => {
    await helpers.simulateDesktop();
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('full-app-desktop.png', {
      fullPage: true
    });
  });

  test('should render full application layout on tablet', async ({ page }) => {
    await helpers.simulateTablet();
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('full-app-tablet.png', {
      fullPage: true
    });
  });

  test('should render full application layout on mobile', async ({ page }) => {
    await helpers.simulateMobile();
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('full-app-mobile.png', {
      fullPage: true
    });
  });

  test('should render form inputs correctly', async ({ page }) => {
    const formInputs = page.locator('[data-testid="product-dimensions-form"]');
    await expect(formInputs).toBeVisible();
    await expect(formInputs).toHaveScreenshot('form-inputs.png');
  });

  test('should render material selection buttons', async ({ page }) => {
    const materialButtons = page.locator('[data-testid="material-selection"]');
    await expect(materialButtons).toBeVisible();
    await expect(materialButtons).toHaveScreenshot('material-selection.png');
  });

  test('should render export buttons', async ({ page }) => {
    const exportButtons = page.locator('[data-testid="export-buttons"]');
    await expect(exportButtons).toBeVisible();
    await expect(exportButtons).toHaveScreenshot('export-buttons.png');
  });

  test('should render loading states', async ({ page }) => {
    // Trigger a loading state
    await page.click('[data-testid="export-step-button"]');
    
    const loadingState = page.locator('[data-testid="loading-indicator"]');
    await expect(loadingState).toBeVisible();
    await expect(loadingState).toHaveScreenshot('loading-state.png');
  });

  test('should render error states', async ({ page }) => {
    // Trigger an error state
    await page.fill('[data-testid="product-length"]', '-10');
    await page.blur('[data-testid="product-length"]');
    
    const errorState = page.locator('[data-testid="error-message"]');
    await expect(errorState).toBeVisible();
    await expect(errorState).toHaveScreenshot('error-state.png');
  });

  test('should render success states', async ({ page }) => {
    // Trigger a success state
    await page.fill('[data-testid="product-length"]', '100');
    await page.fill('[data-testid="product-width"]', '80');
    await page.fill('[data-testid="product-height"]', '60');
    
    const successState = page.locator('[data-testid="success-message"]');
    await expect(successState).toBeVisible();
    await expect(successState).toHaveScreenshot('success-state.png');
  });
});

