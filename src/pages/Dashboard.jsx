// src/pages/Dashboard.jsx

import React from 'react';
import { Container, Typography, Button, Card, CardContent } from '@mui/material';
import { useAuth } from '@contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '4rem' }}>
      <Card
        style={{
          backgroundColor: '#f0fdf4',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <Typography variant="h4" gutterBottom color="primary" align="center">
            Welcome to Leaflet! 🌿
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" align="center">
            Signed in as: {user?.email}
          </Typography>

          <Button
            onClick={handleLogout}
            variant="contained"
            style={{ marginTop: '2rem', fontWeight: 'bold', backgroundColor: '#388e3c' }}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
