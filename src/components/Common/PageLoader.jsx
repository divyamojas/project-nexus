// src/components/Common/PageLoader.jsx

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Card, CircularProgress, Typography } from '@mui/material';
import { Spa } from '@mui/icons-material';

const quotes = {
  '/': 'Warming up your bookshelf 🌞',
  '/login': 'Settling your reading nook, just a moment ☕',
  '/signup': 'Every great story starts with a sign-up ✨',
  '/forgot-password': 'Sometimes even passwords need a second chance 🔁',
  '/dashboard': 'Opening your chapter dashboard 📖',
  '/browse': 'Searching your next escape route 🧭',
};

export default function PageLoader() {
  const location = useLocation();
  const message = quotes[location.pathname] || 'One moment... loading 📚';

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
