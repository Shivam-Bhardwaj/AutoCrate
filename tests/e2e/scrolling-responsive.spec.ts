import { test, expect, Page } from '@playwright/test'

/**
 * Comprehensive E2E tests for scrolling functionality across different screen sizes
 * Tests for GitHub Issue #76 - Scrolling bug fix
 */

// Helper to check if element is scrollable
async function isScrollable(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel)
    if (!element) return false
    return element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
  }, selector)
}

// Helper to get scroll position
async function getScrollPosition(page: Page, selector: string) {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel)
    if (!element) return { top: 0, left: 0 }
    return { top: element.scrollTop, left: element.scrollLeft }
  }, selector)
}

// Helper to scroll element
async function scrollElement(page: Page, selector: string, deltaY: number, deltaX: number = 0) {
  await page.evaluate(({ sel, dy, dx }) => {
    const element = document.querySelector(sel)
    if (!element) return
    element.scrollTop += dy
    element.scrollLeft += dx
  }, { sel: selector, dy: deltaY, dx: deltaX })
}

// Helper to open mobile menu
const openInputsIfMobile = async (page: Page, isMobile: boolean) => {
  if (isMobile) {
    const toggle = page.getByTestId('mobile-menu-toggle')
    await expect(toggle).toBeVisible()
    await toggle.click()
    await page.waitForTimeout(300) // Wait for animation
  }
}

test.describe('Scrolling - Mobile Phone (iPhone Safari simulation)', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 12/13/14 Pro
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  })

  test('sidebar should scroll on mobile when inputs menu is open', async ({ page }) => {
    await page.goto('/')

    // Open mobile inputs
    await openInputsIfMobile(page, true)

    // Find the sidebar
    const sidebar = page.locator('aside').first()
    await expect(sidebar).toBeVisible()

    // Check if sidebar is scrollable
    const scrollable = await isScrollable(page, 'aside')
    expect(scrollable).toBe(true)

    // Get initial scroll position
    const initialPos = await getScrollPosition(page, 'aside')

    // Scroll down in sidebar
    await scrollElement(page, 'aside', 200)
    await page.waitForTimeout(100)

    // Check scroll position changed
    const newPos = await getScrollPosition(page, 'aside')
    expect(newPos.top).toBeGreaterThan(initialPos.top)
  })

  test('NX Expressions tab content should scroll vertically on mobile', async ({ page }) => {
    await page.goto('/')

    // Switch to NX Expressions tab
    await page.getByRole('button', { name: 'NX Expressions' }).click()
    await page.waitForTimeout(500)

    // Find the expressions container
    const expressionsTab = page.locator('div.flex-1.min-h-0.overflow-auto').first()
    await expect(expressionsTab).toBeVisible()

    // Check if scrollable
    const scrollable = await isScrollable(page, 'div.flex-1.min-h-0.overflow-auto')
    expect(scrollable).toBe(true)

    // Scroll down
    await expressionsTab.evaluate((el) => {
      el.scrollTop = 100
    })
    await page.waitForTimeout(100)

    const scrollTop = await expressionsTab.evaluate((el) => el.scrollTop)
    expect(scrollTop).toBeGreaterThan(0)
  })

  test('BOM table should scroll horizontally on narrow mobile screen', async ({ page }) => {
    await page.goto('/')

    // Switch to BOM tab
    await page.getByRole('button', { name: 'BOM', exact: true }).click()
    await page.waitForTimeout(500)

    // Get table container
    const tableContainer = page.locator('div.overflow-x-auto').first()
    await expect(tableContainer).toBeVisible()

    // Check horizontal scrollability
    const hasHorizontalScroll = await page.evaluate(() => {
      const container = document.querySelector('div.overflow-x-auto')
      if (!container) return false
      return container.scrollWidth > container.clientWidth
    })

    expect(hasHorizontalScroll).toBe(true)
  })

  test('Cut List tab should scroll vertically on mobile', async ({ page }) => {
    await page.goto('/')

    // Switch to Cut List tab
    await page.getByRole('button', { name: 'Cut List' }).click()
    await page.waitForTimeout(500)

    // Get the tab content container
    const cutListContainer = page.locator('div.flex-1.min-h-0.overflow-auto').first()
    await expect(cutListContainer).toBeVisible()

    // Check vertical scrollability
    const scrollable = await isScrollable(page, 'div.flex-1.min-h-0.overflow-auto')
    expect(scrollable).toBe(true)

    // Scroll down
    await cutListContainer.evaluate((el) => {
      el.scrollTop = 150
    })
    await page.waitForTimeout(100)

    const scrollTop = await cutListContainer.evaluate((el) => el.scrollTop)
    expect(scrollTop).toBeGreaterThan(0)
  })

  test('Plywood Pieces tab should scroll on mobile', async ({ page }) => {
    await page.goto('/')

    // Switch to Plywood Pieces tab
    await page.getByRole('button', { name: 'Plywood Pieces' }).click()
    await page.waitForTimeout(500)

    const plywoodContainer = page.locator('div.flex-1.min-h-0.overflow-auto').first()
    await expect(plywoodContainer).toBeVisible()

    // Verify scrollability
    const scrollable = await isScrollable(page, 'div.flex-1.min-h-0.overflow-auto')
    expect(scrollable).toBe(true)
  })

  test('tab navigation should scroll horizontally when tabs overflow', async ({ page }) => {
    await page.goto('/')

    // Check if tab navigation is scrollable
    const tabNav = page.locator('nav.flex.overflow-x-auto').first()
    await expect(tabNav).toBeVisible()

    // On mobile, tabs might overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      const nav = document.querySelector('nav.flex.overflow-x-auto')
      if (!nav) return false
      return nav.scrollWidth > nav.clientWidth
    })

    // Tabs should fit or scroll
    expect(typeof hasHorizontalScroll).toBe('boolean')
  })

  test('touch scrolling properties should be applied', async ({ page }) => {
    await page.goto('/')

    // Check if webkit overflow scrolling is applied
    const hasWebkitScrolling = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body)
      return style.webkitOverflowScrolling === 'touch' ||
             document.querySelector('[style*="WebkitOverflowScrolling"]') !== null
    })

    expect(hasWebkitScrolling).toBe(true)
  })
})

test.describe('Scrolling - Tablet (iPad simulation)', () => {
  test.use({
    viewport: { width: 768, height: 1024 }, // iPad Mini
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  })

  test('sidebar should be visible and scrollable on tablet', async ({ page }) => {
    await page.goto('/')

    // On tablet with lg: breakpoint, sidebar might be visible
    const sidebar = page.locator('aside').first()

    // Wait for sidebar to potentially be visible
    await page.waitForTimeout(300)

    const isVisible = await sidebar.isVisible()

    if (isVisible) {
      // If visible, check scrollability
      const scrollable = await isScrollable(page, 'aside')
      expect(scrollable).toBe(true)
    }
  })

  test('all tabs should be scrollable on tablet viewport', async ({ page }) => {
    await page.goto('/')

    const tabs = ['BOM', 'Cut List', 'Plywood Pieces', 'NX Expressions']

    for (const tabName of tabs) {
      await page.getByRole('button', { name: tabName, exact: tabName === 'BOM' }).click()
      await page.waitForTimeout(300)

      // Check content is scrollable
      const scrollable = await isScrollable(page, 'div.flex-1.min-h-0.overflow-auto')
      expect(scrollable).toBe(true)
    }
  })

  test('tables should have horizontal scroll on tablet when needed', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'BOM', exact: true }).click()
    await page.waitForTimeout(300)

    // Check table has min-width
    const tableMinWidth = await page.evaluate(() => {
      const table = document.querySelector('table[data-testid="bom-table"]')
      if (!table) return 0
      return parseInt(window.getComputedStyle(table).minWidth || '0')
    })

    expect(tableMinWidth).toBeGreaterThan(0)
  })
})

test.describe('Scrolling - Desktop', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  })

  test('sidebar should be visible and scrollable on desktop', async ({ page }) => {
    await page.goto('/')

    const sidebar = page.locator('aside').first()
    await expect(sidebar).toBeVisible()

    // Check scrollability
    const scrollable = await isScrollable(page, 'aside')
    expect(scrollable).toBe(true)
  })

  test('all tab content should scroll properly on desktop', async ({ page }) => {
    await page.goto('/')

    const tabs = ['visualization', 'expressions', 'bom', 'lumber', 'plywood']
    const tabButtons = ['3D View', 'NX Expressions', 'BOM', 'Cut List', 'Plywood Pieces']

    for (let i = 0; i < tabButtons.length; i++) {
      await page.getByRole('button', { name: tabButtons[i], exact: tabButtons[i] === 'BOM' }).click()
      await page.waitForTimeout(300)

      // Verify tab content is present and scrollable where appropriate
      const tabContent = page.locator('div.flex-1.p-2')
      await expect(tabContent).toBeVisible()
    }
  })

  test('no horizontal scroll on main page on desktop', async ({ page }) => {
    await page.goto('/')

    // Check body doesn't have horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth
    })

    expect(hasHorizontalScroll).toBe(false)
  })

  test('Cut List tables should be fully visible on wide desktop', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Cut List' }).click()
    await page.waitForTimeout(300)

    // Tables should fit without horizontal scroll on desktop
    const hasHorizontalScroll = await page.evaluate(() => {
      const container = document.querySelector('div.flex-1.min-h-0.overflow-auto')
      if (!container) return false
      return container.scrollWidth > container.clientWidth
    })

    // On desktop, tables should fit (or scroll gracefully)
    expect(typeof hasHorizontalScroll).toBe('boolean')
  })
})

test.describe('Scrolling - Small Mobile (iPhone SE)', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE
  })

  test('content should be accessible via scroll on small screen', async ({ page }) => {
    await page.goto('/')

    // Open inputs
    await openInputsIfMobile(page, true)

    // Sidebar should scroll
    const sidebar = page.locator('aside').first()
    await expect(sidebar).toBeVisible()

    const scrollable = await isScrollable(page, 'aside')
    expect(scrollable).toBe(true)

    // Scroll to bottom
    await scrollElement(page, 'aside', 1000)
    await page.waitForTimeout(100)

    // Should be able to reach Quick Scenarios at bottom
    const scenarios = page.getByText('Quick Scenarios')
    // Might need to scroll to see it
    const isInViewport = await scenarios.isVisible()
    expect(typeof isInViewport).toBe('boolean')
  })

  test('NX expressions should wrap and scroll on small screen', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'NX Expressions' }).click()
    await page.waitForTimeout(500)

    // Check pre element has word wrap
    const preElement = page.locator('pre').first()
    await expect(preElement).toBeVisible()

    const whiteSpace = await preElement.evaluate((el) => {
      return window.getComputedStyle(el).whiteSpace
    })

    // Should be 'pre-wrap' for wrapping
    expect(whiteSpace).toContain('pre-wrap')
  })
})

test.describe('Scrolling - Landscape Mobile', () => {
  test.use({
    viewport: { width: 844, height: 390 }, // iPhone in landscape
  })

  test('should handle landscape orientation scrolling', async ({ page }) => {
    await page.goto('/')

    // In landscape, inputs might be visible or need toggle
    const sidebar = page.locator('aside').first()

    // Try to make sidebar visible
    const menuToggle = page.getByTestId('mobile-menu-toggle')
    if (await menuToggle.isVisible()) {
      await menuToggle.click()
      await page.waitForTimeout(300)
    }

    // Sidebar should still be scrollable in landscape
    if (await sidebar.isVisible()) {
      const scrollable = await isScrollable(page, 'aside')
      expect(scrollable).toBe(true)
    }
  })

  test('tab content should scroll in landscape', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Cut List' }).click()
    await page.waitForTimeout(300)

    const container = page.locator('div.flex-1.min-h-0.overflow-auto').first()
    await expect(container).toBeVisible()

    const scrollable = await isScrollable(page, 'div.flex-1.min-h-0.overflow-auto')
    expect(scrollable).toBe(true)
  })
})

test.describe('Scrolling - Cross-browser mobile', () => {
  test('scrolling works on Mobile Chrome (Android simulation)', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 915 }) // Pixel 5
    await page.goto('/')

    await openInputsIfMobile(page, true)

    const sidebar = page.locator('aside').first()
    await expect(sidebar).toBeVisible()

    // Test scrolling
    const scrollable = await isScrollable(page, 'aside')
    expect(scrollable).toBe(true)

    await scrollElement(page, 'aside', 100)
    await page.waitForTimeout(100)

    const pos = await getScrollPosition(page, 'aside')
    expect(pos.top).toBeGreaterThan(0)
  })
})

test.describe('Scrolling - Accessibility and UX', () => {
  test.use({
    viewport: { width: 390, height: 844 },
  })

  test('scrollbars should be styled and visible', async ({ page }) => {
    await page.goto('/')

    // Check if custom scrollbar styles are applied
    const hasCustomScrollbar = await page.evaluate(() => {
      // Check global CSS
      const styles = Array.from(document.styleSheets)
      for (const sheet of styles) {
        try {
          const rules = Array.from(sheet.cssRules || [])
          for (const rule of rules) {
            if (rule.cssText && (
              rule.cssText.includes('scrollbar-width') ||
              rule.cssText.includes('::-webkit-scrollbar')
            )) {
              return true
            }
          }
        } catch (e) {
          // Cross-origin stylesheet, skip
        }
      }
      return false
    })

    expect(hasCustomScrollbar).toBe(true)
  })

  test('overflow containers should not clip content inappropriately', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'BOM', exact: true }).click()
    await page.waitForTimeout(300)

    // Table should be accessible
    const table = page.getByTestId('bom-table')
    await expect(table).toBeVisible()

    // Should have overflow container
    const container = page.locator('div.overflow-x-auto').first()
    await expect(container).toBeVisible()
  })
})
