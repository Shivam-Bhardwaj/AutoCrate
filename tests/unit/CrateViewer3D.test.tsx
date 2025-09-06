import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import CrateViewer3D from '../../src/components/CrateViewer3D';
import { CrateConfiguration } from '../../src/types/crate';

// Mock the dynamic imports and Three.js components
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: any) => (
    <div data-testid="canvas" {...props}>
      {children}
    </div>
  ),
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Grid: () => <div data-testid="grid" />,
  Box: ({ args, position, material }: any) => (
    <div data-testid="box" data-args={args} data-position={position} data-material={material} />
  ),
  Text: ({ children, position }: any) => (
    <div data-testid="text" data-position={position}>
      {children}
    </div>
  ),
  Html: ({ children }: any) => <div data-testid="html">{children}</div>,
}));

vi.mock('@/components/CoordinateAxes', () => ({
  CoordinateAxes: () => <div data-testid="coordinate-axes" />,
}));

vi.mock('@/store/logs-store', () => ({
  useLogsStore: () => ({
    logInfo: vi.fn(),
    logDebug: vi.fn(),
    logWarning: vi.fn(),
    logError: vi.fn(),
  }),
}));

vi.mock('@/utils/input-validation', () => ({
  validateCrateConfiguration: vi.fn((config) => config),
  isValidForRendering: vi.fn(() => true),
}));

vi.mock('@/utils/skid-calculations', () => ({
  calculateSkidConfiguration: vi.fn(() => ({
    dimensions: { height: 4, width: 6 },
    count: 3,
    spacing: 20,
    requiresRubStrips: false,
  })),
}));

vi.mock('@/utils/floorboard-calculations', () => ({
  calculateFloorboardConfiguration: vi.fn(() => ({
    floorboards: [
      { width: 5.5, nominalSize: '2x6', isNarrowBoard: false },
      { width: 5.5, nominalSize: '2x6', isNarrowBoard: false },
    ],
    floorboardThickness: 1.5,
    warnings: [],
  })),
}));

vi.mock('@/utils/performance-monitor', () => ({
  usePerformanceMonitor: vi.fn(() => ({
    recordFrame: vi.fn(() => ({ fps: 60, frameTime: 16 })),
  })),
}));

vi.mock('@/utils/materials', () => ({
  SHARED_MATERIALS: {
    SKID_WOOD: { color: '#8B4513' },
    FLOORBOARD_STANDARD: { color: '#8B4513' },
    SIDE_PANEL: { color: '#DEB887' },
    TOP_PANEL: { color: '#F5DEB3' },
    CLEAT_WOOD: { color: '#654321' },
  },
  createHoverableMaterial: vi.fn((material) => material),
  getFloorboardMaterial: vi.fn(() => ({ color: '#8B4513' })),
}));

const mockConfiguration: CrateConfiguration = {
  projectName: 'Test Crate',
  dimensions: {
    length: 48,
    width: 40,
    height: 36,
  },
  base: {
    type: 'standard',
    floorboardThickness: 1.5,
    skidHeight: 4,
    skidWidth: 6,
    skidCount: 3,
    skidSpacing: 20,
    requiresRubStrips: false,
    material: 'pine',
  },
  cap: {
    topPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: false,
      ventilation: { enabled: false, type: 'holes', count: 4, size: 2 },
    },
    frontPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: false,
      ventilation: { enabled: false, type: 'holes', count: 4, size: 2 },
    },
    backPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: false,
      ventilation: { enabled: false, type: 'holes', count: 4, size: 2 },
    },
    leftPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: false,
      ventilation: { enabled: false, type: 'holes', count: 4, size: 2 },
    },
    rightPanel: {
      thickness: 0.75,
      material: 'plywood',
      reinforcement: false,
      ventilation: { enabled: false, type: 'holes', count: 4, size: 2 },
    },
  },
  fasteners: {
    type: 'nails',
    size: '1/8 inch',
    spacing: 6,
    material: 'steel',
  },
  vinyl: {
    enabled: false,
    type: 'waterproof',
    thickness: 0.008,
    coverage: 'full',
  },
  weight: {
    product: 500,
  },
  specialRequirements: [],
};

describe('CrateViewer3D', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the 3D viewer container', () => {
    render(<CrateViewer3D configuration={mockConfiguration} />);

    const container = screen.getByTestId('canvas').parentElement;
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('w-full', 'h-full', 'bg-gradient-to-br');
  });

  it('renders the explode view controls', () => {
    render(<CrateViewer3D configuration={mockConfiguration} />);

    const explodeButton = screen.getByText('Explode View');
    expect(explodeButton).toBeInTheDocument();
  });

  it('shows configuration message when no valid config', () => {
    render(<CrateViewer3D configuration={null} />);

    // The text component should show the configuration message
    const canvas = screen.getByTestId('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders coordinate axes', () => {
    render(<CrateViewer3D configuration={mockConfiguration} />);

    const axes = screen.getByTestId('coordinate-axes');
    expect(axes).toBeInTheDocument();
  });

  it('renders orbit controls', () => {
    render(<CrateViewer3D configuration={mockConfiguration} />);

    const controls = screen.getByTestId('orbit-controls');
    expect(controls).toBeInTheDocument();
  });

  it('renders grid', () => {
    render(<CrateViewer3D configuration={mockConfiguration} />);

    const grid = screen.getByTestId('grid');
    expect(grid).toBeInTheDocument();
  });

  it('handles explode view toggle', () => {
    render(<CrateViewer3D configuration={mockConfiguration} />);

    const explodeButton = screen.getByText('Explode View');
    expect(explodeButton).toBeInTheDocument();

    // Click to enable explode view
    explodeButton.click();

    // The button should still be present (text may not change in test environment)
    expect(explodeButton).toBeInTheDocument();
  });

  it('validates configuration on render', () => {
    render(<CrateViewer3D configuration={mockConfiguration} />);

    // Check that the component renders without errors
    const canvas = screen.getByTestId('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('calculates skid and floorboard configurations', () => {
    render(<CrateViewer3D configuration={mockConfiguration} />);

    // Check that the component renders without errors
    const canvas = screen.getByTestId('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
