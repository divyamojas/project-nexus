// src/App.jsx

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import DelayedLoader from '@/commonComponents/DelayedLoader';
import PrivateRoute from '@/commonComponents/PrivateRoute';
import Layout from '@/commonComponents/Layout';
import { UserProvider } from '@/contexts/UserContext';
import { BookProvider } from '@/contexts/BookContext';
import { useSession } from '@/hooks';
import { ThemeModeProvider } from '@/theme/ThemeModeProvider';
import { SnackbarProvider } from '@/components/providers/SnackbarProvider';
import ErrorBoundary from '@/components/providers/ErrorBoundary';

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

  // Show a loader only if session resolution takes longer than a short delay.
  if (loading) return <DelayedLoader delay={250} />;

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
            <Suspense fallback={<DelayedLoader delay={250} />}>
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
