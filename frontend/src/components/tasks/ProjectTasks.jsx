import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, LayoutGrid, List as ListIcon } from 'lucide-react'
import {
  getTasksByProject,
  getFilteredTasks,
  createTask,
  updateTask,
  updateTaskStatus,
} from '../../services/taskService'
import { useAuthStore } from '../../store/useAuthStore'
import { parseApiError } from '../../lib/apiError'
import { cn } from '../../lib/cn'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import { TableSkeleton } from '../../components/common/Loader'
import KanbanBoard from './KanbanBoard'
import TaskTable from './TaskTable'
import TaskFormModal from './TaskFormModal'
import TaskDetailModal from './TaskDetailModal'

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
]

const PRIORITY_FILTER_OPTIONS = [
  { value: '', label: 'All priorities' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
]

/**
 * Lives inside ProjectDetail's "Tasks" tab. `canManage` is the same flag
 * ProjectDetail already computes (Admin, or PM who created/was assigned
 * this project) — full task control. Collaborators get view + status-only
 * control, scoped to tasks they're actually assigned to.
 */
export default function ProjectTasks({ projectId, canManage, projectMembers }) {
  const currentUserId = useAuthStore((s) => s.user?.user_id)
  const roleName = useAuthStore((s) => s.user?.role_name)

  const [tasks, setTasks] = useState(null) // null = loading
  const [view, setView] = useState('kanban')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const [formModal, setFormModal] = useState({ open: false, task: null })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detailTask, setDetailTask] = useState(null)

  const fetchTasks = async () => {
    try {
      const data =
        statusFilter || priorityFilter
          ? await getFilteredTasks(projectId, { status: statusFilter, priority: priorityFilter })
          : await getTasksByProject(projectId)
      setTasks(data)
      return data
    } catch (err) {
      toast.error(parseApiError(err).message)
      setTasks([])
      return []
    }
  }

  // Refetches the list AND keeps the currently-open detail modal's task
  // in sync with it — otherwise a status change made inside the modal
  // wouldn't be reflected there until it's closed and reopened.
  const refreshAndSyncDetail = async () => {
    const data = await fetchTasks()
    if (detailTask) {
      const updated = data.find((t) => t.task_id === detailTask.task_id)
      if (updated) setDetailTask(updated)
    }
  }

  useEffect(() => {
    let active = true
    const load = statusFilter || priorityFilter
      ? getFilteredTasks(projectId, { status: statusFilter, priority: priorityFilter })
      : getTasksByProject(projectId)

    load
      .then((data) => active && setTasks(data))
      .catch((err) => {
        if (!active) return
        toast.error(parseApiError(err).message)
        setTasks([])
      })

    return () => {
      active = false
    }
  }, [projectId, statusFilter, priorityFilter])

  const handleCreateOrUpdate = async (values) => {
    setIsSubmitting(true)
    try {
      if (formModal.task) {
        await updateTask(formModal.task.task_id, {
          title: values.title,
          description: values.description,
          priority: values.priority,
          due_date: values.dueDate || null,
        })
        toast.success('Task updated')
      } else {
        await createTask(projectId, values)
        toast.success('Task created')
      }
      setFormModal({ open: false, task: null })
      fetchTasks()
    } catch (err) {
      toast.error(parseApiError(err).message)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDragStatusChange = async (task, newStatus) => {
    // Optimistic update — boards feel sluggish if you wait for the round
    // trip before the card visually moves.
    setTasks((prev) => prev.map((t) => (t.task_id === task.task_id ? { ...t, status: newStatus } : t)))
    try {
      await updateTaskStatus(task.task_id, newStatus)
    } catch (err) {
      toast.error(parseApiError(err).message)
      setTasks((prev) => prev.map((t) => (t.task_id === task.task_id ? { ...t, status: task.status } : t)))
    }
  }

  const isAssignee = (task) => (task.assignees ?? []).some((a) => a.user_id === currentUserId)
  const canDrag = (task) => canManage || (roleName === 'Collaborator' && isAssignee(task))

  if (tasks === null) {
    return (
      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <TableSkeleton rows={4} columns={5} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-40">
            <Select options={STATUS_FILTER_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
          </div>
          <div className="w-40">
            <Select options={PRIORITY_FILTER_OPTIONS} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} />
          </div>

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
              onClick={() => setView('table')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                view === 'table' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              )}
            >
              <ListIcon className="size-3.5" /> Table
            </button>
          </div>
        </div>

        {canManage && (
          <Button icon={Plus} onClick={() => setFormModal({ open: true, task: null })}>
            New task
          </Button>
        )}
      </div>

      {view === 'kanban' ? (
        <KanbanBoard tasks={tasks} onOpenTask={setDetailTask} onStatusChange={handleDragStatusChange} canDrag={canDrag} />
      ) : (
        <TaskTable tasks={tasks} onOpenTask={setDetailTask} />
      )}

      <TaskFormModal
        open={formModal.open}
        onClose={() => setFormModal({ open: false, task: null })}
        onSubmit={handleCreateOrUpdate}
        task={formModal.task}
        isSubmitting={isSubmitting}
      />

      <TaskDetailModal
        open={!!detailTask}
        onClose={() => setDetailTask(null)}
        task={detailTask}
        canManage={canManage}
        isAssignee={detailTask ? isAssignee(detailTask) : false}
        projectMembers={projectMembers}
        onEdit={(task) => {
          setDetailTask(null)
          setFormModal({ open: true, task })
        }}
        onChanged={refreshAndSyncDetail}
      />
    </div>
  )
}
