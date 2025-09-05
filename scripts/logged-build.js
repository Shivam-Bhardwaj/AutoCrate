#!/usr/bin/env node

const BuildLogger = require('./build-logger');
const { spawn } = require('child_process');
const path = require('path');

const logger = new BuildLogger();

async function runBuild() {
  const buildType = process.argv[2] || 'build';
  const logFile = logger.start(buildType);

  console.log(`\nStarting logged ${buildType}...`);
  console.log(`Log file: ${logFile}`);

  const results = {
    success: false,
    errors: [],
    warnings: [],
    stats: {},
  };

  try {
    // Phase 1: Pre-build checks
    logger.section('Pre-Build Checks');

    // Check Node version
    logger.info(`Node version: ${process.version}`);
    const nodeVersion = parseInt(process.version.slice(1).split('.')[0]);
    if (nodeVersion < 18) {
      logger.warn(`Node version ${process.version} is below recommended v18`);
      results.warnings.push('Node version below v18');
    }

    // Check dependencies
    logger.subsection('Checking dependencies');
    const depCheck = logger.command('npm ls --depth=0 --json', {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    if (!depCheck.success) {
      logger.warn('Some dependencies may have issues');
      results.warnings.push('Dependency check warnings');
    }

    // Phase 2: Clean previous build
    logger.section('Cleaning Previous Build');
    const cleanResult = logger.command('npm run clean', {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    if (!cleanResult.success) {
      logger.warn('Clean command not found or failed, continuing...');
    }

    // Phase 3: Type checking
    logger.section('Type Checking');
    const typeCheckResult = logger.command('npm run type-check', {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    if (!typeCheckResult.success) {
      results.errors.push('TypeScript type checking failed');
      logger.error('Type checking failed - build may have issues');
    } else {
      logger.success('Type checking passed');
    }

    // Phase 4: Linting
    logger.section('Linting');
    const lintResult = logger.command('npm run lint', {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    if (!lintResult.success) {
      results.warnings.push('Linting warnings found');
      logger.warn('Linting issues detected');
    } else {
      logger.success('Linting passed');
    }

    // Phase 5: Main build
    logger.section('Main Build Process');
    const buildStartTime = Date.now();

    const buildCommand = buildType === 'dev' ? 'npm run dev' : 'npm run build';
    logger.info(`Executing: ${buildCommand}`);

    // For dev server, use spawn to keep it running
    if (buildType === 'dev') {
      const devProcess = spawn('npm', ['run', 'dev'], {
        shell: true,
        stdio: 'inherit',
      });

      devProcess.on('error', (error) => {
        logger.error(`Dev server error: ${error.message}`);
      });

      logger.success('Development server started');
      logger.info('Press Ctrl+C to stop the server');

      // Keep process alive
      process.on('SIGINT', () => {
        logger.info('Shutting down development server...');
        devProcess.kill();
        const summary = logger.close();
        console.log(`\nBuild log saved to: ${summary.logFile}`);
        process.exit(0);
      });
    } else {
      // For production build
      const buildResult = logger.command(buildCommand, {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      const buildDuration = Date.now() - buildStartTime;
      results.stats.buildDuration = buildDuration;

      if (!buildResult.success) {
        results.errors.push('Build command failed');
        logger.error('Build failed');
        results.success = false;
      } else {
        logger.success('Build completed successfully');
        results.success = true;

        // Phase 6: Analyze build output
        if (buildType === 'build') {
          const outputPath = path.join(process.cwd(), '.next');
          logger.analyzeBuildOutput(outputPath);

          // Get build stats if available
          try {
            const buildManifest = path.join(outputPath, 'build-manifest.json');
            const fs = require('fs');
            if (fs.existsSync(buildManifest)) {
              const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
              results.stats.pages = Object.keys(manifest.pages || {}).length;
              logger.info(`Built ${results.stats.pages} pages`);
            }
          } catch (error) {
            logger.warn(`Could not read build manifest: ${error.message}`);
          }
        }

        // Phase 7: Post-build validation
        logger.section('Post-Build Validation');

        // Check for build artifacts
        const fs = require('fs');
        const nextDir = path.join(process.cwd(), '.next');
        if (fs.existsSync(nextDir)) {
          logger.success('.next directory exists');

          // Check for key files
          const keyFiles = ['BUILD_ID', 'build-manifest.json'];
          keyFiles.forEach((file) => {
            const filePath = path.join(nextDir, file);
            if (fs.existsSync(filePath)) {
              logger.info(`Found: ${file}`);
            } else {
              logger.warn(`Missing: ${file}`);
              results.warnings.push(`Missing build artifact: ${file}`);
            }
          });
        } else {
          logger.error('.next directory not found');
          results.errors.push('.next directory not created');
        }
      }

      // Generate summary
      logger.buildSummary(results);

      // Close logger and get summary
      const summary = logger.close();

      // Print final status
      console.log('\n' + '='.repeat(60));
      if (results.success) {
        console.log('BUILD SUCCESSFUL');
      } else {
        console.log('BUILD FAILED');
      }
      console.log(`Duration: ${logger.formatDuration(summary.duration)}`);
      console.log(`Log file: ${summary.logFile}`);
      console.log('='.repeat(60));

      // Exit with appropriate code
      process.exit(results.success ? 0 : 1);
    }
  } catch (error) {
    logger.error(`Unexpected error: ${error.message}`);
    logger.error(error.stack);
    results.errors.push(`Unexpected error: ${error.message}`);

    logger.buildSummary(results);
    const summary = logger.close();

    console.error(`\nBuild failed with error: ${error.message}`);
    console.log(`Log file: ${summary.logFile}`);

    process.exit(1);
  }
}

// Run the build
runBuild().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
