import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { login as loginRequest, getProfile } from '../../services/authService'
import { useAuthStore } from '../../store/useAuthStore'
import { parseApiError } from '../../lib/apiError'
import Input from '../../components/common/Input'
import PasswordInput from '../../components/common/PasswordInput'
import Button from '../../components/common/Button'

// Mirrors backend src/validators/authValidator.js loginSchema exactly,
// so the person sees the same rule client-side before hitting the API.
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const setSession = useAuthStore((s) => s.setSession)
  const [formError, setFormError] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async ({ email, password }) => {
    setFormError('')
    try {
      const { token, mustChangePassword } = await loginRequest(email, password)

      // Login's own response is minimal/camelCase. Store the token first
      // so the request interceptor can attach it, then fetch the full
      // profile (snake_case + role_name) — that's the shape the rest of
      // the app relies on for role checks and display.
      useAuthStore.getState().setSession(null, token)
      const profile = await getProfile()
      setSession({ ...profile, must_change_password: mustChangePassword }, token)

      toast.success('Welcome back')

      if (mustChangePassword) {
        navigate('/change-password', { replace: true })
      } else {
        const redirectTo = location.state?.from || '/'
        navigate(redirectTo, { replace: true })
      }
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err)

      // Joi validation errors map to specific fields; auth failures are
      // shown as a single banner since the backend deliberately doesn't
      // say *which* of email/password was wrong (avoids leaking which
      // emails are registered).
      if (fieldErrors.email) setError('email', { message: fieldErrors.email })
      if (fieldErrors.password) setError('password', { message: fieldErrors.password })
      if (!fieldErrors.email && !fieldErrors.password) setFormError(message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-600 font-display text-lg font-bold text-white shadow-sm">
            T
          </div>
          <h1 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Sign in to TaskFlow
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your team's projects and tasks
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
            >
              {formError}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" className="mt-1 w-full" isLoading={isSubmitting}>
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Forgot your password? Contact your administrator.
        </p>
      </div>
    </div>
  )
}
