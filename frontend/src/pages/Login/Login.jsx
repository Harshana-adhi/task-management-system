import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import Button from '../../components/common/Button'

/**
 * Stub for Phase 1 — confirms routing/theme work end to end.
 * Replaced with the real login form + auth wiring in Phase 2.
 *
 * The "Preview dashboard" button below only exists so the team can see
 * the design system behind ProtectedRoute before real auth exists.
 * Delete this button (and the dev-only block) once Phase 2 lands.
 */
export default function Login() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const handlePreview = () => {
    setSession(
      { user_id: 'dev-preview', full_name: 'Test User', role_name: 'Admin' },
      'dev-preview-token'
    )
    navigate('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-lg bg-brand-600 font-display text-lg font-bold text-white">
          T
        </div>
        <h1 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
          Sign in to TaskFlow
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Login form arrives in Phase 2.
        </p>

        {import.meta.env.DEV && (
          <div className="mt-6 border-t border-dashed border-slate-200 pt-4 dark:border-slate-700">
            <p className="mb-2 text-xs text-slate-400">Dev only — removed in Phase 2</p>
            <Button variant="secondary" className="w-full" onClick={handlePreview}>
              Preview dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
