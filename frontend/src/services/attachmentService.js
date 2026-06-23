import api from '../lib/axios'

/**
 * Wraps /api/attachments. Upload limits mirror backend
 * src/middlewares/uploadMiddleware.js exactly — keep these two in sync
 * if the backend's limits ever change.
 */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export function validateFile(file) {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'File is too large — the limit is 5MB.'
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'Invalid file type. Only images, PDFs, and Office documents are allowed.'
  }
  return null
}

export async function uploadAttachment(taskId, file, onProgress) {
  const formData = new FormData()
  formData.append('task_id', taskId)
  formData.append('file', file)

  const { data } = await api.post('/attachments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
  return data.attachment
}

export async function getAttachments(taskId) {
  const { data } = await api.get(`/attachments/${taskId}`)
  return data // [{ attachment_id, task_id, uploaded_by, file_name, file_url, uploaded_at, full_name, email }, ...]
}

export async function deleteAttachment(attachmentId) {
  const { data } = await api.delete(`/attachments/${attachmentId}`)
  return data
}
