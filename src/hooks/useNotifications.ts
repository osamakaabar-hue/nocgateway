/**
 * useNotifications – User-Isolated Notification Hub
 *
 * Security contract:
 *   - Only notifications where `n.userId === currentUser.id` are ever returned.
 *   - NOC_HQ users (Central Auditors, Finance, etc.) also receive their own scoped
 *     notifications but never see subsidiary-only items.
 *   - All mutation functions (markRead, markAllRead, clearHistory) enforce the same
 *     userId predicate before writing back to state / localStorage.
 */

import { useState, useCallback, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { NotificationItem, DemoUser } from "../types";

export interface UseNotificationsReturn {
  /** Notifications visible to the current authenticated user */
  userNotifications: NotificationItem[];
  /** Count of unread notifications for the current user */
  unreadCount: number;
  /** Whether the bell dropdown is open */
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  /** Toggle open/closed */
  toggleOpen: () => void;
  /** Mark a single notification as read (no-op if not owned by currentUser) */
  markRead: (id: string) => void;
  /** Mark every notification for the current user as read */
  markAllRead: () => void;
  /** Delete all notifications for the current user */
  clearHistory: () => void;
  /** Inject a new notification programmatically */
  addNotification: (
    title: string,
    message: string,
    type: NotificationItem["type"],
    claimId?: string,
    tab?: NotificationItem["tab"],
    targetUserId?: string,
  ) => void;
}

const ALL_USER_IDS = [
  "user-noc-admin",
  "user-noc-pmo",
  "user-noc-fin",
  "user-noc-head",
  "user-waha-pm",
  "user-waha-fin",
  "user-agoco-pm",
  "user-agoco-fin",
  "user-zallaf-pm",
  "user-zallaf-fin",
  "user-mellitah-pm",
  "user-mellitah-fin",
];

function buildDefaultNotifications(): NotificationItem[] {
  const base: Omit<NotificationItem, "id" | "userId">[] = [
    // --- Warning / Orange -------------------------------------------------------
    {
      title: "Clarification Needed",
      message:
        "PMO Technical Auditor requested documentation clarification on WAHA-24-112.",
      timestamp: "2 hours ago",
      read: false,
      type: "warning",
      claimId: "claim-5",
      tab: "claims",
    },
    // --- Info / Blue ------------------------------------------------------------
    {
      title: "New Claim Submitted",
      message:
        "Waha Oil Company submitted a new technical progress claim WAHA-24-109 (€1,250,000).",
      timestamp: "Today, 09:00 AM",
      read: false,
      type: "info",
      claimId: "claim-1",
      tab: "claims",
    },
    // --- Success / Green --------------------------------------------------------
    {
      title: "Technical Approval Granted",
      message: "Sovereign audit approved progress claim AGOCO-24-042.",
      timestamp: "Yesterday",
      read: true,
      type: "success",
      claimId: "claim-2",
      tab: "claims",
    },
    // --- Warning – invoice audit -------------------------------------------------
    {
      title: "Invoice Pending Financial Audit",
      message:
        "Invoice INV-ZALLAF-2024-011 has been submitted and awaits NOC Finance review.",
      timestamp: "3 days ago",
      read: true,
      type: "warning",
      claimId: "claim-3",
      tab: "invoices",
    },
    // --- Success – payment token -------------------------------------------------
    {
      title: "Payment Authorized",
      message:
        "NOC Central Finance has authorized payment for milestone MELLITAH-24-019.",
      timestamp: "4 days ago",
      read: true,
      type: "success",
      claimId: "claim-4",
      tab: "invoices",
    },
  ];

  const out: NotificationItem[] = [];
  ALL_USER_IDS.forEach((userId) => {
    base.forEach((b, i) => {
      out.push({ ...b, id: `notif-init-${i + 1}-${userId}`, userId });
    });
  });
  return out;
}

function loadFromStorage(): NotificationItem[] | null {
  try {
    const raw = localStorage.getItem("noc_eppm_notifications");
    if (raw) return JSON.parse(raw) as NotificationItem[];
  } catch (_) {}
  return null;
}

function saveToStorage(items: NotificationItem[]): void {
  try {
    localStorage.setItem("noc_eppm_notifications", JSON.stringify(items));
  } catch (_) {}
}

/**
 * The hook takes the full (all-user) notifications array and the setter from
 * App.tsx so both places stay in sync, or it can manage its own state if used
 * standalone.
 */
export function useNotifications(
  currentUser: DemoUser | null,
  externalNotifications?: NotificationItem[],
  setExternalNotifications?: Dispatch<SetStateAction<NotificationItem[]>>,
): UseNotificationsReturn {
  // If consumed standalone (no external state), manage locally.
  const [localNotifications, setLocalNotifications] = useState<
    NotificationItem[]
  >(() => loadFromStorage() ?? buildDefaultNotifications());

  const allNotifications = externalNotifications ?? localNotifications;
  const setAllNotifications: Dispatch<SetStateAction<NotificationItem[]>> =
    setExternalNotifications ??
    ((updater: SetStateAction<NotificationItem[]>) => {
      setLocalNotifications((prev) => {
        const next =
          typeof updater === "function" ? updater(prev) : updater;
        saveToStorage(next);
        return next;
      });
    });

  const [isOpen, setIsOpen] = useState(false);

  // ─── Isolation filter ────────────────────────────────────────────────────────
  const userNotifications = useMemo<NotificationItem[]>(() => {
    if (!currentUser) return [];
    return allNotifications
      .filter((n) => n.userId === currentUser.id)
      .sort((a, b) => {
        // Unread first, then by insertion order (id contains timestamp).
        if (!a.read && b.read) return -1;
        if (a.read && !b.read) return 1;
        return 0;
      });
  }, [allNotifications, currentUser]);

  const unreadCount = useMemo(
    () => userNotifications.filter((n) => !n.read).length,
    [userNotifications],
  );

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const toggleOpen = useCallback(() => setIsOpen((v) => !v), []);

  const markRead = useCallback(
    (id: string) => {
      if (!currentUser) return;
      setAllNotifications((prev) =>
        prev.map((n) =>
          n.id === id && n.userId === currentUser.id
            ? { ...n, read: true }
            : n,
        ),
      );
    },
    [currentUser, setAllNotifications],
  );

  const markAllRead = useCallback(() => {
    if (!currentUser) return;
    setAllNotifications((prev) =>
      prev.map((n) =>
        n.userId === currentUser.id ? { ...n, read: true } : n,
      ),
    );
  }, [currentUser, setAllNotifications]);

  const clearHistory = useCallback(() => {
    if (!currentUser) return;
    setAllNotifications((prev) =>
      prev.filter((n) => n.userId !== currentUser.id),
    );
  }, [currentUser, setAllNotifications]);

  const addNotification = useCallback(
    (
      title: string,
      message: string,
      type: NotificationItem["type"] = "info",
      claimId?: string,
      tab?: NotificationItem["tab"],
      targetUserId?: string,
    ) => {
      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (targetUserId) {
        const item: NotificationItem = {
          id: `notif-${Date.now()}-${targetUserId}`,
          userId: targetUserId,
          title,
          message,
          timestamp,
          read: false,
          type,
          claimId,
          tab,
        };
        setAllNotifications((prev) => [item, ...prev]);
      } else {
        const items: NotificationItem[] = ALL_USER_IDS.map((uid) => ({
          id: `notif-${Date.now()}-${uid}`,
          userId: uid,
          title,
          message,
          timestamp,
          read: false,
          type,
          claimId,
          tab,
        }));
        setAllNotifications((prev) => [...items, ...prev]);
      }
    },
    [setAllNotifications],
  );

  return {
    userNotifications,
    unreadCount,
    isOpen,
    setIsOpen,
    toggleOpen,
    markRead,
    markAllRead,
    clearHistory,
    addNotification,
  };
}
