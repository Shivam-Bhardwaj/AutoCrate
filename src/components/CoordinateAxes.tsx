'use client';

import { Line, Text } from '@react-three/drei';

interface CoordinateAxesProps {
  size?: number;
}

export function CoordinateAxes({ size = 5 }: CoordinateAxesProps) {
  return (
    <group name="coordinate-axes">
      {/* X Axis - Red */}
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

      {/* Y Axis - Green */}
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

      {/* Z Axis - Blue */}
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
}
