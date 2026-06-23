import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Calendar, Pencil, Trash2, UserPlus, UserMinus, Clock } from 'lucide-react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import Select from '../common/Select'
import ConfirmDialog from '../common/ConfirmDialog'
import { StatusBadge, PriorityBadge } from '../common/Badge'
import { Spinner } from '../common/Loader'
import AssignTaskModal from './AssignTaskModal'
import {
  getTaskAssignments,
  updateTaskStatus,
  removeTaskAssignment,
  assignTask,
  deleteTask,
} from '../../services/taskService'
import { parseApiError } from '../../lib/apiError'

const STATUS_OPTIONS = [
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
]

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return 'No due date'
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * canManage = Admin/PM with rights over this project (full control).
 * isAssignee = current user (Collaborator) is assigned to this task —
 * grants permission to change status only, nothing else.
 */
export default function TaskDetailModal({
  open,
  onClose,
  task,
  canManage,
  isAssignee,
  projectMembers,
  onEdit,
  onChanged,
}) {
  const [assignees, setAssignees] = useState(null) // null = loading
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!open || !task) return
    let active = true
    getTaskAssignments(task.task_id)
      .then((data) => active && setAssignees(data))
      .catch((err) => active && toast.error(parseApiError(err).message))
    return () => {
      active = false
    }
  }, [open, task])

  if (!task) return null

  const canChangeStatus = canManage || isAssignee

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value
    setIsUpdatingStatus(true)
    try {
      await updateTaskStatus(task.task_id, newStatus)
      toast.success('Status updated')
      onChanged()
    } catch (err) {
      toast.error(parseApiError(err).message)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleAssign = async (member) => {
    try {
      await assignTask(task.task_id, member.user_id)
      toast.success(`Assigned to ${member.full_name}`)
      setAssignees((prev) => [...(prev ?? []), { user_id: member.user_id, full_name: member.full_name, email: member.email }])
      onChanged()
    } catch (err) {
      toast.error(parseApiError(err).message)
      throw err
    }
  }

  const handleRemoveAssignment = async () => {
    if (!removeTarget) return
    setIsRemoving(true)
    try {
      await removeTaskAssignment(task.task_id, removeTarget.user_id)
      toast.success(`${removeTarget.full_name} unassigned`)
      setAssignees((prev) => prev.filter((a) => a.user_id !== removeTarget.user_id))
      setRemoveTarget(null)
      onChanged()
    } catch (err) {
      toast.error(parseApiError(err).message)
    } finally {
      setIsRemoving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteTask(task.task_id)
      toast.success('Task deleted')
      onClose()
      onChanged()
    } catch (err) {
      toast.error(parseApiError(err).message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title={task.title} size="lg">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority} />
            {canChangeStatus ? (
              <div className="w-40">
                <Select
                  options={STATUS_OPTIONS}
                  value={task.status}
                  onChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                />
              </div>
            ) : (
              <StatusBadge status={task.status} />
            )}
          </div>

          {task.description && (
            <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" /> Due {formatDate(task.due_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" /> Created {formatDate(task.created_at)}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Assigned to</h3>
              {canManage && (
                <Button size="sm" variant="ghost" icon={UserPlus} onClick={() => setIsAssignOpen(true)}>
                  Assign
                </Button>
              )}
            </div>

            {assignees === null ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : assignees.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 px-3 py-3 text-center text-sm text-slate-400 dark:border-slate-700">
                Not assigned to anyone yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {assignees.map((a) => (
                  <li
                    key={a.user_id}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                        {initials(a.full_name)}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{a.full_name}</span>
                    </div>
                    {canManage && (
                      <button
                        onClick={() => setRemoveTarget(a)}
                        aria-label={`Unassign ${a.full_name}`}
                        className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                      >
                        <UserMinus className="size-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {canManage && (
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <Button variant="secondary" icon={Pencil} onClick={() => onEdit(task)}>
                Edit
              </Button>
              <Button variant="danger" icon={Trash2} onClick={() => setIsDeleteConfirmOpen(true)}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </Modal>

      <AssignTaskModal
        open={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onAssign={handleAssign}
        projectMembers={projectMembers}
        currentAssigneeIds={(assignees ?? []).map((a) => a.user_id)}
      />

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveAssignment}
        isLoading={isRemoving}
        title="Unassign task"
        confirmLabel="Unassign"
        description={`${removeTarget?.full_name} will no longer be responsible for this task.`}
      />

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete task"
        confirmLabel="Delete"
        description={`"${task.title}" will be permanently deleted, including its comments and attachments.`}
      />
    </>
  )
}
