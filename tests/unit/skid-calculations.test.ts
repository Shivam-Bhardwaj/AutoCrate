import { describe, it, expect } from 'vitest';
import {
  calculateSkidConfiguration,
  getSkidSize,
  getSkidSpacing,
  calculateSkidCount,
  requiresRubStrips,
  validateSkidConfiguration,
} from '@/utils/skid-calculations';

describe('Skid Calculations', () => {
  describe('calculateSkidConfiguration', () => {
    it('should calculate skid config for standard crate', () => {
      const dimensions = { length: 48, width: 40, height: 40 };
      const weightKg = 453.592; // ~1000 lbs

      const result = calculateSkidConfiguration(dimensions, weightKg);

      expect(result.count).toBeGreaterThanOrEqual(3);
      expect(result.spacing).toBeGreaterThan(0);
      expect(result.dimensions.width).toBeGreaterThanOrEqual(3.5); // Actual 3.5" for nominal 4x4
      expect(result.dimensions.height).toBeGreaterThanOrEqual(3.5);
      expect(result.requiresRubStrips).toBe(false);
    });

    it('should adjust for heavy loads', () => {
      const dimensions = { length: 48, width: 40, height: 40 };
      const weightKg = 2267.96; // ~5000 lbs

      const result = calculateSkidConfiguration(dimensions, weightKg);

      expect(result.count).toBeGreaterThanOrEqual(3);
      expect(result.dimensions.width).toBeGreaterThanOrEqual(3.5); // Actual 3.5" for nominal 4x4
      expect(result.dimensions.height).toBeGreaterThanOrEqual(3.5);
    });

    it('should calculate for large crates', () => {
      const dimensions = { length: 96, width: 48, height: 48 };
      const weightKg = 1360.78; // ~3000 lbs

      const result = calculateSkidConfiguration(dimensions, weightKg);

      expect(result.count).toBeGreaterThanOrEqual(3);
      expect(result.spacing).toBeGreaterThan(0);
      expect(result.requiresRubStrips).toBe(false); // 96 inches is at the threshold
    });

    it('should calculate for small crates', () => {
      const dimensions = { length: 24, width: 20, height: 20 };
      const weightKg = 113.4; // ~250 lbs

      const result = calculateSkidConfiguration(dimensions, weightKg);

      expect(result.count).toBeGreaterThanOrEqual(3); // Minimum is 3
      expect(result.dimensions.width).toBe(3.5); // Actual 3.5" for nominal 4x4
      expect(result.dimensions.height).toBeGreaterThanOrEqual(3);
    });

    it('should require rub strips for long crates', () => {
      const dimensions = { length: 120, width: 40, height: 40 }; // > 96 inches
      const weightKg = 1000;

      const result = calculateSkidConfiguration(dimensions, weightKg);

      expect(result.requiresRubStrips).toBe(true);
    });

    it('should handle minimum dimensions', () => {
      const dimensions = { length: 12, width: 12, height: 12 };
      const weightKg = 45.36; // ~100 lbs

      const result = calculateSkidConfiguration(dimensions, weightKg);

      expect(result.count).toBeGreaterThanOrEqual(3);
      expect(result.dimensions.width).toBeGreaterThanOrEqual(3.5); // Actual 3.5" for nominal 4x4
      expect(result.dimensions.height).toBeGreaterThanOrEqual(3);
    });

    it('should handle maximum dimensions', () => {
      const dimensions = { length: 240, width: 96, height: 96 };
      const weightKg = 4535.92; // ~10000 lbs

      const result = calculateSkidConfiguration(dimensions, weightKg);

      expect(result.count).toBeGreaterThanOrEqual(3);
      expect(result.spacing).toBeGreaterThan(0);
      expect(result.requiresRubStrips).toBe(true); // > 96 inches
    });
  });

  describe('getSkidSize', () => {
    it('should return correct size for light loads', () => {
      const size = getSkidSize(226.8); // ~500 lbs
      expect(size.height).toBe(3.5); // Updated to actual 3.5" for nominal 4x4
      expect(size.width).toBe(3.5);
    });

    it('should return correct size for medium loads', () => {
      const size = getSkidSize(1360.78); // ~3000 lbs
      expect(size.height).toBe(3.5); // Actual 3.5" for nominal 4x4
      expect(size.width).toBe(3.5);
    });

    it('should return correct size for heavy loads', () => {
      const size = getSkidSize(4535.92); // ~10000 lbs
      expect(size.height).toBe(3.5); // Actual 3.5" for nominal 4x6
      expect(size.width).toBe(5.5);
    });

    it('should return correct size for very heavy loads', () => {
      const size = getSkidSize(13607.77); // ~30000 lbs
      expect(size.height).toBe(5.5); // Actual 5.5" for nominal 6x6
      expect(size.width).toBe(5.5);
    });

    it('should return correct size for extremely heavy loads', () => {
      const size = getSkidSize(22679.62); // ~50000 lbs
      expect(size.height).toBe(7.25); // Actual 7.25" for nominal 8x8
      expect(size.width).toBe(7.25);
    });

    it('should enforce minimum height', () => {
      const size = getSkidSize(45.36); // ~100 lbs
      expect(size.height).toBeGreaterThanOrEqual(3.5);
    });
  });

  describe('getSkidSpacing', () => {
    it('should return correct spacing for small skids', () => {
      const dimensions = { height: 3.5, width: 3.5 }; // Updated to actual 3.5x3.5 for nominal 4x4
      const spacing = getSkidSpacing(dimensions, 226.8); // ~500 lbs
      expect(spacing).toBe(30);
    });

    it('should return correct spacing for medium skids', () => {
      const dimensions = { height: 3.5, width: 3.5 }; // Actual 3.5x3.5 for nominal 4x4
      const spacing = getSkidSpacing(dimensions, 1360.78); // ~3000 lbs
      expect(spacing).toBe(30);
    });

    it('should return correct spacing for 4x6 skids with light load', () => {
      const dimensions = { height: 3.5, width: 5.5 }; // Actual 3.5x5.5 for nominal 4x6
      const spacing = getSkidSpacing(dimensions, 2267.96); // ~5000 lbs
      expect(spacing).toBe(41);
    });

    it('should return correct spacing for 4x6 skids with medium load', () => {
      const dimensions = { height: 3.5, width: 5.5 }; // Actual 3.5x5.5 for nominal 4x6
      const spacing = getSkidSpacing(dimensions, 3628.74); // ~8000 lbs
      expect(spacing).toBe(28);
    });

    it('should return correct spacing for 4x6 skids with heavy load', () => {
      const dimensions = { height: 3.5, width: 5.5 }; // Actual 3.5x5.5 for nominal 4x6
      const spacing = getSkidSpacing(dimensions, 6350.29); // ~14000 lbs
      expect(spacing).toBe(24);
    });

    it('should return correct spacing for 6x6 skids', () => {
      const dimensions = { height: 5.5, width: 5.5 }; // Actual 5.5x5.5 for nominal 6x6
      const spacing = getSkidSpacing(dimensions, 10886.22); // ~24000 lbs
      expect(spacing).toBe(24);
    });

    it('should return correct spacing for large 6x6 skids', () => {
      const dimensions = { height: 5.5, width: 5.5 }; // Actual 5.5x5.5 for nominal 6x6
      const spacing = getSkidSpacing(dimensions, 15875.73); // ~35000 lbs
      expect(spacing).toBe(20);
    });

    it('should return correct spacing for 8x8 skids', () => {
      const dimensions = { height: 7.25, width: 7.25 }; // Actual 7.25x7.25 for nominal 8x8
      const spacing = getSkidSpacing(dimensions, 22679.62); // ~50000 lbs
      expect(spacing).toBe(24);
    });

    it('should return default spacing for non-standard sizes', () => {
      const dimensions = { height: 5, width: 5 };
      const spacing = getSkidSpacing(dimensions, 1000);
      expect(spacing).toBe(24);
    });
  });

  describe('calculateSkidCount', () => {
    it('should calculate minimum 3 skids', () => {
      const count = calculateSkidCount(24, 30, 3.5); // Using actual 3.5" width for nominal 4x4
      expect(count).toBeGreaterThanOrEqual(3);
    });

    it('should calculate skids for standard crate', () => {
      const count = calculateSkidCount(48, 30, 3.5); // Using actual 3.5" width for nominal 4x4
      expect(count).toBeGreaterThanOrEqual(3);
    });

    it('should calculate more skids for wide crates', () => {
      const count = calculateSkidCount(144, 30, 3.5); // Using actual 3.5" width for nominal 4x4
      expect(count).toBeGreaterThanOrEqual(3);
    });

    it('should handle very wide crates', () => {
      const count = calculateSkidCount(240, 24, 5.5); // Using actual 5.5" width for nominal 6x6
      expect(count).toBeGreaterThanOrEqual(5); // Should be based on 48" rule
    });

    it('should handle tight spacing', () => {
      const count = calculateSkidCount(48, 12, 3.5); // Using actual 3.5" width for nominal 4x4
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });

  describe('requiresRubStrips', () => {
    it('should not require rub strips for short crates', () => {
      const dimensions = { length: 48, width: 40, height: 40 };
      expect(requiresRubStrips(dimensions)).toBe(false);
    });

    it('should not require rub strips at 96 inches', () => {
      const dimensions = { length: 96, width: 40, height: 40 };
      expect(requiresRubStrips(dimensions)).toBe(false);
    });

    it('should require rub strips for long crates', () => {
      const dimensions = { length: 120, width: 40, height: 40 };
      expect(requiresRubStrips(dimensions)).toBe(true);
    });

    it('should require rub strips for very long crates', () => {
      const dimensions = { length: 240, width: 40, height: 40 };
      expect(requiresRubStrips(dimensions)).toBe(true);
    });
  });

  describe('validateSkidConfiguration', () => {
    it('should validate correct configuration', () => {
      const config = {
        count: 3,
        spacing: 24,
        dimensions: { width: 3.5, height: 5 }, // Using actual 3.5" width for nominal 4x4
        requiresRubStrips: false,
      };

      const errors = validateSkidConfiguration(config);
      expect(errors).toHaveLength(0);
    });

    it('should reject too few skids', () => {
      const config = {
        count: 2,
        spacing: 48,
        dimensions: { width: 3.5, height: 5 }, // Using actual 3.5" width for nominal 4x4
        requiresRubStrips: false,
      };

      const errors = validateSkidConfiguration(config);
      expect(errors).toContain('At least 3 skids are required');
    });

    it('should reject invalid height', () => {
      const config = {
        count: 3,
        spacing: 24,
        dimensions: { width: 3.5, height: 3 }, // Using actual 3.5" width for nominal 4x4
        requiresRubStrips: false,
      };

      const errors = validateSkidConfiguration(config);
      expect(errors).toContain('Skid height must be at least 3.5 inches');
    });

    it('should accept minimum valid height', () => {
      const config = {
        count: 3,
        spacing: 24,
        dimensions: { width: 3.5, height: 3.5 }, // Using actual 3.5" width for nominal 4x4
        requiresRubStrips: false,
      };

      const errors = validateSkidConfiguration(config);
      expect(errors).toHaveLength(0);
    });

    it('should handle multiple errors', () => {
      const config = {
        count: 1,
        spacing: 24,
        dimensions: { width: 3.5, height: 2 }, // Using actual 3.5" width for nominal 4x4
        requiresRubStrips: false,
      };

      const errors = validateSkidConfiguration(config);
      expect(errors.length).toBeGreaterThan(1);
      expect(errors).toContain('At least 3 skids are required');
      expect(errors).toContain('Skid height must be at least 3.5 inches');
    });
  });

  describe('Integration Tests', () => {
    it('should calculate valid configuration for various weights', () => {
      const testCases = [
        { weightKg: 226.8, expectedMinSkids: 3 }, // ~500 lbs
        { weightKg: 680.39, expectedMinSkids: 3 }, // ~1500 lbs
        { weightKg: 1360.78, expectedMinSkids: 3 }, // ~3000 lbs
        { weightKg: 2267.96, expectedMinSkids: 3 }, // ~5000 lbs
      ];

      testCases.forEach(({ weightKg, expectedMinSkids }) => {
        const dimensions = { length: 48, width: 40, height: 40 };
        const config = calculateSkidConfiguration(dimensions, weightKg);
        const errors = validateSkidConfiguration(config);

        expect(config.count).toBeGreaterThanOrEqual(expectedMinSkids);
        expect(errors).toHaveLength(0);
      });
    });

    it('should maintain proportional relationships', () => {
      const dimensions = { length: 48, width: 40, height: 40 };

      const light = calculateSkidConfiguration(dimensions, 226.8); // ~500 lbs
      const medium = calculateSkidConfiguration(dimensions, 907.18); // ~2000 lbs
      const heavy = calculateSkidConfiguration(dimensions, 2267.96); // ~5000 lbs

      // More weight should mean stronger skids
      expect(heavy.dimensions.width).toBeGreaterThanOrEqual(medium.dimensions.width);
      expect(medium.dimensions.width).toBeGreaterThanOrEqual(light.dimensions.width);

      expect(heavy.dimensions.height).toBeGreaterThanOrEqual(medium.dimensions.height);
      expect(medium.dimensions.height).toBeGreaterThanOrEqual(light.dimensions.height);
    });

    it('should adapt to crate dimensions', () => {
      const weightKg = 907.18; // ~2000 lbs

      const small = calculateSkidConfiguration({ length: 24, width: 20, height: 20 }, weightKg);
      const medium = calculateSkidConfiguration({ length: 48, width: 40, height: 40 }, weightKg);
      const large = calculateSkidConfiguration({ length: 96, width: 80, height: 80 }, weightKg);

      // All should have at least 3 skids
      expect(small.count).toBeGreaterThanOrEqual(3);
      expect(medium.count).toBeGreaterThanOrEqual(3);
      expect(large.count).toBeGreaterThanOrEqual(3);

      // Spacing should be reasonable
      expect(small.spacing).toBeGreaterThan(0);
      expect(medium.spacing).toBeGreaterThan(0);
      expect(large.spacing).toBeGreaterThan(0);

      // Large crates don't need rub strips at 96"
      expect(large.requiresRubStrips).toBe(false);
    });

    it('should handle metric to imperial conversion properly', () => {
      // 1000 kg should be ~2204.62 lbs
      const config = calculateSkidConfiguration({ length: 48, width: 40, height: 40 }, 1000);

      // Should get 4x4 skids for this weight range (actual 3.5x3.5 for nominal 4x4)
      expect(config.dimensions.height).toBe(3.5);
      expect(config.dimensions.width).toBe(3.5);
      expect(config.spacing).toBe(30);
    });
  });
});
