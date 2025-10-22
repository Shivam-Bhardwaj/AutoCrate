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
  private static readonly CLEAT_CLEARANCE = (CLEAT_STANDARDS.DEFAULT_DIMENSIONS.width / 2) + 0.5
  private static readonly POSITION_EPSILON = 1e-6
  private static readonly POSITION_PRECISION = 6
  private static readonly SAMPLE_STEP = 0.5

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
    const topBlocked = this.buildBlockedIntervals(topCleats, topStart, topEnd)
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

    const sideBlocked = this.buildBlockedIntervals([...leftCleats, ...rightCleats], bottomStart, sideTopLimit)
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
    if (end <= start + this.POSITION_EPSILON) {
      return [this.roundPosition(start)]
    }

    const mergedBlocked = this.mergeIntervals(blocked, start, end)
    const allowedSegments = this.computeAllowedSegments(start, end, mergedBlocked)
    const positionsSet = new Set<number>()

    for (const segment of allowedSegments) {
      if (segment.end <= segment.start + this.POSITION_EPSILON) {
        continue
      }
      let point = segment.start
      if (segment.start > start + this.POSITION_EPSILON) {
        point = Math.min(segment.end, segment.start + this.SAMPLE_STEP)
      }
      while (point <= segment.end + this.POSITION_EPSILON) {
        positionsSet.add(this.roundPosition(Math.min(point, segment.end)))
        point += this.SAMPLE_STEP
      }
    }

    positionsSet.add(this.roundPosition(start))
    positionsSet.add(this.roundPosition(end))

    const nodes = Array.from(positionsSet).sort((a, b) => a - b)
    const adjacency: number[][] = Array.from({ length: nodes.length }, () => [])

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const span = nodes[j] - nodes[i]
        if (span < minSpacing - this.POSITION_EPSILON) {
          continue
        }
        if (span > maxSpacing + this.POSITION_EPSILON) {
          break
        }
        adjacency[i].push(j)
      }
    }

    const startIndex = nodes.indexOf(this.roundPosition(start))
    const endIndex = nodes.indexOf(this.roundPosition(end))

    const queue: number[] = [startIndex]
    const previous = new Array<number>(nodes.length).fill(-1)
    previous[startIndex] = startIndex

    while (queue.length > 0) {
      const index = queue.shift()!
      if (index === endIndex) {
        break
      }

      for (const neighbor of adjacency[index]) {
        if (previous[neighbor] !== -1) {
          continue
        }
        previous[neighbor] = index
        queue.push(neighbor)
      }
    }

    if (previous[endIndex] === -1) {
      return [this.roundPosition(start), this.roundPosition(end)]
    }

    const path: number[] = []
    let cursor = endIndex
    while (cursor !== startIndex) {
      path.push(nodes[cursor])
      cursor = previous[cursor]
    }
    path.push(nodes[startIndex])
    path.reverse()

    return path
  }

  private static buildBlockedIntervals(
    cleats: CleatInfo[],
    start: number,
    end: number
  ): BlockInterval[] {
    const intervals: BlockInterval[] = []

    for (const cleat of cleats) {
      const blockStart = Math.max(start, cleat.position - this.CLEAT_CLEARANCE)
      const blockEnd = Math.min(end, cleat.position + cleat.width + this.CLEAT_CLEARANCE)
      if (blockEnd - blockStart > this.POSITION_EPSILON) {
        intervals.push({ start: blockStart, end: blockEnd })
      }
    }

    return this.mergeIntervals(intervals, start, end)
  }

  private static mergeIntervals(
    intervals: BlockInterval[],
    start: number,
    end: number
  ): BlockInterval[] {
    if (intervals.length === 0) {
      return []
    }

    const sorted = intervals
      .map(interval => ({
        start: Math.max(start, interval.start),
        end: Math.min(end, interval.end)
      }))
      .filter(interval => interval.end - interval.start > this.POSITION_EPSILON)
      .sort((a, b) => a.start - b.start)

    if (sorted.length === 0) {
      return []
    }

    const merged: BlockInterval[] = [sorted[0]]

    for (let i = 1; i < sorted.length; i++) {
      const last = merged[merged.length - 1]
      const current = sorted[i]

      if (current.start <= last.end + this.POSITION_EPSILON) {
        last.end = Math.max(last.end, current.end)
      } else {
        merged.push(current)
      }
    }

    return merged
  }

  private static computeAllowedSegments(
    start: number,
    end: number,
    blocked: BlockInterval[]
  ): BlockInterval[] {
    const segments: BlockInterval[] = []
    let cursor = start

    for (const interval of blocked) {
      const adjustedEnd = Math.min(interval.start - this.SAMPLE_STEP, interval.start - this.POSITION_EPSILON)
      if (adjustedEnd > cursor + this.POSITION_EPSILON) {
        segments.push({ start: cursor, end: adjustedEnd })
      }
      cursor = Math.max(cursor, Math.min(end, interval.end + this.SAMPLE_STEP))
    }

    if (cursor < end - this.POSITION_EPSILON) {
      segments.push({ start: cursor, end })
    }

    if (segments.length === 0) {
      segments.push({ start, end })
    }

    return segments
  }

  private static roundPosition(value: number): number {
    return Number(value.toFixed(this.POSITION_PRECISION))
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
