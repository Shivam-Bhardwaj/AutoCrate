import { NXExpressionGenerator } from '../../nx/nx-expression-generator'
import { defaultCrateConfiguration } from '../../../types/crate'

describe('NXExpressionGenerator', () => {
  let generator: NXExpressionGenerator

  beforeEach(() => {
    generator = new NXExpressionGenerator()
  })

  describe('generateExpressions', () => {
    it('should generate valid NX expressions for default configuration', async () => {
      const expressions = await generator.generateExpressions(defaultCrateConfiguration)

      expect(expressions.metadata.version).toBe('2.0.0')
      expect(expressions.metadata.standardsCompliance).toBe('AMAT-0251-70054')
      expect(expressions.metadata.templateVersion).toBe('AUTOCRATE_TEMPLATE_V2.0.0')
      expect(expressions.metadata.generatedAt).toBeDefined()
      expect(expressions.metadata.validationChecksum).toBeDefined()
    })

    it('should include correct product specifications', async () => {
      const expressions = await generator.generateExpressions(defaultCrateConfiguration)

      expect(expressions.productSpecs.product_length_in).toBe(defaultCrateConfiguration.product.length)
      expect(expressions.productSpecs.product_width_in).toBe(defaultCrateConfiguration.product.width)
      expect(expressions.productSpecs.product_height_in).toBe(defaultCrateConfiguration.product.height)
      expect(expressions.productSpecs.product_weight_lb).toBe(defaultCrateConfiguration.product.weight)
    })

    it('should calculate correct overall dimensions', async () => {
      const expressions = await generator.generateExpressions(defaultCrateConfiguration)

      // Overall dimensions should be product + clearances + wall thickness
      const expectedWidth = defaultCrateConfiguration.product.width + 
                           (defaultCrateConfiguration.clearances.width * 2) + 3 // 1.5" wall thickness on each side
      const expectedLength = defaultCrateConfiguration.product.length + 
                            (defaultCrateConfiguration.clearances.length * 2) + 3
      const expectedHeight = defaultCrateConfiguration.product.height + 
                            defaultCrateConfiguration.clearances.height + 1.5

      expect(expressions.calculatedDimensions.crate_overall_width_OD_in).toBe(expectedWidth)
      expect(expressions.calculatedDimensions.crate_overall_length_OD_in).toBe(expectedLength)
      expect(expressions.calculatedDimensions.crate_overall_height_OD_in).toBe(expectedHeight)
    })

    it('should select appropriate skid size based on weight', async () => {
      const lightConfig = { ...defaultCrateConfiguration, product: { ...defaultCrateConfiguration.product, weight: 300 } }
      const heavyConfig = { ...defaultCrateConfiguration, product: { ...defaultCrateConfiguration.product, weight: 1500 } }

      const lightExpressions = await generator.generateExpressions(lightConfig)
      const heavyExpressions = await generator.generateExpressions(heavyConfig)

      expect(lightExpressions.skidSpecs.skid_lumber_size_callout).toBe('2x4')
      expect(heavyExpressions.skidSpecs.skid_lumber_size_callout).toBe('4x6')
    })

    it('should include correct material specifications', async () => {
      const expressions = await generator.generateExpressions(defaultCrateConfiguration)

      expect(expressions.materialSpecs.lumber_grade).toBe(defaultCrateConfiguration.materials.lumber.grade)
      expect(expressions.materialSpecs.lumber_treatment).toBe(defaultCrateConfiguration.materials.lumber.treatment)
      expect(expressions.materialSpecs.plywood_grade).toBe(defaultCrateConfiguration.materials.plywood.grade)
      expect(expressions.materialSpecs.plywood_thickness).toBe(defaultCrateConfiguration.materials.plywood.thickness)
      expect(expressions.materialSpecs.hardware_coating).toBe(defaultCrateConfiguration.materials.hardware.coating)
    })

    it('should calculate hardware requirements', async () => {
      const expressions = await generator.generateExpressions(defaultCrateConfiguration)

      expect(expressions.hardwareSpecs.lag_screw_count).toBeGreaterThan(0)
      expect(expressions.hardwareSpecs.klimp_count).toBeGreaterThan(0)
      expect(expressions.hardwareSpecs.flat_washer_count).toBeGreaterThan(0)
      expect(expressions.hardwareSpecs.cleat_screw_count).toBeGreaterThan(0)
      expect(expressions.hardwareSpecs.fastening_pattern).toBe('16" OC')
    })
  })

  describe('generateExpressionFile', () => {
    it('should generate valid NX expression file content', async () => {
      const expressions = await generator.generateExpressions(defaultCrateConfiguration)
      const fileContent = generator.generateExpressionFile(expressions)

      expect(fileContent).toContain('# AutoCrate Generated NX Expressions')
      expect(fileContent).toContain('product_length_in =')
      expect(fileContent).toContain('crate_overall_width_OD_in =')
      expect(fileContent).toContain('skid_lumber_size_callout =')
      expect(fileContent).toContain('lag_screw_count =')
      expect(fileContent).toContain('lumber_grade =')
    })

    it('should include all required sections', async () => {
      const expressions = await generator.generateExpressions(defaultCrateConfiguration)
      const fileContent = generator.generateExpressionFile(expressions)

      const sections = [
        '# Product Specifications',
        '# Calculated Dimensions',
        '# Skid Specifications',
        '# Panel Specifications',
        '# Hardware Specifications',
        '# Material Specifications'
      ]

      sections.forEach(section => {
        expect(fileContent).toContain(section)
      })
    })

    it('should format values correctly', async () => {
      const expressions = await generator.generateExpressions(defaultCrateConfiguration)
      const fileContent = generator.generateExpressionFile(expressions)

      // Check that numeric values are not quoted
      expect(fileContent).toMatch(/product_length_in = \d+/)
      expect(fileContent).toMatch(/product_weight_lb = \d+/)
      
      // Check that string values are quoted
      expect(fileContent).toMatch(/lumber_grade = "[^"]+"/)
      expect(fileContent).toMatch(/plywood_grade = "[^"]+"/)
    })
  })

  describe('edge cases', () => {
    it('should handle zero weight products', async () => {
      const zeroWeightConfig = { ...defaultCrateConfiguration, product: { ...defaultCrateConfiguration.product, weight: 0 } }
      
      await expect(generator.generateExpressions(zeroWeightConfig)).resolves.toBeDefined()
    })

    it('should handle very large products', async () => {
      const largeConfig = { 
        ...defaultCrateConfiguration, 
        product: { 
          ...defaultCrateConfiguration.product, 
          length: 200, 
          width: 200, 
          height: 200, 
          weight: 5000 
        } 
      }
      
      const expressions = await generator.generateExpressions(largeConfig)
      expect(expressions.skidSpecs.skid_lumber_size_callout).toBe('6x6')
    })

    it('should handle minimum clearances', async () => {
      const minClearanceConfig = {
        ...defaultCrateConfiguration,
        clearances: { width: 1, length: 1, height: 1 }
      }
      
      const expressions = await generator.generateExpressions(minClearanceConfig)
      expect(expressions.calculatedDimensions.internal_clearance_width).toBe(1)
      expect(expressions.calculatedDimensions.internal_clearance_length).toBe(1)
      expect(expressions.calculatedDimensions.internal_clearance_height).toBe(1)
    })
  })
})
