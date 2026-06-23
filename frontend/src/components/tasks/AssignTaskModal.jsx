import { useMemo, useState } from 'react'
import { Search, UserPlus, Info } from 'lucide-react'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

/**
 * Assignment is restricted to Collaborators who are already members of
 * THIS project — using the project's already-fetched member list rather
 * than the global user lookup. Note: the backend itself only checks that
 * the target's role is Collaborator, not project membership, so this is
 * a UX-level safeguard, not a real security boundary.
 */
export default function AssignTaskModal({ open, onClose, onAssign, projectMembers, currentAssigneeIds = [] }) {
  const [search, setSearch] = useState('')
  const [assigningUserId, setAssigningUserId] = useState(null)

  const collaborators = useMemo(
    () =>
      projectMembers
        .filter((m) => m.role_name === 'Collaborator')
        .filter((m) => !currentAssigneeIds.includes(m.user_id))
        .filter((m) => m.full_name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())),
    [projectMembers, currentAssigneeIds, search]
  )

  const handleAssign = async (member) => {
    setAssigningUserId(member.user_id)
    try {
      await onAssign(member)
    } finally {
      setAssigningUserId(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Assign task">
      <div className="flex flex-col gap-4">
        <Input
          icon={Search}
          placeholder="Search collaborators…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="max-h-72 overflow-y-auto scrollbar-thin">
          {collaborators.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Info className="size-4 text-slate-400" />
              <p className="text-sm text-slate-400">
                No matching Collaborators. Add one to this project first if needed.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {collaborators.map((member) => (
                <li
                  key={member.user_id}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                      {initials(member.full_name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {member.full_name}
                      </p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={UserPlus}
                    isLoading={assigningUserId === member.user_id}
                    onClick={() => handleAssign(member)}
                  >
                    Assign
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
