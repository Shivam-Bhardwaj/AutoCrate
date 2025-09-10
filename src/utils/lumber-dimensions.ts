/**
 * Standard lumber dimensions in inches
 * Nominal sizes with actual dimensions
 */

export interface LumberSize {
  nominal: string;
  actual: {
    thickness: number; // Always 1.5" for dimensional lumber
    width: number;     // Actual width varies by nominal size
  };
}

// Standard dimensional lumber sizes (all 1.5" thick when dried)
export const STANDARD_LUMBER: Record<string, LumberSize> = {
  '2x4': {
    nominal: '2x4',
    actual: { thickness: 1.5, width: 3.5 }
  },
  '2x6': {
    nominal: '2x6',
    actual: { thickness: 1.5, width: 5.5 }
  },
  '2x8': {
    nominal: '2x8',
    actual: { thickness: 1.5, width: 7.5 }
  },
  '2x10': {
    nominal: '2x10',
    actual: { thickness: 1.5, width: 9.25 }
  },
  '2x12': {
    nominal: '2x12',
    actual: { thickness: 1.5, width: 11.25 }
  }
};

// Get available lumber sizes sorted by width (largest first)
export const LUMBER_SIZES_DESCENDING = Object.values(STANDARD_LUMBER)
  .sort((a, b) => b.actual.width - a.actual.width);

// Constants for floor construction
export const FLOOR_CONSTANTS = {
  PANEL_THICKNESS: 0.25,  // Plywood panel thickness
  CLEAT_THICKNESS: 0.75,  // Cleat lumber thickness
  EDGE_OFFSET: 1.0,       // Total offset from edges (panel + cleat)
  MAX_GAP: 0.25,          // Maximum gap between boards
  MIN_CUSTOM_WIDTH: 2.5,  // Minimum width for custom plywood fill
  LUMBER_THICKNESS: 1.5   // Standard thickness for all lumber
};

/**
 * Calculate the usable floor area after accounting for edge offsets
 */
export function calculateUsableFloorArea(crateWidth: number, crateDepth: number) {
  const usableWidth = crateWidth - (2 * FLOOR_CONSTANTS.EDGE_OFFSET);
  const usableDepth = crateDepth; // Boards run full depth
  return { usableWidth, usableDepth };
}

/**
 * Find the best lumber size for a given space
 */
export function selectLumberForSpace(remainingWidth: number): LumberSize | null {
  // Try each lumber size from largest to smallest
  for (const lumber of LUMBER_SIZES_DESCENDING) {
    if (lumber.actual.width <= remainingWidth) {
      return lumber;
    }
  }
  return null;
}