import { describe, it, expect } from 'vitest';
import { calculateSkidSize, calculateWeightPerSkid } from '@/services/skidCalculations';
import {
  MEDIUM_WEIGHT_THRESHOLD,
  HEAVY_WEIGHT_THRESHOLD,
  EXTRA_HEAVY_WEIGHT_THRESHOLD,
  SKID_SPECS,
} from '@/lib/constants';

describe('Skid Calculations Service', () => {
  describe('calculateSkidSize', () => {
    it('should return light skid for low weight', () => {
      const skidSize = calculateSkidSize(250); // Well below medium threshold (500)

      expect(skidSize).toEqual(SKID_SPECS.LIGHT);
      expect(skidSize.width).toBe(4);
      expect(skidSize.height).toBe(4);
      expect(skidSize.quantity).toBe(2);
    });

    it('should return light skid at medium threshold boundary', () => {
      const skidSize = calculateSkidSize(MEDIUM_WEIGHT_THRESHOLD); // Exactly at 500 lbs

      expect(skidSize).toEqual(SKID_SPECS.LIGHT);
    });

    it('should return medium skid for medium weight', () => {
      const skidSize = calculateSkidSize(750); // Between medium (500) and heavy (1000) thresholds

      expect(skidSize).toEqual(SKID_SPECS.MEDIUM);
      expect(skidSize.width).toBe(4);
      expect(skidSize.height).toBe(6);
      expect(skidSize.quantity).toBe(2);
    });

    it('should return medium skid at heavy threshold boundary', () => {
      const skidSize = calculateSkidSize(HEAVY_WEIGHT_THRESHOLD); // Exactly at 1000 lbs

      expect(skidSize).toEqual(SKID_SPECS.MEDIUM);
    });

    it('should return heavy skid for heavy weight', () => {
      const skidSize = calculateSkidSize(1500); // Between heavy (1000) and extra heavy (2000) thresholds

      expect(skidSize).toEqual(SKID_SPECS.HEAVY);
      expect(skidSize.width).toBe(6);
      expect(skidSize.height).toBe(6);
      expect(skidSize.quantity).toBe(2);
    });

    it('should return heavy skid at extra heavy threshold boundary', () => {
      const skidSize = calculateSkidSize(EXTRA_HEAVY_WEIGHT_THRESHOLD); // Exactly at 2000 lbs

      expect(skidSize).toEqual(SKID_SPECS.HEAVY);
    });

    it('should return extra heavy one skid for very heavy weight', () => {
      const skidSize = calculateSkidSize(3000); // Between extra heavy (2000) and 5000 lbs

      expect(skidSize).toEqual(SKID_SPECS.EXTRA_HEAVY_ONE);
      expect(skidSize.width).toBe(6);
      expect(skidSize.height).toBe(8);
      expect(skidSize.quantity).toBe(3);
    });

    it('should return extra heavy one skid at 5000 lb boundary', () => {
      const skidSize = calculateSkidSize(5000); // Exactly at 5000 lbs

      expect(skidSize).toEqual(SKID_SPECS.EXTRA_HEAVY_ONE);
    });

    it('should return extra heavy two skid for extremely heavy weight', () => {
      const skidSize = calculateSkidSize(7500); // Above 5000 lbs

      expect(skidSize).toEqual(SKID_SPECS.EXTRA_HEAVY_TWO);
      expect(skidSize.width).toBe(8);
      expect(skidSize.height).toBe(8);
      expect(skidSize.quantity).toBe(4);
    });

    // Edge Cases
    it('should handle zero weight', () => {
      const skidSize = calculateSkidSize(0);

      expect(skidSize).toEqual(SKID_SPECS.LIGHT);
    });

    it('should handle negative weight', () => {
      const skidSize = calculateSkidSize(-100);

      expect(skidSize).toEqual(SKID_SPECS.LIGHT);
    });

    it('should handle very small positive weight', () => {
      const skidSize = calculateSkidSize(0.1);

      expect(skidSize).toEqual(SKID_SPECS.LIGHT);
    });

    it('should handle fractional weights', () => {
      const skidSize1 = calculateSkidSize(499.9); // Just below medium threshold
      expect(skidSize1).toEqual(SKID_SPECS.LIGHT);

      const skidSize2 = calculateSkidSize(500.1); // Just above medium threshold
      expect(skidSize2).toEqual(SKID_SPECS.MEDIUM);

      const skidSize3 = calculateSkidSize(999.9); // Just below heavy threshold
      expect(skidSize3).toEqual(SKID_SPECS.MEDIUM);

      const skidSize4 = calculateSkidSize(1000.1); // Just above heavy threshold
      expect(skidSize4).toEqual(SKID_SPECS.HEAVY);
    });

    it('should handle extremely large weights', () => {
      const skidSize = calculateSkidSize(100000); // 100,000 lbs

      expect(skidSize).toEqual(SKID_SPECS.EXTRA_HEAVY_TWO);
    });

    it('should maintain consistency with threshold constants', () => {
      // Test that implementation matches the documented thresholds
      expect(calculateSkidSize(MEDIUM_WEIGHT_THRESHOLD - 1)).toEqual(SKID_SPECS.LIGHT);
      expect(calculateSkidSize(MEDIUM_WEIGHT_THRESHOLD)).toEqual(SKID_SPECS.LIGHT);
      expect(calculateSkidSize(MEDIUM_WEIGHT_THRESHOLD + 1)).toEqual(SKID_SPECS.MEDIUM);

      expect(calculateSkidSize(HEAVY_WEIGHT_THRESHOLD - 1)).toEqual(SKID_SPECS.MEDIUM);
      expect(calculateSkidSize(HEAVY_WEIGHT_THRESHOLD)).toEqual(SKID_SPECS.MEDIUM);
      expect(calculateSkidSize(HEAVY_WEIGHT_THRESHOLD + 1)).toEqual(SKID_SPECS.HEAVY);

      expect(calculateSkidSize(EXTRA_HEAVY_WEIGHT_THRESHOLD - 1)).toEqual(SKID_SPECS.HEAVY);
      expect(calculateSkidSize(EXTRA_HEAVY_WEIGHT_THRESHOLD)).toEqual(SKID_SPECS.HEAVY);
      expect(calculateSkidSize(EXTRA_HEAVY_WEIGHT_THRESHOLD + 1)).toEqual(
        SKID_SPECS.EXTRA_HEAVY_ONE
      );
    });

    it('should return consistent skid specifications', () => {
      const skidSize1 = calculateSkidSize(250);
      const skidSize2 = calculateSkidSize(250);

      // Should return the same values
      expect(skidSize1).toEqual(skidSize2);
      expect(skidSize1).toEqual(SKID_SPECS.LIGHT);

      // Values should match expected specifications
      expect(skidSize1.width).toBe(4);
      expect(skidSize1.height).toBe(4);
      expect(skidSize1.quantity).toBe(2);
    });

    it('should have progressive size increases with weight', () => {
      const weights = [100, 750, 1500, 3000, 7500];
      const skids = weights.map((weight) => calculateSkidSize(weight));

      // Width should generally increase or stay same
      for (let i = 1; i < skids.length; i++) {
        expect(skids[i].width).toBeGreaterThanOrEqual(skids[i - 1].width);
      }

      // Height should generally increase or stay same
      for (let i = 1; i < skids.length; i++) {
        expect(skids[i].height).toBeGreaterThanOrEqual(skids[i - 1].height);
      }

      // Quantity should generally increase or stay same
      for (let i = 1; i < skids.length; i++) {
        expect(skids[i].quantity).toBeGreaterThanOrEqual(skids[i - 1].quantity);
      }
    });
  });

  describe('calculateWeightPerSkid', () => {
    it('should calculate weight per skid correctly for standard case', () => {
      const weightPerSkid = calculateWeightPerSkid(1200, 3);

      expect(weightPerSkid).toBe(400); // 1200 / 3 = 400
    });

    it('should calculate weight per skid for single skid', () => {
      const weightPerSkid = calculateWeightPerSkid(500, 1);

      expect(weightPerSkid).toBe(500);
    });

    it('should calculate weight per skid for many skids', () => {
      const weightPerSkid = calculateWeightPerSkid(10000, 8);

      expect(weightPerSkid).toBe(1250); // 10000 / 8 = 1250
    });

    it('should handle fractional results', () => {
      const weightPerSkid = calculateWeightPerSkid(1000, 3);

      expect(weightPerSkid).toBeCloseTo(333.333, 3); // 1000 / 3 = 333.333...
    });

    it('should handle very small weights', () => {
      const weightPerSkid = calculateWeightPerSkid(1, 5);

      expect(weightPerSkid).toBe(0.2); // 1 / 5 = 0.2
    });

    it('should handle very large weights', () => {
      const weightPerSkid = calculateWeightPerSkid(100000, 4);

      expect(weightPerSkid).toBe(25000); // 100000 / 4 = 25000
    });

    it('should handle zero weight', () => {
      const weightPerSkid = calculateWeightPerSkid(0, 3);

      expect(weightPerSkid).toBe(0); // 0 / 3 = 0
    });

    // Edge Cases
    it('should throw error for zero skid count', () => {
      expect(() => calculateWeightPerSkid(1000, 0)).toThrow('Skid count must be positive');
    });

    it('should throw error for negative skid count', () => {
      expect(() => calculateWeightPerSkid(1000, -2)).toThrow('Skid count must be positive');
    });

    it('should handle negative total weight', () => {
      const weightPerSkid = calculateWeightPerSkid(-600, 3);

      expect(weightPerSkid).toBe(-200); // -600 / 3 = -200
    });

    it('should handle fractional skid count', () => {
      const weightPerSkid = calculateWeightPerSkid(1000, 2.5);

      expect(weightPerSkid).toBe(400); // 1000 / 2.5 = 400
    });

    it('should handle very small skid count', () => {
      const weightPerSkid = calculateWeightPerSkid(100, 0.1);

      expect(weightPerSkid).toBe(1000); // 100 / 0.1 = 1000
    });

    it('should handle precision for floating point arithmetic', () => {
      const weightPerSkid = calculateWeightPerSkid(100, 3);

      expect(weightPerSkid).toBeCloseTo(33.333, 3);
    });

    it('should maintain mathematical consistency', () => {
      const totalWeight = 1500;
      const skidCount = 4;

      const weightPerSkid = calculateWeightPerSkid(totalWeight, skidCount);
      const reconstructedTotal = weightPerSkid * skidCount;

      expect(reconstructedTotal).toBeCloseTo(totalWeight, 10);
    });
  });

  describe('Integration Tests', () => {
    it('should work together for complete skid calculation workflow', () => {
      const scenarios = [
        { totalWeight: 300, expectedSkidType: SKID_SPECS.LIGHT },
        { totalWeight: 750, expectedSkidType: SKID_SPECS.MEDIUM },
        { totalWeight: 1500, expectedSkidType: SKID_SPECS.HEAVY },
        { totalWeight: 3000, expectedSkidType: SKID_SPECS.EXTRA_HEAVY_ONE },
        { totalWeight: 8000, expectedSkidType: SKID_SPECS.EXTRA_HEAVY_TWO },
      ];

      scenarios.forEach(({ totalWeight, expectedSkidType }) => {
        const skidSize = calculateSkidSize(totalWeight);
        const skidCount = skidSize.quantity;
        const weightPerSkid = calculateWeightPerSkid(totalWeight, skidCount);

        // Verify skid type
        expect(skidSize).toEqual(expectedSkidType);

        // Verify weight distribution
        expect(weightPerSkid).toBe(totalWeight / skidCount);
        expect(weightPerSkid * skidCount).toBeCloseTo(totalWeight, 10);

        // Verify reasonable weight per skid
        expect(weightPerSkid).toBeGreaterThan(0);
        expect(weightPerSkid).toBeLessThanOrEqual(totalWeight);
      });
    });

    it('should handle realistic shipping scenarios', () => {
      const shippingCases = [
        { description: 'Light machinery', weight: 450, expectedSkids: 2 },
        { description: 'Medium equipment', weight: 800, expectedSkids: 2 },
        { description: 'Heavy machinery', weight: 1800, expectedSkids: 2 },
        { description: 'Industrial equipment', weight: 4000, expectedSkids: 3 },
        { description: 'Massive machinery', weight: 12000, expectedSkids: 4 },
      ];

      shippingCases.forEach(({ description, weight, expectedSkids }) => {
        const skidSize = calculateSkidSize(weight);
        const weightPerSkid = calculateWeightPerSkid(weight, skidSize.quantity);

        expect(skidSize.quantity).toBe(expectedSkids);
        expect(weightPerSkid).toBeLessThanOrEqual(weight);
        expect(weightPerSkid).toBeGreaterThan(0);

        // Weight per skid should be reasonable for the skid size
        if (skidSize.width === 4 && skidSize.height === 4) {
          expect(weightPerSkid).toBeLessThanOrEqual(1000); // Light skids shouldn't carry too much
        } else if (skidSize.width === 8 && skidSize.height === 8) {
          expect(weightPerSkid).toBeGreaterThan(1000); // Heavy skids should handle substantial weight
        }
      });
    });

    it('should maintain load balancing principles', () => {
      const testWeights = [900, 1800, 3600, 7200];

      testWeights.forEach((weight) => {
        const skidSize = calculateSkidSize(weight);
        const weightPerSkid = calculateWeightPerSkid(weight, skidSize.quantity);

        // More skids should mean less weight per skid (better distribution)
        if (skidSize.quantity > 2) {
          expect(weightPerSkid).toBeLessThan(weight / 2);
        }

        // Weight per skid should not exceed reasonable limits for skid size
        const skidCapacity = skidSize.width * skidSize.height * 100; // Rough capacity estimate
        expect(weightPerSkid).toBeLessThanOrEqual(skidCapacity);
      });
    });

    it('should handle edge cases in combined operations', () => {
      // Very light load
      const lightSkidSize = calculateSkidSize(50);
      const lightWeightPerSkid = calculateWeightPerSkid(50, lightSkidSize.quantity);
      expect(lightWeightPerSkid).toBe(25); // 50/2 = 25

      // Very heavy load
      const heavySkidSize = calculateSkidSize(50000);
      const heavyWeightPerSkid = calculateWeightPerSkid(50000, heavySkidSize.quantity);
      expect(heavyWeightPerSkid).toBe(12500); // 50000/4 = 12500

      // Boundary conditions
      const boundarySkidSize = calculateSkidSize(MEDIUM_WEIGHT_THRESHOLD);
      const boundaryWeightPerSkid = calculateWeightPerSkid(
        MEDIUM_WEIGHT_THRESHOLD,
        boundarySkidSize.quantity
      );
      expect(boundaryWeightPerSkid).toBe(MEDIUM_WEIGHT_THRESHOLD / boundarySkidSize.quantity);
    });

    it('should validate skid specifications structure', () => {
      const allSkidTypes = [
        SKID_SPECS.LIGHT,
        SKID_SPECS.MEDIUM,
        SKID_SPECS.HEAVY,
        SKID_SPECS.EXTRA_HEAVY_ONE,
        SKID_SPECS.EXTRA_HEAVY_TWO,
      ];

      allSkidTypes.forEach((skidType) => {
        expect(skidType).toHaveProperty('width');
        expect(skidType).toHaveProperty('height');
        expect(skidType).toHaveProperty('quantity');

        expect(typeof skidType.width).toBe('number');
        expect(typeof skidType.height).toBe('number');
        expect(typeof skidType.quantity).toBe('number');

        expect(skidType.width).toBeGreaterThan(0);
        expect(skidType.height).toBeGreaterThan(0);
        expect(skidType.quantity).toBeGreaterThan(0);
      });
    });

    it('should ensure progressive skid capabilities', () => {
      const weights = [100, 600, 1200, 2500, 6000];
      const skids = weights.map((weight) => ({ weight, size: calculateSkidSize(weight) }));

      // Each heavier weight class should have equal or greater capacity
      for (let i = 1; i < skids.length; i++) {
        const currentCapacity = skids[i].size.width * skids[i].size.height * skids[i].size.quantity;
        const previousCapacity =
          skids[i - 1].size.width * skids[i - 1].size.height * skids[i - 1].size.quantity;

        expect(currentCapacity).toBeGreaterThanOrEqual(previousCapacity);
      }
    });
  });
});
