import {
  SURFACE_AREA_COEFFICIENT,
  LIGHT_WEIGHT_THRESHOLD,
  MEDIUM_WEIGHT_THRESHOLD,
  HEAVY_WEIGHT_THRESHOLD,
  LIGHT_PANEL_THICKNESS,
  PANEL_THICKNESS,
  HEAVY_PANEL_THICKNESS,
} from '@/lib/constants';
import { CrateConfiguration, Block } from '@/types/crate';

// Crate dimension calculations
export function calculateCrateDimensions(length: number, width: number, height: number) {
  // Validate inputs
  if (length <= 0 || width <= 0 || height <= 0) {
    throw new Error('Dimensions must be positive');
  }

  const volume = length * width * height;
  const surfaceArea =
    SURFACE_AREA_COEFFICIENT * (length * width + width * height + height * length);

  return {
    volume,
    surfaceArea,
    diagonal: Math.sqrt(length * length + width * width + height * height),
  };
}

export function calculatePanelThickness(weight: number) {
  // Calculate panel thickness based on weight
  if (weight < LIGHT_WEIGHT_THRESHOLD) return LIGHT_PANEL_THICKNESS;
  if (weight < MEDIUM_WEIGHT_THRESHOLD) return PANEL_THICKNESS;
  if (weight < HEAVY_WEIGHT_THRESHOLD) return 1.0;
  return HEAVY_PANEL_THICKNESS;
}

export function calculateSkidBlocks(config: CrateConfiguration): Block[] {
  const { dimensions, weight } = config;
  const productWeightLbs = weight.product;

  // 1. Determine Skid Lumber Properties (from legacy_logic/skid_logic.py)
  let skidActualHeightIn: number;
  let skidActualWidthIn: number;
  let maxSkidSpacingRuleIn: number;

  if (productWeightLbs < 501) {
    skidActualHeightIn = 3.5;
    skidActualWidthIn = 2.5;
    maxSkidSpacingRuleIn = 30.0;
  } else if (productWeightLbs <= 4500) {
    skidActualHeightIn = 3.5;
    skidActualWidthIn = 3.5;
    maxSkidSpacingRuleIn = 30.0;
  } else if (productWeightLbs <= 20000) {
    skidActualHeightIn = 3.5;
    skidActualWidthIn = 5.5;
    if (productWeightLbs < 6000) maxSkidSpacingRuleIn = 41.0;
    else if (productWeightLbs <= 12000) maxSkidSpacingRuleIn = 28.0;
    else maxSkidSpacingRuleIn = 24.0;
  } else if (productWeightLbs <= 40000) {
    skidActualHeightIn = 5.5;
    skidActualWidthIn = 5.5;
    if (productWeightLbs <= 30000) maxSkidSpacingRuleIn = 24.0;
    else maxSkidSpacingRuleIn = 20.0;
  } else {
    skidActualHeightIn = 7.5;
    skidActualWidthIn = 7.5;
    maxSkidSpacingRuleIn = 24.0;
  }

  // 2. Calculate Skid Layout (from legacy_logic/skid_logic.py)
  const crateWidth = dimensions.width;
  const spanForSkidsCenterlines = crateWidth - skidActualWidthIn;

  let calcSkidCount: number;
  if (spanForSkidsCenterlines <= 0) {
    calcSkidCount = 2;
  } else {
    const numGaps = Math.ceil(spanForSkidsCenterlines / maxSkidSpacingRuleIn);
    calcSkidCount = (numGaps === 0 ? 1 : numGaps) + 1;
  }
  if (calcSkidCount < 2) calcSkidCount = 2;

  const calcSkidPitchIn =
    calcSkidCount - 1 === 0 ? 0.0 : (crateWidth - skidActualWidthIn) / (calcSkidCount - 1);
  const firstSkidPosX = -crateWidth / 2.0 + skidActualWidthIn / 2.0;

  // 3. Generate Block objects
  const skidBlocks: Block[] = [];
  for (let i = 0; i < calcSkidCount; i++) {
    const xPos = firstSkidPosX + i * calcSkidPitchIn;
    skidBlocks.push({
      position: [xPos, 0, skidActualHeightIn / 2.0],
      dimensions: [skidActualWidthIn, dimensions.length, skidActualHeightIn],
    });
  }

  return skidBlocks;
}

export function calculateFloorboardBlocks(config: CrateConfiguration): Block[] {
  const { dimensions, base } = config;
  const { skidHeight, floorboardThickness } = base;
  const crateWidth = dimensions.width;
  const crateLength = dimensions.length;

  // Simplified logic for now, assuming full floor coverage
  // In the future, this will incorporate the greedy algorithm from legacy_logic/floorboard_logic.py
  const floorboardBlocks: Block[] = [];

  // For now, create a single block representing the entire floor.
  // This will be replaced with the detailed logic from the legacy file later.
  floorboardBlocks.push({
    position: [0, 0, skidHeight + floorboardThickness / 2.0],
    dimensions: [crateWidth, crateLength, floorboardThickness],
  });

  return floorboardBlocks;
}

/**
 * Calculates the Y-positions where horizontal splices occur in the plywood layout.
 * This is a port of the logic from legacy_logic/front_panel_logic.py
 * @param panelWidth Width of the panel in inches
 * @param panelHeight Height of the panel in inches
 * @returns An object containing the Y-coordinates of splices and the orientation used.
 */
function calculateHorizontalSplicePositions(
  panelWidth: number,
  panelHeight: number
): { y: number[]; useRotated: boolean } {
  const MAX_PLYWOOD_WIDTH = 96;
  const MAX_PLYWOOD_HEIGHT = 48;

  // Determine how many sheets needed in each direction for standard orientation
  const sheetsAcross = Math.ceil(panelWidth / MAX_PLYWOOD_WIDTH);
  const sheetsDown = Math.ceil(panelHeight / MAX_PLYWOOD_HEIGHT);

  // Try vertical arrangement (rotate sheets 90 degrees)
  const rotatedSheetsAcross = Math.ceil(panelWidth / MAX_PLYWOOD_HEIGHT);
  const rotatedSheetsDown = Math.ceil(panelHeight / MAX_PLYWOOD_WIDTH);

  // Calculate total sheets needed for each arrangement
  const horizontalPriorityCount = sheetsAcross * sheetsDown;
  const verticalPriorityCount = rotatedSheetsAcross * rotatedSheetsDown;

  // Decide which orientation to use
  let useRotated = false;

  if (verticalPriorityCount < horizontalPriorityCount) {
    useRotated = true;
  } else if (verticalPriorityCount > horizontalPriorityCount) {
    useRotated = false;
  } else {
    // Tie-breaking logic for equal sheet counts
    const standardHSplices = Math.max(0, sheetsDown - 1);
    const rotatedHSplices = Math.max(0, rotatedSheetsDown - 1);

    // Prefer fewer horizontal splices
    if (rotatedHSplices < standardHSplices) {
      useRotated = true;
    } else if (standardHSplices < rotatedHSplices) {
      useRotated = false;
    } else {
      // Still tied - use aspect ratio criteria
      const panelAspectRatio = panelWidth / panelHeight;
      const standardGridAspect = sheetsAcross / sheetsDown;
      const rotatedGridAspect = rotatedSheetsAcross / rotatedSheetsDown;

      const standardAspectDiff = Math.abs(standardGridAspect - panelAspectRatio);
      const rotatedAspectDiff = Math.abs(rotatedGridAspect - panelAspectRatio);

      if (rotatedAspectDiff < standardAspectDiff) {
        useRotated = true;
      } else if (standardAspectDiff < rotatedAspectDiff) {
        useRotated = false;
      } else {
        // Final tie-breaker: prefer more square arrangement
        useRotated = rotatedGridAspect > standardGridAspect;
      }
    }
  }

  const splicePositions: number[] = [];
  if (useRotated) {
    // Use vertical arrangement (rotated sheets) - MAX_PLYWOOD_WIDTH becomes height
    if (rotatedSheetsDown > 1) {
      const totalFullRows = rotatedSheetsDown - 1;
      const remainderHeight = panelHeight - totalFullRows * MAX_PLYWOOD_WIDTH;
      let currentY = remainderHeight;
      for (let row = 1; row < rotatedSheetsDown; row++) {
        splicePositions.push(currentY);
        if (row < rotatedSheetsDown - 1) {
          // Not the last row
          currentY += MAX_PLYWOOD_WIDTH;
        }
      }
    }
  } else {
    // Use horizontal arrangement (standard orientation)
    if (sheetsDown > 1) {
      const totalFullRows = sheetsDown - 1;
      const remainderHeight = panelHeight - totalFullRows * MAX_PLYWOOD_HEIGHT;
      let currentY = remainderHeight;
      for (let row = 1; row < sheetsDown; row++) {
        splicePositions.push(currentY);
        if (row < sheetsDown - 1) {
          // Not the last row
          currentY += MAX_PLYWOOD_HEIGHT;
        }
      }
    }
  }

  return { y: splicePositions, useRotated };
}

export function calculatePanelBlocks(width: number, height: number): Block[] {
  const PANEL_THICKNESS = 0.75;
  const MAX_PLYWOOD_WIDTH = 96;
  const MAX_PLYWOOD_HEIGHT = 48;
  const panelBlocks: Block[] = [];

  const { y: splicePositions, useRotated } = calculateHorizontalSplicePositions(width, height);

  const sheetWidth = useRotated ? MAX_PLYWOOD_HEIGHT : MAX_PLYWOOD_WIDTH;

  const yCuts = [0, ...splicePositions, height];

  for (let i = 0; i < yCuts.length - 1; i++) {
    const yStart = yCuts[i];
    const currentBlockHeight = yCuts[i + 1] - yStart;
    const yPos = yStart + currentBlockHeight / 2 - height / 2;

    let remainingWidth = width;
    let currentX = -width / 2;

    while (remainingWidth > 0) {
      const currentBlockWidth = Math.min(remainingWidth, sheetWidth);
      const xPos = currentX + currentBlockWidth / 2;

      panelBlocks.push({
        position: [xPos, yPos, 0],
        dimensions: [currentBlockWidth, currentBlockHeight, PANEL_THICKNESS],
      });

      currentX += currentBlockWidth;
      remainingWidth -= currentBlockWidth;
    }
  }

  return panelBlocks;
}

export function calculateCleatBlocks(panelWidth: number, panelHeight: number): Block[] {
  const cleatBlocks: Block[] = [];
  const CLEAT_THICKNESS = 1.5;
  const CLEAT_WIDTH = 3.5;
  const TARGET_INTERMEDIATE_CLEAT_SPACING = 24.0;
  const PANEL_THICKNESS = 0.75;

  // 1. Edge Cleats (Border)
  // Top horizontal cleat
  cleatBlocks.push({
    position: [0, panelHeight / 2 - CLEAT_WIDTH / 2, PANEL_THICKNESS / 2],
    dimensions: [panelWidth, CLEAT_WIDTH, CLEAT_THICKNESS],
  });
  // Bottom horizontal cleat
  cleatBlocks.push({
    position: [0, -panelHeight / 2 + CLEAT_WIDTH / 2, PANEL_THICKNESS / 2],
    dimensions: [panelWidth, CLEAT_WIDTH, CLEAT_THICKNESS],
  });

  const verticalCleatHeight = panelHeight - 2 * CLEAT_WIDTH;
  if (verticalCleatHeight > 0) {
    // Left vertical cleat
    cleatBlocks.push({
      position: [-panelWidth / 2 + CLEAT_WIDTH / 2, 0, PANEL_THICKNESS / 2],
      dimensions: [CLEAT_WIDTH, verticalCleatHeight, CLEAT_THICKNESS],
    });
    // Right vertical cleat
    cleatBlocks.push({
      position: [panelWidth / 2 - CLEAT_WIDTH / 2, 0, PANEL_THICKNESS / 2],
      dimensions: [CLEAT_WIDTH, verticalCleatHeight, CLEAT_THICKNESS],
    });
  }

  // 2. Intermediate Vertical Cleats
  const spanForIntermediateCleats = panelWidth - CLEAT_WIDTH;
  if (spanForIntermediateCleats > TARGET_INTERMEDIATE_CLEAT_SPACING) {
    const numGaps = Math.ceil(spanForIntermediateCleats / TARGET_INTERMEDIATE_CLEAT_SPACING);
    const intermediateCleatCount = Math.max(0, numGaps - 1);

    if (intermediateCleatCount > 0) {
      const actualSpacing = spanForIntermediateCleats / numGaps;
      for (let i = 0; i < intermediateCleatCount; i++) {
        const xPos = -panelWidth / 2 + CLEAT_WIDTH / 2 + (i + 1) * actualSpacing;
        cleatBlocks.push({
          position: [xPos, 0, PANEL_THICKNESS / 2],
          dimensions: [CLEAT_WIDTH, verticalCleatHeight, CLEAT_THICKNESS],
        });
      }
    }
  }

  // 3. Splice Cleats (Intermediate Horizontal)
  const { y: splicePositions } = calculateHorizontalSplicePositions(panelWidth, panelHeight);

  const verticalCleatPositions = [-panelWidth / 2 + CLEAT_WIDTH / 2];
  const numGaps = Math.ceil(spanForIntermediateCleats / TARGET_INTERMEDIATE_CLEAT_SPACING);
  const intermediateCleatCount = Math.max(0, numGaps - 1);
  if (intermediateCleatCount > 0) {
    const actualSpacing = spanForIntermediateCleats / numGaps;
    for (let i = 0; i < intermediateCleatCount; i++) {
      verticalCleatPositions.push(-panelWidth / 2 + CLEAT_WIDTH / 2 + (i + 1) * actualSpacing);
    }
  }
  verticalCleatPositions.push(panelWidth / 2 - CLEAT_WIDTH / 2);
  verticalCleatPositions.sort((a, b) => a - b);

  for (const spliceY of splicePositions) {
    const yPos = spliceY - panelHeight / 2;

    for (let i = 0; i < verticalCleatPositions.length - 1; i++) {
      const leftCleatCenter = verticalCleatPositions[i];
      const rightCleatCenter = verticalCleatPositions[i + 1];

      const sectionLeftEdge = leftCleatCenter + CLEAT_WIDTH / 2;
      const sectionRightEdge = rightCleatCenter - CLEAT_WIDTH / 2;

      const sectionWidth = sectionRightEdge - sectionLeftEdge;

      if (sectionWidth > 0) {
        const xPos = sectionLeftEdge + sectionWidth / 2;
        cleatBlocks.push({
          position: [xPos, yPos, PANEL_THICKNESS / 2],
          dimensions: [sectionWidth, CLEAT_WIDTH, CLEAT_THICKNESS],
        });
      }
    }
  }

  return cleatBlocks;
}
