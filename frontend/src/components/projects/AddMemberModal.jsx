import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Search, UserPlus } from 'lucide-react'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import { Spinner } from '../common/Loader'
import { lookupUsers } from '../../services/userService'
import { parseApiError } from '../../lib/apiError'

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

/**
 * Search-as-you-type picker backed by GET /api/users/lookup (Admin +
 * Project Manager). Already-added members are filtered out via
 * `existingMemberIds` so the same person can't be offered twice.
 *
 * `roleFilter` restricts results to a single role server-side (used to
 * limit Project Managers to Collaborators only — see ProjectDetail.jsx).
 * The backend re-enforces this independently in projectService.addMember,
 * so this filter is for UX, not the actual security boundary.
 */
export default function AddMemberModal({
  open,
  onClose,
  onAdd,
  existingMemberIds = [],
  roleFilter,
  title = 'Add a member',
  actionLabel = 'Add',
  helperText,
}) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState(null) // null = not searched yet
  const [isSearching, setIsSearching] = useState(false)
  const [addingUserId, setAddingUserId] = useState(null)

  useEffect(() => {
    if (!open) return
    let active = true

    const timer = setTimeout(() => {
      setIsSearching(true)
      lookupUsers({ search, roleName: roleFilter })
        .then((data) => {
          if (!active) return
          setResults(data.filter((u) => !existingMemberIds.includes(u.user_id)))
        })
        .catch((err) => active && toast.error(parseApiError(err).message))
        .finally(() => active && setIsSearching(false))
    }, 300)

    return () => {
      active = false
      clearTimeout(timer)
    }
    // existingMemberIds is stable per modal open (parent re-fetches members after each add)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, search, roleFilter])

  const handleAdd = async (user) => {
    setAddingUserId(user.user_id)
    try {
      await onAdd(user)
      setResults((prev) => prev?.filter((u) => u.user_id !== user.user_id) ?? null)
    } catch {
      // parent already shows the error toast
    } finally {
      setAddingUserId(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <Input
          icon={Search}
          placeholder={roleFilter ? `Search ${roleFilter.toLowerCase()}s by name or email…` : 'Search by name or email…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        {roleFilter && (
          <p className="-mt-2 text-xs text-slate-400">
            {helperText ?? `Showing ${roleFilter}s only.`}
          </p>
        )}

        <div className="max-h-72 overflow-y-auto scrollbar-thin">
          {isSearching ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : results === null ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Start typing to search for someone to add.
            </p>
          ) : results.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No matching users found.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {results.map((user) => (
                <li
                  key={user.user_id}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                      {initials(user.full_name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {user.email} · {user.role_name}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={UserPlus}
                    isLoading={addingUserId === user.user_id}
                    onClick={() => handleAdd(user)}
                  >
                    {actionLabel}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  )
}
