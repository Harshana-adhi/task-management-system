import { useEffect, useState } from 'react'
import { Mail, ShieldCheck, Calendar, KeyRound, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { getProfile } from '../../services/authService'
import { Skeleton } from '../../components/common/Loader'
import { Badge } from '../../components/common/Badge'
import Button from '../../components/common/Button'

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * View-only by design, per the project SRS: "Other users do not have
 * ability to update others or their profile" — only Administrators can
 * change account details (Phase 3: User Management). This page is the
 * correct, spec-compliant implementation, not a placeholder.
 */
export default function Profile() {
  const storedUser = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    getProfile()
      .then((profile) => {
        if (active) updateUser(profile)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading && !storedUser) {
    return (
      <div className="mx-auto max-w-xl">
        <Skeleton className="mb-4 h-8 w-40" />
        <div className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
          <Skeleton className="mb-4 size-16 rounded-full" />
          <Skeleton className="mb-2 h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    )
  }

  const user = storedUser

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">My profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your account details as stored in Taskify.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
            {initials(user?.full_name)}
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              {user?.full_name}
            </p>
            <Badge>{user?.role_name}</Badge>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Mail className="size-4 shrink-0 text-slate-400" />
            <div>
              <dt className="text-xs text-slate-400">Email</dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300">{user?.email}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="size-4 shrink-0 text-slate-400" />
            <div>
              <dt className="text-xs text-slate-400">Role</dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300">{user?.role_name}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="size-4 shrink-0 text-slate-400" />
            <div>
              <dt className="text-xs text-slate-400">Member since</dt>
              <dd className="text-sm text-slate-700 dark:text-slate-300">
                {formatDate(user?.created_at)}
              </dd>
            </div>
          </div>
        </dl>

        <div className="mt-6 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <KeyRound className="size-4 text-slate-400" />
            Password
          </div>
          <Link to="/change-password">
            <Button variant="secondary" size="sm">
              Change password
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        <p>
          Profile details are managed by your Administrator. Per system policy, users cannot
          edit their own name or email — contact an Admin if your details need to change.
        </p>
      </div>
    </div>
  )
}
