// src/components/providers/SnackbarProvider.jsx
import { useCallback, useMemo, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import SnackbarContext from './SnackbarContext';

export function SnackbarProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState({ message: '', severity: 'info', duration: 2500 });

  const showToast = useCallback((message, { severity = 'info', duration = 2500 } = {}) => {
    setOpts({ message, severity, duration });
    setOpen(true);
  }, []);

  const handleClose = () => setOpen(false);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={opts.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={opts.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {opts.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
