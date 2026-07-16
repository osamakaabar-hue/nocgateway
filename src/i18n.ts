export type Lang = "en" | "ar";

export const translations = {
  en: {
    // Brand
    noc_brand: "NATIONAL OIL CORP.",
    noc_sub_brand: "PORTFOLIO AUDIT SYSTEM",
    title_main: "NOC Portfolio Claims Audit & EVM Ledger",
    reset_data: "Reset System Data",
    change_logout: "Change / Logout User",
    all_rights: "© 2026 National Oil Corporation. All Rights Reserved. General Electric & PMO Audit Module.",
    privacy_policy: "Privacy Policy",
    compliance_manual: "RACI Compliance Manual",
    reset_app: "Reset App Data",
    search_placeholder: "Search reference, operating company, title...",
    notifications: "Notifications",
    mark_all_read: "Mark all read",
    clear_history: "Clear All History",
    no_notifications: "No notifications yet",

    // Tabs
    tab_claims: "Claims Dashboard",
    tab_wbs: "WBS Structure & Milestones",
    tab_invoices: "Invoice Auditing & Vault",
    tab_lcs: "LC & Financial Dashboard",
    tab_documents: "Sovereign Document Registry",
    tab_raci: "Regulatory RACI Matrix",
    tab_data_sovereignty: "Data Sovereignty Ledger",
    tab_security: "Central Security Settings",
    tab_users: "Identity & Access (IAM)",
    tab_profile: "My Profile",
    nav_interactive_dashboard: "Interactive Dashboard",

    // Role-selector page
    select_role_title: "NOC Sovereign Portfolio Audit & EVM Ledger",
    select_role_subtitle: "Multi-Role Gateway • National Oil Corporation Libya",
    auditor_category: "NOC CENTRAL HEADQUARTERS AUTHORITIES (Auditors)",
    subsidiary_category: "OPERATING SUBSIDIARIES & OIL PRODUCING COMPANIES",
    enter_auditor: "Enter Portal as Auditor",
    enter_pm: "Login as PM",
    enter_finance: "Login as Finance",

    // Dialogs / Modals
    reset_confirm_title: "Reset Application Data?",
    reset_confirm_text: "Are you sure you want to permanently restore the National Oil Corporation Portfolio Audit System to its pristine baseline values?",
    reset_bullet_1: "WBS hierarchies & custom milestones will revert to defaults.",
    reset_bullet_2: "All newly submitted claims, progress weights, and financial overrides will be cleared.",
    reset_bullet_3: "All uploaded PDF/XLSX invoices and technical documents will be purged.",
    cancel: "Cancel",
    confirm_reset: "Confirm Reset",

    // Toast and notification alerts
    data_reset_success: "Sovereign audit data restored to genesis state.",
    logged_out: "Logged out from secure session.",
    new_stage_claim_btn: "New Stage Claim",

    // Common / General
    loading: "Loading...",
    status: "Status",
    actions: "Actions",
    type: "Type",
    date: "Date",
    size: "Size",
    view: "View",
    download: "Download",
    close: "Close",
    save: "Save",
    submit: "Submit",
    edit: "Edit",
    delete: "Delete",
    verified: "Verified",
    pending: "Pending",
    rejected: "Rejected",
    approved: "Approved",
    progress: "Progress",
    total: "Total",
    code: "Code",
    description: "Description",
    company: "Company",
    value: "Value",
    auditor: "Auditor",
    evidence: "Evidence",
    back_to_list: "Back to List",
    noc_central_node: "NOC Central Node",
    authorized_node: "Authorized Node",
  },
  ar: {
    // Brand
    noc_brand: "المؤسسة الوطنية للنفط",
    noc_sub_brand: "منظومة تدقيق المحفظة",
    title_main: "تدقيق مطالبات محفظة المؤسسة الوطنية للنفط ودفتر القيمة المكتسبة",
    reset_data: "إعادة تعيين بيانات النظام",
    change_logout: "تغيير / تسجيل خروج المستخدم",
    all_rights: "© ٢٠٢٦ المؤسسة الوطنية للنفط. جميع الحقوق محفوظة. وحدة تدقيق المشروعات الكبرى.",
    privacy_policy: "سياسة الخصوصية",
    compliance_manual: "دليل الامتثال لـ RACI",
    reset_app: "إعادة ضبط بيانات التطبيق",
    search_placeholder: "البحث عن مرجع، شركة مشغلة، أو عنوان...",
    notifications: "الإشعارات",
    mark_all_read: "تحديد الكل كمقروء",
    clear_history: "مسح السجل بالكامل",
    no_notifications: "لا توجد إشعارات بعد",

    // Tabs
    tab_claims: "لوحة تحكم المطالبات",
    tab_wbs: "هيكل تجزئة العمل والمراحل",
    tab_invoices: "تدقيق الفواتير والخزنة",
    tab_lcs: "الاعتمادات والموقف المالي",
    tab_documents: "السجل السيادي للمستندات",
    tab_raci: "مصفوفة الصلاحيات (RACI)",
    tab_data_sovereignty: "دفتر السيادة الرقمية",
    tab_security: "إعدادات الأمان المركزية",
    tab_users: "إدارة الهوية والصلاحيات",
    tab_profile: "الملف الشخصي",
    nav_interactive_dashboard: "لوحة القياس التفاعلية",

    // Role-selector page
    select_role_title: "نظام تدقيق المحفظة السيادية ودفتر القيمة المكتسبة",
    select_role_subtitle: "بوابة الأدوار المتعددة • المؤسسة الوطنية للنفط - ليبيا",
    auditor_category: "سلطات المقر المركزي للمؤسسة الوطنية للنفط (المدققون)",
    subsidiary_category: "الشركات التابعة والشركات المنتجة للنفط (المشغلون)",
    enter_auditor: "دخول البوابة بصفتك مدققًا",
    enter_pm: "تسجيل الدخول كمدير مشروع",
    enter_finance: "تسجيل الدخول كمسؤول مالي",

    // Dialogs / Modals
    reset_confirm_title: "إعادة تعيين بيانات التطبيق؟",
    reset_confirm_text: "هل أنت متأكد أنك تريد استعادة نظام تدقيق محفظة المؤسسة الوطنية للنفط بشكل دائم إلى قيمه الأساسية الأصلية؟",
    reset_bullet_1: "ستعود تسلسلات هيكل تجزئة العمل والمراحل المخصصة إلى القيم الافتراضية.",
    reset_bullet_2: "سيتم مسح جميع المطالبات المقدمة حديثًا وأوزان التقدم والتجاوزات المالية.",
    reset_bullet_3: "سيتم حذف جميع فواتير PDF/XLSX والمستندات الفنية التي تم تحميلها.",
    cancel: "إلغاء",
    confirm_reset: "تأكيد إعادة التعيين",

    // Toast and notification alerts
    data_reset_success: "تمت استعادة بيانات التدقيق السيادي إلى الحالة الأولى بنجاح.",
    logged_out: "تم تسجيل الخروج من الجلسة الآمنة.",
    new_stage_claim_btn: "مطالبة مرحلية جديدة",

    // Common / General
    loading: "جاري التحميل...",
    status: "الحالة",
    actions: "الإجراءات",
    type: "النوع",
    date: "التاريخ",
    size: "الحجم",
    view: "عرض",
    download: "تحميل",
    close: "إغلاق",
    save: "حفظ",
    submit: "إرسال",
    edit: "تعديل",
    delete: "حذف",
    verified: "تم التحقق منه",
    pending: "قيد الانتظار",
    rejected: "تم الرفض",
    approved: "تمت الموافقة",
    progress: "التقدم الحالي",
    total: "الإجمالي",
    code: "الكود المرجعي",
    description: "الوصف",
    company: "الشركة المشغلة",
    value: "القيمة الإجمالية",
    auditor: "المدقق الفني",
    evidence: "المستندات الداعمة",
    back_to_list: "العودة إلى القائمة"
  }
};

export function t(key: keyof typeof translations["en"], lang: Lang): string {
  return translations[lang][key] || translations["en"][key] || key;
}
