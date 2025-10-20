import React, { useState } from 'react';

/**
 * Props for the StepFileUpload component.
 */
interface StepFileUploadProps {
  /**
   * Callback function called when a valid STEP file is uploaded.
   * @param file - The uploaded STEP file.
   */
  onUpload: (file: File) => void;
  /**
   * Maximum allowed file size in bytes. Defaults to 10MB.
   */
  maxFileSize?: number;
}

/**
 * Component for uploading STEP files (.step or .stp).
 * Validates file type and size, handles errors, and triggers upload callback.
 */
const StepFileUpload: React.FC<StepFileUploadProps> = ({
  onUpload,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles file selection change.
   * Validates file type and size.
   * @param event - The file input change event.
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setError(null);
      return;
    }

    // Validate file type
    const allowedExtensions = ['.step', '.stp'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please select a .step or .stp file.');
      setSelectedFile(null);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError(`File size exceeds the maximum limit of ${maxFileSize / (1024 * 1024)} MB.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  /**
   * Handles the upload action.
   * Calls the onUpload callback if a valid file is selected.
   */
  const handleUpload = () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }
    try {
      onUpload(selectedFile);
      setSelectedFile(null); // Reset after upload
      setError(null);
    } catch (err) {
      setError('An error occurred during upload. Please try again.');
    }
  };

  return (
    <div className="step-file-upload">
      <input
        type="file"
        accept=".step,.stp"
        onChange={handleFileChange}
        aria-label="Select STEP file"
      />
      {selectedFile && (
        <p>Selected file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>
      )}
      {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleUpload} disabled={!selectedFile}>
        Upload STEP File
      </button>
    </div>
  );
};

export default StepFileUpload;
