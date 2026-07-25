import React from "react";
import { Claim, LcData } from "../../types";

interface TechnicalApprovalFormProps {
  claim: Claim;
  lcData: LcData;
  isRtl: boolean;
  isEditable?: boolean;
  currentUser?: import('../../types').DemoUser;
  
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
  currentUser,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <table className="w-full border-collapse border border-black text-xs text-center mt-2">
          <thead>
            <tr className="bg-gray-100 print:bg-transparent">
              <th className="border border-black p-2 w-1/3">{isRtl ? "الصفة الوظيفية" : "Role / Title"}</th>
              <th className="border border-black p-2 w-1/3">{isRtl ? "اسم المعتمد" : "Signatory Name"}</th>
              <th className="border border-black p-2 w-1/3">{isRtl ? "التوقيع والختم الإلكتروني" : "E-Signature & Hash Stamp"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 font-bold bg-gray-50 print:bg-transparent">
                {isRtl ? "إعداد: المهندس المختص / المدقق الفني" : "Prepared by: Technical Specialist"}
              </td>
              <td className="border border-black p-2 font-semibold">
                {isEditable ? (
                  <input
                    type="text"
                    value={preparedByName}
                    onChange={(e) => setPreparedByName?.(e.target.value)}
                    className="w-full text-center outline-none bg-slate-50 focus:bg-white p-1 rounded font-bold"
                  />
                ) : (
                  preparedByName
                )}
              </td>
              <td className="border border-black p-2">
                {preparedByName ? (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[9px] font-mono border border-emerald-500 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-black scale-95 rotate-[-2deg]">
                      TECHNICAL AUDIT VERIFIED
                    </span>
                    <span className="italic text-xs text-emerald-700 font-bold mt-0.5">{preparedByName}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setPreparedByName?.(currentUser?.name || "Eng. Tarek El-Fassi")}
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-bold py-1 px-3 rounded border border-amber-300 print:hidden transition-colors"
                  >
                    {isRtl ? "توقيع إلكتروني" : "E-Sign"}
                  </button>
                )}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold bg-gray-50 print:bg-transparent">
                {isRtl ? `اعتماد: مدير الإدارة المختصة (${getDepartmentLabel(deptType)})` : `Approved by: Manager (${getDepartmentLabel(deptType)})`}
              </td>
              <td className="border border-black p-2 font-semibold">
                {isEditable ? (
                  <input
                    type="text"
                    value={approvedByName}
                    onChange={(e) => setApprovedByName?.(e.target.value)}
                    className="w-full text-center outline-none bg-slate-50 focus:bg-white p-1 rounded font-bold text-emerald-700"
                  />
                ) : (
                  approvedByName
                )}
              </td>
              <td className="border border-black p-2">
                {approvedByName ? (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[9px] font-mono border border-emerald-500 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-black scale-95 rotate-[-2deg]">
                      PMO SIGNATURE ANCHORED
                    </span>
                    <span className="italic text-xs text-emerald-700 font-bold mt-0.5">{approvedByName}</span>
                  </div>
                ) : (currentUser?.role === 'pmo_auditor' || currentUser?.role === 'system_admin') ? (
                  <button
                    onClick={() => setApprovedByName?.("Eng. Nadia Al-Kout")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1 px-3 rounded shadow-sm print:hidden transition-colors"
                  >
                    {isRtl ? "توقيع إلكتروني (نادية الكوت)" : "E-Sign (Nadia Al-Kout)"}
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold uppercase italic">{isRtl ? "مخصص لـ م. نادية الكوت" : "NOC PMO Auditor Only"}</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
