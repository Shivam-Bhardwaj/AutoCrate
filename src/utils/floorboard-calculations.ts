import { CrateDimensions } from '@/types/crate';
import { SkidConfiguration } from './skid-calculations';

// Standard nominal lumber widths (actual dimensions in inches)
const STANDARD_LUMBER_WIDTHS = {
  '2x4': 3.5, // Nominal 4" = 3.5" actual
  '2x6': 5.5, // Nominal 6" = 5.5" actual
  '2x8': 7.25, // Nominal 8" = 7.25" actual
  '2x10': 9.25, // Nominal 10" = 9.25" actual
  '2x12': 11.25, // Nominal 12" = 11.25" actual
};

// Minimum and maximum widths per ISPM-15
const MIN_FLOORBOARD_WIDTH = 2.5; // inches
const MAX_FLOORBOARD_WIDTH = 11.25; // inches
const MIN_NARROW_BOARD_WIDTH = 2.0; // Only one board allowed to be this narrow

export interface Floorboard {
  width: number; // Actual width in inches
  nominalSize: string; // e.g., "2x6"
  position: number; // Position from left edge (0-based)
  isNarrowBoard: boolean; // True if this is the single allowed narrow board
}

export interface NailPattern {
  rows: number; // Number of nail rows per board
  nailsPerSkid: number; // Number of nails per skid intersection
  totalNails: number; // Total nails for this board
  spacing: number; // Spacing between nails in inches
  edgeDistance: number; // Distance from edge in inches (min 0.75")
}

export interface FloorboardConfiguration {
  floorboards: Floorboard[];
  totalBoards: number;
  hasNarrowBoard: boolean;
  narrowBoardWidth?: number;
  nailPatterns: Map<number, NailPattern>; // Key is board position
  totalNails: number;
  floorboardThickness: number; // Always 2" nominal (1.5" actual)
  warnings: string[];
  errors: string[];
}

/**
 * Calculate the optimal floorboard layout for a given crate width
 * Following ISPM-15 requirements:
 * - All boards perpendicular to skids
 * - Only one board < 2.5" wide allowed
 * - All other boards between 5.5" and 11.25" wide
 * - No splicing allowed (continuous boards only)
 * @param crateWidth Width of the crate in inches
 * @returns Array of floorboard specifications
 */
export function calculateFloorboardLayout(crateWidth: number): Floorboard[] {
  const floorboards: Floorboard[] = [];
  let remainingWidth = crateWidth;
  let position = 0;
  let hasNarrowBoard = false;

  // First, try to use standard lumber sizes without any narrow boards
  const standardWidths = Object.entries(STANDARD_LUMBER_WIDTHS)
    .filter(([_, width]) => width >= MIN_FLOORBOARD_WIDTH && width <= MAX_FLOORBOARD_WIDTH)
    .sort(([_, a], [__, b]) => b - a); // Sort largest to smallest

  // Try different combinations of standard boards
  const bestLayout = findOptimalLayout(crateWidth, standardWidths);

  if (bestLayout.length > 0) {
    return bestLayout;
  }

  // If we can't get an exact fit with standard sizes, we need to include one narrow board
  // Calculate the narrow board width needed
  while (remainingWidth > 0) {
    let boardAdded = false;

    // Try to fit standard boards
    for (const [nominal, actualWidth] of standardWidths) {
      if (remainingWidth >= actualWidth) {
        floorboards.push({
          width: actualWidth,
          nominalSize: nominal,
          position,
          isNarrowBoard: false,
        });
        remainingWidth -= actualWidth;
        position++;
        boardAdded = true;
        break;
      }
    }

    if (!boardAdded) {
      // Need a narrow board for the remaining width
      if (hasNarrowBoard) {
        // Already have a narrow board, this is an error
        throw new Error(
          `Cannot fit floorboards: would require multiple narrow boards (remaining: ${remainingWidth}"`
        );
      }

      // Check if remaining width is acceptable for a narrow board
      if (remainingWidth < MIN_NARROW_BOARD_WIDTH) {
        throw new Error(
          `Remaining width ${remainingWidth}" is less than minimum 2" for narrow board`
        );
      }

      if (remainingWidth >= MIN_FLOORBOARD_WIDTH) {
        // This can be a regular board
        floorboards.push({
          width: remainingWidth,
          nominalSize: 'custom',
          position,
          isNarrowBoard: false,
        });
      } else {
        // This is our one allowed narrow board
        floorboards.push({
          width: remainingWidth,
          nominalSize: 'custom-narrow',
          position,
          isNarrowBoard: true,
        });
        hasNarrowBoard = true;
      }
      remainingWidth = 0;
      position++;
    }
  }

  return floorboards;
}

/**
 * Find the optimal layout using standard lumber sizes
 */
function findOptimalLayout(
  targetWidth: number,
  standardWidths: Array<[string, number]>
): Floorboard[] {
  const tolerance = 0.125; // 1/8" tolerance for flush ends

  // Try all combinations of standard boards
  const result: Floorboard[] = [];

  function tryFit(remaining: number, position: number): boolean {
    if (Math.abs(remaining) <= tolerance) {
      return true; // Found a perfect fit
    }

    if (remaining < MIN_NARROW_BOARD_WIDTH - tolerance) {
      return false; // Can't fit any more boards
    }

    for (const [nominal, width] of standardWidths) {
      if (width <= remaining + tolerance) {
        result.push({
          width: Math.min(width, remaining), // Don't exceed remaining space
          nominalSize: nominal,
          position,
          isNarrowBoard: false,
        });

        if (tryFit(remaining - width, position + 1)) {
          return true;
        }

        result.pop(); // Backtrack
      }
    }

    return false;
  }

  if (tryFit(targetWidth, 0)) {
    return result;
  }

  return [];
}

/**
 * Calculate nail pattern for a floorboard based on its width and skid configuration
 * ISPM-15 Requirements:
 * - Minimum 10d (3") nails
 * - At least 0.75" from edges
 * - Staggered pattern
 * - For 4x4 and 4x6 skids: specific patterns
 * - For wider skids: 3 rows of nails
 */
export function calculateNailPattern(
  boardWidth: number,
  skidWidth: number,
  skidCount: number
): NailPattern {
  const MIN_EDGE_DISTANCE = 0.75; // inches
  let rows: number;
  let nailsPerSkid: number;

  // Determine number of nail rows based on skid width
  if (skidWidth <= 4) {
    // 4x4 skids: 2 rows for boards >= 5.5", 1 row for narrower
    rows = boardWidth >= 5.5 ? 2 : 1;
    nailsPerSkid = rows;
  } else if (skidWidth === 6) {
    // 4x6 skids: 2-3 rows depending on board width
    if (boardWidth < 5.5) {
      rows = 1;
    } else if (boardWidth < 9.25) {
      rows = 2;
    } else {
      rows = 3;
    }
    nailsPerSkid = rows;
  } else {
    // Wider skids (6x6, 8x8): always 3 rows
    rows = 3;
    nailsPerSkid = 3;
  }

  // Calculate nail spacing within the board width
  let spacing: number;
  if (rows === 1) {
    spacing = boardWidth / 2; // Center line
  } else {
    // Space nails evenly with minimum edge distance
    const usableWidth = boardWidth - 2 * MIN_EDGE_DISTANCE;
    spacing = usableWidth / (rows - 1);
  }

  const totalNails = nailsPerSkid * skidCount;

  return {
    rows,
    nailsPerSkid,
    totalNails,
    spacing,
    edgeDistance: MIN_EDGE_DISTANCE,
  };
}

/**
 * Calculate complete floorboard configuration including layout and nailing
 */
export function calculateFloorboardConfiguration(
  crateDimensions: CrateDimensions,
  skidConfig: SkidConfiguration
): FloorboardConfiguration {
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    // Calculate floorboard layout
    const floorboards = calculateFloorboardLayout(crateDimensions.width);

    // Check for narrow board
    const narrowBoards = floorboards.filter((b) => b.isNarrowBoard);
    const hasNarrowBoard = narrowBoards.length > 0;

    if (hasNarrowBoard && narrowBoards.length > 1) {
      errors.push(`Multiple narrow boards detected (${narrowBoards.length}). Only one is allowed.`);
    }

    // Calculate nail patterns for each board
    const nailPatterns = new Map<number, NailPattern>();
    let totalNails = 0;

    for (const board of floorboards) {
      const pattern = calculateNailPattern(
        board.width,
        skidConfig.dimensions.width,
        skidConfig.count
      );
      nailPatterns.set(board.position, pattern);
      totalNails += pattern.totalNails;
    }

    // Add warnings for any non-standard conditions
    if (hasNarrowBoard) {
      const narrowBoard = narrowBoards[0];
      warnings.push(
        `Using one narrow board (${narrowBoard.width.toFixed(2)}") to achieve proper fit. ` +
          `This is allowed per ISPM-15 (only one board < 2.5" permitted).`
      );
    }

    // Check floorboard end flush with outer skids (1/8" tolerance)
    const totalBoardWidth = floorboards.reduce((sum, b) => sum + b.width, 0);
    const widthDifference = Math.abs(totalBoardWidth - crateDimensions.width);
    if (widthDifference > 0.125) {
      warnings.push(
        `Floorboard total width (${totalBoardWidth.toFixed(2)}") differs from crate width ` +
          `(${crateDimensions.width}") by ${widthDifference.toFixed(3)}". Adjustment may be needed.`
      );
    }

    // Verify minimum gap requirements (max 1/4" between boards)
    // In our calculation, boards are butted together, so gap = 0

    return {
      floorboards,
      totalBoards: floorboards.length,
      hasNarrowBoard,
      narrowBoardWidth: hasNarrowBoard ? narrowBoards[0].width : undefined,
      nailPatterns,
      totalNails,
      floorboardThickness: 1.5, // 2" nominal = 1.5" actual
      warnings,
      errors,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error calculating floorboards');

    return {
      floorboards: [],
      totalBoards: 0,
      hasNarrowBoard: false,
      nailPatterns: new Map(),
      totalNails: 0,
      floorboardThickness: 1.5,
      warnings,
      errors,
    };
  }
}

/**
 * Validate floorboard configuration against ISPM-15 requirements
 */
export function validateFloorboardConfiguration(
  config: FloorboardConfiguration,
  crateDimensions: CrateDimensions
): string[] {
  const errors: string[] = [];

  // Check that all boards are perpendicular to skids (implicit in our design)

  // Check narrow board rule
  const narrowBoards = config.floorboards.filter((b) => b.width < MIN_FLOORBOARD_WIDTH);
  if (narrowBoards.length > 1) {
    errors.push(
      `Only one floorboard can be less than ${MIN_FLOORBOARD_WIDTH}" wide. Found ${narrowBoards.length}.`
    );
  }

  // Check board width ranges
  for (const board of config.floorboards) {
    if (!board.isNarrowBoard) {
      if (board.width < MIN_FLOORBOARD_WIDTH || board.width > MAX_FLOORBOARD_WIDTH) {
        errors.push(
          `Floorboard at position ${board.position} has invalid width ${board.width.toFixed(2)}". ` +
            `Must be between ${MIN_FLOORBOARD_WIDTH}" and ${MAX_FLOORBOARD_WIDTH}".`
        );
      }
    } else {
      if (board.width < MIN_NARROW_BOARD_WIDTH) {
        errors.push(
          `Narrow floorboard width ${board.width.toFixed(2)}" is less than minimum ${MIN_NARROW_BOARD_WIDTH}".`
        );
      }
    }
  }

  // Check total width coverage
  const totalWidth = config.floorboards.reduce((sum, b) => sum + b.width, 0);
  const tolerance = 0.125; // 1/8" tolerance
  if (Math.abs(totalWidth - crateDimensions.width) > tolerance) {
    errors.push(
      `Floorboard total width ${totalWidth.toFixed(2)}" does not match crate width ${crateDimensions.width}" ` +
        `(tolerance: ${tolerance}").`
    );
  }

  // Check nail patterns
  config.nailPatterns.forEach((pattern, position) => {
    if (pattern.edgeDistance < 0.75) {
      errors.push(
        `Nail pattern for board ${position} has insufficient edge distance ` +
          `(${pattern.edgeDistance}" < 0.75" minimum).`
      );
    }
  });

  return errors;
}

/**
 * Get nail specifications for BOM
 */
export function getNailSpecifications(): {
  type: string;
  size: string;
  length: number;
  pennyWeight: string;
} {
  return {
    type: 'Common Nail',
    size: '10d',
    length: 3.0, // inches
    pennyWeight: '10d',
  };
}

/**
 * Calculate lumber requirements for floorboards
 */
export function calculateFloorboardLumber(
  config: FloorboardConfiguration,
  crateLength: number
): Array<{
  nominalSize: string;
  quantity: number;
  length: number; // in inches
  boardFeet: number;
}> {
  const lumber: Map<
    string,
    {
      quantity: number;
      length: number;
      boardFeet: number;
    }
  > = new Map();

  for (const board of config.floorboards) {
    const key = board.nominalSize;
    const existing = lumber.get(key) || { quantity: 0, length: crateLength, boardFeet: 0 };

    // Calculate board feet: (thickness * width * length) / 144
    // Using nominal 2" thickness for board feet calculation
    const boardFeet = (2 * board.width * crateLength) / 144;

    lumber.set(key, {
      quantity: existing.quantity + 1,
      length: crateLength,
      boardFeet: existing.boardFeet + boardFeet,
    });
  }

  return Array.from(lumber.entries()).map(([nominalSize, data]) => ({
    nominalSize,
    ...data,
  }));
}
