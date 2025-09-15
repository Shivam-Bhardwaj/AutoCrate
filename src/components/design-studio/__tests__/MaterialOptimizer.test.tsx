import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MaterialOptimizer } from '../MaterialOptimizer'
import { useCrateStore } from '../../../stores/crate-store'
import { defaultCrateConfiguration } from '../../../types/crate'

// Mock the store
jest.mock('../../../stores/crate-store', () => ({
  useCrateStore: jest.fn(),
  useCrateConfiguration: jest.fn()
}))

// Mock the calculations
jest.mock('../../../lib/domain/calculations', () => ({
  generateBillOfMaterials: jest.fn(() => ({
    items: [
      {
        id: 'plywood-bottom',
        description: 'Plywood Panel - Bottom (CDX)',
        quantity: 1,
        unit: 'each',
        material: 'Plywood',
        dimensions: { length: 50, width: 40, thickness: 0.75 }
      }
    ],
    totalCost: 0,
    materialWaste: 10,
    generatedAt: new Date()
  })),
  calculateMaterialEfficiency: jest.fn(() => 90),
  calculateCrateWeight: jest.fn(() => 150)
}))

const mockUpdateConfiguration = jest.fn()

describe('MaterialOptimizer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCrateStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        configuration: defaultCrateConfiguration,
        updateConfiguration: mockUpdateConfiguration
      }
      if (selector === undefined) {
        return state
      }
      return selector(state)
    })
    
    // Mock useCrateConfiguration
    const { useCrateConfiguration } = require('../../../stores/crate-store')
    ;(useCrateConfiguration as jest.Mock).mockReturnValue(defaultCrateConfiguration)
  })

  it('renders optimization interface', () => {
    render(<MaterialOptimizer />)
    
    expect(screen.getByText('Material Optimization')).toBeInTheDocument()
    expect(screen.getByText('Run Optimization')).toBeInTheDocument()
    expect(screen.getByText('Material Efficiency')).toBeInTheDocument()
    expect(screen.getByText('Crate Weight')).toBeInTheDocument()
    expect(screen.getByText('Material Waste')).toBeInTheDocument()
  })

  it('displays current metrics', () => {
    render(<MaterialOptimizer />)
    
    expect(screen.getByText('90.0%')).toBeInTheDocument() // Material Efficiency
    expect(screen.getByText('150 lbs')).toBeInTheDocument() // Crate Weight
    expect(screen.getByText('10.0%')).toBeInTheDocument() // Material Waste
  })

  it('shows material usage breakdown', () => {
    render(<MaterialOptimizer />)
    
    expect(screen.getByText('Material Usage')).toBeInTheDocument()
    expect(screen.getByText('Plywood Panel - Bottom (CDX)')).toBeInTheDocument()
    expect(screen.getByText('1 each')).toBeInTheDocument()
  })

  it('runs optimization when button is clicked', async () => {
    render(<MaterialOptimizer />)
    
    const optimizeButton = screen.getByText('Run Optimization')
    fireEvent.click(optimizeButton)
    
    expect(screen.getByText('Optimizing...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('Optimization Opportunities')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('applies cost optimization when suggested', async () => {
    // Mock a configuration that would trigger cost optimization
    const expensiveConfig = {
      ...defaultCrateConfiguration,
      materials: {
        ...defaultCrateConfiguration.materials,
        lumber: { ...defaultCrateConfiguration.materials.lumber, grade: 'Select' }
      },
      product: { ...defaultCrateConfiguration.product, weight: 500 }
    }

    ;(useCrateStore as jest.Mock).mockImplementation((selector) => {
      if (selector === undefined) {
        return {
          configuration: expensiveConfig,
          updateConfiguration: mockUpdateConfiguration
        }
      }
      return selector({
        configuration: expensiveConfig,
        updateConfiguration: mockUpdateConfiguration
      })
    })

    render(<MaterialOptimizer />)
    
    const optimizeButton = screen.getByText('Run Optimization')
    fireEvent.click(optimizeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Optimization Opportunities')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    const applyButton = screen.getByText('Apply')
    fireEvent.click(applyButton)
    
    expect(mockUpdateConfiguration).toHaveBeenCalledWith({
      materials: {
        ...expensiveConfig.materials,
        lumber: { ...expensiveConfig.materials.lumber, grade: '#2' }
      }
    })
  })

  it('applies weight optimization when suggested', async () => {
    // Mock a configuration that would trigger weight optimization
    const thickPlywoodConfig = {
      ...defaultCrateConfiguration,
      materials: {
        ...defaultCrateConfiguration.materials,
        plywood: { ...defaultCrateConfiguration.materials.plywood, thickness: 0.75 }
      },
      product: { ...defaultCrateConfiguration.product, weight: 300 }
    }

    ;(useCrateStore as jest.Mock).mockImplementation((selector) => {
      if (selector === undefined) {
        return {
          configuration: thickPlywoodConfig,
          updateConfiguration: mockUpdateConfiguration
        }
      }
      return selector({
        configuration: thickPlywoodConfig,
        updateConfiguration: mockUpdateConfiguration
      })
    })

    render(<MaterialOptimizer />)
    
    const optimizeButton = screen.getByText('Run Optimization')
    fireEvent.click(optimizeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Optimization Opportunities')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    const applyButtons = screen.getAllByText('Apply')
    // Click the second Apply button (weight optimization)
    fireEvent.click(applyButtons[1])
    
    expect(mockUpdateConfiguration).toHaveBeenCalledWith({
      materials: {
        ...thickPlywoodConfig.materials,
        plywood: { ...thickPlywoodConfig.materials.plywood, thickness: 0.625 }
      }
    })
  })

  it('disables optimize button while optimizing', async () => {
    render(<MaterialOptimizer />)
    
    const optimizeButton = screen.getByText('Run Optimization')
    fireEvent.click(optimizeButton)
    
    expect(screen.getByText('Optimizing...')).toBeInTheDocument()
    expect(screen.getByText('Optimizing...')).toBeDisabled()
  })

  it('shows optimization recommendations with improvement percentages', async () => {
    render(<MaterialOptimizer />)
    
    const optimizeButton = screen.getByText('Run Optimization')
    fireEvent.click(optimizeButton)
    
    await waitFor(() => {
      expect(screen.getByText('Optimization Opportunities')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Check for improvement percentages
    expect(screen.getByText(/\+15% improvement/)).toBeInTheDocument()
    expect(screen.getByText(/\+8% improvement/)).toBeInTheDocument()
    expect(screen.getByText(/\+12% improvement/)).toBeInTheDocument()
  })
})
