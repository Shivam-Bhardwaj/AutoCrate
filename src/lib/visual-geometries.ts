/**
 * Simplified Visual Geometries for Hardware Components
 * Uses basic Three.js primitives (boxes, cylinders) that are guaranteed to render
 * These geometries are used for visual representation while maintaining NX data integrity
 */

import * as THREE from 'three'

/**
 * Klimp dimensions from STEP file catalog
 * These match the actual STEP file dimensions for visual accuracy
 */
export const KLIMP_DIMENSIONS = {
  longerSide: 4.92288962545174,   // ~4.92" (longest dimension)
  shorterSide: 3.923096000692297,  // ~3.92" (medium dimension)
  thickness: 1.1545930112254,      // ~1.15" (thickness/width)
  materialThickness: 0.125         // ~1/8" actual material thickness
}

/**
 * Create a simplified klimp geometry using two boxes forming an L-shape
 * This is guaranteed to render and matches STEP file dimensions
 */
export function createSimpleKlimpGeometry(): THREE.BufferGeometry[] {
  const { longerSide, shorterSide, thickness, materialThickness } = KLIMP_DIMENSIONS

  // Create two boxes that form an L-shape
  // Box 1: Horizontal leg (shorter side)
  const horizontalBox = new THREE.BoxGeometry(
    shorterSide,
    materialThickness,
    thickness
  )

  // Box 2: Vertical leg (longer side)
  const verticalBox = new THREE.BoxGeometry(
    materialThickness,
    longerSide,
    thickness
  )

  // Position the boxes to form an L-shape
  // Horizontal box: centered at origin
  horizontalBox.translate(0, 0, 0)

  // Vertical box: positioned to connect with horizontal box
  verticalBox.translate(
    -shorterSide / 2 + materialThickness / 2,
    longerSide / 2 - materialThickness / 2,
    0
  )

  return [horizontalBox, verticalBox]
}

/**
 * Create a simplified lag screw geometry using basic cylinders
 */
export function createSimpleLagScrewGeometry(length: number = 3.0): THREE.BufferGeometry[] {
  const geometries: THREE.BufferGeometry[] = []

  // Head (hexagonal cylinder)
  const headRadius = 0.3125  // 5/16 inch
  const headHeight = 0.25    // 1/4 inch
  const headGeometry = new THREE.CylinderGeometry(headRadius, headRadius, headHeight, 6)
  headGeometry.translate(0, -length / 2 + headHeight / 2, 0)
  geometries.push(headGeometry)

  // Shank (simple cylinder)
  const shankRadius = 0.1875  // 3/16 inch (3/8" nominal / 2)
  const shankLength = length - headHeight
  const shankGeometry = new THREE.CylinderGeometry(shankRadius, shankRadius, shankLength, 8)
  shankGeometry.translate(0, -length / 2 + headHeight + shankLength / 2, 0)
  geometries.push(shankGeometry)

  return geometries
}

/**
 * Create a simplified washer geometry
 */
export function createSimpleWasherGeometry(): THREE.BufferGeometry {
  const outerRadius = 0.4375   // 7/16 inch
  const innerRadius = 0.203125 // 13/64 inch
  const thickness = 0.0625     // 1/16 inch

  // Use a simple cylinder with a smaller cylinder subtracted visually
  // For simplicity, we'll use a thin cylinder
  const geometry = new THREE.CylinderGeometry(outerRadius, outerRadius, thickness, 16)
  geometry.rotateX(Math.PI / 2)  // Make it lie flat
  geometry.translate(0, 0, 0)

  return geometry
}

/**
 * Create a simple stencil plane geometry
 */
export function createSimpleStencilGeometry(
  width: number,
  height: number
): THREE.BufferGeometry {
  // Use a simple plane geometry - guaranteed to render
  const geometry = new THREE.PlaneGeometry(width, height)
  return geometry
}

/**
 * Materials for visual components
 * Using emissive materials for stencils to ensure visibility
 */
export const VISUAL_MATERIALS = {
  klimp: new THREE.MeshStandardMaterial({
    color: 0x8b7355,  // Bronze color
    metalness: 0.7,
    roughness: 0.3,
    side: THREE.DoubleSide
  }),

  lagScrew: new THREE.MeshStandardMaterial({
    color: 0x606060,  // Steel gray
    metalness: 0.9,
    roughness: 0.2
  }),

  washer: new THREE.MeshStandardMaterial({
    color: 0x808080,  // Light steel
    metalness: 0.85,
    roughness: 0.25
  }),

  stencilFragile: new THREE.MeshStandardMaterial({
    color: 0xff0000,  // Red
    emissive: 0x330000,  // Subtle red glow
    emissiveIntensity: 0.3,
    metalness: 0.1,
    roughness: 0.8,
    side: THREE.DoubleSide
  }),

  stencilHandling: new THREE.MeshStandardMaterial({
    color: 0xffa500,  // Orange
    emissive: 0x331900,  // Subtle orange glow
    emissiveIntensity: 0.3,
    metalness: 0.1,
    roughness: 0.8,
    side: THREE.DoubleSide
  }),

  stencilOther: new THREE.MeshStandardMaterial({
    color: 0xffa500,  // Orange for other stencils
    emissive: 0x331900,
    emissiveIntensity: 0.3,
    metalness: 0.1,
    roughness: 0.8,
    side: THREE.DoubleSide
  })
}

