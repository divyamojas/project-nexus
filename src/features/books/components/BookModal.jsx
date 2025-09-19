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
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Inventory2Outlined as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Delete as DeleteIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Replay as ReplayIcon,
  CancelOutlined as CancelIcon,
  CheckCircleOutline as CheckIcon,
  HighlightOff as ClearIcon,
  MenuBookRounded as BookIcon,
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
import {
  modalPaperMotion,
  getModalPaperSx,
  getModalTitleSx,
  getModalContentSx,
  getModalActionsSx,
} from '@/theme/modalStyles';

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

  const getSoftAccentColor = (t) =>
    t.palette.mode === 'dark' ? t.palette.primary.light : t.palette.primary.main;

  const getSoftIconButtonSx = (t) => {
    const accent = getSoftAccentColor(t);
    return {
      borderRadius: 14,
      backgroundColor: alpha(accent, t.palette.mode === 'dark' ? 0.22 : 0.18),
      color: t.palette.mode === 'dark' ? accent : t.palette.primary.dark,
      border: `1px solid ${alpha(accent, 0.35)}`,
      boxShadow: `0 6px 18px ${alpha(accent, 0.18)}`,
      transition: 'all 0.18s ease',
      '&:hover': {
        backgroundColor: alpha(accent, t.palette.mode === 'dark' ? 0.28 : 0.24),
        boxShadow: `0 10px 26px ${alpha(accent, 0.22)}`,
      },
      '&:active': {
        transform: 'scale(0.97)',
      },
      '&.Mui-disabled': {
        color: alpha(accent, 0.35),
        backgroundColor: alpha(accent, 0.1),
        borderColor: alpha(accent, 0.14),
        boxShadow: 'none',
      },
    };
  };

  const softPrimaryButtonSx = (t) => {
    const accent = getSoftAccentColor(t);
    return {
      borderRadius: 999,
      paddingInline: 2.6,
      fontWeight: 600,
      backgroundColor: alpha(accent, t.palette.mode === 'dark' ? 0.35 : 0.25),
      color:
        t.palette.mode === 'dark'
          ? t.palette.grey[50]
          : t.palette.primary[900] || t.palette.getContrastText(accent),
      boxShadow: `0 8px 18px ${alpha(accent, 0.18)}`,
      border: `1px solid ${alpha(accent, 0.32)}`,
      '&:hover': {
        backgroundColor: alpha(accent, t.palette.mode === 'dark' ? 0.42 : 0.32),
        boxShadow: `0 10px 24px ${alpha(accent, 0.24)}`,
      },
      '&:active': {
        backgroundColor: alpha(accent, t.palette.mode === 'dark' ? 0.48 : 0.36),
      },
    };
  };

  const softOutlineButtonSx = (t) => ({
    borderRadius: 999,
    paddingInline: 2.2,
    fontWeight: 600,
    borderColor: alpha(getSoftAccentColor(t), 0.32),
    color: t.palette.mode === 'dark' ? getSoftAccentColor(t) : t.palette.primary.dark,
    '&:hover': {
      borderColor: alpha(getSoftAccentColor(t), 0.5),
      backgroundColor: alpha(getSoftAccentColor(t), t.palette.mode === 'dark' ? 0.24 : 0.16),
    },
  });

  const softChipSx = (colorKey) => (t) => ({
    backgroundColor: alpha(t.palette[colorKey].main, t.palette.mode === 'dark' ? 0.22 : 0.16),
    borderRadius: 12,
    borderColor: alpha(t.palette[colorKey].main, 0.2),
    color: t.palette.mode === 'dark' ? t.palette[colorKey].light : t.palette[colorKey].dark,
    fontWeight: 500,
    '& .MuiChip-label': {
      px: 1.2,
    },
  });

  const coverFrameSx = (hasCover) => (t) => ({
    width: { xs: 160, sm: 200 },
    height: { xs: 220, sm: 260 },
    borderRadius: 3,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(t.palette.background.paper, t.palette.mode === 'dark' ? 0.82 : 0.92),
    border: hasCover
      ? `1px solid ${alpha(t.palette.divider, 0.2)}`
      : `1px dashed ${alpha(t.palette.divider, 0.4)}`,
    boxShadow: hasCover ? 4 : 'none',
    color: hasCover ? 'inherit' : alpha(getSoftAccentColor(t), 0.6),
  });

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
            <IconButton
              component={motion.button}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              size="small"
              onClick={handleToggleSave}
              sx={getSoftIconButtonSx}
            >
              {isSavedState ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>
        );
      case 'myBooks':
      case 'archived':
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title={book.archived ? 'Unarchive' : 'Archive'}>
              <IconButton
                component={motion.button}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                size="small"
                onClick={handleArchive}
                sx={getSoftIconButtonSx}
              >
                {book.archived ? <UnarchiveIcon /> : <ArchiveIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                component={motion.button}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                size="small"
                onClick={handleDelete}
                sx={getSoftIconButtonSx}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      case 'lentBorrowed':
        return (
          <Tooltip title="Request Book Return">
            <IconButton
              component={motion.button}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              size="small"
              onClick={handleRequestReturn}
              sx={getSoftIconButtonSx}
            >
              <ReplayIcon />
            </IconButton>
          </Tooltip>
        );
      case 'lentOwned':
        return (
          <Tooltip title="Approve Return">
            <IconButton
              component={motion.button}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              size="small"
              onClick={handleApproveReturn}
              disabled={!book?.return_request_id}
              sx={getSoftIconButtonSx}
            >
              <CheckIcon />
            </IconButton>
          </Tooltip>
        );
      case 'incoming':
        return (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Accept Request">
              <IconButton
                component={motion.button}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                size="small"
                onClick={handleAcceptRequest}
                sx={getSoftIconButtonSx}
              >
                <CheckIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject Request">
              <IconButton
                component={motion.button}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                size="small"
                onClick={handleRejectRequest}
                sx={getSoftIconButtonSx}
              >
                <ClearIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        );
      case 'outgoing':
        return (
          <Tooltip title="Cancel Request">
            <IconButton
              component={motion.button}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              size="small"
              onClick={handleCancelRequest}
              sx={getSoftIconButtonSx}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>
        );
      case 'transfers':
        return (
          <Tooltip title="Complete Transfer">
            <IconButton
              component={motion.button}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              size="small"
              onClick={handleCompleteTransfer}
              sx={getSoftIconButtonSx}
            >
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
      slots={{ paper: motion.div }}
      slotProps={{
        paper: {
          ...modalPaperMotion,
          sx: (t) => ({
            ...getModalPaperSx(t),
            borderRadius: 18,
            boxShadow: `0 18px 44px ${alpha(t.palette.common.black, 0.18)}`,
            border: `1px solid ${alpha(t.palette.divider, 0.4)}`,
          }),
        },
      }}
    >
      <DialogTitle
        sx={(t) => ({
          ...getModalTitleSx(t),
          borderBottom: `1px solid ${alpha(t.palette.divider, 0.4)}`,
          pb: 2,
          gap: 0.5,
        })}
        color="text.primary"
      >
        {title || 'Untitled'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(t) => ({
            position: 'absolute',
            right: 16,
            top: 16,
            ...getSoftIconButtonSx(t),
            width: 36,
            height: 36,
          })}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
          {author || 'Unknown Author'}
        </Typography>
      </DialogTitle>

      <DialogContent
        dividers
        sx={(t) => ({
          ...getModalContentSx(t),
          p: 0,
          backgroundColor: alpha(
            t.palette.background.paper,
            t.palette.mode === 'dark' ? 0.92 : 0.98,
          ),
        })}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="stretch" spacing={0}>
          <Box
            sx={(t) => ({
              width: { xs: '100%', sm: 240 },
              borderRight: { sm: `1px solid ${alpha(t.palette.divider, 0.2)}` },
              p: { xs: 2.5, sm: 3 },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: alpha(
                t.palette.background.paper,
                t.palette.mode === 'dark' ? 0.88 : 0.94,
              ),
            })}
          >
            <Stack alignItems="center" spacing={1.5} sx={{ textAlign: 'center' }}>
              <Box sx={coverFrameSx(Boolean(cover_url))}>
                {cover_url ? (
                  <Box
                    component="img"
                    src={cover_url}
                    alt={title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <BookIcon fontSize="large" />
                )}
              </Box>
              <Typography variant={cover_url ? 'caption' : 'body2'} color="text.secondary">
                {cover_url ? 'Book cover' : 'No cover provided'}
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={(t) => ({
              flex: 1,
              p: { xs: 2.5, sm: 3.5 },
              backgroundColor: alpha(
                t.palette.background.paper,
                t.palette.mode === 'dark' ? 0.96 : 1,
              ),
            })}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Details
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  sx={{ mt: 1, gap: 1 }}
                >
                  <Chip
                    size="small"
                    label={`Status: ${book.status}`}
                    color="primary"
                    variant="outlined"
                    sx={softChipSx('primary')}
                  />
                  <Chip
                    size="small"
                    label={`Condition: ${book.condition}`}
                    color="secondary"
                    variant="outlined"
                    sx={softChipSx('secondary')}
                  />
                  {isRequestPending && (
                    <Chip
                      size="small"
                      label="Borrow request pending"
                      color="warning"
                      variant="filled"
                      sx={softChipSx('warning')}
                    />
                  )}
                </Stack>
              </Box>

              <Divider sx={(t) => ({ borderColor: alpha(t.palette.divider, 0.24) })} />

              <Box>
                <Typography variant="overline" color="text.secondary">
                  Reviews
                </Typography>
                <ReviewsSection bookId={book.id} ownerId={book.user_id} user={user} />
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={(t) => ({
          ...getModalActionsSx(t),
          borderTop: `1px solid ${alpha(t.palette.divider, 0.4)}`,
          boxShadow: 'none',
          py: 2.25,
          px: { xs: 2, sm: 3 },
        })}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Actions
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {book.status === 'available' &&
            user?.id &&
            book.user_id !== user.id &&
            (isRequestPending ? (
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancelRequest}
                component={motion.button}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                sx={softOutlineButtonSx}
              >
                Withdraw Request
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                component={motion.button}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sendBookRequest(book);
                  onClose();
                }}
                sx={softPrimaryButtonSx}
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
