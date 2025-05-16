// src/components/books/BookCarouselSection.jsx

import React from 'react';
import { Box, Typography, Divider, Stack } from '@mui/material';
import PropTypes from 'prop-types';
import BookCard from './BookCard';

export default function BookCarouselSection({
  title,
  emoji = '',
  books,
  onBookClick,
  onDelete,
  onArchive,
}) {
  return (
    <Box my={5} p={3} bgcolor="#fefefe" borderRadius={3}>
      <Typography variant="h6" sx={{ mb: 2, color: '#4e342e' }}>
        {emoji} {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {books.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No books available.
        </Typography>
      ) : (
        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
          {books.map((book, index) => (
            <Box key={index} flexShrink={0}>
              <BookCard
                book={book}
                onClick={() => onBookClick(book)}
                onDelete={onDelete}
                onArchive={onArchive}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

BookCarouselSection.propTypes = {
  title: PropTypes.string.isRequired,
  emoji: PropTypes.string,
  books: PropTypes.array.isRequired,
  onBookClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onArchive: PropTypes.func,
};
