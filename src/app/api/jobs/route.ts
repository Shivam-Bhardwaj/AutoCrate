import { NextRequest, NextResponse } from 'next/server';
import { JobQueue } from '@/services/jobQueue';

/**
 * GET /api/jobs - Get all jobs or filtered jobs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const stats = searchParams.get('stats') === 'true';
    
    if (stats) {
      // Return job queue statistics
      const statistics = JobQueue.getStatistics();
      return NextResponse.json({
        success: true,
        data: statistics
      });
    }
    
    // Get filtered jobs
    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    const jobs = JobQueue.getJobs(filter);
    
    return NextResponse.json({
      success: true,
      data: jobs,
      count: jobs.length,
      filter
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch jobs',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/jobs - Clear old completed jobs
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const maxAge = searchParams.get('maxAge');
    
    // Default to 1 hour if not specified
    const maxAgeMs = maxAge ? parseInt(maxAge) : 3600000;
    
    const cleared = JobQueue.clearOldJobs(maxAgeMs);
    
    return NextResponse.json({
      success: true,
      message: `Cleared ${cleared} old jobs`,
      data: {
        cleared,
        maxAgeMs,
        maxAgeHours: maxAgeMs / 3600000
      }
    });
  } catch (error) {
    console.error('Error clearing jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear jobs',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}