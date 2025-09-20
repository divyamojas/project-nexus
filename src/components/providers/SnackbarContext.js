import { createContext } from 'react';

const SnackbarContext = createContext({ showToast: () => {} });

export default SnackbarContext;
