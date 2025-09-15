import React from 'react'
import { render, screen } from '@testing-library/react'
import { CrateVisualizer } from '../CrateVisualizer'
import { defaultCrateConfiguration } from '../../../types/crate'

// Mock the calculations
jest.mock('../../../lib/domain/calculations', () => ({
  calculateCrateDimensions: jest.fn(() => ({
    overallWidth: 50,
    overallLength: 45,
    overallHeight: 95,
    internalWidth: 47,
    internalLength: 42,
    internalHeight: 93.5
  }))
}))

// Mock Three.js components
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="three-canvas">{children}</div>
  ),
  useFrame: jest.fn(),
  useThree: jest.fn(() => ({
    camera: { position: { x: 0, y: 0, z: 0 } },
    scene: {},
    gl: { domElement: document.createElement('canvas') }
  }))
}))

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls">Orbit Controls</div>,
  Grid: () => <div data-testid="grid">Grid</div>,
  Environment: () => <div data-testid="environment">Environment</div>,
  Html: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="html-overlay">{children}</div>
  )
}))

// Mock the child components
jest.mock('../CrateAssembly', () => ({
  CrateAssembly: () => <div data-testid="crate-assembly">Crate Assembly</div>
}))

jest.mock('../PMIAnnotations', () => ({
  PMIAnnotations: () => <div data-testid="pmi-annotations">PMI Annotations</div>
}))

jest.mock('../MeasurementTools', () => ({
  MeasurementTools: () => <div data-testid="measurement-tools">Measurement Tools</div>
}))

jest.mock('../PerformanceMonitor', () => ({
  PerformanceMonitor: () => <div data-testid="performance-monitor">Performance Monitor</div>
}))

describe('CrateVisualizer', () => {
  const mockConfig = defaultCrateConfiguration

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the 3D visualization canvas', () => {
    render(
      <CrateVisualizer
        config={mockConfig}
        showPMI={false}
        enableMeasurement={false}
      />
    )
    
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
  })

  it('renders all 3D scene components', () => {
    render(
      <CrateVisualizer
        config={mockConfig}
        showPMI={false}
        enableMeasurement={false}
      />
    )
    
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument()
    expect(screen.getByTestId('grid')).toBeInTheDocument()
    expect(screen.getByTestId('environment')).toBeInTheDocument()
    expect(screen.getByTestId('crate-assembly')).toBeInTheDocument()
  })

  it('renders PMI annotations when showPMI is true', () => {
    render(
      <CrateVisualizer
        config={mockConfig}
        showPMI={true}
        enableMeasurement={false}
      />
    )
    
    expect(screen.getByTestId('pmi-annotations')).toBeInTheDocument()
  })

  it('does not render PMI annotations when showPMI is false', () => {
    render(
      <CrateVisualizer
        config={mockConfig}
        showPMI={false}
        enableMeasurement={false}
      />
    )
    
    expect(screen.queryByTestId('pmi-annotations')).not.toBeInTheDocument()
  })

  it('renders measurement tools when enableMeasurement is true', () => {
    render(
      <CrateVisualizer
        config={mockConfig}
        showPMI={false}
        enableMeasurement={true}
      />
    )
    
    expect(screen.getByTestId('measurement-tools')).toBeInTheDocument()
  })

  it('does not render measurement tools when enableMeasurement is false', () => {
    render(
      <CrateVisualizer
        config={mockConfig}
        showPMI={false}
        enableMeasurement={false}
      />
    )
    
    expect(screen.queryByTestId('measurement-tools')).not.toBeInTheDocument()
  })

  it('renders performance monitor when showPerformanceStats is true', () => {
    render(
      <CrateVisualizer
        config={mockConfig}
        showPMI={false}
        enableMeasurement={false}
        showPerformanceStats={true}
      />
    )
    
    expect(screen.getByTestId('performance-monitor')).toBeInTheDocument()
  })

  it('updates when configuration changes', () => {
    const { rerender } = render(
      <CrateVisualizer
        config={mockConfig}
        showPMI={false}
        enableMeasurement={false}
      />
    )
    
    const updatedConfig = {
      ...mockConfig,
      product: {
        ...mockConfig.product,
        weight: 1000
      }
    }
    
    rerender(
      <CrateVisualizer
        config={updatedConfig}
        showPMI={false}
        enableMeasurement={false}
      />
    )
    
    expect(screen.getByTestId('crate-assembly')).toBeInTheDocument()
  })

  it('handles both PMI and measurements enabled', () => {
    render(
      <CrateVisualizer
        config={mockConfig}
        showPMI={true}
        enableMeasurement={true}
      />
    )
    
    expect(screen.getByTestId('pmi-annotations')).toBeInTheDocument()
    expect(screen.getByTestId('measurement-tools')).toBeInTheDocument()
  })

  it('handles responsive layout', () => {
    // Mock window.innerWidth for responsive testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768, // Tablet width
    })

    render(
      <CrateVisualizer
        config={mockConfig}
        showPMI={false}
        enableMeasurement={false}
      />
    )
    
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('crate-assembly')).toBeInTheDocument()
  })

  it('handles mobile layout', () => {
    // Mock window.innerWidth for mobile testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile width
    })

    render(
      <CrateVisualizer
        config={mockConfig}
        showPMI={false}
        enableMeasurement={false}
      />
    )
    
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
    expect(screen.getByTestId('crate-assembly')).toBeInTheDocument()
  })

  it('handles undefined configuration gracefully', () => {
    render(
      <CrateVisualizer
        config={undefined as any}
        showPMI={false}
        enableMeasurement={false}
      />
    )
    
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
  })
})
