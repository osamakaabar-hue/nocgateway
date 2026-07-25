import express from "express";
import jwt from "jsonwebtoken";
import db from "./db.js";
import { initialClaims } from "../data";
import { NotificationItem } from "../types";

export const securityRouter = express.Router();
const getJwtSecret = () => process.env.JWT_SECRET || "noc_pm_secure_jwt_secret_key_32bytes_long_minimum!";

// --- 3. Security Middleware Blueprint ---
export interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    email: string;
    company_id: string;
    version: number;
    role?: string;
  };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];
  
  if (!token && req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    res.status(401).json({ error: "Access Denied: Missing Authentication Token" });
    return;
  }

  try {
    const verified = jwt.verify(token, getJwtSecret()) as any;
    // Cross-reference with database to enforce global session revocation (kill switches)
    const userInDb = db.prepare("SELECT * FROM users WHERE id = ?").get(verified.id) as any;
    
    if (!userInDb || userInDb.status !== "ACTIVE" || userInDb.version !== verified.version) {
      res.status(403).json({ error: "Access Denied: Session Invalidated or Revoked" });
      return;
    }

    if (!userInDb.role) {
      res.status(401).json({ error: { code: "AUTH_ROLE_MISSING", message: "Access Denied: User role is undefined or missing in database." } });
      return;
    }

    // Attach user session context to request object
    req.user = {
      id: verified.id,
      email: verified.email,
      company_id: verified.company_id,
      version: verified.version,
      role: userInDb.role
    };
    next();
  } catch (err) {
    res.status(403).json({ error: "Access Denied: Invalid Session Token" });
  }
}

// In-memory or state-backed storage for user-specific notification logs
let mockNotifications: NotificationItem[] = [];

// Helper to load/seed notifications from database/static pool
function getNotificationsForUser(userId: string): NotificationItem[] {
  if (mockNotifications.length === 0) {
    // Generate default notifications seeded by user
    const baseNotifs = [
      {
        title: "Clarification Needed",
        message: "PMO Technical Auditor requested documentation clarification on WAHA-24-112.",
        timestamp: "2 hours ago",
        read: false,
        type: "warning" as const,
        claimId: "claim-5",
        tab: "claims" as const
      },
      {
        title: "New Claim Submitted",
        message: "Waha Oil Company submitted a new technical progress claim WAHA-24-109 (€1,250,000).",
        timestamp: "Today, 09:00 AM",
        read: false,
        type: "info" as const,
        claimId: "claim-1",
        tab: "claims" as const
      },
      {
        title: "Technical Approval Granted",
        message: "Sovereign audit approved progress claim AGOCO-24-042.",
        timestamp: "Yesterday",
        read: true,
        type: "success" as const,
        claimId: "claim-2",
        tab: "claims" as const
      }
    ];

    const allUsers = db.prepare("SELECT id FROM users").all() as any[];
    allUsers.forEach(u => {
      baseNotifs.forEach((n, idx) => {
        mockNotifications.push({
          ...n,
          id: `notif-${u.id}-${idx}`,
          userId: u.id
        });
      });
    });
  }

  // Enforce server-side recipient_id isolation matching the authenticated user
  return mockNotifications.filter(n => n.userId === userId);
}

// --- 1. GET /api/notifications ---
securityRouter.get("/notifications", authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const userNotifs = getNotificationsForUser(userId);
  res.json(userNotifs);
});

// POST /api/notifications/mark-read
securityRouter.post("/notifications/mark-read", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { id } = req.body;
  const userId = req.user!.id;

  mockNotifications = mockNotifications.map(n => 
    n.id === id && n.userId === userId ? { ...n, read: true } : n
  );

  res.json({ success: true });
});

// POST /api/notifications/clear
securityRouter.post("/notifications/clear", authenticateToken, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  mockNotifications = mockNotifications.filter(n => n.userId !== userId);
  res.json({ success: true });
});

// --- Helper: applyTenantScope(userSession) ---
function applyTenantScope(user: NonNullable<AuthenticatedRequest["user"]>): {
  restrictedCompanyId?: string;
  isHQ: boolean;
} {
  // NOC Central HQ Users search globally
  if (user.company_id === "NOC_HQ") {
    return { isHQ: true };
  }
  // Operating Subsidiaries search result MUST be scoped to their tenant
  return { restrictedCompanyId: user.company_id, isHQ: false };
}

// --- 1. GET /api/search ---
securityRouter.get("/search", authenticateToken, (req: AuthenticatedRequest, res) => {
  const query = (req.query.q as string || "").trim().toLowerCase();
  if (!query) {
    res.json([]);
    return;
  }

  const user = req.user!;
  const scope = applyTenantScope(user);

  // Load claims from global backend state or import baseline
  const allClaims = initialClaims;
  const searchResults: any[] = [];

  // Filter and match claims based on tenant scope constraints
  allClaims.forEach(claim => {
    // Apply tenant filter
    if (scope.restrictedCompanyId && claim.companyId !== scope.restrictedCompanyId) {
      return;
    }

    // Match criteria
    const matchCode = claim.code.toLowerCase().includes(query);
    const matchTitle = claim.title.toLowerCase().includes(query);
    const matchCompany = claim.company.toLowerCase().includes(query);
    const matchSubmitted = claim.submittedBy.toLowerCase().includes(query);

    if (matchCode || matchTitle || matchCompany || matchSubmitted) {
      searchResults.push({
        id: `sr-claim-${claim.id}`,
        category: "claim",
        primary: claim.code,
        secondary: `${claim.company} — ${claim.title}`,
        claimId: claim.id,
        tab: "claims",
        companyId: claim.companyId
      });
    }

    // Search documents under this claim
    claim.documents.forEach(doc => {
      if (doc.name.toLowerCase().includes(query)) {
        searchResults.push({
          id: `sr-doc-${doc.id}`,
          category: "document",
          primary: doc.name,
          secondary: `${claim.company} · ${claim.code}`,
          claimId: claim.id,
          tab: "documents",
          companyId: claim.companyId
        });
      }
    });

    // Search invoices under this claim
    if (claim.invoiceNumber && claim.invoiceNumber.toLowerCase().includes(query)) {
      searchResults.push({
        id: `sr-inv-${claim.id}`,
        category: "invoice",
        primary: claim.invoiceNumber,
        secondary: `${claim.company} · ${claim.claimedValue}`,
        claimId: claim.id,
        tab: "invoices",
        companyId: claim.companyId
      });
    }
  });

  // If user is NOC_HQ, they are also allowed to search user directory logs
  if (scope.isHQ) {
    const allUsers = db.prepare("SELECT * FROM users").all() as any[];
    allUsers.forEach(u => {
      const matchName = u.username.toLowerCase().includes(query);
      const matchEmail = u.email.toLowerCase().includes(query);
      if (matchName || matchEmail) {
        searchResults.push({
          id: `sr-user-${u.id}`,
          category: "user",
          primary: u.username,
          secondary: `User Directory · ${u.company_id}`,
          claimId: "",
          tab: "users",
          companyId: u.company_id
        });
      }
    });
  }

  res.json(searchResults);
});

// --- 2. GET /api/financials ---
securityRouter.get("/financials", authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  
  // Database Query (Simulated SQL logic with middleware role validation)
  // SQL Pattern: 
  // SELECT * FROM lc_allocations 
  // WHERE (? = 'NOC_HQ' OR company_id = ?)
  
  const initialLcData = [
    { companyId: "AGOCO", companyName: "Arabian Gulf Oil Company", companyNameAr: "الخليج العربي للنفط", allocatedShare: 346890000, openLcsCount: 12, openLcsValue: 120000000, totalPaid: 50000000, outstandingCommitment: 70000000, availableBalance: 226890000 },
    { companyId: "WAHA", companyName: "Waha Oil Company", companyNameAr: "الواحة للنفط", allocatedShare: 184450000, openLcsCount: 8, openLcsValue: 80000000, totalPaid: 30000000, outstandingCommitment: 50000000, availableBalance: 104450000 },
    { companyId: "SIRTE", companyName: "Sirte Oil Company", companyNameAr: "سرت لإنتاج وتصنيع النفط والغاز", allocatedShare: 162330000, openLcsCount: 5, openLcsValue: 45000000, totalPaid: 15000000, outstandingCommitment: 30000000, availableBalance: 117330000 },
    { companyId: "AKAKUS", companyName: "Akakus Oil Operations", companyNameAr: "أكاكوس للعمليات النفطية", allocatedShare: 112250000, openLcsCount: 4, openLcsValue: 35000000, totalPaid: 10000000, outstandingCommitment: 25000000, availableBalance: 77250000 },
    { companyId: "ZUEITINA", companyName: "Zueitina Oil Company", companyNameAr: "الزويتينة للنفط", allocatedShare: 110340000, openLcsCount: 6, openLcsValue: 40000000, totalPaid: 20000000, outstandingCommitment: 20000000, availableBalance: 70340000 },
    { companyId: "ZALLAF", companyName: "Zallaf Libya", companyNameAr: "زلاف ليبيا لاستكشاف وإنتاج النفط والغاز", allocatedShare: 99000000, openLcsCount: 3, openLcsValue: 25000000, totalPaid: 5000000, outstandingCommitment: 20000000, availableBalance: 74000000 },
    { companyId: "HAROUGE", companyName: "Harouge Oil Operations", companyNameAr: "الهروج للعمليات النفطية", allocatedShare: 50000000, openLcsCount: 2, openLcsValue: 15000000, totalPaid: 5000000, outstandingCommitment: 10000000, availableBalance: 35000000 },
    { companyId: "MELLITAH", companyName: "Mellitah Oil & Gas", companyNameAr: "مليتة للنفط والغاز", allocatedShare: 40000000, openLcsCount: 1, openLcsValue: 10000000, totalPaid: 0, outstandingCommitment: 10000000, availableBalance: 30000000 },
    { companyId: "MABRUK", companyName: "Mabruk Oil Operations", companyNameAr: "المبروك للعمليات النفطية", allocatedShare: 13740000, openLcsCount: 1, openLcsValue: 5000000, totalPaid: 2000000, outstandingCommitment: 3000000, availableBalance: 8740000 },
  ];

  let filteredData = initialLcData;

  // Server-side Tenant Isolation (Authorization Middleware Enforced)
  if (user.company_id !== "NOC_HQ") {
    filteredData = initialLcData.filter(item => item.companyId === user.company_id);
  }

  res.json({
    data: filteredData,
    sqlPattern: "SELECT * FROM lc_allocations WHERE (company_id = ? OR ? = 'NOC_HQ')",
    appliedFilters: {
      userId: user.id,
      companyId: user.company_id,
      isNoc: user.company_id === "NOC_HQ"
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OCR PIPELINE & LC RECONCILIATION ROUTES
// ─────────────────────────────────────────────────────────────────────────────

import { extractInvoiceViaOcr } from "./services/ocrService.js";
import {
  calculateLcBalance,
  generateForm3WithLcGuard,
  InsufficientLcFundsError,
  LcNotFoundError,
  OcrPendingReviewError
} from "./services/lcReconciliationService.js";

// POST /api/ocr/invoice
securityRouter.post("/ocr/invoice", authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { claimId, attachmentId, fileBase64, mimeType } = req.body;

  if (!claimId || !attachmentId || !fileBase64) {
    res.status(400).json({ error: 'MISSING_FIELDS', message: 'claimId, attachmentId and fileBase64 are required.' });
    return;
  }

  try {
    const result = await extractInvoiceViaOcr(
      { claimId, attachmentId, fileBase64, mimeType, actorUserId: req.user?.id || 'system' },
      db
    );

    const statusCode = result.status === 'VERIFIED' ? 200 : 202;
    res.status(statusCode).json({
      success: true,
      ocrResult: result,
      requiresManualReview: result.status === 'MANUAL_REVIEW_REQUIRED',
      message: result.status === 'VERIFIED'
        ? `OCR verified at ${(result.overall_confidence * 100).toFixed(1)}% confidence.`
        : `OCR confidence ${(result.overall_confidence * 100).toFixed(1)}% is below the 90% threshold. Invoice flagged for manual PMO review.`
    });
  } catch (err: any) {
    console.error('[OCR] Extraction failed:', err.message);
    res.status(500).json({ error: 'OCR_EXTRACTION_FAILED', message: err.message });
  }
});

// PATCH /api/ocr/invoice/:ocrId/approve
securityRouter.patch("/ocr/invoice/:ocrId/approve", authenticateToken, (req: AuthenticatedRequest, res) => {
  const { ocrId } = req.params;
  const userRole = req.user?.role || '';

  if (userRole !== 'pmo_auditor' && userRole !== 'system_admin') {
    res.status(403).json({ error: 'RBAC_FORBIDDEN', message: 'Only pmo_auditor or system_admin may manually approve OCR results.' });
    return;
  }

  const ocrRecord = db.prepare('SELECT * FROM invoice_ocr_results WHERE id = ?').get(ocrId) as any;
  if (!ocrRecord) {
    res.status(404).json({ error: 'OCR_RECORD_NOT_FOUND', message: `No OCR result found for ID '${ocrId}'.` });
    return;
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE invoice_ocr_results SET reviewed_by = ?, reviewed_at = ? WHERE id = ?').run(req.user?.id, now, ocrId);

  res.status(200).json({
    success: true,
    message: 'Invoice OCR result manually approved. Form 3 generation is now unblocked.',
    ocrId,
    reviewedBy: req.user?.id,
    reviewedAt: now
  });
});

// GET /api/ocr/review-queue
securityRouter.get("/ocr/review-queue", authenticateToken, (req: AuthenticatedRequest, res) => {
  const userRole = req.user?.role || '';
  const ALLOWED = ['pmo_auditor', 'system_admin', 'noc_finance', 'noc_head_of_accounts'];
  if (!ALLOWED.includes(userRole)) {
    res.status(403).json({ error: 'RBAC_FORBIDDEN', message: 'Access denied to OCR review queue.' });
    return;
  }

  const pending = (db.prepare('SELECT * FROM invoice_ocr_results').all() as any[])
    .filter((r: any) => r.status === 'MANUAL_REVIEW_REQUIRED' && !r.reviewed_by)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.status(200).json({ success: true, count: pending.length, queue: pending });
});

// GET /api/reconciliation/lc — List all Letter of Credits
securityRouter.get("/reconciliation/lc", authenticateToken, (req: AuthenticatedRequest, res) => {
  const ALLOWED = ['noc_finance', 'noc_head_of_accounts', 'system_admin', 'pmo_auditor', 'steering_committee'];
  if (!ALLOWED.includes(req.user?.role || '')) {
    res.status(403).json({ error: 'RBAC_FORBIDDEN', message: 'Access denied to LC records.' });
    return;
  }
  const lcs = db.prepare('SELECT * FROM letter_of_credits').all();
  res.status(200).json({ success: true, letterOfCredits: lcs });
});

// GET /api/reconciliation/lc/:lcId/balance — LC balance
securityRouter.get("/reconciliation/lc/:lcId/balance", authenticateToken, (req: AuthenticatedRequest, res) => {
  const ALLOWED = ['noc_finance', 'noc_head_of_accounts', 'system_admin', 'pmo_auditor', 'steering_committee'];
  if (!ALLOWED.includes(req.user?.role || '')) {
    res.status(403).json({ error: 'RBAC_FORBIDDEN', message: 'Access denied.' });
    return;
  }

  try {
    const balance = calculateLcBalance(req.params.lcId, db);
    res.status(200).json({
      success: true,
      lcId:             balance.lc.id,
      subsidiary:       balance.lc.subsidiary_id,
      currency:         balance.lc.currency,
      issuingBank:      balance.lc.issuing_bank,
      expiryDate:       balance.lc.expiry_date,
      lcStatus:         balance.lc.status,
      totalValue:       balance.totalValue,
      totalDisbursed:   balance.totalDisbursed,
      remainingBalance: balance.remainingBalance,
      utilizationPct:   Number(((balance.totalDisbursed / balance.totalValue) * 100).toFixed(2)),
      disbursementsCount: balance.disbursements.length
    });
  } catch (err: any) {
    if (err instanceof LcNotFoundError) {
      res.status(404).json({ error: err.code, message: err.message });
    } else {
      res.status(500).json({ error: 'LC_BALANCE_ERROR', message: err.message });
    }
  }
});

// POST /api/form3/generate
securityRouter.post("/form3/generate", authenticateToken, (req: AuthenticatedRequest, res) => {
  const userRole = req.user?.role || '';
  if (userRole !== 'noc_finance' && userRole !== 'system_admin') {
    res.status(403).json({ error: 'RBAC_FORBIDDEN', message: 'Only noc_finance may generate Form 3 payment authorizations.' });
    return;
  }

  const { claimId, lcId, requestedAmount, form3Reference } = req.body;
  if (!claimId || !lcId || !requestedAmount) {
    res.status(400).json({ error: 'MISSING_FIELDS', message: 'claimId, lcId and requestedAmount are required.' });
    return;
  }

  const amount = Number(requestedAmount);
  if (isNaN(amount) || amount <= 0) {
    res.status(400).json({ error: 'INVALID_AMOUNT', message: 'requestedAmount must be a positive number.' });
    return;
  }

  try {
    const result = generateForm3WithLcGuard(
      { claimId, lcId, requestedAmount: amount, actorUserId: req.user!.id, form3Reference },
      db
    );

    res.status(201).json({
      success: true,
      message: 'Form 3 (تعزيز وإذن بالدفع) generated and recorded against the Letter of Credit.',
      form3Id:          result.form3Id,
      form3Reference:   result.form3Reference,
      approvedAmount:   result.approvedAmount,
      remainingBalance: result.remainingBalance,
      auditHash:        result.auditEventId,
      issuedAt:         new Date().toISOString(),
      issuedBy:         req.user?.id
    });
  } catch (err: any) {
    if (err instanceof InsufficientLcFundsError) {
      res.status(422).json(err.toHttpResponse());
    } else if (err instanceof OcrPendingReviewError) {
      res.status(403).json({
        error: err.code,
        message: err.message,
        resolution: 'A PMO Auditor must review and approve the contractor invoice OCR result before Form 3 can be issued.'
      });
    } else if (err instanceof LcNotFoundError) {
      res.status(404).json({ error: err.code, message: err.message });
    } else {
      res.status(500).json({ error: 'FORM3_GENERATION_ERROR', message: err.message });
    }
  }
});

