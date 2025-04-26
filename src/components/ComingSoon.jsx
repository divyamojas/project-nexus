import React, { useState } from 'react';
import { TextField, Button, Typography, Card, CardContent, Container } from '@mui/material';

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    setSubmitted(true);
    setEmail('');
  };

  return (
    <Container maxWidth="sm" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fdf4', padding: '2rem' }}>
      <Typography variant="h2" component="h1" gutterBottom style={{ color: '#2e7d32', fontWeight: 'bold' }}>
        Leaflet
      </Typography>
      <Typography variant="h6" gutterBottom style={{ color: '#388e3c' }}>
        A cozy new way to share and discover the books you love.
      </Typography>
      <Typography variant="body1" paragraph style={{ color: '#4caf50' }}>
        Find the stories that move you. Share the ones that shaped you.
      </Typography>

      {submitted ? (
        <Card style={{ marginTop: '2rem', backgroundColor: '#e8f5e9' }}>
          <CardContent>
            <Typography variant="h5" component="div" style={{ color: '#2e7d32', fontWeight: 'bold' }}>
              You're on the list! 🌱
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We can't wait to welcome you into the Leaflet community soon.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <TextField
            type="email"
            label="Your Email Address"
            variant="outlined"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            style={{ backgroundColor: '#388e3c' }}
          >
            Join the Waitlist
          </Button>
        </form>
      )}

      <Typography variant="caption" display="block" style={{ marginTop: '2rem', color: '#81c784' }}>
        By joining, you agree to receive occasional updates. We respect your inbox.
      </Typography>
    </Container>
  );
}
