import { create } from 'zustand'

/**
 * Notification feed state. Scaffolded in Phase 1; populated by the
 * Socket.io connection and REST fetch built in Phase 7.
 */
export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (list) =>
    set({
      notifications: list,
      unreadCount: list.filter((n) => !n.is_read).length,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification?.is_read ? 0 : 1),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),
}))
