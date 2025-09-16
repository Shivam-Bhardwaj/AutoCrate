import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { CrateConfiguration } from '@/types/crate'
import { NXExpressionGenerator } from '@/lib/nx/nx-expression-generator'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as Partial<{ configuration: CrateConfiguration }> & CrateConfiguration
    const configuration = 'configuration' in payload && payload.configuration
      ? payload.configuration
      : payload

    // Validate the configuration
    if (!configuration || !configuration.product) {
      return NextResponse.json(
        { success: false, error: 'Invalid configuration provided' },
        { status: 400 }
      )
    }

    const { length, width, height } = configuration.product
    if ([length, width, height].some((value) => typeof value !== 'number' || value <= 0)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product dimensions provided' },
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
    
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      const message = error.message.toLowerCase().includes('empty')
        ? 'Request body is empty'
        : 'Invalid JSON payload'

      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      )
    }

    console.error('Error generating NX expressions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate NX expressions' },
      { status: 500 }
    )
  }
}