// src/commonComponents/RouteSpinner.jsx

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Fade } from '@mui/material';
import { useRouteLoad } from '@/components/providers/useRouteLoad';

/**
 * Shows a centered spinner briefly on route changes. Complements TopProgressBar.
 */
export default function RouteSpinner({ delay = 300 }) {
  const { pending } = useRouteLoad();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    if (pending) {
      timer = setTimeout(() => setVisible(true), delay);
    } else {
      setVisible(false);
    }
    return () => clearTimeout(timer);
  }, [pending, delay]);

  return (
    <Fade in={visible} timeout={250} unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: (t) => t.zIndex.snackbar + 1,
        }}
      >
        <CircularProgress color="secondary" size={36} thickness={4} />
      </Box>
    </Fade>
  );
}
