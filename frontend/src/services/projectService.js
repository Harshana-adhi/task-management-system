import api from '../lib/axios'

/** Wraps the /api/projects endpoints needed for the Phase 3 "add to
 * project" shortcut. Full Projects page (Phase 4) will expand on this. */

export async function getProjects() {
  const { data } = await api.get('/projects')
  return data // Admin sees all projects
}

export async function addProjectMember(projectId, userId) {
  const { data } = await api.post(`/projects/${projectId}/members`, { userId })
  return data
}
