import { CleatCalculator, calculateCleatPositions } from '../cleat-calculator'

describe('CleatCalculator.calculateCleatLayout', () => {
  it('adds splice cleats and respects spacing for wide front panels', () => {
    const layout = CleatCalculator.calculateCleatLayout(
      'FRONT_PANEL',
      120,
      96,
      [
        { x: 48, y: 0, orientation: 'vertical' as const },
        { x: 84, y: 0, orientation: 'vertical' as const },
        { x: 0, y: 48, orientation: 'horizontal' as const }
      ],
      false
    )

    const perimeter = layout.cleats.filter(c => c.type === 'perimeter')
    expect(perimeter).toHaveLength(4)

    const verticalIntermediates = layout.cleats.filter(
      c => c.orientation === 'vertical' && c.type !== 'perimeter'
    )
    expect(verticalIntermediates.length).toBeGreaterThanOrEqual(2)
    expect(verticalIntermediates.some(c => c.type === 'splice')).toBe(true)

    const horizontalPieces = layout.cleats.filter(
      c => c.orientation === 'horizontal' && c.type !== 'perimeter'
    )
    expect(horizontalPieces.length).toBeGreaterThan(0)
    expect(horizontalPieces.every(c => c.length < layout.panelWidth)).toBe(true)

    const expressions = CleatCalculator.generateCleatExpressions(layout)
    expect(expressions).toContain('# Perimeter Cleats')
    expect(expressions).toContain('FRONT_PANEL_CLEAT_LEFT_X')

    const material = CleatCalculator.calculateCleatMaterial([layout])
    expect(material.totalCleats).toBe(layout.cleats.length)
    expect(material.totalLinearFeet).toBeGreaterThan(0)
    expect(material.estimated1x4Count).toBeGreaterThan(0)
  })

  it('creates full-length vertical cleats for side panels', () => {
    const layout = CleatCalculator.calculateCleatLayout(
      'LEFT_END_PANEL',
      80,
      60,
      [],
      false
    )

    const verticals = layout.cleats.filter(c => c.orientation === 'vertical')
    expect(verticals.length).toBeGreaterThanOrEqual(2)

    const perimeterVerticals = verticals.filter(c => c.type === 'perimeter')
    expect(perimeterVerticals).toHaveLength(2)
    expect(perimeterVerticals.every(c => Math.abs(c.length - 60) < 0.001)).toBe(true)

    const horizontals = layout.cleats.filter(c => c.orientation === 'horizontal')
    expect(horizontals).toHaveLength(2)
    const expectedLength = 80 - (2 * 3.5)
    expect(horizontals.every(c => Math.abs(c.length - expectedLength) < 0.001)).toBe(true)
  })

  it('fills entire width for panels without perimeter cleats when only horizontal splices exist', () => {
    const layout = CleatCalculator.calculateCleatLayout(
      'CUSTOM_PANEL',
      20,
      20,
      [
        { x: 0, y: 10, orientation: 'horizontal' as const }
      ],
      false
    )

    expect(layout.cleats.every(c => c.type !== 'perimeter')).toBe(true)

    const horizontalCleats = layout.cleats.filter(c => c.orientation === 'horizontal')
    expect(horizontalCleats).toHaveLength(1)
    expect(horizontalCleats[0].length).toBeCloseTo(20)
    expect(layout.cleats.filter(c => c.orientation === 'vertical')).toHaveLength(0)
  })

  it('wrapper calculateCleatPositions forwards arguments correctly', () => {
    const layout = calculateCleatPositions({ width: 40, height: 40 }, 'WRAPPER_PANEL', [])
    expect(layout.panelName).toBe('WRAPPER_PANEL')
    expect(layout.panelWidth).toBe(40)
    expect(layout.panelHeight).toBe(40)
    expect(layout.isRotated).toBe(false)
  })
})
