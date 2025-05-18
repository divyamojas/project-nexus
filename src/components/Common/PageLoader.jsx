// src/components/Common/PageLoader.jsx

import { useLocation } from 'react-router-dom';
import { Container, Card, CircularProgress, Typography } from '@mui/material';
import { Spa } from '@mui/icons-material';

import { QUOTES } from '../../constants/constants';

export default function PageLoader() {
  const location = useLocation();
  const message = QUOTES[location.pathname] || 'One moment... loading 📚';

  return (
    <Container maxWidth="xs" style={{ marginTop: '4rem' }}>
      <Card
        style={{
          backgroundColor: '#f0fdf4',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <Spa style={{ fontSize: 40, color: '#66bb6a' }} />
        <Typography variant="subtitle1" style={{ color: '#66bb6a' }}>
          {message}
        </Typography>
        <CircularProgress color="success" />
      </Card>
    </Container>
  );
}
