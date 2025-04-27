// src/pages/auth/Signup.jsx

import React, { useState } from 'react';
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

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error: signupError } = await signup(email, password);
    setLoading(false);

    if (signupError) {
      setError(signupError.message);
    } else {
      navigate('/dashboard');
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
            Join Leaflet 🌿
          </Typography>
          <Typography
            variant="subtitle2"
            align="center"
            style={{ marginBottom: '1rem', color: '#66bb6a' }}
          >
            Create your cozy book sharing account
          </Typography>

          <form
            onSubmit={handleSubmit}
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
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Confirm Password"
              type="password"
              variant="outlined"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              style={{ backgroundColor: '#388e3c', fontWeight: 'bold', borderRadius: '8px' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>

            {error && <Alert severity="error">{error}</Alert>}

            <Typography variant="body2" align="center" style={{ marginTop: '1rem' }}>
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                style={{ color: '#2e7d32', fontWeight: 'bold' }}
              >
                Log in
              </Link>
            </Typography>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
