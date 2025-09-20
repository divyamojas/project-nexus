// src/components/providers/RouteLoadProvider.jsx

import React, { useMemo, useState } from 'react';
import RouteLoadContext from './RouteLoadContext';

export function RouteLoadProvider({ children }) {
  const [pending, setPending] = useState(false);
  const value = useMemo(() => ({ pending, setPending }), [pending]);
  return <RouteLoadContext.Provider value={value}>{children}</RouteLoadContext.Provider>;
}
