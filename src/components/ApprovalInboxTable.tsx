import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUpRight, Search } from 'lucide-react';
import WorkflowStepper from './WorkflowStepper';

// ─── 1. TypeScript Interfaces ────────────────────────────────────────────────

export type StageType = 'FORM_2' | 'FORM_4' | 'FORM_3' | 'STEERING_COMMITTEE' | 'BANK_DISBURSEMENT' | 'COMPLETED';

export interface PendingApprovalItem {
  claimId: string;
  claimCode: string;
  companyId: string;
  companyName: string;
  projectName: string;
  wbsCode: string;
  formTypeNeeded: 'FORM_4_TECHNICAL' | 'FORM_3_FINANCE' | 'FORM_2_GATEKEEPER' | 'STEERING_COMMITTEE';
  requestedAmount: number;
  submittedAt: string;
  currentActorRole: string;
  rawStatus?: string;
}

export interface SlaTrafficLight {
  status: 'GREEN' | 'YELLOW' | 'RED';
  labelEn: string;
  labelAr: string;
  badgeClass: string;
  hoursElapsed: number;
}

export function getSlaTrafficLight(submittedAtIso: string, nowMs = Date.now()): SlaTrafficLight {
  const submitted = new Date(submittedAtIso).getTime();
  const elapsedHours = isNaN(submitted) ? 0 : Math.max(0, (nowMs - submitted) / (1000 * 60 * 60));

  if (elapsedHours < 24) {
    return {
      status: 'GREEN',
      labelEn: '< 24h Normal',
      labelAr: 'أقل من 24 ساعة (طبيعي)',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      hoursElapsed: Number(elapsedHours.toFixed(1)),
    };
  } else if (elapsedHours <= 48) {
    return {
      status: 'YELLOW',
      labelEn: '24-48h Attention',
      labelAr: '24-48 ساعة (تنبيه)',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      hoursElapsed: Number(elapsedHours.toFixed(1)),
    };
  } else {
    return {
      status: 'RED',
      labelEn: '> 48h SLA Breach',
      labelAr: 'أكثر من 48 ساعة (خرق SLA)',
      badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse',
      hoursElapsed: Number(elapsedHours.toFixed(1)),
    };
  }
}

// Helper translation placeholder
const t = (key: string, fallback: string, lang = 'en') => fallback;

// ─── 2. Component: ExpandableTableRow.tsx (Inlined for modularity) ─────────

interface ExpandableTableRowProps {
  item: PendingApprovalItem;
  lang: 'en' | 'ar';
  currentUserRole?: string;
  isHighlighted?: boolean;
  onActionClick?: (item: PendingApprovalItem) => void;
  isInitiallyExpanded?: boolean;
}

export const ExpandableTableRow: React.FC<ExpandableTableRowProps> = ({
  item,
  lang,
  currentUserRole = 'pmo_auditor',
  isHighlighted = false,
  onActionClick,
  isInitiallyExpanded = false,
}) => {
  const isRtl = lang === 'ar';
  const [isExpanded, setIsExpanded] = useState<boolean>(isInitiallyExpanded || isHighlighted);
  const sla = getSlaTrafficLight(item.submittedAt);

  const formatMoney = (val: number) => `$${val.toLocaleString()}`;

  const computedStage: StageType =
    item.rawStatus === 'authorized_for_payment'
      ? 'STEERING_COMMITTEE'
      : item.rawStatus === 'bank_cleared'
      ? 'BANK_DISBURSEMENT'
      : item.rawStatus === 'approved' || item.rawStatus === 'pending_financial_audit'
      ? 'FORM_3'
      : item.formTypeNeeded === 'FORM_4_TECHNICAL'
      ? 'FORM_4'
      : item.formTypeNeeded === 'FORM_3_FINANCE'
      ? 'FORM_3'
      : item.formTypeNeeded === 'STEERING_COMMITTEE'
      ? 'STEERING_COMMITTEE'
      : 'FORM_2';

  return (
    <>
      {/* Primary Table Data Row */}
      <tr
        id={`claim-row-${item.claimId}`}
        onClick={() => setIsExpanded((prev) => !prev)}
        className={`transition-colors cursor-pointer select-none group border-b ${
          isHighlighted
            ? 'bg-amber-500/15 dark:bg-amber-500/20 border-amber-500/50 shadow-md ring-2 ring-amber-500/40 animate-pulse'
            : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50 border-slate-200 dark:border-slate-800/60'
        }`}
      >
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-3">
            <button
              aria-label="Expand workflow"
              className="p-1 rounded bg-slate-200 dark:bg-slate-800/80 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div>
              <div className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-2">
                <span>{item.claimCode}</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{item.companyName}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-xs">{item.projectName}</div>
            </div>
          </div>
        </td>

        <td className="py-3.5 px-4 font-mono font-semibold text-amber-600 dark:text-amber-400">{item.wbsCode}</td>

        <td className="py-3.5 px-4">
          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded text-[11px] font-bold text-slate-800 dark:text-slate-200">
            {item.formTypeNeeded === 'FORM_4_TECHNICAL'
              ? (lang === 'ar' ? 'نموذج 4 (فني)' : 'Form 4 (Technical)')
              : item.formTypeNeeded === 'FORM_3_FINANCE'
              ? (lang === 'ar' ? 'نموذج 3 (مالي)' : 'Form 3 (Finance)')
              : (lang === 'ar' ? 'نموذج 2 (تدقيق)' : 'Form 2 (Gatekeeper)')}
          </span>
        </td>

        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
          {formatMoney(item.requestedAmount)}
        </td>

        <td className="py-3.5 px-4">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${sla.badgeClass}`}>
            {sla.hoursElapsed}h — {isRtl ? sla.labelAr : sla.labelEn}
          </span>
        </td>

        <td className="py-3.5 px-4 text-end">
          {(() => {
            const canUserSign =
              (item.formTypeNeeded === 'FORM_4_TECHNICAL' && (currentUserRole === 'pmo_auditor' || currentUserRole === 'system_admin')) ||
              (item.formTypeNeeded === 'FORM_3_FINANCE' && (currentUserRole === 'noc_finance' || currentUserRole === 'noc_head_of_accounts' || currentUserRole === 'system_admin')) ||
              (item.formTypeNeeded === 'FORM_2_GATEKEEPER' && (currentUserRole === 'subsidiary_pm' || currentUserRole === 'system_admin')) ||
              (computedStage === 'STEERING_COMMITTEE' && (currentUserRole === 'steering_committee' || currentUserRole === 'system_admin'));

            return (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onActionClick) onActionClick(item);
                }}
                className={`px-3.5 py-1.5 rounded font-bold text-xs shadow transition-colors inline-flex items-center gap-1 cursor-pointer ${
                  canUserSign
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {canUserSign
                  ? (isRtl ? 'مراجعة واعتماد' : 'Review & Sign')
                  : (isRtl ? 'معاينة النموذج' : 'Review Document')}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            );
          })()}
        </td>
      </tr>

      {/* Accordion Slide Panel (Expands directly below the row) */}
      {isExpanded && (
        <tr className="bg-slate-100/70 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800">
          <td colSpan={6} className="p-4 transition-all duration-300 ease-in-out">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-inner space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    {isRtl ? 'مسار الحوكمة التفصيلي والمطابقة الرقمية' : 'Governance Pipeline Telemetry & Digital Stamp Trace'}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {isRtl ? `كود المطالبة: ${item.claimCode}` : `Claim ID: ${item.claimCode}`}
                </span>
              </div>

              {/* Horizontal Stepper */}
              <WorkflowStepper currentStage={computedStage} claimId={item.claimCode} lang={lang} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─── 3. Main Component: ApprovalTable.tsx (ApprovalInboxTable) ─────────────

interface ApprovalInboxTableProps {
  items?: PendingApprovalItem[];
  currentUserRole?: string;
  currentUser?: import('../types').DemoUser;
  claims?: import('../types').Claim[];
  highlightedClaimId?: string | null;
  lang?: 'en' | 'ar';
  onActionClick?: (item: PendingApprovalItem) => void;
}

export const ApprovalInboxTable: React.FC<ApprovalInboxTableProps> = ({
  items,
  currentUserRole = 'pmo_auditor',
  currentUser,
  claims = [],
  highlightedClaimId,
  lang = 'en',
  onActionClick,
}) => {
  const isRtl = lang === 'ar';
  const [searchFilter, setSearchFilter] = useState('');

  // Strongly-typed Mock Array fallback
  const mockPendingItems: PendingApprovalItem[] = [
    {
      claimId: 'claim-101',
      claimCode: 'CLM-WAHA-2026-089',
      companyId: 'WAHA',
      companyName: 'Waha Oil Company',
      projectName: 'North Gialo Pipeline Expansion Phase II',
      wbsCode: 'WBS-1.2.4',
      formTypeNeeded: 'FORM_4_TECHNICAL',
      requestedAmount: 4250000,
      submittedAt: new Date(Date.now() - 52 * 3600 * 1000).toISOString(),
      currentActorRole: 'pmo_auditor',
      rawStatus: 'pending_gatekeeper'
    },
    {
      claimId: 'claim-102',
      claimCode: 'CLM-AGOCO-2026-042',
      companyId: 'AGOCO',
      companyName: 'Arabian Gulf Oil Company',
      projectName: 'Sarir Main Export Line Valve Refurbishment',
      wbsCode: 'WBS-2.1.0',
      formTypeNeeded: 'FORM_3_FINANCE',
      requestedAmount: 1890000,
      submittedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
      currentActorRole: 'noc_finance',
      rawStatus: 'approved'
    },
    {
      claimId: 'claim-103',
      claimCode: 'CLM-MELLITAH-2026-015',
      companyId: 'MELLITAH',
      companyName: 'Mellitah Oil & Gas',
      projectName: 'Offshore Platform Bahr Essalam Safety Audit',
      wbsCode: 'WBS-4.3.1',
      formTypeNeeded: 'FORM_4_TECHNICAL',
      requestedAmount: 850000,
      submittedAt: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
      currentActorRole: 'pmo_auditor',
      rawStatus: 'pending_gatekeeper'
    },
    {
      claimId: 'claim-104',
      claimCode: 'CLM-MABRUK-2026-003',
      companyId: 'MABRUK',
      companyName: 'Mabruk Oil Operations',
      projectName: 'Al-Jurf Offshore Well Rehabilitation & Test',
      wbsCode: 'WBS-5.1.2',
      formTypeNeeded: 'FORM_4_TECHNICAL',
      requestedAmount: 3100000,
      submittedAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      currentActorRole: 'pmo_auditor',
      rawStatus: 'pending_gatekeeper'
    },
  ];

  const derivedItems: PendingApprovalItem[] = React.useMemo(() => {
    if (claims && claims.length > 0) {
      return claims.map((c: any) => {
        let formTypeNeeded: 'FORM_4_TECHNICAL' | 'FORM_3_FINANCE' | 'FORM_2_GATEKEEPER' = 'FORM_4_TECHNICAL';
        let currentActorRole = 'pmo_auditor';

        if (c.status === 'approved' || c.status === 'pending_financial_audit' || c.form3Generated) {
          formTypeNeeded = 'FORM_3_FINANCE';
          currentActorRole = 'noc_finance';
        } else if (c.status === 'authorized_for_payment' || c.status === 'bank_cleared') {
          formTypeNeeded = 'FORM_3_FINANCE';
          currentActorRole = 'noc_head_of_accounts';
        }

        return {
          claimId: c.id,
          claimCode: c.code,
          companyId: c.companyId || 'WAHA',
          companyName: c.company || 'Waha Oil Company',
          projectName: c.title || c.projectName || 'Production Expansion',
          wbsCode: c.wbsCode || c.wbs_code || 'WBS-1.1.0',
          formTypeNeeded,
          requestedAmount: c.numericValue || c.invoiceAmount || 2500000,
          submittedAt: c.submissionDate || new Date().toISOString(),
          currentActorRole,
          rawStatus: c.status,
        };
      });
    }
    return mockPendingItems;
  }, [claims]);

  const rawItems = items || derivedItems;

  // Strict Tenant Isolation: HQ sees all, Subsidiary PMs see their company
  const tenantFilteredItems = React.useMemo(() => {
    if (!currentUser || !currentUser.companyId) return rawItems;
    if (currentUser.companyId === 'NOC_HQ') return rawItems;
    return rawItems.filter((item: PendingApprovalItem) => item.companyId === currentUser.companyId);
  }, [rawItems, currentUser]);

  const filteredItems = tenantFilteredItems.filter(
    (item: PendingApprovalItem) =>
      item.claimCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.companyName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.projectName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded uppercase">
              Control Tower Active
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Role Scope: {currentUserRole}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            {isRtl ? 'مركز متابعة الاعتمادات والمهام المعلقة' : 'Approval Control Tower (My Pending Tasks)'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isRtl
              ? 'صندوق المهام الموحد للمراجعات الفنية والمالية حسب صلاحيات الأدوار (RBAC)'
              : 'Unified role-based inbox for cryptographic approvals and Form 2 → Form 4 → Form 3 SLA tracking'}
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={isRtl ? 'بحث حسب الرمز أو الشركة...' : 'Filter pending claims...'}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Expandable Master-Detail Data Table */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 uppercase font-semibold text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 text-start">{isRtl ? 'الشركة / المشروع' : 'Company & Project'}</th>
                <th className="py-3.5 px-4 text-start">{isRtl ? 'رمز WBS' : 'WBS Node'}</th>
                <th className="py-3.5 px-4 text-start">{isRtl ? 'النموذج المطلوب' : 'Pending Form'}</th>
                <th className="py-3.5 px-4 text-start">{isRtl ? 'المبلغ المطلوب' : 'Amount'}</th>
                <th className="py-3.5 px-4 text-start">{isRtl ? 'مؤشر SLA' : 'SLA Traffic Light'}</th>
                <th className="py-3.5 px-4 text-end">{isRtl ? 'الإجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredItems.map((item, index) => {
                const isTargeted = Boolean(
                  highlightedClaimId &&
                  (item.claimId === highlightedClaimId || item.claimCode.toLowerCase() === highlightedClaimId.toLowerCase())
                );
                return (
                  <ExpandableTableRow
                    key={item.claimId}
                    item={item}
                    lang={lang}
                    currentUserRole={currentUserRole}
                    isHighlighted={isTargeted}
                    onActionClick={onActionClick}
                    isInitiallyExpanded={index === 0 || isTargeted}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApprovalInboxTable;
