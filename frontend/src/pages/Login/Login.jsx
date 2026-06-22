import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ListChecks, Users, ShieldCheck } from 'lucide-react'
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

const FEATURES = [
  { icon: ListChecks, label: 'Organize every task in one place' },
  { icon: Users, label: 'Collaborate with your team in real time' },
  { icon: ShieldCheck, label: 'Stay on track and never miss a deadline' },
]

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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Left — brand panel. Hidden below lg, since stacking a marketing
          panel above the form on mobile rarely reads well; the logo
          reappears at the top of the form panel instead. */}
      <div className="relative hidden w-2/5 overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Subtle decorative glow — brand color only, low opacity */}
        <div className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 size-96 rounded-full bg-brand-300/10 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white font-display text-base font-bold text-brand-700 shadow-sm">
            T
          </div>
          <span className="font-display text-lg font-semibold text-white">Taskify</span>
        </div>

        <div className="relative flex flex-col gap-6">
          <h2 className="max-w-md font-display text-4xl font-semibold leading-tight text-white">
            Stay organized, collaborate effortlessly, and deliver on time with Taskify.
          </h2>

          <ul className="flex flex-col gap-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-brand-50">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="size-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-brand-100/70">
          &copy; {new Date().getFullYear()} Taskify. All rights reserved.
        </p>
      </div>

      {/* Right — login form */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-3/5">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
            <div className="flex size-12 items-center justify-center rounded-xl bg-brand-600 font-display text-xl font-bold text-white shadow-sm">
              T
            </div>
            <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
              Sign in to Taskify
            </h1>
          </div>

          <div className="mb-8 hidden flex-col gap-2 lg:flex">
            <h1 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">
              Welcome back
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Sign in to continue to Taskify
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
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
              className="h-12 text-base"
              error={errors.email?.message}
              {...register('email')}
            />

            <PasswordInput
              label="Password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-12 text-base"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" size="lg" className="mt-1 w-full text-base" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-400">
            Forgot your password? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}