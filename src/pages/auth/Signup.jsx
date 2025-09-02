// src/pages/auth/Signup.jsx

import { useEffect, useState } from 'react';
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
import { useAuth } from '../../contexts/hooks/useAuth';
import { processSignup } from '../../utilities';

export default function Signup() {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    processSignup({
      email,
      password,
      confirmPassword,
      setError,
      setLoading,
      navigate,
      signup,
    });
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
            <TextField
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
