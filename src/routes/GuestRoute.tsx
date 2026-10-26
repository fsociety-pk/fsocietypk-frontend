import CyberLoader from '../components/common/CyberLoader'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

/**
 * Wraps auth pages (login/register).
 * Redirects already-authenticated users to /dashboard.
 */
export const GuestRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) return <CyberLoader fullPage title="Checking your session" />

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
