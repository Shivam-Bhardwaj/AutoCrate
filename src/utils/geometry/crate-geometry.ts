import { CrateConfiguration, Block } from '@/types/crate';
import { INCHES_TO_MM, MM_TO_METERS, PANEL_THICKNESS, FLOORBOARD_THICKNESS } from '@/lib/constants';
import {
  calculateSkidBlocks,
  calculateFloorboardBlocks,
  calculatePanelBlocks,
  calculateCleatBlocks,
} from '@/services/crateCalculations';

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
  const widthM = inchesToMeters(width);
  const lengthM = inchesToMeters(length);
  const heightM = inchesToMeters(height);

  // Placeholder: reuse existing calculation services (still inch-based). We'll convert them.
  // Importing lazily to avoid circular deps if any.

  const skidInches: Block[] = calculateSkidBlocks(config);
  const floorInches: Block[] = calculateFloorboardBlocks(config);

  // Panels: Build fronts/backs/left/right/top similar to previous logic but tag orientation earlier.
  const panels: Block[] = [];
  const cleats: Block[] = [];

  // Front / Back (Y axis faces) use width x height panels; offset along Y ± length/2
  const front = calculatePanelBlocks(width, height).map((b: Block) => ({
    ...b,
    position: [b.position[0], b.position[1] + length / 2, b.position[2]] as [
      number,
      number,
      number,
    ],
    orientation: 'frontback' as const,
  }));
  const back = calculatePanelBlocks(width, height).map((b: Block) => ({
    ...b,
    position: [b.position[0], b.position[1] - length / 2, b.position[2]] as [
      number,
      number,
      number,
    ],
    orientation: 'frontback' as const,
  }));
  const frontCleats = calculateCleatBlocks(width, height).map((b: Block) => ({
    ...b,
    position: [b.position[0], b.position[1] + length / 2, b.position[2]] as [
      number,
      number,
      number,
    ],
  }));
  const backCleats = calculateCleatBlocks(width, height).map((b: Block) => ({
    ...b,
    position: [b.position[0], b.position[1] - length / 2, b.position[2]] as [
      number,
      number,
      number,
    ],
  }));

  // Left / Right (X axis faces) panels use length x height; offset along X ± width/2
  const leftPanels = calculatePanelBlocks(length, height).map((b: Block) => ({
    ...b,
    position: [b.position[0] - width / 2, b.position[1], b.position[2]] as [number, number, number],
    orientation: 'leftright' as const,
  }));
  const rightPanels = calculatePanelBlocks(length, height).map((b: Block) => ({
    ...b,
    position: [b.position[0] + width / 2, b.position[1], b.position[2]] as [number, number, number],
    orientation: 'leftright' as const,
  }));
  const leftCleats = calculateCleatBlocks(length, height).map((b: Block) => ({
    ...b,
    position: [b.position[0] - width / 2, b.position[1], b.position[2]] as [number, number, number],
  }));
  const rightCleats = calculateCleatBlocks(length, height).map((b: Block) => ({
    ...b,
    position: [b.position[0] + width / 2, b.position[1], b.position[2]] as [number, number, number],
  }));

  // Top (horizontal) panels use width x length; offset Z + height
  const topPanels = calculatePanelBlocks(width, length).map((b: Block) => ({
    ...b,
    position: [b.position[0], b.position[1], b.position[2] + height] as [number, number, number],
    orientation: 'top' as const,
  }));
  const topCleats = calculateCleatBlocks(width, length).map((b: Block) => ({
    ...b,
    position: [b.position[0], b.position[1], b.position[2] + height] as [number, number, number],
  }));

  panels.push(...front, ...back, ...leftPanels, ...rightPanels, ...topPanels);
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
