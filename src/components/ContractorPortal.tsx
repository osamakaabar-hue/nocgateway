import React from "react";
import { Claim, DemoUser } from "../types";
import { Lock } from "lucide-react";

export default function ContractorPortal({ claims, currentUser, isRtl }: { claims: Claim[], currentUser: DemoUser | null, isRtl: boolean }) {
  // Filter claims that belong to this contractor and are in 'safe_side_reserved' or 'bank_cleared'
  const contractorClaims = claims.filter(c => 
    c.contractorId === currentUser?.companyId && 
    (c.status === "safe_side_reserved" || c.status === "bank_cleared")
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">{isRtl ? "بوابة المقاولين (الجانب الآمن)" : "Contractor Portal (Safe-Side Escrow)"}</h2>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 mb-6">
          {isRtl ? "هنا يمكنك رؤية أموالك المضمونة والمحجوزة." : "View your guaranteed, reserved funds backed by the NOC."}
        </p>

        {contractorClaims.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
            <Lock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{isRtl ? "لا توجد أموال محجوزة حالياً." : "No reserved funds currently."}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {contractorClaims.map(claim => (
              <div key={claim.id} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{claim.title}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-1">{claim.code} &bull; {claim.company}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-600">{claim.claimedValue}</div>
                  <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-1">
                    {claim.status === "safe_side_reserved" ? (isRtl ? "محجوز وآمن" : "RESERVED & SECURED") : (isRtl ? "تمت التسوية البنكية" : "BANK CLEARED")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
