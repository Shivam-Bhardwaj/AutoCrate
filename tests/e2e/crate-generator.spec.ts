import { test, expect, Page } from '@playwright/test'

const openInputsIfMobile = async (page: Page, isMobile: boolean) => {
  if (isMobile) {
    const toggle = page.getByTestId('mobile-menu-toggle')
    await expect(toggle).toBeVisible()
    await toggle.click()
  }
}

test.describe('AutoCrate NX Generator (Chromium focus)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('AutoCrate NX Generator')
  })

  test('renders core controls on load', async ({ page, isMobile }) => {
    await expect(page.getByRole('button', { name: 'Export NX' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Export BOM' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Download STEP' })).toBeVisible()

    if (isMobile) {
      await expect(page.getByTestId('mobile-menu-toggle')).toBeVisible()
    } else {
      await expect(page.getByText('Product Dimensions')).toBeVisible()
      await expect(page.getByTestId('scenario-status')).toContainText('Default Production')
    }
  })

  test('updates exterior dimensions when product length changes', async ({ page, isMobile }) => {
    await openInputsIfMobile(page, isMobile)

    const lengthInput = page.getByTestId('input-length')
    await lengthInput.fill('200')
    await page.keyboard.press('Tab')

    const exterior = page.getByTestId('exterior-dimensions')
    await expect(exterior).toContainText('206.0', { timeout: 4000 })
  })

  test('shows BOM data when switching tabs', async ({ page }) => {
    await page.getByRole('button', { name: 'BOM', exact: true }).click()
    await expect(page.getByTestId('bom-table')).toBeVisible()
    await expect(page.getByTestId('bom-table')).toContainText('Plywood Sheet')
  })

  test('loads preset scenarios without manual typing', async ({ page, isMobile }) => {
    await openInputsIfMobile(page, isMobile)

    await page.getByTestId('scenario-lightweight-electronics').click()
    await expect(page.getByTestId('scenario-status')).toContainText('Lightweight Electronics')
    await expect(page.getByTestId('input-weight')).toHaveValue('350')
    await expect(page.getByTestId('skid-label')).toContainText('3x4 lumber', { timeout: 4000 })
  })

  test('allows enabling 3x4 lumber for light products', async ({ page, isMobile }) => {
    await openInputsIfMobile(page, isMobile)

    const weightInput = page.getByTestId('input-weight')
    await weightInput.fill('400')
    await page.keyboard.press('Tab')

    const skidLabel = page.getByTestId('skid-label')
    await expect(skidLabel).toContainText('4x4 lumber', { timeout: 4000 })

    await page.getByTestId('toggle-3x4').click()
    await expect(page.getByTestId('toggle-3x4-status')).toContainText('For products < 500 lbs')
    await expect(skidLabel).toContainText('3x4 lumber', { timeout: 4000 })
  })

  test('selects heavier skid size for high weight loads', async ({ page, isMobile }) => {
    await openInputsIfMobile(page, isMobile)

    const weightInput = page.getByTestId('input-weight')
    await weightInput.fill('15000')
    await page.keyboard.press('Tab')

    const skidLabel = page.getByTestId('skid-label')
    await expect(skidLabel).toContainText('6x6 lumber', { timeout: 4000 })
  })

  test('downloads NX expressions on desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.toLowerCase().includes('mobile'), 'Download verification is desktop only')

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export NX' }).click()
    const download = await downloadPromise
    await expect(download.suggestedFilename()).toMatch(/crate_expressions.*\.txt/)
  })

  test('downloads STEP file on desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.toLowerCase().includes('mobile'), 'Download verification is desktop only')

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Download STEP' }).click()
    const download = await downloadPromise
    await expect(download.suggestedFilename()).toContain('.stp')
  })

  test('mobile menu toggle reveals inputs', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Navigation drawer is mobile only')

    const menuToggle = page.getByTestId('mobile-menu-toggle')
    await expect(menuToggle).toBeVisible()
    await menuToggle.click()
    await expect(page.getByTestId('input-length')).toBeVisible()
  })
})
