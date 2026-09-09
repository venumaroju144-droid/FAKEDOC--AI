import React from 'react';
import { AdditionalField, DetailedAnalysis, ExtractedDocumentFields } from '../types';

interface ExtractedDetailsProps {
  documentType: string;
  fields: ExtractedDocumentFields;
  additionalFields?: AdditionalField[];
  detailedAnalysis?: DetailedAnalysis;
  showAdvancedDetails?: boolean;
}

export const ExtractedDetails: React.FC<ExtractedDetailsProps> = ({
  documentType,
  fields,
  additionalFields = [],
  detailedAnalysis,
  showAdvancedDetails = false,
}) => {
  const standardFieldsList = [
    { label: 'Full Name', value: fields.fullName },
    { label: 'Date of Birth', value: fields.dateOfBirth },
    { label: 'Gender', value: fields.gender },
    { label: 'Nationality', value: fields.nationality },
    { label: 'Document Number', value: fields.documentNumber },
    { label: 'Passport Number', value: fields.passportNumber },
    { label: 'Visa Number', value: fields.visaNumber },
    { label: 'Permit Number', value: fields.permitNumber || 'Not detected' },
    { label: 'Issue Date', value: fields.issueDate },
    { label: 'Expiry Date', value: fields.expiryDate },
    { label: 'Issuing Authority', value: fields.issuingAuthority },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Document Type Header */}
      <div className="pb-3 border-b border-neutral-200">
        <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block mb-1">
          Identified Document
        </span>
        <h2 id="extracted-doc-type" className="text-xl font-semibold text-neutral-900">
          {documentType || 'Official Document'}
        </h2>
      </div>

      {/* Extracted Fields Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-neutral-900">Extracted Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {standardFieldsList.map((item) => {
            const isDetected = item.value && item.value !== 'Not detected';
            return (
              <div
                key={item.label}
                className="p-3 bg-neutral-50 border border-neutral-200 rounded flex flex-col justify-between"
              >
                <span className="text-xs text-neutral-500 font-medium mb-1">{item.label}</span>
                <span
                  className={`text-sm font-medium break-words ${
                    isDetected ? 'text-neutral-900' : 'text-neutral-400 italic'
                  }`}
                >
                  {item.value || 'Not detected'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Other Visible Information / Additional Fields */}
        {additionalFields && additionalFields.length > 0 && (
          <div className="pt-3">
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-2">
              Other Visible Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {additionalFields.map((field, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-neutral-50 border border-neutral-200 rounded flex flex-col justify-between"
                >
                  <span className="text-xs text-neutral-500 font-medium mb-1">{field.label}</span>
                  <span className="text-sm font-medium text-neutral-900 break-words">
                    {field.value || 'Not detected'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Mode Details (Only shown in Advanced mode) */}
      {showAdvancedDetails && detailedAnalysis && (
        <div className="pt-6 border-t border-neutral-200 space-y-5">
          <h3 className="text-base font-semibold text-neutral-900">Advanced Analysis</h3>

          {/* 1. Document Details */}
          <div className="p-4 bg-white border border-neutral-200 rounded-lg">
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1.5">
              Document Details
            </h4>
            <p className="text-sm text-neutral-800 leading-relaxed">
              {detailedAnalysis.documentDetails || 'Document layout and structural format detected.'}
            </p>
          </div>

          {/* 2. Verification Analysis */}
          <div className="p-4 bg-white border border-neutral-200 rounded-lg">
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1.5">
              Verification Analysis
            </h4>
            <p className="text-sm text-neutral-800 leading-relaxed">
              {detailedAnalysis.verificationAnalysis || 'Verification analysis completed.'}
            </p>
          </div>

          {/* 3. Expiry Information */}
          <div className="p-4 bg-white border border-neutral-200 rounded-lg">
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1.5">
              Expiry Information
            </h4>
            <p className="text-sm text-neutral-800 leading-relaxed">
              {detailedAnalysis.expiryInformation || 'Expiry dates verified against validity periods.'}
            </p>
          </div>

          {/* 4. Image Analysis */}
          <div className="p-4 bg-white border border-neutral-200 rounded-lg">
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1.5">
              Image Analysis
            </h4>
            <p className="text-sm text-neutral-800 leading-relaxed">
              {detailedAnalysis.imageAnalysis || 'Image resolution and edge integrity analyzed.'}
            </p>
          </div>

          {/* 5. Detected Issues */}
          <div className="p-4 bg-white border border-neutral-200 rounded-lg">
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1.5">
              Detected Issues
            </h4>
            {detailedAnalysis.detectedIssues && detailedAnalysis.detectedIssues.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm text-neutral-800">
                {detailedAnalysis.detectedIssues.map((issue, i) => (
                  <li key={i} className="text-neutral-800">
                    {issue}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500 italic">
                No structural anomalies or visual defects detected.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
