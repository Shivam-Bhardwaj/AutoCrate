import { test, expect } from '@playwright/test';

// Basic theme toggle verification
test.describe('Theme toggle', () => {
  test('toggles dark mode class on html element', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('app-title').waitFor();
    const html = page.locator('html');
    const initialHasDark = await html.evaluate((el) => el.classList.contains('dark'));
    await page.getByTestId('theme-toggle').click();
    const toggledHasDark = await html.evaluate((el) => el.classList.contains('dark'));
    expect(toggledHasDark).not.toBe(initialHasDark);
    // Toggle back
    await page.getByTestId('theme-toggle').click();
    const revertedHasDark = await html.evaluate((el) => el.classList.contains('dark'));
    expect(revertedHasDark).toBe(initialHasDark);
  });
});
