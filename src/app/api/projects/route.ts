import { NextRequest, NextResponse } from 'next/server';
import { CrateConfiguration } from '@/types/crate';

// In-memory storage for demo (would use database in production)
const projects = new Map<string, {
  id: string;
  name: string;
  configuration: CrateConfiguration;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}>();

// Initialize with a sample project
const sampleConfig: CrateConfiguration = {
  dimensions: { width: 48, length: 60, height: 36 },
  weight: { product: 1500, grossWeight: 1800 },
  base: { type: 'Style A', skids: 3 },
  cap: { type: 'full', topPanel: true },
  fasteners: { type: 'nails', spacing: 6 },
  cleating: { required: true, size: '1x4' },
  foam: true,
  mbb: false,
  vinyl: false,
  diagonalBracing: false,
  ispm15Compliant: true,
  fragile: false,
  shockIndicators: false,
  tiltIndicators: false,
  sustainableMaterials: false,
  shipping: { mode: 'ground', international: false, urgent: false }
};

projects.set('default', {
  id: 'default',
  name: 'Default Project',
  configuration: sampleConfig,
  createdAt: new Date(),
  updatedAt: new Date()
});

/**
 * GET /api/projects - List all projects
 */
export async function GET(request: NextRequest) {
  try {
    const projectList = Array.from(projects.values());
    
    return NextResponse.json({
      success: true,
      data: projectList,
      count: projectList.length
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch projects',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects - Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, configuration, metadata } = body;

    if (!name || !configuration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Name and configuration are required'
        },
        { status: 400 }
      );
    }

    // Validate configuration
    if (!configuration.dimensions || !configuration.weight) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid configuration',
          message: 'Configuration must include dimensions and weight'
        },
        { status: 400 }
      );
    }

    const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const project = {
      id,
      name,
      configuration,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    projects.set(id, project);

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create project',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects - Update a project
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, configuration, metadata } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing project ID',
          message: 'Project ID is required for updates'
        },
        { status: 400 }
      );
    }

    const project = projects.get(id);
    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
          message: `No project found with ID: ${id}`
        },
        { status: 404 }
      );
    }

    // Update project fields
    if (name) project.name = name;
    if (configuration) project.configuration = configuration;
    if (metadata) project.metadata = metadata;
    project.updatedAt = new Date();

    projects.set(id, project);

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update project',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects - Delete a project
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing project ID',
          message: 'Project ID is required for deletion'
        },
        { status: 400 }
      );
    }

    if (!projects.has(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
          message: `No project found with ID: ${id}`
        },
        { status: 404 }
      );
    }

    projects.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete project',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}