import { create } from 'zustand';

export interface Notification {
  id: string;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  timestamp: Date;
  read: boolean;
  source?: string;
  action?: {
    label: string;
    callback: () => void;
  };
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  clearOld: (daysOld: number) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    // Auto-clear success notifications after 5 seconds
    if (notification.severity === 'success') {
      setTimeout(() => {
        get().removeNotification(newNotification.id);
      }, 5000);
    }
  },

  removeNotification: (id) =>
    set((state) => {
      const notif = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notif && !notif.read ? state.unreadCount - 1 : state.unreadCount,
      };
    }),

  markAsRead: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (!notification || notification.read) return state;

      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: state.unreadCount - 1,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),

  clearOld: (daysOld) =>
    set((state) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysOld);

      const filtered = state.notifications.filter(
        (n) => n.timestamp > cutoff
      );

      const newUnreadCount = filtered.filter((n) => !n.read).length;

      return {
        notifications: filtered,
        unreadCount: newUnreadCount,
      };
    }),
}));
