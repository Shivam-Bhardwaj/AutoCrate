/**
 * Simple Crate Geometry Builder - ALL IN INCHES
 *
 * This is a simplified, correct implementation of crate geometry.
 * Everything stays in inches, with proper Z-up coordinate system.
 *
 * Coordinate System (Z-up):
 * - Origin [0,0,0]: Center of crate footprint on floor
 * - X-axis: Width (left-right when viewing from front)
 * - Y-axis: Depth/Length (front-back)
 * - Z-axis: Height (vertical up)
 */

import { CrateConfiguration, Block } from '@/types/crate';

const PANEL_THICKNESS = 0.75; // inches
const SKID_HEIGHT = 3.5; // inches
const FLOOR_THICKNESS = 0.75; // inches

export interface SimpleCrateGeometry {
  skids: Block[];
  floor: Block;
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
export function buildSimpleCrateGeometry(config: CrateConfiguration): SimpleCrateGeometry {
  const { width, length: depth, height } = config.dimensions;

  // Skids (3 skids running front-to-back under the crate)
  const skidWidth = 3.5; // inches
  const skidSpacing = width / 2; // Space between skid centers

  const skids: Block[] = [
    // Left skid
    {
      position: [-skidSpacing, 0, SKID_HEIGHT / 2] as [number, number, number],
      dimensions: [skidWidth, depth, SKID_HEIGHT],
    },
    // Center skid
    {
      position: [0, 0, SKID_HEIGHT / 2] as [number, number, number],
      dimensions: [skidWidth, depth, SKID_HEIGHT],
    },
    // Right skid
    {
      position: [skidSpacing, 0, SKID_HEIGHT / 2] as [number, number, number],
      dimensions: [skidWidth, depth, SKID_HEIGHT],
    },
  ];

  // Floor - sits on top of skids
  const floor: Block = {
    position: [0, 0, SKID_HEIGHT + FLOOR_THICKNESS / 2] as [number, number, number],
    dimensions: [width, depth, FLOOR_THICKNESS],
  };

  // Panels - STANDING VERTICALLY as walls
  const panels = {
    // Front panel (positive Y) - stands vertically
    front: {
      position: [0, depth / 2, height / 2] as [number, number, number],
      dimensions: [width, PANEL_THICKNESS, height] as [number, number, number],
      orientation: 'frontback' as const,
    },

    // Back panel (negative Y) - stands vertically
    back: {
      position: [0, -depth / 2, height / 2] as [number, number, number],
      dimensions: [width, PANEL_THICKNESS, height] as [number, number, number],
      orientation: 'frontback' as const,
    },

    // Left panel (negative X) - stands vertically
    left: {
      position: [-width / 2, 0, height / 2] as [number, number, number],
      dimensions: [PANEL_THICKNESS, depth, height] as [number, number, number],
      orientation: 'leftright' as const,
    },

    // Right panel (positive X) - stands vertically
    right: {
      position: [width / 2, 0, height / 2] as [number, number, number],
      dimensions: [PANEL_THICKNESS, depth, height] as [number, number, number],
      orientation: 'leftright' as const,
    },

    // Top panel - lies horizontally
    top: {
      position: [0, 0, height] as [number, number, number],
      dimensions: [width, depth, PANEL_THICKNESS] as [number, number, number],
      orientation: 'top' as const,
    },
  };

  // Simple cleats at corners (vertical supports)
  const cleatSize = 2; // 2x2 inch cleats
  const cleats: Block[] = [
    // Front-left corner
    {
      position: [-width / 2 + cleatSize / 2, depth / 2 - cleatSize / 2, height / 2] as [
        number,
        number,
        number,
      ],
      dimensions: [cleatSize, cleatSize, height],
    },
    // Front-right corner
    {
      position: [width / 2 - cleatSize / 2, depth / 2 - cleatSize / 2, height / 2] as [
        number,
        number,
        number,
      ],
      dimensions: [cleatSize, cleatSize, height],
    },
    // Back-left corner
    {
      position: [-width / 2 + cleatSize / 2, -depth / 2 + cleatSize / 2, height / 2] as [
        number,
        number,
        number,
      ],
      dimensions: [cleatSize, cleatSize, height],
    },
    // Back-right corner
    {
      position: [width / 2 - cleatSize / 2, -depth / 2 + cleatSize / 2, height / 2] as [
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
