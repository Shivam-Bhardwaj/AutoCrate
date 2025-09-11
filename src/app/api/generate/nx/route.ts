import { NextRequest, NextResponse } from 'next/server';
import { NXExpressionGenerator } from '@/services/nx-generator';
import { JobQueue } from '@/services/jobQueue';
import { CrateConfiguration } from '@/types/crate';

/**
 * POST /api/generate/nx - Generate NX CAD expressions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { configuration, options } = body;

    if (!configuration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing configuration',
          message: 'Crate configuration is required'
        },
        { status: 400 }
      );
    }

    // Create a job for NX generation
    const jobId = JobQueue.createJob('nx-generation', {
      configuration,
      options: options || {
        includeDrawings: true,
        includeAssembly: true,
        includeFeatures: true,
        outputFormat: 'expressions'
      }
    });

    // Generate NX expressions synchronously for immediate response
    try {
      const nxGenerator = new NXExpressionGenerator(configuration as CrateConfiguration);
      const expressions = nxGenerator.generateExpression();
      
      // Parse expressions into structured format
      const expressionLines = expressions.split('\n').filter(line => line.trim());
      const structuredExpressions = expressionLines.map(line => {
        const match = line.match(/^(\w+)\s*=\s*(.+)$/);
        if (match) {
          return {
            name: match[1],
            value: match[2],
            type: match[2].includes('"') ? 'string' : 'number'
          };
        }
        return { raw: line };
      });

      const nxData = {
        expressions: structuredExpressions,
        rawExpressions: expressions,
        statistics: {
          totalExpressions: structuredExpressions.length,
          numericExpressions: structuredExpressions.filter(e => e.type === 'number').length,
          stringExpressions: structuredExpressions.filter(e => e.type === 'string').length
        },
        configuration: {
          dimensions: configuration.dimensions,
          baseType: configuration.base.type,
          hasTopPanel: configuration.cap.topPanel,
          hasFoam: configuration.foam,
          hasMBB: configuration.mbb
        },
        generatedAt: new Date(),
        jobId
      };

      // Update job with result
      JobQueue.completeJob(jobId, nxData);

      return NextResponse.json({
        success: true,
        data: nxData,
        jobId,
        message: 'NX expressions generated successfully'
      });
    } catch (genError) {
      // If generation fails, fail the job and return error
      JobQueue.failJob(jobId, genError instanceof Error ? genError.message : 'Generation failed');
      
      return NextResponse.json(
        {
          success: false,
          error: 'NX generation failed',
          message: genError instanceof Error ? genError.message : 'Unknown error',
          jobId
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in NX generation endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate/nx - Get NX generation status or templates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    
    if (jobId) {
      // Get specific job status
      const job = JobQueue.getJob(jobId);
      
      if (!job) {
        return NextResponse.json(
          {
            success: false,
            error: 'Job not found',
            message: `No job found with ID: ${jobId}`
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: job
      });
    }
    
    // Return NX generation options and templates
    return NextResponse.json({
      success: true,
      data: {
        templates: [
          {
            id: 'parametric',
            name: 'Parametric Model',
            description: 'Fully parametric NX model with expressions',
            features: ['dimensions', 'constraints', 'patterns', 'assemblies']
          },
          {
            id: 'simplified',
            name: 'Simplified Model',
            description: 'Basic geometry without complex features',
            features: ['dimensions', 'basic_shapes']
          },
          {
            id: 'detailed',
            name: 'Detailed Model',
            description: 'Complete model with all features and hardware',
            features: ['dimensions', 'constraints', 'patterns', 'assemblies', 'hardware', 'fasteners']
          }
        ],
        outputFormats: ['expressions', 'prt', 'step', 'iges', 'jt'],
        options: {
          includeDrawings: true,
          includeAssembly: true,
          includeFeatures: true,
          includeBOM: false,
          includeSimulation: false
        },
        expressionCategories: [
          'Dimensions',
          'Clearances',
          'Material Properties',
          'Assembly Constraints',
          'Feature Parameters'
        ]
      }
    });
  } catch (error) {
    console.error('Error in NX GET endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}