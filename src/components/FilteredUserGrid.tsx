/**
 * FilteredUserGrid – Step 2 of the Portal Entry flow.
 *
 * Renders all users that belong to the selected company, with:
 *  - Company breadcrumb header
 *  - "Back to Companies" button (RTL-aware)
 *  - User Role Cards: avatar · name · role label · capabilities · Login button
 *
 * NOC HQ users get a gold/amber accent; subsidiary users get an indigo/blue accent.
 */

import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  DollarSign,
  Database,
  KeyRound,
  ChevronRight,
  LogIn,
} from "lucide-react";
import { DemoUser } from "../types";
import { TenantMeta, TENANT_AR } from "../hooks/usePortalEntry";

// ─── Role type general translations ──────────────────────────────────────────
const ROLE_TYPE_LABELS_AR: Record<string, string> = {
  "system_admin": "مدير النظام الأمني",
  "pmo_auditor": "المدقق الفني للمؤسسة",
  "noc_finance": "المدقق المالي المركزي",
  "noc_head_of_accounts": "رئيس الحسابات العام",
  "subsidiary_pm": "مدير مشروع الشركة",
  "subsidiary_finance": "المسؤول المالي للشركة"
};

// ─── Specific role labels (legacy map) ────────────────────────────────────────
const ROLE_LABELS_AR: Record<string, string> = {
  "user-noc-admin":    "مدير النظام الأمني",
  "user-noc-pmo":      "المدقق الفني للمؤسسة",
  "user-noc-fin":      "المدقق المالي المركزي",
  "user-noc-head":     "رئيس الحسابات العام",
  "user-waha-pm":      "مدير مشروع الشركة",
  "user-waha-fin":     "المسؤول المالي للشركة",
  "user-agoco-pm":     "مدير مشروع الشركة",
  "user-agoco-fin":    "المسؤول المالي للشركة",
  "user-zallaf-pm":    "مدير مشروع الشركة",
  "user-zallaf-fin":   "المسؤول المالي للشركة",
  "user-mellitah-pm":  "مدير مشروع الشركة",
  "user-mellitah-fin": "المسؤول المالي للشركة",
};

// ─── Specific User Descriptions (legacy map) ──────────────────────────────────
const DESC_AR: Record<string, string> = {
  "user-noc-admin":    "التحكم الإداري الكامل. يدير حقوق الوصول، يمنح الصلاحيات للمستخدمين، وينفذ إلغاء الجلسات الطارئة.",
  "user-noc-pmo":      "يراجع الوثائق الهندسية والمخططات المرفقة، ويقوم بتدقيق نسب الإنجاز ومطابقتها تقنياً لإصدار الموافقة الفنية.",
  "user-noc-fin":      "يقوم بمطابقة الفواتير التجارية مع حدود القيمة المكتسبة المعتمدة هندسياً ويصدر الموافقة المالية للدفع.",
  "user-noc-head":     "المسؤول العام لإطلاق صرف الميزانيات بعد استكمال كافة تدقيقات الـ PMO والدائرة المالية.",
  "user-noc-steering": "الإشراف السيادي واتخاذ القرارات الاستراتيجية. وصول للقراءة فقط لكافة لوحات المعلومات، وتدفقات المشاريع، وتقارير الامتثال.",
  "user-waha-pm":      "يدير صيانة رؤوس الآبار. يرفع مطالبات التقدم وتفاصيل المعايير الهندسية لشركة الواحة.",
  "user-waha-fin":     "يدير الفوترة لشركة الواحة. ينشئ مطالبات تجارية بعد الموافقة الفنية من المقر الرئيسي.",
  "user-agoco-pm":     "يشرف على مسوحات خطوط الأنابيب ويرفع نسب الإنجاز الهندسية لشركة الخليج العربي.",
  "user-agoco-fin":    "مسؤول الفوترة والحسابات لمشاريع خطوط الأنابيب في شركة الخليج العربي.",
  "user-zallaf-pm":    "يدير الأعمال المدنية لمحطات شركة زلاف الفرعية ويرفع شهادات مقاومة الخرسانة.",
  "user-zallaf-fin":   "يصيغ مطالبات الفوترة لمشاريع محطات توليد شركة زلاف ليبيا.",
  "user-mellitah-pm":  "يشرف على إعادة تأهيل معمل معالجة الغاز ويرفع نسب إنجاز المراحل.",
  "user-mellitah-fin": "يصدر الفواتير ويراقب الحدود المالية لمراحل تطوير مشاريع شركة مليتة.",
};

// ─── Capabilities Translation Map ─────────────────────────────────────────────
const CAPABILITIES_AR: Record<string, string> = {
  // PM Capabilities
  "Submit new progress claims": "تقديم مطالبات الإنجاز الجديدة",
  "Add deliverables": "إضافة مخرجات للمرحلة",
  "Upload concrete logs": "تحميل سجلات فحص الخرسانة",
  "Manage project timelines": "إدارة الجداول الزمنية للمشروع",
  "Oversee site safety logs": "الإشراف على سجلات سلامة الموقع",
  "Coordinate pipeline teams": "تنسيق فرق خطوط الأنابيب",
  "Log geological surveys": "تسجيل المسوحات الجيولوجية",
  "Track structural foundations": "متابعة التأسيسات الهيكلية",
  "Upload structural signs": "تحميل مستندات اعتماد الهياكل",
  "Upload gas safety certs": "تحميل شهادات سلامة الغاز",

  // Finance Capabilities
  "Submit commercial invoice": "تقديم الفاتورة التجارية",
  "Track earned value limits": "تتبع حدود القيمة المكتسبة",
  "Upload official PDF invoices": "تحميل الفواتير الرسمية بصيغة PDF",
  "Request payment release": "طلب الإفراج المالي للمستخلص",
  "Review invoice lines": "مراجعة بنود الفاتورة الفردية",
  "Verify project budget caps": "التحقق من سقف ميزانية المشروع",

  // HQ Authorities Capabilities
  "Configure security scopes": "تكوين نطاقات الأمان الفيدرالية",
  "Execute user revocation": "تنفيذ إلغاء وتجميد الهويات",
  "Monitor system logs": "مراقبة سجلات النظام الفورية",
  "Perform technical audits": "إجراء عمليات التدقيق الفني الميداني",
  "Issue stage approvals": "إصدار اعتمادات المراحل المعتمدة",
  "Write auditor notes": "تدوين ملاحظات التدقيق والامتثال",
  "Verify invoice line details": "التحقق من تفاصيل بنود الفواتير",
  "Verify bank details": "التحقق من التفاصيل والحسابات المصرفية",
  "Trigger payout vouchers": "تفويض إطلاق أوامر الصرف المالي",
  "Lock budget ledgers": "إقفال دفاتر الميزانية الفيدرالية",
  "Global Dashboard Access": "وصول شامل للوحة التحكم",
  "View All Project Pipelines": "عرض كافة تدفقات المشاريع",
  "Read-Only Strategic Oversight": "إشراف استراتيجي (قراءة فقط)",

  // Dynamic capabilities fallback
  "Log field updates": "تسجيل تحديثات العمل الميداني",
  "File safety reports": "أرشفة تقارير السلامة المهنية",
  "Log mechanical logs": "تسجيل تقارير الفحص الميكانيكي",
  "Upload core test photos": "تحميل صور اختبار العينات الأساسية",
  "Filing drone scan records": "تسجيل ملفات مسح الطيران المسير",
  "Verify structural integrity": "التحقق من السلامة الإنشائية للهياكل",
  "Upload quality audit checklists": "تحميل قوائم مراجعة الجودة الشاملة",
  "Submit pipeline test results": "إرسال نتائج اختبار خطوط الأنابيب",
  "Submit progress reports": "إرسال تقارير تقدم العمل الدورية",
  "Upload compliance files": "تحميل ملفات الامتثال التنظيمي"
};

// Helper to resolve user description dynamically for all 30+ tenants
const getArabicDescription = (user: DemoUser) => {
  if (DESC_AR[user.id]) return DESC_AR[user.id];
  
  if (user.role === "subsidiary_pm") {
    const companyAr = TENANT_AR[user.companyId]?.name || user.company;
    return `يشرف على إدارة المشاريع الفنية والهندسية الميدانية لـ ${companyAr}.`;
  }
  if (user.role === "subsidiary_finance") {
    const companyAr = TENANT_AR[user.companyId]?.name || user.company;
    return `يتولى إدارة الفواتير وإجراءات المطابقة والرقابة المالية لـ ${companyAr}.`;
  }
  return user.description;
};

// ─── Role icon map ────────────────────────────────────────────────────────────
function RoleIcon({ roleId, className = "w-4 h-4" }: { roleId: string; className?: string }) {
  if (roleId === "system_admin") return <KeyRound className={className} />;
  if (roleId === "pmo_auditor") return <ShieldCheck className={className} />;
  if (roleId === "noc_finance" || roleId === "subsidiary_finance") return <DollarSign className={className} />;
  if (roleId === "noc_head_of_accounts") return <Database className={className} />;
  if (roleId === "steering_committee") return <Briefcase className={className} />;
  return <Briefcase className={className} />;
}

// ─── User card ────────────────────────────────────────────────────────────────
const UserCard: React.FC<{
  user: DemoUser;
  onLogin: (user: DemoUser) => void;
  isApex: boolean;
  isRtl: boolean;
}> = ({ user, onLogin, isApex, isRtl }) => {
  const initials = user.name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();

  const loginLabel = isRtl
    ? isApex
      ? "دخول البوابة"
      : user.role === "subsidiary_pm"
        ? "دخول بصفتي مدير مشروع"
        : "دخول بصفتي مسؤول مالي"
    : isApex
      ? "Enter Portal"
      : user.role === "subsidiary_pm"
        ? "Login as PM"
        : "Login as Finance";

  return (
    <div
      className={`group bg-white dark:bg-[#0a1930]
        border ${isApex ? "border-amber-500/20 hover:border-amber-500/60" : "border-slate-200 dark:border-slate-800 hover:border-blue-400/50"}
        rounded-xl p-5 flex flex-col gap-4 transition-all duration-250
        hover:shadow-lg ${isApex ? "hover:shadow-amber-500/10" : "hover:shadow-blue-500/8"}
        hover:-translate-y-0.5
        ${isRtl ? "text-right" : "text-left"}`}
    >
      {/* Header: Avatar + Name + Role */}
      <div className={`flex items-start gap-3.5 ${isRtl ? "flex-row-reverse" : ""}`}>
        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-xl ${user.avatarColor} flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm`}
        >
          {initials}
        </div>

        <div className={`flex-1 min-w-0 ${isRtl ? "text-right" : "text-left"}`}>
          <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
            {isRtl && user.nameAr ? user.nameAr : user.name}
          </h4>
          <div className={`flex items-center gap-1.5 mt-0.5 ${isRtl ? "flex-row-reverse" : ""}`}>
            <RoleIcon
              roleId={user.role}
              className={`w-3 h-3 shrink-0 ${isApex ? "text-amber-500" : "text-blue-500"}`}
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">
              {isRtl ? ROLE_TYPE_LABELS_AR[user.role] ?? ROLE_LABELS_AR[user.id] ?? user.roleLabel : user.roleLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
        {isRtl ? getArabicDescription(user) : user.description}
      </p>

      {/* Capabilities */}
      <div className={`flex flex-wrap gap-1.5 ${isRtl ? "flex-row-reverse" : ""}`}>
        {user.capabilities.slice(0, 3).map((cap, i) => (
          <span
            key={i}
            className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded"
          >
            {isRtl ? CAPABILITIES_AR[cap] ?? cap : cap}
          </span>
        ))}
        {user.capabilities.length > 3 && (
          <span className="text-[9px] font-mono font-bold text-slate-400 px-1 py-0.5">
            +{user.capabilities.length - 3}
          </span>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => onLogin(user)}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-black text-xs transition-all cursor-pointer
          ${isApex
            ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 border border-slate-200/80 dark:border-transparent"
            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-500 hover:text-white border border-slate-200/80 dark:border-transparent"
          } group-hover:shadow-sm ${isRtl ? "flex-row-reverse" : ""}`}
      >
        <LogIn className="w-3.5 h-3.5" />
        {loginLabel}
      </button>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface FilteredUserGridProps {
  activeTenant: TenantMeta;
  users: DemoUser[];
  onLogin: (user: DemoUser) => void;
  onBack: () => void;
  isRtl: boolean;
}

export default function FilteredUserGrid({
  activeTenant,
  users,
  onLogin,
  onBack,
  isRtl,
}: FilteredUserGridProps) {
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* ── Breadcrumb / Back ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded px-1 py-0.5"
        >
          <BackIcon className="w-4 h-4" />
          {isRtl ? "العودة إلى قائمة الشركات" : "Back to Companies"}
        </button>

        {/* Breadcrumb chip */}
        <span
          className={`flex items-center gap-1.5 text-[10px] font-black font-mono uppercase tracking-widest px-3 py-1.5 rounded-full border
            ${activeTenant.isApex
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
            }`}
        >
          <span>{activeTenant.shortName}</span>
          <span className="text-slate-400">·</span>
          <span>{users.length} {isRtl ? "مستخدم" : "users"}</span>
        </span>
      </div>

      {/* ── Company Banner ────────────────────────────────────────────────── */}
      <div
        className={`flex items-center gap-5 p-5 rounded-xl border
          ${activeTenant.isApex
            ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-500/20"
            : "bg-blue-50/30 dark:bg-blue-950/10 border-blue-400/20"
          } ${isRtl ? "text-right" : "text-left"}`}
      >
        <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2 shrink-0">
          <img
            src={activeTenant.logoPath}
            alt={activeTenant.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest font-mono ${activeTenant.isApex ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"}`}>
            {activeTenant.isApex
              ? isRtl ? "المقر الرئيسي — الطبقة الرئاسية" : "Apex Headquarters Tier"
              : isRtl ? "شركة مشغلة تابعة" : "Operating Subsidiary"}
          </p>
          <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {isRtl ? activeTenant.nameAr : activeTenant.name}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isRtl ? activeTenant.taglineAr : activeTenant.tagline}
          </p>
        </div>
      </div>

      {/* ── Users Grid ───────────────────────────────────────────────────── */}
      {users.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <p className="text-sm font-bold">
            {isRtl ? "لا يوجد مستخدمون لهذه الشركة." : "No users configured for this company."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onLogin={onLogin}
              isApex={activeTenant.isApex}
              isRtl={isRtl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
