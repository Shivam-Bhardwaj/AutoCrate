import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import CrateViewer3D from '../../src/components/CrateViewer3D';
import { CrateConfiguration } from '../../src/types/crate';

// Mock all dependencies
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Grid: () => <div data-testid="grid" />,
  Html: ({ children }: any) => <div data-testid="html-overlay">{children}</div>,
  Text: ({ children, ...props }: any) => <div data-testid="text" {...props}>{children}</div>,
}));

vi.mock('../../src/components/CoordinateAxes', () => ({
  CoordinateAxes: () => <div data-testid="coordinate-axes" />,
}));

vi.mock('../../src/store/logs-store', () => ({
  useLogsStore: () => ({
    logInfo: vi.fn(),
    logDebug: vi.fn(),
    logWarning: vi.fn(),
    logError: vi.fn(),
  }),
}));

vi.mock('../../src/utils/input-validation', () => ({
  validateCrateConfiguration: vi.fn((config) => config),
  isValidForRendering: vi.fn(() => true),
}));

vi.mock('../../src/utils/skid-calculations', () => ({
  calculateSkidConfiguration: vi.fn(() => ({
    dimensions: { height: 4, width: 6 },
    count: 3,
    spacing: 20,
    requiresRubStrips: false,
  })),
}));

vi.mock('../../src/utils/floorboard-calculations', () => ({
  calculateFloorboardConfiguration: vi.fn(() => ({
    floorboards: [
      { width: 5.5, nominalSize: '2x6', isNarrowBoard: false },
      { width: 5.5, nominalSize: '2x6', isNarrowBoard: false },
    ],
    floorboardThickness: 1.5,
    warnings: [],
  })),
}));

vi.mock('../../src/utils/performance-monitor', () => ({
  usePerformanceMonitor: vi.fn(() => ({
    recordFrame: vi.fn(() => ({ fps: 60, frameTime: 16 })),
  })),
}));

vi.mock('../../src/utils/materials', () => ({
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

describe('threeLabels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 3D labels with correct font size and styling', () => {
    render(<CrateViewer3D configuration={mockConfiguration} />);

    // Check that label elements exist
    expect(screen.getByText('FRONT')).toBeInTheDocument();
    expect(screen.getByText('Skids')).toBeInTheDocument();
    expect(screen.getByText('Floor')).toBeInTheDocument();
    expect(screen.getByText('Panels')).toBeInTheDocument();
    expect(screen.getByText('Cleats')).toBeInTheDocument();

    // Check font size for labels
    const frontLabel = screen.getByText('FRONT');
    const styles = getComputedStyle(frontLabel);
    const fontSize = parseFloat(styles.fontSize);

    // Expect font size to be at least 12px (readable)
    expect(fontSize).toBeGreaterThanOrEqual(12);

    // Check for outline or text-shadow (assuming it's applied via CSS)
    const textShadow = styles.textShadow;
    const hasOutline = textShadow !== 'none' && textShadow !== '';

    // For 3D labels, expect some form of outline/shadow for visibility
    expect(hasOutline || styles.webkitTextStroke !== '').toBe(true);
  });
});