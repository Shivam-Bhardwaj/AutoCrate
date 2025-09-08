// Puppeteer E2E Test Configuration
const baseURL = process.env.PUPPETEER_BASE_URL || 'http://localhost:3000';

module.exports = {
  baseURL,
  launchOptions: {
    headless: process.env.HEADLESS !== 'false',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  },
  viewport: {
    width: 1920,
    height: 1080,
  },
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  screenshotOptions: {
    path: 'test-results/screenshots',
    fullPage: true,
  },
};
