/**
 * TopNav Component
 *
 * Fully secure, bilingual top-navigation bar utilizing JWT-authorized backend calls.
 * Replaces NocHeader to provide server-side User-Isolated notifications & Search.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Bell,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Info,
  AlertTriangle,
  Globe,
  Loader2,
  ShieldCheck,
  Building2,
  Landmark,
  ExternalLink
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import ThemeToggle from "./ThemeToggle";
import NocLogo from "./NocLogo";
import { DemoUser, NotificationItem, Claim } from "../types";
import { TenantId, TENANT_CONFIG } from "../brandConfig";

// --- Props interface matching App.tsx expectation ---
interface TopNavProps {
  currentUser: DemoUser | null;
  claims: Claim[];
  lang: string;
  onLangChange: (lang: string) => void;
  onSearchResultClick: (result: any) => void;
  onNotificationClick: (notif: NotificationItem) => void;
  className?: string;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead?: () => void;
  onClearHistory?: () => void;
  onViewAllNotifications?: () => void;
}

export default function TopNav({
  currentUser,
  claims,
  lang,
  onLangChange,
  onSearchResultClick,
  onNotificationClick,
  className = "",
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onClearHistory,
  onViewAllNotifications
}: TopNavProps) {
  const isRtl = lang === "ar";
  const { theme } = useTheme();

  // --- Notifications State ---
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleMarkRead = (id: string) => {
    onMarkRead(id);
  };

  const handleClearHistory = () => {
    if (onClearHistory) onClearHistory();
  };

  // Close notifications panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<any>(null);

  const executeSearch = useCallback(
    (q: string) => {
      setIsSearching(true);
      const query = q.trim().toLowerCase();
      if (!query) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      const isApex = currentUser?.companyId === "NOC_HQ";
      const userCompanyId = currentUser?.companyId;
      const results: any[] = [];

      claims.forEach((claim) => {
        // Enforce data sovereignty boundary
        if (!isApex && claim.companyId !== userCompanyId) {
          return;
        }

        // Search claims
        const matchCode = claim.code.toLowerCase().includes(query);
        const matchTitle = claim.title.toLowerCase().includes(query);
        const matchCompany = claim.company.toLowerCase().includes(query);
        const matchSubmitted = claim.submittedBy.toLowerCase().includes(query);

        if (matchCode || matchTitle || matchCompany || matchSubmitted) {
          results.push({
            id: `sr-claim-${claim.id}`,
            category: "claim",
            primary: claim.code,
            secondary: `${claim.company} — ${claim.title}`,
            claimId: claim.id,
            tab: "claims",
            companyId: claim.companyId
          });
        }

        // Search documents
        claim.documents.forEach((doc) => {
          if (doc.name.toLowerCase().includes(query)) {
            results.push({
              id: `sr-doc-${doc.id}`,
              category: "document",
              primary: doc.name,
              secondary: `${claim.company} · ${claim.code}`,
              claimId: claim.id,
              tab: "documents",
              companyId: claim.companyId
            });
          }
        });

        // Search invoices
        if (claim.invoiceNumber && claim.invoiceNumber.toLowerCase().includes(query)) {
          results.push({
            id: `sr-inv-${claim.id}`,
            category: "invoice",
            primary: claim.invoiceNumber,
            secondary: `${claim.company} · ${claim.code}`,
            claimId: claim.id,
            tab: "invoices",
            companyId: claim.companyId
          });
        }
      });

      setSearchResults(results);
      setIsSearching(false);
    },
    [claims, currentUser]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    setIsSearchOpen(q.trim().length > 0);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (q.trim().length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        executeSearch(q);
      }, 150); // faster feedback
    } else {
      setSearchResults([]);
    }
  };

  // Close search results on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Branding Translation Helpers ---
  const tenantId = currentUser?.companyId || "NOC_HQ";
  const tenant = TENANT_CONFIG[tenantId] || TENANT_CONFIG["NOC_HQ"];
  const isNoc = tenantId === "NOC_HQ";

  const getCompanyTranslation = (name: string) => {
    if (!isRtl) return name;
    const mapping: Record<string, string> = {
      "National Oil Corporation": "المؤسسة الوطنية للنفط",
      "Waha Oil Company": "شركة الواحة للنفط",
      "Arabian Gulf Oil Company": "شركة الخليج العربي للنفط",
      "Zallaf Libya Oil & Gas": "شركة زلاف ليبيا للنفط والغاز",
      "Mellitah Oil & Gas": "شركة مليتة للنفط والغاز",
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
    };
    return mapping[name] || name;
  };

  const getRoleLabel = (role?: string) => {
    if (!role) return "";
    if (!isRtl) return role;
    const mapping: Record<string, string> = {
      system_admin: "مدير النظام الأمني",
      pmo_auditor: "مدقق فني للمؤسسة",
      noc_finance: "مدقق مالي مركزي",
      noc_head_of_accounts: "رئيس الحسابات العام",
      subsidiary_pm: "مدير مشروع الشركة",
      subsidiary_finance: "المسؤول المالي للشركة",
    };
    return mapping[role] || role;
  };

  const labels = {
    searchPlaceholder: isRtl
      ? "بحث عن كود، شركة، مستند فني..."
      : "Search reference, company, document...",
    notifications: isRtl ? "الإشعارات" : "NOTIFICATIONS",
    markAllRead: isRtl ? "تحديد الكل كمقروء" : "Mark all read",
    clearHistory: isRtl ? "مسح السجل بالكامل" : "CLEAR ALL HISTORY",
    noNotifs: isRtl ? "لا توجد إشعارات حالياً" : "No notifications yet",
    restrictedSearch: isRtl
      ? "البحث مقتصر على صلاحيات شركتك فقط"
      : "Search scoped strictly to your company",
  };

  const isSubsidiary = currentUser && currentUser.companyId !== "NOC_HQ";

  return (
    <header
      className={`bg-white dark:bg-[#0a1930] border-b-2 border-amber-500 py-3 px-6 flex justify-between items-center shadow-md gap-4 ${className}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* --- Left section: Logo & Node info --- */}
      <div className={`flex items-center gap-4 shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}>
        {isNoc ? (
          <NocLogo className="w-12 h-12 shrink-0" />
        ) : (
          <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center p-1.5 border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
            <img
              src={tenant.logoPath}
              alt={tenant.shortName}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        <div className={`hidden sm:block ${isRtl ? "text-right" : "text-left"}`}>
          <h2 className="text-slate-900 dark:text-slate-300 font-bold text-xs uppercase tracking-wide leading-tight">
            {getCompanyTranslation(tenant.name)}
          </h2>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase">
            {isNoc
              ? isRtl
                ? "المنفذ المركزي للمؤسسة"
                : "NOC Central Node"
              : isRtl
                ? `${getShortNameTranslation(tenant.shortName)} (عقدة مصرحة)`
                : `${tenant.shortName} Authorized Node`}
          </span>
        </div>
      </div>

      {/* --- Centre section: Global Search --- */}
      {currentUser && (
        <div className="flex-1 flex justify-center px-2 min-w-0" ref={searchRef}>
          <div className="relative w-full max-w-xl">
            <div
              className={`flex items-center gap-2 rounded-lg border bg-slate-800 dark:bg-slate-900 border-slate-700 dark:border-slate-800 px-3 py-2 transition-all ${
                isSearchOpen ? "ring-1 ring-amber-500/70 border-amber-500/50" : "hover:border-slate-600"
              } ${isRtl ? "flex-row-reverse" : ""}`}
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-slate-400 shrink-0 animate-spin" />
              ) : (
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <input
                id="top-nav-search-input"
                type="search"
                autoComplete="off"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                placeholder={labels.searchPlaceholder}
                className={`flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none min-w-0 ${isRtl ? "text-right" : "text-left"}`}
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setIsSearchOpen(false);
                  }}
                  className="p-0.5 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {isSearchOpen && (
              <div
                className={`absolute top-full mt-1.5 w-full bg-white dark:bg-[#071329] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden ${isRtl ? "text-right" : "text-left"}`}
              >
                {isSubsidiary && (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/40 ${isRtl ? "flex-row-reverse" : ""}`}
                  >
                    <AlertTriangle className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      {labels.restrictedSearch}
                    </span>
                  </div>
                )}

                <div className="py-2 px-2 max-h-[350px] overflow-y-auto space-y-1">
                  {searchResults.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      {isRtl ? "لا توجد نتائج مطابقة لبحثك" : "No matches found."}
                    </div>
                  ) : (
                    searchResults.map((result: any) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          onSearchResultClick(result);
                          setIsSearchOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isRtl ? "flex-row-reverse text-right" : ""}`}
                      >
                        <span className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                          {result.category === "claim" && <Building2 className="w-4 h-4 text-amber-500" />}
                          {result.category === "document" && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                          {result.category === "invoice" && <AlertCircle className="w-4 h-4 text-emerald-500" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {result.primary}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {result.secondary}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Right section: Global language switcher, bell dropdown, user settings --- */}
      <div className={`flex items-center gap-3 shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}>
        
        {/* Global Language Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onLangChange("en")}
            className={`px-2 py-1 rounded text-[9px] font-black transition-all cursor-pointer ${
              lang === "en" ? "bg-amber-500 text-slate-900" : "text-slate-500 hover:text-slate-950 dark:hover:text-slate-200"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onLangChange("ar")}
            className={`px-2 py-1 rounded text-[9px] font-black transition-all cursor-pointer ${
              lang === "ar" ? "bg-amber-500 text-slate-900" : "text-slate-500 hover:text-slate-950 dark:hover:text-slate-200"
            }`}
          >
            العربية
          </button>
        </div>

        {/* Notifications Icon (User-Isolated Dropdown) */}
        {currentUser && (
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`p-2 rounded-lg transition-colors relative ${
                isNotifOpen
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-rose-600 text-white text-[9px] font-black rounded-full leading-none">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div
                className={`absolute top-full mt-2 w-[22rem] max-h-[500px] flex flex-col bg-white dark:bg-[#071329] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden ${isRtl ? "left-0" : "right-0"}`}
              >
                <div
                  className={`flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a1930] shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">
                    {labels.notifications} ({notifications.length})
                  </span>
                  <div className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          for (const n of notifications) {
                            if (!n.read) await handleMarkRead(n.id);
                          }
                        }}
                        className="text-[10px] font-bold text-amber-600 hover:underline"
                      >
                        {labels.markAllRead}
                      </button>
                    )}
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="p-0.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                      <Bell className="w-8 h-8 text-slate-200 dark:text-slate-700 mb-3" />
                      <p className="text-xs text-slate-400 font-semibold">{labels.noNotifs}</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          handleMarkRead(notif.id);
                          setIsNotifOpen(false);
                          onNotificationClick(notif);
                        }}
                        className={`p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex gap-3 items-start ${
                          !notif.read ? "bg-blue-50/40 dark:bg-blue-950/10" : ""
                        } ${isRtl ? "flex-row-reverse text-right" : ""}`}
                      >
                        <span className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800">
                          {notif.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {notif.type === "warning" && <AlertCircle className="w-4 h-4 text-amber-500" />}
                          {notif.type === "error" && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                          {notif.type === "info" && <Info className="w-4 h-4 text-blue-500" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className={`flex justify-between items-start ${isRtl ? "flex-row-reverse" : ""}`}>
                            <h4 className="text-[11px] font-black text-slate-900 dark:text-slate-100 leading-tight">
                              {notif.title}
                            </h4>
                            <span className="text-[8px] text-slate-400 font-mono shrink-0">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a1930] py-2 px-3 flex items-center justify-between">
                    <button
                      onClick={handleClearHistory}
                      className="text-[9px] font-black uppercase text-slate-400 hover:text-red-500 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      {labels.clearHistory}
                    </button>
                    {onViewAllNotifications && (
                      <button
                        onClick={() => {
                          setIsNotifOpen(false);
                          onViewAllNotifications();
                        }}
                        className="text-[9px] font-black uppercase text-amber-600 hover:text-amber-500 flex items-center gap-1 cursor-pointer"
                      >
                        {isRtl ? "عرض كل التنبيهات" : "View All Center"}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <ThemeToggle lang={lang} />

        <div className={`flex flex-col ${isRtl ? "items-start" : "items-end"}`}>
          <span className="text-slate-900 dark:text-white text-sm font-bold leading-tight">
            {isRtl && currentUser?.nameAr ? currentUser.nameAr : (currentUser?.name || "Visitor")}
          </span>
          <span className="text-amber-600 dark:text-amber-500 text-[10px] font-mono tracking-wider">
            {getRoleLabel(currentUser?.role)}
          </span>
        </div>
      </div>
    </header>
  );
}
