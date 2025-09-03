// src/hooks/useSession.js

import { useEffect, useState } from 'react';
import { getSession, onAuthStateChange } from '../services/authService';

/**
 * Subscribe to Supabase auth session; returns { session, loading }.
 */
export default function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data } = await getSession();
      if (isMounted) {
        setSession(data?.session ?? null);
        setLoading(false);
      }

      const { data: { subscription } = {} } = onAuthStateChange((_event, newSession) => {
        if (isMounted) setSession(newSession);
      });

      return () => subscription?.unsubscribe?.();
    };

    const cleanup = init();

    return () => {
      isMounted = false;
      cleanup?.then?.((fn) => typeof fn === 'function' && fn());
    };
  }, []);

  return { session, loading };
}
