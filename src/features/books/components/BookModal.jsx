// ./src/components/BookModal.jsx

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

import {
  toggleSaveBook,
  requestBookReturn,
  updateRequestStatus,
} from '../../../services/bookService';
import { useBookContext } from '../../../contexts/BookContext';

export default function BookModal({
  open,
  onClose,
  book,
  context = '',
  onActionComplete = () => {},
}) {
  const [isSavedState, setIsSavedState] = useState(false);
  const { handleDeleteBook, handleArchiveBook } = useBookContext();

  useEffect(() => {
    if (book) {
      setIsSavedState(book?.is_saved ?? false);
    }
  }, [book]);

  if (!book) return null;
  const { catalog = {} } = book;
  const { title, author, cover_url } = catalog;

  const handleToggleSave = async () => {
    const shouldSave = !isSavedState;
    setIsSavedState(shouldSave);
    await toggleSaveBook(book.id, shouldSave, catalog.id);
    onActionComplete();
    onClose();
  };

  const handleRequestReturn = async () => {
    await requestBookReturn(book.id);
    onActionComplete();
    onClose();
  };

  const handleAcceptRequest = async () => {
    await updateRequestStatus(book.request_id, 'accepted');
    onActionComplete();
    onClose();
  };

  const handleRejectRequest = async () => {
    await updateRequestStatus(book.request_id, 'rejected');
    onActionComplete();
    onClose();
  };

  const handleCancelRequest = async () => {
    await updateRequestStatus(book.request_id, 'cancelled');
    onActionComplete();
    onClose();
  };

  const handleDelete = () => {
    handleDeleteBook(book);
    onActionComplete();
    onClose();
  };
  const handleArchive = () => {
    handleArchiveBook(book);
    onActionComplete();
    if (book.archived) {
      // unarchiving case
      onActionComplete();
    }
    onClose();
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
      case 'lent':
        return (
          <Tooltip title="Request Book Return">
            <IconButton onClick={handleRequestReturn}>
              <ReplayIcon />
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
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4, bgcolor: '#fffdf9' } }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem', color: '#4e342e' }}>
        {title || 'Untitled'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12, color: '#4e342e' }}
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
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          Choose an action:
        </Typography>
        <Box>{renderActions()}</Box>
      </DialogActions>
    </Dialog>
  );
}
