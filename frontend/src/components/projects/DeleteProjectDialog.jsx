import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'

/**
 * Permanent delete — Admin only. Requires typing the exact project name
 * to confirm, since this cascades to wipe every task, comment, and
 * attachment in the project with no undo. A regular ConfirmDialog
 * (single click + "Are you sure?") isn't enough friction for this.
 */
export default function DeleteProjectDialog({ open, onClose, onConfirm, project, isDeleting }) {
  const [confirmText, setConfirmText] = useState('')
  const isMatch = confirmText === project?.project_name

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Permanently delete project">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/50 dark:bg-rose-950/40">
          <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-rose-600 dark:text-rose-400" />
          <p className="text-sm text-rose-700 dark:text-rose-300">
            This permanently deletes <strong>{project?.project_name}</strong> along with every
            task, comment, and attachment in it. This cannot be undone — there is no archive or
            recovery after this.
          </p>
        </div>

        <Input
          label={
            <>
              Type <strong>{project?.project_name}</strong> to confirm
            </>
          }
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
        />

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={!isMatch}
            isLoading={isDeleting}
          >
            Delete permanently
          </Button>
        </div>
      </div>
    </Modal>
  )
}
