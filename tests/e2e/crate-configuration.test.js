const puppeteer = require('puppeteer');
const config = require('./puppeteer.config');

// Simple sleep helper (avoid page.waitForTimeout which may not exist in current Puppeteer version)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Crate Configuration Flow', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch(config.launchOptions);
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport(config.viewport);
    // Navigate and allow extra time for first dev compile
    await page.goto(config.baseURL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    // Robust readiness wait: wait until the app title appears or hydration skeleton present
    try {
      await page.waitForFunction(() => !!document.querySelector('[data-testid="app-title"]'), {
        timeout: 45000,
      });
    } catch (e) {
      // Capture minimal debug info to aid diagnosing flakiness
      const html = await page.content();
      // eslint-disable-next-line no-console
      console.warn(
        'DEBUG: app-title not found after initial wait. Current HTML length:',
        html.length
      );
      throw e;
    }
  });

  afterEach(async () => {
    await page.close();
  });

  test('should load the application', async () => {
    // Title should already be present from beforeEach readiness wait, but add a reaffirmation with longer timeout
    await page.waitForSelector('[data-testid="app-title"]', { timeout: 45000 });

    const h1Text = await page.$eval('[data-testid="app-title"]', (el) => el.textContent);
    expect(h1Text).toContain('AutoCrate');

    // Wait for one of the main sections to guarantee hydration finished
    await page.waitForSelector('[data-testid="section-product-config"]', { timeout: 20000 });

    const sections = await page.$$eval('[data-testid^="section-"]', (els) =>
      els.map((e) => e.textContent)
    );
    expect(sections).toContain('Product Configuration');
    expect(sections).toContain('Crate Visualization');
    expect(sections).toContain('System Logs');
  }, 30000);

  test('should have 3D canvas visible', async () => {
    await page.waitForSelector('[data-testid="crate-viewer-container"]', { timeout: 45000 });
    // Look for a canvas inside container with retry (some delay for R3F mount / dynamic import)
    const canvas = await page.waitForSelector('[data-testid="crate-viewer-container"] canvas', {
      timeout: 45000,
    });
    expect(canvas).toBeTruthy();
    const sizeOk = await page.evaluate(() => {
      const c = document.querySelector('[data-testid="crate-viewer-container"] canvas');
      if (!c) return false;
      const r = c.getBoundingClientRect();
      return r.width >= 200 && r.height >= 150; // sanity thresholds
    });
    expect(sizeOk).toBeTruthy();
  }, 30000);

  test('should have dimension inputs', async () => {
    await page.waitForSelector('[data-testid="section-product-config"]', { timeout: 45000 });
    // Wait for at least 5 number inputs
    await page.waitForFunction(
      () => document.querySelectorAll('input[type="number"]').length >= 5,
      { timeout: 45000 }
    );
    const numberCount = await page.evaluate(
      () => document.querySelectorAll('input[type="number"]').length
    );
    expect(numberCount).toBeGreaterThanOrEqual(5);
  }, 30000);

  test('should handle responsive layout', async () => {
    await page.waitForSelector('[data-testid="app-title"]', { timeout: 45000 });
    await page.setViewport({ width: 375, height: 812 });
    await sleep(500);
    const titleStillThere = await page.$('[data-testid="app-title"]');
    expect(titleStillThere).toBeTruthy();
    await page.setViewport({ width: 1280, height: 900 });
    await sleep(500);
    const canvas = await page.$('[data-testid="crate-viewer-container"] canvas');
    expect(canvas).toBeTruthy();
  }, 30000);

  test('should update dimensions', async () => {
    await page.waitForFunction(
      () => document.querySelectorAll('input[type="number"]').length >= 5,
      { timeout: 45000 }
    );
    const lengthInput = await page.$('input[type="number"]');
    expect(lengthInput).toBeTruthy();
    await lengthInput.click({ clickCount: 3 });
    await lengthInput.type('100');
    await sleep(400);
    const value = await page.evaluate(() => {
      const firstNumberInput = document.querySelector('input[type="number"]');
      return firstNumberInput ? firstNumberInput.value : null;
    });
    expect(value).toBe('100');
  }, 30000);
});
