import { describe, it, expect } from 'vitest';
import { calculateBOM, calculateTotalCost, MaterialItem } from '@/services/bomCalculations';

describe('BOM Calculations', () => {
  describe('calculateBOM', () => {
    it('should calculate BOM for standard crate', () => {
      const dimensions = { length: 48, width: 32, height: 24 };
      const weight = 500;

      const bom = calculateBOM(dimensions, weight);

      expect(bom).toHaveLength(3);

      // Check plywood panels
      const plywoodItem = bom.find((item) => item.name === 'Plywood Panel (4x8)');
      expect(plywoodItem).toBeDefined();
      expect(plywoodItem?.quantity).toBe(48); // Math.ceil((48 * 32) / 32) = Math.ceil(48) = 48
      expect(plywoodItem?.unitPrice).toBe(45.0);
      expect(plywoodItem?.totalPrice).toBe(48 * 45.0);

      // Check lumber
      const lumberItem = bom.find((item) => item.name === '2x4 Lumber (8ft)');
      expect(lumberItem).toBeDefined();
      expect(lumberItem?.quantity).toBe(20); // Math.ceil(2 * (48 + 32) / 8) = Math.ceil(20) = 20
      expect(lumberItem?.unitPrice).toBe(8.5);
      expect(lumberItem?.totalPrice).toBe(20 * 8.5);

      // Check screws
      const screwItem = bom.find((item) => item.name === 'Screws (box)');
      expect(screwItem).toBeDefined();
      expect(screwItem?.quantity).toBe(7); // Math.ceil((48 + 20) / 10) = Math.ceil(6.8) = 7
      expect(screwItem?.unitPrice).toBe(12.0);
      expect(screwItem?.totalPrice).toBe(7 * 12.0);
    });

    it('should calculate BOM for small crate', () => {
      const dimensions = { length: 12, width: 8, height: 6 };
      const weight = 100;

      const bom = calculateBOM(dimensions, weight);

      expect(bom).toHaveLength(3);

      // Check plywood panels - very small area
      const plywoodItem = bom.find((item) => item.name === 'Plywood Panel (4x8)');
      expect(plywoodItem).toBeDefined();
      expect(plywoodItem?.quantity).toBe(3); // Math.ceil((12 * 8) / 32) = Math.ceil(3) = 3
      expect(plywoodItem?.totalPrice).toBe(3 * 45.0);

      // Check lumber - small perimeter
      const lumberItem = bom.find((item) => item.name === '2x4 Lumber (8ft)');
      expect(lumberItem).toBeDefined();
      expect(lumberItem?.quantity).toBe(5); // Math.ceil(2 * (12 + 8) / 8) = Math.ceil(5) = 5
      expect(lumberItem?.totalPrice).toBe(5 * 8.5);

      // Check screws
      const screwItem = bom.find((item) => item.name === 'Screws (box)');
      expect(screwItem).toBeDefined();
      expect(screwItem?.quantity).toBe(1); // Math.ceil((3 + 5) / 10) = Math.ceil(0.8) = 1
      expect(screwItem?.totalPrice).toBe(1 * 12.0);
    });

    it('should calculate BOM for large crate', () => {
      const dimensions = { length: 120, width: 96, height: 84 };
      const weight = 5000;

      const bom = calculateBOM(dimensions, weight);

      expect(bom).toHaveLength(3);

      // Check plywood panels - large area
      const plywoodItem = bom.find((item) => item.name === 'Plywood Panel (4x8)');
      expect(plywoodItem).toBeDefined();
      expect(plywoodItem?.quantity).toBe(360); // Math.ceil((120 * 96) / 32) = Math.ceil(360) = 360
      expect(plywoodItem?.totalPrice).toBe(360 * 45.0);

      // Check lumber - large perimeter
      const lumberItem = bom.find((item) => item.name === '2x4 Lumber (8ft)');
      expect(lumberItem).toBeDefined();
      expect(lumberItem?.quantity).toBe(54); // Math.ceil(2 * (120 + 96) / 8) = Math.ceil(54) = 54
      expect(lumberItem?.totalPrice).toBe(54 * 8.5);

      // Check screws
      const screwItem = bom.find((item) => item.name === 'Screws (box)');
      expect(screwItem).toBeDefined();
      expect(screwItem?.quantity).toBe(42); // Math.ceil((360 + 54) / 10) = Math.ceil(41.4) = 42
      expect(screwItem?.totalPrice).toBe(42 * 12.0);
    });

    it('should calculate BOM for square crate', () => {
      const dimensions = { length: 24, width: 24, height: 24 };
      const weight = 250;

      const bom = calculateBOM(dimensions, weight);

      expect(bom).toHaveLength(3);

      const plywoodItem = bom.find((item) => item.name === 'Plywood Panel (4x8)');
      expect(plywoodItem).toBeDefined();
      expect(plywoodItem?.quantity).toBe(18); // Math.ceil((24 * 24) / 32) = Math.ceil(18) = 18

      const lumberItem = bom.find((item) => item.name === '2x4 Lumber (8ft)');
      expect(lumberItem).toBeDefined();
      expect(lumberItem?.quantity).toBe(12); // Math.ceil(2 * (24 + 24) / 8) = Math.ceil(12) = 12

      const screwItem = bom.find((item) => item.name === 'Screws (box)');
      expect(screwItem).toBeDefined();
      expect(screwItem?.quantity).toBe(3); // Math.ceil((18 + 12) / 10) = Math.ceil(3) = 3
    });

    it('should handle fractional dimensions', () => {
      const dimensions = { length: 25.5, width: 15.75, height: 12.25 };
      const weight = 300;

      const bom = calculateBOM(dimensions, weight);

      expect(bom).toHaveLength(3);

      const plywoodItem = bom.find((item) => item.name === 'Plywood Panel (4x8)');
      expect(plywoodItem).toBeDefined();
      expect(plywoodItem?.quantity).toBe(13); // Math.ceil((25.5 * 15.75) / 32) = Math.ceil(12.586) = 13

      const lumberItem = bom.find((item) => item.name === '2x4 Lumber (8ft)');
      expect(lumberItem).toBeDefined();
      expect(lumberItem?.quantity).toBe(11); // Math.ceil(2 * (25.5 + 15.75) / 8) = Math.ceil(10.3125) = 11

      const screwItem = bom.find((item) => item.name === 'Screws (box)');
      expect(screwItem).toBeDefined();
      expect(screwItem?.quantity).toBe(3); // Math.ceil((13 + 11) / 10) = Math.ceil(2.4) = 3
    });

    // Edge Cases
    it('should handle minimum dimensions', () => {
      const dimensions = { length: 1, width: 1, height: 1 };
      const weight = 1;

      const bom = calculateBOM(dimensions, weight);

      expect(bom).toHaveLength(3);

      const plywoodItem = bom.find((item) => item.name === 'Plywood Panel (4x8)');
      expect(plywoodItem?.quantity).toBe(1); // Math.ceil(1 / 32) = Math.ceil(0.03125) = 1

      const lumberItem = bom.find((item) => item.name === '2x4 Lumber (8ft)');
      expect(lumberItem?.quantity).toBe(1); // Math.ceil(2 * 2 / 8) = Math.ceil(0.5) = 1

      const screwItem = bom.find((item) => item.name === 'Screws (box)');
      expect(screwItem?.quantity).toBe(1); // Math.ceil(2 / 10) = Math.ceil(0.2) = 1
    });

    it('should handle zero dimensions', () => {
      const dimensions = { length: 0, width: 10, height: 10 };
      const weight = 100;

      const bom = calculateBOM(dimensions, weight);

      expect(bom).toHaveLength(3);

      const plywoodItem = bom.find((item) => item.name === 'Plywood Panel (4x8)');
      expect(plywoodItem?.quantity).toBe(0); // Math.ceil(0 / 32) = Math.ceil(0) = 0

      const lumberItem = bom.find((item) => item.name === '2x4 Lumber (8ft)');
      expect(lumberItem?.quantity).toBe(3); // Math.ceil(2 * 10 / 8) = Math.ceil(2.5) = 3

      const screwItem = bom.find((item) => item.name === 'Screws (box)');
      expect(screwItem?.quantity).toBe(1); // Math.ceil(4 / 10) = Math.ceil(0.4) = 1
    });

    it('should handle negative dimensions', () => {
      const dimensions = { length: -10, width: 20, height: 15 };
      const weight = 200;

      const bom = calculateBOM(dimensions, weight);

      expect(bom).toHaveLength(3);

      const plywoodItem = bom.find((item) => item.name === 'Plywood Panel (4x8)');
      expect(plywoodItem?.quantity).toBe(-6); // Math.ceil(-200 / 32) = Math.ceil(-6.25) = -6

      const lumberItem = bom.find((item) => item.name === '2x4 Lumber (8ft)');
      expect(lumberItem?.quantity).toBe(3); // Math.ceil(2 * 10 / 8) = Math.ceil(2.5) = 3

      // Note: This tests current behavior, but negative dimensions should probably throw an error
    });

    it('should handle very small fractional dimensions', () => {
      const dimensions = { length: 0.1, width: 0.2, height: 0.3 };
      const weight = 0.5;

      const bom = calculateBOM(dimensions, weight);

      expect(bom).toHaveLength(3);

      // All quantities should be minimum of 1 due to Math.ceil
      bom.forEach((item) => {
        expect(item.quantity).toBeGreaterThanOrEqual(1);
      });
    });

    it('should handle extremely large dimensions', () => {
      const dimensions = { length: 1000, width: 1000, height: 1000 };
      const weight = 50000;

      const bom = calculateBOM(dimensions, weight);

      expect(bom).toHaveLength(3);

      const plywoodItem = bom.find((item) => item.name === 'Plywood Panel (4x8)');
      expect(plywoodItem?.quantity).toBe(31250); // Math.ceil(1000000 / 32) = 31250

      const lumberItem = bom.find((item) => item.name === '2x4 Lumber (8ft)');
      expect(lumberItem?.quantity).toBe(500); // Math.ceil(4000 / 8) = 500

      const screwItem = bom.find((item) => item.name === 'Screws (box)');
      expect(screwItem?.quantity).toBe(3175); // Math.ceil(31750 / 10) = 3175
    });

    it('should ignore weight parameter correctly', () => {
      const dimensions = { length: 20, width: 15, height: 10 };

      // BOM should be same regardless of weight
      const bom1 = calculateBOM(dimensions, 100);
      const bom2 = calculateBOM(dimensions, 5000);

      expect(bom1).toEqual(bom2);
    });

    it('should maintain proper material structure', () => {
      const dimensions = { length: 30, width: 20, height: 18 };
      const weight = 400;

      const bom = calculateBOM(dimensions, weight);

      bom.forEach((item) => {
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('quantity');
        expect(item).toHaveProperty('unitPrice');
        expect(item).toHaveProperty('totalPrice');

        expect(typeof item.name).toBe('string');
        expect(typeof item.quantity).toBe('number');
        expect(typeof item.unitPrice).toBe('number');
        expect(typeof item.totalPrice).toBe('number');

        expect(item.quantity).toBeGreaterThan(0);
        expect(item.unitPrice).toBeGreaterThan(0);
        expect(item.totalPrice).toBe(item.quantity * item.unitPrice);
      });
    });
  });

  describe('calculateTotalCost', () => {
    it('should calculate total cost correctly for standard BOM', () => {
      const materials: MaterialItem[] = [
        { name: 'Item 1', quantity: 2, unitPrice: 10.0, totalPrice: 20.0 },
        { name: 'Item 2', quantity: 3, unitPrice: 15.0, totalPrice: 45.0 },
        { name: 'Item 3', quantity: 1, unitPrice: 25.0, totalPrice: 25.0 },
      ];

      const total = calculateTotalCost(materials);
      expect(total).toBe(90.0);
    });

    it('should handle empty materials list', () => {
      const materials: MaterialItem[] = [];
      const total = calculateTotalCost(materials);
      expect(total).toBe(0);
    });

    it('should handle single item', () => {
      const materials: MaterialItem[] = [
        { name: 'Single Item', quantity: 5, unitPrice: 12.5, totalPrice: 62.5 },
      ];

      const total = calculateTotalCost(materials);
      expect(total).toBe(62.5);
    });

    it('should handle zero-cost items', () => {
      const materials: MaterialItem[] = [
        { name: 'Free Item', quantity: 1, unitPrice: 0, totalPrice: 0 },
        { name: 'Paid Item', quantity: 2, unitPrice: 10, totalPrice: 20 },
      ];

      const total = calculateTotalCost(materials);
      expect(total).toBe(20);
    });

    it('should handle fractional costs', () => {
      const materials: MaterialItem[] = [
        { name: 'Item 1', quantity: 3, unitPrice: 12.33, totalPrice: 36.99 },
        { name: 'Item 2', quantity: 2, unitPrice: 5.67, totalPrice: 11.34 },
      ];

      const total = calculateTotalCost(materials);
      expect(total).toBeCloseTo(48.33, 2);
    });

    it('should handle very large quantities and costs', () => {
      const materials: MaterialItem[] = [
        { name: 'Expensive Item', quantity: 1000, unitPrice: 999.99, totalPrice: 999990 },
      ];

      const total = calculateTotalCost(materials);
      expect(total).toBe(999990);
    });

    it('should handle negative costs (refunds/credits)', () => {
      const materials: MaterialItem[] = [
        { name: 'Regular Item', quantity: 2, unitPrice: 50, totalPrice: 100 },
        { name: 'Refund', quantity: 1, unitPrice: -25, totalPrice: -25 },
      ];

      const total = calculateTotalCost(materials);
      expect(total).toBe(75);
    });
  });

  describe('Integration Tests', () => {
    it('should match calculateTotalCost with calculateBOM output', () => {
      const dimensions = { length: 36, width: 28, height: 20 };
      const weight = 750;

      const bom = calculateBOM(dimensions, weight);
      const calculatedTotal = calculateTotalCost(bom);
      const manualTotal = bom.reduce((sum, item) => sum + item.totalPrice, 0);

      expect(calculatedTotal).toBe(manualTotal);
    });

    it('should scale costs proportionally with crate size', () => {
      const smallDimensions = { length: 12, width: 12, height: 12 };
      const largeDimensions = { length: 24, width: 24, height: 24 };
      const weight = 500;

      const smallBOM = calculateBOM(smallDimensions, weight);
      const largeBOM = calculateBOM(largeDimensions, weight);

      const smallTotal = calculateTotalCost(smallBOM);
      const largeTotal = calculateTotalCost(largeBOM);

      // Large crate should cost more than small crate
      expect(largeTotal).toBeGreaterThan(smallTotal);

      // Verify materials increase appropriately
      const smallPlywood =
        smallBOM.find((item) => item.name === 'Plywood Panel (4x8)')?.quantity || 0;
      const largePlywood =
        largeBOM.find((item) => item.name === 'Plywood Panel (4x8)')?.quantity || 0;

      expect(largePlywood).toBeGreaterThan(smallPlywood);
    });

    it('should handle realistic shipping crate scenario', () => {
      const dimensions = { length: 48, width: 40, height: 36 }; // Typical shipping crate
      const weight = 1200; // 1200 lbs

      const bom = calculateBOM(dimensions, weight);
      const totalCost = calculateTotalCost(bom);

      // Should have reasonable quantities
      const plywoodItem = bom.find((item) => item.name === 'Plywood Panel (4x8)');
      const lumberItem = bom.find((item) => item.name === '2x4 Lumber (8ft)');
      const screwItem = bom.find((item) => item.name === 'Screws (box)');

      expect(plywoodItem?.quantity).toBeGreaterThan(0);
      expect(lumberItem?.quantity).toBeGreaterThan(0);
      expect(screwItem?.quantity).toBeGreaterThan(0);

      // Total cost should be reasonable (not zero, not astronomical)
      expect(totalCost).toBeGreaterThan(100);
      expect(totalCost).toBeLessThan(10000);

      // Cost should be sum of all parts
      const expectedTotal =
        (plywoodItem?.totalPrice || 0) +
        (lumberItem?.totalPrice || 0) +
        (screwItem?.totalPrice || 0);
      expect(totalCost).toBe(expectedTotal);
    });

    it('should handle boundary between panel size calculations', () => {
      // Test dimensions that result in exactly 32 sq ft (one panel)
      const exactDimensions = { length: 8, width: 4, height: 10 }; // 8*4 = 32
      const overDimensions = { length: 8.1, width: 4, height: 10 }; // 8.1*4 = 32.4

      const exactBOM = calculateBOM(exactDimensions, 100);
      const overBOM = calculateBOM(overDimensions, 100);

      const exactPlywood =
        exactBOM.find((item) => item.name === 'Plywood Panel (4x8)')?.quantity || 0;
      const overPlywood =
        overBOM.find((item) => item.name === 'Plywood Panel (4x8)')?.quantity || 0;

      expect(exactPlywood).toBe(1); // Exactly 1 panel needed
      expect(overPlywood).toBe(2); // Need 2 panels for slightly larger area
    });
  });
});
