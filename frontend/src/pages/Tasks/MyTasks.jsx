import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Calendar, FolderKanban, ListChecks, LayoutGrid, List as ListIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMyTasks, updateTaskStatus } from '../../services/taskService'
import { parseApiError } from '../../lib/apiError'
import { cn } from '../../lib/cn'
import Table from '../../components/common/Table'
import { StatusBadge, PriorityBadge } from '../../components/common/Badge'
import TaskDetailModal from '../../components/tasks/TaskDetailModal'
import KanbanBoard from '../../components/tasks/KanbanBoard'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'Completed') return false
  return new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0))
}

/**
 * Cross-project view of everything assigned to the current user — the
 * SRS's "Collaborator: View assigned tasks" requirement. Supports both
 * a flat list and a Kanban board that mixes tasks from every project
 * together (each card is tagged with its project name, since the board
 * itself has no per-project grouping). Status can still be changed from
 * here; editing, deleting, and reassigning stay project-scoped actions
 * on the Project Detail page.
 */
export default function MyTasks() {
  const [tasks, setTasks] = useState(null)
  const [view, setView] = useState('kanban')
  const [detailTask, setDetailTask] = useState(null)

  const fetchTasks = async () => {
    try {
      const data = await getMyTasks()
      setTasks(data)
      return data
    } catch (err) {
      toast.error(parseApiError(err).message)
      setTasks([])
      return []
    }
  }

  useEffect(() => {
    let active = true
    getMyTasks()
      .then((data) => active && setTasks(data))
      .catch((err) => {
        if (!active) return
        toast.error(parseApiError(err).message)
        setTasks([])
      })
    return () => {
      active = false
    }
  }, [])

  const refreshAndSyncDetail = async () => {
    const data = await fetchTasks()
    if (detailTask) {
      const updated = data.find((t) => t.task_id === detailTask.task_id)
      if (updated) setDetailTask(updated)
    }
  }

  const handleDragStatusChange = async (task, newStatus) => {
    setTasks((prev) => prev.map((t) => (t.task_id === task.task_id ? { ...t, status: newStatus } : t)))
    try {
      await updateTaskStatus(task.task_id, newStatus)
    } catch (err) {
      toast.error(parseApiError(err).message)
      setTasks((prev) => prev.map((t) => (t.task_id === task.task_id ? { ...t, status: task.status } : t)))
    }
  }

  const columns = [
    {
      key: 'title',
      header: 'Task',
      render: (row) => (
        <button
          onClick={() => setDetailTask(row)}
          className="text-left font-medium text-slate-800 hover:text-brand-600 dark:text-slate-200 dark:hover:text-brand-400"
        >
          {row.title}
        </button>
      ),
    },
    {
      key: 'project_name',
      header: 'Project',
      render: (row) => (
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <FolderKanban className="size-3.5" /> {row.project_name}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'priority', header: 'Priority', render: (row) => <PriorityBadge priority={row.priority} /> },
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

  const isEmpty = tasks?.length === 0

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">My tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Everything assigned to you, across every project.
          </p>
        </div>

        {!isEmpty && (
          <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-800">
            <button
              onClick={() => setView('kanban')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                view === 'kanban' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <LayoutGrid className="size-3.5" /> Board
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                view === 'list' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <ListIcon className="size-3.5" /> List
            </button>
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <ListChecks className="mb-1 size-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nothing's been assigned to you yet.
          </p>
          <Link to="/projects" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
            Browse your projects
          </Link>
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard
          tasks={tasks ?? []}
          onOpenTask={setDetailTask}
          onStatusChange={handleDragStatusChange}
          canDrag={() => true}
        />
      ) : (
        <Table columns={columns} data={tasks ?? []} isLoading={tasks === null} rowKey="task_id" />
      )}

      <TaskDetailModal
        open={!!detailTask}
        onClose={() => setDetailTask(null)}
        task={detailTask}
        canManage={false}
        isAssignee={true}
        projectMembers={[]}
        onEdit={() => {}}
        onChanged={refreshAndSyncDetail}
      />
    </div>
  )
}
