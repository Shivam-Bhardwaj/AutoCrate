import { NextRequest, NextResponse } from 'next/server'
import { CrateConfiguration, CrateDimensions } from '@/types/crate'
import { calculateCrateDimensions } from '@/lib/domain/calculations'

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
    
    // Calculate dimensions
    const dimensions = calculateCrateDimensions(config)
    
    // Generate NX expressions
    const nxExpressions = generateNXExpressions(config, dimensions)
    
    return NextResponse.json({
      success: true,
      expressions: nxExpressions,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0.0',
        standards: 'AMAT-0251-70054'
      }
    })
    
  } catch (error) {
    console.error('Error generating NX expressions:', error)
    return NextResponse.json(
      { error: 'Failed to generate NX expressions' },
      { status: 500 }
    )
  }
}

function generateNXExpressions(config: CrateConfiguration, dimensions: CrateDimensions) {
  const expressions = {
    // Product dimensions
    product_length: config.product.length,
    product_width: config.product.width,
    product_height: config.product.height,
    product_weight: config.product.weight,
    
    // Clearances
    clearance_width: config.clearances.width,
    clearance_length: config.clearances.length,
    clearance_height: config.clearances.height,
    
    // Overall crate dimensions
    crate_length: dimensions.overallLength,
    crate_width: dimensions.overallWidth,
    crate_height: dimensions.overallHeight,
    
    // Skid configuration
    skid_count: config.skids.count,
    skid_pitch: config.skids.pitch,
    skid_front_overhang: config.skids.overhang.front,
    skid_back_overhang: config.skids.overhang.back,
    
    // Material specifications
    lumber_grade: config.materials.lumber.grade,
    lumber_thickness: config.materials.lumber.thickness,
    lumber_width: config.materials.lumber.width,
    plywood_grade: config.materials.plywood.grade,
    plywood_thickness: config.materials.plywood.thickness,
    
    // Center of gravity
    cog_x: config.product.centerOfGravity.x,
    cog_y: config.product.centerOfGravity.y,
    cog_z: config.product.centerOfGravity.z,
    
    // Applied Materials standards
    standard: 'AMAT-0251-70054',
    revision: 'Rev A',
    date: new Date().toISOString().split('T')[0]
  }
  
  // Generate NX expression file content
  const nxContent = `// AutoCrate NX Expressions
// Generated: ${new Date().toISOString()}
// Standard: AMAT-0251-70054
// Version: 2.0.0

// Product Specifications
product_length = ${expressions.product_length}
product_width = ${expressions.product_width}
product_height = ${expressions.product_height}
product_weight = ${expressions.product_weight}

// Clearances
clearance_width = ${expressions.clearance_width}
clearance_length = ${expressions.clearance_length}
clearance_height = ${expressions.clearance_height}

// Crate Dimensions
crate_length = ${expressions.crate_length}
crate_width = ${expressions.crate_width}
crate_height = ${expressions.crate_height}

// Skid Configuration
skid_count = ${expressions.skid_count}
skid_pitch = ${expressions.skid_pitch}
skid_front_overhang = ${expressions.skid_front_overhang}
skid_back_overhang = ${expressions.skid_back_overhang}

// Material Specifications
lumber_grade = "${expressions.lumber_grade}"
lumber_thickness = ${expressions.lumber_thickness}
lumber_width = ${expressions.lumber_width}
plywood_grade = "${expressions.plywood_grade}"
plywood_thickness = ${expressions.plywood_thickness}

// Center of Gravity
cog_x = ${expressions.cog_x}
cog_y = ${expressions.cog_y}
cog_z = ${expressions.cog_z}

// Standards Compliance
standard = "${expressions.standard}"
revision = "${expressions.revision}"
generation_date = "${expressions.date}"
`
  
  return {
    content: nxContent,
    expressions: expressions,
    filename: `autocrate_nx_expressions_${new Date().toISOString().split('T')[0]}.txt`
  }
}
