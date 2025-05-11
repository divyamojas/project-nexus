// src/components/books/BookModal.jsx

import React from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { deleteBook, archiveBook } from '@/services/bookService';

const fadeUpVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

const pressVariants = {
  whileTap: { scale: 0.95 },
};

export default function BookModal({ open, onClose, book }) {
  const catalog = book.books_catalog || book.catalog || {};
  const { title, author, description, cover_image_url } = catalog;
  const { condition, status, id: bookId } = book;

  const handleDelete = async () => {
    await deleteBook(bookId);
    onClose();
  };

  const handleArchive = async () => {
    await archiveBook(bookId, true);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.3rem', pb: 0 }}>
              {title}
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ pt: 1, pb: 2, px: 3 }}>
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={0}
                variants={fadeUpVariants}
              >
                {cover_image_url && (
                  <Paper elevation={1} sx={{ mb: 2, overflow: 'hidden', borderRadius: 2 }}>
                    <img
                      src={cover_image_url}
                      alt={title}
                      style={{ width: '100%', maxHeight: 280, objectFit: 'cover' }}
                    />
                  </Paper>
                )}
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={1}
                variants={fadeUpVariants}
              >
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  <strong>Author:</strong> {author}
                </Typography>
              </motion.div>
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={2}
                variants={fadeUpVariants}
              >
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}
                >
                  {description || 'No description available.'}
                </Typography>
              </motion.div>

              <Divider sx={{ my: 3 }} />

              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={3}
                variants={fadeUpVariants}
              >
                <Stack direction="row" spacing={1}>
                  <Chip label={`Condition: ${condition}`} color="default" />
                  <Chip
                    label={`Status: ${status}`}
                    color={
                      status === 'available'
                        ? 'success'
                        : status === 'scheduled'
                          ? 'warning'
                          : 'default'
                    }
                  />
                </Stack>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={4}
                variants={fadeUpVariants}
              >
                <Box mt={4}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    (incoming requests will appear here)
                  </Typography>
                </Box>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={5}
                variants={fadeUpVariants}
              >
                <Box mt={3}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Feedback
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    (book feedbacks will appear here)
                  </Typography>
                </Box>
              </motion.div>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
              <motion.div variants={pressVariants} whileTap="whileTap">
                <Button color="error" variant="outlined" onClick={handleDelete}>
                  Delete
                </Button>
              </motion.div>
              <motion.div variants={pressVariants} whileTap="whileTap">
                <Button color="warning" variant="contained" onClick={handleArchive}>
                  Archive
                </Button>
              </motion.div>
            </DialogActions>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

BookModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  book: PropTypes.shape({
    books_catalog: PropTypes.object,
    catalog: PropTypes.object,
    condition: PropTypes.string,
    status: PropTypes.string,
    id: PropTypes.string,
  }),
};
