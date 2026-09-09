export type ServiceMode = 'none' | 'general' | 'advanced';

export type AdvancedPage = 'verify' | 'history' | 'account';

export interface User {
  id: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface ExtractedDocumentFields {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  documentNumber: string;
  passportNumber: string;
  visaNumber: string;
  permitNumber?: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
}

export interface AdditionalField {
  label: string;
  value: string;
}

export type VerificationResultStatus = 'REAL' | 'FAKE';

export interface DetailedAnalysis {
  documentDetails: string;
  verificationAnalysis: string;
  expiryInformation: string;
  imageAnalysis: string;
  detectedIssues: string[];
}

export interface Verification {
  id: string;
  userId?: string; // Empty for General mode, user ID for Advanced mode
  documentType: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  previewUrl?: string; // base64 or object URL
  fields: ExtractedDocumentFields;
  additionalFields: AdditionalField[];
  result: VerificationResultStatus;
  analysis: string;
  detailedAnalysis?: DetailedAnalysis;
  createdAt: string;
}

export interface HistoryRecord extends Verification {
  userId: string;
}
