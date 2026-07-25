/**
 * lcReconciliationService.ts
 * ─────────────────────────────────────────────────────────────
 * LC Reconciliation Engine
 * Calculates: Total LC Value − Σ(Approved Form 3 Disbursements)
 * Throws InsufficientLcFundsError if requested amount > remaining balance.
 * ─────────────────────────────────────────────────────────────
 */

import { logAuditEvent } from './auditService.js';

// ── Error Classes ──────────────────────────────────────────────────────────

export class LcNotFoundError extends Error {
  code = 'LC_NOT_FOUND';
  httpStatus = 404;
  constructor(public lcId: string) {
    super(`No active Letter of Credit found for ID '${lcId}'.`);
  }
}

export class InsufficientLcFundsError extends Error {
  code     = 'INSUFFICIENT_LC_FUNDS';
  httpStatus = 422;
  constructor(
    public lcId:             string,
    public requestedAmount:  number,
    public remainingBalance: number,
    public totalValue:       number,
    public totalDisbursed:   number,
    public currency:         string
  ) {
    super(
      `INSUFFICIENT_LC_FUNDS: Requested ${requestedAmount.toLocaleString()} ${currency} ` +
      `exceeds remaining LC balance of ${remainingBalance.toLocaleString()} ${currency}. ` +
      `(Total LC: ${totalValue.toLocaleString()}, Disbursed: ${totalDisbursed.toLocaleString()})`
    );
  }

  toHttpResponse(auditEventId?: string) {
    const shortfall = this.requestedAmount - this.remainingBalance;
    return {
      error:    this.code,
      code:     'LC_BALANCE_EXCEEDED',
      message:  'Form 3 generation blocked: Requested payment exceeds remaining Letter of Credit balance.',
      details: {
        lcId:             this.lcId,
        lcTotalValue:     this.totalValue,
        totalDisbursed:   this.totalDisbursed,
        remainingBalance: this.remainingBalance,
        requestedAmount:  this.requestedAmount,
        shortfall,
        currency:         this.currency,
      },
      resolution:   'Contact NOC Head of Accounts to amend or extend the Letter of Credit.',
      auditEventId: auditEventId || null,
    };
  }
}

export class OcrPendingReviewError extends Error {
  code      = 'INVOICE_PENDING_MANUAL_REVIEW';
  httpStatus = 403;
  constructor(public claimId: string, public confidence: number) {
    super(
      `Invoice for claim '${claimId}' requires manual PMO review before Form 3 can be issued ` +
      `(OCR confidence: ${(confidence * 100).toFixed(1)}%).`
    );
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface LcRecord {
  id:            string;
  project_id:    string;
  subsidiary_id: string;
  total_value:   number;
  currency:      string;
  issuing_bank:  string;
  expiry_date:   string;
  status:        'ACTIVE' | 'EXHAUSTED' | 'EXPIRED' | 'CANCELLED';
  created_at:    string;
}

export interface LcBalanceResult {
  lc:               LcRecord;
  totalValue:       number;
  totalDisbursed:   number;
  remainingBalance: number;
  disbursements:    any[];
}

export interface Form3GenerationRequest {
  claimId:         string;
  lcId:            string;
  requestedAmount: number;
  actorUserId:     string;
  form3Reference?: string;
}

// ── Core Balance Calculation ───────────────────────────────────────────────

export function calculateLcBalance(lcId: string, db: any): LcBalanceResult {
  // Step 1: Fetch the active LC record
  const lc = db.prepare(
    `SELECT * FROM letter_of_credits WHERE id = ? AND status = 'ACTIVE'`
  ).get(lcId);

  if (!lc) throw new LcNotFoundError(lcId);

  // Step 2: Sum all non-reversed Form 3 approvals against this LC
  // SQL equivalent:
  //   SELECT COALESCE(SUM(approved_amount), 0) AS total_disbursed
  //   FROM form3_approvals WHERE lc_id = :lcId AND status = 'ACTIVE'
  const disbursements: any[] = db.prepare(
    `SELECT * FROM form3_approvals WHERE lc_id = ? AND status = 'ACTIVE'`
  ).all(lcId);

  const totalDisbursed: number = disbursements.reduce(
    (sum: number, row: any) => sum + (Number(row.approved_amount) || 0),
    0
  );

  const remainingBalance = Number(lc.total_value) - totalDisbursed;

  return {
    lc,
    totalValue:       Number(lc.total_value),
    totalDisbursed,
    remainingBalance,
    disbursements,
  };
}

// ── OCR Status Guard ───────────────────────────────────────────────────────

export function assertOcrVerified(claimId: string, db: any): void {
  const ocrResult = db.prepare(
    `SELECT * FROM invoice_ocr_results WHERE claim_id = ? ORDER BY created_at DESC`
  ).get(claimId);

  if (!ocrResult) {
    // No OCR record at all — treat as unverified
    throw new OcrPendingReviewError(claimId, 0);
  }

  if (ocrResult.status === 'MANUAL_REVIEW_REQUIRED' && !ocrResult.reviewed_by) {
    throw new OcrPendingReviewError(claimId, ocrResult.overall_confidence);
  }
}

// ── Form 3 Generation with Full Guard ─────────────────────────────────────

export function generateForm3WithLcGuard(
  req: Form3GenerationRequest,
  db: any
): {
  form3Id:          string;
  form3Reference:   string;
  approvedAmount:   number;
  remainingBalance: number;
  auditEventId:     string;
} {
  const { claimId, lcId, requestedAmount, actorUserId, form3Reference } = req;

  // ── Guard 1: OCR must be verified ─────────────────────────────────────
  assertOcrVerified(claimId, db);

  // ── Guard 2: LC balance check ──────────────────────────────────────────
  const { lc, totalValue, totalDisbursed, remainingBalance } = calculateLcBalance(lcId, db);

  if (requestedAmount > remainingBalance) {
    // Log blocked attempt to audit chain
    const auditBlock = logAuditEvent(
      actorUserId,
      'FORM3_BLOCKED_INSUFFICIENT_LC',
      lcId,
      `Form 3 blocked: Requested ${requestedAmount.toLocaleString()} ${lc.currency} exceeds ` +
      `remaining LC balance of ${remainingBalance.toLocaleString()} ${lc.currency}. ` +
      `Claim: ${claimId}. Total LC: ${totalValue.toLocaleString()}, Disbursed: ${totalDisbursed.toLocaleString()}.`
    );

    throw new InsufficientLcFundsError(
      lcId, requestedAmount, remainingBalance, totalValue, totalDisbursed, lc.currency
    );
  }

  // ── Commit: Insert Form 3 approval record ─────────────────────────────
  const form3Id  = `F3-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const form3Ref = form3Reference || `NOC-FORM3-${new Date().getFullYear()}-${form3Id.slice(-6)}`;
  const now      = new Date().toISOString();

  db.prepare(
    `INSERT INTO form3_approvals
     (id, lc_id, claim_id, approved_amount, form3_reference, approved_by, approved_at, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(form3Id, lcId, claimId, requestedAmount, form3Ref, actorUserId, now, 'ACTIVE');

  // ── Check LC exhaustion ────────────────────────────────────────────────
  const newRemainingBalance = remainingBalance - requestedAmount;
  if (newRemainingBalance <= 0) {
    db.prepare(
      `UPDATE letter_of_credits SET status = 'EXHAUSTED' WHERE id = ?`
    ).run(lcId);

    logAuditEvent(
      'system', 'LC_EXHAUSTED', lcId,
      `Letter of Credit ${lcId} fully exhausted after Form 3 approval ${form3Id}. ` +
      `Total disbursed: ${(totalDisbursed + requestedAmount).toLocaleString()} ${lc.currency}.`
    );
  }

  // ── Audit: successful generation ──────────────────────────────────────
  const auditBlock = logAuditEvent(
    actorUserId,
    'FORM3_GENERATED',
    form3Id,
    `Form 3 issued. Reference: ${form3Ref}. Claim: ${claimId}. LC: ${lcId}. ` +
    `Amount: ${requestedAmount.toLocaleString()} ${lc.currency}. ` +
    `Remaining LC balance: ${newRemainingBalance.toLocaleString()} ${lc.currency}.`
  );

  return {
    form3Id,
    form3Reference:  form3Ref,
    approvedAmount:  requestedAmount,
    remainingBalance: newRemainingBalance,
    auditEventId:    auditBlock.hash,
  };
}
