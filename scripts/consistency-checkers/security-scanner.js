#!/usr/bin/env node

/**
 * Security Scanner for AutoCrate
 * Comprehensive security checks for code, dependencies, and configurations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const glob = require('glob');
const crypto = require('crypto');

class SecurityScanner {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.passed = [];
    this.config = this.loadSecurityConfig();
  }

  loadSecurityConfig() {
    const configPath = path.join(process.cwd(), '.security', 'security-policy.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return null;
  }

  // Scan for hardcoded secrets
  scanForSecrets() {
    console.log('\n🔐 Scanning for hardcoded secrets...');

    const patterns = this.config?.policies?.code?.secrets?.patterns || [
      { name: 'Generic API Key', pattern: /api[_-]?key[\s]*=[\s]*['"][a-zA-Z0-9]{20,}['"]/gi },
      { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g },
      { name: 'Private Key', pattern: /-----BEGIN.*PRIVATE KEY-----/g },
      {
        name: 'JWT Token',
        pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
      },
    ];

    const files = glob.sync('**/*.{js,jsx,ts,tsx,json,env}', {
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/coverage/**'],
    });

    let secretsFound = false;
    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');

      patterns.forEach(({ name, pattern }) => {
        const regex = typeof pattern === 'string' ? new RegExp(pattern, 'gi') : pattern;
        const matches = content.match(regex);
        if (matches) {
          this.violations.push({
            type: 'SECRET',
            file,
            issue: `Potential ${name} found`,
            matches: matches.slice(0, 3), // Show first 3 matches
          });
          secretsFound = true;
        }
      });
    });

    if (!secretsFound) {
      this.passed.push('No hardcoded secrets detected');
    }
  }

  // Check dependencies for vulnerabilities
  scanDependencies() {
    console.log('\n📦 Scanning dependencies...');

    try {
      const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(auditResult);

      if (audit.metadata.vulnerabilities) {
        const vulns = audit.metadata.vulnerabilities;

        if (vulns.critical > 0) {
          this.violations.push({
            type: 'DEPENDENCY',
            issue: `${vulns.critical} critical vulnerabilities found`,
            severity: 'critical',
          });
        }

        if (vulns.high > 0) {
          this.violations.push({
            type: 'DEPENDENCY',
            issue: `${vulns.high} high vulnerabilities found`,
            severity: 'high',
          });
        }

        if (vulns.moderate > 0) {
          this.warnings.push({
            type: 'DEPENDENCY',
            issue: `${vulns.moderate} moderate vulnerabilities found`,
            severity: 'moderate',
          });
        }
      } else {
        this.passed.push('No dependency vulnerabilities found');
      }
    } catch (error) {
      // npm audit returns non-zero exit code when vulnerabilities are found
      try {
        const output = error.stdout?.toString() || '';
        if (output.includes('found 0 vulnerabilities')) {
          this.passed.push('No dependency vulnerabilities found');
        } else {
          this.warnings.push({
            type: 'DEPENDENCY',
            issue: 'Unable to complete dependency scan',
            details: 'Run "npm audit" manually for details',
          });
        }
      } catch {
        this.warnings.push({
          type: 'DEPENDENCY',
          issue: 'Dependency scan failed',
        });
      }
    }
  }

  // Check for insecure code patterns
  scanCodePatterns() {
    console.log('\n🔍 Scanning for insecure code patterns...');

    const insecurePatterns = [
      { pattern: /eval\s*\(/g, issue: 'eval() usage detected', severity: 'high' },
      {
        pattern: /innerHTML\s*=/g,
        issue: 'innerHTML usage detected (XSS risk)',
        severity: 'medium',
      },
      { pattern: /document\.write/g, issue: 'document.write usage detected', severity: 'medium' },
      { pattern: /exec\s*\(/g, issue: 'exec() usage detected', severity: 'high' },
      { pattern: /child_process/g, issue: 'child_process usage detected', severity: 'medium' },
      { pattern: /crypto\.createCipher/g, issue: 'Deprecated cipher usage', severity: 'high' },
      {
        pattern: /Math\.random\(\)/g,
        issue: 'Math.random() used for cryptography',
        severity: 'low',
        context: 'crypto',
      },
      { pattern: /http:\/\//g, issue: 'Insecure HTTP protocol used', severity: 'medium' },
      { pattern: /disable.*eslint/g, issue: 'ESLint rule disabled', severity: 'low' },
      {
        pattern: /(password|passwd|pwd)\s*=\s*['"]/gi,
        issue: 'Hardcoded password detected',
        severity: 'critical',
      },
    ];

    const files = glob.sync('**/*.{js,jsx,ts,tsx}', {
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/coverage/**', '**/tests/**'],
    });

    const issues = [];
    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');

      insecurePatterns.forEach(({ pattern, issue, severity }) => {
        if (pattern.test(content)) {
          const violation = {
            type: 'CODE_PATTERN',
            file,
            issue,
            severity,
          };

          if (severity === 'high' || severity === 'critical') {
            this.violations.push(violation);
          } else {
            this.warnings.push(violation);
          }
          issues.push(issue);
        }
      });
    });

    if (issues.length === 0) {
      this.passed.push('No insecure code patterns detected');
    }
  }

  // Check security headers configuration
  checkSecurityHeaders() {
    console.log('\n🛡️ Checking security headers configuration...');

    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const content = fs.readFileSync(nextConfigPath, 'utf8');

      const requiredHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Strict-Transport-Security',
        'Content-Security-Policy',
      ];

      const missingHeaders = requiredHeaders.filter((header) => !content.includes(header));

      if (missingHeaders.length > 0) {
        this.warnings.push({
          type: 'HEADERS',
          issue: 'Missing security headers',
          details: missingHeaders.join(', '),
        });
      } else {
        this.passed.push('All security headers configured');
      }
    }
  }

  // Check for exposed environment variables
  checkEnvExposure() {
    console.log('\n🔒 Checking environment variable exposure...');

    const files = glob.sync('**/*.{js,jsx,ts,tsx}', {
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    });

    const exposedEnvVars = [];
    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');

      // Check for process.env usage in client-side code
      if (file.includes('/app/') || file.includes('/components/')) {
        const envMatches = content.match(/process\.env\.([A-Z_]+)/g);
        if (envMatches) {
          envMatches.forEach((match) => {
            const envVar = match.replace('process.env.', '');
            if (!envVar.startsWith('NEXT_PUBLIC_') && envVar !== 'NODE_ENV') {
              exposedEnvVars.push({ file, envVar });
            }
          });
        }
      }
    });

    if (exposedEnvVars.length > 0) {
      this.violations.push({
        type: 'ENV_EXPOSURE',
        issue: 'Server-side environment variables exposed to client',
        details: exposedEnvVars,
      });
    } else {
      this.passed.push('No environment variable exposure detected');
    }
  }

  // Check SSL/TLS configuration
  checkSSLConfiguration() {
    console.log('\n🔐 Checking SSL/TLS configuration...');

    // Check for insecure protocols
    const files = glob.sync('**/*.{js,jsx,ts,tsx,json}', {
      ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    });

    let insecureProtocolFound = false;
    files.forEach((file) => {
      const content = fs.readFileSync(file, 'utf8');

      if (content.match(/http:\/\/(?!localhost|127\.0\.0\.1)/g)) {
        this.warnings.push({
          type: 'SSL',
          file,
          issue: 'Insecure HTTP protocol used for external resources',
        });
        insecureProtocolFound = true;
      }
    });

    if (!insecureProtocolFound) {
      this.passed.push('All external resources use HTTPS');
    }
  }

  // Generate security report
  generateReport() {
    const reportPath = path.join(process.cwd(), '.security', 'reports');
    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        violations: this.violations.length,
        warnings: this.warnings.length,
        passed: this.passed.length,
      },
      violations: this.violations,
      warnings: this.warnings,
      passed: this.passed,
    };

    const reportFile = path.join(reportPath, `security-scan-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    return reportFile;
  }

  // Print results
  printResults() {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('              SECURITY SCAN RESULTS                     ');
    console.log('═══════════════════════════════════════════════════════');

    // Passed checks
    if (this.passed.length > 0) {
      console.log('\n✅ Passed Checks:');
      this.passed.forEach((check) => {
        console.log(`  ✓ ${check}`);
      });
    }

    // Warnings
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach((warning) => {
        console.log(`  ⚠ [${warning.type}] ${warning.issue}`);
        if (warning.file) console.log(`    File: ${warning.file}`);
        if (warning.details) console.log(`    Details: ${warning.details}`);
      });
    }

    // Violations
    if (this.violations.length > 0) {
      console.log('\n❌ Security Violations:');
      this.violations.forEach((violation) => {
        console.log(`  ✗ [${violation.type}] ${violation.issue}`);
        if (violation.file) console.log(`    File: ${violation.file}`);
        if (violation.details) console.log(`    Details:`, violation.details);
      });
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('SUMMARY:');
    console.log(`  Passed:     ${this.passed.length}`);
    console.log(`  Warnings:   ${this.warnings.length}`);
    console.log(`  Violations: ${this.violations.length}`);
    console.log('═══════════════════════════════════════════════════════');

    // Recommendations
    if (this.violations.length > 0 || this.warnings.length > 0) {
      console.log('\n💡 Recommendations:');
      console.log('  1. Fix all critical violations immediately');
      console.log('  2. Review and address warnings');
      console.log('  3. Run "npm audit fix" to fix dependency vulnerabilities');
      console.log('  4. Use environment variables for sensitive data');
      console.log('  5. Enable all security headers in next.config.js');
    }

    // Generate report
    const reportFile = this.generateReport();
    console.log(`\n📄 Detailed report saved to: ${reportFile}\n`);

    // Exit with error if violations found
    if (this.violations.length > 0) {
      process.exit(1);
    }
  }

  // Run all security scans
  run() {
    console.log('\n🛡️  AutoCrate Security Scanner');
    console.log('================================\n');

    this.scanForSecrets();
    this.scanDependencies();
    this.scanCodePatterns();
    this.checkSecurityHeaders();
    this.checkEnvExposure();
    this.checkSSLConfiguration();

    this.printResults();
  }
}

// Run if called directly
if (require.main === module) {
  const scanner = new SecurityScanner();
  scanner.run();
}

module.exports = SecurityScanner;
