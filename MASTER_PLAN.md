# Master Plan

This document is a consolidation of all markdown files in the project.

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\CHANGELOG.md

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

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\CLAUDE.md

# AutoCrate Project Instructions

## CRITICAL DEPLOYMENT RULES - MUST FOLLOW
**Claude will ONLY make local changes. NO automatic commits or pushes to GitHub.**

### Deployment Workflow (User Controlled):
1. **Option 1 (Local Test)**: User tests locally after Claude makes changes
2. **Option 2 (Prepare)**: User validates with all checks and tests
3. **Option 3 (Deploy)**: User pushes to GitHub ONLY when ready

**Claude is FORBIDDEN from:**
- Running `git commit` without explicit user request
- Running `git push` without explicit user request  
- Using Option 3 of autocrate.bat without user permission
- Automatically deploying or pushing code
- Making changes to files that are NOT directly related to the requested task
- Modifying configuration files, documentation, or tests unless specifically asked
- Creating new files unless absolutely necessary for the requested feature

**STRICT RULES:**
- Only modify files that are DIRECTLY relevant to the user's request
- Do NOT change unrelated files, configs, or documentation
- Do NOT proactively update or "improve" code that wasn't mentioned
- All changes remain LOCAL until user explicitly approves deployment

## Project Overview
AutoCrate is a Next.js 14 application for designing shipping crates with 3D visualization and NX CAD expression generation.
Live URL: https://autocrate-5xoh6cft1-shivams-projects-1d3fe872.vercel.app

## Simplified Deployment Workflow

### Three-Step Process:
1. **Local Development** (`.\autocrate local` or Option 1)
   - Starts dev server
   - Runs tests
   - Use for active development

2. **Prepare for Production** (`.\autocrate prepare` or Option 2)
   - Runs all quality checks (lint, type-check, format)
   - Builds production bundle
   - Runs all tests
   - Ensures code is production-ready

3. **Deploy to Production** (`.\autocrate deploy` or Option 3)
   - Git add, commit, and push
   - GitHub Actions automatically deploys to Vercel
   - No manual Vercel CLI needed

### Why This Workflow?
- GitHub push triggers automatic deployment
- Single source of truth (GitHub)
- Version control integrated with deployment
- Simplified process: develop → prepare → deploy

## GitHub Actions CI/CD
The project uses GitHub Actions for continuous integration (NOT for deployment):

### Workflows
1. **CI/CD Pipeline** (`.github/workflows/ci.yml`)
   - Triggers on push/PR to main/develop branches
   - Runs: Linting, Type checking, Unit tests, Integration tests, E2E tests
   - Consistency checks for accessibility and security
   - Build verification

2. **Release Workflow** (`.github/workflows/release.yml`)
   - For creating releases and changelogs

### Required GitHub Secrets
Configure these in Settings → Secrets → Actions:
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: team_64dmOmtL9E1fNYWb5uATz7UZ
- `VERCEL_PROJECT_ID`: prj_IvXRHYjfChbaj892GNXnbKfti5J3
- `CODECOV_TOKEN`: Optional, for coverage reports

### Test Scripts
All test commands are configured in package.json:
- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:coverage` - Generate coverage report
- `npm run e2e` - Run Playwright E2E tests
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm run format` - Format with Prettier

## Key Features
- 3D crate visualization using Three.js/React Three Fiber
- NX CAD expression generator with detailed implementation instructions
- Two-point diagonal box construction method for minimal parameters
- Interactive visual guides for NX CAD workflow
- Dark/Light mode toggle with persistent preferences
- System logs tracking all user actions
- Real-time configuration updates
- Bill of Materials generation with cost estimates
- Mobile-responsive design with separate mobile layout
- Automatic skid sizing based on weight requirements

## Tech Stack
- Next.js 14.0.4 with App Router
- TypeScript
- Three.js for 3D rendering
- Tailwind CSS for styling
- Zustand for state management
- Radix UI components
- Vercel for hosting
- Vitest for testing
- Playwright for E2E testing

## File Management Policy

### Clean Codebase Principles
- **ONE SCRIPT RULE**: Use `autocrate.bat` for all operations (no duplicate scripts)
- **NO TEMPORARY FILES**: Don't create scripts that won't be reused
- **NO PLATFORM DUPLICATES**: No .sh/.bat/.ps1 versions of the same script
- **ESSENTIAL ONLY**: Only keep files necessary for production

### Files to Keep
- `autocrate.bat` - Master control script
- Configuration files (package.json, tsconfig.json, etc.)
- Source code in /src
- Tests in /tests
- Essential configs (next.config.js, tailwind.config.js)

### Files to Avoid
- Automation scripts (use a.bat instead)
- Multiple script versions
- Temporary or backup files
- Log files in repo
- Unused dependencies or configs

## Important Notes
- GitHub is used ONLY for version control and CI testing
- All deployments must go through Vercel CLI
- Test files are excluded from production builds (`tsconfig.json` excludes tests)
- No placeholder/non-functional buttons should exist
- Dark mode persists across sessions using localStorage
- Logs are limited to 100 entries to prevent memory issues
- All dimensions are in inches throughout the application
- NX expressions use two-point diagonal construction for simplicity
- Hydration-safe timestamp rendering in LogsSection (client-only)

## Configuration Management
### Dynamic Values
- Tech stack versions are read dynamically from `package.json` via `src/utils/tech-stack.ts`
- Project version is imported from `src/utils/version.ts` (generated from package.json)
- No hardcoded URLs or API endpoints in the codebase

### Default Port Configuration
- Development server runs on port 3000 by default
- If port 3000 is busy, Next.js automatically tries 3001, 3002, etc.
- Use `.\autocrate ports` to view/manage active ports

### Environment Variables
- Vercel deployment credentials are stored as GitHub secrets (see above)
- No `.env` file is required for basic functionality
- All configuration is derived from package.json when possible

## Master Script - a.bat
A unified script for all development tasks is available (named 'a.bat' for quick tab completion):

### Usage
- **Interactive Menu**: `.\autocrate` or `.\autocrate.bat` (no arguments)
- **Direct Commands**: `.\autocrate [command]`

### Available Commands
- `dev` - Start development server
- `build` - Build for production
- `deploy` - Deploy to Vercel (builds first)
- `test` - Run tests
- `lint` - Run ESLint
- `format` - Format code with Prettier
- `typecheck` - Run TypeScript type check
- `check` - Run all checks (lint + type + format)
- `help` - Show help message

### Examples
```cmd
.\a dev        # Start dev server
.\a deploy     # Build and deploy to Vercel
.\a check      # Run all code quality checks
.\a            # Opens interactive menu
```

## Common Tasks

### Adding new features
1. Always check existing patterns in the codebase
2. Use existing components from @/components/ui
3. Add appropriate logging with useLogsStore
4. Ensure dark mode support is included
5. Run tests before committing: `.\autocrate test`

### Fixing issues
1. Test locally with `.\autocrate dev`
2. Build test with `.\autocrate build`
3. Run linting: `.\autocrate lint`
4. Fix formatting: `.\autocrate format`
5. Deploy only after successful build: `.\autocrate deploy`

### Updating changelog
1. Update CHANGELOG.md in Unreleased section
2. Generate email update: `npm run email:generate`
3. Follow conventional commit format

### Code quality checks
- Quick check all: `.\autocrate check`
- Security: `node scripts/consistency-checkers/security-scanner.js`
- Accessibility: `node scripts/consistency-checkers/accessibility-checker.js`
- Individual checks:
  - Linting: `.\autocrate lint`
  - Type checking: `.\autocrate typecheck`
  - Formatting: `.\autocrate format`

## File Structure
- `/src/app` - Next.js app router pages
- `/src/components` - React components
  - `NXInstructions.tsx` - Step-by-step NX implementation guide
  - `NXVisualGuide.tsx` - Visual coordinate system and construction guide
  - `OutputSection.tsx` - Expression output with Instructions and Visual Guide tabs
- `/src/store` - Zustand stores (crate, theme, logs)
- `/src/services` - Business logic (NX generator with enhanced documentation)
- `/src/types` - TypeScript type definitions
- `/src/utils` - Utility functions (format-inches for dimension display)
- `/scripts` - Build and utility scripts
- `/tests` - Test files (excluded from build)
  - `/tests/unit` - Unit tests
  - `/tests/integration` - Integration tests
  - `/tests/e2e` - Playwright E2E tests

## Git Workflow
1. Create feature branch from develop
2. Make changes and test locally
3. Run `npm run lint` and `npm run format`
4. Commit with conventional commit messages
5. Push and create PR
6. GitHub Actions will run CI checks
7. Merge to main after approval
8. Deploy using Vercel CLI (NOT GitHub Actions)

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\IMPROVEMENT_PLAN.md

# Plan for Application Improvements

This document provides a detailed plan and a series of prompts for addressing the requested features and fixes.

## 1. Fix Floorboard Visualization

**Prompt:** The floorboard of the crate is not rendering correctly in the 3D viewer. Investigate the cause of this bug and implement a fix to ensure the floorboard is visualized in the correct position and with the correct dimensions.

**Plan:**

1.  **Inspect `CrateViewer3D.tsx`:** Analyze the `CrateModel` component within this file to understand how the floorboard mesh is being created and positioned.
2.  **Verify Data Flow:** Check the `useCrateStore` to ensure that the floorboard's properties (dimensions, thickness) are being correctly calculated and passed to the `CrateViewer3D` component.
3.  **Debug Rendering Logic:** Pay close attention to the calculation of the floorboard's Y-position. It should be placed directly on top of the skids. The issue is likely an incorrect offset in the position calculation.
4.  **Implement and Verify Fix:** Apply the necessary code changes to correct the rendering logic and verify that the floorboard appears correctly in the 3D view under various configurations.

## 2. Make the UI More Professional

**Prompt:** The current UI has an "AI-generated" feel. Refine the user interface to be more professional, polished, and human-centric. The goal is to improve visual hierarchy, cohesion, and overall aesthetic appeal.

**Plan:**

1.  **Refine Typography:** Adjust font sizes, weights, and line heights to create a clear and consistent visual hierarchy. Use a typographic scale to ensure harmony between different text elements.
2.  **Adjust Color Palette:** Revise the color palette to be more cohesive and professional. Consider using a primary color with a few complementary accent colors. Ensure that the color contrast meets accessibility standards.
3.  **Improve Layout and Spacing:** Audit the layout for consistent spacing and alignment. Use a consistent spacing scale (e.g., based on a 4px or 8px grid) to create a more balanced and visually pleasing layout.
4.  **Polish Component Styles:** Add subtle refinements to the UI components. For example, add soft shadows to cards, subtle gradients to buttons, and improved focus states for inputs.
5.  **Ensure Icon Consistency:** Review the use of icons throughout the application and ensure that they are from a single, consistent set (e.g., Lucide) and that their size and weight are used uniformly.

## 3. Add World Coordinate System and Exploded View

**Prompt:** Enhance the 3D viewer by adding two new features: a world coordinate system indicator and an exploded view option.

**Plan:**

1.  **Implement World Coordinate System:**
    - In `CrateViewer3D.tsx`, add an `axesHelper` to the scene. This will display a visual representation of the X, Y, and Z axes in the corner of the viewer, providing a clear frame of reference.

2.  **Implement Exploded View:**
    - **State Management:** Add a new state to the `useCrateStore` to manage the exploded view (e.g., `isExploded: boolean`, `explosionFactor: number`).
    - **UI Control:** Add a switch or a slider to the UI to allow users to toggle the exploded view and control the distance between the parts.
    - **Component Logic:** In the `CrateModel` component, when `isExploded` is true, modify the position of each part by translating it away from the center of the model. The translation distance should be proportional to the `explosionFactor`.

## 4. Replace Expressions File with Calculations Panel

**Prompt:** The current "NX Instructions" tab is not needed. Replace it with a new panel that displays calculations and data relevant to the engineering and manufacturing teams.

**Plan:**

1.  **Define Pertinent Calculations:** The new panel should display key data points, such as:
    -   Total Gross Weight
    -   Total Volume (Interior and Exterior)
    -   Total Surface Area
    -   A detailed Bill of Materials (BOM) with a list of all parts, their dimensions, and quantities.
2.  **Create `CalculationsPanel.tsx`:** Create a new component that takes the crate configuration as a prop and calculates and displays the data listed above.
3.  **Update Main Layout:** In the main application layout, remove the `NXInstructions.tsx` and `NXVisualGuide.tsx` components and replace them with the new `CalculationsPanel.tsx`.

## 5. Add a "Formulas" Tab

**Prompt:** To improve transparency and trust in the application's output, add a new tab that displays the formulas and logic used for the calculations shown in the new `CalculationsPanel.tsx`.

**Plan:**

1.  **Create `FormulasGuide.tsx`:** Create a new component that displays the formulas used for the key calculations. For example:
    -   **Weight Calculation:** `Total Weight = Σ (Part Volume * Material Density)`
    -   **Volume Calculation:** `Exterior Volume = Length * Width * Height`
2.  **Add New "Formulas" Tab:** Add a new tab to the main UI.
3.  **Content for the Formulas Tab:** The `FormulasGuide.tsx` component should be displayed in this new tab. It should be well-formatted and easy to read, possibly using a library like KaTeX for rendering mathematical formulas.

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\JSON_BENEFITS.md

# How JSON Helps: The Benefits of a Structured Data Approach

This document explains the key advantages of using JSON as the format for the geometry definition file, as proposed in the `NX_EXPRESSION_STRATEGY.md`.

## 1. Structure and Hierarchy

The current expression file is a flat list of commands. A crate, however, is a hierarchical assembly of parts. JSON excels at representing this kind of nested structure.

- **Benefit:** You can define the crate as an assembly with sub-assemblies and parts, perfectly mirroring the structure in a CAD system. This makes the data much more intuitive and easier to work with.

```json
"assembly": {
  "name": "Crate",
  "children": [
    { "partId": "base_assembly" },
    { "partId": "wall_assembly" }
  ]
}
```

## 2. Machine-Readable and Human-Readable

JSON strikes a perfect balance between being easy for computers to parse and for humans to read.

- **Benefit for Automation:** A script can instantly read the JSON file and understand the entire structure of the crate without any complex parsing logic.
- **Benefit for Humans:** An engineer can open the JSON file and clearly see the definition of each part, its properties, and its relationship to other parts.

## 3. Standardization and Interoperability

JSON is a universal standard, supported by virtually every modern programming language and tool, including Python, which is used for scripting in NX (NX Open).

- **Benefit:** You don't need to write a custom parser. You can use any standard JSON library to work with the file. This makes it incredibly easy to integrate with other systems and to write automation scripts for NX.

## 4. Extensibility and Flexibility

As the AutoCrate project grows, you will want to add more features and complexity to your designs. A structured format like JSON makes this easy.

- **Benefit:** You can add new properties to your parts (e.g., `"color"`, `"cost"`), define new types of geometry (e.g., `"cylinder"`, `"extrude"`), or add more complex constraints without breaking your existing scripts. The system can evolve without requiring a complete rewrite.

## 5. Eliminates Ambiguity

The current system relies on a human to interpret the pseudo-code, which can lead to errors. JSON allows for the explicit definition of all geometric properties and relationships.

- **Benefit:** Instead of relying on a two-point system for a block, you can explicitly define an origin point and vectors for length, width, and height. This removes all ambiguity and ensures that the part is created exactly as intended, every time.

## 6. Enables Full Automation (The Key Benefit)

This is the most significant advantage. A well-structured JSON file is the key to moving from a manual process to a fully automated one.

- **Benefit:** An NX Open script (in Python) can be written to:
  1.  Read the `.json` file.
  2.  Loop through the `parts` array and create each part with its specified geometry and material.
  3.  Use the `assembly` and `constraints` data to automatically position and mate the parts together.

This transforms the workflow from a time-consuming manual task into a fast, reliable, and automated process, which is the ultimate goal of a project like AutoCrate.

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\MOBILE_IMPROVEMENTS.md

# Mobile UI/UX Improvements

This document provides suggestions for improving the mobile user experience of the AutoCrate application.

## High-Impact Improvements

### 1. Gestures for Tab Navigation

Since you are already using `framer-motion`, you can enhance the tab-based navigation by implementing swipe gestures.

- **Suggestion:** Allow users to swipe left and right to switch between the main tabs (Input, 3D View, Output, Logs). This is a highly intuitive interaction on mobile devices and will make the app feel more native.

### 2. Haptic Feedback

To make the app feel more responsive and engaging, you can provide haptic feedback on key interactions.

- **Suggestion:** Use the browser's Vibration API to trigger a short vibration when the user switches tabs, taps a button, or successfully completes an action. This can be implemented in a custom hook (e.g., `useHapticFeedback`).

### 3. Pull-to-Refresh

A common pattern in mobile apps is to allow users to pull down from the top of the screen to refresh the content.

- **Suggestion:** Implement a "pull-to-refresh" gesture on the main content areas. This could be used to reset the crate configuration or to fetch the latest data from the server.

## Medium-Impact Improvements

### 1. Detailed Skeleton Screens

You are already using skeleton loaders for dynamic imports. You can improve this by creating more detailed skeleton screens.

- **Suggestion:** Instead of a generic pulsing box, create skeleton screens that mimic the layout of the components they are replacing. For example, the skeleton for the `InputForms` component could show a series of rectangular shapes that represent the input fields.

### 2. "New" Button Functionality

The "New" button in the header of `mobile-layout.tsx` should have a clear and useful action.

- **Suggestion:** The "New" button could trigger an action sheet or a modal that gives the user options to "Start a new project from scratch" or "Choose from a template".

### 3. Context-Aware Floating Action Button (FAB)

The Floating Action Button in `mobile-layout.tsx` can be made more powerful by having its action change based on the current context.

- **Suggestion:**
  - In the **viewer** tab, the FAB could toggle different view modes (e.g., wireframe, solid, transparent).
  - In the **output** tab, the FAB could trigger an export action (e.g., PDF, STL).
  - In the **config** tab, it could be used to quickly add a new part to the crate.

## Low-Impact / Polish Improvements

### 1. Consolidate Mobile Files

You currently have both a `mobile-layout.tsx` and a `mobile-page.tsx`. These files could likely be consolidated.

- **Suggestion:** Consider merging the logic from `mobile-page.tsx` into `mobile-layout.tsx` to create a single, more robust mobile layout component. This would simplify the codebase and make it easier to maintain.

### 2. Native Font Stack

To make the app feel more at home on the user's device, you can use the native font stack.

- **Suggestion:** In your `tailwind.config.ts`, configure your theme to use a native font stack (e.g., `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`).

### 3. Progressive Web App (PWA) Features

To provide a more native-like experience, you can add Progressive Web App features to your application.

- **Suggestion:** Add a web app manifest (`manifest.json`) to allow users to add the app to their home screen. Implement a service worker to cache assets and enable offline access to certain features.

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\NX_EXPRESSION_STRATEGY.md

# Updated Strategy for NX Expression File Generation

This document outlines a new strategy for generating files to be consumed by Siemens NX, focusing on creating a more structured, comprehensive, and automation-friendly output.

## 1. Analysis of the Current System

- **Format:** The current system generates a proprietary `.exp` file containing a mix of comments, key-value parameters, and a human-readable pseudo-code that describes manual `BLOCK` creation steps.
- **Workflow:** The process is entirely manual. An NX user must interpret the file, import the parameters, and then manually construct each geometric feature.
- **Limitations:** This approach is not scalable, is prone to human error, and cannot represent complex geometry, sub-assemblies, or specific manufacturing details.

## 2. Proposed Strategy: A Two-File Approach

To address these limitations, the new strategy is to generate two distinct files:

1.  **A Master Parameters File (`.exp`):** A simple, flat key-value file for direct import into the NX Expression Editor. This file will contain only the core input parameters.
2.  **A Structured Geometry Definition File (`.json`):** A detailed, machine-readable JSON file that describes the entire crate assembly, including geometry, hierarchy, and constraints. This file is intended for consumption by a more advanced script or automation tool.

### 2.1. The Master Parameters File (`crate_parameters.exp`)

This file remains simple and is backward-compatible with the idea of importing expressions into NX.

**Example:**
```
// AutoCrate Master Parameters
// All units are in inches
crate_length = 120
crate_width = 48
crate_height = 36
skid_height = 3.5
panel_thickness = 0.75
```

### 2.2. The Structured Geometry Definition File (`crate_geometry.json`)

This is the core of the new strategy. By adopting JSON, we create a structured, extensible, and machine-readable format.

#### Key Data Structures:

- **`metadata`:** Contains overall information about the design (units, author, date, etc.).
- **`parameters`:** A copy of the master parameters for context.
- **`parts`:** An array of objects, where each object represents a single part in the assembly.
- **`assembly`:** Defines the hierarchical structure of the crate, with parent-child relationships and mating constraints.

#### Enriched Part Definition:

Each part object in the `parts` array will be explicitly defined:

- **`id`:** A unique identifier for the part (e.g., "front_panel").
- **`name`:** A human-readable name (e.g., "Front Panel").
- **`material`:** The material of the part (e.g., "Plywood").
- **`geometry`:** An object describing the geometry of the part. For a simple block, this would include:
  - **`type`:** "block"
  - **`origin`:** `[x, y, z]` coordinates of the starting point.
  - **`vectors`:** An object with `length`, `width`, and `height` vectors (e.g., `length: [1, 0, 0]`, `width: [0, 0, 1]`, `height: [0, 1, 0]`).
  - **`dimensions`:** The scalar values for length, width, and height, which can reference the master parameters (e.g., `"height": "crate_height"`).
- **`features`:** An array for geometric features like holes, slots, or chamfers.

#### Assembly and Constraints:

The `assembly` object will define how the parts fit together:

```json
"assembly": {
  "name": "CrateAssembly",
  "children": [
    {
      "partId": "floorboard",
      "children": [
        {
          "partId": "skid_1",
          "constraints": [
            {
              "type": "coincident",
              "from": "skid_1.face.top",
              "to": "floorboard.face.bottom"
            }
          ]
        }
      ]
    }
  ]
}
```

## 3. Example of the New JSON Format

```json
{
  "metadata": {
    "version": "1.0",
    "units": "inches",
    "generated_at": "2025-09-06T10:00:00Z"
  },
  "parameters": {
    "crate_length": 120,
    "crate_width": 48,
    "panel_thickness": 0.75
  },
  "parts": [
    {
      "id": "floorboard",
      "name": "Floorboard",
      "material": "Plywood",
      "geometry": {
        "type": "block",
        "origin": [0, 3.5, 0],
        "vectors": {
          "length": [1, 0, 0],
          "width": [0, 0, 1],
          "height": [0, 1, 0]
        },
        "dimensions": {
          "length": "crate_length",
          "width": "crate_width",
          "height": "panel_thickness"
        }
      }
    }
  ],
  "assembly": { ... }
}
```

## 4. Benefits of the New Strategy

- **Automation-Ready:** The structured JSON format can be easily parsed by scripts (e.g., Python with the NX Open library, or a Journal file) to automatically construct the entire assembly in NX.
- **Extensibility:** New features, part types, and constraints can be added to the JSON schema without breaking existing functionality.
- **Clarity and Precision:** The explicit definition of geometry and constraints removes the ambiguity of the current manual process.
- **Decoupling:** The separation of parameters and geometry makes the system more modular and easier to maintain.
- **Foundation for Complexity:** This strategy provides a solid foundation for generating much more complex and detailed crate designs in the future.

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\README.md

# AutoCrate - NX CAD Expression Generator

<!-- GitHub Actions Test - CI/CD Pipeline Active -->

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

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\SUGGESTIONS.md

# Project Suggestions

This document provides suggestions for the prompts listed in `TODO.md`.

## High Priority

### Implement a secure user authentication system

- **Recommendation:** Use the `next-auth` library, as it is already a dependency. Start with a `CredentialsProvider` for email and password authentication. You will need a database to store user credentials. For development, you could use a simple solution like SQLite. For production, a more robust database like PostgreSQL would be a better choice.

### Add export functionality (PDF, STL)

- **PDF Export:** Use a library like `jspdf` or `react-pdf` to generate PDF documents. You can create a template that takes the crate design data and renders it into a PDF.
- **STL Export:** Use the `STLExporter` from the Three.js examples to convert your 3D model's geometry into the STL format for 3D printing.

### Create RESTful API endpoints for design persistence

- **Recommendation:** Use Next.js API routes to create your API. You will need endpoints for standard CRUD operations (`CREATE`, `READ`, `UPDATE`, `DELETE`). A database will be required to store the designs. You can start with a simple file-based database or a more scalable solution like MongoDB or PostgreSQL.

## Medium Priority

### Expand material options

- **Recommendation:** Create a configuration file (e.g., `materials.json`) to define the properties of each material (e.g., name, density, color, cost). The UI can then dynamically populate the material selection options from this file.

### Implement design templates and presets

- **Recommendation:** Store a set of predefined crate configurations in a JSON file. The UI can then present these templates to the user as starting points for their own designs.

### Add weight calculation functionality

- **Recommendation:** The weight calculation should be based on the volume of each part of the crate and the density of the selected material. You will need to calculate the volume of each `Box` in your Three.js scene and then use the material density from your configuration file.

### Create a print-friendly Bill of Materials (BOM) export

- **Recommendation:** Similar to the design export, you can create a new PDF template for the BOM. The BOM should include a list of all parts, their dimensions, materials, and calculated weights.

## Low Priority

### Add animation for the crate assembly process

- **Recommendation:** Use an animation library like `framer-motion` or `gsap` to animate the position and rotation of the crate components. You can create a timeline that shows the assembly sequence.

### Implement design sharing functionality

- **Recommendation:** When a user saves a design, generate a unique URL for it. This URL can then be shared, allowing others to view the design. You can also add social sharing buttons.

### Add multi-language support

- **Recommendation:** Use a library like `next-i18next` to manage your translations. You will need to create a separate JSON file for each language with the translations for all UI elements.

### Create mobile-responsive controls for the 3D viewer

- **Recommendation:** Use media queries to create a different layout for the controls on smaller screens. You should also implement touch-based camera controls for a better mobile experience.

## Testing and Bug Fixes

### Fix viewport resize issues

- **Recommendation:** Add an event listener for the `resize` event on the window. In the event handler, you should update the camera's aspect ratio and the renderer's size to match the new dimensions of the viewport.

### Optimize performance for complex crate designs

- **Recommendation:** To improve performance, you can use techniques like instancing to reduce the number of draw calls for repeated geometries (like slats or screws). You can also implement Level of Detail (LOD) to use simpler models when they are far from the camera.

## Documentation

### Create a user guide

- **Recommendation:** Create a new page in your Next.js application for the user guide. This guide should cover all the features of the application and include screenshots and examples.

### Document all API endpoints

- **Recommendation:** Use a tool like Swagger or OpenAPI to document your API. This will generate interactive documentation that will make it easier for developers to understand and use your API.

### Add contribution guidelines

- **Recommendation:** Create a `CONTRIBUTING.md` file in the root of your project. This file should explain how to set up the development environment, the coding standards, and the process for submitting pull requests.

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\TECH_STACK_DISPLAY_PLAN.md

# Plan: Professional Tech Stack Display

This document outlines a product-focused plan to enhance the display of the application's tech stack, moving from a plain text list to a professional, logo-based showcase.

## 1. Product Vision & Goal

**Vision:** The "Powered by" section of our application should reflect the same level of quality and professionalism as the application itself. It should be a visually engaging showcase that builds user confidence and acknowledges the powerful technologies we use.

**Goal:** Replace the current plain text list of technologies with a dynamic, interactive, and visually appealing logo wall.

## 2. Proposed Design & User Experience

### Prompt: Create a `TechStackShowcase.tsx` Component

-   **Goal:** Develop a new, reusable React component to display the tech stack with logos and interactive elements.
-   **Key Features:**
    1.  **Logo Grid:** The component will render a grid of technology logos.
    2.  **Hover Tooltips:** When a user hovers over a logo, a tooltip will appear, displaying the name of the technology. This provides clarity and is an accessibility best practice.
    3.  **Subtle Animations:** On hover, the logos will have a subtle animation effect (e.g., a slight zoom or a transition from grayscale to full color) to make the section feel more dynamic and polished.
    4.  **Responsive Design:** The grid will be responsive, adjusting the number of columns and logo sizes to look great on all screen sizes, from mobile to desktop.

## 3. Asset Sourcing Strategy

**Prompt:** Source high-quality, consistent logos for all technologies in the tech stack.

-   **Recommendation:** To ensure high-quality and consistent logos, use a dedicated icon library.
    -   **Primary Suggestion:** Use the `react-icons` library. It includes icons from many popular sets, including `Devicon` and `Simple Icons`, which are perfect for this use case. This is the most efficient approach as it doesn't require managing individual SVG files.
    -   **Alternative:** If `react-icons` is not suitable, manually source SVG logos from a reputable source like [Simple Icons](https://simpleicons.org/) and add them to the project as components.

## 4. Implementation Plan

### Step 1: Create the `TechStackShowcase.tsx` Component

-   **Action:** Create the new component file.
-   **Props:** The component should accept an array of technology names as a prop (e.g., `technologies=["React", "Next.js", "TypeScript"]`).
-   **Logic:** Inside the component, map over the array and render the corresponding logo icon and tooltip for each technology.

### Step 2: Install and Configure `react-icons`

-   **Action:** Add `react-icons` to the project's dependencies (`npm install react-icons`).

### Step 3: Update the Main UI

-   **Action:** In the main application layout (e.g., in the footer or an "About" section), replace the current text-based tech stack display with the new `<TechStackShowcase />` component.
-   **Data:** Provide the component with the list of technologies used in the project.

## 5. Example User Story

**As a user,** I want to see what technologies the application is built with so that I can appreciate the modern and robust stack behind the product.

**Acceptance Criteria:**

-   When I view the footer or "About" section of the application, I see a grid of logos.
-   When I hover my mouse over a logo, a tooltip appears with the name of the technology.
-   The logo grid looks good on both my desktop and mobile devices.

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\TODO.md

# AutoCrate Standalone Prompts

## Project Overview
Prompt: Define and document the core features and requirements for the AutoCrate project, a web-based crate design tool with 3D visualization, to establish a solid development foundation.

## Testing Strategy - UPDATED
### Testing Framework Stack
- **Unit & Integration**: Vitest + React Testing Library
- **E2E Testing**: Puppeteer with Jest runner
- **Coverage**: Vitest coverage with 80% target
- **Test Organization**: 
  - `/tests/unit/` - Business logic and store tests
  - `/tests/integration/` - Component integration tests
  - `/tests/e2e/` - End-to-end user workflow tests

### Master Script Integration
The `autocrate.bat` script now provides complete testing control:
- **Interactive Menu**: Choose from 6 different test modes
- **Queue System**: Queue multiple test tasks for sequential execution
- **Direct Commands**: Run tests directly via CLI

### Testing Commands via autocrate.bat
```cmd
# Workflow commands
.\autocrate test           # Run all tests
.\autocrate test:unit       # Unit tests only
.\autocrate test:integration # Integration tests only
.\autocrate test:e2e        # E2E tests with Puppeteer
.\autocrate test:coverage   # Generate coverage report
.\autocrate test:watch      # Interactive watch mode

# Queue system for batch testing
.\autocrate queue add       # Add tests to queue
.\autocrate queue run       # Execute queued tests
```

### NPM Scripts (called by autocrate.bat)
- `npm test` - Run all Vitest tests
- `npm run test:unit` - Unit tests only
- `npm run test:integration` - Integration tests only
- `npm run test:coverage` - Coverage with 80% threshold
- `npm run e2e` - Puppeteer E2E tests (headless)
- `npm run e2e:headed` - Puppeteer E2E tests (with browser)
- `npm run e2e:debug` - Debug E2E tests

### E2E Testing with Puppeteer
- **Configuration**: `tests/e2e/puppeteer.config.js`
- **Test Runner**: Jest with custom setup
- **Modes**: Headless, Headed, Debug
- **Coverage**: User workflows, responsive design, 3D rendering

### Testing Workflow
1. **Development**: Use `.\autocrate local` to run dev server + tests
2. **Pre-commit**: Use `.\autocrate prepare` to run all checks
3. **CI/CD**: GitHub Actions runs full test suite on push
4. **Queue System**: Batch multiple test types for efficiency

### Coverage Requirements
- **Target**: 80% for all metrics (lines, functions, branches, statements)
- **Report Location**: `/coverage/` directory
- **Excluded**: test files, configs, type definitions

### Testing Priorities - COMPLETED
1. ✅ E2E test configuration migrated to Puppeteer
2. ✅ Master script enhanced with full testing capabilities
3. ✅ Queue system implemented for batch testing
4. Next: Add more E2E test scenarios
5. Next: Increase unit test coverage for NX generator

## Planning Phase
### High Priority
Prompt: Implement a secure user authentication system for AutoCrate, including login, registration, and session management to protect user data and designs.

Prompt: Add export functionality to AutoCrate for saving and downloading crate designs in common formats like PDF or STL for 3D printing.

Prompt: Create RESTful API endpoints for AutoCrate to handle design persistence, allowing users to save, load, and manage crate designs on the server.

### Medium Priority
Prompt: Expand material options in AutoCrate's crate construction tool, adding new types like metal or composite with associated properties.

Prompt: Implement design templates and presets in AutoCrate to provide users with pre-built crate designs for quick customization.

Prompt: Add weight calculation functionality to AutoCrate based on selected materials and crate dimensions for accurate BOM generation.

Prompt: Create a print-friendly Bill of Materials (BOM) export feature in AutoCrate, formatting the list for easy printing and sharing.

## Development Phase
### Low Priority
Prompt: Add animation for the crate assembly process in AutoCrate's 3D viewer to demonstrate how parts fit together.

Prompt: Implement design sharing functionality in AutoCrate, allowing users to share crate designs via links or social media.

Prompt: Add multi-language support to AutoCrate's interface, including translations for key UI elements and tooltips.

Prompt: Create mobile-responsive controls for AutoCrate's 3D viewer to ensure usability on touch devices and smaller screens.

## Testing and Bug Fixes
Prompt: Fix viewport resize issues in AutoCrate's 3D viewer to maintain aspect ratio and performance on different screen sizes.

Prompt: Optimize performance for complex crate designs in AutoCrate by improving rendering efficiency and reducing load times.

## Documentation
Prompt: Create a user guide for AutoCrate's crate designer, covering basic usage, features, and troubleshooting.

Prompt: Document all API endpoints for AutoCrate, including request/response formats and authentication requirements.

Prompt: Add contribution guidelines for the AutoCrate project, outlining coding standards, pull request processes, and community involvement.

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\VIEW_CONTROLS_PLAN.md

# Plan for Standard View Controls

This document outlines a plan for implementing top, front, and side view options in the 3D viewer, a standard feature in CAD applications.

## 1. UI for View Controls

**Prompt:** Design and implement a user interface for selecting different camera views.

**Plan:**

1.  **Create a `ViewCube` or Control Panel:**
    -   **Option A (ViewCube):** Create a `ViewCube` component that floats in the corner of the 3D viewer. This is a common UI pattern in CAD software where each face of the cube can be clicked to switch to that view.
    -   **Option B (Button Cluster):** Add a cluster of buttons, either as a floating panel or integrated into the main UI, with labels for "Top", "Front", "Side", and "Perspective".
2.  **Iconography:** Use clear and standard icons for each button to make the interface intuitive.
3.  **Active State:** The currently active view button should have a distinct visual style to indicate the camera's current state.

## 2. Camera Manipulation Logic

**Prompt:** Implement the logic to change the camera's position and orientation based on the selected view.

**Plan:**

1.  **Create a Camera Control Function:** Within `CrateViewer3D.tsx`, create a function (e.g., `setCameraView(view)`) that takes the desired view as an argument (`'top'`, `'front'`, `'side'`, `'perspective'`).

2.  **Calculate Target Positions:** This function will calculate the target camera position based on the dimensions of the crate to ensure the entire object is in view. The camera should always look at the center of the crate.

    -   **Perspective View:** The default, user-controlled view.
    -   **Top View:** Position the camera directly above the crate (e.g., `[0, distance, 0]`).
    -   **Front View:** Position the camera directly in front of the crate (e.g., `[0, 0, distance]`).
    -   **Side View (Right):** Position the camera to the right of the crate (e.g., `[distance, 0, 0]`).

3.  **State Management:** Add a new state to the `useCrateStore` (e.g., `cameraView: string`) to keep track of the current view mode.

## 3. Smooth Camera Transitions

**Prompt:** Animate the camera's movement between views to create a smooth and professional user experience.

**Plan:**

1.  **Use an Animation Library:** Instead of instantly changing the camera's position, use a library like `framer-motion-3d` or `react-spring` to animate the transition.
2.  **Animate Camera Properties:** Animate the `position` and `quaternion` (for rotation) of the camera from its current state to the target state over a short duration (e.g., 0.5 seconds).

## 4. Orthographic Projection for True 2D Views

**Prompt:** For the top, front, and side views, use an orthographic camera to provide a true, non-distorted 2D projection, which is standard for engineering drawings.

**Plan:**

1.  **Switch Camera Types:** The application will need to be able to switch between a `PerspectiveCamera` (for the 3D view) and an `OrthographicCamera` (for the 2D views).
2.  **Conditional Camera Rendering:** In `CrateViewer3D.tsx`, conditionally render either the `PerspectiveCamera` or the `OrthographicCamera` based on the `cameraView` state from the `useCrateStore`.
3.  **Configure Orthographic Camera:** When switching to an orthographic view, you will need to configure the camera's `left`, `right`, `top`, `bottom`, `near`, and `far` properties to match the dimensions of the crate. This will ensure that the crate is properly framed in the view.

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\docs\CRITICAL-FILES.md

# AutoCrate Critical Files Documentation

This document tracks the critical files in the AutoCrate codebase that are essential for making any changes. Understanding these files and their relationships will help you identify what gets affected when making modifications.

## File Categories by Impact Level

### 🔴 CRITICAL - Core System Files
**Changes to these files affect the entire application**

| File | Purpose | Change Impact | Dependencies |
|------|---------|---------------|-------------|
| `package.json` | Project dependencies, scripts, version | Breaking changes, deployment issues | All npm dependencies |
| `tsconfig.json` | TypeScript compilation settings | Type checking, build process | All TypeScript files |
| `next.config.js` | Next.js framework configuration | Routing, building, performance | Entire Next.js app |
| `src/app/layout.tsx` | Root HTML layout and metadata | Site-wide UI, SEO, theming | All pages and components |
| `src/types/crate.ts` | Core type definitions | Type safety across entire app | All stores, services, components |

### 🟠 HIGH IMPACT - Core Application Logic
**Changes to these files affect major application features**

| File | Purpose | Change Impact | Dependencies |
|------|---------|---------------|-------------|
| `src/store/crate-store.ts` | Main application state management | Configuration data, UI updates | InputForms, OutputSection, 3D viewer |
| `src/services/nx-generator.ts` | NX CAD expression generation | Output generation, export functionality | CrateConfiguration types |
| `src/app/page.tsx` | Main desktop homepage | Overall UI layout and behavior | All major components |
| `src/app/mobile-layout.tsx` | Mobile-specific layout wrapper | Mobile user experience | Mobile components |
| `src/components/CrateViewer3D.tsx` | 3D visualization engine | Visual representation | Three.js, React Three Fiber |

### 🟡 MEDIUM IMPACT - Feature Components
**Changes to these files affect specific features**

| File | Purpose | Change Impact | Dependencies |
|------|---------|---------------|-------------|
| `src/components/InputForms.tsx` | User input interface | Data entry, form validation | crate-store, UI components |
| `src/components/OutputSection.tsx` | Results display and export with NX guides | Output presentation, file downloads, NX instructions | nx-generator, stores, NX guide components |
| `src/components/NXInstructions.tsx` | Step-by-step NX CAD implementation guide | User guidance for CAD workflow | OutputSection integration |
| `src/components/NXVisualGuide.tsx` | Visual coordinate system and construction guide | Interactive visual CAD reference | OutputSection integration |
| `src/components/LogsSection.tsx` | System logging with hydration-safe rendering | Debug information, user feedback | logs-store, client-only timestamps |
| `src/store/theme-store.ts` | Theme/dark mode management | Visual theming across app | All components with dark mode |
| `src/store/logs-store.ts` | System logging functionality | Debug information, user feedback | Components that log actions |
| `src/utils/skid-calculations.ts` | Automated crate sizing logic | Skid dimension calculations | crate-store updates |
| `src/utils/format-inches.ts` | Inch dimension formatting utility | Consistent dimension display | Input/output components |

### 🟢 LOW IMPACT - Configuration & Styling
**Changes to these files have localized effects**

| File | Purpose | Change Impact | Dependencies |
|------|---------|---------------|-------------|
| `tailwind.config.ts` | Styling framework configuration | Visual appearance, CSS classes | All styled components |
| `vercel.json` | Deployment and hosting settings | Production deployment behavior | Build process |
| `src/app/globals.css` | Global CSS styles | Site-wide styling | All components |
| `src/lib/utils.ts` | Utility functions | Helper functions for components | Components using utilities |

## Component Relationships

### State Flow
```
User Input → InputForms → crate-store → CrateViewer3D
                     ↓
                OutputSection ← nx-generator
```

### Mobile Layout Structure
```
mobile-layout.tsx → MobileWrapper → SwipeableCard → BottomNavigation
```

### Theme System
```
theme-store → All Components (via isDarkMode)
           → HTML class manipulation
```

## Critical Change Scenarios

### 🚨 When changing core types (`src/types/crate.ts`):
**Files that will need updates:**
- `src/store/crate-store.ts` - State interface changes
- `src/services/nx-generator.ts` - Type usage in generation
- `src/components/InputForms.tsx` - Form field types
- `src/components/OutputSection.tsx` - Display logic
- `src/utils/skid-calculations.ts` - Calculation parameters

### 🚨 When adding new configuration options:
**Files that will need updates:**
1. `src/types/crate.ts` - Add to CrateConfiguration interface
2. `src/store/crate-store.ts` - Add to state and update functions
3. `src/components/InputForms.tsx` - Add input controls
4. `src/services/nx-generator.ts` - Include in NX expression generation
5. `src/components/CrateViewer3D.tsx` - Update 3D visualization if needed

### 🚨 When modifying the 3D visualization:
**Files that might need updates:**
- `src/components/CrateViewer3D.tsx` - Main 3D component
- `package.json` - If adding new Three.js dependencies
- `src/store/crate-store.ts` - If visualization needs new state data

### 🚨 When changing mobile layout:
**Files that will need updates:**
- `src/app/mobile-layout.tsx` - Layout structure
- `src/components/mobile/*.tsx` - Mobile-specific components
- `src/app/page.tsx` - Mobile detection logic
- Responsive CSS in components

## Build & Deployment Dependencies

### Critical Build Files
- `package.json` - Dependencies and build scripts
- `next.config.js` - Build configuration
- `tsconfig.json` - TypeScript compilation
- `tailwind.config.ts` - CSS generation
- `vercel.json` - Production deployment settings

### Environment Variables (vercel.json)
- `NEXT_PUBLIC_APP_NAME` - Application name
- `NEXT_PUBLIC_APP_VERSION` - Version display
- `NEXT_PUBLIC_API_URL` - API endpoint configuration

## Testing Impact

### When making changes, test these areas:
1. **Configuration Changes**: Verify all input forms work correctly
2. **Type Changes**: Run `npm run type-check` to ensure type safety
3. **3D Visualization**: Test crate rendering with various configurations
4. **Mobile Layout**: Test responsive behavior on different screen sizes
5. **Export Functionality**: Verify NX expression generation works
6. **NX Guide Components**: Test Instructions and Visual Guide tabs
7. **Theme System**: Test dark/light mode switching
8. **Logging System**: Test hydration-safe timestamp rendering
9. **Build Process**: Run `npm run build` before deployment

## Version Control Notes

### Files to monitor for unintended changes:
- `package-lock.json` - Can be regenerated unexpectedly
- `.next/` directory - Generated build files (not tracked)
- `node_modules/` - Dependencies (not tracked)
- Auto-generated files from scripts

### Critical commit patterns:
- Always test locally before committing changes to core files
- Changes to `src/types/crate.ts` require comprehensive testing (unit system now fixed to inches)
- State store changes should be tested with various configurations
- Mobile layout changes need testing across device sizes
- LogsSection changes need hydration safety verification
- NX guide component changes need CAD workflow validation

---

**Last Updated**: Updated with recent architectural changes (NX guides, unit system, hydration fixes)
**Version**: 2.2.0
**Recent Changes**: Added NX instruction components, fixed unit system to inches, implemented hydration-safe logging
**Note**: This document should be updated when major architectural changes are made to the codebase.

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\docs\DEPLOYMENT.md

# AutoCrate Deployment Guide

## Overview

AutoCrate is deployed using Vercel for hosting and GitHub Actions for CI/CD. This guide covers the complete deployment process.

## Prerequisites

- Node.js 18+ and npm
- Git installed and configured
- GitHub account
- Vercel account (free tier works)
- GitHub CLI (optional but recommended)

## Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/Shivam-Bhardwaj/AutoCrate.git
cd AutoCrate
npm install

# 2. Run tests
npm run test:all

# 3. Build locally
npm run build

# 4. Deploy to Vercel
npm run deploy
```

## Detailed Deployment Steps

### 1. Initial Setup

#### Install Dependencies
```bash
npm install
npm run prepare  # Setup git hooks
```

#### Configure Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_APP_NAME=AutoCrate
NEXT_PUBLIC_APP_VERSION=2.1.0
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. GitHub Repository Setup

#### Automatic Setup (Recommended)
```bash
chmod +x setup-github.sh
./setup-github.sh
```

#### Manual Setup
```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/Shivam-Bhardwaj/AutoCrate.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Vercel Deployment

#### First-Time Setup

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy: Yes
   - Scope: Your account
   - Link to existing project: No (first time)
   - Project name: autocrate
   - Directory: ./
   - Override settings: No

4. **Production Deployment**
   ```bash
   vercel --prod
   ```

#### Subsequent Deployments

```bash
# Preview deployment
npm run deploy:preview

# Production deployment
npm run deploy

# Build and deploy
npm run deploy:build
```

### 4. GitHub Actions CI/CD Setup

#### Required Secrets

Add these secrets in GitHub repository settings:

1. Go to: `Settings → Secrets and variables → Actions`
2. Add the following secrets:

| Secret Name | How to Get It |
|------------|---------------|
| `VERCEL_TOKEN` | [Vercel Dashboard → Account → Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Run `vercel info` in project root |
| `VERCEL_PROJECT_ID` | Run `vercel info` in project root |
| `CODECOV_TOKEN` | (Optional) From [codecov.io](https://codecov.io) |

#### Workflow Files

The CI/CD pipeline is configured in `.github/workflows/ci.yml` and includes:

- **Linting & Formatting**: ESLint, Prettier, TypeScript checks
- **Testing**: Unit, Integration, E2E tests with coverage
- **Consistency Checks**: Accessibility, Security, Design system
- **Build Verification**: Production build test
- **Deployment**: Automatic deployment on push to main

### 5. Environment Configuration

#### Development
```bash
# .env.local
NEXT_PUBLIC_APP_NAME=AutoCrate Dev
NEXT_PUBLIC_APP_VERSION=dev
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Production (Vercel)
Set in Vercel Dashboard → Project Settings → Environment Variables:

```env
NEXT_PUBLIC_APP_NAME=AutoCrate
NEXT_PUBLIC_APP_VERSION=2.1.0
NEXT_PUBLIC_API_URL=$VERCEL_URL
NODE_ENV=production
```

### 6. Domain Configuration

#### Custom Domain Setup

1. **In Vercel Dashboard**:
   - Go to Project → Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **DNS Settings** (example for autocrate.com):
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

3. **SSL Certificate**: Automatically provisioned by Vercel

### 7. Monitoring & Analytics

#### Vercel Analytics
Automatically included, view in Vercel dashboard

#### Error Tracking (Optional)
Add Sentry for error tracking:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

#### Performance Monitoring
- Lighthouse CI in GitHub Actions
- Web Vitals in Vercel Analytics
- Custom metrics with Google Analytics

### 8. Deployment Checklist

Before deploying to production:

- [ ] Run all tests: `npm run test:all`
- [ ] Check code quality: `npm run check:all`
- [ ] Run consistency checkers: `./autocrate.sh` (option 8)
- [ ] Update version in `package.json`
- [ ] Update CHANGELOG.md
- [ ] Test mobile responsiveness
- [ ] Verify environment variables
- [ ] Check security headers
- [ ] Test in multiple browsers
- [ ] Validate accessibility

### 9. Rollback Procedures

#### Vercel Rollback
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]

# Or use Vercel dashboard for visual rollback
```

#### Git Rollback
```bash
# Revert last commit
git revert HEAD
git push

# Reset to specific commit
git reset --hard [commit-hash]
git push --force
```

### 10. Troubleshooting

#### Build Failures

1. **Clear cache**:
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Check Node version**:
   ```bash
   node --version  # Should be 18+
   ```

3. **Verify environment variables**:
   ```bash
   vercel env pull
   ```

#### Deployment Issues

1. **Vercel CLI issues**:
   ```bash
   vercel logout
   vercel login
   vercel --force
   ```

2. **GitHub Actions failures**:
   - Check secrets are correctly set
   - Review workflow logs
   - Verify branch protection rules

#### Performance Issues

1. **Bundle size**:
   ```bash
   npm run analyze
   ```

2. **Lighthouse audit**:
   ```bash
   npm run lighthouse
   ```

### 11. Security Considerations

#### Headers Configuration
Security headers are configured in `vercel.json`:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

#### Environment Variables
- Never commit `.env.local`
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Store sensitive data in Vercel environment variables

#### Dependency Updates
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### 12. Scaling Considerations

#### Performance Optimization
- Image optimization with Next.js Image
- Code splitting and lazy loading
- API route caching
- Static generation where possible

#### Traffic Handling
- Vercel automatically scales
- Consider rate limiting for API routes
- Implement caching strategies
- Use CDN for static assets

## Support

For deployment issues:
1. Check [Vercel Status](https://www.vercel-status.com/)
2. Review [GitHub Actions logs](https://github.com/Shivam-Bhardwaj/AutoCrate/actions)
3. Open an issue on [GitHub](https://github.com/Shivam-Bhardwaj/AutoCrate/issues)
4. Contact support team

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [AutoCrate README](../README.md)

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\docs\STANDARDS.md

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

#### Color Contrast
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum
- Use design tokens with tested ratios

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

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\docs\TECHNICAL_GUIDE.md

# AutoCrate Technical Guide

## Architecture Overview

AutoCrate is built using a modern React-based architecture with real-time 3D rendering capabilities and parametric CAD generation.

### Core Technologies

- **Next.js 14**: Server-side rendering and routing
- **React 18**: Component-based UI architecture  
- **TypeScript**: Type safety and better developer experience
- **Three.js/React Three Fiber**: 3D visualization engine
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first styling

## Component Architecture

### 1. Input Forms Component
Located in `src/components/InputForms.tsx`

Handles all user input for crate configuration:
- Dimension inputs with unit conversion
- Material selection dropdowns
- Panel configuration tabs
- Fastener and vinyl options

### 2. 3D Viewer Component
Located in `src/components/CrateViewer3D.tsx`

Provides real-time 3D visualization:
- Dynamic mesh generation based on configuration
- OrbitControls for camera manipulation
- Material textures and transparency
- Grid helper for spatial reference

### 3. Output Section Component
Located in `src/components/OutputSection.tsx`

Displays generated NX expressions and summaries:
- Syntax-highlighted code display
- Bill of materials calculation
- Export functionality
- Cost estimation

## State Management

### Zustand Store Structure
Located in `src/store/crate-store.ts`

```typescript
interface CrateStore {
  configuration: CrateConfiguration;
  updateDimensions: (dimensions) => void;
  updateBase: (base) => void;
  updatePanel: (panelKey, panel) => void;
  updateFasteners: (fasteners) => void;
  updateVinyl: (vinyl) => void;
  updateWeight: (weight) => void;
  updateProjectName: (name) => void;
  resetConfiguration: () => void;
}
```

## NX Expression Generation

### Generator Service
Located in `src/services/nx-generator.ts`

The NX expression generator creates parametric CAD code through several steps:

1. **Variable Declaration**: Converts configuration to NX parameters
2. **Feature Generation**: Creates BLOCK commands for each component
3. **Constraint Application**: Adds structural and weight constraints
4. **Pattern Creation**: Generates fastener and ventilation patterns
5. **Export Formatting**: Produces NX-compatible expression syntax

### Expression Syntax

```
// Parameters
p0 = 1200 // Length (mm)
p1 = 1000 // Width (mm)
p2 = 1000 // Height (mm)

// Feature Creation
BLOCK/CREATE_BASE
  HEIGHT = p13
  WIDTH = p1
  LENGTH = p0
  POSITION = (0, p10, 0)
END_BLOCK
```

## 3D Rendering Pipeline

### Mesh Generation Process

1. **Dimension Scaling**: Converts user units to Three.js world units
2. **Geometry Creation**: Generates BoxGeometry for each panel
3. **Material Application**: Applies wood textures and transparency
4. **Scene Composition**: Assembles all components in 3D space
5. **Lighting Setup**: Ambient and directional lights for realism

### Performance Optimization

- Geometry instancing for repeated elements
- Level-of-detail (LOD) for complex models
- Efficient material reuse
- Viewport culling for off-screen elements

## Data Flow

```
User Input → Zustand Store → Components → NX Generator
     ↓            ↓              ↓            ↓
  Validation   3D Update    UI Update    Expression
```

## Type System

### Core Types
Located in `src/types/crate.ts`

- `CrateDimensions`: Length, width, height with units
- `ShippingBase`: Skid and floorboard configuration
- `CrateCap`: Five-panel system specifications
- `Fasteners`: Connector types and spacing
- `VinylConfig`: Protective coating options
- `NXExpression`: Generated CAD code structure

## Build and Deployment

### Development Build
```bash
npm run dev
# Starts development server on http://localhost:3000
# Hot module replacement enabled
# Source maps for debugging
```

### Production Build
```bash
npm run build
# Optimizes bundles
# Minifies code
# Generates static assets
```

### Deployment to Vercel
```bash
vercel --prod
# Automatic deployment
# Environment variables configured
# CDN distribution
```

## Performance Metrics

- **Initial Load**: < 2 seconds
- **3D Render**: 60 FPS target
- **Expression Generation**: < 100ms
- **Bundle Size**: ~500KB gzipped

## Security Considerations

- Input validation on all user entries
- XSS protection through React
- CORS headers configured
- Authentication ready (OAuth integration points)

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- WebGL 2.0 required for 3D rendering

## API Endpoints (Future)

Prepared for backend integration:
- `POST /api/crates` - Save configuration
- `GET /api/crates/:id` - Load configuration
- `POST /api/export` - Generate NX file
- `GET /api/materials` - Material database

## Testing Strategy

### Unit Tests
- Component rendering tests
- Store action tests
- NX generator logic tests

### Integration Tests
- Form submission flow
- 3D viewer interactions
- Export functionality

### E2E Tests
- Complete user workflows
- Cross-browser testing
- Performance benchmarks

## Troubleshooting

### Common Issues

1. **3D Viewer Not Loading**
   - Check WebGL support
   - Clear browser cache
   - Update graphics drivers

2. **Expression Generation Errors**
   - Validate input ranges
   - Check for special characters
   - Verify unit consistency

3. **Performance Issues**
   - Reduce model complexity
   - Enable hardware acceleration
   - Close other browser tabs

## Future Enhancements

- Cloud storage for projects
- Collaborative editing
- Advanced materials database
- FEA integration for structural analysis
- AR/VR visualization
- Multi-language support
- API for third-party integration

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\docs\TESTING.md

# AutoCrate Testing Documentation

## Overview

AutoCrate implements a comprehensive multi-layered testing strategy to ensure code quality, reliability, and maintainability. The testing architecture covers unit tests, integration tests, component tests, and end-to-end tests.

## Testing Stack

- **Vitest**: Fast unit and integration testing framework
- **React Testing Library**: Component testing with user-centric approach
- **Playwright**: Cross-browser end-to-end testing
- **MSW (Mock Service Worker)**: API mocking for consistent test environments
- **Coverage**: Comprehensive code coverage reporting with c8

## Test Structure

```
tests/
├── unit/                 # Unit tests for services and utilities
│   ├── nx-generator.test.ts
│   └── crate-store.test.ts
├── integration/          # Integration tests for components
│   └── components/
│       └── InputForms.test.tsx
├── e2e/                  # End-to-end tests
│   └── crate-configuration.spec.ts
├── fixtures/             # Test data and fixtures
├── mocks/                # API mocks and handlers
│   ├── handlers.ts
│   └── server.ts
├── utils/                # Testing utilities
│   ├── test-utils.tsx
│   └── three-helpers.ts
└── setup.ts              # Test environment setup
```

## Running Tests

### Quick Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Open Vitest UI
npm run test:ui

# Run E2E tests
npm run e2e

# Run E2E tests with browser visible
npm run e2e:headed

# Debug E2E tests
npm run e2e:debug

# View E2E test report
npm run e2e:report
```

### Test Coverage

Generate and view test coverage reports:

```bash
npm run test:coverage
```

Coverage thresholds are configured at:
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

## Writing Tests

### Unit Tests

Unit tests focus on individual functions and services in isolation.

```typescript
// tests/unit/nx-generator.test.ts
import { describe, it, expect } from 'vitest';
import { NXExpressionGenerator } from '@/services/nx-generator';

describe('NXExpressionGenerator', () => {
  it('should generate valid NX expression', () => {
    const generator = new NXExpressionGenerator(mockConfig);
    const expression = generator.generateExpression();
    
    expect(expression).toContain('# NX Expression File');
    expect(expression).toContain('crate_length = 1200');
  });
});
```

### Component Tests

Component tests verify React components render correctly and handle user interactions.

```typescript
// tests/integration/components/Button.test.tsx
import { render, screen, fireEvent } from '@/tests/utils/test-utils';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### E2E Tests

End-to-end tests verify complete user workflows.

```typescript
// tests/e2e/crate-configuration.spec.ts
import { test, expect } from '@playwright/test';

test('should configure and generate NX expression', async ({ page }) => {
  await page.goto('/');
  
  // Configure dimensions
  await page.fill('[aria-label="Length"]', '1500');
  await page.fill('[aria-label="Width"]', '1000');
  
  // Generate expression
  await page.click('text=NX Expression');
  await expect(page.locator('text=crate_length = 1500')).toBeVisible();
});
```

## Testing Three.js Components

Special utilities are provided for testing Three.js components:

```typescript
import { createTestScene, expectMeshDimensions } from '@/tests/utils/three-helpers';

describe('3D Crate Rendering', () => {
  it('should create crate with correct dimensions', () => {
    const { scene } = createTestScene();
    const crate = createCrateMesh({ length: 10, width: 8, height: 6 });
    
    scene.add(crate);
    expectMeshDimensions(crate, { length: 10, width: 8, height: 6 });
  });
});
```

## API Mocking

Use MSW for consistent API responses in tests:

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/crate/save', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'crate-123',
      ...body,
    });
  }),
];
```

## Test Utilities

### Custom Render

Use the custom render function for components that need providers:

```typescript
import { renderWithProviders } from '@/tests/utils/test-utils';

test('renders with store provider', () => {
  renderWithProviders(<MyComponent />);
});
```

### Mock Data Generators

Create consistent test data:

```typescript
import { createMockCrateConfiguration } from '@/tests/utils/test-utils';

const mockConfig = createMockCrateConfiguration();
// Customize specific fields
const customConfig = createPartialCrateConfiguration({
  dimensions: { length: 2000, width: 1500, height: 1000, unit: 'mm' }
});
```

## CI/CD Integration

Tests run automatically in GitHub Actions:

1. **On Pull Requests**: All tests run to verify changes
2. **On Main Branch**: Tests run with coverage reporting
3. **Matrix Testing**: Tests run on Node.js 18.x and 20.x

### CI Pipeline Stages

1. **Linting & Type Checking**
2. **Unit Tests**
3. **Integration Tests**
4. **Coverage Generation**
5. **Build Verification**
6. **E2E Tests**

## Best Practices

### 1. Test Organization

- Keep tests close to the code they test
- Use descriptive test names
- Group related tests using `describe` blocks
- Follow AAA pattern: Arrange, Act, Assert

### 2. Test Data

- Use factories for creating test data
- Keep test data minimal and focused
- Avoid hardcoding values when possible

### 3. Async Testing

- Always await async operations
- Use `waitFor` for elements that appear asynchronously
- Set appropriate timeouts for long-running operations

### 4. Mocking

- Mock external dependencies
- Keep mocks simple and focused
- Update mocks when APIs change

### 5. E2E Testing

- Test critical user paths
- Use data-testid attributes for reliable element selection
- Run E2E tests against production builds

## Debugging Tests

### Vitest Debugging

```bash
# Run tests with Node inspector
node --inspect-brk ./node_modules/.bin/vitest run

# Use Vitest UI for visual debugging
npm run test:ui
```

### Playwright Debugging

```bash
# Debug mode with Playwright Inspector
npm run e2e:debug

# Generate trace for failed tests
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### VS Code Integration

Add this configuration to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Performance Testing

### Benchmarking

Monitor test performance to identify slow tests:

```typescript
import { bench, describe } from 'vitest';

describe('Performance', () => {
  bench('NX generation', () => {
    const generator = new NXExpressionGenerator(config);
    generator.generateExpression();
  });
});
```

### Load Testing

For E2E performance testing:

```typescript
test('should handle rapid dimension changes', async ({ page }) => {
  await page.goto('/');
  
  // Rapidly update dimensions
  for (let i = 0; i < 10; i++) {
    await page.fill('[aria-label="Length"]', String(1000 + i * 100));
  }
  
  // Verify application remains responsive
  await expect(page.locator('canvas')).toBeVisible();
});
```

## Troubleshooting

### Common Issues

1. **WebGL Context in Tests**
   - Solution: Mock WebGL context is automatically provided in setup.ts

2. **Async State Updates**
   - Solution: Use `waitFor` or `act` for state updates

3. **File Downloads in E2E**
   - Solution: Configure download handling in Playwright config

4. **Flaky Tests**
   - Solution: Increase timeouts, add proper wait conditions

### Getting Help

- Check test output for detailed error messages
- Review test logs in CI/CD pipeline
- Use `--reporter=verbose` for detailed test output
- Enable debug logging with `DEBUG=*` environment variable

## Contributing

When adding new features:

1. Write tests before implementing features (TDD)
2. Ensure all tests pass locally
3. Add integration tests for new components
4. Add E2E tests for new user workflows
5. Maintain or improve code coverage
6. Update this documentation for new testing patterns

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Testing Three.js Applications](https://threejs.org/docs/#manual/en/introduction/Testing)

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\docs\USER_MANUAL.md

# AutoCrate User Manual

## Table of Contents
1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Creating Your First Crate](#creating-your-first-crate)
4. [Advanced Features](#advanced-features)
5. [Exporting to NX CAD](#exporting-to-nx-cad)
6. [Tips and Best Practices](#tips-and-best-practices)

## Getting Started

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- WebGL support for 3D visualization
- Minimum screen resolution: 1280x720

### Accessing AutoCrate
1. Navigate to https://autocrate.vercel.app/
2. The application loads automatically
3. No installation required

## Interface Overview

### Main Layout Sections

#### 1. Input Section (Left Panel)
- Project name field
- Configuration tabs
- Parameter inputs
- Material selections

#### 2. 3D Rendering (Center)
- Real-time 3D preview
- Interactive camera controls
- Grid reference system
- Component visualization

#### 3. Output Section (Right Panel)
- NX expression code
- Summary information
- Bill of materials
- Export controls

#### 4. Login Section (Bottom Center - when not logged in)
- Authentication options
- Account management

## Creating Your First Crate

### Step 1: Project Setup
1. Enter a project name in the input section
2. This name will be used for file exports

### Step 2: Define Dimensions
1. Click the "Dimensions" tab
2. Enter crate measurements:
   - **Length**: Distance along X-axis
   - **Width**: Distance along Z-axis  
   - **Height**: Distance along Y-axis
3. Select unit system (mm or inches)
4. Specify weights:
   - **Product Weight**: Weight of contents
   - **Max Gross Weight**: Total capacity

### Step 3: Configure Base
1. Click the "Base" tab
2. Select base type:
   - **Standard**: General purpose
   - **Heavy-Duty**: Reinforced for heavy loads
   - **Export Grade**: International shipping compliant
3. Set parameters:
   - **Floorboard Thickness**: Base panel thickness
   - **Skid Height**: Clearance for forklift access
   - **Skid Width**: Support beam width
   - **Number of Skids**: Typically 2-4
4. Choose material (Pine, Oak, Plywood, OSB)

### Step 4: Design Panels
1. Click the "Panels" tab
2. Configure each panel individually:
   - **Thickness**: Panel material thickness
   - **Material**: Wood type selection
   - **Reinforcement**: Toggle for extra strength
   - **Ventilation**: Enable air circulation holes
3. Repeat for all five panels (Top, Front, Back, Left, Right)

### Step 5: Select Fasteners
1. Click the "Fasteners" tab
2. Choose fastener type:
   - **Klimp Connectors**: Quick assembly
   - **Nails**: Traditional fastening
   - **Screws**: Removable option
   - **Bolts**: Heavy-duty connection
3. Set specifications:
   - **Size**: Fastener dimensions
   - **Spacing**: Distance between fasteners
   - **Material**: Steel, Stainless, or Galvanized

### Step 6: Add Vinyl (Optional)
1. Click the "Vinyl" tab
2. Toggle "Enable Vinyl Wrapping"
3. Select vinyl type:
   - **Waterproof**: Moisture protection
   - **Vapor Barrier**: Humidity control
   - **Cushion**: Impact protection
4. Configure:
   - **Thickness**: Vinyl sheet thickness
   - **Coverage**: Full or partial wrapping

## Advanced Features

### 3D Viewer Controls
- **Rotate**: Left-click and drag
- **Zoom**: Scroll wheel or pinch
- **Pan**: Right-click and drag
- **Reset View**: Double-click

### Real-time Updates
- Changes instantly reflect in 3D view
- Automatic recalculation of materials
- Dynamic cost estimation

### Configuration Templates
Save common configurations:
1. Configure crate parameters
2. Use "New Project" to reset
3. Reapply saved settings

## Exporting to NX CAD

### Generating Expression File
1. Review configuration in Output Section
2. Check the NX Expression tab
3. Verify code syntax
4. Click "Download" button

### File Format
- Extension: `.exp`
- Encoding: UTF-8
- Compatible with NX 10.0+

### Importing to Siemens NX
1. Open Siemens NX
2. Navigate to Tools → Expressions
3. Select "Import from File"
4. Choose the downloaded `.exp` file
5. Apply expressions to model

### Expression Structure
```
// Parameters section
p0 = 1200 // Length
p1 = 1000 // Width
p2 = 1000 // Height

// Features section
BLOCK/CREATE_BASE
  HEIGHT = p13
  WIDTH = p1
  LENGTH = p0
END_BLOCK
```

## Tips and Best Practices

### Design Guidelines

#### Dimensional Considerations
- Maintain aspect ratios for stability
- Allow 10-15% clearance for contents
- Consider forklift entry points (min 100mm skid height)

#### Material Selection
- **Pine**: Cost-effective for light loads
- **Oak**: Durable for heavy items
- **Plywood**: Smooth surface, consistent strength
- **OSB**: Budget option for dry conditions

#### Structural Integrity
- Use reinforcement for panels > 2000mm
- Increase thickness for heavy loads
- Add center skids for lengths > 2400mm

### Weight Distribution
- Center heavy items
- Use adequate skid count
- Consider dynamic loading during transport

### Ventilation Planning
- Required for organic materials
- Prevents moisture buildup
- Follow ISPM-15 standards

### Cost Optimization
- Standardize dimensions when possible
- Use common material thicknesses
- Minimize custom fastener requirements
- Consider reusability for return logistics

### Common Configurations

#### Small Parts Crate
- Dimensions: 600 x 400 x 400 mm
- Base: Standard with 2 skids
- Panels: 12mm plywood
- Fasteners: Nails at 150mm spacing

#### Heavy Machinery Crate
- Dimensions: 2400 x 1800 x 1800 mm
- Base: Heavy-duty with 4 skids
- Panels: 18mm OSB with reinforcement
- Fasteners: Bolts at 200mm spacing

#### Export Shipping Crate
- Dimensions: 1200 x 1000 x 1000 mm
- Base: Export grade with 3 skids
- Panels: 15mm treated plywood
- Vinyl: Full waterproof coverage

## Troubleshooting

### 3D Viewer Issues
- **Black screen**: Enable WebGL in browser
- **Slow performance**: Reduce browser tabs
- **Missing textures**: Clear cache and reload

### Export Problems
- **Download fails**: Check popup blocker
- **Invalid expression**: Verify all inputs
- **Import errors in NX**: Check NX version compatibility

### Input Validation
- **Red fields**: Value out of valid range
- **Warnings**: Non-optimal configurations
- **Locked options**: Dependencies not met

## Keyboard Shortcuts
- `Ctrl/Cmd + S`: Download expression
- `Ctrl/Cmd + C`: Copy code
- `Ctrl/Cmd + N`: New project
- `Space`: Reset 3D view

## Support Resources
- Technical documentation: `/docs`
- Video tutorials: Coming soon
- Contact: engineering@company.com

## Glossary

- **Expression**: Parametric code for NX CAD
- **Skid**: Base support beam for forklift access
- **Panel**: Flat surface component of crate
- **Klimp**: Metal corner connector system
- **ISPM-15**: International wood packaging standard
- **Bill of Materials (BOM)**: Component list with quantities

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\docs\emails\01-initial-thread.md

# Initial AutoCrate Communication Thread

**Subject:** AutoCrate Updates - Official Communication Thread

**To:** [Recipients]

**Body:**

Hello Team,

This email thread will serve as the official communication channel for all AutoCrate project updates, including:

- Feature releases and version updates
- Changelog summaries
- Upcoming tasks and TODO items
- Important project milestones

All future updates regarding AutoCrate will be sent as replies to this thread to maintain a clear communication history.

Please save this thread for reference.

Best regards,
[Your Name]

---

**Project Links:**
- Repository: https://github.com/Shivam-Bhardwaj/AutoCrate
- Live Site: [Your deployment URL]

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\docs\emails\02-update-template.md

# AutoCrate Update Email Template

**Subject:** Re: AutoCrate Updates - Official Communication Thread

**Body:**

Hello Team,

Here's the latest update for AutoCrate:

## Recent Changes

[INSERT_CHANGELOG_SECTION]

## TODO Items

### High Priority
- [ ] Item 1
- [ ] Item 2

### Medium Priority
- [ ] Item 3
- [ ] Item 4

### Low Priority
- [ ] Item 5

## Next Sprint Focus

[Brief description of upcoming work]

## Notes

[Any additional context or important information]

Best regards,
[Your Name]

---

*Generated from CHANGELOG.md on [DATE]*

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\docs\emails\STAKEHOLDER_UPDATES.md

# Stakeholder Update Tracker

Track all feature updates sent to stakeholders and their feedback.

## Email Log

| Date | Feature | Recipients | Feedback Due | Status | Notes |
|------|---------|------------|--------------|--------|-------|
| [Date] | [Feature Name] | [Client/Team] | [Due Date] | [Sent/Draft] | [Link to email] |

## Feedback Summary

### Feature: [Name]
**Date:** [Date]
**Responses:** [X/Y recipients]

**Key Feedback:**
- [Stakeholder 1]: [Summary]
- [Stakeholder 2]: [Summary]

**Action Items:**
- [ ] [Action item 1]
- [ ] [Action item 2]

---

## Quick Links
- [Feature Update Template](./feature-update-template.md)
- [Current Release Notes](../../CHANGELOG.md)

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\docs\emails\example-3d-visualization-update.md

# Example Email: 3D Visualization Feature

**Subject:** AutoCrate Update: Interactive 3D Crate Visualization - September 3, 2025

---

## What's New
We've launched interactive 3D visualization that lets you see your shipping crate designs in real-time before manufacturing.

## Key Changes
- Real-time 3D preview of crate designs
- Rotate, zoom, and pan controls
- Instant updates when changing dimensions
- Material texture visualization
- Export-ready for CAD systems

## How It Works
Simply input your crate dimensions and specifications in the configuration panel. The 3D model updates instantly, showing exactly how your crate will look with selected materials and fasteners.

## Your Feedback Needed
Please let us know:
1. Does this feature meet your needs?
2. Any issues or concerns?
3. Suggestions for improvement?

**Reply to this email with your feedback by September 10, 2025**

---
Best regards,
[Your Name]
AutoCrate Team

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\docs\emails\feature-update-template.md

# Feature Update Email Template

**Subject:** AutoCrate Update: [Feature Name] - [Date]

---

## What's New
[Brief 1-2 sentence description of the feature]

## Key Changes
- [Change 1]
- [Change 2]
- [Change 3]

## How It Works
[Simple explanation in 2-3 sentences max]

## Your Feedback Needed
Please let us know:
1. Does this feature meet your needs?
2. Any issues or concerns?
3. Suggestions for improvement?

**Reply to this email with your feedback by [Date]**

---
Best regards,
[Your Name]
AutoCrate Team

---

# C:\Users\Curio\OneDrive\Desktop\SbT\AutoCrate\docs\index.md

---