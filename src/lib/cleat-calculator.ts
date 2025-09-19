// Cleat Calculation and Placement Logic
// Cleats are 1x4 lumber strips for panel reinforcement
// Rules:
// 1. All panels have top, bottom, left, right cleats
// 2. Vertical cleats every 24" or less
// 3. Front/Back panels: horizontal cleats run full length, verticals sit between
// 4. Side panels: vertical cleats run full length, horizontals sit between
// 5. Cleats placed at all splice positions
// 6. When panels are rotated, cleats maintain symmetry with uniform gaps

export interface Cleat {
  id: string
  type: 'perimeter' | 'intermediate' | 'splice'
  orientation: 'horizontal' | 'vertical'
  position: 'top' | 'bottom' | 'left' | 'right' | 'intermediate'
  x: number      // Position in panel coordinate system
  y: number      // Position in panel coordinate system
  length: number // Length of the cleat
  width: number  // Width (typically 3.5" for 1x4)
  thickness: number // Thickness (typically 0.75" for 1x4)
}

export interface PanelCleatLayout {
  panelName: string
  panelWidth: number
  panelHeight: number
  cleats: Cleat[]
  isRotated: boolean // Whether panel uses rotated plywood
}

export class CleatCalculator {
  private static readonly CLEAT_WIDTH = 3.5    // 1x4 actual width
  private static readonly CLEAT_THICKNESS = 0.75 // 1x4 actual thickness
  private static readonly MAX_CLEAT_SPACING = 24 // Maximum 24" between cleats
  private static readonly MIN_EDGE_DISTANCE = 2  // Minimum 2" from edge for intermediate cleats

  /**
   * Calculate cleat layout for a panel
   * @param panelName Name of the panel (FRONT, BACK, LEFT_END, RIGHT_END, TOP)
   * @param panelWidth Width of the panel in inches
   * @param panelHeight Height of the panel in inches
   * @param splicePositions Array of splice positions from plywood layout
   * @param isRotated Whether the plywood is rotated 90 degrees
   * @returns Cleat layout for the panel
   */
  static calculateCleatLayout(
    panelName: string,
    panelWidth: number,
    panelHeight: number,
    splicePositions: { x: number; y: number; orientation: 'vertical' | 'horizontal' }[],
    isRotated: boolean = false
  ): PanelCleatLayout {
    const cleats: Cleat[] = []

    // Determine panel type and cleat arrangement
    const isFrontBack = panelName.includes('FRONT') || panelName.includes('BACK')
    const isSide = panelName.includes('LEFT_END') || panelName.includes('RIGHT_END')
    const isTop = panelName.includes('TOP')

    // Add perimeter cleats based on panel type
    if (isFrontBack || isTop) {
      // Front/Back/Top: Horizontal cleats run full length
      cleats.push(
        this.createPerimeterCleat(panelName, 'horizontal', 'bottom', 0, 0, panelWidth),
        this.createPerimeterCleat(panelName, 'horizontal', 'top', 0, panelHeight - this.CLEAT_WIDTH, panelWidth)
      )

      // Vertical cleats sit between horizontals
      cleats.push(
        this.createPerimeterCleat(panelName, 'vertical', 'left', 0, this.CLEAT_WIDTH, panelHeight - (2 * this.CLEAT_WIDTH)),
        this.createPerimeterCleat(panelName, 'vertical', 'right', panelWidth - this.CLEAT_WIDTH, this.CLEAT_WIDTH, panelHeight - (2 * this.CLEAT_WIDTH))
      )
    } else if (isSide) {
      // Side panels: Vertical cleats run full length
      cleats.push(
        this.createPerimeterCleat(panelName, 'vertical', 'left', 0, 0, panelHeight),
        this.createPerimeterCleat(panelName, 'vertical', 'right', panelWidth - this.CLEAT_WIDTH, 0, panelHeight)
      )

      // Horizontal cleats sit between verticals
      cleats.push(
        this.createPerimeterCleat(panelName, 'horizontal', 'bottom', this.CLEAT_WIDTH, 0, panelWidth - (2 * this.CLEAT_WIDTH)),
        this.createPerimeterCleat(panelName, 'horizontal', 'top', this.CLEAT_WIDTH, panelHeight - this.CLEAT_WIDTH, panelWidth - (2 * this.CLEAT_WIDTH))
      )
    }

    // Add intermediate vertical cleats (every 24" or less)
    const intermediateVerticalCleats = this.calculateIntermediateVerticalCleats(
      panelName,
      panelWidth,
      panelHeight,
      isSide,
      isRotated
    )
    cleats.push(...intermediateVerticalCleats)

    // Add splice cleats
    const spliceCleats = this.calculateSpliceCleats(
      panelName,
      panelWidth,
      panelHeight,
      splicePositions,
      isSide
    )
    cleats.push(...spliceCleats)

    return {
      panelName,
      panelWidth,
      panelHeight,
      cleats,
      isRotated
    }
  }

  /**
   * Create a perimeter cleat
   */
  private static createPerimeterCleat(
    panelName: string,
    orientation: 'horizontal' | 'vertical',
    position: 'top' | 'bottom' | 'left' | 'right',
    x: number,
    y: number,
    length: number
  ): Cleat {
    return {
      id: `${panelName}_CLEAT_${position.toUpperCase()}`,
      type: 'perimeter',
      orientation,
      position,
      x,
      y,
      length,
      width: this.CLEAT_WIDTH,
      thickness: this.CLEAT_THICKNESS
    }
  }

  /**
   * Calculate intermediate vertical cleats
   */
  private static calculateIntermediateVerticalCleats(
    panelName: string,
    panelWidth: number,
    panelHeight: number,
    isSide: boolean,
    isRotated: boolean
  ): Cleat[] {
    const cleats: Cleat[] = []

    // Calculate spacing between verticals
    const availableWidth = panelWidth - (2 * this.CLEAT_WIDTH) // Subtract edge cleats
    const minCleats = Math.ceil(availableWidth / this.MAX_CLEAT_SPACING) - 1 // -1 because we have edge cleats

    if (minCleats > 0) {
      // Always distribute evenly for symmetry, especially important when rotated
      const spacing = availableWidth / (minCleats + 1)

      for (let i = 0; i < minCleats; i++) {
        const x = this.CLEAT_WIDTH + ((i + 1) * spacing) - (this.CLEAT_WIDTH / 2)

        // Vertical length depends on panel type
        const yStart = isSide ? 0 : this.CLEAT_WIDTH
        const length = isSide ? panelHeight : panelHeight - (2 * this.CLEAT_WIDTH)

        cleats.push({
          id: `${panelName}_CLEAT_VERT_${i + 1}`,
          type: 'intermediate',
          orientation: 'vertical',
          position: 'intermediate',
          x,
          y: yStart,
          length,
          width: this.CLEAT_WIDTH,
          thickness: this.CLEAT_THICKNESS
        })
      }
    }

    return cleats
  }

  /**
   * Calculate cleats for splice positions
   */
  private static calculateSpliceCleats(
    panelName: string,
    panelWidth: number,
    panelHeight: number,
    splicePositions: { x: number; y: number; orientation: 'vertical' | 'horizontal' }[],
    isSide: boolean
  ): Cleat[] {
    const cleats: Cleat[] = []

    splicePositions.forEach((splice, index) => {
      if (splice.orientation === 'vertical') {
        // Vertical splice cleat
        const yStart = isSide ? 0 : this.CLEAT_WIDTH
        const length = isSide ? panelHeight : panelHeight - (2 * this.CLEAT_WIDTH)

        cleats.push({
          id: `${panelName}_CLEAT_SPLICE_V_${index}`,
          type: 'splice',
          orientation: 'vertical',
          position: 'intermediate',
          x: splice.x - (this.CLEAT_WIDTH / 2), // Center cleat on splice
          y: yStart,
          length,
          width: this.CLEAT_WIDTH,
          thickness: this.CLEAT_THICKNESS
        })
      } else {
        // Horizontal splice cleat
        const xStart = isSide ? this.CLEAT_WIDTH : 0
        const length = isSide ? panelWidth - (2 * this.CLEAT_WIDTH) : panelWidth

        cleats.push({
          id: `${panelName}_CLEAT_SPLICE_H_${index}`,
          type: 'splice',
          orientation: 'horizontal',
          position: 'intermediate',
          x: xStart,
          y: splice.y - (this.CLEAT_WIDTH / 2), // Center cleat on splice
          length,
          width: this.CLEAT_WIDTH,
          thickness: this.CLEAT_THICKNESS
        })
      }
    })

    return cleats
  }

  /**
   * Generate NX expressions for cleats
   */
  static generateCleatExpressions(layout: PanelCleatLayout): string {
    let output = `# Cleat Layout for ${layout.panelName}\n`
    output += `# Panel Size: ${layout.panelWidth}" x ${layout.panelHeight}"\n`
    output += `# Number of cleats: ${layout.cleats.length}\n`
    output += `# Rotated: ${layout.isRotated ? 'Yes' : 'No'}\n\n`

    // Group cleats by type
    const perimeterCleats = layout.cleats.filter(c => c.type === 'perimeter')
    const intermediateCleats = layout.cleats.filter(c => c.type === 'intermediate')
    const spliceCleats = layout.cleats.filter(c => c.type === 'splice')

    // Generate perimeter cleats
    if (perimeterCleats.length > 0) {
      output += `# Perimeter Cleats\n`
      perimeterCleats.forEach(cleat => {
        output += `${cleat.id}_X=${cleat.x.toFixed(3)}\n`
        output += `${cleat.id}_Y=${cleat.y.toFixed(3)}\n`
        output += `${cleat.id}_LENGTH=${cleat.length.toFixed(3)}\n`
        output += `${cleat.id}_WIDTH=${cleat.width.toFixed(3)}\n`
        output += `${cleat.id}_THICKNESS=${cleat.thickness.toFixed(3)}\n\n`
      })
    }

    // Generate intermediate cleats
    if (intermediateCleats.length > 0) {
      output += `# Intermediate Cleats (24" max spacing)\n`
      intermediateCleats.forEach(cleat => {
        output += `${cleat.id}_X=${cleat.x.toFixed(3)}\n`
        output += `${cleat.id}_Y=${cleat.y.toFixed(3)}\n`
        output += `${cleat.id}_LENGTH=${cleat.length.toFixed(3)}\n`
        output += `${cleat.id}_WIDTH=${cleat.width.toFixed(3)}\n`
        output += `${cleat.id}_THICKNESS=${cleat.thickness.toFixed(3)}\n\n`
      })
    }

    // Generate splice cleats
    if (spliceCleats.length > 0) {
      output += `# Splice Reinforcement Cleats\n`
      spliceCleats.forEach(cleat => {
        output += `${cleat.id}_X=${cleat.x.toFixed(3)}\n`
        output += `${cleat.id}_Y=${cleat.y.toFixed(3)}\n`
        output += `${cleat.id}_LENGTH=${cleat.length.toFixed(3)}\n`
        output += `${cleat.id}_WIDTH=${cleat.width.toFixed(3)}\n`
        output += `${cleat.id}_THICKNESS=${cleat.thickness.toFixed(3)}\n\n`
      })
    }

    return output
  }

  /**
   * Calculate material usage for cleats
   */
  static calculateCleatMaterial(layouts: PanelCleatLayout[]): {
    totalCleats: number
    totalLinearFeet: number
    estimated1x4Count: number // Assuming 8ft 1x4s
  } {
    let totalCleats = 0
    let totalLinearInches = 0

    layouts.forEach(layout => {
      totalCleats += layout.cleats.length
      layout.cleats.forEach(cleat => {
        totalLinearInches += cleat.length
      })
    })

    const totalLinearFeet = totalLinearInches / 12
    const estimated1x4Count = Math.ceil(totalLinearFeet / 8) // 8ft boards

    return {
      totalCleats,
      totalLinearFeet,
      estimated1x4Count
    }
  }
}

// Export wrapper function for API usage
export function calculateCleatPositions(
  panelDimensions: { width: number; height: number },
  panelName: string = 'PANEL',
  splicePositions: { x: number; y: number; orientation: 'vertical' | 'horizontal' }[] = []
): PanelCleatLayout {
  return CleatCalculator.calculateCleatLayout(
    panelName,
    panelDimensions.width,
    panelDimensions.height,
    splicePositions,
    false
  );
}