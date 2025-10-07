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
    appliedMaterialsLogo: true,
    fragileStencil: true,
    handlingSymbols: true
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
    expect(expressions.get('skid_width')).toBeCloseTo(2.5)
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
    expect(exported).toContain('# KLIMP FASTENER INSTRUCTIONS')
    expect(exported).toContain('pattern_spacing')
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
    expect(shortGenerator.getMarkingDimensions('logo')?.width).toBeCloseTo(5.56)
    expect(shortGenerator.getMarkingDimensions('fragile')?.width).toBeCloseTo(8.0)
    expect(shortGenerator.getMarkingDimensions('handling')?.partNumber).toBe('0205-00606')

    const mediumGenerator = new NXGenerator(
      buildConfig({
        product: { ...baseConfig.product, height: 60 }
      })
    )
    expect(mediumGenerator.getMarkingDimensions('logo')?.partNumber).toContain('Scale 1.5X')
    expect(mediumGenerator.getMarkingDimensions('handling')?.partNumber).toBe('0205-00605')

    const tallGenerator = new NXGenerator(
      buildConfig({
        product: { ...baseConfig.product, height: 90 }
      })
    )
    expect(tallGenerator.getMarkingDimensions('logo')?.partNumber).toContain('Scale 2.0X')
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
    const sideExpectedZ = sideGroundClearance + cleatThickness / 2
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

  it('generateNXExpressions wrapper returns a populated expression bundle', () => {
    const bundle = generateNXExpressions({ length: 48, width: 40, height: 20 }, 2000)

    expect(bundle).toContain('# NX Expressions for AutoCrate')
    expect(bundle).toContain('product_length=48.000')
    expect(bundle).toContain('skid_count=')
  })
})
