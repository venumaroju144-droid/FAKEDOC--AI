import React from 'react';

interface DocumentPreviewProps {
  previewUrl: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  onRemove?: () => void;
  disabled?: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  previewUrl,
  mimeType,
  fileName,
  fileSize,
  onRemove,
  disabled = false,
}) => {
  const isPdf = mimeType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full bg-white border border-neutral-200 rounded-lg p-4 flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
        <div className="flex flex-col truncate pr-2">
          <span className="text-xs font-semibold text-neutral-800 truncate" title={fileName}>
            {fileName}
          </span>
          <span className="text-[11px] text-neutral-500">
            {isPdf ? 'PDF Document' : 'Image Document'} • {formatFileSize(fileSize)}
          </span>
        </div>
        {onRemove && (
          <button
            id="btn-remove-document"
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="text-xs text-neutral-500 hover:text-neutral-900 px-2 py-1 rounded hover:bg-neutral-100 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            Change
          </button>
        )}
      </div>

      <div className="relative w-full min-h-[260px] max-h-[460px] bg-neutral-50 rounded border border-neutral-200/80 flex items-center justify-center overflow-hidden">
        {isPdf ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-700 border border-red-200 rounded flex items-center justify-center mb-3">
              <span className="text-sm font-bold tracking-wider">PDF</span>
            </div>
            <p className="text-sm font-medium text-neutral-800 mb-1">{fileName}</p>
            <p className="text-xs text-neutral-500 mb-3">{formatFileSize(fileSize)}</p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-700 underline hover:text-neutral-900"
            >
              Open PDF in new tab
            </a>
          </div>
        ) : (
          <img
            id="preview-document-image"
            src={previewUrl}
            alt={fileName}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[440px] object-contain rounded"
          />
        )}
      </div>
    </div>
  );
};
