/**
 * Hardcoded 3D Geometries for Hardware Components
 * Pre-defined mesh data that renders immediately without external dependencies
 */

import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Create a realistic L-shaped klimp bracket geometry
 */
export function createKlimpGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape()

  // Create L-shape profile (in inches)
  const thickness = 0.125  // 1/8 inch thick
  const longerSide = 4.0   // 4 inch longer leg
  const shorterSide = 3.0  // 3 inch shorter leg
  const width = 1.0        // 1 inch wide

  // Draw the L-shape
  shape.moveTo(0, 0)
  shape.lineTo(shorterSide, 0)
  shape.lineTo(shorterSide, thickness)
  shape.lineTo(thickness, thickness)
  shape.lineTo(thickness, longerSide)
  shape.lineTo(0, longerSide)
  shape.closePath()

  // Add mounting holes
  const hole1 = new THREE.Path()
  hole1.absellipse(shorterSide/2, thickness * 2, 0.1875, 0.1875, 0, Math.PI * 2, false, 0)
  shape.holes.push(hole1)

  const hole2 = new THREE.Path()
  hole2.absellipse(thickness * 2, longerSide/2, 0.1875, 0.1875, 0, Math.PI * 2, false, 0)
  shape.holes.push(hole2)

  // Extrude to create 3D geometry
  const extrudeSettings = {
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2
  }

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)

  // Center the geometry
  geometry.center()

  return geometry
}

/**
 * Create a lag screw geometry
 */
export function createLagScrewGeometry(length: number = 3.0): THREE.BufferGeometry {
  const group = new THREE.Group()
  const geometries: THREE.BufferGeometry[] = []

  // Screw head (hex head)
  const headRadius = 0.3125  // 5/16 inch
  const headHeight = 0.25    // 1/4 inch
  const headGeometry = new THREE.CylinderGeometry(headRadius, headRadius, headHeight, 6)
  headGeometry.translate(0, -length/2 + headHeight/2, 0)
  geometries.push(headGeometry)

  // Washer section under head
  const washerRadius = 0.4375  // 7/16 inch
  const washerHeight = 0.0625  // 1/16 inch
  const washerGeometry = new THREE.CylinderGeometry(washerRadius, washerRadius, washerHeight, 16)
  washerGeometry.translate(0, -length/2 + headHeight + washerHeight/2, 0)
  geometries.push(washerGeometry)

  // Shank (smooth part)
  const shankRadius = 0.1875  // 3/16 inch (3/8" nominal / 2)
  const shankLength = 0.75    // 3/4 inch smooth
  const shankGeometry = new THREE.CylinderGeometry(shankRadius, shankRadius, shankLength, 8)
  shankGeometry.translate(0, -length/2 + headHeight + washerHeight + shankLength/2, 0)
  geometries.push(shankGeometry)

  // Threaded part (simplified as tapered cylinder)
  const threadLength = length - headHeight - washerHeight - shankLength
  const threadGeometry = new THREE.CylinderGeometry(
    shankRadius * 0.9,  // Slightly smaller at tip
    shankRadius,        // Full size at base
    threadLength,
    8,
    8,
    false
  )
  threadGeometry.translate(0, -length/2 + headHeight + washerHeight + shankLength + threadLength/2, 0)

  // Add spiral thread pattern using displacement
  const positions = threadGeometry.attributes.position
  const vertex = new THREE.Vector3()
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i)
    const angle = (vertex.y + length/2) * 10  // Spiral frequency
    const displacement = Math.sin(angle) * 0.01  // Thread depth
    vertex.x += Math.cos(Math.atan2(vertex.z, vertex.x)) * displacement
    vertex.z += Math.sin(Math.atan2(vertex.z, vertex.x)) * displacement
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }

  geometries.push(threadGeometry)

  // Merge all geometries
  const mergedGeometry = mergeGeometries(geometries)
  mergedGeometry.rotateZ(Math.PI / 2)  // Rotate to horizontal orientation

  return mergedGeometry
}

/**
 * Create a flat washer geometry
 */
export function createWasherGeometry(): THREE.BufferGeometry {
  const outerRadius = 0.4375   // 7/16 inch
  const innerRadius = 0.203125 // 13/64 inch (slightly larger than 3/16)
  const thickness = 0.0625     // 1/16 inch

  // Create washer shape
  const shape = new THREE.Shape()
  shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false)

  // Add center hole
  const holePath = new THREE.Path()
  holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true)
  shape.holes.push(holePath)

  // Extrude to create 3D washer
  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: false
  }

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  geometry.center()
  geometry.rotateX(Math.PI / 2)  // Make it lie flat

  return geometry
}

/**
 * Create stencil geometry (flat text/symbol)
 */
export function createStencilGeometry(
  text: string,
  width: number = 8,
  height: number = 8
): THREE.BufferGeometry {
  // Create a simple rectangular plane with beveled edges
  const shape = new THREE.Shape()

  const cornerRadius = 0.25
  shape.moveTo(-width/2 + cornerRadius, -height/2)
  shape.lineTo(width/2 - cornerRadius, -height/2)
  shape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + cornerRadius)
  shape.lineTo(width/2, height/2 - cornerRadius)
  shape.quadraticCurveTo(width/2, height/2, width/2 - cornerRadius, height/2)
  shape.lineTo(-width/2 + cornerRadius, height/2)
  shape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - cornerRadius)
  shape.lineTo(-width/2, -height/2 + cornerRadius)
  shape.quadraticCurveTo(-width/2, -height/2, -width/2 + cornerRadius, -height/2)

  const extrudeSettings = {
    depth: 0.0625,  // 1/16 inch thick
    bevelEnabled: true,
    bevelThickness: 0.015625,  // 1/64 inch
    bevelSize: 0.015625,
    bevelSegments: 1
  }

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  geometry.center()

  return geometry
}

/**
 * Create specific stencil geometries
 */
export const STENCIL_GEOMETRIES = {
  fragile: () => {
    const geometry = createStencilGeometry('FRAGILE', 12, 8)
    // Add some detail - crack pattern
    return geometry
  },

  handling: () => {
    const geometry = createStencilGeometry('↑', 8, 8)
    // Add arrows pointing up
    return geometry
  },

  doNotStack: () => {
    const geometry = createStencilGeometry('DO NOT STACK', 10, 6)
    return geometry
  },

  centerGravity: () => {
    const geometry = createStencilGeometry('CG', 6, 6)
    return geometry
  }
}

/**
 * Materials for different component types
 */
export const COMPONENT_MATERIALS = {
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
    metalness: 0.1,
    roughness: 0.8,
    side: THREE.DoubleSide
  }),

  stencilHandling: new THREE.MeshStandardMaterial({
    color: 0x000000,  // Black
    metalness: 0.1,
    roughness: 0.8,
    side: THREE.DoubleSide
  })
}