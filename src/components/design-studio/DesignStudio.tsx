'use client'

import { Suspense, useState, useEffect } from 'react'
import { useCrateStore, useCrateConfiguration, useValidationResults, useViewport } from '@/stores/crate-store'
import { CrateVisualizer } from '@/components/cad-viewer/CrateVisualizer'
import { ConfigurationPanel } from './ConfigurationPanel'
import { ValidationPanel } from './ValidationPanel'
import { ExportPanel } from './ExportPanel'
import { MaterialOptimizer } from './MaterialOptimizer'
import { calculateCrateDimensions } from '@/lib/domain/calculations'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { KeyboardShortcutsHelp } from '@/components/accessibility/KeyboardShortcutsHelp'
import { SkipLinks } from '@/components/accessibility/SkipLinks'
import { announceToScreenReader } from '@/lib/accessibility'

export function DesignStudio() {
  const configuration = useCrateConfiguration()
  const validationResults = useValidationResults()
  const viewport = useViewport()
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  
  // Keyboard navigation setup
  const { addShortcut } = useKeyboardNavigation({
    enableGlobalShortcuts: true,
    enableFormNavigation: true,
    enablePanelNavigation: true,
    announceShortcuts: true
  })

  // Add keyboard shortcuts
  useEffect(() => {
    addShortcut({
      key: 'F1',
      action: () => setShowShortcutsHelp(true),
      description: 'Show keyboard shortcuts help'
    })

    addShortcut({
      key: 'r',
      action: () => {
        // Reset camera view
        const dimensions = calculateCrateDimensions(configuration)
        const halfWidth = dimensions.overallWidth / 2
        const halfLength = dimensions.overallLength / 2
        const halfHeight = dimensions.overallHeight / 2
        
        const diagonal = Math.sqrt(
          halfWidth * halfWidth + 
          halfLength * halfLength + 
          halfHeight * halfHeight
        )
        
        const fovRadians = (40 * Math.PI) / 180
        const distance = (diagonal * 1.2) / Math.tan(fovRadians / 2)
        
        const angle = Math.PI / 4
        const x = distance * Math.cos(angle)
        const y = distance * 0.6
        const z = distance * Math.sin(angle)
        
        const resetPosition: [number, number, number] = [x, y, z]
        
        useCrateStore.getState().updateViewport({
          camera: { position: resetPosition, target: [0, 0, 0] }
        })
        announceToScreenReader('Camera view reset')
      },
      description: 'Reset camera view'
    })

    addShortcut({
      key: 'd',
      action: () => {
        useCrateStore.getState().updateViewport({ 
          showDimensions: !viewport.showDimensions 
        })
        announceToScreenReader(`Dimensions display ${viewport.showDimensions ? 'disabled' : 'enabled'}`)
      },
      description: 'Toggle dimensions display'
    })

    addShortcut({
      key: 'p',
      action: () => {
        useCrateStore.getState().updateViewport({ 
          showPMI: !viewport.showPMI 
        })
        announceToScreenReader(`PMI annotations ${viewport.showPMI ? 'disabled' : 'enabled'}`)
      },
      description: 'Toggle PMI annotations'
    })

    addShortcut({
      key: 'e',
      action: () => {
        useCrateStore.getState().updateViewport({ 
          showExploded: !viewport.showExploded 
        })
        announceToScreenReader(`Exploded view ${viewport.showExploded ? 'disabled' : 'enabled'}`)
      },
      description: 'Toggle exploded view'
    })

    addShortcut({
      key: 'm',
      action: () => {
        useCrateStore.getState().updateViewport({ 
          enableMeasurement: !viewport.enableMeasurement 
        })
        announceToScreenReader(`Component metadata ${viewport.enableMeasurement ? 'disabled' : 'enabled'}`)
      },
      description: 'Toggle component metadata'
    })

    addShortcut({
      key: 's',
      ctrlKey: true,
      action: () => {
        // Save configuration (could be implemented later)
        announceToScreenReader('Configuration saved')
      },
      description: 'Save configuration'
    })
  }, [addShortcut, configuration, viewport])
  
  return (
    <>
      <SkipLinks />
      <div className="h-screen flex flex-col bg-gray-50" role="main" aria-label="AutoCrate Design Studio" id="main-content">
      {/* Header */}
      <header className="bg-white shadow-professional border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4" role="banner">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate" id="main-heading">
              AutoCrate Design Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 truncate" aria-describedby="main-heading">
              Applied Materials Standards: AMAT-0251-70054
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
            <div className="text-xs sm:text-sm text-slate-600">
              {validationResults.length > 0 && (
                <span 
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                    validationResults[0].isValid 
                      ? 'status-success' 
                      : 'status-error'
                  }`}
                  role="status"
                  aria-live="polite"
                  aria-label={`Configuration ${validationResults[0].isValid ? 'is valid' : 'has issues'}`}
                >
                  {validationResults[0].isValid ? 'Valid' : 'Issues'}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Configuration */}
        <aside className="w-full lg:w-80 bg-white shadow-professional-lg flex flex-col order-2 lg:order-1" 
               role="complementary" 
               aria-label="Configuration Panel"
               id="configuration-panel"
               tabIndex={-1}>
          <div className="flex-1 overflow-y-auto max-h-96 lg:max-h-none">
            <ConfigurationPanel />
          </div>
        </aside>
        
        {/* Center Panel - 3D Viewer */}
        <section className="flex-1 flex flex-col order-1 lg:order-2" 
                 role="region" 
                 aria-label="3D Crate Visualization"
                 id="3d-viewer"
                 tabIndex={-1}>
          <div className="flex-1 relative min-h-96">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center bg-gray-100" role="status" aria-live="polite">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" 
                       aria-hidden="true"></div>
                  <p className="text-gray-600">Loading 3D Viewer...</p>
                </div>
              </div>
            }>
              <CrateVisualizer
                config={configuration}
                showExploded={viewport.showExploded}
                showPMI={viewport.showPMI}
                showDimensions={viewport.showDimensions}
                enableMeasurement={viewport.enableMeasurement || false}
                className="h-full w-full"
              />
            </Suspense>
          </div>
          
          {/* 3D Controls */}
          <div className="bg-white border-t px-2 sm:px-4 py-2" role="toolbar" aria-label="3D Viewer Controls">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <label className="flex items-center space-x-1 sm:space-x-2">
                  <input
                    type="checkbox"
                    checked={viewport.showDimensions}
                    onChange={(e) => useCrateStore.getState().updateViewport({ 
                      showDimensions: e.target.checked 
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    aria-describedby="dimensions-help"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">Dimensions</span>
                </label>
                <span id="dimensions-help" className="sr-only">Toggle display of crate dimensions in the 3D viewer</span>
                
                <label className="flex items-center space-x-1 sm:space-x-2">
                  <input
                    type="checkbox"
                    checked={viewport.showPMI}
                    onChange={(e) => useCrateStore.getState().updateViewport({ 
                      showPMI: e.target.checked 
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    aria-describedby="pmi-help"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">PMI</span>
                </label>
                <span id="pmi-help" className="sr-only">Toggle display of Product Manufacturing Information annotations</span>
                
                <label className="flex items-center space-x-1 sm:space-x-2">
                  <input
                    type="checkbox"
                    checked={viewport.showExploded}
                    onChange={(e) => useCrateStore.getState().updateViewport({ 
                      showExploded: e.target.checked 
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    aria-describedby="exploded-help"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">Exploded</span>
                </label>
                <span id="exploded-help" className="sr-only">Toggle exploded view of crate components</span>
                
                <label className="flex items-center space-x-1 sm:space-x-2">
                  <input
                    type="checkbox"
                    checked={viewport.enableMeasurement || false}
                    onChange={(e) => useCrateStore.getState().updateViewport({ 
                      enableMeasurement: e.target.checked 
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    aria-describedby="measurements-help"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">Metadata</span>
                </label>
                <span id="measurements-help" className="sr-only">Enable component metadata display on hover in the 3D viewer</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const dimensions = calculateCrateDimensions(configuration)
                    
                    // Calculate optimal camera position using same logic as CrateVisualizer
                    const halfWidth = dimensions.overallWidth / 2
                    const halfLength = dimensions.overallLength / 2
                    const halfHeight = dimensions.overallHeight / 2
                    
                    const diagonal = Math.sqrt(
                      halfWidth * halfWidth + 
                      halfLength * halfLength + 
                      halfHeight * halfHeight
                    )
                    
                    const fovRadians = (40 * Math.PI) / 180
                    const distance = (diagonal * 1.2) / Math.tan(fovRadians / 2)
                    
                    const angle = Math.PI / 4
                    const x = distance * Math.cos(angle)
                    const y = distance * 0.6
                    const z = distance * Math.sin(angle)
                    
                    const resetPosition: [number, number, number] = [x, y, z]
                    
                    useCrateStore.getState().updateViewport({
                      camera: { position: resetPosition, target: [0, 0, 0] }
                    })
                  }}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Reset camera to auto-fit view of the entire crate"
                >
                  Auto Fit
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel - Validation, Optimization & Export */}
        <aside className="w-full lg:w-80 bg-white shadow-professional-lg flex flex-col order-3" 
               role="complementary" 
               aria-label="Validation, Optimization and Export Panel"
               id="validation-panel"
               tabIndex={-1}>
          <div className="flex-1 overflow-y-auto max-h-96 lg:max-h-none">
            <ValidationPanel />
            <MaterialOptimizer />
            <ExportPanel />
          </div>
        </aside>
      </div>
    </div>
    
    {/* Keyboard Shortcuts Help Modal */}
    <KeyboardShortcutsHelp 
      isOpen={showShortcutsHelp} 
      onClose={() => setShowShortcutsHelp(false)} 
    />
    </>
  )
}
