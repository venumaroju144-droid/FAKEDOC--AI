import React, { useRef, useState } from 'react';

interface DocumentUploaderProps {
  onFileSelected: (fileData: {
    file: File;
    dataUrl: string;
    mimeType: string;
    name: string;
    size: number;
  }) => void;
  onError: (errorMessage: string) => void;
  disabled?: boolean;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onFileSelected,
  onError,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndProcessFile = (file: File) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      onError('File is too large. Please upload a document smaller than 20MB.');
      return;
    }

    // Check extension
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    const isExtensionAllowed = ALLOWED_EXTENSIONS.includes(ext);
    const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.type);

    if (!isExtensionAllowed && !isMimeAllowed) {
      onError('Please upload a supported document (.jpg, .jpeg, .png, .webp, .pdf).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = reader.result as string;
        onFileSelected({
          file,
          dataUrl: result,
          mimeType: file.type || (ext === '.pdf' ? 'application/pdf' : 'image/jpeg'),
          name: file.name,
          size: file.size,
        });
      } catch (err) {
        console.error('File read error:', err);
        onError('Failed to read document file. Please try again.');
      }
    };

    reader.onerror = () => {
      onError('Error reading document. Please try another file.');
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndProcessFile(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndProcessFile(selectedFile);
    }
    // Reset file input value to allow re-uploading same file if desired
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        id="document-file-input"
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileInputChange}
        disabled={disabled}
        className="hidden"
      />

      <div
        id="dropzone-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-10 sm:p-14 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-neutral-900 bg-neutral-100'
            : 'border-neutral-300 hover:border-neutral-500 bg-neutral-50/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="max-w-sm mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600 mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <p className="text-base font-medium text-neutral-900 mb-1">
            Upload Document
          </p>
          <p className="text-xs text-neutral-500 mb-5">
            Supported formats: JPG, JPEG, PNG, WEBP, PDF (max 20MB)
          </p>

          <button
            id="btn-upload-document"
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) fileInputRef.current?.click();
            }}
            className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded hover:bg-neutral-800 transition-colors"
          >
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
};
