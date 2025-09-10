'use client';

import { Box } from '@react-three/drei';
import { Block } from '@/types/crate';
import { SHARED_MATERIALS } from '@/utils/materials';
import { INCH_TO_3D } from '@/utils/geometry/simple-crate-geometry';
import { memo } from 'react';

interface FloorRendererProps {
  floorBoards: Block[];
  visible: boolean;
  onHover: (component: string, dimensions: [number, number, number], position: [number, number, number]) => void;
  onHoverEnd: () => void;
}

/**
 * Renders individual floor boards with proper materials
 */
export const FloorRenderer = memo(function FloorRenderer({
  floorBoards,
  visible,
  onHover,
  onHoverEnd
}: FloorRendererProps) {
  if (!visible) return null;

  return (
    <>
      {floorBoards.map((board, i) => (
        <Box
          key={`floorboard-${i}`}
          args={board.dimensions}
          position={board.position}
          material={SHARED_MATERIALS.FLOORBOARD_STANDARD}
          onPointerOver={() => {
            // Convert back to inches for display
            const widthInches = board.dimensions[0] / INCH_TO_3D;
            const depthInches = board.dimensions[1] / INCH_TO_3D;
            const thicknessInches = board.dimensions[2] / INCH_TO_3D;
            
            // Determine board type based on dimensions
            const boardType = widthInches > 11 ? 'Floor Board (2x12)' :
                            widthInches > 9 ? 'Floor Board (2x10)' :
                            widthInches > 7 ? 'Floor Board (2x8)' :
                            widthInches > 5 ? 'Floor Board (2x6)' :
                            widthInches > 3 ? 'Floor Board (2x4)' :
                            'Floor Board (Custom)';
            
            onHover(boardType, [widthInches, depthInches, thicknessInches], board.position);
          }}
          onPointerOut={onHoverEnd}
        />
      ))}
    </>
  );
});