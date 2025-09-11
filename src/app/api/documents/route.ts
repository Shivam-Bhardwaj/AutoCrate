import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const operation = formData.get('operation') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    let resultPdf: PDFDocument | null = null;
    
    switch (operation) {
      case 'split':
        // For split operation, we return information about pages
        const pageCount = pdfDoc.getPageCount();
        return NextResponse.json({ 
          operation: 'split',
          pageCount,
          pages: Array.from({ length: pageCount }, (_, i) => i + 1)
        });
        
      case 'merge':
        // Merge would typically involve multiple files, handled client-side for now
        return NextResponse.json({ 
          operation: 'merge',
          message: 'Merge operation requires multiple files, handled client-side'
        });
        
      case 'compress':
        // Save with compression options
        resultPdf = pdfDoc;
        break;
        
      case 'rotate':
        const rotation = parseInt(formData.get('rotation') as string) || 90;
        const pages = pdfDoc.getPages();
        pages.forEach(page => {
          page.setRotation(((page.getRotation() as any) + rotation) as any);
        });
        resultPdf = pdfDoc;
        break;
        
      default:
        return NextResponse.json({ error: 'Unsupported operation' }, { status: 400 });
    }
    
    if (resultPdf) {
      const pdfBytes = await resultPdf.save();
      const buffer = Buffer.from(pdfBytes);
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="processed_${file.name}"`,
        },
      });
    }
    
    return NextResponse.json({ error: 'Operation not implemented' }, { status: 501 });
  } catch (error) {
    console.error('Document processing error:', error);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}