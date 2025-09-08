# AutoCrate Development Standards & Guidelines

## Overview

This document outlines the development standards, design guidelines, and consistency requirements for the AutoCrate project. All contributors must follow these standards to maintain code quality, security, and user experience consistency.

## Table of Contents

1. [Design System](#design-system)
2. [Code Standards](#code-standards)
3. [Security Requirements](#security-requirements)
4. [Accessibility Standards](#accessibility-standards)
5. [Testing Requirements](#testing-requirements)
6. [Automation & Consistency Checks](#automation--consistency-checks)

## Design System

### Color Palette

All colors must be from the approved design tokens defined in `src/styles/design-tokens.ts`.

#### Primary Colors (Wood/Industrial Browns)
- Main Brand: `#8b4513` (Saddle Brown)
- Range: `#fdf8f6` to `#1f0f04`

#### Secondary Colors (Steel/Metal Grays)
- Range: `#f8f9fa` to `#0a0c0e`

#### Accent Colors (Safety Orange)
- Main: `#ff5722`
- Range: `#fff4ed` to `#4d1405`

#### Semantic Colors
- Success: `#22c55e`
- Error: `#ef4444`
- Warning: `#f59e0b`
- Info: `#3b82f6`

### Typography

```typescript
fontFamily: {
  sans: 'Inter, system-ui, -apple-system, sans-serif',
  mono: 'JetBrains Mono, Monaco, Consolas, monospace',
  display: 'Cal Sans, Inter, sans-serif'
}
```

### Spacing Scale

Use only approved spacing values:
- 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 5 (20px)
- 6 (24px), 8 (32px), 10 (40px), 12 (48px), 16 (64px)
- 20 (80px), 24 (96px), 32 (128px)

### Component Usage

#### Required Components
- Use `Button` from `@/components/ui/button` (not raw `<button>`)
- Use `Input` from `@/components/ui/input` (not raw `<input>`)
- Use `Card`, `CardHeader`, `CardContent` for card layouts
- Use `Label` with proper `htmlFor` attributes

#### Naming Conventions
- Components: PascalCase (e.g., `CrateViewer3D.tsx`)
- Utilities: camelCase (e.g., `generateExpression.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_DIMENSION`)
- CSS classes: kebab-case or Tailwind utilities

## Code Standards

### TypeScript

- **Strict Mode**: Always enabled
- **No `any` types**: Use proper types or `unknown`
- **Interfaces over Types**: For object shapes
- **Enums**: Use const assertions or string unions

```typescript
// Good
interface CrateConfig {
  dimensions: Dimensions;
  material: Material;
}

const CRATE_TYPES = ['standard', 'heavy-duty', 'export'] as const;
type CrateType = typeof CRATE_TYPES[number];

// Bad
type Config = any;
enum Types { Standard, HeavyDuty }
```

### React Best Practices

- **Functional Components**: Use hooks, no class components
- **Custom Hooks**: Prefix with `use` (e.g., `useCrateConfig`)
- **Memoization**: Use `useMemo` and `useCallback` appropriately
- **Props**: Destructure and provide defaults

```typescript
// Good
const CratePanel: FC<CratePanelProps> = ({ 
  thickness = 20, 
  material = 'plywood',
  ...props 
}) => {
  const memoizedValue = useMemo(() => calculateVolume(thickness), [thickness]);
  return <div {...props}>...</div>;
};
```

### Import Organization

Order imports as follows:
1. React imports
2. Next.js imports
3. External packages
4. Internal imports (`@/...`)
5. Relative imports (`./...`, `../...`)

```typescript
// React
import { useState, useEffect } from 'react';

// Next.js
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// External
import { z } from 'zod';
import * as THREE from 'three';

// Internal
import { Button } from '@/components/ui/button';
import { useCrateStore } from '@/store/crate-store';

// Relative
import { calculateDimensions } from './utils';
```

## Security Requirements

### Environment Variables

- **Client-side**: Must prefix with `NEXT_PUBLIC_`
- **Server-side**: Never expose to client code
- **Secrets**: Never commit to repository

### Security Headers

Required headers in `next.config.js`:
```javascript
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000',
  'Content-Security-Policy': '...'
}
```

### Prohibited Patterns

- No `eval()` or `Function()` constructor
- No `innerHTML` (use `textContent` or React)
- No hardcoded secrets or API keys
- No disabled ESLint security rules
- No HTTP URLs (use HTTPS)

### Input Validation

- Sanitize all user inputs
- Use Zod schemas for validation
- Prevent SQL injection and XSS
- Validate file uploads

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### Required Attributes
- All images must have `alt` attributes
- Form inputs must have labels or `aria-label`
- Buttons must have accessible names
- Interactive elements must be keyboard accessible

#### Keyboard Navigation
- All interactive elements reachable via Tab
- Escape key closes modals
- Enter/Space activates buttons
- Arrow keys for menu navigation

#### Color Contrast Policy

AutoCrate maintains WCAG 2.1 AA compliance with comprehensive color contrast validation:

##### Primary Contrast Requirements
- **Normal text** (under 18pt/14pt bold): 4.5:1 minimum contrast ratio
- **Large text** (18pt+ or 14pt+ bold): 3:1 minimum contrast ratio
- **UI components** (buttons, form controls): 3:1 minimum contrast ratio
- **Graphical objects** (icons, borders): 3:1 minimum contrast ratio

##### Contrast Validation Matrix
| Element Type | Background | Minimum Ratio | Testing Method |
|-------------|------------|---------------|----------------|
| Body Text | Any | 4.5:1 | Automated testing |
| Headings | Any | 4.5:1 | Automated testing |
| Large Text | Any | 3:1 | Automated testing |
| Interactive Elements | Any | 3:1 | Manual + automated |
| Focus Indicators | Any | 3:1 | Manual verification |
| Error States | Any | 4.5:1 | Automated testing |

##### Color Token Compliance
All colors in `src/styles/design-tokens.ts` are validated against contrast requirements:

```typescript
// Example validated color combinations
const validatedColors = {
  // Primary text on light backgrounds
  textPrimary: '#212121',     // 21:1 on white
  textSecondary: '#666666',   // 4.5:1 on white

  // Primary text on dark backgrounds
  textPrimaryDark: '#FFFFFF', // 21:1 on dark
  textSecondaryDark: '#CCCCCC', // 4.5:1 on dark

  // Interactive elements
  primaryButton: '#0078D7',   // 4.5:1 on white
  primaryButtonText: '#FFFFFF', // 4.5:1 on blue

  // Status colors with sufficient contrast
  success: '#22c55e',         // 4.5:1 on white
  error: '#ef4444',           // 4.5:1 on white
  warning: '#f59e0b',         // 4.5:1 on white
  info: '#3b82f6'            // 4.5:1 on white
};
```

##### Automated Contrast Testing
Contrast ratios are automatically validated during development:

```bash
# Run contrast validation
npm run test:contrast

# Check specific color combinations
node scripts/consistency-checkers/color-palette-checker.js
```

##### Theme-Specific Contrast Requirements
- **Light Theme**: All text meets 4.5:1 minimum on light backgrounds
- **Dark Theme**: All text meets 4.5:1 minimum on dark backgrounds
- **High Contrast Mode**: Enhanced ratios for accessibility compliance
- **Color Blind Friendly**: Color combinations work in all color vision types

##### Non-Text Contrast
- **Icons and Graphics**: 3:1 minimum contrast ratio
- **Borders and Dividers**: 3:1 minimum contrast ratio
- **Data Visualization**: 4.5:1 minimum for data points and labels
- **3D Elements**: Enhanced contrast for depth perception

##### Testing and Validation
- **Automated Testing**: Contrast ratios checked in CI/CD pipeline
- **Manual Review**: Visual inspection of all color combinations
- **User Testing**: Accessibility testing with screen readers and contrast checkers
- **Cross-Platform**: Validation across different browsers and devices

#### ARIA Usage
- Use semantic HTML first
- ARIA labels for icon-only buttons
- Proper role attributes
- Live regions for dynamic content

### Testing Accessibility
```bash
# Run accessibility checker
node scripts/consistency-checkers/accessibility-checker.js

# Run Playwright accessibility tests
npm run test:a11y
```

## Testing Requirements

### Coverage Thresholds
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

### Test Types

#### Unit Tests
- Services and utilities
- Store actions and selectors
- Pure functions

#### Integration Tests
- Component interactions
- API integrations
- Store updates

#### E2E Tests
- Critical user paths
- Form submissions
- File downloads

### Test Naming
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should perform expected behavior when condition', () => {
      // Test implementation
    });
  });
});
```

## Automation & Consistency Checks

### Pre-commit Hooks

Automatically runs:
1. ESLint and Prettier
2. TypeScript type checking
3. Color palette consistency check
4. Security scanner
5. GUI consistency linter
6. Accessibility checker

### CI/CD Pipeline

On every push/PR:
1. Linting and formatting
2. Type checking
3. Unit and integration tests
4. E2E tests
5. Security audit
6. Coverage reporting

### Manual Checks

#### Run All Checks
```bash
./autocrate.sh doctor
```

#### Individual Checks
```bash
# Color consistency
node scripts/consistency-checkers/color-palette-checker.js

# Security scan
node scripts/consistency-checkers/security-scanner.js

# GUI consistency
node scripts/consistency-checkers/gui-consistency-linter.js

# Accessibility
node scripts/consistency-checkers/accessibility-checker.js
```

## Project Management

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `fix/*`: Bug fixes
- `docs/*`: Documentation

### Commit Messages

Follow conventional commits:
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Release Process

1. Update version: `npm run release:minor`
2. Review CHANGELOG.md
3. Push with tags: `git push --follow-tags`
4. GitHub Actions creates release

## File Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
│   └── ui/          # Reusable UI components
├── lib/             # Utilities
├── services/        # Business logic
├── store/           # State management
├── styles/          # Global styles & tokens
└── types/           # TypeScript definitions
```

## Performance Guidelines

### Bundle Size
- Lazy load heavy components
- Use dynamic imports for Three.js
- Optimize images with Next.js Image
- Tree-shake unused code

### Rendering
- Memoize expensive calculations
- Use React.memo for pure components
- Virtualize long lists
- Debounce rapid updates

### 3D Performance
- Limit polygon count
- Use LOD (Level of Detail)
- Dispose of Three.js resources
- Optimize textures

## Documentation

### Code Comments
- JSDoc for public APIs
- Inline comments for complex logic
- TODO comments with assignee
- No commented-out code

### README Updates
- Keep installation steps current
- Document new features
- Update screenshots
- Maintain changelog

## Enforcement

### Automated
- Pre-commit hooks block violations
- CI/CD fails on standards violations
- Dependabot for security updates
- Code coverage gates

### Manual Review
- PR reviews check standards
- Quarterly security audits
- Accessibility testing
- Performance profiling

## Getting Help

- **Design System**: Check `src/styles/design-tokens.ts`
- **Components**: Review `src/components/ui/`
- **Testing**: See `docs/TESTING.md`
- **Security**: Review `.security/security-policy.json`
- **Issues**: Create GitHub issue with `standards` label

## Updates

This document is version controlled. Propose changes via PR with justification. Standards evolve with the project but require team consensus.

---

*Last Updated: January 2025*
*Version: 1.0.0*