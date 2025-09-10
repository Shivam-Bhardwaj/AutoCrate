'use client';

import { Box } from '@react-three/drei';
import { Block } from '@/types/crate';
import { SHARED_MATERIALS } from '@/utils/materials';
import { INCH_TO_3D } from '@/utils/geometry/simple-crate-geometry';
import { SkidConfiguration } from '@/utils/skid-calculations';
import { memo } from 'react';

interface SkidsRendererProps {
  skids: Block[];
  skidConfig?: SkidConfiguration;
  crateDepth: number;
  visible: boolean;
  onHover: (component: string, dimensions: [number, number, number], position: [number, number, number]) => void;
  onHoverEnd: () => void;
}

/**
 * Renders skids with proper dimensions and hover info
 */
export const SkidsRenderer = memo(function SkidsRenderer({
  skids,
  skidConfig,
  crateDepth,
  visible,
  onHover,
  onHoverEnd
}: SkidsRendererProps) {
  if (!visible) return null;

  return (
    <>
      {skids.map((block, i) => (
        <Box
          key={`skid-${i}`}
          args={block.dimensions}
          position={block.position}
          material={SHARED_MATERIALS.SKID_WOOD}
          onPointerOver={() => {
            // Show actual lumber dimensions: width × length × height
            const actualWidth = skidConfig ? skidConfig.dimensions.width : 3.5;
            const actualLength = crateDepth; // Skid spans full crate length
            const actualHeight = skidConfig ? skidConfig.dimensions.height : 3.5;
            onHover('Skid', [actualWidth, actualLength, actualHeight], block.position);
          }}
          onPointerOut={onHoverEnd}
        />
      ))}
    </>
  );
});