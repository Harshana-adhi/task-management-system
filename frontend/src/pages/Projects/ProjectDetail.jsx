import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, UserPlus, UserMinus, Calendar, Archive, ArchiveRestore, Trash2, UserCog, ListChecks } from 'lucide-react'
import {
  getProjectById,
  updateProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  archiveProject,
  unarchiveProject,
  deleteProject,
  assignProjectManager,
  unassignProjectManager,
} from '../../services/projectService'
import { useAuthStore } from '../../store/useAuthStore'
import { parseApiError } from '../../lib/apiError'
import { cn } from '../../lib/cn'
import Button from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { PageLoader } from '../../components/common/Loader'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import ProjectFormModal from '../../components/projects/ProjectFormModal'
import AddMemberModal from '../../components/projects/AddMemberModal'
import DeleteProjectDialog from '../../components/projects/DeleteProjectDialog'
import ProjectTasks from '../../components/tasks/ProjectTasks'

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const roleName = useAuthStore((s) => s.user?.role_name)
  const canManage = roleName === 'Admin' || roleName === 'Project Manager'
  const isAdmin = roleName === 'Admin'

  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [notFound, setNotFound] = useState(false)
  const isLoading = !project && !notFound

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isAssignManagerOpen, setIsAssignManagerOpen] = useState(false)
  const [isUnassignConfirmOpen, setIsUnassignConfirmOpen] = useState(false)
  const [isManagerActionLoading, setIsManagerActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchAll = async () => {
    try {
      const [projectData, membersData] = await Promise.all([
        getProjectById(projectId),
        getProjectMembers(projectId),
      ])
      setProject(projectData)
      setMembers(membersData)
    } catch (err) {
      if (err?.response?.status === 404) {
        setNotFound(true)
      } else {
        toast.error(parseApiError(err).message)
      }
    }
  }

  // Initial load is inlined here rather than calling fetchAll, so the
  // promise chain lives directly in the effect body. fetchAll itself is
  // still used for refetch-after-edit, triggered from an event handler.
  useEffect(() => {
    let active = true
    Promise.all([getProjectById(projectId), getProjectMembers(projectId)])
      .then(([projectData, membersData]) => {
        if (!active) return
        setProject(projectData)
        setMembers(membersData)
      })
      .catch((err) => {
        if (!active) return
        if (err?.response?.status === 404) {
          setNotFound(true)
        } else {
          toast.error(parseApiError(err).message)
        }
      })
    return () => {
      active = false
    }
  }, [projectId])

  const handleEdit = async ({ projectName, description }) => {
    setIsSubmitting(true)
    try {
      await updateProject(projectId, projectName, description)
      toast.success('Project updated')
      setIsEditOpen(false)
      fetchAll()
    } catch (err) {
      toast.error(parseApiError(err).message)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddMember = async (user) => {
    try {
      await addProjectMember(projectId, user.user_id)
      toast.success(`${user.full_name} added to the project`)
      setMembers((prev) => [...prev, { ...user, project_member_id: user.user_id, joined_at: new Date().toISOString() }])
    } catch (err) {
      toast.error(parseApiError(err).message)
      throw err
    }
  }

  const handleRemoveMember = async () => {
    if (!removeTarget) return
    setIsRemoving(true)
    try {
      await removeProjectMember(projectId, removeTarget.user_id)
      toast.success(`${removeTarget.full_name} removed from the project`)
      setMembers((prev) => prev.filter((m) => m.user_id !== removeTarget.user_id))
      setRemoveTarget(null)
    } catch (err) {
      toast.error(parseApiError(err).message)
    } finally {
      setIsRemoving(false)
    }
  }

  const handleArchiveToggle = async () => {
    setIsArchiving(true)
    try {
      if (project.is_archived) {
        await unarchiveProject(projectId)
        toast.success('Project restored from archive')
      } else {
        await archiveProject(projectId)
        toast.success('Project archived')
      }
      fetchAll()
    } catch (err) {
      toast.error(parseApiError(err).message)
    } finally {
      setIsArchiving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProject(projectId)
      toast.success('Project permanently deleted')
      navigate('/projects', { replace: true })
    } catch (err) {
      toast.error(parseApiError(err).message)
      setIsDeleting(false)
    }
  }

  const handleAssignManager = async (user) => {
    try {
      await assignProjectManager(projectId, user.user_id)
      toast.success(`${user.full_name} is now the assigned manager for this project`)
      fetchAll()
    } catch (err) {
      toast.error(parseApiError(err).message)
      throw err
    }
  }

  const handleUnassignManager = async () => {
    setIsManagerActionLoading(true)
    try {
      await unassignProjectManager(projectId)
      toast.success('Manager unassigned from this project')
      setIsUnassignConfirmOpen(false)
      fetchAll()
    } catch (err) {
      toast.error(parseApiError(err).message)
    } finally {
      setIsManagerActionLoading(false)
    }
  }

  if (isLoading) return <PageLoader label="Loading project…" />

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This project doesn't exist, or you don't have access to it.
        </p>
        <Link to="/projects" className="mt-2">
          <Button variant="secondary" size="sm">Back to projects</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="size-4" /> Back to projects
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{project.project_name}</h1>
            {project.is_archived && <Badge>Archived</Badge>}
          </div>
          <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            {project.description || 'No description provided.'}
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Created by {project.created_by_name}</span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5" /> {formatDate(project.created_at)}
            </span>
          </div>

          {/* Only Admin-created projects can have a co-manager assigned —
              a PM-created project already has its leader (the creator). */}
          {project.created_by_role !== 'Project Manager' && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <UserCog className="size-3.5" />
                {project.assigned_manager_name
                  ? `Assigned manager: ${project.assigned_manager_name}`
                  : 'No manager assigned'}
              </span>
              {isAdmin && (
                <>
                  <button
                    onClick={() => setIsAssignManagerOpen(true)}
                    className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    {project.assigned_manager_name ? 'Change' : 'Assign'}
                  </button>
                  {project.assigned_manager_name && (
                    <button
                      onClick={() => setIsUnassignConfirmOpen(true)}
                      className="font-medium text-rose-600 hover:underline dark:text-rose-400"
                    >
                      Unassign
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon={Pencil} onClick={() => setIsEditOpen(true)}>
              Edit
            </Button>
            <Button
              variant="secondary"
              icon={project.is_archived ? ArchiveRestore : Archive}
              isLoading={isArchiving}
              onClick={handleArchiveToggle}
            >
              {project.is_archived ? 'Unarchive' : 'Archive'}
            </Button>
            {isAdmin && (
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => setIsDeleteOpen(true)}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'tasks', label: 'Tasks', icon: ListChecks },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            {tab.icon && <tab.icon className="size-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Members ({members.length})
          </h2>
          {canManage && (
            <Button size="sm" icon={UserPlus} onClick={() => setIsAddMemberOpen(true)}>
              Add member
            </Button>
          )}
        </div>

        {members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-400 dark:border-slate-700">
            No members yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {members.map((member) => (
                <li
                  key={member.user_id}
                  className="flex items-center justify-between gap-3 bg-white px-4 py-3 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                      {initials(member.full_name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{member.full_name}</p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                    <Badge>{member.role_name}</Badge>
                  </div>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={UserMinus}
                      className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                      onClick={() => setRemoveTarget(member)}
                    >
                      Remove
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      )}

      {activeTab === 'tasks' && (
        <ProjectTasks projectId={projectId} canManage={canManage} projectMembers={members} />
      )}

      <ProjectFormModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEdit}
        project={project}
        isSubmitting={isSubmitting}
      />

      <AddMemberModal
        key={`${projectId}-member-${isAddMemberOpen}`}
        open={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAdd={handleAddMember}
        existingMemberIds={members.map((m) => m.user_id)}
        roleFilter={roleName === 'Project Manager' ? 'Collaborator' : undefined}
        helperText="Project Managers can only add Collaborators to a project."
      />

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveMember}
        isLoading={isRemoving}
        title="Remove member"
        confirmLabel="Remove"
        description={`${removeTarget?.full_name} will lose access to this project and its tasks.`}
      />

      <AddMemberModal
        key={`${projectId}-manager-${isAssignManagerOpen}`}
        open={isAssignManagerOpen}
        onClose={() => setIsAssignManagerOpen(false)}
        onAdd={handleAssignManager}
        existingMemberIds={project.assigned_manager_id ? [project.assigned_manager_id] : []}
        roleFilter="Project Manager"
        title="Assign a project manager"
        actionLabel="Assign"
        helperText="This grants full management rights over the project, same as the creator. Only one manager can be assigned at a time."
      />

      <ConfirmDialog
        open={isUnassignConfirmOpen}
        onClose={() => setIsUnassignConfirmOpen(false)}
        onConfirm={handleUnassignManager}
        isLoading={isManagerActionLoading}
        title="Unassign manager"
        confirmLabel="Unassign"
        description={`${project.assigned_manager_name} will lose management rights over this project. The original creator keeps their access.`}
      />

      <DeleteProjectDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        project={project}
        isDeleting={isDeleting}
      />
    </div>
  )
}
