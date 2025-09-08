import { describe, it, expect, beforeEach } from 'vitest';
import { NXExpressionGenerator } from '@/services/nx-generator';
import { DrawingGenerator } from '@/services/drawingGenerator';
import type { CrateConfiguration, NXExpression } from '@/types';

describe('NX Import Integration', () => {
  let mockConfig: CrateConfiguration;
  let generator: NXExpressionGenerator;
  let drawingGen: DrawingGenerator;

  beforeEach(() => {
    mockConfig = {
      projectName: 'NX-IMPORT-TEST-001',
      dimensions: { length: 48, width: 32, height: 24 },
      weight: { product: 750 },
      base: {
        type: 'standard',
        floorboardThickness: 0.75,
        skidHeight: 4,
        skidWidth: 3.5,
        skidCount: 3,
        skidSpacing: 16,
        requiresRubStrips: true,
        material: 'pine',
      },
      cap: {
        topPanel: { thickness: 0.75, material: 'plywood', reinforcement: false, ventilation: { enabled: false, type: 'holes', count: 0, size: 0 } },
        frontPanel: { thickness: 0.5, material: 'plywood', reinforcement: false, ventilation: { enabled: false, type: 'holes', count: 0, size: 0 } },
        backPanel: { thickness: 0.5, material: 'plywood', reinforcement: false, ventilation: { enabled: false, type: 'holes', count: 0, size: 0 } },
        leftPanel: { thickness: 0.5, material: 'plywood', reinforcement: false, ventilation: { enabled: false, type: 'holes', count: 0, size: 0 } },
        rightPanel: { thickness: 0.5, material: 'plywood', reinforcement: false, ventilation: { enabled: false, type: 'holes', count: 0, size: 0 } },
      },
      fasteners: { type: 'klimp', size: '8d', spacing: 6, material: 'steel' },
      vinyl: { enabled: false, type: 'waterproof', thickness: 0, coverage: 'full' },
      specialRequirements: [],
    };
    generator = new NXExpressionGenerator(mockConfig);
    drawingGen = new DrawingGenerator(mockConfig);
  });

  describe('Expression to NX 2022 Compatibility', () => {
    it('should generate valid NX expressions', () => {
      const expression = generator.generateExpression();
      
      expect(expression.variables).toBeDefined();
      expect(expression.features).toBeDefined();
      expect(expression.constraints).toBeDefined();
      expect(expression.code).toBeDefined();
      
      // Check for NX 2022 specific syntax
      expect(expression.code).toMatch(/p\d+\s*=\s*[\d.]+/); // Parameter definitions
      expect(expression.code).toContain('BLOCK/');
      expect(expression.code).toContain('EXTRUDE/');
    });

    it('should use proper coordinate system (Z-up)', () => {
      const expression = generator.generateExpression();
      
      // Verify Z-up coordinate system
      expect(expression.code).toContain('0, 0, 0'); // Origin at floor center
      expect(expression.code).toContain(`0, 0, ${mockConfig.dimensions.height}`); // Height in Z
      
      // Check that base is positioned at Z=0 (floor level)
      const baseFeature = expression.features.find(f => f.includes('BASE'));
      expect(baseFeature).toBeDefined();
    });

    it('should generate proper part numbering', () => {
      const expression = generator.generateExpression();
      
      // Applied Materials part number format: 0205-XXXXX
      const partNumbers = expression.code.match(/0205-\d{5}/g);
      expect(partNumbers).toBeDefined();
      expect(partNumbers!.length).toBeGreaterThan(0);
    });

    it('should include TC number format', () => {
      const expression = generator.generateExpression();
      
      // TC number format: TC2-XXXXXXX
      expect(expression.code).toMatch(/TC2-\d{7}/);
    });

    it('should validate dimensional constraints', () => {
      const expression = generator.generateExpression();
      
      // Check dimensional constraints are proper
      expect(expression.constraints).toContain('crate_length > 0');
      expect(expression.constraints).toContain('crate_width > 0');
      expect(expression.constraints).toContain('crate_height > 0');
      
      // Material thickness constraints
      expect(expression.constraints).toContain('top_panel_thickness >= 0.5');
      expect(expression.constraints).toContain('floorboard_thickness >= 0.75');
    });
  });

  describe('Drawing Standards Compatibility', () => {
    it('should generate ASME Y14.5-2009 compliant dimensions', () => {
      const drawing = drawingGen.generateDrawing();
      
      expect(drawing.dimensions).toBeDefined();
      expect(drawing.dimensions.length).toBeGreaterThan(0);
      
      // Check dimension format: XX.XX ± 0.XX
      drawing.dimensions.forEach(dim => {
        expect(dim.value).toMatch(/^\d+\.\d{2}$/);
        expect(dim.tolerance).toMatch(/^±\s*\d+\.\d{2}$/);
      });
    });

    it('should include proper title block information', () => {
      const drawing = drawingGen.generateDrawing();
      
      expect(drawing.titleBlock.partNumber).toMatch(/^0205-\d{5}$/);
      expect(drawing.titleBlock.tcNumber).toMatch(/^TC2-\d{7}$/);
      expect(drawing.titleBlock.material).toBeDefined();
      expect(drawing.titleBlock.finish).toBeDefined();
      expect(drawing.titleBlock.scale).toBeDefined();
    });

    it('should validate material specifications', () => {
      const drawing = drawingGen.generateDrawing();
      
      // Check material callouts
      const materials = drawing.materialCallouts;
      expect(materials).toBeDefined();
      expect(materials.plywood).toBeDefined();
      expect(materials.lumber).toBeDefined();
      
      // Applied Materials approved materials
      const approvedMaterials = ['plywood', 'pine', 'oak', 'steel'];
      Object.values(materials).forEach(material => {
        expect(approvedMaterials).toContain(material.type);
      });
    });
  });

  describe('Assembly Constraints', () => {
    it('should validate joint constraints', () => {
      const expression = generator.generateExpression();
      
      // Check for proper joint definitions
      const joints = expression.features.filter(f => f.includes('JOIN') || f.includes('MATE'));
      expect(joints.length).toBeGreaterThan(0);
      
      // Verify constraint types
      expression.constraints.forEach(constraint => {
        expect(constraint).not.toContain('undefined');
        expect(constraint).not.toContain('null');
      });
    });

    it('should include fastener specifications', () => {
      const expression = generator.generateExpression();
      
      expect(expression.variables.fastener_type).toBe('klimp');
      expect(expression.variables.fastener_size).toBe('8d');
      expect(expression.variables.fastener_spacing).toBe(6);
      expect(expression.variables.fastener_material).toBe('steel');
    });

    it('should validate assembly sequence', () => {
      const expression = generator.generateExpression();
      
      // Features should be in proper order: base, panels, fasteners
      const baseIndex = expression.features.findIndex(f => f.includes('BASE'));
      const panelIndex = expression.features.findIndex(f => f.includes('PANEL'));
      const fastenerIndex = expression.features.findIndex(f => f.includes('FASTENER'));
      
      expect(baseIndex).toBeLessThan(panelIndex);
      expect(panelIndex).toBeLessThan(fastenerIndex);
    });
  });

  describe('Performance Validation', () => {
    it('should generate expressions within performance limits', () => {
      const startTime = performance.now();
      const expression = generator.generateExpression();
      const endTime = performance.now();
      
      const generationTime = endTime - startTime;
      expect(generationTime).toBeLessThan(100); // Less than 100ms
      
      expect(expression.code.length).toBeLessThan(50000); // Reasonable code size
      expect(expression.features.length).toBeLessThan(100); // Manageable feature count
    });

    it('should handle complex configurations efficiently', () => {
      const complexConfig = {
        ...mockConfig,
        cap: {
          topPanel: { thickness: 0.75, material: 'plywood', reinforcement: true, ventilation: { enabled: true, type: 'holes', count: 8, size: 2 } },
          frontPanel: { thickness: 0.5, material: 'plywood', reinforcement: true, ventilation: { enabled: true, type: 'slots', count: 4, size: 1.5 } },
          backPanel: { thickness: 0.5, material: 'plywood', reinforcement: true, ventilation: { enabled: false, type: 'holes', count: 0, size: 0 } },
          leftPanel: { thickness: 0.5, material: 'plywood', reinforcement: true, ventilation: { enabled: true, type: 'holes', count: 6, size: 1 } },
          rightPanel: { thickness: 0.5, material: 'plywood', reinforcement: true, ventilation: { enabled: true, type: 'holes', count: 6, size: 1 } },
        },
        vinyl: { enabled: true, type: 'waterproof', thickness: 0.125, coverage: 'partial' },
      };

      const startTime = performance.now();
      const complexGenerator = new NXExpressionGenerator(complexConfig);
      const expression = complexGenerator.generateExpression();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(200); // Still under 200ms for complex configs
      expect(expression).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid dimensions gracefully', () => {
      const invalidConfig = {
        ...mockConfig,
        dimensions: { length: 0, width: -1, height: 0 },
      };

      expect(() => {
        const invalidGenerator = new NXExpressionGenerator(invalidConfig);
        invalidGenerator.generateExpression();
      }).not.toThrow();
    });

    it('should validate material constraints', () => {
      const expression = generator.generateExpression();
      
      // Should not contain invalid materials
      const materialVars = Object.entries(expression.variables)
        .filter(([key]) => key.includes('material'))
        .map(([, value]) => value);
      
      const validMaterials = ['plywood', 'pine', 'oak', 'steel', 'aluminum'];
      materialVars.forEach(material => {
        if (typeof material === 'string') {
          expect(validMaterials).toContain(material);
        }
      });
    });
  });
});