import { cn } from '../../lib/cn'

/**
 * The "status thread" component. Every status/priority badge in the app —
 * table rows, Kanban headers, task detail — should render through this,
 * so the color-and-label vocabulary stays identical everywhere.
 */
const STATUS_MAP = {
  'To Do': { color: 'var(--color-status-todo)', bg: 'var(--color-status-todo-bg)' },
  'In Progress': { color: 'var(--color-status-progress)', bg: 'var(--color-status-progress-bg)' },
  'Completed': { color: 'var(--color-status-done)', bg: 'var(--color-status-done-bg)' },
}

const PRIORITY_MAP = {
  Low: { color: 'var(--color-priority-low)', bg: 'var(--color-priority-low-bg)' },
  Medium: { color: 'var(--color-priority-medium)', bg: 'var(--color-priority-medium-bg)' },
  High: { color: 'var(--color-priority-high)', bg: 'var(--color-priority-high-bg)' },
}

function DotBadge({ label, color, bg, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        className
      )}
      style={{ color, backgroundColor: bg }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

export function StatusBadge({ status, className }) {
  const config = STATUS_MAP[status] ?? STATUS_MAP['To Do']
  return <DotBadge label={status} {...config} className={className} />
}

export function PriorityBadge({ priority, className }) {
  const config = PRIORITY_MAP[priority] ?? PRIORITY_MAP.Medium
  return <DotBadge label={priority} {...config} className={className} />
}

/** Generic neutral badge for anything that isn't status/priority. */
export function Badge({ children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600',
        'dark:bg-slate-800 dark:text-slate-300',
        className
      )}
    >
      {children}
    </span>
  )
}
