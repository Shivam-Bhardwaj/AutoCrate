import {
  CLEAT_STANDARDS,
  FASTENER_STANDARDS,
  LUMBER_CATEGORIES,
  LUMBER_DIMENSIONS,
  PANEL_STOP_STANDARDS,
  PLYWOOD_STANDARDS,
  SKID_STANDARDS,
  formatDimension,
  toFractionalInches
} from '../crate-constants'

describe('crate-constants helpers', () => {
  describe('toFractionalInches', () => {
    it('returns whole numbers when value is near integer', () => {
      expect(toFractionalInches(3)).toBe('3')
      expect(toFractionalInches(4.00001)).toBe('4')
    })

    it('returns common fractions', () => {
      expect(toFractionalInches(0.75)).toBe('3/4')
      expect(toFractionalInches(1.5)).toBe('1 1/2')
    })

    it('falls back to decimal when fraction not matched', () => {
      expect(toFractionalInches(0.333)).toBe('0.333')
    })
  })

  describe('formatDimension', () => {
    it('formats using fractional helper by default', () => {
      expect(formatDimension(1.25)).toBe('1 1/4"')
    })

    it('supports decimal formatting and custom suffix', () => {
      expect(formatDimension(2.5, false, ' in')).toBe('2.500 in')
    })
  })

  it('exposes plywood standards and lumber dimensions', () => {
    expect(PLYWOOD_STANDARDS.SHEET_WIDTH).toBe(48)
    expect(PLYWOOD_STANDARDS.AVAILABLE_THICKNESSES).toContain(0.75)
    expect(LUMBER_DIMENSIONS['2x4']).toEqual({ height: 1.5, width: 3.5 })
    expect(LUMBER_CATEGORIES.SKID_SIZES).toContain('4x6')
  })

  it('documents skid, cleat, fastener, and panel stop standards', () => {
    expect(SKID_STANDARDS.MIN_FORKLIFT_HEIGHT).toBeGreaterThan(3)
    expect(CLEAT_STANDARDS.DEFAULT_SIZE).toBe('1x4')
    expect(FASTENER_STANDARDS.LAG_SCREW.SPECIFICATIONS.partNumber).toMatch(/LAG SCREW/)
    expect(PANEL_STOP_STANDARDS.MATERIAL.thickness).toBeCloseTo(0.375)
  })
})
