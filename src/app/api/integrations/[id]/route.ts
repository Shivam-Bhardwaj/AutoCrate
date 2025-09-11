/**
 * API Routes for Individual Integration Operations
 * Handles operations on specific integrations
 */

import { NextRequest, NextResponse } from 'next/server';
import { IntegrationHubService } from '@/services/integrationHub';

const integrationHub = IntegrationHubService.getInstance();

/**
 * GET /api/integrations/[id] - Get a specific integration
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    return NextResponse.json({
      success: true,
      data: integration,
    });
  } catch (error) {
    console.error('Failed to fetch integration:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch integration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/integrations/[id] - Update a specific integration
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const success = integrationHub.updateIntegration(params.id, body);
    
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Update failed',
          message: `Failed to update integration: ${params.id}`,
        },
        { status: 400 }
      );
    }

    const updatedIntegration = integrationHub.getIntegration(params.id);

    return NextResponse.json({
      success: true,
      data: updatedIntegration,
      message: 'Integration updated successfully',
    });
  } catch (error) {
    console.error('Failed to update integration:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update integration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/integrations/[id] - Delete a specific integration
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = integrationHub.removeIntegration(params.id);
    
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Delete failed',
          message: `Failed to delete integration: ${params.id}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Integration deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete integration:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete integration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}