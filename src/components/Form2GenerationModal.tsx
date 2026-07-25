import React, { useState } from 'react';
import { X, Upload, CheckCircle2, FileText, AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Form2Attachment, Form2AttachmentCategory } from '../types';

interface Form2GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (attachments?: Form2Attachment[]) => void;
  isRtl: boolean;
  isDark: boolean;
  claimCode?: string;
}

const DEMO_PDF_DATA_URI = "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDAKL1R5cGUgL1BhZ2VzCi9Db3VudCAxCi9LaWRzIFsgMyAwIFIgXQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9SZXNvdXJjZXMgPDw+PgovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDAKL0xlbmd0aCA1NQo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQKKE5PQyBGb3JtIDIgRGVtbyBBdHRhY2htZW50KSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDIxNCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjMyMAolJUVPRg==";

export function Form2GenerationModal({ isOpen, onClose, onGenerate, isRtl, isDark, claimCode = "FORM2" }: Form2GenerationModalProps) {
  const [fileDetails, setFileDetails] = useState<Record<string, { fileName: string; fileSize: string; url: string }>>({
    lading:  { fileName: `bill_of_lading_${claimCode}.pdf`,               fileSize: "2.1 MB", url: DEMO_PDF_DATA_URI },
    receipt: { fileName: `site_receiving_report_${claimCode}.pdf`,         fileSize: "1.8 MB", url: DEMO_PDF_DATA_URI },
    invoice: { fileName: `contractor_invoice_${claimCode}.pdf`,            fileSize: "1.4 MB", url: DEMO_PDF_DATA_URI },
    report:  { fileName: `technical_compliance_report_${claimCode}.pdf`,  fileSize: "3.2 MB", url: DEMO_PDF_DATA_URI },
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const mandatoryAttachmentKeys: Array<'lading' | 'receipt' | 'invoice' | 'report'> = ['lading', 'receipt', 'invoice', 'report'];
  const isForm2Submittable = mandatoryAttachmentKeys.every(key => Boolean(fileDetails[key]?.fileName));

  const requirements: Array<{
    id: 'lading' | 'receipt' | 'invoice' | 'report';
    category: Form2AttachmentCategory;
    titleAr: string;
    titleEn: string;
    defaultFileName: string;
  }> = [
    {
      id: 'lading',
      category: 'bill_of_lading',
      titleAr: "1. نسخة من بوليصة الشحن",
      titleEn: "1. Copy of Bill of Lading",
      defaultFileName: `bill_of_lading_demo.pdf`,
    },
    {
      id: 'receipt',
      category: 'site_receipt',
      titleAr: "2. محضر استلام موقع من المهندس المشرف",
      titleEn: "2. Site Receiving Report Signed by Supervising Engineer",
      defaultFileName: `site_receiving_report_demo.pdf`,
    },
    {
      id: 'invoice',
      category: 'contractor_invoice',
      titleAr: "3. فاتورة المقاول الأصلية المعتمدة",
      titleEn: "3. Approved Original Contractor Invoice",
      defaultFileName: `contractor_invoice_demo.pdf`,
    },
    {
      id: 'report',
      category: 'technical_report',
      titleAr: "4. تقرير فني يثبت التوافق مع أهداف 2026",
      titleEn: "4. Technical Compliance Report 2026",
      defaultFileName: `technical_compliance_report_demo.pdf`,
    }
  ];

  const handleFileUpload = (id: string, defaultName: string, e?: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    const fileName = file ? file.name : defaultName;
    const fileSize = file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : "1.8 MB";
    const url = file ? URL.createObjectURL(file) : DEMO_PDF_DATA_URI;

    setFileDetails(prev => ({
      ...prev,
      [id]: { fileName, fileSize, url }
    }));
    setValidationError(null);
  };

  const handleAttachAllSamples = () => {
    requirements.forEach(req => {
      handleFileUpload(req.id, req.defaultFileName);
    });
  };

  const handleClearAll = () => {
    setFileDetails({
      lading: { fileName: "", fileSize: "", url: "" },
      receipt: { fileName: "", fileSize: "", url: "" },
      invoice: { fileName: "", fileSize: "", url: "" },
      report: { fileName: "", fileSize: "", url: "" },
    });
    setValidationError(null);
  };

  const handleForm2Submission = () => {
    if (!isForm2Submittable) {
      setValidationError(
        isRtl 
          ? "خطأ: يجب إرفاق جميع المستندات الإلزامية الأربعة قبل اعتماد نموذج 2."
          : "FORM2_MANDATORY_ATTACHMENTS_MISSING: All 4 mandatory attachments are required before submitting Form 2."
      );
      return;
    }

    const generatedAttachments: Form2Attachment[] = requirements.map(req => {
      const details = fileDetails[req.id];
      return {
        id: `att-${Date.now()}-${req.id}`,
        claimId: claimCode,
        category: req.category,
        categoryLabelAr: req.titleAr,
        categoryLabelEn: req.titleEn,
        fileName: details.fileName || req.defaultFileName,
        fileSize: details.fileSize || "1.8 MB",
        fileType: "PDF",
        uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        url: details.url || DEMO_PDF_DATA_URI,
        isMandatory: true
      };
    });

    onGenerate(generatedAttachments);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir={isRtl ? "rtl" : "ltr"}>
      <div className={`w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border ${isDark ? "bg-[#0a0f1d] text-white border-slate-800" : "bg-white text-slate-900 border-slate-200"}`}>
        {/* Modal Header */}
        <div className={`p-4 border-b flex items-center justify-between ${isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-100 bg-slate-50"}`}>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <FileText className="w-5 h-5" />
            <h2 className="font-bold text-lg">{isRtl ? "متطلبات نموذج 2: المرفقات الإلزامية" : "Form 2 Mandatory Attachments Checklist"}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Banner */}
          <div className={`p-3.5 rounded-xl flex items-start gap-3 text-xs leading-relaxed ${isDark ? "bg-amber-950/40 text-amber-200 border border-amber-800/60" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-bold">
                  {isRtl ? "متطلبات الحوكمة والمراجعة الفنية والمالية (PMI Control Quality & Procurements)" : "SOP Governance & Verification Rules (PMI Control Quality & Procurements)"}
                </p>
              </div>
              <p>
                {isRtl 
                  ? "وفقاً للوائح الحوكمة للمؤسسة الوطنية للنفط ومعايير PMI، يتطلب اعتماد نموذج 2 إرفاق جميع المستندات الإلزامية الأربعة. عند الاعتماد يتم إقفال الملف وتوجيهه تلقائياً للمراجع الفني (نموذج 4) ثم الإدارة المالية (نموذج 3)."
                  : "NOC rules and PMI global standards mandate attaching all 4 specified audit documents. Upon generation, Form 2 is locked in the Sovereign Registry and automatically routed to the PMO Auditor (Form 4) and NOC Finance (Form 3)."
                }
              </p>
              
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/50">
                <button
                  type="button"
                  onClick={handleAttachAllSamples}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] transition-colors cursor-pointer"
                >
                  {isRtl ? "إرفاق كافة العينات النموذجية" : "Attach All Demo Samples"}
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 text-slate-700 dark:text-slate-300 font-bold rounded text-[11px] transition-colors cursor-pointer"
                >
                  {isRtl ? "مسح المرفقات للتجربة" : "Clear for Validation Testing"}
                </button>
              </div>
            </div>
          </div>

          {/* Validation Error Alert */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Attachments List */}
          <div className="space-y-3">
            {requirements.map((req) => {
              const uploaded = Boolean(fileDetails[req.id]?.fileName);
              const details = fileDetails[req.id];

              return (
                <div key={req.id} className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  uploaded 
                    ? (isDark ? "bg-emerald-950/30 border-emerald-800/60" : "bg-emerald-50/80 border-emerald-300") 
                    : (isDark ? "bg-rose-950/30 border-rose-800/60" : "bg-rose-50/70 border-rose-300")
                }`}>
                  <div className="flex items-start gap-3">
                    {uploaded ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${uploaded ? "text-emerald-800 dark:text-emerald-300" : "text-slate-800 dark:text-slate-100"}`}>
                          {isRtl ? req.titleAr : req.titleEn}
                        </span>
                        {!uploaded && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            {isRtl ? "مطلوب لإصدار النموذج" : "Required for generation"}
                          </span>
                        )}
                      </div>
                      
                      {uploaded ? (
                        <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                          {details.fileName} ({details.fileSize})
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block mt-0.5">
                          {isRtl ? "* مستند إلزامي - يجب إرفاق هذا الملف لتمكين الاعتماد" : "* Mandatory document required for generation"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <label className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      uploaded
                        ? (isDark ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700" : "bg-emerald-100 text-emerald-800 border border-emerald-300")
                        : (isDark ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm")
                    }`}>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploaded ? (isRtl ? "تعديل" : "Change") : (isRtl ? "إرفاق" : "Attach")}</span>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(req.id, req.defaultFileName, e)}
                      />
                    </label>

                    {!uploaded && (
                      <button
                        type="button"
                        onClick={() => handleFileUpload(req.id, req.defaultFileName)}
                        className="px-2.5 py-1.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-200 rounded border border-amber-300 dark:border-amber-800 cursor-pointer"
                        title={isRtl ? "إرفاق عينة نموذجية" : "Attach Sample"}
                      >
                        {isRtl ? "عينة" : "Sample"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-100 bg-slate-50"}`}>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{isRtl ? "المرفقات محمية بنظام تشفير المؤسسة" : "Protected under NOC Audit Chain"}</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                isDark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-200 text-slate-600"
              }`}
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </button>
            <button 
              type="button"
              onClick={handleForm2Submission}
              disabled={!isForm2Submittable}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isForm2Submittable 
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 cursor-pointer" 
                  : "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-60 shadow-none"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isRtl ? "اعتماد وإصدار نموذج 2" : "Submit Form 2"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

