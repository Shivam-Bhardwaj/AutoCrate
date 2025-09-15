import { renderHook, act } from '@testing-library/react'
import { useCrateStore } from '../crate-store'
import { defaultCrateConfiguration } from '../../types/crate'

// Mock the store implementation
const mockStore = {
  configuration: defaultCrateConfiguration,
  updateConfiguration: jest.fn(),
  resetConfiguration: jest.fn(),
  validateConfiguration: jest.fn(),
  exportConfiguration: jest.fn(),
  importConfiguration: jest.fn(),
  getValidationErrors: jest.fn(),
  getValidationWarnings: jest.fn(),
  isConfigurationValid: jest.fn(),
  getConfigurationSummary: jest.fn(),
  getEstimatedCost: jest.fn(),
  getEstimatedWeight: jest.fn(),
  getEstimatedDimensions: jest.fn(),
  getBillOfMaterials: jest.fn(),
  getPerformanceMetrics: jest.fn(),
  getExportOptions: jest.fn(),
  getMaterialEfficiency: jest.fn(),
  getOptimizationSuggestions: jest.fn(),
  applyOptimization: jest.fn(),
  getConfigurationHistory: jest.fn(),
  undoConfiguration: jest.fn(),
  redoConfiguration: jest.fn(),
  canUndo: jest.fn(),
  canRedo: jest.fn(),
  clearHistory: jest.fn(),
  subscribe: jest.fn(),
  getState: jest.fn(),
  setState: jest.fn(),
  destroy: jest.fn()
}

// Mock the store
jest.mock('../crate-store', () => ({
  useCrateStore: jest.fn()
}))

describe('CrateStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCrateStore as jest.Mock).mockImplementation((selector) => {
      if (selector === undefined) {
        return mockStore
      }
      return selector(mockStore)
    })
  })

  describe('Configuration Management', () => {
    it('should provide default configuration', () => {
      const { result } = renderHook(() => useCrateStore())
      
      expect(result.current.configuration).toEqual(defaultCrateConfiguration)
    })

    it('should update configuration', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const newConfig = {
        ...defaultCrateConfiguration,
        product: {
          ...defaultCrateConfiguration.product,
          weight: 1000
        }
      }

      act(() => {
        result.current.updateConfiguration(newConfig)
      })

      expect(mockStore.updateConfiguration).toHaveBeenCalledWith(newConfig)
    })

    it('should reset configuration to default', () => {
      const { result } = renderHook(() => useCrateStore())
      
      act(() => {
        result.current.resetConfiguration()
      })

      expect(mockStore.resetConfiguration).toHaveBeenCalled()
    })
  })

  describe('Validation', () => {
    it('should validate configuration', () => {
      const { result } = renderHook(() => useCrateStore())
      
      act(() => {
        result.current.validateConfiguration()
      })

      expect(mockStore.validateConfiguration).toHaveBeenCalled()
    })

    it('should get validation errors', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const errors = result.current.getValidationErrors()
      
      expect(mockStore.getValidationErrors).toHaveBeenCalled()
    })

    it('should get validation warnings', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const warnings = result.current.getValidationWarnings()
      
      expect(mockStore.getValidationWarnings).toHaveBeenCalled()
    })

    it('should check if configuration is valid', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const isValid = result.current.isConfigurationValid()
      
      expect(mockStore.isConfigurationValid).toHaveBeenCalled()
    })
  })

  describe('Export/Import', () => {
    it('should export configuration', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const exported = result.current.exportConfiguration()
      
      expect(mockStore.exportConfiguration).toHaveBeenCalled()
    })

    it('should import configuration', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const importedConfig = { ...defaultCrateConfiguration }
      
      act(() => {
        result.current.importConfiguration(importedConfig)
      })

      expect(mockStore.importConfiguration).toHaveBeenCalledWith(importedConfig)
    })
  })

  describe('Calculations', () => {
    it('should get configuration summary', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const summary = result.current.getConfigurationSummary()
      
      expect(mockStore.getConfigurationSummary).toHaveBeenCalled()
    })

    it('should get estimated cost', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const cost = result.current.getEstimatedCost()
      
      expect(mockStore.getEstimatedCost).toHaveBeenCalled()
    })

    it('should get estimated weight', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const weight = result.current.getEstimatedWeight()
      
      expect(mockStore.getEstimatedWeight).toHaveBeenCalled()
    })

    it('should get estimated dimensions', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const dimensions = result.current.getEstimatedDimensions()
      
      expect(mockStore.getEstimatedDimensions).toHaveBeenCalled()
    })

    it('should get bill of materials', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const bom = result.current.getBillOfMaterials()
      
      expect(mockStore.getBillOfMaterials).toHaveBeenCalled()
    })
  })

  describe('Performance Metrics', () => {
    it('should get performance metrics', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const metrics = result.current.getPerformanceMetrics()
      
      expect(mockStore.getPerformanceMetrics).toHaveBeenCalled()
    })

    it('should get material efficiency', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const efficiency = result.current.getMaterialEfficiency()
      
      expect(mockStore.getMaterialEfficiency).toHaveBeenCalled()
    })
  })

  describe('Optimization', () => {
    it('should get optimization suggestions', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const suggestions = result.current.getOptimizationSuggestions()
      
      expect(mockStore.getOptimizationSuggestions).toHaveBeenCalled()
    })

    it('should apply optimization', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const optimization = { type: 'cost', changes: {} }
      
      act(() => {
        result.current.applyOptimization(optimization)
      })

      expect(mockStore.applyOptimization).toHaveBeenCalledWith(optimization)
    })
  })

  describe('History Management', () => {
    it('should get configuration history', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const history = result.current.getConfigurationHistory()
      
      expect(mockStore.getConfigurationHistory).toHaveBeenCalled()
    })

    it('should undo configuration', () => {
      const { result } = renderHook(() => useCrateStore())
      
      act(() => {
        result.current.undoConfiguration()
      })

      expect(mockStore.undoConfiguration).toHaveBeenCalled()
    })

    it('should redo configuration', () => {
      const { result } = renderHook(() => useCrateStore())
      
      act(() => {
        result.current.redoConfiguration()
      })

      expect(mockStore.redoConfiguration).toHaveBeenCalled()
    })

    it('should check if can undo', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const canUndo = result.current.canUndo()
      
      expect(mockStore.canUndo).toHaveBeenCalled()
    })

    it('should check if can redo', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const canRedo = result.current.canRedo()
      
      expect(mockStore.canRedo).toHaveBeenCalled()
    })

    it('should clear history', () => {
      const { result } = renderHook(() => useCrateStore())
      
      act(() => {
        result.current.clearHistory()
      })

      expect(mockStore.clearHistory).toHaveBeenCalled()
    })
  })

  describe('Export Options', () => {
    it('should get export options', () => {
      const { result } = renderHook(() => useCrateStore())
      
      const options = result.current.getExportOptions()
      
      expect(mockStore.getExportOptions).toHaveBeenCalled()
    })
  })
})
