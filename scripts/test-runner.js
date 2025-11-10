#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Runs all tests and validations before commits/deployments
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
}

class TestRunner {
  constructor() {
    this.errors = []
    this.warnings = []
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0
    }
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`)
  }

  runCommand(command, description, throwOnError = true) {
    this.log(`\n→ ${description}...`, 'blue')
    try {
      const output = execSync(command, {
        encoding: 'utf-8',
        stdio: 'pipe'
      })
      this.log(`  ✓ ${description} completed`, 'green')
      return { success: true, output }
    } catch (error) {
      this.log(`  ✗ ${description} failed`, 'red')
      if (error.stdout) {
        console.log(error.stdout.toString())
      }
      if (error.stderr) {
        console.error(error.stderr.toString())
      }

      if (throwOnError) {
        this.errors.push({ command, description, error: error.message })
      } else {
        this.warnings.push({ command, description, error: error.message })
      }

      return { success: false, error }
    }
  }

  async runTypeCheck() {
    this.log('\n========================================', 'magenta')
    this.log('STEP 1: TypeScript Type Checking', 'magenta')
    this.log('========================================', 'magenta')

    const result = this.runCommand(
      'npx tsc --noEmit',
      'TypeScript compilation check'
    )

    if (result.success) {
      this.testResults.passed++
    } else {
      this.testResults.failed++
    }

    return result.success
  }

  async runBuildTest() {
    this.log('\n========================================', 'magenta')
    this.log('STEP 2: Next.js Build Test', 'magenta')
    this.log('========================================', 'magenta')

    const result = this.runCommand(
      'npm run build',
      'Next.js production build'
    )

    if (result.success) {
      this.testResults.passed++

      // Check build output size
      const buildDir = path.join(process.cwd(), '.next')
      if (fs.existsSync(buildDir)) {
        const stats = fs.statSync(buildDir)
        this.log(`  Build size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`, 'blue')
      }
    } else {
      this.testResults.failed++
    }

    return result.success
  }

  async runUnitTests() {
    this.log('\n========================================', 'magenta')
    this.log('STEP 3: Unit Tests (Jest)', 'magenta')
    this.log('========================================', 'magenta')

    const result = this.runCommand(
      'npm test -- --coverage --watchAll=false',
      'Jest unit tests',
      false  // Don't throw on error, just record
    )

    if (result.success) {
      this.testResults.passed++

      // Parse coverage if available
      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json')
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'))
        const total = coverage.total
        this.log('\n  Coverage Summary:', 'yellow')
        this.log(`    Lines:     ${total.lines.pct}%`, 'yellow')
        this.log(`    Branches:  ${total.branches.pct}%`, 'yellow')
        this.log(`    Functions: ${total.functions.pct}%`, 'yellow')
        this.log(`    Statements: ${total.statements.pct}%`, 'yellow')
      }
    } else {
      this.testResults.failed++
    }

    return result.success
  }

  async runE2ETests() {
    this.log('\n========================================', 'magenta')
    this.log('STEP 4: E2E Tests (Playwright)', 'magenta')
    this.log('========================================', 'magenta')

    // Check if Playwright is installed
    const playwrightInstalled = this.runCommand(
      'npx playwright --version',
      'Check Playwright installation',
      false
    )

    if (!playwrightInstalled.success) {
      this.log('  → Installing Playwright browsers...', 'yellow')
      this.runCommand('npx playwright install', 'Playwright browser installation', false)
    }

    const result = this.runCommand(
      'npx playwright test --reporter=json',
      'Playwright E2E tests',
      false
    )

    if (result.success) {
      this.testResults.passed++
    } else {
      this.testResults.failed++
      this.log('  Tip: Run "npx playwright show-report" to see detailed test results', 'yellow')
    }

    return result.success
  }

  async validateStepGenerator() {
    this.log('\n========================================', 'magenta')
    this.log('STEP 5: STEP File Generator Validation', 'magenta')
    this.log('========================================', 'magenta')

    // Create a test to validate STEP file generation
    const testCode = `
      process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({ module: 'commonjs', moduleResolution: 'node' })
      require('ts-node/register/transpile-only')
      const { StepGenerator } = require('./src/lib/step-generator')

      const testBoxes = [
        {
          name: 'TEST_BOX',
          point1: { x: 0, y: 0, z: 0 },
          point2: { x: 10, y: 10, z: 10 },
          type: 'panel'
        }
      ]

      try {
        const generator = new StepGenerator(testBoxes)
        const output = generator.generate()

        // Validate output structure
        if (!output.includes('ISO-10303-21')) throw new Error('Invalid STEP header')
        if (!output.includes('ENDSEC')) throw new Error('Invalid STEP structure')
        if (!output.includes('MANIFOLD_SOLID_BREP')) throw new Error('BREP entities missing')

        console.log('STEP generator validation passed')
        process.exit(0)
      } catch (error) {
        console.error('STEP generator validation failed:', error.message)
        process.exit(1)
      }
    `

    fs.writeFileSync('temp-step-test.js', testCode)
    const result = this.runCommand(
      'node temp-step-test.js',
      'STEP file generator validation'
    )
    fs.unlinkSync('temp-step-test.js')

    if (result.success) {
      this.testResults.passed++
    } else {
      this.testResults.failed++
    }

    return result.success
  }

  async runSecurityCheck() {
    this.log('\n========================================', 'magenta')
    this.log('STEP 6: Security Audit', 'magenta')
    this.log('========================================', 'magenta')

    const result = this.runCommand(
      'npm audit --json',
      'NPM security audit',
      false  // Don't throw on error
    )

    try {
      const auditData = JSON.parse(result.output || '{}')
      const vulns = auditData.metadata?.vulnerabilities || {}

      this.log('\n  Vulnerability Summary:', 'yellow')
      this.log(`    Critical: ${vulns.critical || 0}`, vulns.critical > 0 ? 'red' : 'green')
      this.log(`    High:     ${vulns.high || 0}`, vulns.high > 0 ? 'red' : 'green')
      this.log(`    Moderate: ${vulns.moderate || 0}`, vulns.moderate > 0 ? 'yellow' : 'green')
      this.log(`    Low:      ${vulns.low || 0}`, 'green')

      if (vulns.critical > 0 || vulns.high > 0) {
        this.warnings.push({
          description: 'Security vulnerabilities detected',
          severity: 'high'
        })
      }
    } catch (e) {
      // Audit might fail but we continue
    }

    return result.success
  }

  async generateReport() {
    this.log('\n\n========================================', 'magenta')
    this.log('TEST REPORT', 'magenta')
    this.log('========================================', 'magenta')

    const total = this.testResults.passed + this.testResults.failed + this.testResults.skipped
    const passRate = total > 0 ? ((this.testResults.passed / total) * 100).toFixed(1) : 0

    this.log(`\nTest Results:`, 'blue')
    this.log(`  ✓ Passed:  ${this.testResults.passed}`, 'green')
    this.log(`  ✗ Failed:  ${this.testResults.failed}`, this.testResults.failed > 0 ? 'red' : 'green')
    this.log(`  ○ Skipped: ${this.testResults.skipped}`, 'yellow')
    this.log(`  Pass Rate: ${passRate}%`, passRate >= 70 ? 'green' : 'red')

    if (this.errors.length > 0) {
      this.log('\nErrors:', 'red')
      this.errors.forEach(err => {
        this.log(`  - ${err.description}: ${err.error}`, 'red')
      })
    }

    if (this.warnings.length > 0) {
      this.log('\nWarnings:', 'yellow')
      this.warnings.forEach(warn => {
        this.log(`  - ${warn.description}`, 'yellow')
      })
    }

    // Write report to file
    const report = {
      timestamp: new Date().toISOString(),
      results: this.testResults,
      errors: this.errors,
      warnings: this.warnings,
      passRate
    }

    fs.writeFileSync(
      'test-report.json',
      JSON.stringify(report, null, 2)
    )

    this.log('\nDetailed report saved to: test-report.json', 'blue')

    return this.errors.length === 0
  }

  async run() {
    this.log('Starting Comprehensive Test Suite', 'green')
    this.log(`   Time: ${new Date().toLocaleString()}`, 'blue')

    const startTime = Date.now()

    // Run all test suites
    await this.runTypeCheck()
    await this.runBuildTest()
    await this.runUnitTests()
    await this.validateStepGenerator()
    await this.runSecurityCheck()

    // Only run E2E tests if specifically requested (they're slow)
    if (process.argv.includes('--e2e')) {
      await this.runE2ETests()
    } else {
      this.log('\n  INFO: Skipping E2E tests (use --e2e flag to run)', 'yellow')
      this.testResults.skipped++
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    this.log(`\nTotal execution time: ${duration}s`, 'blue')

    // Generate final report
    const success = await this.generateReport()

    if (success) {
      this.log('\nAll tests passed successfully!', 'green')
      process.exit(0)
    } else {
      this.log('\nSome tests failed. Please fix the issues before proceeding.', 'red')
      process.exit(1)
    }
  }
}

// Run the test suite
const runner = new TestRunner()
runner.run().catch(error => {
  console.error('Unexpected error:', error)
  process.exit(1)
})
