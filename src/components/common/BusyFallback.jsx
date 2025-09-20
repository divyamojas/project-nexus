// src/commonComponents/BusyFallback.jsx

import { useEffect, useState } from 'react';
import { Box, CircularProgress, Fade } from '@mui/material';
import { useRouteLoad } from '@/components/providers/useRouteLoad';

/**
 * Suspense fallback that sets global route-load pending while it renders.
 * Delays visual spinner to prevent flicker on fast loads.
 */
export default function BusyFallback({ delay = 400 }) {
  const { setPending } = useRouteLoad();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setPending(true);
    const t = setTimeout(() => setShow(true), delay);
    return () => {
      clearTimeout(t);
      setPending(false);
    };
  }, [delay, setPending]);

  return (
    <Fade in={show} timeout={200} unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: (t) => t.zIndex.snackbar + 1,
          pointerEvents: 'none',
        }}
      >
        <CircularProgress color="secondary" size={36} thickness={4} />
      </Box>
    </Fade>
  );
}
