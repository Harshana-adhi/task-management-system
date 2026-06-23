import api from '../lib/axios'

/** Wraps /api/notifications (see backend src/routes/notificationRoutes.js). */

export async function getNotifications() {
  const { data } = await api.get('/notifications')
  return data
}

export async function markNotificationRead(notificationId) {
  const { data } = await api.patch(`/notifications/${notificationId}/read`)
  return data
}

export async function markAllNotificationsRead() {
  const { data } = await api.patch('/notifications/read-all')
  return data
}

/** Admin only. Either targets one user, or every active user. */
export async function sendAdminBroadcast({ message, userId, broadcastToAll }) {
  const { data } = await api.post('/notifications/admin-broadcast', {
    message,
    userId,
    broadcastToAll,
  })
  return data
}
