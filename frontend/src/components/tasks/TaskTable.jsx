import { Calendar, Users } from 'lucide-react'
import Table from '../common/Table'
import { StatusBadge, PriorityBadge } from '../common/Badge'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'Completed') return false
  return new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0))
}

export default function TaskTable({ tasks, isLoading, onOpenTask }) {
  const columns = [
    {
      key: 'title',
      header: 'Task',
      render: (row) => (
        <button onClick={() => onOpenTask(row)} className="text-left font-medium text-slate-800 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-400">
          {row.title}
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => <PriorityBadge priority={row.priority} />,
    },
    {
      key: 'assignees',
      header: 'Assigned to',
      render: (row) =>
        row.assignees?.length ? (
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <Users className="size-3.5 text-slate-400" />
            {row.assignees.map((a) => a.full_name).join(', ')}
          </span>
        ) : (
          <span className="text-slate-400">Unassigned</span>
        ),
    },
    {
      key: 'due_date',
      header: 'Due date',
      render: (row) => (
        <span
          className={
            isOverdue(row.due_date, row.status)
              ? 'flex items-center gap-1 font-medium text-rose-600 dark:text-rose-400'
              : 'flex items-center gap-1 text-slate-500 dark:text-slate-400'
          }
        >
          <Calendar className="size-3.5" /> {formatDate(row.due_date)}
        </span>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={tasks}
      isLoading={isLoading}
      rowKey="task_id"
      emptyMessage="No tasks match your filters."
    />
  )
}
