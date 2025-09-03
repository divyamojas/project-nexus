// src/components/books/BookCarouselSection.jsx

import { Box, Typography, Divider, Stack } from '@mui/material';
import BookCard from '@/features/books/components/BookCard';

export default function BookCarouselSection({
  title,
  emoji = '',
  books = [],
  onBookClick,
  onDelete,
  onArchive,
  onToggleSave,
  onAccept,
  onReject,
  onCancelRequest,
  onRequestReturn,
  onCompleteTransfer,
  context = '',
  editable = true,
}) {
  return (
    <Box
      my={5}
      p={3}
      bgcolor="background.paper"
      borderRadius={3}
      sx={{ border: (t) => `1px solid ${t.palette.divider}`, boxShadow: 1 }}
    >
      <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
        {emoji} {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {books.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No books available.
        </Typography>
      ) : (
        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
          {books.map((book) => (
            <Box key={book.id || JSON.stringify(book)} flexShrink={0}>
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
                onCompleteTransfer={onCompleteTransfer}
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
