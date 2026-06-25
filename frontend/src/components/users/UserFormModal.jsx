import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Select from '../common/Select'
import Button from '../common/Button'

// Mirrors backend src/validators/userValidator.js createUserSchema /
// updateUserSchema exactly (full_name max 100, valid email max 255,
// role_id required integer). No password field — see CreateUser note below.
const schema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name cannot exceed 100 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address').max(255, 'Email cannot exceed 255 characters'),
  role_id: z.coerce.number({ invalid_type_error: 'Please select a role' }).int().min(1, 'Please select a role'),
})

/**
 * Shared modal for both creating and editing a user.
 * - Create: no password field — backend auto-generates a temp password
 *   and emails it to the new user (see userService.createUser).
 * - Edit: pre-filled with the existing user; active/inactive status is
 *   changed separately (Activate/Deactivate buttons in the table), since
 *   the backend's update endpoint doesn't actually persist is_active.
 */
export default function UserFormModal({ open, onClose, onSubmit, roles, user, isSubmitting }) {
  const isEditMode = !!user

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', email: '', role_id: '' },
  })

  useEffect(() => {
    if (open) {
      reset(
        user
          ? { full_name: user.full_name, email: user.email, role_id: user.role_id }
          : { full_name: '', email: '', role_id: '' }
      )
    }
  }, [open, user, reset])

  const roleOptions = [
    { value: '', label: 'Select a role…' },
    ...roles.map((r) => ({ value: r.role_id, label: r.role_name })),
  ]

  const submit = async (values) => {
    try {
      await onSubmit({ ...values, role_id: Number(values.role_id) })
    } catch (err) {
      // Backend returns 400 "Email already exists" for duplicate emails
      const message = err?.response?.data?.message
      if (message?.toLowerCase().includes('email')) {
        setError('email', { message })
      }
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Edit user' : 'Create user'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(submit)} isLoading={isSubmitting}>
            {isEditMode ? 'Save changes' : 'Create user'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
        <Input
          label="Full name"
          placeholder="e.g. Jane Cooper"
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="jane@company.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Select
          label="Role"
          options={roleOptions}
          error={errors.role_id?.message}
          {...register('role_id')}
        />

        {!isEditMode && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            A temporary password will be generated and emailed to this address. They'll be
            required to set a new password on first login.
          </p>
        )}
      </form>
    </Modal>
  )
}
