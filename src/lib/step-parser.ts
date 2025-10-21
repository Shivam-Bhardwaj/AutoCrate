/**
 * STEP File Parser
 * Extracts bounding box dimensions and geometry information from STEP (ISO-10303-21) files
 */

export interface StepBoundingBox {
  min: { x: number; y: number; z: number }
  max: { x: number; y: number; z: number }
  dimensions: { width: number; height: number; depth: number }
  center: { x: number; y: number; z: number }
}

export interface StepFileInfo {
  fileName: string
  productName: string
  boundingBox: StepBoundingBox
  volume: number
  orientation: {
    primaryAxis: 'x' | 'y' | 'z'
    dimensions: { length: number; width: number; height: number }
  }
}

/**
 * Parse a STEP file and extract geometric information
 */
export class StepParser {
  /**
   * Parse STEP file content and extract bounding box
   */
  static parseBoundingBox(stepContent: string): StepBoundingBox {
    const points = this.extractCartesianPoints(stepContent)

    if (points.length === 0) {
      throw new Error('No CARTESIAN_POINT entities found in STEP file')
    }

    // Calculate bounding box from all points
    const min = {
      x: Math.min(...points.map(p => p.x)),
      y: Math.min(...points.map(p => p.y)),
      z: Math.min(...points.map(p => p.z)),
    }

    const max = {
      x: Math.max(...points.map(p => p.x)),
      y: Math.max(...points.map(p => p.y)),
      z: Math.max(...points.map(p => p.z)),
    }

    const dimensions = {
      width: max.x - min.x,
      height: max.y - min.y,
      depth: max.z - min.z,
    }

    const center = {
      x: (min.x + max.x) / 2,
      y: (min.y + max.y) / 2,
      z: (min.z + max.z) / 2,
    }

    return { min, max, dimensions, center }
  }

  /**
   * Extract all CARTESIAN_POINT entities from STEP file
   * Format: #123=CARTESIAN_POINT('',(X,Y,Z));
   */
  private static extractCartesianPoints(stepContent: string): Array<{ x: number; y: number; z: number }> {
    const points: Array<{ x: number; y: number; z: number }> = []

    // Regex to match CARTESIAN_POINT entities
    // Matches: CARTESIAN_POINT('',(1.23,4.56,7.89))
    const cartesianPointRegex = /CARTESIAN_POINT\s*\([^,]*,\s*\(\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s*,\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s*,\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s*\)\s*\)/g

    let match
    while ((match = cartesianPointRegex.exec(stepContent)) !== null) {
      const x = parseFloat(match[1])
      const y = parseFloat(match[2])
      const z = parseFloat(match[3])

      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        points.push({ x, y, z })
      }
    }

    return points
  }

  /**
   * Extract product name from STEP file
   * Format: #18=PRODUCT('KLIMP_#4','KLIMP_#4',' ',(#19));
   */
  static extractProductName(stepContent: string): string {
    const productRegex = /PRODUCT\s*\(\s*'([^']+)'/
    const match = stepContent.match(productRegex)
    return match ? match[1] : 'Unknown'
  }

  /**
   * Parse complete STEP file information
   */
  static parseStepFile(stepContent: string, fileName: string): StepFileInfo {
    const productName = this.extractProductName(stepContent)
    const boundingBox = this.parseBoundingBox(stepContent)

    // Calculate volume
    const volume = boundingBox.dimensions.width *
                   boundingBox.dimensions.height *
                   boundingBox.dimensions.depth

    // Determine orientation based on dimensions
    const dims = [
      { axis: 'x' as const, value: boundingBox.dimensions.width },
      { axis: 'y' as const, value: boundingBox.dimensions.height },
      { axis: 'z' as const, value: boundingBox.dimensions.depth },
    ]

    // Sort by dimension size
    dims.sort((a, b) => b.value - a.value)

    const orientation = {
      primaryAxis: dims[0].axis,
      dimensions: {
        length: dims[0].value,  // Longest dimension
        width: dims[1].value,   // Middle dimension
        height: dims[2].value,  // Shortest dimension
      }
    }

    return {
      fileName,
      productName,
      boundingBox,
      volume,
      orientation
    }
  }

  /**
   * Parse dimensions in inches (STEP files from NX are typically in inches)
   */
  static parseAsInches(stepContent: string, fileName: string): StepFileInfo {
    const info = this.parseStepFile(stepContent, fileName)

    // STEP files from NX are already in inches, but we can add unit detection later if needed
    return info
  }

  /**
   * Detect if a STEP file represents a flat stencil/decal
   * (one dimension is significantly smaller than the other two)
   */
  static isFlatStencil(info: StepFileInfo): boolean {
    const { dimensions } = info.boundingBox
    const sorted = [dimensions.width, dimensions.height, dimensions.depth].sort((a, b) => b - a)

    // If the smallest dimension is less than 10% of the largest, it's flat
    return sorted[2] < (sorted[0] * 0.1)
  }

  /**
   * Detect if a STEP file represents an L-shaped bracket (like a klimp)
   * This is a heuristic based on volume vs bounding box volume
   */
  static isLShaped(info: StepFileInfo): boolean {
    const { volume, boundingBox } = info
    const boundingVolume = boundingBox.dimensions.width *
                           boundingBox.dimensions.height *
                           boundingBox.dimensions.depth

    // L-shaped objects typically have 40-60% of their bounding box volume
    const ratio = volume / boundingVolume
    return ratio > 0.3 && ratio < 0.7
  }
}

/**
 * Helper to convert STEP file info to a standardized component descriptor
 */
export interface ComponentDescriptor {
  name: string
  type: 'klimp' | 'stencil' | 'fastener' | 'unknown'
  dimensions: { length: number; width: number; height: number }
  boundingBox: StepBoundingBox
  color: string  // Color for bounding box visualization
}

export function createComponentDescriptor(info: StepFileInfo): ComponentDescriptor {
  let type: ComponentDescriptor['type'] = 'unknown'
  let color = '#333333'  // Dark gray default

  const name = info.productName.toLowerCase()

  if (name.includes('klimp')) {
    type = 'klimp'
    color = '#2a2a2a'  // Very dark gray for klimps
  } else if (name.includes('stencil')) {
    type = 'stencil'
    color = '#1a1a1a'  // Nearly black for stencils
  } else if (name.includes('screw') || name.includes('washer')) {
    type = 'fastener'
    color = '#404040'  // Medium dark gray for fasteners
  }

  return {
    name: info.productName,
    type,
    dimensions: info.orientation.dimensions,
    boundingBox: info.boundingBox,
    color
  }
}
