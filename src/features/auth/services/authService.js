// /src/services/authService.js

import { supabase } from '../../../services/supabaseClient';

export const signup = (email, password) => supabase.auth.signUp({ email, password });

export const login = (email, password) => supabase.auth.signInWithPassword({ email, password });

export const logout = () => supabase.auth.signOut();

export const resetPassword = (email) =>
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/login',
  });

export const getSession = () => supabase.auth.getSession();

export const onAuthStateChange = (callback) => supabase.auth.onAuthStateChange(callback);
