import { CrateConfiguration, Block } from '@/types/crate';
import { INCHES_TO_MM, MM_TO_METERS } from '@/lib/constants';
import {
  calculateSkidBlocks,
  calculateFloorboardBlocks,
  calculateCleatBlocks,
} from '@/services/crateCalculations';
import {
  createFrontPanelBlocks,
  createBackPanelBlocks,
  createLeftPanelBlocks,
  createRightPanelBlocks,
  createTopPanelBlocks,
} from './panel-3d-construction';

/**
 * Geometry units strategy:
 *  - All input dimensions are in inches (config)
 *  - Convert inches -> mm -> meters once here
 *  - Output blocks in meters with origin at crate center on floor plane (Z=0 at floor, crate rises +Z)
 *    (If we want true center origin later, we can shift by height/2.)
 */
export interface CrateGeometry {
  skids: Block[];
  floorboards: Block[];
  panels: Block[];
  cleats: Block[];
  aabb: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
    diagonal: number;
  };
}

function inchesToMeters(value: number) {
  return (value * INCHES_TO_MM) / MM_TO_METERS;
}

export function buildCrateGeometry(config: CrateConfiguration): CrateGeometry {
  const { width, length, height } = config.dimensions; // inches

  // Get skids and floor from existing services
  const skidInches: Block[] = calculateSkidBlocks(config);
  const floorInches: Block[] = calculateFloorboardBlocks(config);

  // Create panels using proper 3D construction
  const panels: Block[] = [];
  const cleats: Block[] = [];

  // Create properly oriented panels using new 3D construction functions
  const frontPanels = createFrontPanelBlocks(width, height, length);
  const backPanels = createBackPanelBlocks(width, height, length);
  const leftPanels = createLeftPanelBlocks(width, height, length);
  const rightPanels = createRightPanelBlocks(width, height, length);
  const topPanels = createTopPanelBlocks(width, height, length);

  panels.push(...frontPanels, ...backPanels, ...leftPanels, ...rightPanels, ...topPanels);

  // Create cleats for each face
  // Front/Back cleats
  const frontCleats = calculateCleatBlocks(width, height).map((b: Block) => ({
    ...b,
    position: [
      b.position[0],
      length / 2 - 0.75 / 2, // Position on inside of front panel
      b.position[1] + height / 2,
    ] as [number, number, number],
  }));
  const backCleats = calculateCleatBlocks(width, height).map((b: Block) => ({
    ...b,
    position: [
      b.position[0],
      -length / 2 + 0.75 / 2, // Position on inside of back panel
      b.position[1] + height / 2,
    ] as [number, number, number],
  }));

  // Left/Right cleats
  const leftCleats = calculateCleatBlocks(length, height).map((b: Block) => ({
    ...b,
    position: [
      -width / 2 + 0.75 / 2, // Position on inside of left panel
      b.position[0],
      b.position[1] + height / 2,
    ] as [number, number, number],
  }));
  const rightCleats = calculateCleatBlocks(length, height).map((b: Block) => ({
    ...b,
    position: [
      width / 2 - 0.75 / 2, // Position on inside of right panel
      b.position[0],
      b.position[1] + height / 2,
    ] as [number, number, number],
  }));

  // Top cleats
  const topCleats = calculateCleatBlocks(width, length).map((b: Block) => ({
    ...b,
    position: [
      b.position[0],
      b.position[1],
      height - 0.75 / 2, // Position on underside of top panel
    ] as [number, number, number],
  }));

  cleats.push(...frontCleats, ...backCleats, ...leftCleats, ...rightCleats, ...topCleats);

  // Helper to convert an inch-based block to meters
  const convert = (b: Block): Block => ({
    position: [
      inchesToMeters(b.position[0]),
      inchesToMeters(b.position[1]),
      inchesToMeters(b.position[2]),
    ] as [number, number, number],
    dimensions: [
      inchesToMeters(b.dimensions[0]),
      inchesToMeters(b.dimensions[1]),
      inchesToMeters(b.dimensions[2]),
    ],
    orientation: (b as any).orientation,
  });

  const skids = skidInches.map(convert);
  const floorboards = floorInches.map(convert);
  const panelsM = panels.map(convert);
  const cleatsM = cleats.map(convert);

  // Compute AABB across all geometry (include top height)
  const all = [...skids, ...floorboards, ...panelsM, ...cleatsM];
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  all.forEach((b) => {
    const [x, y, z] = b.position;
    const [dx, dy, dz] = b.dimensions;
    const hx = dx / 2,
      hy = dy / 2,
      hz = dz / 2;
    min[0] = Math.min(min[0], x - hx);
    max[0] = Math.max(max[0], x + hx);
    min[1] = Math.min(min[1], y - hy);
    max[1] = Math.max(max[1], y + hy);
    min[2] = Math.min(min[2], z - hz);
    max[2] = Math.max(max[2], z + hz);
  });
  const size: [number, number, number] = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  const diagonal = Math.sqrt(size[0] ** 2 + size[1] ** 2 + size[2] ** 2);

  return {
    skids,
    floorboards,
    panels: panelsM,
    cleats: cleatsM,
    aabb: { min, max, size, diagonal },
  };
}
