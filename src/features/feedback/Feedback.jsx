// src/features/feedback/Feedback.jsx

import { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Stack } from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';

import { insertFeedback } from '../../services';
import { useUser } from '../../contexts/hooks/useUser';

export default function Feedback() {
  const { user } = useUser();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    const success = await insertFeedback({ message, user });
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
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <RateReviewIcon color="secondary" />
            <Typography variant="h4" gutterBottom>
              Share feedback
            </Typography>
          </Stack>
          <Typography variant="body2" gutterBottom sx={{ color: 'text.secondary', mb: 3 }}>
            Tell us anything — a bug, a dream feature, or just a short note. We’ll link your
            feedback to your profile for development follow-ups only.
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
          <Button
            variant="contained"
            size="large"
            sx={{ mt: 1 }}
            onClick={handleSubmit}
            startIcon={<RateReviewIcon />}
          >
            Send feedback
          </Button>
        </>
      )}

      {status === 'success' && (
        <Box sx={{ mt: 4 }}>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <CheckCircleOutlineIcon color="success" />
            <Typography variant="h4" gutterBottom>
              Thank you!
            </Typography>
          </Stack>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Your feedback helps make Leaflet better.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.disabled' }}>
            Redirecting to dashboard...
          </Typography>
        </Box>
      )}

      {status === 'error' && (
        <Box sx={{ mt: 4 }}>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <ErrorOutlineIcon color="error" />
            <Typography variant="h5" color="error" gutterBottom>
              Something went wrong
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Please try refreshing the page. We really want to hear from you.
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
            startIcon={<ReplayIcon />}
          >
            Refresh and try again
          </Button>
        </Box>
      )}
    </Container>
  );
}
