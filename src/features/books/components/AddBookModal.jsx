// src/features/books/components/AddBookModal.jsx

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Autocomplete,
  MenuItem,
  Divider,
  Typography,
  Avatar,
  Stack,
  Popper,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';

import { BOOK_FORM_FIELDS } from '@/constants/constants';
import { searchBooksCatalogByTitle, uploadBookCover } from '@/services';
import { validateAndSubmitBookForm } from '@/utilities';

import { useBookForm } from '@/contexts/hooks/useBookForm';
import { useUser } from '@/contexts/hooks/useUser';
import { useBookCoverUpload, useDebounce } from '@/hooks';

export default function AddBookModal({ open, onClose, setShowAddModal, onAdded }) {
  const { user } = useUser();
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    searchResults,
    setSearchResults,
    formLoading,
    setFormLoading,
    resetForm,
  } = useBookForm();
  const debouncedTitle = useDebounce(formData.title, 300);

  useEffect(() => {
    if (debouncedTitle && debouncedTitle.length > 2) {
      setFormLoading(true);
      searchBooksCatalogByTitle(debouncedTitle).then((results) => {
        setSearchResults(results);
        setFormLoading(false);
      });
    } else if (!debouncedTitle) {
      setSearchResults([]);
      setFormLoading(false);
    }
  }, [debouncedTitle, setFormLoading, setSearchResults]);

  const handleSelectMatch = (option) => {
    setFormData((prev) => ({
      ...prev,
      title: option.title,
      author: option.author,
      isbn: option.isbn || '',
      // coverUrl: option.cover_url || '', // Remove this, handled by upload
    }));
  };

  // --- New Hook for Book Cover Upload ---
  const {
    coverFile,
    coverPreviewUrl,
    coverError,

    setCoverError,
    getRootProps,
    getInputProps,
    resetCover,
  } = useBookCoverUpload();

  // --- On Submit: upload cover (if any), then save ---
  const handleSubmit = async () => {
    setErrors({});
    let coverUrl = formData.coverUrl;
    if (coverFile) {
      const { url, error } = await uploadBookCover({ user, file: coverFile });
      if (error) {
        setCoverError(error);
        return;
      }
      coverUrl = url;
    }
    // Now validate and submit form
    const result = await validateAndSubmitBookForm(
      { ...formData, coverUrl },
      {
        setErrors,
        resetForm,
        onSuccess: onClose,
        user,
      },
    );
    await onAdded?.(result?.id);
    try {
      if (result?.id) {
        window.dispatchEvent(new CustomEvent('books:added', { detail: { id: result.id } }));
      }
    } catch {}
    setShowAddModal(false);
    resetCover();
  };

  useEffect(() => {
    if (!open) {
      resetForm();
      resetCover();
    }
  }, [open, resetForm, resetCover]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slots={{ paper: motion.div }}
      slotProps={{
        paper: {
          initial: { opacity: 0, scale: 0.96, y: 20 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.95, y: 20 },
          transition: { duration: 0.35, ease: 'easeInOut' },
          sx: (theme) => ({
            borderRadius: 4,
            boxShadow: 6,
            transform: 'perspective(1200px) translateZ(10px)',
            background: `linear-gradient(180deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          }),
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.4rem', position: 'relative' }}>
        Add a Book
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12, color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent dividers sx={{ pt: 2, bgcolor: 'background.paper' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Stack spacing={2.5}>
            <Autocomplete
              freeSolo
              options={searchResults}
              getOptionLabel={(option) => option.title || ''}
              onInputChange={(e, value) => setFormData((prev) => ({ ...prev, title: value }))}
              onChange={(e, value) => value && handleSelectMatch(value)}
              loading={formLoading}
              PopperComponent={(props) => (
                <Popper
                  {...props}
                  placement="bottom-start"
                  modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
                  style={{ zIndex: 1300 }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      borderRadius: 2,
                      boxShadow: 3,
                      maxHeight: 240,
                      overflowY: 'auto',
                      px: 1,
                      py: 0.5,
                      bgcolor: 'background.paper',
                    }}
                  >
                    {props.children}
                  </Paper>
                </Popper>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="e.g. The Alchemist"
                  label="Title*"
                  error={!!errors.title}
                  helperText={errors.title}
                  size="small"
                  fullWidth
                  variant="standard"
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                    sx: {
                      bgcolor: 'action.hover',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                      boxShadow: 1,
                    },
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />

            {BOOK_FORM_FIELDS.filter((f) => f.stateKey !== 'coverUrl').map((field) => (
              <React.Fragment key={field.stateKey}>
                <TextField
                  placeholder={field.placeholder}
                  label={field.label}
                  size="small"
                  fullWidth
                  variant="standard"
                  multiline={field.multiline || false}
                  rows={field.rows || 1}
                  select={field.select || false}
                  error={!!errors[field.stateKey]}
                  helperText={errors[field.stateKey]}
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      bgcolor: 'action.hover',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                      boxShadow: 1,
                    },
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formData[field.stateKey]}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({ ...prev, [field.stateKey]: value }));
                  }}
                >
                  {field.select &&
                    field.options?.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                </TextField>
              </React.Fragment>
            ))}

            {/* --- Cover Image Upload --- */}
            <Box
              {...getRootProps()}
              sx={{
                mt: 1,
                p: 2,
                border: (theme) => `2px dashed ${theme.palette.divider}`,
                borderRadius: 2,
                textAlign: 'center',
                bgcolor: 'action.hover',
                cursor: 'pointer',
              }}
            >
              <input {...getInputProps()} />
              {coverPreviewUrl ? (
                <Box>
                  <Avatar
                    variant="rounded"
                    src={coverPreviewUrl}
                    sx={{
                      width: 80,
                      height: 120,
                      mx: 'auto',
                      mb: 1,
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Cover preview
                  </Typography>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Drag & drop or click to upload cover image (JPG/PNG/WebP, max 500 KB)
                </Typography>
              )}
              {coverError && (
                <Typography variant="caption" color="error">
                  {coverError}
                </Typography>
              )}
            </Box>
            {/* Hidden submit button ensures Enter key submits even if action button is outside form */}
            <button type="submit" style={{ display: 'none' }} />
          </Stack>
        </form>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button variant="contained" color="primary" type="submit" onClick={handleSubmit}>
          Add Book
        </Button>
      </DialogActions>
    </Dialog>
  );
}
