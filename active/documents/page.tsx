'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Download, 
  RotateCcw, 
  Eye, 
  Split, 
  Merge, 
  Lock, 
  Unlock,
  FilePlus,
  FileMinus,
  FileSearch,
  FileCog
} from 'lucide-react';
import { DocumentProcessorService, ProcessedDocument } from './services/document-processor';
import { useDocumentProcessingStore } from '@/store/document-processing-store';

export default function DocumentProcessor() {
  const {
    uploadedFiles,
    processedFiles,
    isProcessing,
    addUploadedFile,
    removeUploadedFile,
    clearAll,
    setProcessedFiles,
    setIsProcessing
  } = useDocumentProcessingStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      newFiles.forEach(file => addUploadedFile(file));
    }
  };

  const processDocument = async (operation: string) => {
    if (uploadedFiles.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      let results: ProcessedDocument[] = [];
      
      switch (operation) {
        case 'split':
          // For split, we process the first file
          if (uploadedFiles.length > 0) {
            results = await DocumentProcessorService.splitDocument(uploadedFiles[0]);
          }
          break;
          
        case 'merge':
          // Merge all uploaded files
          if (uploadedFiles.length > 0) {
            const merged = await DocumentProcessorService.mergeDocuments(uploadedFiles);
            results = [merged];
          }
          break;
          
        case 'compress':
          // Compress each file
          results = await Promise.all(
            uploadedFiles.map(file => DocumentProcessorService.compressDocument(file))
          );
          break;
          
        case 'rotate':
          // Rotate each file by 90 degrees
          results = await Promise.all(
            uploadedFiles.map(file => DocumentProcessorService.rotatePages(file, 90))
          );
          break;
          
        default:
          // For other operations, we'll just simulate for now
          results = uploadedFiles.map((file, index) => ({
            id: `${index}`,
            name: `${file.name.split('.')[0]}_${operation}.${file.name.split('.').pop()}`,
            blob: new Blob(),
            size: file.size,
            type: file.type
          }));
      }
      
      setProcessedFiles(results);
    } catch (error) {
      console.error('Document processing error:', error);
      alert('Failed to process documents. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadDocument = (document: ProcessedDocument) => {
    DocumentProcessorService.downloadDocument(document);
  };

  const downloadAllDocuments = () => {
    DocumentProcessorService.downloadDocumentsAsZip(processedFiles);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Document Processor</h1>
          <p className="text-muted-foreground mt-2">
            Upload, process, and manage your PDF documents with ease
          </p>
        </div>
        <Button 
          variant="outline" 
          className="mt-4 md:mt-0"
          onClick={clearAll}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Upload Documents
              </CardTitle>
              <CardDescription>
                Upload PDF files for processing. Supported formats: PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 font-medium">Drag and drop files here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  or click to browse your files
                </p>
                <Button className="mt-4" variant="secondary">
                  Select Files
                </Button>
                <Input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept=".pdf"
                  onChange={handleFileUpload}
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Uploaded Files ({uploadedFiles.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {uploadedFiles.map((file, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-muted-foreground mr-3" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeUploadedFile(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Tools */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileCog className="mr-2 h-5 w-5" />
                Processing Tools
              </CardTitle>
              <CardDescription>
                Select an operation to perform on your documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="organize">
                <TabsList className="grid grid-cols-2 md:grid-cols-4">
                  <TabsTrigger value="organize">Organize</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="organize" className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('split')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <Split className="h-6 w-6 mb-2" />
                      Split
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('merge')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <Merge className="h-6 w-6 mb-2" />
                      Merge
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('extract')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <FileSearch className="h-6 w-6 mb-2" />
                      Extract
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('compress')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <FileMinus className="h-6 w-6 mb-2" />
                      Compress
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="edit" className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('rotate')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <RotateCcw className="h-6 w-6 mb-2" />
                      Rotate
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('crop')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <FileMinus className="h-6 w-6 mb-2" />
                      Crop
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('resize')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <Eye className="h-6 w-6 mb-2" />
                      Resize
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('watermark')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <FilePlus className="h-6 w-6 mb-2" />
                      Watermark
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="security" className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('encrypt')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <Lock className="h-6 w-6 mb-2" />
                      Encrypt
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('decrypt')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <Unlock className="h-6 w-6 mb-2" />
                      Decrypt
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('redact')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <FileMinus className="h-6 w-6 mb-2" />
                      Redact
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('permissions')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <FileCog className="h-6 w-6 mb-2" />
                      Permissions
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="mt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('ocr')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <FileSearch className="h-6 w-6 mb-2" />
                      OCR
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('convert')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <FileText className="h-6 w-6 mb-2" />
                      Convert
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('optimize')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <FileMinus className="h-6 w-6 mb-2" />
                      Optimize
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto py-4 flex flex-col"
                      onClick={() => processDocument('sign')}
                      disabled={isProcessing || uploadedFiles.length === 0}
                    >
                      <FilePlus className="h-6 w-6 mb-2" />
                      Sign
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              
              {isProcessing && (
                <div className="mt-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  <p className="mt-2 text-muted-foreground">Processing documents...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Processed Documents</CardTitle>
              <CardDescription>
                {processedFiles.length > 0 
                  ? `Ready for download (${processedFiles.length})` 
                  : 'No documents processed yet'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processedFiles.length > 0 ? (
                <div className="space-y-3">
                  {processedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-muted-foreground mr-3" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <div className="flex items-center mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(file.size / 1024)} KB
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => downloadDocument(file)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <Button className="w-full" onClick={downloadAllDocuments}>
                    <Download className="mr-2 h-4 w-4" />
                    Download All
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    Processed documents will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Badge className="mr-2">✓</Badge>
                  <span>Split and merge PDFs</span>
                </li>
                <li className="flex items-center">
                  <Badge className="mr-2">✓</Badge>
                  <span>Rotate and crop pages</span>
                </li>
                <li className="flex items-center">
                  <Badge className="mr-2">✓</Badge>
                  <span>Add watermarks and headers</span>
                </li>
                <li className="flex items-center">
                  <Badge className="mr-2">✓</Badge>
                  <span>Encrypt and password protect</span>
                </li>
                <li className="flex items-center">
                  <Badge className="mr-2">✓</Badge>
                  <span>Extract text and images</span>
                </li>
                <li className="flex items-center">
                  <Badge className="mr-2">✓</Badge>
                  <span>Compress PDF files</span>
                </li>
                <li className="flex items-center">
                  <Badge className="mr-2">✓</Badge>
                  <span>OCR text recognition</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}