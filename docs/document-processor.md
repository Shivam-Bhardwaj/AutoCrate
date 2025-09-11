# Document Processor Tool

The Document Processor is a powerful tool for manipulating PDF documents directly in the browser. It provides a wide range of features for organizing, editing, securing, and optimizing PDF files.

## Features

- **Organize**: Split, merge, extract, and compress PDFs
- **Edit**: Rotate, crop, resize, and add watermarks to pages
- **Security**: Encrypt, decrypt, redact, and manage permissions
- **Advanced**: OCR text recognition, format conversion, optimization, and digital signatures

## Getting Started

1. Navigate to the Document Processor tool
2. Upload one or more PDF files using the drag-and-drop area or file browser
3. Select a processing operation from the tabs
4. Click the operation button to process your documents
5. Download the processed files when complete

## Supported Operations

### Organize
- **Split**: Separate each page of a PDF into individual files
- **Merge**: Combine multiple PDFs into a single document
- **Extract**: Select specific pages from a PDF
- **Compress**: Reduce the file size of PDFs

### Edit
- **Rotate**: Rotate pages in 90-degree increments
- **Crop**: Remove unwanted edges from pages
- **Resize**: Adjust the dimensions of pages
- **Watermark**: Add text or image watermarks

### Security
- **Encrypt**: Password-protect PDFs
- **Decrypt**: Remove password protection
- **Redact**: Permanently remove sensitive content
- **Permissions**: Set document usage restrictions

### Advanced
- **OCR**: Extract text from scanned documents
- **Convert**: Change PDFs to other formats
- **Optimize**: Improve document performance
- **Sign**: Add digital signatures

## Technical Implementation

The Document Processor uses the following technologies:

- **pdf-lib**: For PDF manipulation in the browser
- **file-saver**: For downloading processed files
- **Zustand**: For state management
- **Next.js API Routes**: For server-side processing (when needed)

All processing happens directly in the browser for privacy and performance, with no files uploaded to external servers.

## Usage Tips

- For best performance, process smaller files first
- Some operations may take longer with larger documents
- Always save your original files before processing
- Download processed files immediately as they are not stored on the server