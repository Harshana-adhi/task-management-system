import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, UserX, UserCheck, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import {
  getUsers,
  getRoles,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
} from '../../../services/userService'
import { parseApiError } from '../../../lib/apiError'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import Select from '../../../components/common/Select'
import Table from '../../../components/common/Table'
import { Badge } from '../../../components/common/Badge'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import UserFormModal from '../../../components/users/UserFormModal'
import ManageAccessModal from '../../../components/users/ManageAccessModal'

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [formModal, setFormModal] = useState({ open: false, user: null })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null) // { user, action: 'activate' | 'deactivate' }
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)
  const [manageAccessTarget, setManageAccessTarget] = useState(null) // user | null

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getUsers({
        search: search || undefined,
        roleId: roleFilter || undefined,
        isActive: statusFilter || undefined,
      })
      setUsers(data)
    } catch (err) {
      toast.error(parseApiError(err).message)
    } finally {
      setIsLoading(false)
    }
  }, [search, roleFilter, statusFilter])

  // Debounce the search box specifically, so we're not firing a request
  // on every keystroke — filters (role/status) refetch immediately.
  useEffect(() => {
    const timer = setTimeout(fetchUsers, 350)
    return () => clearTimeout(timer)
  }, [fetchUsers])

  useEffect(() => {
    getRoles()
      .then(setRoles)
      .catch((err) => toast.error(parseApiError(err).message))
  }, [])

  const roleFilterOptions = useMemo(
    () => [{ value: '', label: 'All roles' }, ...roles.map((r) => ({ value: r.role_id, label: r.role_name }))],
    [roles]
  )

  const statusFilterOptions = [
    { value: '', label: 'All statuses' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
  ]

  const handleCreateOrUpdate = async (values) => {
    setIsSubmitting(true)
    try {
      if (formModal.user) {
        await updateUser(formModal.user.user_id, values)
        toast.success('User updated')
      } else {
        await createUser(values)
        toast.success('User created — a welcome email with login details has been sent')
      }
      setFormModal({ open: false, user: null })
      fetchUsers()
    } catch (err) {
      toast.error(parseApiError(err).message)
      throw err // let the form show a field-level error too, if applicable
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmStatusChange = async () => {
    if (!confirmTarget) return
    setIsConfirmLoading(true)
    try {
      if (confirmTarget.action === 'deactivate') {
        await deactivateUser(confirmTarget.user.user_id)
        toast.success(`${confirmTarget.user.full_name} has been deactivated`)
      } else {
        await activateUser(confirmTarget.user.user_id)
        toast.success(`${confirmTarget.user.full_name} has been reactivated`)
      }
      setConfirmTarget(null)
      fetchUsers()
    } catch (err) {
      toast.error(parseApiError(err).message)
    } finally {
      setIsConfirmLoading(false)
    }
  }

  const columns = [
    {
      key: 'full_name',
      header: 'Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
            {initials(row.full_name)}
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-200">{row.full_name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role_name',
      header: 'Role',
      render: (row) => <Badge>{row.role_name}</Badge>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (row) =>
        row.is_active ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <span className="size-1.5 rounded-full bg-slate-400" /> Inactive
          </span>
        ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (row) => <span className="text-slate-500 dark:text-slate-400">{formatDate(row.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => setFormModal({ open: true, user: row })}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={ShieldCheck}
            onClick={() => setManageAccessTarget(row)}
          >
            Access
          </Button>
          {row.is_active ? (
            <Button
              variant="ghost"
              size="sm"
              icon={UserX}
              className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
              onClick={() => setConfirmTarget({ user: row, action: 'deactivate' })}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              icon={UserCheck}
              className="text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
              onClick={() => setConfirmTarget({ user: row, action: 'activate' })}
            >
              Activate
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage team accounts, roles, and access.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setFormModal({ open: true, user: null })}>
          Add user
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="min-w-[220px] flex-1">
          <Input
            label="Search"
            icon={Search}
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select
            label="Role"
            options={roleFilterOptions}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select
            label="Status"
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={users}
        isLoading={isLoading}
        rowKey="user_id"
        emptyMessage="No users match your filters."
      />

      <UserFormModal
        open={formModal.open}
        onClose={() => setFormModal({ open: false, user: null })}
        onSubmit={handleCreateOrUpdate}
        roles={roles}
        user={formModal.user}
        isSubmitting={isSubmitting}
      />

      <ManageAccessModal
        key={manageAccessTarget ? `${manageAccessTarget.user_id}-open` : 'closed'}
        open={!!manageAccessTarget}
        onClose={() => setManageAccessTarget(null)}
        user={manageAccessTarget}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleConfirmStatusChange}
        isLoading={isConfirmLoading}
        variant={confirmTarget?.action === 'deactivate' ? 'danger' : 'primary'}
        title={confirmTarget?.action === 'deactivate' ? 'Deactivate user' : 'Reactivate user'}
        confirmLabel={confirmTarget?.action === 'deactivate' ? 'Deactivate' : 'Activate'}
        description={
          confirmTarget?.action === 'deactivate'
            ? `${confirmTarget?.user?.full_name} will lose access to Taskify immediately. You can reactivate their account at any time.`
            : `${confirmTarget?.user?.full_name} will regain access to Taskify with their existing credentials.`
        }
      />
    </div>
  )
}
