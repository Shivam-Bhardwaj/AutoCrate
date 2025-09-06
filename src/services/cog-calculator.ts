import { CrateDimensions } from '../types/crate';

/**
 * Calculates the center of gravity (CoG) for the combined product and crate system
 * @param productWeight - Weight of the product in pounds
 * @param productCoG - Center of gravity coordinates of the product relative to crate origin (bottom-left-front corner)
 * @param crateDimensions - Dimensions of the crate
 * @param crateWeight - Weight of the crate in pounds
 * @returns Combined center of gravity coordinates
 */
export function calculateCoG(
  productWeight: number,
  productCoG: { x: number; y: number; z: number },
  crateDimensions: CrateDimensions,
  crateWeight: number
): { x: number; y: number; z: number } {
  // Calculate crate's center of gravity (geometric center)
  const crateCoG = {
    x: crateDimensions.length / 2,
    y: crateDimensions.width / 2,
    z: crateDimensions.height / 2,
  };

  // Calculate combined center of gravity using weighted average
  const totalWeight = productWeight + crateWeight;

  if (totalWeight === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  const combinedCoG = {
    x: (productWeight * productCoG.x + crateWeight * crateCoG.x) / totalWeight,
    y: (productWeight * productCoG.y + crateWeight * crateCoG.y) / totalWeight,
    z: (productWeight * productCoG.z + crateWeight * crateCoG.z) / totalWeight,
  };

  return combinedCoG;
}

/**
 * Validates CoG stability based on AMAT requirements
 * @param cog - Center of gravity coordinates
 * @param crateDimensions - Dimensions of the crate
 * @returns Validation result with warnings
 */
export function validateCoGStability(
  cog: { x: number; y: number; z: number },
  crateDimensions: CrateDimensions
): {
  isStable: boolean;
  warnings: string[];
  stabilityScore: number;
} {
  const warnings: string[] = [];
  let stabilityScore = 100;

  // Check if CoG is above 60% of crate height (unstable)
  const heightThreshold = crateDimensions.height * 0.6;
  if (cog.z > heightThreshold) {
    warnings.push(
      `CoG height (${cog.z.toFixed(2)}") exceeds 60% of crate height (${heightThreshold.toFixed(2)}") - High risk of tipping`
    );
    stabilityScore -= 30;
  }

  // Check if CoG is off-center by more than 10%
  const lengthCenter = crateDimensions.length / 2;
  const widthCenter = crateDimensions.width / 2;

  const lengthOffset = Math.abs(cog.x - lengthCenter) / lengthCenter;
  const widthOffset = Math.abs(cog.y - widthCenter) / widthCenter;

  if (lengthOffset > 0.1) {
    warnings.push(
      `CoG length offset (${(lengthOffset * 100).toFixed(1)}%) exceeds 10% - May cause instability`
    );
    stabilityScore -= 20;
  }

  if (widthOffset > 0.1) {
    warnings.push(
      `CoG width offset (${(widthOffset * 100).toFixed(1)}%) exceeds 10% - May cause instability`
    );
    stabilityScore -= 20;
  }

  // Additional checks for extreme cases
  if (cog.z > crateDimensions.height * 0.8) {
    warnings.push('CoG extremely high - Critical stability risk');
    stabilityScore -= 50;
  }

  const isStable = warnings.length === 0;

  return {
    isStable,
    warnings,
    stabilityScore: Math.max(0, stabilityScore),
  };
}

/**
 * Calculates CoG marking position on the crate surface
 * @param cog - Center of gravity coordinates
 * @param crateDimensions - Dimensions of the crate
 * @returns Marking position coordinates for each face
 */
export function calculateCoGMarkingPosition(
  cog: { x: number; y: number; z: number },
  crateDimensions: CrateDimensions
): {
  top: { x: number; y: number };
  front: { x: number; y: number };
  side: { x: number; y: number };
} {
  return {
    // Top face: project CoG onto top surface
    top: {
      x: cog.x,
      y: cog.y,
    },
    // Front face: project CoG onto front surface
    front: {
      x: cog.x,
      y: cog.z,
    },
    // Side face: project CoG onto side surface (using width as reference)
    side: {
      x: cog.y,
      y: cog.z,
    },
  };
}
