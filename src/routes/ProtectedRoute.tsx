import CyberLoader from '../components/common/CyberLoader'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  allowedRoles?: Array<import('../utils/roles').Role>
  redirectTo?: string
}

/**
 * Wraps routes that require authentication.
 * Optionally restricts to specific roles (e.g. admin-only pages).
 * Redirects unauthenticated users to /login with a `from` state
 * so they can be sent back after successful login.
 */
export const ProtectedRoute = ({
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()

  // Wait for session check before deciding
  if (isLoading) {
    return <CyberLoader fullPage title="Checking your session" />
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
