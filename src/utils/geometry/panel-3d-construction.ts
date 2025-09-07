import { Block } from '@/types/crate';

/**
 * Panel 3D Construction - Proper 3D positioning for crate panels
 * Following Z-up coordinate system (NX CAD compatible)
 */

const PANEL_THICKNESS = 0.75; // inches
const MAX_PLYWOOD_WIDTH = 96; // inches
const MAX_PLYWOOD_HEIGHT = 48; // inches

interface PanelLayout {
  blocks: Block[];
  useRotated: boolean;
}

/**
 * Calculate optimal plywood layout for a rectangular panel
 */
function calculatePlywoodLayout(panelWidth: number, panelHeight: number): PanelLayout {
  // Determine sheets needed for standard vs rotated orientation
  const standardSheetsAcross = Math.ceil(panelWidth / MAX_PLYWOOD_WIDTH);
  const standardSheetsDown = Math.ceil(panelHeight / MAX_PLYWOOD_HEIGHT);
  const standardTotal = standardSheetsAcross * standardSheetsDown;

  const rotatedSheetsAcross = Math.ceil(panelWidth / MAX_PLYWOOD_HEIGHT);
  const rotatedSheetsDown = Math.ceil(panelHeight / MAX_PLYWOOD_WIDTH);
  const rotatedTotal = rotatedSheetsAcross * rotatedSheetsDown;

  // Choose orientation with fewer sheets
  const useRotated = rotatedTotal < standardTotal;
  const sheetWidth = useRotated ? MAX_PLYWOOD_HEIGHT : MAX_PLYWOOD_WIDTH;
  const sheetHeight = useRotated ? MAX_PLYWOOD_WIDTH : MAX_PLYWOOD_HEIGHT;

  const blocks: Block[] = [];
  let currentY = 0;

  while (currentY < panelHeight) {
    const blockHeight = Math.min(sheetHeight, panelHeight - currentY);
    let currentX = 0;

    while (currentX < panelWidth) {
      const blockWidth = Math.min(sheetWidth, panelWidth - currentX);

      blocks.push({
        position: [
          currentX + blockWidth / 2 - panelWidth / 2,
          currentY + blockHeight / 2 - panelHeight / 2,
          0,
        ],
        dimensions: [blockWidth, blockHeight, PANEL_THICKNESS],
      });

      currentX += blockWidth;
    }
    currentY += blockHeight;
  }

  return { blocks, useRotated };
}

/**
 * Create front panel blocks (positive Y face)
 * Panel stands vertically, normal points in +Y direction
 */
export function createFrontPanelBlocks(
  crateWidth: number,
  crateHeight: number,
  crateLength: number
): Block[] {
  const layout = calculatePlywoodLayout(crateWidth, crateHeight);

  return layout.blocks.map((block) => ({
    position: [
      block.position[0], // X: horizontal position
      crateLength / 2, // Y: at front face
      block.position[1] + crateHeight / 2, // Z: vertical position (2D Y becomes 3D Z)
    ],
    dimensions: [
      block.dimensions[0], // Width in X
      PANEL_THICKNESS, // Thickness in Y
      block.dimensions[1], // Height in Z
    ],
    orientation: 'frontback' as const,
  }));
}

/**
 * Create back panel blocks (negative Y face)
 * Panel stands vertically, normal points in -Y direction
 */
export function createBackPanelBlocks(
  crateWidth: number,
  crateHeight: number,
  crateLength: number
): Block[] {
  const layout = calculatePlywoodLayout(crateWidth, crateHeight);

  return layout.blocks.map((block) => ({
    position: [
      block.position[0], // X: horizontal position
      -crateLength / 2, // Y: at back face
      block.position[1] + crateHeight / 2, // Z: vertical position
    ],
    dimensions: [
      block.dimensions[0], // Width in X
      PANEL_THICKNESS, // Thickness in Y
      block.dimensions[1], // Height in Z
    ],
    orientation: 'frontback' as const,
  }));
}

/**
 * Create left panel blocks (negative X face)
 * Panel stands vertically, normal points in -X direction
 */
export function createLeftPanelBlocks(
  crateWidth: number,
  crateHeight: number,
  crateLength: number
): Block[] {
  const layout = calculatePlywoodLayout(crateLength, crateHeight);

  return layout.blocks.map((block) => ({
    position: [
      -crateWidth / 2, // X: at left face
      block.position[0], // Y: depth position (2D X becomes 3D Y)
      block.position[1] + crateHeight / 2, // Z: vertical position
    ],
    dimensions: [
      PANEL_THICKNESS, // Thickness in X
      block.dimensions[0], // Depth in Y
      block.dimensions[1], // Height in Z
    ],
    orientation: 'leftright' as const,
  }));
}

/**
 * Create right panel blocks (positive X face)
 * Panel stands vertically, normal points in +X direction
 */
export function createRightPanelBlocks(
  crateWidth: number,
  crateHeight: number,
  crateLength: number
): Block[] {
  const layout = calculatePlywoodLayout(crateLength, crateHeight);

  return layout.blocks.map((block) => ({
    position: [
      crateWidth / 2, // X: at right face
      block.position[0], // Y: depth position
      block.position[1] + crateHeight / 2, // Z: vertical position
    ],
    dimensions: [
      PANEL_THICKNESS, // Thickness in X
      block.dimensions[0], // Depth in Y
      block.dimensions[1], // Height in Z
    ],
    orientation: 'leftright' as const,
  }));
}

/**
 * Create top panel blocks (horizontal)
 * Panel lies horizontally, normal points in +Z direction
 */
export function createTopPanelBlocks(
  crateWidth: number,
  crateHeight: number,
  crateLength: number
): Block[] {
  const layout = calculatePlywoodLayout(crateWidth, crateLength);

  return layout.blocks.map((block) => ({
    position: [
      block.position[0], // X: width position
      block.position[1], // Y: depth position
      crateHeight, // Z: at top of crate
    ],
    dimensions: [
      block.dimensions[0], // Width in X
      block.dimensions[1], // Depth in Y
      PANEL_THICKNESS, // Thickness in Z
    ],
    orientation: 'top' as const,
  }));
}
