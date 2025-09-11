import { create } from 'zustand';

interface ProcessedDocument {
  id: string;
  name: string;
  blob: Blob;
  size: number;
  type: string;
}

interface DocumentProcessingState {
  uploadedFiles: File[];
  processedFiles: ProcessedDocument[];
  isProcessing: boolean;
  addUploadedFile: (file: File) => void;
  removeUploadedFile: (index: number) => void;
  clearUploadedFiles: () => void;
  setProcessedFiles: (files: ProcessedDocument[]) => void;
  clearProcessedFiles: () => void;
  setIsProcessing: (isProcessing: boolean) => void;
  clearAll: () => void;
}

export const useDocumentProcessingStore = create<DocumentProcessingState>()((set) => ({
  uploadedFiles: [],
  processedFiles: [],
  isProcessing: false,
  addUploadedFile: (file) => set((state) => ({ 
    uploadedFiles: [...state.uploadedFiles, file] 
  })),
  removeUploadedFile: (index) => set((state) => ({
    uploadedFiles: state.uploadedFiles.filter((_, i) => i !== index)
  })),
  clearUploadedFiles: () => set({ uploadedFiles: [] }),
  setProcessedFiles: (files) => set({ processedFiles: files }),
  clearProcessedFiles: () => set({ processedFiles: [] }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  clearAll: () => set({ 
    uploadedFiles: [], 
    processedFiles: [],
    isProcessing: false
  }),
}));