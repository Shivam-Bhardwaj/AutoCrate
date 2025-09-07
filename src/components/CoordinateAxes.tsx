'use client';

import { Line, Html } from '@react-three/drei';
import { memo } from 'react';

interface CoordinateAxesProps {
  size?: number;
}

// PERFORMANCE: Memoized coordinate axes to prevent unnecessary re-renders
// These axes don't change frequently and are static geometric elements
export const CoordinateAxes = memo(function CoordinateAxes({ size = 5 }: CoordinateAxesProps) {
  // Update axis labels
  const axesLabels = {
    x: 'Width',
    y: 'Depth',
    z: 'Height',
  };

  // Update axis colors (Z=blue for up)
  const _axesColors = {
    x: 0xff0000, // Red
    y: 0x00ff00, // Green
    z: 0x0000ff, // Blue
  };

  return (
    <group name="coordinate-axes">
      {/* X Axis - Red - Width (horizontal) */}
      <Line
        points={[
          [0, 0, 0],
          [size, 0, 0],
        ]}
        color="red"
        lineWidth={2}
      />
      <Html position={[size + 0.5, 0, 0]} center distanceFactor={10}>
        <div style={{ color: 'red', fontSize: '12px', fontWeight: 'bold' }}>{axesLabels.x}</div>
      </Html>

      {/* Y Axis - Green - Depth (horizontal perpendicular to X) */}
      <Line
        points={[
          [0, 0, 0],
          [0, size, 0],
        ]}
        color="green"
        lineWidth={2}
      />
      <Html position={[0, size + 0.5, 0]} center distanceFactor={10}>
        <div style={{ color: 'green', fontSize: '12px', fontWeight: 'bold' }}>{axesLabels.y}</div>
      </Html>

      {/* Z Axis - Blue - Height (vertical up) */}
      <Line
        points={[
          [0, 0, 0],
          [0, 0, size],
        ]}
        color="blue"
        lineWidth={2}
      />
      <Html position={[0, 0, size + 0.5]} center distanceFactor={10}>
        <div style={{ color: 'blue', fontSize: '12px', fontWeight: 'bold' }}>{axesLabels.z}</div>
      </Html>
    </group>
  );
});
