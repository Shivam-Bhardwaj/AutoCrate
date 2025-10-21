/**
 * Orientation Detection Logic for STEP Files
 * Provides intelligent orientation detection based on STEP file geometry
 */

import stepCatalog from './step-file-catalog.json'
import { StepBoundingBox } from '@/lib/step-parser'

export interface OrientationInfo {
  rotation: { x: number; y: number; z: number }  // Euler angles in radians
  offset: { x: number; y: number; z: number }     // Position offset from origin
  normalVector: { x: number; y: number; z: number } // Surface normal
}

export interface PlacementContext {
  edge: 'top' | 'left' | 'right' | 'front' | 'back'
  surfaceNormal: { x: number; y: number; z: number }
  panelDimensions?: { width: number; height: number; depth: number }
}

/**
 * Orientation detector for STEP file components
 */
export class OrientationDetector {
  private static catalog = stepCatalog as Record<string, {
    name: string
    type: string
    dimensions: { length: number; width: number; height: number }
    boundingBox: StepBoundingBox
    color: string
  }>

  /**
   * Get the dimensions of a STEP component
   */
  static getDimensions(stepFileName: string) {
    const entry = this.catalog[stepFileName]
    if (!entry) {
      console.warn(`STEP file not found in catalog: ${stepFileName}`)
      return null
    }
    return entry.dimensions
  }

  /**
   * Calculate orientation for a klimp based on edge placement
   */
  static getKlimpOrientation(context: PlacementContext): OrientationInfo {
    const klimp = this.catalog['KLIMP_#4.stp']

    if (!klimp) {
      throw new Error('Klimp not found in catalog')
    }

    // Klimp dimensions from STEP file:
    // Length: ~4.92" (longest dimension - vertical when mounted)
    // Width: ~3.92" (medium dimension - horizontal reach)
    // Height: ~1.15" (thickness)

    let rotation = { x: 0, y: 0, z: 0 }
    let offset = { x: 0, y: 0, z: 0 }

    switch (context.edge) {
      case 'top':
        // Top edge: klimp stands vertically, bridging top panel to front panel
        // Longer side (4.92") vertical along Z axis
        // Shorter side (3.92") horizontal along Y axis
        rotation = { x: 0, y: 0, z: 0 }
        offset = { x: 0, y: klimp.dimensions.width / 2, z: -klimp.dimensions.length / 2 }
        break

      case 'left':
        // Left edge: klimp rotated 90° around Z axis
        // Bridges left panel to front panel
        rotation = { x: 0, y: Math.PI / 2, z: Math.PI / 2 }
        offset = { x: -klimp.dimensions.width / 2, y: 0, z: -klimp.dimensions.length / 2 }
        break

      case 'right':
        // Right edge: klimp rotated -90° around Z axis
        // Bridges right panel to front panel
        rotation = { x: 0, y: -Math.PI / 2, z: -Math.PI / 2 }
        offset = { x: klimp.dimensions.width / 2, y: 0, z: -klimp.dimensions.length / 2 }
        break

      case 'front':
        rotation = { x: 0, y: 0, z: 0 }
        break

      case 'back':
        rotation = { x: 0, y: Math.PI, z: 0 }
        break
    }

    return {
      rotation,
      offset,
      normalVector: context.surfaceNormal
    }
  }

  /**
   * Calculate orientation for a stencil based on panel placement
   */
  static getStencilOrientation(
    stepFileName: string,
    context: PlacementContext
  ): OrientationInfo {
    const stencil = this.catalog[stepFileName]

    if (!stencil) {
      throw new Error(`Stencil not found in catalog: ${stepFileName}`)
    }

    // Stencils are flat (depth ~0) and need to be placed on panel surfaces
    // The longest dimension is typically horizontal
    // The medium dimension is vertical

    let rotation = { x: 0, y: 0, z: 0 }
    let offset = { x: 0, y: 0, z: 0 }

    // Stencils need to be rotated to face outward from the panel
    switch (context.edge) {
      case 'front':
        // Front panel faces -Y direction in NX coordinates
        rotation = { x: 0, y: 0, z: 0 }
        offset = { x: 0, y: 0, z: 0.01 }  // Small offset from surface
        break

      case 'back':
        // Back panel faces +Y direction
        rotation = { x: 0, y: Math.PI, z: 0 }
        offset = { x: 0, y: 0, z: 0.01 }
        break

      case 'left':
        // Left panel faces -X direction
        rotation = { x: 0, y: -Math.PI / 2, z: 0 }
        offset = { x: 0.01, y: 0, z: 0 }
        break

      case 'right':
        // Right panel faces +X direction
        rotation = { x: 0, y: Math.PI / 2, z: 0 }
        offset = { x: 0.01, y: 0, z: 0 }
        break

      case 'top':
        // Top panel faces +Z direction
        rotation = { x: Math.PI / 2, y: 0, z: 0 }
        offset = { x: 0, y: 0, z: 0.01 }
        break
    }

    return {
      rotation,
      offset,
      normalVector: context.surfaceNormal
    }
  }

  /**
   * Get bounding box information for a STEP file
   */
  static getBoundingBox(stepFileName: string): StepBoundingBox | null {
    const entry = this.catalog[stepFileName]
    return entry?.boundingBox || null
  }

  /**
   * Check if a component is a flat stencil
   */
  static isFlatStencil(stepFileName: string): boolean {
    const entry = this.catalog[stepFileName]
    if (!entry) return false

    // A component is flat if its smallest dimension is near zero
    return entry.dimensions.height < 0.1
  }

  /**
   * Get all available stencils in catalog
   */
  static getAvailableStencils(): Array<{ fileName: string; name: string; dimensions: any }> {
    return Object.entries(this.catalog)
      .filter(([_, entry]) => entry.type === 'stencil')
      .map(([fileName, entry]) => ({
        fileName,
        name: entry.name,
        dimensions: entry.dimensions
      }))
  }

  /**
   * Get the klimp entry
   */
  static getKlimp(): { fileName: string; name: string; dimensions: any } | null {
    const entry = Object.entries(this.catalog).find(([_, e]) => e.type === 'klimp')
    if (!entry) return null

    return {
      fileName: entry[0],
      name: entry[1].name,
      dimensions: entry[1].dimensions
    }
  }

  /**
   * Calculate rotation matrix from Euler angles
   */
  static eulerToRotationMatrix(rotation: { x: number; y: number; z: number }): number[][] {
    const { x: rx, y: ry, z: rz } = rotation

    const cx = Math.cos(rx), sx = Math.sin(rx)
    const cy = Math.cos(ry), sy = Math.sin(ry)
    const cz = Math.cos(rz), sz = Math.sin(rz)

    // ZYX rotation order (standard for most CAD systems)
    return [
      [cy * cz, -cy * sz, sy],
      [sx * sy * cz + cx * sz, -sx * sy * sz + cx * cz, -sx * cy],
      [-cx * sy * cz + sx * sz, cx * sy * sz + sx * cz, cx * cy]
    ]
  }
}
