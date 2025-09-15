import { test, expect } from '@playwright/test';
import { TestHelpers, testFixtures } from '../utils/test-helpers';

test.describe('Crate Design Functionality', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.navigateToApp();
    await helpers.waitFor3DViewer();
  });

  test('should allow configuring product dimensions', async ({ page }) => {
    await helpers.fillProductDimensions(testFixtures.mediumProduct);
    
    // Verify the 3D viewer updates
    await helpers.verify3DViewerRendering();
  });

  test('should allow selecting different materials', async ({ page }) => {
    await helpers.selectMaterial('plywood');
    await helpers.verify3DViewerRendering();
    
    await helpers.selectMaterial('hardwood');
    await helpers.verify3DViewerRendering();
    
    await helpers.selectMaterial('steel');
    await helpers.verify3DViewerRendering();
  });

  test('should allow configuring crate settings', async ({ page }) => {
    await helpers.configureCrate({
      clearance: 3,
      wallThickness: 1.0,
      baseThickness: 1.5,
      lidThickness: 1.0
    });
    
    await helpers.verify3DViewerRendering();
  });

  test('should handle small product configuration', async ({ page }) => {
    await helpers.fillProductDimensions(testFixtures.smallProduct);
    await helpers.selectMaterial('plywood');
    await helpers.configureCrate({ clearance: 1 });
    
    await helpers.verify3DViewerRendering();
  });

  test('should handle large product configuration', async ({ page }) => {
    await helpers.fillProductDimensions(testFixtures.largeProduct);
    await helpers.selectMaterial('steel');
    await helpers.configureCrate({ 
      clearance: 5,
      wallThickness: 2.0,
      baseThickness: 2.5
    });
    
    await helpers.verify3DViewerRendering();
  });

  test('should handle heavy product configuration', async ({ page }) => {
    await helpers.fillProductDimensions(testFixtures.heavyProduct);
    await helpers.selectMaterial('hardwood');
    await helpers.configureCrate({ 
      clearance: 4,
      wallThickness: 1.5,
      baseThickness: 2.0,
      lidThickness: 1.5
    });
    
    await helpers.verify3DViewerRendering();
  });

  test('should update 3D visualization when configuration changes', async ({ page }) => {
    // Initial configuration
    await helpers.fillProductDimensions(testFixtures.smallProduct);
    await helpers.verify3DViewerRendering();
    
    // Change to large product
    await helpers.fillProductDimensions(testFixtures.largeProduct);
    await helpers.verify3DViewerRendering();
    
    // Change material
    await helpers.selectMaterial('steel');
    await helpers.verify3DViewerRendering();
  });

  test('should validate input constraints', async ({ page }) => {
    // Test negative dimensions
    await page.fill('[data-testid="product-length"]', '-10');
    await page.blur('[data-testid="product-length"]');
    
    // Should show validation error
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    
    // Test zero dimensions
    await page.fill('[data-testid="product-width"]', '0');
    await page.blur('[data-testid="product-width"]');
    
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('should handle material optimization', async ({ page }) => {
    await helpers.fillProductDimensions(testFixtures.mediumProduct);
    
    // Enable material optimization
    await page.click('[data-testid="optimize-materials"]');
    
    // Wait for optimization to complete
    await expect(page.locator('[data-testid="optimization-results"]')).toBeVisible();
    
    await helpers.verify3DViewerRendering();
  });
});

