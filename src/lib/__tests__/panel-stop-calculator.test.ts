/**
 * Unit tests for Panel Stop Calculator
 * Tests the calculation and positioning of panel stops that prevent
 * panels from collapsing inward during packing
 */

import { PanelStopCalculator } from '../panel-stop-calculator'
import { CrateConfig } from '../nx-generator'
import { PANEL_STOP_STANDARDS } from '../crate-constants'

describe('PanelStopCalculator', () => {
  const createTestConfig = (overrides?: Partial<CrateConfig>): CrateConfig => ({
    product: {
      length: 48,
      width: 36,
      height: 30,
      weight: 500,
    },
    clearances: {
      side: 2,
      end: 2,
      top: 3,
    },
    materials: {
      skidSize: '4x4',
      plywoodThickness: 0.25,
      panelThickness: 1.0,
      cleatSize: '1x4',
    },
    ...overrides,
  })

  describe('calculateStopLength', () => {
    it('should calculate stop length as half the smallest panel edge', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      // Front panel: width=40, height=33
      // Back panel: width=40, height=33
      // Side panels: length=52, height=33
      // Top panel: width=40, length=52
      // Smallest edge = 33
      const expectedLength = 33 * 0.5 // 16.5 inches

      expect(layout.stopLength).toBe(expectedLength)
    })

    it('should handle different crate dimensions', () => {
      const config = createTestConfig({
        product: {
          length: 24,
          width: 24,
          height: 24,
          weight: 300,
        },
      })
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      // All panels: width=28, length=28, height=27
      // Smallest edge = 27
      const expectedLength = 27 * 0.5 // 13.5 inches

      expect(layout.stopLength).toBe(expectedLength)
    })
  })

  describe('calculateFrontPanelStops', () => {
    it('should create exactly 2 stops for front panel', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      expect(layout.frontPanelStops).toHaveLength(2)
    })

    it('should position stops with correct part numbers', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      expect(layout.frontPanelStops[0].name).toBe(PANEL_STOP_STANDARDS.PART_NUMBERS.frontLeft)
      expect(layout.frontPanelStops[1].name).toBe(PANEL_STOP_STANDARDS.PART_NUMBERS.frontRight)
    })

    it('should set correct type and panel name', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      layout.frontPanelStops.forEach(stop => {
        expect(stop.type).toBe('plywood')
        expect(stop.panelName).toBe('FRONT_PANEL')
        expect(stop.color).toBe('#DEB887')
      })
    })

    it('should position stops flush against front panel', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      const { thickness, width } = PANEL_STOP_STANDARDS.MATERIAL

      // Verify stops are positioned with correct thickness
      layout.frontPanelStops.forEach(stop => {
        const stopThickness = Math.abs(stop.point2.y - stop.point1.y)
        expect(stopThickness).toBeCloseTo(thickness, 6)

        // Front panel outer surface from nx-generator.ts: panelOriginY = panelThickness - plywoodThickness
        const frontPanelOuterY = config.materials.panelThickness - config.materials.plywoodThickness
        const stopYPosition = frontPanelOuterY  // Flush against panel, no gap
        const expectedStopY1 = stopYPosition
        const expectedStopY2 = stopYPosition + thickness

        expect(stop.point1.y).toBeCloseTo(expectedStopY1, 6)
        expect(stop.point2.y).toBeCloseTo(expectedStopY2, 6)
      })
    })

    it('should center stops vertically along panel height', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      const groundClearance = 0.25 // default
      const panelHeight = config.product.height + config.clearances.top
      const expectedCenterZ = groundClearance + panelHeight / 2
      const stopLength = layout.stopLength

      layout.frontPanelStops.forEach(stop => {
        const centerZ = (stop.point1.z + stop.point2.z) / 2
        expect(centerZ).toBeCloseTo(expectedCenterZ, 6)

        // Check that the stop extends equally above and below center
        expect(stop.point2.z - stop.point1.z).toBeCloseTo(stopLength, 6)
      })
    })

    it('should position left and right stops inward from boundaries to avoid side panel interference', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      const internalWidth = config.product.width + 2 * config.clearances.side
      const stopWidth = PANEL_STOP_STANDARDS.MATERIAL.width
      const leftStop = layout.frontPanelStops[0]
      const rightStop = layout.frontPanelStops[1]

      // Left stop moved inward by half stop width + edgeInset to avoid side panel interference (fixes #95)
      const edgeInset = PANEL_STOP_STANDARDS.POSITIONING.edgeInset
      const leftCenterX = (leftStop.point1.x + leftStop.point2.x) / 2
      expect(leftCenterX).toBeLessThan(0)
      expect(leftCenterX).toBeCloseTo(-internalWidth / 2 + stopWidth / 2 + edgeInset, 6)

      // Right stop moved inward by half stop width + edgeInset to avoid side panel interference (fixes #95)
      const rightCenterX = (rightStop.point1.x + rightStop.point2.x) / 2
      expect(rightCenterX).toBeGreaterThan(0)
      expect(rightCenterX).toBeCloseTo(internalWidth / 2 - stopWidth / 2 - edgeInset, 6)

      // Should be symmetric about center
      expect(Math.abs(leftCenterX)).toBeCloseTo(Math.abs(rightCenterX), 6)
    })
  })

  describe('calculateTopPanelStop', () => {
    it('should create exactly 1 stop for top panel', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      expect(layout.topPanelStop).toBeDefined()
      expect(layout.topPanelStop.name).toBe(PANEL_STOP_STANDARDS.PART_NUMBERS.topFront)
    })

    it('should set correct type and panel name', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      expect(layout.topPanelStop.type).toBe('plywood')
      expect(layout.topPanelStop.panelName).toBe('TOP_PANEL')
      expect(layout.topPanelStop.color).toBe('#DEB887')
    })

    it('should position stop flush against bottom of top panel', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      const { thickness } = PANEL_STOP_STANDARDS.MATERIAL

      const stop = layout.topPanelStop

      // Verify thickness is correct
      const stopThickness = Math.abs(stop.point2.z - stop.point1.z)
      expect(stopThickness).toBeCloseTo(thickness, 6)

      // Stop should be flush against bottom surface of top panel (fixes #94: no gap)
      // For 500 lb product: skid = 4x4 (3.5"), floorboard = 2x6 (1.5")
      const skidHeight = 3.5
      const floorboardThickness = 1.5
      const baseZ = skidHeight + floorboardThickness
      const topPanelZ = baseZ + config.product.height + config.clearances.top

      expect(stop.point2.z).toBeCloseTo(topPanelZ, 6)  // Top surface flush with panel bottom
      expect(stop.point1.z).toBeCloseTo(topPanelZ - thickness, 6)  // Extends downward by thickness
    })

    it('should center stop horizontally along panel width', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      const stopLength = layout.stopLength
      const stop = layout.topPanelStop

      // Should be centered at X=0
      const centerX = (stop.point1.x + stop.point2.x) / 2
      expect(centerX).toBeCloseTo(0, 6)

      // Should extend equally in both X directions
      expect(stop.point2.x - stop.point1.x).toBeCloseTo(stopLength, 6)
      expect(stop.point1.x).toBeCloseTo(-stopLength / 2, 6)
      expect(stop.point2.x).toBeCloseTo(stopLength / 2, 6)
    })

    it('should position stop behind front panel to avoid interference', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      // Stop should be positioned at edgeInset (1.0625") from front panel (fixes #96)
      // Front panel inner surface is at Y = panelThickness
      const frontPanelInnerY = config.materials.panelThickness
      const edgeInset = PANEL_STOP_STANDARDS.POSITIONING.edgeInset
      const stopWidth = PANEL_STOP_STANDARDS.MATERIAL.width
      const expectedStartY = frontPanelInnerY + edgeInset
      const expectedCenterY = expectedStartY + stopWidth / 2

      const stop = layout.topPanelStop
      const centerY = (stop.point1.y + stop.point2.y) / 2
      expect(centerY).toBeCloseTo(expectedCenterY, 6)

      // Verify stop starts at proper distance from front panel to avoid interference
      expect(stop.point1.y).toBeCloseTo(expectedStartY, 6)
    })
  })

  describe('getAllPanelStops', () => {
    it('should return all 3 panel stops', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const allStops = calculator.getAllPanelStops()

      expect(allStops).toHaveLength(3)
    })

    it('should return stops in correct order: front left, front right, top', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const allStops = calculator.getAllPanelStops()

      expect(allStops[0].name).toBe(PANEL_STOP_STANDARDS.PART_NUMBERS.frontLeft)
      expect(allStops[1].name).toBe(PANEL_STOP_STANDARDS.PART_NUMBERS.frontRight)
      expect(allStops[2].name).toBe(PANEL_STOP_STANDARDS.PART_NUMBERS.topFront)
    })

    it('should return valid NXBox objects', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const allStops = calculator.getAllPanelStops()

      allStops.forEach(stop => {
        expect(stop.name).toBeDefined()
        expect(stop.point1).toBeDefined()
        expect(stop.point2).toBeDefined()
        expect(stop.point1.x).toBeDefined()
        expect(stop.point1.y).toBeDefined()
        expect(stop.point1.z).toBeDefined()
        expect(stop.point2.x).toBeDefined()
        expect(stop.point2.y).toBeDefined()
        expect(stop.point2.z).toBeDefined()
        expect(stop.type).toBe('plywood')
        expect(stop.panelName).toMatch(/FRONT_PANEL|TOP_PANEL/)
      })
    })
  })

  describe('panel stop dimensions', () => {
    it('should use correct material dimensions', () => {
      const config = createTestConfig()
      const calculator = new PanelStopCalculator(config)
      const allStops = calculator.getAllPanelStops()

      const { thickness, width } = PANEL_STOP_STANDARDS.MATERIAL

      allStops.forEach(stop => {
        const dimensions = {
          x: Math.abs(stop.point2.x - stop.point1.x),
          y: Math.abs(stop.point2.y - stop.point1.y),
          z: Math.abs(stop.point2.z - stop.point1.z),
        }

        // One dimension should be the stop length
        // One should be the width (2 inches)
        // One should be the thickness (0.375 inches)
        const sortedDims = [dimensions.x, dimensions.y, dimensions.z].sort((a, b) => a - b)

        expect(sortedDims[0]).toBeCloseTo(thickness, 6) // smallest = thickness
        expect(sortedDims[1]).toBeCloseTo(width, 6)      // middle = width
        // largest dimension is the stop length (varies by crate)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle very small crates', () => {
      const config = createTestConfig({
        product: {
          length: 12,
          width: 12,
          height: 12,
          weight: 100,
        },
        clearances: {
          side: 1,
          end: 1,
          top: 2,
        },
      })
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      expect(layout.frontPanelStops).toHaveLength(2)
      expect(layout.topPanelStop).toBeDefined()
      expect(layout.stopLength).toBeGreaterThan(0)
    })

    it('should handle very large crates', () => {
      const config = createTestConfig({
        product: {
          length: 200,
          width: 150,
          height: 120,
          weight: 10000,
        },
        clearances: {
          side: 3,
          end: 3,
          top: 5,
        },
      })
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      expect(layout.frontPanelStops).toHaveLength(2)
      expect(layout.topPanelStop).toBeDefined()
      expect(layout.stopLength).toBeGreaterThan(0)
    })

    it('should handle asymmetric crates', () => {
      const config = createTestConfig({
        product: {
          length: 60,
          width: 20,
          height: 40,
          weight: 500,
        },
      })
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      expect(layout.frontPanelStops).toHaveLength(2)
      expect(layout.topPanelStop).toBeDefined()

      // Stop length should be half the smallest edge
      expect(layout.stopLength).toBeGreaterThan(0)
    })

    it('should respect custom ground clearance', () => {
      const config = createTestConfig({
        geometry: {
          sidePanelGroundClearance: 0.5,
        },
      })
      const calculator = new PanelStopCalculator(config)
      const layout = calculator.calculatePanelStops()

      // Front panel stops should use the custom ground clearance
      const customClearance = 0.5
      const panelHeight = config.product.height + config.clearances.top
      const expectedCenterZ = customClearance + panelHeight / 2

      const centerZ = (layout.frontPanelStops[0].point1.z + layout.frontPanelStops[0].point2.z) / 2
      expect(centerZ).toBeCloseTo(expectedCenterZ, 6)
    })
  })
})
