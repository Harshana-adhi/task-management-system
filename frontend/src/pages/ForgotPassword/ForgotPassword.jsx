import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MailCheck, ArrowLeft } from 'lucide-react'
import { forgotPassword } from '../../services/authService'
import { parseApiError } from '../../lib/apiError'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
})

/**
 * Self-service password reset. The backend always returns the same
 * generic message regardless of whether the email matched an active
 * account — see backend/src/controllers/authController.js — so this
 * page always shows the same success state too, rather than branching
 * on the response. That's intentional: it prevents this page from being
 * usable to check which emails are registered.
 */
export default function ForgotPassword() {
  const navigate = useNavigate()
  const [isSent, setIsSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = async ({ email }) => {
    try {
      await forgotPassword(email)
    } catch (err) {
      // Even on a network/server error, fall through to the same generic
      // confirmation — don't let failure states leak anything either, and
      // don't block the person from trying again via the "try a
      // different email" link below.
      void parseApiError(err)
    } finally {
      setSubmittedEmail(email)
      setIsSent(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-brand-600 font-display text-xl font-bold text-white shadow-sm">
            T
          </div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
            Reset your password
          </h1>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Enter the email on your account and we'll send you a temporary password.
          </p>
        </div>

        {isSent ? (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <MailCheck className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Check your inbox</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                If an account exists for <span className="font-medium">{submittedEmail}</span>, we've sent a
                temporary password to it. Log in with it, then change it right away.
              </p>
            </div>
            <Button variant="secondary" className="mt-2 w-full" onClick={() => navigate('/login')}>
              Back to login
            </Button>
            <button
              onClick={() => setIsSent(false)}
              className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className="h-12 text-base"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button type="submit" size="lg" className="w-full text-base" isLoading={isSubmitting}>
              Send temporary password
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
            >
              <ArrowLeft className="size-3.5" /> Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}