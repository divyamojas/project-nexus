// src/commonComponents/TopProgressBar.jsx

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { LinearProgress, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Lightweight top progress bar shown briefly on navigation.
 * Avoids full-screen loader flashes while signaling responsiveness.
 */
export default function TopProgressBar({ delay = 100, duration = 450 }) {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let showTimer = null;
    let hideTimer = null;

    showTimer = setTimeout(() => setVisible(true), delay);
    hideTimer = setTimeout(() => setVisible(false), delay + duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [location.key, delay, duration]);

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
