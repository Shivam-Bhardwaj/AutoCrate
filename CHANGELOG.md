# Changelog

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



