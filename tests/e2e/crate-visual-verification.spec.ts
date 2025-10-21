import { test, expect } from '@playwright/test'

/**
 * Visual verification tests for B-Style Crate
 * Takes screenshots of different crate configurations for manual inspection
 */

test.describe('B-Style Crate Visual Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('AutoCrate')
    // Wait for 3D view to load
    await page.waitForTimeout(3000)
  })

  test('Small Crate (24x24x24) - Visual Inspection', async ({ page }) => {
    // Configure small crate
    await page.getByTestId('input-length').fill('24')
    await page.getByTestId('input-width').fill('24')
    await page.getByTestId('input-height').fill('24')
    await page.getByTestId('input-weight').fill('300')
    await page.keyboard.press('Tab')

    // Wait for 3D render to update
    await page.waitForTimeout(2000)

    // Take full-page screenshot
    await page.screenshot({
      path: 'test-results/visual/small-crate-24x24x24-full.png',
      fullPage: true
    })

    // Take 3D view screenshot
    const canvas = page.locator('canvas').first()
    await canvas.screenshot({
      path: 'test-results/visual/small-crate-24x24x24-3d.png'
    })

    // Check NX Expressions tab for measurements
    await page.getByRole('button', { name: 'NX Expressions' }).click()
    await page.waitForTimeout(500)
    await page.screenshot({
      path: 'test-results/visual/small-crate-24x24x24-nx-expressions.png',
      fullPage: true
    })

    // Check Cut List
    await page.getByRole('button', { name: 'Cut List' }).click()
    await page.waitForTimeout(500)
    await page.screenshot({
      path: 'test-results/visual/small-crate-24x24x24-cut-list.png',
      fullPage: true
    })
  })

  test('Medium Crate (48x48x48) - Visual Inspection', async ({ page }) => {
    // Configure medium crate
    await page.getByTestId('input-length').fill('48')
    await page.getByTestId('input-width').fill('48')
    await page.getByTestId('input-height').fill('48')
    await page.getByTestId('input-weight').fill('1500')
    await page.keyboard.press('Tab')

    await page.waitForTimeout(2000)

    await page.screenshot({
      path: 'test-results/visual/medium-crate-48x48x48-full.png',
      fullPage: true
    })

    const canvas = page.locator('canvas').first()
    await canvas.screenshot({
      path: 'test-results/visual/medium-crate-48x48x48-3d.png'
    })

    // NX Expressions
    await page.getByRole('button', { name: 'NX Expressions' }).click()
    await page.waitForTimeout(500)
    await page.screenshot({
      path: 'test-results/visual/medium-crate-48x48x48-nx-expressions.png',
      fullPage: true
    })
  })

  test('Large Crate (96x72x60) - Visual Inspection', async ({ page }) => {
    // Configure large crate
    await page.getByTestId('input-length').fill('96')
    await page.getByTestId('input-width').fill('72')
    await page.getByTestId('input-height').fill('60')
    await page.getByTestId('input-weight').fill('5000')
    await page.keyboard.press('Tab')

    await page.waitForTimeout(2000)

    await page.screenshot({
      path: 'test-results/visual/large-crate-96x72x60-full.png',
      fullPage: true
    })

    const canvas = page.locator('canvas').first()
    await canvas.screenshot({
      path: 'test-results/visual/large-crate-96x72x60-3d.png'
    })

    // NX Expressions
    await page.getByRole('button', { name: 'NX Expressions' }).click()
    await page.waitForTimeout(500)
    await page.screenshot({
      path: 'test-results/visual/large-crate-96x72x60-nx-expressions.png',
      fullPage: true
    })

    // Cut List
    await page.getByRole('button', { name: 'Cut List' }).click()
    await page.waitForTimeout(500)
    await page.screenshot({
      path: 'test-results/visual/large-crate-96x72x60-cut-list.png',
      fullPage: true
    })
  })

  test('Panel Stops Visibility - Visual Check', async ({ page }) => {
    // Medium crate for clear panel stop visibility
    await page.getByTestId('input-length').fill('48')
    await page.getByTestId('input-width').fill('48')
    await page.getByTestId('input-height').fill('48')
    await page.keyboard.press('Tab')

    await page.waitForTimeout(2000)

    // Capture multiple angles if possible by rotating view
    await page.screenshot({
      path: 'test-results/visual/panel-stops-view.png',
      fullPage: true
    })

    const canvas = page.locator('canvas').first()
    await canvas.screenshot({
      path: 'test-results/visual/panel-stops-3d-close.png'
    })
  })

  test('Ground Clearance (4") - Side View', async ({ page }) => {
    // Configure crate to show ground clearance
    await page.getByTestId('input-length').fill('48')
    await page.getByTestId('input-width').fill('48')
    await page.getByTestId('input-height').fill('48')
    await page.keyboard.press('Tab')

    await page.waitForTimeout(2000)

    // Take screenshot showing ground clearance
    await page.screenshot({
      path: 'test-results/visual/ground-clearance-4inch.png',
      fullPage: true
    })

    const canvas = page.locator('canvas').first()
    await canvas.screenshot({
      path: 'test-results/visual/ground-clearance-3d-side-view.png'
    })
  })

  test('Lag Screw Patterns - Different Sizes', async ({ page }) => {
    const sizes = [
      { l: '24', w: '24', h: '24', name: 'small-2-lags' },
      { l: '48', w: '48', h: '48', name: 'medium-3-lags' },
      { l: '96', w: '72', h: '60', name: 'large-5-lags' },
    ]

    for (const size of sizes) {
      await page.getByTestId('input-length').fill(size.l)
      await page.getByTestId('input-width').fill(size.w)
      await page.getByTestId('input-height').fill(size.h)
      await page.keyboard.press('Tab')

      await page.waitForTimeout(2000)

      await page.screenshot({
        path: `test-results/visual/lag-screws-${size.name}.png`,
        fullPage: true
      })
    }
  })

  test('NX Export - Datum Plane Documentation', async ({ page }) => {
    // Any crate size
    await page.getByTestId('input-length').fill('48')
    await page.getByTestId('input-width').fill('48')
    await page.getByTestId('input-height').fill('48')
    await page.keyboard.press('Tab')

    await page.waitForTimeout(1000)

    // Go to NX Expressions tab
    await page.getByRole('button', { name: 'NX Expressions' }).click()
    await page.waitForTimeout(500)

    // Screenshot the NX export showing datum planes
    await page.screenshot({
      path: 'test-results/visual/nx-export-datum-planes.png',
      fullPage: true
    })
  })
})
