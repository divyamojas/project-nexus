// src/features/auth/ForgotPassword.jsx

import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useAuth } from '../../contexts/hooks/useAuth';
import { processResetPassword } from '../../utilities';

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
    processResetPassword({ email, setError, setMessage, setLoading, resetPassword });
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 4 }}>
      <Card sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center" color="primary" fontWeight="bold">
            Forgot Password 🌿
          </Typography>
          <Typography variant="subtitle2" align="center" sx={{ mb: 1, color: 'success.main' }}>
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

            <Button type="submit" variant="contained" disabled={loading} fullWidth>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
            </Button>

            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              <Link
                component={RouterLink}
                to="/login"
                sx={{ color: 'primary.main', fontWeight: 'bold' }}
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
