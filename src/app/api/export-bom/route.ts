import { NextRequest, NextResponse } from 'next/server'
import { CrateConfiguration } from '@/types/crate'
import { releaseIdentity } from '@/config/release'
import { generateBillOfMaterials, calculateMaterialEfficiency, calculateCrateWeight, calculateCrateDimensions } from '@/lib/domain/calculations'

export async function POST(request: NextRequest) {
  try {
    const config: CrateConfiguration = await request.json()
    
    // Validate the configuration
    if (!config || !config.product) {
      return NextResponse.json(
        { error: 'Invalid configuration provided' },
        { status: 400 }
      )
    }
    
    // Calculate all necessary data
    const dimensions = calculateCrateDimensions(config)
    const bom = generateBillOfMaterials(config)
    const efficiency = calculateMaterialEfficiency(config)
    const weight = calculateCrateWeight(config)
    
    // Generate comprehensive BOM
    const bomData = generateBOMContent(config, dimensions, bom, efficiency, weight)
    
    return NextResponse.json({
      success: true,
      content: bomData,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: releaseIdentity.version,
        standards: 'AMAT-0251-70054',
        format: 'CSV/JSON'
      }
    })
    
  } catch (error) {
    console.error('Error generating BOM:', error)
    return NextResponse.json(
      { error: 'Failed to generate BOM' },
      { status: 500 }
    )
  }
}

function generateBOMContent(
  config: CrateConfiguration, 
  dimensions: { overallLength: number; overallWidth: number; overallHeight: number }, 
  bom: { items: Array<{ id: string; description: string; material?: string; grade?: string; dimensions?: { length: number; width: number; thickness: number }; quantity: number; unit: string; cost?: number; weight?: number; supplier?: string; partNumber?: string; notes?: string }>; totalCost: number; materialWaste: number }, 
  efficiency: number, 
  weight: number
) {
  const timestamp = new Date().toISOString()
  const filename = `autocrate_bom_${timestamp.split('T')[0]}.csv`
  
  // Generate CSV content
  const csvHeaders = [
    'Item ID',
    'Description',
    'Material',
    'Grade',
    'Dimensions (L×W×T)',
    'Quantity',
    'Unit',
    'Unit Cost',
    'Total Cost',
    'Weight (lbs)',
    'Supplier',
    'Part Number',
    'Notes'
  ]
  
  const csvRows = [
    csvHeaders.join(','),
    // Header information
    `"AutoCrate Bill of Materials","","","","","","","","","","","",""`,
    `"Generated:","${timestamp}","","","","","","","","","","",""`,
    `"Drawing Number:","AMAT-CRATE-${Date.now()}","","","","","","","","","","",""`,
    `"Applied Materials Standard:","AMAT-0251-70054","","","","","","","","","","",""`,
    `"","","","","","","","","","","","",""`,
    // Product information
    `"PRODUCT SPECIFICATIONS","","","","","","","","","","","",""`,
    `"Product Length:","${config.product.length}","inches","","","","","","","","","",""`,
    `"Product Width:","${config.product.width}","inches","","","","","","","","","",""`,
    `"Product Height:","${config.product.height}","inches","","","","","","","","","",""`,
    `"Product Weight:","${config.product.weight}","lbs","","","","","","","","","",""`,
    `"","","","","","","","","","","","",""`,
    // Crate dimensions
    `"CRATE DIMENSIONS","","","","","","","","","","","",""`,
    `"Overall Length:","${dimensions.overallLength}","inches","","","","","","","","","",""`,
    `"Overall Width:","${dimensions.overallWidth}","inches","","","","","","","","","",""`,
    `"Overall Height:","${dimensions.overallHeight}","inches","","","","","","","","","",""`,
    `"","","","","","","","","","","","",""`,
    // BOM items
    `"BILL OF MATERIALS","","","","","","","","","","","",""`,
    ...bom.items.map((item) => [
      `"${item.id}"`,
      `"${item.description}"`,
      `"${item.material || 'Lumber'}"`,
      `"${item.grade || config.materials.lumber.grade}"`,
      `"${item.dimensions ? `${item.dimensions.length}×${item.dimensions.width}×${item.dimensions.thickness}` : 'N/A'}"`,
      `"${item.quantity}"`,
      `"${item.unit}"`,
      `"${item.cost ? item.cost.toFixed(2) : '0.00'}"`,
      `"${item.cost ? (item.cost * item.quantity).toFixed(2) : '0.00'}"`,
      `"${item.weight ? item.weight.toFixed(2) : '0.00'}"`,
      `"${item.supplier || 'TBD'}"`,
      `"${item.partNumber || 'TBD'}"`,
      `"${item.notes || ''}"`
    ].join(',')),
    `"","","","","","","","","","","","",""`,
    // Summary
    `"SUMMARY","","","","","","","","","","","",""`,
    `"Total Material Cost:","$${bom.totalCost.toFixed(2)}","","","","","","","","","","",""`,
    `"Material Efficiency:","${efficiency.toFixed(1)}%","","","","","","","","","","",""`,
    `"Material Waste:","${bom.materialWaste.toFixed(1)}%","","","","","","","","","","",""`,
    `"Estimated Crate Weight:","${weight.toFixed(0)}","lbs","","","","","","","","","",""`,
    `"Estimated Build Time:","${Math.round(weight * 0.1 + bom.items.length * 0.5)}","minutes","","","","","","","","","",""`,
    `"Labor Cost:","$${(Math.round(weight * 0.1 + bom.items.length * 0.5) * 0.5).toFixed(2)}","","","","","","","","","","",""`,
    `"Total Project Cost:","$${(bom.totalCost + (Math.round(weight * 0.1 + bom.items.length * 0.5) * 0.5)).toFixed(2)}","","","","","","","","","","",""`,
    `"","","","","","","","","","","","",""`,
    // Quality requirements
    `"QUALITY REQUIREMENTS","","","","","","","","","","","",""`,
    `"Lumber Grade:","${config.materials.lumber.grade}","","","","","","","","","","",""`,
    `"Plywood Grade:","${config.materials.plywood.grade}","","","","","","","","","","",""`,
    `"Dimensional Tolerance:","±0.125 inches","","","","","","","","","","",""`,
    `"Weight Tolerance:","±5%","","","","","","","","","","",""`,
    `"Clearance Tolerance:","±0.25 inches","","","","","","","","","","",""`,
    `"","","","","","","","","","","","",""`,
    // Notes
    `"NOTES","","","","","","","","","","","",""`,
    `"All dimensions in inches unless otherwise specified","","","","","","","","","","","",""`,
    `"Materials must meet Applied Materials specifications","","","","","","","","","","","",""`,
    `"Center of gravity must be within acceptable limits","","","","","","","","","","","",""`,
    `"Skid configuration must support product weight","","","","","","","","","","","",""`,
    `"Clearances must accommodate handling equipment","","","","","","","","","","","",""`
  ]
  
  const csvContent = csvRows.join('\n')
  
  return {
    content: csvContent,
    filename: filename,
    jsonData: {
      header: {
        title: 'AutoCrate Bill of Materials',
        generatedAt: timestamp,
        drawingNumber: `AMAT-CRATE-${Date.now()}`,
        standard: 'AMAT-0251-70054'
      },
      product: {
        length: config.product.length,
        width: config.product.width,
        height: config.product.height,
        weight: config.product.weight
      },
      crate: {
        overallLength: dimensions.overallLength,
        overallWidth: dimensions.overallWidth,
        overallHeight: dimensions.overallHeight
      },
      billOfMaterials: {
        items: bom.items,
        totalCost: bom.totalCost,
        materialWaste: bom.materialWaste,
        efficiency: efficiency
      },
      manufacturing: {
        estimatedWeight: weight,
        materialEfficiency: efficiency,
        buildTime: Math.round(weight * 0.1 + bom.items.length * 0.5),
        laborCost: Math.round(weight * 0.1 + bom.items.length * 0.5) * 0.5,
        totalCost: bom.totalCost + (Math.round(weight * 0.1 + bom.items.length * 0.5) * 0.5)
      },
      qualityRequirements: {
        lumberGrade: config.materials.lumber.grade,
        plywoodGrade: config.materials.plywood.grade,
        dimensionalTolerance: '±0.125"',
        weightTolerance: '±5%',
        clearanceTolerance: '±0.25"'
      }
    }
  }
}
