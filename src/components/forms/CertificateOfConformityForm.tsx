import React from "react";
import { Claim, LcData } from "../../types";

interface CertificateOfConformityFormProps {
  claim: Claim;
  lcData: LcData;
  isRtl: boolean;
}

export default function CertificateOfConformityForm({ claim, lcData, isRtl }: CertificateOfConformityFormProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
  };

  return (
    <div className={`bg-white text-black p-8 rounded border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0 font-sans ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Form Header */}
      <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
        <div className="w-1/3">
          <img src="https://upload.wikimedia.org/wikipedia/en/thumb/0/05/National_Oil_Corporation_logo.svg/1200px-National_Oil_Corporation_logo.svg.png" alt="NOC" className="w-16 h-auto grayscale" />
        </div>
        <div className="w-1/3 text-center font-bold">
          <h2 className="text-xl">المؤسسة الوطنية للنفط</h2>
          <h2 className="text-lg">National Oil Corporation</h2>
        </div>
        <div className="w-1/3 text-left" dir="ltr">
          {/* Company Logo placeholder */}
          <div className="font-bold text-lg">{claim.company}</div>
        </div>
      </div>

      <div className="text-center font-bold text-2xl mb-8 underline decoration-double underline-offset-4">
        {isRtl ? "شهادة المطابقة وطلب الإذن بالدفع" : "Certificate of Conformity & Request for Payment"}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border border-black p-2">
          <strong>{isRtl ? "اسم الشركة المشغلة:" : "Operating Company:"}</strong> {claim.company}
        </div>
        <div className="border border-black p-2">
          <strong>{isRtl ? "رقم الاعتماد المستندي (L/C No):" : "L/C Number:"}</strong> LC-2026-{claim.companyId}-001
        </div>
        <div className="border border-black p-2">
          <strong>{isRtl ? "اسم المشروع:" : "Project Name:"}</strong> {claim.title}
        </div>
        <div className="border border-black p-2">
          <strong>{isRtl ? "رقم الفاتورة:" : "Invoice Number:"}</strong> {claim.invoiceNumber || `INV-${claim.code}`}
        </div>
      </div>

      <div className="mb-6 leading-relaxed">
        <strong>{isRtl ? "إلى: لجنة متابعة تمويل مشروعات زيادة القدرة الإنتاجية بالمؤسسة الوطنية للنفط" : "To: NOC Production Capacity Increase Projects Funding Follow-up Committee"}</strong>
        <p className="mt-4 text-justify">
          {isRtl 
            ? `بالإشارة إلى الاعتماد المستندي المفتوح لصالح شركتنا برقم (LC-2026-${claim.companyId}-001) المخصص لتنفيذ أعمال مشروع (${claim.title}).\nنفيدكم بأن المقاول المنفذ قد أنجز نسبة (${claim.claimedProgress}%) من الأعمال المطلوبة وفق المواصفات الفنية المعتمدة والشروط التعاقدية. وعليه، نرفق لكم الفاتورة المذكورة أعلاه بقيمة (${formatCurrency(claim.invoiceAmount || 0)})، بالإضافة إلى المستندات الداعمة التالية:`
            : `With reference to the documentary credit opened in favor of our company No. (LC-2026-${claim.companyId}-001) allocated for the implementation of the project (${claim.title}).\nWe inform you that the executing contractor has completed (${claim.claimedProgress}%) of the required works in accordance with the approved technical specifications and contractual terms. Accordingly, we enclose the aforementioned invoice for the amount of (${formatCurrency(claim.invoiceAmount || 0)}), in addition to the following supporting documents:`
          }
        </p>
      </div>

      <div className="mb-8">
        <h3 className="font-bold mb-2">{isRtl ? "المستندات المرفقة (Checklist):" : "Attached Documents (Checklist):"}</h3>
        <ul className="list-none space-y-2">
          <li className="flex items-center gap-2"><div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-xs">{claim.invoiceNumber ? '✓' : ''}</div> {isRtl ? "الفاتورة التجارية المعتمدة من الشركة" : "Approved Commercial Invoice"}</li>
          <li className="flex items-center gap-2"><div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-xs">✓</div> {isRtl ? "شهادة إنجاز الأعمال (Progress Certificate)" : "Progress Certificate"}</li>
          <li className="flex items-center gap-2"><div className="w-4 h-4 border border-black flex items-center justify-center font-bold text-xs">✓</div> {isRtl ? "مستندات الشحن / محاضر الاستلام بالموقع" : "Shipping Documents / Site Receipt"}</li>
        </ul>
      </div>

      <div className="border border-black p-4 mb-8 bg-gray-50 print:bg-transparent">
        <h3 className="font-bold underline mb-2 text-center">{isRtl ? "إقرار المطابقة" : "Declaration of Conformity"}</h3>
        <p className="text-justify text-sm">
          {isRtl 
            ? "نقر نحن (الشركة المشغلة) بصحة ودقة كافة البيانات الواردة أعلاه، وبأن الأعمال/المواد قد تم استلامها وقبولها فنياً، ونتحمل المسؤولية القانونية والمالية الكاملة عن هذا الإجراء دون أدنى مسؤولية على المؤسسة الوطنية للنفط."
            : "We (the Operating Company) declare the validity and accuracy of all the data mentioned above, and that the works/materials have been received and technically accepted, and we bear full legal and financial responsibility for this action without any responsibility on the National Oil Corporation."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-12 mt-12 text-center font-bold">
        <div>
          <p>{isRtl ? "مدير المشروع (الشركة المشغلة)" : "Project Manager (Operating Co.)"}</p>
          <div className="mt-8 border-b border-black w-3/4 mx-auto"></div>
          <p className="mt-2">{isRtl ? "التوقيع والختم" : "Signature & Stamp"}</p>
        </div>
        <div>
          <p>{isRtl ? "المدير المالي (الشركة المشغلة)" : "Finance Manager (Operating Co.)"}</p>
          <div className="mt-8 border-b border-black w-3/4 mx-auto"></div>
          <p className="mt-2">{isRtl ? "التوقيع والختم" : "Signature & Stamp"}</p>
        </div>
      </div>
    </div>
  );
}
