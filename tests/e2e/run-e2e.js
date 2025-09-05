#!/usr/bin/env node

/**
 * Puppeteer E2E Test Runner
 * This script runs all E2E tests using Puppeteer
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure test results directory exists
const resultsDir = path.join(__dirname, '../../test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Configure test environment
const env = {
  ...process.env,
  NODE_ENV: 'test',
  PUPPETEER_BASE_URL: process.env.PUPPETEER_BASE_URL || 'http://localhost:3000',
};

// Parse command line arguments
const args = process.argv.slice(2);
const headless = !args.includes('--headed');
const debug = args.includes('--debug');

if (!headless) {
  env.HEADLESS = 'false';
}

// Run tests with Jest
const jestArgs = [
  '--config',
  path.join(__dirname, 'jest.config.js'),
  '--verbose',
  '--runInBand', // Run tests serially for stability
];

if (debug) {
  jestArgs.push('--detectOpenHandles');
}

console.log('Starting Puppeteer E2E tests...');
console.log(`Base URL: ${env.PUPPETEER_BASE_URL}`);
console.log(`Mode: ${headless ? 'Headless' : 'Headed'}`);
console.log('');

const jest = spawn('npx', ['jest', ...jestArgs], {
  env,
  stdio: 'inherit',
  shell: true,
});

jest.on('exit', (code) => {
  if (code === 0) {
    console.log('\nE2E tests completed successfully!');
  } else {
    console.error(`\nE2E tests failed with code ${code}`);
  }
  process.exit(code);
});
