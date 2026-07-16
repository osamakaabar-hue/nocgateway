import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Claim, DemoUser } from '../types';
import { TENANT_CONFIG } from '../brandConfig';
import { BarChart2, Briefcase, Activity, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

interface InteractiveDashboardProps {
  claims: Claim[];
  currentUser: DemoUser;
  lang?: any;
  onProjectClick?: (claimId: string) => void;
}

export default function InteractiveDashboard({ claims, currentUser, lang = "en", onProjectClick }: InteractiveDashboardProps) {
  const isRtl = lang === "ar";
  const isNoc = currentUser.companyId === "NOC_HQ";

  const availableCompanies = useMemo(() => {
    const allCompanies = Object.values(TENANT_CONFIG).filter(c => c.id !== 'NOC_HQ');
    if (isNoc) return allCompanies;
    return allCompanies.filter(c => c.id === currentUser.companyId);
  }, [isNoc, currentUser.companyId]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("ALL");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedTimeline, setSelectedTimeline] = useState<string>("ALL");

  // Filter claims based on selection
  const filteredClaims = useMemo(() => {
    let filtered = claims;
    
    // Filter by User's inherent access
    if (!isNoc) {
      filtered = filtered.filter(c => c.companyId === currentUser.companyId);
    }

    // Filter by Company Dropdown
    if (selectedCompanyId !== "ALL") {
      filtered = filtered.filter(c => c.companyId === selectedCompanyId);
    }

    // Filter by Project Dropdown
    if (selectedProjectId !== "ALL") {
      filtered = filtered.filter(c => c.id === selectedProjectId);
    }

    // Filter by Status
    if (selectedStatus === "approved_paid") {
      filtered = filtered.filter(c => c.status === "authorized_for_payment");
    } else if (selectedStatus === "pending") {
      filtered = filtered.filter(c => ["pending", "pending_financial_audit", "pending_head_of_accounts_approval"].includes(c.status));
    }

    // Filter by Timeline (Year)
    if (selectedTimeline !== "ALL") {
      filtered = filtered.filter(c => c.submissionDate.includes(selectedTimeline));
    }

    return filtered;
  }, [claims, isNoc, currentUser.companyId, selectedCompanyId, selectedProjectId, selectedStatus, selectedTimeline]);

  // Aggregate KPIs with Enforced Math Distribution (RLS)
  const kpis = useMemo(() => {
    const totalProjects = filteredClaims.length;
    
    // Distribution Weights for 1.119B Budget
    const COMPANY_WEIGHTS: Record<string, number> = {
      WAHA: 0.2, AGOCO: 0.15, SIRTE: 0.1, AKAKUS: 0.1, BPMC: 0.05, 
      ZUEITINA: 0.05, HAROUGE: 0.05, RASCO: 0.05, ZAWIA: 0.05, 
      SONATRACH: 0.05, ENI: 0.05, NPCC: 0.02, JOWFE: 0.03, TAKNIA: 0.02, NDWC: 0.03
    };
    
    let totalValue = 0;
    let totalPaid = 0;
    
    if (isNoc && selectedCompanyId === "ALL") {
      totalValue = 1119000000;
      totalPaid = 5000000;
    } else {
      const compId = selectedCompanyId !== "ALL" ? selectedCompanyId : currentUser.companyId;
      const weight = COMPANY_WEIGHTS[compId] || 0.01;
      totalValue = 1119000000 * weight;
      totalPaid = 5000000 * weight;
    }
    
    const totalPendingPaid = totalValue - totalPaid;
    
    const pendingCount = filteredClaims.filter(c => ["pending", "pending_financial_audit", "pending_head_of_accounts_approval"].includes(c.status)).length;
    const approvedCount = filteredClaims.filter(c => c.status === "authorized_for_payment").length;

    const avgProgress = totalProjects > 0 
      ? filteredClaims.reduce((sum, c) => sum + (c.claimedProgress || 0), 0) / totalProjects
      : (totalPaid / totalValue) * 100;

    return { totalProjects: Math.max(totalProjects, 1), totalValue, totalPaid, totalPendingPaid, pendingCount, approvedCount, avgProgress };
  }, [filteredClaims, isNoc, selectedCompanyId, currentUser.companyId]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 2 
    }).format(val);
  };

  const availableProjectsForDropdown = useMemo(() => {
    let base = claims;
    if (!isNoc) base = base.filter(c => c.companyId === currentUser.companyId);
    if (selectedCompanyId !== "ALL") base = base.filter(c => c.companyId === selectedCompanyId);
    return base;
  }, [claims, isNoc, currentUser.companyId, selectedCompanyId]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`p-6 max-w-7xl mx-auto space-y-8 ${isRtl ? 'font-sans' : ''}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex-shrink-0">
          <h2 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-teal-500 mb-2 whitespace-nowrap">
            {isRtl ? "لوحة القياس التفاعلية" : "Interactive Dashboard"}
          </h2>
          <p className="text-slate-500 font-medium">
            {isRtl ? "تتبع الأداء المالي والفني للمشاريع" : "Track financial and technical project performance"}
          </p>
        </div>

        <div className="flex flex-wrap lg:justify-end items-center gap-3 w-full lg:w-auto">
          {/* Company Filter */}
          {isNoc && (
            <select 
              value={selectedCompanyId}
              onChange={(e) => {
                setSelectedCompanyId(e.target.value);
                setSelectedProjectId("ALL");
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm max-w-[140px] md:max-w-[200px] truncate"
            >
              <option value="ALL">{isRtl ? "جميع الشركات" : "All Companies"}</option>
              {availableCompanies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {/* Project Filter */}
          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm max-w-[140px] md:max-w-[200px] truncate"
          >
            <option value="ALL">{isRtl ? "جميع المشاريع" : "All Projects"}</option>
            {availableProjectsForDropdown.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.title}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm max-w-[140px] md:max-w-[200px] truncate"
          >
            <option value="ALL">{isRtl ? "جميع الحالات" : "All Statuses"}</option>
            <option value="approved_paid">{isRtl ? "معتمدة ومدفوعة" : "Approved & Paid"}</option>
            <option value="pending">{isRtl ? "قيد المراجعة" : "Pending Audit"}</option>
          </select>

          {/* Timeline Filter */}
          <select 
            value={selectedTimeline}
            onChange={(e) => setSelectedTimeline(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm max-w-[140px] md:max-w-[200px] truncate"
          >
            <option value="ALL">{isRtl ? "كل الوقت" : "All Time"}</option>
            <option value="2026">{isRtl ? "سنة 2026" : "Year 2026"}</option>
            <option value="2025">{isRtl ? "سنة 2025" : "Year 2025"}</option>
          </select>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-600 dark:text-slate-400">{isRtl ? "إجمالي المشاريع" : "Total Projects"}</h3>
          </div>
          <p className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">{kpis.totalProjects}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-600 dark:text-slate-400">{isRtl ? "القيمة الإجمالية" : "Total Value"}</h3>
          </div>
          <p className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">{formatCurrency(kpis.totalValue)}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-600 dark:text-slate-400">{isRtl ? "إجمالي المدفوع" : "Total Paid"}</h3>
          </div>
          <p className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">{formatCurrency(kpis.totalPaid)}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-600 dark:text-slate-400">{isRtl ? "إجمالي المعلق" : "Pending Paid"}</h3>
          </div>
          <p className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">{formatCurrency(kpis.totalPendingPaid)}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-600 dark:text-slate-400">{isRtl ? "متوسط الإنجاز" : "Avg Progress"}</h3>
          </div>
          <p className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">{kpis.avgProgress.toFixed(1)}%</p>
        </motion.div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project Status Breakdown */}
        <motion.div variants={itemVariants} className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">{isRtl ? "حالة المشاريع" : "Projects Status"}</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">{isRtl ? "معتمدة ومدفوعة" : "Approved & Paid"}</span>
                <span className="font-bold text-slate-800 dark:text-white">{kpis.approvedCount}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(kpis.approvedCount / Math.max(1, kpis.totalProjects)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-emerald-500 h-full rounded-full"
                ></motion.div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">{isRtl ? "قيد المراجعة" : "Pending Audit"}</span>
                <span className="font-bold text-slate-800 dark:text-white">{kpis.pendingCount}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(kpis.pendingCount / Math.max(1, kpis.totalProjects)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="bg-amber-500 h-full rounded-full"
                ></motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Budget vs Spent Visualization */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">{isRtl ? "نظرة عامة على الميزانية" : "Budget Overview"}</h3>
          
          <div className="flex flex-col md:flex-row items-center gap-8 h-full pb-8">
            <div className="flex-1 w-full space-y-8">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">{isRtl ? "إجمالي قيمة المشاريع" : "Total Project Value"}</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(kpis.totalValue)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-xl h-6 overflow-hidden border border-slate-200 dark:border-slate-600 relative">
                   <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-indigo-500/50"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">{isRtl ? "إجمالي المنفذ / المدفوع" : "Executed / Paid"}</span>
                  <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{formatCurrency(kpis.totalPaid)}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-xl h-6 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(kpis.totalPaid / Math.max(1, kpis.totalValue)) * 100}%` }}
                    transition={{ duration: 1.5, type: "spring" }}
                    className="bg-gradient-to-r from-teal-400 to-teal-600 h-full rounded-xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 translate-x-full animate-[shimmer_2s_infinite]"></div>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="w-48 h-48 relative flex-shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path
                  className="text-slate-100 dark:text-slate-700"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <motion.path
                  className="text-teal-500"
                  strokeDasharray={`${(kpis.totalPaid / Math.max(1, kpis.totalValue)) * 100}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${(kpis.totalPaid / Math.max(1, kpis.totalValue)) * 100}, 100` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800 dark:text-white">
                  {((kpis.totalPaid / Math.max(1, kpis.totalValue)) * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-slate-500 font-semibold">{isRtl ? "مكتمل ماليًا" : "Financially Complete"}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Detail Table */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{isRtl ? "تفاصيل المشاريع" : "Project Details"}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className={`px-6 py-4 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? "رمز المشروع" : "Project Code"}</th>
                <th className={`px-6 py-4 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? "اسم المشروع" : "Project Title"}</th>
                {isNoc && selectedCompanyId === "ALL" && (
                  <th className={`px-6 py-4 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? "الشركة" : "Company"}</th>
                )}
                <th className={`px-6 py-4 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? "القيمة" : "Value"}</th>
                <th className={`px-6 py-4 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? "نسبة الإنجاز" : "Progress"}</th>
                <th className={`px-6 py-4 font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>{isRtl ? "الحالة" : "Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredClaims.length > 0 ? filteredClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {onProjectClick ? (
                      <button 
                        onClick={() => onProjectClick(claim.id)}
                        className="hover:underline hover:text-indigo-800 transition-colors cursor-pointer text-left focus:outline-none"
                      >
                        {claim.code}
                      </button>
                    ) : (
                      claim.code
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200 max-w-[300px] truncate">{claim.title}</td>
                  {isNoc && selectedCompanyId === "ALL" && (
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{claim.company}</td>
                  )}
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">{formatCurrency(claim.numericValue)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${claim.claimedProgress}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{claim.claimedProgress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      claim.status === "authorized_for_payment" 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : ["pending_financial_audit", "pending_head_of_accounts_approval"].includes(claim.status)
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    }`}>
                      {claim.status === "authorized_for_payment" ? (isRtl ? "معتمدة" : "Authorized") : (isRtl ? "قيد الإجراء" : "In Progress")}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                    <p>{isRtl ? "لا توجد مشاريع مطابقة للبحث" : "No projects match the selected filters"}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
