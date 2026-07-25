/**
 * notificationEvents.ts
 * ─────────────────────────────────────────────────────────────
 * Event-Driven Notification Bus & Background Worker Engine
 * Decouples Form 2 / Form 4 / Form 3 cryptographic sign-offs from notification processing.
 * Enforces strict multi-tenant data isolation & dual-channel dispatch (In-App + Email).
 * ─────────────────────────────────────────────────────────────
 */

import { EventEmitter } from 'events';
import db from './db.js';
import { logAuditEvent } from './services/auditService.js';

// ── Types & Event Interfaces ───────────────────────────────────────────────

export type GovernanceFormType = 'FORM_2' | 'FORM_4' | 'FORM_3';
export type GovernanceAction = 'SIGNED' | 'APPROVED' | 'REJECTED' | 'SLA_BREACH';

export interface DocumentSignedEventPayload {
  eventId: string;
  formType: GovernanceFormType;
  formId: string;
  claimId: string;
  companyId: string; // Tenant Isolation scope (e.g. 'WAHA', 'AGOCO')
  actorUserId: string;
  actorRole: string;
  action: GovernanceAction;
  summary: string;
  amount?: number;
  timestamp: string;
}

export interface NotificationLogRecord {
  id: string;
  event_id: string;
  recipient_user_id: string;
  recipient_email: string;
  company_id: string;
  channel: 'IN_APP' | 'EMAIL' | 'BOTH';
  title: string;
  message: string;
  status: 'DELIVERED' | 'FAILED' | 'PENDING';
  created_at: string;
}

// ── Singleton Event Bus ───────────────────────────────────────────────────

class GovernanceEventBus extends EventEmitter {}
export const eventBus = new GovernanceEventBus();

// Max listeners override for high concurrency
eventBus.setMaxListeners(50);

// ── Event Names ───────────────────────────────────────────────────────────

export const GOVERNANCE_EVENTS = {
  DOCUMENT_SIGNED: 'governance.document.signed',
  SLA_BREACHED: 'governance.sla.breached',
} as const;

// ── Target Stakeholder Routing Matrix ─────────────────────────────────────

/**
 * Calculates authorized recipient user IDs for a given event, enforcing RBAC and tenant boundaries.
 * Rule:
 *  - Operating Subsidiary Users: Only users matching payload.companyId receive notifications.
 *  - NOC HQ Users: Central PMO/Finance auditors receive cross-company alerts.
 *  - Unrelated Subsidiaries (e.g., AGOCO when WAHA PM signs): Completely isolated & ignored.
 */
export function resolveTargetStakeholders(payload: DocumentSignedEventPayload): Array<{ id: string; email: string; role: string; company_id: string }> {
  const allUsers: Array<{ id: string; email: string; role: string; company_id: string; status: string }> =
    db.prepare('SELECT id, email, role, company_id, status FROM users WHERE status = "ACTIVE"').all();

  return allUsers.filter(u => {
    // Exclude the actor who triggered the action
    if (u.id === payload.actorUserId) return false;

    // NOC HQ Roles (Global Oversight)
    if (u.company_id === 'NOC_HQ') {
      if (payload.formType === 'FORM_2' && (u.role === 'pmo_auditor' || u.role === 'system_admin')) return true;
      if (payload.formType === 'FORM_4' && (u.role === 'pmo_auditor' || u.role === 'noc_finance' || u.role === 'system_admin')) return true;
      if (payload.formType === 'FORM_3' && (u.role === 'noc_finance' || u.role === 'noc_head_of_accounts' || u.role === 'system_admin')) return true;
      return false;
    }

    // Subsidiary Roles (Tenant Isolated)
    if (u.company_id === payload.companyId) {
      if (payload.formType === 'FORM_2' && (u.role === 'subsidiary_pm' || u.role === 'subsidiary_finance')) return true;
      if (payload.formType === 'FORM_4' && (u.role === 'subsidiary_pm' || u.role === 'subsidiary_finance')) return true;
      if (payload.formType === 'FORM_3' && u.role === 'subsidiary_finance') return true;
      return false;
    }

    // Unrelated tenant -> ISOLATE
    return false;
  });
}

// ── Background Worker Logic ────────────────────────────────────────────────

export async function processDocumentSignedEvent(payload: DocumentSignedEventPayload): Promise<void> {
  const startTime = Date.now();
  console.log(`[EventWorker] Processing event ${payload.eventId} (${payload.formType} ${payload.action}) for company ${payload.companyId}`);

  try {
    const recipients = resolveTargetStakeholders(payload);
    console.log(`[EventWorker] Resolved ${recipients.length} target recipients for tenant scope '${payload.companyId}'.`);

    for (const recipient of recipients) {
      const logId = `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const now = new Date().toISOString();

      const title = `[NOC Audit Alert] ${payload.formType} ${payload.action} (${payload.companyId})`;
      const message = `${payload.summary} | Reference Claim: ${payload.claimId}`;

      // 1. Persist to Database (Notification Audit Log)
      db.prepare(
        `INSERT INTO auth_audit_logs (id, user_id, action, details, ip_address)
         VALUES (?, ?, ?, ?, ?)`
      ).run(
        logId,
        recipient.id,
        `NOTIFICATION_DISPATCH_${payload.formType}`,
        `Sent via IN_APP & EMAIL to ${recipient.email}. ${message}`,
        '127.0.0.1'
      );

      // 2. Dispatch Channels (Simulated SMTP & In-App Push)
      await _dispatchEmail(recipient.email, title, message);
      _dispatchInAppPush(recipient.id, payload.companyId, title, message);
    }

    // Log complete execution time
    const elapsed = Date.now() - startTime;
    logAuditEvent(
      'system',
      'NOTIFICATION_DISPATCH_COMPLETE',
      payload.eventId,
      `Successfully dispatched notifications to ${recipients.length} stakeholders in ${elapsed}ms.`
    );
  } catch (err: any) {
    console.error(`[EventWorker] Error processing notification event ${payload.eventId}:`, err);
  }
}

// ── Channel Drivers ────────────────────────────────────────────────────────

async function _dispatchEmail(toEmail: string, subject: string, text: string): Promise<void> {
  // In production, integrate with nodemailer / AWS SES / SendGrid
  // Non-blocking asynchronous simulation
  return new Promise((resolve) => {
    setImmediate(() => {
      console.log(`[SMTP Driver] Simulated Email sent to <${toEmail}> | Subject: "${subject}"`);
      resolve();
    });
  });
}

function _dispatchInAppPush(userId: string, companyId: string, title: string, message: string): void {
  // Websocket broadcast trigger point
  console.log(`[WebSocket Driver] Socket emission to user:${userId} (tenant:${companyId}) | Title: "${title}"`);
}

// ── Register Worker Listener ───────────────────────────────────────────────

eventBus.on(GOVERNANCE_EVENTS.DOCUMENT_SIGNED, (payload: DocumentSignedEventPayload) => {
  // Immediately yield execution back to API event loop
  setImmediate(() => {
    processDocumentSignedEvent(payload);
  });
});

// ── Public Publisher Function ──────────────────────────────────────────────

export function publishDocumentSignedEvent(
  formType: GovernanceFormType,
  formId: string,
  claimId: string,
  companyId: string,
  actorUserId: string,
  actorRole: string,
  action: GovernanceAction,
  summary: string,
  amount?: number
): void {
  const payload: DocumentSignedEventPayload = {
    eventId: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    formType,
    formId,
    claimId,
    companyId,
    actorUserId,
    actorRole,
    action,
    summary,
    amount,
    timestamp: new Date().toISOString()
  };

  // Fire-and-forget publish
  eventBus.emit(GOVERNANCE_EVENTS.DOCUMENT_SIGNED, payload);
}
