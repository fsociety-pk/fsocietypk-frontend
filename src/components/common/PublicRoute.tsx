import { isStaff } from '../../utils/roles';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import CyberLoader from './CyberLoader';
import { returnLocation } from '../../utils/returnLocation';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <CyberLoader fullPage title="Checking your session" description="Finding your place in the community." />;
  }

  if (isAuthenticated) {
    // Redirect authenticated users to /dashboard or where they came from
    const from = returnLocation(location.state?.from);
    return <Navigate to={isStaff(user?.role) ? '/admin' : from.startsWith('/admin') ? '/dashboard' : from} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
