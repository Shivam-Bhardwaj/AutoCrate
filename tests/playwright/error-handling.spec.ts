import { test, expect } from '@playwright/test';

// NOTE: Adjust selectors based on actual form inputs if they have specific names/ids.
// This test assumes first number input is length and that invalid negative values are sanitized / rejected.

test.describe('Error handling', () => {
  test('rejects negative dimension input', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('app-title').waitFor();
    const firstNumber = page.locator('input[type="number"]').first();
    await expect(firstNumber).toBeVisible();
    await firstNumber.fill('-50');
    await page.waitForTimeout(300);
    // Expect value not to remain negative (app should clamp or clear)
    const val = await firstNumber.inputValue();
    expect(parseFloat(val)).toBeGreaterThanOrEqual(0);
  });
});
