import { NextRequest, NextResponse } from 'next/server';
import { JobQueue } from '@/services/jobQueue';

/**
 * GET /api/jobs/[id] - Get job status by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing job ID',
          message: 'Job ID is required'
        },
        { status: 400 }
      );
    }
    
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
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch job',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/jobs/[id] - Cancel a job
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing job ID',
          message: 'Job ID is required'
        },
        { status: 400 }
      );
    }
    
    const cancelled = JobQueue.cancelJob(jobId);
    
    if (!cancelled) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot cancel job',
          message: 'Job not found or already processing/completed'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel job',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/jobs/[id] - Update job progress (for manual updates)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    const body = await request.json();
    const { progress } = body;
    
    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing job ID',
          message: 'Job ID is required'
        },
        { status: 400 }
      );
    }
    
    if (progress === undefined || typeof progress !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid progress value',
          message: 'Progress must be a number between 0 and 100'
        },
        { status: 400 }
      );
    }
    
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
    
    if (job.status !== 'processing') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot update progress',
          message: 'Can only update progress for processing jobs'
        },
        { status: 400 }
      );
    }
    
    JobQueue.updateProgress(jobId, progress);
    
    return NextResponse.json({
      success: true,
      data: JobQueue.getJob(jobId),
      message: 'Job progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update job',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}