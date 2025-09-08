# Architect Notes for AutoCrate Implementation

This document outlines necessary changes and additions to the codebase that should be implemented by a developer in `code` mode.

## Task 1.1: Floorboard Logic Implementation

### Required Additions to `src/lib/constants.ts`

To correctly implement the floorboard calculation logic from `legacy_logic/floorboard_logic.py`, the following constants must be added to `src/lib/constants.ts`.

```typescript
// ============================================================================
// LUMBER SPECIFICATIONS
// ============================================================================

/** Standard lumber board length in feet */
export const STANDARD_BOARD_LENGTH = 8;

/** Standard screws per lumber piece ratio */
export const SCREWS_PER_LUMBER_PIECE = 10;

/** 
 * Actual widths of standard dimensional lumber in inches.
 * (e.g., a "2x12" is actually 11.25" wide).
 */
export const STANDARD_LUMBER_WIDTHS = [11.25, 9.25, 7.25, 5.5, 3.5, 2.5];

/**
 * The minimum width for a custom-cut floorboard. Any remainder smaller
 * than this will be left as a gap instead of creating a narrow board.
 */
export const MIN_CUSTOM_LUMBER_WIDTH = 2.0;
```

### Implementation Details for `calculateFloorboardBlocks`

The developer should now replace the placeholder logic in `src/services/crateCalculations.ts` with the full greedy algorithm from the legacy Python script, using the newly defined constants.

## Task 2.1: Panel Splicing Logic

### Required Additions to `src/lib/constants.ts`

To properly configure the panel splicing logic, the following constants for standard plywood sheet dimensions must be added to `src/lib/constants.ts`.

```typescript
// ============================================================================
// PLYWOOD SPECIFICATIONS
// ============================================================================

/** Standard width of a plywood sheet in inches. */
export const MAX_PLYWOOD_WIDTH = 96;

/** Standard height of a plywood sheet in inches. */
export const MAX_PLYWOOD_HEIGHT = 48;
```

### Refactoring `calculatePanelBlocks`

The developer should refactor the `calculatePanelBlocks` function in `src/services/crateCalculations.ts` to import and use these new constants instead of the hardcoded values.

## Task 2.2: Cleat Logic Implementation

### Required Additions to `src/lib/constants.ts`

To properly implement the cleat calculation logic, the following constants must be added to `src/lib/constants.ts`.

```typescript
// ============================================================================
// CLEAT SPECIFICATIONS
// ============================================================================

/** Thickness of standard cleat lumber (e.g., 2x4 is 1.5" thick). */
export const CLEAT_THICKNESS = 1.5;

/** Face width of standard cleat lumber (e.g., 2x4 is 3.5" wide). */
export const CLEAT_WIDTH = 3.5;

/** The target center-to-center spacing for intermediate vertical cleats. */
export const TARGET_INTERMEDIATE_CLEAT_SPACING = 24.0;
```

### Implementation Details for `calculateCleatBlocks`

The developer should implement the logic from `calculate_front_panel_components` in the `calculateCleatBlocks` function in `src/services/crateCalculations.ts`. The implementation should include:

1.  **Border Cleats:** Generate the four perimeter cleats (top, bottom, left, right).
2.  **Intermediate Cleats:** Calculate the number and positions of intermediate vertical cleats based on the `TARGET_INTERMEDIATE_CLEAT_SPACING`.
3.  **Splice Cleats:** Determine the positions of any horizontal splices by calling the `calculatePanelBlocks` logic (or a helper function derived from it) and add horizontal cleats at each splice line.
4.  Return a single array of `Block` objects for all generated cleats.

## Task 3.1: Integrate All Blocks into `CrateViewer3D.tsx`

### Refactoring the `CrateModel` Component

The `CrateModel` component in `src/components/CrateViewer3D.tsx` needs to be updated to calculate and position the blocks for all five panels of the crate. The current implementation only calculates a single panel.

The developer should modify the `useMemo` hook that generates `allBlocks` to:

1.  **Calculate Blocks for Each Panel:** Call `calculatePanelBlocks` and `calculateCleatBlocks` for each of the five panels (front, back, left, right, top), using the correct dimensions from the crate configuration.
2.  **Position and Rotate Panels:** Each set of panel and cleat blocks must be translated and rotated to its correct position on the crate. This will involve creating a helper function to apply transformations to an array of blocks.
3.  **Combine All Blocks:** Combine the blocks for the skids, floorboards, and all five panels into a single master array to be rendered.

Here is a conceptual example of the required logic:

```typescript
const allBlocks = useMemo(() => {
  const { length, width, height } = config.dimensions;

  const skidBlocks = calculateSkidBlocks(config);
  const floorboardBlocks = calculateFloorboardBlocks(config);

  // Helper function to transform blocks
  const transformBlocks = (blocks, position, rotation) => {
    // ...logic to apply position and rotation to each block...
    return transformedBlocks;
  };

  // Front Panel
  const frontPanel = calculatePanelBlocks(width, height);
  const frontCleats = calculateCleatBlocks(width, height);
  const frontAssembly = transformBlocks(
    [...frontPanel, ...frontCleats],
    [0, -length / 2, 0], // Position
    [0, 0, 0] // Rotation
  );

  // ... similar logic for back, left, right, and top panels ...

  return [
    ...skidBlocks,
    ...floorboardBlocks,
    ...frontAssembly,
    // ...other assemblies
  ];
}, [config]);
```