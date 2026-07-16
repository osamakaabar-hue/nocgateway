import React, { useState, useEffect } from "react";
import { Claim, AuditLogEntry, Document, LcData } from "../types";
import PaymentAuthorizationForm from "./forms/PaymentAuthorizationForm";
import { Form2GenerationModal } from "./Form2GenerationModal";
const INITIAL_LC_DATA: LcData[] = [
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
import {
  Receipt,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Download,
  Building2,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  Coins,
  Send,
  Eye
} from "lucide-react";

interface InvoiceAuditingVaultProps {
  claims: Claim[];
  setClaims: React.Dispatch<React.SetStateAction<Claim[]>>;
  currentUser: any;
  activeRole: string;
  showToast: (text: string, type?: "success" | "info" | "error") => void;
  setPreviewDoc: (doc: Document | null) => void;
  addNotification?: (
    title: string,
    message: string,
    type?: "success" | "info" | "warning" | "error",
    claimId?: string,
    tab?: "claims" | "wbs" | "invoices" | "lcs" | "documents" | "notifications",
    targetUserId?: string,
    companyId?: string,
    actionRequired?: boolean,
    priority?: "high" | "normal"
  ) => void;
  lang?: any;
}

export default function InvoiceAuditingVault({
  claims,
  setClaims,
  currentUser,
  activeRole,
  showToast,
  setPreviewDoc,
  addNotification,
  lang = "en"
}: InvoiceAuditingVaultProps) {
  const isRtl = lang === "ar";
  const getCompanyTranslation = (companyName: string) => {
    if (!isRtl) return companyName;
    const mapping: Record<string, string> = {
      "Waha Oil Company": "شركة الواحة للنفط",
      "Arabian Gulf Oil Company": "شركة الخليج العربي للنفط",
      "Zallaf Libya": "شركة زلاف ليبيا",
      "Mellitah Oil & Gas": "شركة مليتة للنفط والغاز",
      "Harouge Oil Operations": "شركة الهروج للعمليات النفطية",
      "National Oil Corporation (NOC)": "المؤسسة الوطنية للنفط"
    };
    return mapping[companyName] || companyName;
  };

  const getDueDateTranslation = (dueDate: string) => {
    if (!isRtl) return dueDate;
    if (dueDate === "Today") return "اليوم";
    if (dueDate === "Tomorrow") return "غداً";
    return dueDate.replace("Oct", "أكتوبر").replace("Within 7 Days", "خلال ٧ أيام");
  };

  const getSubmissionDateTranslation = (dateStr: string) => {
    if (!isRtl) return dateStr;
    return dateStr
      .replace("October", "أكتوبر")
      .replace("Today", "اليوم")
      .replace("AM", "ص")
      .replace("PM", "م")
      .replace("at", "في")
      .replace("Oct", "أكتوبر");
  };

  const getRoleLabelTranslation = (role: string) => {
    if (!isRtl) return role;
    const mapping: Record<string, string> = {
      "pmo_auditor": "المراجع الفني للـ PMO",
      "subsidiary_pm": "مدير مشروع الشركة التابعة",
      "subsidiary_finance": "المسؤول المالي للشركة التابعة",
      "noc_finance": "المدقق المالي المركزي (NOC)",
      "noc_head_of_accounts": "مدير الحسابات العام (NOC)"
    };
    return mapping[role] || role;
  };

  const isSubsidiary = currentUser && currentUser.companyId !== "NOC_HQ";
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  const [showForm2Modal, setShowForm2Modal] = useState(false);
  const [targetForm2Claim, setTargetForm2Claim] = useState<Claim | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalType, setConfirmModalType] = useState<"pre_approve" | "final_release" | "release_invoice" | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [showForm3Modal, setShowForm3Modal] = useState(false);
  const [form3Checked, setForm3Checked] = useState(false);

  const [inputInvoiceNo, setInputInvoiceNo] = useState("");
  const [inputInvoiceAmount, setInputInvoiceAmount] = useState<number | "">("");

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(() => {
    const claimsWithInvoices = claims.filter(c => {
      const isOwner = !isSubsidiary || c.companyId === currentUser.companyId;
      return isOwner && c.invoiceNumber;
    });
    return claimsWithInvoices.length > 0 ? claimsWithInvoices[0].id : null;
  });

  // Derived list of claims
  const invoicesList = claims.filter(c => {
    // Company isolation
    if (isSubsidiary && c.companyId !== currentUser.companyId) {
      return false;
    }
    return true; // Show ALL claims in the invoice sector so they can release/submit invoices for any of them!
  });

  // Filter list based on search and selected company
  const filteredInvoices = invoicesList.filter(inv => {
    const matchesSearch = 
      inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      inv.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = filterCompany === "all" || inv.companyId === filterCompany;
    return matchesSearch && matchesCompany;
  });

  // Active Selected Invoice Claim
  const activeInvoiceClaim = filteredInvoices.find(c => c.id === selectedInvoiceId) || (filteredInvoices.length > 0 ? filteredInvoices[0] : null);

  useEffect(() => {
    if (activeInvoiceClaim) {
      setInputInvoiceNo(activeInvoiceClaim.invoiceNumber || `INV-${activeInvoiceClaim.code}`);
      const evLimit = Math.round((activeInvoiceClaim.claimedProgress / 100) * activeInvoiceClaim.numericValue);
      setInputInvoiceAmount(activeInvoiceClaim.invoiceAmount || evLimit);
    } else {
      setInputInvoiceNo("");
      setInputInvoiceAmount("");
    }
  }, [activeInvoiceClaim?.id]);

  const handleResetDemoInvoices = () => {
    const demoInvoices: Claim[] = [
      {
        id: "claim-1",
        code: "WAHA-24-109",
        title: "Wellhead Maintenance - Phase II",
        company: "Waha Oil Company",
        companyId: "WAHA",
        wbs: "WAHA-24-109",
        claimedValue: "€1,250,000",
        numericValue: 1250000,
        submittedBy: "Eng. Tarek El-Fassi",
        submissionDate: "October 24, 2024 09:15 AM",
        previousProgress: 45.0,
        claimedProgress: 62.5,
        priority: "high",
        dueDate: "Today",
        previousNotes: "Mechanical completion of Phase I verified. Electrical interconnections are pending final loop testing before advancing beyond 45%. - October 10, 2024",
        deliverables: [
          { id: "del-1-1", description: "Complete electrical wiring hookups (Wells 14-18)", weight: "10.0%", status: "completed" },
          { id: "del-1-2", description: "Pressure test sign-off (QA/QC Dept)", weight: "5.0%", status: "completed" },
          { id: "del-1-3", description: "Site demobilization preparation", weight: "2.5%", status: "pending" }
        ],
        documents: [
          { id: "doc-1-1", name: "QAQC_Signoff_Wells14-18.pdf", size: "2.4 MB", uploadedAt: "09:10 AM", type: "PDF" },
          { id: "doc-1-2", name: "Progress_Measurement_Sheet_Oct.xlsx", size: "850 KB", uploadedAt: "09:12 AM", type: "XLSX" }
        ],
        auditLog: [
          { id: "log-1-1", user: "Eng. Tarek El-Fassi", action: "Submission", change: "45.0% → 62.5%", timestamp: "Oct 24, 09:15 AM" }
        ],
        auditorNotes: "",
        status: "pending_financial_audit",
        invoiceNumber: "INV-WAHA-24-109",
        invoiceAmount: 781250
      },
      {
        id: "claim-2",
        code: "AGOCO-24-042",
        title: "Pipeline Route Survey - Block NC-41",
        company: "Arabian Gulf Oil Company",
        companyId: "AGOCO",
        wbs: "AGOCO-24-042",
        claimedValue: "€450,000",
        numericValue: 450000,
        submittedBy: "Eng. Salem Al-Obeidi",
        submissionDate: "October 23, 2024 11:30 AM",
        previousProgress: 20.0,
        claimedProgress: 35.0,
        priority: "standard",
        dueDate: "Tomorrow",
        previousNotes: "Initial terrain scan and basic corridor coordinates for the onshore pipeline branch completed successfully.",
        deliverables: [
          { id: "del-2-1", description: "Complete geophysical survey for main hub pathway", weight: "12.0%", status: "completed" },
          { id: "del-2-2", description: "Submit preliminary geotechnical soil report for review", weight: "3.0%", status: "pending" }
        ],
        documents: [
          { id: "doc-2-1", name: "Geotechnical_Draft_NC41.pdf", size: "5.1 MB", uploadedAt: "11:10 AM", type: "PDF" }
        ],
        auditLog: [
          { id: "log-2-2", user: "Mr. Abdelrahman Boufardis", action: "Pre-Approve", change: "Compliance verified & pre-approved for payment. Sent to NOC Head of Accounts.", timestamp: "Oct 24, 10:30 AM" },
          { id: "log-2-1", user: "Eng. Salem Al-Obeidi", action: "Submission", change: "20.0% → 35.0%", timestamp: "Oct 23, 11:30 AM" }
        ],
        auditorNotes: "Pipeline route survey coordinates verified. Invoice matches the certified progress value within limits.",
        status: "pending_head_of_accounts_approval",
        invoiceNumber: "INV-AGOCO-24-042",
        invoiceAmount: 157500
      },
      {
        id: "claim-3",
        code: "ZALLAF-24-008",
        title: "Erawin Field - Substation Civil Works",
        company: "Zallaf Libya",
        companyId: "ZALLAF",
        wbs: "ZALLAF-24-008",
        claimedValue: "€890,000",
        numericValue: 890000,
        submittedBy: "Eng. Muftah Al-Warfali",
        submissionDate: "October 22, 2024 02:20 PM",
        previousProgress: 55.0,
        claimedProgress: 72.0,
        priority: "standard",
        dueDate: "Oct 28",
        previousNotes: "Reinforced concrete foundations for ground generators poured. Waiting for 28-day concrete cube compressive strength test report.",
        deliverables: [
          { id: "del-3-1", description: "Pour concrete bases for primary transformers & heavy gear", weight: "15.0%", status: "completed" }
        ],
        documents: [
          { id: "doc-3-1", name: "Concrete_Compressive_Strength_Report.pdf", size: "1.8 MB", uploadedAt: "02:05 PM", type: "PDF" }
        ],
        auditLog: [
          { id: "log-3-1", user: "Eng. Muftah Al-Warfali", action: "Submission", change: "55.0% → 72.0%", timestamp: "Oct 22, 02:20 PM" }
        ],
        auditorNotes: "",
        status: "authorized_for_payment",
        invoiceNumber: "INV-ZALLAF-24-008",
        invoiceAmount: 640800,
        paymentToken: "NOC-AUTH-HQ-9012-claim-3"
      },
      {
        id: "claim-4",
        code: "MELLITAH-24-211",
        title: "Gas Processing Plant Overhaul",
        company: "Mellitah Oil & Gas",
        companyId: "MELLITAH",
        wbs: "MELLITAH-24-211",
        claimedValue: "€3,400,000",
        numericValue: 3400000,
        submittedBy: "Eng. Ali Al-Zway",
        submissionDate: "October 21, 2024 10:00 AM",
        previousProgress: 70.0,
        claimedProgress: 85.0,
        priority: "standard",
        dueDate: "Oct 29",
        previousNotes: "Overhaul on main gas compressors and valve isolations completed on Units 1 & 2. Pre-commissioning leak tests in progress.",
        deliverables: [
          { id: "del-4-1", description: "Install automatic control valves & update Unit PLC logic", weight: "12.0%", status: "completed" }
        ],
        documents: [
          { id: "doc-4-1", name: "PLC_Upgrade_Checklist.pdf", size: "3.2 MB", uploadedAt: "09:50 AM", type: "PDF" }
        ],
        auditLog: [
          { id: "log-4-1", user: "Eng. Ali Al-Zway", action: "Submission", change: "70.0% → 85.0%", timestamp: "Oct 21, 10:00 AM" }
        ],
        auditorNotes: "",
        status: "pending_financial_audit",
        invoiceNumber: "INV-MELLITAH-24-211",
        invoiceAmount: 2890000
      }
    ];

    setClaims(demoInvoices);
    localStorage.setItem("noc_eppm_claims", JSON.stringify(demoInvoices));
    showToast("Successfully loaded premium demo invoices for all companies!", "success");
  };

  // Financial Stats Calculations with Company Isolation
  const companyClaims = claims.filter(c => !isSubsidiary || c.companyId === currentUser.companyId);

  const totalContractInvoiced = companyClaims
    .filter(c => c.invoiceAmount)
    .reduce((sum, c) => sum + (c.invoiceAmount || 0), 0);

  const totalAuthorizedPaid = companyClaims
    .filter(c => c.status === "authorized_for_payment" && c.invoiceAmount)
    .reduce((sum, c) => sum + (c.invoiceAmount || 0), 0);

  const totalPendingAudit = companyClaims
    .filter(c => (c.status === "pending_financial_audit" || c.status === "pending_head_of_accounts_approval") && c.invoiceAmount)
    .reduce((sum, c) => sum + (c.invoiceAmount || 0), 0);

  // Pre-approve selected invoice (NOC Financial Auditor)
  const handlePreApproveInvoice = (claimId: string) => {
    const claim = claims.find(c => c.id === claimId);
    const updated = claims.map(c => {
      if (c.id === claimId) {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: currentUser?.name || "NOC Central Financial Auditor",
          action: isRtl ? "الموافقة المسبقة على الفاتورة" : "Pre-Approve Invoice",
          change: isRtl
            ? "تم التحقق والموافقة المسبقة على الفاتورة لمطابقتها للامتثال المالي. في انتظار السيدة سلمى الهاشمي لطلب تسييل وإفراج الأموال النهائي."
            : "Invoice pre-approved for payment compliance. Awaiting Mrs. Salma Al-Hashemi (Head of Accounts) to release final funds.",
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        };
        return {
          ...c,
          status: "pending_head_of_accounts_approval" as const,
          auditLog: [newLog, ...c.auditLog]
        };
      }
      return c;
    });

    setClaims(updated);
    setMakeChangesState(updated);
    showToast(isRtl ? "تم التحقق والموافقة المسبقة على الفاتورة بنجاح! تم إرسالها لمدير الحسابات للصرف السيادي." : "Invoice verified & pre-approved! Sent to Head of Accounts for sovereign release.", "success");
    if (claim && addNotification) {
      addNotification(
        isRtl ? "تنبيه: بانتظار توقيع تفويض الصرف (نموذج 3)" : "Action Required: Form 3 Payment Authorization Sign-off Needed",
        isRtl 
          ? `تم التحقق والموافقة المبدئية على فاتورة المطالبة ${claim.code}. يرجى مراجعة وتوقيع نموذج 3 لإتمام الصرف المالي.`
          : `Compliance pre-approved for claim ${claim.code}. Please review and sign Payment Authorization Form 3 to authorize funds.`,
        "warning",
        claim.id,
        "invoices",
        undefined,
        claim.companyId,
        true,
        "high"
      );
    }
  };

  // Helper to set state and write to localStorage
  const setMakeChangesState = (updatedClaims: Claim[]) => {
    localStorage.setItem("noc_eppm_claims", JSON.stringify(updatedClaims));
  };

  // Final Release payment (NOC Head of Accounts)
  const handleReleasePayment = (claimId: string) => {
    const secureToken = `NOC-AUTH-${currentUser?.companyId || "HQ"}-${Math.floor(1000 + Math.random() * 9000)}-${claimId.substring(claimId.lastIndexOf("-") + 1)}`;
    const claim = claims.find(c => c.id === claimId);
    
    const updated = claims.map(c => {
      if (c.id === claimId) {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: currentUser?.name || "NOC Head of Accounts",
          action: isRtl ? "تسييل وصرف الأموال السيادية" : "Release Sovereign Funds",
          change: isRtl
            ? `تم التوقيع والموافقة على تسييل الأموال السيادية للمشروع. تم إنشاء رمز الدفع الإلكتروني الآمن للمنظومة المالية: ${secureToken}`
            : `Sovereign fund release signed. NOC Secure Central ERP Payment Token generated: ${secureToken}`,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        };
        return {
          ...c,
          status: "authorized_for_payment" as const,
          paymentToken: secureToken,
          auditLog: [newLog, ...c.auditLog]
        };
      }
      return c;
    });

    setClaims(updated);
    setMakeChangesState(updated);
    showToast(isRtl ? "تم اعتماد الدفع للمطالبة وتسييل الفاتورة في المنظومة المالية المركزية بنجاح!" : "Invoice payment authorized and released to central ERP successfully!", "success");
    if (claim && addNotification) {
      addNotification(
        isRtl ? "تم صرف وتسييل الأموال السيادية" : "Sovereign Funds Successfully Released",
        isRtl 
          ? `تمت الموافقة النهائية وتسييل أموال المطالبة رقم ${claim.code}. رمز الدفع الإلكتروني المعتمد للمنظومة المالية: ${secureToken}`
          : `Final funds released for claim ${claim.code}. Secure ERP Payment Token generated: ${secureToken}`,
        "success",
        claim.id,
        "invoices",
        undefined,
        claim.companyId
      );
    }
  };

  // Submit / Release Commercial Invoice to NOC (from Invoice Sector)
  const handleReleaseInvoice = (claimId: string, invoiceNo: string, amount: number) => {
    const claim = claims.find(c => c.id === claimId);
    const updated = claims.map(c => {
      if (c.id === claimId) {
        const newLog: AuditLogEntry = {
          id: `log-${Date.now()}`,
          user: currentUser?.name || "Contractor Finance Officer",
          action: isRtl ? "تقديم الفاتورة" : "Submit Invoice",
          change: isRtl
            ? `تم تقديم وتسجيل الفاتورة التجارية ${invoiceNo} بمبلغ €${amount.toLocaleString()} (تم التحقق والمطابقة للامتثال بقيمة العمل المنجز EVM)`
            : `Commercial invoice ${invoiceNo} registered for €${amount.toLocaleString()} (EVM Compliance Verified)`,
          timestamp: new Date().toLocaleString("en-US", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
          })
        };
        return {
          ...c,
          status: "pending_financial_audit" as const,
          invoiceNumber: invoiceNo,
          invoiceAmount: amount,
          auditLog: [newLog, ...c.auditLog]
        };
      }
      return c;
    });

    setClaims(updated);
    setMakeChangesState(updated);
    showToast(isRtl ? `تم تسجيل وتقديم الفاتورة التجارية رقم ${invoiceNo} رسمياً إلى الإدارة المالية المركزية للمؤسسة!` : `Invoice ${invoiceNo} officially released & submitted to NOC Central Finance!`, "success");
    if (claim && addNotification) {
      addNotification(
        isRtl ? "تم تقديم الفاتورة التجارية" : "Commercial Invoice Submitted",
        isRtl 
          ? `تم تقديم الفاتورة التجارية ${invoiceNo} للمطالبة رقم ${claim.code} بقيمة €${amount.toLocaleString()} رسمياً للتدقيق المالي.`
          : `Invoice ${invoiceNo} for claim ${claim.code} (€${amount.toLocaleString()}) has been officially submitted for audit.`,
        "info",
        claim.id,
        "invoices",
        undefined,
        claim.companyId
      );
    }
  };

  const getStatusBadge = (status: string, hasInvoice: boolean) => {
    if (!hasInvoice) {
      return (
        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
          {isRtl ? "بانتظار مسودة الفاتورة" : "Pending Draft Invoice"}
        </span>
      );
    }
    switch (status) {
      case "authorized_for_payment":
        return (
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            {isRtl ? "مكتمل ومدفوع" : "Paid & Locked"}
          </span>
        );
      case "pending_head_of_accounts_approval":
        return (
          <span className="bg-fuchsia-100 text-fuchsia-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-fuchsia-200 flex items-center gap-1">
            <Lock className="w-3 h-3 animate-pulse text-fuchsia-600" />
            {isRtl ? "في انتظار الصرف" : "Release Pending"}
          </span>
        );
      case "pending_financial_audit":
        return (
          <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
            {isRtl ? "تحت مراجعة الامتثال" : "Under Audit"}
          </span>
        );
      default:
        return (
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
            {isRtl ? "مسودة فاتورة تجارية" : "Invoice Drafted"}
          </span>
        );
    }
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      
      {/* Tab Header */}
      <div className={`p-6 border-b border-slate-200 shrink-0 bg-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${isRtl ? "md:flex-row-reverse text-right" : "text-left"}`}>
        <div>
          <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-200 uppercase tracking-wider font-mono">
            {isRtl ? "الخزينة المركزية لتدقيق المطالبات - المؤسسة الوطنية للنفط" : "NOC central financial vault"}
          </span>
          <h1 className={`text-xl md:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            <Receipt className="w-6 h-6 text-purple-700" />
            {isRtl ? "خزينة تدقيق الفواتير ومطابقة الامتثال المالي" : "Invoice Auditing & Compliance Vault"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isRtl 
              ? "مراجعة المطالبات المالية والفوترة التجارية للشركات التابعة، والتحقق المتبادل من معايير الامتثال مع القيمة المكتسبة المعتمدة فنياً، والتفويض المالي السيادي للمعاملات."
              : "Review subsidiary commercial billings, crosscheck compliance metrics with technically certified Earned Value, and authorize sovereign ERP payout transactions."}
          </p>
        </div>
        <div className="shrink-0">
          <button
            onClick={handleResetDemoInvoices}
            className={`bg-purple-900 hover:bg-purple-950 text-white font-extrabold text-[11px] uppercase py-2.5 px-4 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer border border-purple-800 ${isRtl ? "font-sans flex-row-reverse" : ""}`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            {isRtl ? "تحميل فواتير ديمو تجريبية (جميع الشركات)" : "Load Demo Invoices (All Companies)"}
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className={`p-6 bg-slate-50 border-b border-slate-200 shrink-0 grid grid-cols-1 md:grid-cols-3 gap-5 ${isRtl ? "text-right" : "text-left"}`}>
        <div className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-700 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">{isRtl ? "القيمة السيادية الإجمالية المفوترة" : "Sovereign Invoiced Value"}</div>
            <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
              €{totalContractInvoiced.toLocaleString()}
            </div>
            <p className="text-[9px] text-slate-500">{isRtl ? "مجموع كافة المطالبات المالية التجارية المقدمة." : "Aggregate of all submitted commercial claims."}</p>
          </div>
        </div>

        <div className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">{isRtl ? "المدفوعات المعتمدة والمغلقة" : "Paid & Locked Payments"}</div>
            <div className="text-lg font-black text-emerald-600 font-mono mt-0.5">
              €{totalAuthorizedPaid.toLocaleString()}
            </div>
            <p className="text-[9px] text-slate-500">{isRtl ? "المعاملات المالية الموقعة بمفاتيح تفويض مركزية سيادية." : "Transactions signed with central authorization keys."}</p>
          </div>
        </div>

        <div className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-700 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">{isRtl ? "تحت التدقيق المالي المركزي" : "Pending Central Audit"}</div>
            <div className="text-lg font-black text-purple-600 font-mono mt-0.5">
              €{totalPendingAudit.toLocaleString()}
            </div>
            <p className="text-[9px] text-slate-500">{isRtl ? "فواتير جاري فحص مطابقتها الحالية مع نسب الإنجاز." : "Invoices under compliance cross-checks."}</p>
          </div>
        </div>
      </div>

      {/* Split Pane Workspace */}
      <div className={`flex-1 flex overflow-hidden bg-slate-100 ${isRtl ? "flex-row-reverse" : ""}`}>
        
        {/* Left List of Invoices */}
        <div className={`w-96 bg-white flex flex-col shrink-0 ${isRtl ? "border-l border-r-0" : "border-r border-l-0"}`}>
          <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-2.5">
            <div className={`flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
              <h3 className="text-xs font-black text-slate-900 uppercase">
                {isRtl ? `دفتر الفواتير (${filteredInvoices.length})` : `Invoice Ledger (${filteredInvoices.length})`}
              </h3>
              {!isSubsidiary ? (
                <select
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  className="text-[10px] font-bold p-1 border bg-white rounded cursor-pointer"
                >
                  <option value="all">{isRtl ? "جميع الشركات" : "All Companies"}</option>
                  <option value="WAHA">{isRtl ? "شركة الواحة للنفط" : "Waha Oil"}</option>
                  <option value="AGOCO">{isRtl ? "شركة الخليج العربي للنفط" : "AGOCO"}</option>
                  <option value="ZALLAF">{isRtl ? "شركة زلاف ليبيا" : "Zallaf Libya"}</option>
                  <option value="MELLITAH">{isRtl ? "شركة مليتة للغاز" : "Mellitah Gas"}</option>
                </select>
              ) : (
                <span className="text-[10px] bg-purple-50 text-purple-700 font-black px-2 py-1 rounded border border-purple-200">
                  {isRtl ? "الشركة التابعة لك فقط" : `${currentUser.company} Only`}
                </span>
              )}
            </div>

            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 ${isRtl ? "right-2.5" : "left-2.5"}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isRtl ? "البحث برقم الفاتورة أو رمز المشروع..." : "Search invoice #, code..."}
                className={`w-full py-1 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none ${isRtl ? "pr-8 pl-3 text-right" : "pl-8 pr-3 text-left"}`}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 bg-slate-50 space-y-2 text-left">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((claim) => {
                const isSelected = activeInvoiceClaim?.id === claim.id;
                const earnedValue = Math.round((claim.claimedProgress / 100) * claim.numericValue);
                const hasInvoice = !!claim.invoiceNumber;
                return (
                  <div
                    key={claim.id}
                    onClick={() => setSelectedInvoiceId(claim.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? `bg-white border-slate-300 shadow-md ${isRtl ? "border-r-4 border-r-purple-700 border-l-0" : "border-l-4 border-l-purple-700 border-r-0"}`
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 mb-1 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <span>{claim.code}</span>
                      <span className="text-slate-500 uppercase font-sans font-extrabold">{getCompanyTranslation(claim.company)}</span>
                    </div>

                    <h4 className={`text-xs font-black text-slate-900 line-clamp-1 ${isRtl ? "text-right" : "text-left"}`}>{claim.title}</h4>

                    <div className={`flex justify-between items-end border-t border-slate-100 pt-2 mt-2.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <div className={isRtl ? "text-right" : "text-left"}>
                        <div className="text-[8px] text-slate-400 font-bold uppercase">{isRtl ? "قيمة الفاتورة التجارية" : "Commercial Value"}</div>
                        <div className="text-xs font-mono font-black text-slate-900">
                          {hasInvoice ? `€${(claim.invoiceAmount || 0).toLocaleString()}` : (isRtl ? "لم تفوتر بعد" : "Not Invoiced")}
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(claim.status, hasInvoice)}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">{isRtl ? "لم يتم العثور على أي مطالبات تجارية." : "No commercial claims found."}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Active Invoice Compliance Review Workspace */}
        <div className={`flex-1 bg-white flex flex-col overflow-y-auto p-6 ${isRtl ? "text-right" : "text-left"}`}>
          {activeInvoiceClaim ? (
            <div className="max-w-4xl mx-auto w-full space-y-6 text-left">
              
              {/* Header Box */}
              <div className={`bg-slate-900 text-white rounded-xl p-6 shadow-md flex justify-between items-start flex-wrap gap-4 ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
                <div>
                  <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black font-mono px-2 py-0.5 rounded uppercase">
                      {getCompanyTranslation(activeInvoiceClaim.company)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{isRtl ? "رمز الهيكل WBS: " : "WBS: "}{activeInvoiceClaim.wbs}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black mt-2 tracking-tight">
                    {activeInvoiceClaim.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isRtl ? "مقدم من:" : "Submitted by:"} {activeInvoiceClaim.submittedBy} • {isRtl ? "التاريخ:" : "Date:"} {getSubmissionDateTranslation(activeInvoiceClaim.submissionDate)}
                  </p>
                </div>

                <div className={isRtl ? "text-left" : "text-right"}>
                  <span className="text-[10px] text-slate-400 font-bold block">{isRtl ? "ميزانية المرحلة الحالية" : "Current Phase Budget"}</span>
                  <div className="text-2xl font-black font-mono text-amber-400">{activeInvoiceClaim.claimedValue}</div>
                </div>
              </div>

              {/* Invoicing State Review Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Visual Earned Value Check card */}
                <div className={`bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4 ${isRtl ? "text-right" : "text-left"}`}>
                  <h3 className={`text-xs font-black text-slate-900 border-b pb-2 flex items-center gap-1 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <Coins className="w-4 h-4 text-purple-700" />
                    {isRtl ? "حدود الفاتورة القانونية بالقيمة المكتسبة" : "EVM Legal Invoice Limits"}
                  </h3>

                  <div className={`grid grid-cols-2 gap-4 ${isRtl ? "text-right" : "text-left"}`}>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{isRtl ? "نسبة الإنجاز المعتمدة" : "Certified Progress"}</div>
                      <div className="text-lg font-black text-slate-900 font-mono mt-0.5">{activeInvoiceClaim.claimedProgress.toFixed(1)}%</div>
                      <p className="text-[9px] text-slate-500">{isRtl ? "تمت الموافقة الرسمية من قبل مدققي الـ PMO" : "Formally approved by NOC PMO Auditors."}</p>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{isRtl ? "القيمة المكتسبة (الحد الأقصى)" : "Earned Value (EV Limit)"}</div>
                      <div className="text-lg font-black text-emerald-600 font-mono mt-0.5">
                        €{Math.round((activeInvoiceClaim.claimedProgress / 100) * activeInvoiceClaim.numericValue).toLocaleString()}
                      </div>
                      <p className="text-[9px] text-slate-500">{isRtl ? "أقصى قيمة مسموح بها للفاتورة التجارية في هذه الدورة." : "Maximum allowed commercial invoice value."}</p>
                    </div>
                  </div>

                  {activeInvoiceClaim.invoiceNumber ? (
                    <div className="p-3 bg-slate-50 rounded-lg border">
                      <div className={`flex justify-between items-center text-xs ${isRtl ? "flex-row-reverse" : ""}`}>
                        <span className="text-slate-500 font-semibold">{isRtl ? "رقم الفاتورة المقدمة:" : "Submitted Invoice ID:"}</span>
                        <span className="font-mono font-bold text-slate-900">{activeInvoiceClaim.invoiceNumber}</span>
                      </div>
                      <div className={`flex justify-between items-center text-xs mt-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                        <span className="text-slate-500 font-semibold">{isRtl ? "قيمة الفاتورة المقدمة:" : "Submitted Invoice Value:"}</span>
                        <span className="font-mono font-bold text-slate-900">€{(activeInvoiceClaim.invoiceAmount || 0).toLocaleString()}</span>
                      </div>
                      
                      {/* Overrun Audit Calculation */}
                      <div className={`border-t border-dashed border-slate-200 mt-2 pt-2 flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
                        <span className="text-[10px] text-slate-400 font-bold">{isRtl ? "مخاطر تجاوز التكاليف المعتمدة:" : "Overrun Variance Risk:"}</span>
                        {((activeInvoiceClaim.invoiceAmount || 0) <= (activeInvoiceClaim.claimedProgress / 100) * activeInvoiceClaim.numericValue) ? (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase font-sans">
                            {isRtl ? "✓ متوافق تماماً (لا يوجد تجاوز)" : "✓ Compliant (Zero Overrun)"}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase animate-pulse font-sans">
                            {isRtl ? "⚠️ تم حظر تجاوز القيمة!" : "⚠️ Overrun Blocked"}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 text-slate-800 text-xs text-left space-y-4">
                      <div className={`font-bold flex items-center gap-1.5 text-amber-950 border-b border-amber-200 pb-2 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                        {isRtl ? "لا توجد فاتورة تجارية مسجلة حالياً" : "No Commercial Invoice Registered"}
                      </div>
                      
                      <div className="space-y-3">
                        <div className={isRtl ? "text-right" : "text-left"}>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                            {isRtl ? "الرقم المرجعي للفاتورة" : "Invoice Reference ID"}
                          </label>
                          <input
                            type="text"
                            value={inputInvoiceNo}
                            onChange={(e) => setInputInvoiceNo(e.target.value)}
                            placeholder="e.g. INV-WAHA-24-109"
                            className={`w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none ${isRtl ? "text-right" : "text-left"}`}
                          />
                        </div>

                        <div className={isRtl ? "text-right" : "text-left"}>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                            {isRtl ? "قيمة المطالبة والفوترة باليورو" : "Billing Amount (EUR)"}
                          </label>
                          <div className="relative">
                            <span className={`absolute top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono ${isRtl ? "right-3" : "left-3"}`}>€</span>
                            <input
                              type="number"
                              value={inputInvoiceAmount}
                              onChange={(e) => setInputInvoiceAmount(e.target.value === "" ? "" : Number(e.target.value))}
                              className={`w-full py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none ${isRtl ? "pr-7 pl-3 text-right" : "pl-7 pr-3 text-left"}`}
                            />
                          </div>
                          
                          {/* Real-time EV limit and overrun warning */}
                          {inputInvoiceAmount !== "" && (
                            <div className={`mt-1.5 flex items-center justify-between text-[10px] ${isRtl ? "flex-row-reverse" : ""}`}>
                              <span className="text-slate-500 font-semibold">
                                {isRtl ? "الحد الأقصى المسموح به:" : "EV Limit:"} <strong className="font-mono text-slate-700">€{Math.round((activeInvoiceClaim.claimedProgress / 100) * activeInvoiceClaim.numericValue).toLocaleString()}</strong>
                              </span>
                              {Number(inputInvoiceAmount) <= (activeInvoiceClaim.claimedProgress / 100) * activeInvoiceClaim.numericValue ? (
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-bold">
                                  {isRtl ? "✓ ضمن نطاق القيمة المكتسبة" : "✓ Within EV Limit"}
                                </span>
                              ) : (
                                <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 font-black animate-pulse">
                                  {isRtl ? "⚠️ تم تجاوز الحد الفني" : "⚠️ Overrun Blocked"}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!inputInvoiceNo) {
                            showToast(isRtl ? "يرجى إدخال الرقم المرجعي للفاتورة." : "Please enter an Invoice Reference ID.", "error");
                            return;
                          }
                          if (!inputInvoiceAmount || Number(inputInvoiceAmount) <= 0) {
                            showToast(isRtl ? "يرجى إدخال مبلغ صالح للمطالبة." : "Please enter a valid billing amount.", "error");
                            return;
                          }
                          const evLimit = (activeInvoiceClaim.claimedProgress / 100) * activeInvoiceClaim.numericValue;
                          if (Number(inputInvoiceAmount) > evLimit) {
                            showToast(isRtl ? `تتجاوز قيمة الفاتورة قيمة الإنجاز الفني المعتمدة البالغة €${Math.round(evLimit).toLocaleString()}!` : `Invoice exceeds technically certified Earned Value limit of €${Math.round(evLimit).toLocaleString()}!`, "error");
                            return;
                          }
                          setConfirmModalType("release_invoice");
                          setConfirmChecked(false);
                          setShowConfirmModal(true);
                        }}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] uppercase py-2.5 px-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:shadow font-sans"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        {isRtl ? "تقديم وتسجيل الفاتورة التجارية للمؤسسة" : "Release Commercial Invoice to NOC"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Secure Payment Release Area */}
                <div className={`bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between ${isRtl ? "text-right" : "text-left"}`}>
                  <div>
                    <h3 className={`text-xs font-black text-slate-900 border-b pb-2 flex items-center gap-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
                      <Lock className="w-4 h-4 text-purple-700" />
                      {isRtl ? "المفوض المركزي لصرف الدفعات (ERP)" : "Central ERP Payout Authorizer"}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {isRtl 
                        ? "نظام المصادقة السيادي لدفتر الحسابات. يطابق التفويض الفواتير التجارية بالأدلة الميدانية الموثقة هندسياً بشكل آمن بضوابط متعددة المستويات."
                        : "Sovereign ledger authentication. Authorizing matches commercial billings to physical on-site evidence securely with multi-level controls."}
                    </p>
                  </div>

                  <div className="mt-4 pt-3">
                    {activeInvoiceClaim.status === "authorized_for_payment" ? (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1 text-left">
                        <div className={`text-xs font-black text-emerald-900 flex items-center gap-1 ${isRtl ? "flex-row-reverse" : ""}`}>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          {isRtl ? "تم توقيع وتفويض المعاملة في الـ ERP" : "ERP Authorized Token Signed"}
                        </div>
                        <p className="text-[10px] font-mono font-bold text-slate-500 select-all bg-white p-1 border rounded truncate uppercase mt-1 text-center">
                          {activeInvoiceClaim.paymentToken}
                        </p>
                      </div>
                    ) : activeInvoiceClaim.status === "pending_financial_audit" ? (
                      <div className="space-y-2">
                        {activeRole === "noc_finance" ? (
                          <button
                            onClick={() => {
                              setForm3Checked(false);
                              setShowForm3Modal(true);
                            }}
                            className="w-full bg-purple-900 hover:bg-purple-950 text-white font-black text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow hover:shadow-md font-sans"
                          >
                            <Lock className="w-4 h-4 text-amber-300" />
                            {isRtl ? "إنشاء وتفويض الدفع - نموذج 3" : "Generate Payment Authorization - Form 3"}
                          </button>
                        ) : (
                          <div className="p-3 bg-slate-50 text-center border rounded-lg text-slate-500 text-xs font-semibold leading-normal">
                            ⏱ {isRtl ? "تم تسجيل الفاتورة. بانتظار فحص الامتثال من قبل المراجع المالي للمؤسسة الوطنية للنفط (أ. عبد الرحمن بوفرديس)." : "Invoice submitted. Awaiting Mr. Abdelrahman Boufardis (NOC Finance Auditor) to verify compliance."}
                          </div>
                        )}
                      </div>
                    ) : activeInvoiceClaim.status === "pending_head_of_accounts_approval" ? (
                      <div className="space-y-2">
                        {activeRole === "noc_head_of_accounts" ? (
                          <button
                            onClick={() => {
                              setForm3Checked(false);
                              setShowForm3Modal(true);
                            }}
                            className="w-full bg-fuchsia-950 hover:bg-fuchsia-900 text-white font-black text-xs py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow hover:shadow-md animate-pulse font-sans"
                          >
                            <Lock className="w-4 h-4 text-amber-300" />
                            {isRtl ? "توقيع وتفويض الدفع - نموذج 3" : "Sign Payment Authorization - Form 3"}
                          </button>
                        ) : (
                          <div className="p-3.5 bg-fuchsia-50/70 border border-fuchsia-200 text-center rounded-lg text-fuchsia-800 text-xs font-semibold leading-normal">
                            ⏱ {isRtl ? "تمت الموافقة المبدئية من قبل إدارة التدقيق. بانتظار توقيع مديرة الحسابات بالمؤسسة (أ. سلمى الهاشمي) للإذن النهائي بالصرف." : "Pre-approved by Central Finance. Awaiting Mrs. Salma Al-Hashemi (NOC Head of Accounts) to sign and release."}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-400 text-xs italic text-center py-4 bg-slate-50 rounded-lg border border-dashed">
                        {isRtl ? "في انتظار استكمال الفحص الفني الميداني للـ PMO ورفع الفاتورة للمطابقة..." : "Waiting for technical PMO validation clearance & invoice filing..."}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Attached Evidence Files in Vault */}
              <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm ${isRtl ? "text-right" : "text-left"}`}>
                <h3 className={`text-xs font-black text-slate-900 mb-3 border-b pb-2 flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
                  <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>{isRtl ? `ملفات ومستندات الإثبات والفواتير الموقعة (${activeInvoiceClaim.documents.length})` : `Signed Evidence & Invoice Files (${activeInvoiceClaim.documents.length})`}</span>
                  </div>
                  
                  {(currentUser?.role === "subsidiary_pm" || currentUser?.role === "subsidiary_finance") && activeInvoiceClaim.companyId === currentUser?.companyId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const target = activeInvoiceClaim;
                        if (target.documents.some((d: any) => d.name.startsWith("Form_2_Certificate_Of_Conformity"))) {
                          showToast(isRtl ? "تم إصدار نموذج 2 مسبقاً لهذه المطالبة" : "Form 2 has already been generated for this claim.", "error");
                          return;
                        }
                        setTargetForm2Claim(target);
                        setShowForm2Modal(true);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <FileText className="w-3 h-3" />
                      {isRtl ? "إصدار نموذج 2" : "Generate Form 2"}
                    </button>
                  )}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeInvoiceClaim.documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setPreviewDoc(doc)}
                      className={`border rounded-lg p-3 flex items-center gap-3 bg-slate-50 hover:border-purple-500 cursor-pointer transition-colors ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}
                    >
                      <div className={`w-10 h-10 flex items-center justify-center rounded-lg text-xs font-bold shrink-0 ${
                        doc.type === "PDF" ? "bg-red-50 text-red-800 border" : "bg-emerald-50 text-emerald-800 border"
                      }`}>
                        {doc.type}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">{doc.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-bold">{doc.size} • {isRtl ? "موثق معتمد" : "Verified"}</div>
                      </div>
                      <Eye className="w-4 h-4 text-slate-400 hover:text-purple-700 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction compliance ledger journal */}
              <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm ${isRtl ? "text-right" : "text-left"}`}>
                <h3 className="text-xs font-black text-slate-900 mb-3 border-b pb-2">
                  {isRtl ? "مسار تدقيق الامتثال التاريخي (سجل الفترات الموثق)" : "Compliance Audit Trail (Filing Journal)"}
                </h3>
                <div className="space-y-3">
                  {activeInvoiceClaim.auditLog.map((log) => (
                    <div key={log.id} className={`text-xs flex items-start gap-3 border-slate-200 ${isRtl ? "border-r-2 pr-3 border-l-0" : "border-l-2 pl-3 border-r-0"}`}>
                      <div className="bg-slate-100 rounded-full px-2 py-0.5 font-mono text-[9px] text-slate-500 font-bold uppercase shrink-0">
                        {log.action}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{log.change}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{log.user} • {log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <AlertCircle className="w-12 h-12 text-slate-300 mb-2" />
              <h3 className="text-xs font-bold">{isRtl ? "يرجى تحديد أو تقديم فاتورة من القائمة للمراجعة وتدقيق الامتثال المالي." : "Please select or submit an invoice to proceed compliance review."}</h3>
            </div>
          )}
        </div>

      </div>

      {/* Dynamic Sovereign Authorization Confirmation Modal */}
      {showConfirmModal && activeInvoiceClaim && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all" dir={isRtl ? "rtl" : "ltr"}>
          <div className={`bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 ${isRtl ? "text-right" : "text-left"}`}>
            {/* Modal Header */}
            <div className={`p-5 text-white ${
              confirmModalType === "release_invoice"
                ? "bg-amber-600"
                : confirmModalType === "pre_approve"
                ? "bg-purple-900"
                : "bg-fuchsia-950"
            } flex items-center gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
              <div className="p-2 bg-white/10 rounded-lg">
                <Lock className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide">
                  {confirmModalType === "release_invoice"
                    ? (isRtl ? "تسجيل وتقديم الفاتورة للمؤسسة" : "Release Commercial Invoice to NOC")
                    : confirmModalType === "pre_approve" 
                    ? (isRtl ? "التحقق المبدئي من امتثال الفاتورة" : "Verify Compliance Ledger") 
                    : (isRtl ? "توقيع التفويض وإرسال الدفعة في الـ ERP" : "Authorize Sovereign Fund Release")}
                </h3>
                <p className="text-[10px] text-slate-300 font-medium">{isRtl ? "بوابة تفويض الدفعات وسجل المطالبات - المؤسسة الوطنية للنفط" : "NOC Central Ledger Authorization Gateway"}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border p-4 rounded-xl space-y-2 text-xs">
                <div className={`flex justify-between items-center border-b pb-2 mb-1 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <span className="text-slate-500 font-semibold">{isRtl ? "رمز واسم المشروع:" : "Project Code / Title:"}</span>
                  <span className="font-bold text-slate-900 max-w-[200px] truncate">{activeInvoiceClaim.code} - {activeInvoiceClaim.title}</span>
                </div>
                <div className={`flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
                  <span className="text-slate-500 font-semibold">{isRtl ? "الشركة التابعة المشغلة:" : "Operating Subsidiary:"}</span>
                  <span className="font-extrabold text-amber-700 font-mono uppercase">{getCompanyTranslation(activeInvoiceClaim.company)}</span>
                </div>
                <div className={`flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
                  <span className="text-slate-500 font-semibold">{isRtl ? "عنصر هيكل تقسيم العمل (WBS):" : "Contract WBS Segment:"}</span>
                  <span className="font-mono font-bold text-slate-800">{activeInvoiceClaim.wbs}</span>
                </div>
                <div className={`flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
                  <span className="text-slate-500 font-semibold">{isRtl ? "نسبة الإنجاز المعتمدة:" : "Certified progress:"}</span>
                  <span className="font-bold text-slate-900 font-mono">{activeInvoiceClaim.claimedProgress.toFixed(1)}%</span>
                </div>
                <div className={`flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
                  <span className="text-slate-500 font-semibold">{isRtl ? "الحد الأقصى للقيمة المكتسبة:" : "Earned Value Limit:"}</span>
                  <span className="font-mono font-bold text-emerald-600">€{Math.round((activeInvoiceClaim.claimedProgress / 100) * activeInvoiceClaim.numericValue).toLocaleString()}</span>
                </div>
                <div className={`flex justify-between items-center pt-2 border-t border-dashed mt-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <span className="text-slate-900 font-black">{isRtl ? "القيمة المالية المطلوبة للفوترة:" : "Invoice Billing Amount:"}</span>
                  <span className={`font-mono text-sm font-black ${
                    confirmModalType === "release_invoice"
                      ? "text-amber-700"
                      : confirmModalType === "pre_approve"
                      ? "text-purple-700"
                      : "text-fuchsia-700"
                  }`}>
                    €{(confirmModalType === "release_invoice" ? Number(inputInvoiceAmount) || 0 : activeInvoiceClaim.invoiceAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Warning / Certification checklist */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{isRtl ? "شهادات الامتثال والتحقق المطلوبة:" : "Required Compliance Attestations:"}</h4>
                <div className="space-y-2">
                  {confirmModalType === "release_invoice" ? (
                    <>
                      <div className={`flex items-start gap-2 text-[11px] text-slate-600 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{isRtl ? <>أؤكد أن الرقم المرجعي <strong>{inputInvoiceNo}</strong> مسجل في النظام المالي الرسمي للشركة.</> : <>I confirm that the reference ID <strong>{inputInvoiceNo}</strong> is registered on our official ERP system.</>}</span>
                      </div>
                      <div className={`flex items-start gap-2 text-[11px] text-slate-600 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{isRtl ? <>أشهد بأن قيمة المطالبة <strong>€{(Number(inputInvoiceAmount) || 0).toLocaleString()}</strong> لا تتعدى القيمة المكتسبة المقابلة للإنجاز الفني المعتمد.</> : <>I certify that this commercial billing of <strong>€{(Number(inputInvoiceAmount) || 0).toLocaleString()}</strong> is within the technically certified EV Limit.</>}</span>
                      </div>
                      <div className={`flex items-start gap-2 text-[11px] text-slate-600 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{isRtl ? "أؤكد إرفاق جميع التقارير الهندسية والفنية المطلوبة لهذه الدورة بالكامل." : "I verify that all required geotechnical and physical project milestones reports are attached to this cycle."}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`flex items-start gap-2 text-[11px] text-slate-600 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{isRtl ? <>أؤكد تطابق نسبة الإنجاز الفني للـ PMO البالغة <strong>{activeInvoiceClaim.claimedProgress.toFixed(1)}%</strong> مع منجزات الإنجاز الميدانية الحقيقية.</> : <>I confirm that technical PMO progress certification of <strong>{activeInvoiceClaim.claimedProgress.toFixed(1)}%</strong> matches real physical deliverables.</>}</span>
                      </div>
                      <div className={`flex items-start gap-2 text-[11px] text-slate-600 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{isRtl ? "تم التحقق الكامل من انعدام أي تجاوز مالي لقيمة الفاتورة بالمقارنة مع القيمة المكتسبة الفنية." : "Variance between commercial billings and Earned Value limit is verified and is strictly zero overrun."}</span>
                      </div>
                      {confirmModalType === "final_release" && (
                        <div className={`flex items-start gap-2 text-[11px] text-slate-600 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{isRtl ? "تمت مراجعة واعتماد الفاتورة مبدئياً من قبل المراجع المالي للمؤسسة أ. عبد الرحمن بوفرديس بمسار الامتثال التاريخي." : "This payment is pre-approved by Mr. Abdelrahman Boufardis (NOC Financial Auditor) on the sovereign audit journal."}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Mandatory Solemn oath */}
              <div className="pt-2 border-t">
                <label className={`flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100/50 transition-colors ${isRtl ? "flex-row-reverse" : ""}`}>
                  <input
                    type="checkbox"
                    checked={confirmChecked}
                    onChange={(e) => setConfirmChecked(e.target.checked)}
                    className="mt-1 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer h-4 w-4 shrink-0"
                  />
                  <span className={`text-[11px] text-amber-900 font-medium select-none ${isRtl ? "text-right pr-1" : ""}`}>
                    {confirmModalType === "release_invoice"
                      ? (isRtl ? "أقر رسمياً وبشكل رسمي بأن هذه الفاتورة التجارية مطابقة تماماً لشروط الاتفاق والتعاقد ولنسبة الإنجاز الفني الفعلي المعتمد، وأطلب تسجيلها رسمياً بالخزينة لتدقيقها." : "I officially attest that this commercial invoice is fully compliant with the contract, matches certified progress, and I request its formal submission to the National Oil Corporation central audit.")
                      : (isRtl ? "أقر رسمياً وبشكل معتمد بأني قد قمت بفحص ومراجعة ملف المعاملة بالكامل ومطابقة الوثائق الفنية والامتثال المالي، وبأنني أصادق وأفوض بصرف الدفعة رسمياً في النظام." : "I officially attest that I have reviewed the billing dossier, and I authorize this transaction on the sovereign National Oil Corporation ledger.")}
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className={`bg-slate-50 px-6 py-4 flex items-center gap-3 border-t ${isRtl ? "justify-start flex-row-reverse" : "justify-end"}`}>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmChecked(false);
                }}
                className="px-4 py-2 border rounded-lg text-slate-500 hover:bg-slate-100 font-black text-xs uppercase cursor-pointer transition-colors font-sans"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>

              <button
                onClick={() => {
                  if (!confirmChecked) return;
                  setShowConfirmModal(false);
                  if (confirmModalType === "release_invoice") {
                    handleReleaseInvoice(activeInvoiceClaim.id, inputInvoiceNo, Number(inputInvoiceAmount));
                  } else if (confirmModalType === "pre_approve") {
                    handlePreApproveInvoice(activeInvoiceClaim.id);
                  } else {
                    handleReleasePayment(activeInvoiceClaim.id);
                  }
                }}
                disabled={!confirmChecked}
                className={`px-5 py-2 rounded-lg text-white font-black text-xs uppercase flex items-center gap-1.5 transition-all ${
                  confirmChecked 
                    ? confirmModalType === "release_invoice"
                      ? "bg-amber-600 hover:bg-amber-700 cursor-pointer shadow"
                      : confirmModalType === "pre_approve"
                      ? "bg-purple-900 hover:bg-purple-950 cursor-pointer shadow animate-none"
                      : "bg-fuchsia-900 hover:bg-fuchsia-950 cursor-pointer shadow animate-none"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                } font-sans`}
              >
                <Lock className="w-4 h-4" />
                {confirmModalType === "release_invoice"
                  ? (isRtl ? "تصديق وتقديم الفاتورة" : "Attest & Release Invoice")
                  : confirmModalType === "pre_approve"
                  ? (isRtl ? "مراجعة ومصادقة مسبقة" : "Attest & Pre-Approve")
                  : (isRtl ? "توقيع وصرف المعاملة" : "Attest & Release Payment")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form 3: Payment Authorization Preview Modal */}
      {showForm3Modal && activeInvoiceClaim && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all" dir={isRtl ? "rtl" : "ltr"}>
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className={`p-4 text-white ${
              activeInvoiceClaim.status === "pending_financial_audit" ? "bg-purple-900" : "bg-fuchsia-950"
            } flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide">
                    {isRtl ? "معاينة نموذج تعزيز وإذن الدفع (نموذج 3)" : "Payment Authorization Preview - Form 3"}
                  </h3>
                  <p className="text-[9px] text-slate-300 font-medium">
                    {isRtl ? "لجنة مراقبة ومتابعة خطة زيادة القدرة الإنتاجية" : "NOC Production Capacity Increase Committee"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowForm3Modal(false)}
                className="text-white hover:text-slate-200 text-sm font-black"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Scrollable Form Preview */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
              <PaymentAuthorizationForm 
                claim={activeInvoiceClaim} 
                lcData={INITIAL_LC_DATA.find(lc => lc.companyId === activeInvoiceClaim.companyId) || INITIAL_LC_DATA[0]}
                isRtl={isRtl}
              />
            </div>

            {/* Modal Footer Attestation & Actions */}
            <div className="p-5 bg-white border-t space-y-4">
              <label className={`flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100/50 transition-colors ${isRtl ? "flex-row-reverse" : ""}`}>
                <input
                  type="checkbox"
                  checked={form3Checked}
                  onChange={(e) => setForm3Checked(e.target.checked)}
                  className="mt-1 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer h-4 w-4 shrink-0"
                />
                <span className={`text-[11px] text-amber-900 font-medium select-none ${isRtl ? "text-right pr-1" : ""}`}>
                  {activeInvoiceClaim.status === "pending_financial_audit" 
                    ? (isRtl 
                      ? "بصفتي مديراً للإدارة العامة للمالية بالمؤسسة الوطنية للنفط، أقر بصحة ودقة مراجعة المطابقة للامتثال المالي للفاتورة مع معايير القيمة المكتسبة المقابلة للإنجاز الفني الفعلي المعتمد، وأصادق مبدئياً على تفويض الدفع للجنة المتابعة."
                      : "As the Director of the General Finance Department (NOC), I officially attest to the compliance check of this commercial invoice against physical Earned Value milestones, and pre-approve this payment authorization Form 3.")
                    : (isRtl 
                      ? "بصفتي رئيس الحسابات العام للمؤسسة الوطنية للنفط، أقر بالاعتماد النهائي وصرف الدفعة المالية السيادية من مخصصات خطة المشغل، وأفوض بتسييل الأموال وإرسال المعاملة للمنظومة المالية المركزية."
                      : "As the NOC Head of Accounts, I officially attest to the final release approval of these sovereign funds, and authorize the final release of this payment in the central ERP ledger.")
                  }
                </span>
              </label>

              <div className={`flex items-center gap-3 ${isRtl ? "justify-start flex-row-reverse" : "justify-end"}`}>
                <button
                  onClick={() => setShowForm3Modal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-500 hover:bg-slate-100 font-black text-xs uppercase cursor-pointer transition-colors"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>

                <button
                  onClick={() => {
                    if (!form3Checked) return;
                    setShowForm3Modal(false);
                    
                    if (activeInvoiceClaim.status === "pending_financial_audit") {
                      // Pre-Approve Flow (NOC Finance Auditor generates Form 3)
                      const invoiceNo = activeInvoiceClaim.invoiceNumber || `INV-${activeInvoiceClaim.code}`;
                      
                      const newDoc: Document = {
                        id: `doc-form3-${Date.now()}`,
                        name: `Form_3_Payment_Authorization_${invoiceNo}.pdf`,
                        size: "1.4 MB",
                        uploadedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                        type: "PDF",
                        url: `/noc_vault/evidence/Form_3_Payment_Authorization_${invoiceNo}.pdf`
                      };

                      const newLog: AuditLogEntry = {
                        id: `log-${Date.now()}`,
                        user: currentUser?.name || "Mr. Abdelrahman Boufardis",
                        action: isRtl ? "إنشاء تفويض الدفع 3" : "Generate Form 3 Auth",
                        change: isRtl
                          ? `تم إنشاء وتوقيع نموذج تفويض وصرف الدفع (نموذج 3) بنجاح. وحفظه بالكامل في مستندات الإثبات كمرجع معتمد للجنة.`
                          : `Form 3: Payment Authorization & LC Enhancement generated and signed by Director of Finance. Saved inside Signed Evidence files.`,
                        timestamp: new Date().toLocaleString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })
                      };

                      const updated = claims.map(c => {
                        if (c.id === activeInvoiceClaim.id) {
                          return {
                            ...c,
                            status: "pending_head_of_accounts_approval" as const,
                            form3Generated: true,
                            form3SignedByFinance: currentUser?.name || "Mr. Abdelrahman Boufardis",
                            documents: [newDoc, ...c.documents],
                            auditLog: [newLog, ...c.auditLog]
                          };
                        }
                        return c;
                      });

                      setClaims(updated);
                      setMakeChangesState(updated);
                      showToast(isRtl 
                        ? "تم إنشاء وتوقيع نموذج تفويض الدفع (نموذج 3) بنجاح! في انتظار توقيع رئيس اللجنة للصرف." 
                        : "Form 3 Payment Authorization successfully generated and signed! Awaiting Chairman signature to release.", 
                        "success"
                      );
                      if (addNotification) {
                        addNotification(
                          isRtl ? "تنبيه: بانتظار توقيع تفويض الصرف (نموذج 3)" : "Action Required: Form 3 Payment Authorization Sign-off Needed",
                          isRtl 
                            ? `تم إنشاء وتوقيع تفويض الصرف (نموذج 3) من قبل الإدارة المالية للمطالبة ${activeInvoiceClaim.code}. يرجى توقيع رئيس اللجنة النهائي.`
                            : `Form 3 generated and signed by Director of Finance for claim ${activeInvoiceClaim.code}. Awaiting Committee Chairman signature.`,
                          "warning",
                          activeInvoiceClaim.id,
                          "invoices",
                          undefined,
                          activeInvoiceClaim.companyId,
                          true,
                          "high"
                        );
                      }
                    } else {
                      // Final Release Flow (NOC Head of Accounts signs Form 3)
                      const secureToken = `NOC-AUTH-${currentUser?.companyId || "HQ"}-${Math.floor(1000 + Math.random() * 9000)}-${activeInvoiceClaim.id.substring(activeInvoiceClaim.id.lastIndexOf("-") + 1)}`;
                      
                      const newLog: AuditLogEntry = {
                        id: `log-${Date.now()}`,
                        user: currentUser?.name || "Mrs. Salma Al-Hashemi",
                        action: isRtl ? "اعتماد وصرف الدفعة" : "Approve & Payout Form 3",
                        change: isRtl
                          ? `تم توقيع إذن وتفويض الدفع نموذج 3 كلياً من رئيس اللجنة. الرمز المالي المركزي المعتمد: ${secureToken}`
                          : `Form 3: Payment Authorization fully signed by Committee Chairman. Secure central ERP payout token generated: ${secureToken}`,
                        timestamp: new Date().toLocaleString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                        })
                      };

                      const updated = claims.map(c => {
                        if (c.id === activeInvoiceClaim.id) {
                          return {
                            ...c,
                            status: "authorized_for_payment" as const,
                            form3SignedByChairman: currentUser?.name || "Mrs. Salma Al-Hashemi",
                            paymentToken: secureToken,
                            auditLog: [newLog, ...c.auditLog]
                          };
                        }
                        return c;
                      });

                      setClaims(updated);
                      setMakeChangesState(updated);
                      showToast(isRtl 
                        ? "تم توقيع نموذج تفويض الدفع كلياً وتسييل الأموال للمستفيد بنجاح!" 
                        : "Form 3 fully signed and payment released to beneficiary successfully!", 
                        "success"
                      );
                      if (addNotification) {
                        addNotification(
                          isRtl ? "تم صرف وتسييل الأموال السيادية" : "Sovereign Funds Successfully Released",
                          isRtl 
                            ? `تم اعتماد وتوقيع نموذج تفويض الدفع كلياً من رئيس اللجنة للمطالبة ${activeInvoiceClaim.code}. رمز الدفع المولد: ${secureToken}`
                            : `Form 3 fully signed by Committee Chairman for claim ${activeInvoiceClaim.code}. Secure ERP Payment Token generated: ${secureToken}`,
                          "success",
                          activeInvoiceClaim.id,
                          "invoices",
                          undefined,
                          activeInvoiceClaim.companyId
                        );
                      }
                    }
                  }}
                  disabled={!form3Checked}
                  className={`px-5 py-2 rounded-lg text-white font-black text-xs uppercase flex items-center gap-1.5 transition-all ${
                    form3Checked
                      ? activeInvoiceClaim.status === "pending_financial_audit"
                        ? "bg-purple-900 hover:bg-purple-950 cursor-pointer shadow"
                        : "bg-fuchsia-900 hover:bg-fuchsia-950 cursor-pointer shadow"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  {activeInvoiceClaim.status === "pending_financial_audit"
                    ? (isRtl ? "توقيع واعتماد مبدئي" : "Sign & Pre-Approve")
                    : (isRtl ? "توقيع وصرف تفويض الدفع" : "Sign & Release Payout")
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form 2 Generation Modal */}
      <Form2GenerationModal 
        isOpen={showForm2Modal}
        onClose={() => setShowForm2Modal(false)}
        isRtl={isRtl}
        isDark={false}
        onGenerate={() => {
          if (targetForm2Claim) {
            const newDoc = {
              id: `doc-form2-${Date.now()}`,
              name: `Form_2_Certificate_Of_Conformity_${targetForm2Claim.code}.pdf`,
              size: "1.5 MB",
              uploadedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              type: "PDF",
              url: `/noc_vault/evidence/Form_2_Certificate_Of_Conformity_${targetForm2Claim.code}.pdf`
            };
            const updated = claims.map(c => {
              if (c.id === targetForm2Claim.id) {
                return { ...c, documents: [newDoc as any, ...c.documents] };
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
