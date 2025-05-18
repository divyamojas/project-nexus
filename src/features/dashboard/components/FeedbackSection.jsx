// src/components/dashboard/FeedbackSection.jsx

import { Box, Typography, Grid, Paper } from '@mui/material';

export default function FeedbackSection({ feedbacks = [] }) {
  return (
    <Box mt={6}>
      <Typography variant="h6" sx={{ color: '#4e342e', mb: 2 }}>
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
              <Paper
                sx={{
                  px: 3,
                  py: 2,
                  borderRadius: 3,
                  bgcolor: idx % 2 === 0 ? '#fffde7' : '#f0f4c3',
                }}
              >
                <Typography variant="body2">{fb.content}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
