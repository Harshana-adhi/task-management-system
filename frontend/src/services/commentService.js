import api from '../lib/axios'

/**
 * Wraps /api/comments (see backend src/routes/commentRoutes.js).
 * Field names are snake_case here, unlike most other endpoints —
 * mirroring the backend exactly rather than "fixing" it.
 */

export async function addComment(taskId, commentText) {
  const { data } = await api.post('/comments', { task_id: taskId, comment_text: commentText })
  return data.comment
}

export async function getComments(taskId) {
  const { data } = await api.get(`/comments/${taskId}`)
  return data // [{ comment_id, task_id, user_id, comment_text, created_at, full_name, email }, ...]
}

export async function deleteComment(commentId) {
  const { data } = await api.delete(`/comments/${commentId}`)
  return data
}
