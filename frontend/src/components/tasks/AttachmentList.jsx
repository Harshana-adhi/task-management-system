import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'
import { UploadCloud, FileText, Image, FileSpreadsheet, File as FileIcon, Trash2, Download } from 'lucide-react'
import {
  getAttachments,
  uploadAttachment,
  deleteAttachment,
  validateFile,
} from '../../services/attachmentService'
import { parseServerDate } from '../../lib/date'
import { useAuthStore } from '../../store/useAuthStore'
import { parseApiError } from '../../lib/apiError'
import { Spinner } from '../common/Loader'
import ConfirmDialog from '../common/ConfirmDialog'
import { cn } from '../../lib/cn'

function getFileIcon(fileName = '') {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return Image
  if (['xls', 'xlsx'].includes(ext)) return FileSpreadsheet
  if (['doc', 'docx', 'pdf'].includes(ext)) return FileText
  return FileIcon
}

export default function AttachmentList({ taskId }) {
  const currentUserId = useAuthStore((s) => s.user?.user_id)
  const isAdmin = useAuthStore((s) => s.user?.role_name === 'Admin')
  const fileInputRef = useRef(null)

  const [attachments, setAttachments] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null) // null = not uploading
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let active = true
    getAttachments(taskId)
      .then((data) => active && setAttachments(data))
      .catch((err) => active && toast.error(parseApiError(err).message))
    return () => {
      active = false
    }
  }, [taskId])

  const handleFile = async (file) => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }

    setUploadProgress(0)
    try {
      const attachment = await uploadAttachment(taskId, file, setUploadProgress)
      setAttachments((prev) => [attachment, ...(prev ?? [])])
      toast.success('File uploaded')
    } catch (err) {
      toast.error(parseApiError(err).message)
    } finally {
      setUploadProgress(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteAttachment(deleteTarget.attachment_id)
      setAttachments((prev) => prev.filter((a) => a.attachment_id !== deleteTarget.attachment_id))
      setDeleteTarget(null)
    } catch (err) {
      toast.error(parseApiError(err).message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Attachments {attachments ? `(${attachments.length})` : ''}
      </h3>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors',
          isDragOver
            ? 'border-brand-400 bg-brand-50/50 dark:border-brand-600 dark:bg-brand-500/5'
            : 'border-slate-300 hover:border-brand-300 dark:border-slate-700 dark:hover:border-brand-700'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
        {uploadProgress !== null ? (
          <>
            <Spinner />
            <p className="text-xs text-slate-500 dark:text-slate-400">Uploading… {uploadProgress}%</p>
          </>
        ) : (
          <>
            <UploadCloud className="size-5 text-slate-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-brand-600 dark:text-brand-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-[11px] text-slate-400">Images, PDF, or Office docs — up to 5MB</p>
          </>
        )}
      </div>

      {attachments === null ? (
        <div className="flex justify-center py-2">
          <Spinner />
        </div>
      ) : attachments.length > 0 && (
        <ul className="flex max-h-56 flex-col gap-1.5 overflow-y-auto scrollbar-thin pr-1">
          {attachments.map((a) => {
            const Icon = getFileIcon(a.file_name)
            const canDelete = isAdmin || a.uploaded_by === currentUserId
            return (
              <li
                key={a.attachment_id}
                className="group flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
              >
                <a
                  href={a.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center gap-2.5 overflow-hidden"
                >
                  <Icon className="size-4 shrink-0 text-slate-400" />
                  <div className="overflow-hidden">
                    <p className="truncate text-sm text-slate-700 dark:text-slate-300">{a.file_name}</p>
                    <p className="text-xs text-slate-400" title={formatDistanceToNow(parseServerDate(a.uploaded_at), { addSuffix: true })}>
                      {a.full_name} · {format(parseServerDate(a.uploaded_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </a>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <a
                    href={a.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download"
                    className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  >
                    <Download className="size-3.5" />
                  </a>
                  {canDelete && (
                    <button
                      onClick={() => setDeleteTarget(a)}
                      aria-label="Delete attachment"
                      className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete attachment"
        confirmLabel="Delete"
        description={`"${deleteTarget?.file_name}" will be permanently deleted.`}
      />
    </div>
  )
}
