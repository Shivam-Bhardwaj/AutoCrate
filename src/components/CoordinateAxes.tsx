'use client';

import { Line, Text } from '@react-three/drei';
import { memo } from 'react';

interface CoordinateAxesProps {
  size?: number;
}

// PERFORMANCE: Memoized coordinate axes to prevent unnecessary re-renders
// These axes don't change frequently and are static geometric elements
export const CoordinateAxes = memo(function CoordinateAxes({ size = 5 }: CoordinateAxesProps) {
  return (
    <group name="coordinate-axes">
      {/* X Axis - Red - Length (horizontal) */}
      <Line
        points={[
          [0, 0, 0],
          [size, 0, 0],
        ]}
        color="red"
        lineWidth={2}
      />
      <Text position={[size + 0.5, 0, 0]} color="red" fontSize={0.3}>
        X (Length)
      </Text>

      {/* Y Axis - Green - Height (vertical) */}
      <Line
        points={[
          [0, 0, 0],
          [0, size, 0],
        ]}
        color="green"
        lineWidth={2}
      />
      <Text position={[0, size + 0.5, 0]} color="green" fontSize={0.3}>
        Y (Height)
      </Text>

      {/* Z Axis - Blue - Width/Depth (horizontal towards camera) */}
      <Line
        points={[
          [0, 0, 0],
          [0, 0, size],
        ]}
        color="blue"
        lineWidth={2}
      />
      <Text position={[0, 0, size + 0.5]} color="blue" fontSize={0.3}>
        Z (Width)
      </Text>
    </group>
  );
});
