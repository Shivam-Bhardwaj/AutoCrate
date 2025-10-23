import { KlimpCalculator } from '../klimp-calculator'
import { FASTENER_STANDARDS, CLEAT_STANDARDS } from '../crate-constants'

const withinSpacingBounds = (values: number[], min: number, max: number) => {
  const sorted = [...values].sort((a, b) => a - b)
  const deltas: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    deltas.push(Number((sorted[i] - sorted[i - 1]).toFixed(4)))
  }

  deltas.forEach(delta => {
    expect(delta).toBeGreaterThanOrEqual(min - 1e-3)
    expect(delta).toBeLessThanOrEqual(max + 1e-3)
  })
}

describe('KlimpCalculator spacing', () => {
  const minSpacing = FASTENER_STANDARDS.KLIMP.EDGE_MIN_SPACING
  const maxSpacing = FASTENER_STANDARDS.KLIMP.EDGE_MAX_SPACING

  it('keeps top-edge klimps between configured spacing bounds', () => {
    const layout = KlimpCalculator.calculateKlimpLayout(120, 96)
    const topPositions = layout.klimps
      .filter(klimp => klimp.edge === 'top')
      .map(klimp => klimp.position)

    expect(topPositions.length).toBeGreaterThanOrEqual(2)
    withinSpacingBounds(topPositions, minSpacing, maxSpacing)
    expect(topPositions[0]).toBeCloseTo(CLEAT_STANDARDS.DEFAULT_DIMENSIONS.width + 1, 3)
    expect(topPositions[topPositions.length - 1]).toBeCloseTo(120 - (CLEAT_STANDARDS.DEFAULT_DIMENSIONS.width + 1), 3)
  })

  it('mirrors side klimps with matched spacing', () => {
    const layout = KlimpCalculator.calculateKlimpLayout(120, 96)
    const leftPositions = layout.klimps
      .filter(klimp => klimp.edge === 'left')
      .map(klimp => klimp.position)
      .sort((a, b) => a - b)
    const rightPositions = layout.klimps
      .filter(klimp => klimp.edge === 'right')
      .map(klimp => klimp.position)
      .sort((a, b) => a - b)

    expect(leftPositions).toHaveLength(rightPositions.length)
    expect(leftPositions).toEqual(rightPositions)
    expect(leftPositions.length).toBeGreaterThanOrEqual(2)
    withinSpacingBounds(leftPositions, minSpacing, maxSpacing)
  })

  it('avoids placing top klimps directly over vertical cleats', () => {
    const cleatWidth = CLEAT_STANDARDS.DEFAULT_DIMENSIONS.width
    const cleatPosition = 40
    const clearance = CLEAT_STANDARDS.DEFAULT_DIMENSIONS.width + 1.5
    const layout = KlimpCalculator.calculateKlimpLayout(
      120,
      96,
      [{ position: cleatPosition, width: cleatWidth }]
    )

    const blockedStart = cleatPosition - clearance
    const blockedEnd = cleatPosition + cleatWidth + clearance

    const topPositions = layout.klimps
      .filter(klimp => klimp.edge === 'top')
      .map(klimp => klimp.position)

    topPositions.forEach(position => {
      expect(position <= blockedStart || position >= blockedEnd).toBe(true)
    })
  })

  it('avoids horizontal cleats when placing side klimps', () => {
    const cleatWidth = CLEAT_STANDARDS.DEFAULT_DIMENSIONS.width
    const cleatPosition = 28
    const clearance = CLEAT_STANDARDS.DEFAULT_DIMENSIONS.width + 2.0
    const layout = KlimpCalculator.calculateKlimpLayout(
      120,
      96,
      [],
      [{ position: cleatPosition, width: cleatWidth }],
      [{ position: cleatPosition, width: cleatWidth }]
    )

    const blockedStart = cleatPosition - clearance
    const blockedEnd = cleatPosition + cleatWidth + clearance

    const sidePositions = layout.klimps
      .filter(klimp => klimp.edge === 'left')
      .map(klimp => klimp.position)

    sidePositions.forEach(position => {
      expect(position <= blockedStart || position >= blockedEnd).toBe(true)
    })
  })

  it('adds additional top klimps as panel width grows', () => {
    const narrow = KlimpCalculator.calculateKlimpLayout(50, 96)
    const wide = KlimpCalculator.calculateKlimpLayout(100, 96)

    const narrowCount = narrow.klimps.filter(klimp => klimp.edge === 'top').length
    const wideCount = wide.klimps.filter(klimp => klimp.edge === 'top').length

    expect(wideCount).toBeGreaterThan(narrowCount)
    expect(wideCount).toBeGreaterThanOrEqual(4)
  })
})
