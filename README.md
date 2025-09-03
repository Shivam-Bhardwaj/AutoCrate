# AutoCrate - NX CAD Expression Generator

AutoCrate is a professional mobile-first web application for designing industrial shipping crates and generating NX CAD expressions. The system provides real-time 3D visualization, comprehensive testing infrastructure, and automated generation of parametric CAD models compatible with Siemens NX.

## Features

### Core Functionality
- **Interactive 3D Visualization**: Real-time 3D rendering of crate design matching CAD specifications
- **Parametric Design**: Fully configurable crate components including base, panels, fasteners, and vinyl wrapping
- **NX Expression Generation**: Automated creation of NX CAD expression files for direct import
- **Bill of Materials**: Automatic calculation of required materials and estimated costs

### Mobile Experience
- **Native App-Like Interface**: Bottom navigation, swipeable cards, and gesture support
- **Pull-to-Refresh**: Refresh data with natural mobile gestures
- **Touch-Optimized**: Minimum 44px touch targets for better accessibility
- **Offline Support**: Progressive Web App capabilities
- **Responsive Design**: Adaptive layouts for all screen sizes

### Quality & Testing
- **Comprehensive Testing**: Unit, integration, and E2E tests with 80% coverage
- **Accessibility**: WCAG 2.1 AA compliant with automated checking
- **Security Scanning**: Automated vulnerability detection
- **Design System**: Consistent theming with design tokens
- **Code Quality**: Pre-commit hooks, linting, and formatting

## Technology Stack

### Core Technologies
- **Frontend**: Next.js 14, React 18, TypeScript
- **3D Rendering**: Three.js, React Three Fiber, @react-three/drei
- **Styling**: Tailwind CSS, Radix UI, Framer Motion
- **State Management**: Zustand
- **Form Handling**: React Hook Form, Zod validation

### Testing & Quality
- **Unit Testing**: Vitest with happy-dom
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright
- **API Mocking**: Mock Service Worker (MSW)
- **Accessibility**: axe-core, pa11y
- **Code Quality**: ESLint, Prettier, Husky

### Development Tools
- **Build Tool**: Vite (for testing)
- **CI/CD**: GitHub Actions, Vercel
- **Version Control**: Git with conventional commits
- **Documentation**: Markdown with automated generation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with WebGL support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Shivam-Bhardwaj/AutoCrate.git
cd AutoCrate
```

2. Install dependencies:
```bash
npm install
```

3. Initialize git hooks:
```bash
npm run prepare
```

4. Run the development server:
```bash
npm run dev
# or use the unified script
./autocrate.sh
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build & Deployment

```bash
# Build for production
npm run build

# Run production server locally
npm start

# Deploy to Vercel
npm run deploy

# Deploy preview
npm run deploy:preview
```

## Project Structure

```
AutoCrate/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── page.tsx           # Main page with responsive layout
│   │   ├── mobile-page.tsx    # Mobile-specific layout
│   │   └── mobile-layout.tsx  # Mobile app layout
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── mobile/           # Mobile-specific components
│   │   │   ├── MobileWrapper.tsx
│   │   │   ├── BottomNavigation.tsx
│   │   │   └── SwipeableCard.tsx
│   │   ├── CrateViewer3D.tsx
│   │   ├── InputForms.tsx
│   │   ├── OutputSection.tsx
│   │   └── LogsSection.tsx
│   ├── lib/                   # Utility functions
│   ├── services/              # Business logic
│   │   └── nx-generator.ts
│   ├── store/                 # State management
│   │   ├── crate-store.ts
│   │   ├── theme-store.ts
│   │   └── logs-store.ts
│   ├── styles/                # Styling
│   │   ├── design-tokens.ts
│   │   └── mobile.css
│   └── types/                 # TypeScript definitions
│       └── crate.ts
├── tests/                     # Test suites
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   ├── e2e/                  # End-to-end tests
│   └── utils/                # Test utilities
├── scripts/                   # Utility scripts
│   ├── consistency-checkers/ # Code quality agents
│   │   ├── accessibility-checker.js
│   │   ├── color-palette-checker.js
│   │   ├── gui-consistency-linter.js
│   │   └── security-scanner.js
│   └── mobile-ux-agent.js    # Mobile UX transformer
├── docs/                      # Documentation
│   └── STANDARDS.md          # Development standards
├── .github/                   # GitHub configuration
├── .husky/                    # Git hooks
└── autocrate.sh               # Unified management script
```

## Usage Guide

### 1. Configure Crate Dimensions

- Enter length, width, and height
- Select measurement unit (mm or inches)
- Specify product weight and maximum gross weight

### 2. Design Base Configuration

- Choose base type (standard, heavy-duty, export)
- Set floorboard thickness and skid dimensions
- Select material (pine, oak, plywood, OSB)

### 3. Configure Panels

- Set thickness for each panel (top, front, back, left, right)
- Choose materials and reinforcement options
- Enable ventilation with customizable patterns

### 4. Select Fasteners

- Choose fastener type (Klimp connectors, nails, screws, bolts)
- Set size and spacing
- Select material (steel, stainless, galvanized)

### 5. Optional Vinyl Wrapping

- Enable waterproof, vapor barrier, or cushion vinyl
- Set thickness and coverage options

### 6. Generate Output

- View real-time 3D preview
- Download NX expression file
- Review bill of materials and cost estimates

## NX Expression File Format

The generated expression files contain:

- Parametric variables for all dimensions
- Feature creation commands for base, panels, and accessories
- Material calculations and constraints
- Fastener placement patterns
- Optional vinyl wrapping specifications

## API Reference

### NXExpressionGenerator

```typescript
const generator = new NXExpressionGenerator(configuration);
const expression = generator.generateExpression();
const blob = generator.exportToFile();
```

### Store Actions

```typescript
updateDimensions(dimensions: Partial<CrateDimensions>)
updateBase(base: Partial<ShippingBase>)
updatePanel(panelKey: keyof CrateCap, panel: Partial<PanelConfig>)
updateFasteners(fasteners: Partial<Fasteners>)
updateVinyl(vinyl: Partial<VinylConfig>)
```

## Deployment

The application is deployed on Vercel at [https://autocrate.vercel.app/](https://autocrate.vercel.app/)

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## Testing

### Run Tests
```bash
# All tests
npm run test:all

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run e2e

# Test coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Code Quality
```bash
# Lint code
npm run lint

# Type checking
npm run type-check

# Format code
npm run format

# Run all checks
npm run check:all
```

### Consistency Checkers
```bash
# Run all consistency checks
./autocrate.sh  # Select option 8

# Individual checkers
node scripts/consistency-checkers/accessibility-checker.js
node scripts/consistency-checkers/color-palette-checker.js
node scripts/consistency-checkers/gui-consistency-linter.js
node scripts/consistency-checkers/security-scanner.js

# Mobile UX transformation
node scripts/mobile-ux-agent.js
```

## License

Proprietary - All rights reserved

## Scripts Reference

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Testing
npm run test:all         # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run e2e              # E2E tests
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # ESLint
npm run format           # Prettier
npm run type-check       # TypeScript checking
npm run check:all        # All checks

# Deployment
npm run deploy           # Deploy to production
npm run deploy:preview   # Deploy preview

# Release Management
npm run release          # Create new release
npm run release:minor    # Minor version bump
npm run release:patch    # Patch version bump
npm run release:major    # Major version bump

# Utilities
npm run email:generate   # Generate update email
./autocrate.sh           # Interactive management menu
```

## Support

For support and questions:
- Open an issue on [GitHub](https://github.com/Shivam-Bhardwaj/AutoCrate/issues)
- Contact the engineering team
- Check the [documentation](./docs/)

## Changelog

### Version 2.0.0 (2025-01-03)
- Mobile-first redesign with native app experience
- Comprehensive testing infrastructure (80% coverage)
- Quality assurance tools and consistency checkers
- Unified project management script
- Design tokens system with industrial theme
- Framer Motion animations
- Pull-to-refresh and gesture support
- WCAG 2.1 AA accessibility compliance

### Version 1.0.0 (2025-09-03)
- Initial release with core functionality
- 3D visualization engine
- NX expression generator
- Material calculator
- Responsive UI design

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.