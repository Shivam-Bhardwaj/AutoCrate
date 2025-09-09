/**
 * Simple Crate Geometry Builder - ALL IN INCHES
 *
 * This is a simplified, correct implementation of crate geometry.
 * Everything stays in inches, with proper Z-up coordinate system.
 *
 * Coordinate System (Z-up):
 * - Origin [0,0,0]: Front-center of crate footprint on floor (y=0 is front)
 * - X-axis: Width (left-right when viewing from front)
 * - Y-axis: Depth/Length (front-back, +Y away from screen)
 * - Z-axis: Height (vertical up)
 */

import { CrateConfiguration, Block } from '@/types/crate';
import { SkidConfiguration } from '@/utils/skid-calculations';
import { calculateFloorBoards, FloorBoard } from '@/services/floor-calculator';

const PANEL_THICKNESS = 0.75; // inches
const SKID_HEIGHT = 3.5; // inches
const FLOOR_THICKNESS = 0.75; // inches

export { PANEL_THICKNESS };

export interface SimpleCrateGeometry {
  skids: Block[];
  floor: Block; // Legacy single floor block
  floorBoards: Block[]; // New individual floor boards
  panels: {
    front: Block;
    back: Block;
    left: Block;
    right: Block;
    top: Block;
  };
  cleats: Block[];
}

/**
 * Build simple crate geometry with correct orientation
 * All units in inches
 */
export function buildSimpleCrateGeometry(config: CrateConfiguration, skidConfig?: SkidConfiguration): SimpleCrateGeometry {
  const { width, length: depth, height } = config.dimensions;

  // Use skid configuration if provided, otherwise use defaults
  const skidWidth = skidConfig ? skidConfig.dimensions.width : 3.5; // inches
  const skidHeight = skidConfig ? skidConfig.dimensions.height : 3.5; // inches
  const skidCount = skidConfig ? skidConfig.count : 3;

  // Calculate actual spacing based on crate width and skid count
  // This ensures skids are properly distributed across the crate width
  let actualSpacing: number;
  if (skidCount === 3) {
    // For 3 skids, distribute evenly across the width
    // Center skid at 0, left and right skids spaced evenly
    actualSpacing = (width - skidWidth) / 2; // Distance from center to left/right skid centers
  } else {
    // For more than 3 skids, calculate spacing to fit within crate width
    const totalSkidWidth = skidCount * skidWidth;
    const remainingSpace = width - totalSkidWidth;
    actualSpacing = remainingSpace / (skidCount - 1); // Center-to-center spacing
  }

  // Ensure spacing doesn't exceed the maximum allowed spacing from specifications
  const maxAllowedSpacing = skidConfig ? skidConfig.spacing : 30.0;
  if (actualSpacing > maxAllowedSpacing) {
    // If calculated spacing exceeds maximum, we need more skids
    const minSpacing = maxAllowedSpacing;
    const calculatedCount = Math.max(3, Math.floor((width - skidWidth) / minSpacing) + 1);
    const finalCount = Math.max(skidCount, calculatedCount);
    
    if (finalCount !== skidCount) {
      // Recalculate spacing with the new count
      const totalSkidWidth = finalCount * skidWidth;
      const remainingSpace = width - totalSkidWidth;
      actualSpacing = remainingSpace / (finalCount - 1);
    }
  }

  // Skids (running front-to-back under the crate)
  // Positioned with y=0 at front, so skids centered at y=-depth/2
  const skids: Block[] = [];

  if (skidCount === 3) {
    // Standard 3-skid configuration - evenly spaced
    skids.push(
      // Left skid
      {
        position: [-actualSpacing, -depth / 2, skidHeight / 2] as [number, number, number],
        dimensions: [skidWidth, depth, skidHeight],
      },
      // Center skid
      {
        position: [0, -depth / 2, skidHeight / 2] as [number, number, number],
        dimensions: [skidWidth, depth, skidHeight],
      },
      // Right skid
      {
        position: [actualSpacing, -depth / 2, skidHeight / 2] as [number, number, number],
        dimensions: [skidWidth, depth, skidHeight],
      }
    );
  } else {
    // Dynamic skid count - evenly distribute across width
    for (let i = 0; i < skidCount; i++) {
      const xPos = -width / 2 + skidWidth / 2 + i * (skidWidth + actualSpacing);
      skids.push({
        position: [xPos, -depth / 2, skidHeight / 2] as [number, number, number],
        dimensions: [skidWidth, depth, skidHeight],
      });
    }
  }

  // Floor - calculate individual boards
  const floorConfig = calculateFloorBoards(width, depth);
  const floorBoards: Block[] = floorConfig.boards.map(board => ({
    position: [
      board.position.x,
      -depth / 2, // Boards run full depth, centered at y=-depth/2
      skidHeight + board.thickness / 2 // Sit on top of skids
    ] as [number, number, number],
    dimensions: [board.width, board.depth, board.thickness],
  }));

  // Legacy single floor block (kept for compatibility)
  const floor: Block = {
    position: [0, -depth / 2, skidHeight + FLOOR_THICKNESS / 2] as [number, number, number],
    dimensions: [width, depth, FLOOR_THICKNESS],
  };

  // Panels - STANDING VERTICALLY as walls
  // Coordinate system: y=0 is front face, +y goes away from screen
  const panels = {
    // Front panel - face at y=0, center at y = PANEL_THICKNESS/2
    front: {
      position: [0, PANEL_THICKNESS / 2, height / 2] as [number, number, number],
      dimensions: [width, PANEL_THICKNESS, height] as [number, number, number],
      orientation: 'frontback' as const,
    },

    // Back panel - face at y=-depth, center at y = -depth - PANEL_THICKNESS/2
    back: {
      position: [0, -depth - PANEL_THICKNESS / 2, height / 2] as [number, number, number],
      dimensions: [width, PANEL_THICKNESS, height] as [number, number, number],
      orientation: 'frontback' as const,
    },

    // Left panel - face at x=-width/2, center at x = -width/2 - PANEL_THICKNESS/2
    left: {
      position: [-width / 2 - PANEL_THICKNESS / 2, -depth / 2, height / 2] as [number, number, number],
      dimensions: [PANEL_THICKNESS, depth, height] as [number, number, number],
      orientation: 'leftright' as const,
    },

    // Right panel - face at x=width/2, center at x = width/2 + PANEL_THICKNESS/2
    right: {
      position: [width / 2 + PANEL_THICKNESS / 2, -depth / 2, height / 2] as [number, number, number],
      dimensions: [PANEL_THICKNESS, depth, height] as [number, number, number],
      orientation: 'leftright' as const,
    },

    // Top panel - lies horizontally at z=height
    top: {
      position: [0, -depth / 2, height + PANEL_THICKNESS / 2] as [number, number, number],
      dimensions: [width, depth, PANEL_THICKNESS] as [number, number, number],
      orientation: 'top' as const,
    },
  };

  // Simple cleats at corners (vertical supports)
  // Coordinate system: y=0 is front face
  const cleatSize = 2; // 2x2 inch cleats
  const cleats: Block[] = [
    // Front-left corner - at y = cleatSize/2 (extends from front face)
    {
      position: [-width / 2 + cleatSize / 2, cleatSize / 2, height / 2] as [
        number,
        number,
        number,
      ],
      dimensions: [cleatSize, cleatSize, height],
    },
    // Front-right corner - at y = cleatSize/2 (extends from front face)
    {
      position: [width / 2 - cleatSize / 2, cleatSize / 2, height / 2] as [
        number,
        number,
        number,
      ],
      dimensions: [cleatSize, cleatSize, height],
    },
    // Back-left corner - at y = -depth + cleatSize/2 (extends from back face)
    {
      position: [-width / 2 + cleatSize / 2, -depth + cleatSize / 2, height / 2] as [
        number,
        number,
        number,
      ],
      dimensions: [cleatSize, cleatSize, height],
    },
    // Back-right corner - at y = -depth + cleatSize/2 (extends from back face)
    {
      position: [width / 2 - cleatSize / 2, -depth + cleatSize / 2, height / 2] as [
        number,
        number,
        number,
      ],
      dimensions: [cleatSize, cleatSize, height],
    },
  ];

  return {
    skids,
    floor,
    floorBoards,
    panels,
    cleats,
  };
}

/**
 * Scale factor for 3D visualization
 * 1 inch = 0.025 3D units (40 inches = 1 unit)
 */
export const INCH_TO_3D = 0.025;

/**
 * Convert inch-based geometry to 3D scale
 */
export function scaleForVisualization(geometry: SimpleCrateGeometry) {
  const scaleBlock = (block: Block): Block => ({
    position: [
      block.position[0] * INCH_TO_3D,
      block.position[1] * INCH_TO_3D,
      block.position[2] * INCH_TO_3D,
    ] as [number, number, number],
    dimensions: [
      block.dimensions[0] * INCH_TO_3D,
      block.dimensions[1] * INCH_TO_3D,
      block.dimensions[2] * INCH_TO_3D,
    ],
  });

  const scalePanelBlock = (block: Block & { orientation?: string }) => {
    const scaled = scaleBlock(block);
    return {
      ...scaled,
      orientation: block.orientation,
    };
  };

  return {
    skids: geometry.skids.map(scaleBlock),
    floor: scaleBlock(geometry.floor),
    floorBoards: geometry.floorBoards.map(scaleBlock),
    panels: {
      front: scalePanelBlock(geometry.panels.front as Block & { orientation?: string }),
      back: scalePanelBlock(geometry.panels.back as Block & { orientation?: string }),
      left: scalePanelBlock(geometry.panels.left as Block & { orientation?: string }),
      right: scalePanelBlock(geometry.panels.right as Block & { orientation?: string }),
      top: scalePanelBlock(geometry.panels.top as Block & { orientation?: string }),
    },
    cleats: geometry.cleats.map(scaleBlock),
  };
}
