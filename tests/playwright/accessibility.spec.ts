import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('main page has no critical violations', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('app-title').waitFor();
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const critical = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    if (critical.length) {
      console.log('\nA11Y Violations:', JSON.stringify(critical, null, 2));
    }
    expect(critical.length).toBe(0);
  });
});
