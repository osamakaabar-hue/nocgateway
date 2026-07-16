/**
 * CompanyGrid – Step 1 of the Portal Entry flow.
 *
 * Renders:
 *   ┌─────────────────────────────────────────────────────┐
 *   │  APEX TIER  ── NOC Headquarters (amber accent)      │
 *   └─────────────────────────────────────────────────────┘
 *   ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
 *   │ WAHA │  │AGOCO │  │ZALLAF│  │ MEL. │   ← Subsidiary grid
 *   └──────┘  └──────┘  └──────┘  └──────┘
 */

import React from "react";
import { TenantMeta } from "../hooks/usePortalEntry";
import { TenantId } from "../brandConfig";
import { Building2, ShieldCheck, Users, ChevronRight, Landmark } from "lucide-react";

// ─── Helper ────────────────────────────────────────────────────────────────────

function LogoOrFallback({
  logoPath,
  name,
  className = "w-full h-full object-contain",
}: {
  logoPath: string;
  name: string;
  className?: string;
}) {
  return (
    <img
      src={logoPath}
      alt={`${name} logo`}
      className={className}
      onError={(e) => {
        e.currentTarget.style.display = "none";
        const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
        if (fallback) fallback.style.display = "flex";
      }}
    />
  );
}

// ─── Apex (NOC HQ) card ───────────────────────────────────────────────────────

function ApexCard({
  tenant,
  onSelect,
  isRtl,
}: {
  tenant: TenantMeta;
  onSelect: (id: TenantId) => void;
  isRtl: boolean;
}) {
  return (
    <button
      id={`company-gateway-${tenant.id}`}
      onClick={() => onSelect(tenant.id)}
      className={`group w-full text-left bg-gradient-to-br from-white via-white to-amber-50/40
        dark:from-[#0a1930] dark:via-[#0b1e38] dark:to-amber-950/10
        border-2 border-amber-500/50 hover:border-amber-500
        dark:border-amber-500/30 dark:hover:border-amber-500/70
        rounded-2xl p-7 md:p-9 cursor-pointer transition-all duration-300
        hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1
        focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
        ${isRtl ? "text-right" : "text-left"}`}
    >
      <div className="flex items-start gap-6">
        {/* Logo / Icon block */}
        <div className="shrink-0 w-20 h-20 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 dark:border-amber-500/20 shadow-inner flex items-center justify-center p-2 overflow-hidden">
          <LogoOrFallback logoPath={tenant.logoPath} name={tenant.name} />
          <div
            style={{ display: "none" }}
            className="w-full h-full items-center justify-center"
          >
            <Landmark className="w-10 h-10 text-amber-500" />
          </div>
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <div
            className="flex items-center gap-2 mb-1"
          >
            <span className="text-[10px] font-black uppercase tracking-widest font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              {isRtl ? "الطبقة الرئاسية" : "Apex Authority"}
            </span>
          </div>

          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight mt-1.5">
            {isRtl ? tenant.nameAr : tenant.name}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-xl">
            {isRtl ? tenant.taglineAr : tenant.tagline}
          </p>

          {/* Role pills */}
          <div
            className="flex flex-wrap gap-2 mt-4"
          >
            {[
              isRtl ? "مدير نظام أمن" : "System Admin",
              isRtl ? "مدقق فني" : "PMO Auditor",
              isRtl ? "مدقق مالي" : "Finance Auditor",
              isRtl ? "رئيس الحسابات" : "Head of Accounts",
              isRtl ? "اللجنة التوجيهية" : "Steering Committee",
            ].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg"
              >
                <ShieldCheck className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Arrow caret */}
        <ChevronRight
          className={`w-6 h-6 text-amber-500/50 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0 mt-1 ${isRtl ? "rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0" : ""}`}
        />
      </div>

      {/* Bottom stat strip */}
      <div
        className="mt-6 pt-5 border-t border-amber-500/20 flex items-center gap-6"
      >
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 font-mono">
            {tenant.userCount} {isRtl ? "مستخدم نظام" : "system users"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {isRtl ? "الجلسة متصلة" : "Session Live"}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Subsidiary card ──────────────────────────────────────────────────────────

const SubsidiaryCard: React.FC<{
  tenant: TenantMeta;
  onSelect: (id: TenantId) => void;
  isRtl: boolean;
}> = ({ tenant, onSelect, isRtl }) => {
  return (
    <button
      id={`company-gateway-${tenant.id}`}
      onClick={() => onSelect(tenant.id)}
      className={`group w-full h-full text-left bg-white dark:bg-[#0a1930]
        border border-slate-200 dark:border-slate-800
        hover:border-blue-400/60 dark:hover:border-blue-500/40
        hover:bg-blue-50/30 dark:hover:bg-blue-950/10
        rounded-xl p-5 cursor-pointer transition-all duration-250
        hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
        flex flex-col gap-4 w-full text-start`}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 w-full"
      >
        <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center p-1.5 overflow-hidden shrink-0">
          <LogoOrFallback logoPath={tenant.logoPath} name={tenant.name} />
          <div style={{ display: "none" }} className="flex items-center justify-center w-full h-full">
            <Building2 className="w-6 h-6 text-slate-400" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 dark:text-blue-400 font-mono mb-0.5">
            {tenant.shortName}
          </p>
          <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight line-clamp-2">
            {isRtl ? tenant.nameAr : tenant.name}
          </h3>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
        {isRtl ? tenant.taglineAr : tenant.tagline}
      </p>

      {/* Footer */}
      <div
        className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"
      >
        <span className="text-[10px] font-bold text-slate-400 font-mono">
          {tenant.userCount} {isRtl ? "دور" : "role(s)"}
        </span>
        <span
          className="flex items-center gap-1 text-[10px] font-bold text-blue-500 dark:text-blue-400 group-hover:gap-2 transition-all"
        >
          {isRtl ? "اختيار" : "Select"}
          <ChevronRight
            className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
          />
        </span>
      </div>
    </button>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface CompanyGridProps {
  apexTenant: TenantMeta;
  subsidiaryTenants: TenantMeta[];
  onSelect: (id: TenantId) => void;
  isRtl: boolean;
}

export default function CompanyGrid({
  apexTenant,
  subsidiaryTenants,
  onSelect,
  isRtl,
}: CompanyGridProps) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* ── Apex Tier ──────────────────────────────────────────────────────── */}
      <section aria-label={isRtl ? "المقر المركزي للمؤسسة" : "NOC Apex Headquarters"}>
        <div
          className="flex items-center gap-2 mb-4"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <h2 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {isRtl
              ? "المقر الرئيسي — السلطة الرقابية"
              : "Apex Tier — Sovereign Oversight Authority"}
          </h2>
        </div>
        <ApexCard tenant={apexTenant} onSelect={onSelect} isRtl={isRtl} />
      </section>

      {/* ── Secondary Tier ─────────────────────────────────────────────────── */}
      <section aria-label={isRtl ? "الشركات التابعة" : "Operating Subsidiaries"}>
        <div
          className="flex items-center gap-2 mb-4"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
          <h2 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {isRtl
              ? "الشركات المشغلة والتابعة — الإدارة الميدانية"
              : "Secondary Tier — Operating & Producing Subsidiaries"}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subsidiaryTenants.map((t) => (
            <SubsidiaryCard
              key={t.id}
              tenant={t}
              onSelect={onSelect}
              isRtl={isRtl}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
