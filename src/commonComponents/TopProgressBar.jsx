// src/commonComponents/TopProgressBar.jsx

import { useEffect, useState } from 'react';
import { LinearProgress, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useRouteLoad } from '@/components/providers/RouteLoadProvider';

/**
 * Lightweight top progress bar shown briefly on navigation.
 * Avoids full-screen loader flashes while signaling responsiveness.
 */
export default function TopProgressBar({ delay = 100 }) {
  const { pending } = useRouteLoad();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    if (pending) timer = setTimeout(() => setVisible(true), delay);
    else setVisible(false);
    return () => clearTimeout(timer);
  }, [pending, delay]);

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.modal + 2,
        backgroundColor: (t) => alpha(t.palette.background.paper, 0.6),
        backdropFilter: 'blur(4px)',
      }}
    >
      <LinearProgress color="secondary" />
    </Box>
  );
}
