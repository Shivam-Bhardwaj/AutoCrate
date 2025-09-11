import { NextRequest, NextResponse } from 'next/server';
import { CostCalculator } from '@/services/costCalculator';
import { JobQueue } from '@/services/jobQueue';
import { CrateConfiguration } from '@/types/crate';

/**
 * POST /api/generate/bom - Generate Bill of Materials
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

    // Create a job for BOM generation
    const jobId = JobQueue.createJob('bom-generation', {
      configuration,
      options: options || {
        includeLabor: true,
        includeCosts: true,
        includeSupplierInfo: false,
        includeSpecifications: true,
        exportFormat: 'json'
      }
    });

    // For immediate response, also generate BOM synchronously
    const costCalculator = new CostCalculator(configuration as CrateConfiguration);
    const costBreakdown = costCalculator.calculateCosts();
    
    // Format BOM from cost breakdown
    const bomData = {
      materials: costBreakdown.materials.items.map(item => ({
        item: item.item,
        category: item.category,
        material: item.material,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unitCost,
        totalCost: item.totalCost,
        supplier: item.supplier,
        leadTime: item.leadTime
      })),
      labor: costBreakdown.labor.items.map(item => ({
        task: item.task,
        category: item.category,
        hours: item.hours,
        rate: item.rate,
        totalCost: item.totalCost,
        skillLevel: item.skillLevel
      })),
      summary: {
        materialsCost: costBreakdown.materials.subtotal,
        laborCost: costBreakdown.labor.subtotal,
        shippingCost: costBreakdown.shipping.recommended.totalCost,
        overheadCost: costBreakdown.overhead.subtotal,
        totalCost: costBreakdown.summary.total,
        margin: costBreakdown.summary.margin,
        tax: costBreakdown.summary.tax
      },
      metrics: costBreakdown.metrics,
      generatedAt: new Date(),
      jobId
    };

    // Update job with result
    JobQueue.completeJob(jobId, bomData);

    return NextResponse.json({
      success: true,
      data: bomData,
      jobId,
      message: 'BOM generated successfully'
    });
  } catch (error) {
    console.error('Error generating BOM:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate BOM',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate/bom - Get BOM generation status or templates
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
    
    // Return BOM templates/options
    return NextResponse.json({
      success: true,
      data: {
        templates: [
          {
            id: 'standard',
            name: 'Standard BOM',
            description: 'Basic bill of materials with quantities and costs',
            fields: ['item', 'material', 'quantity', 'unitCost', 'totalCost']
          },
          {
            id: 'detailed',
            name: 'Detailed BOM',
            description: 'Complete BOM with supplier info and specifications',
            fields: ['item', 'material', 'quantity', 'unitCost', 'totalCost', 'supplier', 'leadTime', 'specifications']
          },
          {
            id: 'manufacturing',
            name: 'Manufacturing BOM',
            description: 'BOM with labor and assembly instructions',
            fields: ['item', 'material', 'quantity', 'unitCost', 'totalCost', 'laborHours', 'assemblySteps']
          }
        ],
        exportFormats: ['json', 'csv', 'excel', 'pdf'],
        options: {
          includeLabor: true,
          includeCosts: true,
          includeSupplierInfo: false,
          includeSpecifications: false,
          includeDrawings: false
        }
      }
    });
  } catch (error) {
    console.error('Error in BOM GET endpoint:', error);
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