import { test, expect } from '@playwright/test';

test('basic app functionality', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');
  
  // Check if the page loads
  await expect(page).toHaveTitle(/AutoCrate/);
  
  // Check if main elements are present
  await expect(page.locator('body')).toBeVisible();
  
  // Take a screenshot for visual verification
  await page.screenshot({ path: 'test-results/example-screenshot.png' });
});


