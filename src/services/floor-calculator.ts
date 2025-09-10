/**
 * Floor board calculation service
 * Arranges standard lumber and custom plywood for optimal floor coverage
 */

import {
  LUMBER_SIZES_DESCENDING,
  FLOOR_CONSTANTS,
  selectLumberForSpace,
  LumberSize
} from '@/utils/lumber-dimensions';

export interface FloorBoard {
  type: 'lumber' | 'plywood';
  nominal?: string;        // e.g., '2x12' for lumber
  width: number;           // Actual width in inches
  thickness: number;       // Always 1.5" for lumber, varies for plywood
  depth: number;           // Length of board (crate depth)
  position: {
    x: number;             // Position from crate center
    y: number;             // Always 0 (runs full depth)
    z: number;             // Floor level (0)
  };
}

export interface FloorConfiguration {
  boards: FloorBoard[];
  totalWidth: number;
  usableWidth: number;
  hasCustomPlywood: boolean;
  gaps: number[];          // Gap sizes between boards
}

/**
 * Calculate optimal floor board arrangement
 * Strategy: Place largest boards on outside, progressively smaller toward center
 */
export function calculateFloorBoards(
  crateWidth: number,
  crateDepth: number
): FloorConfiguration {
  const boards: FloorBoard[] = [];
  const gaps: number[] = [];
  
  // Calculate usable area after edge offsets
  const usableWidth = crateWidth - (2 * FLOOR_CONSTANTS.EDGE_OFFSET);
  
  // Start from left edge (negative X)
  let currentX = -crateWidth / 2 + FLOOR_CONSTANTS.EDGE_OFFSET;
  let remainingWidth = usableWidth;
  
  // Track boards for symmetric arrangement
  const leftBoards: FloorBoard[] = [];
  const rightBoards: FloorBoard[] = [];
  let centerBoard: FloorBoard | null = null;
  
  // Calculate from outside in (symmetric approach)
  let leftX = currentX;
  let rightX = crateWidth / 2 - FLOOR_CONSTANTS.EDGE_OFFSET;
  let centerSpace = usableWidth;
  
  // Place matching pairs from outside in
  while (centerSpace > 0) {
    // Find largest lumber that fits
    const lumber = selectLumberForSpace(centerSpace / 2);
    
    if (lumber && lumber.actual.width * 2 <= centerSpace) {
      // Place symmetric pair
      const leftBoard: FloorBoard = {
        type: 'lumber',
        nominal: lumber.nominal,
        width: lumber.actual.width,
        thickness: FLOOR_CONSTANTS.LUMBER_THICKNESS,
        depth: crateDepth,
        position: {
          x: leftX + lumber.actual.width / 2,
          y: 0,
          z: 0
        }
      };
      
      const rightBoard: FloorBoard = {
        type: 'lumber',
        nominal: lumber.nominal,
        width: lumber.actual.width,
        thickness: FLOOR_CONSTANTS.LUMBER_THICKNESS,
        depth: crateDepth,
        position: {
          x: rightX - lumber.actual.width / 2,
          y: 0,
          z: 0
        }
      };
      
      leftBoards.push(leftBoard);
      rightBoards.unshift(rightBoard); // Add to beginning for proper order
      
      leftX += lumber.actual.width;
      rightX -= lumber.actual.width;
      centerSpace = rightX - leftX;
      
      // Add small gap if there's room
      if (centerSpace > lumber.actual.width * 2 + FLOOR_CONSTANTS.MAX_GAP * 2) {
        leftX += FLOOR_CONSTANTS.MAX_GAP;
        rightX -= FLOOR_CONSTANTS.MAX_GAP;
        centerSpace = rightX - leftX;
        gaps.push(FLOOR_CONSTANTS.MAX_GAP);
      }
    } else if (lumber && lumber.actual.width <= centerSpace) {
      // Single board in center
      centerBoard = {
        type: 'lumber',
        nominal: lumber.nominal,
        width: lumber.actual.width,
        thickness: FLOOR_CONSTANTS.LUMBER_THICKNESS,
        depth: crateDepth,
        position: {
          x: (leftX + rightX) / 2, // Center position
          y: 0,
          z: 0
        }
      };
      centerSpace = 0;
    } else if (centerSpace >= FLOOR_CONSTANTS.MIN_CUSTOM_WIDTH) {
      // Fill with custom plywood
      centerBoard = {
        type: 'plywood',
        width: centerSpace,
        thickness: FLOOR_CONSTANTS.LUMBER_THICKNESS, // Match lumber thickness
        depth: crateDepth,
        position: {
          x: (leftX + rightX) / 2, // Center position
          y: 0,
          z: 0
        }
      };
      centerSpace = 0;
    } else {
      // Small gap, distribute to edges
      break;
    }
  }
  
  // Assemble final board list
  boards.push(...leftBoards);
  if (centerBoard) {
    boards.push(centerBoard);
  }
  boards.push(...rightBoards);
  
  return {
    boards,
    totalWidth: crateWidth,
    usableWidth,
    hasCustomPlywood: boards.some(b => b.type === 'plywood'),
    gaps
  };
}

/**
 * Calculate board layout for a simple uniform approach
 * Used as fallback if symmetric approach doesn't work well
 */
export function calculateUniformFloorBoards(
  crateWidth: number,
  crateDepth: number
): FloorConfiguration {
  const boards: FloorBoard[] = [];
  const gaps: number[] = [];
  
  const usableWidth = crateWidth - (2 * FLOOR_CONSTANTS.EDGE_OFFSET);
  let currentX = -crateWidth / 2 + FLOOR_CONSTANTS.EDGE_OFFSET;
  let remainingWidth = usableWidth;
  
  // Use largest boards that fit uniformly
  const targetBoardCount = Math.floor(usableWidth / 11); // Approximate with 2x12s
  
  if (targetBoardCount > 0) {
    const boardWidth = usableWidth / targetBoardCount;
    const lumber = LUMBER_SIZES_DESCENDING.find(l => l.actual.width <= boardWidth);
    
    if (lumber) {
      const actualBoardWidth = lumber.actual.width;
      const totalBoardWidth = actualBoardWidth * targetBoardCount;
      const totalGaps = usableWidth - totalBoardWidth;
      const gapSize = Math.min(totalGaps / (targetBoardCount - 1), FLOOR_CONSTANTS.MAX_GAP);
      
      for (let i = 0; i < targetBoardCount; i++) {
        boards.push({
          type: 'lumber',
          nominal: lumber.nominal,
          width: actualBoardWidth,
          thickness: FLOOR_CONSTANTS.LUMBER_THICKNESS,
          depth: crateDepth,
          position: {
            x: currentX + actualBoardWidth / 2,
            y: 0,
            z: 0
          }
        });
        
        currentX += actualBoardWidth;
        
        if (i < targetBoardCount - 1) {
          currentX += gapSize;
          gaps.push(gapSize);
        }
      }
    }
  }
  
  // Fill any remaining space with custom plywood
  if (remainingWidth > FLOOR_CONSTANTS.MIN_CUSTOM_WIDTH && boards.length === 0) {
    boards.push({
      type: 'plywood',
      width: remainingWidth,
      thickness: FLOOR_CONSTANTS.LUMBER_THICKNESS,
      depth: crateDepth,
      position: {
        x: 0, // Center
        y: 0,
        z: 0
      }
    });
  }
  
  return {
    boards,
    totalWidth: crateWidth,
    usableWidth,
    hasCustomPlywood: boards.some(b => b.type === 'plywood'),
    gaps
  };
}