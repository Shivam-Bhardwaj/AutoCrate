import { NXGenerator, CrateConfig, generateNXExpressions } from '../nx-generator'

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

    // Widths should be non-increasing from front to back (widest to narrowest)
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i]).toBeLessThanOrEqual(widths[i - 1] + 1e-3)
    }

    const expressions = generator.getExpressions()
    const internalLength = expressions.get('internal_length') || 0
    const gap = expressions.get('floorboard_gap') || 0

    // Boards should be separated by the configured gap and flush otherwise
    for (let i = 1; i < floorboards.length; i++) {
      const previous = floorboards[i - 1]
      const current = floorboards[i]
      const measuredGap = Number((current.point1.y - previous.point2.y).toFixed(3))
      expect(measuredGap).toBeCloseTo(gap, 3)
    }

    if (customIndices.length === 1) {
      const customWidth = widths[customIndices[0]]
      expect(customWidth).toBeGreaterThanOrEqual(2.5 - 1e-3)
      expect(customWidth).toBeLessThanOrEqual(5.5 + 1e-3)
      const roundedToQuarter = Math.round(customWidth * 4) / 4
      expect(Math.abs(roundedToQuarter - customWidth)).toBeLessThan(1e-3)
    }

    const totalWidth = rawWidths.reduce((acc, value) => acc + value, 0)
    const usedLength = totalWidth + gap * Math.max(0, floorboards.length - 1)
    const leftover = Number((internalLength - usedLength).toFixed(3))
    expect(leftover).toBeGreaterThanOrEqual(-1e-3)

    if (customIndices.length === 0) {
      const maxAllowable = (floorboards.length > 0 ? gap : 0) + 2.5
      expect(leftover).toBeLessThan(maxAllowable + 1e-3)
    } else {
      expect(leftover).toBeLessThan(gap + 1e-3)
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

  it('generateNXExpressions wrapper returns a populated expression bundle', () => {
    const bundle = generateNXExpressions({ length: 48, width: 40, height: 20 }, 2000)

    expect(bundle).toContain('# NX Expressions for AutoCrate')
    expect(bundle).toContain('product_length=48.000')
    expect(bundle).toContain('skid_count=')
  })
})
