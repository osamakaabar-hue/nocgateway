/**
 * usePortalEntry
 *
 * State management hook for the two-step company → user drill-down.
 * Encapsulates:
 *   - selectedCompany (null = Company Selection view, string = User Selection view)
 *   - Tenant data (apex NOC tier + subsidiary tier)
 *   - Filtered user list for the active company
 */

import { useState, useMemo } from "react";
import { DemoUser } from "../types";
import { TENANT_CONFIG, TenantId } from "../brandConfig";

// ─── Tenant metadata for the portal grid ──────────────────────────────────────

export interface TenantMeta {
  id: TenantId;
  name: string;
  nameAr: string;
  shortName: string;
  logoPath: string;
  /** Number of registered demo users for this tenant */
  userCount: number;
  /** True for the apex sovereign tier */
  isApex: boolean;
  /** One-line descriptor shown on the Company Gateway card */
  tagline: string;
  taglineAr: string;
}

export const TENANT_AR: Partial<Record<TenantId, { name: string; tagline: string }>> = {
  NOC_HQ:   { name: "المؤسسة الوطنية للنفط",          tagline: "السلطة الإشرافية المركزية للتدقيق والمطابقة المالية" },
  WAHA:     { name: "شركة الواحة للنفط",               tagline: "رفع وإدارة مطالبات تقدم مشاريع الصيانة الميدانية" },
  AGOCO:    { name: "شركة الخليج العربي للنفط",         tagline: "متابعة مشاريع خطوط الأنابيب والمسوحات الجيولوجية" },
  ZALLAF:   { name: "شركة زلاف ليبيا للنفط والغاز",    tagline: "إدارة مشاريع محطات التحويل والأعمال المدنية" },
  MELLITAH: { name: "شركة مليتة للنفط والغاز",         tagline: "مطالبات المراحل الإنشائية لمعمل معالجة الغاز" },
  SIRTE:    { name: "شركة سرت لإنتاج وتصنيع النفط والغاز", tagline: "مشاريع صيانة الوحدات الصناعية ومحطات الضخ" },
  ZUEITINA: { name: "شركة الزويتينة للنفط", tagline: "مشاريع صيانة الخزانات وتأهيل الموانئ النفطية" },
  HAROUGE:  { name: "شركة الهروج للعمليات النفطية", tagline: "عقود صيانة الحقول البرية والخطوط الرئيسية" },
  AKAKUS:   { name: "شركة أكاكوس للعمليات النفطية", tagline: "إدارة تقدم حقول حوض مرزق النفطي" },
  MABRUK:   { name: "شركة مبروك للعمليات النفطية", tagline: "صيانة وتأهيل حقل البوري وحقل مبروك" }
};

const TENANT_TAGLINES: Record<TenantId, string> = {
  NOC_HQ:   "Central Sovereign Oversight — Technical & Financial Audit Authority",
  WAHA:     "Wellhead Maintenance & Field Progress Claims",
  AGOCO:    "Pipeline Survey & Geological Mapping Projects",
  ZALLAF:   "Substation Civil Works & Installation Contracts",
  MELLITAH: "Gas Plant Overhaul & Stage Milestone Billing",
  SIRTE:    "Industrial Unit Maintenance & Compressor Stations",
  ZUEITINA: "Storage Tank Rehabilitation & Oil Port Operations",
  HAROUGE:  "Onshore Field Operations & Pipeline Overhauls",
  AKAKUS:   "Murzuq Basin Field Development & Logistics",
  MABRUK:   "Al-Jurf & Mabruk Field Production Upgrades"
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UsePortalEntryReturn {
  selectedCompany: TenantId | null;
  selectCompany: (id: TenantId) => void;
  clearCompany: () => void;
  /** NOC HQ users & subsidiary users for the selected company */
  filteredUsers: DemoUser[];
  /** Apex tier tenant (NOC HQ) */
  apexTenant: TenantMeta;
  /** Subsidiary tenants that have at least one demo user */
  subsidiaryTenants: TenantMeta[];
  /** The full TenantMeta for the currently selected company, or null */
  activeTenant: TenantMeta | null;
}

export function usePortalEntry(allUsers: DemoUser[]): UsePortalEntryReturn {
  const [selectedCompany, setSelectedCompany] = useState<TenantId | null>(null);

  // Build TenantMeta list from allUsers
  const tenantMetas = useMemo<TenantMeta[]>(() => {
    return Object.values(TENANT_CONFIG).map((cfg) => {
      const count = allUsers.filter((u) => u.companyId === cfg.id).length;
      const arData = TENANT_AR[cfg.id];
      return {
        id: cfg.id,
        name: cfg.name,
        nameAr: arData?.name ?? cfg.name,
        shortName: cfg.shortName ?? cfg.id,
        logoPath: cfg.logoPath,
        userCount: count,
        isApex: cfg.id === "NOC_HQ",
        tagline: TENANT_TAGLINES[cfg.id] ?? `${cfg.name} Project Operations`,
        taglineAr: arData?.tagline ?? `عمليات مشاريع ${cfg.name}`,
      };
    });
  }, [allUsers]);

  const apexTenant = useMemo(
    () => tenantMetas.find((t) => t.isApex)!,
    [tenantMetas],
  );

  const subsidiaryTenants = useMemo(
    () => tenantMetas.filter((t) => !t.isApex && t.userCount > 0),
    [tenantMetas],
  );

  const filteredUsers = useMemo<DemoUser[]>(() => {
    if (!selectedCompany) return [];
    return allUsers.filter((u) => u.companyId === selectedCompany);
  }, [allUsers, selectedCompany]);

  const activeTenant = useMemo(
    () => tenantMetas.find((t) => t.id === selectedCompany) ?? null,
    [tenantMetas, selectedCompany],
  );

  return {
    selectedCompany,
    selectCompany: setSelectedCompany,
    clearCompany: () => setSelectedCompany(null),
    filteredUsers,
    apexTenant,
    subsidiaryTenants,
    activeTenant,
  };
}
