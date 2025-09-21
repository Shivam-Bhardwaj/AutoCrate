import { KlimpCalculator, CleatInfo } from '../src/lib/klimp-calculator'

describe('KlimpCalculator', () => {
  describe('calculateKlimpLayout', () => {
    it('should place corner klimps strategically', () => {
      const panelWidth = 48
      const panelHeight = 36

      const layout = KlimpCalculator.calculateKlimpLayout(
        panelWidth,
        panelHeight,
        [], // No vertical cleats for this test
        [],
        []
      )

      // Check that we have corner klimps
      const topKlimps = layout.klimps.filter(k => k.edge === 'top')

      // Should have 2 corner klimps (1 on each corner)
      expect(topKlimps.length).toBeGreaterThanOrEqual(2)

      // Check left corner klimp
      const leftCornerKlimps = topKlimps.filter(k => k.position < 10)
      expect(leftCornerKlimps.length).toBe(1)

      // Check right corner klimp
      const rightCornerKlimps = topKlimps.filter(k => k.position > panelWidth - 10)
      expect(rightCornerKlimps.length).toBe(1)
    })

    it('should place klimps between vertical cleats', () => {
      const panelWidth = 48
      const panelHeight = 36

      // Simulate vertical cleats
      const topCleats: CleatInfo[] = [
        { position: 0, width: 3.5 },     // Left edge cleat
        { position: 20, width: 3.5 },    // Middle cleat
        { position: 44.5, width: 3.5 }   // Right edge cleat
      ]

      const layout = KlimpCalculator.calculateKlimpLayout(
        panelWidth,
        panelHeight,
        topCleats,
        [],
        []
      )

      const topKlimps = layout.klimps.filter(k => k.edge === 'top')

      // Should have corner klimps plus klimps between cleats
      expect(topKlimps.length).toBeGreaterThanOrEqual(2) // At least 2 corner klimps

      // Check for klimps between cleats (around position 12 and 34)
      const middleKlimps = topKlimps.filter(k => k.position > 10 && k.position < 38)
      expect(middleKlimps.length).toBeGreaterThan(0)
    })

    it('should place side klimps symmetrically at 24 inch intervals', () => {
      const panelWidth = 48
      const panelHeight = 36

      const layout = KlimpCalculator.calculateKlimpLayout(
        panelWidth,
        panelHeight,
        [],
        [],
        []
      )

      const leftKlimps = layout.klimps.filter(k => k.edge === 'left')
      const rightKlimps = layout.klimps.filter(k => k.edge === 'right')

      // Should have same number of klimps on each side
      expect(leftKlimps.length).toBe(rightKlimps.length)

      // Should be placed symmetrically
      for (let i = 0; i < leftKlimps.length; i++) {
        expect(leftKlimps[i].position).toBe(rightKlimps[i].position)
      }

      // Check spacing (should be approximately 24" but may be slightly more for even distribution)
      for (let i = 1; i < leftKlimps.length; i++) {
        const spacing = leftKlimps[i].position - leftKlimps[i - 1].position
        expect(spacing).toBeLessThanOrEqual(30) // Allow some flexibility for symmetric distribution
      }
    })

    it('should optimize for strength and number', () => {
      const panelWidth = 96 // Large panel
      const panelHeight = 48

      const topCleats: CleatInfo[] = [
        { position: 0, width: 3.5 },
        { position: 30, width: 3.5 },
        { position: 60, width: 3.5 },
        { position: 92.5, width: 3.5 }
      ]

      const layout = KlimpCalculator.calculateKlimpLayout(
        panelWidth,
        panelHeight,
        topCleats,
        [],
        []
      )

      // Should have reasonable number of klimps (not excessive)
      expect(layout.totalKlimps).toBeLessThan(20) // Optimized, not excessive

      // Should have klimps on all edges
      const topKlimps = layout.klimps.filter(k => k.edge === 'top')
      const leftKlimps = layout.klimps.filter(k => k.edge === 'left')
      const rightKlimps = layout.klimps.filter(k => k.edge === 'right')

      expect(topKlimps.length).toBeGreaterThan(0)
      expect(leftKlimps.length).toBeGreaterThan(0)
      expect(rightKlimps.length).toBeGreaterThan(0)
    })

    it('should calculate material usage correctly', () => {
      const layouts = [
        {
          panelName: 'FRONT_PANEL',
          klimps: new Array(12).fill(null).map((_, i) => ({
            id: `KLIMP_${i}`,
            edge: 'top' as const,
            position: i * 4,
            x: 0,
            y: 0,
            z: 0
          })),
          totalKlimps: 12
        }
      ]

      const usage = KlimpCalculator.calculateKlimpMaterial(layouts)

      expect(usage.totalKlimps).toBe(12)
      expect(usage.estimatedPackages).toBe(1) // 12 klimps = 1 package of 25
    })
  })
})