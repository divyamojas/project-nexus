// src/components/dashboard/FeedbackSection.jsx

import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import PropTypes from 'prop-types';

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
            <Grid item xs={12} sm={6} md={4} key={idx}>
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

FeedbackSection.propTypes = {
  feedbacks: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.string,
    }),
  ),
};
