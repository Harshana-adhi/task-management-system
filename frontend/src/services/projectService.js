import api from '../lib/axios'

/**
 * Wraps the /api/projects endpoints (see backend src/routes/projectRoutes.js).
 * Note: createProject/updateProject use `projectName` (camelCase) — that's
 * what the backend Joi schema expects, unlike most other endpoints which
 * use snake_case. addMember uses `userId`, also camelCase.
 *
 * Ownership is enforced entirely server-side: a Project Manager's GET
 * requests only ever return projects they created, and a Collaborator's
 * only return projects they're a member of. The frontend doesn't need to
 * re-check ownership — if a project is visible at all, the viewer is
 * already allowed to see it.
 */

export async function getProjects() {
  const { data } = await api.get('/projects')
  return data // [{ project_id, project_name, description, created_by, created_by_name, member_count, created_at, updated_at }, ...]
}

export async function getProjectById(projectId) {
  const { data } = await api.get(`/projects/${projectId}`)
  return data
}

export async function createProject(projectName, description) {
  const { data } = await api.post('/projects', { projectName, description })
  return data // { message, project }
}

export async function updateProject(projectId, projectName, description) {
  const { data } = await api.put(`/projects/${projectId}`, { projectName, description })
  return data // { message, project }
}

export async function getProjectMembers(projectId) {
  const { data } = await api.get(`/projects/${projectId}/members`)
  return data.members // [{ project_member_id, joined_at, user_id, full_name, email, role_name }, ...]
}

export async function addProjectMember(projectId, userId) {
  const { data } = await api.post(`/projects/${projectId}/members`, { userId })
  return data
}

export async function removeProjectMember(projectId, userId) {
  const { data } = await api.delete(`/projects/${projectId}/members/${userId}`)
  return data
}

/** Reversible. Admin can archive any project; Project Manager only their own. */
export async function archiveProject(projectId) {
  const { data } = await api.patch(`/projects/${projectId}/archive`)
  return data
}

export async function unarchiveProject(projectId) {
  const { data } = await api.patch(`/projects/${projectId}/unarchive`)
  return data
}

/**
 * Assign one Project Manager to co-manage this project, with the same
 * rights as the creator. Admin only — overwrites any previously assigned
 * manager (a project can only have one at a time).
 */
export async function assignProjectManager(projectId, userId) {
  const { data } = await api.patch(`/projects/${projectId}/manager`, { userId })
  return data
}

export async function unassignProjectManager(projectId) {
  const { data } = await api.delete(`/projects/${projectId}/manager`)
  return data
}

/**
 * Permanent — Admin only. Cascades to delete every task, comment, and
 * attachment tied to this project. There is no undo.
 */
export async function deleteProject(projectId) {
  const { data } = await api.delete(`/projects/${projectId}`)
  return data
}
