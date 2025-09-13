'use client'

import { useCrateStore, useCrateConfiguration } from '@/stores/crate-store'

export function ConfigurationPanel() {
  const configuration = useCrateConfiguration()
  const updateConfiguration = useCrateStore(state => state.updateConfiguration)
  
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Crate Configuration</h2>
      
      {/* Product Specifications */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-800">Product Specifications</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Length (in)
            </label>
            <input
              type="number"
              value={configuration.product.length}
              onChange={(e) => updateConfiguration({
                product: { ...configuration.product, length: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (in)
            </label>
            <input
              type="number"
              value={configuration.product.width}
              onChange={(e) => updateConfiguration({
                product: { ...configuration.product, width: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (in)
            </label>
            <input
              type="number"
              value={configuration.product.height}
              onChange={(e) => updateConfiguration({
                product: { ...configuration.product, height: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (lbs)
            </label>
            <input
              type="number"
              value={configuration.product.weight}
              onChange={(e) => updateConfiguration({
                product: { ...configuration.product, weight: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="1"
              min="0"
            />
          </div>
        </div>
      </div>
      
      {/* Clearances */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-800">Clearances</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (in)
            </label>
            <input
              type="number"
              value={configuration.clearances.width}
              onChange={(e) => updateConfiguration({
                clearances: { ...configuration.clearances, width: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Length (in)
            </label>
            <input
              type="number"
              value={configuration.clearances.length}
              onChange={(e) => updateConfiguration({
                clearances: { ...configuration.clearances, length: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Height (in)
            </label>
            <input
              type="number"
              value={configuration.clearances.height}
              onChange={(e) => updateConfiguration({
                clearances: { ...configuration.clearances, height: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
              min="1"
            />
          </div>
        </div>
      </div>
      
      {/* Skid Configuration */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-800">Skid Configuration</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Count
            </label>
            <input
              type="number"
              value={configuration.skids.count}
              onChange={(e) => updateConfiguration({
                skids: { ...configuration.skids, count: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pitch (in)
            </label>
            <input
              type="number"
              value={configuration.skids.pitch}
              onChange={(e) => updateConfiguration({
                skids: { ...configuration.skids, pitch: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="1"
              min="12"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Front Overhang (in)
            </label>
            <input
              type="number"
              value={configuration.skids.overhang.front}
              onChange={(e) => updateConfiguration({
                skids: { 
                  ...configuration.skids, 
                  overhang: { 
                    ...configuration.skids.overhang, 
                    front: Number(e.target.value) 
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Back Overhang (in)
            </label>
            <input
              type="number"
              value={configuration.skids.overhang.back}
              onChange={(e) => updateConfiguration({
                skids: { 
                  ...configuration.skids, 
                  overhang: { 
                    ...configuration.skids.overhang, 
                    back: Number(e.target.value) 
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.1"
              min="1"
            />
          </div>
        </div>
      </div>
      
      {/* Material Specifications */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-800">Materials</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lumber Grade
            </label>
            <select
              value={configuration.materials.lumber.grade}
              onChange={(e) => updateConfiguration({
                materials: {
                  ...configuration.materials,
                  lumber: { ...configuration.materials.lumber, grade: e.target.value as 'Standard' | '#2' | '#1' | 'Select' }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Standard">Standard</option>
              <option value="#2">#2</option>
              <option value="#1">#1</option>
              <option value="Select">Select</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plywood Grade
            </label>
            <select
              value={configuration.materials.plywood.grade}
              onChange={(e) => updateConfiguration({
                materials: {
                  ...configuration.materials,
                  plywood: { ...configuration.materials.plywood, grade: e.target.value as 'CDX' | 'BC' | 'AC' }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CDX">CDX</option>
              <option value="BC">BC</option>
              <option value="AC">AC</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plywood Thickness (in)
            </label>
            <input
              type="number"
              value={configuration.materials.plywood.thickness}
              onChange={(e) => updateConfiguration({
                materials: {
                  ...configuration.materials,
                  plywood: { ...configuration.materials.plywood, thickness: Number(e.target.value) }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.125"
              min="0.5"
              max="1.5"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
