import { describe, it, expect } from 'vitest';
import { calculateCrateDimensions, calculatePanelThickness } from '@/services/crateCalculations';
import {
  LIGHT_WEIGHT_THRESHOLD,
  MEDIUM_WEIGHT_THRESHOLD,
  HEAVY_WEIGHT_THRESHOLD,
  LIGHT_PANEL_THICKNESS,
  PANEL_THICKNESS,
  HEAVY_PANEL_THICKNESS,
} from '@/lib/constants';

describe('Crate Calculations', () => {
  describe('calculateCrateDimensions', () => {
    it('should calculate basic dimensions correctly', () => {
      const result = calculateCrateDimensions(24, 16, 12);

      expect(result.volume).toBe(4608); // 24 * 16 * 12
      expect(result.surfaceArea).toBe(1728); // 2 * (24*16 + 16*12 + 12*24)
      expect(result.diagonal).toBeCloseTo(31.24, 2); // sqrt(24^2 + 16^2 + 12^2)
    });

    it('should handle square dimensions', () => {
      const result = calculateCrateDimensions(10, 10, 10);

      expect(result.volume).toBe(1000);
      expect(result.surfaceArea).toBe(600); // 2 * 3 * 100
      expect(result.diagonal).toBeCloseTo(17.32, 2); // sqrt(300)
    });

    it('should handle large dimensions', () => {
      const result = calculateCrateDimensions(120, 96, 84);

      expect(result.volume).toBe(967680); // 120 * 96 * 84
      expect(result.surfaceArea).toBe(59328); // 2 * (120*96 + 96*84 + 84*120)
      expect(result.diagonal).toBeCloseTo(175.13, 2);
    });

    it('should handle small dimensions', () => {
      const result = calculateCrateDimensions(2, 3, 4);

      expect(result.volume).toBe(24);
      expect(result.surfaceArea).toBe(52); // 2 * (6 + 12 + 8)
      expect(result.diagonal).toBeCloseTo(5.39, 2);
    });

    it('should handle single dimension dominance', () => {
      // Very long, narrow crate
      const result = calculateCrateDimensions(100, 4, 4);

      expect(result.volume).toBe(1600);
      expect(result.surfaceArea).toBe(1632); // 2 * (400 + 16 + 400)
      expect(result.diagonal).toBeCloseTo(100.16, 2);
    });

    it('should handle fractional dimensions', () => {
      const result = calculateCrateDimensions(12.5, 8.25, 6.75);

      expect(result.volume).toBeCloseTo(696.09, 2);
      expect(result.surfaceArea).toBeCloseTo(486.375, 2);
      expect(result.diagonal).toBeCloseTo(16.43, 2);
    });

    // Edge Cases
    it('should throw error for zero length', () => {
      expect(() => calculateCrateDimensions(0, 10, 10)).toThrow('Dimensions must be positive');
    });

    it('should throw error for zero width', () => {
      expect(() => calculateCrateDimensions(10, 0, 10)).toThrow('Dimensions must be positive');
    });

    it('should throw error for zero height', () => {
      expect(() => calculateCrateDimensions(10, 10, 0)).toThrow('Dimensions must be positive');
    });

    it('should throw error for negative length', () => {
      expect(() => calculateCrateDimensions(-5, 10, 10)).toThrow('Dimensions must be positive');
    });

    it('should throw error for negative width', () => {
      expect(() => calculateCrateDimensions(10, -5, 10)).toThrow('Dimensions must be positive');
    });

    it('should throw error for negative height', () => {
      expect(() => calculateCrateDimensions(10, 10, -5)).toThrow('Dimensions must be positive');
    });

    it('should handle very small positive dimensions', () => {
      const result = calculateCrateDimensions(0.1, 0.1, 0.1);

      expect(result.volume).toBeCloseTo(0.001, 6);
      expect(result.surfaceArea).toBeCloseTo(0.06, 6);
      expect(result.diagonal).toBeCloseTo(0.173, 3);
    });

    it('should handle extremely large dimensions', () => {
      const result = calculateCrateDimensions(1000, 1000, 1000);

      expect(result.volume).toBe(1000000000);
      expect(result.surfaceArea).toBe(6000000);
      expect(result.diagonal).toBeCloseTo(1732.05, 2);
    });

    it('should handle precision edge case', () => {
      const result = calculateCrateDimensions(1, 1, 1);

      expect(result.volume).toBe(1);
      expect(result.surfaceArea).toBe(6);
      expect(result.diagonal).toBeCloseTo(1.732, 3);
    });
  });

  describe('calculatePanelThickness', () => {
    it('should return light panel thickness for very light weight', () => {
      const thickness = calculatePanelThickness(50); // Below LIGHT_WEIGHT_THRESHOLD (100)
      expect(thickness).toBe(LIGHT_PANEL_THICKNESS);
    });

    it('should return light panel thickness at light threshold', () => {
      const thickness = calculatePanelThickness(LIGHT_WEIGHT_THRESHOLD - 1);
      expect(thickness).toBe(LIGHT_PANEL_THICKNESS);
    });

    it('should return standard panel thickness for medium light weight', () => {
      const thickness = calculatePanelThickness(LIGHT_WEIGHT_THRESHOLD);
      expect(thickness).toBe(PANEL_THICKNESS);
    });

    it('should return standard panel thickness at medium threshold', () => {
      const thickness = calculatePanelThickness(MEDIUM_WEIGHT_THRESHOLD - 1);
      expect(thickness).toBe(PANEL_THICKNESS);
    });

    it('should return 1.0 inch thickness for medium weight', () => {
      const thickness = calculatePanelThickness(MEDIUM_WEIGHT_THRESHOLD);
      expect(thickness).toBe(1.0);
    });

    it('should return 1.0 inch thickness at heavy threshold', () => {
      const thickness = calculatePanelThickness(HEAVY_WEIGHT_THRESHOLD - 1);
      expect(thickness).toBe(1.0);
    });

    it('should return heavy panel thickness for heavy weight', () => {
      const thickness = calculatePanelThickness(HEAVY_WEIGHT_THRESHOLD);
      expect(thickness).toBe(HEAVY_PANEL_THICKNESS);
    });

    it('should return heavy panel thickness for very heavy weight', () => {
      const thickness = calculatePanelThickness(5000);
      expect(thickness).toBe(HEAVY_PANEL_THICKNESS);
    });

    // Edge Cases
    it('should handle zero weight', () => {
      const thickness = calculatePanelThickness(0);
      expect(thickness).toBe(LIGHT_PANEL_THICKNESS);
    });

    it('should handle negative weight', () => {
      const thickness = calculatePanelThickness(-100);
      expect(thickness).toBe(LIGHT_PANEL_THICKNESS);
    });

    it('should handle fractional weights', () => {
      const thickness = calculatePanelThickness(99.5);
      expect(thickness).toBe(LIGHT_PANEL_THICKNESS);

      const thickness2 = calculatePanelThickness(100.5);
      expect(thickness2).toBe(PANEL_THICKNESS);
    });

    it('should handle extremely large weights', () => {
      const thickness = calculatePanelThickness(1000000);
      expect(thickness).toBe(HEAVY_PANEL_THICKNESS);
    });

    it('should handle boundary values precisely', () => {
      // Test exact boundary values
      expect(calculatePanelThickness(LIGHT_WEIGHT_THRESHOLD)).toBe(PANEL_THICKNESS);
      expect(calculatePanelThickness(MEDIUM_WEIGHT_THRESHOLD)).toBe(1.0);
      expect(calculatePanelThickness(HEAVY_WEIGHT_THRESHOLD)).toBe(HEAVY_PANEL_THICKNESS);
    });

    it('should handle decimal boundary values', () => {
      // Test just below boundaries
      expect(calculatePanelThickness(99.99)).toBe(LIGHT_PANEL_THICKNESS);
      expect(calculatePanelThickness(499.99)).toBe(PANEL_THICKNESS);
      expect(calculatePanelThickness(999.99)).toBe(1.0);
    });
  });

  describe('Integration Tests', () => {
    it('should calculate reasonable values for typical crate', () => {
      const dimensions = calculateCrateDimensions(48, 36, 30);
      const thickness = calculatePanelThickness(750);

      expect(dimensions.volume).toBe(51840);
      expect(dimensions.surfaceArea).toBe(8496);
      expect(dimensions.diagonal).toBeCloseTo(67.08, 2);
      expect(thickness).toBe(1.0);
    });

    it('should handle shipping container dimensions', () => {
      const dimensions = calculateCrateDimensions(240, 96, 96); // 20ft container approx
      const thickness = calculatePanelThickness(10000);

      expect(dimensions.volume).toBe(2211840);
      expect(dimensions.surfaceArea).toBe(110592);
      expect(thickness).toBe(HEAVY_PANEL_THICKNESS);
    });

    it('should maintain mathematical relationships', () => {
      const dim1 = calculateCrateDimensions(10, 10, 10);
      const dim2 = calculateCrateDimensions(20, 20, 20);

      // Volume should scale by cube of linear dimension
      expect(dim2.volume).toBe(dim1.volume * 8); // 2^3

      // Surface area should scale by square of linear dimension
      expect(dim2.surfaceArea).toBe(dim1.surfaceArea * 4); // 2^2

      // Diagonal should scale linearly
      expect(dim2.diagonal / dim1.diagonal).toBeCloseTo(2, 3);
    });

    it('should handle combined edge cases', () => {
      // Very small crate with very light weight
      const dimensions = calculateCrateDimensions(0.5, 0.5, 0.5);
      const thickness = calculatePanelThickness(1);

      expect(dimensions.volume).toBe(0.125);
      expect(dimensions.surfaceArea).toBe(1.5);
      expect(thickness).toBe(LIGHT_PANEL_THICKNESS);
    });
  });
});
