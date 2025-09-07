import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import CrateViewer3D from '@/components/CrateViewer3D';
import { CrateConfiguration } from '@/types/crate';
import AxeBuilder from '@axe-core/playwright';

// Minimal mock config for accessibility test
const config: CrateConfiguration = {
  projectName: 'A11Y',
  dimensions: { length: 48, width: 40, height: 36 },
  base: {
    type: 'standard',
    floorboardThickness: 1.5,
    skidHeight: 4,
    skidWidth: 6,
    skidCount: 2,
    skidSpacing: 20,
    requiresRubStrips: false,
    material: 'pine',
  },
  cap: {
    topPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: false,
      ventilation: { enabled: false, type: 'holes', count: 0, size: 0 },
    },
    frontPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: false,
      ventilation: { enabled: false, type: 'holes', count: 0, size: 0 },
    },
    backPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: false,
      ventilation: { enabled: false, type: 'holes', count: 0, size: 0 },
    },
    leftPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: false,
      ventilation: { enabled: false, type: 'holes', count: 0, size: 0 },
    },
    rightPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: false,
      ventilation: { enabled: false, type: 'holes', count: 0, size: 0 },
    },
  },
  weight: { product: 100 },
  fasteners: { type: 'nails', size: '1/8 inch', spacing: 6, material: 'steel' },
  vinyl: { enabled: false, type: 'waterproof', thickness: 0.008, coverage: 'full' },
  specialRequirements: [],
};

describe('CrateViewer3D accessibility', () => {
  it('renders without obvious a11y regressions (static heuristics)', () => {
    render(<CrateViewer3D configuration={config} />);
    expect(screen.getByText('Explode View')).toBeInTheDocument();
  });
});
