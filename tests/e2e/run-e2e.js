#!/usr/bin/env node

/**
 * Puppeteer E2E Test Runner
 * This script runs all E2E tests using Puppeteer
 * Automatically starts the dev server if not running
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

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
const skipServerStart = args.includes('--no-server');

if (!headless) {
  env.HEADLESS = 'false';
}

// Function to check if server is running
function checkServer(url, timeout = 30000) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const check = () => {
      http
        .get(url, (res) => {
          if (res.statusCode === 200 || res.statusCode === 304) {
            resolve(true);
          } else {
            retry();
          }
        })
        .on('error', () => {
          retry();
        });
    };

    const retry = () => {
      if (Date.now() - startTime < timeout) {
        setTimeout(check, 1000);
      } else {
        resolve(false);
      }
    };

    check();
  });
}

// Function to start dev server
function startDevServer() {
  console.log('Starting development server...');
  const server = spawn('npm', ['run', 'dev'], {
    detached: false,
    stdio: 'pipe',
    shell: true,
  });

  server.stdout.on('data', (data) => {
    if (debug) {
      console.log(`[DEV SERVER]: ${data}`);
    }
  });

  server.stderr.on('data', (data) => {
    if (debug) {
      console.error(`[DEV SERVER ERROR]: ${data}`);
    }
  });

  server.on('error', (err) => {
    console.error('Failed to start dev server:', err);
  });

  return server;
}

async function runTests() {
  let devServer = null;
  let serverStarted = false;

  try {
    if (!skipServerStart) {
      console.log('Checking if development server is running...');
      const isRunning = await checkServer(env.PUPPETEER_BASE_URL, 2000);

      if (!isRunning) {
        console.log('Development server not detected. Starting...');
        devServer = startDevServer();

        console.log('Waiting for server to be ready...');
        serverStarted = await checkServer(env.PUPPETEER_BASE_URL, 30000);

        if (!serverStarted) {
          console.error('Failed to start development server after 30 seconds');
          process.exit(1);
        }
        console.log('Development server is ready!');
      } else {
        console.log('Development server is already running.');
      }
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

    console.log('\nStarting Puppeteer E2E tests...');
    console.log(`Base URL: ${env.PUPPETEER_BASE_URL}`);
    console.log(`Mode: ${headless ? 'Headless' : 'Headed'}`);
    console.log('');

    const jest = spawn('npx', ['jest', ...jestArgs], {
      env,
      stdio: 'inherit',
      shell: true,
    });

    jest.on('exit', (code) => {
      if (devServer) {
        console.log('\nStopping development server...');
        // Kill the dev server process group
        try {
          process.kill(-devServer.pid);
        } catch (e) {
          // Windows fallback
          spawn('taskkill', ['/F', '/T', '/PID', devServer.pid.toString()], { shell: true });
        }
      }

      if (code === 0) {
        console.log('\nE2E tests completed successfully!');
      } else {
        console.error(`\nE2E tests failed with code ${code}`);
      }
      process.exit(code);
    });
  } catch (error) {
    console.error('Error running tests:', error);
    if (devServer) {
      try {
        process.kill(-devServer.pid);
      } catch (e) {
        spawn('taskkill', ['/F', '/T', '/PID', devServer.pid.toString()], { shell: true });
      }
    }
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the tests
runTests();
