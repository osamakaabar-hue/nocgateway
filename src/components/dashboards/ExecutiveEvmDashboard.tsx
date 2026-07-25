import React, { useState, useMemo } from 'react';
import { ProjectEvmMetrics, PortfolioEvmSummary, calculateEvmMetrics } from '../../types/evmTypes';

// ── Mock Data: $1.119B National Oil Corporation Expansion Portfolio ──────────

const DEMO_PROJECTS: ProjectEvmMetrics[] = [
  calculateEvmMetrics(
    'PROJ-WAHA-001',
    'North Gialo Field Expansion',
    'مشروع توسعة حقل جالو الشمالي',
    'WAHA',
    350_000_000, // BAC
    240_000_000, // PV
    220_000_000, // EV
    245_000_000, // AC -> CPI: 0.898 (OVER BUDGET)
    14, 11, 3, 52.4
  ),
  calculateEvmMetrics(
    'PROJ-AGOCO-002',
    'Sarir Main Oil Terminal Upgrade',
    'تحديث محطة السرير الرئيسية للتصدير',
    'AGOCO',
    280_000_000,
    210_000_000,
    215_000_000,
    195_000_000, // AC -> CPI: 1.103 (UNDER BUDGET)
    18, 17, 1, 31.2
  ),
  calculateEvmMetrics(
    'PROJ-SIRTE-003',
    'Marsa El-Brega Gas Facility Refurbishment',
    'تأهيل مجمع مرسى البريقة للغاز',
    'SIRTE',
    185_000_000,
    140_000_000,
    125_000_000,
    138_000_000, // AC -> CPI: 0.906 (OVER BUDGET)
    12, 8, 4, 58.1
  ),
  calculateEvmMetrics(
    'PROJ-MELLITAH-004',
    'Bahr Essalam Offshore Platform Phase II',
    'منصة بحر السلام البحرية - المرحلة الثانية',
    'MELLITAH',
    190_000_000,
    130_000_000,
    135_000_000,
    128_000_000, // AC -> CPI: 1.055
    10, 10, 0, 24.0
  ),
  calculateEvmMetrics(
    'PROJ-ZALLAF-005',
    'Erawin Field Early Production Facility',
    'إنشاء مرافق الإنتاج المبكر بحقل إيراوين',
    'ZALLAF',
    114_000_000,
    85_000_000,
    72_000_000,
    81_000_000, // AC -> CPI: 0.889 (OVER BUDGET)
    9, 6, 3, 61.5
  ),
];

export const ExecutiveEvmDashboard: React.FC = () => {
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SLA_BOTTLENECKS' | 'PROJECT_DEEP_DIVE'>('OVERVIEW');

  // Filter projects by subsidiary
  const filteredProjects = useMemo(() => {
    if (selectedSubsidiary === 'ALL') return DEMO_PROJECTS;
    return DEMO_PROJECTS.filter((p) => p.subsidiaryId === selectedSubsidiary);
  }, [selectedSubsidiary]);

  // Aggregate Portfolio Metrics
  const summary: PortfolioEvmSummary = useMemo(() => {
    const portfolioBac = filteredProjects.reduce((s, p) => s + p.budgetAtCompletion, 0);
    const portfolioPv  = filteredProjects.reduce((s, p) => s + p.plannedValue, 0);
    const portfolioEv  = filteredProjects.reduce((s, p) => s + p.earnedValue, 0);
    const portfolioAc  = filteredProjects.reduce((s, p) => s + p.actualCost, 0);
    const portfolioCv  = portfolioEv - portfolioAc;
    const portfolioSv  = portfolioEv - portfolioPv;

    const portfolioCpi = portfolioAc > 0 ? Number((portfolioEv / portfolioAc).toFixed(3)) : 1.0;
    const portfolioSpi = portfolioPv > 0 ? Number((portfolioEv / portfolioPv).toFixed(3)) : 1.0;

    const portfolioEac = portfolioCpi > 0 ? portfolioBac / portfolioCpi : portfolioBac;
    const portfolioVac = portfolioBac - portfolioEac;
    const totalSlaBreaches = filteredProjects.reduce((s, p) => s + p.slaBreachedClaimsCount, 0);

    let healthStatus: PortfolioEvmSummary['healthStatus'] = 'HEALTHY';
    if (portfolioCpi < 0.95 || portfolioSpi < 0.95 || totalSlaBreaches > 5) {
      healthStatus = 'CRITICAL';
    } else if (portfolioCpi < 1.0 || portfolioSpi < 1.0 || totalSlaBreaches > 2) {
      healthStatus = 'NEEDS_ATTENTION';
    }

    return {
      portfolioBac,
      portfolioPv,
      portfolioEv,
      portfolioAc,
      portfolioCv,
      portfolioSv,
      portfolioCpi,
      portfolioSpi,
      portfolioEac,
      portfolioVac,
      totalSlaBreaches,
      healthStatus,
      projects: filteredProjects,
    };
  }, [filteredProjects]);

  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 1_000_000_000) {
      return `$${(val / 1_000_000_000).toFixed(3)}B`;
    }
    return `$${(val / 1_000_000).toFixed(1)}M`;
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-6 space-y-6 font-sans">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full uppercase tracking-wider">
              PMBOK 7th Edition Standard
            </span>
            <span className="text-xs text-slate-400">Portfolio Baseline: $1.119 Billion</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            NOC Executive EVM & SLA Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            لوحة المتابعة التنفيذية لقياس القيمة المكتسبة وإدارة اختناقات اتفاقية مستوى الخدمة (Form 2 → Form 4 → Form 3)
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Operating Unit:</label>
          <select
            value={selectedSubsidiary}
            onChange={(e) => setSelectedSubsidiary(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="ALL">All Subsidiaries ($1.119B)</option>
            <option value="WAHA">Waha Oil Company (WAHA)</option>
            <option value="AGOCO">Arabian Gulf Oil Company (AGOCO)</option>
            <option value="SIRTE">Sirte Oil Company (SIRTE)</option>
            <option value="MELLITAH">Mellitah Oil & Gas (MELLITAH)</option>
            <option value="ZALLAF">Zallaf Libya (ZALLAF)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Planned Value vs Earned Value */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs text-slate-400 font-medium">Earned Value (EV) / Planned (PV)</div>
          <div className="text-2xl font-bold text-white mt-1">
            {formatCurrency(summary.portfolioEv)}
            <span className="text-xs font-normal text-slate-400 ml-2">/ {formatCurrency(summary.portfolioPv)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-800/80 pt-2">
            <span className="text-slate-400">Schedule Variance (SV):</span>
            <span className={summary.portfolioSv >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {summary.portfolioSv >= 0 ? `+${formatCurrency(summary.portfolioSv)}` : formatCurrency(summary.portfolioSv)}
            </span>
          </div>
        </div>

        {/* CPI Index (HIGHLIGHT CRITICAL REQUIREMENT: Red if CPI < 1.0) */}
        <div className={`border rounded-xl p-4 shadow-sm relative overflow-hidden transition-all ${
          summary.portfolioCpi < 1.0
            ? 'bg-rose-950/20 border-rose-800/50 text-rose-200'
            : 'bg-slate-900/80 border-slate-800 text-slate-100'
        }`}>
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-slate-400">Cost Performance Index (CPI)</div>
            {summary.portfolioCpi < 1.0 && (
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold rounded uppercase border border-rose-500/30 animate-pulse">
                Over Budget
              </span>
            )}
          </div>
          <div className={`text-3xl font-extrabold mt-1 ${
            summary.portfolioCpi < 1.0 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {summary.portfolioCpi.toFixed(3)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs border-t border-slate-800/80 pt-2">
            <span className="text-slate-400">Formula: EV / AC</span>
            <span className="text-slate-300">Cost Var: {formatCurrency(summary.portfolioCv)}</span>
          </div>
        </div>

        {/* SPI Index */}
        <div className={`border rounded-xl p-4 shadow-sm relative overflow-hidden transition-all ${
          summary.portfolioSpi < 1.0
            ? 'bg-amber-950/20 border-amber-800/50 text-amber-200'
            : 'bg-slate-900/80 border-slate-800 text-slate-100'
        }`}>
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-slate-400">Schedule Performance Index (SPI)</div>
            {summary.portfolioSpi < 1.0 && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded uppercase border border-amber-500/30">
                Behind Schedule
              </span>
            )}
          </div>
          <div className={`text-3xl font-extrabold mt-1 ${
            summary.portfolioSpi < 1.0 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {summary.portfolioSpi.toFixed(3)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs border-t border-slate-800/80 pt-2">
            <span className="text-slate-400">Formula: EV / PV</span>
            <span className="text-slate-300">BAC: {formatCurrency(summary.portfolioBac)}</span>
          </div>
        </div>

        {/* SLA Bottleneck Alert Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-400 font-medium">SLA Compliance (48h Form 2 → Form 4)</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white">{summary.totalSlaBreaches}</span>
            <span className="text-xs text-rose-400 font-semibold">Active Breaches (&gt;48 business hrs)</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-800/80 pt-2">
            <span className="text-slate-400">Libya Business Week:</span>
            <span className="text-emerald-400 font-medium">Sun–Thu (Fri/Sat Excluded)</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 transition-colors relative ${
            activeTab === 'OVERVIEW'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          EVM Project Performance Matrix
        </button>
        <button
          onClick={() => setActiveTab('SLA_BOTTLENECKS')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeTab === 'SLA_BOTTLENECKS'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          SLA Workflow Bottlenecks
          {summary.totalSlaBreaches > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-xs rounded-full border border-rose-500/30">
              {summary.totalSlaBreaches}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: EVM Detailed Matrix Table */}
      {activeTab === 'OVERVIEW' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
            <h3 className="text-sm font-semibold text-white">Project EVM Metrics Breakdown (PMBOK 7th Edition)</h3>
            <span className="text-xs text-slate-400">Total Projects: {summary.projects.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Project / Subsidiary</th>
                  <th className="py-3 px-4">BAC</th>
                  <th className="py-3 px-4">PV (Planned)</th>
                  <th className="py-3 px-4">EV (Earned)</th>
                  <th className="py-3 px-4">AC (Actual)</th>
                  <th className="py-3 px-4">CPI (EV/AC)</th>
                  <th className="py-3 px-4">SPI (EV/PV)</th>
                  <th className="py-3 px-4">EAC (Forecast)</th>
                  <th className="py-3 px-4">SLA Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {summary.projects.map((p) => {
                  const isCpiOverBudget = p.costPerformanceIndex < 1.0;
                  const isSpiBehind = p.schedulePerformanceIndex < 1.0;

                  return (
                    <tr key={p.projectId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div>{p.projectNameEn}</div>
                        <div className="text-[11px] text-slate-400">{p.projectNameAr} • <span className="text-slate-300 font-semibold">{p.subsidiaryId}</span></div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">{formatCurrency(p.budgetAtCompletion)}</td>
                      <td className="py-3.5 px-4 font-mono">{formatCurrency(p.plannedValue)}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">{formatCurrency(p.earnedValue)}</td>
                      <td className="py-3.5 px-4 font-mono">{formatCurrency(p.actualCost)}</td>
                      
                      {/* CPI Column — Highlighted in Red if < 1.0 */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded font-bold font-mono border ${
                          isCpiOverBudget
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                            : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                        }`}>
                          {p.costPerformanceIndex.toFixed(3)}
                        </span>
                      </td>

                      {/* SPI Column */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded font-bold font-mono border ${
                          isSpiBehind
                            ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                            : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                        }`}>
                          {p.schedulePerformanceIndex.toFixed(3)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                        {formatCurrency(p.estimateAtCompletion)}
                      </td>

                      <td className="py-3.5 px-4">
                        {p.slaBreachedClaimsCount > 0 ? (
                          <span className="px-2 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded text-[11px] font-semibold">
                            {p.slaBreachedClaimsCount} Breaches
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-semibold">
                            Compliant
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: SLA Bottleneck Monitoring */}
      {activeTab === 'SLA_BOTTLENECKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">
              Form 2 (Subsidiary Submission) → Form 4 (PMO Technical Approval) Bottlenecks
            </h3>
            <p className="text-xs text-slate-400">
              SLA Rule: PMO Auditor must issue Form 4 within 48 business hours (excl. Friday/Saturday) after Form 2 submission by subsidiary_pm.
            </p>

            <div className="space-y-3">
              {summary.projects.flatMap(p => p.slaBreachedClaimsCount > 0 ? [{
                claimId: `CLM-${p.projectId.slice(-3)}-089`,
                project: p.projectNameEn,
                subsidiary: p.subsidiaryId,
                submittedAt: '2026-07-20T09:00:00.000Z',
                elapsedBusinessHours: p.avgSlaResolutionHours,
                status: 'SLA_BREACH'
              }] : []).map((b, i) => (
                <div key={i} className="p-4 bg-rose-950/20 border border-rose-800/40 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-400 text-sm">{b.claimId}</span>
                      <span className="text-xs px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded font-medium">{b.subsidiary}</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1">{b.project}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Submitted: {new Date(b.submittedAt).toLocaleDateString()}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-rose-400">{b.elapsedBusinessHours} hrs</div>
                    <div className="text-[10px] text-rose-300 uppercase font-semibold">Exceeds 48h SLA Target</div>
                    <button className="mt-2 text-xs px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium transition-colors">
                      Notify PMO Auditor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SLA Rule Summary Box */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-3">SLA Governance Policy</h3>
            <div className="text-xs text-slate-300 space-y-2">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-semibold text-emerald-400">Business Hours Definition</div>
                <div className="text-slate-400 mt-0.5">08:00 – 16:00 UTC (8 hrs/day)</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-semibold text-emerald-400">Libyan Weekend Calendar</div>
                <div className="text-slate-400 mt-0.5">Friday & Saturday excluded from SLA timer</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="font-semibold text-rose-400">Audit Trail Trigger</div>
                <div className="text-slate-400 mt-0.5">Automated SLA_BREACH block logged to SHA-256 audit chain</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExecutiveEvmDashboard;
