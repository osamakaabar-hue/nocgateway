import React from "react";
import { Claim, LcData } from "../../types";

interface Form2Props {
  currentUser?: any;
  claim: Claim;
  lcData: LcData;
  isRtl: boolean;
  isEditable?: boolean;

  // Form State Bindings
  contractorName?: string;
  setContractorName?: (val: string) => void;
  invoiceNumber?: string;
  setInvoiceNumber?: (val: string) => void;
  invoiceDate?: string;
  setInvoiceDate?: (val: string) => void;
  invoiceValue?: number;
  setInvoiceValue?: (val: number) => void;
  is100Percent?: boolean;
  setIs100Percent?: (val: boolean) => void;
  partialPercent?: number;
  setPartialPercent?: (val: number) => void;
  productionImpactBarrels?: number;
  setProductionImpactBarrels?: (val: number) => void;

  hasBillOfLading?: boolean;
  setHasBillOfLading?: (val: boolean) => void;
  hasSiteReceipt?: boolean;
  setHasSiteReceipt?: (val: boolean) => void;
  hasContractorInvoice?: boolean;
  setHasContractorInvoice?: (val: boolean) => void;
  hasTechnicalReport?: boolean;
  setHasTechnicalReport?: (val: boolean) => void;

  valueInWords?: string;
  setValueInWords?: (val: string) => void;

  signedByEngineer?: string;
  setSignedByEngineer?: (val: string) => void;
  signedByDeptManager?: string;
  setSignedByDeptManager?: (val: string) => void;
  signedByFinanceManager?: string;
  setSignedByFinanceManager?: (val: string) => void;
  signedByChairman?: string;
  setSignedByChairman?: (val: string) => void;
}

export default function Form2CertificateOfConformity({
  currentUser,
  claim,
  lcData,
  isRtl,
  isEditable = false,
  contractorName = "Schlumberger Middle East S.A",
  setContractorName,
  invoiceNumber = claim.invoiceNumber || "INV-2026-001",
  setInvoiceNumber,
  invoiceDate = new Date().toLocaleDateString('en-GB'),
  setInvoiceDate,
  invoiceValue = claim.invoiceAmount || 0,
  setInvoiceValue,
  is100Percent = claim.claimedProgress === 100,
  setIs100Percent,
  partialPercent = claim.claimedProgress !== 100 ? claim.claimedProgress : 0,
  setPartialPercent,
  productionImpactBarrels = 0,
  setProductionImpactBarrels,
  hasBillOfLading = true,
  setHasBillOfLading,
  hasSiteReceipt = true,
  setHasSiteReceipt,
  hasContractorInvoice = true,
  setHasContractorInvoice,
  hasTechnicalReport = true,
  setHasTechnicalReport,
  valueInWords = "",
  setValueInWords,
  signedByEngineer = "",
  setSignedByEngineer,
  signedByDeptManager = "",
  setSignedByDeptManager,
  signedByFinanceManager = "",
  setSignedByFinanceManager,
  signedByChairman = "",
  setSignedByChairman
}: Form2Props) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
  };

  return (
    <div className={`bg-white text-black p-8 rounded border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0 font-sans ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Form Header */}
      <div className="text-center font-bold text-xl mb-6 underline decoration-double underline-offset-4">
        {isRtl ? "نموذج شهادة المطابقة وطلب الإذن بالدفع" : "Certificate of Conformity and Request for Payment Authorization Form"}
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 text-sm font-semibold">
        <div className="flex items-center gap-2">
          <span>{isRtl ? "اسم الشركة المشغلة:" : "Operating Company:"}</span>
          <span className="border-b border-black flex-1 text-center italic">{claim.company}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{isRtl ? "رقم الشهادة:" : "Certificate Number:"}</span>
          <span className="border-b border-black flex-1 text-center italic">{claim.code}-CERT-02</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{isRtl ? "التاريخ:" : "Date:"}</span>
          <span className="border-b border-black flex-1 text-center italic">{new Date().toLocaleDateString('en-GB')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{isRtl ? "المشروع:" : "Project:"}</span>
          <span className="border-b border-black flex-1 text-center italic">{claim.title}</span>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <span>{isRtl ? "رقم المشروع بخطة 2026:" : "Project Number in 2026 Plan:"}</span>
          <span className="border-b border-black flex-1 italic px-2">{claim.wbs}</span>
        </div>
      </div>

      {/* First: Payment Request Data */}
      <div className="mb-8">
        <h3 className="font-bold mb-3 border-b-2 border-black pb-1">{isRtl ? "أولاً: بيانات طلب الدفع" : "First: Payment Request Data"}</h3>
        <table className="w-full border-collapse border border-black text-sm text-center">
          <thead>
            <tr className="bg-gray-100 print:bg-transparent">
              <th className="border border-black p-2 w-1/3">{isRtl ? "البند" : "Item"}</th>
              <th className="border border-black p-2 w-2/3">{isRtl ? "البيانات" : "Data"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 font-semibold text-right">{isRtl ? "اسم المقاول / المورد" : "Contractor / Supplier Name"}</td>
              <td className="border border-black p-2">
                {isEditable ? (
                  <input type="text" value={contractorName} onChange={(e) => setContractorName?.(e.target.value)} className="w-full text-center outline-none bg-slate-50 focus:bg-white" />
                ) : contractorName}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold text-right">{isRtl ? "رقم الفاتورة المقدمة" : "Submitted Invoice Number"}</td>
              <td className="border border-black p-2">
                {isEditable ? (
                  <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber?.(e.target.value)} className="w-full text-center outline-none bg-slate-50 focus:bg-white" />
                ) : invoiceNumber}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold text-right">{isRtl ? "تاريخ الفاتورة" : "Invoice Date"}</td>
              <td className="border border-black p-2">
                {isEditable ? (
                  <input type="text" value={invoiceDate} onChange={(e) => setInvoiceDate?.(e.target.value)} className="w-full text-center outline-none bg-slate-50 focus:bg-white" />
                ) : invoiceDate}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold text-right">{isRtl ? "قيمة الفاتورة المستحقة للدفع" : "Invoice Value Due for Payment"}</td>
              <td className="border border-black p-2 font-bold text-lg">
                {isEditable ? (
                  <input type="number" value={invoiceValue} onChange={(e) => setInvoiceValue?.(Number(e.target.value))} className="w-full text-center outline-none bg-slate-50 focus:bg-white font-bold" />
                ) : formatCurrency(invoiceValue)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold text-right">{isRtl ? "نسبة الانجاز الفنية" : "Technical Progress"}</td>
              <td className="border border-black p-2">
                <div className="flex items-center justify-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={is100Percent} onChange={() => { setIs100Percent?.(true); setPartialPercent?.(0); }} disabled={!isEditable} className="w-4 h-4" />
                    {isRtl ? "100%" : "100%"}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={!is100Percent} onChange={() => { setIs100Percent?.(false); setPartialPercent?.(claim.claimedProgress); }} disabled={!isEditable} className="w-4 h-4" />
                    {isRtl ? "دفعة مرحلية بنسبة" : "Partial Payment %:"} 
                    {(!is100Percent && isEditable) ? (
                      <input type="number" value={partialPercent} onChange={(e) => setPartialPercent?.(Number(e.target.value))} className="w-16 border-b text-center mx-1 outline-none" />
                    ) : (
                      <span className="mx-1 px-2 border-b border-black">{partialPercent}%</span>
                    )}
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-semibold text-right" rowSpan={2}>{isRtl ? "الأثر الإنتاجي المحقق (إن وجد)" : "Production Impact Achieved (if any)"}</td>
              <td className="border border-black p-2 font-bold bg-gray-50 print:bg-transparent text-sm">
                {isRtl ? "تم تحقيق زيادة فعلية بــ" : "Actual increase achieved of:"} 
                {isEditable ? (
                  <input type="number" value={productionImpactBarrels} onChange={(e) => setProductionImpactBarrels?.(Number(e.target.value))} className="w-24 border-b text-center mx-2 outline-none font-bold" />
                ) : (
                  <span className="mx-2 px-4 border-b border-black">{productionImpactBarrels.toLocaleString()}</span>
                )} 
                {isRtl ? "برميل" : "Barrels"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Attachments Checklist Table */}
      <div className="mb-8 w-3/4 mx-auto">
        <table className="w-full border-collapse border border-black text-sm text-center">
          <thead>
            <tr className="bg-gray-100 print:bg-transparent">
              <th className="border border-black p-2 w-12">#</th>
              <th className="border border-black p-2">{isRtl ? "المرفـــــــــــــــق" : "Attachment"}</th>
              <th className="border border-black p-2 w-16">✓</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 1, label: isRtl ? "نسخة من بوليصة الشحن" : "Copy of Bill of Lading", checked: hasBillOfLading, setter: setHasBillOfLading },
              { id: 2, label: isRtl ? "محضر استلام موقع من المهندس المشرف" : "Site Receipt Signed by Supervising Engineer", checked: hasSiteReceipt, setter: setHasSiteReceipt },
              { id: 3, label: isRtl ? "فاتورة المقاول الأصلية المعتمدة" : "Approved Original Contractor Invoice", checked: hasContractorInvoice, setter: setHasContractorInvoice },
              { id: 4, label: isRtl ? "تقرير فني يثبت توافق العمل مع أهداف خطة 2026" : "Technical Report proving alignment with 2026 goals", checked: hasTechnicalReport, setter: setHasTechnicalReport },
            ].map(row => (
              <tr key={row.id}>
                <td className="border border-black p-2 font-bold">{row.id}</td>
                <td className="border border-black p-2 text-right">{row.label}</td>
                <td className="border border-black p-2">
                  <input 
                    type="checkbox" 
                    checked={row.checked} 
                    onChange={(e) => row.setter?.(e.target.checked)} 
                    disabled={!isEditable}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Second & Third: Declarations */}
      <div className="mb-8 space-y-4">
        <div>
          <h3 className="font-bold mb-2 border-b border-black inline-block">{isRtl ? "ثانياً: شهادة المطابقة" : "Second: Certificate of Conformity"}</h3>
          <p className="text-sm text-justify leading-relaxed">
            {isRtl 
              ? "نشهد نحن الموقعين أدناه بأن الأعمال / المواد / المعدات موضوع الفاتورة المشار إليها أعلاه قد تم تنفيذها أو توريدها وفقاً للعقد والمواصفات الفنية المعتمدة، وأنها تتوافق مع أهداف ومؤشرات خطة عام 2026 المعتمدة، وعليه نوصي باتخاذ إجراءات السداد."
              : "We, the undersigned, certify that the works/materials/equipment subject to the above invoice have been executed/supplied in accordance with the contract and approved technical specifications, and that they comply with the approved 2026 plan objectives and indicators. Accordingly, we recommend proceeding with payment procedures."
            }
          </p>
        </div>
        
        <div>
          <h3 className="font-bold mb-2 border-b border-black inline-block">{isRtl ? "ثالثاً: المرفقات" : "Third: Attachments"}</h3>
          <p className="text-sm text-slate-500 italic">{isRtl ? "(كما هو محدد في الجدول أعلاه)" : "(As specified in the checklist above)"}</p>
        </div>

        <div>
          <h3 className="font-bold mb-2 border-b border-black inline-block">{isRtl ? "رابعاً: طلب الإذن بالدفع" : "Fourth: Request for Payment Authorization"}</h3>
          <p className="text-sm text-justify leading-relaxed mb-4">
            {isRtl 
              ? "بناءً على المستندات المرفقة وشهادة المطابقة أعلاه، نوصي بالموافقة على سداد قيمة الفاتورة المستحقة لصالح المقاول / المورد المذكور أعلاه."
              : "Based on the attached documents and the conformity certificate above, we recommend approving the payment of the invoice value due to the contractor/supplier mentioned above."
            }
          </p>
          <div className="space-y-3 font-semibold text-sm w-3/4">
            <div className="flex items-center gap-2">
              <span>{isRtl ? "القيمة بالأرقام:" : "Amount in Figures:"}</span>
              <span className="border-b border-black flex-1 pb-1">{formatCurrency(invoiceValue)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="shrink-0">{isRtl ? "القيمة بالحروف:" : "Amount in Words:"}</span>
              {isEditable ? (
                <input type="text" value={valueInWords} onChange={(e) => setValueInWords?.(e.target.value)} className="border-b border-black flex-1 outline-none text-center bg-slate-50 focus:bg-white" placeholder={isRtl ? "فقط ... دولار أمريكي لا غير" : "Only ... USD"} />
              ) : (
                <span className="border-b border-black flex-1 pb-1 text-center">{valueInWords || "..........................................................."}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fifth: Signatures */}
      <div className="mb-4">
        <h3 className="font-bold mb-4 border-b border-black inline-block">{isRtl ? "خامساً: الاعتمادات" : "Fifth: Approvals"}</h3>
        <table className="w-full border-collapse border border-black text-sm text-center">
          <thead>
            <tr className="bg-gray-100 print:bg-transparent">
              <th className="border border-black p-2 w-1/3">{isRtl ? "الصفة" : "Title"}</th>
              <th className="border border-black p-2 w-1/3">{isRtl ? "الاســــــــــــم" : "Name"}</th>
              <th className="border border-black p-2 w-1/3">{isRtl ? "التوقيع" : "Signature"}</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: "eng", label: isRtl ? "المهندس المشرف / مدير المشروع" : "Supervising Engineer / Project Manager", val: signedByEngineer, setter: setSignedByEngineer, allowedRoles: ["subsidiary_pm"] },
              { id: "dept", label: isRtl ? "مدير الإدارة المختصة" : "Specialized Dept Manager", val: signedByDeptManager, setter: setSignedByDeptManager, allowedRoles: ["subsidiary_pm"] },
              { id: "fin", label: isRtl ? "المدير المالي" : "Finance Manager", val: signedByFinanceManager, setter: setSignedByFinanceManager, allowedRoles: ["subsidiary_finance"] },
              { id: "chair", label: isRtl ? "رئيس لجنة الإدارة" : "Chairman of Management Committee", val: signedByChairman, setter: setSignedByChairman, allowedRoles: ["steering_committee"] },
            ].map(row => (
              <tr key={row.id}>
                <td className="border border-black p-3 font-semibold bg-gray-50 print:bg-transparent">{row.label}</td>
                <td className="border border-black p-3">
                  {isEditable ? (
                    row.val ? (
                      <div className="flex items-center justify-between px-2">
                        <span className="font-bold text-slate-800">{row.val}</span>
                        {row.allowedRoles.includes(currentUser?.role) && (
                          <button onClick={() => row.setter?.("")} className="text-xs text-red-500 hover:text-red-700 print:hidden">{isRtl ? "مسح" : "Clear"}</button>
                        )}
                      </div>
                    ) : (
                      row.allowedRoles.includes(currentUser?.role) ? (
                        <button 
                          onClick={() => row.setter?.(isRtl ? (currentUser?.nameAr || "مستخدم") : (currentUser?.name || "User"))} 
                          className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold py-1.5 px-4 rounded border border-amber-300 print:hidden transition-colors"
                        >
                          {isRtl ? "توقيع إلكتروني" : "E-Sign"}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic print:hidden">{isRtl ? "غير مصرح" : "Not Authorized"}</span>
                      )
                    )
                  ) : (
                    <span className="font-bold text-slate-800">{row.val}</span>
                  )}
                </td>
                <td className="border border-black p-3 italic text-emerald-700">
                  {row.val ? (
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-mono border border-emerald-500 bg-emerald-50 px-1 rounded-sm mb-1 scale-90 rotate-[-2deg]">VERIFIED SIGNATURE</span>
                      <span>{row.val}</span>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-end">
        <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center opacity-40">
          <span className="text-center text-sm font-bold text-gray-400 rotate-[-15deg]">{isRtl ? "ختم الشركة المشغلة" : "Operating Company Stamp"}</span>
        </div>
      </div>

    </div>
  );
}
