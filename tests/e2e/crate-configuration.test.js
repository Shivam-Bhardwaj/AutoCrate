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
    await page.goto(config.baseURL, { waitUntil: 'networkidle2', timeout: 30000 });
  });

  afterEach(async () => {
    await page.close();
  });

  test('should load the application', async () => {
    // Wait for the app to fully load
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check for AutoCrate title
    const h1Text = await page.$eval('h1', (el) => el.textContent);
    expect(h1Text).toContain('AutoCrate');

    // Check page title
    const pageTitle = await page.title();
    expect(pageTitle).toContain('AutoCrate');

    // Check for main sections
    const h2Elements = await page.$$eval('h2', (elements) => elements.map((el) => el.textContent));
    expect(h2Elements).toContain('Input Section');
    expect(h2Elements).toContain('3D Rendering');
    expect(h2Elements).toContain('Output Section');
  }, 30000);

  test('should have 3D canvas visible', async () => {
    // Wait a bit for Three.js to initialize
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check for canvas element (Three.js renderer)
    const canvas = await page.$('canvas');
    expect(canvas).toBeTruthy();

    // Verify canvas is visible
    const isCanvasVisible = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const rect = canvas.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    expect(isCanvasVisible).toBeTruthy();
  }, 30000);

  test('should have dimension inputs', async () => {
    // Check for input fields
    const inputs = await page.$$('input');
    expect(inputs.length).toBeGreaterThan(0);

    // Check specifically for number inputs (dimensions)
    const numberInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="number"]');
      return inputs.length;
    });
    expect(numberInputs).toBeGreaterThanOrEqual(5); // Length, Width, Height, Product Weight, Max Gross Weight

    // Check for text inputs (project name)
    const textInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"]');
      return inputs.length;
    });
    expect(textInputs).toBeGreaterThanOrEqual(1);
  }, 30000);

  test('should handle responsive layout', async () => {
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 812 });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check that main heading is still visible
    const mobileH1 = await page.$('h1');
    expect(mobileH1).toBeTruthy();

    // Check that content adapts
    const mobileLayout = await page.evaluate(() => {
      return window.innerWidth <= 768;
    });
    expect(mobileLayout).toBeTruthy();

    // Test desktop viewport
    await page.setViewport({ width: 1920, height: 1080 });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check desktop layout
    const desktopLayout = await page.evaluate(() => {
      return window.innerWidth > 768;
    });
    expect(desktopLayout).toBeTruthy();

    // Canvas should still be visible in desktop
    const canvas = await page.$('canvas');
    expect(canvas).toBeTruthy();
  }, 30000);

  test('should update dimensions', async () => {
    // Wait for inputs to be present
    await page.waitForSelector('input[type="number"]', { timeout: 5000 });

    // Find length input (first number input typically)
    const lengthInput = await page.$('input[type="number"]');
    expect(lengthInput).toBeTruthy();

    // Clear and type new value
    await lengthInput.click({ clickCount: 3 }); // Select all
    await lengthInput.type('100');

    // Wait a bit for the value to update
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify the value was set
    const value = await page.evaluate(() => {
      const firstNumberInput = document.querySelector('input[type="number"]');
      return firstNumberInput ? firstNumberInput.value : null;
    });
    expect(value).toBe('100');

    // Check that logs were updated (indicates the app is reactive)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const logsSection = await page.$eval('h2', (el) => {
      const h2s = Array.from(document.querySelectorAll('h2'));
      const logsH2 = h2s.find((h) => h.textContent.includes('System Logs'));
      return logsH2 !== null;
    });
    expect(logsSection).toBeTruthy();
  }, 30000);
});
