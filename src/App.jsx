// /src/App.jsx

import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import PageLoader from './components/Common/PageLoader';
import PrivateRoute from './components/Common/PrivateRoute';
import Layout from './components/Common/Layout';
import { UserProvider } from './contexts/UserContext';
import { BookProvider } from './contexts/BookContext';
import { useSession } from './hooks/useSession';

// Lazy loading pages
const Signup = lazy(() => import('./features/auth/Signup'));
const Login = lazy(() => import('./features/auth/Login'));
const ForgotPassword = lazy(() => import('./features/auth/ForgotPassword'));
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
const BrowseBooks = lazy(() => import('./features/books/BrowseBooks'));
const Feedback = lazy(() => import('./features/feedback/Feedback'));
const NotFound = lazy(() => import('./features/pageNotFound/NotFound'));

const protectedRoutes = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/browse', element: <BrowseBooks /> },
  { path: '/feedback', element: <Feedback /> },
];

function RouteWrapper() {
  const location = useLocation();
  const { session, loading } = useSession();
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    setIsTransitioning(true);
    const timeout = setTimeout(() => setIsTransitioning(false), 10);
    return () => clearTimeout(timeout);
  }, [location]);

  if (loading || isTransitioning) return <PageLoader />;

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
      <Suspense fallback={<PageLoader />}>
        <UserProvider>
          <BookProvider>
            <RouteWrapper />
          </BookProvider>
        </UserProvider>
      </Suspense>
    </Router>
  );
}
