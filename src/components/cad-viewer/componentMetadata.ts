import { CrateConfiguration, CrateDimensions } from '@/types/crate'
import {
  generateBillOfMaterials,
  calculateMaterialEfficiency,
  calculateCrateWeight,
  calculateSkidRequirements,
  calculatePanelRequirements
} from '@/lib/domain/calculations'

export type ComponentType =
  | 'panel'
  | 'skid'
  | 'product'
  | 'clearance'
  | 'overall'
  | 'frame'
  | 'support'

export interface ComponentInfo {
  id: string
  name: string
  type: ComponentType
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

export function generateComponentMetadata(
  config: CrateConfiguration,
  dimensions: CrateDimensions
): ComponentInfo[] {
  const bom = generateBillOfMaterials(config)
  const efficiency = calculateMaterialEfficiency(config)
  const weight = calculateCrateWeight(config)
  const skidSpecs = calculateSkidRequirements(config)
  const panelSpecs = calculatePanelRequirements(config)

  const frameThickness = 1.5
  const frameHeight = 3.5

  return [
    {
      id: 'product',
      name: 'Product',
      type: 'product',
      position: [0, config.product.height / 2, 0],
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
    {
      id: 'bottom-panel',
      name: 'Bottom Panel',
      type: 'panel',
      position: [0, -dimensions.overallHeight / 2 + config.materials.plywood.thickness / 2, 0],
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
      weight: dimensions.overallLength * dimensions.overallWidth * config.materials.plywood.thickness * 0.02,
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
    {
      id: 'top-panel',
      name: 'Top Panel',
      type: 'panel',
      position: [0, dimensions.overallHeight + config.materials.plywood.thickness / 2, 0],
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
      weight: dimensions.overallLength * dimensions.overallWidth * config.materials.plywood.thickness * 0.02,
      cost: bom.items.find(item => item.description.includes('Top'))?.cost || 0,
      specifications: [
        `Material: ${config.materials.plywood.grade} Plywood`,
        `Thickness: ${config.materials.plywood.thickness}"`,
        `Dimensions: ${dimensions.overallLength}" × ${dimensions.overallWidth}"`,
        'Designed for removable access'
      ],
      manufacturingNotes: [
        'Secure with screws or clamps for shipping',
        'Weather seal required for outdoor storage',
        'Verify clearance for lifting points'
      ]
    },
    {
      id: 'side-panel-1',
      name: 'Side Panel (Left)',
      type: 'panel',
      position: [-dimensions.overallWidth / 2 + config.materials.plywood.thickness / 2, 0, 0],
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
      position: [dimensions.overallWidth / 2 - config.materials.plywood.thickness / 2, 0, 0],
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
      id: 'end-panel-1',
      name: 'End Panel (Front)',
      type: 'panel',
      position: [0, 0, dimensions.overallLength / 2 - config.materials.plywood.thickness / 2],
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
      position: [0, 0, -dimensions.overallLength / 2 + config.materials.plywood.thickness / 2],
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
      id: 'skids',
      name: 'Skids',
      type: 'skid',
      position: [
        0,
        -dimensions.overallHeight / 2 - (skidSpecs.height + config.materials.lumber.thickness) / 2,
        0
      ],
      dimensions: {
        length: skidSpecs.length,
        width: skidSpecs.width,
        height: skidSpecs.height
      },
      material: {
        type: 'Lumber',
        grade: config.materials.lumber.grade,
        thickness: skidSpecs.height
      },
      weight:
        skidSpecs.count *
        skidSpecs.length *
        skidSpecs.width *
        skidSpecs.height *
        0.02,
      cost: bom.items.find(item => item.description.includes('Skid'))?.cost || 0,
      specifications: [
        `Material: ${config.materials.lumber.grade} Lumber`,
        `Count: ${skidSpecs.count} pieces`,
        `Pitch: ${skidSpecs.pitch}"`,
        `Overhang: Front ${config.skids.overhang.front}", Back ${config.skids.overhang.back}"`
      ],
      manufacturingNotes: [
        'Must support full crate weight',
        'Forklift access required',
        'Weather-resistant treatment',
        'Proper spacing for ventilation'
      ]
    },
    ...(panelSpecs.sides.cleats.count > 0
      ? [{
          id: 'side-cleats',
          name: 'Side Panel Cleats',
          type: 'support',
          position: [0, panelSpecs.sides.cleats.length / 2, 0],
          dimensions: {
            length: panelSpecs.sides.cleats.length,
            width: panelSpecs.sides.cleats.width,
            height: panelSpecs.sides.cleats.thickness
          },
          material: {
            type: 'Lumber',
            grade: config.materials.lumber.grade,
            thickness: panelSpecs.sides.cleats.thickness
          },
          weight: panelSpecs.sides.cleats.count *
            panelSpecs.sides.cleats.length *
            panelSpecs.sides.cleats.width *
            panelSpecs.sides.cleats.thickness *
            0.02,
          cost: bom.items.find(item => item.id === 'side-cleats')?.cost || 0,
          specifications: [
            `Cleats per side: ${panelSpecs.sides.spliceCount}`,
            `Total Cleats: ${panelSpecs.sides.cleats.count}`,
            `Fasteners Required: ${panelSpecs.sides.cleats.count * Math.max(4, Math.ceil(panelSpecs.sides.cleats.length / 16) * 2)}`
          ],
          manufacturingNotes: [
            'Install cleats centered over each panel splice',
            'Maintain full-height contact for structural load transfer',
            'Attach with screws at 16" on center minimum'
          ]
        }]
      : []),
    {
      id: 'bottom-frame',
      name: 'Bottom Frame',
      type: 'frame',
      position: [0, config.materials.plywood.thickness / 2, 0],
      dimensions: {
        length: dimensions.overallLength,
        width: frameThickness,
        height: frameHeight
      },
      material: {
        type: 'Lumber',
        grade: config.materials.lumber.grade,
        thickness: frameThickness
      },
      specifications: [
        'Constructed from standard 2×4 lumber',
        `Perimeter length: ${(dimensions.overallWidth * 2 + dimensions.overallLength * 2).toFixed(0)}"`,
        'Provides shear resistance for bottom assembly'
      ],
      manufacturingNotes: [
        'Secure to bottom panel with lag screws',
        'Ensure tight joints at corners',
        'Apply structural adhesive for increased rigidity'
      ]
    },
    {
      id: 'top-frame',
      name: 'Top Frame',
      type: 'frame',
      position: [0, dimensions.overallHeight - config.materials.plywood.thickness / 2, 0],
      dimensions: {
        length: dimensions.overallLength,
        width: frameThickness,
        height: frameHeight
      },
      material: {
        type: 'Lumber',
        grade: config.materials.lumber.grade,
        thickness: frameThickness
      },
      specifications: [
        'Constructed from standard 2×4 lumber',
        `Perimeter length: ${(dimensions.overallWidth * 2 + dimensions.overallLength * 2).toFixed(0)}"`,
        'Provides structural rigidity for top assembly'
      ],
      manufacturingNotes: [
        'Secure to corner posts with lag screws',
        'Verify squareness before panel installation',
        'Seal joints to prevent moisture intrusion'
      ]
    },
    {
      id: 'corner-posts',
      name: 'Corner Posts',
      type: 'support',
      position: [0, dimensions.overallHeight / 2, 0],
      dimensions: {
        length: dimensions.overallHeight,
        width: frameThickness,
        height: frameHeight
      },
      material: {
        type: 'Lumber',
        grade: config.materials.lumber.grade,
        thickness: frameThickness
      },
      specifications: [
        'Quantity: 4 posts',
        `Height: ${dimensions.overallHeight}"`,
        'Cross-section: 1.5" × 3.5"  (2×4 lumber)'
      ],
      manufacturingNotes: [
        'Critical for load transfer to skids',
        'Chamfer edges to prevent splintering',
        'Pre-drill for lag screw connections'
      ]
    },
    {
      id: 'overall-crate',
      name: 'Complete Crate',
      type: 'overall',
      position: [0, 0, 0],
      dimensions: {
        length: dimensions.overallLength,
        width: dimensions.overallWidth,
        height: dimensions.overallHeight
      },
      weight,
      cost: bom.totalCost,
      specifications: [
        `Overall Dimensions: ${dimensions.overallLength}" × ${dimensions.overallWidth}" × ${dimensions.overallHeight}"`,
        `Total Weight: ${weight.toFixed(0)} lbs`,
        `Material Cost: $${bom.totalCost.toFixed(2)}`,
        `Material Efficiency: ${efficiency.toFixed(1)}%`,
        'Applied Materials Standard: AMAT-0251-70054'
      ],
      manufacturingNotes: [
        'All components must meet Applied Materials specifications',
        'Quality inspection required before shipment',
        'Proper labeling and documentation needed',
        'Handling equipment requirements documented'
      ]
    }
  ]
}

