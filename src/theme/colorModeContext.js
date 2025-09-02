import { createContext } from 'react';

export const colorModeContext = createContext({ mode: 'light', toggleColorMode: () => {} });
