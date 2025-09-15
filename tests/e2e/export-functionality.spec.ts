import { test, expect } from '@playwright/test';
import { TestHelpers, testFixtures } from '../utils/test-helpers';

test.describe('Export Functionality', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.navigateToApp();
    await helpers.waitFor3DViewer();
    
    // Set up a basic configuration
    await helpers.fillProductDimensions(testFixtures.mediumProduct);
    await helpers.selectMaterial('plywood');
  });

  test('should export STEP file with default options', async ({ page }) => {
    const download = await helpers.exportSTEP();
    
    expect(download.suggestedFilename()).toContain('.step');
    expect(download.suggestedFilename()).toContain('crate-design');
  });

  test('should export STEP file with custom options', async ({ page }) => {
    const download = await helpers.exportSTEP({
      includePMI: true,
      includeMaterials: true,
      includeHardware: false
    });
    
    expect(download.suggestedFilename()).toContain('.step');
  });

  test('should export STEP file without PMI', async ({ page }) => {
    const download = await helpers.exportSTEP({
      includePMI: false,
      includeMaterials: true,
      includeHardware: true
    });
    
    expect(download.suggestedFilename()).toContain('.step');
  });

  test('should export PDF file', async ({ page }) => {
    const download = await helpers.exportPDF();
    
    expect(download.suggestedFilename()).toContain('.pdf');
    expect(download.suggestedFilename()).toContain('crate-design');
  });

  test('should handle export with large configuration', async ({ page }) => {
    await helpers.fillProductDimensions(testFixtures.largeProduct);
    await helpers.selectMaterial('steel');
    await helpers.configureCrate({ 
      clearance: 5,
      wallThickness: 2.0
    });
    
    const download = await helpers.exportSTEP();
    expect(download.suggestedFilename()).toContain('.step');
  });

  test('should handle export with heavy configuration', async ({ page }) => {
    await helpers.fillProductDimensions(testFixtures.heavyProduct);
    await helpers.selectMaterial('hardwood');
    await helpers.configureCrate({ 
      clearance: 4,
      wallThickness: 1.5,
      baseThickness: 2.0
    });
    
    const download = await helpers.exportSTEP();
    expect(download.suggestedFilename()).toContain('.step');
  });

  test('should show export progress', async ({ page }) => {
    await page.click('[data-testid="export-step-button"]');
    
    // Should show progress indicator
    await expect(page.locator('[data-testid="export-progress"]')).toBeVisible();
    
    // Wait for export to complete
    await expect(page.locator('[data-testid="export-progress"]')).not.toBeVisible();
  });

  test('should handle export errors gracefully', async ({ page }) => {
    // Mock API to return error
    await helpers.mockAPIResponse('/api/export-step', {
      success: false,
      error: 'Export failed due to invalid geometry'
    }, 500);
    
    await page.click('[data-testid="export-step-button"]');
    await page.click('[data-testid="confirm-export"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="export-error"]')).toBeVisible();
  });

  test('should validate configuration before export', async ({ page }) => {
    // Clear required fields
    await page.fill('[data-testid="product-length"]', '');
    await page.fill('[data-testid="product-width"]', '');
    
    await page.click('[data-testid="export-step-button"]');
    
    // Should show validation error
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('should handle concurrent exports', async ({ page }) => {
    // Start first export
    const download1Promise = helpers.exportSTEP({ includePMI: true });
    
    // Start second export
    const download2Promise = helpers.exportSTEP({ includePMI: false });
    
    const [download1, download2] = await Promise.all([download1Promise, download2Promise]);
    
    expect(download1.suggestedFilename()).toContain('.step');
    expect(download2.suggestedFilename()).toContain('.step');
  });
});

