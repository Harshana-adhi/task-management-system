import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FolderPlus, ListChecks, Info } from 'lucide-react'
import Modal from '../common/Modal'
import Select from '../common/Select'
import Button from '../common/Button'
import { Spinner } from '../common/Loader'
import { getProjects, addProjectMember } from '../../services/projectService'
import { getTasksByProject, assignTask } from '../../services/taskService'
import { parseApiError } from '../../lib/apiError'

/**
 * Quick shortcut, scoped to a single user, for two actions that really
 * "belong" to the Projects/Tasks pages (Phase 4/5): adding this user to
 * a project, and assigning them a task within a project they're in.
 *
 * Limitation: the backend has no "list this user's projects" endpoint,
 * so we can't show their current memberships here — only the action to
 * add them to a new one. The full Projects page will show membership
 * properly once it's built.
 */
export default function ManageAccessModal({ open, onClose, user }) {
  // `null` = not loaded yet (still loading); `[]` = loaded, empty.
  // Deriving "loading" from this instead of separate state avoids ever
  // needing a synchronous setState call directly in an effect body.
  const [projects, setProjects] = useState(null)
  const isLoadingProjects = projects === null

  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [isAddingToProject, setIsAddingToProject] = useState(false)

  const [assignProjectId, setAssignProjectId] = useState('')
  const [tasks, setTasks] = useState(null)
  const isLoadingTasks = !!assignProjectId && tasks === null
  const [selectedTaskId, setSelectedTaskId] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

  const isCollaborator = user?.role_name === 'Collaborator'

  // No manual state reset here — the parent remounts this component with
  // a fresh `key` every time it opens (see Users.jsx), so initial useState
  // values already start clean. This effect only fetches data.
  useEffect(() => {
    if (!open) return

    let active = true
    getProjects()
      .then((data) => active && setProjects(data))
      .catch((err) => {
        if (!active) return
        toast.error(parseApiError(err).message)
        setProjects([])
      })

    return () => {
      active = false
    }
  }, [open])

  useEffect(() => {
    if (!assignProjectId) return

    let active = true
    getTasksByProject(assignProjectId)
      .then((data) => active && setTasks(data))
      .catch((err) => {
        if (!active) return
        toast.error(parseApiError(err).message)
        setTasks([])
      })

    return () => {
      active = false
    }
  }, [assignProjectId])

  const handleAddToProject = async () => {
    if (!selectedProjectId) return
    setIsAddingToProject(true)
    try {
      await addProjectMember(selectedProjectId, user.user_id)
      toast.success(`${user.full_name} added to the project`)
      setSelectedProjectId('')
    } catch (err) {
      toast.error(parseApiError(err).message)
    } finally {
      setIsAddingToProject(false)
    }
  }

  const handleAssignTask = async () => {
    if (!selectedTaskId) return
    setIsAssigning(true)
    try {
      await assignTask(selectedTaskId, user.user_id)
      toast.success(`Task assigned to ${user.full_name}`)
      setSelectedTaskId('')
    } catch (err) {
      toast.error(parseApiError(err).message)
    } finally {
      setIsAssigning(false)
    }
  }

  const projectOptions = [
    { value: '', label: isLoadingProjects ? 'Loading projects…' : 'Select a project…' },
    ...(projects ?? []).map((p) => ({ value: p.project_id, label: p.project_name })),
  ]

  const taskOptions = [
    {
      value: '',
      label: isLoadingTasks ? 'Loading tasks…' : tasks?.length ? 'Select a task…' : 'No tasks in this project',
    },
    ...(tasks ?? []).map((t) => ({ value: t.task_id, label: t.title })),
  ]

  return (
    <Modal open={open} onClose={onClose} title={`Manage access — ${user?.full_name ?? ''}`} size="lg">
      <div className="flex flex-col gap-6">
        {/* Add to project */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <FolderPlus className="size-4 text-brand-600" />
            Add to a project
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                options={projectOptions}
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={isLoadingProjects}
              />
            </div>
            <Button
              onClick={handleAddToProject}
              isLoading={isAddingToProject}
              disabled={!selectedProjectId}
            >
              Add
            </Button>
          </div>
        </section>

        <div className="border-t border-slate-100 dark:border-slate-800" />

        {/* Assign to task */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <ListChecks className="size-4 text-brand-600" />
            Assign a task
          </div>

          {!isCollaborator ? (
            <div className="flex items-start gap-2 rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              <p>
                Tasks can only be assigned to Collaborators. {user?.full_name} is a{' '}
                {user?.role_name}, so this isn't available for their account.
              </p>
            </div>
          ) : (
            <>
              <Select
                label="Project"
                options={projectOptions}
                value={assignProjectId}
                onChange={(e) => {
                  setAssignProjectId(e.target.value)
                  setSelectedTaskId('')
                }}
                disabled={isLoadingProjects}
              />
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    options={taskOptions}
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    disabled={!assignProjectId || isLoadingTasks}
                  />
                </div>
                <Button
                  onClick={handleAssignTask}
                  isLoading={isAssigning}
                  disabled={!selectedTaskId}
                >
                  Assign
                </Button>
              </div>
              {isLoadingTasks && (
                <p className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Spinner className="size-3.5" /> Loading tasks for this project…
                </p>
              )}
            </>
          )}
        </section>

        <p className="text-xs text-slate-400">
          Note: the user must already be a member of a project before they can be assigned a
          task in it — add them to the project first if needed.
        </p>
      </div>
    </Modal>
  )
}
