/**
 * NotificationPanel
 *
 * Bell icon trigger + absolute-positioned popover panel.
 * Fully dark-mode aware. Matches the reference design:
 *   - Header row: "NOTIFICATIONS (N)" + "Mark all read" link
 *   - Item row: coloured icon · title · timestamp · message · unread dot
 *   - Footer: "CLEAR ALL HISTORY"
 *
 * Props:
 *   currentUser  – authenticated user (for display / security)
 *   notifications / setNotifications – lifted App state (shared with addNotification)
 *   onNavigate   – callback so clicking a notification also changes the app tab
 *   lang         – "en" | "ar"
 */

import React, { useEffect, useRef } from "react";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
} from "lucide-react";
import { NotificationItem, DemoUser } from "../types";
import { useNotifications } from "../hooks/useNotifications";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<
  NotificationItem["type"],
  { icon: React.ElementType; ring: string; dot: string; bg: string; text: string }
> = {
  warning: {
    icon: AlertTriangle,
    ring: "border-amber-400/40",
    dot: "bg-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
  },
  info: {
    icon: Info,
    ring: "border-blue-400/40",
    dot: "bg-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
  },
  success: {
    icon: CheckCircle2,
    ring: "border-emerald-400/40",
    dot: "bg-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  error: {
    icon: AlertCircle,
    ring: "border-red-400/40",
    dot: "bg-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const NotificationRow: React.FC<{
  notif: NotificationItem;
  onRead: (id: string) => void;
  isRtl: boolean;
}> = ({ notif, onRead, isRtl }) => {
  const meta = TYPE_META[notif.type];
  const Icon = meta.icon;

  return (
    <button
      onClick={() => onRead(notif.id)}
      className={`w-full text-left px-4 py-3 flex gap-3 items-start transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 last:border-b-0 ${
        !notif.read ? "bg-blue-50/40 dark:bg-blue-950/10" : ""
      } ${isRtl ? "flex-row-reverse text-right" : ""}`}
    >
      {/* Category Icon */}
      <span
        className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${meta.ring} ${meta.bg}`}
      >
        <Icon className={`w-4 h-4 ${meta.text}`} />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          className={`flex items-center gap-2 mb-0.5 ${isRtl ? "flex-row-reverse" : ""}`}
        >
          <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-tight">
            {notif.title}
          </span>
          <span className="text-[10px] text-slate-400 font-mono shrink-0">
            {notif.timestamp}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
          {notif.message}
        </p>
      </div>

      {/* Unread indicator */}
      {!notif.read && (
        <span
          className={`mt-1.5 w-2 h-2 rounded-full ${meta.dot} shrink-0`}
          aria-label="Unread"
        />
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface NotificationPanelProps {
  currentUser: DemoUser | null;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  onNavigate?: (notif: NotificationItem) => void;
  lang?: string;
}

export default function NotificationPanel({
  currentUser,
  notifications,
  setNotifications,
  onNavigate,
  lang = "en",
}: NotificationPanelProps) {
  const isRtl = lang === "ar";

  const {
    userNotifications,
    unreadCount,
    isOpen,
    setIsOpen,
    toggleOpen,
    markRead,
    markAllRead,
    clearHistory,
  } = useNotifications(currentUser, notifications, setNotifications);

  // ── Close on outside click ──────────────────────────────────────────────────
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  // ── Click: mark read + navigate ─────────────────────────────────────────────
  function handleRowClick(notif: NotificationItem) {
    markRead(notif.id);
    setIsOpen(false);
    onNavigate?.(notif);
  }

  // ── Labels ──────────────────────────────────────────────────────────────────
  const labels = {
    title: isRtl ? "الإشعارات" : "NOTIFICATIONS",
    markAll: isRtl ? "تحديد الكل كمقروء" : "Mark all read",
    empty: isRtl
      ? "لا توجد إشعارات جديدة"
      : "You're all caught up! No new notifications.",
    clearAll: isRtl ? "مسح كل السجل" : "CLEAR ALL HISTORY",
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Bell trigger ──────────────────────────────────────────────────── */}
      <button
        id="notification-bell-btn"
        onClick={toggleOpen}
        aria-label={labels.title}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`relative p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
          isOpen
            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full leading-none shadow">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={labels.title}
          className={`absolute top-full mt-2 w-[22rem] max-h-[520px] flex flex-col bg-white dark:bg-[#071329] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/20 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
            isRtl ? "right-0" : "right-0"
          }`}
        >
          {/* Panel header */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a1930] shrink-0 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">
              {labels.title}{" "}
              <span className="text-slate-400">({userNotifications.length})</span>
            </span>

            <div
              className={`flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
            >
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline transition-colors focus:outline-none"
                >
                  {labels.markAll}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto">
            {userNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <Bell className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-3" />
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  {labels.empty}
                </p>
              </div>
            ) : (
              userNotifications.map((notif) => (
                <NotificationRow
                  key={notif.id}
                  notif={notif}
                  onRead={() => handleRowClick(notif)}
                  isRtl={isRtl}
                />
              ))
            )}
          </div>

          {/* Panel footer */}
          {userNotifications.length > 0 && (
            <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0a1930]">
              <button
                onClick={() => {
                  clearHistory();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <Trash2 className="w-3 h-3" />
                {labels.clearAll}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
