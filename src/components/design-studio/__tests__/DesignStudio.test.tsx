import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DesignStudio } from '../DesignStudio'
import { useCrateStore, useCrateConfiguration, useValidationResults, useViewport } from '../../../stores/crate-store'
import { defaultCrateConfiguration } from '../../../types/crate'
import { currentProductLabel } from '../../../data/product-metadata'

// Mock the store
jest.mock('../../../stores/crate-store', () => ({
  useCrateStore: jest.fn(),
  useCrateConfiguration: jest.fn(),
  useValidationResults: jest.fn(),
  useViewport: jest.fn()
}))

// Mock the child components
jest.mock('../ConfigurationPanel', () => ({
  ConfigurationPanel: () => <div data-testid="configuration-panel">Configuration Panel</div>
}))

jest.mock('../ValidationPanel', () => ({
  ValidationPanel: () => <div data-testid="validation-panel">Validation Panel</div>
}))

jest.mock('../ExportPanel', () => ({
  ExportPanel: () => <div data-testid="export-panel">Export Panel</div>
}))

jest.mock('../MaterialOptimizer', () => ({
  MaterialOptimizer: () => <div data-testid="material-optimizer">Material Optimizer</div>
}))

jest.mock('../../cad-viewer/CrateVisualizer', () => ({
  CrateVisualizer: () => <div data-testid="crate-visualizer">Crate Visualizer</div>
}))

const mockUpdateConfiguration = jest.fn()
const mockResetConfiguration = jest.fn()
const mockValidateConfiguration = jest.fn()
const mockExportConfiguration = jest.fn()
const mockImportConfiguration = jest.fn()

describe('DesignStudio', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const mockStoreState = {
      configuration: defaultCrateConfiguration,
      updateConfiguration: mockUpdateConfiguration,
      resetConfiguration: mockResetConfiguration,
      validateConfiguration: mockValidateConfiguration,
      exportConfiguration: mockExportConfiguration,
      importConfiguration: mockImportConfiguration,
      updateViewport: jest.fn(),
      validationResults: [
        {
          isValid: true,
          errors: [],
          warnings: [],
          timestamp: new Date()
        }
      ],
      viewport: {
        camera: {
          position: [136, 115, 136] as [number, number, number],
          target: [0, 0, 0] as [number, number, number]
        },
        selectedComponents: [],
        showDimensions: true,
        showPMI: false,
        showExploded: false,
        enableMeasurement: false
      },
      getValidationErrors: jest.fn(() => []),
      getValidationWarnings: jest.fn(() => []),
      isConfigurationValid: jest.fn(() => true),
      getConfigurationSummary: jest.fn(() => ({
        totalCost: 150,
        totalWeight: 200,
        materialEfficiency: 85
      })),
      getEstimatedCost: jest.fn(() => 150),
      getEstimatedWeight: jest.fn(() => 200),
      getEstimatedDimensions: jest.fn(() => ({
        overallWidth: 50,
        overallLength: 45,
        overallHeight: 95
      })),
      getBillOfMaterials: jest.fn(() => ({
        items: [],
        totalCost: 150,
        materialWaste: 10,
        generatedAt: new Date()
      })),
      getPerformanceMetrics: jest.fn(() => ({
        fps: 60,
        memoryUsage: 100,
        drawCalls: 50
      })),
      getMaterialEfficiency: jest.fn(() => 85),
      getOptimizationSuggestions: jest.fn(() => []),
      applyOptimization: jest.fn(),
      getConfigurationHistory: jest.fn(() => []),
      undoConfiguration: jest.fn(),
      redoConfiguration: jest.fn(),
      canUndo: jest.fn(() => false),
      canRedo: jest.fn(() => false),
      clearHistory: jest.fn(),
      getExportOptions: jest.fn(() => ({
        step: true,
        nx: true,
        pdf: false
      }))
    }

    ;(useCrateStore as jest.Mock).mockImplementation((selector) => {
      if (selector === undefined) {
        return mockStoreState
      }
      return selector(mockStoreState)
    })

    ;(useCrateStore as unknown as { getState: jest.Mock }).getState = jest
      .fn()
      .mockReturnValue(mockStoreState)

    ;(useCrateConfiguration as jest.Mock).mockReturnValue(
      defaultCrateConfiguration
    )

    ;(useValidationResults as jest.Mock).mockReturnValue(
      mockStoreState.validationResults
    )

    ;(useViewport as jest.Mock).mockReturnValue(mockStoreState.viewport)
  })

  it('renders the main design studio interface', () => {
    render(<DesignStudio />)
    
    expect(screen.getByText(currentProductLabel)).toBeInTheDocument()
    expect(screen.getByText('Applied Materials Standards')).toBeInTheDocument()
  })

  it('renders all main sections', () => {
    render(<DesignStudio />)
    
    expect(screen.getByTestId('configuration-panel')).toBeInTheDocument()
    expect(screen.getByTestId('validation-panel')).toBeInTheDocument()
    expect(screen.getByTestId('export-panel')).toBeInTheDocument()
    expect(screen.getByTestId('material-optimizer')).toBeInTheDocument()
    expect(screen.getByTestId('crate-visualizer')).toBeInTheDocument()
  })

  it('displays configuration summary', () => {
    render(<DesignStudio />)
    
    expect(screen.getByText('$150.00')).toBeInTheDocument() // Total Cost
    expect(screen.getByText('200 lbs')).toBeInTheDocument() // Total Weight
    expect(screen.getByText('85.0%')).toBeInTheDocument() // Material Efficiency
  })

  it('displays estimated dimensions', () => {
    render(<DesignStudio />)
    
    expect(screen.getByText('50" × 45" × 95"')).toBeInTheDocument()
  })

  it('shows performance metrics', () => {
    render(<DesignStudio />)
    
    expect(screen.getByText('60 FPS')).toBeInTheDocument()
    expect(screen.getByText('100 MB')).toBeInTheDocument()
    expect(screen.getByText('50 Draw Calls')).toBeInTheDocument()
  })

  it('handles configuration updates', async () => {
    render(<DesignStudio />)
    
    // Simulate configuration update
    const newConfig = {
      ...defaultCrateConfiguration,
      product: {
        ...defaultCrateConfiguration.product,
        weight: 1000
      }
    }

    await waitFor(() => {
      mockUpdateConfiguration(newConfig)
    })

    expect(mockUpdateConfiguration).toHaveBeenCalledWith(newConfig)
  })

  it('handles configuration reset', async () => {
    render(<DesignStudio />)
    
    const resetButton = screen.getByText('Reset Configuration')
    fireEvent.click(resetButton)
    
    expect(mockResetConfiguration).toHaveBeenCalled()
  })

  it('handles configuration validation', async () => {
    render(<DesignStudio />)
    
    const validateButton = screen.getByText('Validate Configuration')
    fireEvent.click(validateButton)
    
    expect(mockValidateConfiguration).toHaveBeenCalled()
  })

  it('handles configuration export', async () => {
    render(<DesignStudio />)
    
    const exportButton = screen.getByText('Export Configuration')
    fireEvent.click(exportButton)
    
    expect(mockExportConfiguration).toHaveBeenCalled()
  })

  it('handles configuration import', async () => {
    render(<DesignStudio />)
    
    const importButton = screen.getByText('Import Configuration')
    fireEvent.click(importButton)
    
    // Simulate file selection
    const file = new File(['{"product": {"length": 50}}'], 'config.json', {
      type: 'application/json'
    })
    
    const fileInput = screen.getByLabelText('Import Configuration File')
    fireEvent.change(fileInput, { target: { files: [file] } })
    
    await waitFor(() => {
      expect(mockImportConfiguration).toHaveBeenCalled()
    })
  })

  it('shows validation status', () => {
    render(<DesignStudio />)
    
    expect(screen.getByText('Configuration Valid')).toBeInTheDocument()
    expect(screen.getByText('No Errors')).toBeInTheDocument()
    expect(screen.getByText('No Warnings')).toBeInTheDocument()
  })

  it('shows validation errors when present', () => {
    ;(useCrateStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        configuration: defaultCrateConfiguration,
        updateConfiguration: mockUpdateConfiguration,
        resetConfiguration: mockResetConfiguration,
        validateConfiguration: mockValidateConfiguration,
        exportConfiguration: mockExportConfiguration,
        importConfiguration: mockImportConfiguration,
        getValidationErrors: jest.fn(() => ['Product length is invalid', 'Material grade is invalid']),
        getValidationWarnings: jest.fn(() => ['Consider using thicker plywood']),
        isConfigurationValid: jest.fn(() => false),
        getConfigurationSummary: jest.fn(() => ({
          totalCost: 150,
          totalWeight: 200,
          materialEfficiency: 85
        })),
        getEstimatedCost: jest.fn(() => 150),
        getEstimatedWeight: jest.fn(() => 200),
        getEstimatedDimensions: jest.fn(() => ({
          overallWidth: 50,
          overallLength: 45,
          overallHeight: 95
        })),
        getBillOfMaterials: jest.fn(() => ({
          items: [],
          totalCost: 150,
          materialWaste: 10,
          generatedAt: new Date()
        })),
        getPerformanceMetrics: jest.fn(() => ({
          fps: 60,
          memoryUsage: 100,
          drawCalls: 50
        })),
        getMaterialEfficiency: jest.fn(() => 85),
        getOptimizationSuggestions: jest.fn(() => []),
        applyOptimization: jest.fn(),
        getConfigurationHistory: jest.fn(() => []),
        undoConfiguration: jest.fn(),
        redoConfiguration: jest.fn(),
        canUndo: jest.fn(() => false),
        canRedo: jest.fn(() => false),
        clearHistory: jest.fn(),
        getExportOptions: jest.fn(() => ({
          step: true,
          nx: true,
          pdf: false
        }))
      }
      if (selector === undefined) {
        return state
      }
      return selector(state)
    })

    render(<DesignStudio />)
    
    expect(screen.getByText('Configuration Invalid')).toBeInTheDocument()
    expect(screen.getByText('2 Errors')).toBeInTheDocument()
    expect(screen.getByText('1 Warning')).toBeInTheDocument()
  })

  it('handles undo/redo operations', async () => {
    ;(useCrateStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        configuration: defaultCrateConfiguration,
        updateConfiguration: mockUpdateConfiguration,
        resetConfiguration: mockResetConfiguration,
        validateConfiguration: mockValidateConfiguration,
        exportConfiguration: mockExportConfiguration,
        importConfiguration: mockImportConfiguration,
        getValidationErrors: jest.fn(() => []),
        getValidationWarnings: jest.fn(() => []),
        isConfigurationValid: jest.fn(() => true),
        getConfigurationSummary: jest.fn(() => ({
          totalCost: 150,
          totalWeight: 200,
          materialEfficiency: 85
        })),
        getEstimatedCost: jest.fn(() => 150),
        getEstimatedWeight: jest.fn(() => 200),
        getEstimatedDimensions: jest.fn(() => ({
          overallWidth: 50,
          overallLength: 45,
          overallHeight: 95
        })),
        getBillOfMaterials: jest.fn(() => ({
          items: [],
          totalCost: 150,
          materialWaste: 10,
          generatedAt: new Date()
        })),
        getPerformanceMetrics: jest.fn(() => ({
          fps: 60,
          memoryUsage: 100,
          drawCalls: 50
        })),
        getMaterialEfficiency: jest.fn(() => 85),
        getOptimizationSuggestions: jest.fn(() => []),
        applyOptimization: jest.fn(),
        getConfigurationHistory: jest.fn(() => []),
        undoConfiguration: jest.fn(),
        redoConfiguration: jest.fn(),
        canUndo: jest.fn(() => true),
        canRedo: jest.fn(() => true),
        clearHistory: jest.fn(),
        getExportOptions: jest.fn(() => ({
          step: true,
          nx: true,
          pdf: false
        }))
      }
      if (selector === undefined) {
        return state
      }
      return selector(state)
    })

    render(<DesignStudio />)
    
    const undoButton = screen.getByText('Undo')
    const redoButton = screen.getByText('Redo')
    
    fireEvent.click(undoButton)
    fireEvent.click(redoButton)
    
    expect(mockUpdateConfiguration).toHaveBeenCalled()
  })

  it('handles optimization suggestions', async () => {
    const mockOptimizationSuggestions = [
      {
        type: 'cost',
        description: 'Reduce lumber grade to save $25',
        impact: '15% cost reduction',
        changes: { materials: { lumber: { grade: '#2' } } }
      }
    ]

    ;(useCrateStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        configuration: defaultCrateConfiguration,
        updateConfiguration: mockUpdateConfiguration,
        resetConfiguration: mockResetConfiguration,
        validateConfiguration: mockValidateConfiguration,
        exportConfiguration: mockExportConfiguration,
        importConfiguration: mockImportConfiguration,
        getValidationErrors: jest.fn(() => []),
        getValidationWarnings: jest.fn(() => []),
        isConfigurationValid: jest.fn(() => true),
        getConfigurationSummary: jest.fn(() => ({
          totalCost: 150,
          totalWeight: 200,
          materialEfficiency: 85
        })),
        getEstimatedCost: jest.fn(() => 150),
        getEstimatedWeight: jest.fn(() => 200),
        getEstimatedDimensions: jest.fn(() => ({
          overallWidth: 50,
          overallLength: 45,
          overallHeight: 95
        })),
        getBillOfMaterials: jest.fn(() => ({
          items: [],
          totalCost: 150,
          materialWaste: 10,
          generatedAt: new Date()
        })),
        getPerformanceMetrics: jest.fn(() => ({
          fps: 60,
          memoryUsage: 100,
          drawCalls: 50
        })),
        getMaterialEfficiency: jest.fn(() => 85),
        getOptimizationSuggestions: jest.fn(() => mockOptimizationSuggestions),
        applyOptimization: jest.fn(),
        getConfigurationHistory: jest.fn(() => []),
        undoConfiguration: jest.fn(),
        redoConfiguration: jest.fn(),
        canUndo: jest.fn(() => false),
        canRedo: jest.fn(() => false),
        clearHistory: jest.fn(),
        getExportOptions: jest.fn(() => ({
          step: true,
          nx: true,
          pdf: false
        }))
      }
      if (selector === undefined) {
        return state
      }
      return selector(state)
    })

    render(<DesignStudio />)
    
    expect(screen.getByText('Optimization Suggestions')).toBeInTheDocument()
    expect(screen.getByText('Reduce lumber grade to save $25')).toBeInTheDocument()
    expect(screen.getByText('15% cost reduction')).toBeInTheDocument()
  })

  it('handles responsive layout', () => {
    // Mock window.innerWidth for responsive testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768, // Tablet width
    })

    render(<DesignStudio />)
    
    // Should still render all components
    expect(screen.getByTestId('configuration-panel')).toBeInTheDocument()
    expect(screen.getByTestId('crate-visualizer')).toBeInTheDocument()
  })

  it('handles mobile layout', () => {
    // Mock window.innerWidth for mobile testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile width
    })

    render(<DesignStudio />)
    
    // Should still render all components
    expect(screen.getByTestId('configuration-panel')).toBeInTheDocument()
    expect(screen.getByTestId('crate-visualizer')).toBeInTheDocument()
  })
})
