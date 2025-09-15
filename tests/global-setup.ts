import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  // Start a browser instance for setup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the development server to be ready
    console.log('⏳ Waiting for development server to be ready...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Verify the app is loading correctly
    await page.waitForSelector('body', { timeout: 30000 });
    console.log('✅ Development server is ready');
    
    // Optional: Set up any global test data or authentication
    // await setupTestData(page);
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('✅ Global setup completed');
}

export default globalSetup;

