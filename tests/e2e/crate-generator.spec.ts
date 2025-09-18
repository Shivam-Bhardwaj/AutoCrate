import { test, expect, Page } from '@playwright/test'

test.describe('AutoCrate Generator E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the app to load
    await page.waitForSelector('h1:has-text("AutoCrate NX Generator")')
  })

  test('should load the application successfully', async ({ page }) => {
    // Check main elements are present
    await expect(page.locator('h1')).toContainText('AutoCrate NX Generator')
    await expect(page.locator('text=Two Diagonal Points Method')).toBeVisible()

    // Check export buttons
    await expect(page.locator('button:has-text("Export NX")')).toBeVisible()
    await expect(page.locator('button:has-text("Export BOM")')).toBeVisible()
    await expect(page.locator('button:has-text("Download STEP")')).toBeVisible()
  })

  test('should update dimensions and recalculate', async ({ page }) => {
    // Change product dimensions
    await page.fill('input[value="135"]', '200')
    await page.keyboard.press('Tab')

    // Wait for recalculation
    await page.waitForTimeout(600)

    // Check that overall dimensions updated
    const calculated = page.locator('text=Overall:').locator('..')
    await expect(calculated).toContainText('206.0')
  })

  test('should switch between tabs', async ({ page }) => {
    // Click on NX Expressions tab
    await page.click('button:has-text("NX Expressions")')
    await expect(page.locator('pre')).toBeVisible()

    // Click on BOM tab
    await page.click('button:has-text("BOM")')
    await expect(page.locator('table')).toBeVisible()

    // Click on Plywood Pieces tab
    await page.click('button:has-text("Plywood Pieces")')
    await page.waitForSelector('text=/FRONT_PANEL/')

    // Go back to 3D View
    await page.click('button:has-text("3D View")')
    await expect(page.locator('canvas')).toBeVisible()
  })

  test('should download STEP file', async ({ page }) => {
    // Set up download promise before clicking
    const downloadPromise = page.waitForEvent('download')

    // Click download button
    await page.click('button:has-text("Download STEP")')

    // Wait for download and verify
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('crate_model.stp')

    // Save and check file content
    const path = await download.path()
    expect(path).toBeTruthy()
  })

  test('should download NX expressions', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Export NX")')

    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/crate_expressions.*\.txt/)
  })

  test('should download BOM', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Export BOM")')

    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/crate_bom.*\.csv/)
  })

  test('should toggle display options', async ({ page }) => {
    // Toggle off skids
    await page.click('label:has-text("Skids") input[type="checkbox"]')

    // Verify the 3D view updates (canvas should still be visible)
    await expect(page.locator('canvas')).toBeVisible()

    // Toggle off front panel
    await page.click('label:has-text("Front Panel") input[type="checkbox"]')

    // Toggle back on
    await page.click('label:has-text("Skids") input[type="checkbox"]')
    await page.click('label:has-text("Front Panel") input[type="checkbox"]')
  })

  test('should handle 3x4 lumber toggle', async ({ page }) => {
    // Find and click the 3x4 lumber toggle
    const toggle = page.locator('button').filter({ hasText: '' }).nth(0) // The toggle button
    await toggle.click()

    // Check the toggle moved
    await expect(page.locator('text=For products < 500 lbs')).toBeVisible()

    // Toggle back
    await toggle.click()
    await expect(page.locator('text=4x4 for all < 4500 lbs')).toBeVisible()
  })

  test('should handle invalid input gracefully', async ({ page }) => {
    // Enter invalid values
    const lengthInput = page.locator('input').first()
    await lengthInput.fill('')
    await lengthInput.fill('-100')
    await page.keyboard.press('Tab')

    // App should not crash
    await expect(page.locator('h1')).toContainText('AutoCrate NX Generator')
  })

  test('should handle weight-based skid calculation', async ({ page }) => {
    // Find weight input and change to trigger different skid sizes
    const weightInput = page.locator('input[value="10000"]')

    // Test lightweight (should use 4x6)
    await weightInput.fill('3000')
    await page.keyboard.press('Tab')
    await page.waitForTimeout(600)

    let skidInfo = page.locator('text=Skid:').locator('..')
    await expect(skidInfo).toContainText('4x6 lumber')

    // Test heavyweight (should use 6x6)
    await weightInput.fill('15000')
    await page.keyboard.press('Tab')
    await page.waitForTimeout(600)

    skidInfo = page.locator('text=Skid:').locator('..')
    await expect(skidInfo).toContainText('6x6 lumber')
  })

  test('should update floor sizes when toggling options', async ({ page }) => {
    // Toggle off 2x12
    await page.click('label:has-text("2x12") input[type="checkbox"]')
    await page.waitForTimeout(600)

    // Check BOM to ensure 2x12 is not used
    await page.click('button:has-text("BOM")')
    const bomContent = await page.locator('table').textContent()
    expect(bomContent).not.toContain('2x12')

    // Toggle back on
    await page.click('button:has-text("3D View")')
    await page.click('label:has-text("2x12") input[type="checkbox"]')
  })

  test('mobile view should show menu toggle', async ({ page, isMobile }) => {
    if (isMobile) {
      // Menu toggle should be visible on mobile
      await expect(page.locator('button').first()).toBeVisible()

      // Click menu to show inputs
      await page.locator('button').first().click()
      await expect(page.locator('text=Product Dimensions')).toBeVisible()
    }
  })

  test.describe('STEP File Validation', () => {
    test('downloaded STEP file should have valid structure', async ({ page }) => {
      const downloadPromise = page.waitForEvent('download')
      await page.click('button:has-text("Download STEP")')

      const download = await downloadPromise
      const stream = await download.createReadStream()

      let content = ''
      for await (const chunk of stream) {
        content += chunk.toString()
      }

      // Validate STEP file structure
      expect(content).toContain('ISO-10303-21')
      expect(content).toContain('HEADER')
      expect(content).toContain('FILE_DESCRIPTION')
      expect(content).toContain('FILE_NAME')
      expect(content).toContain('FILE_SCHEMA')
      expect(content).toContain('DATA')
      expect(content).toContain('ENDSEC')
      expect(content).toContain('END-ISO-10303-21')

      // Check for entities
      expect(content).toContain('CARTESIAN_POINT')
      expect(content).toContain('DIRECTION')
      expect(content).toContain('BLOCK')
      expect(content).toContain('PRODUCT')
    })
  })

  test.describe('Performance Tests', () => {
    test('should handle rapid dimension changes', async ({ page }) => {
      const lengthInput = page.locator('input').first()

      // Rapidly change values
      for (let i = 100; i <= 200; i += 10) {
        await lengthInput.fill(i.toString())
      }

      // Wait for debounce
      await page.waitForTimeout(600)

      // App should still be responsive
      await expect(page.locator('h1')).toContainText('AutoCrate NX Generator')
      await expect(page.locator('canvas')).toBeVisible()
    })

    test('should handle multiple file downloads', async ({ page }) => {
      // Download all three file types in succession
      const downloads = []

      // STEP file
      let downloadPromise = page.waitForEvent('download')
      await page.click('button:has-text("Download STEP")')
      downloads.push(await downloadPromise)

      // NX expressions
      downloadPromise = page.waitForEvent('download')
      await page.click('button:has-text("Export NX")')
      downloads.push(await downloadPromise)

      // BOM
      downloadPromise = page.waitForEvent('download')
      await page.click('button:has-text("Export BOM")')
      downloads.push(await downloadPromise)

      // Verify all downloads completed
      expect(downloads).toHaveLength(3)
      expect(downloads[0].suggestedFilename()).toContain('.stp')
      expect(downloads[1].suggestedFilename()).toContain('.txt')
      expect(downloads[2].suggestedFilename()).toContain('.csv')
    })
  })
})

test.describe('Accessibility Tests', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')

    // Tab through inputs
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Modify value with keyboard
    await page.keyboard.type('150')
    await page.keyboard.press('Tab')

    // Navigate to buttons
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
    }

    // Should be able to activate button with Enter
    const downloadPromise = page.waitForEvent('download')
    await page.keyboard.press('Enter')

    // Verify action occurred
    const download = await downloadPromise
    expect(download).toBeTruthy()
  })

  test('should have proper labels', async ({ page }) => {
    await page.goto('/')

    // Check that inputs have labels
    const labels = await page.locator('label').count()
    expect(labels).toBeGreaterThan(0)

    // Check specific labels
    await expect(page.locator('text=Length (Y)"')).toBeVisible()
    await expect(page.locator('text=Width (X)"')).toBeVisible()
    await expect(page.locator('text=Height (Z)"')).toBeVisible()
    await expect(page.locator('text=Weight (lbs)')).toBeVisible()
  })
})