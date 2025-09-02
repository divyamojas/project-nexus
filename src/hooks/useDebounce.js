// src/hooks/useDebounce.js

import { useState, useEffect } from 'react';

/**
 * Return a debounced value after the specified delay.
 * Useful for search inputs and expensive computations.
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
