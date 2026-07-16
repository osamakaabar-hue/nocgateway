/**
 * GlobalSearch
 *
 * Dark top-bar input + absolute-positioned results dropdown.
 * Uses useSearch hook for debounced, RBAC-filtered, multi-field results.
 *
 * Features:
 *   - Keyboard navigation (ArrowUp / ArrowDown / Enter / Escape)
 *   - Grouped results by category: Claims · Documents · Invoices
 *   - Highlighted match text
 *   - Loading spinner during debounce
 *   - Closes on outside click or Escape
 *   - Responsive dark / light themes
 */

import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  Search,
  X,
  FileText,
  Receipt,
  LayoutGrid,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Claim, DemoUser } from "../types";
import { useSearch, SearchResult, SearchResultCategory } from "../hooks/useSearch";

// ─── Icon map per category ────────────────────────────────────────────────────

const CATEGORY_META: Record<
  SearchResultCategory,
  { icon: React.ElementType; label: string; labelAr: string; color: string }
> = {
  claim: {
    icon: LayoutGrid,
    label: "Claims",
    labelAr: "المطالبات",
    color: "text-amber-600 dark:text-amber-400",
  },
  document: {
    icon: FileText,
    label: "Documents",
    labelAr: "المستندات",
    color: "text-blue-600 dark:text-blue-400",
  },
  invoice: {
    icon: Receipt,
    label: "Invoices",
    labelAr: "الفواتير",
    color: "text-emerald-600 dark:text-emerald-400",
  },
};

// ─── Highlight helper ─────────────────────────────────────────────────────────

function HighlightMatch({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-200/70 dark:bg-amber-700/40 text-amber-900 dark:text-amber-200 rounded px-0.5 font-bold not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── Result row ───────────────────────────────────────────────────────────────

const ResultRow: React.FC<{
  result: SearchResult;
  query: string;
  isActive: boolean;
  onClick: () => void;
  isRtl: boolean;
}> = ({ result, query, isActive, onClick, isRtl }) => {
  const meta = CATEGORY_META[result.category];
  const Icon = meta.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors cursor-pointer ${
        isActive
          ? "bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-400/40"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
      } ${isRtl ? "flex-row-reverse text-right" : ""}`}
    >
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-800`}
      >
        <Icon className={`w-4 h-4 ${meta.color}`} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
          <HighlightMatch text={result.primary} query={query} />
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
          {result.secondary}
        </div>
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface GlobalSearchProps {
  claims: Claim[];
  currentUser: DemoUser | null;
  onResultClick?: (result: SearchResult) => void;
  lang?: string;
  /** Extra CSS classes for the wrapper */
  className?: string;
}

export default function GlobalSearch({
  claims,
  currentUser,
  onResultClick,
  lang = "en",
  className = "",
}: GlobalSearchProps) {
  const isRtl = lang === "ar";

  const {
    query,
    setQuery,
    results,
    isSearching,
    isOpen,
    setIsOpen,
    clearSearch,
    grouped,
    totalCount,
  } = useSearch(claims, currentUser);

  // ── Keyboard navigation ─────────────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset active index whenever results change
  useEffect(() => setActiveIndex(-1), [results]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const wrapper = dropdownRef.current?.parentElement;
      if (wrapper && !wrapper.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || results.length === 0) {
        if (e.key === "Escape") clearSearch();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = activeIndex >= 0 ? results[activeIndex] : results[0];
        if (target) {
          onResultClick?.(target);
          clearSearch();
        }
      } else if (e.key === "Escape") {
        clearSearch();
        inputRef.current?.blur();
      }
    },
    [isOpen, results, activeIndex, onResultClick, clearSearch],
  );

  // ── Localised strings ───────────────────────────────────────────────────────
  const labels = {
    placeholder: isRtl
      ? "بحث عن مطالبة، شركة، مستند..."
      : "Search reference, operating company, title...",
    noResults: isRtl
      ? "لا توجد نتائج مطابقة"
      : "No matching results found.",
    restricted: isRtl
      ? "نتائجك مقتصرة على بيانات شركتك."
      : "Results are scoped to your company's data.",
    results: isRtl ? "نتيجة" : "result",
    resultsPlural: isRtl ? "نتائج" : "results",
  };

  const isSubsidiary = currentUser && currentUser.companyId !== "NOC_HQ";

  // ── Category group ordered for display ──────────────────────────────────────
  const orderedCategories: SearchResultCategory[] = ["claim", "document", "invoice"];

  // Running index to compute keyboard activeIndex across groups
  let runningIdx = 0;

  return (
    <div className={`relative w-full max-w-lg ${className}`}>
      {/* ── Input field ──────────────────────────────────────────────────────── */}
      <div
        className={`flex items-center gap-2 rounded-lg border bg-slate-800 dark:bg-slate-900 border-slate-700 dark:border-slate-800 px-3 py-2 transition-all ${
          isOpen
            ? "ring-1 ring-amber-500/70 border-amber-500/50"
            : "hover:border-slate-600"
        } ${isRtl ? "flex-row-reverse" : ""}`}
      >
        {isSearching ? (
          <Loader2 className="w-4 h-4 text-slate-400 shrink-0 animate-spin" />
        ) : (
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
        )}

        <input
          ref={inputRef}
          id="global-search-input"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={labels.placeholder}
          aria-label={labels.placeholder}
          aria-controls="global-search-results"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          className={`flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none min-w-0 ${isRtl ? "text-right" : "text-left"}`}
        />

        {query && (
          <button
            onClick={clearSearch}
            aria-label="Clear search"
            className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors rounded focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Dropdown results ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          id="global-search-results"
          ref={dropdownRef}
          role="listbox"
          aria-label="Search results"
          className={`absolute top-full mt-1.5 w-full bg-white dark:bg-[#071329] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl shadow-slate-900/20 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 ${
            isRtl ? "text-right" : "text-left"
          }`}
        >
          {/* RBAC scope banner (subsidiary only) */}
          {isSubsidiary && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/40 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              <ShieldAlert className="w-3 h-3 text-blue-500 shrink-0" />
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                {labels.restricted}
              </span>
            </div>
          )}

          {/* No-results state */}
          {!isSearching && totalCount === 0 && (
            <div className="py-8 text-center">
              <Search className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-semibold">
                {labels.noResults}
              </p>
            </div>
          )}

          {/* Loading skeleton */}
          {isSearching && (
            <div className="px-3 py-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 animate-pulse"
                >
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-3/5" />
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grouped results */}
          {!isSearching && totalCount > 0 && (
            <div className="py-2 px-2 space-y-1 max-h-[380px] overflow-y-auto">
              {orderedCategories.map((cat) => {
                const group = grouped[cat];
                if (!group || group.length === 0) return null;
                const meta = CATEGORY_META[cat];
                const Icon = meta.icon;
                return (
                  <div key={cat}>
                    {/* Group header */}
                    <div
                      className={`flex items-center gap-1.5 px-2 py-1 ${isRtl ? "flex-row-reverse" : ""}`}
                    >
                      <Icon className={`w-3 h-3 ${meta.color}`} />
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest ${meta.color}`}
                      >
                        {isRtl ? meta.labelAr : meta.label}
                      </span>
                    </div>

                    {/* Rows */}
                    {group.map((result) => {
                      const localIdx = runningIdx++;
                      return (
                        <ResultRow
                          key={result.id}
                          result={result}
                          query={query}
                          isActive={activeIndex === localIdx}
                          isRtl={isRtl}
                          onClick={() => {
                            onResultClick?.(result);
                            clearSearch();
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })}

              {/* Result count footer */}
              <div
                className={`px-2 pt-1 pb-0.5 border-t border-slate-100 dark:border-slate-800 mt-1 ${isRtl ? "text-right" : "text-left"}`}
              >
                <span className="text-[10px] text-slate-400 font-mono">
                  {totalCount}{" "}
                  {totalCount === 1 ? labels.results : labels.resultsPlural}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
