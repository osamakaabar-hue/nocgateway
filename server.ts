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
import fs from "fs";


dotenv.config();

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

  // API Route: Backend Validation Check for claim submission
  app.post("/api/claims/submit", authenticateToken, (req: any, res) => {
    const { project_id, company_id, documents } = req.body;
    
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
    
    res.json({ success: true, message: "Validation passed and claim submission authorized." });
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
    const filename = req.params.filename;
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
