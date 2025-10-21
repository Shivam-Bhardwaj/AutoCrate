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
 * - All stops positioned 0.625" from panel edge (near touching front panel)
 * - Length: half the smallest cleated panel edge dimension, centered
 */

import { NXBox, Point3D, CrateConfig } from './nx-generator'
import { PANEL_STOP_STANDARDS, GEOMETRY_STANDARDS, LUMBER_DIMENSIONS, SKID_STANDARDS } from './crate-constants'

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
   * Get skid dimensions based on product weight
   */
  private getSkidDimensions() {
    const weight = this.config.product.weight
    const allow3x4 = this.config.materials.allow3x4Lumber || false

    if (weight <= 500 && allow3x4) {
      return { height: LUMBER_DIMENSIONS['3x4'].height, width: LUMBER_DIMENSIONS['3x4'].width }
    } else if (weight <= SKID_STANDARDS.LIGHTWEIGHT_WEIGHT_THRESHOLD) {
      return { height: LUMBER_DIMENSIONS['4x4'].height, width: LUMBER_DIMENSIONS['4x4'].width }
    } else if (weight <= 20000) {
      return { height: LUMBER_DIMENSIONS['4x6'].height, width: LUMBER_DIMENSIONS['4x6'].width }
    } else if (weight <= 35000) {
      return { height: LUMBER_DIMENSIONS['6x6'].height, width: LUMBER_DIMENSIONS['6x6'].width }
    } else {
      return { height: LUMBER_DIMENSIONS['8x8'].height, width: LUMBER_DIMENSIONS['8x8'].width }
    }
  }

  /**
   * Get floorboard dimensions based on product weight
   */
  private getFloorboardDimensions() {
    const weight = this.config.product.weight
    const availableLumber = this.config.materials.availableLumber || ['2x6', '2x8', '2x10', '2x12']

    const lumberOptions = [
      { nominal: '2x6' as const, width: 5.5, thickness: 1.5, maxWeight: 2000 },
      { nominal: '2x8' as const, width: 7.25, thickness: 1.5, maxWeight: 4000 },
      { nominal: '2x10' as const, width: 9.25, thickness: 1.5, maxWeight: 8000 },
      { nominal: '2x12' as const, width: 11.25, thickness: 1.5, maxWeight: Infinity }
    ]

    for (const option of lumberOptions) {
      if (availableLumber.includes(option.nominal) && weight <= option.maxWeight) {
        return { width: option.width, thickness: option.thickness }
      }
    }

    return { width: 11.25, thickness: 1.5 }
  }

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

    // Front panel surfaces:
    // - Outer surface (facing outward): panelThickness - plywoodThickness
    // - Inner surface (facing product): panelThickness
    const frontPanelInnerY = panelThickness

    // Calculate actual panel bottom position (skid + floorboard)
    const skidDims = this.getSkidDimensions()
    const floorboardDims = this.getFloorboardDimensions()
    const panelBottomZ = skidDims.height + floorboardDims.thickness

    // Stops are positioned flush against the front panel inner surface (facing product)
    const stopYPosition = frontPanelInnerY  // Flush against panel inner surface, no gap

    const stops: NXBox[] = []

    // LEFT EDGE STOP - positioned with clearance from side panel to avoid interference (#95)
    // Centered vertically along the front panel height
    const leftStopCenterZ = panelBottomZ + panelHeight / 2
    const leftStopCenterX = -internalWidth / 2 + width / 2 + edgeInset  // Moved inward by stop width/2 + clearance

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

    // RIGHT EDGE STOP - positioned with clearance from side panel to avoid interference (#95)
    const rightStopCenterZ = panelBottomZ + panelHeight / 2
    const rightStopCenterX = internalWidth / 2 - width / 2 - edgeInset  // Moved inward by stop width/2 + clearance

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

    // Calculate base height (skid + floorboard)
    const skidDims = this.getSkidDimensions()
    const floorboardDims = this.getFloorboardDimensions()
    const baseZ = skidDims.height + floorboardDims.thickness

    // Top panel is at Z = baseZ + product.height + clearances.top
    const topPanelZ = baseZ + product.height + clearances.top

    // Stop is positioned flush against the bottom surface of the top panel (#94: remove gap)
    const stopZPosition = topPanelZ  // Flush against top panel bottom surface, no gap

    // Centered horizontally along the panel width
    const stopCenterX = 0  // Centered on X-axis

    // Position stop behind front panel with proper offset (#96: add 0.0625" clearance)
    // Front panel inner surface is at Y = panelThickness
    // Stop positioned at edgeInset (1.0625") from front edge
    const frontPanelInnerY = panelThickness
    const stopYPosition = frontPanelInnerY + edgeInset  // 1.0625" from front panel inner surface

    return {
      name: PANEL_STOP_STANDARDS.PART_NUMBERS.topFront,
      type: 'plywood',
      panelName: 'TOP_PANEL',
      point1: {
        x: stopCenterX - stopLength / 2,
        y: stopYPosition,  // Front edge at edgeInset from panel
        z: stopZPosition - thickness,  // Extends downward by thickness
      },
      point2: {
        x: stopCenterX + stopLength / 2,
        y: stopYPosition + width,  // Back edge extends inward by width (2")
        z: stopZPosition,  // Top surface flush with panel bottom
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
