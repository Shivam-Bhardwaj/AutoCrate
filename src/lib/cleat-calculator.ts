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
  private static readonly CLEAT_WIDTH = 3.5    // 1x4 nominal is 0.75" x 3.5" actual
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

    // Calculate all vertical cleat positions (splice positions + intermediate as needed)
    const verticalCleatPositions = this.calculateVerticalCleatPositions(
      panelWidth,
      splicePositions
    )

    // Create vertical cleats at calculated positions
    verticalCleatPositions.forEach((xPos, index) => {
      // Check if this cleat is centered over a splice
      const cleatCenter = xPos + (this.CLEAT_WIDTH / 2)
      const isSplicePosition = splicePositions.some(s =>
        s.orientation === 'vertical' && Math.abs(s.x - cleatCenter) < 1
      )

      // Vertical length depends on panel type
      // For side panels: intermediate cleats are sandwiched between top and bottom cleats
      const yStart = isSide ? this.CLEAT_WIDTH : this.CLEAT_WIDTH
      const length = panelHeight - (2 * this.CLEAT_WIDTH)

      cleats.push({
        id: `${panelName}_CLEAT_V_${index}`,
        type: isSplicePosition ? 'splice' : 'intermediate',
        orientation: 'vertical',
        position: 'intermediate',
        x: xPos, // Position is already correct from calculateVerticalCleatPositions
        y: yStart,
        length,
        width: this.CLEAT_WIDTH,
        thickness: this.CLEAT_THICKNESS
      })
    })

    // Add horizontal cleats at splice positions (cut to fit between verticals)
    // For ALL panels that have horizontal splices
    const allVerticalCleats = cleats.filter(c => c.orientation === 'vertical')

    // Get horizontal splice positions - center cleats over splices
    const horizontalPositions = splicePositions
      .filter(s => s.orientation === 'horizontal')
      .map(s => s.y) // Y position of the splice

    // Generate cut horizontal cleats for each position
    if (horizontalPositions.length > 0) {
      const horizontalCleats = this.calculateCutHorizontalCleats(
        panelName,
        panelWidth,
        panelHeight,
        horizontalPositions,
        allVerticalCleats
      )
      cleats.push(...horizontalCleats)
    }

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
   * Calculate vertical cleat positions without duplicating perimeter cleats:
   * 1. Treat perimeter cleats as spacing boundaries only
   * 2. Center cleats over vertical splices when they respect edge clearance
   * 3. Fill remaining spans larger than 24" with intermediate cleats
   */
  private static calculateVerticalCleatPositions(
    panelWidth: number,
    splicePositions: { x: number; y: number; orientation: 'vertical' | 'horizontal' }[]
  ): number[] {
    // Candidate positions for additional vertical cleats (perimeter cleats are handled separately)
    const candidatePositions: number[] = []

    // Perimeter cleats act as boundaries for spacing checks
    const perimeterPositions = [0, panelWidth - this.CLEAT_WIDTH]

    // Get vertical splice positions
    const verticalSplices = splicePositions
      .filter(s => s.orientation === 'vertical')
      .map(s => s.x)
      .sort((a, b) => a - b)

    // Add cleats centered over vertical splices
    for (const spliceX of verticalSplices) {
      const cleatX = spliceX - this.CLEAT_WIDTH / 2

      if (cleatX >= 0 && cleatX + this.CLEAT_WIDTH <= panelWidth) {
        if (
          cleatX > this.MIN_EDGE_DISTANCE &&
          cleatX < panelWidth - this.CLEAT_WIDTH - this.MIN_EDGE_DISTANCE
        ) {
          candidatePositions.push(cleatX)
        }
      }
    }

    // Evaluate gaps between perimeter boundaries and candidate cleats
    const basePositions = [...perimeterPositions, ...candidatePositions]
    const sortedPositions = [...new Set(basePositions.map(p => Math.round(p * 100) / 100))]
      .sort((a, b) => a - b)

    const intermediatePositions: number[] = []

    for (let i = 0; i < sortedPositions.length - 1; i++) {
      const currentCleatEnd = sortedPositions[i] + this.CLEAT_WIDTH
      const nextCleatStart = sortedPositions[i + 1]
      const gap = nextCleatStart - currentCleatEnd

      if (gap > this.MAX_CLEAT_SPACING) {
        const numIntermediates = Math.ceil(gap / this.MAX_CLEAT_SPACING) - 1
        const spacing = gap / (numIntermediates + 1)

        for (let j = 1; j <= numIntermediates; j++) {
          const intermediateX = currentCleatEnd + j * spacing - this.CLEAT_WIDTH / 2

          if (
            intermediateX > this.MIN_EDGE_DISTANCE &&
            intermediateX + this.CLEAT_WIDTH < panelWidth - this.MIN_EDGE_DISTANCE
          ) {
            intermediatePositions.push(intermediateX)
          }
        }
      }
    }

    const allPositions = [...candidatePositions, ...intermediatePositions]
    const uniquePositions = [...new Set(allPositions.map(p => Math.round(p * 100) / 100))]
      .sort((a, b) => a - b)

    return uniquePositions
  }

  /**
   * Calculate horizontal cleats cut to fit between vertical cleats
   */
  private static calculateCutHorizontalCleats(
    panelName: string,
    panelWidth: number,
    panelHeight: number,
    horizontalPositions: number[],
    verticalCleats: Cleat[]
  ): Cleat[] {
    const cleats: Cleat[] = []

    // Sort vertical cleats by X position
    const sortedVerticals = verticalCleats.sort((a, b) => a.x - b.x)

    // For each horizontal position, create cleats that fit between verticals
    horizontalPositions.forEach((yPosition, rowIndex) => {
      let cleatIndex = 0

      // Add left edge cleat if there's space before first vertical
      if (sortedVerticals.length === 0) {
        // No verticals, create full-width cleat
        cleats.push({
          id: `${panelName}_CLEAT_H_INTER_${rowIndex}_${cleatIndex}`,
          type: 'intermediate',
          orientation: 'horizontal',
          position: 'intermediate',
          x: 0,
          y: yPosition - (this.CLEAT_WIDTH / 2),
          length: panelWidth,
          width: this.CLEAT_WIDTH,
          thickness: this.CLEAT_THICKNESS
        })
      } else {
        // Add cleat before first vertical if there's space
        if (sortedVerticals[0].x > 0.5) {
          cleats.push({
            id: `${panelName}_CLEAT_H_INTER_${rowIndex}_${cleatIndex++}`,
            type: 'intermediate',
            orientation: 'horizontal',
            position: 'intermediate',
            x: 0,
            y: yPosition - (this.CLEAT_WIDTH / 2),
            length: sortedVerticals[0].x,
            width: this.CLEAT_WIDTH,
            thickness: this.CLEAT_THICKNESS
          })
        }

        // Add cleats between each pair of verticals
        for (let i = 0; i < sortedVerticals.length - 1; i++) {
          const startX = sortedVerticals[i].x + this.CLEAT_WIDTH
          const endX = sortedVerticals[i + 1].x
          const length = endX - startX

          if (length > 0.5) { // Only add if there's meaningful space
            cleats.push({
              id: `${panelName}_CLEAT_H_INTER_${rowIndex}_${cleatIndex++}`,
              type: 'intermediate',
              orientation: 'horizontal',
              position: 'intermediate',
              x: startX,
              y: yPosition - (this.CLEAT_WIDTH / 2),
              length: length,
              width: this.CLEAT_WIDTH,
              thickness: this.CLEAT_THICKNESS
            })
          }
        }

        // Add right edge cleat if there's space after last vertical
        const lastVertical = sortedVerticals[sortedVerticals.length - 1]
        const startX = lastVertical.x + this.CLEAT_WIDTH
        const remainingLength = panelWidth - startX

        if (remainingLength > 0.5) {
          cleats.push({
            id: `${panelName}_CLEAT_H_INTER_${rowIndex}_${cleatIndex++}`,
            type: 'intermediate',
            orientation: 'horizontal',
            position: 'intermediate',
            x: startX,
            y: yPosition - (this.CLEAT_WIDTH / 2),
            length: remainingLength,
            width: this.CLEAT_WIDTH,
            thickness: this.CLEAT_THICKNESS
          })
        }
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
