/**
 * PortalEntry
 *
 * Top-level login / company selection screen for the NOC Technical Progress
 * Audit Ledger. Orchestrates the two-step drill-down:
 *
 *   Step 1 → <CompanyGrid>      (select which company to enter)
 *   Step 2 → <FilteredUserGrid> (pick a specific user / role to login as)
 *
 * Props are identical to what App.tsx passes into the existing login gate.
 */

import React from "react";
import { DemoUser } from "../types";
import { usePortalEntry } from "../hooks/usePortalEntry";
import CompanyGrid from "./CompanyGrid";
import FilteredUserGrid from "./FilteredUserGrid";
import NocLogo from "./NocLogo";
import ThemeToggle from "./ThemeToggle";
import { Building2, ShieldAlert, Lock } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortalEntryProps {
  allUsers: DemoUser[];
  onLogin: (user: DemoUser) => void;
  lang: string;
  /** Toast message from App state – rendered here so it appears on the login screen too */
  toastMessage?: { text: string; type: "success" | "info" | "error" } | null;
  onLangChange: (lang: string) => void;
  onResetRequest: () => void;
  onForgotPassword: () => void;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepPill({
  step,
  active,
  label,
}: {
  step: number;
  active: boolean;
  label: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${active ? "" : "opacity-40"}`}>
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 border transition-all
          ${active
            ? "bg-amber-500 text-slate-950 border-amber-500 shadow-sm shadow-amber-500/40"
            : "bg-transparent text-slate-500 border-slate-300 dark:border-slate-700"
          }`}
      >
        {step}
      </span>
      <span
        className={`text-[11px] font-bold uppercase tracking-widest ${active ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Security Badge ────────────────────────────────────────────────────────────

function SecurityBadge({ isRtl }: { isRtl: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
    >
      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
        {isRtl
          ? "جلسة آمنة مشفرة — بروتوكول المؤسسة الوطنية للنفط"
          : "TLS 1.3 Encrypted · NOC Zero-Trust Protocol"}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PortalEntry({
  allUsers,
  onLogin,
  lang,
  toastMessage,
  onLangChange,
  onResetRequest,
  onForgotPassword,
}: PortalEntryProps) {
  const isRtl = lang === "ar";

  const {
    selectedCompany,
    selectCompany,
    clearCompany,
    filteredUsers,
    apexTenant,
    subsidiaryTenants,
    activeTenant,
  } = usePortalEntry(allUsers);

  const isStep2 = selectedCompany !== null && activeTenant !== null;

  // Step labels
  const stepLabels = {
    step1: isRtl ? "اختيار الشركة" : "Select Company",
    step2: isRtl ? "اختيار المستخدم" : "Select User",
  };

  // Subtitle copy
  const subtitle = isStep2
    ? isRtl
      ? `اختر هويتك الوظيفية للدخول إلى بوابة ${activeTenant!.nameAr}`
      : `Choose your functional role to enter the ${activeTenant!.name} portal`
    : isRtl
      ? "اختر الكيان المؤسسي المناسب لهويتك للمتابعة"
      : "Select the corporate entity you belong to in order to proceed";

  return (
    <div
      className="bg-slate-50 dark:bg-[#040f24] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div
          className={`fixed top-6 ${isRtl ? "left-6" : "right-6"} z-[100] bg-slate-900 text-white rounded-xl shadow-2xl p-4 border border-slate-800 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 max-w-sm ${isRtl ? "text-right flex-row-reverse" : "text-left"}`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              toastMessage.type === "success"
                ? "bg-emerald-400 animate-pulse"
                : toastMessage.type === "error"
                  ? "bg-rose-500 animate-pulse"
                  : "bg-amber-400 animate-pulse"
            }`}
          />
          <span className="text-xs font-bold leading-relaxed">{toastMessage.text}</span>
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="border-b border-slate-200 dark:border-[#0b356e] bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div
          className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          {/* Brand */}
          <div className="flex items-center gap-3.5">
            <NocLogo size={40} className="w-11 h-11 shrink-0" />
            <div className={isRtl ? "text-right" : "text-left"}>
              <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-wider leading-none mb-1">
                {isRtl ? "المؤسسة الوطنية للنفط" : "NATIONAL OIL CORPORATION"}
              </h1>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold font-mono uppercase tracking-widest">
                {isRtl
                  ? "منظومة تدقيق المطالبات التقني والمالي"
                  : "Technical Progress Audit & Payments Ledger"}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div
            className="flex flex-wrap items-center gap-4"
          >
            <ThemeToggle />

            {/* Lang switcher */}
            <div
              className="flex items-center bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800 shadow-inner"
            >
              <button
                onClick={() => onLangChange("en")}
                className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLangChange("ar")}
                className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  lang === "ar"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                العربية
              </button>
            </div>

            {/* Status */}
            <div
              className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
            >
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                {isRtl ? "الشبكة الآمنة متصلة" : "NOC Core Infrastructure Connected"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">

        {/* Hero copy + step indicator */}
        {!isStep2 ? (
          <div className="flex flex-col items-center text-center gap-4 py-8">
            <NocLogo
              ignoreDeduplication={true}
              className="w-32 h-32 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-amber-500/10 mb-2 transition-all hover:scale-105 duration-300"
            />
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest">
              <Lock className="w-2.5 h-2.5" />
              {isRtl ? "مركز التحقق من الهوية المؤسسية" : "Demo Corporate Identity Center"}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {isRtl ? "المؤسسة الوطنية للنفط" : "NATIONAL OIL CORPORATION"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {isRtl
                ? "البوابة الموحدة لإدارة وتدقيق مطالبات التقدم الفني والمالي لمشاريع النفط والغاز. اختر هويتك المؤسسية للمتابعة."
                : "Unified gateway for technical & financial claims compliance. Select your corporate identity to proceed."}
            </p>
            
            <div className="flex items-center gap-3 mt-4">
              <StepPill step={1} active={true} label={stepLabels.step1} />
              <div className="w-6 h-px bg-slate-300 dark:bg-slate-700" />
              <StepPill step={2} active={false} label={stepLabels.step2} />
            </div>
          </div>
        ) : (
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div className={isRtl ? "text-right" : "text-left"}>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-widest mb-3">
                <Lock className="w-2.5 h-2.5" />
                {isRtl ? "مركز التحقق من الهوية المؤسسية" : "Demo Corporate Identity Center"}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {isRtl ? `بوابة ${activeTenant!.nameAr}` : `${activeTenant!.name} Portal`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Step pill row */}
            <div
              className="flex items-center gap-3 shrink-0"
            >
              <StepPill step={1} active={false} label={stepLabels.step1} />
              <div className="w-6 h-px bg-slate-300 dark:bg-slate-700" />
              <StepPill step={2} active={true} label={stepLabels.step2} />
            </div>
          </div>
        )}

        {/* ── View transition ───────────────────────────────────────────── */}
        {!isStep2 ? (
          <CompanyGrid
            apexTenant={apexTenant}
            subsidiaryTenants={subsidiaryTenants}
            onSelect={selectCompany}
            isRtl={isRtl}
          />
        ) : (
          <FilteredUserGrid
            activeTenant={activeTenant!}
            users={filteredUsers}
            onLogin={onLogin}
            onBack={clearCompany}
            isRtl={isRtl}
          />
        )}

        {/* ── Forgot password link ────────────────────────────────────── */}
        <div className="text-center pt-2">
          <button
            onClick={onForgotPassword}
            className="text-xs font-bold text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors underline decoration-dotted cursor-pointer"
          >
            {isRtl
              ? "هل نسيت كلمة المرور الخاصة بهويتك المؤسسية؟"
              : "Forgot your corporate identity password?"}
          </button>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-900 py-5 px-6 bg-white dark:bg-slate-950">
        <div
          className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <SecurityBadge isRtl={isRtl} />

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <p>© 2026 National Oil Corporation. All Rights Reserved.</p>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <a
              href="#"
              className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              {isRtl ? "سياسة الخصوصية" : "Privacy Policy"}
            </a>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={onResetRequest}
              className="text-amber-600 dark:text-amber-500 hover:text-amber-500 dark:hover:text-amber-400 underline decoration-dotted cursor-pointer transition-colors"
            >
              {isRtl ? "إعادة ضبط بيانات التطبيق" : "Reset App Data"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
