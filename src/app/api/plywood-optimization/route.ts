import { NextRequest, NextResponse } from 'next/server';
import { calculatePlywoodPieces } from '@/lib/plywood-splicing';

interface PlywoodOptimizationRequest {
  panelDimensions: {
    width: number;
    height: number;
  };
  stockSheetSize?: {
    width: number;
    height: number;
  };
  minimizeWaste?: boolean;
  allowRotation?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: PlywoodOptimizationRequest = await request.json();

    // Default stock sheet size (standard 4x8 feet in mm)
    const stockSheet = body.stockSheetSize || {
      width: 1220,
      height: 2440
    };

    // Calculate optimal cutting pattern
    const optimization = calculatePlywoodPieces(
      body.panelDimensions,
      'PANEL'
    );

    const response = {
      requestId: `PLY-${Date.now()}`,
      timestamp: new Date().toISOString(),
      input: body,
      optimization: {
        ...optimization,
        efficiency: calculateEfficiency(optimization),
        wastePercentage: calculateWaste(optimization),
        totalSheetsRequired: optimization.sheetCount || optimization.sheets?.length || 1
      },
      recommendations: generateRecommendations(optimization),
      status: 'success'
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Plywood optimization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get standard sheet sizes
  return NextResponse.json({
    standardSheets: [
      { name: '4x8 feet', width: 1220, height: 2440 },
      { name: '5x10 feet', width: 1525, height: 3050 },
      { name: '4x4 feet', width: 1220, height: 1220 }
    ],
    units: 'millimeters',
    timestamp: new Date().toISOString()
  });
}

function calculateEfficiency(optimization: any): number {
  // Calculate material utilization efficiency
  const sheets = optimization.sheets || [];
  if (sheets.length === 0) return 100;

  const totalArea = sheets.reduce((sum: number, sheet: any) =>
    sum + (sheet.width * sheet.height), 0);
  const usedArea = optimization.panelWidth * optimization.panelHeight;
  return Math.round((usedArea / totalArea) * 100);
}

function calculateWaste(optimization: any): number {
  return 100 - calculateEfficiency(optimization);
}

function generateRecommendations(optimization: any): string[] {
  const recommendations = [];
  const efficiency = calculateEfficiency(optimization);

  if (efficiency < 70) {
    recommendations.push('Consider using smaller stock sheets to reduce waste');
  }
  if (optimization.pieces.length > 5) {
    recommendations.push('Multiple sheets required - consider ordering pre-cut panels');
  }
  if (optimization.hasRotations) {
    recommendations.push('Some pieces require rotation for optimal fit');
  }

  return recommendations;
}