import { LagSTEPIntegration } from '../lag-step-integration'

describe('LagSTEPIntegration', () => {
  it('provides fixed geometry details', () => {
    const geometry = LagSTEPIntegration.getGeometry()
    expect(geometry.headDiameter).toBeCloseTo(0.75)
    expect(geometry.shankLength).toBeCloseTo(3)
    expect(geometry.headHeight).toBeGreaterThan(0)
  })

  it('exposes STEP path and import instructions', () => {
    expect(LagSTEPIntegration.getStepPath()).toContain('.stp')

    const instructions = LagSTEPIntegration.generateNXImportInstructions()
    expect(instructions).toContain('Import -> STEP214')
    expect(instructions).toContain('LAG SCREW')
  })
})
