# AutoCrate Master Plan & Task List

## 1. Project Charter & Vision

### 1.1. What is AutoCrate?
AutoCrate is a professional, mobile-first web application for designing industrial shipping crates. Its primary purpose is to empower engineers, CAD technicians, and manufacturing teams to rapidly create and validate crate designs.

### 1.2. Primary Goal
The core objective is to generate parametric CAD models compatible with Siemens NX. The application bridges the gap between a simple web-based configuration and a complex, manufacturing-ready CAD model.

### 1.3. Core User Flow
The user experience is centered around a simple, three-step process:
1.  **Configure Crate:** The user inputs dimensions, weight, and material specifications through an intuitive UI.
2.  **Visualize in 3D:** The application provides a real-time, interactive 3D rendering of the crate, allowing for immediate visual validation.
3.  **Generate NX Expressions:** The system generates a file that can be used to create the crate geometry in Siemens NX.

---

## 2. The Block-Based Paradigm (CRITICAL STRATEGIC SHIFT)

**This is the most important concept for the current phase of development.**

### 2.1. The "Whole New World" Mandate
Per your feedback, we are fundamentally changing the approach to NX generation. The previous method of generating detailed, feature-based instructions was too complex and brittle.

**The new paradigm: Everything is a cuboid (a block).**

The web visualization, which renders simple blocks, must **perfectly** match the output for NX, which will also be a simple list of blocks. This creates a "whole new world" in NX that is a direct, 1:1 representation of what the user sees on the web.

### 2.2. Why This Shift?
-   **Radical Simplicity:** Generating a list of blocks is vastly simpler and more robust than generating a complex script of geometric features and constraints.
-   **Guaranteed Parity:** It ensures that what the user sees in the web viewer is exactly what they will get in the CAD model, eliminating a major source of potential errors.
-   **Automation-Friendly:** A simple list of blocks is trivial for an NX script to parse and construct, enabling full automation of the CAD creation process.

### 2.3. Technical Implementation
-   All crate components—skids, floorboards, panels, and even cleats—will be abstracted into a simple `Block` data structure.
-   A `Block` is defined by two properties:
    1.  `position: [x, y, z]` (a vector for its origin point in 3D space)
    2.  `dimensions: [width, depth, height]` (a vector for its size)
-   The core business logic in `crateCalculations.ts` will be refactored to translate the complex legacy rules into a simple array of these `Block` objects.
-   The `CrateViewer3D.tsx` component will render this array of `Block` objects.
-   The `nx-generator.ts` service will output this array of `Block` objects, likely in a structured JSON format.

---

## 3. Core Principles & Constraints (Non-Negotiable Rules)

### 3.1. World Coordinate System (WCS) - MANDATORY
**This is the absolute reference for all 3D geometry. All calculations and rendering must adhere to this standard.**

-   **System:** Right-Handed, Z-up (standard for engineering CAD).
-   **Origin `[0,0,0]`:** The origin is at the **center of the crate's footprint on the floor**. It is NOT the geometric center of the crate volume.
-   **Floor Level:** The floor is at `Z=0`. The crate sits on top of the floor and extends in the positive Z direction.
-   **Axes:**
    -   **X (Red):** Width (side to side)
    -   **Y (Green):** Depth (front to back)
    -   **Z (Blue):** Height (bottom to top)
-   **Rule:** NEVER use a Y-up coordinate system. This is for graphics and gaming, not engineering.

### 3.2. Development & Deployment Workflow
-   **AI Role:** The AI assistant (Roo) will **ONLY** make local changes. It is forbidden from running `git commit` or `git push`.
-   **Workflow:**
    1.  **Local Development:** The developer (or AI) makes changes and tests them locally using `npm run dev`.
    2.  **Prepare for Production:** The user runs all quality checks (linting, testing, formatting) using `npm run check:all`.
    3.  **Deploy:** The user is responsible for committing and pushing to GitHub. The push to the `main` branch triggers an automatic deployment to Vercel.

### 3.3. Coding Standards
-   **TypeScript:** Strict mode is enabled. **No `any` types.** Use interfaces for object shapes.
-   **React:** Functional components with hooks only. No class components.
-   **Imports:** Must be ordered: React -> Next.js -> External -> Internal (`@/`) -> Relative (`./`).
-   **Styling:** Use Tailwind CSS utility classes and the design tokens defined in `src/styles/design-tokens.ts`. Do not write custom CSS unless absolutely necessary.

---

## 4. Architecture Overview

### 4.1. Tech Stack
-   **Frontend:** Next.js 14, React 18, TypeScript
-   **3D Rendering:** Three.js, React Three Fiber, @react-three/drei
-   **State Management:** Zustand
-   **Styling:** Tailwind CSS
-   **Testing:** Vitest, React Testing Library, Playwright

### 4.2. Data Flow
The application follows a unidirectional data flow, with Zustand as the single source of truth.

`User Input (InputForms.tsx)` -> `Updates Zustand Store (crate-store.ts)` -> `Store triggers re-render of components (CrateViewer3D.tsx, OutputSection.tsx)` -> `OutputSection uses nx-generator.ts to create file from store data`

### 4.3. Key Files & Components
-   `src/store/crate-store.ts`: The heart of the application. Contains the complete crate configuration state.
-   `src/services/crateCalculations.ts`: The brain of the application. Contains the logic to convert the user's configuration into an array of `Block` objects. **This is where the core work of this project will happen.**
-   `src/components/CrateViewer3D.tsx`: The eyes of the application. Renders the array of `Block` objects.
-   `src/components/InputForms.tsx`: The hands of the application. Captures all user input.
-   `src/services/nx-generator.ts`: The mouth of the application. Generates the final output file for NX.

---

## 5. Actionable Implementation Plan

This plan is broken down into standalone tasks. Each task is designed to be executed in a separate terminal with no external context required other than this document.

### Phase 1: Foundational Logic & WCS Alignment

#### Task 1.1: Refactor `crateCalculations.ts` to Integrate Legacy Logic as Blocks
-   **Context:** This is the foundational first step in our block-based paradigm shift. We must translate the complex, rule-based logic from the legacy Python files into a modern TypeScript service that outputs simple block definitions. This service will become the geometric heart of the application.
-   **Technical Brief:** You will port the logic from `legacy_logic/skid_logic.py` and `legacy_logic/floorboard_logic.py`. For example, the `calculate_skid_layout` function determines the number and pitch of skids. Your new TypeScript function, `calculateSkidBlocks`, will perform the same calculation but will return an array of `Block` objects, each with its calculated `position` and `dimensions`.
-   **TERMINAL COMMAND:** `code src/services/crateCalculations.ts legacy_logic/skid_logic.py legacy_logic/floorboard_logic.py`
-   **DETAILED STEPS:**
    1.  Define a `Block` interface in `src/types/crate.ts`: `interface Block { position: [number, number, number]; dimensions: [number, number, number]; }`.
    2.  In `crateCalculations.ts`, create a new function `calculateSkidBlocks` that accepts the crate configuration.
    3.  Implement the logic from `calculate_skid_lumber_properties` and `calculate_skid_layout` to determine the size, count, and spacing of skids.
    4.  Using these calculations, generate and return an array of `Block` objects representing the skids. Remember to respect the WCS (skids run along the Y-axis, positioned across the X-axis).
    5.  Create a new function `calculateFloorboardBlocks`.
    6.  Implement the logic from `calculate_floorboard_layout` to determine the layout of floorboards.
    7.  Generate and return an array of `Block` objects representing the floorboards. They should sit on top of the skids (their Z position will be `skidHeight`).
-   **Acceptance Criteria:** The functions `calculateSkidBlocks` and `calculateFloorboardBlocks` exist, are strongly typed, and correctly return an array of `Block` objects based on the input configuration.

#### Task 1.2: Correct the WCS Origin in `CrateViewer3D.tsx`
-   **Context:** The current 3D viewer may not be correctly positioned according to the mandatory WCS. This task will align the entire 3D scene with the "center of the crate on the floor" origin point, which is critical for all subsequent geometric work.
-   **Technical Brief:** The legacy code (`skid_logic.py`, line 100) defines the origin with an offset: `x_master_skid_origin_offset_in = -crate_overall_width_od_in / 2.0`. This indicates a centered origin. The main `<group>` in `CrateModel` likely needs its position adjusted to `[0, 0, 0]`, and the individual components will then be positioned relative to this true center (e.g., from `-width/2` to `+width/2`).
-   **TERMINAL COMMAND:** `code src/components/CrateViewer3D.tsx CRITICAL_GEOMETRY.md`
-   **DETAILED STEPS:**
    1.  In `CrateViewer3D.tsx`, locate the main `<group>` that wraps the entire `CrateModel`.
    2.  Ensure its position is `[0, 0, 0]`. Remove any offsets like `[-length / 2, -width / 2, 0]`.
    3.  Modify the positioning logic for all child components (skids, floorboards, panels) so they are placed symmetrically around the `[0, 0, 0]` origin. For example, a panel on the left side should be at `x = -width / 2`.
    4.  Ensure the `CoordinateAxes` helper is rendered at `[0, 0, 0]` to make the origin clear.
-   **Acceptance Criteria:** The rendered crate is visually centered on the coordinate axes in the viewer, with the floor of the crate sitting on the Z=0 plane.

### Phase 2: Panel & Cleat Implementation as Blocks

#### Task 2.1: Implement Panel Splicing Logic as Blocks
-   **Context:** To adhere to manufacturing constraints, plywood panels cannot exceed a standard size (e.g., 96"x48"). This task implements the logic to split oversized panels into multiple smaller panels, represented as separate blocks.
-   **Technical Brief:** The logic for this is in `legacy_logic/front_panel_logic.py` in the `calculate_horizontal_splice_positions` function. This function determines the optimal orientation of plywood sheets and where to place splices. You will port this logic to a new `calculatePanelBlocks` function that returns an array of `Block` objects for a single panel assembly.
-   **TERMINAL COMMAND:** `code src/services/crateCalculations.ts legacy_logic/front_panel_logic.py`
-   **DETAILED STEPS:**
    1.  In `crateCalculations.ts`, create a function `calculatePanelBlocks(width, height)`.
    2.  Port the logic from `calculate_horizontal_splice_positions` to determine if a panel of the given `width` and `height` needs to be spliced.
    3.  If no splicing is needed, return an array with a single `Block` object for the panel.
    4.  If splicing is needed, calculate the dimensions and positions of the multiple smaller panel pieces.
    5.  Return an array of `Block` objects, one for each piece of the spliced panel.
-   **Acceptance Criteria:** The `calculatePanelBlocks` function correctly returns one block for small panels and multiple, correctly positioned blocks for panels that exceed the 96"x48" constraint.

#### Task 2.2: Implement Cleat Logic as Blocks
-   **Context:** Cleats provide structural reinforcement. In our block-based paradigm, each cleat will be represented as its own simple block. This task implements the logic to calculate the position and dimensions of all required cleats.
-   **Technical Brief:** The cleat logic is also in `front_panel_logic.py`. It defines rules for placing cleats on all outer borders, at every splice, and at regular intervals (e.g., every 24 inches). You will create a `calculateCleatBlocks` function that takes a panel (or an array of panel blocks) and returns an array of all the `Block` objects for the required cleats.
-   **TERMINAL COMMAND:** `code src/services/crateCalculations.ts legacy_logic/front_panel_logic.py`
-   **DETAILED STEPS:**
    1.  In `crateCalculations.ts`, create a function `calculateCleatBlocks` that accepts the dimensions of a panel assembly.
    2.  **Border Cleats:** Calculate the dimensions and positions for the four cleats around the perimeter of the panel.
    3.  **Intermediate Cleats:** Implement the logic to add vertical cleats every 24 inches.
    4.  **Splice Cleats:** Implement the logic to add cleats wherever a horizontal or vertical splice occurs.
    5.  Return a single array of `Block` objects containing all the calculated cleats for that panel.
-   **Acceptance Criteria:** The `calculateCleatBlocks` function returns a complete array of `Block` objects for all cleats required for a given panel size, according to the legacy rules.

### Phase 3: Visualization & Testing

#### Task 3.1: Integrate All Blocks into `CrateViewer3D.tsx`
-   **Context:** Now that the calculation services can generate all the necessary blocks, we need to update the 3D viewer to render the complete crate assembly.
-   **Technical Brief:** You will modify the `CrateModel` component to call the new calculation functions (`calculateSkidBlocks`, `calculateFloorboardBlocks`, `calculatePanelBlocks`, `calculateCleatBlocks`) and then use a single loop to render every `Block` object returned.
-   **TERMINAL COMMAND:** `code src/components/CrateViewer3D.tsx src/services/crateCalculations.ts`
-   **DETAILED STEPS:**
    1.  In `CrateModel`, create a memoized calculation that generates all blocks for the entire crate.
    2.  Start by calling `calculateSkidBlocks` and `calculateFloorboardBlocks`.
    3.  Then, for each of the five panels (front, back, left, right, top), call `calculatePanelBlocks` and `calculateCleatBlocks`.
    4.  Combine all the returned `Block` arrays into a single master array of blocks.
    5.  Remove the old, separate rendering logic for skids, floorboards, and panels.
    6.  Create a single `.map()` loop that iterates over the master block array and renders a `<Box>` for each `Block` object, using its `position` and `dimensions` properties.
-   **Acceptance Criteria:** The 3D viewer correctly renders a complete crate, including skids, floorboards, spliced panels, and all cleats, by dynamically rendering the master array of blocks.

#### Task 4.1: Develop Unit Tests for Block Calculations
-   **Context:** To ensure the geometric logic is correct and robust, we must create unit tests for our new block calculation services.
-   **Technical Brief:** Using Vitest, you will create a new test file for `crateCalculations.ts`. You will write test cases for various crate configurations (small, large, requiring splices) and assert that the returned arrays of `Block` objects have the correct number of blocks with the correct positions and dimensions.
-   **TERMINAL COMMAND:** `code tests/unit/crateCalculations.test.ts src/services/crateCalculations.ts`
-   **DETAILED STEPS:**
    1.  Create the new test file: `tests/unit/crateCalculations.test.ts`.
    2.  Write a test suite for `calculateSkidBlocks`. Test different weights and widths.
    3.  Write a test suite for `calculateFloorboardBlocks`.
    4.  Write a test suite for `calculatePanelBlocks`. Include cases that do and do not require splicing.
    5.  Write a test suite for `calculateCleatBlocks`. Test various panel sizes to ensure the correct number of intermediate cleats are generated.
    6.  Use `expect(result).toEqual([...])` to compare the output with a known-correct array of `Block` objects.
-   **Acceptance Criteria:** A comprehensive suite of unit tests exists for all the block calculation functions, and all tests pass.

---

## 6. CRITICAL FIXES NEEDED FOR DEPLOYMENT

### 6.1. ESLint Errors (BLOCKING DEPLOYMENT)
These React unescaped entity errors prevent build:
- CoGConfiguration.tsx: Lines 72, 124, 128, 132, 188, 194, 200 - Replace quotes with &quot; or &apos;
- CrateViewer3D.tsx: Line 203 - Replace quotes with &quot;
- HeaderRailConfig.tsx: Lines 149, 175, 182, 207, 245, 262, 268 - Replace quotes with &quot;

### 6.2. Unused Variables (Must prefix with underscore)
- AirShipmentOptimization.tsx: Line 37 (p), Line 73 (dimensions)
- AMATComplianceSection.tsx: Line 17 (p)
- CrateViewer3D.tsx: Line 23 (explodeFactor)
- InputForms.tsx: Lines 16-18 (unused imports)
- All unused imports in store/crate-store.ts and types files

### 6.3. TypeScript 'any' Types
- Replace all 'any' types with proper types in:
  - AirShipmentOptimization.tsx
  - AMATComplianceSection.tsx
  - ChamferedPanel.tsx
  - ChamferedTopPanel.tsx

### 6.4. Test Failures
- Integration tests: 5 failing Air Shipment tests
- E2E tests: All 5 failing due to timeouts

## 7. Logic Review, Potential Bugs, & Test Scenarios

This section provides a deeper analysis of the implemented logic, highlighting potential areas for bugs, identifying edge cases, and suggesting specific test scenarios to ensure robustness.

### 6.1. Analysis of `calculateSkidBlocks`

-   **Core Logic:** This function translates product weight into skid dimensions and count. The logic is a direct port from a series of `if/elif/else` statements in the legacy Python code.
-   **Potential Bug Source:** The boundaries of the weight categories are a critical failure point. An off-by-one error (e.g., using `<` instead of `<=`) could result in incorrectly sized skids for products at the boundary weights (e.g., exactly 501 lbs or 4500 lbs).
-   **Edge Cases:**
    -   **Zero or Negative Weight:** The current logic does not handle this. While the input validation should prevent it, the function itself could be made more robust.
    -   **Extremely High Weight:** The logic defaults to 8x8 skids for anything over 40,001 lbs. Is there an upper limit?
    -   **Very Narrow Crates:** If `crateWidth` is less than `skidActualWidthIn`, the `spanForSkidsCenterlines` becomes negative. The logic correctly defaults to 2 skids, but this is a good scenario to test.
-   **Specific Test Scenarios:**
    1.  **Boundary Weight Test:** Create a test case with a product weight of exactly 4500 lbs. The expected result is 4x4 skids. Then, test with 4501 lbs, which should result in 4x6 skids.
    2.  **Narrow Crate Test:** Test with a `crateWidth` of 3 inches. The function should still return 2 skids, positioned at the edges.
    3.  **Minimum Skid Count Test:** Test a configuration that would mathematically result in fewer than 2 skids (e.g., a very light product in a narrow crate). The function should always enforce a minimum of 2 skids.

### 6.2. Analysis of `calculateFloorboardBlocks` (Simplified)

-   **Core Logic:** The current implementation is a placeholder that creates a single, solid block for the floor.
-   **Potential Bug Source:** The primary risk here is that this simplified version is used in production without being replaced by the detailed, greedy algorithm from the legacy code. This is less of a bug and more of an **implementation risk**.
-   **Edge Cases:**
    -   This simplified version has no real edge cases, as it's just creating one block. The complexity will arise when the real logic is implemented.
-   **Specific Test Scenarios:**
    1.  **Placeholder Verification:** The unit test for this should simply confirm that it returns exactly one `Block` object with dimensions matching the crate's width and length.
    2.  **Future Implementation Note:** When the full logic is ported, test cases will be needed for:
        -   Crates that can be perfectly filled with standard lumber.
        -   Crates that result in a custom-width board.
        -   Crates that result in a gap instead of a custom board.

### 6.3. Analysis of WCS Correction in `CrateViewer3D.tsx`

-   **Core Logic:** The main `<group>` was moved to `[0, 0, 0]`, and all child components are now rendered with positions relative to this centered origin.
-   **Potential Bug Source:** The most likely source of bugs would be if any component's positioning logic was not correctly updated to account for the new centered origin. For example, if a panel was previously positioned at `x = 0` (the left edge), it now needs to be positioned at `x = -width / 2`.
-   **Edge Cases:**
    -   **Asymmetrical Components:** If any future components are not symmetrical, their positioning logic will need careful handling to be correct relative to the center.
    -   **Exploded View:** The logic for the exploded view will need to be updated to push components away from the new `[0, 0, 0]` center, not a corner.
-   **Specific Test Scenarios:**
    1.  **Symmetry Test:** In an integration test, get the bounding box of the fully rendered crate. The center of the bounding box should be very close to `[0, 0, crateHeight / 2]`.
    2.  **Component Position Test:** Write a test that programmatically checks the final calculated position of a specific, known block (e.g., the leftmost skid). Its `x` position should be `-crateWidth / 2 + skidWidth / 2`.

### 6.4. General Recommendations
-   **Input Validation:** While there is a `validateCrateConfiguration` function, the calculation functions themselves should be robust enough to handle unexpected inputs gracefully (e.g., return an empty array or throw a specific error) rather than crashing.
-   **Constants:** The magic numbers for plywood dimensions (`96`, `48`) and cleat spacing (`24`) should be extracted into the `src/lib/constants.ts` file to be shared across the application.