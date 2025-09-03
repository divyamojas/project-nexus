// src/hooks/useSessionTracker.js

import { useEffect } from 'react';
import { getSession, onAuthStateChange } from '../services/authService';

/**
 * Track auth session and keep AuthContext's local user/loading in sync.
 */
export default function useSessionTracker(setUser, setLoading) {
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data } = await getSession();
      if (isMounted) {
        setUser(data?.session?.user ?? null);
        setLoading(false);
      }

      const { data: { subscription } = {} } = onAuthStateChange((_event, newSession) => {
        if (isMounted) setUser(newSession?.user ?? null);
      });

      return () => subscription?.unsubscribe?.();
    };

    const cleanup = init();

    return () => {
      isMounted = false;
      cleanup?.then?.((fn) => typeof fn === 'function' && fn());
    };
  }, [setUser, setLoading]);
}
