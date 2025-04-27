// src/pages/auth/Login.jsx

import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '@contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setLoading(true);
    const { error: loginError } = await login(email, password);
    setLoading(false);

    if (loginError) {
      if (loginError.message.includes('Invalid login credentials')) {
        setError('Incorrect email or password.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } else {
      navigate('/dashboard'); // Redirect after successful login
    }
  };

  return (
    <Container maxWidth="xs" style={{ marginTop: '4rem' }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Welcome Back
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

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
          style={{ fontWeight: 'bold', backgroundColor: '#388e3c' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
        </Button>

        {error && <Alert severity="error">{error}</Alert>}
      </form>
    </Container>
  );
}
