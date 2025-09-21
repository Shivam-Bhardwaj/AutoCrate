// Klimp Calculation and Placement Logic
// Klimps are L-shaped fasteners that hold the front panel to adjacent panels
// Strategic placement for optimal structural strength:
// 1. Corner klimps for reinforcement
// 2. Klimps between vertical cleats for panel support
// 3. Symmetric side klimps at regular intervals

export interface Klimp {
  id: string
  edge: 'top' | 'left' | 'right' // Which edge of front panel
  position: number // Distance along the edge in inches
  x: number // 3D position
  y: number
  z: number
}

export interface KlimpLayout {
  panelName: string
  klimps: Klimp[]
  totalKlimps: number
}

export interface CleatInfo {
  position: number // Position along the edge
  width: number // Width of the cleat
}

export class KlimpCalculator {
  private static readonly SIDE_SPACING = 24 // 24" between side klimps
  private static readonly CLEAT_OFFSET = 1 // 1" from vertical cleat for corner klimps
  private static readonly BOTTOM_CLEAT_OFFSET = 2 // 2" above bottom horizontal cleat
  private static readonly MIN_CLEAT_SPACING = 1 // Minimum 1" from cleats
  private static readonly KLIMP_SIZE = 0.5 // Klimp width/thickness (symbolic L-shape)
  private static readonly CLEAT_WIDTH = 3.5 // Standard 1x4 cleat width

  /**
   * Calculate strategic klimp positions for the front panel
   * Strategy:
   * 1. Two klimps at each top corner
   * 2. Klimps between each vertical cleat on top edge
   * 3. Symmetric klimps every 24" on side edges
   *
   * @param panelWidth Width of the front panel
   * @param panelHeight Height of the front panel
   * @param verticalCleats Vertical cleats (intermediate/splice) on the panel
   * @param bottomCleatHeight Height of bottom horizontal cleat (typically 3.5")
   * @returns Optimized klimp layout
   */
  static calculateKlimpLayout(
    panelWidth: number,
    panelHeight: number,
    topCleats: CleatInfo[] = [],
    leftCleats: CleatInfo[] = [],
    rightCleats: CleatInfo[] = []
  ): KlimpLayout {
    const klimps: Klimp[] = []
    let klimpId = 0
    const bottomCleatHeight = 3.5 // Standard 1x4 cleat height

    // === TOP EDGE KLIMPS ===
    // Strategy: One klimp at each corner (1" from vertical cleat) and between vertical cleats

    // Sort vertical cleats by position
    const sortedVerticalCleats = [...topCleats].sort((a, b) => a.position - b.position)

    // Add corner klimps - ONE per corner
    // Position between edge cleat and first intermediate cleat for optimal placement

    let leftKlimpPosition = 0
    let rightKlimpPosition = panelWidth

    // If we have intermediate cleats, position klimps strategically
    if (sortedVerticalCleats.length >= 2) {
      // Find first intermediate cleat (not edge cleat)
      const firstIntermediateCleat = sortedVerticalCleats.find(c => c.position > this.CLEAT_WIDTH)
      const lastIntermediateCleat = sortedVerticalCleats.slice().reverse().find(c => c.position < panelWidth - this.CLEAT_WIDTH)

      if (firstIntermediateCleat) {
        // Position left corner klimp halfway between edge and first intermediate cleat
        // But ensure at least 1" from both cleats
        const midpoint = (this.CLEAT_WIDTH + firstIntermediateCleat.position) / 2
        leftKlimpPosition = midpoint

        // Ensure minimum clearance from cleats
        if (leftKlimpPosition < this.CLEAT_WIDTH + this.CLEAT_OFFSET) {
          leftKlimpPosition = this.CLEAT_WIDTH + this.CLEAT_OFFSET
        }
        if (leftKlimpPosition > firstIntermediateCleat.position - this.CLEAT_OFFSET) {
          leftKlimpPosition = firstIntermediateCleat.position - this.CLEAT_OFFSET
        }
      } else {
        // No intermediate cleats, just position 1" from edge cleat
        leftKlimpPosition = this.CLEAT_WIDTH + this.CLEAT_OFFSET
      }

      if (lastIntermediateCleat) {
        // Position right corner klimp halfway between last intermediate cleat and edge
        const midpoint = (lastIntermediateCleat.position + lastIntermediateCleat.width + (panelWidth - this.CLEAT_WIDTH)) / 2
        rightKlimpPosition = midpoint

        // Ensure minimum clearance from cleats
        if (rightKlimpPosition > panelWidth - this.CLEAT_WIDTH - this.CLEAT_OFFSET) {
          rightKlimpPosition = panelWidth - this.CLEAT_WIDTH - this.CLEAT_OFFSET
        }
        if (rightKlimpPosition < lastIntermediateCleat.position + lastIntermediateCleat.width + this.CLEAT_OFFSET) {
          rightKlimpPosition = lastIntermediateCleat.position + lastIntermediateCleat.width + this.CLEAT_OFFSET
        }
      } else {
        // No intermediate cleats, just position 1" from edge cleat
        rightKlimpPosition = panelWidth - this.CLEAT_WIDTH - this.CLEAT_OFFSET
      }
    } else {
      // No intermediate cleats, position near corners with clearance
      leftKlimpPosition = this.CLEAT_WIDTH + this.CLEAT_OFFSET
      rightKlimpPosition = panelWidth - this.CLEAT_WIDTH - this.CLEAT_OFFSET
    }

    // Add left corner klimp
    klimps.push({
      id: `KLIMP_TOP_${klimpId++}`,
      edge: 'top',
      position: leftKlimpPosition,
      x: leftKlimpPosition - panelWidth / 2,
      y: 0,
      z: panelHeight
    })

    // Add right corner klimp
    klimps.push({
      id: `KLIMP_TOP_${klimpId++}`,
      edge: 'top',
      position: rightKlimpPosition,
      x: rightKlimpPosition - panelWidth / 2,
      y: 0,
      z: panelHeight
    })

    // Add klimps between INTERMEDIATE vertical cleats only (skip the first gap)
    // Start from index 1 to skip the gap between edge cleat and first intermediate
    for (let i = 1; i < sortedVerticalCleats.length - 2; i++) {
      const cleat1 = sortedVerticalCleats[i]
      const cleat2 = sortedVerticalCleats[i + 1]

      // Skip if either cleat is an edge cleat
      if (cleat1.position <= this.CLEAT_WIDTH || cleat2.position >= panelWidth - this.CLEAT_WIDTH) {
        continue
      }

      // Calculate midpoint between cleats
      const midpoint = (cleat1.position + cleat1.width + cleat2.position) / 2

      // Only add if not too close to corner klimps (at least 6" away for better spacing)
      if (midpoint > leftKlimpPosition + 6 && midpoint < rightKlimpPosition - 6) {
        klimps.push({
          id: `KLIMP_TOP_${klimpId++}`,
          edge: 'top',
          position: midpoint,
          x: midpoint - panelWidth / 2,
          y: 0,
          z: panelHeight
        })
      }
    }

    // === SIDE EDGE KLIMPS ===
    // Strategy: Symmetric placement every 24" from top and bottom

    // Calculate positions for side klimps
    const sideKlimpPositions: number[] = []

    // Start from bottom (above bottom cleat)
    const bottomStart = bottomCleatHeight + this.BOTTOM_CLEAT_OFFSET
    const topStart = panelHeight - 4 // 4" from top to avoid interference

    // Calculate how many klimps we can fit
    const availableHeight = topStart - bottomStart
    const numSideKlimps = Math.floor(availableHeight / this.SIDE_SPACING) + 1

    // Distribute symmetrically
    if (numSideKlimps > 1) {
      const actualSpacing = availableHeight / (numSideKlimps - 1)
      for (let i = 0; i < numSideKlimps; i++) {
        sideKlimpPositions.push(bottomStart + i * actualSpacing)
      }
    } else if (numSideKlimps === 1) {
      // Single klimp in the middle
      sideKlimpPositions.push(bottomStart + availableHeight / 2)
    }

    // Add left edge klimps
    for (const pos of sideKlimpPositions) {
      klimps.push({
        id: `KLIMP_LEFT_${klimpId++}`,
        edge: 'left',
        position: pos,
        x: -panelWidth / 2,
        y: 0,
        z: pos
      })
    }

    // Add right edge klimps (same positions as left for symmetry)
    for (const pos of sideKlimpPositions) {
      klimps.push({
        id: `KLIMP_RIGHT_${klimpId++}`,
        edge: 'right',
        position: pos,
        x: panelWidth / 2,
        y: 0,
        z: pos
      })
    }

    return {
      panelName: 'FRONT_PANEL',
      klimps,
      totalKlimps: klimps.length
    }
  }

  /**
   * Calculate material usage for klimps
   */
  static calculateKlimpMaterial(layouts: KlimpLayout[]): {
    totalKlimps: number
    estimatedPackages: number // Klimps often come in packages
  } {
    let totalKlimps = 0

    for (const layout of layouts) {
      totalKlimps += layout.totalKlimps
    }

    // Assume klimps come in packages of 25
    const klimpsPerPackage = 25
    const estimatedPackages = Math.ceil(totalKlimps / klimpsPerPackage)

    return {
      totalKlimps,
      estimatedPackages
    }
  }
}