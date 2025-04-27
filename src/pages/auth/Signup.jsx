// src/pages/auth/Signup.jsx

import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '@contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      navigate('/dashboard'); // Redirect to dashboard after signup
    }
  };

  return (
    <Container maxWidth="xs" style={{ marginTop: '4rem' }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Create Your Account
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
          color="primary"
          disabled={loading}
          fullWidth
          style={{ fontWeight: 'bold', backgroundColor: '#388e3c' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
        </Button>

        {error && <Alert severity="error">{error}</Alert>}
      </form>
    </Container>
  );
}
