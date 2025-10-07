import { KlimpCalculator } from '../klimp-calculator'

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
  it('keeps top-edge klimps between 18" and 24" on center', () => {
    const layout = KlimpCalculator.calculateKlimpLayout(120, 96)
    const topPositions = layout.klimps
      .filter(klimp => klimp.edge === 'top')
      .map(klimp => klimp.position)

    expect(topPositions.length).toBeGreaterThanOrEqual(2)
    withinSpacingBounds(topPositions, 18, 24)
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
    withinSpacingBounds(leftPositions, 18, 24)
  })
})

