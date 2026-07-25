import React from "react";
import { Claim } from "../../types";
import { BarChart2 } from "lucide-react";

export default function RoiAnalyticsDashboard({ claims, isRtl }: { claims: Claim[], isRtl: boolean }) {
  // Simple aggregation of claims that have targetBopdIncrease
  const roiClaims = claims.filter(c => c.targetBopdIncrease !== undefined && c.targetBopdIncrease > 0);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{isRtl ? "تحليلات العائد على الاستثمار" : "ROI Analytics"}</h2>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="w-5 h-5 text-fuchsia-500" />
          <h3 className="font-bold">{isRtl ? "مقارنة التكلفة بالإنتاج (BOPD)" : "Cost vs Production (BOPD) Comparison"}</h3>
        </div>
        
        {roiClaims.length === 0 ? (
          <p className="text-slate-500 text-sm">{isRtl ? "لا توجد بيانات متاحة لعرض تحليلات العائد على الاستثمار." : "No ROI data available yet."}</p>
        ) : (
          <div className="space-y-6">
            {roiClaims.map(claim => {
              const bopdProgress = claim.actualBopdAdded || 0;
              const targetBopd = claim.targetBopdIncrease || 1; // avoid div by 0
              const percentage = Math.min(100, Math.round((bopdProgress / targetBopd) * 100));
              
              return (
                <div key={claim.id} className="border border-slate-100 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-sm">{claim.code} - {claim.company}</span>
                    <span className="text-xs text-slate-500 font-mono">{claim.claimedValue}</span>
                  </div>
                  <div className="mb-2 flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>{isRtl ? "الإنتاج الفعلي" : "Actual BOPD"}: {bopdProgress}</span>
                    <span>{isRtl ? "الهدف" : "Target"}: {targetBopd}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div 
                      className="bg-fuchsia-500 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
