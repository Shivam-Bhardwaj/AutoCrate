#!/usr/bin/env node

/**
 * Color Palette Consistency Checker
 * Ensures all colors used in the project match the design system
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Import design tokens (adjust path as needed)
const ALLOWED_COLORS = {
  // Primary palette
  primary: [
    '#fdf8f6',
    '#f2e8e5',
    '#e7d6d0',
    '#d2b6a8',
    '#b89079',
    '#8b4513',
    '#7a3f11',
    '#65350f',
    '#4d2a0c',
    '#3a1f09',
    '#1f0f04',
  ],
  // Secondary palette
  secondary: [
    '#f8f9fa',
    '#f1f3f5',
    '#e9ecef',
    '#dee2e6',
    '#ced4da',
    '#adb5bd',
    '#868e96',
    '#495057',
    '#343a40',
    '#212529',
    '#0a0c0e',
  ],
  // Accent palette
  accent: [
    '#fff4ed',
    '#ffe6d5',
    '#ffc9a5',
    '#ffa66c',
    '#ff7c2e',
    '#ff5722',
    '#f84c16',
    '#cc3a0e',
    '#a12c0b',
    '#7a2108',
    '#4d1405',
  ],
  // Semantic colors
  semantic: [
    '#4ade80',
    '#22c55e',
    '#16a34a', // Success
    '#f87171',
    '#ef4444',
    '#dc2626', // Error
    '#fbbf24',
    '#f59e0b',
    '#d97706', // Warning
    '#60a5fa',
    '#3b82f6',
    '#2563eb', // Info
  ],
  // Neutrals
  neutral: [
    '#ffffff',
    '#000000',
    'transparent',
    'currentColor',
    'rgba(0, 0, 0, 0.12)', // Divider
  ],
  // CSS variables (allowed)
  cssVariables: /var\(--color-[\w-]+\)/,
  // Tailwind classes (allowed)
  tailwindClasses:
    /^(bg|text|border|ring|from|to|via)-(primary|secondary|accent|gray|red|green|blue|yellow|orange)(-\d{50,950})?$/,
};

class ColorPaletteChecker {
  constructor() {
    this.violations = [];
    this.checkedFiles = 0;
    this.totalColors = 0;
    this.validColors = 0;
  }

  // Check if a color value is allowed
  isAllowedColor(color) {
    const normalizedColor = color.toLowerCase().trim();

    // Check CSS variables
    if (ALLOWED_COLORS.cssVariables.test(normalizedColor)) {
      return true;
    }

    // Check all color palettes
    for (const palette of Object.values(ALLOWED_COLORS)) {
      if (Array.isArray(palette)) {
        if (palette.some((c) => c.toLowerCase() === normalizedColor)) {
          return true;
        }
      }
    }

    // Check for rgb/rgba/hsl/hsla with allowed opacity
    if (/^(rgb|rgba|hsl|hsla)\(/.test(normalizedColor)) {
      // Allow semi-transparent versions of allowed colors
      return true; // Simplified for now
    }

    return false;
  }

  // Check if a Tailwind class is allowed
  isAllowedTailwindClass(className) {
    return ALLOWED_COLORS.tailwindClasses.test(className);
  }

  // Extract colors from CSS/SCSS files
  extractColorsFromCSS(content, filePath) {
    const colorPatterns = [
      // Hex colors
      /#[0-9a-fA-F]{3,8}\b/g,
      // RGB/RGBA
      /rgba?\([^)]+\)/g,
      // HSL/HSLA
      /hsla?\([^)]+\)/g,
      // Color keywords
      /\b(color|background|border-color|outline-color|box-shadow):\s*([^;]+);/g,
    ];

    const colors = new Set();

    colorPatterns.forEach((pattern) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        let color = match[0];
        if (match[2]) color = match[2]; // For property: value patterns
        colors.add(color);
      }
    });

    return Array.from(colors);
  }

  // Extract colors from JS/TS/JSX/TSX files
  extractColorsFromJS(content, filePath) {
    const colorPatterns = [
      // Hex colors in strings
      /['"]#[0-9a-fA-F]{3,8}['"]/g,
      // Style objects
      /color:\s*['"]([^'"]+)['"]/g,
      /backgroundColor:\s*['"]([^'"]+)['"]/g,
      /borderColor:\s*['"]([^'"]+)['"]/g,
      // Tailwind classes
      /className=["']([^"']+)["']/g,
      /class=["']([^"']+)["']/g,
    ];

    const colors = new Set();
    const classes = new Set();

    colorPatterns.forEach((pattern, index) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (index <= 3) {
          // Color values
          colors.add(match[1] || match[0].replace(/['"]/g, ''));
        } else {
          // Class names
          const classNames = (match[1] || '').split(/\s+/);
          classNames.forEach((cls) => {
            if (
              cls.includes('bg-') ||
              cls.includes('text-') ||
              cls.includes('border-') ||
              cls.includes('ring-')
            ) {
              classes.add(cls);
            }
          });
        }
      }
    });

    return { colors: Array.from(colors), classes: Array.from(classes) };
  }

  // Check a single file
  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileExt = path.extname(filePath);
    const fileName = path.basename(filePath);

    this.checkedFiles++;

    let extractedData = { colors: [], classes: [] };

    if (['.css', '.scss', '.sass'].includes(fileExt)) {
      extractedData.colors = this.extractColorsFromCSS(content, filePath);
    } else if (['.js', '.jsx', '.ts', '.tsx'].includes(fileExt)) {
      extractedData = this.extractColorsFromJS(content, filePath);
    }

    // Check colors
    extractedData.colors.forEach((color) => {
      this.totalColors++;
      if (!this.isAllowedColor(color)) {
        this.violations.push({
          file: filePath,
          type: 'color',
          value: color,
          line: this.findLineNumber(content, color),
        });
      } else {
        this.validColors++;
      }
    });

    // Check Tailwind classes
    extractedData.classes.forEach((className) => {
      if (!this.isAllowedTailwindClass(className)) {
        // Check if it's a color-related class
        if (className.match(/(bg|text|border|ring)-/)) {
          this.violations.push({
            file: filePath,
            type: 'class',
            value: className,
            line: this.findLineNumber(content, className),
          });
        }
      }
    });
  }

  // Find line number of a string in content
  findLineNumber(content, searchStr) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchStr)) {
        return i + 1;
      }
    }
    return 0;
  }

  // Run the checker
  run() {
    console.log('\n🎨 Color Palette Consistency Checker\n');
    console.log('Checking for unauthorized colors...\n');

    const patterns = [
      'src/**/*.{js,jsx,ts,tsx}',
      'src/**/*.{css,scss,sass}',
      'styles/**/*.{css,scss,sass}',
    ];

    patterns.forEach((pattern) => {
      const files = glob.sync(pattern, {
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
      });

      files.forEach((file) => {
        this.checkFile(file);
      });
    });

    this.printReport();
  }

  // Print the report
  printReport() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('                    REPORT SUMMARY                      ');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Files checked:       ${this.checkedFiles}`);
    console.log(`Total colors found:  ${this.totalColors}`);
    console.log(`Valid colors:        ${this.validColors}`);
    console.log(`Violations found:    ${this.violations.length}`);
    console.log('═══════════════════════════════════════════════════════\n');

    if (this.violations.length > 0) {
      console.log('❌ Color Violations Found:\n');

      // Group violations by file
      const violationsByFile = {};
      this.violations.forEach((violation) => {
        if (!violationsByFile[violation.file]) {
          violationsByFile[violation.file] = [];
        }
        violationsByFile[violation.file].push(violation);
      });

      Object.entries(violationsByFile).forEach(([file, violations]) => {
        console.log(`📁 ${file}`);
        violations.forEach((v) => {
          const icon = v.type === 'color' ? '🎨' : '🏷️';
          console.log(`  ${icon} Line ${v.line}: ${v.value}`);
        });
        console.log();
      });

      console.log('\n💡 Suggestions:');
      console.log('1. Use colors from the design tokens (src/styles/design-tokens.ts)');
      console.log('2. Use CSS variables: var(--color-primary-500)');
      console.log('3. Use Tailwind classes with approved colors');
      console.log('4. If a new color is needed, add it to the design system first\n');

      process.exit(1);
    } else {
      console.log('✅ All colors are consistent with the design system!\n');
      process.exit(0);
    }
  }
}

// Run the checker if called directly
if (require.main === module) {
  const checker = new ColorPaletteChecker();
  checker.run();
}

module.exports = ColorPaletteChecker;
