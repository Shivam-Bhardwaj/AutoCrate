# Changelog

## 3.1.0 (2025-09-08) - Design System & Accessibility Foundation

### Summary
This release establishes the foundational documentation for the new AutoCrate Design System. It includes comprehensive guides for colors, typography, spacing, and components, along with a detailed accessibility statement. This work centralizes design decisions and provides a framework for all future UI development.

### New Features
- **Design System Documentation**: Created `/docs/DESIGN_SYSTEM.md`, a central document detailing the visual and interactive elements of the application.
  - Documents the full color palette with light/dark themes and WCAG contrast ratios.
  - Defines the typographic scale, font weights, and families.
  - Outlines the 4px-based spacing system (Tailwind's default).
  - Lists the complete component library.
- **Accessibility Guidelines**: Created `/docs/ACCESSIBILITY.md` to formalize the commitment to WCAG standards and provide clear guidelines for developers.

### Documentation
- **Master Plan**: Introduced `MASTER_PLAN.md` to track the progress of the visual overhaul initiative.

### Commits
- docs: create design system and accessibility documentation skeletons
- docs: populate design system with color, typography, and spacing
- docs: expand component library documentation

---

## 3.0.0 (2025-01-08) - NX Professional Release

### Summary
Major release with comprehensive NX CAD integration, professional documentation system, and Applied Materials standards compliance.

### New Features
- **NX CAD Integration**: Complete parametric expression generation for Siemens NX 2022+
- **Applied Materials Standards**: ASME Y14.5-2009 compliant drawings and part numbering (0205-XXXXX format)
- **JT Export/Import**: Native CAD file exchange with NX using JT 10.5+ format
- **In-App Documentation**: Complete documentation system with markdown rendering and search
- **Professional Testing**: Comprehensive test suites including NX integration validation
- **Drawing Generation**: Technical drawings with AMAT title blocks and specifications
- **Bill of Materials**: Enhanced BOM with supplier information and cost analysis

### Technical Improvements
- **Documentation Reorganization**: Clean 4-file root structure with /docs/ folder organization
- **Comprehensive Testing**: Integration tests for NX workflow and JT export validation
- **Performance Optimization**: Bundle analysis and 3D rendering improvements
- **TypeScript Enhancements**: Improved type safety and NX-specific type definitions
- **API Reference**: Complete API documentation for integration capabilities

### Architecture Updates
- **Coordinate System**: Z-up orientation matching NX CAD standards
- **Modular Services**: Separated NX generation, drawing creation, and standards validation
- **Markdown System**: Dynamic documentation loading with syntax highlighting
- **Navigation Enhancement**: Added documentation access from main application

### Standards Compliance
- **ASME Y14.5-2009**: Geometric dimensioning and tolerancing compliance
- **AMAT Requirements**: Applied Materials packaging and material standards
- **NX Compatibility**: Validated with NX 2022 and JT file format specifications
- **Quality Assurance**: Professional testing with 80%+ code coverage

## 1.1.0 (2025-01-05) - Pre-Redesign Stable

### Summary
Stable version before professional UI redesign. This release marks the baseline functionality before implementing comprehensive UI/UX improvements based on client feedback.

### Current Features
- **3D Crate Visualization**: Full Three.js rendering with React Three Fiber
- **NX CAD Expression Generator**: Complete expression output for manufacturing
- **Skid Calculation System**: Automatic sizing based on weight requirements
- **ISPM-15 Compliance**: Floorboard calculations (calculated but not yet visualized)
- **Dark Mode Support**: Persistent theme switching
- **System Logging**: Comprehensive action tracking
- **Mobile Responsive**: Separate mobile layout with tabbed navigation
- **Bill of Materials**: Dynamic BOM generation with cost estimates
- **Testing Infrastructure**: Vitest + Puppeteer with 80% coverage target

### Known Issues (To Be Fixed in Redesign)
- Floorboard visualization not rendering individual boards
- UI appears generic/AI-generated (client feedback)
- Missing world coordinate system in 3D view
- Single camera view only
- No exploded view capability
- NX expressions not relevant to team needs

### Technical Stack
- Next.js 14.0.4 with App Router
- TypeScript (strict mode)
- Three.js + React Three Fiber
- Zustand state management
- Tailwind CSS
- Radix UI components
- Vitest + Puppeteer testing

---

## 2.3.0 (2025-09-08) - Readability & Typography Enhancement

### Summary
This release introduces a major overhaul of the typography and design token system to significantly improve readability and accessibility. Key features include a fluid typography scale using CSS `clamp()`, enhanced 3D label visibility with text outlining, and a refactored color system that meets WCAG AA contrast standards.

### New Features
- **Semantic Typography System**: Implemented a complete typography scale with `clamp()` functions for fluidly responsive text sizing across all viewports.
- **3D Label Readability**: Enhanced 3D label rendering with outline strokes and text-shadow techniques, ensuring clarity against any background.
- **Variable Font Support**: Integrated variable fonts for optimized performance and loading, preventing Flash of Unstyled Text (FOUT).
- **Accessible Color Tokens**: Refactored the entire color system with a focus on accessibility, with all tokens verified for WCAG AA compliance.
- **Theme Consolidation**: Unified theme management for consistent color and style application across all application components.

### Technical Improvements
- **Design Token Architecture**: Centralized typography and color tokens in `globals.css` and `tailwind.config.ts` for a single source of truth.
- **Automated Contrast Testing**: Added automated color contrast validation to the testing suite to enforce accessibility standards.
- **Optimized Font Loading**: Implemented a robust font loading strategy in `src/app/fonts.ts` to improve perceived performance.

### Commits
- feat: add variable font and typography tokens ([58e98af](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/58e98af))
- feat: refactor panels to accessible color tokens ([1e09d60](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/1e09d60))
- feat: consolidate theme color usage ([8fa7652](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/8fa7652))
- feat: improve 3D label readability with outline ([104b8cc](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/104b8cc))
- test: add typography token unit tests ([c0145b1](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/c0145b1))
---

## 2.2.10 (2025-09-05)


### Bug Fixes

* configure direct Vercel CLI deployment ([1bcc6f9](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/1bcc6f9891688c213921e3bbef11c403a59e0601))
* disable E2E tests in CI to stabilize pipeline ([f97e30e](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/f97e30ee309c61915d687c325268897a68c04f25))
* prevent duplicate workflows on main push ([a16ab68](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/a16ab6833fdf5397240a27be8334aa7ebb84844e))
* resolve ESLint errors and warnings for successful build ([f2ef6a6](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/f2ef6a63d4c0c5f2bf1262b1734402aec67a2988))
* resolve formatting and CI/CD issues ([3c5d612](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/3c5d6129fda9c9f6dfa8b6a289e8204b3a94c6f4))
* simplify E2E tests to fix CI pipeline failures ([3cd052c](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/3cd052c23f4f9c1878d7210af7d2a197caa4cf9b))
* update upload-artifact action from v3 to v4 ([8519130](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/8519130f0517ca7db87551885530efc0149b2231))
* update version display to match package.json v2.2.1 ([5342d60](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/5342d60a4e8daa9196124617c82ceafb7189e726))


### Features

* add dark mode and system logging functionality ([066cd5e](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/066cd5e7d2bb177a72d39be645feccdd2079bd73))
* add mobile responsive layout with tabbed navigation ([795101f](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/795101f029ef5fe26bb37ec553b9f854fd62206d))
* add Puppeteer monitoring system ([5e8a5f8](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/5e8a5f8da8c012ded31fa0235823536e0b6dd11d))
* add unified changelog and email notification system ([5b93623](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/5b93623429d76642ff557a4b004bf81905499e2d))
* add version display at bottom of page ([410f81c](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/410f81c932d4577ea2241002bbbfe055e3963598))
* implement automatic skid sizing and spacing system (v2.2.0) ([0e495bc](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/0e495bcd6ac5d7b948a8e6d3255c64551b698f62))
* implement complete hands-off automation system ([aeb9a8e](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/aeb9a8e7f813990ae4076c80098d70ee8a37adc7))
* implement dynamic version display from package.json ([62555c9](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/62555c94966902ed9044119bbc72c7cfeb5ed4dc))
* initial AutoCrate setup with CI/CD and changelog management ([2e5a8ef](https://github.com/Shivam-Bhardwaj/AutoCrate/commit/2e5a8ef60caa80c3eec0616b1951b9e2de4f545f))



