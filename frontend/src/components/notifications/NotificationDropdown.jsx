import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { Bell, CheckCheck, Inbox } from 'lucide-react'
import { getSocket } from '../../lib/socket'
import { markNotificationRead, markAllNotificationsRead } from '../../services/notificationService'
import { useNotificationStore } from '../../store/useNotificationStore'
import { parseServerDate } from '../../lib/date'
import { cn } from '../../lib/cn'

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const markOneRead = useNotificationStore((s) => s.markOneRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleMarkOne = async (notification) => {
    if (notification.is_read) return
    markOneRead(notification.notification_id) // optimistic
    try {
      await markNotificationRead(notification.notification_id)
      getSocket()?.emit('mark_read', { notificationId: notification.notification_id })
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAll = async () => {
    if (unreadCount === 0) return
    markAllRead() // optimistic
    try {
      await markAllNotificationsRead()
      getSocket()?.emit('mark_all_read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-rose-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                <CheckCheck className="size-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Inbox className="size-6 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-400">No notifications yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((n) => (
                  <li key={n.notification_id}>
                    <button
                      onClick={() => handleMarkOne(n)}
                      className={cn(
                        'flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
                        !n.is_read && 'bg-brand-50/50 dark:bg-brand-500/5'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {!n.is_read && <span className="size-1.5 shrink-0 rounded-full bg-brand-500" />}
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {n.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                      <p className="text-[11px] text-slate-400">
                        {formatDistanceToNow(parseServerDate(n.created_at), { addSuffix: true })}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
