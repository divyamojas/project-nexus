// /src/services/authService.js

import { supabase } from './supabaseClient';

export const signup = (email, password) => supabase.auth.signUp({ email, password });

export const login = (email, password) => supabase.auth.signInWithPassword({ email, password });

export const logout = () => supabase.auth.signOut();

export const resetPassword = (email) =>
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/login',
  });

export const getSession = () => supabase.auth.getSession();

export const onAuthStateChange = (callback) => supabase.auth.onAuthStateChange(callback);

export const processSignup = async ({
  email,
  password,
  confirmPassword,
  setError,
  setLoading,
  navigate,
  signup,
}) => {
  if (!email || !password || !confirmPassword) {
    setError('Please fill all fields.');
    return;
  }

  if (password !== confirmPassword) {
    setError('Passwords do not match.');
    return;
  }

  if (password.length < 6) {
    setError('Password must be at least 6 characters.');
    return;
  }

  setLoading(true);
  const { error: signupError } = await signup(email, password);
  setLoading(false);

  if (signupError) {
    setError(signupError.message);
  } else {
    navigate('/dashboard');
  }
};

export const processLogin = async ({ email, password, setError, setLoading, login }) => {
  if (!email || !password) {
    setError('Please fill in both email and password.');
    return;
  }

  setLoading(true);
  const result = await login(email, password);
  setLoading(false);

  if (result?.error) {
    const msg = result.error.message;
    if (msg.includes('Invalid login credentials')) {
      setError('Incorrect email or password.');
    } else if (msg.includes('User not found')) {
      setError('Account does not exist.');
    } else {
      setError(msg || 'Something went wrong. Please try again.');
    }
  }
};

export const processResetPassword = async ({
  email,
  setError,
  setMessage,
  setLoading,
  resetPassword,
}) => {
  setError('');
  setMessage('');

  setLoading(true);
  const { error: resetError } = await resetPassword(email);
  setLoading(false);

  if (resetError) {
    setError('Something went wrong. Please try again.');
  } else {
    setMessage('Reset link sent! Please check your email.');
  }
};
