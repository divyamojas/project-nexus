// src/App.jsx

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PrivateRoute from '@components/Common/PrivateRoute';
import Layout from '@/layouts/Layout';
import PageLoader from '@components/Common/PageLoader';

// Lazy loading pages
const ComingSoon = lazy(() => import('@components/ComingSoon'));
const Signup = lazy(() => import('@pages/auth/Signup'));
const Login = lazy(() => import('@pages/auth/Login'));
const ForgotPassword = lazy(() => import('@pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('@pages/Dashboard'));
const BrowseBooks = lazy(() => import('@pages/BrowseBooks'));
const Feedback = lazy(() => import('@pages/Feedback'));

function RouteWrapper() {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(true);

  useEffect(() => {
    setIsTransitioning(true);
    const timeout = setTimeout(() => setIsTransitioning(false), 10); // loader shown for any delay > 0ms
    return () => clearTimeout(timeout);
  }, [location]);

  if (isTransitioning) return <PageLoader />;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<ComingSoon />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes with layout */}
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

      {/* Redirect any unknown route to Landing */}
      <Route path="*" element={<Navigate to="/" />} />
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
