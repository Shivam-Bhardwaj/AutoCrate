# Changelog

All notable changes to AutoCrate will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions CI/CD pipeline for automated testing and deployment
- Dependabot configuration for automated dependency updates
- Conventional commits with commitlint for standardized commit messages
- Automated changelog generation using standard-version
- Release workflow for automated GitHub releases

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

[unreleased]: https://github.com/Shivam-Bhardwaj/AutoCrate/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Shivam-Bhardwaj/AutoCrate/releases/tag/v1.0.0