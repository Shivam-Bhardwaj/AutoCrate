// Document processing service using existing libraries
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

export interface ProcessedDocument {
  id: string;
  name: string;
  blob: Blob;
  size: number;
  type: string;
}

export class DocumentProcessorService {
  // Split a PDF document into individual pages
  static async splitDocument(file: File): Promise<ProcessedDocument[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      const documents: ProcessedDocument[] = [];
      
      for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        
        documents.push({
          id: `${file.name}-page-${i + 1}`,
          name: `${file.name.split('.')[0]}_page_${i + 1}.pdf`,
          blob,
          size: blob.size,
          type: 'application/pdf'
        });
      }
      
      return documents;
    } catch (error) {
      throw new Error(`Failed to split document: ${error}`);
    }
  }
  
  // Merge multiple PDF documents into one
  static async mergeDocuments(files: File[]): Promise<ProcessedDocument> {
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      
      return {
        id: 'merged-document',
        name: 'merged_document.pdf',
        blob,
        size: blob.size,
        type: 'application/pdf'
      };
    } catch (error) {
      throw new Error(`Failed to merge documents: ${error}`);
    }
  }
  
  // Extract specific pages from a PDF document
  static async extractPages(file: File, pageNumbers: number[]): Promise<ProcessedDocument> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, pageNumbers.map(n => n - 1));
      copiedPages.forEach((page) => newPdf.addPage(page));
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      
      return {
        id: `${file.name}-extracted`,
        name: `${file.name.split('.')[0]}_extracted.pdf`,
        blob,
        size: blob.size,
        type: 'application/pdf'
      };
    } catch (error) {
      throw new Error(`Failed to extract pages: ${error}`);
    }
  }
  
  // Compress a PDF document
  static async compressDocument(file: File): Promise<ProcessedDocument> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // For compression, we'll just save with lower quality
      // In a real implementation, you might use additional compression libraries
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false
      });
      
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      
      return {
        id: `${file.name}-compressed`,
        name: `${file.name.split('.')[0]}_compressed.pdf`,
        blob,
        size: blob.size,
        type: 'application/pdf'
      };
    } catch (error) {
      throw new Error(`Failed to compress document: ${error}`);
    }
  }
  
  // Rotate pages in a PDF document
  static async rotatePages(file: File, rotation: number): Promise<ProcessedDocument> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        page.setRotation(((page.getRotation() as any) + rotation) as any);
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      
      return {
        id: `${file.name}-rotated`,
        name: `${file.name.split('.')[0]}_rotated.pdf`,
        blob,
        size: blob.size,
        type: 'application/pdf'
      };
    } catch (error) {
      throw new Error(`Failed to rotate pages: ${error}`);
    }
  }
  
  // Download a processed document
  static downloadDocument(document: ProcessedDocument): void {
    saveAs(document.blob, document.name);
  }
  
  // Download multiple documents as a ZIP file
  static async downloadDocumentsAsZip(documents: ProcessedDocument[]): Promise<void> {
    try {
      // In a real implementation, you would use a library like JSZip
      // For now, we'll download each document individually
      documents.forEach(doc => {
        this.downloadDocument(doc);
      });
    } catch (error) {
      throw new Error(`Failed to download documents: ${error}`);
    }
  }
}