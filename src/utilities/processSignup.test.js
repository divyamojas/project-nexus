import { describe, expect, it, vi } from 'vitest';

import processSignup from './processSignup';

describe('processSignup', () => {
  const baseArgs = {
    email: 'test@leaflet.dev',
    password: 'secret123',
    confirmPassword: 'secret123',
  };

  it('validates required fields', async () => {
    const setError = vi.fn();

    await processSignup({
      ...baseArgs,
      email: '',
      setError,
      setLoading: vi.fn(),
      navigate: vi.fn(),
      signup: vi.fn(),
    });

    expect(setError).toHaveBeenCalledWith('Please fill all fields.');
  });

  it('validates matching passwords', async () => {
    const setError = vi.fn();

    await processSignup({
      ...baseArgs,
      confirmPassword: 'different',
      setError,
      setLoading: vi.fn(),
      navigate: vi.fn(),
      signup: vi.fn(),
    });

    expect(setError).toHaveBeenCalledWith('Passwords do not match.');
  });

  it('enforces password length', async () => {
    const setError = vi.fn();

    await processSignup({
      ...baseArgs,
      password: '123',
      confirmPassword: '123',
      setError,
      setLoading: vi.fn(),
      navigate: vi.fn(),
      signup: vi.fn(),
    });

    expect(setError).toHaveBeenCalledWith('Password must be at least 6 characters.');
  });

  it('surfaces Supabase errors', async () => {
    const setError = vi.fn();
    const signup = vi.fn().mockResolvedValue({ error: { message: 'Email already registered' } });

    await processSignup({
      ...baseArgs,
      setError,
      setLoading: vi.fn(),
      navigate: vi.fn(),
      signup,
    });

    expect(signup).toHaveBeenCalled();
    expect(setError).toHaveBeenCalledWith('Email already registered');
  });

  it('navigates to pending approval on success', async () => {
    const setError = vi.fn();
    const navigate = vi.fn();
    const signup = vi.fn().mockResolvedValue({});

    await processSignup({
      ...baseArgs,
      setError,
      setLoading: vi.fn(),
      navigate,
      signup,
    });

    expect(navigate).toHaveBeenCalledWith('/pending-approval');
  });
});
