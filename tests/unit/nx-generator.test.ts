import { describe, it, expect, beforeEach } from 'vitest';
import { NXExpressionGenerator } from '@/services/nx-generator';
import type { CrateConfiguration } from '@/types/crate';

describe('NX Expression Generator', () => {
  let mockConfig: CrateConfiguration;

  beforeEach(() => {
    mockConfig = {
      projectName: 'Test Crate',
      dimensions: {
        length: 48,
        width: 40,
        height: 36,
      },
      weight: {
        product: 500,
      },
      base: {
        type: 'standard' as const,
        floorboardThickness: 0.75,
        skidHeight: 5,
        skidWidth: 4,
        skidCount: 3,
        skidSpacing: 20,
        requiresRubStrips: true,
        material: 'pine' as const,
      },
      cap: {
        topPanel: {
          thickness: 0.75,
          material: 'plywood' as const,
          reinforcement: false,
          ventilation: { enabled: false, type: 'holes' as const, count: 0, size: 0 },
        },
        frontPanel: {
          thickness: 0.5,
          material: 'plywood' as const,
          reinforcement: false,
          ventilation: { enabled: false, type: 'holes' as const, count: 0, size: 0 },
        },
        backPanel: {
          thickness: 0.5,
          material: 'plywood' as const,
          reinforcement: false,
          ventilation: { enabled: false, type: 'holes' as const, count: 0, size: 0 },
        },
        leftPanel: {
          thickness: 0.5,
          material: 'plywood' as const,
          reinforcement: false,
          ventilation: { enabled: false, type: 'holes' as const, count: 0, size: 0 },
        },
        rightPanel: {
          thickness: 0.5,
          material: 'plywood' as const,
          reinforcement: false,
          ventilation: { enabled: false, type: 'holes' as const, count: 0, size: 0 },
        },
      },
      fasteners: {
        type: 'klimp' as const,
        size: '8d',
        spacing: 6,
        material: 'steel' as const,
      },
      vinyl: {
        enabled: false,
        type: 'waterproof' as const,
        thickness: 0,
        coverage: 'full' as const,
      },
      specialRequirements: [],
    };
  });

  describe('Basic Expression Generation', () => {
    it('should create generator instance', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      expect(generator).toBeDefined();
      expect(generator).toBeInstanceOf(NXExpressionGenerator);
    });

    it('should generate expression object', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.generateExpression();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('variables');
      expect(result).toHaveProperty('features');
      expect(result).toHaveProperty('constraints');
      expect(result).toHaveProperty('code');
    });

    it('should include main dimensions in variables', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.generateExpression();
      expect(result.variables.crate_length).toBe(48);
      expect(result.variables.crate_width).toBe(40);
      expect(result.variables.crate_height).toBe(36);
    });

    it('should include base configuration', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.generateExpression();
      expect(result.variables.base_type).toBe('standard');
      expect(result.variables.skid_count).toBe(3);
      expect(result.variables.skid_width).toBe(4);
      expect(result.variables.skid_height).toBe(5);
      expect(result.variables.floorboard_thickness).toBe(0.75);
    });

    it('should include panel thicknesses', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.generateExpression();
      expect(result.variables.top_panel_thickness).toBe(0.75);
      expect(result.variables.front_panel_thickness).toBe(0.5);
      expect(result.variables.back_panel_thickness).toBe(0.5);
      expect(result.variables.left_panel_thickness).toBe(0.5);
      expect(result.variables.right_panel_thickness).toBe(0.5);
    });

    it('should include fastener configuration', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.generateExpression();
      expect(result.variables.fastener_type).toBe('klimp');
      expect(result.variables.fastener_size).toBe('8d');
      expect(result.variables.fastener_spacing).toBe(6);
      expect(result.variables.fastener_material).toBe('steel');
    });
  });

  describe('Vinyl Configuration', () => {
    it('should handle disabled vinyl', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.generateExpression();
      expect(result.variables.vinyl_enabled).toBe(0);
      expect(result.variables.vinyl_thickness).toBe(0);
    });

    it('should handle enabled vinyl', () => {
      const vinylConfig = {
        ...mockConfig,
        vinyl: {
          enabled: true,
          thickness: 0.125,
          type: 'waterproof' as const,
          coverage: 'full' as const,
        },
      };
      const generator = new NXExpressionGenerator(vinylConfig);
      const result = generator.generateExpression();
      expect(result.variables.vinyl_enabled).toBe(1);
      expect(result.variables.vinyl_thickness).toBe(0.125);
      expect(result.code).toContain('VINYL_WRAP');
    });
  });

  describe('Features Generation', () => {
    it('should generate features array', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.generateExpression();
      expect(result.features).toBeDefined();
      expect(Array.isArray(result.features)).toBe(true);
    });

    it('should include base features', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.generateExpression();
      const baseFeature = result.features.find(
        (f) => f.includes('BLOCK/BASE_SKID') || f.includes('BLOCK/FLOOR')
      );
      expect(baseFeature).toBeDefined();
    });

    it('should include panel features', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.generateExpression();
      const frontPanel = result.features.find((f) => f.includes('FRONT_PANEL'));
      const backPanel = result.features.find((f) => f.includes('BACK_PANEL'));
      const leftPanel = result.features.find((f) => f.includes('LEFT_PANEL'));
      const rightPanel = result.features.find((f) => f.includes('RIGHT_PANEL'));
      const topPanel = result.features.find((f) => f.includes('TOP_PANEL'));
      expect(frontPanel).toBeDefined();
      expect(backPanel).toBeDefined();
      expect(leftPanel).toBeDefined();
      expect(rightPanel).toBeDefined();
      expect(topPanel).toBeDefined();
    });
  });

  describe('Constraints Generation', () => {
    it('should generate constraints array', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.generateExpression();
      expect(result.constraints).toBeDefined();
      expect(Array.isArray(result.constraints)).toBe(true);
    });

    it('should include dimensional constraints', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.generateExpression();
      expect(result.constraints.length).toBeGreaterThan(0);
    });
  });

  describe('NX Code Generation', () => {
    it('should generate NX code string', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.generateExpression();
      expect(result.code).toBeDefined();
      expect(typeof result.code).toBe('string');
    });

    it('should include variable definitions in code', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.generateExpression();
      expect(result.code).toContain('p0 = 48');
      expect(result.code).toContain('p1 = 40');
      expect(result.code).toContain('p2 = 36');
    });

    it('should include feature commands in code', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.generateExpression();
      expect(result.code).toContain('BLOCK/');
      expect(result.code).toContain('CREATE_BASE');
      expect(result.code).toContain('CREATE_FRONT_PANEL');
    });
  });

  describe('Export Functionality', () => {
    it('should export to string format', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.exportToString();
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include all sections in export', () => {
      const generator = new NXExpressionGenerator(mockConfig);
      const result = generator.exportToString();
      expect(result).toContain('Variables');
      expect(result).toContain('Features');
      expect(result).toContain('Constraints');
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum dimensions', () => {
      const minConfig = {
        ...mockConfig,
        dimensions: { length: 12, width: 12, height: 12 },
      };
      const generator = new NXExpressionGenerator(minConfig);
      const result = generator.generateExpression();
      expect(result.variables.crate_length).toBe(12);
      expect(result.variables.crate_width).toBe(12);
      expect(result.variables.crate_height).toBe(12);
    });

    it('should handle maximum dimensions', () => {
      const maxConfig = {
        ...mockConfig,
        dimensions: { length: 240, width: 96, height: 96 },
      };
      const generator = new NXExpressionGenerator(maxConfig);
      const result = generator.generateExpression();
      expect(result.variables.crate_length).toBe(240);
      expect(result.variables.crate_width).toBe(96);
      expect(result.variables.crate_height).toBe(96);
    });

    it('should handle heavy product weight', () => {
      const heavyConfig = {
        ...mockConfig,
        weight: {
          product: 5000,
          maxGross: 6000,
        },
        base: {
          ...mockConfig.base,
          skidCount: 5,
          skidWidth: 6,
        },
      };
      const generator = new NXExpressionGenerator(heavyConfig);
      const result = generator.generateExpression();
      expect(result.variables.skid_count).toBe(5);
      expect(result.variables.skid_width).toBe(6);
    });

    it('should handle ventilation requirements', () => {
      const ventConfig = {
        ...mockConfig,
        cap: {
          ...mockConfig.cap,
          frontPanel: {
            ...mockConfig.cap.frontPanel,
            ventilation: {
              enabled: true,
              type: 'holes' as const,
              count: 4,
              size: 2,
            },
          },
        },
      };
      const generator = new NXExpressionGenerator(ventConfig);
      const result = generator.generateExpression();
      // Check that ventilation is included in features
      const ventFeature = result.features.find((f) => f.toLowerCase().includes('vent'));
      expect(ventFeature).toBeDefined();
      expect(result.code).toContain('FRONT_VENTILATION');
    });
  });
});
