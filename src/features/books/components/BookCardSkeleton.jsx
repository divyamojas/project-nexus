// src/features/books/components/BookCardSkeleton.jsx

import React from 'react';
import { Box, Skeleton, Card } from '@mui/material';

export default function BookCardSkeleton({ width = 240, height = 360 }) {
  return (
    <Card
      elevation={0}
      sx={{
        width,
        height,
        borderRadius: 4,
        border: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 0 }}>
        <Skeleton variant="rectangular" width={width} height={height * 0.55} animation="wave" />
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" width="80%" height={24} animation="wave" />
          <Skeleton variant="text" width="60%" height={18} animation="wave" />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Skeleton variant="rectangular" width={60} height={22} animation="wave" />
            <Skeleton variant="rectangular" width={80} height={22} animation="wave" />
          </Box>
        </Box>
        <Box sx={{ px: 2, pb: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={32} animation="wave" />
        </Box>
      </Box>
    </Card>
  );
}
