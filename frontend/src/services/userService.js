import api from '../lib/axios'

/**
 * Thin wrapper around the Admin-only /api/users endpoints
 * (see backend src/routes/userRoutes.js). All of these require
 * an Admin session — the backend itself enforces this with a 403
 * if called by anyone else, this layer doesn't re-check the role.
 */

export async function getRoles() {
  const { data } = await api.get('/users/roles')
  return data // [{ role_id, role_name }, ...]
}

export async function getUsers({ search, roleId, isActive } = {}) {
  const params = {}
  if (search) params.search = search
  if (roleId) params.role_id = roleId
  if (isActive !== undefined && isActive !== '') params.is_active = isActive

  const { data } = await api.get('/users', { params })
  return data // [{ user_id, full_name, email, role_id, role_name, is_active, must_change_password, created_at }, ...]
}

export async function getUserById(userId) {
  const { data } = await api.get(`/users/${userId}`)
  return data
}

export async function createUser({ full_name, email, role_id }) {
  // No password field — the backend generates a temporary password
  // and emails it to the new user automatically.
  const { data } = await api.post('/users', { full_name, email, role_id })
  return data // { message, user }
}

export async function updateUser(userId, { full_name, email, role_id }) {
  // Deliberately not sending is_active here — see note in userValidator.js:
  // the backend's update repository doesn't actually persist is_active even
  // though the schema accepts it. Use activateUser/deactivateUser for that.
  const { data } = await api.put(`/users/${userId}`, { full_name, email, role_id })
  return data // { message, user }
}

export async function assignRole(userId, roleId) {
  const { data } = await api.patch(`/users/${userId}/role`, { role_id: roleId })
  return data
}

export async function deactivateUser(userId) {
  const { data } = await api.patch(`/users/${userId}/deactivate`)
  return data
}

export async function activateUser(userId) {
  const { data } = await api.patch(`/users/${userId}/activate`)
  return data
}
