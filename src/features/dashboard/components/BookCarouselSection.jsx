// src/features/dashboard/components/BookCarouselSection.jsx

import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Box, Typography, Divider, Stack } from '@mui/material';
import RefreshIconButton from '@/commonComponents/RefreshIconButton';
const BookCard = lazy(() => import('@/features/books/components/BookCard'));
import BookCardSkeleton from '@/features/books/components/BookCardSkeleton';

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
  onRefresh,
  refreshSignal,
  loading = false,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };
  // Auto-trigger refresh when parent changes the signal value
  const didMount = useRef(false);
  useEffect(() => {
    if (refreshSignal === undefined) return;
    if (!didMount.current) {
      didMount.current = true;
      return; // avoid double-load on initial render (parent already fetched)
    }
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);
  return (
    <Box
      my={5}
      p={3}
      bgcolor="background.paper"
      borderRadius={3}
      sx={{ border: (t) => `1px solid ${t.palette.divider}`, boxShadow: 1 }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" color="text.primary">
          {emoji} {title}
        </Typography>
        {onRefresh && (
          <RefreshIconButton size="small" onClick={handleRefresh} refreshing={refreshing} />
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Stack direction="row" spacing={2} sx={{ overflowX: 'hidden', pb: 1 }}>
          {[...Array(4)].map((_, i) => (
            <Box key={i} flexShrink={0}>
              <BookCardSkeleton />
            </Box>
          ))}
        </Stack>
      ) : books.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No books available.
        </Typography>
      ) : (
        <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
          {books.map((book) => (
            <Box key={book.id || JSON.stringify(book)} flexShrink={0}>
              <Suspense fallback={<BookCardSkeleton />}>
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
              </Suspense>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
