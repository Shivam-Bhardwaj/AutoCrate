const puppeteer = require('puppeteer');
const config = require('./puppeteer.config');

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
    await page.goto(config.baseURL, { waitUntil: 'networkidle2' });
  });

  afterEach(async () => {
    await page.close();
  });

  test(
    'should load the application',
    async () => {
      // Check that main title is visible
      const title = await page.$eval('h1', (el) => el.textContent);
      expect(title).toContain('AutoCrate');

      // Check main sections exist
      const inputSection = await page.$('h2::-p-text(Input Section)');
      expect(inputSection).toBeTruthy();

      const renderSection = await page.$('h2::-p-text(3D Rendering)');
      expect(renderSection).toBeTruthy();

      const outputSection = await page.$('h2::-p-text(Output Section)');
      expect(outputSection).toBeTruthy();
    },
    config.timeout
  );

  test(
    'should have 3D canvas visible',
    async () => {
      // Wait for canvas to be rendered
      await page.waitForSelector('canvas', { timeout: 5000 });
      const canvas = await page.$('canvas');
      expect(canvas).toBeTruthy();
    },
    config.timeout
  );

  test(
    'should have dimension inputs',
    async () => {
      // Check that dimension inputs exist
      const inputs = await page.$$('input[type="number"]');
      expect(inputs.length).toBeGreaterThan(0);
    },
    config.timeout
  );

  test(
    'should handle responsive layout',
    async () => {
      // Test mobile viewport
      await page.setViewport({ width: 375, height: 812 });
      const mobileTitle = await page.$('h1');
      expect(mobileTitle).toBeTruthy();

      // Test desktop viewport
      await page.setViewport({ width: 1920, height: 1080 });
      const canvas = await page.$('canvas');
      expect(canvas).toBeTruthy();
    },
    config.timeout
  );

  test(
    'should update dimensions',
    async () => {
      // Find length input and update it
      const lengthInput = await page.$('input[placeholder*="Length"]');
      if (lengthInput) {
        await lengthInput.click({ clickCount: 3 });
        await lengthInput.type('100');

        // Check if value was updated
        const value = await page.$eval('input[placeholder*="Length"]', (el) => el.value);
        expect(value).toBe('100');
      }
    },
    config.timeout
  );
});
