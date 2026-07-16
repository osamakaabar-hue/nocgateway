import React from "react";
import { Claim, LcData } from "../../types";

interface PaymentAuthorizationFormProps {
  claim: Claim;
  lcData: LcData;
  isRtl: boolean;
}

const numToWordsAr = (num: number): string => {
  if (num === 781250) {
    return "سبعمائة وواحد وثمانون ألفاً ومائتان وخمسون دولاراً";
  }
  if (num === 157500) {
    return "مائة وسبعة وخمسون ألفاً وخمسمائة دولار";
  }
  if (num === 640800) {
    return "ستمائة وأربعون ألفاً وثمانمائة دولار";
  }
  if (num === 2890000) {
    return "مليونان وثمانمائة وتسعون ألف دولار";
  }
  return `${num.toLocaleString('ar-LY')} دولار`;
};

const numToWordsEn = (num: number): string => {
  if (num === 781250) {
    return "Seven Hundred Eighty-One Thousand Two Hundred Fifty Dollars";
  }
  if (num === 157500) {
    return "One Hundred Fifty-Seven Thousand Five Hundred Dollars";
  }
  if (num === 640800) {
    return "Six Hundred Forty Thousand Eight Hundred Dollars";
  }
  if (num === 2890000) {
    return "Two Million Eight Hundred Ninety Thousand Dollars";
  }
  return `${num.toLocaleString('en-US')} Dollars`;
};

export default function PaymentAuthorizationForm({ claim, lcData, isRtl }: PaymentAuthorizationFormProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
  };

  const invoiceAmount = claim.invoiceAmount || ((claim.claimedProgress / 100) * claim.numericValue);
  const remainingLc = lcData.allocatedShare - (lcData.openLcsValue || 0);

  return (
    <div className={`bg-white text-black p-8 rounded border-4 border-double border-slate-900 shadow-lg print:border-none print:shadow-none print:p-0 font-sans ${isRtl ? 'text-right' : 'text-left'} max-w-[210mm] mx-auto`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Form Header */}
      <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
        <div className="w-1/3">
          <span className="font-bold text-xs uppercase text-slate-700">NOC</span>
        </div>
        <div className="w-1/3 text-center font-bold">
          <h2 className="text-xl">المؤسسة الوطنية للنفط</h2>
          <h2 className="text-lg">National Oil Corporation</h2>
        </div>
        <div className="w-1/3 flex justify-end">
          <img src="https://upload.wikimedia.org/wikipedia/en/thumb/0/05/National_Oil_Corporation_logo.svg/1200px-National_Oil_Corporation_logo.svg.png" alt="NOC" className="w-16 h-auto grayscale" />
        </div>
      </div>

      <div className="text-center font-bold text-2xl mb-8 underline decoration-double underline-offset-4">
        {isRtl ? "نموذج تعزيز وإذن بالدفع" : "Payment Authorization & Enhancement"}
      </div>

      <div className="mb-6 space-y-2 font-bold text-sm">
        <p className="flex gap-2">
          <span>{isRtl ? "إلى السيد / مدير إدارة العمليات" : "To: Director of Operations Department"}</span>
        </p>
        <p className="flex gap-2">
          <span>{isRtl ? "مصرف / المصرف الليبي الخارجي" : "Bank / Libyan Foreign Bank"}</span>
        </p>
        <p className="flex gap-2 mt-4">
          <span>{isRtl ? "الموضوع: تعزيز وإذن بالدفع للاعتماد المستندي رقم" : "Subject: Payment Authorization for LC No:"}</span>
          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded font-black border border-slate-300">LC-2026-{claim.companyId}-001</span>
        </p>
      </div>

      <div className="mb-6 leading-relaxed text-justify text-sm font-semibold">
        <p>
          {isRtl 
            ? `بالإشارة إلى الاعتماد المستندي المشار إليه أعلاه، المفتوح من طرفكم لصالح شركة (${claim.company}) والممول من قرض خطة زيادة الإنتاج لعام 2026م، وبناءً على شهادة المطابقة وطلب الإذن بالدفع (النموذج رقم 2) المحال إلينا من الشركة المشغلة، وبعد مراجعة وتدقيق لجنة مراقبة ومتابعة الخطة بالمؤسسة الوطنية للنفط والتأكد من مطابقة الأعمال المنفذة أو التوريدات للمستهدفات المعتمدة ضمن خطة 2026م،`
            : `With reference to the documentary credit referred to above, opened by you in favor of (${claim.company}) and funded by the 2026 Production Capacity Increase Loan Plan, and based on the Certificate of Conformity and Payment Request (Form 2) referred to us by the operating company, and after review and audit by the Plan Monitoring and Follow-up Committee at the National Oil Corporation and verifying that the executed works or supplies match the targets approved in the 2026 plan,`
          }
        </p>
        <p className="mt-4">
          {isRtl 
            ? "فإن المؤسسة الوطنية للنفط تصدر بموجب هذا الكتاب تعزيزاً وإذناً نهائياً بالدفع، وتفوض مصرفكم الموقر باتخاذ الإجراءات اللازمة لتسييل القيمة الموضحة أدناه لصالح المستفيد المذكور."
            : "The National Oil Corporation hereby issues a final payment authorization and enhancement, and authorizes your esteemed bank to take the necessary measures to liquidate the amount shown below in favor of the mentioned beneficiary."
          }
        </p>
      </div>

      {/* Verified Details Table */}
      <div className="mb-8">
        <h3 className="font-bold text-base mb-3 border-b pb-1.5">{isRtl ? "بيانات الدفع المعتمدة" : "Approved Payment Details"}</h3>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-2 font-bold w-1/3 text-center">{isRtl ? "البنـد" : "Item"}</th>
              <th className="border border-black p-2 font-bold text-center">{isRtl ? "البيانات" : "Details"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 bg-slate-50 font-bold">{isRtl ? "رقم الاعتماد المستندي (LC)" : "L/C Number (LC)"}</td>
              <td className="border border-black p-2 font-mono font-bold">LC-2026-{claim.companyId}-001</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-slate-50 font-bold">{isRtl ? "اسم الشركة المشغلة" : "Operating Company"}</td>
              <td className="border border-black p-2 font-bold">{claim.company}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-slate-50 font-bold">{isRtl ? "اسم المستفيد" : "Beneficiary"}</td>
              <td className="border border-black p-2 font-bold">{claim.submittedBy}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-slate-50 font-bold">{isRtl ? "قيمة الاعتماد الأصلية" : "Original LC Value"}</td>
              <td className="border border-black p-2 font-mono">{formatCurrency(lcData.allocatedShare)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-slate-50 font-bold">{isRtl ? "المبلغ المصرح بدفعه" : "Authorized Payment Amount"}</td>
              <td className="border border-black p-2 font-mono font-black text-lg text-emerald-700 bg-emerald-50/30">
                {formatCurrency(invoiceAmount)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-slate-50 font-bold">{isRtl ? "العملة" : "Currency"}</td>
              <td className="border border-black p-2 font-bold">USD (دولار أمريكي)</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-slate-50 font-bold">{isRtl ? "المبلغ بالحروف" : "Amount in Words"}</td>
              <td className="border border-black p-2 font-bold text-indigo-800">
                {isRtl ? numToWordsAr(invoiceAmount) : numToWordsEn(invoiceAmount)}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-slate-50 font-bold">{isRtl ? "رقم الفاتورة / المطالبة" : "Invoice / Claim Number"}</td>
              <td className="border border-black p-2 font-mono">{claim.invoiceNumber || `INV-${claim.code}`}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-slate-50 font-bold">{isRtl ? "تاريخ الاستحقاق" : "Due Date"}</td>
              <td className="border border-black p-2">{claim.dueDate || "Immediate"}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-slate-50 font-bold">{isRtl ? "ملاحظات" : "Notes"}</td>
              <td className="border border-black p-2 text-xs">{claim.auditorNotes || "Compliance checks verified. Document legally binding."}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Page break wrapper to simulate Page 2 */}
      <div className="border-t border-dashed border-slate-300 my-8 pt-8 print:border-none print:my-0 print:pt-0">
        <h3 className="font-bold text-base mb-3 border-b pb-1.5">{isRtl ? "نص التفويض" : "Authorization Text"}</h3>
        <p className="text-sm leading-relaxed text-justify mb-6">
          {isRtl 
            ? `يفوض المصرف بموجب هذا الكتاب بتسييل مبلغ وقدره: (${numToWordsAr(invoiceAmount)}) فقط لا غير، وذلك لصالح المستفيد المشار إليه أعلاه، على أن يتم خصم القيمة من مخصصات خطة زيادة الإنتاج لعام 2026م الخاصة بشركة (${claim.company}).`
            : `The bank is authorized by this letter to liquidate the amount of: (${numToWordsEn(invoiceAmount)}) only, in favor of the beneficiary mentioned above, provided that the value is deducted from the allocations of the 2026 Production Capacity Increase Plan of (${claim.company}).`
          }
        </p>
        <p className="text-sm leading-relaxed text-justify mb-8 font-bold">
          {isRtl
            ? "ويعتبر هذا التعزيز والإذن بالدفع شرطاً أساسياً وجزءاً لا يتجزأ من مستندات صرف الاعتماد المستندي، ولا يتم الإفراج عن القيمة إلا استناداً إلى هذا التفويض."
            : "This authorization and enhancement is considered an essential and integral part of the documentary credit disbursement documents, and no release of funds shall occur except based on this authorization."
          }
        </p>

        {/* Dynamic Signatures Table */}
        <h3 className="font-bold text-base mb-4 border-b pb-1.5 text-center">{isRtl ? "تصديق المؤسسة الوطنية للنفط" : "National Oil Corporation Certification"}</h3>
        <div className="grid grid-cols-2 gap-8 text-center text-sm font-semibold">
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <p className="font-black text-slate-800 h-10 flex items-center justify-center">
              {isRtl ? "مدير الإدارة العامة للمالية بالمؤسسة" : "Director of the General Finance Department"}
            </p>
            <div className="my-6 border-b border-dashed border-slate-400 w-3/4 mx-auto min-h-[44px] flex flex-col items-center justify-center">
              {claim.form3SignedByFinance ? (
                <>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 border border-emerald-300 rounded shadow-sm">
                    ✓ {claim.form3SignedByFinance}
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono mt-1">Digitally Signed</span>
                </>
              ) : (
                <span className="text-xs text-red-500 font-bold uppercase animate-pulse">{isRtl ? "غير موقع" : "NOT SIGNED"}</span>
              )}
            </div>
            <p className="text-xs text-slate-500">{isRtl ? "التوقيع والختم" : "Signature & Stamp"}</p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <p className="font-black text-slate-800 h-10 flex items-center justify-center">
              {isRtl ? "رئيس الحسابات (NOC)" : "NOC Head of Accounts"}
            </p>
            <div className="my-6 border-b border-dashed border-slate-400 w-3/4 mx-auto min-h-[44px] flex flex-col items-center justify-center">
              {claim.form3SignedByChairman ? (
                <>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 border border-emerald-300 rounded shadow-sm">
                    ✓ {claim.form3SignedByChairman}
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono mt-1">Digitally Signed</span>
                </>
              ) : (
                <span className="text-xs text-red-500 font-bold uppercase animate-pulse">{isRtl ? "غير موقع" : "NOT SIGNED"}</span>
              )}
            </div>
            <p className="text-xs text-slate-500">{isRtl ? "التوقيع والختم" : "Signature & Stamp"}</p>
          </div>
        </div>

        <div className="mt-10 pt-4 border-t text-center text-xs text-slate-400 font-bold uppercase">
          {isRtl ? "ختم المؤسسة الوطنية للنفط" : "National Oil Corporation Stamp"}
        </div>
      </div>
    </div>
  );
}
