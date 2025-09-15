import { NextRequest, NextResponse } from 'next/server'
import { CrateConfiguration, CrateDimensions } from '@/types/crate'
import { calculateCrateDimensions } from '@/lib/domain/calculations'
import { STEPExporter } from '@/lib/step-processor'
import { generatePMIAnnotations } from '@/lib/step-processor/pmi-annotations'

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
    
    // Generate PMI annotations
    const pmiAnnotations = generatePMIAnnotations(config, dimensions)
    
    // Create STEP exporter
    const stepExporter = new STEPExporter()
    
    // Generate STEP AP242 file with PMI
    const stepFile = await stepExporter.exportWithPMI(config, pmiAnnotations)
    
    // Return file for download
    return new NextResponse(stepFile.content, {
      status: 200,
      headers: {
        'Content-Type': 'application/step',
        'Content-Disposition': `attachment; filename="${stepFile.filename}"`,
        'Content-Length': stepFile.content.length.toString(),
        'X-STEP-Version': 'AP242',
        'X-PMI-Included': 'true',
        'X-Standards-Compliance': 'AMAT-0251-70054'
      }
    })
    
  } catch (error) {
    console.error('Error generating STEP file:', error)
    return NextResponse.json(
      { error: 'Failed to generate STEP file' },
      { status: 500 }
    )
  }
}

