// src/App.jsx

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '@components/Common/PrivateRoute';

// Lazy loading pages
const ComingSoon = lazy(() => import('@pages/ComingSoon'));
const Signup = lazy(() => import('@pages/auth/Signup'));
const Login = lazy(() => import('@pages/auth/Login'));
const Dashboard = lazy(() => import('@pages/Dashboard'));

export default function App() {
  return (
    <Router>
      <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<ComingSoon />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Route */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
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
