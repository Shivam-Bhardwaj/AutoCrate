import { NextRequest, NextResponse } from 'next/server';
import { NXGenerator } from '@/lib/nx-generator';
import { heavyRateLimit } from '@/lib/rate-limiter';

export const dynamic = 'force-dynamic'

interface NXExpressionsRequest {
  product: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  clearances: {
    side: number;
    end: number;
    top: number;
  };
  partNumbers?: {
    base?: string;
    crate?: string;
    cap?: string;
  };
}

async function postHandler(request: NextRequest) {
  try {
    // Handle both JSON and form data
    let body: NXExpressionsRequest;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      const dataField = formData.get('data');
      if (typeof dataField === 'string') {
        body = JSON.parse(dataField);
      } else {
        throw new Error('Invalid form data');
      }
    } else {
      // Try JSON first, fallback to form data
      try {
        body = await request.json();
      } catch {
        const formData = await request.formData();
        const dataField = formData.get('data');
        if (typeof dataField === 'string') {
          body = JSON.parse(dataField);
        } else {
          throw new Error('Invalid request format');
        }
      }
    }

    // Create generator with the provided config
    const config = {
      product: body.product,
      clearances: body.clearances,
      materials: {
        skidSize: (body.product.weight > 2000 ? '4x4' : '3x3') as '3x3' | '4x4',
        plywoodThickness: 0.25,
        panelThickness: 1.0,
        cleatSize: '1x4' as const
      }
    };

    const generator = new NXGenerator(config);
    
    // Generate header with part numbers
    const header = [
      `# Base Part Number: ${body.partNumbers?.base || 'N/A'}`,
      `# Crate Part Number: ${body.partNumbers?.crate || 'N/A'}`,
      `# Cap Part Number: ${body.partNumbers?.cap || 'N/A'}`,
      ''
    ].join('\n');
    
    const expressions = `${header}${generator.exportNXExpressions()}`;
    const timestamp = Date.now();
    const filename = `crate_expressions_${timestamp}.exp`;

    // Return file with proper headers to avoid Windows Zone.Identifier
    // Using proper Content-Disposition with attachment forces download
    // and helps prevent Windows from adding security properties
    return new NextResponse(expressions, {
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        // These headers help prevent Windows from adding Zone.Identifier
        'X-Content-Type-Options': 'nosniff',
        'Content-Transfer-Encoding': 'binary',
        // Expose Content-Disposition for CORS if needed
        'Access-Control-Expose-Headers': 'Content-Disposition'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate NX expressions',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return heavyRateLimit(request, postHandler);
}

