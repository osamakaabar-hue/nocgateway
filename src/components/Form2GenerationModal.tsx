import React, { useState } from 'react';
import { X, Upload, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

interface Form2GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: () => void;
  isRtl: boolean;
  isDark: boolean;
}

export function Form2GenerationModal({ isOpen, onClose, onGenerate, isRtl, isDark }: Form2GenerationModalProps) {
  const [uploads, setUploads] = useState({
    lading: false,
    receipt: false,
    invoice: false,
    report: false
  });

  if (!isOpen) return null;

  const allUploaded = uploads.lading && uploads.receipt && uploads.invoice && uploads.report;

  const requirements = [
    {
      id: 'lading',
      title: isRtl ? "نسخة من بوليصة الشحن" : "Copy of Bill of Lading",
      uploaded: uploads.lading
    },
    {
      id: 'receipt',
      title: isRtl ? "إيصال استلام الموقع موقع من المهندس المشرف" : "Site Receipt Signed by Supervising Engineer",
      uploaded: uploads.receipt
    },
    {
      id: 'invoice',
      title: isRtl ? "الفاتورة الأصلية المعتمدة للمقاول" : "Approved Original Contractor Invoice",
      uploaded: uploads.invoice
    },
    {
      id: 'report',
      title: isRtl ? "تقرير فني يثبت التوافق مع أهداف 2026" : "Technical Report proving alignment with 2026 goals",
      uploaded: uploads.report
    }
  ];

  const handleUpload = (id: keyof typeof uploads) => {
    setUploads(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" dir={isRtl ? "rtl" : "ltr"}>
      <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${isDark ? "bg-[#0a0f1d] text-white" : "bg-white text-slate-900"}`}>
        <div className={`p-4 border-b flex items-center justify-between ${isDark ? "border-slate-800" : "border-slate-100"}`}>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
            <FileText className="w-5 h-5" />
            <h2 className="font-bold text-lg">{isRtl ? "متطلبات إصدار نموذج 2" : "Form 2 Generation Requirements"}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className={`p-3 rounded-lg flex items-start gap-3 text-sm ${isDark ? "bg-amber-950/30 text-amber-200 border border-amber-900/50" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{isRtl ? "يجب إرفاق جميع المستندات الإلزامية التالية قبل التمكن من إصدار شهادة المطابقة (نموذج 2)." : "All of the following mandatory documents must be attached before generating the Certificate of Conformity (Form 2)."}</p>
          </div>

          <div className="space-y-3">
            {requirements.map((req) => (
              <div key={req.id} className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                req.uploaded 
                  ? (isDark ? "bg-emerald-950/20 border-emerald-900/50" : "bg-emerald-50 border-emerald-200") 
                  : (isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")
              }`}>
                <div className="flex items-center gap-3">
                  {req.uploaded ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${req.uploaded ? "text-emerald-700 dark:text-emerald-400" : ""}`}>
                    {req.title}
                  </span>
                </div>
                {!req.uploaded ? (
                  <button 
                    onClick={() => handleUpload(req.id as keyof typeof uploads)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 ${
                      isDark ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    {isRtl ? "إرفاق" : "Upload"}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded shrink-0">
                    {isRtl ? "مكتمل" : "Attached"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={`p-4 border-t flex justify-end gap-3 ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-100 bg-slate-50"}`}>
          <button 
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              isDark ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-200 text-slate-600"
            }`}
          >
            {isRtl ? "إلغاء" : "Cancel"}
          </button>
          <button 
            onClick={() => {
              if (allUploaded) {
                onGenerate();
                onClose();
              }
            }}
            disabled={!allUploaded}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
              allUploaded 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                : "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <FileText className="w-4 h-4" />
            {isRtl ? "إصدار نموذج 2" : "Generate Form 2"}
          </button>
        </div>
      </div>
    </div>
  );
}
