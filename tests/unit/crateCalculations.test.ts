import { describe, it, expect } from 'vitest';
import {
  calculateSkidBlocks,
  calculateFloorboardBlocks,
} from '../../src/services/crateCalculations';
import { CrateConfiguration } from '../../src/types/crate';

/**
 * Helper function to create a base crate configuration
 */
function createBaseCrateConfig(overrides?: Partial<CrateConfiguration>): CrateConfiguration {
  return {
    projectName: 'Test Crate',
    dimensions: {
      length: 48,
      width: 36,
      height: 24,
    },
    weight: {
      product: 250,
    },
    base: {
      type: 'standard',
      floorboardThickness: 1.5,
      skidHeight: 3.5,
      skidWidth: 2.5,
      skidCount: 2,
      skidSpacing: 30,
      requiresRubStrips: false,
      material: 'pine',
    },
    cap: {
      topPanel: {
        thickness: 0.75,
        material: 'plywood',
        reinforcement: false,
        ventilation: {
          enabled: false,
          type: 'slots',
          count: 0,
          size: 0,
        },
      },
      frontPanel: {
        thickness: 0.75,
        material: 'plywood',
        reinforcement: false,
        ventilation: {
          enabled: false,
          type: 'slots',
          count: 0,
          size: 0,
        },
      },
      backPanel: {
        thickness: 0.75,
        material: 'plywood',
        reinforcement: false,
        ventilation: {
          enabled: false,
          type: 'slots',
          count: 0,
          size: 0,
        },
      },
      leftPanel: {
        thickness: 0.75,
        material: 'plywood',
        reinforcement: false,
        ventilation: {
          enabled: false,
          type: 'slots',
          count: 0,
          size: 0,
        },
      },
      rightPanel: {
        thickness: 0.75,
        material: 'plywood',
        reinforcement: false,
        ventilation: {
          enabled: false,
          type: 'slots',
          count: 0,
          size: 0,
        },
      },
    },
    fasteners: {
      type: 'nails',
      size: '16d',
      spacing: 6,
      material: 'steel',
    },
    specialRequirements: [],
    ...overrides,
  };
}

describe('calculateSkidBlocks', () => {
  it('should calculate correct skid blocks for light weight (< 501 lbs)', () => {
    const config = createBaseCrateConfig({
      weight: { product: 250 },
      dimensions: { length: 48, width: 36, height: 24 },
    });

    const result = calculateSkidBlocks(config);

    // For weight < 501 lbs: skidHeight = 3.5", skidWidth = 2.5", maxSpacing = 30"
    // Width = 36", so span = 36 - 2.5 = 33.5"
    // numGaps = ceil(33.5 / 30) = 2
    // skidCount = 2 + 1 = 3
    // pitch = (36 - 2.5) / (3 - 1) = 33.5 / 2 = 16.75"
    // firstPos = -36/2 + 2.5/2 = -18 + 1.25 = -16.75
    expect(result).toHaveLength(3);

    // Check first skid
    expect(result[0].position[0]).toBeCloseTo(-16.75, 2);
    expect(result[0].position[1]).toBe(0);
    expect(result[0].position[2]).toBeCloseTo(1.75, 2); // skidHeight/2 = 3.5/2
    expect(result[0].dimensions).toEqual([2.5, 48, 3.5]);

    // Check second skid (center)
    expect(result[1].position[0]).toBeCloseTo(0, 2);
    expect(result[1].position[1]).toBe(0);
    expect(result[1].position[2]).toBeCloseTo(1.75, 2);
    expect(result[1].dimensions).toEqual([2.5, 48, 3.5]);

    // Check third skid
    expect(result[2].position[0]).toBeCloseTo(16.75, 2);
    expect(result[2].position[1]).toBe(0);
    expect(result[2].position[2]).toBeCloseTo(1.75, 2);
    expect(result[2].dimensions).toEqual([2.5, 48, 3.5]);
  });

  it('should calculate correct skid blocks for medium weight (501-4500 lbs)', () => {
    const config = createBaseCrateConfig({
      weight: { product: 2000 },
      dimensions: { length: 60, width: 48, height: 36 },
    });

    const result = calculateSkidBlocks(config);

    // For weight 501-4500 lbs: skidHeight = 3.5", skidWidth = 3.5", maxSpacing = 30"
    // Width = 48", so span = 48 - 3.5 = 44.5"
    // numGaps = ceil(44.5 / 30) = 2
    // skidCount = 2 + 1 = 3
    expect(result).toHaveLength(3);

    // Check dimensions are correct for this weight range
    result.forEach((block) => {
      expect(block.dimensions).toEqual([3.5, 60, 3.5]);
      expect(block.position[2]).toBeCloseTo(1.75, 2); // Z position = skidHeight/2
    });
  });

  it('should calculate correct skid blocks for heavy weight (4501-20000 lbs)', () => {
    const config = createBaseCrateConfig({
      weight: { product: 8000 },
      dimensions: { length: 72, width: 60, height: 48 },
    });

    const result = calculateSkidBlocks(config);

    // For weight 6000-12000 lbs: skidHeight = 3.5", skidWidth = 5.5", maxSpacing = 28"
    // Width = 60", so span = 60 - 5.5 = 54.5"
    // numGaps = ceil(54.5 / 28) = 2
    // skidCount = 2 + 1 = 3
    expect(result).toHaveLength(3);

    // Check dimensions are correct for this weight range
    result.forEach((block) => {
      expect(block.dimensions).toEqual([5.5, 72, 3.5]);
      expect(block.position[2]).toBeCloseTo(1.75, 2);
    });
  });

  it('should calculate correct skid blocks for very heavy weight (20001-40000 lbs)', () => {
    const config = createBaseCrateConfig({
      weight: { product: 25000 },
      dimensions: { length: 96, width: 72, height: 60 },
    });

    const result = calculateSkidBlocks(config);

    // For weight 20001-30000 lbs: skidHeight = 5.5", skidWidth = 5.5", maxSpacing = 24"
    // Width = 72", so span = 72 - 5.5 = 66.5"
    // numGaps = ceil(66.5 / 24) = 3
    // skidCount = 3 + 1 = 4
    expect(result).toHaveLength(4);

    // Check dimensions are correct for this weight range
    result.forEach((block) => {
      expect(block.dimensions).toEqual([5.5, 96, 5.5]);
      expect(block.position[2]).toBeCloseTo(2.75, 2); // Z position = 5.5/2
    });
  });

  it('should calculate correct skid blocks for extreme weight (> 40000 lbs)', () => {
    const config = createBaseCrateConfig({
      weight: { product: 50000 },
      dimensions: { length: 120, width: 96, height: 72 },
    });

    const result = calculateSkidBlocks(config);

    // For weight > 40000 lbs: skidHeight = 7.5", skidWidth = 7.5", maxSpacing = 24"
    // Width = 96", so span = 96 - 7.5 = 88.5"
    // numGaps = ceil(88.5 / 24) = 4
    // skidCount = 4 + 1 = 5
    expect(result).toHaveLength(5);

    // Check dimensions are correct for this weight range
    result.forEach((block) => {
      expect(block.dimensions).toEqual([7.5, 120, 7.5]);
      expect(block.position[2]).toBeCloseTo(3.75, 2); // Z position = 7.5/2
    });
  });

  it('should handle minimum of 2 skids for narrow crates', () => {
    const config = createBaseCrateConfig({
      weight: { product: 100 },
      dimensions: { length: 24, width: 12, height: 12 },
    });

    const result = calculateSkidBlocks(config);

    // Even for narrow crates, should have minimum 2 skids
    expect(result).toHaveLength(2);
  });

  it('should correctly position skids along X-axis', () => {
    const config = createBaseCrateConfig({
      weight: { product: 300 },
      dimensions: { length: 48, width: 24, height: 24 },
    });

    const result = calculateSkidBlocks(config);

    // For weight < 501 lbs: skidWidth = 2.5", width = 24"
    // span = 24 - 2.5 = 21.5", maxSpacing = 30"
    // numGaps = ceil(21.5 / 30) = 1
    // skidCount = 1 + 1 = 2
    // pitch = (24 - 2.5) / (2 - 1) = 21.5"
    // firstPos = -24/2 + 2.5/2 = -12 + 1.25 = -10.75
    expect(result).toHaveLength(2);

    expect(result[0].position[0]).toBeCloseTo(-10.75, 2);
    expect(result[1].position[0]).toBeCloseTo(10.75, 2);
  });

  it('should use correct skid dimensions based on different weight thresholds', () => {
    const testCases = [
      { weight: 100, expectedDims: [2.5, 48, 3.5] }, // < 501 lbs
      { weight: 1000, expectedDims: [3.5, 48, 3.5] }, // 501-4500 lbs
      { weight: 5000, expectedDims: [5.5, 48, 3.5] }, // 4501-6000 lbs
      { weight: 10000, expectedDims: [5.5, 48, 3.5] }, // 6001-12000 lbs
      { weight: 15000, expectedDims: [5.5, 48, 3.5] }, // 12001-20000 lbs
      { weight: 25000, expectedDims: [5.5, 48, 5.5] }, // 20001-30000 lbs
      { weight: 35000, expectedDims: [5.5, 48, 5.5] }, // 30001-40000 lbs
      { weight: 45000, expectedDims: [7.5, 48, 7.5] }, // > 40000 lbs
    ];

    testCases.forEach(({ weight, expectedDims }) => {
      const config = createBaseCrateConfig({
        weight: { product: weight },
        dimensions: { length: 48, width: 96, height: 36 },
      });

      const result = calculateSkidBlocks(config);
      expect(result[0].dimensions).toEqual(expectedDims);
    });
  });

  it('should handle edge case where span equals zero', () => {
    const config = createBaseCrateConfig({
      weight: { product: 100 },
      dimensions: { length: 24, width: 2.5, height: 12 }, // Width equals skid width
    });

    const result = calculateSkidBlocks(config);

    // When span <= 0, should default to 2 skids
    expect(result).toHaveLength(2);
  });
});

describe('calculateFloorboardBlocks', () => {
  it('should calculate correct floorboard block with basic configuration', () => {
    const config = createBaseCrateConfig({
      dimensions: { length: 48, width: 36, height: 24 },
      base: {
        type: 'standard',
        floorboardThickness: 1.5,
        skidHeight: 3.5,
        skidWidth: 2.5,
        skidCount: 2,
        skidSpacing: 30,
        requiresRubStrips: false,
        material: 'pine',
      },
    });

    const result = calculateFloorboardBlocks(config);

    // Currently returns a single block representing the entire floor
    expect(result).toHaveLength(1);

    const floorboard = result[0];
    expect(floorboard.position[0]).toBe(0); // Centered at X = 0
    expect(floorboard.position[1]).toBe(0); // Centered at Y = 0
    expect(floorboard.position[2]).toBeCloseTo(4.25, 2); // Z = skidHeight + thickness/2 = 3.5 + 0.75
    expect(floorboard.dimensions).toEqual([36, 48, 1.5]);
  });

  it('should adjust Z position based on skid height and floorboard thickness', () => {
    const config = createBaseCrateConfig({
      dimensions: { length: 60, width: 48, height: 36 },
      base: {
        type: 'heavy-duty',
        floorboardThickness: 2.0,
        skidHeight: 5.5,
        skidWidth: 5.5,
        skidCount: 3,
        skidSpacing: 24,
        requiresRubStrips: false,
        material: 'oak',
      },
    });

    const result = calculateFloorboardBlocks(config);

    expect(result).toHaveLength(1);

    const floorboard = result[0];
    expect(floorboard.position[2]).toBeCloseTo(6.5, 2); // Z = 5.5 + 2.0/2
    expect(floorboard.dimensions).toEqual([48, 60, 2.0]);
  });

  it('should use crate dimensions for floorboard size', () => {
    const testCases = [
      { length: 24, width: 18 },
      { length: 48, width: 36 },
      { length: 72, width: 60 },
      { length: 96, width: 84 },
      { length: 120, width: 96 },
    ];

    testCases.forEach(({ length, width }) => {
      const config = createBaseCrateConfig({
        dimensions: { length, width, height: 24 },
      });

      const result = calculateFloorboardBlocks(config);

      expect(result[0].dimensions[0]).toBe(width);
      expect(result[0].dimensions[1]).toBe(length);
    });
  });

  it('should center floorboard at origin in X and Y', () => {
    const config = createBaseCrateConfig({
      dimensions: { length: 72, width: 48, height: 36 },
    });

    const result = calculateFloorboardBlocks(config);

    expect(result[0].position[0]).toBe(0);
    expect(result[0].position[1]).toBe(0);
  });

  it('should handle different floorboard thickness values', () => {
    const thicknessValues = [0.75, 1.0, 1.5, 2.0, 2.5];

    thicknessValues.forEach((thickness) => {
      const config = createBaseCrateConfig({
        base: {
          type: 'standard',
          floorboardThickness: thickness,
          skidHeight: 4.0,
          skidWidth: 3.5,
          skidCount: 2,
          skidSpacing: 30,
          requiresRubStrips: false,
          material: 'pine',
        },
      });

      const result = calculateFloorboardBlocks(config);

      expect(result[0].dimensions[2]).toBe(thickness);
      expect(result[0].position[2]).toBeCloseTo(4.0 + thickness / 2, 2);
    });
  });

  it('should handle export base type configuration', () => {
    const config = createBaseCrateConfig({
      dimensions: { length: 96, width: 72, height: 48 },
      base: {
        type: 'export',
        floorboardThickness: 2.5,
        skidHeight: 6.0,
        skidWidth: 6.0,
        skidCount: 4,
        skidSpacing: 20,
        requiresRubStrips: true,
        material: 'oak',
      },
    });

    const result = calculateFloorboardBlocks(config);

    expect(result).toHaveLength(1);
    expect(result[0].position[2]).toBeCloseTo(7.25, 2); // 6.0 + 2.5/2
    expect(result[0].dimensions).toEqual([72, 96, 2.5]);
  });
});

describe('Edge cases and validation', () => {
  it('should handle very small crate dimensions', () => {
    const config = createBaseCrateConfig({
      weight: { product: 10 },
      dimensions: { length: 6, width: 6, height: 6 },
    });

    const skidBlocks = calculateSkidBlocks(config);
    const floorboardBlocks = calculateFloorboardBlocks(config);

    expect(skidBlocks.length).toBeGreaterThanOrEqual(2);
    expect(floorboardBlocks).toHaveLength(1);
    expect(floorboardBlocks[0].dimensions).toEqual([6, 6, 1.5]);
  });

  it('should handle very large crate dimensions', () => {
    const config = createBaseCrateConfig({
      weight: { product: 100000 },
      dimensions: { length: 240, width: 180, height: 120 },
    });

    const skidBlocks = calculateSkidBlocks(config);
    const floorboardBlocks = calculateFloorboardBlocks(config);

    expect(skidBlocks.length).toBeGreaterThan(2);
    expect(floorboardBlocks).toHaveLength(1);
    expect(floorboardBlocks[0].dimensions).toEqual([180, 240, 1.5]);
  });

  it('should maintain consistent coordinate system', () => {
    const config = createBaseCrateConfig({
      weight: { product: 500 },
      dimensions: { length: 48, width: 36, height: 24 },
    });

    const skidBlocks = calculateSkidBlocks(config);
    const floorboardBlocks = calculateFloorboardBlocks(config);

    // All skids should have Y=0 (centered along depth)
    skidBlocks.forEach((skid) => {
      expect(skid.position[1]).toBe(0);
    });

    // Floorboard should be centered at origin in X and Y
    expect(floorboardBlocks[0].position[0]).toBe(0);
    expect(floorboardBlocks[0].position[1]).toBe(0);

    // Floorboard should be above skids
    const skidTop = skidBlocks[0].position[2] + skidBlocks[0].dimensions[2] / 2;
    const floorboardBottom =
      floorboardBlocks[0].position[2] - floorboardBlocks[0].dimensions[2] / 2;
    expect(floorboardBottom).toBeCloseTo(skidTop, 1);
  });
});
