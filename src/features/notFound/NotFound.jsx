// src/features/notFound/NotFound.jsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Fade } from '@mui/material';

import { useSession } from '../../hooks';

export default function NotFound() {
  const navigate = useNavigate();
  const { session } = useSession();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(session ? '/dashboard' : '/login', { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate, session]);

  return (
    <Fade in timeout={500}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        textAlign="center"
        px={2}
      >
        <Typography variant="h3" gutterBottom fontWeight={700}>
          404 - Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Redirecting you {session ? 'to your dashboard' : 'to the login page'} in 2 seconds...
        </Typography>
        <CircularProgress color="primary" size={48} thickness={4} />
      </Box>
    </Fade>
  );
}
