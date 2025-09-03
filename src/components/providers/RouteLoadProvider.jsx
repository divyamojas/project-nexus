// src/components/providers/RouteLoadProvider.jsx

import React, { createContext, useContext, useMemo, useState } from 'react';

const RouteLoadContext = createContext({ pending: false, setPending: () => {} });

export function RouteLoadProvider({ children }) {
  const [pending, setPending] = useState(false);
  const value = useMemo(() => ({ pending, setPending }), [pending]);
  return <RouteLoadContext.Provider value={value}>{children}</RouteLoadContext.Provider>;
}

export function useRouteLoad() {
  return useContext(RouteLoadContext);
}
