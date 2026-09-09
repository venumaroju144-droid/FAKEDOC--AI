import React, { useState } from 'react';
import { ConfigureAiModal } from '../components/ConfigureAiModal';
import { DocumentPreview } from '../components/DocumentPreview';
import { DocumentUploader } from '../components/DocumentUploader';
import { ExtractedDetails } from '../components/ExtractedDetails';
import { ProcessingView } from '../components/ProcessingView';
import { VerificationResult } from '../components/VerificationResult';
import { analyzeDocumentWithGemini, ApiKeyMissingError, isAiConfigured } from '../services/documentAI';
import { ExtractedDocumentFields, VerificationResultStatus } from '../types';

interface GeneralVerifyProps {
  onBackToHome: () => void;
}

interface UploadedFileState {
  file: File;
  dataUrl: string;
  mimeType: string;
  name: string;
  size: number;
}

interface GeneralVerificationData {
  documentType: string;
  fields: ExtractedDocumentFields;
  additionalFields: Array<{ label: string; value: string }>;
  result: VerificationResultStatus;
}

export const GeneralVerify: React.FC<GeneralVerifyProps> = ({ onBackToHome }) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFileState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [verificationData, setVerificationData] = useState<GeneralVerificationData | null>(null);

  const handleFileSelected = (fileData: UploadedFileState) => {
    setErrorMessage(null);
    setVerificationData(null);
    setUploadedFile(fileData);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setVerificationData(null);
    setErrorMessage(null);
  };

  const handleVerifyDocument = async () => {
    if (!uploadedFile) return;

    // Check API Key configuration
    if (!isAiConfigured()) {
      setErrorMessage('AI verification is not configured.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const response = await analyzeDocumentWithGemini({
        base64Data: uploadedFile.dataUrl,
        mimeType: uploadedFile.mimeType,
        fileName: uploadedFile.name,
      });

      setVerificationData({
        documentType: response.documentType,
        fields: response.fields,
        additionalFields: response.additionalFields,
        result: response.result,
      });
    } catch (err: any) {
      console.error('Verification error:', err);
      if (err instanceof ApiKeyMissingError || err.message?.includes('not configured')) {
        setErrorMessage('AI verification is not configured.');
      } else {
        setErrorMessage(err.message || 'Unable to process this document. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetAll = () => {
    setUploadedFile(null);
    setVerificationData(null);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-neutral-200 py-3.5 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            id="btn-general-back"
            type="button"
            onClick={onBackToHome}
            className="text-xs text-neutral-600 hover:text-neutral-900 inline-flex items-center cursor-pointer"
          >
            ← Back to selection
          </button>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
            GENERAL MODE
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Title and subtitle */}
        <div className="mb-8">
          <h1 id="general-page-title" className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
            Verify Document
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Upload a document to extract its information and verify it.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            id="general-error-banner"
            className="mb-6 p-4 bg-neutral-50 border border-neutral-300 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <span className="text-xs text-neutral-800 font-medium">
              {errorMessage}
            </span>
            {errorMessage.includes('not configured') && (
              <button
                id="btn-configure-ai-general"
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
              >
                Configure AI
              </button>
            )}
          </div>
        )}

        {/* Processing State */}
        {isProcessing ? (
          <ProcessingView />
        ) : !uploadedFile ? (
          /* Initial Upload Box */
          <div className="py-4">
            <DocumentUploader
              onFileSelected={handleFileSelected}
              onError={(err) => setErrorMessage(err)}
            />
          </div>
        ) : !verificationData ? (
          /* File uploaded, ready for verification */
          <div className="space-y-6 max-w-xl mx-auto">
            <DocumentPreview
              previewUrl={uploadedFile.dataUrl}
              mimeType={uploadedFile.mimeType}
              fileName={uploadedFile.name}
              fileSize={uploadedFile.size}
              onRemove={handleRemoveFile}
            />

            <button
              id="btn-run-verify-general"
              type="button"
              onClick={handleVerifyDocument}
              className="w-full py-3 px-6 bg-neutral-900 text-white text-sm font-semibold rounded tracking-wider uppercase hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
            >
              VERIFY DOCUMENT
            </button>
          </div>
        ) : (
          /* Verification Completed Result */
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Document Preview (Left on desktop, top on mobile) */}
              <div className="lg:col-span-5">
                <DocumentPreview
                  previewUrl={uploadedFile.dataUrl}
                  mimeType={uploadedFile.mimeType}
                  fileName={uploadedFile.name}
                  fileSize={uploadedFile.size}
                />
              </div>

              {/* Extracted Details (Right on desktop, below on mobile) */}
              <div className="lg:col-span-7">
                <ExtractedDetails
                  documentType={verificationData.documentType}
                  fields={verificationData.fields}
                  additionalFields={verificationData.additionalFields}
                  showAdvancedDetails={false}
                />
              </div>
            </div>

            {/* Prominent Single-Word Result: REAL or FAKE */}
            <VerificationResult result={verificationData.result} />

            {/* Action to verify another document */}
            <div className="text-center pt-4">
              <button
                id="btn-verify-another-general"
                type="button"
                onClick={handleResetAll}
                className="px-6 py-2.5 bg-white border border-neutral-300 text-xs font-medium text-neutral-800 rounded hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Verify Another Document
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Configure AI Modal */}
      <ConfigureAiModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSaved={() => setErrorMessage(null)}
      />
    </div>
  );
};
