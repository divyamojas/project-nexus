// src/features/dashboard/components/FeedbackSection.jsx

import { Box, Typography, Grid, Paper } from '@mui/material';

export default function FeedbackSection({ feedbacks = [] }) {
  return (
    <Box mt={6}>
      <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
        💬 My Feedbacks
      </Typography>
      {feedbacks.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No feedbacks yet.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {feedbacks.map((fb, idx) => (
            <Grid key={idx}>
              <Paper sx={{ px: 3, py: 2, borderRadius: 3, bgcolor: 'background.paper' }}>
                <Typography variant="body2">{fb.content}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
