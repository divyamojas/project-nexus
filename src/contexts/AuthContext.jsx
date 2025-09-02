// src/contexts/AuthContext.jsx

import { useState, useMemo, useContext } from 'react';
import { authContext } from './authContextObject';

import { ALLOWED_EMAIL_DOMAINS, DOMAIN_ERRORS } from '../constants/constants';
import { useSessionTracker } from '../hooks';
import * as authService from '../services/authService';

// context object moved to ./authContextObject to satisfy Fast Refresh

// 3. Helper to check email domain
const isValidDomain = (email) =>
  ALLOWED_EMAIL_DOMAINS.some((domain) => email.endsWith(`@${domain}`));

// 4. Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track session from Supabase
  useSessionTracker(setUser, setLoading);

  // Auth operations (with domain validation)
  const signup = async (email, password) => {
    if (!isValidDomain(email)) {
      return { error: { message: DOMAIN_ERRORS.signup } };
    }
    return authService.signup(email, password);
  };

  const login = async (email, password) => {
    if (!isValidDomain(email)) {
      return { error: { message: DOMAIN_ERRORS.login } };
    }
    return authService.login(email, password);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null); // local logout
  };

  const resetPassword = (email) => authService.resetPassword(email);

  // 5. Stable memoized context value
  const value = useMemo(
    () => ({
      user,
      signup,
      login,
      logout,
      resetPassword,
      loading,
      isAuthenticated: !!user,
    }),
    [user, loading],
  );

  // 6. Show nothing until session is resolved
  if (loading) return null;

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
}
