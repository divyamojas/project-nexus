// /src/App.jsx

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PrivateRoute from '@components/Common/PrivateRoute';
import Layout from '@/layouts/Layout';
import PageLoader from '@components/Common/PageLoader';
import { useSession } from '@/hooks/useSession';

// Lazy loading pages
const Signup = lazy(() => import('@pages/auth/Signup'));
const Login = lazy(() => import('@pages/auth/Login'));
const ForgotPassword = lazy(() => import('@pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('@pages/Dashboard'));
const BrowseBooks = lazy(() => import('@pages/BrowseBooks'));
const Feedback = lazy(() => import('@pages/Feedback'));
const NotFound = lazy(() => import('@pages/NotFound'));

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

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/browse"
        element={
          <PrivateRoute>
            <Layout>
              <BrowseBooks />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <PrivateRoute>
            <Layout>
              <Feedback />
            </Layout>
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
      <Suspense fallback={<PageLoader />}>
        <RouteWrapper />
      </Suspense>
    </Router>
  );
}
