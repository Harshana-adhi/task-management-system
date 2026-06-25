import api from '../lib/axios'

/**
 * Thin wrapper around the /api/auth endpoints. Keep raw axios calls out
 * of components — pages call these functions, not `api` directly.
 */

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  return data // { message, token, mustChangePassword, user: { userId, fullName, email, roleId } }
}

export async function changePassword(currentPassword, newPassword) {
  const { data } = await api.put('/auth/change-password', { currentPassword, newPassword })
  return data // { message, user: { user_id, full_name, email, role_id, must_change_password } }
}

export async function getProfile() {
  const { data } = await api.get('/auth/profile')
  return data.user // full row + role_name, no password_hash
}
