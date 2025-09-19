// src/features/dashboard/components/MyBooksSection.jsx

import React, { useState } from 'react';
import { Box, Typography, Button, Collapse, Chip } from '@mui/material';
import RefreshIconButton from '@/components/common/RefreshIconButton';
import BookCarouselSection from './BookCarouselSection';

export default function MyBooksSection({
  availableBooks = [],
  archivedBooks = [],
  showArchived,
  setShowArchived,
  onAdd,
  onBookClick,
  onDelete,
  onArchive,
  onRefresh,
  loading = false,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const triggerRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" color="text.primary">
          📗 My Books
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {onRefresh && (
            <RefreshIconButton
              onClick={triggerRefresh}
              refreshing={refreshing}
              tooltip="Refresh my books"
            />
          )}
          <Button variant="contained" color="primary" onClick={onAdd} sx={{ borderRadius: 2 }}>
            + Add Book
          </Button>
        </Box>
      </Box>

      <BookCarouselSection
        books={availableBooks}
        onBookClick={onBookClick}
        onDelete={onDelete}
        onArchive={onArchive}
        context="myBooks"
        editable={true}
        onRefresh={triggerRefresh}
        loading={loading}
      />

      <Box mt={2} mb={2}>
        <Chip
          label={showArchived ? '📁 Hide Archived Books' : '📁 Show Archived Books'}
          variant="outlined"
          color="default"
          onClick={() => setShowArchived(!showArchived)}
          sx={{
            fontStyle: 'italic',
            bgcolor: 'background.default',
            '&:hover': { bgcolor: 'action.hover' },
            cursor: 'pointer',
          }}
        />
      </Box>

      <Collapse in={showArchived} timeout="auto" unmountOnExit>
        <BookCarouselSection
          books={archivedBooks}
          onBookClick={onBookClick}
          onDelete={onDelete}
          onArchive={onArchive}
          context="archived"
          editable={true}
          onRefresh={triggerRefresh}
          loading={loading}
        />
      </Collapse>
    </>
  );
}
