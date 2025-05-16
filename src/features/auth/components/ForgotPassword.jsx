// src/pages/auth/ForgotPassword.jsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Link,
} from '@mui/material';
import { useAuth } from '@contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function ForgotPassword() {
  const { resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    setLoading(true);
    const { error: resetError } = await resetPassword(email);
    setLoading(false);

    if (resetError) {
      setError('Something went wrong. Please try again.');
    } else {
      setMessage('Reset link sent! Please check your email.');
      setEmail('');
    }
  };

  return (
    <Container maxWidth="xs" style={{ marginTop: '4rem' }}>
      <Card
        style={{
          backgroundColor: '#f0fdf4',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent>
          <Typography variant="h4" gutterBottom align="center" color="primary" fontWeight="bold">
            Forgot Password 🌿
          </Typography>
          <Typography
            variant="subtitle2"
            align="center"
            style={{ marginBottom: '1rem', color: '#66bb6a' }}
          >
            We&apos;ll send you a link to reset it
          </Typography>

          <form
            onSubmit={handleResetPassword}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            <TextField
              label="Work Email"
              type="email"
              variant="outlined"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              style={{ backgroundColor: '#388e3c', fontWeight: 'bold', borderRadius: '8px' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
            </Button>

            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <Typography variant="body2" align="center" style={{ marginTop: '1rem' }}>
              <Link
                component={RouterLink}
                to="/login"
                style={{ color: '#2e7d32', fontWeight: 'bold' }}
              >
                Back to Login
              </Link>
            </Typography>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
