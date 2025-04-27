// src/pages/auth/Login.jsx

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
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '@contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    const { error: loginError } = await login(email, password);
    setLoading(false);

    if (loginError) {
      if (loginError.message.includes('Invalid login credentials')) {
        setError('Incorrect email or password.');
      } else if (loginError.message.includes('User not found')) {
        setError('Account does not exist.');
      } else {
        setError(loginError.message || 'Something went wrong. Please try again.');
      }
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
