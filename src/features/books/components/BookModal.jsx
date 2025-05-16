// src/components/books/BookModal.jsx

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  Divider,
  Box,
  Chip,
  Stack,
  Paper,
  Tooltip,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import {
  deleteBook,
  archiveBook,
  requestBorrowBook,
  getRequestsForBook,
  updateRequestStatus,
} from '@features/books/services/bookService';

import { useAuth } from '@/contexts/AuthContext';

const statusColor = {
  available: 'success',
  scheduled: 'warning',
  lent: 'default',
};

export default function BookModal({
  open,
  onClose,
  book,
  context = 'dashboard',
  onActionComplete,
}) {
  const catalog = book.books_catalog || book.catalog || {};
  const { title, author, description, cover_image_url } = catalog;
  const { condition, status, id: bookId, owner_id, archived } = book;
  const { user } = useAuth();

  const isOwnedByUser = user?.id === owner_id;
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const data = await getRequestsForBook(bookId);
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  };

  useEffect(() => {
    if (open && isOwnedByUser && context === 'dashboard') {
      fetchRequests();
    }
  }, [open, isOwnedByUser, context]);

  const handleRequestBook = async () => {
    try {
      await requestBorrowBook(bookId, user?.id || null, false);
      alert('Borrow request submitted successfully.');
      onClose();
    } catch (error) {
      console.error('Request failed:', error);
      alert('Something went wrong while submitting your request.');
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await updateRequestStatus(requestId, newStatus);
      fetchRequests();
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  };

  const handleDelete = async () => {
    await deleteBook(bookId);
    if (onActionComplete) onActionComplete();
    onClose();
  };

  const handleArchive = async () => {
    await archiveBook(bookId, !archived);
    if (onActionComplete) onActionComplete();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={onClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
          >
            <DialogTitle
              sx={{
                fontWeight: 600,
                fontSize: '1.5rem',
                position: 'relative',
                px: 3,
                pt: 2,
                pb: 1,
              }}
            >
              {title}
              <IconButton onClick={onClose} sx={{ position: 'absolute', right: 12, top: 12 }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ px: 3, pb: 3 }}>
              {cover_image_url && (
                <Paper elevation={1} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
                  <img
                    src={cover_image_url}
                    alt={title}
                    style={{ width: '100%', height: 'auto', maxHeight: 280, objectFit: 'cover' }}
                  />
                </Paper>
              )}

              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                <strong>Author:</strong> {author}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {description || 'No description available.'}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" spacing={1} mb={2}>
                <Chip label={`Condition: ${condition}`} color="default" />
                <Chip label={`Status: ${status}`} color={statusColor[status] || 'default'} />
              </Stack>

              {context === 'browse' && !isOwnedByUser && (
                <Box mb={3}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Interested in borrowing?
                  </Typography>
                  <Button variant="contained" fullWidth onClick={handleRequestBook}>
                    Request This Book
                  </Button>
                </Box>
              )}

              {isOwnedByUser && (
                <Stack direction="row" spacing={2} mb={2}>
                  <Tooltip title={archived ? 'Unarchive' : 'Archive'}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      onClick={handleArchive}
                      startIcon={archived ? <UnarchiveIcon /> : <ArchiveIcon />}
                    >
                      {archived ? 'Unarchive' : 'Archive'}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={handleDelete}
                      startIcon={<DeleteIcon />}
                    >
                      Delete
                    </Button>
                  </Tooltip>
                </Stack>
              )}

              {context === 'dashboard' && isOwnedByUser && (
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Borrow Requests
                  </Typography>
                  {requests.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No requests yet.
                    </Typography>
                  ) : (
                    <Stack spacing={2} mt={1}>
                      {requests.map((req) => (
                        <Box key={req.id} p={2} border="1px solid #eee" borderRadius={2}>
                          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                              {req.is_anonymous ? '?' : req.profiles?.first_name?.[0] || 'U'}
                            </Avatar>
                            <Typography variant="body2">
                              {req.is_anonymous
                                ? 'Anonymous User'
                                : `${`${req.profiles?.first_name || ''} ${req.profiles?.last_name || ''}`.trim() || 'User'} (${req.profiles?.email || 'no email'})`}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            Requested on {new Date(req.requested_at).toLocaleString()}
                          </Typography>
                          <Stack direction="row" spacing={1} mt={1}>
                            <Chip
                              label={req.status}
                              color={
                                req.status === 'pending'
                                  ? 'warning'
                                  : req.status === 'approved'
                                    ? 'success'
                                    : req.status === 'rejected'
                                      ? 'error'
                                      : 'default'
                              }
                            />
                            {req.status === 'pending' && (
                              <>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleStatusUpdate(req.id, 'approved')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => handleStatusUpdate(req.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={onClose} variant="text" color="primary">
                Close
              </Button>
            </DialogActions>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

BookModal.propTypes = {
  onActionComplete: PropTypes.func,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  book: PropTypes.object.isRequired,
  context: PropTypes.string,
};
