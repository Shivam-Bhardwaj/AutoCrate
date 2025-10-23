// Klimp Calculation and Placement Logic
// Klimps are L-shaped fasteners that hold the front panel to adjacent panels
// Strategic placement for optimal structural strength:
// 1. Corner klimps for reinforcement
// 2. Klimps between vertical cleats for panel support
// 3. Symmetric side klimps at regular intervals

import {
  FASTENER_STANDARDS,
  CLEAT_STANDARDS
} from './crate-constants'

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

interface BlockInterval {
  start: number
  end: number
}

export class KlimpCalculator {
  private static readonly EDGE_MIN_SPACING = FASTENER_STANDARDS.KLIMP.EDGE_MIN_SPACING // Minimum 18" between hardware
  private static readonly EDGE_MAX_SPACING = FASTENER_STANDARDS.KLIMP.EDGE_MAX_SPACING // Maximum 24" between hardware
  private static readonly CLEAT_OFFSET = 1 // 1" from vertical cleat for corner klimps
  private static readonly BOTTOM_CLEAT_OFFSET = 2 // 2" above bottom horizontal cleat
  private static readonly CLEAT_WIDTH = CLEAT_STANDARDS.DEFAULT_DIMENSIONS.width // Standard 1x4 cleat width
  private static readonly TOP_CLEAT_CLEARANCE = CLEAT_STANDARDS.DEFAULT_DIMENSIONS.width + 1.5
  private static readonly SIDE_CLEAT_CLEARANCE = CLEAT_STANDARDS.DEFAULT_DIMENSIONS.width + 2.0
  private static readonly POSITION_TOLERANCE = 1e-6

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
    const bottomCleatHeight = CLEAT_STANDARDS.DEFAULT_DIMENSIONS.width // Standard 1x4 cleat height

    // === TOP EDGE KLIMPS ===
    const topStart = this.CLEAT_WIDTH + this.CLEAT_OFFSET
    const topEnd = panelWidth - this.CLEAT_WIDTH - this.CLEAT_OFFSET
    const topBlocked = this.buildBlockedIntervals(topCleats, topStart, topEnd, this.TOP_CLEAT_CLEARANCE)
    const topPositions = this.generateEdgePositions(
      topStart,
      topEnd,
      topBlocked,
      this.EDGE_MIN_SPACING,
      this.EDGE_MAX_SPACING
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
    // Strategy: Symmetric placement with 16"-24" spacing from bottom
    // Keep away from top to avoid interference with top edge klimps

    const bottomStart = bottomCleatHeight + this.BOTTOM_CLEAT_OFFSET
    const sideTopLimit = panelHeight - 8 // 8" from top to avoid corner klimp interference

    const sideBlocked = this.buildBlockedIntervals(leftCleats.concat(rightCleats), bottomStart, sideTopLimit, this.SIDE_CLEAT_CLEARANCE)
    const sidePositions = this.generateEdgePositions(
      bottomStart,
      sideTopLimit,
      sideBlocked,
      this.EDGE_MIN_SPACING,
      this.EDGE_MAX_SPACING
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

  private static generateEdgePositions(
    start: number,
    end: number,
    blocked: BlockInterval[],
    minSpacing: number,
    maxSpacing: number
  ): number[] {
    const tolerance = 1e-4
    const span = end - start

    if (span <= tolerance) {
      return [this.roundPosition(start)]
    }

    // Always place klimps at extremities (like lag screws)
    if (span <= maxSpacing + tolerance) {
      // Short edge: just place at start and end
      return [this.roundPosition(start), this.roundPosition(end)]
    }

    // Calculate optimal number of intervals for better distribution
    // Target spacing: 18" (closer to minimum for better support and load distribution)
    const targetSpacing = 18
    const minIntervals = Math.ceil(span / maxSpacing)  // Minimum needed to respect max spacing
    const maxIntervals = Math.floor(span / minSpacing) // Maximum possible respecting min spacing
    const targetIntervals = Math.round(span / targetSpacing) // Optimal for target spacing

    // Choose the best interval count: prefer target, but stay within bounds
    let intervalCount = Math.max(minIntervals, Math.min(maxIntervals, targetIntervals))
    intervalCount = Math.max(1, intervalCount)

    let actualSpacing = span / intervalCount

    // Verify spacing is within bounds
    if (actualSpacing < minSpacing - tolerance || actualSpacing > maxSpacing + tolerance) {
      // Fallback to minimum intervals if target doesn't work
      intervalCount = minIntervals
      actualSpacing = span / intervalCount
    }

    if (intervalCount <= 1) {
      return [this.roundPosition(start), this.roundPosition(end)]
    }

    // Generate evenly spaced positions (start, middle points, end)
    const step = span / intervalCount
    const preliminaryPositions: number[] = []

    for (let i = 0; i <= intervalCount; i++) {
      let position = start + i * step

      // Check if this position is blocked by a cleat
      position = this.avoidBlockedIntervals(position, blocked, minSpacing)

      preliminaryPositions.push(this.roundPosition(position))
    }

    // Filter out positions that are too close together after shifting
    const finalPositions: number[] = []
    for (let i = 0; i < preliminaryPositions.length; i++) {
      const position = preliminaryPositions[i]

      // Always keep first and last positions (corner klimps)
      if (i === 0 || i === preliminaryPositions.length - 1) {
        finalPositions.push(position)
        continue
      }

      // Check spacing with previous position
      const prevPosition = finalPositions[finalPositions.length - 1]
      const spacing = position - prevPosition

      // Only add if spacing is adequate (respects minimum spacing)
      if (spacing >= minSpacing - tolerance) {
        finalPositions.push(position)
      }
      // Otherwise skip this klimp - it's too close after cleat avoidance
    }

    return finalPositions
  }

  /**
   * Shift a position if it's blocked by a cleat
   * Try to move it just outside the blocked area
   */
  private static avoidBlockedIntervals(
    position: number,
    blocked: BlockInterval[],
    minShift: number
  ): number {
    for (const interval of blocked) {
      if (position >= interval.start && position <= interval.end) {
        // Position is blocked, try to shift it
        const shiftAfter = interval.end + 0.5
        const shiftBefore = interval.start - 0.5

        // Prefer shifting to the closer side
        if (Math.abs(shiftAfter - position) <= Math.abs(shiftBefore - position)) {
          return shiftAfter
        } else {
          return shiftBefore
        }
      }
    }
    return position
  }

  private static buildBlockedIntervals(
    cleats: CleatInfo[],
    start: number,
    end: number,
    clearance: number
  ): BlockInterval[] {
    const intervals: BlockInterval[] = []

    for (const cleat of cleats) {
      const blockStart = Math.max(start, cleat.position - clearance)
      const blockEnd = Math.min(end, cleat.position + cleat.width + clearance)
      if (blockEnd - blockStart > this.POSITION_TOLERANCE) {
        intervals.push({ start: blockStart, end: blockEnd })
      }
    }

    intervals.sort((a, b) => a.start - b.start)

    // Merge overlapping intervals
    const merged: BlockInterval[] = []
    for (const interval of intervals) {
      if (merged.length === 0) {
        merged.push({ ...interval })
        continue
      }

      const last = merged[merged.length - 1]
      if (interval.start <= last.end + this.POSITION_TOLERANCE) {
        last.end = Math.max(last.end, interval.end)
      } else {
        merged.push({ ...interval })
      }
    }

    return merged
  }

  private static roundPosition(value: number): number {
    return Number(value.toFixed(6))
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
