'use client';

import { Line, Html } from '@react-three/drei';
import { memo } from 'react';
import { INCHES_TO_MM, MM_TO_METERS } from '@/lib/constants';

interface MeasurementLinesProps {
  width: number; // in inches
  depth: number; // in inches
  height: number; // in inches
  visible?: boolean;
}

export const MeasurementLines = memo(function MeasurementLines({
  width,
  depth,
  height,
  visible = true,
}: MeasurementLinesProps) {
  if (!visible) return null;

  // Convert dimensions to 3D units
  const w = (width * INCHES_TO_MM) / MM_TO_METERS;
  const d = (depth * INCHES_TO_MM) / MM_TO_METERS;
  const h = (height * INCHES_TO_MM) / MM_TO_METERS;

  // Calculate proportional sizes based on crate dimensions
  const maxDim = Math.max(width, depth, height);
  const minDim = Math.min(width, depth, height);

  // Scale offset based on crate size (2-5% of max dimension)
  const offset = Math.max(0.15, Math.min(0.5, ((maxDim * INCHES_TO_MM) / MM_TO_METERS) * 0.04));

  // Scale arrow size proportionally (1-2% of min dimension)
  const arrowSize = Math.max(0.03, Math.min(0.1, ((minDim * INCHES_TO_MM) / MM_TO_METERS) * 0.015));

  const lineWidth = 1.5;
  const textColor = '#1f2937';
  const lineColor = '#6b7280';

  // Calculate font size based on crate dimensions (8-16px)
  const baseFontSize = Math.max(8, Math.min(16, 8 + (maxDim / 50) * 4));
  const distanceFactor = Math.max(5, Math.min(12, 5 + (maxDim / 100) * 7));

  return (
    <group name="measurements">
      {/* Width Measurement (X-axis) */}
      <group position={[0, -d / 2, 0]}>
        {/* Main line */}
        <Line
          points={[
            [-w / 2, 0, 0],
            [w / 2, 0, 0],
          ]}
          color={lineColor}
          lineWidth={lineWidth}
        />
        {/* End caps */}
        <Line
          points={[
            [-w / 2, -arrowSize, 0],
            [-w / 2, arrowSize, 0],
          ]}
          color={lineColor}
          lineWidth={lineWidth}
        />
        <Line
          points={[
            [w / 2, -arrowSize, 0],
            [w / 2, arrowSize, 0],
          ]}
          color={lineColor}
          lineWidth={lineWidth}
        />
        {/* Label */}
        <Html position={[0, 0, 0]} center distanceFactor={distanceFactor}>
          <div
            style={{
              color: textColor,
              fontSize: `${baseFontSize}px`,
              fontWeight: '600',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '3px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            {width}&quot;
          </div>
        </Html>
      </group>

      {/* Depth Measurement (Y-axis) */}
      <group position={[-w / 2 - offset, -d / 2, 0]}>
        {/* Main line - from front (y=0) to back (y=-d) */}
        <Line
          points={[
            [0, 0, 0],
            [0, -d, 0],
          ]}
          color={lineColor}
          lineWidth={lineWidth}
        />
        {/* End caps */}
        <Line
          points={[
            [-arrowSize, 0, 0],
            [arrowSize, 0, 0],
          ]}
          color={lineColor}
          lineWidth={lineWidth}
        />
        <Line
          points={[
            [-arrowSize, -d, 0],
            [arrowSize, -d, 0],
          ]}
          color={lineColor}
          lineWidth={lineWidth}
        />
        {/* Label */}
        <Html position={[0, -d / 2, 0]} center distanceFactor={distanceFactor}>
          <div
            style={{
              color: textColor,
              fontSize: `${baseFontSize}px`,
              fontWeight: '600',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '3px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            {depth}&quot;
          </div>
        </Html>
      </group>

      {/* Height Measurement (Z-axis) */}
      <group position={[-w / 2 - offset, -d / 2, h / 2]}>
        {/* Main line */}
        <Line
          points={[
            [0, 0, 0],
            [0, 0, h],
          ]}
          color={lineColor}
          lineWidth={lineWidth}
        />
        {/* End caps */}
        <Line
          points={[
            [-arrowSize, 0, 0],
            [arrowSize, 0, 0],
          ]}
          color={lineColor}
          lineWidth={lineWidth}
        />
        <Line
          points={[
            [-arrowSize, 0, h],
            [arrowSize, 0, h],
          ]}
          color={lineColor}
          lineWidth={lineWidth}
        />
        {/* Label */}
        <Html position={[0, 0, h / 2]} center distanceFactor={distanceFactor}>
          <div
            style={{
              color: textColor,
              fontSize: `${baseFontSize}px`,
              fontWeight: '600',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '3px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            }}
          >
            {height}&quot;
          </div>
        </Html>
      </group>
    </group>
  );
});
