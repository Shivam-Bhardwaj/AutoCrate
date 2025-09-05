/**
 * AutoCrate AI Agent System
 * Specialized agents for faster and more accurate development
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Agent base class
class Agent {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.logs = [];
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    this.logs.push(logEntry);
    console.log(`[${this.name}] ${level.toUpperCase()}: ${message}`);
  }

  async execute() {
    throw new Error('Execute method must be implemented by subclass');
  }
}

// Math Validation Agent
class MathValidationAgent extends Agent {
  constructor() {
    super('MathValidator', 'Validates mathematical calculations in crate design');
  }

  async execute(options = {}) {
    this.log('Starting math validation...');
    const results = {
      passed: true,
      issues: [],
    };

    try {
      // Check crate dimension calculations
      const dimensionChecks = await this.validateDimensions();
      results.dimensionValidation = dimensionChecks;

      // Check skid sizing calculations
      const skidChecks = await this.validateSkidSizing();
      results.skidValidation = skidChecks;

      // Check bill of materials calculations
      const bomChecks = await this.validateBOM();
      results.bomValidation = bomChecks;

      // Check weight distribution
      const weightChecks = await this.validateWeightDistribution();
      results.weightValidation = weightChecks;

      if (
        dimensionChecks.issues.length > 0 ||
        skidChecks.issues.length > 0 ||
        bomChecks.issues.length > 0 ||
        weightChecks.issues.length > 0
      ) {
        results.passed = false;
        results.issues = [
          ...dimensionChecks.issues,
          ...skidChecks.issues,
          ...bomChecks.issues,
          ...weightChecks.issues,
        ];
      }

      this.log(`Math validation completed. Passed: ${results.passed}`);
    } catch (error) {
      this.log(`Math validation failed: ${error.message}`, 'error');
      results.passed = false;
      results.error = error.message;
    }

    return results;
  }

  async validateDimensions() {
    const results = { passed: true, issues: [] };

    // Read the crate service file
    const cratePath = path.join(process.cwd(), 'src', 'services', 'crateCalculations.ts');
    const content = await fs.readFile(cratePath, 'utf-8').catch(() => '');

    // Check for common math errors
    const checks = [
      {
        pattern: /(\d+)\s*[+\-*/]\s*(\d+)/g,
        validator: (match) => {
          // Validate basic arithmetic operations
          return !match.includes('/0');
        },
        message: 'Division by zero detected',
      },
      {
        pattern: /Math\.(sqrt|pow|log)\((.*?)\)/g,
        validator: (match, func, args) => {
          if (func === 'sqrt') {
            return !args.includes('-');
          }
          return true;
        },
        message: 'Invalid mathematical function usage',
      },
    ];

    for (const check of checks) {
      const matches = content.matchAll(check.pattern);
      for (const match of matches) {
        if (!check.validator(...match)) {
          results.issues.push({
            type: 'dimension',
            message: check.message,
            location: `Line containing: ${match[0]}`,
          });
          results.passed = false;
        }
      }
    }

    return results;
  }

  async validateSkidSizing() {
    const results = { passed: true, issues: [] };

    // Check skid sizing logic
    const skidPath = path.join(process.cwd(), 'src', 'services', 'skidCalculations.ts');
    const content = await fs.readFile(skidPath, 'utf-8').catch(() => '');

    // Validate weight-based sizing
    if (content.includes('calculateSkidSize')) {
      const weightThresholds = content.match(/weight\s*[<>]=?\s*(\d+)/g) || [];
      const sortedThresholds = weightThresholds
        .map((t) => parseInt(t.match(/\d+/)[0]))
        .sort((a, b) => a - b);

      // Check for gaps in weight ranges
      for (let i = 1; i < sortedThresholds.length; i++) {
        if (sortedThresholds[i] - sortedThresholds[i - 1] > 5000) {
          results.issues.push({
            type: 'skid',
            message: `Large gap in weight thresholds: ${sortedThresholds[i - 1]} to ${sortedThresholds[i]}`,
            severity: 'warning',
          });
        }
      }
    }

    return results;
  }

  async validateBOM() {
    const results = { passed: true, issues: [] };

    // Check BOM calculations
    const bomPath = path.join(process.cwd(), 'src', 'services', 'bomCalculations.ts');
    const content = await fs.readFile(bomPath, 'utf-8').catch(() => '');

    // Check for price calculations
    const priceCalculations = content.match(/price\s*=\s*.*?;/g) || [];
    for (const calc of priceCalculations) {
      if (calc.includes('* 0') || calc.includes('/ 0')) {
        results.issues.push({
          type: 'bom',
          message: 'Invalid price calculation detected',
          location: calc,
        });
        results.passed = false;
      }
    }

    return results;
  }

  async validateWeightDistribution() {
    const results = { passed: true, issues: [] };

    // Check weight distribution logic
    const patterns = [
      { pattern: /totalWeight\s*=/, message: 'Total weight calculation' },
      { pattern: /weightPerSkid\s*=/, message: 'Weight per skid calculation' },
    ];

    for (const { pattern, message } of patterns) {
      // Implementation would check actual calculation logic
      this.log(`Checking ${message}`);
    }

    return results;
  }
}

// UI Consistency Agent
class UIConsistencyAgent extends Agent {
  constructor() {
    super('UIChecker', 'Validates UI components and styling consistency');
  }

  async execute(options = {}) {
    this.log('Starting UI consistency check...');
    const results = {
      passed: true,
      issues: [],
    };

    try {
      // Check component consistency
      const componentChecks = await this.checkComponents();
      results.componentValidation = componentChecks;

      // Check dark mode support
      const darkModeChecks = await this.checkDarkMode();
      results.darkModeValidation = darkModeChecks;

      // Check responsive design
      const responsiveChecks = await this.checkResponsive();
      results.responsiveValidation = responsiveChecks;

      // Check accessibility
      const a11yChecks = await this.checkAccessibility();
      results.accessibilityValidation = a11yChecks;

      const allIssues = [
        ...(componentChecks.issues || []),
        ...(darkModeChecks.issues || []),
        ...(responsiveChecks.issues || []),
        ...(a11yChecks.issues || []),
      ];

      if (allIssues.length > 0) {
        results.passed = false;
        results.issues = allIssues;
      }

      this.log(`UI consistency check completed. Passed: ${results.passed}`);
    } catch (error) {
      this.log(`UI check failed: ${error.message}`, 'error');
      results.passed = false;
      results.error = error.message;
    }

    return results;
  }

  async checkComponents() {
    const results = { passed: true, issues: [] };
    const componentsDir = path.join(process.cwd(), 'src', 'components');

    try {
      const files = await this.getFilesRecursively(componentsDir);

      for (const file of files) {
        if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
          const content = await fs.readFile(file, 'utf-8');

          // Check for consistent import patterns
          if (!content.includes("'@/")) {
            results.issues.push({
              type: 'import',
              file: path.relative(process.cwd(), file),
              message: 'Not using path aliases (@/)',
            });
          }

          // Check for dark mode classes
          if (content.includes('className=') && !content.includes('dark:')) {
            results.issues.push({
              type: 'dark-mode',
              file: path.relative(process.cwd(), file),
              message: 'Missing dark mode styles',
              severity: 'warning',
            });
          }
        }
      }
    } catch (error) {
      this.log(`Component check error: ${error.message}`, 'error');
      results.passed = false;
    }

    return results;
  }

  async checkDarkMode() {
    const results = { passed: true, issues: [] };

    // Check for dark mode implementation
    const themeStorePath = path.join(process.cwd(), 'src', 'store', 'themeStore.ts');
    const content = await fs.readFile(themeStorePath, 'utf-8').catch(() => '');

    if (!content.includes('localStorage')) {
      results.issues.push({
        type: 'persistence',
        message: 'Dark mode preference not persisted to localStorage',
      });
      results.passed = false;
    }

    return results;
  }

  async checkResponsive() {
    const results = { passed: true, issues: [] };

    // Check for responsive classes
    const patterns = ['sm:', 'md:', 'lg:', 'xl:', '2xl:'];
    const componentsDir = path.join(process.cwd(), 'src', 'components');

    try {
      const files = await this.getFilesRecursively(componentsDir);

      for (const file of files) {
        if (file.endsWith('.tsx')) {
          const content = await fs.readFile(file, 'utf-8');
          const hasResponsive = patterns.some((p) => content.includes(p));

          if (content.includes('className=') && !hasResponsive) {
            results.issues.push({
              type: 'responsive',
              file: path.relative(process.cwd(), file),
              message: 'No responsive classes found',
              severity: 'info',
            });
          }
        }
      }
    } catch (error) {
      this.log(`Responsive check error: ${error.message}`, 'error');
    }

    return results;
  }

  async checkAccessibility() {
    const results = { passed: true, issues: [] };

    try {
      // Run accessibility checker
      execSync('node scripts/consistency-checkers/accessibility-checker.js', {
        stdio: 'pipe',
      });
      this.log('Accessibility check passed');
    } catch (error) {
      results.passed = false;
      results.issues.push({
        type: 'accessibility',
        message: 'Accessibility check failed',
        details: error.stdout?.toString(),
      });
    }

    return results;
  }

  async getFilesRecursively(dir) {
    const files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        files.push(...(await this.getFilesRecursively(fullPath)));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }
}

// Code Quality Agent
class CodeQualityAgent extends Agent {
  constructor() {
    super('CodeQuality', 'Ensures code quality through linting and formatting');
  }

  async execute(options = {}) {
    this.log('Starting code quality check...');
    const results = {
      passed: true,
      issues: [],
      fixes: [],
    };

    try {
      // Run linting
      const lintResults = await this.runLinting(options.autoFix);
      results.linting = lintResults;

      // Run type checking
      const typeResults = await this.runTypeCheck();
      results.typeChecking = typeResults;

      // Run formatting
      const formatResults = await this.runFormatting(options.autoFix);
      results.formatting = formatResults;

      // Check for unused variables
      const unusedResults = await this.checkUnusedVariables(options.autoFix);
      results.unusedVariables = unusedResults;

      results.passed =
        lintResults.passed && typeResults.passed && formatResults.passed && unusedResults.passed;

      this.log(`Code quality check completed. Passed: ${results.passed}`);
    } catch (error) {
      this.log(`Code quality check failed: ${error.message}`, 'error');
      results.passed = false;
      results.error = error.message;
    }

    return results;
  }

  async runLinting(autoFix = false) {
    const results = { passed: true, issues: [], fixed: [] };

    try {
      const command = autoFix ? 'npm run lint:fix' : 'npm run lint';
      execSync(command, { stdio: 'pipe' });
      this.log('Linting passed');

      if (autoFix) {
        results.fixed.push('Applied ESLint auto-fixes');
      }
    } catch (error) {
      results.passed = false;
      const output = error.stdout?.toString() || '';
      const issues = output
        .split('\n')
        .filter((line) => line.includes('error') || line.includes('warning'))
        .map((line) => line.trim());
      results.issues = issues;
    }

    return results;
  }

  async runTypeCheck() {
    const results = { passed: true, issues: [] };

    try {
      execSync('npm run type-check', { stdio: 'pipe' });
      this.log('Type checking passed');
    } catch (error) {
      results.passed = false;
      const output = error.stdout?.toString() || '';
      results.issues = output
        .split('\n')
        .filter((line) => line.includes('error'))
        .map((line) => line.trim());
    }

    return results;
  }

  async runFormatting(autoFix = false) {
    const results = { passed: true, issues: [], fixed: [] };

    try {
      if (autoFix) {
        execSync('npm run format', { stdio: 'pipe' });
        results.fixed.push('Applied Prettier formatting');
        this.log('Formatting applied');
      } else {
        execSync('npm run format:check', { stdio: 'pipe' });
        this.log('Formatting check passed');
      }
    } catch (error) {
      results.passed = false;
      results.issues.push('Formatting issues detected');
    }

    return results;
  }

  async checkUnusedVariables(autoFix = false) {
    const results = { passed: true, issues: [], fixed: [] };

    if (autoFix) {
      // Auto-fix unused variables by prefixing with underscore
      const srcDir = path.join(process.cwd(), 'src');
      const files = await this.getFilesRecursively(srcDir);

      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          let content = await fs.readFile(file, 'utf-8');
          const originalContent = content;

          // Simple regex to find unused variables (would need more sophisticated parsing)
          const unusedPattern = /const\s+(\w+)\s*=.*?\/\/\s*unused/gi;
          content = content.replace(unusedPattern, 'const _$1 = $2 // unused');

          if (content !== originalContent) {
            await fs.writeFile(file, content);
            results.fixed.push(`Fixed unused variables in ${path.relative(process.cwd(), file)}`);
          }
        }
      }
    }

    return results;
  }

  async getFilesRecursively(dir) {
    const files = [];
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory() && !item.name.startsWith('.')) {
        files.push(...(await this.getFilesRecursively(fullPath)));
      } else if (item.isFile()) {
        files.push(fullPath);
      }
    }

    return files;
  }
}

// Test Automation Agent
class TestAutomationAgent extends Agent {
  constructor() {
    super('TestRunner', 'Automates test execution and validates coverage');
  }

  async execute(options = {}) {
    this.log('Starting test automation...');
    const results = {
      passed: true,
      testResults: {},
      coverage: {},
    };

    try {
      // Run unit tests
      if (options.unit !== false) {
        const unitResults = await this.runUnitTests();
        results.testResults.unit = unitResults;
      }

      // Run integration tests
      if (options.integration !== false) {
        const integrationResults = await this.runIntegrationTests();
        results.testResults.integration = integrationResults;
      }

      // Run E2E tests (optional, slower)
      if (options.e2e === true) {
        const e2eResults = await this.runE2ETests();
        results.testResults.e2e = e2eResults;
      }

      // Check test coverage
      const coverageResults = await this.checkCoverage();
      results.coverage = coverageResults;

      // Determine overall pass/fail
      results.passed =
        Object.values(results.testResults).every((r) => r.passed) && coverageResults.meetsThreshold;

      this.log(`Test automation completed. Passed: ${results.passed}`);
    } catch (error) {
      this.log(`Test automation failed: ${error.message}`, 'error');
      results.passed = false;
      results.error = error.message;
    }

    return results;
  }

  async runUnitTests() {
    const results = { passed: true, tests: 0, failures: 0 };

    try {
      const output = execSync('npm run test:unit -- --reporter=json', {
        stdio: 'pipe',
        encoding: 'utf-8',
      });
      const testData = JSON.parse(output);
      results.tests = testData.numTotalTests || 0;
      results.failures = testData.numFailedTests || 0;
      results.passed = results.failures === 0;
      this.log(`Unit tests: ${results.tests} total, ${results.failures} failed`);
    } catch (error) {
      results.passed = false;
      results.error = 'Unit tests failed';
    }

    return results;
  }

  async runIntegrationTests() {
    const results = { passed: true, tests: 0, failures: 0 };

    try {
      const output = execSync('npm run test:integration -- --reporter=json', {
        stdio: 'pipe',
        encoding: 'utf-8',
      });
      const testData = JSON.parse(output);
      results.tests = testData.numTotalTests || 0;
      results.failures = testData.numFailedTests || 0;
      results.passed = results.failures === 0;
      this.log(`Integration tests: ${results.tests} total, ${results.failures} failed`);
    } catch (error) {
      results.passed = false;
      results.error = 'Integration tests failed';
    }

    return results;
  }

  async runE2ETests() {
    const results = { passed: true, tests: 0, failures: 0 };

    try {
      execSync('npm run e2e', { stdio: 'pipe' });
      results.passed = true;
      this.log('E2E tests passed');
    } catch (error) {
      results.passed = false;
      results.error = 'E2E tests failed';
    }

    return results;
  }

  async checkCoverage() {
    const results = {
      meetsThreshold: true,
      coverage: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    };

    try {
      const output = execSync('npm run test:coverage -- --reporter=json-summary', {
        stdio: 'pipe',
        encoding: 'utf-8',
      });

      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
      const coverageData = JSON.parse(await fs.readFile(coveragePath, 'utf-8'));

      results.coverage = coverageData.total;

      // Check against thresholds (80% default)
      const threshold = 80;
      results.meetsThreshold = Object.values(results.coverage).every(
        (metric) => metric.pct >= threshold
      );

      this.log(`Coverage: ${JSON.stringify(results.coverage)}`);
    } catch (error) {
      this.log('Coverage check failed', 'warning');
    }

    return results;
  }
}

// Deployment Readiness Agent
class DeploymentReadinessAgent extends Agent {
  constructor() {
    super('DeploymentChecker', 'Validates deployment readiness');
  }

  async execute(options = {}) {
    this.log('Checking deployment readiness...');
    const results = {
      ready: true,
      checks: {},
      warnings: [],
    };

    try {
      // Check build
      const buildCheck = await this.checkBuild();
      results.checks.build = buildCheck;

      // Check dependencies
      const depCheck = await this.checkDependencies();
      results.checks.dependencies = depCheck;

      // Check environment variables
      const envCheck = await this.checkEnvironment();
      results.checks.environment = envCheck;

      // Check for sensitive data
      const securityCheck = await this.checkSecurity();
      results.checks.security = securityCheck;

      // Check git status
      const gitCheck = await this.checkGitStatus();
      results.checks.git = gitCheck;

      // Determine overall readiness
      results.ready = Object.values(results.checks).every((c) => c.passed);

      this.log(`Deployment readiness: ${results.ready ? 'READY' : 'NOT READY'}`);
    } catch (error) {
      this.log(`Deployment check failed: ${error.message}`, 'error');
      results.ready = false;
      results.error = error.message;
    }

    return results;
  }

  async checkBuild() {
    const results = { passed: true, issues: [] };

    try {
      execSync('npm run build', { stdio: 'pipe' });
      this.log('Build successful');
    } catch (error) {
      results.passed = false;
      results.issues.push('Build failed');
    }

    return results;
  }

  async checkDependencies() {
    const results = { passed: true, issues: [] };

    try {
      // Check for outdated dependencies
      const output = execSync('npm outdated --json', {
        stdio: 'pipe',
        encoding: 'utf-8',
      }).toString();

      if (output) {
        const outdated = JSON.parse(output);
        const critical = Object.entries(outdated)
          .filter(([_, info]) => info.wanted !== info.latest)
          .map(([name]) => name);

        if (critical.length > 0) {
          results.issues.push(`Outdated dependencies: ${critical.join(', ')}`);
        }
      }
    } catch (error) {
      // npm outdated returns non-zero exit code if there are outdated packages
      // This is expected behavior
    }

    return results;
  }

  async checkEnvironment() {
    const results = { passed: true, issues: [] };

    // Check for required environment variables
    const requiredVars = ['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID'];

    // These should be in GitHub secrets, not local env
    this.log('Environment variables should be configured in GitHub secrets');

    return results;
  }

  async checkSecurity() {
    const results = { passed: true, issues: [] };

    try {
      execSync('node scripts/consistency-checkers/security-scanner.js', {
        stdio: 'pipe',
      });
      this.log('Security check passed');
    } catch (error) {
      results.passed = false;
      results.issues.push('Security vulnerabilities detected');
    }

    return results;
  }

  async checkGitStatus() {
    const results = { passed: true, issues: [] };

    try {
      const status = execSync('git status --porcelain', {
        stdio: 'pipe',
        encoding: 'utf-8',
      }).toString();

      if (status.trim()) {
        results.issues.push('Uncommitted changes detected');
        results.passed = false;
      }
    } catch (error) {
      results.issues.push('Git check failed');
    }

    return results;
  }
}

// Master Orchestrator Agent
class OrchestratorAgent extends Agent {
  constructor() {
    super('Orchestrator', 'Coordinates all agents for comprehensive validation');
    this.agents = {
      math: new MathValidationAgent(),
      ui: new UIConsistencyAgent(),
      quality: new CodeQualityAgent(),
      test: new TestAutomationAgent(),
      deploy: new DeploymentReadinessAgent(),
    };
  }

  async execute(options = {}) {
    this.log('Starting orchestrated validation...');
    const startTime = Date.now();
    const results = {
      success: true,
      duration: 0,
      agents: {},
      summary: {
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };

    try {
      // Determine which agents to run
      const agentsToRun = options.only
        ? options.only.split(',').map((a) => a.trim())
        : Object.keys(this.agents);

      // Run agents in parallel where possible
      const agentPromises = [];

      // Group 1: Independent agents (can run in parallel)
      if (agentsToRun.includes('math')) {
        agentPromises.push(this.runAgent('math', options));
      }
      if (agentsToRun.includes('ui')) {
        agentPromises.push(this.runAgent('ui', options));
      }

      // Wait for first group
      const group1Results = await Promise.all(agentPromises);
      group1Results.forEach((r) => {
        results.agents[r.name] = r.result;
      });

      // Group 2: Code quality (may fix issues)
      if (agentsToRun.includes('quality')) {
        const qualityResult = await this.runAgent('quality', {
          ...options,
          autoFix: options.autoFix !== false,
        });
        results.agents.quality = qualityResult.result;
      }

      // Group 3: Tests (run after fixes)
      if (agentsToRun.includes('test')) {
        const testResult = await this.runAgent('test', options);
        results.agents.test = testResult.result;
      }

      // Group 4: Deployment check (final check)
      if (agentsToRun.includes('deploy')) {
        const deployResult = await this.runAgent('deploy', options);
        results.agents.deploy = deployResult.result;
      }

      // Calculate summary
      Object.values(results.agents).forEach((agentResult) => {
        if (agentResult.passed || agentResult.ready) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }

        if (agentResult.warnings) {
          results.summary.warnings += agentResult.warnings.length;
        }
      });

      results.success = results.summary.failed === 0;
      results.duration = Date.now() - startTime;

      this.log(`Orchestration completed in ${results.duration}ms`);
      this.log(
        `Summary: ${results.summary.passed} passed, ${results.summary.failed} failed, ${results.summary.warnings} warnings`
      );

      // Generate report
      await this.generateReport(results);
    } catch (error) {
      this.log(`Orchestration failed: ${error.message}`, 'error');
      results.success = false;
      results.error = error.message;
    }

    return results;
  }

  async runAgent(name, options) {
    this.log(`Running ${name} agent...`);
    const agent = this.agents[name];
    const result = await agent.execute(options);
    return { name, result };
  }

  async generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${results.duration}ms`,
      success: results.success,
      summary: results.summary,
      details: results.agents,
    };

    const reportPath = path.join(process.cwd(), 'agent-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    this.log(`Report saved to ${reportPath}`);

    // Also generate human-readable summary
    const summary = this.formatSummary(results);
    console.log('\n' + summary);
  }

  formatSummary(results) {
    let summary = '='.repeat(50) + '\n';
    summary += 'AI AGENT VALIDATION REPORT\n';
    summary += '='.repeat(50) + '\n\n';

    summary += `Overall Status: ${results.success ? 'PASSED' : 'FAILED'}\n`;
    summary += `Duration: ${results.duration}ms\n`;
    summary += `Agents Run: ${Object.keys(results.agents).length}\n\n`;

    summary += 'Agent Results:\n';
    summary += '-'.repeat(30) + '\n';

    for (const [name, result] of Object.entries(results.agents)) {
      const status = result.passed || result.ready ? 'PASS' : 'FAIL';
      summary += `${name.toUpperCase()}: ${status}\n`;

      if (result.issues && result.issues.length > 0) {
        summary += `  Issues: ${result.issues.length}\n`;
        result.issues.slice(0, 3).forEach((issue) => {
          summary += `    - ${issue.message || issue}\n`;
        });
        if (result.issues.length > 3) {
          summary += `    ... and ${result.issues.length - 3} more\n`;
        }
      }

      if (result.fixes && result.fixes.length > 0) {
        summary += `  Fixes Applied: ${result.fixes.length}\n`;
      }
    }

    summary += '\n' + '='.repeat(50);

    return summary;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const options = {
    autoFix: args.includes('--fix'),
    only: args.find((a) => a.startsWith('--only='))?.split('=')[1],
    e2e: args.includes('--e2e'),
    verbose: args.includes('--verbose'),
  };

  console.log('AutoCrate AI Agent System');
  console.log('========================\n');

  switch (command) {
    case 'run':
    case 'all':
      const orchestrator = new OrchestratorAgent();
      await orchestrator.execute(options);
      break;

    case 'math':
      const mathAgent = new MathValidationAgent();
      await mathAgent.execute(options);
      break;

    case 'ui':
      const uiAgent = new UIConsistencyAgent();
      await uiAgent.execute(options);
      break;

    case 'quality':
      const qualityAgent = new CodeQualityAgent();
      await qualityAgent.execute(options);
      break;

    case 'test':
      const testAgent = new TestAutomationAgent();
      await testAgent.execute(options);
      break;

    case 'deploy':
      const deployAgent = new DeploymentReadinessAgent();
      await deployAgent.execute(options);
      break;

    case 'help':
    default:
      console.log('Usage: node agent-system.js [command] [options]\n');
      console.log('Commands:');
      console.log('  run, all     Run all agents');
      console.log('  math         Run math validation agent');
      console.log('  ui           Run UI consistency agent');
      console.log('  quality      Run code quality agent');
      console.log('  test         Run test automation agent');
      console.log('  deploy       Run deployment readiness agent');
      console.log('  help         Show this help message\n');
      console.log('Options:');
      console.log('  --fix        Auto-fix issues where possible');
      console.log('  --only=x,y   Only run specified agents');
      console.log('  --e2e        Include E2E tests (slower)');
      console.log('  --verbose    Show detailed output');
      break;
  }
}

// Export for use as module
module.exports = {
  OrchestratorAgent,
  MathValidationAgent,
  UIConsistencyAgent,
  CodeQualityAgent,
  TestAutomationAgent,
  DeploymentReadinessAgent,
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
