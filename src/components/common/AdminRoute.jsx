// src/components/common/AdminRoute.jsx

import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/contexts/hooks/useAuth';
import useRole from '@/contexts/hooks/useRole';
import { useUser } from '@/contexts/hooks/useUser';

export default function AdminRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { loading: userLoading } = useUser();
  const { isAdmin } = useRole();

  if (authLoading || userLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
