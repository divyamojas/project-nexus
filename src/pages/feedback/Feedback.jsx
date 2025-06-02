// src/pages/Feedback.jsx

import { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';

import { insertFeedback } from '../../services';
import { useUser } from '../../contexts/UserContext';

export default function Feedback() {
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setEmail(user.email);
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    const success = await insertFeedback({ message, email });
    if (success) {
      setStatus('success');
      setMessage('');
      setTimeout(() => (window.location.href = '/dashboard'), 1200);
    } else {
      setStatus('error');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
      {status === null && (
        <>
          <Typography variant="h4" gutterBottom>
            📝 Got a thought or wish?
          </Typography>
          <Typography
            variant="body2"
            gutterBottom
            sx={{
              fontFamily: 'sans-serif',
              fontWeight: 300,
              color: 'text.secondary',
              fontSize: '0.95rem',
              mb: 3,
            }}
          >
            Tell us anything — a bug, a dream feature, or just a hello! 💌 We’ll link your feedback
            to your profile *just* for development (so we can follow up if needed). Your words are
            safe with us — pinky promise. 🤞
          </Typography>
          <TextField
            label="Type your lovely message here..."
            placeholder="e.g. I wish the book page had a wishlist option 💭"
            multiline
            rows={5}
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ my: 2, borderRadius: 2 }}
          />
          <Button variant="contained" size="large" sx={{ mt: 1 }} onClick={handleSubmit}>
            ✨ Send Feedback
          </Button>
        </>
      )}

      {status === 'success' && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            💖 Thank you!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Your thoughts are like cozy bookmarks — helping us make Leaflet better, one note at a
            time.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.disabled' }}>
            Redirecting to dashboard...
          </Typography>
        </Box>
      )}

      {status === 'error' && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" color="error" gutterBottom>
            😓 Oops! Something broke.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Can you try refreshing the page? We really want to hear from you. 🫶
          </Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
            🔄 Refresh and Try Again
          </Button>
        </Box>
      )}
    </Container>
  );
}
