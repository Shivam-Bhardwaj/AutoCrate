'use client'

import { useMemo, useState } from 'react'
import { Html } from '@react-three/drei'
import { CrateConfiguration, CrateDimensions } from '@/types/crate'
import { generateBillOfMaterials, calculateMaterialEfficiency, calculateCrateWeight } from '@/lib/domain/calculations'

interface PMIAnnotationsProps {
  config: CrateConfiguration
  dimensions: CrateDimensions
  showPMI: boolean
  showAdvancedInfo?: boolean
}

interface AdvancedPMIInfo {
  materialEfficiency: number
  totalWeight: number
  materialCost: number
  manufacturingTime: number
  appliedMaterialsStandard: string
  toleranceInfo: {
    dimensional: string
    weight: string
    clearance: string
  }
  qualityRequirements: string[]
}

export function PMIAnnotations({ config, dimensions, showPMI, showAdvancedInfo = false }: PMIAnnotationsProps) {
  const [expandedAnnotations, setExpandedAnnotations] = useState<Set<string>>(new Set())

  // Calculate advanced manufacturing information
  const advancedInfo = useMemo((): AdvancedPMIInfo => {
    const bom = generateBillOfMaterials(config)
    const efficiency = calculateMaterialEfficiency(config)
    const weight = calculateCrateWeight(config)
    
    return {
      materialEfficiency: efficiency,
      totalWeight: weight,
      materialCost: bom.totalCost,
      manufacturingTime: Math.round(weight * 0.1 + bom.items.length * 0.5), // Estimated in minutes
      appliedMaterialsStandard: 'AMAT-0251-70054',
      toleranceInfo: {
        dimensional: '±0.125"',
        weight: '±5%',
        clearance: '±0.25"'
      },
      qualityRequirements: [
        'Lumber grade: ' + config.materials.lumber.grade,
        'Plywood grade: ' + config.materials.plywood.grade,
        'Fastener specification: #10 x 2" deck screws',
        'Finish: Weather-resistant treatment required'
      ]
    }
  }, [config])

  const toggleAnnotationExpansion = (annotationId: string) => {
    setExpandedAnnotations(prev => {
      const newSet = new Set(prev)
      if (newSet.has(annotationId)) {
        newSet.delete(annotationId)
      } else {
        newSet.add(annotationId)
      }
      return newSet
    })
  }
  const annotations = useMemo(() => {
    if (!showPMI) return []
    
    return [
      // Overall dimensions
      {
        id: 'overall-width',
        position: [0, dimensions.overallHeight / 2, 0] as [number, number, number],
        text: `W: ${dimensions.overallWidth.toFixed(1)}"`,
        color: '#2563eb'
      },
      {
        id: 'overall-length',
        position: [0, dimensions.overallHeight / 2, 0] as [number, number, number],
        text: `L: ${dimensions.overallLength.toFixed(1)}"`,
        color: '#2563eb'
      },
      {
        id: 'overall-height',
        position: [dimensions.overallWidth / 2 + 2, 0, 0] as [number, number, number],
        text: `H: ${dimensions.overallHeight.toFixed(1)}"`,
        color: '#2563eb'
      },
      
      // Product dimensions
      {
        id: 'product-width',
        position: [0, config.product.height / 2, 0] as [number, number, number],
        text: `Product W: ${config.product.width.toFixed(1)}"`,
        color: '#dc2626'
      },
      {
        id: 'product-length',
        position: [0, config.product.height / 2, 0] as [number, number, number],
        text: `Product L: ${config.product.length.toFixed(1)}"`,
        color: '#dc2626'
      },
      {
        id: 'product-height',
        position: [config.product.width / 2 + 1, 0, 0] as [number, number, number],
        text: `Product H: ${config.product.height.toFixed(1)}"`,
        color: '#dc2626'
      },
      
      // Clearances
      {
        id: 'clearance-width',
        position: [0, config.product.height / 2 + config.clearances.height / 2, 0] as [number, number, number],
        text: `Clearance: ${config.clearances.width.toFixed(1)}"`,
        color: '#059669'
      },
      
      // Weight annotation
      {
        id: 'weight',
        position: [0, config.product.height + 2, 0] as [number, number, number],
        text: `Weight: ${config.product.weight} lbs`,
        color: '#7c3aed'
      },

      // Advanced manufacturing information
      ...(showAdvancedInfo ? [
        {
          id: 'material-efficiency',
          position: [dimensions.overallWidth / 2 + 3, dimensions.overallHeight / 2, 0] as [number, number, number],
          text: `Efficiency: ${advancedInfo.materialEfficiency.toFixed(1)}%`,
          color: '#059669',
          expandable: true
        },
        {
          id: 'manufacturing-time',
          position: [dimensions.overallWidth / 2 + 3, dimensions.overallHeight / 2 - 1, 0] as [number, number, number],
          text: `Build Time: ${advancedInfo.manufacturingTime} min`,
          color: '#dc2626',
          expandable: true
        },
        {
          id: 'material-cost',
          position: [dimensions.overallWidth / 2 + 3, dimensions.overallHeight / 2 - 2, 0] as [number, number, number],
          text: `Cost: $${advancedInfo.materialCost.toFixed(2)}`,
          color: '#7c3aed',
          expandable: true
        },
        {
          id: 'tolerances',
          position: [-dimensions.overallWidth / 2 - 3, dimensions.overallHeight / 2, 0] as [number, number, number],
          text: `Tolerances: ${advancedInfo.toleranceInfo.dimensional}`,
          color: '#f59e0b',
          expandable: true
        },
        {
          id: 'quality-requirements',
          position: [-dimensions.overallWidth / 2 - 3, dimensions.overallHeight / 2 - 1, 0] as [number, number, number],
          text: `Quality: ${config.materials.lumber.grade} Grade`,
          color: '#8b5cf6',
          expandable: true
        }
      ] : [])
    ]
  }, [config, dimensions, showPMI, showAdvancedInfo, advancedInfo])

  if (!showPMI) return null

  const renderExpandedContent = (annotationId: string) => {
    switch (annotationId) {
      case 'material-efficiency':
        return (
          <div className="mt-2 p-2 bg-white rounded shadow-lg text-xs max-w-xs">
            <div className="font-semibold text-gray-800 mb-1">Material Efficiency Details</div>
            <div className="text-gray-600">
              <div>Current: {advancedInfo.materialEfficiency.toFixed(1)}%</div>
              <div>Target: 90%+</div>
              <div>Waste: {(100 - advancedInfo.materialEfficiency).toFixed(1)}%</div>
            </div>
          </div>
        )
      case 'manufacturing-time':
        return (
          <div className="mt-2 p-2 bg-white rounded shadow-lg text-xs max-w-xs">
            <div className="font-semibold text-gray-800 mb-1">Manufacturing Time</div>
            <div className="text-gray-600">
              <div>Estimated: {advancedInfo.manufacturingTime} minutes</div>
              <div>Complexity: {advancedInfo.manufacturingTime > 60 ? 'High' : 'Medium'}</div>
              <div>Labor Cost: ${(advancedInfo.manufacturingTime * 0.5).toFixed(2)}</div>
            </div>
          </div>
        )
      case 'material-cost':
        return (
          <div className="mt-2 p-2 bg-white rounded shadow-lg text-xs max-w-xs">
            <div className="font-semibold text-gray-800 mb-1">Cost Breakdown</div>
            <div className="text-gray-600">
              <div>Materials: ${advancedInfo.materialCost.toFixed(2)}</div>
              <div>Labor: ${(advancedInfo.manufacturingTime * 0.5).toFixed(2)}</div>
              <div>Total: ${(advancedInfo.materialCost + advancedInfo.manufacturingTime * 0.5).toFixed(2)}</div>
            </div>
          </div>
        )
      case 'tolerances':
        return (
          <div className="mt-2 p-2 bg-white rounded shadow-lg text-xs max-w-xs">
            <div className="font-semibold text-gray-800 mb-1">Tolerance Specifications</div>
            <div className="text-gray-600">
              <div>Dimensional: {advancedInfo.toleranceInfo.dimensional}</div>
              <div>Weight: {advancedInfo.toleranceInfo.weight}</div>
              <div>Clearance: {advancedInfo.toleranceInfo.clearance}</div>
              <div>Standard: {advancedInfo.appliedMaterialsStandard}</div>
            </div>
          </div>
        )
      case 'quality-requirements':
        return (
          <div className="mt-2 p-2 bg-white rounded shadow-lg text-xs max-w-xs">
            <div className="font-semibold text-gray-800 mb-1">Quality Requirements</div>
            <div className="text-gray-600">
              {advancedInfo.qualityRequirements.map((req, index) => (
                <div key={index} className="mb-1">• {req}</div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <group>
      {annotations.map((annotation) => (
        <Html
          key={annotation.id}
          position={annotation.position}
          center
          distanceFactor={10}
          zIndexRange={[100, 0]}
        >
          <div className="relative">
            <div 
              className={`px-2 py-1 text-xs font-medium text-white rounded shadow-lg cursor-pointer hover:opacity-80 transition-opacity ${
                annotation.expandable ? 'border-2 border-white' : ''
              }`}
              style={{ backgroundColor: annotation.color }}
              onClick={() => annotation.expandable && toggleAnnotationExpansion(annotation.id)}
            >
              {annotation.text}
              {annotation.expandable && (
                <span className="ml-1">
                  {expandedAnnotations.has(annotation.id) ? '▼' : '▶'}
                </span>
              )}
            </div>
            {annotation.expandable && expandedAnnotations.has(annotation.id) && 
              renderExpandedContent(annotation.id)
            }
          </div>
        </Html>
      ))}
    </group>
  )
}
