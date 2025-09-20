// src/commonComponents/PrivateRoute.jsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/hooks/useAuth';
import { useUser } from '@/contexts/hooks/useUser';

const PENDING_APPROVAL_ROUTE = '/pending-approval';
const REJECTED_ROUTE = '/account-rejected';

export default function PrivateRoute({ children, requireProfile = true, requireApproval = true }) {
  const { isAuthenticated, loading } = useAuth();
  const { userProfile, loading: userLoading, approvalStatus = 'pending' } = useUser();
  const location = useLocation();
  const isOnPendingRoute = location.pathname === PENDING_APPROVAL_ROUTE;
  const isOnRejectedRoute = location.pathname === REJECTED_ROUTE;

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

  if (requireApproval && isAuthenticated) {
    if (approvalStatus === 'pending' && !isOnPendingRoute) {
      return <Navigate to={PENDING_APPROVAL_ROUTE} state={{ from: location }} replace />;
    }

    if (approvalStatus === 'rejected' && !isOnRejectedRoute) {
      return <Navigate to={REJECTED_ROUTE} state={{ from: location }} replace />;
    }
  }

  return children;
}
