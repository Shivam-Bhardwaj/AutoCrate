'use client';

import { Box, Html } from '@react-three/drei';
import { SHARED_MATERIALS } from '@/utils/materials';
import { PANEL_THICKNESS, INCH_TO_3D } from '@/utils/geometry/simple-crate-geometry';
import { memo } from 'react';
import { CrateConfiguration } from '@/types/crate';

interface PanelData {
  dimensions: [number, number, number];
  position: [number, number, number];
}

interface PanelsRendererProps {
  panels: {
    front: PanelData;
    back: PanelData;
    left: PanelData;
    right: PanelData;
    top: PanelData;
  };
  config: CrateConfiguration;
  explodeFactor: number;
  visible: boolean;
  showFaceLabels: boolean;
  onHover: (component: string, dimensions: [number, number, number], position: [number, number, number]) => void;
  onHoverEnd: () => void;
}

/**
 * Renders all crate panels with face labels
 */
export const PanelsRenderer = memo(function PanelsRenderer({
  panels,
  config,
  explodeFactor,
  visible,
  showFaceLabels,
  onHover,
  onHoverEnd
}: PanelsRendererProps) {
  if (!visible) return null;

  // Calculate exploded positions
  const explodeDistance = 2 * INCH_TO_3D;
  const factor = explodeFactor / 100;

  const frontPosition: [number, number, number] = [
    panels.front.position[0],
    panels.front.position[1] + factor * explodeDistance,
    panels.front.position[2]
  ];

  const backPosition: [number, number, number] = [
    panels.back.position[0],
    panels.back.position[1] - factor * explodeDistance,
    panels.back.position[2]
  ];

  const leftPosition: [number, number, number] = [
    panels.left.position[0] - factor * explodeDistance,
    panels.left.position[1],
    panels.left.position[2]
  ];

  const rightPosition: [number, number, number] = [
    panels.right.position[0] + factor * explodeDistance,
    panels.right.position[1],
    panels.right.position[2]
  ];

  const topPosition: [number, number, number] = [
    panels.top.position[0],
    panels.top.position[1],
    panels.top.position[2] + factor * explodeDistance
  ];

  // Calculate font size for face label
  const { width, length, height } = config.dimensions;
  const maxDim = Math.max(width, length, height);
  const fontSize = Math.max(8, Math.min(16, 8 + (maxDim / 100) * 2));
  const distanceFactor = Math.max(10, Math.min(20, 10 + (maxDim / 50) * 2));

  return (
    <>
      {/* Front Panel */}
      <Box
        args={panels.front.dimensions}
        position={frontPosition}
        material={SHARED_MATERIALS.SIDE_PANEL}
        onPointerOver={() => onHover('Front Panel', panels.front.dimensions, frontPosition)}
        onPointerOut={onHoverEnd}
      />

      {/* Back Panel */}
      <Box
        args={panels.back.dimensions}
        position={backPosition}
        material={SHARED_MATERIALS.SIDE_PANEL}
        onPointerOver={() => onHover('Back Panel', panels.back.dimensions, backPosition)}
        onPointerOut={onHoverEnd}
      />

      {/* Left Panel */}
      <Box
        args={panels.left.dimensions}
        position={leftPosition}
        material={SHARED_MATERIALS.SIDE_PANEL}
        onPointerOver={() => onHover('Left Panel', panels.left.dimensions, leftPosition)}
        onPointerOut={onHoverEnd}
      />

      {/* Right Panel */}
      <Box
        args={panels.right.dimensions}
        position={rightPosition}
        material={SHARED_MATERIALS.SIDE_PANEL}
        onPointerOver={() => onHover('Right Panel', panels.right.dimensions, rightPosition)}
        onPointerOut={onHoverEnd}
      />

      {/* Top Panel */}
      <Box
        args={panels.top.dimensions}
        position={topPosition}
        material={SHARED_MATERIALS.SIDE_PANEL}
        onPointerOver={() => onHover('Top Panel', panels.top.dimensions, topPosition)}
        onPointerOut={onHoverEnd}
      />

      {/* Front Face Label */}
      {showFaceLabels && (
        <Html
          position={[0, (PANEL_THICKNESS / 2) * INCH_TO_3D, (height / 2) * INCH_TO_3D]}
          center
          distanceFactor={distanceFactor}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#1f2937',
              fontSize: `${fontSize}px`,
              fontWeight: '600',
              padding: '2px 6px',
              borderRadius: '3px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              whiteSpace: 'nowrap',
              border: '1px solid rgba(0,0,0,0.1)',
              transform: 'rotateX(-5deg)',
            }}
          >
            FRONT
          </div>
        </Html>
      )}
    </>
  );
});