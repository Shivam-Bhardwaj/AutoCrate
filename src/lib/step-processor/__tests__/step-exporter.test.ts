import { STEPExporter } from '../step-exporter'
import { generatePMIAnnotations } from '../pmi-annotations'
import { defaultCrateConfiguration } from '@/types/crate'
import { calculateCrateDimensions } from '@/lib/domain/calculations'

describe('STEPExporter', () => {
  let stepExporter: STEPExporter
  let config: typeof defaultCrateConfiguration

  beforeEach(() => {
    stepExporter = new STEPExporter()
    config = { ...defaultCrateConfiguration }
  })

  it('should generate STEP file with PMI annotations', async () => {
    const dimensions = calculateCrateDimensions(config)
    const pmiAnnotations = generatePMIAnnotations(config, dimensions)
    
    const stepFile = await stepExporter.exportWithPMI(config, pmiAnnotations)
    
    expect(stepFile).toBeDefined()
    expect(stepFile.filename).toMatch(/autocrate_assembly_\d{4}-\d{2}-\d{2}\.stp/)
    expect(stepFile.content).toContain('ISO-10303-21')
    expect(stepFile.content).toContain('AutoCrate STEP Export with PMI')
    expect(stepFile.content).toContain('AMAT-0251-70054')
    expect(stepFile.metadata.pmiIncluded).toBe(true)
  })

  it('should include product dimensions in STEP file', async () => {
    const dimensions = calculateCrateDimensions(config)
    const pmiAnnotations = generatePMIAnnotations(config, dimensions)
    
    const stepFile = await stepExporter.exportWithPMI(config, pmiAnnotations)
    
    expect(stepFile.content).toContain(`Product Dimensions',(${config.product.length},${config.product.width},${config.product.height})`)
    expect(stepFile.content).toContain(`Center of Gravity',(${config.product.centerOfGravity.x},${config.product.centerOfGravity.y},${config.product.centerOfGravity.z})`)
  })

  it('should include PMI annotations in STEP file', async () => {
    const dimensions = calculateCrateDimensions(config)
    const pmiAnnotations = generatePMIAnnotations(config, dimensions)
    
    const stepFile = await stepExporter.exportWithPMI(config, pmiAnnotations)
    
    // Check for dimensional annotations
    expect(stepFile.content).toContain('DIMENSIONAL_SIZE')
    expect(stepFile.content).toContain('DIM_PRODUCT_LENGTH')
    expect(stepFile.content).toContain('DIM_PRODUCT_WIDTH')
    expect(stepFile.content).toContain('DIM_PRODUCT_HEIGHT')
    
    // Check for geometric tolerances
    expect(stepFile.content).toContain('GEOMETRIC_TOLERANCE')
    expect(stepFile.content).toContain('GTOL_SKID_FLATNESS')
    
    // Check for manufacturing notes
    expect(stepFile.content).toContain('MANUFACTURING_NOTE')
    expect(stepFile.content).toContain('NOTE_MATERIAL_SPECS')
  })

  it('should include material properties in STEP file', async () => {
    const dimensions = calculateCrateDimensions(config)
    const pmiAnnotations = generatePMIAnnotations(config, dimensions)
    
    const stepFile = await stepExporter.exportWithPMI(config, pmiAnnotations)
    
    expect(stepFile.content).toContain('MATERIAL_PROPERTY')
    expect(stepFile.content).toContain(config.materials.lumber.grade)
    expect(stepFile.content).toContain(config.materials.plywood.grade)
  })

  it('should include manufacturing metadata in STEP file', async () => {
    const dimensions = calculateCrateDimensions(config)
    const pmiAnnotations = generatePMIAnnotations(config, dimensions)
    
    const stepFile = await stepExporter.exportWithPMI(config, pmiAnnotations)
    
    expect(stepFile.content).toContain('PART_NUMBER')
    expect(stepFile.content).toContain('MANUFACTURING_INSTRUCTION')
  })
})

describe('generatePMIAnnotations', () => {
  it('should generate comprehensive PMI annotations', () => {
    const config = { ...defaultCrateConfiguration }
    const dimensions = calculateCrateDimensions(config)
    
    const annotations = generatePMIAnnotations(config, dimensions)
    
    expect(annotations.dimensions).toHaveLength(9) // Product + Crate + Clearance dimensions
    expect(annotations.geometricTolerances).toHaveLength(2) // Skid flatness + Panel perpendicularity
    expect(annotations.notes).toHaveLength(3) // Material specs + Assembly + Quality notes
    expect(annotations.datumFeatures).toHaveLength(3) // A, B, C datums
  })

  it('should include proper semantic references', () => {
    const config = { ...defaultCrateConfiguration }
    const dimensions = calculateCrateDimensions(config)
    
    const annotations = generatePMIAnnotations(config, dimensions)
    
    // Check dimensional annotations have semantic references
    const productLengthDim = annotations.dimensions.find(d => d.id === 'DIM_PRODUCT_LENGTH')
    expect(productLengthDim?.semanticReference).toBe('PRODUCT_OVERALL_LENGTH')
    
    // Check manufacturing notes have semantic references
    const materialNote = annotations.notes.find(n => n.id === 'NOTE_MATERIAL_SPECS')
    expect(materialNote?.semanticReference).toBe('MATERIAL_SPECIFICATION_REQUIREMENTS')
  })

  it('should include proper tolerances for dimensions', () => {
    const config = { ...defaultCrateConfiguration }
    const dimensions = calculateCrateDimensions(config)
    
    const annotations = generatePMIAnnotations(config, dimensions)
    
    // Check product dimensions have tolerances
    const productLengthDim = annotations.dimensions.find(d => d.id === 'DIM_PRODUCT_LENGTH')
    expect(productLengthDim?.tolerance).toBeDefined()
    expect(productLengthDim?.tolerance?.upperLimit).toBe(config.product.length + 0.125)
    expect(productLengthDim?.tolerance?.lowerLimit).toBe(config.product.length - 0.125)
  })
})
