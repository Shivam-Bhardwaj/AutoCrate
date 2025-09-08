import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChamferedPanel from '../ChamferedPanel';
import ChamferedTopPanel from '../ChamferedTopPanel';

describe('ChamferedPanel Components', () => {
  const mockMaterial = {
    color: { r: 1, g: 1, b: 1 },
    roughness: 0.7,
    metalness: 0.1,
  };

  describe('ChamferedPanel', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <ChamferedPanel
          args={[2, 0.05, 1]}
          position={[0, 0, 0]}
          material={mockMaterial}
          chamferDepth={0.1}
          chamferAngle={30}
          panelType="front"
        />
      );
      expect(container).toBeTruthy();
    });

    it('accepts correct props', () => {
      const { container } = render(
        <ChamferedPanel
          args={[2, 0.05, 1]}
          position={[1, 2, 3]}
          material={mockMaterial}
          chamferDepth={0.2}
          chamferAngle={45}
          panelType="left"
        />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('ChamferedTopPanel', () => {
    it('renders without crashing', () => {
      const { container } = render(
        <ChamferedTopPanel
          args={[2, 1.5, 0.05]}
          position={[0, 0, 1]}
          material={mockMaterial}
          chamferDepth={0.1}
          chamferAngle={30}
        />
      );
      expect(container).toBeTruthy();
    });

    it('accepts correct props', () => {
      const { container } = render(
        <ChamferedTopPanel
          args={[3, 2, 0.075]}
          position={[1, 2, 3]}
          material={mockMaterial}
          chamferDepth={0.15}
          chamferAngle={45}
        />
      );
      expect(container).toBeTruthy();
    });
  });
});
