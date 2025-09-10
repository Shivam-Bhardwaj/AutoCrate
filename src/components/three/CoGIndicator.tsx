'use client';

import { Sphere, Html } from '@react-three/drei';
import { INCH_TO_3D } from '@/utils/geometry/simple-crate-geometry';
import { memo } from 'react';
import { CrateConfiguration } from '@/types/crate';

interface CoGIndicatorProps {
  config: CrateConfiguration;
  cogStability?: {
    isStable: boolean;
    stabilityScore: number;
  } | null;
  visible: boolean;
  onHover: (component: string, dimensions: [number, number, number], position: [number, number, number]) => void;
  onHoverEnd: () => void;
}

/**
 * Renders Center of Gravity indicator with stability color coding
 */
export const CoGIndicator = memo(function CoGIndicator({
  config,
  cogStability,
  visible,
  onHover,
  onHoverEnd
}: CoGIndicatorProps) {
  if (!visible || !config.centerOfGravity?.combinedCoG) return null;

  const cog = config.centerOfGravity.combinedCoG;
  const position: [number, number, number] = [
    cog.x * INCH_TO_3D,
    cog.y * INCH_TO_3D,
    cog.z * INCH_TO_3D,
  ];

  // Determine color based on stability
  const color = cogStability?.isStable
    ? '#22c55e' // green for stable
    : cogStability && cogStability.stabilityScore > 50
      ? '#eab308' // yellow for caution
      : '#ef4444'; // red for unstable

  const emissiveColor = cogStability?.isStable
    ? '#166534' // dark green
    : cogStability && cogStability.stabilityScore > 50
      ? '#a16207' // dark yellow
      : '#991b1b'; // dark red

  return (
    <group>
      <Sphere
        args={[4 * INCH_TO_3D]} // 4 inch radius sphere
        position={position}
        onPointerOver={() => onHover('Center of Gravity', [8, 8, 8], position)}
        onPointerOut={onHoverEnd}
      >
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={0.2}
        />
      </Sphere>

      {/* CoG Label */}
      <Html
        position={[
          cog.x * INCH_TO_3D,
          cog.y * INCH_TO_3D,
          (cog.z + 8) * INCH_TO_3D,
        ]}
        center
        distanceFactor={10}
      >
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            padding: '4px 8px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            border: `2px solid ${color}`,
          }}
        >
          <div>Center of Gravity</div>
          <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.9 }}>
            X: {cog.x.toFixed(1)}&quot; Y: {cog.y.toFixed(1)}&quot; Z: {cog.z.toFixed(1)}&quot;
          </div>
          {cogStability && (
            <div style={{ fontSize: '10px', marginTop: '2px', color }}>
              {cogStability.isStable ? 'STABLE' : `CAUTION (${cogStability.stabilityScore}%)`}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
});