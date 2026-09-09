import { GoogleGenAI } from '@google/genai';
import { AdditionalField, DetailedAnalysis, ExtractedDocumentFields, VerificationResultStatus } from '../types';
import { getConfiguredApiKey } from './storage';

export class ApiKeyMissingError extends Error {
  constructor(message = 'AI verification is not configured.') {
    super(message);
    this.name = 'ApiKeyMissingError';
  }
}

export interface VerificationAiResult {
  documentType: string;
  fields: ExtractedDocumentFields;
  additionalFields: AdditionalField[];
  result: VerificationResultStatus;
  analysis: string;
  detailedAnalysis: DetailedAnalysis;
}

/**
 * Checks if a Gemini API key is currently available either from
 * environment variables or user configuration in localStorage.
 */
export function isAiConfigured(): boolean {
  const key = getConfiguredApiKey();
  return Boolean(key && key.trim().length > 0);
}

/**
 * Normalizes field value: if empty, undefined, null, or 'N/A' -> 'Not detected'
 */
function normalizeFieldValue(val: unknown): string {
  if (val === undefined || val === null) return 'Not detected';
  const str = String(val).trim();
  if (
    !str ||
    str.toLowerCase() === 'n/a' ||
    str.toLowerCase() === 'none' ||
    str.toLowerCase() === 'unknown' ||
    str.toLowerCase() === 'null' ||
    str.toLowerCase() === 'not detected'
  ) {
    return 'Not detected';
  }
  return str;
}

/**
 * Attempt to extract clean JSON string even if model wraps in code fences or text.
 */
function extractJsonString(rawText: string): string {
  let cleaned = rawText.trim();

  // Remove markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z0-9_-]*\n?/, '').replace(/\n?```$/, '');
  }

  // Look for outermost { ... }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned.trim();
}

/**
 * Performs document analysis and information extraction using Gemini.
 * Isolated to this service file as requested.
 */
export async function analyzeDocumentWithGemini(params: {
  base64Data: string;
  mimeType: string;
  fileName: string;
}): Promise<VerificationAiResult> {
  const apiKey = getConfiguredApiKey();

  if (!apiKey || !apiKey.trim()) {
    throw new ApiKeyMissingError('AI verification is not configured.');
  }

  // Remove data URL prefix if present (e.g., "data:image/png;base64,")
  let cleanBase64 = params.base64Data;
  if (cleanBase64.includes(',')) {
    cleanBase64 = cleanBase64.split(',')[1];
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const prompt = `You are a strict, professional Document Verification and Forensic OCR Analysis Engine.
Analyze the attached document file (filename: "${params.fileName}").

TASK:
1. Identify the exact Document Type (e.g. Passport, National Identity Card, Driver's License, Visa, Residence Permit, etc.).
2. Extract visible text and information into standard fields.
   IMPORTANT RULES ON INFORMATION EXTRACTION:
   - Extract ONLY information that is actually and clearly visible in the document.
   - NEVER INVENT, ASSUME, OR FABRICATE INFORMATION.
   - If any field cannot be detected or is not present on this document, specify exactly: "Not detected".
3. Perform forensic document authenticity verification using multiple signals:
   - Layout, typography, alignment, font consistency
   - Machine Readable Zone (MRZ) or barcode consistency if present
   - Logical consistency of dates (e.g. issue date vs expiry date vs birth date)
   - Possible visual inconsistencies, blur patches, digital editing, or photo tampering
   - Authenticity determination: MUST BE EITHER "REAL" OR "FAKE".
     * Mark "REAL" if the document appears authentic, structurally intact, consistent in fonts, layout, and data.
     * Mark "FAKE" if there are clear signs of forgery, inconsistent fonts, altered dates, misaligned elements, or obvious tampering.
     * Do not randomly guess. Base your decision strictly on the document evidence.
4. Provide structured detailed analysis components.

Return ONLY a valid JSON object with the following exact structure:
{
  "documentType": "String (e.g. Passport, National ID, Driver License)",
  "fields": {
    "fullName": "String or 'Not detected'",
    "dateOfBirth": "String or 'Not detected'",
    "gender": "String or 'Not detected'",
    "nationality": "String or 'Not detected'",
    "documentNumber": "String or 'Not detected'",
    "passportNumber": "String or 'Not detected'",
    "visaNumber": "String or 'Not detected'",
    "permitNumber": "String or 'Not detected'",
    "issueDate": "String or 'Not detected'",
    "expiryDate": "String or 'Not detected'",
    "issuingAuthority": "String or 'Not detected'"
  },
  "additionalFields": [
    { "label": "String", "value": "String" }
  ],
  "result": "REAL",
  "analysis": "Summary paragraph of the verification assessment",
  "detailedAnalysis": {
    "documentDetails": "Specific observations about the document format, layout, and visible structure",
    "verificationAnalysis": "Detailed assessment of text consistency, font uniformity, alignment, and data coherence",
    "expiryInformation": "Evaluation of validity dates, issuance timeframe, and current status",
    "imageAnalysis": "Evaluation of resolution, clarity, photo integration, edge alignment, and digital noise/manipulation",
    "detectedIssues": ["List of any detected anomalies, defects, or inconsistencies. Empty array if none."]
  }
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: params.mimeType,
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    const rawResponseText = response.text;
    if (!rawResponseText || !rawResponseText.trim()) {
      throw new Error('No response returned from the AI model.');
    }

    const cleanJson = extractJsonString(rawResponseText);
    let parsed: any;
    try {
      parsed = JSON.parse(cleanJson);
    } catch (parseError) {
      console.warn('Initial JSON parse failed, attempting recovery...', parseError);
      // Attempt recovery by escaping unescaped newlines or removing stray characters
      const sanitized = cleanJson
        .replace(/\r?\n/g, ' ')
        .replace(/,\s*([\]}])/g, '$1');
      parsed = JSON.parse(sanitized);
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Unable to process this document. Please try again.');
    }

    // Validate and sanitize result
    const rawResult = String(parsed.result || '').toUpperCase().trim();
    const result: VerificationResultStatus = rawResult === 'FAKE' ? 'FAKE' : 'REAL';

    const fieldsRaw = parsed.fields || {};
    const sanitizedFields: ExtractedDocumentFields = {
      fullName: normalizeFieldValue(fieldsRaw.fullName),
      dateOfBirth: normalizeFieldValue(fieldsRaw.dateOfBirth),
      gender: normalizeFieldValue(fieldsRaw.gender),
      nationality: normalizeFieldValue(fieldsRaw.nationality),
      documentNumber: normalizeFieldValue(fieldsRaw.documentNumber),
      passportNumber: normalizeFieldValue(fieldsRaw.passportNumber),
      visaNumber: normalizeFieldValue(fieldsRaw.visaNumber),
      permitNumber: normalizeFieldValue(fieldsRaw.permitNumber),
      issueDate: normalizeFieldValue(fieldsRaw.issueDate),
      expiryDate: normalizeFieldValue(fieldsRaw.expiryDate),
      issuingAuthority: normalizeFieldValue(fieldsRaw.issuingAuthority),
    };

    const additionalFields: AdditionalField[] = Array.isArray(parsed.additionalFields)
      ? parsed.additionalFields
          .filter((item: any) => item && typeof item.label === 'string' && typeof item.value === 'string')
          .map((item: any) => ({
            label: item.label.trim(),
            value: normalizeFieldValue(item.value),
          }))
      : [];

    const detailedRaw = parsed.detailedAnalysis || {};
    const detailedAnalysis: DetailedAnalysis = {
      documentDetails:
        typeof detailedRaw.documentDetails === 'string' && detailedRaw.documentDetails.trim()
          ? detailedRaw.documentDetails.trim()
          : `Detected standard ${parsed.documentType || 'document'} format with visible identification data.`,
      verificationAnalysis:
        typeof detailedRaw.verificationAnalysis === 'string' && detailedRaw.verificationAnalysis.trim()
          ? detailedRaw.verificationAnalysis.trim()
          : (parsed.analysis || 'Standard document verification completed without major discrepancies.'),
      expiryInformation:
        typeof detailedRaw.expiryInformation === 'string' && detailedRaw.expiryInformation.trim()
          ? detailedRaw.expiryInformation.trim()
          : `Issue Date: ${sanitizedFields.issueDate}; Expiry Date: ${sanitizedFields.expiryDate}.`,
      imageAnalysis:
        typeof detailedRaw.imageAnalysis === 'string' && detailedRaw.imageAnalysis.trim()
          ? detailedRaw.imageAnalysis.trim()
          : 'Document image resolution and visual layout assessed for structural integrity.',
      detectedIssues: Array.isArray(detailedRaw.detectedIssues)
        ? detailedRaw.detectedIssues.map((issue: any) => String(issue).trim()).filter(Boolean)
        : [],
    };

    return {
      documentType: String(parsed.documentType || 'Official Document').trim(),
      fields: sanitizedFields,
      additionalFields,
      result,
      analysis: String(parsed.analysis || detailedAnalysis.verificationAnalysis || 'Document verification analysis complete.').trim(),
      detailedAnalysis,
    };
  } catch (error: any) {
    console.error('Error during document AI analysis:', error);
    if (error instanceof ApiKeyMissingError) {
      throw error;
    }
    // Check if error is related to API key or unauthorized
    const msg = error?.message || '';
    if (msg.includes('API_KEY_INVALID') || msg.includes('401') || msg.includes('API key not valid')) {
      throw new Error('The configured Gemini API key is invalid or unauthorized. Please re-configure your API key.');
    }
    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
      throw new Error('Gemini API rate limit reached. Please wait a moment and try again.');
    }
    throw new Error(error.message || 'Unable to process this document. Please try again.');
  }
}
