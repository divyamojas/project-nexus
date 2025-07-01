// src/components/Common/PrivateRoute.jsx

import { Navigate, useLocation } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { userProfile } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Prevent error if userProfile is undefined/null
  if (isAuthenticated && (!userProfile || !userProfile.username)) {
    // Optional: If already at /profile, don't redirect again to avoid loop
    if (location.pathname !== '/profile') {
      return <Navigate to="/profile" state={{ from: location }} replace />;
    }
  }

  return children;
}
