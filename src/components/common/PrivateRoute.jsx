// src/commonComponents/PrivateRoute.jsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/hooks/useAuth';
import { useUser } from '@/contexts/hooks/useUser';

export default function PrivateRoute({ children, requireProfile = true }) {
  const { isAuthenticated, loading } = useAuth();
  const { userProfile, loading: userLoading } = useUser();
  const location = useLocation();

  // Avoid full-screen spinner flashes; top progress bar handles feedback
  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userLoading) return null;

  // Prevent error if userProfile is undefined/null
  if (requireProfile && isAuthenticated && (!userProfile || !userProfile.username)) {
    // Optional: If already at /profile, don't redirect again to avoid loop
    if (location.pathname !== '/profile') {
      return <Navigate to="/profile" state={{ from: location }} replace />;
    }
  }

  return children;
}
