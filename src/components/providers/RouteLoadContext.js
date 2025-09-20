import { createContext } from 'react';

const RouteLoadContext = createContext({ pending: false, setPending: () => {} });

export default RouteLoadContext;
