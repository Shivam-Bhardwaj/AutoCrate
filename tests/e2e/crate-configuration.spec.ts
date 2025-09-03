import { test, expect } from '@playwright/test';

test.describe('Crate Configuration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application with default configuration', async ({ page }) => {
    // Check that main elements are visible
    await expect(page.locator('h1:has-text("AutoCrate")')).toBeVisible();
    await expect(page.locator('text=Dimensions')).toBeVisible();
    await expect(page.locator('text=3D Preview')).toBeVisible();
    await expect(page.locator('text=NX Expression')).toBeVisible();
  });

  test('should update dimensions and reflect in 3D preview', async ({ page }) => {
    // Click on Dimensions tab
    await page.click('text=Dimensions');

    // Update length
    const lengthInput = page.locator('input[aria-label*="Length"]');
    await lengthInput.clear();
    await lengthInput.fill('1500');

    // Update width
    const widthInput = page.locator('input[aria-label*="Width"]');
    await widthInput.clear();
    await widthInput.fill('1000');

    // Update height
    const heightInput = page.locator('input[aria-label*="Height"]');
    await heightInput.clear();
    await heightInput.fill('800');

    // Check that 3D preview canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Check that dimensions are displayed in the output
    await page.click('text=Configuration');
    await expect(page.locator('text=1500 x 1000 x 800')).toBeVisible();
  });

  test('should configure base settings', async ({ page }) => {
    // Navigate to Base tab
    await page.click('text=Base');

    // Select heavy-duty base type
    await page.selectOption('select[aria-label*="Base Type"]', 'heavy-duty');

    // Update floorboard thickness
    const floorboardInput = page.locator('input[aria-label*="Floorboard Thickness"]');
    await floorboardInput.clear();
    await floorboardInput.fill('30');

    // Select oak material
    await page.selectOption('select[aria-label*="Material"]', 'oak');

    // Verify changes in configuration
    await page.click('text=Configuration');
    await expect(page.locator('text=heavy-duty')).toBeVisible();
    await expect(page.locator('text=oak')).toBeVisible();
  });

  test('should configure panel settings', async ({ page }) => {
    // Navigate to Panels tab
    await page.click('text=Panels');

    // Disable top panel
    const topPanelSwitch = page.locator('switch[aria-label*="Top Panel Enabled"]').first();
    await topPanelSwitch.click();

    // Update front panel thickness
    const frontPanelThickness = page.locator('input[aria-label*="Front Panel Thickness"]');
    await frontPanelThickness.clear();
    await frontPanelThickness.fill('25');

    // Enable ventilation for back panel
    const backPanelVentilation = page.locator('switch[aria-label*="Back Panel Ventilation"]');
    await backPanelVentilation.click();
  });

  test('should configure fasteners', async ({ page }) => {
    // Navigate to Fasteners tab
    await page.click('text=Fasteners');

    // Select screws as fastener type
    await page.selectOption('select[aria-label*="Fastener Type"]', 'screws');

    // Select large size
    await page.selectOption('select[aria-label*="Size"]', 'large');

    // Update spacing
    const spacingInput = page.locator('input[aria-label*="Spacing"]');
    await spacingInput.clear();
    await spacingInput.fill('200');

    // Verify in configuration
    await page.click('text=Configuration');
    await expect(page.locator('text=screws')).toBeVisible();
  });

  test('should enable and configure vinyl wrapping', async ({ page }) => {
    // Navigate to Vinyl tab
    await page.click('text=Vinyl');

    // Enable vinyl wrapping
    const vinylSwitch = page.locator('switch[aria-label*="Enable Vinyl Wrapping"]');
    await vinylSwitch.click();

    // Wait for vinyl options to appear
    await page.waitForSelector('select[aria-label*="Vinyl Type"]');

    // Select vapor barrier type
    await page.selectOption('select[aria-label*="Vinyl Type"]', 'vapor-barrier');

    // Update thickness
    const thicknessInput = page.locator('input[aria-label*="Thickness"]');
    await thicknessInput.clear();
    await thicknessInput.fill('2');

    // Select partial coverage
    await page.selectOption('select[aria-label*="Coverage"]', 'partial');

    // Verify in configuration
    await page.click('text=Configuration');
    await expect(page.locator('text=vapor-barrier')).toBeVisible();
    await expect(page.locator('text=partial')).toBeVisible();
  });

  test('should generate and download NX expression', async ({ page, context }) => {
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download');

    // Configure crate first
    await page.click('text=Dimensions');
    const lengthInput = page.locator('input[aria-label*="Length"]');
    await lengthInput.clear();
    await lengthInput.fill('2000');

    // Navigate to NX Expression tab
    await page.click('text=NX Expression');

    // Check that expression is generated
    await expect(page.locator('text=# NX Expression File')).toBeVisible();
    await expect(page.locator('text=crate_length = 2000')).toBeVisible();

    // Click download button
    await page.click('button:has-text("Download NX File")');

    // Wait for download and verify
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.txt');

    // Verify file content
    const filePath = await download.path();
    expect(filePath).toBeTruthy();
  });

  test('should copy NX expression to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Navigate to NX Expression tab
    await page.click('text=NX Expression');

    // Click copy button
    await page.click('button:has-text("Copy to Clipboard")');

    // Check for success message
    await expect(page.locator('text=Copied!')).toBeVisible();

    // Verify clipboard content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toContain('# NX Expression File');
  });

  test('should display bill of materials', async ({ page }) => {
    // Configure a complete crate
    await page.click('text=Dimensions');
    const lengthInput = page.locator('input[aria-label*="Length"]');
    await lengthInput.clear();
    await lengthInput.fill('1200');

    // Navigate to BOM tab
    await page.click('text=Bill of Materials');

    // Check for BOM content
    await expect(page.locator('text=Base Frame')).toBeVisible();
    await expect(page.locator('text=Side Panels')).toBeVisible();
    await expect(page.locator('text=Estimated Cost')).toBeVisible();

    // Verify calculations are shown
    await expect(page.locator('text=/\\$[0-9]+\\.[0-9]{2}/')).toBeVisible();
  });

  test('should handle 3D view interactions', async ({ page }) => {
    // Check that canvas is present
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Simulate mouse interactions for orbit controls
    await canvas.hover();

    // Drag to rotate
    await page.mouse.move(400, 300);
    await page.mouse.down();
    await page.mouse.move(500, 400);
    await page.mouse.up();

    // Scroll to zoom
    await canvas.hover();
    await page.mouse.wheel(0, 100);

    // Canvas should still be visible after interactions
    await expect(canvas).toBeVisible();
  });

  test('should validate input constraints', async ({ page }) => {
    await page.click('text=Dimensions');

    // Try to enter negative value
    const lengthInput = page.locator('input[aria-label*="Length"]');
    await lengthInput.clear();
    await lengthInput.fill('-100');

    // Value should be rejected or corrected
    const value = await lengthInput.inputValue();
    expect(parseInt(value)).toBeGreaterThanOrEqual(0);

    // Try to enter non-numeric value
    await lengthInput.clear();
    await lengthInput.fill('abc');

    // Should not accept non-numeric input
    const nonNumericValue = await lengthInput.inputValue();
    expect(nonNumericValue).not.toBe('abc');
  });

  test('should persist configuration across tab changes', async ({ page }) => {
    // Set custom dimensions
    await page.click('text=Dimensions');
    const lengthInput = page.locator('input[aria-label*="Length"]');
    await lengthInput.clear();
    await lengthInput.fill('1800');

    // Navigate to Base tab
    await page.click('text=Base');
    await page.selectOption('select[aria-label*="Base Type"]', 'export');

    // Go back to Dimensions
    await page.click('text=Dimensions');

    // Check that value is preserved
    const currentValue = await lengthInput.inputValue();
    expect(currentValue).toBe('1800');

    // Check Base setting is preserved
    await page.click('text=Base');
    const baseType = await page.locator('select[aria-label*="Base Type"]').inputValue();
    expect(baseType).toBe('export');
  });

  test('should handle responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Check that layout adapts
    await expect(page.locator('text=AutoCrate')).toBeVisible();
    await expect(page.locator('text=Dimensions')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('canvas')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('canvas')).toBeVisible();
  });
});
