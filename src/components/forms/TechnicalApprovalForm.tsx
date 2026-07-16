import React from "react";
import { Claim, LcData } from "../../types";

interface TechnicalApprovalFormProps {
  claim: Claim;
  lcData: LcData;
  isRtl: boolean;
  isEditable?: boolean;
  
  // Interactive fields
  projectClassification?: number;
  setProjectClassification?: (val: number) => void;
  otherClassificationText?: string;
  setOtherClassificationText?: (val: string) => void;
  
  isConformant?: boolean;
  setIsConformant?: (val: boolean) => void;
  isObjectionFree?: boolean;
  setIsObjectionFree?: (val: boolean) => void;
  
  technicalNotes?: string;
  setTechnicalNotes?: (val: string) => void;
  
  recommendation?: "approve" | "partial" | "reject";
  setRecommendation?: (val: "approve" | "partial" | "reject") => void;
  partialValue?: string;
  setPartialValue?: (val: string) => void;
  
  preparedByName?: string;
  setPreparedByName?: (val: string) => void;
  approvedByName?: string;
  setApprovedByName?: (val: string) => void;
  deptType?: string;
  setDeptType?: (val: string) => void;
}

export default function TechnicalApprovalForm({
  claim,
  lcData,
  isRtl,
  isEditable = false,
  projectClassification = 1,
  setProjectClassification,
  otherClassificationText = "",
  setOtherClassificationText,
  isConformant = true,
  setIsConformant,
  isObjectionFree = true,
  setIsObjectionFree,
  technicalNotes = "",
  setTechnicalNotes,
  recommendation = "approve",
  setRecommendation,
  partialValue = "",
  setPartialValue,
  preparedByName = "Eng. Salem Al-Obeidi",
  setPreparedByName,
  approvedByName = "Eng. Nadia Al-Kout",
  setApprovedByName,
  deptType = "projects",
  setDeptType
}: TechnicalApprovalFormProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
  };

  const getDepartmentLabel = (type: string) => {
    if (type === "drilling") return isRtl ? "إدارة الحفر" : "Drilling Dept";
    if (type === "projects") return isRtl ? "إدارة المشاريع الرئيسية" : "Major Projects Dept";
    if (type === "maintenance") return isRtl ? "إدارة هندسة الصيانة والمشاريع الصغرى" : "Maintenance Dept";
    return isRtl ? "إدارة أخرى" : "Other Dept";
  };

  return (
    <div className={`bg-white text-black p-8 rounded border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0 font-sans ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Form Header */}
      <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
        <div className="w-1/3 text-right" dir="ltr">
          <img src="https://upload.wikimedia.org/wikipedia/en/thumb/0/05/National_Oil_Corporation_logo.svg/1200px-National_Oil_Corporation_logo.svg.png" alt="NOC" className="w-16 h-auto grayscale ml-auto" />
        </div>
        <div className="w-2/3 text-center font-bold">
          <h2 className="text-xl">المؤسسة الوطنية للنفط</h2>
          <h2 className="text-lg">لجنة متابعة تمويل مشروعات زيادة القدرة الإنتاجية</h2>
        </div>
      </div>

      <div className="text-center font-bold text-xl mb-6 underline decoration-double underline-offset-4">
        {isRtl ? "نموذج الاعتماد الفني للأعمال المنجزة (Form 4)" : "Technical Approval Form for Completed Works (Form 4)"}
      </div>

      {/* Auto-filled Section */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-black p-2 bg-gray-50 print:bg-transparent">
          <strong>{isRtl ? "الشركة المشغلة:" : "Operating Company:"}</strong> {claim.company}
        </div>
        <div className="border border-black p-2 bg-gray-50 print:bg-transparent">
          <strong>{isRtl ? "تاريخ التقييم الفني:" : "Technical Eval Date:"}</strong> {new Date().toLocaleDateString('en-GB')}
        </div>
        <div className="border border-black p-2 bg-gray-50 print:bg-transparent col-span-2">
          <strong>{isRtl ? "اسم المشروع:" : "Project Name:"}</strong> {claim.title}
        </div>
        <div className="border border-black p-2 bg-gray-50 print:bg-transparent">
          <strong>{isRtl ? "رقم المشروع (WBS):" : "Project Number (WBS):"}</strong> {claim.wbs}
        </div>
        <div className="border border-black p-2 bg-gray-50 print:bg-transparent">
          <strong>{isRtl ? "رقم الاعتماد المستندي (LC):" : "LC reference:"}</strong> {claim.code}
        </div>
      </div>

      {/* 1. Classification (Interactive dropdown or checkbox representation) */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 border-b pb-1 text-slate-800">{isRtl ? "1. تصنيف المشروع:" : "1. Project Classification:"}</h3>
        {isEditable ? (
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
            {[
              { id: 0, label: isRtl ? "مشاريع الحفر وصيانة الآبار" : "Drilling & Well Maintenance" },
              { id: 1, label: isRtl ? "المرافق السطحية (Surface Facilities)" : "Surface Facilities" },
              { id: 2, label: isRtl ? "خطوط الأنابيب (Pipelines)" : "Pipelines" }
            ].map(item => (
              <label key={item.id} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="classification"
                  checked={projectClassification === item.id}
                  onChange={() => setProjectClassification?.(item.id)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                />
                {item.label}
              </label>
            ))}
            <div className="col-span-2 flex items-center gap-2 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="radio"
                  name="classification"
                  checked={projectClassification === 3}
                  onChange={() => setProjectClassification?.(3)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                />
                {isRtl ? "أخرى (يرجى التحديد):" : "Other (Please specify):"}
              </label>
              <input
                type="text"
                value={otherClassificationText}
                disabled={projectClassification !== 3}
                onChange={(e) => setOtherClassificationText?.(e.target.value)}
                className="flex-1 p-1 border rounded text-xs bg-white text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed focus:ring-1 focus:ring-amber-500"
                placeholder={isRtl ? "تحديد التصنيف..." : "Specify classification..."}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-xs">{projectClassification === 0 ? '✓' : ''}</div> 
              {isRtl ? "مشاريع الحفر وصيانة الآبار" : "Drilling & Well Maintenance"}
            </label>
            <label className="flex items-center gap-2">
              <div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-xs">{projectClassification === 1 ? '✓' : ''}</div> 
              {isRtl ? "المرافق السطحية (Surface Facilities)" : "Surface Facilities"}
            </label>
            <label className="flex items-center gap-2">
              <div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-xs">{projectClassification === 2 ? '✓' : ''}</div> 
              {isRtl ? "خطوط الأنابيب (Pipelines)" : "Pipelines"}
            </label>
            <label className="flex items-center gap-2">
              <div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-xs">{projectClassification === 3 ? '✓' : ''}</div> 
              {isRtl ? `أخرى: ${otherClassificationText || '....................'}` : `Other: ${otherClassificationText || '....................'}`}
            </label>
          </div>
        )}
      </div>

      {/* 2. Technical Evaluation */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 border-b pb-1 text-slate-800">{isRtl ? "2. التقييم الفني للأعمال المنجزة:" : "2. Technical Evaluation of Completed Works:"}</h3>
        <table className="w-full border-collapse border border-black text-sm mb-4">
          <tbody>
            <tr>
              <td className="border border-black p-2 w-3/4 font-semibold">{isRtl ? "نسبة الإنجاز الفني المعتمدة:" : "Approved Technical Progress %:"}</td>
              <td className="border border-black p-2 text-center font-bold bg-slate-50 print:bg-transparent">{claim.claimedProgress}%</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold">{isRtl ? "القيمة المالية المقابلة لنسبة الإنجاز:" : "Financial Value Corresponding to Progress:"}</td>
              <td className="border border-black p-2 text-center font-bold bg-slate-50 print:bg-transparent">{formatCurrency((claim.claimedProgress / 100) * claim.numericValue)}</td>
            </tr>
          </tbody>
        </table>

        {/* Technical Checklist */}
        {isEditable ? (
          <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-200 text-xs font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isConformant}
                onChange={(e) => setIsConformant?.(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              {isRtl ? "الأعمال المنفذة مطابقة للمواصفات والخطة المعتمدة" : "Completed works conform to plan specifications"}
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isObjectionFree}
                onChange={(e) => setIsObjectionFree?.(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              {isRtl ? "لا توجد ملاحظات أو موانع فنية تمنع صرف الدفعة" : "No technical observations blocking payment release"}
            </label>
          </div>
        ) : (
          <div className="space-y-1 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-xs">{isConformant ? '✓' : ''}</div>
              {isRtl ? "الأعمال المنفذة مطابقة للمواصفات والخطة المعتمدة" : "Completed works conform to plan specifications"}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-xs">{isObjectionFree ? '✓' : ''}</div>
              {isRtl ? "لا توجد ملاحظات أو موانع فنية تمنع صرف الدفعة" : "No technical observations blocking payment release"}
            </div>
          </div>
        )}
      </div>

      {/* 3. Recommendation */}
      <div className="mb-6">
        <h3 className="font-bold mb-3 border-b pb-1 text-slate-800">{isRtl ? "3. توصية اللجنة الفنية (Check one):" : "3. Technical Committee Recommendation (Check one):"}</h3>
        {isEditable ? (
          <div className="space-y-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="recommendation"
                checked={recommendation === "approve"}
                onChange={() => setRecommendation?.("approve")}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              {isRtl ? "الموافقة الكاملة على صرف الدفعة المستحقة" : "Full approval for invoice drawdown"}
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="radio"
                  name="recommendation"
                  checked={recommendation === "partial"}
                  onChange={() => setRecommendation?.("partial")}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                />
                {isRtl ? "الموافقة على صرف جزء من الدفعة بقيمة:" : "Partial payment approval of:"}
              </label>
              <input
                type="text"
                value={partialValue}
                disabled={recommendation !== "partial"}
                onChange={(e) => setPartialValue?.(e.target.value)}
                className="p-1 border rounded text-xs bg-white text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed focus:ring-1 focus:ring-amber-500"
                placeholder="€ 500,000..."
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="recommendation"
                checked={recommendation === "reject"}
                onChange={() => setRecommendation?.("reject")}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              {isRtl ? "عدم الموافقة وطلب مراجعة إضافية" : "Hold payment pending further clarifications"}
            </label>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-xs">{recommendation === "approve" ? '✓' : ''}</div>
              {isRtl ? "الموافقة الكاملة على صرف الدفعة المستحقة" : "Full approval for invoice drawdown"}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-xs">{recommendation === "partial" ? '✓' : ''}</div>
              {isRtl ? `الموافقة على صرف جزء من الدفعة بقيمة: ${partialValue || '................'}` : `Partial payment approval of: ${partialValue || '................'}`}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-xs">{recommendation === "reject" ? '✓' : ''}</div>
              {isRtl ? "عدم الموافقة وطلب مراجعة إضافية" : "Hold payment pending further clarifications"}
            </div>
          </div>
        )}
      </div>

      {/* 4. Notes & Recommendations */}
      <div className="mb-6">
        <h3 className="font-bold mb-2 text-slate-800">{isRtl ? "4. ملاحظات وتوصيات الفني المختص بالمؤسسة:" : "4. Notes of NOC Technical Specialist:"}</h3>
        {isEditable ? (
          <textarea
            value={technicalNotes}
            onChange={(e) => setTechnicalNotes?.(e.target.value)}
            className="w-full h-24 p-2 border rounded text-xs bg-white text-slate-800 focus:ring-1 focus:ring-amber-500"
            placeholder={isRtl ? "أدخل ملاحظات التقييم الفني..." : "Enter technical evaluation notes here..."}
          />
        ) : (
          <div className="border border-black p-4 min-h-[80px] text-justify text-sm bg-gray-50 print:bg-transparent">
            {technicalNotes || claim.auditorNotes || (isRtl ? "تمت مراجعة المطالبة الفنية والمستندات الداعمة. لا توجد ملاحظات تعيق الاعتماد الفني للأعمال المنجزة." : "The technical claim and supporting documents have been reviewed. No observations hinder the technical approval of the completed works.")}
          </div>
        )}
      </div>

      {/* Approvals & Signatures */}
      <div className="border-t border-black pt-4 mt-6">
        <h3 className="font-bold mb-4 text-center">{isRtl ? "الاعتمادات والتوقيعات الفنية" : "Technical Approvals & Signatures"}</h3>
        
        {isEditable ? (
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded border border-slate-200 text-xs">
            <div className="space-y-2">
              <label className="block font-bold text-slate-600">{isRtl ? "المدقق الفني / المهندس المختص:" : "Technical Auditor Name:"}</label>
              <input
                type="text"
                value={preparedByName}
                onChange={(e) => setPreparedByName?.(e.target.value)}
                className="w-full p-2 border rounded bg-white text-slate-800 font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-bold text-slate-600">{isRtl ? "مدير الإدارة الفنية المختصة:" : "NOC Dept Manager Name:"}</label>
              <input
                type="text"
                value={approvedByName}
                onChange={(e) => setApprovedByName?.(e.target.value)}
                className="w-full p-2 border rounded bg-white text-slate-800 font-semibold"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <label className="block font-bold text-slate-600">{isRtl ? "الإدارة الفنية المشرفة:" : "NOC Supervising Technical Department:"}</label>
              <select
                value={deptType}
                onChange={(e) => setDeptType?.(e.target.value)}
                className="w-full p-2 border rounded bg-white text-slate-850 font-semibold cursor-pointer"
              >
                <option value="drilling">{isRtl ? "إدارة الحفر وصيانة الآبار" : "Drilling & Well Maintenance Dept"}</option>
                <option value="projects">{isRtl ? "إدارة المشاريع الرئيسية" : "Major Projects Dept"}</option>
                <option value="maintenance">{isRtl ? "إدارة هندسة الصيانة والمشاريع الصغرى" : "Maintenance & Small Projects Dept"}</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-12 text-center font-bold text-sm">
            <div>
              <p>{isRtl ? "إعداد: المهندس المختص / المدقق الفني" : "Prepared by: Technical Specialist"}</p>
              <div className="mt-6 border-b border-black w-3/4 mx-auto pb-1 italic text-slate-700">{preparedByName}</div>
              <p className="mt-2 text-xs text-slate-400 font-mono">E-Signed via Ledger (OK)</p>
            </div>
            <div>
              <p>{isRtl ? `اعتماد: مدير الإدارة المختصة (${getDepartmentLabel(deptType)})` : `Approved by: Manager (${getDepartmentLabel(deptType)})`}</p>
              <div className="mt-6 border-b border-black w-3/4 mx-auto pb-1 text-emerald-700 flex flex-col items-center justify-center">
                <span className="border border-emerald-500 bg-emerald-50 px-1 py-0.5 rounded text-[8px] font-mono tracking-tight font-black mb-1 rotate-[-2deg] scale-95">
                  APPROVED & SECURED
                </span>
                <span className="italic">{approvedByName}</span>
              </div>
              <p className="mt-2 text-xs text-slate-400 font-mono">E-Signed via Ledger (OK)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
