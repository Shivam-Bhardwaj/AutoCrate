import {
  PlywoodSplicer,
  calculatePlywoodPieces
} from '../plywood-splicing'

describe('PlywoodSplicer.calculateOptimizedSpliceLayout', () => {
  it('prefers rotated sheets when rotation removes all splices', () => {
    const layout = PlywoodSplicer.calculateOptimizedSpliceLayout(80, 40, 'TEST_PANEL', true)

    expect(layout.isRotated).toBe(true)
    expect(layout.sheetCount).toBe(1)
    expect(layout.splices).toHaveLength(0)
    expect(layout.rotatedSheetWidth).toBe(96)
    expect(layout.rotatedSheetHeight).toBe(48)
  })

  it('respects allowRotation=false and keeps original orientation', () => {
    const layout = PlywoodSplicer.calculateOptimizedSpliceLayout(80, 40, 'TEST_PANEL', false)

    expect(layout.isRotated).toBe(false)
    expect(layout.sheetCount).toBeGreaterThanOrEqual(2)
  })

  it('defaults to vertical splicing when rotation adds complexity', () => {
    const layout = PlywoodSplicer.calculateOptimizedSpliceLayout(120, 72, 'TEST_PANEL', true)

    expect(layout.isRotated).toBe(false)
    expect(layout.splices.some(splice => splice.orientation === 'vertical')).toBe(true)
  })

  it('ensures minimum clearance before first horizontal splice for stacked cleats', () => {
    const layout = PlywoodSplicer.calculateOptimizedSpliceLayout(54, 99.5, 'FRONT_PANEL', false)

    const bottomPiece = layout.sheets
      .filter(section => section.y === 0)
      .sort((a, b) => a.height - b.height)[0]

    expect(bottomPiece).toBeDefined()
    expect(bottomPiece!.height).toBeGreaterThanOrEqual(7.25)

    const horizontalSplice = layout.splices.find(splice => splice.orientation === 'horizontal')
    expect(horizontalSplice).toBeDefined()
    expect(horizontalSplice!.y).toBeGreaterThan(7)
  })
})

describe('PlywoodSplicer utility methods', () => {
  it('calculates crate splicing across all panels including bottom panel when requested', () => {
    const layouts = PlywoodSplicer.calculateCrateSplicing(
      90,
      70,
      80,
      65,
      90,
      80,
      true,
      true
    )

    const panelNames = layouts.map(layout => layout.panelName)
    expect(panelNames).toEqual([
      'FRONT_PANEL',
      'BACK_PANEL',
      'LEFT_END_PANEL',
      'RIGHT_END_PANEL',
      'TOP_PANEL',
      'BOTTOM_PANEL'
    ])

    const materialUsage = PlywoodSplicer.calculateMaterialUsage(layouts)
    expect(materialUsage.totalSheets).toBeGreaterThan(0)
    expect(materialUsage.totalArea).toBeGreaterThan(0)
    expect(materialUsage.efficiency).toBeGreaterThan(0)
  })

  it('validates 130 inch cube capability thresholds', () => {
    expect(PlywoodSplicer.validateFor130Cube(40, 40, 40)).toBe(true)
    expect(PlywoodSplicer.validateFor130Cube(180, 150, 150)).toBe(false)
  })

  it('generates splice expressions for downstream NX consumption', () => {
    const layout = PlywoodSplicer.calculateOptimizedSpliceLayout(96, 96, 'DOC_PANEL', true)
    const expressions = PlywoodSplicer.generateSpliceExpressions(layout)

    expect(expressions).toContain('# Splice Layout for DOC_PANEL')
    expect(expressions).toContain('DOC_PANEL_SPLICE')
    expect(expressions).toContain('_WIDTH=')
  })

  it('wrapper calculatePlywoodPieces uses optimized calculation with rotation', () => {
    const layout = calculatePlywoodPieces({ width: 80, height: 40 }, 'WRAPPER_PANEL')
    expect(layout.panelName).toBe('WRAPPER_PANEL')
    expect(layout.isRotated).toBe(true)
  })
})
