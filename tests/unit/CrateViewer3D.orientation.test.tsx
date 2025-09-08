// @ts-nocheck
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import CrateViewer3D from '@/components/CrateViewer3D';
// Per-file mocks removed; rely on global mocks in tests/setup.ts

// Minimal configuration object satisfying validateCrateConfiguration fields
const configuration = {
  product: { name: 'Test', weight: 10 },
  dimensions: { length: 40, width: 30, height: 20 },
  materials: { woodType: 'PINE' },
  fasteners: { type: 'NAILS' },
  environment: { humidity: 30 },
  centerOfGravity: { combinedCoG: { x: 0, y: 0, z: 10 } },
} as any;

function collectBoxArgs() {
  return screen.getAllByTestId('box').map((el) => JSON.parse(el.getAttribute('data-args') || '[]'));
}

describe('CrateViewer3D panel orientation', () => {
  it('maps panel thickness to the axis normal of each face', () => {
    render(<CrateViewer3D configuration={configuration} />);

    const argsArrays = collectBoxArgs();
    // Heuristic: identify sets by one dimension ~ thickness (0.75 in) converted to meters.
    const thicknessM = (0.75 * 25.4) / 1000; // 0.01905 m
    const tolerance = 0.0005;

    // Ensure at least one box has thickness dimension represented in each axis somewhere across all panel renderings.
    const thicknessInX = argsArrays.some((a) => Math.abs(a[0] - thicknessM) < tolerance);
    const thicknessInY = argsArrays.some((a) => Math.abs(a[1] - thicknessM) < tolerance);
    const thicknessInZ = argsArrays.some((a) => Math.abs(a[2] - thicknessM) < tolerance);

    expect(thicknessInX && thicknessInY && thicknessInZ).toBe(true);
  });
});
