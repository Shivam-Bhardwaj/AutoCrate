/**
 * Coordinate Transformation Utilities
 * 
 * Converts between NX CAD coordinate system and Three.js scene coordinate system
 * 
 * NX CAD System:
 * - X: width (left/right)
 * - Y: depth/length (front/back)
 * - Z: height (up/down)
 * - Origin: (0, 0, 0) at center of crate floor
 * 
 * Three.js Scene System:
 * - X: left/right (same as NX)
 * - Y: up/down (same as NX Z)
 * - Z: front/back (opposite of NX Y, negative!)
 * - Scale: 0.1 × (NX coordinates)
 * 
 * Transformation:
 * - NX X → Three.js X
 * - NX Z → Three.js Y
 * - NX Y → Three.js -Z (NEGATIVE!)
 */

export const SCALE_FACTOR = 0.1

/**
 * Convert NX point to Three.js position
 * @param nxPoint Point in NX coordinate system (inches)
 * @returns Position tuple for Three.js [x, y, z]
 */
export function nxToThreeJS(nxPoint: { x: number; y: number; z: number }): [number, number, number] {
  return [
    nxPoint.x * SCALE_FACTOR,      // X → X
    nxPoint.z * SCALE_FACTOR,      // Z → Y
    -nxPoint.y * SCALE_FACTOR      // Y → -Z (NEGATIVE!)
  ]
}

/**
 * Convert NX point to Three.js position with custom scale
 * @param nxPoint Point in NX coordinate system (inches)
 * @param scale Custom scale factor (defaults to SCALE_FACTOR)
 * @returns Position tuple for Three.js [x, y, z]
 */
export function nxToThreeJSScaled(
  nxPoint: { x: number; y: number; z: number },
  scale: number = SCALE_FACTOR
): [number, number, number] {
  return [
    nxPoint.x * scale,
    nxPoint.z * scale,
    -nxPoint.y * scale
  ]
}

/**
 * Convert Three.js position back to NX point
 * @param threePos Position in Three.js coordinate system
 * @returns Point in NX coordinate system (inches)
 */
export function threeJSToNX(threePos: [number, number, number]): { x: number; y: number; z: number } {
  return {
    x: threePos[0] / SCALE_FACTOR,
    y: -threePos[2] / SCALE_FACTOR,  // -Z → Y (reverse negative)
    z: threePos[1] / SCALE_FACTOR    // Y → Z
  }
}

/**
 * Convert NX size/dimensions to Three.js size
 * @param nxSize Size in NX coordinate system (inches)
 * @returns Size tuple for Three.js [x, y, z]
 */
export function nxSizeToThreeJS(nxSize: { x: number; y: number; z: number }): [number, number, number] {
  return [
    nxSize.x * SCALE_FACTOR,      // X → X
    nxSize.z * SCALE_FACTOR,      // Z → Y
    nxSize.y * SCALE_FACTOR       // Y → Z (positive, no negative for size)
  ]
}

/**
 * Calculate center point from two NX points
 * @param point1 First point in NX coordinates
 * @param point2 Second point in NX coordinates
 * @returns Center point in NX coordinates
 */
export function nxCenter(
  point1: { x: number; y: number; z: number },
  point2: { x: number; y: number; z: number }
): { x: number; y: number; z: number } {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
    z: (point1.z + point2.z) / 2
  }
}

/**
 * Calculate size from two NX points
 * @param point1 First point in NX coordinates
 * @param point2 Second point in NX coordinates
 * @returns Size in NX coordinates
 */
export function nxSize(
  point1: { x: number; y: number; z: number },
  point2: { x: number; y: number; z: number }
): { x: number; y: number; z: number } {
  return {
    x: Math.abs(point2.x - point1.x),
    y: Math.abs(point2.y - point1.y),
    z: Math.abs(point2.z - point1.z)
  }
}

