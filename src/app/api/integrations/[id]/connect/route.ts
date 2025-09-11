/**
 * API Route for connecting to an integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { IntegrationHubService } from '@/services/integrationHub';

const integrationHub = IntegrationHubService.getInstance();

/**
 * POST /api/integrations/[id]/connect - Connect to an integration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { credentials } = body;

    const integration = integrationHub.getIntegration(params.id);
    
    if (!integration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Integration not found',
          message: `No integration found with ID: ${params.id}`,
        },
        { status: 404 }
      );
    }

    // Attempt to authenticate and connect
    const connected = await integrationHub.authenticate(params.id, credentials);

    if (!connected) {
      return NextResponse.json(
        {
          success: false,
          error: 'Connection failed',
          message: 'Failed to establish connection. Please check credentials.',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully connected to ${integration.name}`,
      data: {
        integrationId: params.id,
        status: 'connected',
      },
    });
  } catch (error) {
    console.error('Failed to connect integration:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Connection error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}