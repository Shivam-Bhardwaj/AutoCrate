import { 
  calculateCrateDimensions, 
  calculateSkidRequirements,
  generateBillOfMaterials,
  defaultCrateConfiguration 
} from '../calculations'

describe('Crate Calculations', () => {
  describe('calculateCrateDimensions', () => {
    it('should calculate correct overall dimensions', () => {
      const config = defaultCrateConfiguration
      const dimensions = calculateCrateDimensions(config)
      
      // Product: 46x38x91.5, Clearances: 2" each side
      // Internal: 50x42x93.5, Overall: 53x45x95 (with 1.5" wall thickness)
      expect(dimensions.internalWidth).toBe(42) // 38 + 2*2
      expect(dimensions.internalLength).toBe(50) // 46 + 2*2
      expect(dimensions.internalHeight).toBe(93.5) // 91.5 + 2
      expect(dimensions.overallWidth).toBe(45) // 42 + 2*1.5
      expect(dimensions.overallLength).toBe(53) // 50 + 2*1.5
      expect(dimensions.overallHeight).toBe(95) // 93.5 + 1.5
    })
  })
  
  describe('calculateSkidRequirements', () => {
    it('should calculate correct skid count for heavy products', () => {
      const config = {
        ...defaultCrateConfiguration,
        product: { ...defaultCrateConfiguration.product, weight: 1500 }
      }
      
      const skids = calculateSkidRequirements(config)
      
      // 1500 lbs / 1000 lbs per skid = 2 skids required
      expect(skids.count).toBe(2)
      expect(skids.length).toBe(50) // 46 + 2 + 2 (product + overhangs)
    })
  })
  
  describe('generateBillOfMaterials', () => {
    it('should generate complete BOM with all required items', () => {
      const bom = generateBillOfMaterials(defaultCrateConfiguration)
      
      expect(bom.items.length).toBeGreaterThan(0)
      expect(bom.generatedAt).toBeInstanceOf(Date)
      expect(bom.materialWaste).toBeGreaterThan(0)
      expect(bom.materialWaste).toBeLessThan(20) // Should be reasonable
      
      // Check for required items
      const itemTypes = bom.items.map(item => item.id)
      expect(itemTypes).toContain('plywood-bottom')
      expect(itemTypes).toContain('plywood-sides')
      expect(itemTypes).toContain('plywood-ends')
      expect(itemTypes).toContain('plywood-top')
      expect(itemTypes).toContain('framing-2x4')
      expect(itemTypes).toContain('skid-lumber')
    })
  })
})
