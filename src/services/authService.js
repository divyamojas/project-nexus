// src/services/authService.js

import supabase from './supabaseClient';

/** Create a new user with email + password. */
export const signup = (email, password) => supabase.auth.signUp({ email, password });

/** Log in an existing user with email + password. */
export const login = (email, password) => supabase.auth.signInWithPassword({ email, password });

/** Log out the current user. */
export const logout = () => supabase.auth.signOut();

/** Trigger a password reset email flow. */
export const resetPassword = (email) =>
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });

/** Get the current auth session. */
export const getSession = () => supabase.auth.getSession();

/** Subscribe to auth state changes. */
export const onAuthStateChange = (callback) => supabase.auth.onAuthStateChange(callback);
