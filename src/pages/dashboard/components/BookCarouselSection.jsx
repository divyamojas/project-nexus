// src/components/books/BookCarouselSection.jsx

import { Box, Typography, Divider, Stack } from '@mui/material';
import BookCard from '../../browseBooks/components/BookCard';

export default function BookCarouselSection({
  title,
  emoji = '',
  books,
  onBookClick,
  onDelete,
  onArchive,
  onToggleSave,
  onAccept,
  onReject,
  onCancelRequest,
  onRequestReturn,
  context = '',
  editable = true,
}) {
  // if (context == 'outgoing') console.log(books);
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
                onToggleSave={onToggleSave}
                onAccept={onAccept}
                onReject={onReject}
                onCancelRequest={onCancelRequest}
                onRequestReturn={onRequestReturn}
                context={context}
                editable={editable}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
