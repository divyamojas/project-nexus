// ./src/components/AddBookModal.jsx

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
  Fade,
  Popper,
  Paper,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';

import { BOOK_FORM_FIELDS } from '../../../constants/constants';
import { searchBooksCatalogByTitle } from '../../../services';
import { validateAndSubmitBookForm } from '../../../utilities';

import { useBookForm } from '../../../contexts/BookContext';
import { useUser } from '../../../contexts/UserContext';
import { useBookCoverUpload } from '../../../hooks';

export default function AddBookModal({ open, onClose, setShowAddModal }) {
  const { user } = useUser();
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    imageStatus,
    setImageStatus,
    searchResults,
    setSearchResults,
    formLoading,
    setFormLoading,
    resetForm,
  } = useBookForm();

  useEffect(() => {
    if (formData.title.length > 2) {
      setFormLoading(true);
      searchBooksCatalogByTitle(formData.title).then((results) => {
        setSearchResults(results);
        setFormLoading(false);
      });
    }
  }, [formData.title]);

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
    setCoverFile,
    setCoverPreviewUrl,
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
      const { url, error } = await validateAndSubmitBookForm.uploadBookCover({
        user,
        file: coverFile,
      });
      if (error) {
        setCoverError(error);
        return;
      }
      coverUrl = url;
    }
    // Now validate and submit form
    validateAndSubmitBookForm(
      { ...formData, coverUrl },
      {
        setErrors,
        resetForm,
        onSuccess: onClose,
        user,
      },
    ).then(() => {
      setShowAddModal(false);
      resetCover();
    });
  };

  useEffect(() => {
    if (!open) {
      resetForm();
      resetCover();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        component: motion.div,
        initial: { opacity: 0, scale: 0.96, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { duration: 0.35, ease: 'easeInOut' },
        sx: {
          borderRadius: 4,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          transform: 'perspective(1200px) translateZ(10px)',
          background: 'linear-gradient(180deg, #ffffff, #f7f8fc)',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: '1.4rem',
          position: 'relative',
          backgroundColor: '#388e3c',
          color: '#fff',
        }}
      >
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

      <DialogContent dividers sx={{ pt: 2, backgroundColor: '#fcfcfd' }}>
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
                    boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
                    maxHeight: 240,
                    overflowY: 'auto',
                    px: 1,
                    py: 0.5,
                    backgroundColor: '#ffffff',
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
                    backgroundColor: '#f9f9f9',
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
                    backgroundColor: '#f9f9f9',
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
              border: '2px dashed #bbb',
              borderRadius: 2,
              textAlign: 'center',
              bgcolor: '#f9f9f9',
              cursor: 'pointer',
            }}
          >
            <input {...getInputProps()} />
            {coverPreviewUrl ? (
              <Box>
                <Avatar
                  variant="rounded"
                  src={coverPreviewUrl}
                  sx={{ width: 80, height: 120, mx: 'auto', mb: 1, borderRadius: 2, boxShadow: 1 }}
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
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Add Book
        </Button>
      </DialogActions>
    </Dialog>
  );
}
