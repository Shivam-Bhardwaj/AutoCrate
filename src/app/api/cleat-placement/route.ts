import { NextRequest, NextResponse } from 'next/server';
import { calculateCleatPositions } from '@/lib/cleat-calculator';

interface CleatPlacementRequest {
  panelDimensions: {
    width: number;
    height: number;
    thickness: number;
  };
  loadCapacity: number;
  cleatType?: 'standard' | 'reinforced' | 'corner';
  material?: 'pine' | 'oak' | 'metal';
}

export async function POST(request: NextRequest) {
  try {
    const body: CleatPlacementRequest = await request.json();

    // Calculate optimal cleat positions
    const cleatData = calculateCleatPositions(
      body.panelDimensions,
      `PANEL_${body.cleatType || 'STANDARD'}`,
      [] // No splice positions for this simple API call
    );

    const response = {
      requestId: `CLT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      input: body,
      cleatConfiguration: {
        positions: cleatData.cleats,
        quantity: cleatData.cleats.length,
        cleatDimensions: getCleatDimensions(body.cleatType || 'standard'),
        totalLength: calculateTotalCleatLength(cleatData.cleats),
        material: body.material || 'pine'
      },
      structuralAnalysis: {
        maxLoad: calculateMaxLoad(cleatData, body.material || 'pine'),
        safetyFactor: 2.5,
        stressDistribution: 'uniform',
        recommendedFasteners: getRecommendedFasteners(body.loadCapacity)
      },
      status: 'success'
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Cleat placement calculation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get cleat specifications
  return NextResponse.json({
    cleatTypes: {
      standard: { width: 50, height: 75, thickness: 25 },
      reinforced: { width: 75, height: 100, thickness: 38 },
      corner: { width: 100, height: 100, thickness: 50 }
    },
    materials: {
      pine: { strength: 35, density: 500 },
      oak: { strength: 50, density: 700 },
      metal: { strength: 250, density: 7850 }
    },
    units: {
      dimensions: 'millimeters',
      strength: 'MPa',
      density: 'kg/m³'
    },
    timestamp: new Date().toISOString()
  });
}

function getCleatDimensions(type: string) {
  const dimensions = {
    standard: { width: 50, height: 75, thickness: 25 },
    reinforced: { width: 75, height: 100, thickness: 38 },
    corner: { width: 100, height: 100, thickness: 50 }
  };
  return dimensions[type as keyof typeof dimensions] || dimensions.standard;
}

function calculateTotalCleatLength(cleats: any[]): number {
  return cleats.reduce((sum, cleat) => sum + (cleat.length || 100), 0);
}

function calculateMaxLoad(cleatData: any, material: string): number {
  const materialStrength = {
    pine: 35,
    oak: 50,
    metal: 250
  };
  const strength = materialStrength[material as keyof typeof materialStrength] || 35;
  return cleatData.cleats.length * strength * 100; // Simplified calculation
}

function getRecommendedFasteners(loadCapacity: number): any {
  if (loadCapacity > 1000) {
    return {
      type: 'Lag bolts',
      size: '10mm x 100mm',
      quantity: 6,
      pattern: 'Double row'
    };
  } else if (loadCapacity > 500) {
    return {
      type: 'Wood screws',
      size: '6mm x 75mm',
      quantity: 4,
      pattern: 'Single row'
    };
  } else {
    return {
      type: 'Wood screws',
      size: '4mm x 50mm',
      quantity: 3,
      pattern: 'Triangle'
    };
  }
}