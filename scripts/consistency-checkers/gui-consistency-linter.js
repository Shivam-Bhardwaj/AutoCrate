#!/usr/bin/env node

/**
 * GUI Consistency Linter for AutoCrate
 * Ensures consistent UI patterns, spacing, and component usage
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

class GUIConsistencyLinter {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.suggestions = [];
    this.stats = {
      filesChecked: 0,
      componentsFound: 0,
      patternsChecked: 0,
    };
  }

  // Load design tokens for validation
  loadDesignTokens() {
    try {
      const tokensPath = path.join(process.cwd(), 'src', 'styles', 'design-tokens.ts');
      if (fs.existsSync(tokensPath)) {
        // In a real implementation, we'd parse the TypeScript file
        return {
          spacing: ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24', '32'],
          borderRadius: ['none', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
          shadows: ['sm', 'base', 'md', 'lg', 'xl', '2xl', 'inner', 'none'],
        };
      }
    } catch (error) {
      console.warn('Could not load design tokens:', error.message);
    }
    return null;
  }

  // Check component consistency
  checkComponentUsage(content, filePath) {
    const componentPatterns = {
      // Button usage
      button: {
        correct: [
          /<Button\s+variant=["'](default|destructive|outline|secondary|ghost|link)["']/g,
          /<Button\s+size=["'](default|sm|lg|icon)["']/g,
        ],
        incorrect: [
          /<button\s+className=/g, // Should use Button component
          /<a\s+.*role=["']button["']/g, // Should use Button with asChild
        ],
      },
      // Input usage
      input: {
        correct: [/<Input\s+/g, /<Label\s+htmlFor=/g],
        incorrect: [
          /<input\s+(?!type=["']hidden["'])/g, // Should use Input component
          /<label\s+(?!.*htmlFor)/g, // Labels should have htmlFor
        ],
      },
      // Card usage
      card: {
        correct: [/<Card>.*<CardHeader>/gs, /<Card>.*<CardContent>/gs],
        incorrect: [
          /<div\s+className=["'][^"']*card[^"']*["']/g, // Should use Card component
        ],
      },
    };

    Object.entries(componentPatterns).forEach(([component, patterns]) => {
      // Check correct patterns
      patterns.correct?.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          this.stats.componentsFound += matches.length;
        }
      });

      // Check incorrect patterns
      patterns.incorrect?.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          this.violations.push({
            type: 'COMPONENT_USAGE',
            file: filePath,
            component,
            issue: `Inconsistent ${component} usage`,
            found: matches[0].substring(0, 50) + '...',
            suggestion: `Use the ${component.charAt(0).toUpperCase() + component.slice(1)} component from @/components/ui/${component}`,
          });
        }
      });
    });
  }

  // Check spacing consistency
  checkSpacingConsistency(content, filePath) {
    const designTokens = this.loadDesignTokens();
    if (!designTokens) return;

    // Check for hardcoded spacing values
    const spacingPatterns = [
      /padding:\s*["']?\d+px/g,
      /margin:\s*["']?\d+px/g,
      /gap:\s*["']?\d+px/g,
      /\s(p|m|gap)-\[[\d.]+(?:px|rem|em)\]/g, // Tailwind arbitrary values
    ];

    spacingPatterns.forEach((pattern) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          // Extract the numeric value
          const value = match.match(/\d+/);
          if (
            value &&
            !['0', '1', '2', '4', '8', '12', '16', '20', '24', '32'].includes(value[0])
          ) {
            this.warnings.push({
              type: 'SPACING',
              file: filePath,
              issue: 'Non-standard spacing value',
              found: match,
              suggestion: 'Use design token spacing values: ' + designTokens.spacing.join(', '),
            });
          }
        });
      }
    });
  }

  // Check responsive design patterns
  checkResponsivePatterns(content, filePath) {
    const responsiveIssues = [];

    // Check for proper responsive utilities
    if (content.includes('className=')) {
      // Check for mobile-first approach
      const hasResponsiveClasses = /\s(sm:|md:|lg:|xl:|2xl:)/g.test(content);
      const hasHiddenClasses = /\s(hidden|block|flex)\s/g.test(content);

      if (hasHiddenClasses && !hasResponsiveClasses) {
        this.suggestions.push({
          type: 'RESPONSIVE',
          file: filePath,
          issue: 'Consider adding responsive modifiers',
          suggestion: 'Use responsive prefixes (sm:, md:, lg:) for better mobile experience',
        });
      }
    }

    // Check for viewport meta tag in layout files
    if (filePath.includes('layout') && !content.includes('viewport')) {
      this.warnings.push({
        type: 'RESPONSIVE',
        file: filePath,
        issue: 'Missing viewport configuration',
        suggestion: 'Add viewport meta tag for proper mobile rendering',
      });
    }
  }

  // Check accessibility patterns
  checkAccessibilityPatterns(content, filePath) {
    const a11yPatterns = [
      // Images without alt text
      {
        pattern: /<img\s+(?![^>]*alt=)/gi,
        issue: 'Image without alt text',
        severity: 'error',
      },
      // Buttons without aria-label or text content
      {
        pattern: /<button[^>]*>\s*<\/button>/gi,
        issue: 'Empty button without aria-label',
        severity: 'error',
      },
      // Form inputs without labels
      {
        pattern: /<input\s+(?![^>]*aria-label)(?![^>]*id=[^>]*>[\s\S]*?<label\s+for=)/gi,
        issue: 'Input without associated label',
        severity: 'warning',
      },
      // Click handlers on non-interactive elements
      {
        pattern: /<div[^>]*onClick=/gi,
        issue: 'Click handler on non-interactive element',
        severity: 'warning',
        suggestion: 'Use button or add role="button" and tabIndex',
      },
    ];

    a11yPatterns.forEach(({ pattern, issue, severity, suggestion }) => {
      const matches = content.match(pattern);
      if (matches) {
        const violation = {
          type: 'ACCESSIBILITY',
          file: filePath,
          issue,
          count: matches.length,
        };

        if (suggestion) violation.suggestion = suggestion;

        if (severity === 'error') {
          this.violations.push(violation);
        } else {
          this.warnings.push(violation);
        }
      }
    });
  }

  // Check naming conventions
  checkNamingConventions(content, filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));

    // Component files should be PascalCase
    if (filePath.includes('/components/') && !/^[A-Z]/.test(fileName)) {
      this.warnings.push({
        type: 'NAMING',
        file: filePath,
        issue: 'Component file should use PascalCase',
        found: fileName,
        suggestion: fileName.charAt(0).toUpperCase() + fileName.slice(1),
      });
    }

    // Check for consistent prop naming
    const propPatterns = [
      { pattern: /on[A-Z]\w+=/g, correct: true }, // Event handlers: onClick, onSubmit
      { pattern: /is[A-Z]\w+=/g, correct: true }, // Boolean props: isLoading, isDisabled
      { pattern: /has[A-Z]\w+=/g, correct: true }, // Boolean props: hasError
    ];

    // Check for inconsistent boolean prop naming
    const booleanPropPattern = /\s(show|hide|enable|disable)[A-Z]/g;
    const matches = content.match(booleanPropPattern);
    if (matches) {
      this.suggestions.push({
        type: 'NAMING',
        file: filePath,
        issue: 'Consider using is/has prefix for boolean props',
        found: matches.join(', '),
      });
    }
  }

  // Check import organization
  checkImportOrganization(content, filePath) {
    const lines = content.split('\n');
    const importLines = lines.filter((line) => line.startsWith('import '));

    if (importLines.length > 0) {
      // Check import order
      const importGroups = {
        react: [],
        next: [],
        external: [],
        internal: [],
        relative: [],
      };

      importLines.forEach((line) => {
        if (line.includes('react')) {
          importGroups.react.push(line);
        } else if (line.includes('next/')) {
          importGroups.next.push(line);
        } else if (line.includes('@/')) {
          importGroups.internal.push(line);
        } else if (line.includes('./') || line.includes('../')) {
          importGroups.relative.push(line);
        } else {
          importGroups.external.push(line);
        }
      });

      // Check if imports are grouped properly
      const actualOrder = importLines.map((line) => {
        if (line.includes('react')) return 'react';
        if (line.includes('next/')) return 'next';
        if (line.includes('@/')) return 'internal';
        if (line.includes('./') || line.includes('../')) return 'relative';
        return 'external';
      });

      const expectedOrder = ['react', 'next', 'external', 'internal', 'relative'];
      let lastGroupIndex = -1;
      let isOrdered = true;

      actualOrder.forEach((group) => {
        const groupIndex = expectedOrder.indexOf(group);
        if (groupIndex < lastGroupIndex) {
          isOrdered = false;
        }
        lastGroupIndex = Math.max(lastGroupIndex, groupIndex);
      });

      if (!isOrdered) {
        this.suggestions.push({
          type: 'IMPORTS',
          file: filePath,
          issue: 'Imports are not properly organized',
          suggestion: 'Order imports: React → Next.js → External → Internal (@/) → Relative',
        });
      }
    }
  }

  // Check file for all patterns
  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    this.stats.filesChecked++;

    this.checkComponentUsage(content, filePath);
    this.checkSpacingConsistency(content, filePath);
    this.checkResponsivePatterns(content, filePath);
    this.checkAccessibilityPatterns(content, filePath);
    this.checkNamingConventions(content, filePath);
    this.checkImportOrganization(content, filePath);
  }

  // Generate report
  generateReport() {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('           GUI CONSISTENCY LINTER REPORT                ');
    console.log('═══════════════════════════════════════════════════════');

    console.log('\n📊 Statistics:');
    console.log(`  Files checked:     ${this.stats.filesChecked}`);
    console.log(`  Components found:  ${this.stats.componentsFound}`);
    console.log(`  Violations:        ${this.violations.length}`);
    console.log(`  Warnings:          ${this.warnings.length}`);
    console.log(`  Suggestions:       ${this.suggestions.length}`);

    if (this.violations.length > 0) {
      console.log('\n❌ Violations (Must Fix):');
      this.violations.forEach((v) => {
        console.log(`\n  📁 ${v.file}`);
        console.log(`     Issue: ${v.issue}`);
        if (v.found) console.log(`     Found: ${v.found}`);
        if (v.suggestion) console.log(`     ✨ ${v.suggestion}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings (Should Fix):');
      this.warnings.forEach((w) => {
        console.log(`\n  📁 ${w.file}`);
        console.log(`     Issue: ${w.issue}`);
        if (w.found) console.log(`     Found: ${w.found}`);
        if (w.suggestion) console.log(`     ✨ ${w.suggestion}`);
      });
    }

    if (this.suggestions.length > 0) {
      console.log('\n💡 Suggestions (Nice to Have):');
      this.suggestions.forEach((s) => {
        console.log(`\n  📁 ${s.file}`);
        console.log(`     ${s.issue}`);
        if (s.suggestion) console.log(`     ✨ ${s.suggestion}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════');

    if (this.violations.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ Great job! Your GUI is consistent with design standards.\n');
    } else {
      console.log('\n📚 Resources:');
      console.log('  - Design Tokens: src/styles/design-tokens.ts');
      console.log('  - Component Library: src/components/ui/');
      console.log('  - Accessibility Guide: https://www.w3.org/WAI/WCAG21/quickref/');
      console.log('  - Tailwind Docs: https://tailwindcss.com/docs\n');
    }

    // Exit with error if violations
    if (this.violations.length > 0) {
      process.exit(1);
    }
  }

  // Run the linter
  run() {
    console.log('\n🎨 GUI Consistency Linter');
    console.log('Checking UI patterns and consistency...\n');

    const patterns = ['src/**/*.{jsx,tsx}', 'app/**/*.{jsx,tsx}', 'components/**/*.{jsx,tsx}'];

    patterns.forEach((pattern) => {
      const files = glob.sync(pattern, {
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/tests/**'],
      });

      files.forEach((file) => {
        this.checkFile(file);
      });
    });

    this.generateReport();
  }
}

// Run if called directly
if (require.main === module) {
  const linter = new GUIConsistencyLinter();
  linter.run();
}

module.exports = GUIConsistencyLinter;
