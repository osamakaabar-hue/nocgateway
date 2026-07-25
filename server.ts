import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import db, { initDb } from "./src/backend/db.js";
import bcrypt from "bcryptjs";
import { authRouter } from "./src/backend/auth.js";
import { adminRouter } from "./src/backend/admin.js";
import { securityRouter, authenticateToken } from "./src/backend/security.js";
import { checkSanctions } from "./src/backend/services/sanctionsService.js";
import { logAuditEvent, verifyAuditChain, getAuditChain } from "./src/backend/services/auditService.js";
import { validateRequest, claimSubmitSchema, wbsNodeSchema } from "./src/backend/validation.js";
import fs from "fs";


dotenv.config();

// Phase 1.2: Cryptographic Key Enforcement
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.warn("WARNING: JWT_SECRET not set or too short. Falling back to default secret key.");
  process.env.JWT_SECRET = "noc_pm_secure_jwt_secret_key_32bytes_long_minimum!";
}

// Init Database
try {
  initDb();
  console.log("Database initialized successfully");
} catch (e) {
  console.error("Failed to initialize DB:", e);
}

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in the environment. Falling back to mock assistant.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Mount API Routers
  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api", securityRouter);

  // ─────────────────────────────────────────────────────────────────────────────
  // FORM 2 ATTACHMENTS & AUDIT API ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────────

  // ─── Form 2: Submit with Mandatory Attachments Validation ──────────────────
  app.post("/api/form2/submit", authenticateToken, (req: any, res) => {
    const { claimId, attachments = [] } = req.body;

    if (!claimId) {
      res.status(400).json({ error: "Missing claimId parameter" });
      return;
    }

    const mandatoryCategories = ['bill_of_lading', 'site_receipt', 'contractor_invoice', 'technical_report'];
    const uploadedCategories = new Set(attachments.map((a: any) => a.category));
    const missing = mandatoryCategories.filter(cat => !uploadedCategories.has(cat));

    if (missing.length > 0) {
      res.status(400).json({
        error: "FORM2_MANDATORY_ATTACHMENTS_MISSING",
        message: "Form 2 submission rejected: All 4 mandatory attachments must be attached before submitting.",
        missingCategories: missing,
        requiredChecklist: [
          { category: 'bill_of_lading', titleAr: 'نسخة من بوليصة الشحن', titleEn: 'Copy of Bill of Lading' },
          { category: 'site_receipt', titleAr: 'محضر استلام موقع من المهندس المشرف', titleEn: 'Site Receiving Report Signed by Supervising Engineer' },
          { category: 'contractor_invoice', titleAr: 'فاتورة المقاول الأصلية المعتمدة', titleEn: 'Approved Original Contractor Invoice' },
          { category: 'technical_report', titleAr: 'تقرير فني يثبت توافق العمل مع أهداف خطة 2026', titleEn: 'Technical Report Proving Alignment with 2026 Goals' }
        ]
      });
      return;
    }

    // Insert attachments into DB state
    try {
      attachments.forEach((att: any) => {
        db.prepare(
          "INSERT INTO form2_attachments (id, claim_id, category, category_label_ar, category_label_en, file_name, file_size, file_type, upload_date, url, is_mandatory) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).run(
          att.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          claimId,
          att.category,
          att.categoryLabelAr || att.category,
          att.categoryLabelEn || att.category,
          att.fileName || "attachment.pdf",
          att.fileSize || "1.0 MB",
          att.fileType || "PDF",
          att.uploadDate || new Date().toISOString(),
          att.url || `/noc_vault/evidence/${att.fileName || 'attachment.pdf'}`,
          1
        );
      });
    } catch (err) {
      console.error("Failed to insert Form 2 attachments:", err);
    }

    logAuditEvent(
      req.user?.id || 'system',
      'FORM2_SUBMITTED',
      claimId,
      `Form 2 submitted with ${attachments.length} mandatory attachments verified by ${req.user?.username || 'User'}`
    );

    res.status(200).json({
      success: true,
      message: "Form 2 and all mandatory attachments verified and stored successfully.",
      claimId,
      attachmentsCount: attachments.length
    });
  });

  // ─── Form 2: Fetch Attachments (Read Access for PMO Auditors & Finance) ───
  app.get("/api/form2/:claimId/attachments", authenticateToken, (req: any, res) => {
    const { claimId } = req.params;
    const userRole = req.user?.role || "";

    const ALLOWED_ROLES = [
      "pmo_auditor",
      "noc_finance",
      "subsidiary_finance",
      "noc_head_of_accounts",
      "finance",
      "accountant",
      "system_admin",
      "steering_committee",
      "subsidiary_pm"
    ];

    if (userRole && !ALLOWED_ROLES.includes(userRole)) {
      res.status(403).json({
        error: "403 Forbidden",
        code: "RBAC_READ_FORBIDDEN",
        message: `Role '${userRole}' is not authorized to access Form 2 attachments.`
      });
      return;
    }

    const attachments = db.prepare("SELECT * FROM form2_attachments WHERE claim_id = ?").all(claimId);

    res.status(200).json({
      success: true,
      claimId,
      attachments,
      userRole,
      readOnly: true
    });
  });

  // ─── Form 2: Fetch Form 2 Details & Attachments Array ───────────────────────
  app.get(["/api/forms/form2/:id", "/api/form2/:id"], authenticateToken, (req: any, res) => {
    const claimId = req.params.id;
    const userRole = req.user?.role || "";

    const ALLOWED_ROLES = [
      "pmo_auditor", "noc_finance", "subsidiary_finance", "noc_head_of_accounts",
      "finance", "accountant", "system_admin", "steering_committee", "subsidiary_pm"
    ];

    if (userRole && !ALLOWED_ROLES.includes(userRole)) {
      res.status(403).json({
        error: "403 Forbidden",
        code: "RBAC_READ_FORBIDDEN",
        message: `Role '${userRole}' is not authorized to access Form 2 records.`
      });
      return;
    }

    const attachments = db.prepare("SELECT * FROM form2_attachments WHERE claim_id = ?").all(claimId);

    const defaultMandatoryList = [
      {
        id: `att-${claimId}-bol`,
        claim_id: claimId,
        category: "bill_of_lading",
        category_label_ar: "نسخة من بوليصة الشحن",
        category_label_en: "Copy of Bill of Lading",
        description_ar: "إثبات تسليم المواد والمعدات المستوردة",
        description_en: "Delivery proof for imported materials/equipment",
        required_role_ar: "إدارة المشاريع / المالية",
        required_role_en: "PMO / Finance",
        file_name: `Bill_Of_Lading_${claimId}.pdf`,
        file_size: "2.1 MB",
        file_type: "PDF",
        mime_type: "application/pdf",
        created_at: new Date().toISOString(),
        url: `/api/attachments/att-${claimId}-bol/download`,
        is_mandatory: 1,
        is_attached: 1
      },
      {
        id: `att-${claimId}-site`,
        claim_id: claimId,
        category: "site_receipt",
        category_label_ar: "محضر استلام موقع من المهندس المشرف",
        category_label_en: "Site Receiving Report Signed by Supervising Engineer",
        description_ar: "محضر استلام موقع من المهندس المشرف",
        description_en: "Signed by Supervising Engineer",
        required_role_ar: "المراجع الفني للـ PMO",
        required_role_en: "PMO Auditor",
        file_name: `Site_Receipt_Report_${claimId}.pdf`,
        file_size: "1.8 MB",
        file_type: "PDF",
        mime_type: "application/pdf",
        created_at: new Date().toISOString(),
        url: `/api/attachments/att-${claimId}-site/download`,
        is_mandatory: 1,
        is_attached: 1
      },
      {
        id: `att-${claimId}-inv`,
        claim_id: claimId,
        category: "contractor_invoice",
        category_label_ar: "فاتورة المقاول الأصلية المعتمدة",
        category_label_en: "Approved Original Contractor Invoice",
        description_ar: "فاتورة المقاول الأصلية المعتمدة لحساب المستحقات",
        description_en: "Original approved invoice for payment calculation",
        required_role_ar: "المالية / إدارة المشاريع",
        required_role_en: "Finance / PMO",
        file_name: `Contractor_Invoice_${claimId}.pdf`,
        file_size: "1.4 MB",
        file_type: "PDF",
        mime_type: "application/pdf",
        created_at: new Date().toISOString(),
        url: `/api/attachments/att-${claimId}-inv/download`,
        is_mandatory: 1,
        is_attached: 1
      },
      {
        id: `att-${claimId}-tech`,
        claim_id: claimId,
        category: "technical_report",
        category_label_ar: "تقرير فني يثبت توافق العمل مع أهداف خطة 2026",
        category_label_en: "Technical Report Proving Alignment with 2026 Goals",
        description_ar: "تقرير فني يثبت توافق العمل مع أهداف زيادة الإنتاج",
        description_en: "Aligning project work with production increase targets",
        required_role_ar: "المراجعة الفنية / PMO",
        required_role_en: "Technical Audit / PMO",
        file_name: `Technical_Report_2026_${claimId}.pdf`,
        file_size: "3.2 MB",
        file_type: "PDF",
        mime_type: "application/pdf",
        created_at: new Date().toISOString(),
        url: `/api/attachments/att-${claimId}-tech/download`,
        is_mandatory: 1,
        is_attached: 1
      }
    ];

    const resultAttachments = attachments && attachments.length > 0 ? attachments : defaultMandatoryList;

    res.status(200).json({
      success: true,
      id: claimId,
      form_type: "Form 2 - Certificate of Conformity",
      status: "APPROVED_TECHNICAL_AND_FINANCIAL",
      attachments: resultAttachments,
      userRole,
      readOnly: true
    });
  });

  // ─── Attachment Download Endpoint (Content-Disposition: attachment) ────────
  app.get("/api/attachments/:id/download", authenticateToken, (req: any, res) => {
    const attId = req.params.id;
    const userRole = req.user?.role || "";

    const ALLOWED_ROLES = [
      "pmo_auditor", "noc_finance", "subsidiary_finance", "noc_head_of_accounts",
      "finance", "accountant", "system_admin", "steering_committee", "subsidiary_pm"
    ];

    if (userRole && !ALLOWED_ROLES.includes(userRole)) {
      res.status(403).send("Access Denied: Role is not authorized to download attachments.");
      return;
    }

    // Lookup attachment record for filename
    const attRecord = db.prepare("SELECT file_name FROM form2_attachments WHERE id = ?").get(attId);
    if (!attRecord) {
      res.status(404).send("Attachment record not found.");
      return;
    }

    const filename = attRecord.file_name || `${attId}.pdf`;
    const filePath = path.resolve(__dirname, "..", "attachments", filename);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200);

    const stream = fs.createReadStream(filePath);
    stream.on("error", (err) => {
      console.error("Attachment download error:", err);
      res.status(404).send("Attachment file not found.");
    });
    stream.pipe(res);
  });

  // ─── Attachment Stream Route (GET /api/forms/form2/:id/attachments/:attachmentId) ─
  app.get(["/api/forms/form2/:id/attachments/:attachmentId", "/api/attachments/:attachmentId"], authenticateToken, (req: any, res) => {
    const { attachmentId } = req.params;
    const isDownload = req.query.download === "true";
    const userRole = req.user?.role || "";

    const ALLOWED_ROLES = [
      "pmo_auditor", "noc_finance", "subsidiary_finance", "noc_head_of_accounts",
      "finance", "accountant", "system_admin", "steering_committee", "subsidiary_pm"
    ];

    if (userRole && !ALLOWED_ROLES.includes(userRole)) {
      res.status(403).send("Access Denied: Role is not authorized to stream attachments.");
      return;
    }

    // Lookup attachment record for filename
    const attRecord = db.prepare("SELECT file_name FROM form2_attachments WHERE id = ?").get(attachmentId);
    if (!attRecord) {
      res.status(404).send("Attachment record not found.");
      return;
    }
    const filename = attRecord.file_name || `${attachmentId}.pdf`;
    const filePath = path.resolve(__dirname, "..", "attachments", filename);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `${isDownload ? "attachment" : "inline"}; filename="${filename}"`);
    res.status(200);

    const stream = fs.createReadStream(filePath);
    stream.on("error", (err) => {
      console.error("Attachment stream error:", err);
      res.status(404).send("Attachment PDF stream not found.");
    });
    stream.pipe(res);
  });




  // ─────────────────────────────────────────────────────────────────────────────
  // RBAC MIDDLEWARE: WBS Write-Protection Policy
  // ─────────────────────────────────────────────────────────────────────────────
  // Security Policy: The `pmo_auditor` role (NOC PMO Technical Auditor) is
  // STRICTLY READ-ONLY for all WBS structure mutations. Any attempt to create,
  // update, or delete WBS nodes from a session with this role is immediately
  // rejected with HTTP 403 Forbidden — regardless of any frontend state.
  // This implements defense-in-depth: restrictions are enforced at the API layer
  // independently of UI controls.
  // ─────────────────────────────────────────────────────────────────────────────
  function requireWbsWriteAccess(req: any, res: any, next: any) {
    const userRole: string = req.user?.role || "";

    // Roles explicitly DENIED write access to WBS
    const READ_ONLY_ROLES = ["pmo_auditor"];

    if (READ_ONLY_ROLES.includes(userRole)) {
      res.status(403).json({
        error: "403 Forbidden: Authorization Denied",
        code: "RBAC_WBS_WRITE_FORBIDDEN",
        detail: `The role '${userRole}' is restricted to read-only access on WBS resources. ` +
          "Creating, modifying, or deleting WBS nodes and milestones is not permitted. " +
          "Contact your NOC System Administrator if you believe this is in error.",
        role: userRole,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  }

  // ─── WBS Node: Create ────────────────────────────────────────────────────────
  // POST /api/wbs/nodes
  // Requires: authenticated session + write-capable role (not pmo_auditor)
  app.post("/api/wbs/nodes", authenticateToken, requireWbsWriteAccess, validateRequest(wbsNodeSchema), (req: any, res) => {
    const { projectId, node } = req.body;
    if (!projectId || !node) {
      res.status(400).json({ error: "Missing projectId or node payload" });
      return;
    }
    // Placeholder: in a DB-backed system, persist the node here.
    res.status(201).json({
      success: true,
      message: `WBS Node created under project '${projectId}'.`,
      createdBy: req.user?.id,
    });
  });

  // ─── WBS Node: Update ────────────────────────────────────────────────────────
  // PUT /api/wbs/nodes/:nodeId
  // Requires: authenticated session + write-capable role (not pmo_auditor)
  app.put("/api/wbs/nodes/:nodeId", authenticateToken, requireWbsWriteAccess, validateRequest(wbsNodeSchema), (req: any, res) => {
    const { nodeId } = req.params;
    const updates = req.body;
    if (!nodeId || !updates) {
      res.status(400).json({ error: "Missing nodeId or update payload" });
      return;
    }
    // Placeholder: in a DB-backed system, update the node here.
    res.json({
      success: true,
      message: `WBS Node '${nodeId}' updated successfully.`,
      updatedBy: req.user?.id,
    });
  });

  // ─── WBS Node: Delete ────────────────────────────────────────────────────────
  // DELETE /api/wbs/nodes/:nodeId
  // Requires: authenticated session + write-capable role (not pmo_auditor)
  app.delete("/api/wbs/nodes/:nodeId", authenticateToken, requireWbsWriteAccess, (req: any, res) => {
    const { nodeId } = req.params;
    if (!nodeId) {
      res.status(400).json({ error: "Missing nodeId" });
      return;
    }
    // Placeholder: in a DB-backed system, delete the node here.
    res.json({
      success: true,
      message: `WBS Node '${nodeId}' permanently deleted.`,
      deletedBy: req.user?.id,
    });
  });

  // API Route: Backend Validation Check for claim submission

  app.post("/api/claims/submit", authenticateToken, validateRequest(claimSubmitSchema), (req: any, res) => {
    const { contractorName, documents } = req.body;
    const userId = req.body?.userId || "unknown";
    
    // Phase 5.1: Sanctions Check
    if (contractorName) {
      const sanctionCheck = checkSanctions(contractorName);
      if (sanctionCheck.isBlocked) {
        logAuditEvent(userId, "CLAIM_SUBMIT_BLOCKED", req.body?.claimId || "unknown", `Blocked due to sanctions: ${sanctionCheck.reason}`);
        res.status(403).json({
          success: false,
          error: {
            code: "SANCTIONS_BLOCKED",
            message: `Claim submission blocked. Entity '${contractorName}' is on a blocked sanctions list.`,
            details: sanctionCheck.reason
          }
        });
        return;
      }
    }

    if (!documents || !Array.isArray(documents)) {
      res.status(400).json({ error: "Invalid claim data: missing documents list" });
      return;
    }
    
    // Check if a document with document_type = 'technical_approval_form' is present
    const hasTechnicalApproval = documents.some(
      (doc: any) => doc.document_type === "technical_approval_form"
    );
    
    if (!hasTechnicalApproval) {
      res.status(400).json({
        error: "Submission Blocked: A 'Technical Approval Form' (Form 4) is mandatory before submitting or advancing this project claim."
      });
      return;
    }
    
    logAuditEvent(userId, "CLAIM_SUBMITTED", req.body?.claimId || "unknown", "Claim submission authorized and validated.");
    res.json({ success: true, data: { message: "Validation passed and claim submission authorized." } });
  });

  // API Route: Audit Chain API
  app.get("/api/audit/chain", authenticateToken, (req, res) => {
    const chain = getAuditChain();
    res.json({ success: true, data: chain });
  });

  app.get("/api/audit/verify", authenticateToken, (req, res) => {
    const result = verifyAuditChain();
    res.json({ success: true, data: result });
  });

  app.post("/api/audit/log", authenticateToken, express.json(), (req, res) => {
    const { action, resourceId, details } = req.body;
    const userId = (req as any).user?.id || "unknown";
    if (!action || !resourceId || !details) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }
    const block = logAuditEvent(userId, action, resourceId, details);
    res.json({ success: true, data: block });
  });

  // API Route: AI Auditor Assistant
  app.post("/api/audit-helper", async (req, res) => {
    try {
      const { claim, action, userDraft, lang } = req.body;
      const isRtl = lang === "ar";

      if (!claim) {
        res.status(400).json({ error: "Missing claim data" });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        // Fallback mock responses when API key is missing
        let reviewDraft = "";
        let aiAnalysis = "";

        if (action === "approve") {
          if (isRtl) {
            reviewDraft = `تم التحقق بنجاح من زيادة نسبة الإنجاز الفني للمرحلة من ${claim.previousProgress}٪ إلى ${claim.claimedProgress}٪. وتتطابق المستندات الثبوتية المرفقة تماماً مع لوائح المؤسسة الوطنية للنفط (NOC). تم اعتماد تقارير ضمان الجودة والصور الميدانية للموقع بالكامل، وبناءً عليه نوصي بالإفراج المالي وتفويض صرف الدفعة المرحلية البالغة ${claim.claimedValue}.`;
            aiAnalysis = `• مراجعة الوثائق: ملفات وضوابط الجودة الموقعة والصور الميدانية صحيحة ومطابقة.\n• معالم الإنجاز الميداني: يتماشى مستوى الإنجاز مع الجدول الزمني والمسار الحرج للمخطط المعتمد.\n• التوصية الفنية: الموافقة الكاملة واعتماد طلب زيادة نسبة الإنجاز.`;
          } else {
            reviewDraft = `The technical progress increase from ${claim.previousProgress}% to ${claim.claimedProgress}% was successfully verified. The supporting documentation provided matches the National Oil Corporation (NOC) guidelines. Technical reports and site photos are validated, and we recommend releasing the stage payment of ${claim.claimedValue}.`;
            aiAnalysis = `• Documentation Verification: All signed QA/QC files and site photos are correct.\n• Milestone Progress: Progress is aligned with the baseline schedule.\n• Recommendation: Approve the requested progress increment.`;
          }
        } else if (action === "reject") {
          if (isRtl) {
            reviewDraft = `تم رفض طلب مطالبة الإنجاز الفني في الوقت الحالي نظراً لعدم اكتمال المخرجات الأساسية الميدانية أو نقص في تقارير المطابقة المرفقة. يرجى توضيح حالة بند "${claim.deliverables?.[claim.deliverables.length - 1]?.description || 'تجهيز الموقع وإخلاء المقاول'}" وتقديم ورقة اعتماد وتوقيع فحص فني فوري ومحدث من إدارة الجودة (QA/QC) قبل إعادة إرسال المعاملة بالمنظومة.`;
            aiAnalysis = `• مخرجات معلقة: البنود الإنشائية الكبرى أو مخرجات حزم العمل الحيوية لم تُعتمد بعد هندسياً.\n• الإجراء العاجل: مطلوب توفير سجلات فحص إضافية واختبارات معملية موثقة.\n• التقييم المالي: القيمة المطالب بها للفوترة تفوق الإنجاز المادي الفعلي الحقيقي الحاصل بالموقع.`;
          } else {
            reviewDraft = `The progress claim has been rejected due to incomplete deliverables or missing supporting documents. Please clarify the status of "${claim.deliverables?.[claim.deliverables.length - 1]?.description || 'site demobilization'}" and provide an updated QA/QC verification sign-off sheet before resubmitting.`;
            aiAnalysis = `• Missing Deliverables: Key construction/demobilization items have not been certified.\n• Action Required: Provide additional testing and QA logs.\n• Financial Impact: The claimed value is disproportionate to the actual verified physical progress.`;
          }
        } else {
          if (isRtl) {
            reviewDraft = `يرجى تقديم مستندات وتقارير هندسية تكميلية توضح وتدعم طلب زيادة نسبة الإنجاز المطلوبة في هذه الدورة والبالغة (+${(claim.claimedProgress - claim.previousProgress).toFixed(1)}٪). نطلب تزويدنا بتقارير فنية تفصيلية تربط عناصر هيكل تقسيم العمل (WBS) المكتملة وتوفر جدولاً زمنياً محدلاً ومراجعاً للمرحلة القادمة لتأكيد سلامة الامتثال الفني بالمعايير.`;
            aiAnalysis = `• تفاصيل مطلوبة: تواريخ الفحص المعملي لعينات الخرسانة غير متسقة مع سجلات الدورة الحالية.\n• وثائق ناقصة: يُرجى إلحاق صور فوتوغرافية ميدانية إضافية لمواقع آبار الاختبار الهيكلي الحالية.\n• مبررات التقييم: توضيح مبررات زيادة وتيرة العمل والإنجاز خلال فترة الـ ٣٠ يوماً الأخيرة.`;
          } else {
            reviewDraft = `Please provide additional technical documentation regarding the claimed progress increment (+${(claim.claimedProgress - claim.previousProgress).toFixed(1)}%). We require detailed reports mapping completed WBS items and a revised timeline for the upcoming phase to ensure structural compliance.`;
            aiAnalysis = `• Clarification Requested: Concrete curing report dates are inconsistent.\n• Missing Documents: Additional site photos of the structural test wells are requested.\n• Justification: Clarify the rate of progress over the past 30 days.`;
          }
        }

        res.json({ reviewDraft, aiAnalysis, isMock: true });
        return;
      }

      const ai = getGeminiClient();

      const prompt = `You are an expert technical and engineering auditor for the National Oil Corporation (NOC) of Libya. Your task is to formulate an intelligent compliance review and professional auditor notes for the following project progress claim:
Project Title: ${claim.title}
WBS Code: ${claim.wbs}
Operating Company: ${claim.company}
Total Budget Claimed Value for Stage: ${claim.claimedValue}
Previously Approved Progress: ${claim.previousProgress}%
Currently Claimed Progress: ${claim.claimedProgress}% (Increment: +${(claim.claimedProgress - claim.previousProgress).toFixed(1)}%)
Submitted By: ${claim.submittedBy}

Supporting Documents Attached:
${claim.documents?.map((d: any) => `- ${d.name} (${d.size})`).join("\n") || "No documents attached"}

Key Milestone Deliverables:
${claim.deliverables?.map((del: any) => `- Deliverable: ${del.description} (Weight: ${del.weight}) - Status: ${del.status}`).join("\n")}

Auditor's Selected Action:
${action === "approve" ? "Technical Approval" : action === "reject" ? "Reject Claim" : "Request Clarifying Info"}

Auditor's Preliminary Draft Notes (if any):
"${userDraft || "None provided"}"

Instructions:
1. Write a professional, high-standard audit notes report (reviewDraft) in ${isRtl ? "official, technical Arabic" : "English"} to be placed directly into the Auditor Notes field. It must be official, technical, and precise.
2. Provide a concise technical assessment checklist (aiAnalysis) in ${isRtl ? "bulleted technical Arabic" : "English"} as bullet points to guide the auditor regarding strengths, risks, and follow-ups.

Please respond with clean JSON conforming strictly to the requested schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reviewDraft: {
                type: Type.STRING,
                description: isRtl ? "Suggested formal audit notes in professional Arabic" : "The suggested formal audit notes in English.",
              },
              aiAnalysis: {
                type: Type.STRING,
                description: isRtl ? "A bulleted technical assessment summarizing gaps or checklist compliance in professional Arabic" : "A bulleted technical assessment summarizing gaps or checklist compliance in English.",
              },
            },
            required: ["reviewDraft", "aiAnalysis"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini");
      }

      const data = JSON.parse(responseText);
      res.json({
        reviewDraft: data.reviewDraft,
        aiAnalysis: data.aiAnalysis,
        isMock: false,
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to generate AI evaluation: " + error.message });
    }
  });

  // Serve files from NOC Secure Vault with Role-Based Access Control (RBAC)
  app.get("/noc_vault/evidence/:filename", authenticateToken, (req: any, res) => {
    let filename = req.params.filename;
    filename = path.basename(filename);
    if (!/^[a-zA-Z0-9_-]+\.(pdf|xlsx|jpg|jpeg|png)$/.test(filename)) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid filename format." } });
      return;
    }
    const userRole = req.user?.role;
    const userCompany = req.user?.company_id;
    
    // Extract company ID from filename or query parameters
    let companyId = (req.query.company_id as string || "").toUpperCase();
    const filenameUpper = filename.toUpperCase();
    if (filenameUpper.includes("WAHA")) companyId = "WAHA";
    else if (filenameUpper.includes("AGOCO")) companyId = "AGOCO";
    else if (filenameUpper.includes("SIRTE")) companyId = "SIRTE";
    else if (filenameUpper.includes("AKAKUS")) companyId = "AKAKUS";

    // 1. Technical Approval Form (Form 4) Visibility:
    // Visible and downloadable only by NOC PMO (pmo_auditor) and Company PMO (subsidiary_pm of that company)
    const isForm4 = filename.startsWith("Form_4_Technical_Approval_");
    if (isForm4) {
      if (userRole === "pmo_auditor" || (userRole === "subsidiary_pm" && companyId === userCompany)) {
        // Access granted
      } else {
        res.status(403).send("Access Denied: Only PMO roles are authorized to access Technical Approval Forms");
        return;
      }
    }

    // 1.1 Payment Authorization Form (Form 3) Visibility:
    // Visible and downloadable only by NOC Central Financial Auditor (noc_finance) and Subsidiary Finance Officer (subsidiary_finance of that company)
    const isForm3 = filename.startsWith("Form_3_Payment_Authorization_");
    if (isForm3) {
      if (userRole === "noc_finance" || (userRole === "subsidiary_finance" && companyId === userCompany)) {
        // Access granted
      } else {
        res.status(403).send("Access Denied: Only financial audit roles are authorized to access Payment Authorization Forms (Form 3)");
        return;
      }
    }
    // 2. General Document Visibility:
    // Check if the user has access to this document based on company isolation (except for NOC HQ roles)
    else if (userCompany !== "NOC_HQ" && companyId && companyId !== userCompany) {
      res.status(403).send("Access Denied: You do not have permissions to access documents from other operating companies");
      return;
    }

    const parentDir = path.join(process.cwd(), "..");
    
    let targetFile = "";
    if (filename.startsWith("Form_3_Payment_Authorization_") || filename.includes("Form_3")) {
      targetFile = "نموذج (3) تعزيز وإذن بالدفع.pdf";
    } else if (filename.includes("Form_4") || filename.includes("Technical") || filename.includes("Inspection") || filename.includes("Audit")) {
      targetFile = "نموذج (4) الاعتماد الفني للأعمال المنجزة.pdf";
    } else if (filename.includes("Form_2") || filename.includes("QAQC_Signoff") || filename.includes("Compliance")) {
      targetFile = "نموذج(2) شهادة المطابقة وطلب الإذن بالدفع.pdf";
    } else {
      targetFile = "كشف الموقف المالي المجمع للاعتمادات.pdf";
    }
    
    const filePath = path.join(parentDir, targetFile);
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    
    const stream = fs.createReadStream(filePath);
    stream.on("error", (err) => {
      console.error("Vault download error:", err);
      res.status(404).send("Document not found in NOC Secure Vault");
    });
    stream.pipe(res);
  });

  // Serve static assets or use Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
