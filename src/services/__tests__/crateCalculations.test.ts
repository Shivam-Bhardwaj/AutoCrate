import { describe, it, expect } from 'vitest';
import { calculatePanelBlocks, calculateCleatBlocks } from '../crateCalculations';

describe('crateCalculations', () => {
  describe('calculatePanelBlocks', () => {
    it('should create a single panel for dimensions within plywood limits', () => {
      const blocks = calculatePanelBlocks(96, 48);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].dimensions).toEqual([96, 48, 0.75]);
    });

    it('should create two vertical panels when height is > 48 and <= 96 to minimize splices', () => {
      const blocks = calculatePanelBlocks(96, 96);
      expect(blocks).toHaveLength(2);
      // Logic rotates to use 48" width sheets to avoid a horizontal splice
      expect(blocks[0].dimensions).toEqual([48, 96, 0.75]);
      expect(blocks[1].dimensions).toEqual([48, 96, 0.75]);
    });

    it('should create two vertical panels when width is > 96 and <= 192', () => {
      const blocks = calculatePanelBlocks(100, 48);
      expect(blocks).toHaveLength(2);
      expect(blocks[0].dimensions[0]).toBe(96);
      expect(blocks[1].dimensions[0]).toBe(4);
    });
  });

  describe('calculateCleatBlocks', () => {
    it('should create 4 edge cleats for a simple panel that does not need intermediate cleats', () => {
      // 24" width does not trigger intermediate cleats.
      const blocks = calculateCleatBlocks(24, 48);
      // 4 edge cleats should be the only ones with cleat thickness.
      expect(blocks.filter((b) => b.dimensions[2] === 1.5)).toHaveLength(4);
    });

    it('should add intermediate vertical cleats for wide panels', () => {
      const blocks = calculateCleatBlocks(120, 48);
      // Expect 2 edge vertical cleats + 4 intermediate vertical cleats
      const verticalCleatHeight = 48 - 2 * 3.5;
      expect(blocks.filter((b) => b.dimensions[1] === verticalCleatHeight)).toHaveLength(6);
    });

    it('should add horizontal splice cleats for tall panels', () => {
      const blocks = calculateCleatBlocks(96, 100);
      // 4 edge, 1 splice cleat (in sections)
      const spliceCleats = blocks.filter(
        (b) => b.position[1] !== 100 / 2 - 3.5 / 2 && b.position[1] !== -100 / 2 + 3.5 / 2
      );
      expect(spliceCleats.length).toBeGreaterThan(0);
    });
  });
});
