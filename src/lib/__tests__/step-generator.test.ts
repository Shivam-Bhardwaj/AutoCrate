import { StepGenerator } from '../step-generator'
import { NXBox } from '../nx-generator'

const generate = (boxes: NXBox[], options?: ConstructorParameters<typeof StepGenerator>[1]) => {
  const generator = new StepGenerator(boxes, options)
  return generator.generate()
}

describe('StepGenerator (AP242)', () => {
  const mockBoxes: NXBox[] = [
    {
      name: 'TEST_BOX_1',
      point1: { x: 0, y: 0, z: 0 },
      point2: { x: 10, y: 10, z: 10 },
      type: 'skid'
    },
    {
      name: 'TEST_BOX_2',
      point1: { x: 5, y: 5, z: 5 },
      point2: { x: 15, y: 15, z: 20 },
      type: 'panel'
    },
    {
      name: 'SUPPRESSED_BOX',
      point1: { x: 0, y: 0, z: 0 },
      point2: { x: 5, y: 5, z: 5 },
      type: 'panel',
      suppressed: true
    }
  ]

  it('filters out suppressed boxes', () => {
    const output = generate(mockBoxes)
    expect(output).toContain("MANIFOLD_SOLID_BREP('skid'")
    expect(output).toContain("MANIFOLD_SOLID_BREP('panel'")
    expect(output).not.toContain('SUPPRESSED_BOX')
  })

  it('emits an AP242 header and schema', () => {
    const output = generate(mockBoxes)
    expect(output).toMatch(/^ISO-10303-21;/)
    expect(output).toContain("FILE_SCHEMA(('AP242_MANAGED_MODEL_BASED_3D_ENGINEERING_MIM_LATEST'))")
    expect(output).toContain('APPLICATION_PROTOCOL_DEFINITION')
  })

  it('creates manifold solid BREP entries per unsuppressed box', () => {
    const output = generate(mockBoxes)
    const breps = output.match(/MANIFOLD_SOLID_BREP\('/g) || []
    expect(breps.length).toBe(2)
    expect(output).toContain("PRODUCT('skid'")
    expect(output).toContain("PRODUCT('panel'")
    expect(output).toContain("SHAPE_REPRESENTATION('AUTOCRATE CRATE ASSEMBLY'")
    expect(output).toContain("SHAPE_REPRESENTATION('SHIPPING_BASE'")
    expect(output).toContain("SHAPE_REPRESENTATION('CRATE_CAP'")
    expect(output).toContain("SHAPE_REPRESENTATION('KLIMP_FASTENERS'")
    expect(output).toContain("SHAPE_REPRESENTATION('STENCILS'")
    expect(output).toContain("SHAPE_REPRESENTATION('SKID_ASSEMBLY'")
    expect(output).toContain("SHAPE_REPRESENTATION('CAP_MISC_ASSEMBLY'")
    expect(output).toMatch(/NEXT_ASSEMBLY_USAGE_OCCURRENCE\('[^']+','SHIPPING_BASE'/)
    expect(output).toMatch(/NEXT_ASSEMBLY_USAGE_OCCURRENCE\('[^']+','SKID_ASSEMBLY'/)
    expect(output).toMatch(/NEXT_ASSEMBLY_USAGE_OCCURRENCE\('[^']+','CRATE_CAP'/)
    expect(output).toMatch(/NEXT_ASSEMBLY_USAGE_OCCURRENCE\('[^']+','KLIMP_FASTENERS'/)
    expect(output).toMatch(/NEXT_ASSEMBLY_USAGE_OCCURRENCE\('[^']+','STENCILS'/)
    expect(output).toMatch(/NEXT_ASSEMBLY_USAGE_OCCURRENCE\('[^']+','CAP_MISC_ASSEMBLY'/)
  })

  it('converts inches to millimetres for coordinates', () => {
    const output = generate([mockBoxes[0]])
    expect(output).toContain('(254') // 10 inches in mm
    expect(output).toContain('(127') // 5 inches in mm (center)
  })

  it('adds PMI properties when enabled', () => {
    const output = generate(mockBoxes, { includePMI: true })
    expect(output).toContain('overall_length_mm')
    expect(output).toContain('overall_width_mm')
    expect(output).toContain('overall_height_mm')
    expect(output).toContain('CRATE_PMI_NOTE')
  })

  it('skips PMI when disabled', () => {
    const output = generate(mockBoxes, { includePMI: false })
    expect(output).not.toContain('overall_length_mm')
    expect(output).not.toContain('CRATE_PMI_NOTE')
  })

  it('supports negative coordinates', () => {
    const negativeBox: NXBox = {
      name: 'NEGATIVE_BOX',
      point1: { x: -10, y: -10, z: -10 },
      point2: { x: 0, y: 0, z: 0 },
      type: 'panel'
    }
    const output = generate([negativeBox])
    expect(output).toContain("MANIFOLD_SOLID_BREP('panel'")
    expect(output).toContain('-254') // -10 inches in mm
  })

  it('produces a valid file for an empty model', () => {
    const output = generate([])
    expect(output).toContain('ISO-10303-21')
    expect(output).toContain('ENDSEC;')
    expect(output.trim()).toMatch(/END-ISO-10303-21;$/)
  })

  it('generates monotonically increasing entity identifiers', () => {
    const output = generate([mockBoxes[0]])
    const entityDefinitions = output.match(/^#(\d+)=/gm) || []
    const numbers = entityDefinitions.map(def => parseInt(def.replace(/[^0-9]/g, ''), 10))
    for (let i = 1; i < numbers.length; i++) {
      expect(numbers[i]).toBeGreaterThanOrEqual(numbers[i - 1])
    }
  })
})
