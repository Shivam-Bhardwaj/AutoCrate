'use client';

import { Box } from '@react-three/drei';
import { Block } from '@/types/crate';
import { SHARED_MATERIALS } from '@/utils/materials';
import { memo } from 'react';

interface CleatsRendererProps {
  cleats: Block[];
  visible: boolean;
  onHover: (component: string, dimensions: [number, number, number], position: [number, number, number]) => void;
  onHoverEnd: () => void;
}

/**
 * Renders cleats (corner supports)
 */
export const CleatsRenderer = memo(function CleatsRenderer({
  cleats,
  visible,
  onHover,
  onHoverEnd
}: CleatsRendererProps) {
  if (!visible) return null;

  return (
    <>
      {cleats.map((block, i) => (
        <Box
          key={`cleat-${i}`}
          args={block.dimensions}
          position={block.position}
          material={SHARED_MATERIALS.CLEAT_WOOD}
          onPointerOver={() => onHover('Cleat', block.dimensions, block.position)}
          onPointerOut={onHoverEnd}
        />
      ))}
    </>
  );
});