'use client'

import { useState, useMemo, useEffect } from 'react'
import { useCrateStore, useCrateConfiguration } from '@/stores/crate-store'
import { generateBillOfMaterials, calculateMaterialEfficiency, calculateCrateWeight } from '@/lib/domain/calculations'
import { announceToScreenReader } from '@/lib/accessibility'

interface OptimizationResult {
  type: 'cost' | 'weight' | 'waste'
  improvement: number
  description: string
  recommendations: string[]
}

export function MaterialOptimizer() {
  const configuration = useCrateConfiguration()
  const updateConfiguration = useCrateStore(state => state.updateConfiguration)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([])

  const currentBOM = useMemo(() => generateBillOfMaterials(configuration), [configuration])
  const currentEfficiency = useMemo(() => calculateMaterialEfficiency(configuration), [configuration])
  const currentWeight = useMemo(() => calculateCrateWeight(configuration), [configuration])

  // Announce optimization results to screen readers
  useEffect(() => {
    if (optimizationResults.length > 0) {
      const totalImprovements = optimizationResults.reduce((sum, result) => sum + result.improvement, 0)
      announceToScreenReader(`Material optimization complete. Found ${optimizationResults.length} opportunities with total improvement potential of ${totalImprovements}%.`)
    }
  }, [optimizationResults])

  const runOptimization = async () => {
    setIsOptimizing(true)
    announceToScreenReader('Starting material optimization analysis...')
    
    // Simulate optimization analysis
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const results: OptimizationResult[] = []
    
    // Cost optimization analysis
    if (configuration.materials.lumber.grade === 'Select' && configuration.product.weight < 1000) {
      results.push({
        type: 'cost',
        improvement: 15,
        description: 'Downgrade lumber grade for lighter products',
        recommendations: [
          'Use #2 grade lumber instead of Select grade',
          'Estimated cost savings: 15%',
          'Maintains structural integrity for products under 1000 lbs'
        ]
      })
    }
    
    // Weight optimization analysis
    if (configuration.materials.plywood.thickness > 0.75 && configuration.product.weight < 500) {
      results.push({
        type: 'weight',
        improvement: 8,
        description: 'Reduce plywood thickness for lighter products',
        recommendations: [
          'Use 5/8" plywood instead of 3/4"',
          'Estimated weight reduction: 8%',
          'Sufficient for products under 500 lbs'
        ]
      })
    }
    
    // Waste optimization analysis
    if (currentEfficiency < 90) {
      results.push({
        type: 'waste',
        improvement: 12,
        description: 'Optimize panel dimensions to reduce waste',
        recommendations: [
          'Adjust panel sizes to standard lumber dimensions',
          'Estimated waste reduction: 12%',
          'Use standard 4x8 plywood sheets more efficiently'
        ]
      })
    }
    
    setOptimizationResults(results)
    setIsOptimizing(false)
  }

  const applyOptimization = (result: OptimizationResult) => {
    switch (result.type) {
      case 'cost':
        if (result.description.includes('Downgrade lumber grade')) {
          updateConfiguration({
            materials: {
              ...configuration.materials,
              lumber: { ...configuration.materials.lumber, grade: '#2' }
            }
          })
          announceToScreenReader('Applied cost optimization: Lumber grade downgraded to #2')
        }
        break
      case 'weight':
        if (result.description.includes('Reduce plywood thickness')) {
          updateConfiguration({
            materials: {
              ...configuration.materials,
              plywood: { ...configuration.materials.plywood, thickness: 0.625 }
            }
          })
          announceToScreenReader('Applied weight optimization: Plywood thickness reduced to 5/8 inch')
        }
        break
      case 'waste':
        // For waste optimization, we would need more complex logic
        // This is a placeholder for the optimization algorithm
        announceToScreenReader('Waste optimization requires manual adjustment of panel dimensions')
        break
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Material Optimization</h3>
        <button
          onClick={runOptimization}
          disabled={isOptimizing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-describedby="optimization-help"
        >
          {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
        </button>
        <span id="optimization-help" className="sr-only">Analyze current configuration for material optimization opportunities</span>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg" role="region" aria-label="Current material metrics">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600" aria-label={`Material efficiency: ${currentEfficiency.toFixed(1)} percent`}>{currentEfficiency.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Material Efficiency</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600" aria-label={`Crate weight: ${currentWeight.toFixed(0)} pounds`}>{currentWeight.toFixed(0)} lbs</div>
          <div className="text-sm text-gray-600">Crate Weight</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600" aria-label={`Material waste: ${currentBOM.materialWaste.toFixed(1)} percent`}>{currentBOM.materialWaste.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Material Waste</div>
        </div>
      </div>

      {/* Optimization Results */}
      {optimizationResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-slate-800">Optimization Opportunities</h4>
          {optimizationResults.map((result, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium text-slate-800">{result.description}</div>
                  <div className="text-sm text-green-600">+{result.improvement}% improvement</div>
                </div>
                <button
                  onClick={() => applyOptimization(result)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  aria-label={`Apply ${result.type} optimization: ${result.description}`}
                >
                  Apply
                </button>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {result.recommendations.map((rec, recIndex) => (
                  <li key={recIndex} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Material Usage Breakdown */}
      <div className="space-y-3">
        <h4 className="text-md font-medium text-slate-800">Material Usage</h4>
        <div className="space-y-2">
          {currentBOM.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <div className="font-medium text-sm">{item.description}</div>
                {item.dimensions && (
                  <div className="text-xs text-gray-600">
                    {item.dimensions.length}&quot; × {item.dimensions.width}&quot; × {item.dimensions.thickness}&quot;
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-medium text-sm">{item.quantity} {item.unit}</div>
                {item.cost && (
                  <div className="text-xs text-gray-600">${item.cost.toFixed(2)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
