import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { PageLoader } from '../components/common/Loader'

/**
 * Scaffold for Phase 1 — just checks authentication. Phase 2 extends this
 * with the mandatory-change-password redirect, and a role-based variant
 * (e.g. <ProtectedRoute allowedRoles={['Admin']} />) guards Admin-only routes.
 */
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)

  // Wait for the persisted session to load before deciding — otherwise
  // a logged-in user gets bounced to /login on every refresh.
  if (!hasHydrated) {
    return <PageLoader label="Loading session…" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
