import React, { useState } from "react";
import { 
  Bell, 
  Search, 
  Calendar, 
  Filter, 
  Check, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Volume2, 
  BellRing,
  Sparkles
} from "lucide-react";
import { NotificationItem } from "../types";

interface NotificationCenterProps {
  notifications: NotificationItem[];
  currentUser: any;
  lang: "en" | "ar";
  onMarkRead: (id: string) => void;
  onNotificationClick: (notif: NotificationItem) => void;
  onClearAll?: () => void;
  onResolveAction?: (notifId: string) => void;
}

export default function NotificationCenter({
  notifications,
  currentUser,
  lang,
  onMarkRead,
  onNotificationClick,
  onClearAll,
  onResolveAction
}: NotificationCenterProps) {
  const isRtl = lang === "ar";
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showActionableOnly, setShowActionableOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>("all"); // all, today, yesterday, week

  // Filter local notifications for current user session
  const userNotifs = notifications.filter(n => n.userId === currentUser?.id);

  // Stats calculation
  const totalCount = userNotifs.length;
  const unreadCount = userNotifs.filter(n => !n.read).length;
  const actionablePendingCount = userNotifs.filter(n => n.actionRequired && !n.actionCompleted).length;
  const actionableResolvedCount = userNotifs.filter(n => n.actionRequired && n.actionCompleted).length;

  // Filter helper
  const filteredNotifs = userNotifs.filter(notif => {
    // 1. Text Search
    const searchTarget = `${notif.title} ${notif.message}`.toLowerCase();
    if (searchText && !searchTarget.includes(searchText.toLowerCase())) {
      return false;
    }

    // 2. Type/Priority Filter
    if (selectedType === "high" && notif.priority !== "high") return false;
    if (selectedType === "success" && notif.type !== "success") return false;
    if (selectedType === "info" && notif.type !== "info") return false;
    if (selectedType === "warning" && notif.type !== "warning") return false;
    if (selectedType === "error" && notif.type !== "error") return false;

    // 3. Actionable Toggle
    if (showActionableOnly && !notif.actionRequired) return false;

    // 4. Date Filter (simulated for demo purposes based on timestamp text)
    const timeText = (notif.timestamp || "").toLowerCase();
    if (dateFilter === "today") {
      if (!timeText.includes("today") && !timeText.includes("ago") && !timeText.includes("صباحاً") && !timeText.includes("مساءً")) return false;
    } else if (dateFilter === "yesterday") {
      if (!timeText.includes("yesterday") && !timeText.includes("أمس")) return false;
    } else if (dateFilter === "week") {
      if (timeText.includes("month") || timeText.includes("year")) return false;
    }

    return true;
  });

  const getNotifIcon = (type: string, priority?: string) => {
    if (priority === "high") {
      return <AlertTriangle className="w-5 h-5 text-amber-500 animate-bounce" />;
    }
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "error":
        return <AlertOctagon className="w-5 h-5 text-rose-500" />;
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  const getNotifBorder = (notif: NotificationItem) => {
    if (!notif.read) {
      if (notif.priority === "high") return "border-l-4 border-l-amber-500 bg-amber-500/5";
      return "border-l-4 border-l-blue-500 bg-blue-500/5";
    }
    return "border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071329]";
  };

  const getNotifBorderAr = (notif: NotificationItem) => {
    if (!notif.read) {
      if (notif.priority === "high") return "border-r-4 border-r-amber-500 bg-amber-500/5";
      return "border-r-4 border-r-blue-500 bg-blue-500/5";
    }
    return "border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071329]";
  };

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Page Header */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 ${isRtl ? "text-right" : "text-left"}`}>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 justify-start">
            <BellRing className="w-6 h-6 text-amber-500 animate-pulse" />
            {isRtl ? "مركز الإخطارات والتنبيهات السيادية" : "Sovereign Event & Alert Hub"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isRtl 
              ? "متابعة تدفق العمليات المالية الفورية وتتبع مسار الامتثال وإشعارات الصرف الإلكتروني الموثقة." 
              : "Monitor real-time technical workflows, compliance audits, and authenticated sovereign release triggers."}
          </p>
        </div>
        
        {onClearAll && totalCount > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 rounded-lg text-xs font-black transition-all cursor-pointer border border-rose-200/50 self-start md:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            {isRtl ? "مسح السجل بالكامل" : "Clear Audit Hub Logs"}
          </button>
        )}
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isRtl ? "إجمالي الإخطارات" : "Total Events"}</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</h3>
          </div>
          <div className="p-3 bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* Unread Card */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{isRtl ? "تنبيهات غير مقروءة" : "Unread Alerts"}</p>
            <h3 className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{unreadCount}</h3>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Action Pending Card */}
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{isRtl ? "إجراءات مطلوبة فورا" : "Actions Required"}</p>
            <h3 className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{actionablePendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        {/* Resolved Card */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{isRtl ? "إجراءات مكتملة" : "Resolved Actions"}</p>
            <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{actionableResolvedCount}</h3>
          </div>
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Interactive Hub Filters Panel */}
      <div className="bg-white dark:bg-[#071329] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={isRtl ? "البحث بالكلمات المفتاحية عن المطالبات والفواتير والتفويضات..." : "Search alerts by keyword, invoice, LC, or company..."}
              className={`w-full text-xs bg-slate-50 dark:bg-[#040f24] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 ${isRtl ? "pr-3 pl-10 text-right" : "pl-10 pr-3 text-left"} focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white placeholder-slate-400`}
            />
          </div>

          {/* Filtering Widgets Wrapper */}
          <div className={`flex flex-wrap items-center gap-3 ${isRtl ? "justify-start flex-row-reverse" : "justify-start"}`}>
            
            {/* Priority/Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#040f24] px-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent border-none py-2 focus:outline-none font-bold text-xs text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                <option value="all">{isRtl ? "كل الأولوية" : "All Priorities"}</option>
                <option value="high">{isRtl ? "⚠️ تنبيهات هامة" : "⚠️ High Priority"}</option>
                <option value="success">{isRtl ? "✅ إشعارات نجاح" : "✅ Success"}</option>
                <option value="info">{isRtl ? "ℹ️ إشعارات عامة" : "ℹ️ Info"}</option>
                <option value="warning">{isRtl ? "⚠️ تحذيرات" : "⚠️ Warnings"}</option>
                <option value="error">{isRtl ? "🛑 أخطاء سيستم" : "🛑 Errors"}</option>
              </select>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#040f24] px-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent border-none py-2 focus:outline-none font-bold text-xs text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                <option value="all">{isRtl ? "كل التواريخ" : "All Dates"}</option>
                <option value="today">{isRtl ? "اليوم" : "Today"}</option>
                <option value="yesterday">{isRtl ? "أمس" : "Yesterday"}</option>
                <option value="week">{isRtl ? "آخر 7 أيام" : "Last 7 Days"}</option>
              </select>
            </div>

            {/* Action Required Toggle */}
            <button
              onClick={() => setShowActionableOnly(!showActionableOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                showActionableOnly 
                  ? "bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800" 
                  : "bg-slate-50 dark:bg-[#040f24] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800"
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${showActionableOnly ? "text-amber-500" : "text-slate-400"}`} />
              {isRtl ? "إجراء مطلوب فقط" : "Action Required Only"}
            </button>
          </div>
        </div>
      </div>

      {/* Timeline View List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white dark:bg-[#071329] border border-slate-200 dark:border-slate-800 rounded-2xl py-16 px-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
              {isRtl ? "لا توجد تنبيهات مطابقة لخيارات التصفية" : "No Matching Security Notifications"}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {isRtl 
                ? "تأكد من ضبط خيارات البحث والتصفية أو التحقق من الإخطارات المسجلة لبيانات الصرف والمطابقات." 
                : "Try adjusting your search filters or check your system notification log history."}
            </p>
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`transition-all border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4 ${
                isRtl ? getNotifBorderAr(notif) : getNotifBorder(notif)
              }`}
            >
              <div className={`flex gap-3 flex-1 items-start ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
                <div className="mt-1 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80">
                  {getNotifIcon(notif.type, notif.priority)}
                </div>
                
                <div className="space-y-1">
                  <div className={`flex flex-wrap items-center gap-2 ${isRtl ? "justify-start flex-row-reverse" : "justify-start"}`}>
                    <h4 className={`text-xs font-black ${notif.read ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-white"}`}>
                      {notif.title}
                    </h4>
                    
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    )}

                    {notif.priority === "high" && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-300 dark:border-amber-800/40 rounded">
                        {isRtl ? "أولوية قصوى" : "High Priority"}
                      </span>
                    )}

                    {notif.actionRequired && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded ${
                        notif.actionCompleted 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/40"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-300 dark:border-amber-800/40 animate-pulse"
                      }`}>
                        {notif.actionCompleted 
                          ? (isRtl ? "✓ تم التنفيذ" : "✓ Action Resolved")
                          : (isRtl ? "⏱ إجراء مطلوب" : "⏱ Pending Action")}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed font-sans">
                    {notif.message}
                  </p>

                  <div className={`flex items-center gap-3 text-[10px] text-slate-400 pt-1 ${isRtl ? "justify-start flex-row-reverse" : "justify-start"}`}>
                    <span className="flex items-center gap-1 font-bold">
                      <Clock className="w-3 h-3" />
                      {notif.timestamp}
                    </span>
                    
                    {notif.companyId && (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded font-mono text-[9px]">
                        {notif.companyId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex flex-col items-end gap-2 shrink-0 ${isRtl ? "items-start" : "items-end"}`}>
                {/* Resolve Action Required Trigger */}
                {notif.actionRequired && !notif.actionCompleted && (
                  <button
                    onClick={() => {
                      onMarkRead(notif.id);
                      if (onResolveAction) onResolveAction(notif.id);
                      onNotificationClick(notif);
                    }}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    {isRtl ? "مراجعة وإجراء الإمضاء" : "Resolve Action"}
                  </button>
                )}
                
                {/* Deep Link Navigation */}
                <button
                  onClick={() => {
                    onMarkRead(notif.id);
                    onNotificationClick(notif);
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  {isRtl ? "انتقال سريع للموقع" : "Navigate to View"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
