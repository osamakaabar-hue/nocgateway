/**
 * slaMonitoringService.ts
 * ─────────────────────────────────────────────────────────────
 * SLA Monitoring Service & Business Hours Engine (PMI-PMP Aligned)
 * Tracks SLA compliance for Form 2 (Submission) -> Form 4 (Technical Approval).
 * Rules:
 *   - SLA Target: 48 Business Hours.
 *   - Business Hours: 08:00 to 16:00 (8 hours/day).
 *   - Weekend Exclusion: Friday and Saturday (Libya Standard Business Calendar).
 * ─────────────────────────────────────────────────────────────
 */

import { logAuditEvent } from './auditService.js';

export interface SlaBreachCheckRequest {
  claimId: string;
  form2SubmittedAt: string; // ISO 8601 string
  form4GeneratedAt?: string | null; // ISO 8601 string or null if pending
  slaTargetHours?: number; // default 48
}

export interface SlaStatusResult {
  claimId: string;
  form2SubmittedAt: string;
  form4GeneratedAt: string | null;
  targetBusinessHours: number;
  elapsedBusinessHours: number;
  remainingBusinessHours: number;
  isBreached: boolean;
  status: 'COMPLIANT' | 'WARNING' | 'BREACHED';
  dueDateIso: string;
}

/**
 * Checks if a given Date falls on a Libyan Weekend (Friday or Saturday)
 */
export function isLibyanWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 5 || day === 6; // 5 = Friday, 6 = Saturday
}

/**
 * Calculates business hours elapsed between two timestamps.
 * Work window: 08:00 - 16:00 UTC (8 hours/day), excluding Fri & Sat.
 */
export function calculateBusinessHoursElapsed(startDateIso: string, endDateIso?: string | null): number {
  const start = new Date(startDateIso);
  const end = endDateIso ? new Date(endDateIso) : new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return 0;
  }

  let totalMs = 0;
  let current = new Date(start);

  while (current < end) {
    // Skip weekend days
    if (!isLibyanWeekend(current)) {
      const currentHour = current.getUTCHours();
      // Business hours: 8:00 to 16:00
      if (currentHour >= 8 && currentHour < 16) {
        totalMs += 1000 * 60 * 60; // Add 1 hour
      }
    }
    // Advance by 1 hour
    current.setUTCHours(current.getUTCHours() + 1);
  }

  const hours = totalMs / (1000 * 60 * 60);
  return Number(hours.toFixed(2));
}

/**
 * Calculates the exact future ISO date when SLA expires given starting date and target business hours.
 */
export function calculateSlaDueDate(startDateIso: string, targetBusinessHours = 48): string {
  let remainingHours = targetBusinessHours;
  let current = new Date(startDateIso);

  while (remainingHours > 0) {
    if (!isLibyanWeekend(current)) {
      const currentHour = current.getUTCHours();
      if (currentHour >= 8 && currentHour < 16) {
        remainingHours -= 1;
      }
    }
    current.setUTCHours(current.getUTCHours() + 1);
  }

  return current.toISOString();
}

/**
 * Core SLA Monitoring & Breach Trigger
 */
export function checkForm2ToForm4Sla(req: SlaBreachCheckRequest, db?: any): SlaStatusResult {
  const targetHours = req.slaTargetHours || 48;
  const elapsed = calculateBusinessHoursElapsed(req.form2SubmittedAt, req.form4GeneratedAt);
  const remaining = Math.max(0, targetHours - elapsed);
  const dueDateIso = calculateSlaDueDate(req.form2SubmittedAt, targetHours);

  const isBreached = elapsed > targetHours && !req.form4GeneratedAt;
  let status: SlaStatusResult['status'] = 'COMPLIANT';

  if (isBreached) {
    status = 'BREACHED';
  } else if (remaining <= 12 && !req.form4GeneratedAt) {
    status = 'WARNING';
  }

  // Trigger Audit Event if newly breached
  if (isBreached && db) {
    const existingBreach = db.prepare(
      `SELECT * FROM auth_audit_logs WHERE resource_id = ? AND action = 'SLA_BREACH'`
    ).get(req.claimId);

    if (!existingBreach) {
      logAuditEvent(
        'system',
        'SLA_BREACH',
        req.claimId,
        `SLA_BREACH DETECTED: Claim '${req.claimId}' Form 2 submitted at ${req.form2SubmittedAt} ` +
        `has exceeded the 48 business hours limit (${elapsed} hrs elapsed). Form 4 technical approval missing.`
      );
    }
  }

  return {
    claimId: req.claimId,
    form2SubmittedAt: req.form2SubmittedAt,
    form4GeneratedAt: req.form4GeneratedAt || null,
    targetBusinessHours: targetHours,
    elapsedBusinessHours: elapsed,
    remainingBusinessHours: remaining,
    isBreached,
    status,
    dueDateIso
  };
}
