// /src/hooks/useSession.js

import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabaseClient';

export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // eslint-disable-next-line no-unused-vars
    supabase.auth.getSession().then(({ data, error }) => {
      if (isMounted) {
        setSession(data?.session || null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        setSession(newSession);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
