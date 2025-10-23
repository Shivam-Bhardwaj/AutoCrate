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

  it('generates sufficient klimps for large panels (120" x 96")', () => {
    const layout = KlimpCalculator.calculateKlimpLayout(120, 96)
    const leftKlimps = layout.klimps.filter(k => k.edge === 'left')
    const rightKlimps = layout.klimps.filter(k => k.edge === 'right')
    const topKlimps = layout.klimps.filter(k => k.edge === 'top')

    // Log actual counts for debugging
    console.log(`\n120" x 96" panel klimp counts:`)
    console.log(`  Top: ${topKlimps.length}`)
    console.log(`  Left: ${leftKlimps.length}`)
    console.log(`  Right: ${rightKlimps.length}`)
    console.log(`  Total: ${layout.totalKlimps}`)

    // Log left edge positions and spacings
    const sortedLeft = leftKlimps.map(k => k.position).sort((a, b) => a - b)
    console.log(`  Left positions: ${sortedLeft.map(p => p.toFixed(2)).join(', ')}`)
    if (sortedLeft.length > 1) {
      console.log(`  Left spacings:`)
      for (let i = 1; i < sortedLeft.length; i++) {
        const spacing = sortedLeft[i] - sortedLeft[i-1]
        console.log(`    ${spacing.toFixed(2)}"`)
      }
    }

    // For a 96" tall panel with side range of ~86.5", we need at least 4 klimps
    // to keep maximum spacing under 24"
    expect(leftKlimps.length).toBeGreaterThanOrEqual(4)
    expect(rightKlimps.length).toBeGreaterThanOrEqual(4)

    // For a 120" wide panel with top range of ~115", we need at least 5 klimps
    expect(topKlimps.length).toBeGreaterThanOrEqual(5)
  })

  it('generates sufficient klimps for very large panels (120" x 116")', () => {
    const layout = KlimpCalculator.calculateKlimpLayout(120, 116)
    const leftKlimps = layout.klimps.filter(k => k.edge === 'left')
    const rightKlimps = layout.klimps.filter(k => k.edge === 'right')
    const topKlimps = layout.klimps.filter(k => k.edge === 'top')

    // Log actual counts for debugging
    console.log(`\n120" x 116" panel klimp counts:`)
    console.log(`  Top: ${topKlimps.length}`)
    console.log(`  Left: ${leftKlimps.length}`)
    console.log(`  Right: ${rightKlimps.length}`)
    console.log(`  Total: ${layout.totalKlimps}`)

    // Log left edge positions and spacings
    const sortedLeft = leftKlimps.map(k => k.position).sort((a, b) => a - b)
    console.log(`  Left positions: ${sortedLeft.map(p => p.toFixed(2)).join(', ')}`)
    if (sortedLeft.length > 1) {
      console.log(`  Left spacings:`)
      for (let i = 1; i < sortedLeft.length; i++) {
        const spacing = sortedLeft[i] - sortedLeft[i-1]
        console.log(`    ${spacing.toFixed(2)}"`)
      }
    }

    // For a 116" tall panel with side range of ~106", we need at least 5 klimps
    // to keep maximum spacing under 24"
    expect(leftKlimps.length).toBeGreaterThanOrEqual(5)
    expect(rightKlimps.length).toBeGreaterThanOrEqual(5)

    // For a 120" wide panel with top range of ~115", we need at least 5 klimps
    expect(topKlimps.length).toBeGreaterThanOrEqual(5)

    // Minimum 6 total (2 per edge × 3 edges)
    expect(layout.totalKlimps).toBeGreaterThanOrEqual(15)
  })

  it('handles problematic dimensions (120" x 111")', () => {
    const layout = KlimpCalculator.calculateKlimpLayout(120, 111)
    const leftKlimps = layout.klimps.filter(k => k.edge === 'left')
    const topKlimps = layout.klimps.filter(k => k.edge === 'top')

    console.log(`\n120" x 111" panel klimp counts:`)
    console.log(`  Top: ${topKlimps.length}`)
    console.log(`  Left: ${leftKlimps.length}`)
    console.log(`  Total: ${layout.totalKlimps}`)

    const sortedTop = topKlimps.map(k => k.position).sort((a, b) => a - b)
    const sortedLeft = leftKlimps.map(k => k.position).sort((a, b) => a - b)

    console.log(`  Top positions: ${sortedTop.map(p => p.toFixed(2)).join(', ')}`)
    console.log(`  Top spacings:`)
    for (let i = 1; i < sortedTop.length; i++) {
      const spacing = sortedTop[i] - sortedTop[i-1]
      console.log(`    ${spacing.toFixed(2)}"`)
    }

    console.log(`  Left positions: ${sortedLeft.map(p => p.toFixed(2)).join(', ')}`)
    console.log(`  Left spacings:`)
    for (let i = 1; i < sortedLeft.length; i++) {
      const spacing = sortedLeft[i] - sortedLeft[i-1]
      console.log(`    ${spacing.toFixed(2)}"`)
    }

    // Check minimum spacing is respected
    withinSpacingBounds(sortedTop, minSpacing, maxSpacing)
    withinSpacingBounds(sortedLeft, minSpacing, maxSpacing)
  })

  it('generates optimal klimp count for 120" height', () => {
    const layout = KlimpCalculator.calculateKlimpLayout(96, 120)
    const leftKlimps = layout.klimps.filter(k => k.edge === 'left')

    console.log(`\n96" x 120" panel (120" height) klimp counts:`)
    console.log(`  Left: ${leftKlimps.length}`)
    console.log(`  Total: ${layout.totalKlimps}`)

    const sortedLeft = leftKlimps.map(k => k.position).sort((a, b) => a - b)
    console.log(`  Left positions: ${sortedLeft.map(p => p.toFixed(2)).join(', ')}`)
    console.log(`  Left spacings:`)
    for (let i = 1; i < sortedLeft.length; i++) {
      const spacing = sortedLeft[i] - sortedLeft[i-1]
      console.log(`    ${spacing.toFixed(2)}"`)
    }

    // For 120" height with 8" top clearance, span is ~106.5"
    // With 18" target spacing: 106.5/18 = 5.9 → 6 intervals = 7 klimps
    expect(leftKlimps.length).toBeGreaterThanOrEqual(7)
    withinSpacingBounds(sortedLeft, minSpacing, maxSpacing)
  })
})
