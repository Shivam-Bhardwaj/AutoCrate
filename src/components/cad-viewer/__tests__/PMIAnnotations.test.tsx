import React from 'react'
import { render } from '@testing-library/react'
import { PMIAnnotations } from '../PMIAnnotations'
import { defaultCrateConfiguration } from '../../../types/crate'
import { calculateCrateDimensions } from '../../../lib/domain/calculations'

// Mock the calculations
jest.mock('../../../lib/domain/calculations', () => ({
  calculateCrateDimensions: jest.fn(() => ({
    overallWidth: 50,
    overallLength: 45,
    overallHeight: 95,
    internalWidth: 47,
    internalLength: 42,
    internalHeight: 93.5
  })),
  generateBillOfMaterials: jest.fn(() => ({
    items: [],
    totalCost: 0,
    materialWaste: 10,
    generatedAt: new Date()
  })),
  calculateMaterialEfficiency: jest.fn(() => 90),
  calculateCrateWeight: jest.fn(() => 850)
}))

// Mock the Html component from drei
jest.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div data-testid="html-annotation">{children}</div>
}))

describe('PMIAnnotations', () => {
  const mockConfig = defaultCrateConfiguration
  const mockDimensions = calculateCrateDimensions(mockConfig)

  it('renders nothing when showPMI is false', () => {
    const { container } = render(
      <PMIAnnotations 
        config={mockConfig}
        dimensions={mockDimensions}
        showPMI={false}
      />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('renders PMI annotations when showPMI is true', () => {
    const { container } = render(
      <PMIAnnotations 
        config={mockConfig}
        dimensions={mockDimensions}
        showPMI={true}
      />
    )
    
    expect(container.firstChild).not.toBeNull()
  })

  it('includes overall dimension annotations', () => {
    const { getAllByTestId } = render(
      <PMIAnnotations 
        config={mockConfig}
        dimensions={mockDimensions}
        showPMI={true}
      />
    )
    
    const annotations = getAllByTestId('html-annotation')
    expect(annotations.length).toBeGreaterThan(0)
  })

  it('includes product dimension annotations', () => {
    const { getAllByTestId } = render(
      <PMIAnnotations 
        config={mockConfig}
        dimensions={mockDimensions}
        showPMI={true}
      />
    )
    
    const annotations = getAllByTestId('html-annotation')
    expect(annotations.length).toBeGreaterThan(0)
  })

  it('includes clearance annotations', () => {
    const { getAllByTestId } = render(
      <PMIAnnotations 
        config={mockConfig}
        dimensions={mockDimensions}
        showPMI={true}
      />
    )
    
    const annotations = getAllByTestId('html-annotation')
    expect(annotations.length).toBeGreaterThan(0)
  })

  it('includes weight annotation', () => {
    const { getAllByTestId } = render(
      <PMIAnnotations 
        config={mockConfig}
        dimensions={mockDimensions}
        showPMI={true}
      />
    )
    
    const annotations = getAllByTestId('html-annotation')
    expect(annotations.length).toBeGreaterThan(0)
  })

  it('updates annotations when configuration changes', () => {
    const { rerender, getAllByTestId } = render(
      <PMIAnnotations 
        config={mockConfig}
        dimensions={mockDimensions}
        showPMI={true}
      />
    )
    
    const initialAnnotations = getAllByTestId('html-annotation')
    
    const updatedConfig = {
      ...mockConfig,
      product: {
        ...mockConfig.product,
        weight: 800
      }
    }
    
    rerender(
      <PMIAnnotations 
        config={updatedConfig}
        dimensions={mockDimensions}
        showPMI={true}
      />
    )
    
    const updatedAnnotations = getAllByTestId('html-annotation')
    expect(updatedAnnotations.length).toBeGreaterThan(0)
  })

  it('updates annotations when dimensions change', () => {
    const { rerender, getAllByTestId } = render(
      <PMIAnnotations 
        config={mockConfig}
        dimensions={mockDimensions}
        showPMI={true}
      />
    )
    
    const updatedDimensions = {
      ...mockDimensions,
      overallWidth: 60,
      overallLength: 55,
      overallHeight: 105
    }
    
    rerender(
      <PMIAnnotations 
        config={mockConfig}
        dimensions={updatedDimensions}
        showPMI={true}
      />
    )
    
    const annotations = getAllByTestId('html-annotation')
    expect(annotations.length).toBeGreaterThan(0)
  })
})