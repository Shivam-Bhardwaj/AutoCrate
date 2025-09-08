import { NextRequest, NextResponse } from 'next/server';
import { loadMarkdownFile, documentExists } from '@/services/markdownLoader';

export async function GET(
  request: NextRequest,
  { params }: { params: { docId: string } }
) {
  const { docId } = params;

  try {
    // Validate document ID
    if (!documentExists(docId)) {
      return NextResponse.json(
        { error: 'Documentation not found' },
        { status: 404 }
      );
    }

    // Load markdown content
    const content = await loadMarkdownFile(docId);

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error(`Error loading documentation ${docId}:`, error);
    
    return NextResponse.json(
      { error: 'Failed to load documentation' },
      { status: 500 }
    );
  }
}