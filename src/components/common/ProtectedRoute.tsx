import { isStaff } from '../../utils/roles';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import CyberLoader from './CyberLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <CyberLoader fullPage title="Checking your session" description="Finding your place in the community." />;
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to /login but keep the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isStaff(user?.role)) {
    // If admin is required but user isn't admin, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
