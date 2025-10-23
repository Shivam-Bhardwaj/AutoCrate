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
    // Strategy: Symmetric placement with 18"-24" spacing from bottom and top

    const bottomStart = bottomCleatHeight + this.BOTTOM_CLEAT_OFFSET
    const sideTopLimit = panelHeight - 4 // 4" from top to avoid interference

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
    if (end <= start + this.POSITION_TOLERANCE) {
      return [this.roundPosition(start), this.roundPosition(end)]
    }

    const positions: number[] = []
    let current = this.snapForwardAnchor(start, blocked)
    const endAnchor = this.snapBackwardAnchor(end, blocked)

    positions.push(current)

    while (endAnchor - current > maxSpacing + this.POSITION_TOLERANCE) {
      const nextPosition = this.findNextPosition(current, endAnchor, blocked, minSpacing, maxSpacing)
      if (nextPosition === null) {
        break
      }
      positions.push(nextPosition)
      current = nextPosition
    }

    if (endAnchor - positions[positions.length - 1] < minSpacing - this.POSITION_TOLERANCE && positions.length > 1) {
      positions.pop()
    }

    if (endAnchor - positions[positions.length - 1] > maxSpacing + this.POSITION_TOLERANCE) {
      const fallback = this.findNextPosition(positions[positions.length - 1], endAnchor, blocked, minSpacing, maxSpacing)
      if (fallback !== null) {
        positions.push(fallback)
      }
    }

    positions.push(endAnchor)
    return positions
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

  private static findNextPosition(
    current: number,
    endAnchor: number,
    blocked: BlockInterval[],
    minSpacing: number,
    maxSpacing: number
  ): number | null {
    const searchStart = current + minSpacing
    const searchEnd = Math.min(endAnchor - minSpacing, current + maxSpacing)
    if (searchEnd <= searchStart + this.POSITION_TOLERANCE) {
      return null
    }

    const segments = this.computeAllowedSegments(searchStart, searchEnd, blocked, minSpacing)
    if (segments.length === 0) {
      return null
    }

    const target = current + maxSpacing
    for (const segment of segments) {
      const candidate = this.roundPosition(Math.min(segment.end, Math.max(segment.start, target)))
      if (candidate - current >= minSpacing - this.POSITION_TOLERANCE && candidate - current <= maxSpacing + this.POSITION_TOLERANCE) {
        return candidate
      }
    }

    const lastSegment = segments[segments.length - 1]
    const fallback = this.roundPosition(lastSegment.end)
    if (fallback - current >= minSpacing - this.POSITION_TOLERANCE) {
      return fallback
    }

    return null
  }

  private static snapForwardAnchor(anchor: number, blocked: BlockInterval[]): number {
    let position = this.roundPosition(anchor)
    for (const interval of blocked) {
      if (position >= interval.start - this.POSITION_TOLERANCE && position <= interval.end + this.POSITION_TOLERANCE) {
        position = this.roundPosition(interval.end + this.POSITION_TOLERANCE)
      }
    }
    return position
  }

  private static snapBackwardAnchor(anchor: number, blocked: BlockInterval[]): number {
    let position = this.roundPosition(anchor)
    for (let i = blocked.length - 1; i >= 0; i--) {
      const interval = blocked[i]
      if (position >= interval.start - this.POSITION_TOLERANCE && position <= interval.end + this.POSITION_TOLERANCE) {
        position = this.roundPosition(interval.start - this.POSITION_TOLERANCE)
      }
    }
    return position
  }

  private static computeAllowedSegments(
    start: number,
    end: number,
    blocked: BlockInterval[],
    _minSpacing: number
  ): BlockInterval[] {
    const segments: BlockInterval[] = []
    let cursor = start

    for (const interval of blocked) {
      if (interval.end <= cursor + this.POSITION_TOLERANCE) {
        continue
      }
      if (interval.start >= end - this.POSITION_TOLERANCE) {
        break
      }

      if (interval.start > cursor + this.POSITION_TOLERANCE) {
        segments.push({ start: cursor, end: Math.min(end, interval.start) })
      }

      cursor = Math.max(cursor, Math.min(end, interval.end))
    }

    if (cursor < end - this.POSITION_TOLERANCE) {
      segments.push({ start: cursor, end })
    }

    return segments.map(segment => ({
      start: this.roundPosition(segment.start),
      end: this.roundPosition(segment.end)
    }))
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
