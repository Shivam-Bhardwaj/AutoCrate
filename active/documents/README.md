# Document Processor Tool

This directory contains the implementation of a document processing tool similar to Sejda, designed to be a standard for document manipulation in LLM applications.

## Features

- PDF splitting and merging
- Document compression
- Page rotation and extraction
- Security features (encryption/decryption)
- Advanced operations (OCR, conversion, optimization)

## Structure

- `page.tsx`: Main UI component
- `layout.tsx`: Layout wrapper
- `services/document-processor.ts`: Core document processing logic
- `docs/document-processor.md`: Documentation

## How to Use

1. Upload PDF documents
2. Select an operation from the processing tools
3. Process the documents
4. Download the results

All processing happens client-side using pdf-lib for privacy and performance.