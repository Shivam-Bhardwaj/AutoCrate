# Changelog

All notable changes to AutoCrate will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-09-03

### Added
- **Automatic Skid Sizing System**: Intelligent skid configuration based on crate weight
  - Automatically selects skid dimensions (3x4" to 8x8") based on total loaded weight
  - Dynamic spacing calculation optimized for load distribution
  - Minimum 3 skids with automatic count calculation based on crate length
  - Rub strip requirement detection for crates longer than 96 inches
- **Skid Calculation Utilities**: New comprehensive calculation engine for skid specifications
- **Enhanced 3D Visualization**: Individual skid rendering with accurate spacing and rub strips
- **Real-time Configuration Updates**: Automatic recalculation when weight or dimensions change

### Improved
- Base configuration UI now shows calculated values instead of manual inputs
- More accurate 3D representation of crate base structure
- Better weight-based engineering calculations for structural integrity

## [2.1.0] - 2025-09-03

### Added
- **Mobile Responsive Layout**: Dedicated mobile interface with tabbed navigation for seamless access to all features on mobile devices
- **Touch-optimized UI**: Minimum tap targets of 44px for better mobile interaction
- **Responsive Breakpoints**: Automatic switching between mobile and desktop layouts based on screen size

### Improved
- Mobile text readability with optimized font sizes
- Prevention of horizontal scroll on mobile devices
- Better component organization for mobile viewing

## [2.0.0] - 2025-01-03

### Added

#### Mobile Experience Revolution
- Comprehensive mobile-first redesign with native app-like experience
- Mobile UX Transformation Agent for automated mobile optimization
- Bottom navigation pattern for intuitive mobile navigation
- Swipeable card components with gesture support
- Pull-to-refresh functionality across all screens
- Floating action button (FAB) for quick actions
- Mobile-optimized modal sheets with smooth animations
- Haptic feedback support for enhanced user interaction
- Landscape mode optimizations
- Safe area insets support for notched devices
- Framer Motion animations throughout mobile interface

#### Testing Infrastructure
- Comprehensive testing architecture with Vitest, React Testing Library, and Playwright
- Unit tests with 80% coverage threshold for all metrics
- Integration tests for component interactions
- End-to-end tests for critical user workflows
- Custom Three.js testing utilities with WebGL mocking
- Mock Service Worker (MSW) for API mocking
- Performance testing suite for 3D rendering
- Accessibility testing with axe-core and pa11y

#### Quality Assurance & Consistency
- Color Palette Checker for design system adherence
- GUI Consistency Linter for UI pattern enforcement
- Security Scanner for vulnerability detection
- Accessibility Checker for WCAG 2.1 AA compliance
- Pre-commit hooks with Husky and lint-staged
- Automated code formatting and linting
- Design tokens system for consistent theming
- Industrial-themed color palette (Saddle Brown #8b4513, Safety Orange #ff5722)

#### Project Management
- Unified bash script (autocrate.sh) for all project operations
- Interactive CLI menu for common tasks
- Automated deployment to Vercel
- Release management with standard-version
- Comprehensive documentation and standards
- Git workflow automation
- Dark/Light mode toggle with persistent user preference
- System logs section for tracking user actions and configuration changes
- Real-time activity logging for all operations
- Automated email generation script from CHANGELOG.md
- GitHub Actions CI/CD pipeline for automated testing and deployment
- Dependabot configuration for automated dependency updates

### Changed
- Migrated from desktop-first to mobile-first responsive design
- Improved viewport configuration for better mobile rendering
- Enhanced touch target sizes for better accessibility (minimum 44px)
- Optimized bundle splitting for faster mobile loading
- Updated global styles with mobile-specific utilities
- Refactored layout system for better mobile adaptation
- Improved dark mode implementation with system preference detection
- Replaced non-functional login section with system logs
- Updated UI to support dark mode throughout the application

### Fixed
- Horizontal scroll issues on mobile devices
- Touch interaction problems with 3D viewer
- Form input sizing on mobile keyboards
- Navigation menu overflow on small screens
- Text readability on mobile devices (16px minimum)
- Performance issues with mobile GPUs
- Three.js test-renderer compatibility issues

### Security
- Implemented comprehensive security scanning
- Added protection against common vulnerabilities
- Secured environment variable handling
- Added SSL/TLS configuration checks
- Implemented secure headers configuration

### Removed
- Non-functional login button and authentication placeholder
- Unused login section under 3D viewer
- Deprecated @react-three/test-renderer package

## [1.0.0] - 2025-09-03

### Added
- Interactive 3D visualization of shipping crate designs using Three.js
- Real-time rendering with React Three Fiber integration
- Parametric crate design with configurable dimensions
- NX CAD expression generator for Siemens NX compatibility
- Comprehensive crate configuration options:
  - Base configuration with multiple material options
  - Panel thickness and material customization
  - Fastener selection (Klimp connectors, nails, screws, bolts)
  - Optional vinyl wrapping configurations
  - Ventilation pattern options
- Bill of Materials (BOM) generation with cost estimates
- Responsive UI design with Tailwind CSS
- Dark mode support through Radix UI components
- Form validation using Zod and React Hook Form
- State management with Zustand
- TypeScript support for type safety
- ESLint and Prettier configuration for code quality
- Vercel deployment configuration

### Technical Stack
- Next.js 14 with App Router
- React 18
- TypeScript 5
- Three.js for 3D rendering
- Tailwind CSS for styling
- Radix UI for component library
- Zustand for state management

[unreleased]: https://github.com/Shivam-Bhardwaj/AutoCrate/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/Shivam-Bhardwaj/AutoCrate/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/Shivam-Bhardwaj/AutoCrate/releases/tag/v1.0.0