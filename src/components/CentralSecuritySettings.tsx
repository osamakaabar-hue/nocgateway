import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Shield, Users, Search, Lock, UserX, UserCheck, AlertTriangle, Key } from 'lucide-react';
import { TENANT_CONFIG } from '../brandConfig';
import { useTheme } from './ThemeProvider';
import { User, AuthAuditLog, PendingApproval } from '../types';

interface Props {
  showToast: (msg: string, type: "success" | "error" | "info") => void;
  lang: "en" | "ar";
  currentUser?: any;
  activeRole?: string;
}

const ROOT_ADMIN_ID = 'user-noc-admin';

const getLogoPath = (path: string, theme: string) => {
  if (theme === 'dark' && path?.endsWith('zallaf.svg')) {
    return path.replace('zallaf.svg', 'zallaf-dark.svg');
  }
  return path;
};

export default function CentralSecuritySettings({ showToast, lang, currentUser, activeRole }: Props) {
  const isRtl = lang === "ar";
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    danger?: boolean;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });
  
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({ fullName: "", email: "", companyId: "NOC_HQ", role: "system_admin", password: "", requireApproval: false, isBackup: false });

  // Available roles per company type
  const HQ_ROLES = [
    { value: "system_admin",          label: "NOC System Administrator",     labelAr: "مدير نظام NOC (مسؤول رئيسي)" },
    { value: "pmo_auditor",           label: "NOC PMO Technical Auditor",    labelAr: "مدقق فني للمؤسسة" },
    { value: "noc_finance",           label: "NOC Central Financial Auditor",labelAr: "مدقق مالي مركزي" },
    { value: "noc_head_of_accounts",  label: "NOC Head of Accounts",        labelAr: "رئيس الحسابات العام" },
  ];
  const SUBSIDIARY_ROLES = [
    { value: "subsidiary_pm",      label: "Project Manager (PM)",           labelAr: "مدير مشروع" },
    { value: "subsidiary_finance", label: "Financial Officer (Finance)",    labelAr: "مسؤول مالي" },
  ];
  const availableRoles = newUser.companyId === "NOC_HQ" ? HQ_ROLES : SUBSIDIARY_ROLES;
  const [auditLogs, setAuditLogs] = useState<AuthAuditLog[]>([]);
  const [pendingUsers, setPendingUsers] = useState<PendingApproval[]>([]);
  const [isKillSwitchModalOpen, setIsKillSwitchModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState("WAHA");
  const [overrideData, setOverrideData] = useState({ targetUserEmail: "", newPassword: "", reason: "Security Compliance Review" });

  // Reset Password per user
  const [resetTarget, setResetTarget] = useState<{ id: string; username: string } | null>(null);
  const [resetPw, setResetPw] = useState({ newPassword: "", confirmPassword: "" });

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    fetchAuditLogs(controller.signal);
    fetchPendingUsers(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchUsers = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users', { signal });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error("Failed to fetch users", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch('/api/admin/audit', { signal });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error("Failed to fetch audit logs", e);
    }
  }, []);

  const fetchPendingUsers = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch('/api/admin/pending-users', { signal });
      if (res.ok) {
        const data = await res.json();
        setPendingUsers(data);
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error("Failed to fetch pending users", e);
    }
  }, []);

  const handleApproveUser = async (userId: string, username: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, { method: 'POST' });
      if (res.ok) {
        showToast(isRtl ? `تم اعتماد ${translateUserName(username, true)} وتفعيل الحساب بنجاح` : `${translateUserName(username, false)} approved and activated`, "success");
        fetchUsers();
        fetchPendingUsers();
        fetchAuditLogs();
      } else {
        const err = await res.json();
        showToast(err.error || "Approval failed", "error");
      }
    } catch (e) {
      showToast("Error approving user", "error");
    }
  };

  const handleRejectUser = async (userId: string, username: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/reject`, { method: 'POST' });
      if (res.ok) {
        showToast(isRtl ? `تم رفض طلب إنشاء ${translateUserName(username, true)}` : `${translateUserName(username, false)} rejected and removed`, "info");
        fetchUsers();
        fetchPendingUsers();
        fetchAuditLogs();
      } else {
        const err = await res.json();
        showToast(err.error || "Rejection failed", "error");
      }
    } catch (e) {
      showToast("Error rejecting user", "error");
    }
  };

  const handleToggleStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        const statusLabel = newStatus === 'ACTIVE' 
          ? (user.status === 'LOCKED' ? (isRtl ? 'تم إلغاء قفل الحساب وتنشيطه' : 'User unlocked and activated') : (isRtl ? 'نشط' : 'Active')) 
          : (isRtl ? 'معلق' : 'Suspended');
        showToast(isRtl ? `تم تحديث حالة المستخدم إلى ${statusLabel}` : `User status updated to ${statusLabel}`, "success");
        fetchAuditLogs();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (e) {
      showToast("Error updating user status", "error");
    }
  };

  const handleForceReset = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/force-reset`, { method: 'POST' });
      if (res.ok) {
        showToast(isRtl ? "تم إبطال الجلسة بنجاح" : "Session terminated and reset triggered", "success");
        fetchAuditLogs();
      } else {
        throw new Error("Failed to force reset");
      }
    } catch (e) {
      showToast("Error terminating session", "error");
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    if (resetPw.newPassword !== resetPw.confirmPassword) {
      showToast(isRtl ? "كلمتا المرور غير متطابقتين" : "Passwords do not match", "error");
      return;
    }
    if (resetPw.newPassword.length < 6) {
      showToast(isRtl ? "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل" : "Password must be at least 6 characters", "error");
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${resetTarget.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: resetPw.newPassword })
      });
      if (res.ok) {
        showToast(isRtl ? `تم تغيير كلمة مرور المستخدم ${translateUserName(resetTarget.username, true)} بنجاح` : `Password for ${translateUserName(resetTarget.username, false)} has been reset successfully`, "success");
        setResetTarget(null);
        setResetPw({ newPassword: "", confirmPassword: "" });
        fetchAuditLogs();
      } else {
        const err = await res.json();
        showToast(err.error || "Password reset failed", "error");
      }
    } catch (e) {
      showToast("Error resetting password", "error");
    }
  };

  const handleGlobalKillSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/global-kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: selectedTenant, reason: overrideData.reason })
      });
      if (res.ok) {
        showToast(isRtl ? "تم تنشيط مفتاح الإلغاء الشامل لجميع جلسات الشركة بنجاح!" : `Global session kill switch activated successfully for ${selectedTenant}!`, "success");
        setIsKillSwitchModalOpen(false);
        fetchAuditLogs();
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error || "Kill switch activation failed", "error");
      }
    } catch (e) {
      showToast("Error activating global kill switch", "error");
    }
  };

  const handlePasswordOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/password-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrideData)
      });
      if (res.ok) {
        showToast(isRtl ? "تمت عملية التجاوز الإداري وإعادة تعيين كلمة المرور بنجاح!" : "Administrative password override completed successfully!", "success");
        setIsOverrideModalOpen(false);
        setOverrideData({ targetUserEmail: "", newPassword: "", reason: "Security Compliance Review" });
        fetchAuditLogs();
        fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error || "Override execution failed", "error");
      }
    } catch (e) {
      showToast("Error executing password override", "error");
    }
  };

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUser.fullName,
          email: newUser.email,
          companyId: newUser.companyId,
          role: newUser.role,
          password: newUser.password,
          requireApproval: newUser.requireApproval,
          isBackup: newUser.isBackup
        })
      });

      if (res.ok) {
        const data = await res.json();
        const isPending = data.status === 'PENDING_APPROVAL';
        showToast(
          isPending
            ? (isRtl ? "تم تقديم الطلب — بانتظار الموافقة الثانية" : "User submitted — awaiting second authorization")
            : (isRtl ? "تم تفعيل الحساب بنجاح" : "User provisioned successfully"),
          isPending ? "info" : "success"
        );
        setIsProvisionModalOpen(false);
        setNewUser({ fullName: "", email: "", companyId: "NOC_HQ", role: "system_admin", password: "", requireApproval: false, isBackup: false });
        fetchUsers();
        fetchPendingUsers();
      } else {
        const err = await res.json();
        showToast(err.error || "Provisioning failed", "error");
      }
    } catch (e) {
      showToast("Error provisioning user", "error");
    }
  };

  const getCompanyShortNameAr = (code: string): string => {
    const mapping: Record<string, string> = {
      'NOC_HQ': 'المؤسسة الوطنية للنفط',
      'WAHA': 'الواحة',
      'AGOCO': 'الخليج',
      'ZALLAF': 'زلاف',
      'MELLITAH': 'مليتة',
      'SIRTE': 'سرت',
      'BPMC': 'البريقة',
      'ZUEITINA': 'الزويتينة',
      'HAROUGE': 'الهروج',
      'AKAKUS': 'أكاكوس',
      'RASCO': 'رأس لانوف',
      'ZAWIA': 'الزاوية',
      'SONATRACH': 'سوناطراك',
      'ENI': 'إيني',
      'NPCC': 'الوطنية للإنشاءات',
      'JOWFE': 'الجوف',
      'TAKNIA': 'تقنية',
      'NDWC': 'الوطنية للحفر',
      'NAGECO': 'شمال أفريقيا',
      'MURZUQ': 'مرزق',
      'LIFECO': 'الليبية للأسمدة',
      'CATERING': 'التموين',
      'PETROAIR': 'طيران النفط',
      'NAFUSAH': 'نفوسة',
      'MABRUK': 'مبروك',
      'SARIR': 'السرير',
      'LERCO': 'ليركو',
      'CLINIC': 'مصحة النفط',
      'STCPI': 'المركز النوعي',
      'PTQI': 'معهد التدريب',
      'PRC': 'مركز البحوث',
      'SIPT': 'معهد سبها',
      'API': 'معهد أجدابيا'
    };
    return mapping[code] || code;
  };

  const getCompanyShortNameEn = (arName: string): string => {
    const mapping: Record<string, string> = {
      'الواحة': 'WAHA',
      'الخليج': 'AGOCO',
      'الخليج العربي': 'AGOCO',
      'زلاف': 'ZALLAF',
      'مليتة': 'MELLITAH',
      'سرت': 'SIRTE',
      'البريقة': 'BPMC',
      'الزويتينة': 'ZUEITINA',
      'الهروج': 'HAROUGE',
      'أكاكوس': 'AKAKUS',
      'رأس لانوف': 'RASCO',
      'الزاوية': 'ZAWIA',
      'سوناطراك': 'SONATRACH',
      'إيني': 'ENI',
      'الوطنية للإنشاءات': 'NPCC',
      'الجوف': 'JOWFE',
      'تقنية': 'TAKNIA',
      'الوطنية للحفر': 'NDWC',
      'شمال أفريقيا': 'NAGECO',
      'مرزق': 'MURZUQ',
      'الليبية للأسمدة': 'LIFECO',
      'التموين': 'CATERING',
      'طيران النفط': 'PETROAIR',
      'نفوسة': 'NAFUSAH',
      'مبروك': 'MABRUK',
      'السرير': 'SARIR',
      'ليركو': 'LERCO',
      'مصحة النفط': 'CLINIC',
      'المركز النوعي': 'STCPI',
      'معهد التدريب': 'PTQI',
      'مركز البحوث': 'PRC',
      'معهد سبها': 'SIPT',
      'معهد أجدابيا': 'API'
    };
    return mapping[arName] || arName;
  };

  const translateUserName = (name: string, toAr: boolean): string => {
    if (!name) return "";

    const englishToArabic: Record<string, string> = {
      "Dr. Khaled Security": "د. خالد سكيوريتي",
      "Abdelrahman Boufardis": "عبدالرحمن بوفرديس",
      "Nadia Al-Kout": "نادية الكوت",
      "Eng. Nadia Al-Kout": "م. نادية الكوت",
      "Salma Al-Hashemi": "سلمى الهاشمي",
      "Tarek El-Fassi": "طارق الفاسي",
      "Mustafa Al-Bakoush": "مصطفى البكوش",
      "Salem Al-Obeidi": "سالم العبيدي",
      "Bashir Al-Ghariani": "بشير الغرياني",
      "Muftah Al-Warfali": "مفتاح الورفلي",
      "Ibrahim Al-Fitouri": "إبراهيم الفيتوري"
    };

    const arabicToEnglish: Record<string, string> = {
      "د. خالد سكيوريتي": "Dr. Khaled Security",
      "د. خالد السكيورتي": "Dr. Khaled Security",
      "عبدالرحمن بوفرديس": "Abdelrahman Boufardis",
      "نادية الكوت": "Nadia Al-Kout",
      "م. نادية الكوت": "Eng. Nadia Al-Kout",
      "سلمى الهاشمي": "Salma Al-Hashemi",
      "طارق الفاسي": "Tarek El-Fassi",
      "مصطفى البكوش": "Mustafa Al-Bakoush",
      "سالم العبيدي": "Salem Al-Obeidi",
      "بشير الغرياني": "Bashir Al-Ghariani",
      "مفتاح الورفلي": "Muftah Al-Warfali",
      "إبراهيم الفيتوري": "Ibrahim Al-Fitouri"
    };

    if (toAr) {
      if (englishToArabic[name]) {
        return englishToArabic[name];
      }

      // Check dynamic Salem Project Manager: e.g. "Eng. Salem (PM - WAHA)"
      const pmMatch = name.match(/^Eng\.\s+Salem\s+\(PM\s+-\s+([A-Z0-9_]+)\)$/);
      if (pmMatch) {
        return `م. سالم (مدير مشروع - ${getCompanyShortNameAr(pmMatch[1])})`;
      }

      // Check dynamic Mustafa Finance Officer: e.g. "Mustafa Al-Bakoush (Fin - WAHA)"
      const finMatch = name.match(/^Mustafa\s+Al-Bakoush\s+\(Fin\s+-\s+([A-Z0-9_]+)\)$/);
      if (finMatch) {
        return `مصطفى البكوش (مسؤول مالي - ${getCompanyShortNameAr(finMatch[1])})`;
      }

      return name;
    } else {
      if (arabicToEnglish[name]) {
        return arabicToEnglish[name];
      }

      // Check dynamic PM in Arabic: e.g. "م. سالم (مدير مشروع - الواحة)"
      const pmMatchAr = name.match(/^م\.\s+سالم\s+\(مدير مشروع\s+-\s+(.+)\)$/);
      if (pmMatchAr) {
        return `Eng. Salem (PM - ${getCompanyShortNameEn(pmMatchAr[1])})`;
      }

      // Check dynamic Fin in Arabic: e.g. "مصطفى البكوش (مسؤول مالي - الواحة)"
      const finMatchAr = name.match(/^مصطفى\s+البكوش\s+\(مسؤول مالي\s+-\s+(.+)\)$/);
      if (finMatchAr) {
        return `Mustafa Al-Bakoush (Fin - ${getCompanyShortNameEn(finMatchAr[1])})`;
      }

      return name;
    }
  };

  const getTenantId = (companyName: string) => {
    let tenantId = 'NOC_HQ';
    if (companyName.includes('Waha')) tenantId = 'WAHA';
    else if (companyName.includes('Arabian Gulf') || companyName.includes('AGOCO')) tenantId = 'AGOCO';
    else if (companyName.includes('Zallaf')) tenantId = 'ZALLAF';
    else if (companyName.includes('Mellitah')) tenantId = 'MELLITAH';
    else if (companyName.includes('Sirte')) tenantId = 'SIRTE';
    else if (companyName.includes('Brega')) tenantId = 'BPMC';
    else if (companyName.includes('Zueitina')) tenantId = 'ZUEITINA';
    else if (companyName.includes('Harouge')) tenantId = 'HAROUGE';
    else if (companyName.includes('Akakus')) tenantId = 'AKAKUS';
    else if (companyName.includes('Ras Lanuf')) tenantId = 'RASCO';
    else if (companyName.includes('Zawia')) tenantId = 'ZAWIA';
    return tenantId;
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const term = searchTerm.toLowerCase();
      const matchSearch = !term ||
        (u.username || '').toLowerCase().includes(term) ||
        (u.email || '').toLowerCase().includes(term) ||
        (u.company_id || '').toLowerCase().includes(term) ||
        (u.company_name || '').toLowerCase().includes(term);
      const matchRole = !filterRole || (u.role || '') === filterRole;
      const matchCompany = !filterCompany || (u.company_id || '') === filterCompany;
      return matchSearch && matchRole && matchCompany;
    }).sort((a, b) => {
      const tenantA = a.company_id || getTenantId(a.company_name || '');
      const tenantB = b.company_id || getTenantId(b.company_name || '');
      if (tenantA !== tenantB) {
        if (tenantA === 'NOC_HQ') return -1;
        if (tenantB === 'NOC_HQ') return 1;
        return tenantA.localeCompare(tenantB);
      }
      return (a.username || '').localeCompare(b.username || '');
    });
  }, [users, searchTerm, filterRole, filterCompany]);

  if (activeRole !== "system_admin" || currentUser?.companyId !== "NOC_HQ") {
    return (
      <div className="flex-1 p-8 flex items-center justify-center bg-slate-50 dark:bg-[#040f24] min-h-[70vh]" dir={isRtl ? "rtl" : "ltr"}>
        <div className="bg-white dark:bg-[#0a1930] p-8 border border-red-200 dark:border-red-900/50 rounded-xl max-w-2xl text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-900/50">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-black text-red-900 dark:text-red-200 uppercase tracking-wider mb-2">
            {isRtl ? "محاولة اختراق أمني كاشفة - تم رفض الوصول" : "Security Violation Detected - Access Denied"}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6">
            {isRtl 
              ? "تنبيه: محاولة وصول غير مصرح بها للوحة التحكم الأمني السيادي للمؤسسة الوطنية للنفط. يجب أن تكون مسجلاً بصفة 'مسؤول النظام (SYSTEM_ADMIN)' من داخل شبكة المقر الرئيسي للمؤسسة (NOC HQ) لتخويل هذه الصفحة. تم إرسال تنبيه فوري وتسجيل التوقيع الرقمي للمشغل وجهازه في دفتر سيادة البيانات اللامركزي."
              : "ATTENTION: Unauthorized access attempt detected on the sovereign security governance board of the National Oil Corporation. You must hold 'SYSTEM_ADMIN' active credentials within the NOC Headquarters (NOC HQ) tenant space to modify this panel. Operating system context and operator IP signature have been immutably dispatched to the Data Sovereignty Ledger."}
          </p>
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-left font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <p><strong>VIOLATION_TIMESTAMP:</strong> {new Date().toISOString()}</p>
            <p><strong>ACTOR_ID:</strong> {currentUser?.id || "ANONYMOUS_OPERATOR"}</p>
            <p><strong>ACTIVE_ROLE:</strong> {activeRole || "UNDEFINED"}</p>
            <p><strong>TENANT_CONTEXT:</strong> {currentUser?.companyId || "EXTERNAL_IP"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 font-sans ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Dashboard Header */}
      <div className={`mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-amber-500" />
            {isRtl ? "لوحة القيادة الإدارية المركزية" : "Master Security & Governance"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-2xl">
            {isRtl 
              ? "إدارة صارمة لحسابات النظام والشركات المشغلة. التحكم الكامل بالجلسات والصلاحيات عبر المنظومة." 
              : "Strict governance for system identities and subsidiary entities. Global control over sessions and RBAC."}
          </p>
        </div>
        <button 
          onClick={() => setIsProvisionModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-amber-500 font-bold px-5 py-2.5 rounded shadow-md border border-slate-700 flex items-center gap-2 transition-colors"
        >
          <Users className="w-4 h-4" />
          {isRtl ? "توفير حساب جديد" : "Provision New Identity"}
        </button>
      </div>

      {/* ── Pending Approvals Panel ─────────────────────── */}
      {pendingUsers.length > 0 && (
        <div className="mb-6 rounded-xl border-2 border-amber-400 dark:border-amber-500/60 bg-amber-50 dark:bg-amber-950/20 overflow-hidden shadow-md">
          {/* Header */}
          <div className={`flex items-center gap-3 px-5 py-3 bg-amber-100 dark:bg-amber-900/30 border-b border-amber-300 dark:border-amber-600/40 ${isRtl ? "flex-row-reverse" : ""}`}>
            <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-amber-900 dark:text-amber-300 text-sm uppercase tracking-wider">
                {isRtl ? "طلبات التفويض المزدوج المعلقة" : "Dual Authorization Pending Approvals"}
              </h3>
              <p className="text-[10px] text-amber-700 dark:text-amber-400">
                {isRtl
                  ? `${pendingUsers.length} طلب/طلبات بانتظار الموافقة الثانية`
                  : `${pendingUsers.length} request(s) awaiting second administrator approval`}
              </p>
            </div>
            <span className="w-7 h-7 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shrink-0">
              {pendingUsers.length}
            </span>
          </div>

          {/* Pending user cards */}
          <div className="divide-y divide-amber-200 dark:divide-amber-800/30">
            {pendingUsers.map((pu: any) => (
              <div key={pu.user_id} className={`flex items-center gap-4 px-5 py-3 ${isRtl ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-amber-200 dark:bg-amber-900/50 flex items-center justify-center shrink-0 text-amber-700 dark:text-amber-300 font-black text-sm">
                  {translateUserName(pu.username, isRtl).charAt(0).toUpperCase()}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{translateUserName(pu.username, isRtl)}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{pu.email}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">
                      {pu.company_name || pu.company_id}
                    </span>
                    {pu.role && (
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-mono">
                        {pu.role}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {isRtl ? "طُلب بواسطة:" : "Requested by:"} {pu.requested_by}
                    </span>
                  </div>
                </div>
                {/* Action buttons */}
                <div className={`flex items-center gap-2 shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <button
                    onClick={() => handleApproveUser(pu.user_id, pu.username)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded border border-emerald-700 shadow-sm transition-colors uppercase tracking-wide"
                  >
                    {isRtl ? "✓ اعتماد" : "✓ Approve"}
                  </button>
                  <button
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: isRtl ? "تأكيد الرفض" : "Confirm Rejection",
                        message: isRtl ? `هل أنت متأكد من رفض طلب ${translateUserName(pu.username, true)}؟` : `Reject and remove ${translateUserName(pu.username, false)}?`,
                        danger: true,
                        onConfirm: () => {
                          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                          handleRejectUser(pu.user_id, pu.username);
                        }
                      });
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black rounded border border-rose-700 shadow-sm transition-colors uppercase tracking-wide"
                  >
                    {isRtl ? "✕ رفض" : "✕ Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Directory Grid */}
      <div className="bg-white dark:bg-[#0a1930] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-3">
          {/* Title row */}
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">
              {isRtl ? "سجل هويات المستخدمين" : "Identity Directory Registry"}
            </h3>
          </div>
          {/* Search + Filters row */}
          <div className={`flex flex-col sm:flex-row items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {/* Search input */}
            <div className="relative flex-1 min-w-0">
              <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                id="dir-search"
                type="text"
                placeholder={isRtl ? "ابحث بالاسم، البريد أو الشركة..." : "Search identities, email or tenant..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full bg-white dark:bg-[#0a1930] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded py-2 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
              />
            </div>
            {/* Role filter */}
            <select
              id="dir-filter-role"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-white dark:bg-[#0a1930] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded px-3 py-2 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer shrink-0"
            >
              <option value="">{isRtl ? "— كل الأدوار —" : "— All Roles —"}</option>
              <option value="system_admin">{isRtl ? "مدير النظام" : "NOC System Admin"}</option>
              <option value="pmo_auditor">{isRtl ? "مدقق فني" : "PMO Auditor"}</option>
              <option value="noc_finance">{isRtl ? "مدقق مالي مركزي" : "Central Finance"}</option>
              <option value="noc_head_of_accounts">{isRtl ? "رئيس الحسابات" : "Head of Accounts"}</option>
              <option value="subsidiary_pm">{isRtl ? "مدير مشروع" : "Project Manager"}</option>
              <option value="subsidiary_finance">{isRtl ? "محاسب" : "Finance Officer"}</option>
              <option value="subsidiary_account">{isRtl ? "محاسب فرعي" : "Account Manager"}</option>
            </select>
            {/* Company filter */}
            <select
              id="dir-filter-company"
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="bg-white dark:bg-[#0a1930] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded px-3 py-2 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer shrink-0"
            >
              <option value="">{isRtl ? "— كل الشركات —" : "— All Companies —"}</option>
              <option value="NOC_HQ">{isRtl ? "المؤسسة الوطنية للنفط" : "NOC HQ"}</option>
              <option value="WAHA">Waha Oil</option>
              <option value="AGOCO">AGOCO</option>
              <option value="ZALLAF">Zallaf</option>
              <option value="MELLITAH">Mellitah</option>
              <option value="ZUEITINA">Zueitina</option>
              <option value="HAROUGE">Harouge</option>
              <option value="SIRTE">Sirte Oil</option>
              <option value="BREGA">Brega</option>
              <option value="ISCM">ISCM</option>
              <option value="ENI">ENI</option>
              <option value="REPSOL">Repsol</option>
              <option value="OMV">OMV</option>
              <option value="WINTERSHALL">Wintershall</option>
              <option value="JOWFE">Jowfe</option>
              <option value="LIFECO">LIFECO</option>
              <option value="MABRUK">Mabruk</option>
              <option value="MURZUQ">Murzuq</option>
              <option value="NAFUSAH">Nafusah</option>
              <option value="CATERING">NOC Catering</option>
              <option value="CLINIC">Oil Clinic</option>
              <option value="API">Ajdabiya PI</option>
            </select>
            {/* Clear filters */}
            {(filterRole || filterCompany || searchTerm) && (
              <button
                id="dir-clear-filters"
                onClick={() => { setFilterRole(''); setFilterCompany(''); setSearchTerm(''); }}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline shrink-0 whitespace-nowrap px-2"
              >
                {isRtl ? "✕ مسح" : "✕ Clear"}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-4" dir={isRtl ? "rtl" : "ltr"}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`animate-pulse flex ${isRtl ? 'space-x-reverse' : ''} space-x-4`}>
                <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-10 w-10 shrink-0"></div>
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded col-span-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr className={isRtl ? "text-right" : "text-left"}>
                  <th className="px-4 py-3">{isRtl ? "الهوية / المؤسسة" : "Identity / Tenant"}</th>
                  <th className="px-4 py-3">{isRtl ? "البريد الإلكتروني" : "Email Address"}</th>
                  <th className="px-4 py-3">{isRtl ? "الدور" : "Role"}</th>
                  <th className="px-4 py-3">{isRtl ? "الحالة" : "Status"}</th>
                  <th className="px-4 py-3 text-center">{isRtl ? "الإجراءات الأمنية" : "Security Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(user => {
                  const companyName = user.company_name || 'National Oil Corporation (NOC)';
                  // Use company_id directly from API (most reliable), fallback to text-matching
                  const tenantId = user.company_id || getTenantId(companyName);
                  const tenantInfo = TENANT_CONFIG[tenantId as keyof typeof TENANT_CONFIG] || TENANT_CONFIG['NOC_HQ'];

                  return (
                    <tr key={user.id} className={`hover:bg-slate-50 dark:bg-slate-900 transition-colors ${isRtl ? "text-right" : "text-left"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 p-1 bg-white dark:bg-[#0a1930] border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-center shrink-0`}>
                            <img src={getLogoPath(tenantInfo?.logoPath || '', theme)} alt={tenantInfo?.shortName || tenantInfo?.name} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="%2394a3b8" viewBox="0 0 24 24"><path d="M3 3h18v18H3z"/></svg>')} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{translateUserName(user.username, isRtl)}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono mt-0.5">{tenantInfo?.shortName || companyName} Node</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-[10px] border border-slate-200 dark:border-slate-700">
                          {user.email}
                        </span>
                      </td>
                      {/* Role column */}
                      <td className="px-4 py-3">
                        {(() => {
                          const roleMap: Record<string, { label: string; labelAr: string; color: string }> = {
                            subsidiary_pm:        { label: "Project Manager",         labelAr: "مدير مشروع",           color: "bg-blue-100 text-blue-800 border-blue-200" },
                            subsidiary_finance:   { label: "Financial Officer",       labelAr: "مسؤول مالي",           color: "bg-purple-100 text-purple-800 border-purple-200" },
                            pmo_auditor:          { label: "PMO Auditor",             labelAr: "مدقق فني",               color: "bg-amber-100 text-amber-800 border-amber-200" },
                            noc_finance:          { label: "Central Finance",         labelAr: "مدقق مالي مركزي",    color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
                            noc_head_of_accounts: { label: "Head of Accounts",        labelAr: "رئيس الحسابات",        color: "bg-rose-100 text-rose-800 border-rose-200" },
                            system_admin:         { label: "NOC Admin",              labelAr: "مدير النظام",           color: "bg-slate-900 text-amber-400 border-slate-700 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/50" },
                          };
                          // Infer role from email pattern if not stored
                          let roleKey = user.role || "";
                          if (!roleKey) {
                            if (user.email?.startsWith("pm@") || user.id?.includes("-pm")) roleKey = "subsidiary_pm";
                            else if (user.email?.startsWith("finance@") || user.id?.includes("-fin")) roleKey = "subsidiary_finance";
                            else if (user.email?.includes("nadia") || user.id === "user-noc-pmo") roleKey = "pmo_auditor";
                            else if (user.email?.includes("abdelrahman") || user.id === "user-noc-fin") roleKey = "noc_finance";
                            else if (user.email?.includes("salma") || user.id === "user-noc-head") roleKey = "noc_head_of_accounts";
                            else if (user.id === "user-noc-admin") roleKey = "system_admin";
                          }
                          const r = roleMap[roleKey];
                          return r ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider border ${r.color}`}>
                              {isRtl ? r.labelAr : r.label}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">—</span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {user.status === "ACTIVE" ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {isRtl ? "نشط" : "ACTIVE"}
                            </span>
                          ) : user.status === "PENDING_APPROVAL" ? (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              {isRtl ? "بانتظار الموافقة" : "PENDING"}
                            </span>
                          ) : user.status === "LOCKED" ? (
                            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                              {isRtl ? "مغلق" : "LOCKED"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              {isRtl ? "معلق" : "SUSPENDED"}
                            </span>
                          )}
                          {user.is_backup === 1 && (
                            <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 border border-sky-200 px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider">
                              {isRtl ? "نسخة احتياطية" : "BACKUP"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center justify-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
                          {user.id !== 'user-noc-admin' && (
                            <>
                              {/* Suspend / Reactivate */}
                              <button 
                                onClick={() => handleToggleStatus(user.id)}
                                title={
                                  user.status === "LOCKED" 
                                    ? (isRtl ? "إلغاء قفل الحساب" : "Unlock Identity")
                                    : user.status === "ACTIVE" 
                                      ? (isRtl ? "تعليق الحساب" : "Suspend Identity") 
                                      : (isRtl ? "تفعيل الحساب" : "Reactivate Identity")
                                }
                                className={`p-1.5 rounded border transition-colors ${
                                  user.status === "LOCKED"
                                    ? "text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-300 dark:bg-amber-950/20 dark:border-amber-700"
                                    : user.status === "ACTIVE" 
                                      ? "text-rose-600 hover:bg-rose-50 border-rose-200" 
                                      : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                                }`}
                              >
                                {user.status === "LOCKED" ? (
                                  <UserCheck className="w-4 h-4 text-emerald-600 animate-pulse" />
                                ) : user.status === "ACTIVE" ? (
                                  <UserX className="w-4 h-4" />
                                ) : (
                                  <UserCheck className="w-4 h-4" />
                                )}
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => {
                                  setResetTarget({ id: user.id, username: user.username });
                                  setResetPw({ newPassword: "", confirmPassword: "" });
                                }}
                                title={isRtl ? "إعادة تعيين كلمة المرور" : "Reset Password"}
                                className="p-1.5 rounded border border-sky-300 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950 transition-colors"
                              >
                                <Key className="w-4 h-4" />
                              </button>

                              {/* Emergency Terminate */}
                              <button 
                                onClick={() => {
                                  setConfirmDialog({
                                    isOpen: true,
                                    title: isRtl ? "إنهاء الجلسة طارئياً" : "Emergency Session Terminate",
                                    message: isRtl ? "هل أنت متأكد من إنهاء جلسة هذا المستخدم وفرض إعادة تعيين كلمة المرور؟" : "Are you sure you want to terminate this user's session and force a password reset?",
                                    danger: true,
                                    onConfirm: () => {
                                      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                                      handleForceReset(user.id);
                                    }
                                  });
                                }}
                                title={isRtl ? "إنهاء الجلسة طارئياً" : "Emergency Session Terminate"}
                                className="p-1.5 rounded border border-amber-500/30 text-amber-600 hover:bg-amber-50 transition-colors"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {user.id === 'user-noc-admin' && (
                            <span className="text-[10px] text-slate-400 font-mono italic">ROOT PROTECTED</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sovereign Security Operations Console */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Operations Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#0a1930] border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
            <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-500 animate-pulse" />
              {isRtl ? "عمليات السيادة الفورية" : "Sovereign Threat Actions"}
            </h3>
            
            <div className="space-y-4">
              {/* Emergency Session Kill Switch Card */}
              <div className="p-4 border border-rose-100 dark:border-rose-950/50 bg-rose-50/40 dark:bg-rose-950/10 rounded-lg text-left" dir={isRtl ? "rtl" : "ltr"}>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5 mb-1 text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  {isRtl ? "مفتاح الإلغاء الشامل للجلسات" : "Global Session Kill Switch"}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                  {isRtl 
                    ? "يقوم بإبطال جميع الجلسات النشطة وتوقيعات JWT لجميع موظفي الشركة المشغلة المحددة على الفور."
                    : "Instantly invalidate all active sessions and JWT signatures for all operators of the selected operating subsidiary."}
                </p>
                <button
                  onClick={() => setIsKillSwitchModalOpen(true)}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded text-xs transition-colors shadow-sm uppercase tracking-wide flex items-center justify-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {isRtl ? "تشغيل الإلغاء الطارئ" : "Trigger Emergency Revocation"}
                </button>
              </div>

              {/* Password Override Card */}
              <div className="p-4 border border-amber-100 dark:border-amber-950/50 bg-amber-50/40 dark:bg-amber-950/10 rounded-lg text-left" dir={isRtl ? "rtl" : "ltr"}>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5 mb-1 text-amber-700 dark:text-amber-400">
                  <Key className="w-4 h-4" />
                  {isRtl ? "تجاوز يدوي لكمة المرور" : "Manual Passphrase Override"}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                  {isRtl
                    ? "إعادة تعيين قسرية لكلمة مرور المستخدم بدون الحاجة لتصريح إلكتروني ثنائي كامتثال تدقيقي."
                    : "Force-reset target identity passphrase with explicit compliance justification bypassing standard user-flows."}
                </p>
                <button
                  onClick={() => setIsOverrideModalOpen(true)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-amber-500 border border-slate-700 dark:border-slate-600 font-bold py-1.5 px-3 rounded text-xs transition-colors shadow-sm uppercase tracking-wide flex items-center justify-center gap-1"
                >
                  <Key className="w-3.5 h-3.5" />
                  {isRtl ? "تجاوز وتحديث قسري" : "Execute Force Override"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Security Audit Log Stream */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#0a1930] border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-500" />
                {isRtl ? "سجل تدقيق الامتثال الأمني اللحظي" : "Sovereign Audit Trail Ledger"}
              </h3>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold font-mono tracking-wide uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                {isRtl ? "آمن ومحمي" : "Secure Stream"}
              </span>
            </div>

            <div className="flex-1 overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="w-full text-xs text-left" dir="ltr">
                <thead className="bg-slate-50 dark:bg-slate-900 text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-3 py-2.5">Timestamp</th>
                    <th className="px-3 py-2.5">Action</th>
                    <th className="px-3 py-2.5">Actor</th>
                    <th className="px-3 py-2.5">Target</th>
                    <th className="px-3 py-2.5">Details</th>
                    <th className="px-3 py-2.5 text-right">Node IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                        No operations logged in this sequence.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString() || log.timestamp}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-block font-mono text-[9px] font-black px-1.5 py-0.5 rounded border ${
                            log.action === "GLOBAL_KILL_SWITCH" 
                              ? "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50" 
                              : log.action === "PASSWORD_OVERRIDE"
                              ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50"
                              : "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300">
                          {log.actor_name}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                          {log.target_id}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 font-medium text-[11px] leading-snug">
                          {log.details}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[10px] text-slate-400 text-right">
                          {log.ip_address}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Global Kill Switch Modal */}
      {isKillSwitchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a1930] rounded shadow-2xl w-full max-w-md border border-red-200 dark:border-red-900/50 overflow-hidden">
            <div className="bg-rose-900 px-5 py-4 border-b-2 border-rose-500 flex justify-between items-center">
              <h3 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-300 animate-pulse" />
                {isRtl ? "تنشيط مفتاح الإلغاء الشامل" : "ACTIVATE GLOBAL KILL SWITCH"}
              </h3>
              <button onClick={() => setIsKillSwitchModalOpen(false)} className="text-white/80 hover:text-white transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleGlobalKillSwitch} className="p-6 space-y-4" dir={isRtl ? "rtl" : "ltr"}>
              <div className="bg-rose-50 dark:bg-rose-950/20 p-4 border border-rose-100 dark:border-rose-900/30 rounded text-xs text-rose-800 dark:text-rose-400 leading-relaxed font-medium">
                {isRtl 
                  ? "تنبيه: سيتم إبطال جميع المعرفات وتذاكر الوصول الرقمية لجميع مشغلي هذه الشركة التابعة فوراً. سيتعين عليهم إثبات الهوية مجدداً قبل معاودة العمل."
                  : "WARNING: This operation immediately revokes all JSON Web Tokens and active sessions for all subsidiary operators under this tenant. They will be logged out instantly and forced to re-authenticate."}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isRtl ? "الشركة التابعة المستهدفة" : "Target Subsidiary Tenant"}
                </label>
                <select 
                  value={selectedTenant} onChange={e => setSelectedTenant(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                >
                  {Object.values(TENANT_CONFIG).filter(t => t.id !== 'NOC_HQ').map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name} ({tenant.shortName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isRtl ? "تبرير الامتثال الأمني" : "Security Compliance Justification"}
                </label>
                <textarea 
                  required
                  rows={3}
                  value={overrideData.reason} onChange={e => setOverrideData({...overrideData, reason: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                  placeholder={isRtl ? "اكتب تبريراً أمنياً لحالة الإلغاء الطارئ..." : "Provide an auditable reason for this emergency security action..."}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsKillSwitchModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold rounded hover:bg-slate-100 dark:bg-slate-800 transition-colors uppercase tracking-wider"
                >
                  {isRtl ? "إلغاء" : "Abort"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 text-white font-black rounded shadow-md hover:bg-rose-700 transition-colors uppercase tracking-wider flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {isRtl ? "تنفيذ الإلغاء الشامل" : "Execute Global Revoke"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Override Modal */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a1930] rounded shadow-2xl w-full max-w-md border border-amber-200 dark:border-amber-900/50 overflow-hidden">
            <div className="bg-slate-900 px-5 py-4 border-b-2 border-amber-500 flex justify-between items-center">
              <h3 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                {isRtl ? "تجاوز يدوي لكمة المرور" : "MANUAL CREDENTIAL OVERRIDE"}
              </h3>
              <button onClick={() => setIsOverrideModalOpen(false)} className="text-white/80 hover:text-white transition-colors">✕</button>
            </div>
            
            <form onSubmit={handlePasswordOverrideSubmit} className="p-6 space-y-4" dir={isRtl ? "rtl" : "ltr"}>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isRtl ? "البريد الإلكتروني للمستخدم المستهدف" : "Target Operator Email"}
                </label>
                <input 
                  type="email" required
                  value={overrideData.targetUserEmail} onChange={e => setOverrideData({...overrideData, targetUserEmail: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-amber-500 outline-none font-mono"
                  placeholder="operator@company.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isRtl ? "كلمة المرور الجديدة القسرية" : "New Forced Passphrase"}
                </label>
                <input 
                  type="password" required
                  value={overrideData.newPassword} onChange={e => setOverrideData({...overrideData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-amber-500 outline-none font-mono tracking-widest"
                  placeholder="••••••••••••"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isRtl ? "مبرر الامتثال الأمني" : "Security Compliance Justification"}
                </label>
                <textarea 
                  required
                  rows={2}
                  value={overrideData.reason} onChange={e => setOverrideData({...overrideData, reason: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder={isRtl ? "اكتب تبريراً أمنياً لإعادة التعيين..." : "Provide an auditable reason for this forced credential reset..."}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold rounded hover:bg-slate-100 dark:bg-slate-800 transition-colors uppercase tracking-wider"
                >
                  {isRtl ? "إلغاء" : "Abort"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-amber-500 border border-amber-500/50 text-xs font-black rounded shadow-md hover:bg-slate-800 transition-colors uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Key className="w-4 h-4" />
                  {isRtl ? "تطبيق التجاوز القسري" : "Apply Force Override"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Provision Modal */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a1930] rounded shadow-2xl w-full max-w-md border border-slate-300 dark:border-slate-700 overflow-hidden">
            <div className={`bg-slate-900 px-5 py-4 border-b-2 border-amber-500 dark:border-amber-600 flex justify-between items-center ${isRtl ? "flex-row-reverse" : ""}`}>
              <h3 className="font-black text-white text-sm tracking-wider uppercase flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                {isRtl ? "تسجيل نقطة وصول جديدة" : "PROVISION NEW ACCESS NODE"}
              </h3>
              <button onClick={() => setIsProvisionModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleProvisionSubmit} className="p-6 space-y-4 text-left" dir={isRtl ? "rtl" : "ltr"}>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isRtl ? "الاسم الكامل" : "Full Name / Identity"}
                </label>
                <input 
                  type="text" required
                  value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isRtl ? "البريد الإلكتروني المؤسسي" : "Corporate Email Address"}
                </label>
                <input 
                  type="email" required
                  value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-amber-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isRtl ? "كلمة المرور المؤقتة" : "Temporary Passphrase"}
                </label>
                <input 
                  type="password" required
                  value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-amber-500 outline-none font-mono tracking-widest"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isRtl ? "الجهة المشغلة (Tenant)" : "Operating Tenant Assignment"}
                </label>
                <select 
                  value={newUser.companyId}
                  onChange={e => {
                    const newCompanyId = e.target.value;
                    // Reset role to first available for the new company type
                    const defaultRole = newCompanyId === "NOC_HQ" ? "system_admin" : "subsidiary_pm";
                    setNewUser({...newUser, companyId: newCompanyId, role: defaultRole});
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  {Object.values(TENANT_CONFIG).map(tenant => (
                    <option key={tenant.id} value={tenant.id}>{tenant.name} ({tenant.shortName})</option>
                  ))}
                </select>
              </div>

              {/* Role Selector — appears after company is chosen */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isRtl ? "نوع الدور الوظيفي" : "Role / Job Type"}
                </label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  {availableRoles.map(r => (
                    <option key={r.value} value={r.value}>
                      {isRtl ? r.labelAr : r.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-slate-400">
                  {isRtl
                    ? "سيحدد الدور نطاق صلاحيات الوصول لهذا المستخدم داخل المنصة."
                    : "The selected role defines this user's access scope within the platform."}
                </p>
              </div>
              
              {/* ── Advanced Options ─────────────────────── */}
              <div className="mt-2 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-900 px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {isRtl ? "خيارات متقدمة" : "Advanced Options"}
                  </span>
                </div>

                {/* Backup User Toggle */}
                <label className={`flex items-start gap-3 px-3 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 ${isRtl ? "flex-row-reverse" : ""}`}>
                  <div className="mt-0.5">
                    <div
                      onClick={() => setNewUser({...newUser, isBackup: !newUser.isBackup})}
                      className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${newUser.isBackup ? "bg-sky-500" : "bg-slate-300 dark:bg-slate-600"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${newUser.isBackup ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                  </div>
                  <div className={isRtl ? "text-right" : ""}>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isRtl ? "إنشاء كمستخدم احتياطي (Backup)" : "Create as Backup Identity"}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {isRtl ? "يُستخدم هذا الحساب كبديل احتياطي لمهام العمليات الحيوية." : "This account acts as a fallback for critical operations roles."}
                    </div>
                  </div>
                </label>

                {/* Dual Authorization Toggle */}
                <label className={`flex items-start gap-3 px-3 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isRtl ? "flex-row-reverse" : ""}`}>
                  <div className="mt-0.5">
                    <div
                      onClick={() => setNewUser({...newUser, requireApproval: !newUser.requireApproval})}
                      className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${newUser.requireApproval ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-600"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${newUser.requireApproval ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                  </div>
                  <div className={isRtl ? "text-right" : ""}>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isRtl ? "اشتراط التفويض المزدوج" : "Require Dual Authorization"}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {isRtl
                        ? "لن يُفعَّل الحساب حتى يوافق عليه مدير ثانٍ من NOC."
                        : "Account stays PENDING until a second NOC administrator approves it."}
                    </div>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold rounded hover:bg-slate-100 dark:bg-slate-800 transition-colors uppercase tracking-wider"
                >
                  {isRtl ? "إلغاء" : "Abort"}
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-black rounded shadow-md transition-colors uppercase tracking-wider ${newUser.requireApproval ? "bg-amber-500 text-slate-900 hover:bg-amber-400" : "bg-slate-900 text-amber-500 border border-amber-500/50 hover:bg-slate-800"}`}
                >
                  {newUser.requireApproval
                    ? (isRtl ? "تقديم للمراجعة" : "Submit for Approval")
                    : (isRtl ? "اعتماد وتسجيل" : "Initialize Identity")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ───────────────────────── */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir={isRtl ? "rtl" : "ltr"}>
          <div className="bg-white dark:bg-[#0a1930] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center shrink-0">
                <Key className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm">
                  {isRtl ? "إعادة تعيين كلمة المرور" : "Reset Password"}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  {translateUserName(resetTarget.username, isRtl)}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleResetPasswordSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isRtl ? "كلمة المرور الجديدة" : "New Password"}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={resetPw.newPassword}
                  onChange={e => setResetPw({ ...resetPw, newPassword: e.target.value })}
                  placeholder={isRtl ? "أدخل كلمة المرور الجديدة..." : "Enter new password..."}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {isRtl ? "تأكيد كلمة المرور" : "Confirm Password"}
                </label>
                <input
                  type="password"
                  required
                  value={resetPw.confirmPassword}
                  onChange={e => setResetPw({ ...resetPw, confirmPassword: e.target.value })}
                  placeholder={isRtl ? "أعد إدخال كلمة المرور..." : "Re-enter password..."}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded text-xs focus:ring-1 outline-none ${
                    resetPw.confirmPassword && resetPw.newPassword !== resetPw.confirmPassword
                      ? "border-rose-400 focus:ring-rose-400"
                      : "border-slate-300 dark:border-slate-700 focus:ring-sky-500"
                  }`}
                />
                {resetPw.confirmPassword && resetPw.newPassword !== resetPw.confirmPassword && (
                  <p className="mt-1 text-[10px] text-rose-500">
                    {isRtl ? "كلمتا المرور غير متطابقتين" : "Passwords do not match"}
                  </p>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setResetTarget(null); setResetPw({ newPassword: "", confirmPassword: "" }); }}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-wider"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 text-white text-xs font-black rounded shadow-md hover:bg-sky-700 transition-colors uppercase tracking-wider"
                >
                  {isRtl ? "حفظ كلمة المرور" : "Save Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir={isRtl ? "rtl" : "ltr"}>
          <div className={`bg-white dark:bg-[#0a1930] rounded-xl shadow-2xl w-full max-w-sm border overflow-hidden ${
            confirmDialog.danger ? 'border-rose-200 dark:border-rose-900/50' : 'border-slate-200 dark:border-slate-700'
          }`}>
            <div className={`px-5 py-4 border-b flex justify-between items-center ${
              confirmDialog.danger 
                ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30' 
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}>
              <h3 className={`font-black text-sm uppercase flex items-center gap-2 ${
                confirmDialog.danger ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
              }`}>
                {confirmDialog.danger && <AlertTriangle className="w-4 h-4" />}
                {confirmDialog.title}
              </h3>
              <button 
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >✕</button>
            </div>
            
            <div className="p-5">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>
            
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-wider"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`px-5 py-2 text-white text-xs font-black rounded shadow-md uppercase tracking-wider transition-colors ${
                  confirmDialog.danger 
                    ? "bg-rose-600 hover:bg-rose-700" 
                    : "bg-slate-900 dark:bg-slate-700 hover:bg-slate-800"
                }`}
              >
                {isRtl ? "تأكيد" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
