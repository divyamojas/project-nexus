// src/App.jsx

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import BusyFallback from '@/components/common/BusyFallback';
import RouteSpinner from '@/components/common/RouteSpinner';
import { UserProvider } from '@/contexts/UserContext';
import { BookProvider } from '@/contexts/BookContext';
import { useSession } from '@/hooks';
import { ThemeModeProvider } from '@/theme/ThemeModeProvider';
import { SnackbarProvider } from '@/components/providers/SnackbarProvider';
import ErrorBoundary from '@/components/providers/ErrorBoundary';
import TopProgressBar from '@/components/common/TopProgressBar';
import { RouteLoadProvider } from '@/components/providers/RouteLoadProvider';

// Lazy loading pages and heavy shells
const Signup = lazy(() => import('@/features/auth/Signup'));
const Login = lazy(() => import('@/features/auth/Login'));
const ForgotPassword = lazy(() => import('@/features/auth/ForgotPassword'));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const BrowseBooks = lazy(() => import('@/features/books/BrowseBooks'));
const Feedback = lazy(() => import('@/features/feedback/Feedback'));
const NotFound = lazy(() => import('@/features/notFound/NotFound'));
const ProfileSetup = lazy(() => import('@/features/profile/ProfileSetup'));
const PrivateRoute = lazy(() => import('@/components/common/PrivateRoute'));
const Layout = lazy(() => import('@/components/common/Layout'));
const AdminDashboard = lazy(() => import('@/features/admin/AdminDashboard'));
const AdminRoute = lazy(() => import('@/components/common/AdminRoute'));

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

      <Route
        path="/admin"
        element={
          <PrivateRoute requireProfile={false}>
            <AdminRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </AdminRoute>
          </PrivateRoute>
        }
      />

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
            <RouteLoadProvider>
              <TopProgressBar delay={80} />
              <RouteSpinner delay={350} />
              <Suspense fallback={<BusyFallback delay={500} />}>
                <UserProvider>
                  <BookProvider>
                    <RouteWrapper />
                  </BookProvider>
                </UserProvider>
              </Suspense>
            </RouteLoadProvider>
          </ErrorBoundary>
        </SnackbarProvider>
      </ThemeModeProvider>
    </Router>
  );
}
