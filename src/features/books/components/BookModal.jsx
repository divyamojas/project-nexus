// src/features/books/components/BookModal.jsx

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Stack,
  Box,
  Tooltip,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Inventory2Outlined as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  CloseOutlined as DeleteIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Replay as ReplayIcon,
  CancelOutlined as CancelIcon,
  CheckCircleOutline as CheckIcon,
  HighlightOff as ClearIcon,
} from '@mui/icons-material';

import { useBookContext } from '../../../contexts/hooks/useBookContext';
import { useAuth } from '../../../contexts/hooks/useAuth';
import {
  requestBookReturn,
  toggleSaveBook,
  updateRequestStatus,
  completeTransfer,
} from '../../../services';
import { approveReturnRequest } from '../../../services/returnRequestService';
import ReviewsSection from './ReviewsSection';
import { logError } from '@/utilities/logger';

export default function BookModal({
  open,
  onClose,
  book,
  context = '',
  onActionComplete = () => {},
}) {
  const [isSavedState, setIsSavedState] = useState(false);
  const { handleDeleteBook, handleArchiveBook, sendBookRequest } = useBookContext();
  const { user } = useAuth();

  useEffect(() => {
    if (book) {
      setIsSavedState(book?.is_saved ?? false);
    }
  }, [book]);

  // Reviews loaded via ReviewsSection

  if (!book) return null;
  const { catalog = {} } = book;
  const { title, author, cover_url } = catalog;

  const handleToggleSave = async () => {
    try {
      const shouldSave = !isSavedState;
      setIsSavedState(shouldSave);
      await toggleSaveBook(book.id, shouldSave, catalog.id, user);
      onActionComplete();
      onClose();
    } catch (e) {
      logError('BookModal.handleToggleSave failed', e, { bookId: book?.id });
    }
  };

  const handleRequestReturn = async () => {
    try {
      await requestBookReturn(book.id, user);
      onActionComplete();
      onClose();
    } catch (e) {
      logError('BookModal.handleRequestReturn failed', e, { bookId: book?.id });
    }
  };

  const handleApproveReturn = async () => {
    try {
      if (!book?.return_request_id) return;
      await approveReturnRequest(book.return_request_id);
      onActionComplete();
      onClose();
    } catch (e) {
      logError('BookModal.handleApproveReturn failed', e, {
        returnRequestId: book?.return_request_id,
      });
    }
  };

  const handleAcceptRequest = async () => {
    try {
      await updateRequestStatus(book.request_id, 'accepted');
      onActionComplete();
      onClose();
    } catch (e) {
      logError('BookModal.handleAcceptRequest failed', e, { requestId: book?.request_id });
    }
  };

  const handleRejectRequest = async () => {
    try {
      await updateRequestStatus(book.request_id, 'rejected');
      onActionComplete();
      onClose();
    } catch (e) {
      logError('BookModal.handleRejectRequest failed', e, { requestId: book?.request_id });
    }
  };

  const handleCancelRequest = async () => {
    try {
      await updateRequestStatus(book.request_id, 'cancelled');
      onActionComplete();
      onClose();
    } catch (e) {
      logError('BookModal.handleCancelRequest failed', e, { requestId: book?.request_id });
    }
  };

  const handleCompleteTransfer = async () => {
    try {
      if (!book?.transfer_id) return;
      await completeTransfer({ transfer_id: book.transfer_id });
      onActionComplete();
      onClose();
    } catch (e) {
      logError('BookModal.handleCompleteTransfer failed', e, { transferId: book?.transfer_id });
    }
  };

  const handleDelete = () => {
    try {
      handleDeleteBook(book);
      onActionComplete();
      onClose();
    } catch (e) {
      logError('BookModal.handleDelete failed', e, { bookId: book?.id });
    }
  };
  const handleArchive = () => {
    try {
      handleArchiveBook(book);
      onActionComplete();
      if (book.archived) {
        onActionComplete();
      }
      onClose();
    } catch (e) {
      logError('BookModal.handleArchive failed', e, { bookId: book?.id });
    }
  };

  const renderActions = () => {
    if (!book) return null;

    switch (context) {
      case 'saved':
      case 'browse':
        return (
          <Tooltip title={isSavedState ? 'Unsave' : 'Save'}>
            <IconButton onClick={handleToggleSave}>
              {isSavedState ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>
        );
      case 'myBooks':
      case 'archived':
        return (
          <>
            <Tooltip title={book.archived ? 'Unarchive' : 'Archive'}>
              <IconButton onClick={handleArchive}>
                {book.archived ? <UnarchiveIcon /> : <ArchiveIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={handleDelete}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        );
      case 'lentBorrowed':
        return (
          <Tooltip title="Request Book Return">
            <IconButton onClick={handleRequestReturn}>
              <ReplayIcon />
            </IconButton>
          </Tooltip>
        );
      case 'lentOwned':
        return (
          <Tooltip title="Approve Return">
            <IconButton onClick={handleApproveReturn} disabled={!book?.return_request_id}>
              <CheckIcon />
            </IconButton>
          </Tooltip>
        );
      case 'incoming':
        return (
          <>
            <Tooltip title="Accept Request">
              <IconButton onClick={handleAcceptRequest}>
                <CheckIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject Request">
              <IconButton onClick={handleRejectRequest}>
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </>
        );
      case 'outgoing':
        return (
          <Tooltip title="Cancel Request">
            <IconButton onClick={handleCancelRequest}>
              <CancelIcon />
            </IconButton>
          </Tooltip>
        );
      case 'transfers':
        return (
          <Tooltip title="Complete Transfer">
            <IconButton onClick={handleCompleteTransfer}>
              <CheckIcon />
            </IconButton>
          </Tooltip>
        );
      default:
        return null;
    }
  };

  const isRequestPending = book.request_status === 'pending' && book.requested_by === user?.id;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: { borderRadius: 4, bgcolor: 'background.paper' } } }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }} color="text.primary">
        {title || 'Untitled'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={2} alignItems="center">
          {cover_url && (
            <Box
              component="img"
              src={cover_url}
              alt={title}
              sx={{
                width: '60%',
                maxHeight: 300,
                objectFit: 'cover',
                borderRadius: 3,
                boxShadow: 2,
              }}
            />
          )}
          <Typography variant="subtitle1" fontWeight={500} color="text.secondary">
            {author || 'Unknown Author'}
          </Typography>
          <Divider sx={{ width: '100%' }} />
          <Stack direction="row" spacing={2}>
            <Chip label={`Status: ${book.status}`} variant="outlined" color="primary" />
            <Chip label={`Condition: ${book.condition}`} variant="outlined" color="secondary" />
          </Stack>
          <ReviewsSection bookId={book.id} ownerId={book.user_id} user={user} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Choose an action:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {book.status === 'available' &&
            user?.id &&
            book.user_id !== user.id &&
            (isRequestPending ? (
              <Button variant="outlined" size="small" onClick={handleCancelRequest}>
                Withdraw Request
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  sendBookRequest(book);
                  onClose();
                }}
              >
                Request Book
              </Button>
            ))}
          {renderActions()}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
