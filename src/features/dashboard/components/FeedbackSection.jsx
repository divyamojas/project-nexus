// src/features/dashboard/components/FeedbackSection.jsx

import { Box, Typography, Grid, Paper, Stack } from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';

export default function FeedbackSection({ feedbacks = [] }) {
  return (
    <Box mt={6}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <RateReviewIcon color="secondary" fontSize="small" />
        <Typography variant="h6" color="text.primary">
          My Feedback
        </Typography>
      </Stack>
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
