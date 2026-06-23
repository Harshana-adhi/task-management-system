import { create } from 'zustand'
import { parseServerDate } from '../lib/date'

function computeUnread(list) {
  return list.filter((n) => !n.is_read).length
}

/**
 * The backend isn't consistent about sort order — REST history comes
 * back newest-first, but the socket's reconnect-delivery batch comes
 * back oldest-first. Rather than trust either, always re-sort the full
 * list after any mutation so "newest first" is a guaranteed invariant
 * here, not an assumption about what arrived.
 */
function sortNewestFirst(list) {
  return [...list].sort(
    (a, b) => parseServerDate(b.created_at) - parseServerDate(a.created_at)
  )
}

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (list) => {
    const notifications = sortNewestFirst(list)
    set({ notifications, unreadCount: computeUnread(notifications) })
  },

  addNotification: (notification) =>
    set((state) => {
      if (state.notifications.some((n) => n.notification_id === notification.notification_id)) {
        return state
      }
      const notifications = sortNewestFirst([notification, ...state.notifications])
      return { notifications, unreadCount: computeUnread(notifications) }
    }),

  /** Merges a batch (e.g. socket's reconnect-delivery of stored
   * notifications) into the existing list, de-duped by id, re-sorted. */
  mergeNotifications: (batch) =>
    set((state) => {
      const existingIds = new Set(state.notifications.map((n) => n.notification_id))
      const newOnes = batch.filter((n) => !existingIds.has(n.notification_id))
      const notifications = sortNewestFirst([...newOnes, ...state.notifications])
      return { notifications, unreadCount: computeUnread(notifications) }
    }),

  markOneRead: (notificationId) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.notification_id === notificationId ? { ...n, is_read: true } : n
      )
      return { notifications, unreadCount: computeUnread(notifications) }
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),

  clear: () => set({ notifications: [], unreadCount: 0 }),
}))
