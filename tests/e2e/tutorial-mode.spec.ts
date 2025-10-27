import { test, expect } from '@playwright/test'

test.describe('Tutorial Mode overlay', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // @ts-expect-error augment test clipboard helper
      window.__AUTOCRATE_TEST_COPY = ''
      const writeText = (text: string) => {
        // @ts-expect-error augment test clipboard helper
        window.__AUTOCRATE_TEST_COPY = text
        return Promise.resolve()
      }

      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: { writeText }
      })
    })
  })

  test('guides a CAD engineer through first steps', async ({ page }) => {
    await page.goto('/?tutorial=1')

    const overlayTitle = page.getByText('Tutorial: Set Datum and Axes')
    await expect(overlayTitle).toBeVisible()

    const copyButton = page.getByRole('button', { name: /overall_width/i })
    await expect(copyButton).toBeVisible()
    await copyButton.click()
    await expect.poll(async () => page.evaluate(() => (window as any).__AUTOCRATE_TEST_COPY)).toBe('overall_width')

    const nextButton = page.getByRole('button', { name: 'Next' })
    await nextButton.click()

    await expect(page.getByRole('button', { name: 'Prev' })).toBeEnabled()
    await expect(page.getByRole('button', { name: 'SKID_X1' })).toBeVisible()
    await expect(page.getByText('Use: SKID_X1, SKID_X2')).toBeVisible()

    await page.getByRole('button', { name: 'Close' }).click()
    await expect(overlayTitle).not.toBeVisible()
  })
})
