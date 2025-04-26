import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import LeafletLogo from '@assets/images/leaflet-logo-full.png'; // ✅ Logo import
import { supabase } from '@services/supabaseClient'; // ✅ Assuming you set this up

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase
      .from('early_access_emails')
      .insert([{ email }]);

    if (error) {
      console.error('Error saving email:', error.message);
      setError('Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <Container 
      maxWidth="sm" 
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}
    >

      {/* Motion Fade-in for Logo */}
      <motion.img
        src={LeafletLogo}
        alt="Leaflet Logo"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ width: '180px', marginBottom: '1.5rem' }}
      />

      <Typography variant="h2" component="h1" gutterBottom style={{ fontWeight: 'bold' }}>
        Leaflet
      </Typography>
      <Typography variant="h6" gutterBottom>
        A cozy new way to share and discover the books you love.
      </Typography>

      {submitted ? (
        <Card style={{ marginTop: '2rem', backgroundColor: '#e8f5e9' }}>
          <CardContent>
            <Typography variant="h5" component="div" style={{ color: '#2e7d32', fontWeight: 'bold' }}>
              You're on the list! 🌿
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We can't wait to welcome you into the Leaflet community soon.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <form 
          onSubmit={handleSubmit} 
          style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}
        >
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
            fullWidth
          >
            Join the Waitlist
          </Button>
        </form>
      )}

      {error && (
        <Typography variant="body2" style={{ color: 'red', marginTop: '1rem' }}>
          {error}
        </Typography>
      )}

      <Typography variant="caption" display="block" style={{ marginTop: '2rem', color: '#81c784' }}>
        By joining, you agree to receive occasional updates. We respect your inbox.
      </Typography>
    </Container>
  );
}
