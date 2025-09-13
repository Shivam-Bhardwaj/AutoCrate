'use client'

import { Suspense } from 'react'
import { useCrateStore, useCrateConfiguration, useValidationResults, useViewport } from '@/stores/crate-store'
import { CrateVisualizer } from '@/components/cad-viewer/CrateVisualizer'
import { ConfigurationPanel } from './ConfigurationPanel'
import { ValidationPanel } from './ValidationPanel'
import { ExportPanel } from './ExportPanel'
import { calculateCrateDimensions } from '@/lib/domain/calculations'

export function DesignStudio() {
  const configuration = useCrateConfiguration()
  const validationResults = useValidationResults()
  const viewport = useViewport()
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-professional border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-primary truncate">AutoCrate Design Studio</h1>
            <p className="text-xs sm:text-sm text-secondary truncate">Applied Materials Standards: AMAT-0251-70054</p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 ml-4">
            <div className="text-xs sm:text-sm text-secondary">
              {validationResults.length > 0 && (
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                  validationResults[0].isValid 
                    ? 'status-success' 
                    : 'status-error'
                }`}>
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
        <div className="w-full lg:w-80 bg-white shadow-professional-lg flex flex-col order-2 lg:order-1">
          <div className="flex-1 overflow-y-auto max-h-96 lg:max-h-none">
            <ConfigurationPanel />
          </div>
        </div>
        
        {/* Center Panel - 3D Viewer */}
        <div className="flex-1 flex flex-col order-1 lg:order-2">
          <div className="flex-1 relative min-h-96">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading 3D Viewer...</p>
                </div>
              </div>
            }>
              <CrateVisualizer
                config={configuration}
                showExploded={viewport.showExploded}
                className="h-full w-full"
              />
            </Suspense>
          </div>
          
          {/* 3D Controls */}
          <div className="bg-white border-t px-2 sm:px-4 py-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <label className="flex items-center space-x-1 sm:space-x-2">
                  <input
                    type="checkbox"
                    checked={viewport.showDimensions}
                    onChange={(e) => useCrateStore.getState().updateViewport({ 
                      showDimensions: e.target.checked 
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">Dimensions</span>
                </label>
                
                <label className="flex items-center space-x-1 sm:space-x-2">
                  <input
                    type="checkbox"
                    checked={viewport.showPMI}
                    onChange={(e) => useCrateStore.getState().updateViewport({ 
                      showPMI: e.target.checked 
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">PMI</span>
                </label>
                
                <label className="flex items-center space-x-1 sm:space-x-2">
                  <input
                    type="checkbox"
                    checked={viewport.showExploded}
                    onChange={(e) => useCrateStore.getState().updateViewport({ 
                      showExploded: e.target.checked 
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs sm:text-sm text-gray-700">Exploded</span>
                </label>
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
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Auto Fit
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Validation & Export */}
        <div className="w-full lg:w-80 bg-white shadow-professional-lg flex flex-col order-3">
          <div className="flex-1 overflow-y-auto max-h-96 lg:max-h-none">
            <ValidationPanel />
            <ExportPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
