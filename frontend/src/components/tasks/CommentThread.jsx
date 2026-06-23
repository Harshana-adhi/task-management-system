import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow, format } from 'date-fns'
import { Send, Trash2 } from 'lucide-react'
import { addComment, getComments, deleteComment } from '../../services/commentService'
import { parseServerDate } from '../../lib/date'
import { useAuthStore } from '../../store/useAuthStore'
import { parseApiError } from '../../lib/apiError'
import { Spinner } from '../common/Loader'
import ConfirmDialog from '../common/ConfirmDialog'

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

/**
 * Backend returns newest-first; reversed here for a natural top-to-bottom
 * reading order with the newest comment at the bottom, like a chat thread.
 */
export default function CommentThread({ taskId }) {
  const currentUserId = useAuthStore((s) => s.user?.user_id)
  const isAdmin = useAuthStore((s) => s.user?.role_name === 'Admin')

  const [comments, setComments] = useState(null)
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let active = true
    getComments(taskId)
      .then((data) => active && setComments([...data].reverse()))
      .catch((err) => active && toast.error(parseApiError(err).message))
    return () => {
      active = false
    }
  }, [taskId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    setIsSubmitting(true)
    try {
      const comment = await addComment(taskId, trimmed)
      setComments((prev) => [...(prev ?? []), comment])
      setText('')
    } catch (err) {
      toast.error(parseApiError(err).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteComment(deleteTarget.comment_id)
      setComments((prev) => prev.filter((c) => c.comment_id !== deleteTarget.comment_id))
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
        Comments {comments ? `(${comments.length})` : ''}
      </h3>

      {comments === null ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : comments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-3 py-3 text-center text-sm text-slate-400 dark:border-slate-700">
          No comments yet — be the first to add one.
        </p>
      ) : (
        <ul className="flex max-h-64 flex-col gap-3 overflow-y-auto scrollbar-thin pr-1">
          {comments.map((comment) => {
            const canDelete = isAdmin || comment.user_id === currentUserId
            return (
              <li key={comment.comment_id} className="flex gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                  {initials(comment.full_name)}
                </div>
                <div className="group flex-1 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/50">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {comment.full_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs text-slate-400"
                        title={formatDistanceToNow(parseServerDate(comment.created_at), { addSuffix: true })}
                      >
                        {format(parseServerDate(comment.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                      {canDelete && (
                        <button
                          onClick={() => setDeleteTarget(comment)}
                          aria-label="Delete comment"
                          className="text-slate-300 opacity-0 transition-opacity hover:text-rose-600 group-hover:opacity-100 dark:hover:text-rose-400"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
                    {comment.comment_text}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          maxLength={1000}
          className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          aria-label="Send comment"
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-300"
        >
          <Send className="size-4" />
        </button>
      </form>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete comment"
        confirmLabel="Delete"
        description="This comment will be permanently deleted."
      />
    </div>
  )
}
