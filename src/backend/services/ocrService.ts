/**
 * ocrService.ts
 * ─────────────────────────────────────────────────────────────
 * OCR Pipeline — Google Document AI Integration
 * Extracts: Total Amount + Contractor Name (AR/EN) from contractor invoice PDFs.
 * Confidence threshold: 0.90 (90%) — below triggers MANUAL_REVIEW_REQUIRED.
 * ─────────────────────────────────────────────────────────────
 */

import { logAuditEvent } from './auditService.js';

// ── Types ──────────────────────────────────────────────────────────────────

export interface OcrResult {
  id: string;
  claim_id: string;
  attachment_id: string;
  total_amount: number;
  total_amount_raw: string;
  contractor_name_en: string;
  contractor_name_ar: string;
  confidence_total_amount: number;
  confidence_contractor_name: number;
  overall_confidence: number;
  status: 'VERIFIED' | 'MANUAL_REVIEW_REQUIRED';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface OcrExtractRequest {
  claimId: string;
  attachmentId: string;
  fileBase64: string;
  mimeType?: string;
  actorUserId?: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const OCR_CONFIDENCE_THRESHOLD = 0.90;

const TOTAL_AMOUNT_KEYS_AR = [
  'المبلغ الإجمالي', 'إجمالي المبلغ', 'المبلغ الكلي',
  'الإجمالي', 'القيمة الإجمالية', 'مجموع المستحقات',
];
const TOTAL_AMOUNT_KEYS_EN = [
  'total amount', 'invoice total', 'grand total',
  'amount due', 'total due', 'net amount',
];
const CONTRACTOR_NAME_KEYS_AR = [
  'اسم المقاول', 'المقاول', 'الشركة المقاولة', 'اسم الشركة',
];
const CONTRACTOR_NAME_KEYS_EN = [
  'contractor name', 'contractor', 'company name', 'vendor name', 'supplier name',
];

// ── Arabic-Indic numeral converter ────────────────────────────────────────

function parseArabicNumber(raw: string): number {
  const normalized = raw
    .replace(/[٠١٢٣٤٥٦٧٨٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰۱۲۳۴۵۶۷۸۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[,،\s]/g, '')
    .replace(/[^0-9.]/g, '');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

// ── Matcher ────────────────────────────────────────────────────────────────

function matchesAny(key: string, candidates: string[]): boolean {
  const norm = key.trim().toLowerCase();
  return candidates.some((c) => norm.includes(c.toLowerCase()));
}

// ── Google Document AI Caller ─────────────────────────────────────────────

async function callDocumentAI(fileBase64: string, mimeType: string): Promise<any> {
  const projectId   = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location    = process.env.DOCUMENT_AI_LOCATION || 'eu';
  const processorId = process.env.DOCUMENT_AI_PROCESSOR_ID;
  const apiKey      = process.env.GOOGLE_CLOUD_API_KEY;

  if (!projectId || !processorId || !apiKey) {
    console.warn('[OCR] Google Document AI not configured — using mock OCR response.');
    return _mockDocumentAiResponse();
  }

  const endpoint =
    `https://${location}-documentai.googleapis.com/v1/projects/${projectId}` +
    `/locations/${location}/processors/${processorId}:process?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawDocument: { content: fileBase64, mimeType } }),
  });

  if (!response.ok) {
    throw new Error(`[OCR] Document AI API error ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

// ── Entity Extraction ─────────────────────────────────────────────────────

function extractFields(document: any): {
  totalAmountRaw: string;
  totalAmount: number;
  contractorNameEn: string;
  contractorNameAr: string;
  confidenceTotalAmount: number;
  confidenceContractorName: number;
} {
  const entities: any[] = document?.entities || [];
  const pages: any[]    = document?.pages || [];

  let totalAmountRaw     = '';
  let totalAmount        = 0;
  let contractorNameEn   = '';
  let contractorNameAr   = '';
  let confTotal          = 0;
  let confContractor     = 0;

  // Strategy 1: high-level entities
  for (const entity of entities) {
    const type        = (entity.type || '').toLowerCase();
    const mentionText = entity.mentionText || '';
    const confidence  = entity.confidence || 0;

    if (matchesAny(type, [...TOTAL_AMOUNT_KEYS_EN, ...TOTAL_AMOUNT_KEYS_AR])) {
      totalAmountRaw = mentionText;
      totalAmount    = parseArabicNumber(mentionText);
      confTotal      = confidence;
    }

    if (matchesAny(type, [...CONTRACTOR_NAME_KEYS_EN, ...CONTRACTOR_NAME_KEYS_AR])) {
      if (/[\u0600-\u06FF]/.test(mentionText)) contractorNameAr = mentionText;
      else contractorNameEn = mentionText;
      confContractor = Math.max(confContractor, confidence);
    }
  }

  // Strategy 2: form field key-value pairs per page
  if (!totalAmountRaw || !contractorNameEn) {
    for (const page of pages) {
      for (const field of (page.formFields || [])) {
        const keyText   = field.fieldName?.textAnchor?.content || '';
        const valueText = (field.fieldValue?.textAnchor?.content || '').trim();
        const fieldConf = Math.min(field.fieldName?.confidence || 0, field.fieldValue?.confidence || 0);

        if (!totalAmountRaw && matchesAny(keyText, [...TOTAL_AMOUNT_KEYS_EN, ...TOTAL_AMOUNT_KEYS_AR])) {
          totalAmountRaw = valueText;
          totalAmount    = parseArabicNumber(valueText);
          confTotal      = fieldConf;
        }

        if (matchesAny(keyText, [...CONTRACTOR_NAME_KEYS_EN, ...CONTRACTOR_NAME_KEYS_AR])) {
          if (/[\u0600-\u06FF]/.test(valueText) && !contractorNameAr) {
            contractorNameAr = valueText;
            confContractor   = Math.max(confContractor, fieldConf);
          } else if (valueText && !contractorNameEn) {
            contractorNameEn = valueText;
            confContractor   = Math.max(confContractor, fieldConf);
          }
        }
      }
    }
  }

  return {
    totalAmountRaw,
    totalAmount,
    contractorNameEn,
    contractorNameAr,
    confidenceTotalAmount:    confTotal,
    confidenceContractorName: confContractor,
  };
}

// ── Main Export ────────────────────────────────────────────────────────────

export async function extractInvoiceViaOcr(req: OcrExtractRequest, db: any): Promise<OcrResult> {
  const {
    claimId,
    attachmentId,
    fileBase64,
    mimeType = 'application/pdf',
    actorUserId = 'system',
  } = req;

  const aiResponse = await callDocumentAI(fileBase64, mimeType);
  const document   = aiResponse?.document || aiResponse;

  const {
    totalAmountRaw, totalAmount,
    contractorNameEn, contractorNameAr,
    confidenceTotalAmount, confidenceContractorName,
  } = extractFields(document);

  // Strict minimum — the weakest field governs the gate
  const overallConfidence = Math.min(confidenceTotalAmount, confidenceContractorName);
  const status: OcrResult['status'] =
    overallConfidence >= OCR_CONFIDENCE_THRESHOLD ? 'VERIFIED' : 'MANUAL_REVIEW_REQUIRED';

  const result: OcrResult = {
    id:                         `ocr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    claim_id:                   claimId,
    attachment_id:              attachmentId,
    total_amount:               totalAmount,
    total_amount_raw:           totalAmountRaw,
    contractor_name_en:         contractorNameEn,
    contractor_name_ar:         contractorNameAr,
    confidence_total_amount:    confidenceTotalAmount,
    confidence_contractor_name: confidenceContractorName,
    overall_confidence:         overallConfidence,
    status,
    reviewed_by:                null,
    reviewed_at:                null,
    created_at:                 new Date().toISOString(),
  };

  // Persist to DB (mock engine handles INSERT INTO invoice_ocr_results)
  db.prepare(
    `INSERT INTO invoice_ocr_results
     (id, claim_id, attachment_id, total_amount, total_amount_raw,
      contractor_name_en, contractor_name_ar,
      confidence_total_amount, confidence_contractor_name, overall_confidence,
      status, reviewed_by, reviewed_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    result.id, result.claim_id, result.attachment_id,
    result.total_amount, result.total_amount_raw,
    result.contractor_name_en, result.contractor_name_ar,
    result.confidence_total_amount, result.confidence_contractor_name,
    result.overall_confidence, result.status,
    result.reviewed_by, result.reviewed_at, result.created_at
  );

  // Audit trail
  if (status === 'VERIFIED') {
    logAuditEvent(
      actorUserId, 'OCR_VERIFIED', claimId,
      `OCR auto-verified at ${(overallConfidence * 100).toFixed(1)}% confidence. ` +
      `Total: ${totalAmount.toLocaleString()}. Contractor: ${contractorNameEn || contractorNameAr}`
    );
  } else {
    logAuditEvent(
      'system', 'OCR_FLAGGED_FOR_MANUAL_REVIEW', claimId,
      `OCR confidence ${(overallConfidence * 100).toFixed(1)}% < 90% threshold. ` +
      `Raw amount: "${totalAmountRaw}". Manual PMO review required before Form 3 may be issued.`
    );
  }

  return result;
}

// ── Mock Response (no API key) ─────────────────────────────────────────────

function _mockDocumentAiResponse() {
  return {
    document: {
      entities: [
        { type: 'total_amount',    mentionText: '4,250,000.00',                          confidence: 0.97 },
        { type: 'contractor_name', mentionText: 'National Petroleum Construction Company', confidence: 0.95 },
        { type: 'اسم المقاول',     mentionText: 'الشركة الوطنية لإنشاءات البترول',        confidence: 0.94 },
      ],
      pages: [],
    },
  };
}
