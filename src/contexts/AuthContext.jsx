// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@services/supabaseClient';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signup = async (email, password) => {
    return supabase.auth.signUp({ email, password });
  };

  const login = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    });
  };

  const value = { user, signup, login, logout, resetPassword };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
