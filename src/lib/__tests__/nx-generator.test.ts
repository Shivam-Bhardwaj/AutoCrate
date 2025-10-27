import { NXGenerator, CrateConfig, generateNXExpressions } from '../nx-generator'
import { LagSTEPIntegration } from '../lag-step-integration'
import { Cleat } from '../cleat-calculator'

const baseConfig: CrateConfig = {
  product: {
    length: 60,
    width: 40,
    height: 35,
    weight: 450
  },
  clearances: {
    side: 2,
    end: 2,
    top: 3
  },
  materials: {
    skidSize: '4x4',
    plywoodThickness: 0.25,
    panelThickness: 1,
    cleatSize: '1x4',
    allow3x4Lumber: true,
    availableLumber: ['2x6', '2x8', '2x10', '2x12']
  },
  hardware: {
    lagScrewSpacing: 21
  },
  geometry: {
    sidePanelGroundClearance: 0.25
  },
  markings: {
    appliedMaterialsLogo: false,
    fragileStencil: true,
    handlingSymbols: true,
    autocrateText: true
  }
}

const buildConfig = (overrides: Partial<CrateConfig> = {}): CrateConfig => ({
  product: { ...baseConfig.product, ...(overrides.product || {}) },
  clearances: { ...baseConfig.clearances, ...(overrides.clearances || {}) },
  materials: { ...baseConfig.materials, ...(overrides.materials || {}) },
  hardware: overrides.hardware
    ? { ...(baseConfig.hardware || {}), ...overrides.hardware }
    : baseConfig.hardware,
  geometry: overrides.geometry
    ? { ...(baseConfig.geometry || {}), ...overrides.geometry }
    : baseConfig.geometry,
  markings: overrides.markings === undefined ? baseConfig.markings : overrides.markings
})

describe('NXGenerator', () => {
  it('selects optional 3x4 skids and creates custom floorboards when only 2x12 lumber is available', () => {
    const generator = new NXGenerator(
      buildConfig({
        materials: {
          ...baseConfig.materials,
          allow3x4Lumber: true,
          availableLumber: ['2x12']
        }
      })
    )

    const expressions = generator.getExpressions()
    expect(expressions.get('skid_width')).toBeCloseTo(2.5) // 3x4 lumber oriented as 3.5" tall x 2.5" wide
    expect(expressions.get('skid_height')).toBeCloseTo(3.5) // 3.5" height for forklift clearance
    expect(expressions.get('skid_max_spacing')).toBeGreaterThan(0)

    const skidCount = expressions.get('skid_count') || 0
    const spacing = expressions.get('pattern_spacing') || 0
    const maxSpacing = expressions.get('skid_max_spacing') || 0
    expect(skidCount).toBeGreaterThanOrEqual(2)
    expect(spacing).toBeLessThanOrEqual(maxSpacing)

    const floorboards = generator.getBoxes().filter(box => box.type === 'floor' && !box.suppressed)
    expect(floorboards.length).toBe(expressions.get('floorboard_count'))
    expect(floorboards.some(board => board.metadata?.includes('CUSTOM CUT'))).toBe(true)
  })

  it('exposes panel, cleat, and klimp layout metadata for downstream pipelines', () => {
    const generator = new NXGenerator(buildConfig())

    const panelLayouts = generator.getPanelSpliceLayouts()
    expect(panelLayouts).toHaveLength(5)
    const frontPanel = panelLayouts.find(layout => layout.panelName === 'FRONT_PANEL')
    expect(frontPanel).toBeDefined()
    expect(frontPanel?.sheetCount).toBeGreaterThan(0)

    const cleatLayout = generator.getPanelCleatLayouts().find(layout => layout.panelName === 'FRONT_PANEL')
    expect(cleatLayout).toBeDefined()
    expect((cleatLayout?.cleats.length || 0)).toBeGreaterThan(0)

    const klimpLayout = generator.getKlimpLayouts()[0]
    expect(klimpLayout.totalKlimps).toBeGreaterThan(0)

    const instances = generator.getKlimpInstances()
    expect(instances).toHaveLength(20)
    expect(instances.filter(instance => instance.active).length).toBe(klimpLayout.totalKlimps)

    const exported = generator.exportNXExpressions()
    expect(exported).toContain('// --- KLIMP FASTENER GUIDANCE ---')
    expect(exported).toContain('pattern_spacing')
  })

  it('positions side panels so that interior width matches requested dimensions', () => {
    const config = buildConfig({
      product: { ...baseConfig.product, width: 50, length: 50, height: 50 },
      clearances: { side: 0, end: 0, top: 0 }
    })

    const generator = new NXGenerator(config)
    const expressions = generator.getExpressions()
    const expectedInternalWidth = expressions.get('internal_width') || 0

    const panels = generator
      .getBoxes()
      .filter(box => !box.suppressed && box.type === 'plywood' && (box.panelName === 'LEFT_END_PANEL' || box.panelName === 'RIGHT_END_PANEL'))

    const leftPanels = panels.filter(box => box.panelName === 'LEFT_END_PANEL')
    const rightPanels = panels.filter(box => box.panelName === 'RIGHT_END_PANEL')

    expect(leftPanels.length).toBeGreaterThan(0)
    expect(rightPanels.length).toBeGreaterThan(0)

    const leftInnerFace = Math.max(
      ...leftPanels.map(box => Math.max(box.point1.x, box.point2.x))
    )
    const rightInnerFace = Math.min(
      ...rightPanels.map(box => Math.min(box.point1.x, box.point2.x))
    )

    const measuredWidth = Number((rightInnerFace - leftInnerFace).toFixed(4))
    expect(measuredWidth).toBeCloseTo(expectedInternalWidth, 3)
  })

  it('lays out floorboards from widest to narrowest with a single custom infill when needed', () => {
    const generator = new NXGenerator(buildConfig())

    const floorboards = generator
      .getBoxes()
      .filter(box => box.type === 'floor' && !box.suppressed)
      .sort((a, b) => a.point1.y - b.point1.y)

    expect(floorboards.length).toBeGreaterThan(0)

    const widths = floorboards.map(board => Number((board.point2.y - board.point1.y).toFixed(3)))
    const rawWidths = floorboards.map(board => board.point2.y - board.point1.y)
    const customIndices = floorboards
      .map((board, index) => ({ index, isCustom: board.metadata?.includes('CUSTOM CUT') }))
      .filter(entry => entry.isCustom)
      .map(entry => entry.index)

    expect(customIndices.length).toBeLessThanOrEqual(1)

    const expressions = generator.getExpressions()
    const internalLength = expressions.get('internal_length') || 0
    const gap = expressions.get('floorboard_gap') || 0
    const panelThickness = expressions.get('panel_thickness') || 0
    const centerIndex = Math.floor(floorboards.length / 2)

    const leftWidths = widths.slice(0, centerIndex)
    const rightWidths = widths.slice(-centerIndex).reverse()

    for (let i = 1; i < leftWidths.length; i++) {
      expect(leftWidths[i]).toBeLessThanOrEqual(leftWidths[i - 1] + 1e-3)
    }

    for (let i = 1; i < rightWidths.length; i++) {
      expect(rightWidths[i]).toBeLessThanOrEqual(rightWidths[i - 1] + 1e-3)
    }

    if (centerIndex > 0 && floorboards.length % 2 === 1) {
      expect(widths[centerIndex]).toBeLessThanOrEqual(widths[centerIndex - 1] + 1e-3)
      expect(widths[centerIndex]).toBeLessThanOrEqual(rightWidths[rightWidths.length - 1] + 1e-3)
    }

    const startDelta = Number((floorboards[0].point1.y - panelThickness).toFixed(3))
    expect(startDelta).toBeCloseTo(0, 3)
    const endDelta = Number((panelThickness + internalLength - floorboards[floorboards.length - 1].point2.y).toFixed(3))
    expect(endDelta).toBeCloseTo(0, 3)

    for (let i = 0; i < Math.floor(floorboards.length / 2); i++) {
      const front = floorboards[i]
      const back = floorboards[floorboards.length - 1 - i]
      const frontOffset = Number((front.point1.y - panelThickness).toFixed(3))
      const backOffset = Number(((panelThickness + internalLength) - back.point2.y).toFixed(3))
      expect(frontOffset).toBeCloseTo(backOffset, 3)
    }

    const gaps = [] as number[]
    for (let i = 1; i < floorboards.length; i++) {
      const previous = floorboards[i - 1]
      const current = floorboards[i]
      gaps.push(Number((current.point1.y - previous.point2.y).toFixed(3)))
    }

    const extraGapIndices = gaps
      .map((value, index) => ({ value, index }))
      .filter(({ value }) => Math.abs(value - gap) > 1e-3)

    expect(extraGapIndices.length).toBeLessThanOrEqual(1)

    if (extraGapIndices.length === 0) {
      gaps.forEach(value => expect(Math.abs(value - gap)).toBeLessThanOrEqual(1e-3))
    } else {
      const expectedIndex = customIndices.length === 1
        ? centerIndex
        : Math.max(0, centerIndex - 1)
      expect(extraGapIndices[0].index).toBe(expectedIndex)
      expect(extraGapIndices[0].value).toBeGreaterThan(gap)
      expect(extraGapIndices[0].value).toBeLessThan(2.5 + 1e-3)
    }

    if (customIndices.length === 1) {
      expect(customIndices[0]).toBe(centerIndex)
      const customWidth = widths[customIndices[0]]
      const standardWidths = widths.filter((_, idx) => idx !== customIndices[0])
      const smallestStandard = standardWidths.length > 0 ? Math.min(...standardWidths) : customWidth
      expect(customWidth).toBeGreaterThanOrEqual(2.5 - 1e-3)
      expect(customWidth).toBeLessThanOrEqual(smallestStandard + 1e-3)
      const roundedToQuarter = Math.round(customWidth * 4) / 4
      expect(Math.abs(roundedToQuarter - customWidth)).toBeLessThan(1e-3)
    }

    const totalWidth = rawWidths.reduce((acc, value) => acc + value, 0)
    const totalGap = gaps.reduce((acc, value) => acc + value, 0)
    const usedLength = totalWidth + totalGap
    const leftover = Number((internalLength - usedLength).toFixed(3))
    expect(Math.abs(leftover)).toBeLessThanOrEqual(1e-3)

    if (extraGapIndices.length === 1) {
      expect(Math.abs(extraGapIndices[0].value - totalGap)).toBeLessThan(1e-3)
    } else {
      expect(Math.abs(totalGap - gap)).toBeLessThanOrEqual(1e-3)
    }
  })

  it('computes marking dimensions across height thresholds', () => {
    const shortGenerator = new NXGenerator(
      buildConfig({
        product: { ...baseConfig.product, height: 20 }
      })
    )
    // Logo marking is deprecated and should return null
    expect(shortGenerator.getMarkingDimensions('logo')).toBeNull()
    expect(shortGenerator.getMarkingDimensions('fragile')?.width).toBeCloseTo(8.0)
    expect(shortGenerator.getMarkingDimensions('handling')?.partNumber).toBe('0205-00606')

    const mediumGenerator = new NXGenerator(
      buildConfig({
        product: { ...baseConfig.product, height: 60 }
      })
    )
    expect(mediumGenerator.getMarkingDimensions('handling')?.partNumber).toBe('0205-00605')

    const tallGenerator = new NXGenerator(
      buildConfig({
        product: { ...baseConfig.product, height: 90 }
      })
    )
    expect(tallGenerator.getMarkingDimensions('fragile')?.partNumber).toContain('Scale 1.5X')
  })

  it('centres configurable lag hardware on every vertical cleat', () => {
    const targetSpacing = 21
    const generator = new NXGenerator(
      buildConfig({
        hardware: {
          lagScrewSpacing: targetSpacing
        }
      })
    )

    const expressions = generator.getExpressions()
    const boxes = generator.getBoxes()
    const geometry = LagSTEPIntegration.getGeometry()

    const lagShafts = boxes.filter(box => box.type === 'hardware' && box.name.endsWith('_SHAFT'))
    expect(lagShafts.length).toBeGreaterThan(0)
    expect(expressions.get('lag_screw_count')).toBe(lagShafts.length)
    const tolerance = 1e-3
    const shaftsByPanel = new Map<string, typeof lagShafts>()
    lagShafts.forEach(box => {
      const panelName = box.panelName || 'UNKNOWN'
      const grouped = shaftsByPanel.get(panelName) || []
      grouped.push(box)
      shaftsByPanel.set(panelName, grouped)
    })

    const sideGroundClearance = expressions.get('side_panel_ground_clearance') || 0.25
    const cleatThickness = 0.75
    const skidMidHeight = (expressions.get('skid_height') || 0) / 2
    const sideExpectedZ = Math.max(sideGroundClearance + cleatThickness / 2, skidMidHeight)
    const floorExpectedZ = (expressions.get('skid_height') || 0) + ((expressions.get('floorboard_thickness') || 0) / 2)

    const panelsToCheck = ['FRONT_PANEL', 'BACK_PANEL', 'LEFT_END_PANEL', 'RIGHT_END_PANEL']

    panelsToCheck.forEach(panelName => {
      const group = (shaftsByPanel.get(panelName) || []).sort((a, b) => a.point1.z - b.point1.z)
      expect(group.length).toBeGreaterThan(0)

      const isSidePanel = panelName === 'LEFT_END_PANEL' || panelName === 'RIGHT_END_PANEL'
      const axisValues = group
        .map(box => isSidePanel
          ? (box.point1.y + box.point2.y) / 2
          : (box.point1.x + box.point2.x) / 2)
        .sort((a, b) => a - b)

      if (axisValues.length > 1) {
        for (let i = 1; i < axisValues.length; i++) {
          const spacing = axisValues[i] - axisValues[i - 1]
          expect(spacing).toBeGreaterThanOrEqual(18 - tolerance)
          expect(spacing).toBeLessThanOrEqual(24 + tolerance)
        }
      }

      const expectedAxisTag = panelName === 'LEFT_END_PANEL'
        ? 'axis +X'
        : panelName === 'RIGHT_END_PANEL'
          ? 'axis -X'
          : panelName === 'FRONT_PANEL'
            ? 'axis +Y'
            : 'axis -Y'

      group.forEach(box => {
        const centerZ = (box.point1.z + box.point2.z) / 2
        const alongAxisSpan = isSidePanel
          ? Math.abs(box.point2.x - box.point1.x)
          : Math.abs(box.point2.y - box.point1.y)

        if (isSidePanel) {
          expect(centerZ).toBeCloseTo(sideExpectedZ, 3)
        } else {
          expect(centerZ).toBeCloseTo(floorExpectedZ, 1)
        }

        expect(alongAxisSpan).toBeCloseTo(geometry.shankLength, 3)
        expect(box.metadata).toContain(expectedAxisTag)
        expect(box.metadata).toContain('Lag screw shank (3/8" x 3.00")')
      })
    })
  })

  // TDD Tests: Lag Screw Placement at Vertical Cleat Centers
  describe('Lag Screw Placement at Vertical Cleat Centers (Side Panels)', () => {
    it('should place first and last lag screws at first and last vertical cleat centers', () => {
      const config = buildConfig({
        product: { length: 60, width: 48, height: 48, weight: 5000 },
        hardware: { lagScrewSpacing: 21 }
      })

      const generator = new NXGenerator(config)
      const boxes = generator.getBoxes()
      const cleatLayouts = generator.getPanelCleatLayouts()

      // Test LEFT_END_PANEL
      const leftCleatLayout = cleatLayouts.find(l => l.panelName === 'LEFT_END_PANEL')
      expect(leftCleatLayout).toBeDefined()

      const leftVerticalCleats = leftCleatLayout!.cleats
        .filter(c => c.orientation === 'vertical')
        .sort((a, b) => a.x - b.x)

      expect(leftVerticalCleats.length).toBeGreaterThanOrEqual(2)

      // Get lag screws for LEFT_END_PANEL
      const leftLagScrews = boxes
        .filter(b => b.panelName === 'LEFT_END_PANEL' && b.name.includes('_LAG_') && b.name.includes('_SHAFT'))
        .sort((a, b) => a.point1.y - b.point1.y)

      expect(leftLagScrews.length).toBeGreaterThan(0)

      // Calculate cleat centers in world coordinates
      // For side panels, cleats are in panel local coords, need to transform to world
      const expressions = generator.getExpressions()
      const internalLength = expressions.get('internal_length') || 0
      const panelThickness = expressions.get('panel_thickness') || 0

      // LEFT_END_PANEL starts at Y = panelThickness
      const panelOriginY = panelThickness

      const firstCleatCenterY = panelOriginY + leftVerticalCleats[0].x + leftVerticalCleats[0].width / 2
      const lastCleatCenterY = panelOriginY + leftVerticalCleats[leftVerticalCleats.length - 1].x + leftVerticalCleats[leftVerticalCleats.length - 1].width / 2

      // First lag screw should be at first cleat center
      const firstLagY = leftLagScrews[0].point1.y + (leftLagScrews[0].point2.y - leftLagScrews[0].point1.y) / 2
      expect(Math.abs(firstLagY - firstCleatCenterY)).toBeLessThan(0.5) // Within 0.5"

      // Last lag screw should be at last cleat center
      const lastLagY = leftLagScrews[leftLagScrews.length - 1].point1.y + (leftLagScrews[leftLagScrews.length - 1].point2.y - leftLagScrews[leftLagScrews.length - 1].point1.y) / 2
      expect(Math.abs(lastLagY - lastCleatCenterY)).toBeLessThan(0.5) // Within 0.5"
    })

    it('should respect lagScrewSpacing parameter at 18 inches', () => {
      const config = buildConfig({
        product: { length: 96, width: 48, height: 48, weight: 5000 },
        hardware: { lagScrewSpacing: 18 }
      })

      const generator = new NXGenerator(config)
      const boxes = generator.getBoxes()

      const lagScrews = boxes
        .filter(b => b.panelName === 'LEFT_END_PANEL' && b.name.includes('_LAG_') && b.name.includes('_SHAFT'))
        .sort((a, b) => a.point1.y - b.point1.y)

      expect(lagScrews.length).toBeGreaterThan(2)

      // Check spacing between consecutive screws
      for (let i = 0; i < lagScrews.length - 1; i++) {
        const currentCenter = lagScrews[i].point1.y + (lagScrews[i].point2.y - lagScrews[i].point1.y) / 2
        const nextCenter = lagScrews[i + 1].point1.y + (lagScrews[i + 1].point2.y - lagScrews[i + 1].point1.y) / 2
        const spacing = nextCenter - currentCenter

        expect(spacing).toBeGreaterThanOrEqual(16) // Min spacing with tolerance
        expect(spacing).toBeLessThanOrEqual(24) // Max spacing constraint
      }
    })

    it('should respect lagScrewSpacing parameter at 24 inches', () => {
      const config = buildConfig({
        product: { length: 96, width: 48, height: 48, weight: 5000 },
        hardware: { lagScrewSpacing: 24 }
      })

      const generator = new NXGenerator(config)
      const boxes = generator.getBoxes()

      const lagScrews = boxes
        .filter(b => b.panelName === 'LEFT_END_PANEL' && b.name.includes('_LAG_') && b.name.includes('_SHAFT'))
        .sort((a, b) => a.point1.y - b.point1.y)

      expect(lagScrews.length).toBeGreaterThan(0)

      // Check spacing between consecutive screws
      for (let i = 0; i < lagScrews.length - 1; i++) {
        const currentCenter = lagScrews[i].point1.y + (lagScrews[i].point2.y - lagScrews[i].point1.y) / 2
        const nextCenter = lagScrews[i + 1].point1.y + (lagScrews[i + 1].point2.y - lagScrews[i + 1].point1.y) / 2
        const spacing = nextCenter - currentCenter

        expect(spacing).toBeGreaterThanOrEqual(16)
        expect(spacing).toBeLessThanOrEqual(24.01)
      }
    })

    it('should handle wide panels with many vertical cleats', () => {
      const config = buildConfig({
        product: { length: 120, width: 48, height: 48, weight: 8000 },
        hardware: { lagScrewSpacing: 18 }
      })

      const generator = new NXGenerator(config)
      const boxes = generator.getBoxes()

      const lagScrews = boxes
        .filter(b => b.panelName === 'LEFT_END_PANEL' && b.name.includes('_LAG_') && b.name.includes('_SHAFT'))
        .sort((a, b) => a.point1.y - b.point1.y)

      // Wide panel should have many lag screws
      expect(lagScrews.length).toBeGreaterThan(4)

      // All spacing should be within constraints
      for (let i = 0; i < lagScrews.length - 1; i++) {
        const currentCenter = lagScrews[i].point1.y + (lagScrews[i].point2.y - lagScrews[i].point1.y) / 2
        const nextCenter = lagScrews[i + 1].point1.y + (lagScrews[i + 1].point2.y - lagScrews[i + 1].point1.y) / 2
        const spacing = nextCenter - currentCenter

        expect(spacing).toBeGreaterThanOrEqual(16)
        expect(spacing).toBeLessThanOrEqual(26)
      }
    })

    it('should handle small panels with few vertical cleats', () => {
      const config = buildConfig({
        product: { length: 20, width: 20, height: 20, weight: 500 },
        materials: {
          ...baseConfig.materials,
          skidSize: '3x3'
        },
        hardware: { lagScrewSpacing: 21 }
      })

      const generator = new NXGenerator(config)
      const boxes = generator.getBoxes()

      const lagScrews = boxes
        .filter(b => b.panelName === 'LEFT_END_PANEL' && b.name.includes('_LAG_') && b.name.includes('_SHAFT'))
        .sort((a, b) => a.point1.y - b.point1.y)

      expect(lagScrews.length).toBe(2)

      const span = lagScrews[1].point1.y + (lagScrews[1].point2.y - lagScrews[1].point1.y) / 2 -
        (lagScrews[0].point1.y + (lagScrews[0].point2.y - lagScrews[0].point1.y) / 2)

      expect(span).toBeGreaterThanOrEqual(16)
      expect(span).toBeLessThanOrEqual(24)
    })

    it('should not overpack lag screws on narrow panels when spacing is 18 inches', () => {
      const config = buildConfig({
        product: { length: 20, width: 20, height: 20, weight: 500 },
        materials: {
          ...baseConfig.materials,
          skidSize: '3x3'
        },
        hardware: { lagScrewSpacing: 18 }
      })

      const generator = new NXGenerator(config)
      const boxes = generator.getBoxes()

      const lagScrews = boxes
        .filter(b => b.panelName === 'LEFT_END_PANEL' && b.name.includes('_LAG_') && b.name.includes('_SHAFT'))
        .sort((a, b) => a.point1.y - b.point1.y)

      expect(lagScrews.length).toBe(2)

      const span = lagScrews[1].point1.y + (lagScrews[1].point2.y - lagScrews[1].point1.y) / 2 -
        (lagScrews[0].point1.y + (lagScrews[0].point2.y - lagScrews[0].point1.y) / 2)

      expect(span).toBeGreaterThanOrEqual(16)
      expect(span).toBeLessThanOrEqual(24)
    })

    it('should not create middle lag when span is less than configured spacing (issue #133)', () => {
      const config = buildConfig({
        product: { length: 20, width: 20, height: 20, weight: 500 },
        materials: {
          ...baseConfig.materials,
          skidSize: '3x3'
        },
        hardware: { lagScrewSpacing: 24 }
      })

      const generator = new NXGenerator(config)
      const boxes = generator.getBoxes()
      const cleatLayouts = generator.getPanelCleatLayouts()

      const leftCleatLayout = cleatLayouts.find(l => l.panelName === 'LEFT_END_PANEL')
      expect(leftCleatLayout).toBeDefined()

      const leftVerticalCleats = leftCleatLayout!.cleats
        .filter(c => c.orientation === 'vertical')
        .sort((a, b) => a.x - b.x)

      const lagScrews = boxes
        .filter(b => b.panelName === 'LEFT_END_PANEL' && b.name.includes('_LAG_') && b.name.includes('_SHAFT'))
        .sort((a, b) => a.point1.y - b.point1.y)

      // Calculate span between first and last cleat centers
      const expressions = generator.getExpressions()
      const panelThickness = expressions.get('panel_thickness') || 0
      const panelOriginY = panelThickness

      const firstCleatCenterY = panelOriginY + leftVerticalCleats[0].x + leftVerticalCleats[0].width / 2
      const lastCleatCenterY =
        panelOriginY +
        leftVerticalCleats[leftVerticalCleats.length - 1].x +
        leftVerticalCleats[leftVerticalCleats.length - 1].width / 2
      const span = lastCleatCenterY - firstCleatCenterY

      if (span < 24) {
        expect(lagScrews.length).toBe(2)
      }
    })
  })

  it('generateNXExpressions wrapper returns a populated expression bundle', () => {
    const bundle = generateNXExpressions({ length: 48, width: 40, height: 20 }, 2000)

    expect(bundle).toContain('// NX Expressions - AutoCrate')
    expect(bundle).toContain('[Inch]product_length = 48.000')
    expect(bundle).toContain('skid_count = ')
  })
})
