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

const DUE_SOON_WINDOW_DAYS = 7

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return parseServerDate(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function startOfToday() {
  return new Date(new Date().setHours(0, 0, 0, 0))
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'Completed') return false
  return parseServerDate(dateStr) < startOfToday()
}

function isDueSoon(dateStr, status) {
  if (!dateStr || status === 'Completed') return false
  const due = parseServerDate(dateStr)
  const today = startOfToday()
  const windowEnd = new Date(today)
  windowEnd.setDate(windowEnd.getDate() + DUE_SOON_WINDOW_DAYS)
  return due >= today && due <= windowEnd
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

/**
 * SVG donut showing overall task completion %. No charting library needed —
 * just a stroke-dasharray circle, so this adds zero new dependencies.
 */
function ProgressRing({ percent, size = 96, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-slate-100 dark:stroke-slate-800"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="stroke-emerald-500 transition-[stroke-dashoffset] duration-700 ease-out dark:stroke-emerald-400"
      />
    </svg>
  )
}

function OverallProgressCard({ todoCount, ongoingCount, completedCount, isLoading }) {
  const total = todoCount + ongoingCount + completedCount
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100)

  const segments = [
    { label: 'To do', value: todoCount, dot: 'bg-slate-400' },
    { label: 'Ongoing', value: ongoingCount, dot: 'bg-amber-500' },
    { label: 'Completed', value: completedCount, dot: 'bg-emerald-500' },
  ]

  return (
    <div className="flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:col-span-3">
      {isLoading ? (
        <Skeleton className="size-24 shrink-0 rounded-full" />
      ) : (
        <div className="relative shrink-0">
          <ProgressRing percent={percent} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-xl font-semibold text-slate-900 dark:text-white">{percent}%</span>
            <span className="text-[10px] text-slate-400">done</span>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Overall task progress</p>
        {isLoading ? (
          <Skeleton className="h-4 w-40" />
        ) : (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {segments.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className={cn('size-2 rounded-full', s.dot)} />
                {s.label}: <span className="font-medium text-slate-700 dark:text-slate-200">{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DeadlineRow({ task, overdue }) {
  return (
    <li className="flex items-center justify-between gap-3 bg-white px-4 py-3 dark:bg-slate-900">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{task.title}</p>
        <p className="truncate text-xs text-slate-400">{task.project_name}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <span
          className={cn(
            'text-xs',
            overdue ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
          )}
        >
          {formatDate(task.due_date)}
        </span>
      </div>
    </li>
  )
}

function DeadlineSection({ title, tasks, emptyText, accent }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h3>
        {tasks.length > 0 && (
          <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', accent)}>{tasks.length}</span>
        )}
      </div>
      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-5 text-center text-xs text-slate-400 dark:border-slate-700">
          {emptyText}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto scrollbar-thin dark:divide-slate-800">
            {tasks.map((task) => (
              <DeadlineRow key={task.task_id} task={task} overdue={title === 'Overdue'} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ProjectProgressList({ projects, tasks, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    )
  }

  const rows = projects
    .filter((p) => !p.is_archived)
    .map((project) => {
      const projectTasks = tasks.filter((t) => t.project_id === project.project_id)
      const total = projectTasks.length
      const completed = projectTasks.filter((t) => t.status === 'Completed').length
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
      return { ...project, total, completed, percent }
    })
    .sort((a, b) => b.percent - a.percent)

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-400 dark:border-slate-700">
        No active projects yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((project) => (
        <Link
          key={project.project_id}
          to={`/projects/${project.project_id}`}
          className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/50"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{project.project_name}</p>
            <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
              {project.completed}/{project.total} tasks
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-500',
                project.percent === 100 ? 'bg-emerald-500' : 'bg-brand-500'
              )}
              style={{ width: `${project.percent}%` }}
            />
          </div>
        </Link>
      ))}
    </div>
  )
}

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
}

/**
 * Current workload per Collaborator — counts only active (non-Completed)
 * tasks, since the point is "who's carrying load right now", not history.
 * Uses task.assignees, which the backend already aggregates per task via a
 * JSON subquery (see taskRepository.getAllTasks) — no extra API calls.
 */
function WorkloadList({ tasks, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    )
  }

  const byUser = new Map()
  for (const task of tasks) {
    if (task.status === 'Completed') continue
    for (const assignee of task.assignees ?? []) {
      const entry = byUser.get(assignee.user_id) ?? { full_name: assignee.full_name, count: 0 }
      entry.count += 1
      byUser.set(assignee.user_id, entry)
    }
  }

  const rows = Array.from(byUser.values()).sort((a, b) => b.count - a.count)
  const maxCount = rows[0]?.count ?? 0

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-400 dark:border-slate-700">
        No active task assignments yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((person) => (
        <div
          key={person.full_name}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            {initials(person.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{person.full_name}</p>
              <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">{person.count} active</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
                style={{ width: `${maxCount === 0 ? 0 : Math.round((person.count / maxCount) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      ))}
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
              .then((list) => list.map((t) => ({ ...t, project_id: p.project_id, project_name: p.project_name })))
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

  const overdueTasks = (tasks ?? [])
    .filter((t) => isOverdue(t.due_date, t.status))
    .sort((a, b) => parseServerDate(a.due_date) - parseServerDate(b.due_date))

  const dueSoonTasks = (tasks ?? [])
    .filter((t) => isDueSoon(t.due_date, t.status))
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

      {/* Overall progress ring */}
      <div className="grid gap-4 sm:grid-cols-3">
        <OverallProgressCard
          todoCount={todoCount}
          ongoingCount={ongoingCount}
          completedCount={completedCount}
          isLoading={tasks === null}
        />
      </div>

      {/* Task status counts */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={ListTodo} label="To do" value={todoCount} isLoading={tasks === null} tone="slate" />
        <StatCard icon={Clock} label="Ongoing" value={ongoingCount} isLoading={tasks === null} tone="amber" />
        <StatCard icon={CheckCircle2} label="Completed" value={completedCount} isLoading={tasks === null} tone="emerald" />
      </div>

      {/* Per-project progress + team workload (Admin/PM only — Collaborators only see their own assigned tasks) */}
      {!isCollaborator && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Project progress</h2>
              <Link
                to="/projects"
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
              >
                View all <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin pr-1">
              <ProjectProgressList projects={projects ?? []} tasks={tasks ?? []} isLoading={projects === null || tasks === null} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Team workload</h2>
            <div className="max-h-80 overflow-y-auto scrollbar-thin pr-1">
              <WorkloadList tasks={tasks ?? []} isLoading={tasks === null} />
            </div>
          </div>
        </div>
      )}

      {/* Deadlines, split into Overdue and Due soon */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Deadlines</h2>
          <Link
            to={isCollaborator ? '/tasks' : '/projects'}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            View all <ArrowRight className="size-3" />
          </Link>
        </div>

        {tasks === null ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <DeadlineSection
              title="Overdue"
              tasks={overdueTasks}
              emptyText="Nothing overdue. Nice work!"
              accent="bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
            />
            <DeadlineSection
              title={`Due in ${DUE_SOON_WINDOW_DAYS} days`}
              tasks={dueSoonTasks}
              emptyText="No upcoming deadlines this week."
              accent="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            />
          </div>
        )}
      </div>
    </div>
  )
}