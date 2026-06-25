import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

/**
 * Guards authenticated routes, enforces the mandatory password change,
 * and — when `allowedRoles` is passed — restricts the route to specific
 * roles (e.g. <ProtectedRoute allowedRoles={['Admin']} /> for /admin/users).
 *
 * This is UI-level convenience only. The real enforcement is the
 * backend's authorize('Admin') middleware — hiding a route here just
 * avoids showing Admin screens to people who'd get a 403 anyway.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const mustChangePassword = useAuthStore((s) => s.user?.must_change_password)
  const roleName = useAuthStore((s) => s.user?.role_name)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  if (allowedRoles && !allowedRoles.includes(roleName)) {
    return <Navigate to="/access-denied" replace />
  }

  return <Outlet />
}
