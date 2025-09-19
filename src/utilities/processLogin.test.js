import { describe, expect, it, vi } from 'vitest';

import processLogin from './processLogin';

describe('processLogin', () => {
  it('requires email and password', async () => {
    const setError = vi.fn();

    await processLogin({
      email: '',
      password: '',
      setError,
      setLoading: vi.fn(),
      login: vi.fn(),
    });

    expect(setError).toHaveBeenCalledWith('Please fill in both email and password.');
  });

  it('maps Supabase invalid credential message to friendly copy', async () => {
    const setError = vi.fn();
    const setLoading = vi.fn();
    const login = vi.fn().mockResolvedValue({ error: { message: 'Invalid login credentials' } });

    await processLogin({
      email: 'test@leaflet.dev',
      password: 'secret',
      setError,
      setLoading,
      login,
    });

    expect(login).toHaveBeenCalled();
    expect(setError).toHaveBeenCalledWith('Incorrect email or password.');
  });

  it('leaves error empty on success', async () => {
    const setError = vi.fn();
    const setLoading = vi.fn();
    const login = vi.fn().mockResolvedValue({});

    await processLogin({
      email: 'test@leaflet.dev',
      password: 'secret',
      setError,
      setLoading,
      login,
    });

    expect(login).toHaveBeenCalled();
    expect(setError).not.toHaveBeenCalledWith(expect.any(String));
  });
});
