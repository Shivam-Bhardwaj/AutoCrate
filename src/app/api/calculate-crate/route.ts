import { NextRequest, NextResponse } from 'next/server';
import { generateNXExpressions } from '@/lib/nx-generator';
import { apiRateLimit } from '@/lib/rate-limiter';
import {
  validateDimensions,
  validateWeight,
  validateNumber,
  validateEnum,
  ValidationError,
  validationErrorResponse
} from '@/lib/input-validation';

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

async function postHandler(request: NextRequest) {
  try {
    const body = await request.json();

    // Comprehensive input validation
    let validatedData: CrateCalculationRequest;
    try {
      const productDimensions = validateDimensions(body.productDimensions);
      const productWeight = validateWeight(body.productWeight);
      const quantity = body.quantity ? validateNumber(body.quantity, 'quantity', { min: 1, max: 1000, integer: true }) : 1;
      const materialType = body.materialType ? validateEnum(body.materialType, 'materialType', ['plywood', 'osb', 'lumber'] as const) : 'plywood';
      const crateType = body.crateType ? validateEnum(body.crateType, 'crateType', ['standard', 'heavy-duty', 'export'] as const) : 'standard';

      validatedData = {
        productDimensions,
        productWeight,
        quantity,
        materialType,
        crateType
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return validationErrorResponse([error]);
      }
      if (Array.isArray(error)) {
        return validationErrorResponse(error);
      }
      throw error;
    }

    // Calculate crate dimensions based on product
    const padding = validatedData.crateType === 'heavy-duty' ? 150 : 100; // mm
    const crateDimensions = {
      length: validatedData.productDimensions.length + padding,
      width: validatedData.productDimensions.width + padding,
      height: validatedData.productDimensions.height + padding
    };

    // Generate NX expressions
    const nxExpressions = generateNXExpressions(
      crateDimensions,
      validatedData.productWeight,
      validatedData.materialType
    );

    const response = {
      requestId: `REQ-${Date.now()}`,
      timestamp: new Date().toISOString(),
      input: validatedData,
      calculations: {
        crateDimensions,
        internalVolume: (crateDimensions.length * crateDimensions.width * crateDimensions.height) / 1000000000, // m³
        estimatedCrateWeight: calculateCrateWeight(crateDimensions, validatedData.materialType || 'plywood'),
        totalWeight: validatedData.productWeight + calculateCrateWeight(crateDimensions, validatedData.materialType || 'plywood')
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

export async function POST(request: NextRequest) {
  return apiRateLimit(request, postHandler);
}

async function getHandler(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({
    service: 'AutoCrate Calculator API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
}

export async function GET(request: NextRequest) {
  return apiRateLimit(request, getHandler);
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