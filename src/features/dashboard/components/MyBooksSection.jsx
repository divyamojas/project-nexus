// src/components/dashboard/MyBooksSection.jsx

import React from 'react';
import { Box, Typography, Button, Collapse, Chip } from '@mui/material';
import BookCarouselSection from '@features/books/components/BookCarouselSection';
import PropTypes from 'prop-types';

export default function MyBooksSection({
  availableBooks = [],
  archivedBooks = [],
  showArchived,
  setShowArchived,
  onAdd,
  onBookClick,
  onDelete,
  onArchive,
}) {
  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ color: '#4e342e' }}>
          📗 Available Books
        </Typography>
        <Button
          variant="contained"
          onClick={onAdd}
          sx={{ bgcolor: '#8d6e63', '&:hover': { bgcolor: '#795548' } }}
        >
          + Add Book
        </Button>
      </Box>

      <BookCarouselSection
        books={availableBooks}
        onBookClick={onBookClick}
        onDelete={onDelete}
        onArchive={onArchive}
      />

      <Box mt={2} mb={2}>
        <Chip
          label={showArchived ? '📁 Hide Archived Books' : '📁 Show Archived Books'}
          variant="outlined"
          color="default"
          onClick={() => setShowArchived(!showArchived)}
          sx={{
            fontStyle: 'italic',
            bgcolor: '#fcf8f4',
            '&:hover': { bgcolor: '#f3ede9' },
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
        />
      </Collapse>
    </>
  );
}

MyBooksSection.propTypes = {
  availableBooks: PropTypes.array.isRequired,
  archivedBooks: PropTypes.array.isRequired,
  showArchived: PropTypes.bool.isRequired,
  setShowArchived: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onBookClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onArchive: PropTypes.func,
};
