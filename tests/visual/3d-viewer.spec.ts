import { test, expect } from '@playwright/test';
import { TestHelpers, testFixtures } from '../utils/test-helpers';

test.describe('3D Viewer Visual Tests', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.navigateToApp();
    await helpers.waitFor3DViewer();
  });

  test('should render 3D viewer with default configuration', async ({ page }) => {
    await helpers.screenshot3DViewer('3d-viewer-default');
    
    const canvas = page.locator('[data-testid="three-canvas"]');
    await expect(canvas).toHaveScreenshot('3d-viewer-default.png');
  });

  test('should render 3D viewer with small product', async ({ page }) => {
    await helpers.fillProductDimensions(testFixtures.smallProduct);
    await helpers.selectMaterial('plywood');
    
    await helpers.screenshot3DViewer('3d-viewer-small-product');
    
    const canvas = page.locator('[data-testid="three-canvas"]');
    await expect(canvas).toHaveScreenshot('3d-viewer-small-product.png');
  });

  test('should render 3D viewer with large product', async ({ page }) => {
    await helpers.fillProductDimensions(testFixtures.largeProduct);
    await helpers.selectMaterial('steel');
    
    await helpers.screenshot3DViewer('3d-viewer-large-product');
    
    const canvas = page.locator('[data-testid="three-canvas"]');
    await expect(canvas).toHaveScreenshot('3d-viewer-large-product.png');
  });

  test('should render 3D viewer with PMI annotations', async ({ page }) => {
    await helpers.fillProductDimensions(testFixtures.mediumProduct);
    await helpers.togglePMI(true);
    
    await helpers.screenshot3DViewer('3d-viewer-with-pmi');
    
    const canvas = page.locator('[data-testid="three-canvas"]');
    await expect(canvas).toHaveScreenshot('3d-viewer-with-pmi.png');
  });

  test('should render 3D viewer with measurement tools', async ({ page }) => {
    await helpers.fillProductDimensions(testFixtures.mediumProduct);
    await helpers.toggleMeasurements(true);
    
    await helpers.screenshot3DViewer('3d-viewer-with-measurements');
    
    const canvas = page.locator('[data-testid="three-canvas"]');
    await expect(canvas).toHaveScreenshot('3d-viewer-with-measurements.png');
  });

  test('should render 3D viewer with different materials', async ({ page }) => {
    await helpers.fillProductDimensions(testFixtures.mediumProduct);
    
    // Test plywood
    await helpers.selectMaterial('plywood');
    await helpers.screenshot3DViewer('3d-viewer-plywood');
    const canvas = page.locator('[data-testid="three-canvas"]');
    await expect(canvas).toHaveScreenshot('3d-viewer-plywood.png');
    
    // Test hardwood
    await helpers.selectMaterial('hardwood');
    await helpers.screenshot3DViewer('3d-viewer-hardwood');
    await expect(canvas).toHaveScreenshot('3d-viewer-hardwood.png');
    
    // Test steel
    await helpers.selectMaterial('steel');
    await helpers.screenshot3DViewer('3d-viewer-steel');
    await expect(canvas).toHaveScreenshot('3d-viewer-steel.png');
  });

  test('should render 3D viewer on mobile viewport', async ({ page }) => {
    await helpers.simulateMobile();
    await helpers.fillProductDimensions(testFixtures.mediumProduct);
    
    await helpers.screenshot3DViewer('3d-viewer-mobile');
    
    const canvas = page.locator('[data-testid="three-canvas"]');
    await expect(canvas).toHaveScreenshot('3d-viewer-mobile.png');
  });

  test('should render 3D viewer on tablet viewport', async ({ page }) => {
    await helpers.simulateTablet();
    await helpers.fillProductDimensions(testFixtures.mediumProduct);
    
    await helpers.screenshot3DViewer('3d-viewer-tablet');
    
    const canvas = page.locator('[data-testid="three-canvas"]');
    await expect(canvas).toHaveScreenshot('3d-viewer-tablet.png');
  });

  test('should render 3D viewer on desktop viewport', async ({ page }) => {
    await helpers.simulateDesktop();
    await helpers.fillProductDimensions(testFixtures.mediumProduct);
    
    await helpers.screenshot3DViewer('3d-viewer-desktop');
    
    const canvas = page.locator('[data-testid="three-canvas"]');
    await expect(canvas).toHaveScreenshot('3d-viewer-desktop.png');
  });
});

