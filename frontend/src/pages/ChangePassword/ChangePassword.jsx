import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ShieldCheck } from 'lucide-react'
import { changePassword } from '../../services/authService'
import { useAuthStore } from '../../store/useAuthStore'
import { parseApiError } from '../../lib/apiError'
import PasswordInput from '../../components/common/PasswordInput'
import Button from '../../components/common/Button'

// Mirrors backend src/validators/authValidator.js changePasswordSchema:
// min 8 chars, at least one uppercase letter, at least one number.
const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/(?=.*[A-Z])(?=.*[0-9])/, 'Must contain at least one uppercase letter and one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

export default function ChangePassword() {
  const navigate = useNavigate()
  const updateUser = useAuthStore((s) => s.updateUser)
  const isMandatory = useAuthStore((s) => s.user?.must_change_password)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      await changePassword(currentPassword, newPassword)
      updateUser({ must_change_password: false })
      toast.success('Password changed successfully')
      navigate('/', { replace: true })
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err)
      if (fieldErrors.currentPassword) setError('currentPassword', { message: fieldErrors.currentPassword })
      if (fieldErrors.newPassword) setError('newPassword', { message: fieldErrors.newPassword })
      if (!fieldErrors.currentPassword && !fieldErrors.newPassword) {
        setError('currentPassword', { message })
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <ShieldCheck className="size-5" />
          </div>
          <h1 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            {isMandatory ? 'Set a new password' : 'Change your password'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isMandatory
              ? "For security, you need to set a new password before continuing."
              : 'Update the password used to sign in to Taskify.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <PasswordInput
            label="Current password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            hint="At least 8 characters, with one uppercase letter and one number."
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" className="mt-1 w-full" isLoading={isSubmitting}>
            Update password
          </Button>
        </form>
      </div>
    </div>
  )
}
