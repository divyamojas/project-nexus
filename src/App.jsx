// src/App.jsx

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '@components/Common/PrivateRoute';
import Layout from '@/layouts/Layout';

// Lazy loading pages
const ComingSoon = lazy(() => import('@components/ComingSoon'));
const Signup = lazy(() => import('@pages/auth/Signup'));
const Login = lazy(() => import('@pages/auth/Login'));
const ForgotPassword = lazy(() => import('@pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('@pages/Dashboard'));
const BrowseBooks = lazy(() => import('@pages/BrowseBooks'));

export default function App() {
  return (
    <Router>
      <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>}>
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

          {/* Redirect any unknown route to Landing */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
