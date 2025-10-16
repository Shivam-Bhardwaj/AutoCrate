/**
 * Panel Stop Calculator
 *
 * Calculates positions for panel stops that prevent panels from collapsing
 * inward during the packing process. Panel stops are 3/8" thick plywood strips
 * positioned strategically on panel edges.
 *
 * Placement:
 * - 2 stops on front cleated panel side edges (left and right)
 * - 1 stop on top panel front edge
 * - All stops positioned 1.0625" from panel edge (accommodates cleat thickness)
 * - Length: half the smallest cleated panel edge dimension, centered
 */

import { NXBox, Point3D, CrateConfig } from './nx-generator'
import { PANEL_STOP_STANDARDS, GEOMETRY_STANDARDS } from './crate-constants'

export interface PanelStopLayout {
  /** Panel stops for front panel (left and right edges) */
  frontPanelStops: NXBox[]
  /** Panel stop for top panel (front edge) */
  topPanelStop: NXBox
  /** Calculated stop length */
  stopLength: number
}

export class PanelStopCalculator {
  constructor(private config: CrateConfig) {}

  /**
   * Calculate panel stop layout for the entire crate
   */
  calculatePanelStops(): PanelStopLayout {
    const stopLength = this.calculateStopLength()

    const frontPanelStops = this.calculateFrontPanelStops(stopLength)
    const topPanelStop = this.calculateTopPanelStop(stopLength)

    return {
      frontPanelStops,
      topPanelStop,
      stopLength,
    }
  }

  /**
   * Calculate the length of panel stops: half the smallest cleated panel edge
   */
  private calculateStopLength(): number {
    const { product, clearances } = this.config

    // Calculate panel dimensions
    const frontPanelWidth = product.width + 2 * clearances.side
    const frontPanelHeight = product.height + clearances.top
    const sidePanelLength = product.length + 2 * clearances.end
    const sidePanelHeight = product.height + clearances.top
    const topPanelWidth = product.width + 2 * clearances.side
    const topPanelLength = product.length + 2 * clearances.end

    // Find smallest edge among cleated panels
    const edges = [
      frontPanelWidth,
      frontPanelHeight,
      sidePanelLength,
      sidePanelHeight,
      topPanelWidth,
      topPanelLength,
    ]

    const smallestEdge = Math.min(...edges)

    // Panel stop length is half the smallest edge, centered
    return smallestEdge * PANEL_STOP_STANDARDS.POSITIONING.lengthFactor
  }

  /**
   * Calculate panel stops for front panel (2 stops on left and right edges)
   * These stops face inward to prevent the panel from collapsing
   */
  private calculateFrontPanelStops(stopLength: number): NXBox[] {
    const { product, clearances, materials } = this.config
    const { thickness, width } = PANEL_STOP_STANDARDS.MATERIAL
    const { edgeInset } = PANEL_STOP_STANDARDS.POSITIONING

    // Front panel dimensions
    const panelHeight = product.height + clearances.top
    const panelThickness = materials.panelThickness
    const plywoodThickness = materials.plywoodThickness

    // Internal space dimensions (where side panels meet front panel)
    const internalWidth = product.width + 2 * clearances.side

    // Front panel outer surface position from nx-generator.ts line 804
    // panelOriginY = panelThickness - plywoodThickness
    const frontPanelOuterY = panelThickness - plywoodThickness

    // Ground clearance for panels
    const groundClearance = this.config.geometry?.sidePanelGroundClearance ??
                           GEOMETRY_STANDARDS.SIDE_PANEL_GROUND_CLEARANCE

    // Stops are positioned flush against the front panel inner surface
    const stopYPosition = frontPanelOuterY  // Flush against panel, no gap

    const stops: NXBox[] = []

    // LEFT EDGE STOP - positioned just inside left internal boundary (to avoid side panel interference)
    // Centered vertically along the panel height
    const leftStopCenterZ = groundClearance + panelHeight / 2
    const leftStopCenterX = -internalWidth / 2 + width / 2  // Moved inward by half stop width

    stops.push({
      name: PANEL_STOP_STANDARDS.PART_NUMBERS.frontLeft,
      type: 'plywood',
      panelName: 'FRONT_PANEL',
      point1: {
        x: leftStopCenterX - width / 2,  // 2" wide stop centered at boundary
        y: stopYPosition,
        z: leftStopCenterZ - stopLength / 2,
      },
      point2: {
        x: leftStopCenterX + width / 2,
        y: stopYPosition + thickness,
        z: leftStopCenterZ + stopLength / 2,
      },
      color: '#DEB887', // Light plywood color
    })

    // RIGHT EDGE STOP - positioned just inside right internal boundary (to avoid side panel interference)
    const rightStopCenterZ = groundClearance + panelHeight / 2
    const rightStopCenterX = internalWidth / 2 - width / 2  // Moved inward by half stop width

    stops.push({
      name: PANEL_STOP_STANDARDS.PART_NUMBERS.frontRight,
      type: 'plywood',
      panelName: 'FRONT_PANEL',
      point1: {
        x: rightStopCenterX - width / 2,  // 2" wide stop centered at boundary
        y: stopYPosition,
        z: rightStopCenterZ - stopLength / 2,
      },
      point2: {
        x: rightStopCenterX + width / 2,
        y: stopYPosition + thickness,
        z: rightStopCenterZ + stopLength / 2,
      },
      color: '#DEB887',
    })

    return stops
  }

  /**
   * Calculate panel stop for top panel (1 stop on front edge)
   * This stop faces downward to prevent the top from collapsing
   */
  private calculateTopPanelStop(stopLength: number): NXBox {
    const { product, clearances, materials } = this.config
    const { thickness, width } = PANEL_STOP_STANDARDS.MATERIAL
    const { edgeInset } = PANEL_STOP_STANDARDS.POSITIONING

    // Top panel dimensions
    const panelWidth = product.width + 2 * clearances.side
    const panelThickness = materials.panelThickness
    const plywoodThickness = materials.plywoodThickness

    // Ground clearance for panels
    const groundClearance = this.config.geometry?.sidePanelGroundClearance ??
                           GEOMETRY_STANDARDS.SIDE_PANEL_GROUND_CLEARANCE

    // Top panel is at Z = groundClearance + product.height + clearances.top
    const topPanelZ = groundClearance + product.height + clearances.top

    // Stop is positioned flush against the bottom surface of the top panel
    const topPanelBottom = topPanelZ - plywoodThickness
    const stopZPosition = topPanelBottom  // Flush against top panel bottom, no gap

    // Centered horizontally along the panel width
    const stopCenterX = 0  // Centered on X-axis

    // Front edge of top panel from nx-generator.ts line 825: panelOriginY = 0
    // The front edge of the top panel is at Y = 0 (center of coordinate system)
    const frontEdgeY = 0
    const stopYPosition = frontEdgeY + width / 2  // Width extends inward from front edge

    return {
      name: PANEL_STOP_STANDARDS.PART_NUMBERS.topFront,
      type: 'plywood',
      panelName: 'TOP_PANEL',
      point1: {
        x: stopCenterX - stopLength / 2,
        y: stopYPosition - width / 2,
        z: stopZPosition - thickness,
      },
      point2: {
        x: stopCenterX + stopLength / 2,
        y: stopYPosition + width / 2,
        z: stopZPosition,
      },
      color: '#DEB887',
    }
  }

  /**
   * Get all panel stops as a flat array
   */
  getAllPanelStops(): NXBox[] {
    const layout = this.calculatePanelStops()
    return [...layout.frontPanelStops, layout.topPanelStop]
  }
}
