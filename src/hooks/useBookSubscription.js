// src/hooks/useBookSubscription.js

import { useEffect } from 'react';
import { subscribeToBookChanges, unsubscribeFromBookChanges } from '@/services';

export default function useBookSubscription(onChange) {
  useEffect(() => {
    if (!onChange) return;

    subscribeToBookChanges(onChange);

    return () => {
      unsubscribeFromBookChanges();
    };
  }, [onChange]);
}
