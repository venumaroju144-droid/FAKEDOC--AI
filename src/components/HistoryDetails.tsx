import React from 'react';
import { HistoryRecord } from '../types';
import { DocumentPreview } from './DocumentPreview';
import { ExtractedDetails } from './ExtractedDetails';
import { VerificationResult } from './VerificationResult';

interface HistoryDetailsProps {
  record: HistoryRecord;
  onBack: () => void;
}

export const HistoryDetails: React.FC<HistoryDetailsProps> = ({ record, onBack }) => {
  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <button
          id="btn-back-to-history"
          type="button"
          onClick={onBack}
          className="inline-flex items-center text-sm font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
        >
          <span className="mr-1.5">←</span> Back to History
        </button>

        <div className="text-xs text-neutral-500">
          <span className="font-semibold text-neutral-700">Verified on:</span>{' '}
          {formatDate(record.createdAt)}
        </div>
      </div>

      {/* Main content: Responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Document Preview & Date info */}
        <div className="lg:col-span-5 space-y-4">
          {record.previewUrl ? (
            <DocumentPreview
              previewUrl={record.previewUrl}
              mimeType={record.fileType}
              fileName={record.fileName}
              fileSize={record.fileSize}
            />
          ) : (
            <div className="p-8 border border-neutral-200 rounded-lg bg-neutral-50 text-center text-xs text-neutral-500">
              Preview not available for this record.
            </div>
          )}

          {/* Date Information */}
          <div className="p-4 bg-white border border-neutral-200 rounded-lg space-y-2">
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
              Date Information
            </h4>
            <div className="text-xs space-y-1 text-neutral-700">
              <p>
                <span className="font-medium text-neutral-900">Verification Date:</span>{' '}
                {formatDate(record.createdAt)}
              </p>
              <p>
                <span className="font-medium text-neutral-900">Document Issue Date:</span>{' '}
                {record.fields.issueDate}
              </p>
              <p>
                <span className="font-medium text-neutral-900">Document Expiry Date:</span>{' '}
                {record.fields.expiryDate}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Document Details, Result, and Analysis */}
        <div className="lg:col-span-7 space-y-6">
          <ExtractedDetails
            documentType={record.documentType}
            fields={record.fields}
            additionalFields={record.additionalFields}
            detailedAnalysis={record.detailedAnalysis}
            showAdvancedDetails={true}
          />

          <VerificationResult result={record.result} />
        </div>
      </div>
    </div>
  );
};
