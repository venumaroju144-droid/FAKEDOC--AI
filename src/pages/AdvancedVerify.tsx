import React, { useState } from 'react';
import { ConfigureAiModal } from '../components/ConfigureAiModal';
import { DocumentPreview } from '../components/DocumentPreview';
import { DocumentUploader } from '../components/DocumentUploader';
import { ExtractedDetails } from '../components/ExtractedDetails';
import { ProcessingView } from '../components/ProcessingView';
import { VerificationResult } from '../components/VerificationResult';
import { analyzeDocumentWithGemini, ApiKeyMissingError, isAiConfigured } from '../services/documentAI';
import { saveUserHistoryRecord } from '../services/storage';
import { HistoryRecord, User, Verification } from '../types';

interface AdvancedVerifyProps {
  currentUser: User;
  onRecordSaved?: (record: HistoryRecord) => void;
}

interface UploadedFileState {
  file: File;
  dataUrl: string;
  mimeType: string;
  name: string;
  size: number;
}

export const AdvancedVerify: React.FC<AdvancedVerifyProps> = ({
  currentUser,
  onRecordSaved,
}) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFileState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [currentVerification, setCurrentVerification] = useState<Verification | null>(null);

  const handleFileSelected = (fileData: UploadedFileState) => {
    setErrorMessage(null);
    setCurrentVerification(null);
    setUploadedFile(fileData);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setCurrentVerification(null);
    setErrorMessage(null);
  };

  const handleVerifyDocument = async () => {
    if (!uploadedFile) return;

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

      const verificationRecord: HistoryRecord = {
        id: 'ver_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        userId: currentUser.id,
        documentType: response.documentType,
        fileName: uploadedFile.name,
        fileType: uploadedFile.mimeType,
        fileSize: uploadedFile.size,
        previewUrl: uploadedFile.dataUrl,
        fields: response.fields,
        additionalFields: response.additionalFields,
        result: response.result,
        analysis: response.analysis,
        detailedAnalysis: response.detailedAnalysis,
        createdAt: new Date().toISOString(),
      };

      // Save record to this user's isolated history
      saveUserHistoryRecord(verificationRecord);
      if (onRecordSaved) {
        onRecordSaved(verificationRecord);
      }

      setCurrentVerification(verificationRecord);
    } catch (err: any) {
      console.error('Advanced verification error:', err);
      if (err instanceof ApiKeyMissingError || err.message?.includes('not configured')) {
        setErrorMessage('AI verification is not configured.');
      } else {
        setErrorMessage(err.message || 'Unable to process this document. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyAnother = () => {
    setUploadedFile(null);
    setCurrentVerification(null);
    setErrorMessage(null);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 id="advanced-page-title" className="text-2xl font-semibold text-neutral-900 tracking-tight">
          Verify Document
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Upload and verify documents with detailed forensic analysis and history tracking
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          id="advanced-error-banner"
          className="mb-6 p-4 bg-neutral-50 border border-neutral-300 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <span className="text-xs text-neutral-800 font-medium">
            {errorMessage}
          </span>
          {errorMessage.includes('not configured') && (
            <button
              id="btn-configure-ai-advanced"
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
        /* Document Upload Area */
        <div className="py-4">
          <DocumentUploader
            onFileSelected={handleFileSelected}
            onError={(err) => setErrorMessage(err)}
          />
        </div>
      ) : !currentVerification ? (
        /* Document uploaded, ready to verify */
        <div className="space-y-6 max-w-xl mx-auto">
          <DocumentPreview
            previewUrl={uploadedFile.dataUrl}
            mimeType={uploadedFile.mimeType}
            fileName={uploadedFile.name}
            fileSize={uploadedFile.size}
            onRemove={handleRemoveFile}
          />

          <button
            id="btn-run-verify-advanced"
            type="button"
            onClick={handleVerifyDocument}
            className="w-full py-3 px-6 bg-neutral-900 text-white text-sm font-semibold rounded tracking-wider uppercase hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
          >
            VERIFY DOCUMENT
          </button>
        </div>
      ) : (
        /* Verification Completed Result & Details */
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Document Preview */}
            <div className="lg:col-span-5">
              <DocumentPreview
                previewUrl={currentVerification.previewUrl || uploadedFile.dataUrl}
                mimeType={currentVerification.fileType}
                fileName={currentVerification.fileName}
                fileSize={currentVerification.fileSize}
              />
            </div>

            {/* Right: Extracted Details & Detailed Analysis */}
            <div className="lg:col-span-7">
              <ExtractedDetails
                documentType={currentVerification.documentType}
                fields={currentVerification.fields}
                additionalFields={currentVerification.additionalFields}
                detailedAnalysis={currentVerification.detailedAnalysis}
                showAdvancedDetails={true}
              />
            </div>
          </div>

          {/* Prominent Result: REAL or FAKE */}
          <VerificationResult result={currentVerification.result} />

          {/* Action buttons */}
          <div className="text-center pt-4">
            <button
              id="btn-verify-another-advanced"
              type="button"
              onClick={handleVerifyAnother}
              className="px-6 py-2.5 bg-white border border-neutral-300 text-xs font-medium text-neutral-800 rounded hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Verify Another Document
            </button>
          </div>
        </div>
      )}

      {/* Configure AI Modal */}
      <ConfigureAiModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSaved={() => setErrorMessage(null)}
      />
    </div>
  );
};
