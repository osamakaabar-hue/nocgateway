/**
 * NocHeader
 *
 * Top navigation bar for the NOC Technical Progress Audit Ledger.
 * Now includes:
 *   - GlobalSearch (context-aware, debounced, RBAC-filtered)
 *   - NotificationPanel (user-isolated, dark-mode, bilingual)
 */

import React from "react";
import { TENANT_CONFIG, TenantId } from "../brandConfig";
import { useTheme } from "./ThemeProvider";
import ThemeToggle from "./ThemeToggle";
import NocLogo from "./NocLogo";
import GlobalSearch from "./GlobalSearch";
import NotificationPanel from "./NotificationPanel";
import { DemoUser, NotificationItem, Claim } from "../types";
import { SearchResult } from "../hooks/useSearch";

interface NocHeaderProps {
  tenantId: TenantId;
  userName: string;
  roleLabel: string;
  children?: React.ReactNode;
  className?: string;
  lang?: string;
  // ── New props for search + notifications ────────────────────────────────────
  currentUser?: DemoUser | null;
  claims?: Claim[];
  notifications?: NotificationItem[];
  setNotifications?: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  onSearchResultClick?: (result: SearchResult) => void;
  onNotificationClick?: (notif: NotificationItem) => void;
}

export default function NocHeader({
  tenantId,
  userName,
  roleLabel,
  children,
  className = "",
  lang = "en",
  currentUser,
  claims = [],
  notifications = [],
  setNotifications,
  onSearchResultClick,
  onNotificationClick,
}: NocHeaderProps) {
  const isNoc = tenantId === "NOC_HQ";
  const tenant = TENANT_CONFIG[tenantId] || TENANT_CONFIG["NOC_HQ"];
  const { theme } = useTheme();
  const isRtl = lang === "ar";

  const getCompanyTranslation = (name: string) => {
    if (!isRtl) return name;
    const mapping: Record<string, string> = {
      "National Oil Corporation": "المؤسسة الوطنية للنفط",
      "Waha Oil Company": "شركة الواحة للنفط",
      "Arabian Gulf Oil Company": "شركة الخليج العربي للنفط",
      "Zallaf Libya Oil & Gas": "شركة زلاف ليبيا للنفط والغاز",
      "Mellitah Oil & Gas": "شركة مليتة للنفط والغاز",
      "Harouge Oil Operations": "شركة الهروج للعمليات النفطية",
    };
    return mapping[name] || name;
  };

  const getShortNameTranslation = (name?: string) => {
    if (!name) return "";
    if (!isRtl) return name;
    const mapping: Record<string, string> = {
      "NOC HQ": "المقر الرئيسي",
      WAHA: "الواحة",
      AGOCO: "الخليج",
      ZALLAF: "زلاف",
      MELLITAH: "مليتة",
      HAROUGE: "الهروج",
    };
    return mapping[name] || name;
  };

  const getLogoPath = (path: string) => {
    if (theme === "dark" && path.endsWith("zallaf.svg")) {
      return path.replace("zallaf.svg", "zallaf-dark.svg");
    }
    return path;
  };

  const hasSearchAndNotifications =
    currentUser && setNotifications && onSearchResultClick;

  return (
    <header
      className={`bg-white dark:bg-[#0a1930] border-b-2 border-amber-500 py-3 px-6 flex justify-between items-center shadow-md gap-4 ${className}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ── Left: Tenant Logos + Name ─────────────────────────────────────────── */}
      <div className={`flex items-center gap-4 shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}>
        {isNoc ? (
          <NocLogo className="w-12 h-12 shrink-0" />
        ) : (
          <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center p-1.5 border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
            <img
              src={getLogoPath(tenant.logoPath)}
              alt={`${tenant.shortName || tenant.name} Logo`}
              className="w-full h-full object-contain"
              onError={(e) =>
                (e.currentTarget.src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="%2394a3b8" viewBox="0 0 24 24"><path d="M3 3h18v18H3z"/></svg>')
              }
            />
          </div>
        )}

        <div className={`hidden sm:block ${isRtl ? "text-right" : "text-left"}`}>
          <h2 className="text-slate-900 dark:text-slate-300 font-bold text-xs uppercase tracking-wide leading-tight">
            {!isNoc
              ? getCompanyTranslation(tenant.name)
              : getCompanyTranslation("National Oil Corporation")}
          </h2>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase">
            {!isNoc
              ? isRtl
                ? `${getShortNameTranslation(tenant.shortName)} (عقدة مصرحة)`
                : `${tenant.shortName} Authorized Node`
              : isRtl
                ? "المنفذ المركزي للمؤسسة"
                : "NOC Central Node"}
          </span>
        </div>
      </div>

      {/* ── Centre: Global Search (replaces generic children slot when available) ── */}
      {hasSearchAndNotifications ? (
        <div className="flex-1 flex justify-center px-2 min-w-0">
          <GlobalSearch
            claims={claims}
            currentUser={currentUser}
            onResultClick={onSearchResultClick}
            lang={lang}
            className="w-full max-w-xl"
          />
        </div>
      ) : children ? (
        <div className="flex-1 flex justify-center px-4">{children}</div>
      ) : null}

      {/* ── Right: Notifications · Theme toggle · User info ──────────────────── */}
      <div
        className={`flex items-center gap-3 shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}
      >
        {/* Notification bell (only when user is authenticated) */}
        {currentUser && setNotifications && onNotificationClick && (
          <NotificationPanel
            currentUser={currentUser}
            notifications={notifications}
            setNotifications={setNotifications}
            onNavigate={onNotificationClick}
            lang={lang}
          />
        )}

        <ThemeToggle lang={lang} />

        <div className={`flex flex-col ${isRtl ? "items-start" : "items-end"}`}>
          <span className="text-slate-900 dark:text-white text-sm font-bold leading-tight">
            {userName}
          </span>
          <span className="text-amber-600 dark:text-amber-500 text-[10px] font-mono tracking-wider">
            {roleLabel}
          </span>
        </div>
      </div>
    </header>
  );
}
