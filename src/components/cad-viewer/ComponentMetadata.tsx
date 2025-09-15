'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import { Html } from '@react-three/drei'
import { CrateConfiguration, CrateDimensions } from '@/types/crate'
import { generateBillOfMaterials, calculateMaterialEfficiency, calculateCrateWeight } from '@/lib/domain/calculations'

interface ComponentMetadataProps {
  config: CrateConfiguration
  dimensions: CrateDimensions
  showMetadata: boolean
}

interface ComponentInfo {
  id: string
  name: string
  type: 'panel' | 'skid' | 'product' | 'clearance' | 'overall'
  position: [number, number, number]
  dimensions: {
    length: number
    width: number
    height: number
  }
  material?: {
    type: string
    grade: string
    thickness?: number
  }
  weight?: number
  cost?: number
  specifications: string[]
  manufacturingNotes: string[]
}

export function ComponentMetadata({ config, dimensions, showMetadata }: ComponentMetadataProps) {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<[number, number]>([0, 0])
  const timeoutRef = useRef<NodeJS.Timeout>()

  // Generate component metadata
  const components = useMemo((): ComponentInfo[] => {
    if (!showMetadata) return []
    
    const bom = generateBillOfMaterials(config)
    const efficiency = calculateMaterialEfficiency(config)
    const weight = calculateCrateWeight(config)
    
    return [
      // Product component
      {
        id: 'product',
        name: 'Product',
        type: 'product',
        position: [0, config.product.height / 2, 0] as [number, number, number],
        dimensions: {
          length: config.product.length,
          width: config.product.width,
          height: config.product.height
        },
        weight: config.product.weight,
        specifications: [
          `Dimensions: ${config.product.length}" × ${config.product.width}" × ${config.product.height}"`,
          `Weight: ${config.product.weight} lbs`,
          `Center of Gravity: X:${config.product.centerOfGravity.x}", Y:${config.product.centerOfGravity.y}", Z:${config.product.centerOfGravity.z}"`,
          `Handling Requirements: ${config.product.weight > 1000 ? 'Heavy lift equipment required' : 'Standard handling'}`
        ],
        manufacturingNotes: [
          'Product must be centered in crate',
          'Center of gravity must be within acceptable limits',
          'Protective padding required around product'
        ]
      },
      
      // Bottom panel
      {
        id: 'bottom-panel',
        name: 'Bottom Panel',
        type: 'panel',
        position: [0, -dimensions.overallHeight / 2 + config.materials.plywood.thickness / 2, 0] as [number, number, number],
        dimensions: {
          length: dimensions.overallLength,
          width: dimensions.overallWidth,
          height: config.materials.plywood.thickness
        },
        material: {
          type: 'Plywood',
          grade: config.materials.plywood.grade,
          thickness: config.materials.plywood.thickness
        },
        weight: dimensions.overallLength * dimensions.overallWidth * config.materials.plywood.thickness * 0.02, // Approximate
        cost: bom.items.find(item => item.description.includes('Bottom'))?.cost || 0,
        specifications: [
          `Material: ${config.materials.plywood.grade} Plywood`,
          `Thickness: ${config.materials.plywood.thickness}"`,
          `Dimensions: ${dimensions.overallLength}" × ${dimensions.overallWidth}"`,
          `Weight: ${(dimensions.overallLength * dimensions.overallWidth * config.materials.plywood.thickness * 0.02).toFixed(1)} lbs`
        ],
        manufacturingNotes: [
          'Must support full product weight',
          'Edge banding required for durability',
          'Moisture-resistant treatment recommended'
        ]
      },
      
      // Side panels
      {
        id: 'side-panel-1',
        name: 'Side Panel (Left)',
        type: 'panel',
        position: [-dimensions.overallWidth / 2 + config.materials.plywood.thickness / 2, 0, 0] as [number, number, number],
        dimensions: {
          length: dimensions.overallLength,
          width: config.materials.plywood.thickness,
          height: dimensions.overallHeight
        },
        material: {
          type: 'Plywood',
          grade: config.materials.plywood.grade,
          thickness: config.materials.plywood.thickness
        },
        weight: dimensions.overallLength * dimensions.overallHeight * config.materials.plywood.thickness * 0.02,
        cost: bom.items.find(item => item.description.includes('Side'))?.cost || 0,
        specifications: [
          `Material: ${config.materials.plywood.grade} Plywood`,
          `Thickness: ${config.materials.plywood.thickness}"`,
          `Dimensions: ${dimensions.overallLength}" × ${dimensions.overallHeight}"`,
          `Weight: ${(dimensions.overallLength * dimensions.overallHeight * config.materials.plywood.thickness * 0.02).toFixed(1)} lbs`
        ],
        manufacturingNotes: [
          'Reinforcement at corners required',
          'Ventilation holes may be needed',
          'Smooth finish for product protection'
        ]
      },
      
      {
        id: 'side-panel-2',
        name: 'Side Panel (Right)',
        type: 'panel',
        position: [dimensions.overallWidth / 2 - config.materials.plywood.thickness / 2, 0, 0] as [number, number, number],
        dimensions: {
          length: dimensions.overallLength,
          width: config.materials.plywood.thickness,
          height: dimensions.overallHeight
        },
        material: {
          type: 'Plywood',
          grade: config.materials.plywood.grade,
          thickness: config.materials.plywood.thickness
        },
        weight: dimensions.overallLength * dimensions.overallHeight * config.materials.plywood.thickness * 0.02,
        cost: bom.items.find(item => item.description.includes('Side'))?.cost || 0,
        specifications: [
          `Material: ${config.materials.plywood.grade} Plywood`,
          `Thickness: ${config.materials.plywood.thickness}"`,
          `Dimensions: ${dimensions.overallLength}" × ${dimensions.overallHeight}"`,
          `Weight: ${(dimensions.overallLength * dimensions.overallHeight * config.materials.plywood.thickness * 0.02).toFixed(1)} lbs`
        ],
        manufacturingNotes: [
          'Reinforcement at corners required',
          'Ventilation holes may be needed',
          'Smooth finish for product protection'
        ]
      },
      
      // End panels
      {
        id: 'end-panel-1',
        name: 'End Panel (Front)',
        type: 'panel',
        position: [0, 0, dimensions.overallLength / 2 - config.materials.plywood.thickness / 2] as [number, number, number],
        dimensions: {
          length: config.materials.plywood.thickness,
          width: dimensions.overallWidth,
          height: dimensions.overallHeight
        },
        material: {
          type: 'Plywood',
          grade: config.materials.plywood.grade,
          thickness: config.materials.plywood.thickness
        },
        weight: dimensions.overallWidth * dimensions.overallHeight * config.materials.plywood.thickness * 0.02,
        cost: bom.items.find(item => item.description.includes('End'))?.cost || 0,
        specifications: [
          `Material: ${config.materials.plywood.grade} Plywood`,
          `Thickness: ${config.materials.plywood.thickness}"`,
          `Dimensions: ${dimensions.overallWidth}" × ${dimensions.overallHeight}"`,
          `Weight: ${(dimensions.overallWidth * dimensions.overallHeight * config.materials.plywood.thickness * 0.02).toFixed(1)} lbs`
        ],
        manufacturingNotes: [
          'Access panel for loading/unloading',
          'Reinforced corners for durability',
          'Weather-resistant finish required'
        ]
      },
      
      {
        id: 'end-panel-2',
        name: 'End Panel (Back)',
        type: 'panel',
        position: [0, 0, -dimensions.overallLength / 2 + config.materials.plywood.thickness / 2] as [number, number, number],
        dimensions: {
          length: config.materials.plywood.thickness,
          width: dimensions.overallWidth,
          height: dimensions.overallHeight
        },
        material: {
          type: 'Plywood',
          grade: config.materials.plywood.grade,
          thickness: config.materials.plywood.thickness
        },
        weight: dimensions.overallWidth * dimensions.overallHeight * config.materials.plywood.thickness * 0.02,
        cost: bom.items.find(item => item.description.includes('End'))?.cost || 0,
        specifications: [
          `Material: ${config.materials.plywood.grade} Plywood`,
          `Thickness: ${config.materials.plywood.thickness}"`,
          `Dimensions: ${dimensions.overallWidth}" × ${dimensions.overallHeight}"`,
          `Weight: ${(dimensions.overallWidth * dimensions.overallHeight * config.materials.plywood.thickness * 0.02).toFixed(1)} lbs`
        ],
        manufacturingNotes: [
          'Access panel for loading/unloading',
          'Reinforced corners for durability',
          'Weather-resistant finish required'
        ]
      },
      
      // Skids
      {
        id: 'skids',
        name: 'Skids',
        type: 'skid',
        position: [0, -dimensions.overallHeight / 2 - config.materials.lumber.thickness / 2, 0] as [number, number, number],
        dimensions: {
          length: dimensions.overallLength + config.skids.overhang.front + config.skids.overhang.back,
          width: config.materials.lumber.width,
          height: config.materials.lumber.thickness
        },
        material: {
          type: 'Lumber',
          grade: config.materials.lumber.grade,
          thickness: config.materials.lumber.thickness
        },
        weight: config.skids.count * (dimensions.overallLength + config.skids.overhang.front + config.skids.overhang.back) * config.materials.lumber.width * config.materials.lumber.thickness * 0.02,
        cost: bom.items.find(item => item.description.includes('Skid'))?.cost || 0,
        specifications: [
          `Material: ${config.materials.lumber.grade} Lumber`,
          `Count: ${config.skids.count} pieces`,
          `Pitch: ${config.skids.pitch}"`,
          `Overhang: Front ${config.skids.overhang.front}", Back ${config.skids.overhang.back}"`,
          `Weight: ${(config.skids.count * (dimensions.overallLength + config.skids.overhang.front + config.skids.overhang.back) * config.materials.lumber.width * config.materials.lumber.thickness * 0.02).toFixed(1)} lbs`
        ],
        manufacturingNotes: [
          'Must support full crate weight',
          'Forklift access required',
          'Weather-resistant treatment',
          'Proper spacing for ventilation'
        ]
      },
      
      // Overall crate
      {
        id: 'overall-crate',
        name: 'Complete Crate',
        type: 'overall',
        position: [0, 0, 0] as [number, number, number],
        dimensions: {
          length: dimensions.overallLength,
          width: dimensions.overallWidth,
          height: dimensions.overallHeight
        },
        weight: weight,
        cost: bom.totalCost,
        specifications: [
          `Overall Dimensions: ${dimensions.overallLength}" × ${dimensions.overallWidth}" × ${dimensions.overallHeight}"`,
          `Total Weight: ${weight.toFixed(0)} lbs`,
          `Material Cost: $${bom.totalCost.toFixed(2)}`,
          `Material Efficiency: ${efficiency.toFixed(1)}%`,
          `Applied Materials Standard: AMAT-0251-70054`
        ],
        manufacturingNotes: [
          'All components must meet Applied Materials specifications',
          'Quality inspection required before shipment',
          'Proper labeling and documentation needed',
          'Handling equipment requirements documented'
        ]
      }
    ]
  }, [config, dimensions, showMetadata])

  const handleMouseEnter = (componentId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setHoveredComponent(componentId)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredComponent(null)
    }, 100) // Small delay to prevent flickering
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition([event.clientX, event.clientY])
  }

  if (!showMetadata) return null

  return (
    <group>
      {components.map((component) => (
        <Html
          key={component.id}
          position={component.position}
          center
          distanceFactor={8}
          zIndexRange={[100, 0]}
        >
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter(component.id)}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            {/* Component indicator */}
            <div 
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                hoveredComponent === component.id 
                  ? 'bg-blue-500 border-blue-600 scale-125' 
                  : 'bg-blue-300 border-blue-400 hover:bg-blue-400'
              }`}
              style={{
                backgroundColor: component.type === 'product' ? '#dc2626' :
                                component.type === 'panel' ? '#059669' :
                                component.type === 'skid' ? '#7c3aed' :
                                component.type === 'overall' ? '#f59e0b' : '#6b7280'
              }}
              title={`Hover to see ${component.name} details`}
            />
            
            {/* Metadata tooltip */}
            {hoveredComponent === component.id && (
              <div 
                className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 min-w-80 max-w-96 z-50"
                style={{
                  position: 'fixed',
                  top: mousePosition[1] + 10,
                  left: mousePosition[0] + 10,
                  transform: 'none'
                }}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="border-b border-gray-200 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{component.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{component.type} Component</p>
                  </div>
                  
                  {/* Dimensions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-1">Dimensions</h4>
                    <p className="text-sm text-gray-600">
                      {component.dimensions.length}" × {component.dimensions.width}" × {component.dimensions.height}"
                    </p>
                  </div>
                  
                  {/* Material info */}
                  {component.material && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-1">Material</h4>
                      <p className="text-sm text-gray-600">
                        {component.material.type} - {component.material.grade}
                        {component.material.thickness && ` (${component.material.thickness}")`}
                      </p>
                    </div>
                  )}
                  
                  {/* Weight and cost */}
                  {(component.weight || component.cost) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-800 mb-1">Properties</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {component.weight && <p>Weight: {component.weight.toFixed(1)} lbs</p>}
                        {component.cost && <p>Cost: ${component.cost.toFixed(2)}</p>}
                      </div>
                    </div>
                  )}
                  
                  {/* Specifications */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-1">Specifications</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {component.specifications.slice(0, 3).map((spec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {spec}
                        </li>
                      ))}
                      {component.specifications.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{component.specifications.length - 3} more specifications
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  {/* Manufacturing notes */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-800 mb-1">Manufacturing Notes</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {component.manufacturingNotes.slice(0, 2).map((note, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          {note}
                        </li>
                      ))}
                      {component.manufacturingNotes.length > 2 && (
                        <li className="text-xs text-gray-500">
                          +{component.manufacturingNotes.length - 2} more notes
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Html>
      ))}
    </group>
  )
}
