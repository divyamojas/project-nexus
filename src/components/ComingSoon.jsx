/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import LeafletLogo from '@assets/images/leaflet-logo-full.png';
import { supabase } from '@services/supabaseClient';

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [emailCount, setEmailCount] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    const fetchEmailCount = async () => {
      const { count, error: countError } = await supabase
        .from('early_access_emails')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error fetching email count:', countError.message);
      } else {
        setEmailCount(count);
      }
    };

    fetchEmailCount();
  }, [submitted]); // refetch count after new submission

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error: insertError } = await supabase
      .from('early_access_emails')
      .insert([{ email }]);

    if (insertError) {
      console.error('Error saving email:', insertError.message);

      if (
        insertError.message.toLowerCase().includes('duplicate') ||
        insertError.message.toLowerCase().includes('unique')
      ) {
        setSubmitted(true);
        setError('');
        setEmail('');
        setShowSuccessToast(true); // ✅ Show toast even for duplicate
      } else {
        setError('Something went wrong. Please try again.');
      }
    } else {
      setSubmitted(true);
      setEmail('');
      setShowSuccessToast(true); // ✅ Show toast on normal success too
    }
  };

  return (
    <Container
      maxWidth="sm"
      style={{
        minHeight: '100vh',
        backgroundColor: '#f0fdf4',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      {/* Animated Logo */}
      <motion.img
        src={LeafletLogo}
        alt="Leaflet Logo"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ width: '180px', marginBottom: '1.5rem' }}
      />

      {/* Main Title */}
      <Typography
        variant="h2"
        component="h1"
        gutterBottom
        style={{ color: '#2e7d32', fontWeight: 'bold', textAlign: 'center' }}
      >
        Leaflet
      </Typography>

      {/* Taglines */}
      <Typography
        variant="h6"
        gutterBottom
        style={{ color: '#388e3c', textAlign: 'center', marginBottom: '0.5rem' }}
      >
        A cozy new way to share and discover the books you love.
      </Typography>
      <Typography
        variant="subtitle1"
        gutterBottom
        style={{ color: '#4caf50', textAlign: 'center' }}
      >
        Find the stories that move you. Share the ones that shaped you.
      </Typography>

      {/* Form Section */}
      <Card
        style={{
          marginTop: '2rem',
          width: '100%',
          backgroundColor: '#ffffffcc',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent>
          {submitted ? (
            <>
              <Typography
                variant="h5"
                component="div"
                style={{
                  color: '#2e7d32',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '1rem',
                }}
              >
                You&apos;re on the list! 🌱
              </Typography>
              <Typography variant="body2" color="text.secondary" style={{ textAlign: 'center' }}>
                We can&apos;t wait to welcome you into the Leaflet community soon.
              </Typography>
            </>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
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
                fullWidth
                sx={{
                  backgroundColor: '#388e3c',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#2e7d32', // darker on hover
                  },
                }}
              >
                Join the Waitlist
              </Button>
            </form>
          )}

          {error && (
            <Typography
              variant="body2"
              style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}
            >
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Early Readers Counter */}
      {emailCount > 0 && (
        <Chip
          label={`🌱 ${emailCount} early readers already signed up!`}
          style={{
            backgroundColor: '#d0f0c0',
            color: '#2e7d32',
            fontWeight: 'bold',
            marginTop: '2rem',
          }}
        />
      )}

      {/* Footer */}
      <Typography
        variant="caption"
        display="block"
        style={{ marginTop: '2rem', color: '#81c784', textAlign: 'center' }}
      >
        By joining, you agree to receive occasional updates. We respect your inbox.
      </Typography>
      <Typography
        variant="caption"
        display="block"
        style={{ marginTop: '1rem', color: '#a5d6a7', textAlign: 'center' }}
      >
        © 2025 Leaflet. Made with ❤️ for book lovers.
      </Typography>
      <Snackbar
        open={showSuccessToast}
        autoHideDuration={4000}
        onClose={() => setShowSuccessToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccessToast(false)}
          sx={{
            width: '100%',
            backgroundColor: '#f0fff4', // ✅ Light greenish-white background
            color: '#2e7d32', // ✅ Dark green text for brand feel
            fontWeight: 'bold',
            fontSize: '1rem',
            border: '2px solid #2e7d32', // ✅ Green border
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)', // ✅ Soft 3D shadow
            borderRadius: '12px', // ✅ Slightly rounded corners
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1rem',
          }}
          elevation={6}
          variant="filled"
        >
          🌱 Thanks for joining Leaflet!
        </Alert>
      </Snackbar>
    </Container>
  );
}
