import { KlimpSTEPIntegration } from '../klimp-step-integration'

describe('KlimpSTEPIntegration', () => {
  const sampleKlimps = [
    { id: 'KL1', edge: 'top' as const, position: 10, x: 12, y: 0, z: 48 },
    { id: 'KL2', edge: 'left' as const, position: 20, x: -30, y: 0, z: 24 },
    { id: 'KL3', edge: 'right' as const, position: 28, x: 30, y: 0, z: 24 }
  ]

  it('creates active and suppressed instances with edge-aware rotations', () => {
    const instances = KlimpSTEPIntegration.generateKlimpInstances(sampleKlimps)

    expect(instances).toHaveLength(KlimpSTEPIntegration.getMaxKlimpCount())

    const [topInstance, leftInstance, rightInstance] = instances
    expect(topInstance.active).toBe(true)
    expect(topInstance.rotation).toEqual({ x: 0, y: 0, z: 0 })

    expect(leftInstance.active).toBe(true)
    expect(leftInstance.rotation.y).toBe(90)
    expect(leftInstance.rotation.z).toBe(90)

    expect(rightInstance.active).toBe(true)
    expect(rightInstance.rotation.y).toBe(-90)
    expect(rightInstance.rotation.z).toBe(-90)

    const suppressed = instances.filter(instance => !instance.active)
    expect(suppressed.length).toBe(KlimpSTEPIntegration.getMaxKlimpCount() - sampleKlimps.length)
    expect(suppressed.every(instance => instance.position.x === 0 && instance.position.y === 0)).toBe(true)
  })

  it('generates STEP references and exposes STEP metadata', () => {
    const instances = KlimpSTEPIntegration.generateKlimpInstances(sampleKlimps)
    const references = KlimpSTEPIntegration.generateSTEPReferences(instances)

    expect(references).toHaveLength(sampleKlimps.length)
    references.forEach(reference => {
      expect(reference).toContain('NEXT_ASSEMBLY_USAGE_OCCURRENCE')
      expect(reference).toContain('AXIS2_PLACEMENT_3D')
    })

    expect(KlimpSTEPIntegration.getKlimpSTEPPath()).toContain('Klimp 4.stp')
    expect(KlimpSTEPIntegration.getKlimpGeometry().thickness).toBeCloseTo(0.125)
    expect(KlimpSTEPIntegration.generateNXImportInstructions()).toContain('KLIMP IMPORT INSTRUCTIONS')
  })
})
