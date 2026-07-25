import React from "react";
import { LcData } from "../../types";

export default function NocCommitteeDashboard({ lcData, isRtl }: { lcData: LcData[], isRtl: boolean }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{isRtl ? "لوحة القيادة للجنة المراقبة" : "NOC Committee Dashboard"}</h2>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 mb-4">
          {isRtl ? "عرض الأرصدة المتبقية لكل شركة وموافقات التدفق النقدي." : "View remaining balances per subsidiary by technical pillar."}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900">
                <th className="p-3 border-b">{isRtl ? "الشركة" : "Company"}</th>
                <th className="p-3 border-b">{isRtl ? "الحفر التطويري" : "Development Drilling"}</th>
                <th className="p-3 border-b">{isRtl ? "صيانة الآبار" : "Workover & Maintenance"}</th>
                <th className="p-3 border-b">{isRtl ? "التسهيلات السطحية" : "Surface Facilities"}</th>
              </tr>
            </thead>
            <tbody>
              {lcData.map(c => (
                <tr key={c.companyId} className="border-b border-slate-100 dark:border-slate-700">
                  <td className="p-3 font-medium">{isRtl ? c.companyNameAr : c.companyName}</td>
                  <td className="p-3 text-slate-600">${c.pillars?.["Development Drilling"]?.availableBalance.toLocaleString() || 0}</td>
                  <td className="p-3 text-slate-600">${c.pillars?.["Well Workover & Maintenance"]?.availableBalance.toLocaleString() || 0}</td>
                  <td className="p-3 text-slate-600">${c.pillars?.["Surface Facilities & Tie-ins"]?.availableBalance.toLocaleString() || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
