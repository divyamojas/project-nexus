// src/pages/auth/Login.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { processLogin } from '../../services/authService';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    processLogin({ email, password, setError, setLoading, login });
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
            Welcome Back 🌿
          </Typography>
          <Typography
            variant="subtitle2"
            align="center"
            style={{ marginBottom: '1rem', color: '#66bb6a' }}
          >
            Sign in to your Leaflet account
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
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              style={{ backgroundColor: '#388e3c', fontWeight: 'bold', borderRadius: '8px' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
            </Button>

            {error && <Alert severity="error">{error}</Alert>}

            <Typography variant="body2" align="center" style={{ marginTop: '1rem' }}>
              Don&apos;t have an account?{' '}
              <Link
                component={RouterLink}
                to="/signup"
                style={{ color: '#2e7d32', fontWeight: 'bold' }}
              >
                Sign up
              </Link>
            </Typography>

            <Typography variant="body2" align="center" style={{ marginTop: '0.5rem' }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                style={{ color: '#4caf50', fontWeight: 'bold' }}
              >
                Forgot your password?
              </Link>
            </Typography>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
