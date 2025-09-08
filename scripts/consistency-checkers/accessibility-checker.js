#!/usr/bin/env node

/**
 * Accessibility Checker for AutoCrate
 * Ensures WCAG 2.1 AA compliance and accessibility best practices
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const axe = require('axe-core');
const pa11y = require('pa11y');
const { execSync } = require('child_process');

class AccessibilityChecker {
  constructor() {
    this.violations = [];
    this.warnings = [];
    this.passed = [];
    this.stats = {
      filesChecked: 0,
      issuesFound: 0,
      criticalIssues: 0,
      seriousIssues: 0,
      moderateIssues: 0,
      minorIssues: 0,
    };
  }

  // Check static accessibility patterns in code
  checkStaticAccessibility(content, filePath) {
    const a11yPatterns = [
      // Critical Issues
      {
        pattern: /<img(?![^>]*alt=)[^>]*>/gi,
        issue: 'Image missing alt attribute',
        severity: 'critical',
        wcag: '1.1.1',
        fix: 'Add alt="" for decorative images or descriptive text for informative images',
      },
      {
        pattern: /<input(?![^>]*(?:aria-label|id))[^>]*>/gi,
        issue: 'Form input without label',
        severity: 'critical',
        wcag: '3.3.2',
        fix: 'Add a <label> element with for attribute or aria-label',
      },
      {
        pattern: /<button[^>]*>\s*<\/button>/gi,
        issue: 'Empty button without accessible name',
        severity: 'critical',
        wcag: '4.1.2',
        fix: 'Add text content or aria-label to the button',
      },

      // Serious Issues
      {
        pattern: /<div[^>]*(?:onClick|onKeyDown)[^>]*>/gi,
        issue: 'Click handler on non-interactive element',
        severity: 'serious',
        wcag: '2.1.1',
        fix: 'Use a <button> element or add role="button" and tabIndex="0"',
      },
      {
        pattern: /tabIndex=['"]-1['"]/gi,
        issue: 'Negative tabIndex removes element from tab order',
        severity: 'serious',
        wcag: '2.1.1',
        fix: 'Use tabIndex="0" for keyboard navigation or remove if not needed',
      },
      {
        pattern: /<a(?![^>]*href)[^>]*>/gi,
        issue: 'Anchor element without href',
        severity: 'serious',
        wcag: '2.1.1',
        fix: 'Add href attribute or use button element for actions',
      },

      // Moderate Issues
      {
        pattern: /color:\s*#[0-9a-f]{3,6}(?![^;]*;[^}]*background)/gi,
        issue: 'Color defined without background',
        severity: 'moderate',
        wcag: '1.4.3',
        fix: 'Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text)',
      },
      {
        pattern: /placeholder=['""][^'"]+['"]/gi,
        issue: 'Using placeholder as label',
        severity: 'moderate',
        wcag: '3.3.2',
        fix: 'Use proper labels; placeholders should only provide hints',
      },
      {
        pattern: /<iframe(?![^>]*title)[^>]*>/gi,
        issue: 'iframe missing title',
        severity: 'moderate',
        wcag: '2.4.1',
        fix: 'Add descriptive title attribute to iframe',
      },

      // Minor Issues
      {
        pattern: /autoplay/gi,
        issue: 'Autoplaying media',
        severity: 'minor',
        wcag: '1.4.2',
        fix: 'Allow users to control media playback',
      },
      {
        pattern: /<h[1-6][^>]*>\s*<\/h[1-6]>/gi,
        issue: 'Empty heading element',
        severity: 'minor',
        wcag: '1.3.1',
        fix: 'Remove empty headings or add content',
      },
    ];

    a11yPatterns.forEach(({ pattern, issue, severity, wcag, fix }) => {
      const matches = content.match(pattern);
      if (matches) {
        const violation = {
          type: 'ACCESSIBILITY',
          file: filePath,
          issue,
          severity,
          wcag: `WCAG ${wcag}`,
          count: matches.length,
          fix,
          examples: matches.slice(0, 2).map((m) => m.substring(0, 60) + '...'),
        };

        if (severity === 'critical' || severity === 'serious') {
          this.violations.push(violation);
          this.stats[`${severity}Issues`]++;
        } else {
          this.warnings.push(violation);
          this.stats[`${severity}Issues`]++;
        }

        this.stats.issuesFound += matches.length;
      }
    });
  }

  // Check heading structure
  checkHeadingStructure(content, filePath) {
    const headingMatches = content.match(/<h([1-6])[^>]*>.*?<\/h\1>/gi) || [];
    const headingLevels = headingMatches.map((h) => parseInt(h.match(/<h([1-6])/i)[1]));

    let lastLevel = 0;
    let skipDetected = false;

    headingLevels.forEach((level) => {
      if (lastLevel > 0 && level > lastLevel + 1) {
        skipDetected = true;
      }
      lastLevel = level;
    });

    if (skipDetected) {
      this.warnings.push({
        type: 'HEADING_STRUCTURE',
        file: filePath,
        issue: 'Heading levels skip (e.g., h1 to h3)',
        severity: 'moderate',
        wcag: 'WCAG 1.3.1',
        fix: 'Ensure heading levels are sequential without skips',
      });
    }

    // Check for multiple h1s
    const h1Count = headingLevels.filter((level) => level === 1).length;
    if (h1Count > 1) {
      this.warnings.push({
        type: 'HEADING_STRUCTURE',
        file: filePath,
        issue: `Multiple h1 elements found (${h1Count})`,
        severity: 'moderate',
        wcag: 'WCAG 1.3.1',
        fix: 'Use only one h1 per page as the main heading',
      });
    }
  }

  // Check ARIA usage
  checkARIAUsage(content, filePath) {
    // Check for invalid ARIA attributes
    const ariaPatterns = [
      {
        pattern: /aria-hidden=["']true["'][^>]*(?:tabIndex|href)=["']/gi,
        issue: 'Interactive element with aria-hidden="true"',
        severity: 'serious',
        fix: 'Remove aria-hidden from interactive elements',
      },
      {
        pattern: /role=["']button["'](?![^>]*(?:tabIndex|aria-label))/gi,
        issue: 'role="button" without keyboard support',
        severity: 'serious',
        fix: 'Add tabIndex="0" and keyboard event handlers',
      },
      {
        pattern: /aria-label=["']["']/gi,
        issue: 'Empty aria-label',
        severity: 'serious',
        fix: 'Provide meaningful text or remove empty aria-label',
      },
      {
        pattern: /aria-labelledby=["'][^"']*["'](?![^>]*id)/gi,
        issue: 'aria-labelledby references non-existent ID',
        severity: 'moderate',
        fix: 'Ensure referenced ID exists in the document',
      },
    ];

    ariaPatterns.forEach(({ pattern, issue, severity, fix }) => {
      const matches = content.match(pattern);
      if (matches) {
        this.violations.push({
          type: 'ARIA',
          file: filePath,
          issue,
          severity,
          wcag: 'WCAG 4.1.2',
          count: matches.length,
          fix,
        });
        this.stats[`${severity}Issues`]++;
      }
    });
  }

  // Check color contrast (simplified check)
  checkColorContrast(content, filePath) {
    // Look for potential low contrast issues
    const colorPatterns = [
      { fg: '#999', bg: '#fff', ratio: 2.8, issue: 'Light gray on white' },
      { fg: '#666', bg: '#eee', ratio: 3.5, issue: 'Gray on light gray' },
      { fg: '#aaa', bg: '#fff', ratio: 2.3, issue: 'Very light text' },
    ];

    colorPatterns.forEach(({ fg, bg, ratio, issue }) => {
      if (content.includes(fg) || content.includes(bg)) {
        this.warnings.push({
          type: 'COLOR_CONTRAST',
          file: filePath,
          issue: `Potential low contrast: ${issue}`,
          severity: 'moderate',
          wcag: 'WCAG 1.4.3',
          minRatio: '4.5:1 (normal), 3:1 (large)',
          currentRatio: `~${ratio}:1`,
          fix: 'Use design tokens with tested contrast ratios',
        });
      }
    });
  }

  // Check keyboard navigation
  checkKeyboardNavigation(content, filePath) {
    // Check for mouse-only events without keyboard equivalents
    const mouseOnlyPatterns = [
      {
        pattern: /onMouseOver(?![^>]*onFocus)/gi,
        issue: 'Mouse hover without keyboard focus',
        fix: 'Add onFocus for keyboard users',
      },
      {
        pattern: /onMouseOut(?![^>]*onBlur)/gi,
        issue: 'Mouse out without keyboard blur',
        fix: 'Add onBlur for keyboard users',
      },
      {
        pattern: /onClick(?![^>]*onKeyDown)/gi,
        issue: 'Click without keyboard support',
        fix: 'Add onKeyDown with Enter/Space key handling',
      },
    ];

    mouseOnlyPatterns.forEach(({ pattern, issue, fix }) => {
      const matches = content.match(pattern);
      if (matches) {
        this.warnings.push({
          type: 'KEYBOARD_NAV',
          file: filePath,
          issue,
          severity: 'moderate',
          wcag: 'WCAG 2.1.1',
          count: matches.length,
          fix,
        });
        this.stats.moderateIssues += matches.length;
      }
    });
  }

  // Check form accessibility
  checkFormAccessibility(content, filePath) {
    const formPatterns = [
      {
        pattern: /<form(?![^>]*(?:aria-label|aria-labelledby))[^>]*>/gi,
        issue: 'Form without accessible name',
        severity: 'moderate',
        fix: 'Add aria-label or aria-labelledby to form',
      },
      {
        pattern: /<fieldset(?![^>]*<legend)/gi,
        issue: 'Fieldset without legend',
        severity: 'minor',
        fix: 'Add <legend> as first child of fieldset',
      },
      {
        pattern: /required(?![^>]*aria-required)/gi,
        issue: 'Required field without aria-required',
        severity: 'minor',
        fix: 'Add aria-required="true" for screen readers',
      },
      {
        pattern: /type=["']submit["'](?![^>]*(?:value|aria-label))/gi,
        issue: 'Submit button without accessible name',
        severity: 'serious',
        fix: 'Add value or aria-label attribute',
      },
    ];

    formPatterns.forEach(({ pattern, issue, severity, fix }) => {
      const matches = content.match(pattern);
      if (matches) {
        const violation = {
          type: 'FORM_A11Y',
          file: filePath,
          issue,
          severity,
          wcag: 'WCAG 3.3.2',
          count: matches.length,
          fix,
        };

        if (severity === 'serious') {
          this.violations.push(violation);
        } else {
          this.warnings.push(violation);
        }
        this.stats[`${severity}Issues`]++;
      }
    });
  }

  // Check file
  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    this.stats.filesChecked++;

    this.checkStaticAccessibility(content, filePath);
    this.checkHeadingStructure(content, filePath);
    this.checkARIAUsage(content, filePath);
    this.checkColorContrast(content, filePath);
    this.checkKeyboardNavigation(content, filePath);
    this.checkFormAccessibility(content, filePath);
  }

  // Generate report
  printReport() {
    console.log('\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('         ACCESSIBILITY CHECKER REPORT                   ');
    console.log('═══════════════════════════════════════════════════════');

    console.log('\n📊 Summary:');
    console.log(`  Files checked:      ${this.stats.filesChecked}`);
    console.log(`  Total issues:       ${this.stats.issuesFound}`);
    console.log(`  Critical issues:    ${this.stats.criticalIssues} 🔴`);
    console.log(`  Serious issues:     ${this.stats.seriousIssues} 🟠`);
    console.log(`  Moderate issues:    ${this.stats.moderateIssues} 🟡`);
    console.log(`  Minor issues:       ${this.stats.minorIssues} 🟢`);

    if (this.violations.length > 0) {
      console.log('\n❌ Critical/Serious Violations (Must Fix):');
      this.violations.forEach((v) => {
        console.log(`\n  📁 ${v.file}`);
        console.log(`     🔴 ${v.issue}`);
        console.log(`     📋 ${v.wcag} - Severity: ${v.severity}`);
        console.log(`     ✅ Fix: ${v.fix}`);
        if (v.examples) {
          console.log(`     📝 Examples:`);
          v.examples.forEach((ex) => console.log(`        ${ex}`));
        }
      });
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  Moderate/Minor Issues (Should Fix):');
      const grouped = {};
      this.warnings.forEach((w) => {
        if (!grouped[w.file]) grouped[w.file] = [];
        grouped[w.file].push(w);
      });

      Object.entries(grouped).forEach(([file, warnings]) => {
        console.log(`\n  📁 ${file}`);
        warnings.forEach((w) => {
          console.log(`     ⚠️  ${w.issue} (${w.wcag})`);
          if (w.fix) console.log(`     ✅ ${w.fix}`);
        });
      });
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('\n📚 Accessibility Resources:');
    console.log('  • WCAG Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/');
    console.log('  • ARIA Authoring Guide: https://www.w3.org/WAI/ARIA/apg/');
    console.log('  • axe DevTools: https://www.deque.com/axe/devtools/');
    console.log('  • Color Contrast Checker: https://webaim.org/resources/contrastchecker/');

    if (this.violations.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ Excellent! No accessibility issues found.\n');
    } else {
      console.log('\n💡 Tips for Fixing:');
      console.log('  1. Fix critical issues first (images, forms, buttons)');
      console.log('  2. Test with screen readers (NVDA, JAWS, VoiceOver)');
      console.log('  3. Test keyboard navigation (Tab, Enter, Escape)');
      console.log('  4. Use browser DevTools accessibility panel');
      console.log('  5. Run "npm run test:a11y" for automated testing\n');
    }

    // Exit with error if critical violations
    if (this.stats.criticalIssues > 0 || this.stats.seriousIssues > 0) {
      process.exit(1);
    }
  }

  // Run the checker
  run() {
    console.log('\n♿ Accessibility Checker');
    console.log('Checking WCAG 2.1 AA compliance...\n');

    const patterns = ['src/**/*.{jsx,tsx}', 'app/**/*.{jsx,tsx}', 'components/**/*.{jsx,tsx}'];

    patterns.forEach((pattern) => {
      const files = glob.sync(pattern, {
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/tests/**'],
      });

      files.forEach((file) => {
        this.checkFile(file);
      });
    });

    this.printReport();
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new AccessibilityChecker();
  checker.run();
}

module.exports = AccessibilityChecker;
