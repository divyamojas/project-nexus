// src/commonComponents/PageLoader.jsx

import { useLocation } from 'react-router-dom';
import { Container, Card, CircularProgress, Typography } from '@mui/material';
import { Spa } from '@mui/icons-material';

import { QUOTES } from '@/constants/constants';

export default function PageLoader() {
  const location = useLocation();
  const message = QUOTES[location.pathname] || 'One moment... loading 📚';

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <Card
        sx={{
          bgcolor: 'background.paper',
          p: 3,
          borderRadius: 2,
          boxShadow: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Spa sx={{ fontSize: 40, color: 'success.main' }} />
        <Typography variant="subtitle1" sx={{ color: 'success.main' }}>
          {message}
        </Typography>
        <CircularProgress color="success" />
      </Card>
    </Container>
  );
}
