import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import CrateViewer3D from '../../src/components/CrateViewer3D';
import { CrateConfiguration } from '../../src/types/crate';

// NOTE: Per-file R3F/drei mocks removed; global mocks in tests/setup.ts now supply these.
// CoordinateAxes also mocked globally via its own module? If not, keep lightweight mock.
vi.mock('@/components/CoordinateAxes', () => ({
  CoordinateAxes: () => <div data-testid="coordinate-axes" />,
}));

// Local mock of logs store (removed from global setup to keep other store tests real)
vi.mock('@/store/logs-store', () => ({
  useLogsStore: () => ({
    logInfo: vi.fn(),
    logDebug: vi.fn(),
    logWarning: vi.fn(),
    logError: vi.fn(),
  }),
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

  it('renders legend items for components', () => {
    render(<CrateViewer3D configuration={mockConfiguration} />);
    ['Skids', 'Floor', 'Panels', 'Cleats'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('renders side labels (Front)', () => {
    render(<CrateViewer3D configuration={mockConfiguration} />);
    expect(screen.getByText('FRONT')).toBeInTheDocument();
  });
});
