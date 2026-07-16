import React, { useState, useEffect } from "react";
import { Claim, Deliverable, DemoUser } from "../types";
import { X, Plus, AlertCircle, Lock } from "lucide-react";

interface AddClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClaim: (claim: Claim) => void;
  currentUser?: DemoUser | null;
  lang?: string;
}

export default function AddClaimModal({ isOpen, onClose, onAddClaim, currentUser, lang = "en" }: AddClaimModalProps) {
  const isRtl = lang === "ar";
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("Waha Oil Company");
  const [code, setCode] = useState("");
  const [wbs, setWbs] = useState("");
  const [claimedValue, setClaimedValue] = useState("€500,000");
  const [submittedBy, setSubmittedBy] = useState("Eng. Tarek El-Fassi");
  const [previousProgress, setPreviousProgress] = useState(30);
  const [claimedProgress, setClaimedProgress] = useState(50);
  const [priority, setPriority] = useState<"high" | "standard">("standard");
  const [deliverableDesc, setDeliverableDesc] = useState("");
  const [deliverableWeight, setDeliverableWeight] = useState("10.0%");
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [error, setError] = useState("");

  const isSubsidiary = currentUser && currentUser.companyId !== "NOC_HQ";

  useEffect(() => {
    if (isOpen) {
      if (isSubsidiary && currentUser) {
        setCompany(currentUser.company);
        setSubmittedBy(currentUser.name);
        const prefix = currentUser.companyId.split("-")[0] || "WAHA";
        setCode(`${prefix}-24-${Math.floor(100 + Math.random() * 900)}`);
        setWbs(`${prefix}-WBS-${Math.floor(1000 + Math.random() * 9000)}`);
      } else {
        setCompany("Waha Oil Company");
        setSubmittedBy(currentUser?.name || "Eng. Tarek El-Fassi");
        setCode(`WAHA-24-${Math.floor(100 + Math.random() * 900)}`);
        setWbs(`WAHA-WBS-${Math.floor(1000 + Math.random() * 9000)}`);
      }
      setTitle("");
      setClaimedValue("€500,000");
      setPreviousProgress(30);
      setClaimedProgress(50);
      setPriority("standard");
      setDeliverables([]);
      setError("");
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleAddDeliverable = () => {
    if (!deliverableDesc.trim()) return;
    const newDel: Deliverable = {
      id: `del-${Date.now()}`,
      description: deliverableDesc,
      weight: deliverableWeight,
      status: "completed",
    };
    setDeliverables([...deliverables, newDel]);
    setDeliverableDesc("");
  };

  const handleRemoveDeliverable = (id: string) => {
    setDeliverables(deliverables.filter((d) => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !code.trim() || !wbs.trim()) {
      setError(isRtl ? "يرجى ملء كافة الحقول الإلزامية التي تحتوي على علامة (*)." : "Please fill out all mandatory (*) fields.");
      return;
    }

    if (claimedProgress <= previousProgress) {
      setError(isRtl ? "يجب أن تكون نسبة الإنجاز المطلوبة أكبر من نسبة الإنجاز السابقة المعتمدة." : "Claimed progress must be greater than previous approved progress.");
      return;
    }

    const companyIdMap: Record<string, string> = {
      "Waha Oil Company": "WAHA",
      "Arabian Gulf Oil Company": "AGOCO",
      "Zallaf Libya": "ZALLAF",
      "Mellitah Oil & Gas": "MELLITAH",
      "Harouge Oil Operations": "HAROUGE-099"
    };

    const finalCompany = isSubsidiary && currentUser ? currentUser.company : company;
    const companyId = isSubsidiary && currentUser
      ? currentUser.companyId
      : (companyIdMap[finalCompany] || `COMP-${Math.floor(Math.random() * 900) + 100}`);

    const finalSubmittedBy = isSubsidiary && currentUser ? currentUser.name : submittedBy;

    const newClaim: Claim = {
      id: `claim-${Date.now()}`,
      code,
      title,
      company: finalCompany,
      companyId,
      wbs,
      claimedValue,
      numericValue: parseFloat(claimedValue.replace(/[^0-9.]/g, "")) || 500000,
      submittedBy: finalSubmittedBy,
      submissionDate: isRtl ? "اليوم، ٠٩:٠٠ ص" : "Today 09:00 AM",
      previousProgress,
      claimedProgress,
      priority,
      dueDate: isRtl ? "خلال ٧ أيام" : "Within 7 Days",
      previousNotes: isRtl ? "لا توجد ملاحظات سابقة لدورة المطالبة الحالية." : "No previous review notes for this claim cycle.",
      deliverables: deliverables.length > 0 ? deliverables : [
        {
          id: `del-${Date.now()}-1`,
          description: isRtl ? "الأعمال العامة للحفر وتمديد الكابلات المكتملة" : "General excavation & cable routing works completed",
          weight: "15.0%",
          status: "completed",
        }
      ],
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          name: "QAQC_Audit_Form_Standard.pdf",
          size: "1.2 MB",
          uploadedAt: "09:02 AM",
          type: "PDF",
        }
      ],
      auditLog: [
        {
          id: `log-${Date.now()}-1`,
          user: finalSubmittedBy,
          action: isRtl ? "تقديم المطالبة" : "Submission",
          change: `${previousProgress}% → ${claimedProgress}%`,
          timestamp: isRtl ? "اليوم، ٠٩:٠٠ ص" : "Today, 09:00 AM",
        }
      ],
      auditorNotes: "",
      status: "pending",
    };

    onAddClaim(newClaim);
    onClose();

    // Reset fields
    setTitle("");
    setCode("");
    setWbs("");
    setDeliverables([]);
  };

  return (
    <div 
      id="add-claim-modal" 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className={`bg-white dark:bg-[#071329] rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 ${isRtl ? "text-right" : "text-left"}`}>
        {/* Header */}
        <div className={`p-4 bg-slate-900 dark:bg-slate-950 text-white flex justify-between items-center border-b border-slate-850 ${isRtl ? "flex-row-reverse" : ""}`}>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>{isRtl ? "تقديم مطالبة إنجاز فني جديدة للـ PMO" : "Add New Technical Progress Claim"}</span>
              {isSubsidiary && currentUser && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-300" />
                  {currentUser.companyId} {isRtl ? "محمي سيادياً" : "Secured"}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              {isRtl ? "إضافة حزمة عمل هندسية جديدة لتدقيق واحتساب القيمة المكتسبة" : "Add a new financial or engineering progress claim for audit"}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={`p-5 overflow-y-auto space-y-4 flex-1 bg-white dark:bg-[#071329] ${isRtl ? "text-right" : "text-left"}`}>
          {error && (
            <div className={`p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs rounded-lg flex items-center gap-2 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isRtl ? "اسم وعنوان حزمة العمل / المشروع *" : "Project Phase Title *"}
              </label>
              <input
                type="text"
                required
                placeholder={isRtl ? "مثال: صيانة أنابيب التدفق الآبار ١٤-١٨" : "e.g., Boiler System Retrofitting"}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!code) {
                    const words = e.target.value.split(" ");
                    const acronym = words.map(w => w[0]).join("").toUpperCase();
                    const companyPrefix = isSubsidiary && currentUser
                      ? (currentUser.companyId.split("-")[0] || "WAHA")
                      : "NOC";
                    setCode(`${companyPrefix}-${acronym || "CLAIM"}-24-${Math.floor(100 + Math.random() * 900)}`);
                  }
                }}
                className={`w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-[#0a1930] text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none ${isRtl ? "text-right" : "text-left"}`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isRtl ? "الشركة التابعة المنفذة *" : "Executing Company *"}
              </label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={isSubsidiary}
                className={`w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none bg-white dark:bg-[#0a1930] text-slate-900 dark:text-white ${
                  isSubsidiary ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-700 font-bold" : ""
                }`}
              >
                <option value="Waha Oil Company">{isRtl ? "شركة الواحة للنفط" : "Waha Oil Company"}</option>
                <option value="Arabian Gulf Oil Company">{isRtl ? "شركة الخليج العربي للنفط" : "Arabian Gulf Oil Company"}</option>
                <option value="Zallaf Libya">{isRtl ? "شركة زلاف ليبيا" : "Zallaf Libya"}</option>
                <option value="Mellitah Oil & Gas">{isRtl ? "شركة مليتة للنفط والغاز" : "Mellitah Oil & Gas"}</option>
                <option value="Harouge Oil Operations">{isRtl ? "شركة الهروج للعمليات النفطية" : "Harouge Oil Operations"}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isRtl ? "الرمز المرجعي للمطالبة الفنية *" : "Claim Reference Code *"}
              </label>
              <input
                type="text"
                required
                placeholder="e.g., WAHA-24-110"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-[#0a1930] text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono font-bold ${isRtl ? "text-right" : "text-left"}`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isRtl ? "عنصر هيكل العمل WBS المرتبط *" : "WBS Element Node *"}
              </label>
              <input
                type="text"
                required
                placeholder="e.g., WAHA-24-110"
                value={wbs}
                onChange={(e) => setWbs(e.target.value)}
                className={`w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-[#0a1930] text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono font-bold ${isRtl ? "text-right" : "text-left"}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isRtl ? "قيمة ميزانية المرحلة الحالية باليورو *" : "WBS Stage Budget Value *"}
              </label>
              <input
                type="text"
                required
                placeholder="e.g., €1,250,000"
                value={claimedValue}
                onChange={(e) => setClaimedValue(e.target.value)}
                className={`w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-[#0a1930] text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono font-bold ${isRtl ? "text-right" : "text-left"}`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isRtl ? "المهندس المشرف المسؤول" : "Supervising Project Manager"}
              </label>
              <input
                type="text"
                value={submittedBy}
                onChange={(e) => setSubmittedBy(e.target.value)}
                disabled={isSubsidiary}
                className={`w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-[#0a1930] text-slate-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:outline-none ${
                  isSubsidiary ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-700 font-bold" : ""
                } ${isRtl ? "text-right" : "text-left"}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 block mb-1">
                {isRtl ? "نسبة الإنجاز السابقة (%)" : "Previous Progress (%)"}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={previousProgress}
                onChange={(e) => setPreviousProgress(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0a1930] text-slate-900 dark:text-white rounded focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 block mb-1">
                {isRtl ? "نسبة الإنجاز المطلوبة (%)" : "Claimed Progress (%)"}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={claimedProgress}
                onChange={(e) => setClaimedProgress(Number(e.target.value))}
                className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0a1930] text-slate-900 dark:text-white rounded focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 block mb-1">
                {isRtl ? "الأولية فنية" : "Priority"}
              </label>
              <div className="flex gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => setPriority("high")}
                  className={`flex-1 py-1.5 text-[10px] rounded font-black uppercase transition-all ${
                    priority === "high" ? "bg-red-600 text-white shadow" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {isRtl ? "عالية" : "High"}
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("standard")}
                  className={`flex-1 py-1.5 text-[10px] rounded font-black uppercase transition-all ${
                    priority === "standard" ? "bg-slate-700 dark:bg-slate-650 text-white shadow" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {isRtl ? "عادية" : "Standard"}
                </button>
              </div>
            </div>
          </div>

          {/* Add Deliverables Section */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-[#0a1930]">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 font-sans">
              {isRtl ? "المخرجات والمنجزات العينية لهذا المطلب الفني" : "Key Deliverables for this Stage Claim"}
            </h4>
            <div className={`flex gap-2 mb-2 ${isRtl ? "flex-row-reverse" : ""}`}>
              <input
                type="text"
                placeholder={isRtl ? "وصف مخرجات الإنجاز (مثال: الانتهاء من صب الأساسات)" : "Deliverable description"}
                value={deliverableDesc}
                onChange={(e) => setDeliverableDesc(e.target.value)}
                className={`flex-1 text-xs p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071329] text-slate-900 dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-amber-500 ${isRtl ? "text-right" : "text-left"}`}
              />
              <input
                type="text"
                placeholder={isRtl ? "الوزن %" : "Weight %"}
                value={deliverableWeight}
                onChange={(e) => setDeliverableWeight(e.target.value)}
                className={`w-20 text-xs p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#071329] text-slate-900 dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono ${isRtl ? "text-center" : "text-left"}`}
              />
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white dark:text-slate-950 text-xs px-3 py-2 rounded font-bold transition-colors cursor-pointer"
              >
                {isRtl ? "إضافة" : "Add"}
              </button>
            </div>

            {/* List of deliverables */}
            {deliverables.length > 0 ? (
              <div className="space-y-1 max-h-[120px] overflow-y-auto">
                {deliverables.map((d, index) => (
                  <div key={d.id} className={`flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800 font-mono ${isRtl ? "flex-row-reverse" : ""}`}>
                    <span className={`text-slate-800 dark:text-slate-200 truncate flex-1 ${isRtl ? "text-right" : "text-left"}`}>{index + 1}. {d.description}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold px-2">{d.weight}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(d.id)}
                      className="text-red-500 hover:text-red-700 font-bold px-1 cursor-pointer"
                    >
                      {isRtl ? "حذف" : "Delete"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                {isRtl 
                  ? "لا توجد مخرجات مخصصة بعد. سيتم توليد مخرجات افتراضية تلقائيًا للامتثال."
                  : "No custom deliverables added yet. A default deliverable will be auto-generated."}
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className={`p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 text-right ${isRtl ? "flex-row-reverse" : ""}`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer bg-white dark:bg-slate-800"
          >
            {isRtl ? "إلغاء الأمر" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-600 text-white dark:text-slate-950 rounded text-xs font-bold shadow transition-colors cursor-pointer"
          >
            {isRtl ? "تقديم للتدقيق والاعتماد الفني" : "Submit for Technical Audit"}
          </button>
        </div>
      </div>
    </div>
  );
}
