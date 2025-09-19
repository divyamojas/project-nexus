import { describe, expect, it, vi } from 'vitest';

import processResetPassword from './processResetPassword';

describe('processResetPassword', () => {
  it('handles Supabase errors gracefully', async () => {
    const setError = vi.fn();
    const setMessage = vi.fn();
    const setLoading = vi.fn();
    const resetPassword = vi.fn().mockResolvedValue({ error: { message: 'failure' } });

    await processResetPassword({
      email: 'user@leaflet.dev',
      setError,
      setMessage,
      setLoading,
      resetPassword,
    });

    expect(setError).toHaveBeenCalledWith('Something went wrong. Please try again.');
    expect(setMessage).toHaveBeenCalledWith('');
  });

  it('confirms success when reset email is sent', async () => {
    const setError = vi.fn();
    const setMessage = vi.fn();
    const setLoading = vi.fn();
    const resetPassword = vi.fn().mockResolvedValue({ error: null });

    await processResetPassword({
      email: 'user@leaflet.dev',
      setError,
      setMessage,
      setLoading,
      resetPassword,
    });

    expect(setMessage).toHaveBeenCalledWith('Reset link sent! Please check your email.');
    expect(setError).toHaveBeenCalledWith('');
  });
});
