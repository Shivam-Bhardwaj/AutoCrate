/**
 * API Route for syncing integration data
 */

import { NextRequest, NextResponse } from 'next/server';
import { IntegrationHubService } from '@/services/integrationHub';

const integrationHub = IntegrationHubService.getInstance();

/**
 * POST /api/integrations/[id]/sync - Trigger data sync for an integration
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { options } = body;

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

    if (integration.status !== 'connected') {
      return NextResponse.json(
        {
          success: false,
          error: 'Not connected',
          message: 'Integration must be connected before syncing',
        },
        { status: 400 }
      );
    }

    // Create sync job
    const jobId = integrationHub.createJob(
      integration.type,
      params.id,
      'sync',
      options || {}
    );

    return NextResponse.json({
      success: true,
      message: `Sync started for ${integration.name}`,
      data: {
        jobId,
        integrationId: params.id,
        operation: 'sync',
      },
    });
  } catch (error) {
    console.error('Failed to sync integration:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Sync error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}