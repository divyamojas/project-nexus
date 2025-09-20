// src/features/books/components/ReviewsSection.jsx
import { useEffect, useState } from 'react';
import { Avatar, Box, Button, Divider, Rating, Stack, TextField, Typography } from '@mui/material';
import { addBookReview, getBookRatingSummary, getBookReviews } from '@/services';
import { useSnackbar } from '@/components/providers/useSnackbar';
import formatDisplayName from '@/utilities/formatDisplayName';

export default function ReviewsSection({ bookId, ownerId, user }) {
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ count: 0, average: 0 });
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const { showToast } = useSnackbar();
  const isOwner = user?.id && ownerId && user.id === ownerId;
  const hasReviewed = reviews.some((r) => r?.reviewer?.id && user?.id && r.reviewer.id === user.id);

  useEffect(() => {
    const load = async () => {
      const [list, summary] = await Promise.all([
        getBookReviews(bookId),
        getBookRatingSummary(bookId),
      ]);
      setReviews(list);
      setRatingSummary(summary);
    };
    if (bookId) load();
  }, [bookId]);

  const postReview = async () => {
    if (!newRating) return;
    try {
      await addBookReview({ book_id: bookId, rating: newRating, comment: newComment, user });
      const [list, summary] = await Promise.all([
        getBookReviews(bookId),
        getBookRatingSummary(bookId),
      ]);
      setReviews(list);
      setRatingSummary(summary);
      setNewRating(0);
      setNewComment('');
      showToast('Review posted', { severity: 'success' });
    } catch (e) {
      showToast(e?.message || 'Failed to post review', { severity: 'error' });
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Reviews ({ratingSummary.count})
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Rating value={Number(ratingSummary.average) || 0} precision={0.5} readOnly />
        <Typography variant="body2" color="text.secondary">
          {ratingSummary.average ? ratingSummary.average.toFixed(1) : 'No ratings yet'}
        </Typography>
      </Stack>
      <Stack spacing={1} sx={{ maxHeight: 220, overflowY: 'auto', mb: 2 }}>
        {reviews.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No reviews yet.
          </Typography>
        ) : (
          reviews.map((r) => (
            <Box
              key={r.id}
              sx={{ p: 1, border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 2 }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar src={r.reviewer?.avatar_url || ''} sx={{ width: 24, height: 24 }} />
                <Typography variant="body2" fontWeight={600} noWrap>
                  {formatDisplayName(r.reviewer)}
                </Typography>
                <Rating value={r.rating} size="small" readOnly />
                <Typography variant="caption" color="text.secondary">
                  {new Date(r.created_at).toLocaleDateString()}
                </Typography>
              </Stack>
              {r.comment && (
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {r.comment}
                </Typography>
              )}
            </Box>
          ))
        )}
      </Stack>
      {user?.id && !isOwner && !hasReviewed && (
        <Stack direction="row" spacing={1} alignItems="center">
          <Rating value={newRating} onChange={(_, v) => setNewRating(v || 0)} />
          <TextField
            size="small"
            placeholder="Add a comment (optional)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            fullWidth
          />
          <Button variant="contained" size="small" disabled={!newRating} onClick={postReview}>
            Post
          </Button>
        </Stack>
      )}
      {user?.id && (isOwner || hasReviewed) && (
        <Typography variant="body2" color="text.secondary">
          {isOwner ? 'You can’t review your own book.' : 'You have already reviewed this book.'}
        </Typography>
      )}
    </Box>
  );
}
