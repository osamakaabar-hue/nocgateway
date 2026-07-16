import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText, 
  CheckCircle2, 
  Building, 
  Briefcase, 
  Clock, 
  Database, 
  Plus, 
  RefreshCw, 
  SlidersHorizontal, 
  FileCheck2,
  FileSpreadsheet,
  Image,
  Layers,
  ArrowUpDown,
  Upload,
  User,
  ShieldCheck
} from "lucide-react";
import { Claim, Document, DemoUser } from "../types";
import { useTheme } from "./ThemeProvider";
import { Form2GenerationModal } from "./Form2GenerationModal";

interface SovereignDocumentRegistryProps {
  claims: Claim[];
  setClaims: React.Dispatch<React.SetStateAction<Claim[]>>;
  currentUser: DemoUser | null;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
  setPreviewDoc: (doc: Document | null) => void;
  lang?: any;
}

export default function SovereignDocumentRegistry({
  claims,
  setClaims,
  currentUser,
  showToast,
  setPreviewDoc,
  lang = "en"
}: SovereignDocumentRegistryProps) {
  const isRtl = lang === "ar";
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Security boundary: is this an NOC Central executive / auditor?
  const isApex = currentUser?.companyId === "NOC_HQ";

  // Filters & State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "PDF" | "XLSX" | "IMAGE">("ALL");
  const [projectFilter, setProjectFilter] = useState<"ALL" | string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "name_asc" | "size_desc">("newest");
  
  // Custom File Filing (Upload) Form States
  const [isFilingOpen, setIsFilingOpen] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState<"PDF" | "XLSX" | "IMAGE">("PDF");
  const [targetClaimId, setTargetClaimId] = useState("");
  const [showForm2Modal, setShowForm2Modal] = useState(false);
  const [targetForm2Claim, setTargetForm2Claim] = useState<Claim | null>(null);

  // Retrieve unique companies for filtering (restricted by security boundary)
  const companies = Array.from(
    new Set(
      claims
        .filter(c => isApex || c.companyId === currentUser?.companyId)
        .map(c => c.company)
    )
  );

  // Consolidate all documents across all claims (restricted by security boundary & role-based access control)
  const allDocuments = claims
    .flatMap(c => 
      c.documents.map(doc => ({
        ...doc,
        claimId: c.id,
        projectCode: c.code,
        projectTitle: c.title,
        companyName: c.company,
        companyId: c.companyId,
        claimStatus: c.status
      }))
    )
    .filter(doc => {
      // 1. Technical Approval Form (Form 4) specific visibility rules
      const isForm4 = doc.name.startsWith("Form_4_Technical_Approval_");
      if (isForm4) {
        // Must be NOC PMO (pmo_auditor) OR Company PMO (subsidiary_pm) of the associated company
        if (currentUser?.role === "pmo_auditor") {
          return true;
        }
        if (currentUser?.role === "subsidiary_pm" && doc.companyId === currentUser?.companyId) {
          return true;
        }
        return false; // Hide from other roles (e.g. subsidiary_finance, noc_finance, etc.)
      }

      // 1.1 Payment Authorization Form (Form 3) specific visibility rules
      const isForm3 = doc.name.startsWith("Form_3_Payment_Authorization_");
      if (isForm3) {
        // Visible ONLY to NOC Central Financial Auditor (noc_finance) and Subsidiary Finance Officer (subsidiary_finance of the associated company)
        if (currentUser?.role === "noc_finance") {
          return true;
        }
        if (currentUser?.role === "subsidiary_finance" && doc.companyId === currentUser?.companyId) {
          return true;
        }
        return false; // Hide from other roles (e.g. pmo_auditor, subsidiary_pm, etc.)
      }

      // 2. General Document Visibility:
      // NOC HQ roles (isApex) can see everything, other companies can only see their own documents
      if (isApex) {
        return true;
      }
      return doc.companyId === currentUser?.companyId;
    });

  // Helper function to handle direct file download
  const handleDirectDownload = (doc: any, company: string, code: string, title: string) => {
    let content = "";
    let contentType = "text/plain";
    
    if (doc.type === "PDF") {
      content = `%PDF-1.4\n` +
                `% NOC LIBYA SECURE SOVEREIGN FILE SYSTEM\n` +
                `% Document: ${doc.name}\n` +
                `% Timestamp: ${doc.uploadedAt}\n` +
                `% Class: OFFICIAL SOVEREIGN RECORD\n` +
                `------------------------------------------------------------------------\n` +
                `         NATIONAL OIL CORPORATION LIBYA - SOVEREIGN PMO\n` +
                `------------------------------------------------------------------------\n` +
                `Document Title: ${doc.name.replace(".pdf", "").replace(/_/g, " ")}\n` +
                `Associated Subsidiary: ${company}\n` +
                `Associated Project Reference: ${code} - ${title}\n` +
                `Cryptographic Signature: APPROVED BY CENTRAL AUDITOR VIA BLOCKCHAIN LEDGER\n` +
                `Timestamp of Record: ${doc.uploadedAt} (Sovereign Tripoli Time)\n` +
                `------------------------------------------------------------------------\n` +
                `Verification Details:\n` +
                `We hereby certify that all technical milestone conditions are completed and verified.\n` +
                `All supporting physical photo evidence matches structural blueprints.\n` +
                `Sign-off Status: TECHNICAL VALIDATION CLEARED (SIGNED ELECTRONICALLY)\n` +
                `------------------------------------------------------------------------\n`;
      contentType = "application/pdf";
    } else if (doc.type === "XLSX") {
      content = `National Oil Corporation Libya - Progress Measurement Ledger Sheet\n` +
                `Document Name,${doc.name}\n` +
                `Registered Date,${doc.uploadedAt}\n` +
                `Operator,${company}\n` +
                `Project Reference,${code}\n` +
                `Project Description,${title}\n` +
                `Status,Verified Earned Value Ledger\n\n` +
                `Item,WBS Code,Deliverable/Activity Description,Budget Weight,Contract Value,Verified Progress,Earned Value\n` +
                `1,1.0,Electrical and Hookups Wiring Hookups,10.0%,€125000,100%,€125000\n` +
                `2,2.0,Pressure Test Certification,5.0%,€62500,100%,€62500\n` +
                `3,3.0,Site Cleanup & Demobilization,2.5%,€31250,0%,€0\n` +
                `TOTAL,,,17.5%,€218750,,€187500\n`;
      contentType = "text/csv";
    } else {
      content = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">` +
                `<rect width="100%" height="100%" fill="%230f172a"/>` +
                `<circle cx="400" cy="300" r="150" fill="none" stroke="%23f59e0b" stroke-width="4"/>` +
                `<line x1="400" y1="50" x2="400" y2="550" stroke="%23334155" stroke-width="1" stroke-dasharray="5,5"/>` +
                `<line x1="50" y1="300" x2="750" y2="300" stroke="%23334155" stroke-width="1" stroke-dasharray="5,5"/>` +
                `<text x="40" y="80" fill="%2322c55e" font-family="monospace" font-size="12">GPS: 32°52'31.1"N 13°11'15.4"E</text>` +
                `<text x="40" y="100" fill="%2394a3b8" font-family="monospace" font-size="12">ELEVATION: 42.1m</text>` +
                `<text x="400" y="550" fill="%23f59e0b" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">NATIONAL OIL CORPORATION EVIDENCE PHOTO</text>` +
                `</svg>`;
      contentType = "image/svg+xml";
    }
    
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const token = localStorage.getItem("noc_jwt_token");
    const downloadUrl = (doc.url && doc.url !== "#")
      ? `${doc.url}?token=${token || ""}&company_id=${doc.companyId || ""}&project_id=${doc.claimId || ""}`
      : url;

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(isRtl ? `بدء تحميل الملف: "${doc.name}"` : `File download started: "${doc.name}"`, "success");
  };

  // Handle direct file upload / registry submission
  const handleFilingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !targetClaimId) {
      showToast(isRtl ? "يرجى تقديم اسم الملف وتحديد المشروع/المطالبة المستهدفة." : "Please provide a file name and select a target project/claim.", "error");
      return;
    }

    const extension = newDocType === "PDF" ? ".pdf" : newDocType === "XLSX" ? ".xlsx" : ".jpg";
    const fullName = newDocName.trim().endsWith(extension) ? newDocName.trim() : `${newDocName.trim()}${extension}`;
    const cleanSize = `${(Math.random() * 2.8 + 0.4).toFixed(1)} MB`;
    
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: fullName,
      size: cleanSize,
      uploadedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      type: newDocType,
      url: newDocType === "IMAGE" ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCBZO1wG_qTW9XLoXNcznnSQgbs4e8ez-KDVUHGDAAbEYHF8wDzJYk6fn4S1KIx0-bXpvE23YX_vq9tEyudiSmkotFuwrE8fnQNNZf391uNH-es6OmiSmWBWcvbnDJik6FkUrG1fvo3HNvs7R0YLmAx_OfANRM_TjXiachEv6E87tTVcYL4MEiufFsntpSRem8FwWC8bYiNxQC1t9kpTG22wBvQ8zxb6nU-eYqfB7FnZcPcB-GYAM6T1A" : undefined,
    };

    // Update target claim with newly uploaded file
    const updated = claims.map(c => {
      if (c.id === targetClaimId) {
        return {
          ...c,
          documents: [...c.documents, newDoc],
          auditLog: [
            {
              id: `log-${Date.now()}`,
              user: currentUser?.name || "Sovereign Audit Desk",
              action: isRtl ? "إرفاق مستند" : "Filing",
              change: isRtl 
                ? `تم إرفاق مستند ${fullName} إلى مجلد إثباتات المشروع عبر السجل السيادي للمستندات`
                : `Appended file ${fullName} to project evidence folder via Sovereign Document Registry`,
              timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
            },
            ...c.auditLog
          ]
        };
      }
      return c;
    });

    setClaims(updated);
    setNewDocName("");
    setIsFilingOpen(false);
    showToast(isRtl ? `تم تسجيل وإرفاق المستند "${fullName}" بنجاح في أرشيف المشروع السيادي!` : `Successfully uploaded and filed "${fullName}" into project archives!`, "success");
  };

  // Parse and calculate stats
  const totalCount = allDocuments.length;
  const pdfCount = allDocuments.filter(d => d.type === "PDF").length;
  const xlsxCount = allDocuments.filter(d => d.type === "XLSX").length;
  const imageCount = allDocuments.filter(d => d.type === "IMAGE").length;

  // Filter and sort files
  const filteredDocuments = allDocuments
    .filter(doc => {
      const matchSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter === "ALL" || doc.type === typeFilter;
      const matchProject = projectFilter === "ALL" || doc.companyName === projectFilter;
      return matchSearch && matchType && matchProject;
    })
    .sort((a, b) => {
      if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "size_desc") {
        // Simple MB/KB parsing
        const sizeA = parseFloat(a.size.replace(/[^\d.]/g, "")) * (a.size.includes("KB") ? 0.001 : 1);
        const sizeB = parseFloat(b.size.replace(/[^\d.]/g, "")) * (b.size.includes("KB") ? 0.001 : 1);
        return sizeB - sizeA;
      }
      // default: newest
      return b.id.localeCompare(a.id);
    });

  return (
    <div className={`flex-1 flex flex-col min-h-0 transition-colors duration-200 ${isDark ? "bg-[#030712] text-slate-100" : "bg-[#f8fafc] text-slate-900"} ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Banner / Header */}
      <div className={`p-6 border-b transition-colors duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 ${
        isDark ? "bg-[#0a0f1d] border-slate-800" : "bg-white border-slate-200/80"
      } ${isRtl ? "text-right md:flex-row-reverse" : "text-left"}`}>
        <div>
          <div className={`flex items-center gap-2 mb-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
            <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full font-mono uppercase tracking-widest ${
              isDark ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-600 border-amber-500/30"
            }`}>
              {isRtl ? "خزنة المؤسسة الآمنة v4.2" : "NOC Secure Vault v4.2"}
            </span>
          </div>
          <h1 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            {isRtl ? "السجل السيادي للمستندات" : "Sovereign Document Registry"}
          </h1>
          <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {isRtl 
              ? "المستودع المركزي لملفات الامتثال الهندسي المعتمدة، ونسخ الفواتير التجارية، واللقطات الميدانية الموثقة."
              : "Central repository of certified engineering compliance files, commercial invoice copies, and site photo evidence."}
          </p>
        </div>
 
        {/* Upload Action */}
        <div className="flex items-center gap-3">
          {(currentUser?.role === "subsidiary_pm" || currentUser?.role === "subsidiary_finance") && (
            <button
              onClick={() => {
                if (claims.length > 0) {
                  const eligible = claims.filter(c => c.companyId === currentUser?.companyId);
                  if (eligible.length > 0) {
                    const target = eligible[0];
                    if (target.documents.some((d: any) => d.name.startsWith("Form_2_Certificate_Of_Conformity"))) {
                      showToast(isRtl ? "تم إصدار نموذج 2 مسبقاً لهذه المطالبة" : "Form 2 has already been generated for this claim.", "error");
                      return;
                    }
                    setTargetForm2Claim(target);
                    setShowForm2Modal(true);
                  }
                }
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs py-2 px-4 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/10 shrink-0 cursor-pointer font-sans"
            >
              <FileText className="w-4 h-4" />
              {isRtl ? "إصدار نموذج 2 (للاعتماد)" : "Generate Form 2"}
            </button>
          )}

          <button
            onClick={() => {
              setIsFilingOpen(!isFilingOpen);
              if (claims.length > 0) {
                const eligible = claims.filter(c => isApex || c.companyId === currentUser?.companyId);
                if (eligible.length > 0) {
                  setTargetClaimId(eligible[0].id);
                }
              }
            }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-2 px-4 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10 shrink-0 cursor-pointer font-sans"
          >
            <Upload className="w-4 h-4" />
            {isRtl ? "تسجيل مستند جديد" : "File New Document"}
          </button>
        </div>
      </div>
 
      {/* Quick stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 shrink-0">
        <div className={`border p-4 rounded-2xl flex items-center justify-between shadow-sm transition-colors duration-200 ${
          isDark ? "bg-[#0a0f1d]/50 border-slate-850" : "bg-white border-slate-200"
        } ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-slate-500" : "text-slate-400"}`}>{isRtl ? "إجمالي ملفات الخزنة" : "Total Vault Files"}</span>
            <span className={`text-2xl font-black block mt-1 ${isDark ? "text-white" : "text-slate-950"}`}>{totalCount}</span>
            <span className="text-[10px] text-amber-500 font-mono mt-0.5 block">{isRtl ? "حماية سيادية ومؤمنة" : "Sovereign Anchored"}</span>
          </div>
          <Database className={`w-8 h-8 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
        </div>
 
        <div className={`border p-4 rounded-2xl flex items-center justify-between shadow-sm transition-colors duration-200 ${
          isDark ? "bg-[#0a0f1d]/50 border-slate-850" : "bg-white border-slate-200"
        } ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-slate-500" : "text-slate-400"}`}>{isRtl ? "الجودة والفواتير (PDF)" : "QA & Invoices (PDF)"}</span>
            <span className="text-2xl font-black text-red-400 block mt-1">{pdfCount}</span>
            <span className={`text-[10px] font-mono mt-0.5 block ${isDark ? "text-slate-400" : "text-slate-500"}`}>{isRtl ? "شهادات ومطالبات هندسية" : "Certificates & Claims"}</span>
          </div>
          <FileText className={`w-8 h-8 ${isDark ? "text-red-500/20" : "text-red-500/30"}`} />
        </div>
 
        <div className={`border p-4 rounded-2xl flex items-center justify-between shadow-sm transition-colors duration-200 ${
          isDark ? "bg-[#0a0f1d]/50 border-slate-850" : "bg-white border-slate-200"
        } ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-slate-500" : "text-slate-400"}`}>{isRtl ? "دفاتر إكسل الحسابية" : "Excel Ledgers"}</span>
            <span className="text-2xl font-black text-emerald-400 block mt-1">{xlsxCount}</span>
            <span className={`text-[10px] font-mono mt-0.5 block ${isDark ? "text-slate-400" : "text-slate-500"}`}>{isRtl ? "أوراق القيمة المكتسبة" : "Earned Value Sheets"}</span>
          </div>
          <FileSpreadsheet className={`w-8 h-8 ${isDark ? "text-emerald-500/20" : "text-emerald-500/30"}`} />
        </div>
 
        <div className={`border p-4 rounded-2xl flex items-center justify-between shadow-sm transition-colors duration-200 ${
          isDark ? "bg-[#0a0f1d]/50 border-slate-850" : "bg-white border-slate-200"
        } ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-slate-500" : "text-slate-400"}`}>{isRtl ? "الصور الميدانية للموقع" : "Site Photos"}</span>
            <span className="text-2xl font-black text-sky-400 block mt-1">{imageCount}</span>
            <span className={`text-[10px] font-mono mt-0.5 block ${isDark ? "text-slate-400" : "text-slate-500"}`}>{isRtl ? "محددة جغرافياً بالكامل" : "FLIR & GPS Tagged"}</span>
          </div>
          <Image className={`w-8 h-8 ${isDark ? "text-sky-500/20" : "text-sky-500/30"}`} />
        </div>
      </div>
 
      {/* Manual Filing Drawer panel (conditional) */}
      {isFilingOpen && (
        <div className={`mx-6 mb-6 p-5 border rounded-2xl animate-in slide-in-from-top-4 duration-200 ${
          isDark ? "bg-slate-950 border-amber-500/30" : "bg-slate-50 border-amber-500/40 shadow-md"
        }`}>
          <div className={`flex justify-between items-center mb-4 border-b pb-2 ${isDark ? "border-slate-850" : "border-slate-200"} ${isRtl ? "flex-row-reverse" : ""}`}>
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {isRtl ? "واجهة تسجيل مستند فني بالمنظومة" : "Sovereign Document Filing Interface"}
            </h3>
            <button 
              onClick={() => setIsFilingOpen(false)}
              className="text-xs text-slate-400 hover:text-red-500 cursor-pointer font-bold transition-colors"
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </button>
          </div>
 
          <form onSubmit={handleFilingSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {isRtl ? "المشروع المستهدف / محفظة المطالبة" : "Target Project / Claim Portfolio"}
              </label>
              <select
                value={targetClaimId}
                onChange={(e) => setTargetClaimId(e.target.value)}
                className={`w-full border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-amber-500 cursor-pointer ${
                  isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}
              >
                {claims
                  .filter(c => isApex || c.companyId === currentUser?.companyId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} ({c.company})
                    </option>
                  ))}
              </select>
            </div>
 
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {isRtl ? "اسم الملف (بدون امتداد)" : "File Name (excluding extension)"}
              </label>
              <input
                type="text"
                placeholder={isRtl ? "مثال: Wellhead_TPI_Verification" : "e.g. Wellhead_TPI_Verification"}
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className={`w-full border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-amber-500 placeholder-slate-500 font-mono ${
                  isDark ? "bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-600" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                } ${isRtl ? "text-right" : "text-left"}`}
              />
            </div>
 
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {isRtl ? "صيغة الامتداد" : "Type Format"}
                </label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as any)}
                  className={`w-full border rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-amber-500 cursor-pointer ${
                    isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  <option value="PDF">{isRtl ? "شهادة PDF" : "PDF Certificate"}</option>
                  <option value="XLSX">{isRtl ? "ورقة حسابية Excel" : "Excel Spreadsheet"}</option>
                  <option value="IMAGE">{isRtl ? "صورة إثبات ميدانية" : "On-Site Photo"}</option>
                </select>
              </div>
 
              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg transition-colors cursor-pointer"
              >
                {isRtl ? "تسجيل وختم المستند" : "File & Seal Document"}
              </button>
            </div>
          </form>
        </div>
      )}
 
      {/* Search, Filter & Workspace Controls */}
      <div className={`px-6 pb-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 shrink-0 ${isRtl ? "text-right md:flex-row-reverse" : "text-left"}`}>
        
        {/* Left: Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute top-2.5 w-4 h-4 text-slate-500 ${isRtl ? "right-3" : "left-3"}`} />
          <input
            type="text"
            placeholder={isRtl ? "البحث عن المستندات بالاسم، الرمز المرجعي، أو الوصف..." : "Search documents by name, code, or description..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full border rounded-xl py-2 text-xs focus:outline-none focus:border-amber-500 transition-colors font-sans ${
              isDark ? "bg-[#0a0f1d] border-slate-800 text-slate-100 placeholder-slate-500" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
            } ${isRtl ? "pl-4 pr-9 text-right" : "pl-9 pr-4 text-left"}`}
          />
        </div>
 
        {/* Right: Filters group */}
        <div className={`flex flex-wrap items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
          
          {/* Format Type filter */}
          <div className={`flex items-center gap-1.5 p-1 rounded-xl border ${
            isDark ? "bg-[#0a0f1d]/40 border-slate-800" : "bg-slate-100 border-slate-200"
          } ${isRtl ? "flex-row-reverse" : ""}`}>
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                typeFilter === "ALL" 
                  ? (isDark ? "bg-slate-800 text-white" : "bg-white text-slate-900 shadow-sm border border-slate-200/60") 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isRtl ? "الكل" : "All"}
            </button>
            <button
              onClick={() => setTypeFilter("PDF")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                typeFilter === "PDF" 
                  ? (isDark ? "bg-red-500/20 text-red-400" : "bg-red-50 text-red-600 border border-red-200/60") 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isRtl ? "ملفات PDF" : "PDFs"}
            </button>
            <button
              onClick={() => setTypeFilter("XLSX")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                typeFilter === "XLSX" 
                  ? (isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600 border border-emerald-250") 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isRtl ? "ملفات إكسل" : "Excel"}
            </button>
            <button
              onClick={() => setTypeFilter("IMAGE")}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                typeFilter === "IMAGE" 
                  ? (isDark ? "bg-sky-500/20 text-sky-400" : "bg-sky-50 text-sky-600 border border-sky-200") 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {isRtl ? "الصور" : "Photos"}
            </button>
          </div>
 
          {/* Subsidiary Filter - Lock/Show only for HQ */}
          {!isApex ? (
            <div className={`flex items-center gap-1.5 rounded-xl py-1.5 px-3 text-xs font-bold font-sans border ${
              isDark ? "bg-[#0a0f1d] border-slate-800 text-amber-400" : "bg-amber-50/50 border-amber-200 text-amber-700"
            } ${isRtl ? "flex-row-reverse" : ""}`}>
              <Building className="w-3.5 h-3.5" />
              <span>{currentUser?.company}</span>
            </div>
          ) : (
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className={`border rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-amber-500 max-w-full sm:max-w-[160px] cursor-pointer ${
                isDark ? "bg-[#0a0f1d] border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              <option value="ALL">{isRtl ? "جميع الشركات" : "All Companies"}</option>
              {companies.map((comp) => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          )}
 
          {/* Sort selection */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={`border rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-amber-500 cursor-pointer ${
              isDark ? "bg-[#0a0f1d] border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
            }`}
          >
            <option value="newest">{isRtl ? "الأحدث تسجيلاً" : "Newest Filed"}</option>
            <option value="name_asc">{isRtl ? "الاسم أ-ي" : "Name A-Z"}</option>
            <option value="size_desc">{isRtl ? "الأكبر حجماً" : "Largest Size"}</option>
          </select>
        </div>
 
      </div>
 
      {/* Main Table View Workspace */}
      <div className={`flex-1 overflow-y-auto px-6 pb-6 min-h-0 ${isRtl ? "text-right" : "text-left"}`}>
        <div className={`border rounded-2xl overflow-hidden shadow-xl ${
          isDark ? "bg-slate-950/40 border-slate-850" : "bg-white border-slate-200"
        }`}>
          
          {filteredDocuments.length === 0 ? (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
              <Layers className={`w-12 h-12 mb-4 animate-pulse ${isDark ? "text-slate-700" : "text-slate-300"}`} />
              <p className={`font-bold text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {isRtl ? "لم يتم العثور على أي مستندات مطابقة" : "No matching documents found"}
              </p>
              <p className={`text-xs mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                {isRtl ? "يرجى تعديل خيارات التصفية أو تجربة عبارة بحث أخرى." : "Adjust your filters or try a different search phrase."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" dir={isRtl ? "rtl" : "ltr"}>
                <thead>
                  <tr className={`border-b uppercase text-[9px] tracking-wider font-bold ${
                    isDark ? "border-slate-850 bg-slate-950/60 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}>
                    <th className={`py-3.5 px-4 ${isRtl ? "text-right" : "text-left"}`}>
                      {isRtl ? "تفاصيل المستند الفني" : "Document Details"}
                    </th>
                    <th className={`py-3.5 px-4 ${isRtl ? "text-right" : "text-left"}`}>
                      {isRtl ? "المشروع والشركة المشغلة" : "Operating Project"}
                    </th>
                    <th className={`py-3.5 px-4 ${isRtl ? "text-right" : "text-left"}`}>
                      {isRtl ? "تاريخ ووقت التسجيل" : "Filing Date / Timestamp"}
                    </th>
                    <th className={`py-3.5 px-4 ${isRtl ? "text-right" : "text-left"}`}>
                      {isRtl ? "حجم الملف" : "File Size"}
                    </th>
                    <th className={`py-3.5 px-4 ${isRtl ? "text-right" : "text-left"}`}>
                      {isRtl ? "الحالة والتوثيق السيادي" : "Sovereign State"}
                    </th>
                    <th className={`py-3.5 px-4 ${isRtl ? "text-left" : "text-right"}`}>
                      {isRtl ? "خيارات وإجراءات" : "Technical Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-slate-900" : "divide-slate-100"}`}>
                  {filteredDocuments.map((doc) => (
                    <tr 
                      key={doc.id}
                      className={`transition-colors group ${
                        isDark ? "hover:bg-slate-900/40" : "hover:bg-slate-50/50"
                      }`}
                    >
                      {/* Document details name and icon */}
                      <td className="py-3.5 px-4">
                        <div className={`flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                          <div className={`p-2 rounded-lg shrink-0 ${
                            doc.type === "PDF" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                            doc.type === "XLSX" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          }`}>
                            {doc.type === "PDF" ? <FileText className="w-4 h-4" /> :
                             doc.type === "XLSX" ? <FileSpreadsheet className="w-4 h-4" /> :
                             <Image className="w-4 h-4" />}
                          </div>
                          <div className="overflow-hidden">
                            <span 
                              onClick={() => setPreviewDoc(doc)}
                              className={`font-bold text-xs group-hover:text-amber-500 transition-colors block truncate max-w-full sm:max-w-[280px] cursor-pointer ${
                                isDark ? "text-slate-200" : "text-slate-800"
                              } ${isRtl ? "text-right" : "text-left"}`}
                              title={doc.name}
                            >
                              {doc.name}
                            </span>
                            <span className={`text-[10px] font-mono block mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                              {isRtl ? "المعرف: " : "ID: "}{doc.id} • {isRtl ? "الصيغة: " : "Format: "} <strong className={`${isDark ? "text-slate-400" : "text-slate-500"} font-bold`}>{doc.type}</strong>
                            </span>
                          </div>
                        </div>
                      </td>
 
                      {/* Associated project details */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          <span className={`font-semibold block ${isDark ? "text-slate-300" : "text-slate-700"}`}>{doc.companyName}</span>
                          <span className={`text-[10px] font-mono block mt-0.5 truncate max-w-full sm:max-w-[200px] ${isDark ? "text-slate-500" : "text-slate-400"}`} title={doc.projectTitle}>
                            <strong className="text-amber-500 font-mono">{doc.projectCode}</strong> • {doc.projectTitle}
                          </span>
                        </div>
                      </td>
 
                      {/* Timestamp of filing */}
                      <td className="py-3.5 px-4">
                        <div className={`flex items-center gap-2 font-mono text-xs ${isDark ? "text-slate-300" : "text-slate-600"} ${isRtl ? "flex-row-reverse" : ""}`}>
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc.uploadedAt}</span>
                        </div>
                      </td>
 
                      {/* File size info */}
                      <td className="py-3.5 px-4">
                        <span className={`font-mono text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{doc.size}</span>
                      </td>
 
                      {/* Status signature seal */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-full font-mono ${isRtl ? "flex-row-reverse" : ""}`}>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          {isRtl ? "موثق ومؤمن بالدفتر" : "Validated & Anchored"}
                        </span>
                      </td>
 
                      {/* Download and View controls */}
                      <td className={`py-3.5 px-4 ${isRtl ? "text-left" : "text-right"}`}>
                        <div className={`flex items-center gap-2 ${isRtl ? "justify-start" : "justify-end"}`}>
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark ? "bg-[#0a0f1d] hover:bg-slate-800 text-slate-300 hover:text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800"
                            }`}
                            title={isRtl ? "فتح المستعرض التفاعلي للمستند" : "Open interactive document viewer"}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDirectDownload(doc, doc.companyName, doc.projectCode, doc.projectTitle)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isDark ? "bg-[#0a0f1d] hover:bg-slate-800 text-amber-500 hover:text-amber-400" : "bg-slate-100 hover:bg-slate-200 text-amber-600 hover:text-amber-500"
                            }`}
                            title={isRtl ? "تحميل المستند فورياً" : "Download document immediately"}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
 
        </div>
      </div>
 
      <Form2GenerationModal 
        isOpen={showForm2Modal}
        onClose={() => setShowForm2Modal(false)}
        isRtl={isRtl}
        isDark={isDark}
        onGenerate={() => {
          if (targetForm2Claim) {
            const newDoc: Document = {
              id: `doc-form2-${Date.now()}`,
              name: `Form_2_Certificate_Of_Conformity_${targetForm2Claim.code}.pdf`,
              size: "1.5 MB",
              uploadedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              type: "PDF",
              url: `/noc_vault/evidence/Form_2_Certificate_Of_Conformity_${targetForm2Claim.code}.pdf`
            };
            
            const updated = claims.map(c => {
              if (c.id === targetForm2Claim.id) {
                return { ...c, documents: [newDoc, ...c.documents] };
              }
              return c;
            });
            
            setClaims(updated);
            showToast(isRtl ? "تم إصدار نموذج 2 بنجاح." : "Form 2 successfully generated.", "success");
          }
        }}
      />
    </div>
  );
}
