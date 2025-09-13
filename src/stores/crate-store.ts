import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { 
  CrateConfiguration, 
  ValidationResult, 
  ViewportState, 
  ExportJob,
  defaultCrateConfiguration,
  appliedMaterialsStandards
} from '@/types/crate'
import { validateCrateConfiguration } from '@/lib/domain/validation'

interface CrateStore {
  // Configuration State
  configuration: CrateConfiguration
  updateConfiguration: (config: Partial<CrateConfiguration>) => void
  resetConfiguration: () => void
  
  // Validation State
  validationResults: ValidationResult[]
  isValidating: boolean
  validateConfiguration: () => Promise<void>
  
  // 3D Visualization State
  viewport: ViewportState
  updateViewport: (viewport: Partial<ViewportState>) => void
  
  // Export State
  exportQueue: ExportJob[]
  isExporting: boolean
  addExportJob: (job: Omit<ExportJob, 'id' | 'createdAt'>) => string
  updateExportJob: (id: string, updates: Partial<ExportJob>) => void
  removeExportJob: (id: string) => void
  
  // Applied Materials Standards
  standards: typeof appliedMaterialsStandards
  validateStandardsCompliance: () => ValidationResult
  
  // Persistence
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => void
}

// Generate unique ID for export jobs
const generateId = (): string => {
  return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Default viewport state
const defaultViewport: ViewportState = {
  camera: {
    position: [10, 10, 10],
    target: [0, 0, 0]
  },
  selectedComponents: [],
  showDimensions: true,
  showPMI: false,
  showExploded: false
}

// Validation function using domain logic
const validateConfiguration = async (config: CrateConfiguration): Promise<ValidationResult> => {
  // Simulate small delay for real-time feel
  await new Promise(resolve => setTimeout(resolve, 50))
  
  // Use the real validation logic
  return validateCrateConfiguration(config)
}

// Standards compliance validation (simplified - main validation is in domain logic)
const validateStandardsCompliance = (config: CrateConfiguration): ValidationResult => {
  // This is now handled by the main validation function
  return validateCrateConfiguration(config)
}

export const useCrateStore = create<CrateStore>()(
  persist(
    (set, get) => ({
      // Configuration State
      configuration: defaultCrateConfiguration,
      
      updateConfiguration: (config) => {
        set((state) => ({
          configuration: { ...state.configuration, ...config }
        }))
        // Trigger real-time validation
        get().validateConfiguration()
      },
      
      resetConfiguration: () => {
        set({ configuration: defaultCrateConfiguration })
        get().validateConfiguration()
      },
      
      // Validation State
      validationResults: [],
      isValidating: false,
      
      validateConfiguration: async () => {
        set({ isValidating: true })
        try {
          const results = await validateConfiguration(get().configuration)
          const standardsResults = validateStandardsCompliance(get().configuration)
          
          // Combine validation results
          const combinedResults: ValidationResult = {
            isValid: results.isValid && standardsResults.isValid,
            errors: [...results.errors, ...standardsResults.errors],
            warnings: [...results.warnings, ...standardsResults.warnings],
            timestamp: new Date()
          }
          
          set({ 
            validationResults: [combinedResults],
            isValidating: false 
          })
        } catch (error) {
          console.error('Validation failed:', error)
          set({ 
            validationResults: [{
              isValid: false,
              errors: [{
                code: 'VALIDATION_ERROR',
                message: 'Validation failed due to system error',
                field: 'system',
                severity: 'error'
              }],
              warnings: [],
              timestamp: new Date()
            }],
            isValidating: false 
          })
        }
      },
      
      // 3D Visualization State
      viewport: defaultViewport,
      
      updateViewport: (viewport) => {
        set((state) => ({
          viewport: { ...state.viewport, ...viewport }
        }))
      },
      
      // Export State
      exportQueue: [],
      isExporting: false,
      
      addExportJob: (job) => {
        const newJob: ExportJob = {
          ...job,
          id: generateId(),
          createdAt: new Date()
        }
        
        set((state) => ({
          exportQueue: [...state.exportQueue, newJob],
          isExporting: true
        }))
        
        return newJob.id
      },
      
      updateExportJob: (id, updates) => {
        set((state) => ({
          exportQueue: state.exportQueue.map(job =>
            job.id === id ? { ...job, ...updates } : job
          ),
          isExporting: state.exportQueue.some(job => 
            job.id !== id && job.status === 'processing'
          )
        }))
      },
      
      removeExportJob: (id) => {
        set((state) => ({
          exportQueue: state.exportQueue.filter(job => job.id !== id),
          isExporting: state.exportQueue.some(job => 
            job.id !== id && job.status === 'processing'
          )
        }))
      },
      
      // Applied Materials Standards
      standards: appliedMaterialsStandards,
      
      validateStandardsCompliance: () => {
        return validateStandardsCompliance(get().configuration)
      },
      
      // Persistence
      saveToLocalStorage: () => {
        // Zustand persist middleware handles this automatically
        console.log('Configuration saved to localStorage')
      },
      
      loadFromLocalStorage: () => {
        // Zustand persist middleware handles this automatically
        console.log('Configuration loaded from localStorage')
      }
    }),
    {
      name: 'autocrate-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        configuration: state.configuration,
        viewport: state.viewport 
      })
    }
  )
)

// Selectors for common use cases
export const useCrateConfiguration = () => useCrateStore(state => state.configuration)
export const useValidationResults = () => useCrateStore(state => state.validationResults)
export const useViewport = () => useCrateStore(state => state.viewport)
export const useExportQueue = () => useCrateStore(state => state.exportQueue)
