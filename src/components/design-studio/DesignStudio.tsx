'use client'

import { Suspense } from 'react'
import { useCrateStore, useCrateConfiguration, useValidationResults, useViewport } from '@/stores/crate-store'
import { CrateVisualizer } from '@/components/cad-viewer/CrateVisualizer'
import { ConfigurationPanel } from './ConfigurationPanel'
import { ValidationPanel } from './ValidationPanel'
import { ExportPanel } from './ExportPanel'

export function DesignStudio() {
  const configuration = useCrateConfiguration()
  const validationResults = useValidationResults()
  const viewport = useViewport()
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AutoCrate Design Studio</h1>
            <p className="text-sm text-gray-600">Applied Materials Standards: AMAT-0251-70054</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {validationResults.length > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  validationResults[0].isValid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {validationResults[0].isValid ? 'Valid' : 'Issues Found'}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Configuration */}
        <div className="w-80 bg-white shadow-lg flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <ConfigurationPanel />
          </div>
        </div>
        
        {/* Center Panel - 3D Viewer */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
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
                showPMI={viewport.showPMI}
                showDimensions={viewport.showDimensions}
                showExploded={viewport.showExploded}
                className="h-full w-full"
              />
            </Suspense>
          </div>
          
          {/* 3D Controls */}
          <div className="bg-white border-t px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={viewport.showDimensions}
                    onChange={(e) => useCrateStore.getState().updateViewport({ 
                      showDimensions: e.target.checked 
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Show Dimensions</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={viewport.showPMI}
                    onChange={(e) => useCrateStore.getState().updateViewport({ 
                      showPMI: e.target.checked 
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Show PMI</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={viewport.showExploded}
                    onChange={(e) => useCrateStore.getState().updateViewport({ 
                      showExploded: e.target.checked 
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Exploded View</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => useCrateStore.getState().updateViewport({
                    camera: { position: [10, 10, 10], target: [0, 0, 0] }
                  })}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Reset View
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Validation & Export */}
        <div className="w-80 bg-white shadow-lg flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <ValidationPanel />
            <ExportPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
