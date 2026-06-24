import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { FolderKanban, ListChecks, Users, ListTodo, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { getProjects } from '../../services/projectService'
import { getMyTasks, getTasksByProject } from '../../services/taskService'
import { getUsers } from '../../services/userService'
import { useAuthStore } from '../../store/useAuthStore'
import { parseApiError } from '../../lib/apiError'
import { parseServerDate } from '../../lib/date'
import { Skeleton } from '../../components/common/Loader'
import { PriorityBadge, Badge } from '../../components/common/Badge'
import { cn } from '../../lib/cn'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return parseServerDate(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'Completed') return false
  return parseServerDate(dateStr) < new Date(new Date().setHours(0, 0, 0, 0))
}

function StatCard({ icon: Icon, label, value, isLoading, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', tones[tone])}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-1 h-6 w-10" />
        ) : (
          <p className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const roleName = user?.role_name
  const isCollaborator = roleName === 'Collaborator'

  const [projects, setProjects] = useState(null)
  const [tasks, setTasks] = useState(null)
  const [userCount, setUserCount] = useState(null)

  useEffect(() => {
    let active = true

    getProjects()
      .then(async (projectList) => {
        if (!active) return
        setProjects(projectList)

        if (isCollaborator) {
          const myTasks = await getMyTasks()
          if (active) setTasks(myTasks)
          return
        }

        // Admin/PM: combine each project's tasks, tagging each with its
        // project name (per-project task rows don't include it).
        const perProject = await Promise.all(
          projectList.map((p) =>
            getTasksByProject(p.project_id)
              .then((list) => list.map((t) => ({ ...t, project_name: p.project_name })))
              .catch(() => [])
          )
        )
        if (active) setTasks(perProject.flat())
      })
      .catch((err) => {
        if (active) {
          toast.error(parseApiError(err).message)
          setProjects([])
          setTasks([])
        }
      })

    if (roleName === 'Admin') {
      getUsers()
        .then((data) => active && setUserCount(data.length))
        .catch(() => active && setUserCount(null))
    }

    return () => {
      active = false
    }
  }, [roleName, isCollaborator])

  const activeProjects = projects?.filter((p) => !p.is_archived) ?? []
  const todoCount = tasks?.filter((t) => t.status === 'To Do').length ?? 0
  const ongoingCount = tasks?.filter((t) => t.status === 'In Progress').length ?? 0
  const completedCount = tasks?.filter((t) => t.status === 'Completed').length ?? 0
  const overdueCount = tasks?.filter((t) => isOverdue(t.due_date, t.status)).length ?? 0

  const deadlines = (tasks ?? [])
    .filter((t) => t.due_date)
    .sort((a, b) => parseServerDate(a.due_date) - parseServerDate(b.due_date))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
          Welcome back, {user?.full_name?.split(' ')[0] ?? 'there'} !
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Here's what's going on with your work today.
        </p>
      </div>

      {/* Project-level stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {roleName === 'Admin' ? (
          <StatCard icon={Users} label="Total users" value={userCount} isLoading={userCount === null} />
        ) : null}
        <StatCard
          icon={FolderKanban}
          label={roleName === 'Admin' ? 'Total projects' : 'My projects'}
          value={projects?.length}
          isLoading={projects === null}
        />
        <StatCard
          icon={ListChecks}
          label="Active projects"
          value={activeProjects.length}
          isLoading={projects === null}
        />
        {roleName !== 'Admin' && (
          <StatCard
            icon={AlertTriangle}
            label="Overdue tasks"
            value={overdueCount}
            isLoading={tasks === null}
            tone="rose"
          />
        )}
      </div>

      {/* Task status counts */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={ListTodo} label="To do" value={todoCount} isLoading={tasks === null} tone="slate" />
        <StatCard icon={Clock} label="Ongoing" value={ongoingCount} isLoading={tasks === null} tone="amber" />
        <StatCard icon={CheckCircle2} label="Completed" value={completedCount} isLoading={tasks === null} tone="emerald" />
      </div>

      {/* All deadlines, scrollable */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">All deadlines</h2>
          <Link
            to={isCollaborator ? '/tasks' : '/projects'}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            View all <ArrowRight className="size-3" />
          </Link>
        </div>

        {tasks === null ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : deadlines.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-400 dark:border-slate-700">
            No tasks with a due date yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto scrollbar-thin dark:divide-slate-800">
              {deadlines.map((task) => {
                const overdue = isOverdue(task.due_date, task.status)
                return (
                  <li
                    key={task.task_id}
                    className="flex items-center justify-between gap-3 bg-white px-4 py-3 dark:bg-slate-900"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                        {task.title}
                      </p>
                      <p className="truncate text-xs text-slate-400">{task.project_name}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <PriorityBadge priority={task.priority} />
                      {task.status === 'Completed' ? (
                        <Badge>Done</Badge>
                      ) : (
                        <span
                          className={cn(
                            'text-xs',
                            overdue ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
                          )}
                        >
                          {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
