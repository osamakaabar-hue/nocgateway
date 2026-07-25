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

interface ExecutiveEvmDashboardProps {
  isRtl?: boolean;
  lang?: 'en' | 'ar';
  currentUser?: import('../../types').DemoUser | null;
  claims?: import('../../types').Claim[];
  onNavigateToTab?: (tab: any) => void;
  onSelectClaimId?: (id: any) => void;
  setPreviewDoc?: (doc: any) => void;
  addNotification?: (
    title: string,
    message: string,
    type?: 'success' | 'info' | 'warning' | 'error',
    claimId?: string,
    tab?: 'claims' | 'wbs' | 'invoices' | 'lcs' | 'documents' | 'notifications' | 'approval_control_tower',
    targetUserId?: string,
    companyId?: string,
    actionRequired?: boolean,
    priority?: 'high' | 'normal'
  ) => void;
  showToast?: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const ExecutiveEvmDashboard: React.FC<ExecutiveEvmDashboardProps> = ({
  isRtl = false,
  lang = 'en',
  currentUser,
  claims = [],
  onNavigateToTab,
  onSelectClaimId,
  setPreviewDoc,
  addNotification,
  showToast,
}) => {
  // If subsidiary user, force tenant restriction to their company
  const isSubsidiaryUser = currentUser && currentUser.companyId !== 'NOC_HQ';
  const tenantCompanyId = isSubsidiaryUser ? currentUser.companyId : 'ALL';

  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string>(tenantCompanyId);
  const [activeDashboardTab, setActiveDashboardTab] = useState<'OVERVIEW' | 'SLA_BOTTLENECKS' | 'PROJECT_DEEP_DIVE'>('OVERVIEW');
  const [expandedSlaClaimId, setExpandedSlaClaimId] = useState<string | null>(null);

  // Sync selectedSubsidiary if user changes
  React.useEffect(() => {
    if (isSubsidiaryUser) {
      setSelectedSubsidiary(currentUser.companyId);
    }
  }, [currentUser, isSubsidiaryUser]);

  // Filter projects by subsidiary & tenant boundary
  const filteredProjects = useMemo(() => {
    let base = DEMO_PROJECTS;
    if (isSubsidiaryUser) {
      base = DEMO_PROJECTS.filter((p) => p.subsidiaryId === currentUser.companyId);
    } else if (selectedSubsidiary !== 'ALL') {
      base = DEMO_PROJECTS.filter((p) => p.subsidiaryId === selectedSubsidiary);
    }
    return base;
  }, [selectedSubsidiary, isSubsidiaryUser, currentUser]);

  // Calculate active SLA breaches dynamically based on live signed claims
  const signedClaimsCount = useMemo(() => {
    return claims.filter(c => c.status !== 'pending_gatekeeper' && c.status !== 'draft').length;
  }, [claims]);

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

    const baseSlaBreaches = filteredProjects.reduce((s, p) => s + p.slaBreachedClaimsCount, 0);
    const totalSlaBreaches = Math.max(0, baseSlaBreaches - signedClaimsCount);

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
    <div className="w-full min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full uppercase tracking-wider">
              {isRtl ? 'معيار PMBOK الإصدار السابع' : 'PMBOK 7th Edition Standard'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl ? 'خط الأساس للمحفظة: 1.119 مليار دولار' : 'Portfolio Baseline: $1.119 Billion'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            {isRtl ? 'لوحة قياس القيمة المكتسبة لاتفاقيات مستوى الخدمة (EVM & SLA)' : 'NOC Executive EVM & SLA Dashboard'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isRtl
              ? 'لوحة المتابعة التنفيذية لقياس القيمة المكتسبة وإدارة اختناقات اتفاقية مستوى الخدمة (Form 2 → Form 4 → Form 3)'
              : 'Executive tracking dashboard for Earned Value & SLA Bottlenecks (Form 2 → Form 4 → Form 3)'}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isRtl ? 'الشركة التشغيلية:' : 'Operating Unit:'}
          </label>
          <select
            value={selectedSubsidiary}
            disabled={Boolean(isSubsidiaryUser)}
            onChange={(e) => setSelectedSubsidiary(e.target.value)}
            className="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isSubsidiaryUser ? (
              <option value={currentUser.companyId}>
                {currentUser.company} ({currentUser.companyId})
              </option>
            ) : (
              <>
                <option value="ALL">{isRtl ? 'جميع الشركات ($1.119B)' : 'All Subsidiaries ($1.119B)'}</option>
                <option value="WAHA">{isRtl ? 'شركة الواحة للنفط (WAHA)' : 'Waha Oil Company (WAHA)'}</option>
                <option value="AGOCO">{isRtl ? 'شركة الخليج العربي للنفط (AGOCO)' : 'Arabian Gulf Oil Company (AGOCO)'}</option>
                <option value="SIRTE">{isRtl ? 'شركة سرت لإنتاج وتصنيع النفط والغاز (SIRTE)' : 'Sirte Oil Company (SIRTE)'}</option>
                <option value="MELLITAH">{isRtl ? 'شركة مليتة للنفط والغاز (MELLITAH)' : 'Mellitah Oil & Gas (MELLITAH)'}</option>
                <option value="ZALLAF">{isRtl ? 'شركة زلاف ليبيا (ZALLAF)' : 'Zallaf Libya (ZALLAF)'}</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Planned Value vs Earned Value */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isRtl ? 'القيمة المكتسبة (EV) / المخططة (PV)' : 'Earned Value (EV) / Planned (PV)'}
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatCurrency(summary.portfolioEv)}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2">/ {formatCurrency(summary.portfolioPv)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-200 dark:border-slate-800/80 pt-2">
            <span className="text-slate-500 dark:text-slate-400">{isRtl ? 'انحراف الجدول (SV):' : 'Schedule Variance (SV):'}</span>
            <span className={summary.portfolioSv >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-600 dark:text-rose-400 font-semibold'}>
              {summary.portfolioSv >= 0 ? `+${formatCurrency(summary.portfolioSv)}` : formatCurrency(summary.portfolioSv)}
            </span>
          </div>
        </div>

        {/* CPI Index (HIGHLIGHT CRITICAL REQUIREMENT: Red if CPI < 1.0) */}
        <div className={`border rounded-xl p-4 shadow-sm relative overflow-hidden transition-all ${
          summary.portfolioCpi < 1.0
            ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-200'
            : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
        }`}>
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isRtl ? 'مؤشر الأداء المالي (CPI)' : 'Cost Performance Index (CPI)'}
            </div>
            {summary.portfolioCpi < 1.0 && (
              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded uppercase border border-rose-500/30 animate-pulse">
                {isRtl ? 'تجاوز الميزانية' : 'Over Budget'}
              </span>
            )}
          </div>
          <div className={`text-3xl font-extrabold mt-1 ${
            summary.portfolioCpi < 1.0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {summary.portfolioCpi.toFixed(3)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs border-t border-slate-200 dark:border-slate-800/80 pt-2">
            <span className="text-slate-500 dark:text-slate-400">{isRtl ? 'المعادلة: EV / AC' : 'Formula: EV / AC'}</span>
            <span className="text-slate-700 dark:text-slate-300">{isRtl ? 'تباين التكلفة: ' : 'Cost Var: '}{formatCurrency(summary.portfolioCv)}</span>
          </div>
        </div>

        {/* SPI Index */}
        <div className={`border rounded-xl p-4 shadow-sm relative overflow-hidden transition-all ${
          summary.portfolioSpi < 1.0
            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200'
            : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
        }`}>
          <div className="flex justify-between items-start">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isRtl ? 'مؤشر الأداء الزمني (SPI)' : 'Schedule Performance Index (SPI)'}
            </div>
            {summary.portfolioSpi < 1.0 && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded uppercase border border-amber-500/30">
                {isRtl ? 'متأخر عن الجدول' : 'Behind Schedule'}
              </span>
            )}
          </div>
          <div className={`text-3xl font-extrabold mt-1 ${
            summary.portfolioSpi < 1.0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {summary.portfolioSpi.toFixed(3)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs border-t border-slate-200 dark:border-slate-800/80 pt-2">
            <span className="text-slate-500 dark:text-slate-400">{isRtl ? 'المعادلة: EV / PV' : 'Formula: EV / PV'}</span>
            <span className="text-slate-700 dark:text-slate-300">BAC: {formatCurrency(summary.portfolioBac)}</span>
          </div>
        </div>

        {/* SLA Bottleneck Alert Card */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isRtl ? 'امتثال SLA (48 ساعة Form 2 → Form 4)' : 'SLA Compliance (48h Form 2 → Form 4)'}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{summary.totalSlaBreaches}</span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              {isRtl ? 'خرق نشط (أكثر من 48 ساعة عمل)' : 'Active Breaches (>48 business hrs)'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-200 dark:border-slate-800/80 pt-2">
            <span className="text-slate-500 dark:text-slate-400">{isRtl ? 'أسبوع العمل في ليبيا:' : 'Libya Business Week:'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {isRtl ? 'الأحد - الخميس (الجمعة/السبت مستثناة)' : 'Sun–Thu (Fri/Sat Excluded)'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveDashboardTab('OVERVIEW')}
          className={`pb-3 transition-colors relative ${
            activeDashboardTab === 'OVERVIEW'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {isRtl ? 'مصفوفة أداء القيمة المكتسبة (EVM)' : 'EVM Project Performance Matrix'}
        </button>
        <button
          onClick={() => setActiveDashboardTab('SLA_BOTTLENECKS')}
          className={`pb-3 transition-colors relative flex items-center gap-2 ${
            activeDashboardTab === 'SLA_BOTTLENECKS'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {isRtl ? 'اختناقات مسار العمل (SLA Bottlenecks)' : 'SLA Workflow Bottlenecks'}
          {summary.totalSlaBreaches > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-full border border-rose-500/30">
              {summary.totalSlaBreaches}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: EVM Detailed Matrix Table */}
      {activeDashboardTab === 'OVERVIEW' && (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/90">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {isRtl ? 'تفاصيل مقاييس القيمة المكتسبة للمشاريع (PMBOK الإصدار 7)' : 'Project EVM Metrics Breakdown (PMBOK 7th Edition)'}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl ? `إجمالي المشاريع: ${summary.projects.length}` : `Total Projects: ${summary.projects.length}`}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-950 uppercase font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 text-start">{isRtl ? 'المشروع / الشركة' : 'Project / Subsidiary'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الميزانية (BAC)' : 'BAC'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'المخطط (PV)' : 'PV (Planned)'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'المكتسب (EV)' : 'EV (Earned)'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'الفعلي (AC)' : 'AC (Actual)'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'مؤشر التكلفة (CPI)' : 'CPI (EV/AC)'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'مؤشر الوقت (SPI)' : 'SPI (EV/PV)'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'التكلفة المتوقعة (EAC)' : 'EAC (Forecast)'}</th>
                  <th className="py-3 px-4 text-start">{isRtl ? 'حالة SLA' : 'SLA Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {summary.projects.map((p) => {
                  const isCpiOverBudget = p.costPerformanceIndex < 1.0;
                  const isSpiBehind = p.schedulePerformanceIndex < 1.0;

                  return (
                    <tr key={p.projectId} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white text-start">
                        <div>{isRtl ? p.projectNameAr : p.projectNameEn}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isRtl ? p.projectNameEn : p.projectNameAr} • <span className="text-slate-700 dark:text-slate-300 font-semibold">{p.subsidiaryId}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-start">{formatCurrency(p.budgetAtCompletion)}</td>
                      <td className="py-3.5 px-4 font-mono text-start">{formatCurrency(p.plannedValue)}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-start">{formatCurrency(p.earnedValue)}</td>
                      <td className="py-3.5 px-4 font-mono text-start">{formatCurrency(p.actualCost)}</td>
                      
                      {/* CPI Column — Highlighted in Red if < 1.0 */}
                      <td className="py-3.5 px-4 text-start">
                        <span className={`px-2.5 py-1 rounded font-bold font-mono border ${
                          isCpiOverBudget
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                        }`}>
                          {p.costPerformanceIndex.toFixed(3)}
                        </span>
                      </td>

                      {/* SPI Column */}
                      <td className="py-3.5 px-4 text-start">
                        <span className={`px-2.5 py-1 rounded font-bold font-mono border ${
                          isSpiBehind
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                        }`}>
                          {p.schedulePerformanceIndex.toFixed(3)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200 text-start">
                        {formatCurrency(p.estimateAtCompletion)}
                      </td>

                      <td className="py-3.5 px-4 text-start">
                        {p.slaBreachedClaimsCount > 0 ? (
                          <span className="px-2 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded text-[11px] font-semibold">
                            {isRtl ? `${p.slaBreachedClaimsCount} خرق SLA` : `${p.slaBreachedClaimsCount} Breaches`}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-semibold">
                            {isRtl ? 'مطابق لـ SLA' : 'Compliant'}
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
      {activeDashboardTab === 'SLA_BOTTLENECKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              {isRtl
                ? 'اختناقات المسار: نموذج 2 (تقديم الشركة) ← نموذج 4 (اعتماد التدقيق الفني)'
                : 'Form 2 (Subsidiary Submission) → Form 4 (PMO Technical Approval) Bottlenecks'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRtl
                ? 'قاعدة SLA: يجب على مدقق المكتب الهندسي إصدار نموذج 4 خلال 48 ساعة عمل (باستثناء الجمعة والسبت) من تقديم النموذج 2.'
                : 'SLA Rule: PMO Auditor must issue Form 4 within 48 business hours (excl. Friday/Saturday) after Form 2 submission by subsidiary_pm.'}
            </p>

            <div className="space-y-3">
              {summary.projects.flatMap(p => {
                if (p.slaBreachedClaimsCount <= 0) return [];

                // Find matching live claims for this subsidiary
                const matchingClaims = claims.filter(c => c.companyId === p.subsidiaryId || c.company.includes(p.subsidiaryId));
                
                const items = [];

                for (let idx = 0; idx < p.slaBreachedClaimsCount; idx++) {
                  const matchingClaim = matchingClaims[idx];
                  const isSigned = matchingClaim ? (matchingClaim.status !== 'pending_gatekeeper' && matchingClaim.status !== 'draft') : false;

                  // Skip any claim that has already been signed by Eng. Nadia!
                  if (isSigned) continue;

                  const claimCode = matchingClaim ? matchingClaim.code : `${p.subsidiaryId}-26-00${idx + 1}`;
                  const claimId = matchingClaim ? matchingClaim.id : `claim-${p.subsidiaryId.toLowerCase()}-${idx + 1}`;

                  items.push({
                    claimId: claimCode,
                    realClaimId: claimId,
                    projectEn: p.projectNameEn,
                    projectAr: p.projectNameAr,
                    project: isRtl ? p.projectNameAr : p.projectNameEn,
                    subsidiary: p.subsidiaryId,
                    submittedAt: matchingClaim ? matchingClaim.submissionDate : '2026-07-20T09:00:00.000Z',
                    elapsedBusinessHours: Number((p.avgSlaResolutionHours + (idx * 5.2)).toFixed(1)),
                    bac: p.budgetAtCompletion,
                    ev: p.earnedValue,
                    ac: p.actualCost,
                    cpi: p.costPerformanceIndex,
                    spi: p.schedulePerformanceIndex,
                    pendingStage: isRtl ? 'بانتظار نموذج 4 (الاعتماد الفني للمكتب الهندسي)' : 'Pending Form 4 (PMO Technical Approval)',
                    assignedActor: isRtl ? 'م. نادية الكوت (مدقق فني)' : 'Eng. Nadia Al-Kout (PMO Auditor)',
                    status: 'SLA_BREACH'
                  });
                }
                return items;
              }).map((b, i) => {
                const isExpanded = expandedSlaClaimId === b.claimId;
                return (
                  <div
                    key={i}
                    className={`border rounded-xl transition-all duration-200 shadow-sm ${
                      isExpanded
                        ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/60 ring-2 ring-rose-500/20'
                        : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 hover:border-rose-300 dark:hover:border-rose-700'
                    }`}
                  >
                    {/* Primary Card Header Row */}
                    <div
                      onClick={() => setExpandedSlaClaimId(prev => prev === b.claimId ? null : b.claimId)}
                      className="p-4 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          className="p-1 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 transition-transform"
                          title={isRtl ? 'عرض التاصيل الحالية' : 'Toggle Pending Details'}
                        >
                          {isExpanded ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-rose-700 dark:text-rose-400 text-sm">{b.claimId}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 rounded-full font-mono font-bold">
                              {b.subsidiary}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded font-semibold">
                              {b.pendingStage}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{b.project}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {isRtl ? `تاريخ التقديم: ${new Date(b.submittedAt).toLocaleDateString('ar-LY')}` : `Submitted: ${new Date(b.submittedAt).toLocaleDateString()}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-end">
                          <div className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{b.elapsedBusinessHours} {isRtl ? 'ساعة' : 'hrs'}</div>
                          <div className="text-[10px] text-rose-600 dark:text-rose-300 uppercase font-semibold">
                            {isRtl ? 'تجاوز حد 48h المحدد' : 'Exceeds 48h SLA Target'}
                          </div>
                        </div>

                        {/* Action Button: PMO Auditor signs Form 4 directly; Subsidiary PMs see read-only Pending Audit status */}
                        {currentUser?.role === 'pmo_auditor' || currentUser?.role === 'system_admin' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const hostClaim = claims.find(c => c.code === b.claimId || c.id === b.claimId || c.companyId === b.subsidiary) || claims[0];
                              if (hostClaim && setPreviewDoc) {
                                const form4Doc = hostClaim.documents.find(d => d.name.startsWith("Form_4_Technical_Approval_") || d.document_type === "technical_approval_form") || {
                                  id: `doc-form4-${hostClaim.id}`,
                                  name: `Form_4_Technical_Approval_${hostClaim.code}.pdf`,
                                  size: "1.2 MB",
                                  uploadedAt: "Now",
                                  type: "PDF" as const,
                                  url: `/noc_vault/evidence/Form_4_Technical_Approval_${hostClaim.code}.pdf`,
                                  document_type: "technical_approval_form",
                                  claimId: hostClaim.id
                                };
                                setPreviewDoc(form4Doc);
                              } else {
                                if (onSelectClaimId) onSelectClaimId(b.realClaimId);
                                if (onNavigateToTab) onNavigateToTab("approval_control_tower");
                              }
                              if (showToast) {
                                showToast(
                                  isRtl
                                    ? `جارٍ فتح نموذج اعتماد التدقيق الفني (Form 4) للمطالبة ${b.claimId}.`
                                    : `Opening Form 4 Technical Audit review modal for claim ${b.claimId}.`,
                                  "info"
                                );
                              }
                            }}
                            className="text-xs px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all shadow cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            {isRtl ? 'مراجعة واعتماد (نموذج 4)' : 'Review & Sign (Form 4)'}
                          </button>
                        ) : (
                          <span className="text-[11px] px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-lg border border-slate-200 dark:border-slate-700/80 shadow-xs shrink-0 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            {isRtl ? 'قيد مراجعة المؤسسة' : 'Pending NOC Audit'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expandable SLA Bottleneck Detailed Breakdown */}
                    {isExpanded && (
                      <div className="p-4 border-t border-rose-200 dark:border-rose-800/60 bg-white/80 dark:bg-slate-900/90 rounded-b-xl space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <span className="text-[10px] text-slate-400 font-bold block">{isRtl ? 'المسؤول المكلف بالاعتماد' : 'Assigned Reviewer'}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{b.assignedActor}</span>
                          </div>
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <span className="text-[10px] text-slate-400 font-bold block">{isRtl ? 'مؤشر الأداء المالي (CPI)' : 'Cost Index (CPI)'}</span>
                            <span className={`font-mono font-bold ${b.cpi < 1.0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
                              {b.cpi.toFixed(3)} ({b.cpi < 1.0 ? (isRtl ? 'تجاوز مالي' : 'Over Budget') : (isRtl ? 'سليم' : 'Normal')})
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                            <span className="text-[10px] text-slate-400 font-bold block">{isRtl ? 'مؤشر الجدول الزمني (SPI)' : 'Schedule Index (SPI)'}</span>
                            <span className={`font-mono font-bold ${b.spi < 1.0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'}`}>
                              {b.spi.toFixed(3)} ({b.spi < 1.0 ? (isRtl ? 'متأخر زمنياً' : 'Behind') : (isRtl ? 'سليم' : 'Normal')})
                            </span>
                          </div>
                        </div>

                        {/* Detailed Bottleneck Explanation */}
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs leading-relaxed text-amber-900 dark:text-amber-200 flex items-start gap-2">
                          <span className="font-bold shrink-0 text-amber-600 dark:text-amber-400">ℹ️ {isRtl ? 'تفاصيل الاختناق:' : 'Bottleneck Reason:'}</span>
                          <span>
                            {isRtl
                              ? `تم تقديم مطالبة نسب الإنجاز (Form 2) بواسطة شركة ${b.subsidiary} بتاريخ 2026/07/20. يتطلب إجراء الحوكمة مراجعة المطابقة الفنية وإيقاع الختم التشفيري لنموذج Form 4 بواسطة المكتب الهندسي للمؤسسة. الوقت المنقضي الفعلي (${b.elapsedBusinessHours} ساعة عمل) يتجاوز الحد الأقصى المسموح به في اتفاقية مستوى الخدمة (48 ساعة).`
                              : `Progress claim Form 2 was submitted by ${b.subsidiary} on July 20, 2026. Governance rules require technical audit verification and cryptographic stamp on Form 4 by NOC PMO. Total elapsed business time (${b.elapsedBusinessHours} hrs) exceeds the 48-hour SLA threshold.`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SLA Rule Summary Box */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              {isRtl ? 'سياسة حوكمة اتفاقية مستوى الخدمة' : 'SLA Governance Policy'}
            </h3>
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">{isRtl ? 'تعريف ساعات العمل' : 'Business Hours Definition'}</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">{isRtl ? '08:00 – 16:00 بتوقيت ليبيا (8 ساعات/يوم)' : '08:00 – 16:00 UTC (8 hrs/day)'}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-emerald-600 dark:text-emerald-400">{isRtl ? 'التقويم والأطلة الأسبوعية في ليبيا' : 'Libyan Weekend Calendar'}</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">{isRtl ? 'يومي الجمعة والسبت مستثناة من مؤقت SLA' : 'Friday & Saturday excluded from SLA timer'}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-rose-600 dark:text-rose-400">{isRtl ? 'تسجيل الخرق في سجل الأمان' : 'Audit Trail Trigger'}</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">{isRtl ? 'يتم توثيق خرق SLA تلقائياً في سلسلة التشفير SHA-256' : 'Automated SLA_BREACH block logged to SHA-256 audit chain'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExecutiveEvmDashboard;
