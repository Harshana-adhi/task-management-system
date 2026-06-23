import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Bell } from 'lucide-react'
import { connectSocket, disconnectSocket } from '../lib/socket'
import { getNotifications } from '../services/notificationService'
import { useAuthStore } from '../store/useAuthStore'
import { useNotificationStore } from '../store/useNotificationStore'

/**
 * Mounted once (in AppLayout) for the lifetime of an authenticated
 * session. Fetches notification history once via REST, then keeps the
 * store current in real time via Socket.io — live arrivals, and
 * anything missed while disconnected, delivered again on reconnect.
 */
export function useNotificationsSocket() {
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setNotifications = useNotificationStore((s) => s.setNotifications)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const mergeNotifications = useNotificationStore((s) => s.mergeNotifications)
  const clearNotifications = useNotificationStore((s) => s.clear)

  // Avoids re-fetching REST history on every token/effect re-run within
  // the same session — only the actual mount/auth-transition should do it.
  const hasFetchedHistory = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket()
      clearNotifications()
      hasFetchedHistory.current = false
      return
    }

    if (!hasFetchedHistory.current) {
      hasFetchedHistory.current = true
      getNotifications()
        .then(setNotifications)
        .catch(() => {
          // Silent — the bell just shows an empty list rather than
          // blocking the rest of the app on a notification fetch failure.
        })
    }

    const socket = connectSocket(token)

    const handleNew = (notification) => {
      addNotification(notification)
      toast(notification.title, {
        description: notification.message,
        icon: <Bell className="size-4" />,
      })
    }

    const handleStored = ({ notifications }) => {
      if (notifications?.length) mergeNotifications(notifications)
    }

    socket.on('new_notification', handleNew)
    socket.on('stored_notifications', handleStored)

    return () => {
      socket.off('new_notification', handleNew)
      socket.off('stored_notifications', handleStored)
    }
  }, [isAuthenticated, token, setNotifications, addNotification, mergeNotifications, clearNotifications])
}
