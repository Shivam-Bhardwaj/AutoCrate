import { NextRequest, NextResponse } from 'next/server';
import { generateNXExpressions } from '@/lib/nx-generator';

interface CrateCalculationRequest {
  productDimensions: {
    length: number;
    width: number;
    height: number;
  };
  productWeight: number;
  quantity?: number;
  materialType?: 'plywood' | 'osb' | 'lumber';
  crateType?: 'standard' | 'heavy-duty' | 'export';
}

export async function POST(request: NextRequest) {
  try {
    const body: CrateCalculationRequest = await request.json();

    // Validate input
    if (!body.productDimensions || !body.productWeight) {
      return NextResponse.json(
        { error: 'Missing required fields: productDimensions and productWeight' },
        { status: 400 }
      );
    }

    // Calculate crate dimensions based on product
    const padding = body.crateType === 'heavy-duty' ? 150 : 100; // mm
    const crateDimensions = {
      length: body.productDimensions.length + padding,
      width: body.productDimensions.width + padding,
      height: body.productDimensions.height + padding
    };

    // Generate NX expressions
    const nxExpressions = generateNXExpressions(
      crateDimensions,
      body.productWeight,
      body.materialType || 'plywood'
    );

    const response = {
      requestId: `REQ-${Date.now()}`,
      timestamp: new Date().toISOString(),
      input: body,
      calculations: {
        crateDimensions,
        internalVolume: (crateDimensions.length * crateDimensions.width * crateDimensions.height) / 1000000000, // m³
        estimatedCrateWeight: calculateCrateWeight(crateDimensions, body.materialType || 'plywood'),
        totalWeight: body.productWeight + calculateCrateWeight(crateDimensions, body.materialType || 'plywood')
      },
      nxExpressions: nxExpressions.substring(0, 500) + '...', // Preview
      fullNxExpressionsLength: nxExpressions.length,
      status: 'success'
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Calculation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({
    service: 'AutoCrate Calculator API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
}

function calculateCrateWeight(dimensions: any, materialType: string): number {
  // Simple weight estimation based on surface area and material
  const surfaceArea = 2 * (
    dimensions.length * dimensions.width +
    dimensions.length * dimensions.height +
    dimensions.width * dimensions.height
  ) / 1000000; // m²

  const materialDensity = {
    plywood: 15, // kg/m²
    osb: 12,
    lumber: 20
  };

  return Math.round(surfaceArea * (materialDensity[materialType as keyof typeof materialDensity] || 15));
}