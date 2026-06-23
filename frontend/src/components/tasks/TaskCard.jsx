import { useDraggable } from '@dnd-kit/core'
import { Calendar, FolderKanban } from 'lucide-react'
import { PriorityBadge } from '../common/Badge'
import { cn } from '../../lib/cn'

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function formatShortDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'Completed') return false
  return new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0))
}

export default function TaskCard({ task, onOpen, draggable }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.task_id,
    disabled: !draggable,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  const overdue = isOverdue(task.due_date, task.status)
  const assignees = task.assignees ?? []

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(draggable ? { ...listeners, ...attributes } : {})}
      onClick={() => onOpen(task)}
      className={cn(
        'flex cursor-pointer flex-col gap-2.5 rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900',
        draggable && 'cursor-grab active:cursor-grabbing',
        isDragging && 'z-50 opacity-60 shadow-lg'
      )}
    >
      <p className="text-sm font-medium leading-snug text-slate-800 dark:text-slate-200">
        {task.title}
      </p>

      {task.project_name && (
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <FolderKanban className="size-3" /> {task.project_name}
        </span>
      )}

      <div className="flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        {task.due_date && (
          <span
            className={cn(
              'flex items-center gap-1 text-xs',
              overdue ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-slate-400'
            )}
          >
            <Calendar className="size-3" /> {formatShortDate(task.due_date)}
          </span>
        )}
      </div>

      {assignees.length > 0 && (
        <div className="flex -space-x-1.5">
          {assignees.slice(0, 3).map((a) => (
            <div
              key={a.user_id}
              title={a.full_name}
              className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-brand-100 text-[10px] font-semibold text-brand-700 dark:border-slate-900 dark:bg-brand-500/20 dark:text-brand-300"
            >
              {initials(a.full_name)}
            </div>
          ))}
          {assignees.length > 3 && (
            <div className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-medium text-slate-500 dark:border-slate-900 dark:bg-slate-800">
              +{assignees.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
