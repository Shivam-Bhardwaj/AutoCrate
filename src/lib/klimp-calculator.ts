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
  private static readonly EDGE_MIN_SPACING = 18 // Minimum 18" between hardware
  private static readonly EDGE_MAX_SPACING = 24 // Maximum 24" between hardware
  private static readonly CLEAT_OFFSET = 1 // 1" from vertical cleat for corner klimps
  private static readonly BOTTOM_CLEAT_OFFSET = 2 // 2" above bottom horizontal cleat
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
    _topCleats: CleatInfo[] = [],
    _leftCleats: CleatInfo[] = [],
    _rightCleats: CleatInfo[] = []
  ): KlimpLayout {
    const klimps: Klimp[] = []
    let klimpId = 0
    const bottomCleatHeight = 3.5 // Standard 1x4 cleat height

    // === TOP EDGE KLIMPS ===
    const topStart = this.CLEAT_WIDTH + this.CLEAT_OFFSET
    const topEnd = panelWidth - this.CLEAT_WIDTH - this.CLEAT_OFFSET
    const topPositions = this.generatePositionsWithSpacing(
      topStart,
      topEnd,
      this.EDGE_MIN_SPACING,
      this.EDGE_MAX_SPACING,
      2
    )

    for (const position of topPositions) {
      klimps.push({
        id: `KLIMP_TOP_${klimpId++}`,
        edge: 'top',
        position,
        x: position - panelWidth / 2,
        y: 0,
        z: panelHeight
      })
    }

    // === SIDE EDGE KLIMPS ===
    // Strategy: Symmetric placement with 18"-24" spacing from bottom and top

    const bottomStart = bottomCleatHeight + this.BOTTOM_CLEAT_OFFSET
    const sideTopLimit = panelHeight - 4 // 4" from top to avoid interference

    const sidePositions = this.generatePositionsWithSpacing(
      bottomStart,
      sideTopLimit,
      this.EDGE_MIN_SPACING,
      this.EDGE_MAX_SPACING,
      2
    )

    // Add left edge klimps
    for (const pos of sidePositions) {
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
    for (const pos of sidePositions) {
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

  private static generatePositionsWithSpacing(
    start: number,
    end: number,
    minSpacing: number,
    maxSpacing: number,
    minCount: number
  ): number[] {
    const tolerance = 1e-6

    if (end <= start) {
      return [start]
    }

    const span = end - start
    if (span < minSpacing && minCount <= 1) {
      return [start + span / 2]
    }

    const baseCount = Math.max(minCount, span >= minSpacing ? 2 : 1)
    const maxCandidate = Math.max(baseCount, Math.floor(span / minSpacing) + 2)
    const targetSpacing = (minSpacing + maxSpacing) / 2

    let bestPositions: number[] | null = null
    let bestScore = Number.POSITIVE_INFINITY
    let bestCount = Number.POSITIVE_INFINITY

    for (let count = baseCount; count <= maxCandidate + 4; count++) {
      if (count <= 1) {
        continue
      }

      const intervals = count - 1
      const minOffset = Math.max(0, (span - maxSpacing * intervals) / 2)
      const maxOffset = Math.max(0, (span - minSpacing * intervals) / 2)

      if (minOffset > maxOffset + tolerance) {
        continue
      }

      let offset = (span - targetSpacing * intervals) / 2
      offset = Math.max(minOffset, Math.min(maxOffset, offset))

      if (offset > span / 2) {
        continue
      }

      const run = span - 2 * offset
      if (run < -tolerance) {
        continue
      }

      const spacing = intervals > 0 ? run / intervals : 0

      if (spacing < minSpacing - tolerance || spacing > maxSpacing + tolerance) {
        continue
      }

      const actualStart = start + offset
      const positions = Array.from({ length: count }, (_, index) => actualStart + index * spacing)
      const score = Math.abs(spacing - targetSpacing)

      if (
        !bestPositions ||
        score < bestScore - tolerance ||
        (Math.abs(score - bestScore) <= tolerance && count < bestCount)
      ) {
        bestPositions = positions
        bestScore = score
        bestCount = count
      }
    }

    if (!bestPositions) {
      if (span < minSpacing - tolerance) {
        return [start + span / 2]
      }

      const count = Math.max(baseCount, 2)
      const intervals = count - 1
      const spacing = Math.min(maxSpacing, Math.max(span / intervals, minSpacing))
      const offset = Math.max(0, (span - spacing * intervals) / 2)
      const actualStart = start + offset
      bestPositions = Array.from({ length: count }, (_, index) => actualStart + index * spacing)
    }

    return bestPositions.map(value => Number(value.toFixed(6)))
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
