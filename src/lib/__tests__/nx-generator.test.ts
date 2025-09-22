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
