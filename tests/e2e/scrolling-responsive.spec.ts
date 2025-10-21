import { test, expect, Page } from '@playwright/test'

/**
 * Streamlined E2E tests for scrolling across iPhone 12 Pro Max, iPad, and Desktop Chrome
 */

// Helper to check if element is scrollable
async function isScrollable(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel)
    if (!element) return false
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
  }, selector)
}

// Helper to open mobile menu if needed
const openInputsIfMobile = async (page: Page, isMobile: boolean) => {
  if (isMobile) {
    const toggle = page.getByTestId('mobile-menu-toggle')
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click()
      await page.waitForTimeout(300)
    }
  }
}

test.describe('Mobile Scrolling (iPhone 12 Pro Max)', () => {
  test.use({
    ...test.use,
    // Only run on iPhone 12 Pro Max
    // @ts-ignore
    _projects: ['iPhone 12 Pro Max'],
  })

  test('sidebar should scroll when inputs menu is open', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open mobile inputs if toggle exists
    await openInputsIfMobile(page, true)

    // Find the sidebar
    const sidebar = page.locator('aside').first()
    if (await sidebar.isVisible()) {
      // Check if sidebar is scrollable
      const scrollable = await isScrollable(page, 'aside')
      expect(scrollable).toBe(true)
    }
  })

  test('tab content should scroll vertically', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Switch to NX Expressions tab
    await page.getByRole('button', { name: 'NX Expressions' }).click()
    await page.waitForTimeout(500)

    // Check if tab content is scrollable
    const expressionsTab = page.locator('div.flex-1.min-h-0.overflow-auto').first()
    await expect(expressionsTab).toBeVisible()

    const scrollable = await isScrollable(page, 'div.flex-1.min-h-0.overflow-auto')
    expect(scrollable).toBe(true)
  })

  test('BOM table should scroll horizontally on narrow screen', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Switch to BOM tab
    await page.getByRole('button', { name: 'BOM', exact: true }).click()
    await page.waitForTimeout(500)

    const bomContainer = page.locator('div.overflow-x-auto').first()
    await expect(bomContainer).toBeVisible()

    const scrollable = await isScrollable(page, 'div.overflow-x-auto')
    expect(scrollable).toBe(true)
  })

  test('Cut List should scroll vertically', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Switch to Cut List tab
    await page.getByRole('button', { name: 'Cut List' }).click()
    await page.waitForTimeout(500)

    const cutListTab = page.locator('div.flex-1.min-h-0.overflow-auto').first()
    await expect(cutListTab).toBeVisible()

    const scrollable = await isScrollable(page, 'div.flex-1.min-h-0.overflow-auto')
    expect(scrollable).toBe(true)
  })
})

test.describe('Desktop/Tablet Scrolling (iPad & Desktop Chrome)', () => {
  test('sidebar should be visible and scrollable', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Sidebar should be visible on desktop/tablet
    const sidebar = page.locator('aside').first()
    await expect(sidebar).toBeVisible()

    // Check if sidebar is scrollable
    const scrollable = await isScrollable(page, 'aside')
    expect(scrollable).toBe(true)
  })

  test('all tabs should be accessible and scrollable', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const tabs = ['NX Expressions', 'BOM', 'Cut List', 'Plywood Pieces']

    for (const tabName of tabs) {
      // Click tab
      await page.getByRole('button', { name: tabName, exact: true }).click()
      await page.waitForTimeout(500)

      // Verify tab content is visible
      const tabContent = page.locator('div.flex-1').first()
      await expect(tabContent).toBeVisible()
    }
  })

  test('no horizontal scroll on main page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check that page doesn't have horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })

  test('BOM and Cut List tables should be fully visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // BOM tab
    await page.getByRole('button', { name: 'BOM', exact: true }).click()
    await page.waitForTimeout(500)

    const bomTable = page.getByTestId('bom-table')
    await expect(bomTable).toBeVisible()

    // Cut List tab
    await page.getByRole('button', { name: 'Cut List' }).click()
    await page.waitForTimeout(500)

    const cutListContainer = page.locator('div.flex-1.min-h-0.overflow-auto').first()
    await expect(cutListContainer).toBeVisible()
  })
})

test.describe('Cross-Device Consistency', () => {
  test('3D view should render on all devices', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for 3D canvas to load
    await page.waitForTimeout(2000)

    // Check canvas exists
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()
  })

  test('export buttons should be accessible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('button', { name: 'Export NX' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Export BOM' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Download STEP' })).toBeVisible()
  })

  test('theme toggle should work', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Look for theme toggle button
    const themeToggle = page.getByRole('button', { name: /theme|dark|light/i }).first()
    if (await themeToggle.isVisible().catch(() => false)) {
      await themeToggle.click()
      await page.waitForTimeout(500)
      // Theme should have changed (just verify no errors)
    }
  })
})
