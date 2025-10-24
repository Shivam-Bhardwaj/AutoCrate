import { test, expect } from '@playwright/test'

test.describe('Docs: NX Tab and Diagrams', () => {
  test('tabs switch between Web App Docs and NX Docs', async ({ page }) => {
    await page.goto('/docs')
    await expect(page.getByRole('heading', { name: 'AutoCrate Documentation' })).toBeVisible()

    // Default tab shows Web App docs
    await expect(page.getByText('Documentation Overview')).toBeVisible()

    // Switch to NX Docs
    await page.getByRole('button', { name: 'NX Docs' }).click()
    await expect(page.getByText('NX: Recreate Crate Geometry')).toBeVisible()
  })

  test('NX docs show diagrams (Mermaid or fallback)', async ({ page }) => {
    await page.goto('/docs')
    await page.getByRole('button', { name: 'NX Docs' }).click()
    await expect(page.getByText('Coordinate System (Diagram)')).toBeVisible()

    // Mermaid renders an SVG when available; otherwise we show code fallback.
    const section = page.locator('text=Coordinate System (Diagram)')
      .locator('xpath=..') // container element
    const svgCount = await section.locator('svg').count()
    if (svgCount === 0) {
      await expect(section.locator('pre')).toContainText('graph')
    }
  })

  test('docs page scrolls (dedicated scroll container)', async ({ page }) => {
    await page.goto('/docs')
    const container = page.locator('div.overflow-y-auto').first()
    await expect(container).toBeVisible()
    const metrics = await container.evaluate((el) => ({ sh: el.scrollHeight, ch: el.clientHeight }))
    expect(metrics.sh).toBeGreaterThan(metrics.ch)

    await container.evaluate((el) => { el.scrollTo({ top: el.scrollHeight, behavior: 'auto' }) })
    const pos = await container.evaluate((el) => el.scrollTop)
    expect(pos).toBeGreaterThan(0)
  })
})

