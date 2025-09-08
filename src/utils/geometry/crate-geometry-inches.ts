import { CrateConfiguration, Block } from '@/types/crate';
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
 * Crate Geometry Builder - ALL UNITS IN INCHES
 *
 * This is the source of truth for crate geometry construction.
 * Everything is calculated and stored in inches to avoid conversion errors.
 *
 * Coordinate System (Z-up, matches NX CAD):
 * - Origin [0,0,0]: Front-center of crate footprint on floor (y=0 is front face)
 * - X-axis: Width (left-right)
 * - Y-axis: Depth/Length (front-back, +Y away from screen)
 * - Z-axis: Height (up)
 * - Crate sits ON floor (Z=0 is floor level)
 */

export interface CrateGeometryInches {
  skids: Block[];
  floorboards: Block[];
  panels: Block[];
  cleats: Block[];
  aabb: {
    min: [number, number, number]; // inches
    max: [number, number, number]; // inches
    size: [number, number, number]; // inches
    diagonal: number; // inches
  };
}

/**
 * Build complete crate geometry in inches
 * @param config Crate configuration with dimensions in inches
 * @returns Geometry with all positions and dimensions in inches
 */
export function buildCrateGeometryInches(config: CrateConfiguration): CrateGeometryInches {
  const { width, length, height } = config.dimensions; // All in inches

  // Get base components (already in inches)
  const skids = calculateSkidBlocks(config);
  const floorboards = calculateFloorboardBlocks(config);

  // Create properly oriented panels (all in inches)
  const panels: Block[] = [];

  const frontPanels = createFrontPanelBlocks(width, height, length);
  const backPanels = createBackPanelBlocks(width, height, length);
  const leftPanels = createLeftPanelBlocks(width, height, length);
  const rightPanels = createRightPanelBlocks(width, height, length);
  const topPanels = createTopPanelBlocks(width, height, length);

  panels.push(...frontPanels, ...backPanels, ...leftPanels, ...rightPanels, ...topPanels);

  // Create cleats for each face (all in inches)
  const cleats: Block[] = [];
  const PANEL_THICKNESS = 0.75; // inches

  // Front/Back cleats - positioned on inside of panels
  // Coordinate system: y=0 is front face
  const frontCleats = calculateCleatBlocks(width, height).map((b: Block) => ({
    ...b,
    position: [
      b.position[0], // X: horizontal position
      PANEL_THICKNESS / 2, // Y: inside of front panel (front face at y=0)
      b.position[1] + height / 2, // Z: vertical (2D Y -> 3D Z)
    ] as [number, number, number],
  }));

  const backCleats = calculateCleatBlocks(width, height).map((b: Block) => ({
    ...b,
    position: [
      b.position[0], // X: horizontal position
      -length - PANEL_THICKNESS / 2, // Y: inside of back panel (back face at y=-length)
      b.position[1] + height / 2, // Z: vertical
    ] as [number, number, number],
  }));

  // Left/Right cleats - positioned on inside of panels
  const leftCleats = calculateCleatBlocks(length, height).map((b: Block) => ({
    ...b,
    position: [
      -width / 2 + PANEL_THICKNESS / 2, // X: inside of left panel
      b.position[0] - length / 2, // Y: depth position shifted for new coordinate system (2D X -> 3D Y)
      b.position[1] + height / 2, // Z: vertical
    ] as [number, number, number],
  }));

  const rightCleats = calculateCleatBlocks(length, height).map((b: Block) => ({
    ...b,
    position: [
      width / 2 - PANEL_THICKNESS / 2, // X: inside of right panel
      b.position[0] - length / 2, // Y: depth position shifted for new coordinate system
      b.position[1] + height / 2, // Z: vertical
    ] as [number, number, number],
  }));

  // Top cleats - positioned on underside of top panel
  const topCleats = calculateCleatBlocks(width, length).map((b: Block) => ({
    ...b,
    position: [
      b.position[0], // X: width position
      b.position[1] - length / 2, // Y: depth position shifted for new coordinate system
      height - PANEL_THICKNESS / 2, // Z: underside of top panel
    ] as [number, number, number],
  }));

  cleats.push(...frontCleats, ...backCleats, ...leftCleats, ...rightCleats, ...topCleats);

  // Calculate axis-aligned bounding box (AABB) in inches
  const allBlocks = [...skids, ...floorboards, ...panels, ...cleats];
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

  allBlocks.forEach((block) => {
    const [x, y, z] = block.position;
    const [dx, dy, dz] = block.dimensions;
    const halfX = dx / 2;
    const halfY = dy / 2;
    const halfZ = dz / 2;

    min[0] = Math.min(min[0], x - halfX);
    max[0] = Math.max(max[0], x + halfX);
    min[1] = Math.min(min[1], y - halfY);
    max[1] = Math.max(max[1], y + halfY);
    min[2] = Math.min(min[2], z - halfZ);
    max[2] = Math.max(max[2], z + halfZ);
  });

  const size: [number, number, number] = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  const diagonal = Math.sqrt(size[0] ** 2 + size[1] ** 2 + size[2] ** 2);

  return {
    skids,
    floorboards,
    panels,
    cleats,
    aabb: { min, max, size, diagonal },
  };
}

/**
 * Helper function to convert inch-based geometry to visualization scale
 * Three.js works best with units around 1-10 for camera/lighting
 * We'll scale 1 inch = 0.1 units in 3D space
 */
export const INCH_TO_3D_SCALE = 0.025; // 1 inch = 0.025 3D units (40" = 1 unit)

export function scaleBlockFor3D(block: Block): Block {
  return {
    position: [
      block.position[0] * INCH_TO_3D_SCALE,
      block.position[1] * INCH_TO_3D_SCALE,
      block.position[2] * INCH_TO_3D_SCALE,
    ] as [number, number, number],
    dimensions: [
      block.dimensions[0] * INCH_TO_3D_SCALE,
      block.dimensions[1] * INCH_TO_3D_SCALE,
      block.dimensions[2] * INCH_TO_3D_SCALE,
    ],
    orientation: block.orientation,
  };
}

export function scaleGeometryFor3D(geometry: CrateGeometryInches): CrateGeometryInches {
  return {
    skids: geometry.skids.map(scaleBlockFor3D),
    floorboards: geometry.floorboards.map(scaleBlockFor3D),
    panels: geometry.panels.map(scaleBlockFor3D),
    cleats: geometry.cleats.map(scaleBlockFor3D),
    aabb: {
      min: [
        geometry.aabb.min[0] * INCH_TO_3D_SCALE,
        geometry.aabb.min[1] * INCH_TO_3D_SCALE,
        geometry.aabb.min[2] * INCH_TO_3D_SCALE,
      ],
      max: [
        geometry.aabb.max[0] * INCH_TO_3D_SCALE,
        geometry.aabb.max[1] * INCH_TO_3D_SCALE,
        geometry.aabb.max[2] * INCH_TO_3D_SCALE,
      ],
      size: [
        geometry.aabb.size[0] * INCH_TO_3D_SCALE,
        geometry.aabb.size[1] * INCH_TO_3D_SCALE,
        geometry.aabb.size[2] * INCH_TO_3D_SCALE,
      ],
      diagonal: geometry.aabb.diagonal * INCH_TO_3D_SCALE,
    },
  };
}
