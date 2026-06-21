import api from '../lib/axios'

/** Wraps the /api/tasks endpoints needed for the Phase 3 "assign to
 * task" shortcut. Full Tasks page (Phase 5) will expand on this. */

export async function getTasksByProject(projectId) {
  const { data } = await api.get('/tasks', { params: { projectId } })
  return data
}

export async function assignTask(taskId, userId) {
  const { data } = await api.post(`/tasks/${taskId}/assign`, { userId })
  return data
}
