/**
 * useSearch – Context-Aware Global Search
 *
 * Security contract:
 *   - Subsidiary users (companyId !== "NOC_HQ") can only see results whose
 *     companyId matches their own.
 *   - NOC_HQ users search globally across all tenants.
 *   - Debounced at 300 ms to avoid excessive re-computation on every keystroke.
 *   - Results are categorised into Claims, Documents, and Invoices.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Claim, DemoUser } from "../types";

// ─── Result types ─────────────────────────────────────────────────────────────

export type SearchResultCategory = "claim" | "document" | "invoice";

export interface SearchResult {
  id: string;
  category: SearchResultCategory;
  /** Primary display line (e.g. claim code or document name) */
  primary: string;
  /** Secondary display line (e.g. company or claim title) */
  secondary: string;
  /** Matching excerpt with the query highlighted */
  matchedField: string;
  /** Link back to the source claim so App can navigate */
  claimId: string;
  /** Which tab to open */
  tab: "claims" | "invoices" | "documents";
  /** Tenant / company identifier – used to enforce RBAC */
  companyId: string;
}

// ─── RBAC predicate ───────────────────────────────────────────────────────────

function isResultVisible(result: SearchResult, user: DemoUser | null): boolean {
  if (!user) return false;
  // NOC HQ users see everything
  if (user.companyId === "NOC_HQ") return true;
  // Subsidiary users are scoped to their own company
  return result.companyId === user.companyId;
}

// ─── Index builder ────────────────────────────────────────────────────────────

function buildSearchIndex(claims: Claim[]): SearchResult[] {
  const results: SearchResult[] = [];

  claims.forEach((claim) => {
    // ── Claim result ────────────────────────────────────────────────────────
    results.push({
      id: `sr-claim-${claim.id}`,
      category: "claim",
      primary: claim.code,
      secondary: `${claim.company} — ${claim.title}`,
      matchedField: `${claim.code} ${claim.title} ${claim.company} ${claim.companyId} ${claim.wbs}`,
      claimId: claim.id,
      tab: "claims",
      companyId: claim.companyId,
    });

    // ── Document results ────────────────────────────────────────────────────
    claim.documents.forEach((doc) => {
      results.push({
        id: `sr-doc-${doc.id}`,
        category: "document",
        primary: doc.name,
        secondary: `${claim.company} · ${claim.code}`,
        matchedField: `${doc.name} ${claim.code} ${claim.company} ${claim.companyId}`,
        claimId: claim.id,
        tab: "documents",
        companyId: claim.companyId,
      });
    });

    // ── Invoice result (only if claim has an invoice number) ────────────────
    if (claim.invoiceNumber) {
      results.push({
        id: `sr-inv-${claim.id}`,
        category: "invoice",
        primary: claim.invoiceNumber,
        secondary: `${claim.company} · ${claim.claimedValue}`,
        matchedField: `${claim.invoiceNumber} ${claim.company} ${claim.companyId} ${claim.code}`,
        claimId: claim.id,
        tab: "invoices",
        companyId: claim.companyId,
      });
    }
  });

  return results;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function score(result: SearchResult, query: string): number {
  const q = query.toLowerCase();
  const primary = result.primary.toLowerCase();
  const secondary = result.secondary.toLowerCase();

  if (primary === q) return 100;
  if (primary.startsWith(q)) return 80;
  if (primary.includes(q)) return 60;
  if (secondary.includes(q)) return 40;
  if (result.matchedField.toLowerCase().includes(q)) return 20;
  return 0;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  isSearching: boolean;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  clearSearch: () => void;
  /** Group results by category for rendering */
  grouped: Record<SearchResultCategory, SearchResult[]>;
  totalCount: number;
}

export function useSearch(
  claims: Claim[],
  currentUser: DemoUser | null,
  debounceMs = 300,
): UseSearchReturn {
  const [query, setQueryRaw] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Debounce handler ────────────────────────────────────────────────────────
  const setQuery = useCallback(
    (q: string) => {
      setQueryRaw(q);
      setIsOpen(q.trim().length > 0);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (q.trim().length === 0) {
        setDebouncedQuery("");
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      debounceRef.current = setTimeout(() => {
        setDebouncedQuery(q.trim());
        setIsSearching(false);
      }, debounceMs);
    },
    [debounceMs],
  );

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  // ── Build index (memoised – only rebuilds when claims change) ───────────────
  const index = useMemo(() => buildSearchIndex(claims), [claims]);

  // ── Apply RBAC filter + fuzzy score ────────────────────────────────────────
  const results = useMemo<SearchResult[]>(() => {
    if (!debouncedQuery || !currentUser) return [];

    return index
      .filter((r) => isResultVisible(r, currentUser))
      .map((r) => ({ result: r, s: score(r, debouncedQuery) }))
      .filter(({ s }) => s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12) // cap at 12 results to keep UI clean
      .map(({ result }) => result);
  }, [debouncedQuery, index, currentUser]);

  // ── Group by category ───────────────────────────────────────────────────────
  const grouped = useMemo<Record<SearchResultCategory, SearchResult[]>>(() => {
    const g: Record<SearchResultCategory, SearchResult[]> = {
      claim: [],
      document: [],
      invoice: [],
    };
    results.forEach((r) => g[r.category].push(r));
    return g;
  }, [results]);

  const clearSearch = useCallback(() => {
    setQueryRaw("");
    setDebouncedQuery("");
    setIsOpen(false);
    setIsSearching(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    isOpen,
    setIsOpen,
    clearSearch,
    grouped,
    totalCount: results.length,
  };
}
