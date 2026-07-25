import React, { useState } from "react";
import { Claim, VariationOrder } from "../types";
import { X, Plus, AlertCircle, TrendingUp, Clock } from "lucide-react";

interface VariationOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: Claim;
  onSubmit: (vo: VariationOrder) => void;
  lang?: string;
}

export default function VariationOrderModal({ isOpen, onClose, claim, onSubmit, lang = "en" }: VariationOrderModalProps) {
  const isRtl = lang === "ar";
  
  const [type, setType] = useState<VariationOrder['type']>("scope_change");
  const [description, setDescription] = useState("");
  const [valueImpact, setValueImpact] = useState<number>(0);
  const [timeImpactDays, setTimeImpactDays] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newVo: VariationOrder = {
      id: `vo-${Date.now()}`,
      parentClaimId: claim.id,
      type,
      description,
      valueImpact,
      timeImpactDays,
      status: "pending",
      submittedBy: "Current User", // Should come from context realistically
      submissionDate: new Date().toISOString().split("T")[0],
    };

    onSubmit(newVo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir={isRtl ? "rtl" : "ltr"}>
      <div className={`bg-white dark:bg-[#071329] rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 ${isRtl ? "text-right" : "text-left"}`}>
        {/* Header */}
        <div className={`p-4 bg-slate-900 text-white flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" />
              {isRtl ? "إضافة أمر تغييري (Variation Order)" : "Add Variation Order (VO)"}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {isRtl ? "للمطالبة:" : "For Claim:"} {claim.code}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <p className="text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
              {isRtl 
                ? "الأوامر التغييرية تتطلب سلسلة اعتمادات منفصلة (لجنة التسيير / لجنة الإدارة) ولن يتم دمجها في الفاتورة الحالية إلا بعد اعتمادها رسمياً."
                : "Variation Orders require a separate approval chain (Steering Committee / Management) and won't merge into the current invoice until formally approved."}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isRtl ? "نوع التغيير" : "Variation Type"}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-[#0a1930] text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-500"
            >
              <option value="scope_change">{isRtl ? "تغيير في نطاق العمل (Scope Change)" : "Scope Change"}</option>
              <option value="price_adjustment">{isRtl ? "تعديل أسعار (Price Adjustment)" : "Price Adjustment"}</option>
              <option value="time_extension">{isRtl ? "تمديد زمني (Time Extension)" : "Time Extension"}</option>
              <option value="force_majeure">{isRtl ? "قوة قاهرة (Force Majeure)" : "Force Majeure"}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isRtl ? "الوصف الفني للتغيير *" : "Technical Description *"}
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-[#0a1930] text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-500"
              placeholder={isRtl ? "اذكر سبب وتفاصيل الأمر التغييري..." : "Describe the reason and details..."}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                {isRtl ? "الأثر المالي (يورو)" : "Value Impact (€)"}
              </label>
              <input
                type="number"
                value={valueImpact}
                onChange={(e) => setValueImpact(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-[#0a1930] text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-amber-500" />
                {isRtl ? "التأثير الزمني (أيام)" : "Time Impact (Days)"}
              </label>
              <input
                type="number"
                value={timeImpactDays}
                onChange={(e) => setTimeImpactDays(Number(e.target.value))}
                className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-[#0a1930] text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-500 font-mono"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900 ${isRtl ? "flex-row-reverse" : ""}`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
          >
            {isRtl ? "إلغاء" : "Cancel"}
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold shadow"
          >
            {isRtl ? "تقديم الأمر التغييري" : "Submit VO"}
          </button>
        </div>
      </div>
    </div>
  );
}
