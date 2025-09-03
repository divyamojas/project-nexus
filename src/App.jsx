// src/App.jsx

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import DelayedLoader from '@/commonComponents/DelayedLoader';
import PrivateRoute from '@/commonComponents/PrivateRoute';
import Layout from '@/commonComponents/Layout';
import { UserProvider } from '@/contexts/UserContext';
import { BookProvider } from '@/contexts/BookContext';
import { useSession } from '@/hooks';
import { ThemeModeProvider } from '@/theme/ThemeModeProvider';
import { SnackbarProvider } from '@/components/providers/SnackbarProvider';
import ErrorBoundary from '@/components/providers/ErrorBoundary';
import TopProgressBar from '@/commonComponents/TopProgressBar';

// Lazy loading pages
const Signup = lazy(() => import('@/features/auth/Signup'));
const Login = lazy(() => import('@/features/auth/Login'));
const ForgotPassword = lazy(() => import('@/features/auth/ForgotPassword'));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const BrowseBooks = lazy(() => import('@/features/books/BrowseBooks'));
const Feedback = lazy(() => import('@/features/feedback/Feedback'));
const NotFound = lazy(() => import('@/features/notFound/NotFound'));
const ProfileSetup = lazy(() => import('@/features/profile/ProfileSetup'));

const protectedRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/browse', element: <BrowseBooks /> },
  { path: '/feedback', element: <Feedback /> },
  { path: '/profile', element: <ProfileSetup /> },
];

function RouteWrapper() {
  const { session, loading } = useSession();
  const location = useLocation();

  // Avoid flicker by not rendering routes until session resolves
  if (loading) return null;

  // If not authenticated, force redirect to login for any non-auth route
  const AUTH_ROUTES = new Set(['/login', '/signup', '/forgot-password']);
  if (!session && !AUTH_ROUTES.has(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Root Route */}
      <Route
        path="/"
        element={session ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />

      {/* Auth Routes */}
      <Route
        path="/signup"
        element={!session ? <Signup /> : <Navigate to="/dashboard" replace />}
      />
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes (mapped) */}
      {protectedRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <PrivateRoute>
              <Layout>{element}</Layout>
            </PrivateRoute>
          }
        />
      ))}

      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeModeProvider>
        <SnackbarProvider>
          <ErrorBoundary>
            <TopProgressBar delay={80} duration={500} />
            <Suspense fallback={<DelayedLoader delay={400} />}>
              <UserProvider>
                <BookProvider>
                  <RouteWrapper />
                </BookProvider>
              </UserProvider>
            </Suspense>
          </ErrorBoundary>
        </SnackbarProvider>
      </ThemeModeProvider>
    </Router>
  );
}
