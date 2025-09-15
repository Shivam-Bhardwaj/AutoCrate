import { NextRequest, NextResponse } from 'next/server'
import { CrateConfiguration } from '@/types/crate'
import { NXExpressionGenerator } from '@/lib/nx/nx-expression-generator'

export async function POST(request: NextRequest) {
  try {
    const configuration = await request.json() as CrateConfiguration
    
    // Validate the configuration
    if (!configuration || !configuration.product) {
      return NextResponse.json(
        { error: 'Invalid configuration provided' },
        { status: 400 }
      )
    }
    
    // Generate NX expressions using the enhanced generator
    const generator = new NXExpressionGenerator()
    const expressions = await generator.generateExpressions(configuration)
    const expressionFile = generator.generateExpressionFile(expressions)
    
    return NextResponse.json({
      success: true,
      expressions: {
        filename: `autocrate-expressions-${Date.now()}.txt`,
        content: expressionFile,
        metadata: expressions.metadata
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