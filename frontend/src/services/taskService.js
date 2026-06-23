import api from '../lib/axios'

/**
 * Wraps /api/tasks (see backend src/routes/taskRoutes.js).
 *
 * Field casing is genuinely inconsistent on the backend — mirror it
 * exactly rather than "fixing" it here:
 *   - createTask body:  { projectId, title, description, priority, dueDate }   (camelCase)
 *   - updateTask body:  { title, description, status, priority, due_date }    (due_date is snake_case)
 *   - assignTask body:  { userId }
 */

export async function getTasksByProject(projectId) {
  const { data } = await api.get('/tasks', { params: { projectId } })
  return data // [{ ...task, assignees: [{user_id, full_name, email}] | null }, ...]
}

export async function getFilteredTasks(projectId, { status, priority } = {}) {
  const params = { projectId }
  if (status) params.status = status
  if (priority) params.priority = priority
  const { data } = await api.get('/tasks/filter', { params })
  return data
}

/** Cross-project — everything assigned to the current user, any project. */
export async function getMyTasks() {
  const { data } = await api.get('/tasks/my-tasks')
  return data // [{ ...task, project_name }, ...]
}

export async function getTaskById(taskId) {
  const { data } = await api.get(`/tasks/${taskId}`)
  return data
}

export async function createTask(projectId, { title, description, priority, dueDate }) {
  const { data } = await api.post('/tasks', { projectId, title, description, priority, dueDate })
  return data
}

export async function updateTask(taskId, { title, description, status, priority, due_date }) {
  const { data } = await api.put(`/tasks/${taskId}`, { title, description, status, priority, due_date })
  return data
}

export async function updateTaskStatus(taskId, status) {
  const { data } = await api.patch(`/tasks/${taskId}/status`, { status })
  return data
}

export async function deleteTask(taskId) {
  const { data } = await api.delete(`/tasks/${taskId}`)
  return data
}

export async function assignTask(taskId, userId) {
  const { data } = await api.post(`/tasks/${taskId}/assign`, { userId })
  return data
}

export async function getTaskAssignments(taskId) {
  const { data } = await api.get(`/tasks/${taskId}/assignments`)
  return data // [{ task_id, user_id, assigned_at, full_name, email }, ...]
}

export async function removeTaskAssignment(taskId, userId) {
  const { data } = await api.delete(`/tasks/${taskId}/assign/${userId}`)
  return data
}
