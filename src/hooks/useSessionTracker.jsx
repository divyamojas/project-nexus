// src/hooks/useSessionTracker.js

import { useEffect } from 'react';
import { getSession, onAuthStateChange } from '../services/authService';

export function useSessionTracker(setUser, setLoading) {
  useEffect(() => {
    const getSessionAndSubscribe = async () => {
      const {
        data: { session },
      } = await getSession();
      setUser(session?.user ?? null);
      setLoading(false);

      const { data: subscription } = onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.subscription.unsubscribe();
    };

    const cleanup = getSessionAndSubscribe();
    return () => {
      cleanup?.then?.((fn) => typeof fn === 'function' && fn());
    };
  }, [setUser, setLoading]);
}
