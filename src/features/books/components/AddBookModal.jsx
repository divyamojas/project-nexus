// src/features/books/components/AddBookModal.jsx

import React, { useEffect, useState } from 'react';
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
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { motion } from 'framer-motion';
import { alpha } from '@mui/material/styles';

import { BOOK_FORM_FIELDS } from '@/constants/constants';
import { searchBooksCatalogByTitle, uploadBookCover } from '@/services';
import { validateAndSubmitBookForm } from '@/utilities';

import { useBookForm } from '@/contexts/hooks/useBookForm';
import { useUser } from '@/contexts/hooks/useUser';
import { useBookCoverUpload, useDebounce } from '@/hooks';
import {
  modalPaperMotion,
  getModalPaperSx,
  getModalTitleSx,
  getModalContentSx,
  getModalActionsSx,
} from '@/theme/modalStyles';

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

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = (debouncedTitle || '').trim();
    if (q.length >= 1) {
      setFormLoading(true);
      searchBooksCatalogByTitle(q).then((results) => {
        setSearchResults(results);
        setFormLoading(false);
      });
    } else if (!q) {
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
    setSubmitting(true);
    let coverUrl = formData.coverUrl;
    if (coverFile) {
      const { url, error } = await uploadBookCover({ user, file: coverFile });
      if (error) {
        setCoverError(error);
        setSubmitting(false);
        return;
      }
      coverUrl = url;
    }
    // Now validate and submit form
    // Sanitize title: prevent submitting '+ Add "Title"'
    const cleanTitle = (() => {
      const raw = (formData.title || '').trim();
      const m = raw.match(/^\+?\s*add\s+["“]?(.+?)["”]?$/i);
      return m ? m[1] : raw;
    })();

    const result = await validateAndSubmitBookForm(
      { ...formData, title: cleanTitle, coverUrl },
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
    setSubmitting(false);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
      resetCover();
      setSubmitting(false);
    }
  }, [open, resetForm, resetCover]);

  const [acOpen, setAcOpen] = useState(false);

  const titleTrim = (formData.title || '').trim();
  const augmentedOptions =
    titleTrim && !formLoading && (searchResults?.length || 0) === 0
      ? [{ title: `+ Add "${titleTrim}"`, __add: true }]
      : searchResults;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slots={{ paper: motion.div }}
      slotProps={{
        paper: {
          ...modalPaperMotion,
          sx: (t) => getModalPaperSx(t),
        },
      }}
    >
      <DialogTitle sx={(t) => getModalTitleSx(t)}>
        Add a Book
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={submitting}
          sx={{ position: 'absolute', right: 12, top: 12, color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.25 }}>
          Share a book with the community
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent dividers sx={(t) => ({ ...getModalContentSx(t), p: 0 })}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems="stretch">
          <Box sx={{ flex: 1, p: 2 }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!submitting) handleSubmit();
              }}
            >
              <Stack spacing={2.5}>
                <Autocomplete
                  freeSolo
                  options={augmentedOptions}
                  getOptionLabel={(option) =>
                    typeof option === 'string' ? option : option.title || ''
                  }
                  inputValue={formData.title}
                  onInputChange={(e, value) => setFormData((prev) => ({ ...prev, title: value }))}
                  onChange={(e, value) => {
                    if (!value) return;
                    if (value.__add) {
                      // Keep user's typed title; allow them to submit the form
                      setFormData((prev) => ({ ...prev, title: titleTrim }));
                      setAcOpen(false);
                    } else {
                      handleSelectMatch(value);
                    }
                  }}
                  loading={formLoading}
                  open={
                    acOpen &&
                    Boolean((formData.title || '').trim()) &&
                    (formLoading || searchResults.length >= 0)
                  }
                  onOpen={() => setAcOpen(true)}
                  onClose={() => setAcOpen(false)}
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    if (option.__add) {
                      return (
                        <Box
                          component="li"
                          key={key}
                          {...optionProps}
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <AddIcon fontSize="small" color="primary" />
                          <Typography variant="body2">{option.title}</Typography>
                        </Box>
                      );
                    }
                    return (
                      <Box component="li" key={key} {...optionProps}>
                        <Typography variant="body2">{option.title}</Typography>
                      </Box>
                    );
                  }}
                  loadingText={
                    <Box display="flex" alignItems="center" gap={1} px={2} py={1}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">Searching...</Typography>
                    </Box>
                  }
                  noOptionsText={
                    <Box sx={{ px: 2, py: 1.25 }}>
                      <Typography variant="body2" color="text.secondary">
                        No books found for “{titleTrim}”.
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        Choose “+ Add” above or press Enter to add this title.
                      </Typography>
                    </Box>
                  }
                  PopperComponent={(props) => (
                    <Popper
                      {...props}
                      placement="bottom-start"
                      modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
                      // Merge incoming style to preserve positioning transform
                      style={{ ...(props.style || {}), zIndex: 1300 }}
                    >
                      <Paper
                        elevation={4}
                        sx={{
                          borderRadius: 2,
                          boxShadow: 6,
                          maxHeight: 280,
                          overflowY: 'auto',
                          px: 1,
                          py: 0.5,
                          bgcolor: 'background.paper',
                          border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
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
                    transition: (t) =>
                      t.transitions.create(['background-color', 'box-shadow'], {
                        duration: t.transitions.duration.shorter,
                      }),
                    '&:hover': {
                      bgcolor: (t) => alpha(t.palette.action.hover, 0.8),
                      boxShadow: 1,
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  {coverPreviewUrl ? (
                    <Box>
                      <Avatar
                        variant="rounded"
                        src={coverPreviewUrl}
                        sx={{
                          width: 88,
                          height: 132,
                          mx: 'auto',
                          mb: 1,
                          borderRadius: 2,
                          boxShadow: 2,
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
          </Box>

          {/* Right: Live Preview */}
          <Box
            sx={{
              width: { xs: '100%', md: 280 },
              p: 2,
              borderLeft: { md: (t) => `1px solid ${t.palette.divider}` },
            }}
          >
            <Typography variant="overline" color="text.secondary">
              Preview
            </Typography>
            <Box
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 2,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                variant="rounded"
                src={coverPreviewUrl || ''}
                sx={{ width: 64, height: 96, borderRadius: 1 }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {(formData.title || '').trim() || 'Title'}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {(formData.author || '').trim() || 'Author'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={(t) => getModalActionsSx(t)}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            disabled={submitting}
            component={motion.button}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            sx={{
              backgroundColor: (t) => alpha(t.palette.background.paper, 0.25),
              borderColor: (t) => alpha(t.palette.divider, 0.5),
              '&:hover': { backgroundColor: (t) => alpha(t.palette.background.paper, 0.35) },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={() => !submitting && handleSubmit()}
            disabled={submitting}
            endIcon={submitting ? <CircularProgress color="inherit" size={16} /> : null}
            component={motion.button}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {submitting ? 'Adding…' : 'Add Book'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
