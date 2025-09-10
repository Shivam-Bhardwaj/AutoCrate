import { test, expect, type Page } from '@playwright/test';
import { CrateConfiguration } from '@/types';

test.describe('NX Workflow Integration', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Complete NX Export Workflow', () => {
    test('should complete full crate design to NX export workflow', async () => {
      // Step 1: Configure crate dimensions
      await page.fill('[data-testid="length-input"]', '48');
      await page.fill('[data-testid="width-input"]', '36');
      await page.fill('[data-testid="height-input"]', '30');
      await page.fill('[data-testid="weight-input"]', '800');

      // Step 2: Configure base settings
      await page.selectOption('[data-testid="base-type-select"]', 'standard');
      await page.fill('[data-testid="skid-count-input"]', '3');
      await page.fill('[data-testid="skid-width-input"]', '4');
      await page.fill('[data-testid="skid-height-input"]', '5');

      // Step 3: Configure panels
      await page.fill('[data-testid="top-panel-thickness"]', '0.75');
      await page.selectOption('[data-testid="top-panel-material"]', 'plywood');
      
      await page.fill('[data-testid="front-panel-thickness"]', '0.5');
      await page.selectOption('[data-testid="front-panel-material"]', 'plywood');
      
      // Enable ventilation on front panel
      await page.check('[data-testid="front-panel-ventilation-enabled"]');
      await page.selectOption('[data-testid="front-panel-ventilation-type"]', 'holes');
      await page.fill('[data-testid="front-panel-ventilation-count"]', '4');
      await page.fill('[data-testid="front-panel-ventilation-size"]', '2');

      // Step 4: Configure fasteners
      await page.selectOption('[data-testid="fastener-type-select"]', 'klimp');
      await page.selectOption('[data-testid="fastener-size-select"]', '8d');
      await page.fill('[data-testid="fastener-spacing-input"]', '6');

      // Step 5: Enable vinyl wrap
      await page.check('[data-testid="vinyl-enabled"]');
      await page.selectOption('[data-testid="vinyl-type-select"]', 'waterproof');
      await page.fill('[data-testid="vinyl-thickness-input"]', '0.125');

      // Step 6: Verify 3D visualization updates
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();
      
      // Wait for 3D scene to render
      await page.waitForTimeout(2000);

      // Step 7: Generate NX expression
      await page.click('[data-testid="generate-nx-button"]');
      
      // Wait for expression generation
      await page.waitForSelector('[data-testid="nx-expression-output"]', { timeout: 10000 });
      
      const expressionOutput = await page.textContent('[data-testid="nx-expression-output"]');
      expect(expressionOutput).toBeTruthy();
      expect(expressionOutput).toContain('p0 = 48'); // Length parameter
      expect(expressionOutput).toContain('p1 = 36'); // Width parameter
      expect(expressionOutput).toContain('p2 = 30'); // Height parameter
      
      // Check for NX commands
      expect(expressionOutput).toContain('BLOCK/');
      expect(expressionOutput).toContain('EXTRUDE/');
      expect(expressionOutput).toContain('CREATE_BASE');
      expect(expressionOutput).toContain('CREATE_FRONT_PANEL');

      // Step 8: Validate Applied Materials standards
      expect(expressionOutput).toMatch(/0205-\d{5}/); // Part number format
      expect(expressionOutput).toMatch(/TC2-\d{7}/); // TC number format

      // Step 9: Check NX Instructions tab
      await page.click('[data-testid="nx-instructions-tab"]');
      
      const instructions = page.locator('[data-testid="nx-instructions-content"]');
      await expect(instructions).toBeVisible();
      
      const instructionText = await instructions.textContent();
      expect(instructionText).toContain('Open NX 2022');
      expect(instructionText).toContain('File → New');
      expect(instructionText).toContain('Modeling Application');
      expect(instructionText).toContain('Tools → Expression');

      // Step 10: Check Visual Guide tab
      await page.click('[data-testid="nx-visual-guide-tab"]');
      
      const visualGuide = page.locator('[data-testid="nx-visual-guide-content"]');
      await expect(visualGuide).toBeVisible();
      
      const guideText = await visualGuide.textContent();
      expect(guideText).toContain('Coordinate System');
      expect(guideText).toContain('Z-up orientation');
      expect(guideText).toContain('Origin at floor center');

      // Step 11: Export functionality
      await page.click('[data-testid="export-nx-button"]');
      
      // Verify export dialog or download
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
      await page.click('[data-testid="confirm-export-button"]');
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.prt$|\.txt$/);

      // Step 12: Verify system logs
      await page.click('[data-testid="logs-tab"]');
      
      const logsContent = page.locator('[data-testid="logs-content"]');
      await expect(logsContent).toBeVisible();
      
      const logs = await logsContent.textContent();
      expect(logs).toContain('Configuration updated');
      expect(logs).toContain('NX expression generated');
      expect(logs).toContain('Export completed');
    });

    test('should handle complex configuration with all features enabled', async () => {
      // Complex industrial crate configuration
      await page.fill('[data-testid="length-input"]', '96');
      await page.fill('[data-testid="width-input"]', '72');
      await page.fill('[data-testid="height-input"]', '60');
      await page.fill('[data-testid="weight-input"]', '5000');

      // Heavy-duty base
      await page.selectOption('[data-testid="base-type-select"]', 'heavy-duty');
      await page.fill('[data-testid="skid-count-input"]', '5');
      await page.fill('[data-testid="skid-width-input"]', '6');
      await page.fill('[data-testid="skid-height-input"]', '8');
      await page.fill('[data-testid="floorboard-thickness-input"]', '1.0');

      // Reinforced panels with ventilation
      await page.fill('[data-testid="top-panel-thickness"]', '1.0');
      await page.check('[data-testid="top-panel-reinforcement"]');
      
      await page.fill('[data-testid="front-panel-thickness"]', '0.75');
      await page.check('[data-testid="front-panel-reinforcement"]');
      await page.check('[data-testid="front-panel-ventilation-enabled"]');
      await page.selectOption('[data-testid="front-panel-ventilation-type"]', 'slots');
      await page.fill('[data-testid="front-panel-ventilation-count"]', '8');
      await page.fill('[data-testid="front-panel-ventilation-size"]', '3');

      await page.fill('[data-testid="left-panel-thickness"]', '0.75');
      await page.check('[data-testid="left-panel-ventilation-enabled"]');
      await page.fill('[data-testid="left-panel-ventilation-count"]', '4');

      await page.fill('[data-testid="right-panel-thickness"]', '0.75');
      await page.check('[data-testid="right-panel-ventilation-enabled"]');
      await page.fill('[data-testid="right-panel-ventilation-count"]', '4');

      // Heavy-duty fasteners
      await page.selectOption('[data-testid="fastener-type-select"]', 'bolt');
      await page.selectOption('[data-testid="fastener-size-select"]', '12d');
      await page.fill('[data-testid="fastener-spacing-input"]', '4');

      // Industrial vinyl
      await page.check('[data-testid="vinyl-enabled"]');
      await page.selectOption('[data-testid="vinyl-type-select"]', 'industrial');
      await page.fill('[data-testid="vinyl-thickness-input"]', '0.25');

      // Special requirements
      await page.check('[data-testid="special-req-ista-6a"]');
      await page.check('[data-testid="special-req-ista-6b"]');
      await page.check('[data-testid="special-req-hazmat"]');
      await page.check('[data-testid="special-req-export"]');

      // Generate complex NX expression
      await page.click('[data-testid="generate-nx-button"]');
      
      await page.waitForSelector('[data-testid="nx-expression-output"]', { timeout: 15000 });
      
      const expressionOutput = await page.textContent('[data-testid="nx-expression-output"]');
      
      // Verify complex configuration is properly encoded
      expect(expressionOutput).toContain('p0 = 96'); // Large length
      expect(expressionOutput).toContain('p1 = 72'); // Large width  
      expect(expressionOutput).toContain('p2 = 60'); // Large height
      
      // Check for heavy-duty features
      expect(expressionOutput).toContain('skid_count = 5');
      expect(expressionOutput).toContain('reinforcement = 1');
      expect(expressionOutput).toContain('VENTILATION');
      expect(expressionOutput).toContain('VINYL_WRAP');
      expect(expressionOutput).toContain('ISTA_6A');
      
      // Performance check - complex config should still generate quickly
      const startTime = Date.now();
      await page.click('[data-testid="regenerate-nx-button"]');
      await page.waitForSelector('[data-testid="nx-expression-output"]', { timeout: 10000 });
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // Under 5 seconds
    });

    test('should validate NX expression syntax and formatting', async () => {
      // Standard configuration for syntax validation
      await page.fill('[data-testid="length-input"]', '24');
      await page.fill('[data-testid="width-input"]', '18');
      await page.fill('[data-testid="height-input"]', '15');
      await page.fill('[data-testid="weight-input"]', '200');

      await page.click('[data-testid="generate-nx-button"]');
      await page.waitForSelector('[data-testid="nx-expression-output"]', { timeout: 10000 });
      
      const expressionOutput = await page.textContent('[data-testid="nx-expression-output"]');
      
      // Check parameter definitions
      const parameterLines = expressionOutput!.split('\n').filter(line => line.match(/^p\d+\s*=\s*[\d.]+$/));
      expect(parameterLines.length).toBeGreaterThan(5); // Should have multiple parameters
      
      // Check feature commands
      const featureLines = expressionOutput!.split('\n').filter(line => line.includes('BLOCK/') || line.includes('EXTRUDE/'));
      expect(featureLines.length).toBeGreaterThan(0);
      
      // Check comment formatting
      const commentLines = expressionOutput!.split('\n').filter(line => line.trim().startsWith('$'));
      expect(commentLines.length).toBeGreaterThan(0);
      
      // Check proper line endings and formatting
      const lines = expressionOutput!.split('\n');
      lines.forEach(line => {
        if (line.trim().length > 0) {
          // No trailing whitespace
          expect(line).not.toMatch(/\s+$/);
          
          // Proper parameter format
          if (line.match(/^p\d+/)) {
            expect(line).toMatch(/^p\d+\s*=\s*[\d.]+$/);
          }
        }
      });

      // Check coordinate system consistency (Z-up)
      expect(expressionOutput).toContain('0, 0, 0'); // Base at origin
      expect(expressionOutput).not.toContain('0, 0, -'); // No negative Z coordinates for base
      
      // Validate Applied Materials standards
      expect(expressionOutput).toMatch(/\$ Part Number: 0205-\d{5}/);
      expect(expressionOutput).toMatch(/\$ TC Number: TC2-\d{7}/);
      expect(expressionOutput).toMatch(/\$ Material: (plywood|pine|oak|steel)/i);
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle invalid dimension inputs gracefully', async () => {
      // Test negative dimensions
      await page.fill('[data-testid="length-input"]', '-10');
      await page.fill('[data-testid="width-input"]', '0');
      await page.fill('[data-testid="height-input"]', 'abc');
      
      await page.click('[data-testid="generate-nx-button"]');
      
      // Should show validation errors
      const errorMessage = page.locator('[data-testid="validation-error"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
      
      const errorText = await errorMessage.textContent();
      expect(errorText).toContain('dimension');
      expect(errorText).toContain('must be');
    });

    test('should handle extreme dimension values', async () => {
      // Test maximum allowed dimensions
      await page.fill('[data-testid="length-input"]', '240');
      await page.fill('[data-testid="width-input"]', '120');
      await page.fill('[data-testid="height-input"]', '120');
      await page.fill('[data-testid="weight-input"]', '10000');

      await page.click('[data-testid="generate-nx-button"]');
      
      // Should handle extreme values without crashing
      await page.waitForSelector('[data-testid="nx-expression-output"]', { timeout: 15000 });
      
      const expressionOutput = await page.textContent('[data-testid="nx-expression-output"]');
      expect(expressionOutput).toContain('p0 = 240');
      expect(expressionOutput).toBeTruthy();
      
      // Check for performance warnings
      const warningMessage = page.locator('[data-testid="performance-warning"]');
      if (await warningMessage.isVisible()) {
        const warningText = await warningMessage.textContent();
        expect(warningText).toContain('large dimensions');
      }
    });

    test('should recover from network errors', async () => {
      // Simulate network failure during generation
      await page.route('**/api/generate-nx', route => {
        route.abort('failed');
      });
      
      await page.fill('[data-testid="length-input"]', '30');
      await page.fill('[data-testid="width-input"]', '24');
      await page.fill('[data-testid="height-input"]', '20');
      
      await page.click('[data-testid="generate-nx-button"]');
      
      // Should show network error
      const networkError = page.locator('[data-testid="network-error"]');
      await expect(networkError).toBeVisible({ timeout: 10000 });
      
      // Restore network and retry
      await page.unroute('**/api/generate-nx');
      await page.click('[data-testid="retry-button"]');
      
      // Should succeed after retry
      await page.waitForSelector('[data-testid="nx-expression-output"]', { timeout: 10000 });
      const output = await page.textContent('[data-testid="nx-expression-output"]');
      expect(output).toBeTruthy();
    });

    test('should maintain state during browser refresh', async () => {
      // Configure crate
      await page.fill('[data-testid="length-input"]', '42');
      await page.fill('[data-testid="width-input"]', '36');
      await page.fill('[data-testid="height-input"]', '28');
      await page.selectOption('[data-testid="base-type-select"]', 'heavy-duty');
      await page.check('[data-testid="vinyl-enabled"]');

      // Generate expression
      await page.click('[data-testid="generate-nx-button"]');
      await page.waitForSelector('[data-testid="nx-expression-output"]', { timeout: 10000 });
      
      const originalOutput = await page.textContent('[data-testid="nx-expression-output"]');
      
      // Refresh page
      await page.reload({ waitUntil: 'networkidle' });
      
      // Check if state is restored
      const lengthValue = await page.inputValue('[data-testid="length-input"]');
      const widthValue = await page.inputValue('[data-testid="width-input"]');
      const heightValue = await page.inputValue('[data-testid="height-input"]');
      const baseType = await page.inputValue('[data-testid="base-type-select"]');
      const vinylEnabled = await page.isChecked('[data-testid="vinyl-enabled"]');
      
      expect(lengthValue).toBe('42');
      expect(widthValue).toBe('36');
      expect(heightValue).toBe('28');
      expect(baseType).toBe('heavy-duty');
      expect(vinylEnabled).toBe(true);
      
      // Expression should be regenerated automatically or on demand
      const outputElement = page.locator('[data-testid="nx-expression-output"]');
      if (await outputElement.isVisible()) {
        const restoredOutput = await outputElement.textContent();
        expect(restoredOutput).toBe(originalOutput);
      } else {
        // Regenerate if not automatically restored
        await page.click('[data-testid="generate-nx-button"]');
        await page.waitForSelector('[data-testid="nx-expression-output"]', { timeout: 10000 });
        const newOutput = await page.textContent('[data-testid="nx-expression-output"]');
        expect(newOutput).toBe(originalOutput);
      }
    });
  });

  test.describe('Mobile Workflow', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE dimensions

    test('should complete NX workflow on mobile device', async () => {
      // Mobile-specific interactions might be different
      await page.click('[data-testid="mobile-config-toggle"]');
      
      // Basic configuration
      await page.fill('[data-testid="length-input"]', '36');
      await page.fill('[data-testid="width-input"]', '30');
      await page.fill('[data-testid="height-input"]', '24');
      await page.fill('[data-testid="weight-input"]', '400');

      // On mobile, some options might be in collapsible sections
      await page.click('[data-testid="advanced-options-toggle"]');
      await page.selectOption('[data-testid="fastener-type-select"]', 'klimp');

      // Generate NX expression
      await page.click('[data-testid="generate-nx-button"]');
      await page.waitForSelector('[data-testid="nx-expression-output"]', { timeout: 10000 });
      
      const output = await page.textContent('[data-testid="nx-expression-output"]');
      expect(output).toContain('p0 = 36');
      expect(output).toContain('klimp');

      // Mobile-specific export handling
      await page.click('[data-testid="mobile-export-button"]');
      
      // On mobile, might show share options instead of direct download
      const shareOptions = page.locator('[data-testid="mobile-share-options"]');
      if (await shareOptions.isVisible()) {
        await page.click('[data-testid="share-copy-link"]');
        
        // Verify clipboard or sharing functionality
        const successMessage = page.locator('[data-testid="share-success"]');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      }
    });
  });
});