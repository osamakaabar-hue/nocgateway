import React, { useState, useEffect } from "react";
import { Claim, LcData, DemoUser } from "../types";
import {
  Briefcase,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  ChevronRight,
  Building2,
  DollarSign,
  FileBadge
} from "lucide-react";
import CertificateOfConformityForm from "./forms/CertificateOfConformityForm";
import TechnicalApprovalForm from "./forms/TechnicalApprovalForm";
import PaymentAuthorizationForm from "./forms/PaymentAuthorizationForm";

interface LCManagementProps {
  claims: Claim[];
  setClaims: React.Dispatch<React.SetStateAction<Claim[]>>;
  currentUser: DemoUser;
  activeRole: string;
  showToast: (text: string, type?: "success" | "info" | "error") => void;
  lang?: any;
}

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

export default function LCManagement({
  claims,
  setClaims,
  currentUser,
  activeRole,
  showToast,
  lang = "en"
}: LCManagementProps) {
  const isRtl = lang === "ar";
  const isNoc = currentUser.companyId === "NOC_HQ";

  const [activeView, setActiveView] = useState<"dashboard" | "forms">("dashboard");
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(claims && claims.length > 0 ? claims[0].id : null);
  const [dbLcData, setDbLcData] = useState<LcData[]>([]);

  useEffect(() => {
    if (!selectedClaimId && claims && claims.length > 0) {
      setSelectedClaimId(claims[0].id);
    }
  }, [claims, selectedClaimId]);

  useEffect(() => {
    const fetchFinancials = async () => {
      try {
        const token = localStorage.getItem("noc_jwt_token");
        if (token) {
          const res = await fetch("/api/financials", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            const result = await res.json();
            setDbLcData(result.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch server-side financials", err);
      }
    };
    fetchFinancials();
  }, []);

  const allowedLcData = React.useMemo(() => {
    const baseList = dbLcData.length > 0 ? dbLcData : INITIAL_LC_DATA;
    // Front-end strict authorization safeguard
    return isNoc 
      ? baseList 
      : baseList.filter(co => co.companyId === currentUser.companyId);
  }, [dbLcData, isNoc, currentUser.companyId]);

  const lcData = React.useMemo(() => {
    return allowedLcData.map(baseData => {
      // Find all claims for this company
      const companyClaims = claims.filter(c => c.companyId === baseData.companyId);
      
      const openLcsCount = companyClaims.length;
      
      const openLcsValue = companyClaims.reduce((sum, c) => sum + (c.numericValue || 0), 0);
      
      const { totalPaid, totalRetention } = companyClaims
        .filter(c => c.status === "authorized_for_payment")
        .reduce((acc, c) => {
          const amount = c.invoiceAmount || ((c.claimedProgress || 0) / 100 * (c.numericValue || 0));
          const retentionAmount = c.retentionPercentage ? (amount * c.retentionPercentage) / 100 : 0;
          return {
            totalPaid: acc.totalPaid + (amount - retentionAmount),
            totalRetention: acc.totalRetention + retentionAmount
          };
        }, { totalPaid: 0, totalRetention: 0 });
        
      const outstandingCommitment = openLcsValue - (totalPaid + totalRetention);
      const availableBalance = baseData.allocatedShare - openLcsValue;

      return {
        ...baseData,
        openLcsCount,
        openLcsValue,
        totalPaid,
        totalRetention,
        outstandingCommitment,
        availableBalance
      };
    });
  }, [allowedLcData, claims]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
  };

  const totalAllocated = lcData.reduce((acc, curr) => acc + curr.allocatedShare, 0);
  const totalOpen = lcData.reduce((acc, curr) => acc + curr.openLcsValue, 0);
  const totalPaid = lcData.reduce((acc, curr) => acc + curr.totalPaid, 0);
  const totalRetention = lcData.reduce((acc, curr) => acc + (curr.totalRetention || 0), 0);
  const totalOutstanding = lcData.reduce((acc, curr) => acc + curr.outstandingCommitment, 0);
  const totalAvailable = lcData.reduce((acc, curr) => acc + curr.availableBalance, 0);
  const utilizationRate = ((totalAllocated - totalAvailable) / totalAllocated) * 100;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-8 h-full print:bg-white print:p-0 print:h-auto">
      <div className="max-w-7xl mx-auto print:max-w-full">
        
        {/* Header - Hidden on Print */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
          <div>
            <h1 className={`text-xl sm:text-2xl font-black text-slate-800 dark:text-white mb-1 flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Briefcase className="w-7 h-7 text-teal-600 dark:text-teal-400 shrink-0" />
              {isRtl ? "الاعتمادات والموقف المالي" : "LC & Financial Dashboard"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm">
              {isRtl ? "لجنة متابعة تمويل مشروعات زيادة القدرة الإنتاجية" : "NOC Production Capacity Increase Projects - Financial Follow-up Committee"}
            </p>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors shadow-md self-start sm:self-auto shrink-0"
          >
            <Printer className="w-4 h-4" />
            {isRtl ? "طباعة الكشف" : "Print Dashboard"}
          </button>
        </div>

        {/* Top Navigation Tabs - Hidden on Print */}
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl mb-6 w-full sm:w-fit overflow-x-auto print:hidden">
          <button
            onClick={() => setActiveView("dashboard")}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeView === "dashboard"
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {isRtl ? "الموقف المالي المجمع" : "Financial Dashboard"}
          </button>
          <button
            onClick={() => setActiveView("forms")}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeView === "forms"
                ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {isRtl ? "نماذج وصيغ الاعتمادات" : "LC Authorization Forms"}
          </button>
        </div>

        {activeView === "dashboard" && (
          <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden print:border-none print:shadow-none print:bg-transparent ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
          
          {/* Official NOC Report Header (Visible mainly on print or as styled header) */}
          <div className="p-8 border-b border-slate-200 dark:border-slate-700 print:border-black print:pb-4 text-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white print:text-black mb-2">
              {isRtl ? "كشف الموقف المالي المجمع للاعتمادات (Dashboard Report)" : "Consolidated Financial Position for LCs (Dashboard Report)"}
            </h2>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 print:text-black mb-6">
              {isRtl ? "لجنة متابعة تمويل مشروعات زيادة القدرة الإنتاجية – المؤسسة الوطنية للنفط" : "NOC Production Capacity Increase Projects Follow-up Committee"}
            </h3>
            
            <div className="flex justify-between items-end text-sm font-bold text-slate-600 dark:text-slate-400 print:text-black border-t border-slate-100 dark:border-slate-700 pt-4 print:border-black">
              <div className="text-right">
                <p>{isRtl ? "تاريخ الإصدار:" : "Issue Date:"} {new Date().toLocaleDateString('en-GB')} م</p>
                <p>{isRtl ? "حالة الحسابات حتى تاريخ:" : "Account Status As Of:"} {new Date().toLocaleDateString('en-GB')} م</p>
              </div>
              <div className="text-left text-lg text-slate-800 dark:text-slate-200 print:text-black">
                {isRtl ? `إجمالي مخصصات خطة القرض لعام 2026: ${formatCurrency(totalAllocated)}` : `Total 2026 Loan Plan Allocation: ${formatCurrency(totalAllocated)}`}
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="p-0">
            <div className="px-4 sm:px-8 py-4 bg-slate-50 dark:bg-slate-800/50 print:bg-transparent font-bold text-slate-800 dark:text-white print:text-black">
              {isRtl ? "أولاً: كشف الموقف المالي المجمع" : "First: Consolidated Financial Position"}
            </div>

            {/* ── MOBILE CARDS (hidden on md+ and on print) ── */}
            <div className="md:hidden print:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {lcData.map((co) => (
                <div key={co.companyId} className={`p-4 space-y-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className="font-black text-slate-900 dark:text-white text-sm">
                    {isRtl ? co.companyNameAr : co.companyName}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{isRtl ? "الحصة" : "Allocated"}</div>
                      <div className="font-bold text-teal-700 dark:text-teal-400 break-all">{formatCurrency(co.allocatedShare)}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{isRtl ? "اعتمادات مفتوحة" : "Open LCs"}</div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm">{co.openLcsCount}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 break-all">{formatCurrency(co.openLcsValue)}</span>
                      </div>
                    </div>
                    <div className="bg-sky-50 dark:bg-sky-900/20 rounded-lg p-2.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{isRtl ? "المسدد" : "Total Paid"}</div>
                      <div className="font-bold text-sky-600 dark:text-sky-400 break-all">{formatCurrency(co.totalPaid)}</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{isRtl ? "محتجز الضمان" : "Retention"}</div>
                      <div className="font-bold text-orange-600 dark:text-orange-400 break-all">{formatCurrency(co.totalRetention || 0)}</div>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-2.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{isRtl ? "الالتزام القائم" : "Outstanding"}</div>
                      <div className="font-bold text-rose-600 dark:text-rose-400 break-all">{formatCurrency(co.outstandingCommitment)}</div>
                    </div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{isRtl ? "الرصيد المتاح" : "Available Balance"}</div>
                    <div className="font-black text-emerald-600 dark:text-emerald-400 break-all">{formatCurrency(co.availableBalance)}</div>
                  </div>
                </div>
              ))}
              {/* Mobile Totals */}
              <div className={`p-4 bg-slate-800 text-white space-y-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="font-black text-sm">{isRtl ? "الإجمالي" : "Total"}</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-400">{isRtl ? "الحصة:" : "Allocated:"}</span> <span className="text-teal-300 font-bold break-all">{formatCurrency(totalAllocated)}</span></div>
                  <div><span className="text-slate-400">{isRtl ? "المسدد:" : "Paid:"}</span> <span className="text-sky-300 font-bold break-all">{formatCurrency(totalPaid)}</span></div>
                  <div><span className="text-slate-400">{isRtl ? "محتجز الضمان:" : "Retention:"}</span> <span className="text-orange-300 font-bold break-all">{formatCurrency(totalRetention)}</span></div>
                  <div><span className="text-slate-400">{isRtl ? "الالتزامات:" : "Outstanding:"}</span> <span className="text-rose-300 font-bold break-all">{formatCurrency(totalOutstanding)}</span></div>
                  <div><span className="text-slate-400">{isRtl ? "المتاح:" : "Available:"}</span> <span className="text-emerald-300 font-bold break-all">{formatCurrency(totalAvailable)}</span></div>
                </div>
              </div>
            </div>

            {/* ── DESKTOP TABLE (hidden on mobile, always shown on print) ── */}
            <div className="hidden md:block overflow-x-auto print:block">
              <table className="w-full text-sm text-slate-600 dark:text-slate-300 print:text-black border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-900/50 print:bg-gray-100 text-slate-700 dark:text-slate-200 print:text-black font-black border-y border-slate-200 dark:border-slate-700 print:border-black">
                  <tr>
                    <th className={`p-4 border-x border-slate-200 dark:border-slate-700 print:border-black ${isRtl ? 'text-right' : 'text-left'}`}>
                      {isRtl ? "اسم الشركة المشغلة" : "Operating Company"}
                    </th>
                    <th className="p-4 border-x border-slate-200 dark:border-slate-700 print:border-black text-center">
                      {isRtl ? "الحصة المخصصة (دولار)" : "Allocated Share ($)"}
                    </th>
                    <th className="p-4 border-x border-slate-200 dark:border-slate-700 print:border-black text-center">
                      {isRtl ? "عدد الاعتمادات المفتوحة (LCs)" : "Open LCs Count"}
                    </th>
                    <th className="p-4 border-x border-slate-200 dark:border-slate-700 print:border-black text-center">
                      {isRtl ? "قيمة الاعتمادات المفتوحة (دولار)" : "Open LCs Value ($)"}
                    </th>
                    <th className="p-4 border-x border-slate-200 dark:border-slate-700 print:border-black text-center">
                      {isRtl ? "إجمالي المسدد (بموجب تعزيز المؤسسة)" : "Total Paid (NOC Auth)"}
                    </th>
                    <th className="p-4 border-x border-slate-200 dark:border-slate-700 print:border-black text-center">
                      {isRtl ? "محتجز ضمان العيوب" : "Retention Holdback"}
                    </th>
                    <th className="p-4 border-x border-slate-200 dark:border-slate-700 print:border-black text-center">
                      {isRtl ? "الرصيد غير المسدد (الالتزام القائم)" : "Unpaid Balance (Outstanding)"}
                    </th>
                    <th className="p-4 border-x border-slate-200 dark:border-slate-700 print:border-black text-center">
                      {isRtl ? "الرصيد المتاح لفتح اعتمادات جديدة" : "Available Balance for New LCs"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lcData.map((co) => (
                    <tr key={co.companyId} className="border-b border-slate-100 dark:border-slate-800 print:border-black hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black font-bold">
                        {isRtl ? co.companyNameAr : co.companyName}
                      </td>
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black text-center text-teal-700 dark:text-teal-400 font-bold">
                        {formatCurrency(co.allocatedShare)}
                      </td>
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-bold">
                          {co.openLcsCount}
                        </span>
                      </td>
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black text-center font-semibold">
                        {formatCurrency(co.openLcsValue)}
                      </td>
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black text-center font-semibold text-sky-600 dark:text-sky-400">
                        {formatCurrency(co.totalPaid)}
                      </td>
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black text-center font-semibold text-orange-600 dark:text-orange-400">
                        {formatCurrency(co.totalRetention || 0)}
                      </td>
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black text-center font-semibold text-rose-600 dark:text-rose-400">
                        {formatCurrency(co.outstandingCommitment)}
                      </td>
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black text-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10">
                        {formatCurrency(co.availableBalance)}
                      </td>
                    </tr>
                  ))}

                  {isNoc && (
                    <tr className="border-b border-slate-100 dark:border-slate-800 print:border-black bg-slate-50 dark:bg-slate-800/30">
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black font-bold">
                        {isRtl ? "الشركات الأخرى" : "Other Companies"}
                      </td>
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black text-center"></td>
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black text-center"></td>
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black text-center"></td>
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black text-center"></td>
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black text-center"></td>
                      <td className="p-4 border-x border-slate-100 dark:border-slate-800 print:border-black text-center"></td>
                    </tr>
                  )}

                  <tr className="bg-slate-800 dark:bg-slate-950 text-white print:bg-gray-200 print:text-black font-black border-y border-slate-800 print:border-black">
                    <td className="p-4 border-x border-slate-700 print:border-black">{isRtl ? "الإجمالي" : "Total"}</td>
                    <td className="p-4 border-x border-slate-700 print:border-black text-center text-teal-300 print:text-black">{formatCurrency(totalAllocated)}</td>
                    <td className="p-4 border-x border-slate-700 print:border-black text-center">{lcData.reduce((acc, curr) => acc + curr.openLcsCount, 0)}</td>
                    <td className="p-4 border-x border-slate-700 print:border-black text-center">{formatCurrency(totalOpen)}</td>
                    <td className="p-4 border-x border-slate-700 print:border-black text-center text-sky-300 print:text-black">{formatCurrency(totalPaid)}</td>
                    <td className="p-4 border-x border-slate-700 print:border-black text-center text-rose-300 print:text-black">{formatCurrency(totalOutstanding)}</td>
                    <td className="p-4 border-x border-slate-700 print:border-black text-center text-emerald-300 print:text-black">{formatCurrency(totalAvailable)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Executive Summary Section */}
          <div className="p-8 print:p-4 print:mt-4 grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
            <div className="print:mb-8">
              <h3 className="text-lg font-black text-slate-800 dark:text-white print:text-black mb-4">
                {isRtl ? "ثانياً: الملخص التنفيذي" : "Second: Executive Summary"}
              </h3>
              <div className="border border-slate-200 dark:border-slate-700 print:border-black rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-slate-200 dark:border-slate-700 print:border-black">
                      <td className="p-4 font-bold bg-slate-50 dark:bg-slate-800 print:bg-transparent text-slate-700 dark:text-slate-200 print:text-black w-2/3">
                        {isRtl ? "إجمالي المخصصات المعتمدة" : "Total Approved Allocations"}
                      </td>
                      <td className="p-4 font-bold text-center border-l border-slate-200 dark:border-slate-700 print:border-black">
                        {formatCurrency(totalAllocated)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700 print:border-black">
                      <td className="p-4 font-bold bg-slate-50 dark:bg-slate-800 print:bg-transparent text-slate-700 dark:text-slate-200 print:text-black">
                        {isRtl ? "إجمالي قيمة الاعتمادات المفتوحة" : "Total Open LCs Value"}
                      </td>
                      <td className="p-4 font-bold text-center border-l border-slate-200 dark:border-slate-700 print:border-black">
                        {formatCurrency(totalOpen)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700 print:border-black">
                      <td className="p-4 font-bold bg-slate-50 dark:bg-slate-800 print:bg-transparent text-slate-700 dark:text-slate-200 print:text-black">
                        {isRtl ? "إجمالي المبالغ المسددة" : "Total Paid Amounts"}
                      </td>
                      <td className="p-4 font-bold text-center border-l border-slate-200 dark:border-slate-700 print:border-black">
                        {formatCurrency(totalPaid)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700 print:border-black">
                      <td className="p-4 font-bold bg-slate-50 dark:bg-slate-800 print:bg-transparent text-slate-700 dark:text-slate-200 print:text-black">
                        {isRtl ? "إجمالي الالتزامات القائمة" : "Total Outstanding Commitments"}
                      </td>
                      <td className="p-4 font-bold text-center border-l border-slate-200 dark:border-slate-700 print:border-black">
                        {formatCurrency(totalOutstanding)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 dark:border-slate-700 print:border-black">
                      <td className="p-4 font-bold bg-slate-50 dark:bg-slate-800 print:bg-transparent text-slate-700 dark:text-slate-200 print:text-black">
                        {isRtl ? "إجمالي الرصيد المتاح" : "Total Available Balance"}
                      </td>
                      <td className="p-4 font-bold text-center border-l border-slate-200 dark:border-slate-700 print:border-black">
                        {formatCurrency(totalAvailable)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold bg-teal-50 dark:bg-teal-900/20 print:bg-transparent text-teal-800 dark:text-teal-200 print:text-black">
                        {isRtl ? "نسبة الاستغلال من إجمالي الخطة" : "Utilization Rate from Total Plan"}
                      </td>
                      <td className="p-4 font-black text-teal-600 dark:text-teal-400 print:text-black text-center text-lg border-l border-slate-200 dark:border-slate-700 print:border-black">
                        {utilizationRate.toFixed(2)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="print:block">
              <h3 className="text-lg font-black text-slate-800 dark:text-white print:text-black mb-4">
                {isRtl ? "ثالثاً: ملاحظات لجنة المتابعة" : "Third: Follow-up Committee Notes"}
              </h3>
              <div className="border border-slate-200 dark:border-slate-700 print:border-black rounded-lg p-4 min-h-[150px]">
                {/* Blank lines for physical writing in print */}
                <div className="border-b border-dashed border-slate-300 dark:border-slate-600 print:border-black mb-8 mt-4"></div>
                <div className="border-b border-dashed border-slate-300 dark:border-slate-600 print:border-black mb-8"></div>
                <div className="border-b border-dashed border-slate-300 dark:border-slate-600 print:border-black mb-8"></div>
              </div>
            </div>
          </div>

          {/* Signatures Section */}
          <div className="p-8 print:p-4 bg-slate-50 dark:bg-slate-800/30 print:bg-transparent border-t border-slate-200 dark:border-slate-700 print:border-black">
            <h3 className="text-lg font-black text-slate-800 dark:text-white print:text-black mb-6">
              {isRtl ? "رابعاً: الاعتماد" : "Fourth: Approval"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 text-sm font-bold text-slate-700 dark:text-slate-300 print:text-black">
              <div className="space-y-6">
                <div className="flex items-end gap-2">
                  <span className="shrink-0">{isRtl ? "الجهة المصدرة للتقرير:" : "Reporting Entity:"}</span>
                  <div className="flex-1 border-b border-black"></div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="shrink-0">{isRtl ? "اسم المسؤول:" : "Officer Name:"}</span>
                  <div className="flex-1 border-b border-black"></div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="shrink-0">{isRtl ? "الصفة الوظيفية:" : "Position:"}</span>
                  <div className="flex-1 border-b border-black"></div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-end gap-2">
                  <span className="shrink-0">{isRtl ? "التوقيع:" : "Signature:"}</span>
                  <div className="flex-1 border-b border-black"></div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="shrink-0">{isRtl ? "التاريخ:" : "Date:"}</span>
                  <div className="flex-1 border-b border-black"></div>
                </div>
                <div className="flex items-end gap-2 mt-8">
                  <span className="shrink-0">{isRtl ? "الختم الرسمي:" : "Official Stamp:"}</span>
                  <div className="flex-1 border-b border-black h-16"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 p-4 bg-yellow-50 dark:bg-yellow-900/20 print:bg-transparent border border-yellow-200 dark:border-yellow-900/50 print:border-black rounded text-xs text-yellow-800 dark:text-yellow-200 print:text-black leading-relaxed font-semibold">
              <strong>{isRtl ? "ملاحظة للمصرف:" : "Note to the Bank:"}</strong><br/>
              {isRtl 
                ? "يلتزم المصرف بتحديث هذا التقرير بصورة آلية استناداً إلى حركة الاعتمادات المستندية والمدفوعات المنفذة، وإحالته إلى لجنة متابعة تمويل مشروعات زيادة القدرة الإنتاجية بالمؤسسة الوطنية للنفط بشكل أسبوعي أو شهري وفق ما تحدده المؤسسة، وذلك لتمكين اللجنة من متابعة مستويات الالتزام والرصيد المتاح لكل شركة مشغلة وضمان عدم تجاوز المخصصات المعتمدة ضمن الخطة."
                : "The bank is obligated to update this report automatically based on the movement of documentary credits and executed payments, and forward it to the NOC Production Capacity Increase Projects Funding Follow-up Committee on a weekly or monthly basis as determined by the NOC. This enables the committee to monitor commitment levels and available balance for each operating company, ensuring approved allocations within the plan are not exceeded."}
            </div>
          </div>

        </div>
        )}

        {activeView === "forms" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8 print:block">
            {/* Sidebar list of claims - Hidden on print */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 h-[40vh] lg:h-fit lg:max-h-[80vh] overflow-y-auto print:hidden">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4 px-2">
                {isRtl ? "سجل المطالبات / الفواتير" : "Claims / Invoices Log"}
              </h3>
              <div className="space-y-2">
                {claims
                  .filter(c => isNoc || c.companyId === currentUser.companyId)
                  .map(claim => (
                    <button
                      key={claim.id}
                      onClick={() => setSelectedClaimId(claim.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${isRtl ? 'text-right' : 'text-left'} ${
                        selectedClaimId === claim.id
                          ? "bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent"
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-500 mb-1">{claim.code}</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm line-clamp-2 leading-tight">
                        {claim.title}
                      </div>
                      <div className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-2">
                        {claim.company}
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Document Viewer Area */}
            <div className="lg:col-span-3">
              {selectedClaimId ? (() => {
                const claim = claims.find(c => c.id === selectedClaimId);
                if (!claim) return null;
                const companyLcData = lcData.find(lc => lc.companyId === claim.companyId) || lcData[0];
                
                return (
                  <div className="bg-slate-200 dark:bg-slate-950 p-4 lg:p-8 rounded-2xl min-h-[800px] shadow-inner print:p-0 print:bg-transparent print:shadow-none">
                    
                    {/* Action Bar - Hidden on print */}
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm mb-6 print:hidden">
                      <div className="flex items-center gap-3">
                        <FileBadge className="w-5 h-5 text-indigo-500" />
                        <span className="font-bold text-slate-800 dark:text-white">
                          {isRtl ? "معاينة النموذج الرسمي" : "Official Form Preview"}
                        </span>
                      </div>
                      <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors text-sm"
                      >
                        <Printer className="w-4 h-4" />
                        {isRtl ? "طباعة النموذج للتوثيق" : "Print Form for Archive"}
                      </button>
                    </div>

                    {/* The actual A4 Paper Form Container */}
                    <div className="w-full max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none min-h-[297mm] relative overflow-hidden">
                      {(activeRole === "subsidiary_pm" || activeRole === "subsidiary_finance") && (
                        <CertificateOfConformityForm claim={claim} lcData={companyLcData} isRtl={isRtl} />
                      )}
                      
                      {activeRole === "pmo_auditor" && (
                        <TechnicalApprovalForm claim={claim} lcData={companyLcData} isRtl={isRtl} />
                      )}

                      {(activeRole === "noc_finance" || activeRole === "noc_head_of_accounts" || activeRole === "steering_committee" || activeRole === "pmo_auditor" || activeRole === "system_admin") && (
                        <PaymentAuthorizationForm claim={claim} lcData={companyLcData} isRtl={isRtl} />
                      )}
                    </div>
                  </div>
                );
              })() : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col items-center justify-center text-center print:hidden">
                  <FileBadge className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                    {isRtl ? "لم يتم تحديد مطالبة" : "No Claim Selected"}
                  </h2>
                  <div className="text-slate-500 dark:text-slate-400">
                    {isRtl 
                      ? "يرجى اختيار مطالبة من القائمة الجانبية لمعاينة وطباعة نماذج الاعتمادات والإذن بالدفع الخاصة بها." 
                      : "Please select a claim from the sidebar to preview and print its LC and Payment Authorization forms."}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
