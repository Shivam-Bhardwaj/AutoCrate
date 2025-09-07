#!/usr/bin/env node

/**
 * Puppeteer E2E Test Runner
 * Modes:
 *  -- default dev auto-start (next dev)
 *  -- --prod build + next start (stable HTML)
 */

// Early signal shielding
let earlyFirstSigint = true;
process.on('SIGINT', () => {
  if (earlyFirstSigint) {
    console.warn('\n(EARLY) SIGINT intercepted before startup init. Press again to abort.');
    earlyFirstSigint = false;
    return;
  }
  console.warn('\n(EARLY) Second SIGINT received. Exiting.');
  process.exit(130);
});
process.on('SIGTERM', () => {
  console.warn('\n(EARLY) SIGTERM received. Exiting.');
  process.exit(143);
});

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
const prodMode = args.includes('--prod');

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

function startProdServer() {
  console.log('Starting production server...');
  const server = spawn('npm', ['run', 'start'], { detached: false, stdio: 'pipe', shell: true });
  server.stdout.on('data', (d) => debug && console.log(`[PROD SERVER]: ${d}`));
  server.stderr.on('data', (d) => debug && console.error(`[PROD SERVER ERROR]: ${d}`));
  server.on('error', (err) => console.error('Failed to start prod server:', err));
  return server;
}

async function buildProd() {
  console.log('Building application (production)...');
  return new Promise((resolve, reject) => {
    const b = spawn('npm', ['run', 'build'], { stdio: 'inherit', shell: true });
    b.on('exit', (code) =>
      code === 0 ? resolve(true) : reject(new Error(`Build failed with code ${code}`))
    );
  });
}

async function runTests() {
  let devServer = null;
  let serverStarted = false;

  try {
    if (!skipServerStart) {
      if (prodMode) {
        await buildProd();
      }
      console.log(`Checking if server is running (${prodMode ? 'prod' : 'dev'} mode)...`);
      const isRunning = await checkServer(env.PUPPETEER_BASE_URL, prodMode ? 8000 : 4000);
      if (!isRunning) {
        console.log('Server not detected. Starting...');
        devServer = prodMode ? startProdServer() : startDevServer();
        console.log('Waiting for server to be ready (up to 60s)...');
        serverStarted = await checkServer(env.PUPPETEER_BASE_URL, prodMode ? 90000 : 60000);
        if (!serverStarted) {
          console.error(`Failed to start server after ${prodMode ? '90' : '60'} seconds`);
          process.exit(1);
        }
        console.log('Server is ready!');
      } else {
        console.log('Server is already running.');
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
    console.log(
      `Mode: ${headless ? 'Headless' : 'Headed'} | Server: ${prodMode ? 'production' : 'dev'}`
    );
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

// Simple watchdog to detect inactivity (no console output from Jest for N ms)
let lastActivity = Date.now();
const WATCHDOG_INTERVAL = 15000; // 15s check
const INACTIVITY_LIMIT = 120000; // 2 minutes

const activityLog = (msg) => {
  lastActivity = Date.now();
  if (debug) console.log(`[E2E-ACTIVITY] ${new Date().toISOString()} ${msg}`);
};

const watchdog = setInterval(() => {
  const idle = Date.now() - lastActivity;
  if (idle > INACTIVITY_LIMIT) {
    console.error(`Watchdog: no test activity for ${Math.round(idle / 1000)}s, forcing exit.`);
    process.exit(1);
  }
}, WATCHDOG_INTERVAL);

let firstSigint = true;

process.on('SIGINT', () => {
  if (firstSigint) {
    console.warn(
      '\nSIGINT received (ignored once to allow graceful shutdown). Press Ctrl+C again to abort.'
    );
    firstSigint = false;
    return;
  }
  console.log('\nSecond SIGINT – exiting now.');
  clearInterval(watchdog);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  clearInterval(watchdog);
  process.exit(0);
});

activityLog('Initializing runTests');
runTests()
  .then(() => {
    activityLog('runTests resolved');
    clearInterval(watchdog);
  })
  .catch((e) => {
    console.error('runTests error', e);
    clearInterval(watchdog);
  });
