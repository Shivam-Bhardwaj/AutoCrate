#!/usr/bin/env node

/**
 * Simple monitoring script using Puppeteer
 * Provides a quick way to check app health and capture screenshots
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const URLS = {
  production: 'https://autocrate-5rr7es9mm-shivams-projects-1d3fe872.vercel.app',
  local: 'http://localhost:3000',
};

async function monitor(environment = 'production') {
  const url = URLS[environment] || environment;

  console.log(`🔍 Monitoring AutoCrate at: ${url}`);
  console.log('─'.repeat(50));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Set viewport for desktop
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate and wait for network idle
    console.log('📡 Loading application...');
    const start = Date.now();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    const loadTime = Date.now() - start;
    console.log(`✅ Page loaded in ${loadTime}ms`);

    // Check for main elements
    console.log('\n🎯 Checking core elements:');

    const elements = [
      { selector: 'h1', name: 'Main heading' },
      { selector: '::-p-text(Input Section)', name: 'Input Section' },
      { selector: '::-p-text(3D Rendering)', name: '3D Rendering' },
      { selector: '::-p-text(Output Section)', name: 'Output Section' },
      { selector: 'canvas', name: '3D Canvas' },
      { selector: 'input[type="number"]', name: 'Number inputs' },
    ];

    for (const { selector, name } of elements) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`  ✅ ${name}: Found`);
      } catch (e) {
        console.log(`  ❌ ${name}: Not found`);
      }
    }

    // Check performance metrics
    console.log('\n📊 Performance metrics:');
    const metrics = await page.metrics();
    console.log(`  Heap Used: ${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB`);
    console.log(`  Documents: ${metrics.Documents}`);
    console.log(`  Frames: ${metrics.Frames}`);
    console.log(`  Nodes: ${metrics.Nodes}`);

    // Check console errors
    console.log('\n🔍 Console output:');
    const logs = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        logs.push(`  ❌ Error: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        logs.push(`  ⚠️  Warning: ${msg.text()}`);
      }
    });

    // Wait a bit for any console messages
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (logs.length > 0) {
      logs.forEach((log) => console.log(log));
    } else {
      console.log('  ✅ No console errors or warnings');
    }

    // Take screenshots
    const screenshotDir = path.join(__dirname, '..', 'monitoring');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    console.log('\n📸 Capturing screenshots:');

    // Desktop view
    const desktopPath = path.join(screenshotDir, `desktop-${Date.now()}.png`);
    await page.screenshot({ path: desktopPath, fullPage: true });
    console.log(`  ✅ Desktop screenshot: ${path.basename(desktopPath)}`);

    // Mobile view
    await page.setViewport({ width: 375, height: 812 });
    const mobilePath = path.join(screenshotDir, `mobile-${Date.now()}.png`);
    await page.screenshot({ path: mobilePath, fullPage: true });
    console.log(`  ✅ Mobile screenshot: ${path.basename(mobilePath)}`);

    // Check responsive behavior
    console.log('\n📱 Responsive check:');
    const isMobileLayout = await page.evaluate(() => {
      return window.innerWidth < 768;
    });
    console.log(`  Mobile layout active: ${isMobileLayout ? 'Yes' : 'No'}`);

    // Test basic interactions
    console.log('\n🎮 Testing interactions:');

    // Try to find and interact with an input
    await page.setViewport({ width: 1920, height: 1080 });
    try {
      const input = await page.$('input[type="number"]');
      if (input) {
        await input.click();
        await input.type('100');
        console.log('  ✅ Input interaction successful');
      }
    } catch (e) {
      console.log('  ❌ Input interaction failed');
    }

    // Summary
    console.log('\n' + '═'.repeat(50));
    console.log('📋 MONITORING SUMMARY');
    console.log('═'.repeat(50));
    console.log(`URL: ${url}`);
    console.log(`Status: ${loadTime < 3000 ? '✅ Healthy' : '⚠️ Slow'}`);
    console.log(`Load Time: ${loadTime}ms`);
    console.log(`Screenshots saved in: ${screenshotDir}`);

    return {
      success: true,
      loadTime,
      url,
    };
  } catch (error) {
    console.error('\n❌ Monitoring failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  const env = process.argv[2] || 'production';
  monitor(env).then((result) => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = monitor;
