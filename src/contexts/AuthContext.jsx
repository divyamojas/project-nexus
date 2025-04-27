// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@services/supabaseClient';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const allowedDomains = ['sprinklr.com', 'gmail.com'];

const isValidDomain = (email) => {
  return allowedDomains.some((domain) => email.endsWith(`@${domain}`));
};

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
    if (!isValidDomain(email)) {
      return {
        error: { message: 'Hey there! 🌿 Only work or Gmail emails are allowed to join Leaflet.' },
      };
    }
    return await supabase.auth.signUp({ email, password });
  };

  const login = async (email, password) => {
    if (!isValidDomain(email)) {
      return { error: { message: 'Oops! 🌱 Only work or Gmail emails are accepted on Leaflet.' } };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    });
  };

  const value = { user, signup, login, logout, resetPassword };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
