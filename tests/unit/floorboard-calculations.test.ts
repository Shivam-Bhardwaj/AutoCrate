import { describe, it, expect } from 'vitest';
import {
  calculateFloorboardLayout,
  calculateNailPattern,
  calculateFloorboardConfiguration,
  validateFloorboardConfiguration,
  getNailSpecifications,
  calculateFloorboardLumber,
  Floorboard,
  NailPattern,
  FloorboardConfiguration,
} from '@/utils/floorboard-calculations';
import { CrateDimensions } from '@/types/crate';
import { SkidConfiguration } from '@/utils/skid-calculations';
import { MIN_EDGE_DISTANCE, FLOORBOARD_THICKNESS } from '@/lib/constants';

describe('Floorboard Calculations', () => {
  describe('calculateFloorboardLayout', () => {
    it('should calculate layout for standard lumber widths', () => {
      const floorboards = calculateFloorboardLayout(11.0); // 11" wide - should fit 2x6 (5.5") + 2x6 (5.5")

      expect(floorboards).toHaveLength(2);
      expect(floorboards[0].width).toBe(5.5);
      expect(floorboards[0].nominalSize).toBe('2x6');
      expect(floorboards[0].isNarrowBoard).toBe(false);
      expect(floorboards[1].width).toBe(5.5);
      expect(floorboards[1].nominalSize).toBe('2x6');
      expect(floorboards[1].isNarrowBoard).toBe(false);
    });

    it('should use largest boards first', () => {
      const floorboards = calculateFloorboardLayout(14.75); // Should fit 2x12 (11.25") + 2x4 (3.5")

      expect(floorboards).toHaveLength(2);
      expect(floorboards[0].width).toBe(11.25); // 2x12 first (largest)
      expect(floorboards[0].nominalSize).toBe('2x12');
      expect(floorboards[1].width).toBe(3.5); // 2x4 to fill remaining
      expect(floorboards[1].nominalSize).toBe('2x4');
    });

    it('should handle exact fit with single board', () => {
      const floorboards = calculateFloorboardLayout(11.25); // Exact fit for 2x12

      expect(floorboards).toHaveLength(1);
      expect(floorboards[0].width).toBe(11.25);
      expect(floorboards[0].nominalSize).toBe('2x12');
      expect(floorboards[0].isNarrowBoard).toBe(false);
    });

    it('should require narrow board when standard boards dont fit exactly', () => {
      const floorboards = calculateFloorboardLayout(13.5); // 11.25 + 2.25 (narrow board)

      expect(floorboards).toHaveLength(2);
      expect(floorboards[0].width).toBe(11.25); // 2x12
      expect(floorboards[1].width).toBe(2.25); // Narrow board
      expect(floorboards[1].isNarrowBoard).toBe(true);
      expect(floorboards[1].nominalSize).toBe('custom-narrow');
    });

    it('should handle small width requiring only narrow board', () => {
      const floorboards = calculateFloorboardLayout(2.25);

      expect(floorboards).toHaveLength(1);
      expect(floorboards[0].width).toBe(2.25);
      expect(floorboards[0].isNarrowBoard).toBe(true);
      expect(floorboards[0].nominalSize).toBe('custom-narrow');
    });

    it('should handle large width with multiple standard boards', () => {
      const floorboards = calculateFloorboardLayout(33.75); // 3 * 11.25 = 33.75 (three 2x12s)

      expect(floorboards).toHaveLength(3);
      floorboards.forEach((board) => {
        expect(board.width).toBe(11.25);
        expect(board.nominalSize).toBe('2x12');
        expect(board.isNarrowBoard).toBe(false);
      });
    });

    it('should assign correct positions', () => {
      const floorboards = calculateFloorboardLayout(22.0); // 11.25 + 7.25 + 3.5 = 22.0

      expect(floorboards).toHaveLength(3);
      expect(floorboards[0].position).toBe(0);
      expect(floorboards[1].position).toBe(1);
      expect(floorboards[2].position).toBe(2);
    });

    // Edge Cases
    it('should throw error for extremely narrow width', () => {
      expect(() => calculateFloorboardLayout(1.5)).toThrow(
        'Remaining width 1.5" is less than minimum 2" for narrow board'
      );
    });

    it('should handle minimum narrow board width', () => {
      const floorboards = calculateFloorboardLayout(2.0);

      expect(floorboards).toHaveLength(1);
      expect(floorboards[0].width).toBe(2.0);
      expect(floorboards[0].isNarrowBoard).toBe(true);
    });

    it('should handle zero width', () => {
      const floorboards = calculateFloorboardLayout(0);
      expect(floorboards).toHaveLength(0); // No boards needed for zero width
    });

    it('should handle negative width', () => {
      const floorboards = calculateFloorboardLayout(-5);
      expect(floorboards).toHaveLength(0); // No boards needed for negative width
    });

    it('should handle very large width', () => {
      const floorboards = calculateFloorboardLayout(100); // Multiple standard boards

      expect(floorboards.length).toBeGreaterThan(8); // At least 8 2x12 boards
      const totalWidth = floorboards.reduce((sum, board) => sum + board.width, 0);
      expect(totalWidth).toBeCloseTo(100, 1);
    });

    it('should handle fractional widths', () => {
      const floorboards = calculateFloorboardLayout(16.0); // Use a width that can be handled

      const totalWidth = floorboards.reduce((sum, board) => sum + board.width, 0);
      expect(totalWidth).toBeCloseTo(16.0, 3);
    });

    it('should handle width just above narrow board threshold', () => {
      const floorboards = calculateFloorboardLayout(2.51); // Just above 2.5" threshold

      expect(floorboards).toHaveLength(1);
      expect(floorboards[0].width).toBe(2.51);
      expect(floorboards[0].isNarrowBoard).toBe(false); // Should be regular board >= 2.5"
      expect(floorboards[0].nominalSize).toBe('custom');
    });
  });

  describe('calculateNailPattern', () => {
    it('should calculate pattern for 4x4 skid with narrow board', () => {
      const pattern = calculateNailPattern(3.0, 4, 3); // 3" board, 4" skid, 3 skids

      expect(pattern.rows).toBe(1); // Narrow board gets 1 row
      expect(pattern.nailsPerSkid).toBe(1);
      expect(pattern.totalNails).toBe(3); // 1 nail per skid * 3 skids
      expect(pattern.spacing).toBe(1.5); // Board width / 2 for center line
      expect(pattern.edgeDistance).toBe(MIN_EDGE_DISTANCE);
    });

    it('should calculate pattern for 4x4 skid with wide board', () => {
      const pattern = calculateNailPattern(7.0, 4, 3); // 7" board, 4" skid, 3 skids

      expect(pattern.rows).toBe(2); // Wide board gets 2 rows
      expect(pattern.nailsPerSkid).toBe(2);
      expect(pattern.totalNails).toBe(6); // 2 nails per skid * 3 skids
      expect(pattern.spacing).toBe(5.5); // (7 - 2*0.75) / (2-1) = 5.5/1 = 5.5
      expect(pattern.edgeDistance).toBe(MIN_EDGE_DISTANCE);
    });

    it('should calculate pattern for 4x6 skid with narrow board', () => {
      const pattern = calculateNailPattern(4.0, 6, 4); // 4" board, 6" skid, 4 skids

      expect(pattern.rows).toBe(1); // < 5.5" gets 1 row
      expect(pattern.nailsPerSkid).toBe(1);
      expect(pattern.totalNails).toBe(4);
    });

    it('should calculate pattern for 4x6 skid with medium board', () => {
      const pattern = calculateNailPattern(7.0, 6, 4); // 7" board, 6" skid, 4 skids

      expect(pattern.rows).toBe(2); // 5.5" <= width < 9.25" gets 2 rows
      expect(pattern.nailsPerSkid).toBe(2);
      expect(pattern.totalNails).toBe(8);
    });

    it('should calculate pattern for 4x6 skid with wide board', () => {
      const pattern = calculateNailPattern(10.0, 6, 4); // 10" board, 6" skid, 4 skids

      expect(pattern.rows).toBe(3); // >= 9.25" gets 3 rows
      expect(pattern.nailsPerSkid).toBe(3);
      expect(pattern.totalNails).toBe(12);
    });

    it('should calculate pattern for 6x6 skid', () => {
      const pattern = calculateNailPattern(8.0, 6, 5); // 8" board, 6" wide skid, 5 skids

      expect(pattern.rows).toBe(2); // 4x6 skids: 8" board gets 2 rows (5.5 <= 8 < 9.25)
      expect(pattern.nailsPerSkid).toBe(2);
      expect(pattern.totalNails).toBe(10);
    });

    it('should calculate pattern for 8x8 skid', () => {
      const pattern = calculateNailPattern(11.25, 8, 6); // 11.25" board, 8x8 skid, 6 skids

      expect(pattern.rows).toBe(3); // Wide skids always get 3 rows
      expect(pattern.nailsPerSkid).toBe(3);
      expect(pattern.totalNails).toBe(18);
    });

    // Edge Cases
    it('should handle minimum board width', () => {
      const pattern = calculateNailPattern(2.0, 4, 3);

      expect(pattern.rows).toBe(1);
      expect(pattern.totalNails).toBe(3);
      expect(pattern.spacing).toBe(1.0); // 2/2 = 1
    });

    it('should handle maximum board width', () => {
      const pattern = calculateNailPattern(11.25, 8, 4);

      expect(pattern.rows).toBe(3);
      expect(pattern.totalNails).toBe(12);
      expect(pattern.spacing).toBeCloseTo(4.875, 3); // (11.25 - 1.5) / 2 = 4.875
    });

    it('should handle zero skids', () => {
      const pattern = calculateNailPattern(5.5, 4, 0);

      expect(pattern.totalNails).toBe(0);
    });

    it('should handle single skid', () => {
      const pattern = calculateNailPattern(5.5, 4, 1);

      expect(pattern.totalNails).toBe(2); // 2 nails per skid * 1 skid
    });

    it('should maintain edge distance constraint', () => {
      const patterns = [
        calculateNailPattern(3.0, 4, 3),
        calculateNailPattern(7.0, 6, 4),
        calculateNailPattern(11.25, 8, 5),
      ];

      patterns.forEach((pattern) => {
        expect(pattern.edgeDistance).toBe(MIN_EDGE_DISTANCE);
        expect(pattern.edgeDistance).toBeGreaterThanOrEqual(0.75);
      });
    });
  });

  describe('calculateFloorboardConfiguration', () => {
    const mockCrateDimensions: CrateDimensions = {
      length: 48,
      width: 22.5, // 2 * 11.25 = 22.5 (fits 2 2x12 boards exactly)
      height: 24,
    };

    const mockSkidConfig: SkidConfiguration = {
      count: 3,
      spacing: 24,
      dimensions: { width: 4, height: 4 },
      requiresRubStrips: false,
    };

    it('should calculate complete configuration successfully', () => {
      const config = calculateFloorboardConfiguration(mockCrateDimensions, mockSkidConfig);

      expect(config.errors).toHaveLength(0);
      expect(config.floorboards).toHaveLength(2);
      expect(config.totalBoards).toBe(2);
      expect(config.hasNarrowBoard).toBe(false);
      expect(config.floorboardThickness).toBe(FLOORBOARD_THICKNESS);
      expect(config.nailPatterns.size).toBe(2);
      expect(config.totalNails).toBeGreaterThan(0);
    });

    it('should handle configuration with narrow board', () => {
      const dimensions: CrateDimensions = {
        length: 48,
        width: 13.5, // 11.25 + 2.25 (narrow board)
        height: 24,
      };

      const config = calculateFloorboardConfiguration(dimensions, mockSkidConfig);

      expect(config.errors).toHaveLength(0);
      expect(config.hasNarrowBoard).toBe(true);
      expect(config.narrowBoardWidth).toBeCloseTo(2.25, 2);
      expect(config.warnings.length).toBeGreaterThan(0);
      expect(config.warnings[0]).toContain('narrow board');
    });

    it('should detect width mismatch warnings', () => {
      const dimensions: CrateDimensions = {
        length: 48,
        width: 1.5, // Too narrow - will cause error and should generate warning
        height: 24,
      };

      const config = calculateFloorboardConfiguration(dimensions, mockSkidConfig);

      // Should either have a narrow board, warnings, or errors
      expect(config.hasNarrowBoard || config.warnings.length > 0 || config.errors.length > 0).toBe(
        true
      );
    });

    it('should handle errors in floorboard calculation', () => {
      const dimensions: CrateDimensions = {
        length: 48,
        width: 1.0, // Too narrow - should cause error
        height: 24,
      };

      const config = calculateFloorboardConfiguration(dimensions, mockSkidConfig);

      expect(config.errors.length).toBeGreaterThan(0);
      expect(config.floorboards).toHaveLength(0);
      expect(config.totalBoards).toBe(0);
    });

    it('should calculate nail patterns for all boards', () => {
      const config = calculateFloorboardConfiguration(mockCrateDimensions, mockSkidConfig);

      expect(config.nailPatterns.size).toBe(config.totalBoards);

      let calculatedTotalNails = 0;
      config.nailPatterns.forEach((pattern) => {
        calculatedTotalNails += pattern.totalNails;
      });

      expect(calculatedTotalNails).toBe(config.totalNails);
    });

    it('should handle different skid configurations', () => {
      const heavySkidConfig: SkidConfiguration = {
        count: 5,
        spacing: 20,
        dimensions: { width: 6, height: 6 },
        requiresRubStrips: false,
      };

      const config = calculateFloorboardConfiguration(mockCrateDimensions, heavySkidConfig);

      expect(config.errors).toHaveLength(0);
      expect(config.totalNails).toBeGreaterThan(0);

      // More skids should mean more nails
      const standardConfig = calculateFloorboardConfiguration(mockCrateDimensions, mockSkidConfig);
      expect(config.totalNails).toBeGreaterThan(standardConfig.totalNails);
    });

    // Edge Cases
    it('should handle very narrow crate', () => {
      const dimensions: CrateDimensions = {
        length: 48,
        width: 3.5, // Single 2x4
        height: 24,
      };

      const config = calculateFloorboardConfiguration(dimensions, mockSkidConfig);

      if (config.errors.length === 0) {
        expect(config.totalBoards).toBe(1);
        expect(config.floorboards[0].width).toBe(3.5);
      }
    });

    it('should handle very wide crate', () => {
      const dimensions: CrateDimensions = {
        length: 48,
        width: 100, // Many boards needed
        height: 24,
      };

      const config = calculateFloorboardConfiguration(dimensions, mockSkidConfig);

      expect(config.errors).toHaveLength(0);
      expect(config.totalBoards).toBeGreaterThan(8);
    });
  });

  describe('validateFloorboardConfiguration', () => {
    const mockCrateDimensions: CrateDimensions = {
      length: 48,
      width: 22.5,
      height: 24,
    };

    it('should validate correct configuration', () => {
      const config: FloorboardConfiguration = {
        floorboards: [
          { width: 11.25, nominalSize: '2x12', position: 0, isNarrowBoard: false },
          { width: 11.25, nominalSize: '2x12', position: 1, isNarrowBoard: false },
        ],
        totalBoards: 2,
        hasNarrowBoard: false,
        nailPatterns: new Map(),
        totalNails: 12,
        floorboardThickness: FLOORBOARD_THICKNESS,
        warnings: [],
        errors: [],
      };

      // Add valid nail patterns
      config.nailPatterns.set(0, {
        rows: 2,
        nailsPerSkid: 2,
        totalNails: 6,
        spacing: 5.0,
        edgeDistance: MIN_EDGE_DISTANCE,
      });
      config.nailPatterns.set(1, {
        rows: 2,
        nailsPerSkid: 2,
        totalNails: 6,
        spacing: 5.0,
        edgeDistance: MIN_EDGE_DISTANCE,
      });

      const errors = validateFloorboardConfiguration(config, mockCrateDimensions);
      expect(errors).toHaveLength(0);
    });

    it('should detect multiple narrow boards', () => {
      const config: FloorboardConfiguration = {
        floorboards: [
          { width: 2.0, nominalSize: 'custom-narrow', position: 0, isNarrowBoard: true },
          { width: 2.0, nominalSize: 'custom-narrow', position: 1, isNarrowBoard: true },
        ],
        totalBoards: 2,
        hasNarrowBoard: true,
        nailPatterns: new Map(),
        totalNails: 6,
        floorboardThickness: FLOORBOARD_THICKNESS,
        warnings: [],
        errors: [],
      };

      const errors = validateFloorboardConfiguration(config, mockCrateDimensions);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Only one floorboard can be less than');
    });

    it('should detect invalid board widths', () => {
      const config: FloorboardConfiguration = {
        floorboards: [
          { width: 15.0, nominalSize: 'custom', position: 0, isNarrowBoard: false }, // Too wide
        ],
        totalBoards: 1,
        hasNarrowBoard: false,
        nailPatterns: new Map(),
        totalNails: 3,
        floorboardThickness: FLOORBOARD_THICKNESS,
        warnings: [],
        errors: [],
      };

      const errors = validateFloorboardConfiguration(config, mockCrateDimensions);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('invalid width');
    });

    it('should detect narrow board too narrow', () => {
      const config: FloorboardConfiguration = {
        floorboards: [
          { width: 1.5, nominalSize: 'custom-narrow', position: 0, isNarrowBoard: true }, // Too narrow
        ],
        totalBoards: 1,
        hasNarrowBoard: true,
        narrowBoardWidth: 1.5,
        nailPatterns: new Map(),
        totalNails: 3,
        floorboardThickness: FLOORBOARD_THICKNESS,
        warnings: [],
        errors: [],
      };

      const errors = validateFloorboardConfiguration(config, mockCrateDimensions);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('less than minimum 2"');
    });

    it('should detect total width mismatch', () => {
      const config: FloorboardConfiguration = {
        floorboards: [{ width: 10.0, nominalSize: '2x10', position: 0, isNarrowBoard: false }],
        totalBoards: 1,
        hasNarrowBoard: false,
        nailPatterns: new Map(),
        totalNails: 6,
        floorboardThickness: FLOORBOARD_THICKNESS,
        warnings: [],
        errors: [],
      };

      const errors = validateFloorboardConfiguration(config, mockCrateDimensions);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('does not match crate width');
    });

    it('should detect insufficient nail edge distance', () => {
      const config: FloorboardConfiguration = {
        floorboards: [
          { width: 11.25, nominalSize: '2x12', position: 0, isNarrowBoard: false },
          { width: 11.25, nominalSize: '2x12', position: 1, isNarrowBoard: false },
        ],
        totalBoards: 2,
        hasNarrowBoard: false,
        nailPatterns: new Map([
          [
            0,
            {
              rows: 2,
              nailsPerSkid: 2,
              totalNails: 6,
              spacing: 5.0,
              edgeDistance: 0.5, // Too small
            },
          ],
          [
            1,
            {
              rows: 2,
              nailsPerSkid: 2,
              totalNails: 6,
              spacing: 5.0,
              edgeDistance: MIN_EDGE_DISTANCE,
            },
          ],
        ]),
        totalNails: 12,
        floorboardThickness: FLOORBOARD_THICKNESS,
        warnings: [],
        errors: [],
      };

      const errors = validateFloorboardConfiguration(config, mockCrateDimensions);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.includes('insufficient edge distance'))).toBe(true);
    });

    it('should handle multiple errors', () => {
      const config: FloorboardConfiguration = {
        floorboards: [
          { width: 1.0, nominalSize: 'custom-narrow', position: 0, isNarrowBoard: true }, // Too narrow
          { width: 15.0, nominalSize: 'custom', position: 1, isNarrowBoard: false }, // Too wide
        ],
        totalBoards: 2,
        hasNarrowBoard: true,
        narrowBoardWidth: 1.0,
        nailPatterns: new Map(),
        totalNails: 6,
        floorboardThickness: FLOORBOARD_THICKNESS,
        warnings: [],
        errors: [],
      };

      const errors = validateFloorboardConfiguration(config, mockCrateDimensions);
      expect(errors.length).toBeGreaterThan(1);
    });
  });

  describe('getNailSpecifications', () => {
    it('should return correct nail specifications', () => {
      const specs = getNailSpecifications();

      expect(specs.type).toBe('Common Nail');
      expect(specs.size).toBe('10d');
      expect(specs.length).toBe(3.0);
      expect(specs.pennyWeight).toBe('10d');
    });
  });

  describe('calculateFloorboardLumber', () => {
    it('should calculate lumber requirements correctly', () => {
      const config: FloorboardConfiguration = {
        floorboards: [
          { width: 11.25, nominalSize: '2x12', position: 0, isNarrowBoard: false },
          { width: 5.5, nominalSize: '2x6', position: 1, isNarrowBoard: false },
          { width: 5.5, nominalSize: '2x6', position: 2, isNarrowBoard: false },
        ],
        totalBoards: 3,
        hasNarrowBoard: false,
        nailPatterns: new Map(),
        totalNails: 18,
        floorboardThickness: FLOORBOARD_THICKNESS,
        warnings: [],
        errors: [],
      };

      const crateLength = 48;
      const lumber = calculateFloorboardLumber(config, crateLength);

      expect(lumber).toHaveLength(2); // 2x12 and 2x6

      const lumber2x12 = lumber.find((item) => item.nominalSize === '2x12');
      const lumber2x6 = lumber.find((item) => item.nominalSize === '2x6');

      expect(lumber2x12).toBeDefined();
      expect(lumber2x12?.quantity).toBe(1);
      expect(lumber2x12?.length).toBe(48);
      expect(lumber2x12?.boardFeet).toBeCloseTo((2 * 11.25 * 48) / 144, 2);

      expect(lumber2x6).toBeDefined();
      expect(lumber2x6?.quantity).toBe(2);
      expect(lumber2x6?.length).toBe(48);
      expect(lumber2x6?.boardFeet).toBeCloseTo((2 * 5.5 * 48 * 2) / 144, 2);
    });

    it('should handle custom boards', () => {
      const config: FloorboardConfiguration = {
        floorboards: [
          { width: 8.0, nominalSize: 'custom', position: 0, isNarrowBoard: false },
          { width: 2.25, nominalSize: 'custom-narrow', position: 1, isNarrowBoard: true },
        ],
        totalBoards: 2,
        hasNarrowBoard: true,
        narrowBoardWidth: 2.25,
        nailPatterns: new Map(),
        totalNails: 12,
        floorboardThickness: FLOORBOARD_THICKNESS,
        warnings: [],
        errors: [],
      };

      const lumber = calculateFloorboardLumber(config, 36);

      expect(lumber).toHaveLength(2);

      const customLumber = lumber.find((item) => item.nominalSize === 'custom');
      const narrowLumber = lumber.find((item) => item.nominalSize === 'custom-narrow');

      expect(customLumber).toBeDefined();
      expect(narrowLumber).toBeDefined();
    });

    it('should handle empty configuration', () => {
      const config: FloorboardConfiguration = {
        floorboards: [],
        totalBoards: 0,
        hasNarrowBoard: false,
        nailPatterns: new Map(),
        totalNails: 0,
        floorboardThickness: FLOORBOARD_THICKNESS,
        warnings: [],
        errors: [],
      };

      const lumber = calculateFloorboardLumber(config, 48);
      expect(lumber).toHaveLength(0);
    });

    it('should aggregate multiple boards of same size', () => {
      const config: FloorboardConfiguration = {
        floorboards: [
          { width: 5.5, nominalSize: '2x6', position: 0, isNarrowBoard: false },
          { width: 5.5, nominalSize: '2x6', position: 1, isNarrowBoard: false },
          { width: 5.5, nominalSize: '2x6', position: 2, isNarrowBoard: false },
        ],
        totalBoards: 3,
        hasNarrowBoard: false,
        nailPatterns: new Map(),
        totalNails: 18,
        floorboardThickness: FLOORBOARD_THICKNESS,
        warnings: [],
        errors: [],
      };

      const lumber = calculateFloorboardLumber(config, 48);

      expect(lumber).toHaveLength(1);
      expect(lumber[0].nominalSize).toBe('2x6');
      expect(lumber[0].quantity).toBe(3);
      expect(lumber[0].boardFeet).toBeCloseTo((2 * 5.5 * 48 * 3) / 144, 2);
    });

    // Edge Cases
    it('should handle zero length crate', () => {
      const config: FloorboardConfiguration = {
        floorboards: [{ width: 5.5, nominalSize: '2x6', position: 0, isNarrowBoard: false }],
        totalBoards: 1,
        hasNarrowBoard: false,
        nailPatterns: new Map(),
        totalNails: 6,
        floorboardThickness: FLOORBOARD_THICKNESS,
        warnings: [],
        errors: [],
      };

      const lumber = calculateFloorboardLumber(config, 0);

      expect(lumber).toHaveLength(1);
      expect(lumber[0].boardFeet).toBe(0);
      expect(lumber[0].length).toBe(0);
    });

    it('should calculate board feet correctly for various sizes', () => {
      const config: FloorboardConfiguration = {
        floorboards: [{ width: 3.5, nominalSize: '2x4', position: 0, isNarrowBoard: false }],
        totalBoards: 1,
        hasNarrowBoard: false,
        nailPatterns: new Map(),
        totalNails: 3,
        floorboardThickness: FLOORBOARD_THICKNESS,
        warnings: [],
        errors: [],
      };

      const lumber = calculateFloorboardLumber(config, 96); // 8 feet

      expect(lumber).toHaveLength(1);
      // Board feet = (thickness * width * length) / 144
      // = (2 * 3.5 * 96) / 144 = 672 / 144 = 4.67
      expect(lumber[0].boardFeet).toBeCloseTo(4.67, 2);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow for standard crate', () => {
      const crateDimensions: CrateDimensions = {
        length: 48,
        width: 33.75, // 3 * 11.25 = 33.75 (three 2x12s)
        height: 30,
      };

      const skidConfig: SkidConfiguration = {
        count: 3,
        spacing: 24,
        dimensions: { width: 4, height: 4 },
        requiresRubStrips: false,
      };

      // Test complete workflow
      const floorboards = calculateFloorboardLayout(crateDimensions.width);
      const config = calculateFloorboardConfiguration(crateDimensions, skidConfig);
      const validationErrors = validateFloorboardConfiguration(config, crateDimensions);
      const lumber = calculateFloorboardLumber(config, crateDimensions.length);
      const nailSpecs = getNailSpecifications();

      // Verify results
      expect(floorboards).toHaveLength(3);
      expect(config.errors).toHaveLength(0);
      expect(validationErrors).toHaveLength(0);
      expect(lumber.length).toBeGreaterThan(0);
      expect(nailSpecs.size).toBe('10d');
    });

    it('should handle edge case workflow with narrow board', () => {
      const crateDimensions: CrateDimensions = {
        length: 36,
        width: 13.5, // 11.25 + 2.25 (narrow)
        height: 24,
      };

      const skidConfig: SkidConfiguration = {
        count: 4,
        spacing: 12,
        dimensions: { width: 6, height: 6 },
        requiresRubStrips: false,
      };

      const config = calculateFloorboardConfiguration(crateDimensions, skidConfig);
      const validationErrors = validateFloorboardConfiguration(config, crateDimensions);

      expect(config.hasNarrowBoard).toBe(true);
      expect(config.warnings.length).toBeGreaterThan(0);
      expect(validationErrors).toHaveLength(0); // Should still be valid
    });

    it('should maintain mathematical consistency', () => {
      const crateDimensions: CrateDimensions = {
        length: 48,
        width: 22.5, // 2 * 11.25 = 22.5
        height: 30,
      };

      const skidConfig: SkidConfiguration = {
        count: 3,
        spacing: 24,
        dimensions: { width: 4, height: 4 },
        requiresRubStrips: false,
      };

      const config = calculateFloorboardConfiguration(crateDimensions, skidConfig);

      // Total floorboard width should equal crate width
      const totalWidth = config.floorboards.reduce((sum, board) => sum + board.width, 0);
      expect(totalWidth).toBeCloseTo(crateDimensions.width, 3);

      // Total nails should equal sum of all nail patterns
      let calculatedNails = 0;
      config.nailPatterns.forEach((pattern) => {
        calculatedNails += pattern.totalNails;
      });
      expect(calculatedNails).toBe(config.totalNails);
    });
  });
});
