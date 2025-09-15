import {
  validateCrateConfiguration,
  validateProductDimensions,
  validateMaterialSpecifications,
  validateClearanceRequirements,
  validateSkidRequirements,
  getValidationErrors,
  getValidationWarnings,
  isConfigurationValid
} from '../validation'
import { defaultCrateConfiguration } from '../../../types/crate'

describe('Crate Validation', () => {
  describe('validateCrateConfiguration', () => {
    it('should validate a correct configuration', () => {
      const result = validateCrateConfiguration(defaultCrateConfiguration)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.warnings).toHaveLength(0)
    })

    it('should detect invalid product dimensions', () => {
      const invalidConfig = {
        ...defaultCrateConfiguration,
        product: {
          ...defaultCrateConfiguration.product,
          length: -10, // Invalid negative dimension
          width: 0,    // Invalid zero dimension
          height: 1000 // Too large
        }
      }

      const result = validateCrateConfiguration(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('length'))).toBe(true)
      expect(result.errors.some(error => error.includes('width'))).toBe(true)
      expect(result.errors.some(error => error.includes('height'))).toBe(true)
    })

    it('should detect invalid material specifications', () => {
      const invalidConfig = {
        ...defaultCrateConfiguration,
        materials: {
          ...defaultCrateConfiguration.materials,
          plywood: {
            ...defaultCrateConfiguration.materials.plywood,
            thickness: -0.5, // Invalid negative thickness
            grade: 'INVALID' // Invalid grade
          }
        }
      }

      const result = validateCrateConfiguration(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('thickness'))).toBe(true)
      expect(result.errors.some(error => error.includes('grade'))).toBe(true)
    })

    it('should detect invalid clearance requirements', () => {
      const invalidConfig = {
        ...defaultCrateConfiguration,
        clearances: {
          ...defaultCrateConfiguration.clearances,
          side: -1, // Invalid negative clearance
          top: 100  // Too large clearance
        }
      }

      const result = validateCrateConfiguration(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('clearance'))).toBe(true)
    })

    it('should detect invalid skid requirements', () => {
      const invalidConfig = {
        ...defaultCrateConfiguration,
        skids: {
          ...defaultCrateConfiguration.skids,
          count: -1, // Invalid negative count
          overhang: -2 // Invalid negative overhang
        }
      }

      const result = validateCrateConfiguration(invalidConfig)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('skid'))).toBe(true)
    })
  })

  describe('validateProductDimensions', () => {
    it('should validate correct product dimensions', () => {
      const product = defaultCrateConfiguration.product
      const result = validateProductDimensions(product)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect negative dimensions', () => {
      const product = {
        ...defaultCrateConfiguration.product,
        length: -10,
        width: -5,
        height: -2
      }

      const result = validateProductDimensions(product)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('negative'))).toBe(true)
    })

    it('should detect zero dimensions', () => {
      const product = {
        ...defaultCrateConfiguration.product,
        length: 0,
        width: 10,
        height: 20
      }

      const result = validateProductDimensions(product)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('zero'))).toBe(true)
    })

    it('should detect excessive dimensions', () => {
      const product = {
        ...defaultCrateConfiguration.product,
        length: 1000, // Too large
        width: 500,   // Too large
        height: 200   // Too large
      }

      const result = validateProductDimensions(product)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('excessive'))).toBe(true)
    })

    it('should detect invalid weight', () => {
      const product = {
        ...defaultCrateConfiguration.product,
        weight: -100 // Invalid negative weight
      }

      const result = validateProductDimensions(product)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('weight'))).toBe(true)
    })
  })

  describe('validateMaterialSpecifications', () => {
    it('should validate correct material specifications', () => {
      const materials = defaultCrateConfiguration.materials
      const result = validateMaterialSpecifications(materials)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid plywood specifications', () => {
      const materials = {
        ...defaultCrateConfiguration.materials,
        plywood: {
          ...defaultCrateConfiguration.materials.plywood,
          thickness: -0.5, // Invalid negative thickness
          grade: 'INVALID' // Invalid grade
        }
      }

      const result = validateMaterialSpecifications(materials)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('plywood'))).toBe(true)
    })

    it('should detect invalid lumber specifications', () => {
      const materials = {
        ...defaultCrateConfiguration.materials,
        lumber: {
          ...defaultCrateConfiguration.materials.lumber,
          grade: 'INVALID', // Invalid grade
          moistureContent: -5 // Invalid negative moisture
        }
      }

      const result = validateMaterialSpecifications(materials)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('lumber'))).toBe(true)
    })

    it('should detect invalid hardware specifications', () => {
      const materials = {
        ...defaultCrateConfiguration.materials,
        hardware: {
          ...defaultCrateConfiguration.materials.hardware,
          screwCount: -10, // Invalid negative count
          screwLength: 0   // Invalid zero length
        }
      }

      const result = validateMaterialSpecifications(materials)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('hardware'))).toBe(true)
    })
  })

  describe('validateClearanceRequirements', () => {
    it('should validate correct clearance requirements', () => {
      const clearances = defaultCrateConfiguration.clearances
      const result = validateClearanceRequirements(clearances)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect negative clearances', () => {
      const clearances = {
        ...defaultCrateConfiguration.clearances,
        side: -1,
        top: -0.5,
        bottom: -2
      }

      const result = validateClearanceRequirements(clearances)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('negative'))).toBe(true)
    })

    it('should detect excessive clearances', () => {
      const clearances = {
        ...defaultCrateConfiguration.clearances,
        side: 100,  // Too large
        top: 50,    // Too large
        bottom: 25  // Too large
      }

      const result = validateClearanceRequirements(clearances)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('excessive'))).toBe(true)
    })

    it('should detect zero clearances', () => {
      const clearances = {
        ...defaultCrateConfiguration.clearances,
        side: 0,
        top: 0,
        bottom: 0
      }

      const result = validateClearanceRequirements(clearances)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('zero'))).toBe(true)
    })
  })

  describe('validateSkidRequirements', () => {
    it('should validate correct skid requirements', () => {
      const skids = defaultCrateConfiguration.skids
      const result = validateSkidRequirements(skids)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect negative skid count', () => {
      const skids = {
        ...defaultCrateConfiguration.skids,
        count: -1
      }

      const result = validateSkidRequirements(skids)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('count'))).toBe(true)
    })

    it('should detect negative overhang', () => {
      const skids = {
        ...defaultCrateConfiguration.skids,
        overhang: -2
      }

      const result = validateSkidRequirements(skids)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('overhang'))).toBe(true)
    })

    it('should detect excessive skid count', () => {
      const skids = {
        ...defaultCrateConfiguration.skids,
        count: 100 // Too many skids
      }

      const result = validateSkidRequirements(skids)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('excessive'))).toBe(true)
    })
  })

  describe('getValidationErrors', () => {
    it('should return empty array for valid configuration', () => {
      const errors = getValidationErrors(defaultCrateConfiguration)
      
      expect(errors).toHaveLength(0)
    })

    it('should return errors for invalid configuration', () => {
      const invalidConfig = {
        ...defaultCrateConfiguration,
        product: {
          ...defaultCrateConfiguration.product,
          length: -10
        }
      }

      const errors = getValidationErrors(invalidConfig)
      
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.every(error => typeof error === 'string')).toBe(true)
    })
  })

  describe('getValidationWarnings', () => {
    it('should return empty array for optimal configuration', () => {
      const warnings = getValidationWarnings(defaultCrateConfiguration)
      
      expect(warnings).toHaveLength(0)
    })

    it('should return warnings for suboptimal configuration', () => {
      const suboptimalConfig = {
        ...defaultCrateConfiguration,
        materials: {
          ...defaultCrateConfiguration.materials,
          plywood: {
            ...defaultCrateConfiguration.materials.plywood,
            thickness: 0.25 // Very thin, might be suboptimal
          }
        }
      }

      const warnings = getValidationWarnings(suboptimalConfig)
      
      expect(warnings.length).toBeGreaterThan(0)
      expect(warnings.every(warning => typeof warning === 'string')).toBe(true)
    })
  })

  describe('isConfigurationValid', () => {
    it('should return true for valid configuration', () => {
      const isValid = isConfigurationValid(defaultCrateConfiguration)
      
      expect(isValid).toBe(true)
    })

    it('should return false for invalid configuration', () => {
      const invalidConfig = {
        ...defaultCrateConfiguration,
        product: {
          ...defaultCrateConfiguration.product,
          length: -10
        }
      }

      const isValid = isConfigurationValid(invalidConfig)
      
      expect(isValid).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined configuration', () => {
      const result = validateCrateConfiguration(undefined as any)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle null configuration', () => {
      const result = validateCrateConfiguration(null as any)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle empty configuration', () => {
      const result = validateCrateConfiguration({} as any)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle configuration with missing properties', () => {
      const incompleteConfig = {
        product: defaultCrateConfiguration.product
        // Missing materials, clearances, etc.
      }

      const result = validateCrateConfiguration(incompleteConfig as any)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})
