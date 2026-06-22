import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, FolderKanban } from 'lucide-react'
import { toast } from 'sonner'
import { getProjects, createProject } from '../../services/projectService'
import { useAuthStore } from '../../store/useAuthStore'
import { parseApiError } from '../../lib/apiError'
import Button from '../../components/common/Button'
import { Skeleton } from '../../components/common/Loader'
import ProjectFormModal from '../../components/projects/ProjectFormModal'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * What's shown here is already scoped server-side by role: Admin sees
 * every project, a Project Manager sees only ones they created, a
 * Collaborator sees only ones they're a member of. No extra filtering
 * needed on the frontend.
 */
export default function Projects() {
  const navigate = useNavigate()
  const roleName = useAuthStore((s) => s.user?.role_name)
  const canManageProjects = roleName === 'Admin' || roleName === 'Project Manager'

  const [projects, setProjects] = useState(null) // null = not loaded yet
  const isLoading = projects === null
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (err) {
      toast.error(parseApiError(err).message)
      setProjects([])
    }
  }

  // Initial load is inlined here (rather than calling fetchProjects)
  // so the fetch promise chain lives directly in the effect body —
  // fetchProjects itself is still used for refetch-after-create below,
  // triggered from an event handler, not from an effect.
  useEffect(() => {
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
  }, [])

  const handleCreate = async ({ projectName, description }) => {
    setIsSubmitting(true)
    try {
      await createProject(projectName, description)
      toast.success('Project created')
      setIsCreateOpen(false)
      fetchProjects()
    } catch (err) {
      toast.error(parseApiError(err).message)
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {roleName === 'Collaborator'
              ? "Projects you're a member of."
              : 'Projects you manage.'}
          </p>
        </div>
        {canManageProjects && (
          <Button icon={Plus} onClick={() => setIsCreateOpen(true)}>
            New project
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <Skeleton className="mb-3 h-5 w-2/3" />
              <Skeleton className="mb-2 h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <FolderKanban className="mb-3 size-8 text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {canManageProjects ? "You haven't created any projects yet." : "You're not part of any project yet."}
          </p>
          {canManageProjects && (
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => setIsCreateOpen(true)}>
              Create your first project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <button
              key={project.project_id}
              onClick={() => navigate(`/projects/${project.project_id}`)}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-brand-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-700"
            >
              <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                {project.project_name}
                {project.is_archived && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    Archived
                  </span>
                )}
              </h3>
              <p className="line-clamp-2 flex-1 text-sm text-slate-500 dark:text-slate-400">
                {project.description || 'No description provided.'}
              </p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" /> {project.member_count} member{project.member_count === '1' ? '' : 's'}
                </span>
                <span>{formatDate(project.created_at)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <ProjectFormModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
