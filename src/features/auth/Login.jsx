// src/features/auth/Login.jsx

import { useState } from 'react';
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
import { processLogin } from '../../utilities';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    processLogin({ email, password, setError, setLoading, login });
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <Card sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center" color="primary" fontWeight="bold">
            Welcome back
          </Typography>
          <Typography variant="subtitle2" align="center" sx={{ mb: 1, color: 'success.main' }}>
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

            <Button type="submit" variant="contained" disabled={loading} fullWidth>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
            </Button>

            {error && <Alert severity="error">{error}</Alert>}

            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              Don&apos;t have an account?{' '}
              <Link
                component={RouterLink}
                to="/signup"
                sx={{ color: 'primary.main', fontWeight: 'bold' }}
              >
                Sign up
              </Link>
            </Typography>

            <Typography variant="body2" align="center" sx={{ mt: 0.5 }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                sx={{ color: 'success.main', fontWeight: 'bold' }}
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
