// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState } from 'react';
import * as authService from '@/features/auth/services/authService';
import { ALLOWED_EMAIL_DOMAINS, DOMAIN_ERRORS } from '@/constants/constants';
import { useSessionTracker } from '@/hooks/useSessionTracker';

// Create the context
const AuthContext = createContext();

// Hook for accessing the context
export function useAuth() {
  return useContext(AuthContext);
}

// Domain validator
const isValidDomain = (email) => {
  return ALLOWED_EMAIL_DOMAINS.some((domain) => email.endsWith(`@${domain}`));
};

// Helper to create auth context value
const getAuthContextValue = (user, signup, login, logout, resetPassword, loading) => ({
  user,
  signup,
  login,
  logout,
  resetPassword,
  loading,
  isAuthenticated: !!user,
});

// Auth Provider component

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useSessionTracker(setUser, setLoading);

  // Wrapped auth service functions with domain validation
  const signup = async (email, password) => {
    if (!isValidDomain(email)) {
      return { error: { message: DOMAIN_ERRORS.signup } };
    }
    return await authService.signup(email, password);
  };

  const login = async (email, password) => {
    if (!isValidDomain(email)) {
      return { error: { message: DOMAIN_ERRORS.login } };
    }
    return await authService.login(email, password);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  const value = getAuthContextValue(user, signup, login, logout, resetPassword, loading);

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
